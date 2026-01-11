export interface Mission {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
  organizationId: string | null;
  status: string | null;
  problemSummary: string | null;
  objectives: string | null;
  assumptions: string | null;
  updatedType: string | null;
  type: string;
  internal: boolean;
  missionPermissions: MissionPermission[];
  submissions: number;
  percentage: number;
  isPublic: boolean;
  isSuperAdminMission: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  position: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MissionPermission {
  id: string;
  missionId: string;
  userId: string;
  grantedBy: string;
  grantedAt: Date;
  user: User;
}

export type OrganizationMember = {
  id: string;
  organizationId: string;
  role: "admin" | "member" | "owner";
  createdAt: Date;
  userId: string;
  user: {
    email: string;
    name: string;
    image?: string;
  };
};

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  organizationId?: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
