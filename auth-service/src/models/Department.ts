import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    verification_status: { type: String, enum: ["Pending", "Verified", "Rejected"], default: "Pending" },
});

export default mongoose.model("Department", DepartmentSchema);