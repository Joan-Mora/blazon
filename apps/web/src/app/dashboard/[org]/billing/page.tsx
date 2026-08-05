import { apiFetch, apiFetchOrNull } from "@/lib/api";
import { requireOrgAdmin } from "@/lib/admin";
import type { PlanData } from "@/lib/types";
import { PlanPicker } from "@/components/dashboard/PlanPicker";

interface SubscriptionData {
  id: string;
  status: string;
  plan: { code: string; name: string };
}

export default async function BillingAdminPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: orgSlug } = await params;
  const { session, org } = await requireOrgAdmin(orgSlug);

  const [plans, subscription] = await Promise.all([
    apiFetch<PlanData[]>("/billing/plans"),
    apiFetchOrNull<SubscriptionData | null>(
      `/billing/orgs/${org.id}/subscription`,
      { token: session.token },
    ),
  ]);

  return (
    <main>
      <h1 className="text-2xl font-black mb-2">Suscripción</h1>
      <p className="text-neutral-400 mb-10 text-sm">
        {subscription
          ? `Plan actual: ${subscription.plan.name} (${subscription.status})`
          : "Esta organización aún no tiene un plan activo."}
      </p>

      <PlanPicker
        orgId={org.id}
        plans={plans}
        currentPlanCode={
          subscription?.status === "ACTIVE" || subscription?.status === "COMPED"
            ? subscription.plan.code
            : null
        }
      />
    </main>
  );
}
