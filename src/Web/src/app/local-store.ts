export function readLocalList<T>(key: string): T[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]') as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalList<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

export function upsertLocal<T extends { id?: string }>(key: string, item: T, match: (existing: T) => boolean): T {
  const items = readLocalList<T>(key);
  const index = items.findIndex(match);
  if (index >= 0) items[index] = { ...items[index], ...item };
  else items.unshift(item);
  writeLocalList(key, items);
  return item;
}
