import { openai } from "@ai-sdk/openai";
import {
  streamText,
  type UIMessage,
  convertToModelMessages,
} from "ai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    system,
    tools,
  }: {
    messages: UIMessage[];
    system?: string;
    tools?: any;
  } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system,
    messages: convertToModelMessages(messages),
    tools: {
      ...frontendTools(tools),
      // ajoute ici tes tools backend si besoin
    },
  });

  return result.toUIMessageStreamResponse();
}
