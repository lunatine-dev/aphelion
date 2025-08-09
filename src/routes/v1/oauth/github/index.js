import { User } from "#models/github/User";
import { issueAccessToken } from "#services/accessTokenService";
import { issueRefreshToken } from "#services/refreshTokenService";
import { getUser } from "#services/github";
import crypto from "crypto";
import { saveTempCode, useTempCode } from "#utils/tempCodes";

export default async (fastify) => {
    fastify.get("/callback", async (req, res) => {
        const { token } =
            await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(
                req
            );

        const user = await getUser(token.accessToken);

        if (process.env.GITHUB_OWNER_ID !== user.id.toString())
            return res.unauthorized("Invalid identifier");

        let dbUser = await User.findOne({ identifier: user.id });
        if (!dbUser) {
            dbUser = new User({
                identifier: user.id,
                login: user?.login,
                name: user?.name,
                avatar: user?.avatar_url,
            });
        } else {
            dbUser.avatar = user?.avatar_url;
        }

        await dbUser.save();

        const ip = request.ip;
        const userAgent = request.headers["user-agent"];

        const accessToken = issueAccessToken(dbUser, fastify);
        const refreshToken = await issueRefreshToken(dbUser._id, ip, userAgent);

        const tempCode = crypto.randomUUID();
        saveTempCode(tempCode, {
            accessToken,
            refreshToken,
        });

        return res.redirect(
            `${process.env.FRONTEND_URL}/callback?user=${tempCode}`
        );
    });

    fastify.post("`/finalize", async (req, res) => {
        const { code } = req.body;
        if (!code) return res.badRequest("Missing code");

        const tokens = useTempCode(code);

        if (!tokens) return res.badRequest("Invalid or expired code");

        res.send(tokens);
    });
};
