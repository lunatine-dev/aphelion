import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        id: Number,
        name: String,
        owner: {
            id: Number,
            name: String,
            login: String,
        },
    },
    {
        timestamps: true,
    }
);

export const Repo = mongoose.model("Repo", schema);
