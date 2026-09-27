export interface RabbitMQConfig {
    url: string 
}

export const getRabbitMQConfig = ():RabbitMQConfig  => {
    const url = process.env.RABBITMQ_URL;
    if(!url) {
        throw new Error("Rabbitmq_url is not defined")
    }
    return {
        url
    }
}