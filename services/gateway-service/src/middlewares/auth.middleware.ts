import { verifyAccessToken } from "@/auth/verify-access-token";
import type { RequestHandler } from "express";


export const authMiddleware: RequestHandler = async (req, res, next) => {
  const authorization = req.header("authorization")

  if(!authorization?.startsWith("Bearer")) {
    res.status(401).json({
        success: false,
        error: {
            code: "UNAUTHORIZED",
            message: "Authentication required"
        }
    });
    return
  }
  const token = authorization.slice("Bearer ".length).trim();
  if(!token) {
    res.status(401).json({
        success: false,
        error: {
            code: "UNAUTHORIZED",
            message: "Authentication required"
        }
    });
    return
  }
  delete req.headers["x-user-id"];
  delete req.headers["x-user-role"];
  try {
    const payload = await verifyAccessToken(token);
      req.user = {
        id: payload.sub,
        role: payload.role
    }
    next();
  } catch {
    res.status(401).json({
        success: false,
        error: {
            code: "INVALID_ACCESS_TOKEN",
            message: "Invalid or expired access token"
        }
    })
  }
}
