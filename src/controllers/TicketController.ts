import { type Ticket, type TicketNote } from "../types";

const KEY = "tickets";

export const TicketController = {
  getAll(): Ticket[] {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  },

  getById(id: string): Ticket | undefined {
    return this.getAll().find((t) => t.id === id);
  },

  create(ticket: Ticket): void {
    const tickets = this.getAll();
    tickets.unshift(ticket); // newest first
    localStorage.setItem(KEY, JSON.stringify(tickets));
  },

  update(ticket: Ticket): void {
    const tickets = this.getAll().map((t) =>
      t.id === ticket.id ? ticket : t
    );
    localStorage.setItem(KEY, JSON.stringify(tickets));
  },

  delete(id: string): void {
    const tickets = this.getAll().filter((t) => t.id !== id);
    localStorage.setItem(KEY, JSON.stringify(tickets));
  },

  addNote(ticketId: string, note: TicketNote): void {
    const ticket = this.getById(ticketId);
    if (!ticket) return;
    ticket.notes = [note, ...ticket.notes];
    this.update(ticket);
  },

  // Generates the next ticket ID based on existing tickets
  nextId(): string {
    const tickets = this.getAll();
    if (tickets.length === 0) return "TKT-001";
    const nums = tickets
      .map((t) => parseInt(t.id.replace("TKT-", ""), 10))
      .filter((n) => !isNaN(n));
    const max = Math.max(...nums);
    return `TKT-${String(max + 1).padStart(3, "0")}`;
  },
};