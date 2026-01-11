// apps/api/src/routes/mobile/mobile.constants.ts
export const MOBILE_PROVIDER = "mobile_credentials";
export const REFRESH_PREFIX = "mrt_";

export const RESET_IDENTIFIER_PREFIX = "mobile:reset:";
export const VERIFY_IDENTIFIER_PREFIX = "mobile:verify:";

export const VERIFY_OTP_TTL_MINUTES = 10;
export const RESET_OTP_TTL_MINUTES = 5;

export function randomOtp4() {
  const n = Math.floor(Math.random() * 10000);
  return String(n).padStart(4, "0");
}
