import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        identifier: { type: Number },
        login: { type: String },
        name: { type: String },
        github: {
            access_token: { type: String },
            refresh_token: { type: String },
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
        avatar: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model("User", schema);
//https://api.github.com/user
