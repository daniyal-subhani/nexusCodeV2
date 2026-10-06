import { Router } from "express";
import { authRouter } from "./auth.routes";
import { healthRouter } from "./health.routes";
import { userRouter } from "./user.routes";
import { chatRouter } from "./chat.routes";


export const router: Router = Router();

// Health Router
router.use("/health", healthRouter)

// Public authentication routes
router.use("/v1/auth", authRouter)

// Protected services
router.use("/v1/users", userRouter)
router.use("/v1/chat", chatRouter)


