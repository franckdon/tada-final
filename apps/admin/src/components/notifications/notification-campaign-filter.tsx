// src/components/notifications/notification-campaign-filter.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@tada/ui/components/input";
import { Button } from "@tada/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { useState } from "react";

export function NotificationCampaignFilter() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [status, setStatus] = useState(sp.get("status") ?? "all");

  const apply = () => {
    const params = new URLSearchParams(sp.toString());
    if (q) params.set("q", q);
    else params.delete("q");

    if (status && status !== "all") params.set("status", status);
    else params.delete("status");

    router.push(`/notifications?${params.toString()}`);
  };

  const reset = () => router.push("/notifications");

  return (
    <div className="flex items-center gap-2">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher une notification..."
        className="w-[280px]"
      />

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          <SelectItem value="draft">Brouillon</SelectItem>
          <SelectItem value="scheduled">Planifiée</SelectItem>
          <SelectItem value="sending">Envoi...</SelectItem>
          <SelectItem value="sent">Envoyée</SelectItem>
          <SelectItem value="cancelled">Annulée</SelectItem>
        </SelectContent>
      </Select>

      <Button type="button" onClick={apply}>
        Filtrer
      </Button>

      <Button type="button" variant="outline" onClick={reset}>
        Reset
      </Button>
    </div>
  );
}
