// apps/web/src/components/capabilities/CapabilityCard.tsx

"use client";

import { Capability } from "./data";
import * as Icons from "lucide-react";
import { useI18n } from "@/locales/client";

export default function CapabilityCard({ icon, title, description, color }: Capability) {
  const Icon = (Icons as any)[icon]; // Récupérer l'icône dynamiquement
  const t = useI18n();

  return (
    <div
      className={`rounded-xl p-6 ${color} shadow-sm hover:shadow-md transition cursor-pointer border border-transparent hover:border-gray-300`}
    >
      <div className="flex flex-col gap-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/60">
          {Icon && <Icon className="w-6 h-6 text-gray-700" />}
        </div>

        <h3 className="text-lg font-semibold text-gray-900">{t(title as any, {})}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{t(description as any, {})}</p>
      </div>
    </div>
  );
}