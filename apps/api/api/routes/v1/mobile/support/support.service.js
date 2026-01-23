"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicket = createTicket;
exports.listMyTickets = listMyTickets;
exports.getMyTicketDetails = getMyTicketDetails;
exports.postMessageOnMyTicket = postMessageOnMyTicket;
const crypto = __importStar(require("node:crypto"));
const repo = __importStar(require("./support.repo"));
function forbidden(reason) {
    // en prod: message neutre, en dev: message explicite
    const msg = process.env.NODE_ENV === "production"
        ? "Accès interdit"
        : `Accès interdit (${reason})`;
    return { ok: false, status: 403, message: msg };
}
async function createTicket(userId, input) {
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
    if (!ticket)
        return { ok: false, status: 500, message: "Création du ticket impossible" };
    // Option: créer aussi un premier message dans support_message pour avoir un thread cohérent
    await repo.insertTicketMessage({
        id: crypto.randomUUID(),
        ticketId,
        userId,
        content: input.message,
    });
    return { ok: true, data: { ticket } };
}
async function listMyTickets(userId, q) {
    const { items, total } = await repo.listTickets(userId, q);
    const pageCount = Math.max(1, Math.ceil(total / q.pageSize));
    return {
        ok: true,
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
async function getMyTicketDetails(userId, ticketId, query) {
    const ticket = await repo.getTicketById(ticketId);
    if (!ticket)
        return { ok: false, status: 404, message: "Ticket introuvable" };
    if (ticket.userId !== userId)
        return forbidden("TICKET_NOT_OWNED");
    if (!query.includeMessages) {
        return { ok: true, data: { ticket } };
    }
    const { items, total } = await repo.listTicketMessages(ticketId, query.messagesPage, query.messagesPageSize);
    const pageCount = Math.max(1, Math.ceil(total / query.messagesPageSize));
    return {
        ok: true,
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
async function postMessageOnMyTicket(userId, ticketId, input) {
    const ticket = await repo.getTicketById(ticketId);
    if (!ticket)
        return { ok: false, status: 404, message: "Ticket introuvable" };
    if (ticket.userId !== userId)
        return forbidden("TICKET_NOT_OWNED");
    // Option business rule: ne pas accepter de message si fermé
    if (ticket.status === "closed" || ticket.status === "resolved") {
        return { ok: false, status: 400, message: "Ticket fermé, impossible d'ajouter un message" };
    }
    const msg = await repo.insertTicketMessage({
        id: crypto.randomUUID(),
        ticketId,
        userId,
        content: input.content,
    });
    if (!msg)
        return { ok: false, status: 500, message: "Envoi du message impossible" };
    return { ok: true, data: { message: msg } };
}
