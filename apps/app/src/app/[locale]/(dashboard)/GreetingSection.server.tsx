import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { GreetingSection } from "@/components/home/greeting-section";

export async function GreetingSectionServer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <GreetingSection name={session?.user?.name} />;
}
