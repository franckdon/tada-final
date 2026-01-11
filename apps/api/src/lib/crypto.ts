import * as crypto from "node:crypto";

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function randomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function randomOtp6() {
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}
