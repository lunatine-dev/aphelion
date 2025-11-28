import crypto from "crypto";

export default async function (fastify) {
    fastify.addHook("preValidation", async (request, reply) => {
        const signature = request.headers["x-hub-signature"];
        const payload = JSON.stringify(request.body);
        const hash = crypto
            .createHmac("sha1", process.env.GITHUB_HOOK_SECRET)
            .update(payload)
            .digest("hex");

        if (signature !== `sha1=${hash}`)
            return reply.unauthorized("Invalid signature");
    });
}
