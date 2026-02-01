"use client";

import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Input } from "@tada/ui/components/input";
import { Textarea } from "@tada/ui/components/textarea";
import { Checkbox } from "@tada/ui/components/checkbox";
import { Badge } from "@tada/ui/components/badge";
import { Loader2, Send, CalendarClock, Save } from "lucide-react";

import { updateNotificationCampaignAction } from "@/actions/notifications/update-notification-campaign-action";
import { scheduleNotificationCampaignAction } from "@/actions/notifications/schedule-notification-campaign-action";
import { sendNotificationCampaignAction } from "@/actions/notifications/send-notification-campaign-action";

type Audience = "all" | "contributors" | "clients";

type CampaignLike = {
  id: string;
  type?: string | null;
  title: string;
  body?: string | null;
  channels?: { push?: boolean; web?: boolean } | any;
  targeting?:
    | {
        audience?: Audience;
        countries?: string[];
        // on tolère les deux clés selon ce que tu as en DB
        planCodes?: string[];
        plans?: string[];
        activeOnly?: boolean;
      }
    | any;
  status?: string | null;
  scheduledAt?: string | Date | null;
};

function normalizeTag(v: string) {
  return v.trim().replace(/\s+/g, " ").replace(/^,|,$/g, "");
}
function uniq(arr: string[]) {
  return Array.from(new Map(arr.map((x) => [x.toLowerCase(), x])).values());
}

