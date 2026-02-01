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
  DialogTrigger,
} from "@tada/ui/components/dialog";
import { Input } from "@tada/ui/components/input";
import { Textarea } from "@tada/ui/components/textarea";
import { Checkbox } from "@tada/ui/components/checkbox";
import { Badge } from "@tada/ui/components/badge";
import { Loader2, Plus, Send, CalendarClock, Save } from "lucide-react";

import { createNotificationCampaignAction } from "@/actions/notifications/create-notification-campaign-action";
import { scheduleNotificationCampaignAction } from "@/actions/notifications/schedule-notification-campaign-action";
import { sendNotificationCampaignAction } from "@/actions/notifications/send-notification-campaign-action";

function normalizeTag(v: string) {
  return v.trim().replace(/\s+/g, " ").replace(/^,|,$/g, "");
}
function uniq(arr: string[]) {
  return Array.from(new Map(arr.map((x) => [x.toLowerCase(), x])).values());
}

type Audience = "all" | "contributors" | "clients";

export function CreateNotificationCampaignModal() {
  const [open, setOpen] = useState(false);

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

  // scheduling
  const [scheduledAt, setScheduledAt] = useState<string>(""); // datetime-local

  // created campaign id (after save)
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const createCampaign = useAction(createNotificationCampaignAction, {
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

      const id = (res as any)?.data?.data?.id as string | undefined;
      if (id) setCampaignId(id);

      toast({ title: "Brouillon enregistré" });
    },
    onError: (err) => {
      console.error("[CREATE_NOTIFICATION_CAMPAIGN_MODAL_ERROR]", err);
      toast({
        title: "Erreur",
        description:
          (err as any)?.serverError?.message ??
          "Server action error (voir console)",
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
      toast({ title: "Notification programmée " });
      setOpen(false);
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
      setOpen(false);
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
    createCampaign.status === "executing" ||
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

  const resetAll = () => {
    setTitle("");
    setBody("");
    setPush(false);
    setWeb(true);
    setAudience("all");
    setCountries([]);
    setCountriesInput("");
    setPlanCodes([]);
    setPlanCodesInput("");
    setActiveOnly(false);
    setScheduledAt("");
    setCampaignId(null);
  };

  // reset when closing
  useEffect(() => {
    if (!open) resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // UX: disable irrelevant filters
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

  const buildPayload = () => ({
    type: "system" as const,
    title: title.trim(),
    body: body.trim() || null,
    channels: { push, web },
    targeting: {
      audience,
      countries: audience === "contributors" ? countries : [],
      planCodes: audience === "clients" ? planCodes : [],
      activeOnly: audience === "contributors" ? activeOnly : false,
    },
    status: "draft" as const,
  });

  /**
   * ✅ retourne un campaignId fiable
   * closeOnSuccess = true uniquement quand l'utilisateur clique "Enregistrer (draft)"
   * (sinon schedule/send ne peuvent pas enchaîner)
   */
  const saveDraft = async (closeOnSuccess: boolean) => {
    if (!canSubmitBase) return null;

    const res = await createCampaign.executeAsync(buildPayload());
    const ok = (res as any)?.data?.success;
    if (!ok) return null;

    const id = (res as any)?.data?.data?.id as string | undefined;
    if (!id) return null;

    setCampaignId(id);

    if (closeOnSuccess) setOpen(false);

    return id;
  };

  const schedule = async () => {
    // 1) assurer un ID
    const id = campaignId ?? (await saveDraft(false));
    if (!id) return;

    // 2) date obligatoire
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
      campaignId: id,
      scheduledAt: date,
    });
  };

  const sendNowClick = async () => {
    const id = campaignId ?? (await saveDraft(false));
    if (!id) return;

    await sendNow.executeAsync({ campaignId: id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle notification
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer une notification</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {campaignId ? (
            <div className="text-xs text-gray-500">
              Brouillon enregistré • ID:{" "}
              <span className="font-mono">{campaignId}</span>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              Le brouillon n’est pas encore enregistré.
            </div>
          )}

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
              {/* Countries - only for contributors */}
              <div className={audience === "contributors" ? "" : "opacity-50"}>
                <div className="text-sm mb-1">
                  Pays (séparés par virgule){" "}
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

              {/* Plans - only for clients */}
              <div className={audience === "clients" ? "" : "opacity-50"}>
                <div className="text-sm mb-1">
                  Plans (clients){" "}
                  <span className="text-xs text-gray-500">
                    (ex: starter,growth,business)
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
              className={`flex items-center gap-2 text-sm ${
                audience === "contributors" ? "" : "opacity-50"
              }`}
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
            <div className="text-xs text-gray-500">
              Choisis une date/heure puis clique “Programmer”.
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                disabled={isBusy}
                className="w-[240px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isBusy}
            >
              Annuler
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => saveDraft(true)} // ✅ ferme le modal sur “Enregistrer draft”
              disabled={isBusy || !canSubmitBase}
            >
              {createCampaign.status === "executing" ? (
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
              title={!scheduledAt ? "Sélectionne une date/heure" : ""}
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
