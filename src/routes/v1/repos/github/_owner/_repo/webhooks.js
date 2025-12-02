import { octokit } from "#services/github";

export default async function (fastify) {
    fastify.get("/webhooks", async (request, reply) => {
        const { owner, repo } = request.params;

        const { data } = await octokit.request(
            "GET /repos/{owner}/{repo}/hooks",
            {
                owner,
                repo,
            }
        );

        return data;
    });
}
