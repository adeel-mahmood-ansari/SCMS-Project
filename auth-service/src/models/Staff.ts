import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    is_verified: { type: Boolean, default: false },
    verification_status: { type: String, enum: ["Pending", "Verified", "Rejected"], default: "Pending" },
    verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

export default mongoose.model("Staff", StaffSchema);