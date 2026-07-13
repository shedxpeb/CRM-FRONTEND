/**
 * Centralized document conversion snapshot storage.
 * Conversion = snapshot: source remains editable; converted record is independent.
 */

export const DOCUMENT_CONVERSION_KEYS = {
  estimate: 'convertFromEstimate',
  proposal: 'convertFromProposal',
  quotation: 'convertFromQuotation',
} as const;

export type DocumentConversionKey =
  (typeof DOCUMENT_CONVERSION_KEYS)[keyof typeof DOCUMENT_CONVERSION_KEYS];

export function storeConversionSnapshot<T>(key: DocumentConversionKey, data: T): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key, JSON.stringify(data));
}

export function peekConversionSnapshot<T>(key: DocumentConversionKey): T | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function consumeConversionSnapshot<T>(key: DocumentConversionKey): T | null {
  const data = peekConversionSnapshot<T>(key);
  if (data !== null) {
    sessionStorage.removeItem(key);
  }
  return data;
}

export function clearConversionSnapshot(key: DocumentConversionKey): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(key);
}
