export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: any }
  | ClassValue[];

export function cn(...classes: ClassValue[]): string {
  const result: string[] = [];
  for (const c of classes) {
    if (!c) continue;
    if (typeof c === 'string' || typeof c === 'number') {
      result.push(String(c));
    } else if (Array.isArray(c)) {
      const inner = cn(...c);
      if (inner) result.push(inner);
    } else if (typeof c === 'object') {
      for (const [key, val] of Object.entries(c)) {
        if (val) result.push(key);
      }
    }
  }
  return result.join(' ');
}
