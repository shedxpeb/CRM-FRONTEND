/**
 * Conversion profiles — system defaults + user preferences in localStorage.
 * localStorage stores ONLY profile preference UI state — never business entity data.
 */
import type { ConversionPairId, ConversionProfile, FieldGroupId } from './types';
import { PAIR_GROUPS } from './fieldCatalog';

const STORAGE_KEY = 'peb.conversion.profiles.v1';

function systemProfiles(pairId: ConversionPairId): ConversionProfile[] {
  const all = PAIR_GROUPS[pairId] || [];
  const essentials: FieldGroupId[] = all.filter((g) =>
    ['standard', 'contact', 'company', 'address', 'notes', 'custom_fields'].includes(g),
  );
  const sales: FieldGroupId[] = all.filter((g) =>
    ['standard', 'contact', 'company', 'address', 'notes', 'followups', 'tags', 'custom_fields', 'documents', 'attachments'].includes(g),
  );
  const full = all.filter((g) => g !== 'tasks');

  return [
    {
      id: `${pairId}:default`,
      name: 'Default Conversion',
      description: 'Standard, contact, company, address, notes, custom fields',
      pairId,
      selectedGroups: essentials,
      isSystem: true,
    },
    {
      id: `${pairId}:sales`,
      name: 'Sales Conversion',
      description: 'CRM-focused transfer with docs, follow-ups and tags',
      pairId,
      selectedGroups: sales,
      isSystem: true,
    },
    {
      id: `${pairId}:quick`,
      name: 'Quick Conversion',
      description: 'Minimal — contact + company only',
      pairId,
      selectedGroups: all.filter((g) => ['standard', 'contact', 'company', 'address'].includes(g)),
      isSystem: true,
    },
    {
      id: `${pairId}:full`,
      name: 'Full Conversion',
      description: 'Transfer everything available',
      pairId,
      selectedGroups: full,
      isSystem: true,
    },
  ];
}

export function getConversionProfiles(pairId: ConversionPairId): ConversionProfile[] {
  const system = systemProfiles(pairId);
  if (typeof window === 'undefined') return system;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return system;
    const parsed = JSON.parse(raw) as ConversionProfile[];
    const custom = parsed.filter((p) => p.pairId === pairId && !p.isSystem);
    return [...system, ...custom];
  } catch {
    return system;
  }
}

export function saveUserConversionProfile(profile: ConversionProfile): void {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem(STORAGE_KEY);
  const list: ConversionProfile[] = raw ? JSON.parse(raw) : [];
  const next = list.filter((p) => p.id !== profile.id);
  next.push({ ...profile, isSystem: false });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getLastSelectedProfileId(pairId: ConversionPairId): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`peb.conversion.lastProfile.${pairId}`);
  } catch {
    return null;
  }
}

export function setLastSelectedProfileId(pairId: ConversionPairId, profileId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`peb.conversion.lastProfile.${pairId}`, profileId);
  } catch {
    /* ignore */
  }
}
