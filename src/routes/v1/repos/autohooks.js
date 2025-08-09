import { isAuthenticated } from "#utils/hooks";

export default async function (fastify) {
    fastify.addHook("onRequest", isAuthenticated);
}
