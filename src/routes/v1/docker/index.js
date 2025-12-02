import { jobs, docker } from "#services/docker";

export default async (fastify) => {
    fastify.get("/status", async (req, res) => {
        let dockerProxyStatus = await jobs.ping();

        return dockerProxyStatus.data;
    });

    fastify.get("/containers", async (req, res) => {
        const containers = await docker.getContainers();
        return containers.data;
    });
};
