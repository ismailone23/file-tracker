import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { Role, Stage } from "@file-tracker/db";
import { env } from "./env.js";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export interface SessionClaims {
  sub: string;
  name: string;
  email: string;
  role: Role;
  allowedStages: Stage[];
}

export async function verifyPassword(plainText: string, hash: string) {
  return bcrypt.compare(plainText, hash);
}

export async function signAccessToken(claims: SessionClaims) {
  return new SignJWT({
    name: claims.name,
    email: claims.email,
    role: claims.role,
    allowedStages: claims.allowedStages,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });

  return payload as unknown as SessionClaims & { exp: number; iat: number };
}
