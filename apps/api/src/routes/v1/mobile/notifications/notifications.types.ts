export type NotificationType = "mission" | "payment" | "system" | "support" | "comment";

export type NotificationRow = {
  id: string;
  userId: string;
  type: NotificationType;

  title: string;
  body: string | null;
  data: any | null;

  entityType: string | null;
  entityId: string | null;

  readAt: string | null;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: any | null;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsListData = {
  items: NotificationItem[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  unreadCount: number;
};

export type NotificationDetailsData = {
  notification: NotificationItem;
};
