export function getHoyISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMananaISO(date: Date = new Date()): string {
  const mañana = new Date(date);
  mañana.setDate(mañana.getDate() + 1);
  return getHoyISO(mañana);
}
