// import { services } from "@/config/services";
// import { createServiceProxy } from "./proxy";

// export const chatProxy = createServiceProxy(services.chat as string)

import { createProxyMiddleware } from 'http-proxy-middleware';
import { proxyConfig } from './proxy.config';
import { handleProxyError } from './proxy-error';

export const chatProxy = createProxyMiddleware({
  target: proxyConfig.chat.target as string,
  changeOrigin: true,
  xfwd: true,
  proxyTimeout: 10_000,
  timeout: 10_000,
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.removeHeader("x-user-id");
      proxyReq.removeHeader("x-user-role");
      const user = (
        req as typeof req & {
          user?: {
            id: string;
            role: string;
          };
        }
      ).user;
      if (user) {
        proxyReq.setHeader('x-user-id', user.id);
        proxyReq.setHeader('x-user-role', user.role);
      }
    },
    error: handleProxyError,
  },
});
