import type { Channel } from 'amqplib';
import { getPublisherChannel } from './channels';
import { EVENTS_EXCHANGE } from './typology';

export const publish = async <T>(routingKey: string, payload: T): Promise<void> => {
  const channel: Channel = await getPublisherChannel();
  const message = Buffer.from(JSON.stringify(payload));

  channel.publish(EVENTS_EXCHANGE, routingKey, message, {
    persistent: true,
    contentType: 'application/json',
  });
};
