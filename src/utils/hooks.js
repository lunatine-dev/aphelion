import { User } from "#models/github/User";
export const isAuthenticated = async (request, reply) => {
    try {
        await request.jwtVerify(); // Verifies and attaches the payload to request.user
    } catch (err) {
        return reply
            .code(401)
            .send({ message: "Unauthorized", error: err.message });
    }

    const decoded = request.user; // Already decoded by jwtVerify
    const user = await User.findById(decoded.sub); // Or decoded.userId if you use that

    if (!user) {
        return reply.code(401).send({ message: "Unauthorized" });
    }

    if (user.identifier.toString() !== process.env.OWNER_ID) {
        return reply.code(401).send({ message: "Unauthorized" });
    }

    request.user = user; // Attach full user to the request
};
