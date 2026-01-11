"use client";

import { useState, useEffect } from "react";
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
import { authClient, useSession } from "@/lib/auth-client";

interface Contributor {
  id: string;
  name: string;
  email: string;
  image?: string;
  skills?: string[];
  completedMissions: number;
  averageRating: number;
  availability: string;
  activeAssignments: number;
}

interface MissionAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
  missionName: string;

  isLoading?: boolean;
}

export function MissionAssignmentModal({
  isOpen,
  onClose,
  missionId,
  missionName,
}: MissionAssignmentModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContributors, setSelectedContributors] = useState<string[]>(
    []
  );
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoadingContributors, setIsLoadingContributors] = useState(false);
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const { data: session } = useSession();

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
    onSuccess: (result) => {
      setIsLoadingContributors(false);
      onClose();
    },
    onError: (error) => {
      console.error("Error fetching contributors:", error);
      setIsLoadingContributors(false);
    },
  });

  // Charger les contributeurs au montage et lors de la recherche
  useEffect(() => {
    if (isOpen) {
      setIsLoadingContributors(true);
      getContributors.execute({
        search: searchTerm,
        limit: 50,
      });
    }
  }, [isOpen, searchTerm]);

  // Filtrer les contributeurs selon le terme de recherche local
  const filteredContributors = contributors.filter(
    (contributor) =>
      contributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contributor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contributor.skills &&
        contributor.skills.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  const toggleContributor = (contributorId: string) => {
    setSelectedContributors((prev) =>
      prev.includes(contributorId)
        ? prev.filter((id) => id !== contributorId)
        : [...prev, contributorId]
    );
  };

  const handleAssign = () => {
    setIsLoadingContributors(true);

    assignToContributors.execute({
      missionId,
      contributorIds: selectedContributors,
      assignedBy: session?.user?.id || "",
      dueDate: dueDate || undefined,
      notes: notes || undefined,
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedContributors([]);
      setSearchTerm("");
      setPriority("medium");
      setDueDate("");
      setNotes("");
    }
  }, [isOpen]);

  const selectedContributorNames = contributors
    .filter((c) => selectedContributors.includes(c.id))
    .map((c) => c.name);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl min-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Assigner la mission</DialogTitle>
          <DialogDescription>
            Sélectionnez les contributeurs à qui vous souhaitez attribuer la
            mission "{missionName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, email ou compétences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Configuration de l'assignation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Priorité</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Contributeurs sélectionnés ({selectedContributors.length})
              </h4>
              <Button
                size="sm"
                onClick={() =>
                  setSelectedContributors(
                    filteredContributors.map((contributor) => contributor.id)
                  )
                }
              >
                Sélection auto par critères
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* {selectedContributorNames.map((name) => (
                <Badge key={name} variant="secondary">
                  {name}
                </Badge>
              ))} */}

              {selectedContributorNames.length <= 0 && (
                <Badge variant="secondary">
                  Aucun contributeur sélectionné
                </Badge>
              )}
            </div>
            <Separator />
          </div>

          {/* Liste des contributeurs */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {!getContributors.isExecuting &&
                filteredContributors.map((contributor) => {
                  const isAvailable = contributor.availability === "available";
                  return (
                    <div
                      key={contributor.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedContributors.includes(contributor.id)
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50"
                      } ${!isAvailable ? "opacity-60" : ""}`}
                      onClick={() =>
                        isAvailable && toggleContributor(contributor.id)
                      }
                    >
                      <Checkbox
                        checked={selectedContributors.includes(contributor.id)}
                        disabled={!isAvailable}
                        onChange={() => {}}
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
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {contributor.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {contributor.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {contributor.completedMissions} missions • ⭐{" "}
                              {contributor.averageRating?.toFixed(1)}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs mt-1 ${getAvailabilityColor(
                                contributor.availability || "available"
                              )}`}
                            >
                              {contributor.availability === "available"
                                ? "Disponible"
                                : contributor.availability === "busy"
                                ? "Occupé"
                                : "Indisponible"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {filteredContributors.length === 0 &&
                !getContributors.isExecuting && (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun contributeur trouvé</p>
                    <p className="text-sm">
                      Essayez de modifier votre recherche
                    </p>
                  </div>
                )}
              {getContributors.isExecuting && (
                <div className="flex flex-col items-center py-8 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
                  <p>Chargement des contributeurs...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoadingContributors}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              selectedContributors.length === 0 || isLoadingContributors
            }
          >
            {isLoadingContributors ? (
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
