import {createClient } from "redis"
import { env } from "./env"

const redisUrl = env.REDIS_URL as string

export const redis = createClient({
    url: redisUrl 
});

redis.on("error", (error) => {
    console.error("Redis Client Error:", error)
})