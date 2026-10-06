import { createProxyMiddleware, type Options } from 'http-proxy-middleware';
import { handleProxyError } from './proxy-error';

const DEFAULT_PROXY_TIMEOUT = 15_000;
const DEFAULT_REQUEST_TIMEOUT = 20_000;

export const createServiceProxy = (target: string, options: Options = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: DEFAULT_PROXY_TIMEOUT,
    timeout: DEFAULT_REQUEST_TIMEOUT,
    ...options,
    on: {
      ...options.on,

      proxyReq: (proxyReq, req, res, proxyOptions) => {
        const requestId = req.headers['x-request-id'];
        if (requestId) {
          proxyReq.setHeader('x-request-id', requestId);
        }
        const user = (
          req as typeof req & {
            user?: {
              id: string;
              role?: string;
            };
          }
        ).user;

        if (user?.id) {
          proxyReq.setHeader('x-user-id', user.id);
        }
        if (user?.role) {
          proxyReq.setHeader('x-user-role', user.role);
        }

        options.on?.proxyReq?.(proxyReq, req, res, proxyOptions);
      },
      error: handleProxyError,
    },
  });
};
