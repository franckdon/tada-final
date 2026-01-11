import LogIn from "@/components/auth/login-card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Se connecter | Tada",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect("/");
  }
  return (
    <div className=" min-h-screen flex">
      <LogIn />
    </div>
  );
}
