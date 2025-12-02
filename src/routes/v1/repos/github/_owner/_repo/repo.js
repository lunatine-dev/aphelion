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

        let data;
        // We'll get the extra information from an API call, this will confirm whether or not the repository even exists
        try {
            const resp = await octokit.request("GET /repos/{owner}/{repo}", {
                owner,
                repo,
            });

            data = resp.data;
        } catch (err) {
            return res.notFound();
        }

        if (!data.name)
            return res.notFound("Could not find a repo with that information");

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
            language: data?.language,
            archived: data?.archived,
            is_template: data?.is_template,
            fork: data?.fork,
            license: !!data?.license,
            license_type: data?.license ? data?.license?.spdx_id : "",
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
