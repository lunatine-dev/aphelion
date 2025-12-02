import { octokit } from "#services/github";

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

            const dockerFileExists = await fileExists(
                owner,
                repo,
                "Dockerfile",
            );
            const composeFileExists =
                (await fileExists(owner, repo, "docker-compose.yml")) ||
                (await fileExists(owner, repo, "docker-compose.yaml"));

            return {
                is_docker_app: dockerFileExists && composeFileExists,
            };
        } catch (e) {
            console.error(e);
            return {
                is_docker_app: false,
            };
        }
    });
}
