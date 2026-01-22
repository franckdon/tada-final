"use client";

import * as React from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { useParams } from "next/navigation";

const aiVersion = process.env.NEXT_PUBLIC_AI_VERSION ?? "unknown";

function getWelcomeMessage(locale: string) {
  const isFr = (locale ?? "").toLowerCase().startsWith("fr");
  return isFr
    ? "Bienvenue sur Tada, je suis Dyna. Comment puis-je vous aider à résoudre votre problème aujourd’hui ?"
    : "Welcome to Tada, I'm Dyna. How can I help you solve your problem today?";
}

export function MyRuntimeProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? "en";

  React.useEffect(() => {
    console.log("AI SDK version (client):", aiVersion);
  }, []);

  // Important: stable + typé UIMessage (et non Message)
  const initialMessages = React.useMemo<UIMessage[]>(() => {
    return [
      {
        id: "tada-welcome-1",
        role: "assistant",
        content: getWelcomeMessage(locale),
      },
    ];
  }, [locale]);

  const chat = useChat({
    api: "/api/chat",
    initialMessages,
    onResponse: async (res) => {
      console.log("useChat response status:", res.status);
      console.log(
        "useChat response content-type:",
        res.headers.get("content-type"),
      );
      const t = await res.clone().text();
      console.log("useChat raw response text:", t.slice(0, 200));
    },
    onError: (err) => console.error("useChat error:", err),
    onFinish: (msg) => console.log("useChat finished assistant message:", msg),
  });

  React.useEffect(() => {
    console.log("useChat messages:", chat.messages);
  }, [chat.messages]);

  const runtime = useAISDKRuntime(chat);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
