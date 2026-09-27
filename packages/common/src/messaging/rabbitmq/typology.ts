import type { Channel } from "amqplib";
import { QueueConfig } from "./types";

export const EVENTS_EXCHANGE = 'nexus.events';

export const setupEventsExchange = async (
    channel: Channel
): Promise<void> => {
  await channel.assertExchange(EVENTS_EXCHANGE, 'topic', {
    durable: true
  })
}

export const setupQueue = async (
    channel: Channel,
    config: QueueConfig 
):Promise<void> => {
  await channel.assertQueue(config.queue, {
    durable: true
  });

  await channel.bindQueue(config.queue, EVENTS_EXCHANGE, config.routingKey)
}
