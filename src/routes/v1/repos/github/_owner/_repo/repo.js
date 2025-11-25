import { Repo } from "#models/github/Repo";
import { octokit } from "#services/github";

export default async (fastify) => {
    fastify.get("/", async (req, res) => {
        const { owner, repo } = req.params;

        const { data } = await octokit.request("GET /repos/{owner}/{repo}", {
            owner,
            repo,
        });

        return data;
    });

    fastify.post("/manage", async (req, res) => {
        const { owner, repo } = req.params;
        const {
            id,
            is_private,
            owner: { id: owner_id, login, avatar_url },
            name,
        } = req.body;

        const newRepo = new Repo({
            id,
            name: repo,
            private: is_private,
            owner: {
                login,
                id: owner_id,
                avatar_url,
            },
            env: "",
            setup: true,
        });

        try {
            const { data: hooks } = await octokit.request(
                "GET /repos/{owner}/{repo}/hooks",
                { owner, repo }
            );

            const hook = hooks.find(
                (hook) => hook.config?.url === process.env.GITHUB_HOOK_URL
            );

            newRepo.webhook = hook ? hook.id : null;
        } catch (e) {}

        await newRepo.save();

        return {
            message: `Successfully started managing the repo ${owner}/${repo}`,
            repo: newRepo,
        };
    });
};
