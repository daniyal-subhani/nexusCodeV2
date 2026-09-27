import { logger } from '@/utils/logger';
import { consume, EVENTS } from '@nexus/common';

interface UserCreatedEvent {
  userId: string;
  email: string;
}

export const startCreatedConsumer = async (): Promise<void> => {
  await consume<UserCreatedEvent>(
    {
      queue: `user-service.${EVENTS.USER_CREATED}`,
      exchange: 'nexus.events',
      routingKey: EVENTS.USER_CREATED,
    },
    async (event) => {
      logger.info(`[Rabbitmq] User created event received: ${JSON.stringify(event)}`);

      // create user profile in db - call user service
    },
  );
};
