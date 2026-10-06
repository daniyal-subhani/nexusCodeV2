import { createProxyMiddleware } from "http-proxy-middleware";
import { proxyConfig } from "./proxy.config";
import { handleProxyError } from "./proxy-error";


export const authProxy  = createProxyMiddleware({
    target: proxyConfig.auth.target as string,
    changeOrigin: true,
    xfwd: true,
    proxyTimeout: 10_000,
    timeout: 10_000,
    pathRewrite: {
        "^/api/v1/auth": "/api/v2/auth"
    },
    on: {
        proxyReq: (proxyReq) => {
            proxyReq.removeHeader("x-user-id");
            proxyReq.removeHeader("x-user-role");
        },
        error: handleProxyError
    }
})