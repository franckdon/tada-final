import { User } from "@prisma/client";

export type SubDashboard = {
  id: string;
  name: string;
  missionId: string;
  userId: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  image: string | null;
  role: string;
  user: User;
};
