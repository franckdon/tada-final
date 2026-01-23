"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESET_OTP_TTL_MINUTES = exports.VERIFY_OTP_TTL_MINUTES = exports.VERIFY_IDENTIFIER_PREFIX = exports.RESET_IDENTIFIER_PREFIX = exports.REFRESH_PREFIX = exports.MOBILE_PROVIDER = void 0;
exports.randomOtp4 = randomOtp4;
// apps/api/src/routes/mobile/mobile.constants.ts
exports.MOBILE_PROVIDER = "mobile_credentials";
exports.REFRESH_PREFIX = "mrt_";
exports.RESET_IDENTIFIER_PREFIX = "mobile:reset:";
exports.VERIFY_IDENTIFIER_PREFIX = "mobile:verify:";
exports.VERIFY_OTP_TTL_MINUTES = 10;
exports.RESET_OTP_TTL_MINUTES = 5;
function randomOtp4() {
    const n = Math.floor(Math.random() * 10000);
    return String(n).padStart(4, "0");
}
