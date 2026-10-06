import { createServer } from 'node:http';
import app from './app';
import { env } from './config/env';
import { gatewayLogger } from './observability/logger';
import { redis } from './config/redis';



const server = createServer(app);

const startServer = async () => {
  await redis.connect();
  
  
  server.listen(env.PORT, () => {
    gatewayLogger.info(`Gateway service running on port ${env.PORT}`);
  });
}

startServer().catch((error) => {
  gatewayLogger.error(error, "Failed to start gateway service")
  process.exit(1)
})

const shutdown = (signal: string) => {
  gatewayLogger.info(`${signal} received. Shutting down gateway...`);
  server.close(async(error) => {
    if (error) {
      gatewayLogger.error(error, 'Error during shutdown');
      process.exit(1);
    }
    try {
      if(redis.isOpen) {
        await redis.quit();
      }
      gatewayLogger.info("Gateway shutdown complete.")
      process.exit(0);
    } catch (error) {
      gatewayLogger.error(error, "failed during shutdown");
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
