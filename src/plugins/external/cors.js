import cors from "@fastify/cors";
export const autoConfig = {
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: process.env.ORIGIN_SERVER || "*",
};
export default cors;
