import { SupportForm } from "@/components/support/support-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Tada",
};

export default async function Page() {
  return (
    <div className="space-y-12">
      <div className="max-w-[450px] mx-auto bg-white  p-8 rounded-lg  ">
        <SupportForm />
      </div>
    </div>
  );
}
