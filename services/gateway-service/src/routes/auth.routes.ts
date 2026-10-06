import { authMiddleware } from "@/middlewares/auth.middleware";
import { authRateLimiter } from "@/middlewares/rate-limit.middleware";
import { authProxy } from "@/proxy/auth.proxy";
import { Router } from "express";


const router: Router = Router();

router.post("/signup", authRateLimiter ,authProxy);
router.post("/login", authRateLimiter ,authProxy);

router.post("/logout", authMiddleware, authRateLimiter ,authProxy);

export {router as authRouter}