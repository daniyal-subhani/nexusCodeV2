import { gatewayLogger } from "@/observability/logger";
import type { RequestHandler } from "express";


export const requestLoggerMiddleware: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", ()=> {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

    gatewayLogger.info({
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2))
    }, 
    "HTTP request completed"
)
  })
  next();
}
