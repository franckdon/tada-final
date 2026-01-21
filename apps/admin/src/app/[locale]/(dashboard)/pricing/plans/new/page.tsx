// apps/admin/src/app/[locale]/(dashboard)/pricing/plans/new/page.tsx
import { getI18n } from "@/locales/server";
import { PlanCreateForm } from "@/components/pricing/plans/plan-create-form";

export const metadata = {
  title: "Créer un plan | Tada",
};

export default async function NewPlanPage() {
  const t = await getI18n();

  return (
    <div className="min-h-screen p-3 bg-white">
      <PlanCreateForm />
    </div>
  );
}
