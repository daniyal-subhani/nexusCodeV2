import { EVENTS, publish } from "@nexus/common";

export interface UserCreatedEvent {
    userId: string;
    email: string;
};

export const publishUserCreated = async (event: UserCreatedEvent): Promise<void> => {
  await publish(EVENTS.USER_CREATED, event)
}
