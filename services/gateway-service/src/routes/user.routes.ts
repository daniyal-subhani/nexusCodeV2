import { authMiddleware } from "@/middlewares/auth.middleware";
import { userProxy } from "@/proxy/user.proxy";
import { Router } from "express";

const router:Router = Router();
router.use(authMiddleware)

router.use("/", userProxy);

export {router as userRouter}