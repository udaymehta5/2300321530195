// Client-side read/unread state via localStorage
const KEY = "campus_read_ids";

export function getReadIds() {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
  } catch { return new Set(); }
}

export function markAsRead(id) {
  const ids = getReadIds();
  ids.add(id);
  localStorage.setItem(KEY, JSON.stringify([...ids]));
}

export function markAllAsRead(ids) {
  const existing = getReadIds();
  ids.forEach(id => existing.add(id));
  localStorage.setItem(KEY, JSON.stringify([...existing]));
}