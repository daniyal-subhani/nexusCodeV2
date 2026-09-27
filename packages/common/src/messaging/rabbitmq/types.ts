import type { ConsumeMessage } from 'amqplib';

export type MessageHandler<T> = (_payload: T, _message: ConsumeMessage) => Promise<void>;

export interface QueueConfig {
  queue: string;
  exchange: string;
  routingKey: string;
}
