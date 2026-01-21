import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PlanEditForm } from "@/components/pricing/plans/plan-edit-form";

export const metadata = { title: "Modifier un plan | Tada" };

type Params = { params: { id: string } };

export default async function EditPlanPage({ params }: Params) {
  const plan = await prisma.plan.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      bulletsFr: true,
      bulletsEn: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!plan) return notFound();

  const initialPlan = {
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };

  return (
    <div className="min-h-screen p-3 bg-white">
      <PlanEditForm initialPlan={initialPlan} />
    </div>
  );
}
