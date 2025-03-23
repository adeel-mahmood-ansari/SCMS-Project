import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Staff from "../models/Staff";
import Admin from "../models/Admin";
import Department from "../models/Department";
import { sendVerificationEmail } from "../config/mail";

const getModel = (userType: string) => {
    if (userType === "User") return User;
    if (userType === "Staff") return Staff;
    if (userType === "Admin") return Admin;
    return null;
};

// ✅ Register
export const register = async (req: Request, res: Response) => {
    try {
        const { email, username, password, name, phone, userType, department } = req.body;
        const Model = getModel(userType);
        if (!Model) return res.status(400).json({ message: "Invalid user type" });

        const existingUser = await Model.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Model({ email, username, password: hashedPassword, name, phone });

        if (userType === "Admin") {
            if (!department || !department.name) {
                return res.status(400).json({ message: "Department details are required for admin registration" });
            }

            await newUser.save();

            const newDepartment = new Department({
                name: department.name,
                description: department.description || "",
                admin_id: newUser._id,
                verification_status: "Pending",
            });

            await newDepartment.save();
        } else {
            await newUser.save();
        }

        const token = jwt.sign({ email, userType }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
        await sendVerificationEmail(email, userType, token);

        res.status(201).json({ message: "User registered. Verification email sent." });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

// ✅ Verify Email
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string, userType: string };
        
        const Model = getModel(decoded.userType);
        if (!Model) return res.status(400).json({ message: "Invalid user type" });

        const user = await Model.findOne({ email: decoded.email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.is_verified) return res.status(400).json({ message: "User already verified" });

        user.is_verified = true;
        user.verification_status = "Verified";
        await user.save();

        // ✅ If Admin, update Department status to Verified
        if (decoded.userType === "Admin") {
            await Department.findOneAndUpdate({ admin_id: user._id }, { verification_status: "Verified" });
        }

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token", error });
    }
};

// ✅ Login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, userType } = req.body;
        const Model = getModel(userType);
        if (!Model) return res.status(400).json({ message: "Invalid user type" });

        const user = await Model.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        if (!user.is_verified) return res.status(403).json({ message: "User not verified. Please verify your email." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, email: user.email, userType }, process.env.JWT_SECRET as string, {
            expiresIn: "1d",
        });

        res.status(200).json({ message: "Login successful", token, userType });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};