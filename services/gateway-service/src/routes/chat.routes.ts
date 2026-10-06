import { authMiddleware } from "@/middlewares/auth.middleware";
import { chatProxy } from "@/proxy/chat.proxy";
import { Router } from "express";


const router: Router = Router();


router.use(authMiddleware)
router.use("/", chatProxy)

export {router as chatRouter}