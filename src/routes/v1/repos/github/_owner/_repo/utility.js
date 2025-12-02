import { octokit } from "#services/github";

const cache = new Map();
const fileExists = async (owner, repo, path) => {
    if (!owner || !repo || !path) throw Error("Missing parameter");

    try {
        const fileResponse = await octokit.request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            { owner, repo, path },
        );

        return fileResponse?.data?.type === "file";
    } catch (err) {
        return false;
    }
};

export default async function (fastify) {
    fastify.get("/is_docker_app", async (req, res) => {
        try {
            const { owner, repo } = req.params;
            const key = `${owner}/${repo}`;

            const cached = cache.get(key);
            if (cached && cached.expires > Date.now()) {
                return cached.data;
            }

            const dockerFileExists = await fileExists(
                owner,
                repo,
                "Dockerfile",
            );
            const composeFileExists =
                (await fileExists(owner, repo, "docker-compose.yml")) ||
                (await fileExists(owner, repo, "docker-compose.yaml"));

            const response = {
                is_docker_app: dockerFileExists && composeFileExists,
            };

            cache.set(key, {
                data: response,
                expires: Date.now() + 15 * 60 * 1000,
            });

            return response;
        } catch (e) {
            console.error(e);
            return {
                is_docker_app: false,
            };
        }
    });
}
