import { auth } from "@/lib/auth";
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createSafeActionClient,
} from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";

const handleServerError = (e: Error) => {
  console.error("Action error:", e.message);
  return e instanceof Error ? e.message : DEFAULT_SERVER_ERROR_MESSAGE;
};

export const actionClient = createSafeActionClient({
  handleServerError,
});

export const actionClientWithMeta = createSafeActionClient({
  handleServerError,
  defineMetadataSchema() {
    return z.object({
      name: z.string(),
    });
  },
});

export const authActionClient = actionClientWithMeta
  .use(async ({ next, clientInput, metadata }) => {
    const result = await next({ ctx: {} });

    if (process.env.NODE_ENV === "development") {
      console.log(`Input -> ${JSON.stringify(clientInput)}`);
      console.log(`Result -> ${JSON.stringify(result.data)}`);
      console.log(`Metadata -> ${JSON.stringify(metadata)}`);

      return result;
    }

    return result;
  })
  .use(async ({ next, clientInput, metadata }) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`Input -> ${JSON.stringify(clientInput)}`);
      console.log(`Metadata -> ${JSON.stringify(metadata)}`);
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Non authentifié");
    }

    return next({
      ctx: {
        user: session.user,
        auth,
      },
    });
  });
