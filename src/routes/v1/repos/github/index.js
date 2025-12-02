import { octokit } from "#services/github";

const blacklistedLanguages = ["react", "svelte"];

export default async function (fastify) {
    fastify.get("/", async (request, reply) => {
        const { data: repos, status } = await octokit.request(
            "GET /user/repos"
        );

        const filteredRepos = repos.filter((repo) => {
            const ownerId = repo?.owner?.id?.toString();
            return (
                ownerId === process.env.GITHUB_OWNER_ID &&
                !blacklistedLanguages.includes(repo?.language)
            );
        });

        return filteredRepos;
    });
}
