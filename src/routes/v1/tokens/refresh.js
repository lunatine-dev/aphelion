import { User } from "#models/github/User";
import { issueAccessToken } from "#services/accessTokenService";
import { rotateRefreshToken } from "#services/refreshTokenService";

export default async (fastify) => {
    fastify.post("/refresh", async (req, res) => {
        const { refreshToken } = req.body;
        const ip = req.ip;
        const userAgent = req.headers["user-agent"];

        const { newRefreshToken, error, userId } = await rotateRefreshToken(
            refreshToken,
            ip,
            userAgent
        );

        if (error) return res.unauthorized("Session expired or invalid");
        const user = await User.findById(userId);
        if (!user) return res.unauthorized("Session expired or invalid");

        const accessToken = issueAccessToken(user, fastify);

        return {
            refreshToken: newRefreshToken,
            accessToken,
            user: {
                name: user.name,
                login: user.login,
                avatar: user.avatar,
                identifier: user.identifier,
            },
        };
    });
};
