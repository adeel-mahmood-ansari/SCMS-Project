import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Staff from "../models/Staff";
import Admin from "../models/Admin";
import Department from "../models/Department";
import { sendVerificationEmail } from "../config/mail";
import {Model} from "mongoose";
import { USER_TYPES } from "../models/auth_user";
import auth_user from "../models/auth_user"


//  Register
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, username, password, name, phone, userType, department } = req.body;

        // Validate user type
        if (!Object.values(USER_TYPES).includes(userType)) {
            res.status(400).json({ message: "Invalid user type" });
            return;
        }

        // Check if the user already exists in `auth_user`
        const existingAuthUser = await auth_user.findOne({ email });
        if (existingAuthUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in `auth_user`
        const newAuthUser = new auth_user({
            email,
            username,
            password: hashedPassword,
            user_type: userType,
            is_verified: false,
            verification_status: "Pending",
        });

        await newAuthUser.save();

        // Create user details in respective models
        let userDetails;
        if (userType === USER_TYPES.ADMIN) {
            if (!department || !department.name) {
                res.status(400).json({ message: "Department details are required for admin registration" });
                return;
            }

            userDetails = new Admin({ name, phone });
            await userDetails.save();

            const newDepartment = new Department({
                name: department.name,
                description: department.description || "",
                admin_id: userDetails._id,
                verification_status: "Pending",
            });

            await newDepartment.save();
        } 
        else if (userType === USER_TYPES.STAFF) {
            if (!department || !department.id) {
                res.status(400).json({ message: "Staff must be linked to a department" });
                return;
            }

            userDetails = new Staff({
                name,
                phone,
                department_id: department.id,
                verified_by: null, // Will be set after verification
            });

            await userDetails.save();
        } 
        else {
            userDetails = new User({ name, phone });
            await userDetails.save();
        }

        if (userType !== USER_TYPES.STAFF) {
            const token = jwt.sign({ email, userType }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
            await sendVerificationEmail(email);
        }

        res.status(201).json({ message: "User registered. Verification process initiated." });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

// Login

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user in auth_user collection
        const authUserRecord = await auth_user.findOne({ email });
        if (!authUserRecord) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        // If the user is Staff and not verified, return an error
        if (authUserRecord.user_type === USER_TYPES.STAFF && !authUserRecord.is_verified) {
            res.status(403).json({ message: "Staff account pending Admin approval." });
            return;
        }

        // If the user is not verified (User/Admin), resend verification email
        if (authUserRecord.user_type !== USER_TYPES.STAFF && !authUserRecord.is_verified) {
            await sendVerificationEmail(email);
            res.status(403).json({ message: "Account not verified. A new verification email has been sent." });
            return;
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, authUserRecord.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: authUserRecord._id, email: authUserRecord.email, userType: authUserRecord.user_type },
            process.env.JWT_SECRET as string,
            { expiresIn: "1d" }
        );

        // Customize login message based on user type
        const userTypeMessage = {
            [USER_TYPES.ADMIN]: "Welcome, Admin!",
            [USER_TYPES.STAFF]: "Welcome, Staff Member!",
            [USER_TYPES.USER]: "Welcome, User!"
        };

        res.status(200).json({
            message: userTypeMessage[authUserRecord.user_type],
            token,
            userType: authUserRecord.user_type
        });

    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};


//  Verify Email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body; // Get email from request body

        // Find user in auth_user collection
        const authUserRecord = await auth_user.findOne({ email });
        if (!authUserRecord) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (authUserRecord.is_verified) {
            res.status(400).json({ message: "User already verified" });
            return;
        }

        // Mark user as verified
        authUserRecord.is_verified = true;
        authUserRecord.verification_status = "Verified";
        await authUserRecord.save();

        // If Admin, update the corresponding Department's verification status
        if (authUserRecord.user_type === USER_TYPES.ADMIN) {
            await Department.findOneAndUpdate(
                { admin_id: authUserRecord._id }, 
                { verification_status: "Verified" }
            );
        }

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error verifying email", error });
    }
};
