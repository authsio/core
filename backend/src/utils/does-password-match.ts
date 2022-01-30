import { scryptSync, timingSafeEqual } from "crypto";
import { Login } from "../models/logins/login.type";

export function doesPasswordMatch(password: string, loginInfo: Login): boolean {
  const hashedBuffer = scryptSync(password, loginInfo.passwordSalt, 64);
  const keyBuffer = Buffer.from(password, "hex");
  return timingSafeEqual(hashedBuffer, keyBuffer);
}
