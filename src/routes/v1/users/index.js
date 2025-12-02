export default async function (fastify) {
    fastify.get("/@me", async (req, res) => {
        const { identifier, login, name, created_at, avatar } = req.user;

        return {
            identifier,
            login,
            name,
            created_at,
            avatar,
        };
    });
}
