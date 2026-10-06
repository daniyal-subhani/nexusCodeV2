import { env } from "@/config/env"
import {jwtVerify , type JWTPayload} from "jose"

export interface AccessTokenPayload extends JWTPayload {
    sub: string;
    role?: string
}

const secret = new TextEncoder().encode(env.JWT_SECRET as string);

export const verifyAccessToken = async (token: string): Promise<AccessTokenPayload> => {
  const {payload} = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
    issuer: "nexusCoreV2",
    audience: "nexusCoreV2-api"
  });
  if(!payload.sub) {
    throw new Error("Access token subject is missing");
  }
  
  return payload as AccessTokenPayload;
}
