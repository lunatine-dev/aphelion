import { jobs, docker } from "#services/docker";

const cache = new Map();

export default async (fastify) => {
    fastify.get("/status", async (req, res) => {
        let dockerProxyStatus = await jobs.ping();

        return dockerProxyStatus.data;
    });

    fastify.get("/containers", async (req, res) => {
        const containers = await docker.getContainers();
        return containers.data;
    });
    fastify.get("/containers/:repo_id", async (req, res) => {
        const { repo_id } = req.params;
        const cached = cache.get(repo_id);
        if (cached && cached.expires > Date.now()) {
            return cached.data;
        }

        const { data } = await docker.getContainer(repo_id);

        cache.set(repo_id, { data, expires: Date.now() + 15 * 60 * 1000 });

        return data;
    });
};
