import { scryptSync, timingSafeEqual } from "crypto";
import { Login } from "../models/logins/login.type";

export function doesPasswordMatch(
  password: string,
  loginInfo: Pick<Login, "passwordSalt" | "passwordHash">
): boolean {
  const hashedBuffer = scryptSync(password, loginInfo.passwordSalt, 64);
  const keyBuffer = Buffer.from(loginInfo.passwordHash, "hex");
  if (hashedBuffer.length !== keyBuffer.length) {
    return false;
  }
  return timingSafeEqual(hashedBuffer, keyBuffer);
}
