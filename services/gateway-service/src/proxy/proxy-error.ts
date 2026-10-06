import { gatewayLogger } from '@/observability/logger';
import type { Options } from 'http-proxy-middleware';

export const handleProxyError: NonNullable<Options['on']>['error'] = (error, req, res, target) => {
  const errorCode = (error as NodeJS.ErrnoException).code;

  const isTimeout = errorCode === 'ETIMEOUT' || errorCode === 'ESOCKETTIMEOUT';

  const statusCode = isTimeout ? 504 : 502;

  gatewayLogger.error(
    {
      err: error,
      errorCode,
      method: req.method,
      path: req.url,
      target,
      requestId: req.headers['x-request-id'],
      statusCode,
    },
    'Downstream service request failed',
  );

  if ("writeHead" in res) {
    if(res.headersSent) {
    res.end();
    return;
  }
   res.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });
  res.end(
    JSON.stringify({
      success: false,
      error: {
        code: isTimeout ? 'GATEWAY_TIMEOUT' : 'BAD_GATEWAY',
        message: isTimeout ? 'Downstream service timed out' : 'Downstream service unavailable',
      },
    }),
  );
  return;
}
 res.destroy(error)
}