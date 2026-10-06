import { env } from "./env";

export const services = {
    auth: env.AUTH_SERVICE_URL,
    user: env.AUTH_SERVICE_URL,
    chat: env.AUTH_SERVICE_URL,
} as const;