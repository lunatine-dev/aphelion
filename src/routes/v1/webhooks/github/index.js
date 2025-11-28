import hook from "#services/hook";

export default async function (fastify) {
    fastify.post("/", hook);
}
