import { generateKeySync } from "crypto";

export function generateNewKey(): string {
  return generateKeySync("hmac", { length: 64 }).export().toString("hex");
}
