import oauth from "@fastify/oauth2";

let extraEnv = [
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GITHUB_CALLBACK_URL",
];

const missing = extraEnv.filter((env) => !process.env?.[env]);

if (missing.length > 0) {
    console.warn(
        `[src/plugins/external/oauth.js] Missing required OAuth environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
}
export const autoConfig = {
    name: "githubOAuth2",
    scope: [],
    credentials: {
        client: {
            id: process.env.GITHUB_CLIENT_ID,
            secret: process.env.GITHUB_CLIENT_SECRET,
        },
        auth: oauth.GITHUB_CONFIGURATION,
    },
    startRedirectPath: process.env.START_OAUTH_PATH,
    callbackUri: process.env.GITHUB_CALLBACK_URL,
};

export default oauth;
