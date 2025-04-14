import mongoose from "mongoose";

export const USER_TYPES = {
    ADMIN: "Admin",
    STAFF: "Staff",
    USER: "User"
};

const auth_user = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    user_type: {type: String, required: true, enum: Object.values(USER_TYPES)},
    is_verified: { type: Boolean, default: false },
    verification_status: { type: String, enum: ["Pending", "Verified", "Rejected"], default: "Pending" }
});

export default mongoose.model("auth_user",auth_user);