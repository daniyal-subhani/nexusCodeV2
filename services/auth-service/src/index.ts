import 'dotenv/config';
import { app } from './app';
import { createServer } from 'node:http';
import { logger } from './utils/logger';
import { startCronJobs } from './jobs/cleanup.job';
import { connectRabbitMQ } from '@nexus/common';

const PORT = 4001;

async function startService(): Promise<void> {
  try {
    await connectRabbitMQ();
    startCronJobs();

    const server = createServer(app);

    server.listen(PORT, () => {
      console.log(`[Auth Service] Running on port: ${PORT}`);
    });
  } catch (error) {
    logger.error({ error }, '[Auth Service] Failed to start:');
    process.exit(1);
  }
}

startService();
