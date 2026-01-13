import * as crypto from "node:crypto";
import type {
  CreateTicketInput,
  CreateTicketMessageInput,
  ListTicketsQuery,
  TicketDetailsQuery,
} from "./support.schemas";
import type { ServiceResult } from "../mobile.types";
import * as repo from "./support.repo";

function forbidden(reason: string) {
  // en prod: message neutre, en dev: message explicite
  const msg =
    process.env.NODE_ENV === "production"
      ? "Accès interdit"
      : `Accès interdit (${reason})`;
  return { ok: false as const, status: 403, message: msg };
}

export async function createTicket(
  userId: string,
  input: CreateTicketInput,
): Promise<ServiceResult<{ ticket: any }>> {
  const ticketId = crypto.randomUUID();

  // status par défaut = open
  const ticket = await repo.insertTicket({
    id: ticketId,
    userId,
    subject: input.subject,
    message: input.message, // message initial conservé sur support
    category: input.category,
    priority: input.priority,
    status: "open",
  });

  if (!ticket) return { ok: false as const, status: 500, message: "Création du ticket impossible" };

  // Option: créer aussi un premier message dans support_message pour avoir un thread cohérent
  await repo.insertTicketMessage({
    id: crypto.randomUUID(),
    ticketId,
    userId,
    content: input.message,
  });

  return { ok: true as const, data: { ticket } };
}

export async function listMyTickets(
  userId: string,
  q: ListTicketsQuery,
): Promise<ServiceResult<{ items: any[]; meta: any }>> {
  const { items, total } = await repo.listTickets(userId, q);

  const pageCount = Math.max(1, Math.ceil(total / q.pageSize));
  return {
    ok: true as const,
    data: {
      items,
      meta: {
        total,
        page: q.page,
        pageSize: q.pageSize,
        pageCount,
        hasNextPage: q.page < pageCount,
        hasPrevPage: q.page > 1,
      },
    },
  };
}

export async function getMyTicketDetails(
  userId: string,
  ticketId: string,
  query: TicketDetailsQuery,
): Promise<ServiceResult<{ ticket: any; messages?: any; messagesMeta?: any }>> {
  const ticket = await repo.getTicketById(ticketId);
  if (!ticket) return { ok: false as const, status: 404, message: "Ticket introuvable" };

  if (ticket.userId !== userId) return forbidden("TICKET_NOT_OWNED");

  if (!query.includeMessages) {
    return { ok: true as const, data: { ticket } };
  }

  const { items, total } = await repo.listTicketMessages(
    ticketId,
    query.messagesPage,
    query.messagesPageSize,
  );

  const pageCount = Math.max(1, Math.ceil(total / query.messagesPageSize));

  return {
    ok: true as const,
    data: {
      ticket,
      messages: items,
      messagesMeta: {
        total,
        page: query.messagesPage,
        pageSize: query.messagesPageSize,
        pageCount,
        hasNextPage: query.messagesPage < pageCount,
        hasPrevPage: query.messagesPage > 1,
      },
    },
  };
}

export async function postMessageOnMyTicket(
  userId: string,
  ticketId: string,
  input: CreateTicketMessageInput,
): Promise<ServiceResult<{ message: any }>> {
  const ticket = await repo.getTicketById(ticketId);
  if (!ticket) return { ok: false as const, status: 404, message: "Ticket introuvable" };
  if (ticket.userId !== userId) return forbidden("TICKET_NOT_OWNED");

  // Option business rule: ne pas accepter de message si fermé
  if (ticket.status === "closed" || ticket.status === "resolved") {
    return { ok: false as const, status: 400, message: "Ticket fermé, impossible d'ajouter un message" };
  }

  const msg = await repo.insertTicketMessage({
    id: crypto.randomUUID(),
    ticketId,
    userId,
    content: input.content,
  });

  if (!msg) return { ok: false as const, status: 500, message: "Envoi du message impossible" };

  return { ok: true as const, data: { message: msg } };
}
