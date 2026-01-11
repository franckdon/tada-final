import type { User, Mission, MissionAssignment } from "@prisma/client";

export interface ContributorWithStats extends User {
  _count: {
    missionAssignments: number;
  };
  averageRating?: number;
  skills?: string[];
  availability?: string;
  completedMissions?: number;
}

export interface MissionAssignmentWithRelations extends MissionAssignment {
  contributor: User;
  mission: Mission;
  assignedByUser: User;
}

export interface MissionWithAssignments extends Mission {
  missionAssignment: MissionAssignmentWithRelations[];
  _count: {
    missionAssignment: number;
  };
}

export type AssignmentStatus =
  | "assigned"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";
export type Priority = "low" | "medium" | "high" | "urgent";
