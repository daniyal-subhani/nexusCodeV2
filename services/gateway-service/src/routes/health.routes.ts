import { redis } from "@/config/redis";
import { Router } from "express";

const router:Router = Router();

router.get("/live", (_req, res) => {
    res.status(200).json({
        success: true,
        service: "gateway-service",
        status: "alive"
    })
});

router.get("/ready" , async (_req, res) => {
    const redisReady = redis.isReady;
    try {
       await redis.ping();
    if(!redisReady) {
        res.status(503).json({
            success: false,
            service: "gateway-service",
            status: "not_ready",
            dependencies: {
                redis: "unavailable"
            }
        })
        return
    }
    res.status(200).json({
        success: true,
        service: "gateway-service",
        status: "ready",
        dependencies: {
            redis: "ready"
        }
    })
    } catch {
        res.status(503).json({
            success: false,
            status: "not_ready"
        })
    }
    
})

export {router as healthRouter}