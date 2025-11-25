import mongoose from "mongoose";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENV_KEY;
const IV_LENGTH = 12;

const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        Buffer.from(ENCRYPTION_KEY, "hex"),
        iv
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag().toString("hex");
    return iv.toString("hex") + ":" + encrypted + ":" + tag;
};
const decrypt = (data) => {
    const [ivHex, encrypted, tagHex] = data.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        Buffer.from(ENCRYPTION_KEY, "hex"),
        iv
    );
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};

const schema = new mongoose.Schema(
    {
        // GitHub information
        id: Number,
        name: String,
        private: Boolean,
        owner: {
            id: Number,
            login: String,
            avatar_url: String,
        },

        // App specific
        env: {
            type: String,
            set: encrypt,
            get: decrypt,
        },
        setup: Boolean,
        webhook: String,
        directory_exists: Boolean,
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true },
    }
);

export const Repo = mongoose.model("Repo", schema);
