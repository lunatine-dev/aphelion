import { jobs } from "#services/docker";

export default async (fastify) => {
    fastify.get("/status", async (req, res) => {
        let dockerProxyStatus = await jobs.ping();

        return dockerProxyStatus.data;
    });
};
