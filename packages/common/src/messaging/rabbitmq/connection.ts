import amqp, { type ChannelModel } from 'amqplib';
import { getRabbitMQConfig } from './config';

let connection: ChannelModel | null = null;

export const connectRabbitMQ = async (): Promise<ChannelModel> => {
  if (connection) {
    return connection;
  }
  const { url } = getRabbitMQConfig();
  connection = await amqp.connect(url);
  connection.on('error', (error) => {
    console.error('[RabbitMQ] Connection closed', error);
  });
  connection.on('close', () => {
    console.warn('[RabbitMQ] connection closed');
    connection = null;
  });
  console.log('[RabbitMQ] Connected');
  return connection;
};

export const closeRabbitMQ = async (): Promise<void> => {
  if (!connection) return;
  await connection.close();
  connection = null;
  console.log('[RabbitMQ] Connection closed');
};
