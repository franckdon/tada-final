import SolutionLayout from "@/components/solution-layout";
import { generateMetadata } from "../../../metadata";
import { getI18n } from "@/locales/server";
import { solutions } from "@/components/solutions/data";
import { notFound } from "next/navigation";

export const metadata = generateMetadata({
  title: "Tada - Insight, Everywhere, Instantly™",
  description:
    "Harness the power of data-driven intelligence and get actionable insights quickly and cost-effectively with Tada.",
});

export default async function SolutionDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const t = await getI18n();

  const solution = solutions.find((solution) => solution.id === id);

  if (!solution) {
    notFound();
  }
  return (
    <div className="flex flex-col px-4 md:px-16">
      <SolutionLayout solution={solution!} family="industry" />
    </div>
  );
}
