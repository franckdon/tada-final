import { auth } from "@/lib/auth";
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createSafeActionClient,
} from "next-safe-action";
import { headers, cookies } from "next/headers";
import { z } from "zod";

function errorToLog(e: unknown) {
  if (e instanceof Error) {
    return {
      name: e.name,
      message: e.message,
      stack: e.stack,
      // cause (Node >=16)
      cause: (e as any).cause ? String((e as any).cause) : undefined,
    };
  }
  return { message: String(e) };
}


async function getNativeHeadersWithCookies(): Promise<Headers> {
  const h = await headers();
  const native = new Headers();

  for (const [k, v] of h.entries()) native.set(k, v);

  // IMPORTANT: s'assurer que les cookies partent bien vers getSession
  const cookieHeader = cookies().toString();
  if (cookieHeader) native.set("cookie", cookieHeader);

  return native;
}

const handleServerError = (e: Error) => {
  console.error("Action error:", errorToLog(e));
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

export const authActionClient = actionClientWithMeta.use(
  async ({ next, clientInput, metadata }) => {
    // logs DEV
    if (process.env.NODE_ENV === "development") {
      console.log(`Input -> ${JSON.stringify(clientInput)}`);
      console.log(`Metadata -> ${JSON.stringify(metadata)}`);
      console.log(
        "[safe-action] cookies:",
        cookies().getAll().map((c) => c.name)
      );
    }

    // auth
    const session = await auth.api.getSession({
      headers: await getNativeHeadersWithCookies(),
    });

    if (!session?.user) {
      throw new Error("Non authentifié");
    }

    // exécuter l’action UNE SEULE FOIS, avec le bon ctx
    const result = await next({
      ctx: {
        user: session.user,
        auth,
      },
    });

    // logs DEV
    if (process.env.NODE_ENV === "development") {
      console.log(`Result -> ${JSON.stringify(result.data)}`);
    }

    return result;
  }
);
