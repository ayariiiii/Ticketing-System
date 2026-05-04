export interface AppNotification {
  id:        string;
  message:   string;
  ticketId?: string;
  read:      boolean;
  createdAt: string;
}

const KEYS = {
  admin: "notifs_admin",
  user:  "notifs_user",
} as const;

type Role = "admin" | "user";

export const NotificationController = {
  getAll(role: Role): AppNotification[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS[role]) || "[]");
    } catch { return []; }
  },

  add(role: Role, notification: Omit<AppNotification, "id" | "read" | "createdAt">): void {
    const all = this.getAll(role);
    all.unshift({
      ...notification,
      id:        crypto.randomUUID(),
      read:      false,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(KEYS[role], JSON.stringify(all));
  },

  markAllRead(role: Role): void {
    const all = this.getAll(role).map((n) => ({ ...n, read: true }));
    localStorage.setItem(KEYS[role], JSON.stringify(all));
  },

  unreadCount(role: Role): number {
    return this.getAll(role).filter((n) => !n.read).length;
  },
};