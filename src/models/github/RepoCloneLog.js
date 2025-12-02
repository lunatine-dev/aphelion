import mongoose from "mongoose";

const schema = new mongoose.Schema({
    repoId: { type: Number, required: true, index: true },
    status: { type: String, required: true },
    logs: [
        {
            tag: { type: String, required: true },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

export const RepoCloneLog = mongoose.model("RepoCloneLog", schema);
