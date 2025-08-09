import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: "app",
    },
});

export default mongoose.model("Settings", settingsSchema);
