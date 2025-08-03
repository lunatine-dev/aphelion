import { access, stat } from "fs/promises";
import { constants } from "fs";

export const fileExists = async (path) => {
    try {
        await access(path, constants.F_OK);
        return true;
    } catch {
        return false;
    }
};
export const folderExists = async (path) => {
    try {
        const stats = await stat(path);
        return stats.isDirectory();
    } catch {
        return false;
    }
};
