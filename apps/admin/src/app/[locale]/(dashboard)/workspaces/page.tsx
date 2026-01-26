import { prisma } from "@/lib/prisma";
import { ListWorkspaces } from "@/components/workspaces/list-workspaces";

export const metadata = { title: "Workspaces | Tada" };

type Locale = "fr" | "en";

function toDate(v: Date | string | null | undefined): Date | null {
  if (!v) return null;
  return v instanceof Date ? v : new Date(v);
}

function computeSubscriptionState(sub: any, now: Date) {
  if (!sub) return "none" as const;

  const startsAt = toDate(sub.startsAt);
  const endsAt = toDate(sub.endsAt);

  if (String(sub.status) !== "active") return "inactive" as const;

  if (startsAt && startsAt > now) return "scheduled" as const;

  // status=active mais période dépassée => expiré
  if (endsAt && endsAt <= now) return "expired" as const;

  return "active" as const;
}

export default async function WorkspacesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const now = new Date();

  const workspaces = await prisma.workspace.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      industry: true,
      companySize: true,
      country: true,
      createdAt: true,
      updatedAt: true,

      owner: { select: { id: true, name: true, email: true } },

      organization: {
        select: { id: true, name: true, slug: true, status: true },
      },

      workspacePlanSubscription: {
        select: {
          id: true,
          planCode: true,
          status: true,
          startsAt: true,
          endsAt: true,
          createdAt: true,
        },
      },

      // ✅ crédits restants (balance)
      workspace_credit_account: {
        select: { balance: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const items = workspaces.map((w) => {
    const sub = w.workspacePlanSubscription ?? null;

    const subscriptionState = computeSubscriptionState(sub, now);
    const isActive = subscriptionState === "active";

    const endsAt = sub?.endsAt ? new Date(sub.endsAt) : null;
    const isExpiringSoon = Boolean(
      sub &&
        String(sub.status) === "active" &&
        endsAt &&
        endsAt > now &&
        endsAt.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000,
    );

    return {
      id: w.id,
      name: w.name,
      slug: w.slug,
      industry: w.industry,
      companySize: w.companySize,
      country: w.country,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,

      owner: w.owner
        ? { id: w.owner.id, name: w.owner.name, email: w.owner.email }
        : null,

      organization: w.organization
        ? {
            id: w.organization.id,
            name: w.organization.name,
            slug: w.organization.slug,
            status: w.organization.status ?? "inactive",
          }
        : null,

      subscription: sub
        ? {
            id: sub.id,
            planCode: sub.planCode,
            status: sub.status,
            startsAt: sub.startsAt,
            endsAt: sub.endsAt,
          }
        : null,

      creditsBalance:
        typeof w.workspace_credit_account?.balance === "number"
          ? w.workspace_credit_account.balance
          : null,

      subscriptionState,
      isSubscriptionActive: isActive,
      isExpiringSoon,
    };
  });

  return (
    <div className="p-5 text-gray-800">
      <ListWorkspaces locale={locale} workspaces={items} />
    </div>
  );
}
