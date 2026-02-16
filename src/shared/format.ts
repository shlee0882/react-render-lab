const fnIds = new WeakMap<Function, number>();
let fnSeq = 0;

export function getFnId(fn: Function): number {
  const existing = fnIds.get(fn);
  if (existing) return existing;
  const next = ++fnSeq;
  fnIds.set(fn, next);
  return next;
}

export function formatValue(v: unknown): string {
  if (typeof v === "function") return `fn#${getFnId(v as Function)}`;
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean" || v == null) return String(v);

  try {
    return JSON.stringify(v);
  } catch {
    return Object.prototype.toString.call(v);
  }
}

export function guessKind(v: unknown): "value" | "function" | "object" {
  if (typeof v === "function") return "function";
  if (typeof v === "object" && v !== null) return "object";
  return "value";
}
