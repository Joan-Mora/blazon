"use client";

import { useState, useTransition } from "react";
import { checkoutAction } from "@/app/actions";
import type { PlanData } from "@/lib/types";

export function PlanPicker({
  orgId,
  plans,
  currentPlanCode,
}: {
  orgId: string;
  plans: PlanData[];
  currentPlanCode: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      {error && <p className="mb-6 text-sm text-red-400">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.code === currentPlanCode;
          return (
            <div
              key={plan.id}
              className={`rounded-md border p-6 flex flex-col ${
                isCurrent
                  ? "border-emerald-700 bg-emerald-950/30"
                  : "border-neutral-800 bg-neutral-900"
              }`}
            >
              <p className="font-black text-lg mb-1">{plan.name}</p>
              <p className="text-3xl font-black mb-4">
                ${plan.priceMonthlyUsd}
                <span className="text-sm font-normal text-neutral-500">/mes</span>
              </p>
              <button
                disabled={pending || isCurrent}
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    const result = await checkoutAction(orgId, plan.code);
                    if (result.ok && result.url) {
                      window.location.href = result.url;
                    } else if (!result.ok) {
                      setError(result.error);
                    }
                  })
                }
                className={`mt-auto rounded-md px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 ${
                  isCurrent
                    ? "bg-emerald-900 text-emerald-300"
                    : "text-white hover:brightness-110"
                }`}
                style={isCurrent ? undefined : { background: "var(--blazon-red)" }}
              >
                {isCurrent ? "Plan actual" : pending ? "…" : "Elegir plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
