import { Hono } from "hono";
import type { HonoVariables } from "../../../../types/hono";
import { requireMobileAuth } from "../../../../middleware/requireMobileAuth";
import { registerSseClient } from "./notifications.stream";

export const mobileNotificationsStreamRoutes = new Hono<{ Variables: HonoVariables }>();

/**
 * GET /v1/mobile/notifications/stream
 * Client: EventSource (ou lib équivalente mobile)
 *
 * Events:
 * - event: "notification"  data: NotificationItem
 * - event: "unreadCount"   data: { unreadCount: number }
 * - event: "ping"          data: { t: number }
 */
mobileNotificationsStreamRoutes.get("/stream", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, payload: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      // handshake
      send("ping", { t: Date.now() });

      // keep-alive ping
      const pingTimer = setInterval(() => {
        send("ping", { t: Date.now() });
      }, 25_000);

      const unregister = registerSseClient(userId, {
        userId,
        send,
        close: () => {
          clearInterval(pingTimer);
          try {
            controller.close();
          } catch {}
        },
      });

      // cleanup on cancel
      const cleanup = () => {
        clearInterval(pingTimer);
        unregister();
        try {
          controller.close();
        } catch {}
      };

      // Hono/Fetch doesn't always expose cancel directly, but stream cancellation triggers it.
      // We'll use controller cancellation via internal behavior.
      (controller as any)._cleanup = cleanup;
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
