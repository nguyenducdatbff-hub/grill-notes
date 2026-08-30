import { randomBytes } from "crypto";

export function newShareToken(): string {
  return randomBytes(16).toString("hex");
}
