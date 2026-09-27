import type { Channel } from 'amqplib';
import { connectRabbitMQ } from './connection';

let publisherChannel: Channel | null = null;
let consumerChannel: Channel | null = null;

export const getPublisherChannel = async (): Promise<Channel> => {
  if (publisherChannel) {
    return publisherChannel;
  }
  const connection = await connectRabbitMQ();
  publisherChannel = await connection.createChannel();
  return publisherChannel;
};

export const getConsumerChannel = async (): Promise<Channel> => {
  if (consumerChannel) {
    return consumerChannel;
  }
  const connection = await connectRabbitMQ();
  consumerChannel = await connection.createChannel();

  return consumerChannel;
};

export const closeChannels = async (): Promise<void> => {
  if (publisherChannel) {
    await publisherChannel.close();
    publisherChannel = null;
  }
  if (consumerChannel) {
    await consumerChannel.close();
    consumerChannel = null;
  }
};
