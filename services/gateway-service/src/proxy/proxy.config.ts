import { services } from "@/config/services";

export const proxyConfig = {
    auth: {
        target: services.auth
    },
    user: {
        target: services.user
    },
    chat: {
        target: services.chat
    }
} as const;