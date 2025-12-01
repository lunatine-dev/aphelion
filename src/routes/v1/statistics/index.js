import { Repo } from "#models/github/Repo";

export default async function (fastify) {
    fastify.get("/general", async (req, res) => {
        const repos = await Repo.countDocuments({});

        return { repos };
    });
}
