import jwt from "@fastify/jwt";
export const autoConfig = {
    secret: process.env.JWT_SECRET,
};

export default jwt;
