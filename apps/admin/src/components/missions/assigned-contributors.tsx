"use client";

import { useState, useEffect } from "react";
import { User, Mail, Calendar, X, Clock, Loader2 } from "lucide-react";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
import { ScrollArea } from "@tada/ui/components/scroll-area";
import { Card, CardContent } from "@tada/ui/components/card";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { getMissionAssignmentsAction } from "@/actions/missions/get-mission-assignment";
import { removeAssignmentAction } from "@/actions/missions/remove-mission-assignment";

interface AssignedContributorsViewProps {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
  missionName: string;
}

export function AssignedContributorsView({
  isOpen,
  onClose,
  missionId,
  missionName,
}: AssignedContributorsViewProps) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const getAssignments = useAction(getMissionAssignmentsAction, {
    onSuccess: (result) => {
      setAssignments(result.data?.assignments || []);
    },
    onError: (error) => {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les contributeurs assignés",
        variant: "destructive",
      });
    },
  });

  const removeAssignment = useAction(removeAssignmentAction, {
    onSuccess: (result) => {
      toast({
        title: "Succès",
        description: result.data?.message || "Contributeur retiré avec succès",
      });
      getAssignments.execute({ missionId });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de retirer le contributeur",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isOpen && missionId) {
      getAssignments.execute({ missionId });
    }
  }, [isOpen, missionId]);

  const handleRemoveContributor = async (assignmentId: string) => {
    setRemovingId(assignmentId);
    try {
      await removeAssignment.executeAsync({ assignmentId });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Contributeurs assignés</DialogTitle>
          <DialogDescription>
            Contributeurs actuellement assignés à la mission "{missionName}"
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {getAssignments.isExecuting ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
                <p className="text-gray-500">Chargement des contributeurs...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun contributeur assigné</p>
                <p className="text-sm">
                  Cette mission n'a pas encore été attribuée
                </p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <Card key={assignment.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={
                              assignment.contributor.image || "/placeholder.svg"
                            }
                            alt={assignment.contributor.name}
                          />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {assignment.contributor.name}
                            </h3>
                          </div>

                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Mail className="h-4 w-4 mr-1" />
                            {assignment.contributor.email}
                          </div>

                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <Calendar className="h-4 w-4 mr-1" />
                            Assigné le{" "}
                            {new Date(assignment.assignedAt).toLocaleDateString(
                              "fr-FR"
                            )}
                            {assignment.assignedByUser && (
                              <span className="ml-2">
                                par {assignment.assignedByUser.name}
                              </span>
                            )}
                          </div>

                          {assignment.dueDate && (
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <Clock className="h-4 w-4 mr-1" />
                              Échéance:{" "}
                              {new Date(assignment.dueDate).toLocaleDateString(
                                "fr-FR"
                              )}
                            </div>
                          )}

                          {assignment.notes && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                {assignment.notes}
                              </p>
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progression</span>
                              <span className="font-medium">
                                {assignment.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${assignment.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveContributor(assignment.id)}
                        disabled={
                          removingId === assignment.id ||
                          removeAssignment.isExecuting
                        }
                      >
                        {removingId === assignment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
