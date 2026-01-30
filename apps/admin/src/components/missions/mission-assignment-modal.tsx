"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, User, Check, Loader2 } from "lucide-react";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Input } from "@tada/ui/components/input";
import { Badge } from "@tada/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
import { Checkbox } from "@tada/ui/components/checkbox";
import { ScrollArea } from "@tada/ui/components/scroll-area";
import { Separator } from "@tada/ui/components/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { Textarea } from "@tada/ui/components/textarea";
import { useAction } from "next-safe-action/hooks";
import { getContributorsAction } from "@/actions/contributors/get-contributors-action";
import { assignMissionAction } from "@/actions/missions/assign-mission-action";
import { useSession } from "@/lib/auth-client";

type Priority = "low" | "medium" | "high" | "urgent";
type Availability = "available" | "busy" | "unavailable";

interface Contributor {
  id: string;
  name: string;
  email: string;
  image?: string;
  skills?: string[];
  completedMissions: number;
  averageRating: number;
  availability: Availability | string;
  activeAssignments: number;
}

interface MissionAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
  missionName: string;
}

export function MissionAssignmentModal({
  isOpen,
  onClose,
  missionId,
  missionName,
}: MissionAssignmentModalProps) {
  const { data: session } = useSession();

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContributors, setSelectedContributors] = useState<string[]>(
    [],
  );

  // dataset
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoadingContributors, setIsLoadingContributors] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // filters (client-side)
  const [availabilityFilter, setAvailabilityFilter] = useState<
    Availability | "all"
  >("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");

  // assignment config
  const [priority, setPriority] = useState<Priority | undefined>(undefined); // ✅ pas sélectionnée par défaut
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // Actions
  const getContributors = useAction(getContributorsAction, {
    onSuccess: ({ data }) => {
      setContributors((data?.contributors as any) || []);
      setIsLoadingContributors(false);
    },
    onError: (error) => {
      console.error("Error fetching contributors:", error);
      setIsLoadingContributors(false);
    },
  });

  const assignToContributors = useAction(assignMissionAction, {
    onSuccess: () => {
      setIsAssigning(false);
      onClose();
    },
    onError: (error) => {
      console.error("Error assigning mission:", error);
      setIsAssigning(false);
    },
  });

  // ✅ Load once on open (no refetch on search typing)
  useEffect(() => {
    if (!isOpen) return;

    setIsLoadingContributors(true);
    getContributors.execute({
      // IMPORTANT: pas de search ici => on veut la liste complète (non-bannis) côté serveur
      limit: 200, // ajuste si besoin
      offset: 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Reset when closed
  useEffect(() => {
    if (isOpen) return;

    setSelectedContributors([]);
    setSearchTerm("");
    setAvailabilityFilter("all");
    setSkillFilter("all");

    setPriority(undefined);
    setDueDate("");
    setNotes("");
  }, [isOpen]);

  // Build skill list from loaded contributors
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    for (const c of contributors) {
      for (const s of c.skills ?? []) set.add(s);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [contributors]);

  // ✅ Client-side filtering
  const filteredContributors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return contributors.filter((c) => {
      const matchesSearch =
        term.length === 0 ||
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.skills ?? []).some((s) => s.toLowerCase().includes(term));

      const matchesAvailability =
        availabilityFilter === "all" ||
        (c.availability || "available") === availabilityFilter;

      const matchesSkill =
        skillFilter === "all" ||
        (c.skills ?? []).some((s) => s.toLowerCase() === skillFilter);

      return matchesSearch && matchesAvailability && matchesSkill;
    });
  }, [contributors, searchTerm, availabilityFilter, skillFilter]);

  const toggleContributor = (contributorId: string) => {
    setSelectedContributors((prev) =>
      prev.includes(contributorId)
        ? prev.filter((id) => id !== contributorId)
        : [...prev, contributorId],
    );
  };

  const handleAssign = () => {
    if (!session?.user?.id) return;

    setIsAssigning(true);

    assignToContributors.execute({
      missionId,
      contributorIds: selectedContributors,
      assignedBy: session.user.id,
      // ✅ priorité optionnelle: si undefined, ton schema met default "medium"
      priority: priority as any,
      dueDate: dueDate || undefined,
      notes: notes || undefined,
    });
  };

  const selectedContributorNames = useMemo(() => {
    const set = new Set(selectedContributors);
    return contributors.filter((c) => set.has(c.id)).map((c) => c.name);
  }, [contributors, selectedContributors]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "unavailable":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canSubmit =
    selectedContributors.length > 0 && !isAssigning && !isLoadingContributors;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {/* ✅ footer toujours visible */}
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Assigner la mission</DialogTitle>
          <DialogDescription>
            Sélectionnez les contributeurs à qui vous souhaitez attribuer la
            mission "{missionName}"
          </DialogDescription>
        </DialogHeader>

        {/* Body scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, email ou compétences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters + assignment config */}
            <div className="grid grid-cols-2 gap-4">
              {/* Availability filter */}
              {/* <div>
                <label className="text-sm font-medium mb-2 block">
                  Disponibilité
                </label>
                <Select
                  value={availabilityFilter}
                  onValueChange={(v) =>
                    setAvailabilityFilter(v as Availability | "all")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="busy">Occupé</SelectItem>
                    <SelectItem value="unavailable">Indisponible</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Skill filter */}
              {/* <div>
                <label className="text-sm font-medium mb-2 block">
                  Compétence
                </label>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {allSkills.map((s) => (
                      <SelectItem key={s} value={s.toLowerCase()}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              {/* Priority (NOT selected by default) */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Priorité
                </label>
                <Select
                  value={priority ?? ""}
                  onValueChange={(v) =>
                    setPriority((v || undefined) as Priority | undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Non définie (moyenne par défaut)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due date */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Date limite (optionnel)
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Notes (optionnel)
              </label>
              <Textarea
                placeholder="Instructions spéciales, contexte, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Selected summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-medium">
                  Contributeurs sélectionnés ({selectedContributors.length})
                </h4>

                <Button
                  size="sm"
                  type="button"
                  onClick={() =>
                    setSelectedContributors(
                      filteredContributors
                        .filter(
                          (c) =>
                            (c.availability || "available") === "available",
                        )
                        .map((c) => c.id),
                    )
                  }
                  disabled={filteredContributors.length === 0}
                >
                  Sélection auto par critères
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedContributorNames.length > 0 ? (
                  selectedContributorNames.slice(0, 8).map((name) => (
                    <Badge key={name} variant="secondary">
                      {name}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary">
                    Aucun contributeur sélectionné
                  </Badge>
                )}

                {selectedContributorNames.length > 8 && (
                  <Badge variant="outline">
                    +{selectedContributorNames.length - 8}
                  </Badge>
                )}
              </div>

              <Separator />
            </div>

            {/* Contributors list (scroll) */}
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-2">
                {isLoadingContributors || getContributors.isExecuting ? (
                  <div className="flex flex-col items-center py-10 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin text-primary mb-3" />
                    <p>Chargement des contributeurs...</p>
                  </div>
                ) : filteredContributors.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun contributeur trouvé</p>
                    <p className="text-sm">Essayez de modifier vos filtres</p>
                  </div>
                ) : (
                  filteredContributors.map((contributor) => {
                    const isAvailable =
                      (contributor.availability || "available") === "available";
                    const checked = selectedContributors.includes(
                      contributor.id,
                    );

                    return (
                      <div
                        key={contributor.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          checked
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-gray-50"
                        } ${!isAvailable ? "opacity-60" : ""}`}
                        onClick={() =>
                          isAvailable && toggleContributor(contributor.id)
                        }
                      >
                        <Checkbox
                          checked={checked}
                          disabled={!isAvailable}
                          onCheckedChange={() => {
                            // checkbox controlled via container click for consistent UX
                          }}
                        />

                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={contributor.image || "/placeholder.svg"}
                            alt={contributor.name}
                          />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {contributor.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {contributor.email}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="text-xs text-gray-500">
                                {contributor.completedMissions} missions • ⭐{" "}
                                {Number(contributor.averageRating || 0).toFixed(
                                  1,
                                )}
                              </p>
                              <Badge
                                variant="outline"
                                className={`text-xs mt-1 ${getAvailabilityColor(
                                  contributor.availability || "available",
                                )}`}
                              >
                                {(contributor.availability || "available") ===
                                "available"
                                  ? "Disponible"
                                  : (contributor.availability ||
                                        "available") === "busy"
                                    ? "Occupé"
                                    : "Indisponible"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer always visible */}
        <DialogFooter className="shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isAssigning || isLoadingContributors}
          >
            Annuler
          </Button>

          <Button onClick={handleAssign} disabled={!canSubmit}>
            {isAssigning || assignToContributors.isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Attribution en cours...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Attribuer à {selectedContributors.length} contributeur
                {selectedContributors.length > 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
