export type UserLite = {
  id: string;
  name: string;
  image?: string | null;
};

export type CommentLite = {
  id: string;
  content: string;
  status: string;
  questionKey?: string | null;
  createdAt: string | Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  resolvedBy?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
  resolvedAt?: string | Date | null;
  replies?: CommentLite[];
};

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};
