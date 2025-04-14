import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

export default mongoose.model("Staff", StaffSchema);