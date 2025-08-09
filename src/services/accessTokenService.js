export const issueAccessToken = (user, fastify) => {
    let accessToken;
    try {
        accessToken = fastify.jwt.sign(
            {
                sub: user._id,
                name: user.name,
                login: user.login,
                avatar: user.avatar,
                identifier: user.identifier,
            },
            {
                expiresIn: "30m",
            }
        );
    } catch (err) {
        throw new Error("Internal server error");
    }

    return accessToken;
};
