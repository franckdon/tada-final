"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileNotificationsStreamRoutes = void 0;
const hono_1 = require("hono");
const requireMobileAuth_1 = require("../../../../middleware/requireMobileAuth");
const notifications_stream_1 = require("./notifications.stream");
exports.mobileNotificationsStreamRoutes = new hono_1.Hono();
/**
 * GET /v1/mobile/notifications/stream
 * Client: EventSource (ou lib équivalente mobile)
 *
 * Events:
 * - event: "notification"  data: NotificationItem
 * - event: "unreadCount"   data: { unreadCount: number }
 * - event: "ping"          data: { t: number }
 */
exports.mobileNotificationsStreamRoutes.get("/stream", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();
            const send = (event, payload) => {
                controller.enqueue(encoder.encode(`event: ${event}\n`));
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
            };
            // handshake
            send("ping", { t: Date.now() });
            // keep-alive ping
            const pingTimer = setInterval(() => {
                send("ping", { t: Date.now() });
            }, 25_000);
            const unregister = (0, notifications_stream_1.registerSseClient)(userId, {
                userId,
                send,
                close: () => {
                    clearInterval(pingTimer);
                    try {
                        controller.close();
                    }
                    catch { }
                },
            });
            // cleanup on cancel
            const cleanup = () => {
                clearInterval(pingTimer);
                unregister();
                try {
                    controller.close();
                }
                catch { }
            };
            // Hono/Fetch doesn't always expose cancel directly, but stream cancellation triggers it.
            // We'll use controller cancellation via internal behavior.
            controller._cleanup = cleanup;
        },
        cancel() {
            // best effort cleanup
            // @ts-ignore
            // eslint-disable-next-line
            // (noop if not present)
        },
    });
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
});