// datetime-local helper
function toDatetimeLocal(value: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = value.getFullYear();
  const mm = pad(value.getMonth() + 1);
  const dd = pad(value.getDate());
  const hh = pad(value.getHours());
  const mi = pad(value.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function EditNotificationCampaignModal({
  open,
  onOpenChange,
  campaign,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  campaign: CampaignLike;
  onUpdated?: () => void;
}) {
  // form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [push, setPush] = useState(false);
  const [web, setWeb] = useState(true);

  const [audience, setAudience] = useState<Audience>("all");

  const [countriesInput, setCountriesInput] = useState("");
  const [countries, setCountries] = useState<string[]>([]);

  const [planCodesInput, setPlanCodesInput] = useState("");
  const [planCodes, setPlanCodes] = useState<string[]>([]);

  const [activeOnly, setActiveOnly] = useState(false);

  const [scheduledAt, setScheduledAt] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    setTitle(campaign.title ?? "");
    setBody(campaign.body ?? "");

    setPush(Boolean(campaign.channels?.push));
    setWeb(
      campaign.channels?.web === undefined
        ? true
        : Boolean(campaign.channels?.web),
    );

    setAudience((campaign.targeting?.audience as Audience) ?? "all");

    setCountries(
      Array.isArray(campaign.targeting?.countries)
        ? campaign.targeting.countries
        : [],
    );

    const pc = Array.isArray(campaign.targeting?.planCodes)
      ? campaign.targeting.planCodes
      : Array.isArray(campaign.targeting?.plans)
        ? campaign.targeting.plans
        : [];
    setPlanCodes(pc);

    setActiveOnly(Boolean(campaign.targeting?.activeOnly));

    if (campaign.scheduledAt) {
      const d =
        typeof campaign.scheduledAt === "string"
          ? new Date(campaign.scheduledAt)
          : campaign.scheduledAt;
      setScheduledAt(Number.isNaN(d.getTime()) ? "" : toDatetimeLocal(d));
    } else {
      setScheduledAt("");
    }

    setCountriesInput("");
    setPlanCodesInput("");
  }, [open, campaign]);

  // UX : désactive filtres non pertinents
  useEffect(() => {
    if (audience !== "contributors") {
      setCountries([]);
      setCountriesInput("");
      setActiveOnly(false);
    }
    if (audience !== "clients") {
      setPlanCodes([]);
      setPlanCodesInput("");
    }
  }, [audience]);

  const updateCampaign = useAction(updateNotificationCampaignAction, {
    onSuccess: (res) => {
      const ok = (res as any)?.data?.success;
      if (!ok) {
        toast({
          title: "Erreur",
          description: (res as any)?.data?.error ?? "Action failed",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Campagne mise à jour ✅" });
      onUpdated?.();
    },
    onError: (err) => {
      console.error("[UPDATE_NOTIFICATION_CAMPAIGN_ERROR]", err);
      toast({
        title: "Erreur",
        description:
          (err as any)?.serverError?.message ??
          "Impossible de mettre à jour (voir console)",
        variant: "destructive",
      });
    },
  });

  const scheduleCampaign = useAction(scheduleNotificationCampaignAction, {
    onSuccess: (res) => {
      const ok = (res as any)?.data?.success;
      if (!ok) {
        toast({
          title: "Erreur",
          description: (res as any)?.data?.error ?? "Action failed",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Notification programmée ✅" });
      onOpenChange(false);
      onUpdated?.();
    },
    onError: (err) => {
      console.error("[SCHEDULE_NOTIFICATION_CAMPAIGN_ERROR]", err);
      toast({
        title: "Erreur",
        description:
          (err as any)?.serverError?.message ??
          "Impossible de programmer (voir console)",
        variant: "destructive",
      });
    },
  });

  const sendNow = useAction(sendNotificationCampaignAction, {
    onSuccess: (res) => {
      const ok = (res as any)?.data?.success;
      if (!ok) {
        toast({
          title: "Erreur",
          description: (res as any)?.data?.error ?? "Action failed",
          variant: "destructive",
        });
        return;
      }
      const recipients = (res as any)?.data?.data?.recipients ?? 0;
      toast({
        title: "Envoyé ✅",
        description: `${recipients} destinataire(s)`,
      });
      onOpenChange(false);
      onUpdated?.();
    },
    onError: (err) => {
      console.error("[SEND_NOW_NOTIFICATION_CAMPAIGN_ERROR]", err);
      toast({
        title: "Erreur",
        description:
          (err as any)?.serverError?.message ??
          "Impossible d'envoyer maintenant (voir console)",
        variant: "destructive",
      });
    },
  });

  const isBusy =
    updateCampaign.status === "executing" ||
    scheduleCampaign.status === "executing" ||
    sendNow.status === "executing";

  const canSubmitBase = useMemo(() => {
    if (title.trim().length < 2) return false;
    if (!web && !push) return false;
    return true;
  }, [title, web, push]);

  const addCountries = () => {
    const parts = countriesInput.split(",").map(normalizeTag).filter(Boolean);
    setCountries((prev) => uniq([...prev, ...parts]));
    setCountriesInput("");
  };

  const addPlanCodes = () => {
    const parts = planCodesInput.split(",").map(normalizeTag).filter(Boolean);
    setPlanCodes((prev) => uniq([...prev, ...parts]));
    setPlanCodesInput("");
  };

  const buildPayload = () => ({
    campaignId: campaign.id,
    type: (campaign.type ?? "system") as string,
    title: title.trim(),
    body: body.trim() || null,
    channels: { push, web },
    targeting: {
      audience, // ✅ "all" | "contributors" | "clients"
      countries: audience === "contributors" ? countries : [],
      planCodes: audience === "clients" ? planCodes : [],
      activeOnly: audience === "contributors" ? activeOnly : false,
    },
  });

  const saveDraft = async () => {
    if (!canSubmitBase) return;
    await updateCampaign.executeAsync(buildPayload());
  };

  const schedule = async () => {
    if (!canSubmitBase) return;

    await saveDraft();

    if (!scheduledAt) {
      toast({
        title: "Date requise",
        description: "Choisis une date/heure pour programmer.",
        variant: "destructive",
      });
      return;
    }
    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime())) {
      toast({
        title: "Date invalide",
        description: "Le format de date est invalide.",
        variant: "destructive",
      });
      return;
    }

    await scheduleCampaign.executeAsync({
      campaignId: campaign.id,
      scheduledAt: date,
    });
  };

  const sendNowClick = async () => {
    if (!canSubmitBase) return;

    await saveDraft();
    await sendNow.executeAsync({ campaignId: campaign.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier la notification</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-xs text-gray-500">
            ID: <span className="font-mono">{campaign.id}</span>{" "}
            {campaign.status ? (
              <Badge variant="secondary" className="ml-2">
                {campaign.status}
              </Badge>
            ) : null}
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Titre</div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isBusy}
            />
          </div>

          <div>
            <div className="text-sm font-medium mb-1">Message</div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              disabled={isBusy}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">Canaux</div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={web}
                onCheckedChange={(v) => setWeb(Boolean(v))}
                disabled={isBusy}
              />
              Web (popup)
            </label>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={push}
                onCheckedChange={(v) => setPush(Boolean(v))}
                disabled={isBusy}
              />
              Push (mobile)
            </label>
          </div>

          <div className="rounded-md border p-3 space-y-3">
            <div className="text-sm font-medium">Ciblage</div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={audience === "all" ? "default" : "outline"}
                onClick={() => setAudience("all")}
                disabled={isBusy}
              >
                Tous
              </Button>
              <Button
                type="button"
                size="sm"
                variant={audience === "contributors" ? "default" : "outline"}
                onClick={() => setAudience("contributors")}
                disabled={isBusy}
              >
                Contributeurs
              </Button>
              <Button
                type="button"
                size="sm"
                variant={audience === "clients" ? "default" : "outline"}
                onClick={() => setAudience("clients")}
                disabled={isBusy}
              >
                Clients
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className={audience === "contributors" ? "" : "opacity-50"}>
                <div className="text-sm mb-1">
                  Pays (virgules){" "}
                  <span className="text-xs text-gray-500">(ex: CI,SN)</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={countriesInput}
                    onChange={(e) => setCountriesInput(e.target.value)}
                    placeholder="CI, SN"
                    disabled={isBusy || audience !== "contributors"}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCountries}
                    disabled={isBusy || audience !== "contributors"}
                  >
                    Ajouter
                  </Button>
                </div>

                <div className="flex gap-2 flex-wrap mt-2">
                  {countries.map((c) => (
                    <Badge
                      key={c}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setCountries((prev) => prev.filter((x) => x !== c))
                      }
                    >
                      {c} ✕
                    </Badge>
                  ))}
                </div>
              </div>

              <div className={audience === "clients" ? "" : "opacity-50"}>
                <div className="text-sm mb-1">
                  Plans (virgules){" "}
                  <span className="text-xs text-gray-500">
                    (ex: growth,business)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={planCodesInput}
                    onChange={(e) => setPlanCodesInput(e.target.value)}
                    placeholder="growth, business"
                    disabled={isBusy || audience !== "clients"}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPlanCodes}
                    disabled={isBusy || audience !== "clients"}
                  >
                    Ajouter
                  </Button>
                </div>

                <div className="flex gap-2 flex-wrap mt-2">
                  {planCodes.map((p) => (
                    <Badge
                      key={p}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setPlanCodes((prev) => prev.filter((x) => x !== p))
                      }
                    >
                      {p} ✕
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <label
              className={`flex items-center gap-2 text-sm ${audience === "contributors" ? "" : "opacity-50"}`}
            >
              <Checkbox
                checked={activeOnly}
                onCheckedChange={(v) => setActiveOnly(Boolean(v))}
                disabled={isBusy || audience !== "contributors"}
              />
              Contributeurs actifs seulement
            </label>
          </div>

          <div className="rounded-md border p-3 space-y-2">
            <div className="text-sm font-medium">Programmation</div>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              disabled={isBusy}
              className="w-[240px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Fermer
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={saveDraft}
              disabled={isBusy || !canSubmitBase}
            >
              {updateCampaign.status === "executing" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer (draft)
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={schedule}
              disabled={isBusy || !canSubmitBase || !scheduledAt}
            >
              {scheduleCampaign.status === "executing" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Programmation...
                </>
              ) : (
                <>
                  <CalendarClock className="w-4 h-4 mr-2" />
                  Programmer
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={sendNowClick}
              disabled={isBusy || !canSubmitBase}
            >
              {sendNow.status === "executing" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer maintenant
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
