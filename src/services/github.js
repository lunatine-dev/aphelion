import axios from "axios";
import { Octokit } from "octokit";

export const octokit = new Octokit({
    auth: process.env.GITHUB_PAT_TOKEN,
});

export const getUser = async (accessToken) => {
    return new Promise(async (resolve, reject) => {
        if (!accessToken) return reject("No access token provided");
        let user;

        try {
            const { data } = await axios.get("https://api.github.com/user", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!data) return reject("Error fetching user");

            user = data;
        } catch (err) {
            return reject("Unknown error fetching user");
        }

        resolve(user);
    });
};
