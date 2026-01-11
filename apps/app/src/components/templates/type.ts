import { JsonValue } from "@prisma/client/runtime/library";

export interface Template {
  id: string;
  name: string;
  questions: JsonValue | null;
  type: string | null;
  internal: boolean;
  status: string;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}
