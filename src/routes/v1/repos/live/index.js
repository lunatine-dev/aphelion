import { octokit } from "#services/github";
import { Repo } from "#models/github/Repo";
import { RepoCloneLog } from "#models/github/RepoCloneLog";
import { RepoDockerLog } from "#models/github/RepoDockerLog";

const fetchRepo = async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return res.badRequest("Invalid ID");
    }

    const repo = await Repo.findOne({ id });
    if (!repo) {
        return res.notFound("Repo not found");
    }

    req.repo = repo;
};

export default async (fastify) => {
    fastify.get("/", async (req, res) => {
        return Repo.find({
            setup: true,
        });
    });

    fastify.get("/:id", { preHandler: fetchRepo }, async (req, res) => {
        return req.repo;
    });
    fastify.post("/:id/env", { preHandler: fetchRepo }, async (req, res) => {
        try {
            const { env } = req.body;
            if (typeof env !== "string")
                return res.badRequest("env must be a string");

            req.repo.env = env;

            await req.repo.save();

            return { message: "Env variables successfully saved" };
        } catch (err) {
            return res.internalServerError("Failed to save env");
        }
    });
    fastify.post(
        "/:id/webhooks",
        { preHandler: fetchRepo },
        async (req, res) => {
            const {
                name,
                owner: { login },
            } = req.repo;

            if (req.repo.webhook) return res.conflict("Webhook already exists");

            const createHook = await octokit.request(
                "POST /repos/{owner}/{repo}/hooks",
                {
                    owner: login,
                    repo: name,
                    config: {
                        url: process.env.GITHUB_HOOK_URL,
                        content_type: "json",
                        secret: process.env.GITHUB_HOOK_SECRET,
                        insecure_ssl: 0,
                    },
                },
            );

            if (createHook.status !== 201)
                return res.internalServerError("Failed to create webhook");

            req.repo.webhook = createHook.data.id;

            await req.repo.save();

            return {
                message: "Created webhook successfully",
            };
        },
    );

    fastify.get("/:id/logs", { preHandler: fetchRepo }, async (req, res) => {
        const [docker, clone] = await Promise.all([
            RepoDockerLog.find({ repoId: req.repo.id }),
            RepoCloneLog.find({ repoId: req.repo.id }),
        ]);

        return { docker, clone };
    });
};
