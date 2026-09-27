import { getConsumerChannel } from "./channels";
import { setupEventsExchange, setupQueue } from "./typology";
import type { MessageHandler, QueueConfig } from "./types"


export const consume = async <T>(
  config: QueueConfig,
  handler: MessageHandler<T>,
):Promise<void> => {
  const channel = await getConsumerChannel();

  await setupEventsExchange(channel);
  await setupQueue(channel, config);
  await channel.consume(config.queue, async ( message ) => {
    if(!message) return;

    try {
      const payload = JSON.parse(
        message.content.toString()
      ) as T;
      await handler(payload, message)
      channel.ack(message)
    } catch (error) {
      console.error(`[RabbitMQ] Failed processing ${config.routingKey}:`, error)
      channel.nack(message, false, false)
    }
  })
}
