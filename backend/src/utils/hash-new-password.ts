import { randomBytes, scryptSync } from "crypto";

export function hashNewPassword(password: string): {
  salt: string;
  hashedPassword: string;
} {
  // LOGGING SHOULD NEVER BE PUT IN THIS METHOD
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(password, salt, 64).toString("hex");

  return {
    salt,
    hashedPassword,
  };
}
