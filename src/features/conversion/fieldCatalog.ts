/**
 * Field catalog + auto-mapping for conversion pairs.
 */
import type {
  ConversionPairId,
  CustomFieldDefLite,
  CustomFieldMapping,
  FieldGroupDefinition,
  FieldGroupId,
  ModuleName,
} from './types';
import type { Lead } from '@/types/leads';

const GROUP_META: Record<FieldGroupId, { label: string; description?: string; defaultSelected: boolean }> = {
  standard: { label: 'Standard Information', description: 'Name, status, source, assignee', defaultSelected: true },
  contact: { label: 'Contact Information', description: 'Mobile, email, alternate contact', defaultSelected: true },
  company: { label: 'Company Details', description: 'Company, GST, PAN, industry, website', defaultSelected: true },
  address: { label: 'Address', description: 'Address, city, state, pincode, country', defaultSelected: true },
  project_requirements: { label: 'Project Requirements', description: 'Project title, type, dimensions', defaultSelected: true },
  technical: { label: 'Technical Details', description: 'Structure, roof, wall, crane, mezzanine', defaultSelected: true },
  site: { label: 'Site Details', description: 'Site address and location notes', defaultSelected: true },
  notes: { label: 'Notes', description: 'Remarks and customer notes', defaultSelected: true },
  comments: { label: 'Comments', description: 'Discussion comments on the record', defaultSelected: true },
  activities: { label: 'Activities', description: 'Activity history entries', defaultSelected: true },
  timeline: { label: 'Timeline', description: 'Status and audit trail', defaultSelected: true },
  documents: { label: 'Documents', description: 'Linked commercial documents', defaultSelected: true },
  attachments: { label: 'Attachments', description: 'Uploaded files', defaultSelected: true },
  followups: { label: 'Follow-ups', description: 'Follow-up dates and reminders', defaultSelected: true },
  tasks: { label: 'Tasks', description: 'Linked tasks', defaultSelected: false },
  tags: { label: 'Tags', description: 'Labels and tags', defaultSelected: true },
  custom_fields: { label: 'Custom Fields', description: 'Dynamic module fields', defaultSelected: true },
};

/** Which groups apply to each conversion pair */
export const PAIR_GROUPS: Record<ConversionPairId, FieldGroupId[]> = {
  'lead-to-customer': [
    'standard', 'contact', 'company', 'address',
    'project_requirements', 'technical', 'site',
    'notes', 'comments', 'activities', 'timeline',
    'documents', 'attachments', 'followups', 'tags', 'custom_fields',
  ],
  'lead-to-project': [
    'standard', 'contact', 'company', 'address',
    'project_requirements', 'technical', 'site',
    'notes', 'attachments', 'custom_fields',
  ],
  'customer-to-project': [
    'standard', 'contact', 'company', 'address',
    'site', 'notes', 'attachments', 'documents', 'custom_fields',
  ],
  'project-to-quotation': [
    'standard', 'company', 'address', 'technical', 'notes', 'attachments', 'custom_fields',
  ],
  'quotation-to-purchase': [
    'standard', 'company', 'notes', 'attachments', 'documents', 'custom_fields',
  ],
  'purchase-to-inventory': ['standard', 'notes', 'attachments', 'custom_fields'],
  'inventory-to-production': ['standard', 'technical', 'notes', 'attachments', 'custom_fields'],
  'production-to-dispatch': ['standard', 'site', 'notes', 'attachments', 'custom_fields'],
  'dispatch-to-site': ['standard', 'site', 'notes', 'attachments', 'custom_fields'],
  'site-to-warranty': ['standard', 'notes', 'attachments', 'documents', 'custom_fields'],
  'estimate-to-proposal': ['standard', 'notes', 'attachments', 'custom_fields'],
  'proposal-to-quotation': ['standard', 'notes', 'attachments', 'custom_fields'],
};

export function pairModules(pairId: ConversionPairId): { source: ModuleName; destination: ModuleName } {
  const [source, , destination] = pairId.split('-') as [ModuleName, string, ModuleName];
  // handle multi-word like bank-account isn't in pairs; destination for lead-to-customer is customer
  const map: Record<ConversionPairId, { source: ModuleName; destination: ModuleName }> = {
    'lead-to-customer': { source: 'lead', destination: 'customer' },
    'lead-to-project': { source: 'lead', destination: 'project' },
    'customer-to-project': { source: 'customer', destination: 'project' },
    'project-to-quotation': { source: 'project', destination: 'quotation' },
    'quotation-to-purchase': { source: 'quotation', destination: 'purchase' },
    'purchase-to-inventory': { source: 'purchase', destination: 'inventory' },
    'inventory-to-production': { source: 'inventory', destination: 'production' },
    'production-to-dispatch': { source: 'production', destination: 'dispatch' },
    'dispatch-to-site': { source: 'dispatch', destination: 'site' },
    'site-to-warranty': { source: 'site', destination: 'warranty' },
    'estimate-to-proposal': { source: 'estimate', destination: 'proposal' },
    'proposal-to-quotation': { source: 'proposal', destination: 'quotation' },
  };
  return map[pairId] || { source, destination };
}

export function buildLeadGroupCounts(lead: Lead, commentCount = 0, attachmentCount = 0, activityCount = 0): Partial<Record<FieldGroupId, number>> {
  const cf = lead.customFields && typeof lead.customFields === 'object'
    ? Object.keys(lead.customFields).filter((k) => lead.customFields![k] !== undefined && lead.customFields![k] !== null && lead.customFields![k] !== '')
    : [];

  const hasProject = !!(lead.projectTitle || lead.projectType || lead.width || lead.length || lead.height);
  const hasTechnical = !!(lead.structureType || lead.roofType || lead.wallType || lead.craneRequired || lead.mezzanine);
  const hasSite = !!(lead.siteAddress || lead.addressLine1);

  return {
    standard: 5,
    contact: [lead.mobile, lead.email, lead.alternateMobile].filter(Boolean).length || 1,
    company: [lead.companyName, lead.gstNumber, lead.panNumber, lead.industry, lead.website].filter(Boolean).length || 1,
    address: [lead.addressLine1, lead.city, lead.state, lead.pincode].filter(Boolean).length || 1,
    project_requirements: hasProject ? 6 : 0,
    technical: hasTechnical ? 5 : 0,
    site: hasSite ? 2 : 0,
    notes: lead.remarks || lead.customerNotes || lead.specialRequirement ? 1 : 0,
    comments: commentCount,
    activities: activityCount,
    timeline: activityCount > 0 ? activityCount : 1,
    documents: 0,
    attachments: (lead.attachments?.length || 0) + attachmentCount,
    followups: lead.nextFollowUpDate || lead.lastFollowUp ? 1 : 0,
    tasks: 0,
    tags: lead.tags?.length || 0,
    custom_fields: cf.length,
  };
}

export function buildFieldGroups(
  pairId: ConversionPairId,
  counts: Partial<Record<FieldGroupId, number>>,
): FieldGroupDefinition[] {
  return PAIR_GROUPS[pairId].map((id) => {
    const meta = GROUP_META[id];
    const count = counts[id] ?? 0;
    return {
      id,
      label: id === 'custom_fields' && count > 0 ? `${meta.label} (${count})` : meta.label,
      description: meta.description,
      count,
      defaultSelected: meta.defaultSelected && count > 0,
      enabled: count > 0 || id === 'timeline' || id === 'activities',
    };
  });
}

/** Auto-map custom fields by key or case-insensitive label */
export function mapCustomFields(
  sourceDefs: CustomFieldDefLite[],
  sourceValues: Record<string, string | number | boolean> | undefined | null,
  destinationDefs: CustomFieldDefLite[],
): CustomFieldMapping[] {
  const values = sourceValues || {};
  const destByKey = new Map(destinationDefs.map((d) => [d.key.toLowerCase(), d]));
  const destByLabel = new Map(destinationDefs.map((d) => [d.label.trim().toLowerCase(), d]));

  const keys = new Set<string>([
    ...Object.keys(values),
    ...sourceDefs.map((d) => d.key),
  ]);

  return [...keys]
    .filter((key) => values[key] !== undefined && values[key] !== null && values[key] !== '')
    .map((key) => {
      const def = sourceDefs.find((d) => d.key === key);
      const label = def?.label || key;
      const byKey = destByKey.get(key.toLowerCase());
      const byLabel = destByLabel.get(label.trim().toLowerCase());
      const target = byKey || byLabel;

      if (target) {
        return {
          sourceKey: key,
          sourceLabel: label,
          sourceType: def?.type || 'text',
          sourceValue: values[key] ?? null,
          action: 'auto' as const,
          targetKey: target.key,
          autoMapped: true,
        };
      }

      return {
        sourceKey: key,
        sourceLabel: label,
        sourceType: def?.type || 'text',
        sourceValue: values[key] ?? null,
        action: 'create' as const,
        createKey: key,
        autoMapped: false,
      };
    });
}

/** Build customer payload from lead + selected groups + mappings */
export function buildCustomerFromLead(
  lead: Lead,
  selectedGroups: FieldGroupId[],
  mappings: CustomFieldMapping[],
  overrides?: Record<string, unknown>,
): Record<string, unknown> {
  const has = (g: FieldGroupId) => selectedGroups.includes(g);
  const mapSource = (s: string) =>
    ({ ColdCall: 'Cold Call', SocialMedia: 'Social Media', TradeShow: 'Trade Show' }[s] || s);

  const payload: Record<string, unknown> = {
    leadId: lead.id,
  };

  if (has('standard') || has('contact')) {
    payload.customerName = lead.customerName;
    payload.source = mapSource(lead.source || 'Website');
    payload.assignedEmployeeId = lead.assignedToId;
    payload.status = 'Active';
  }

  if (has('contact')) {
    payload.mobile = lead.mobile;
    payload.alternateMobile = lead.alternateMobile;
    payload.email = lead.email;
  }

  if (has('company') || has('standard')) {
    payload.companyName = lead.companyName;
    payload.gstNumber = lead.gstNumber;
    payload.panNumber = lead.panNumber;
    payload.industry = lead.industry;
    payload.businessType = lead.businessType;
    payload.website = lead.website;
  }

  if (has('address') || has('site')) {
    payload.address = [lead.addressLine1, lead.addressLine2, lead.area].filter(Boolean).join(', ') || lead.siteAddress;
    payload.city = lead.city;
    payload.state = lead.state;
    payload.pincode = lead.pincode;
    payload.country = lead.country || 'India';
  }

  if (has('notes')) {
    const parts = [lead.remarks, lead.customerNotes, lead.specialRequirement].filter(Boolean);
    if (has('project_requirements') && lead.projectTitle) {
      parts.push(`Project: ${lead.projectTitle}`);
    }
    if (has('technical')) {
      const tech = [
        lead.structureType && `Structure: ${lead.structureType}`,
        lead.roofType && `Roof: ${lead.roofType}`,
        lead.wallType && `Wall: ${lead.wallType}`,
      ].filter(Boolean);
      if (tech.length) parts.push(tech.join(' · '));
    }
    if (has('site') && lead.siteAddress) {
      parts.push(`Site: ${lead.siteAddress}`);
    }
    payload.notes = parts.join('\n\n');
  }

  // Preserve project / technical / site inside notes carry-forward blob for audit + customer reference
  if (has('project_requirements') || has('technical') || has('site')) {
    payload.conversionContext = {
      projectTitle: has('project_requirements') ? lead.projectTitle : undefined,
      projectType: has('project_requirements') ? lead.projectType : undefined,
      structureType: has('technical') ? lead.structureType : undefined,
      width: has('project_requirements') ? lead.width : undefined,
      length: has('project_requirements') ? lead.length : undefined,
      height: has('project_requirements') ? lead.height : undefined,
      siteAddress: has('site') ? lead.siteAddress : undefined,
      roofType: has('technical') ? lead.roofType : undefined,
      wallType: has('technical') ? lead.wallType : undefined,
    };
  }

  if (has('tags') && lead.tags?.length) {
    payload.tags = lead.tags;
  }

  if (has('attachments') && lead.attachments?.length) {
    payload.attachments = lead.attachments;
  }

  if (has('custom_fields')) {
    const customFields: Record<string, string | number | boolean> = {};
    for (const m of mappings) {
      if (m.action === 'ignore') continue;
      if (m.sourceValue === null || m.sourceValue === undefined || m.sourceValue === '') continue;
      if (m.action === 'auto' || m.action === 'map') {
        if (m.targetKey) customFields[m.targetKey] = m.sourceValue as string | number | boolean;
      } else if (m.action === 'create') {
        customFields[m.createKey || m.sourceKey] = m.sourceValue as string | number | boolean;
      }
    }
    if (Object.keys(customFields).length) {
      payload.customFields = customFields;
    }
  }

  // Transfer flags for backend (comments / timeline cloning)
  payload.transferOptions = {
    standard: has('standard'),
    contact: has('contact'),
    company: has('company'),
    address: has('address') || has('site'),
    notes: has('notes'),
    comments: has('comments'),
    activities: has('activities'),
    timeline: has('timeline'),
    attachments: has('attachments'),
    documents: has('documents'),
    followups: has('followups'),
    customFields: has('custom_fields'),
    tags: has('tags'),
  };

  if (overrides) {
    Object.assign(payload, overrides);
  }

  // Ensure required fields always present for API
  if (!payload.customerName) payload.customerName = lead.customerName;
  if (!payload.companyName) payload.companyName = lead.companyName || lead.customerName;
  if (!payload.mobile) payload.mobile = lead.mobile;
  if (!payload.source) payload.source = mapSource(lead.source || 'Website');
  if (!payload.address) {
    payload.address = [lead.addressLine1, lead.addressLine2, lead.area].filter(Boolean).join(', ') || lead.city || '—';
  }
  if (!payload.city) payload.city = lead.city || '—';
  if (!payload.state) payload.state = lead.state || '—';

  return payload;
}

/** Build project create draft from lead (form prefill only — persisted via Project create API) */
export function buildProjectFromLead(
  lead: Lead,
  selectedGroups: FieldGroupId[],
  mappings: CustomFieldMapping[],
): Record<string, unknown> {
  const has = (g: FieldGroupId) => selectedGroups.includes(g);

  const draft: Record<string, unknown> = {
    leadId: lead.id,
    customerId: lead.customerId,
  };

  if (has('project_requirements') || has('standard')) {
    draft.projectName = lead.projectTitle || `${lead.customerName || lead.companyName} Project`;
    draft.projectType = lead.projectType || 'Industrial Shed';
    draft.width = lead.width;
    draft.length = lead.length;
    draft.height = lead.height;
    draft.baySpacing = lead.baySpacing;
  }

  if (has('technical')) {
    draft.structureType = lead.structureType || 'PEB Building';
    draft.roofType = lead.roofType || 'Standing Seam';
    draft.wallType = lead.wallType || 'Single Skin';
    draft.craneSystem = lead.craneRequired
      ? (lead.craneCapacity ? `${lead.craneCapacity} tons` : 'Single Girder')
      : 'None';
    draft.mezzanine = lead.mezzanine || false;
    draft.insulation = lead.insulationRequired || false;
  }

  if (has('site') || has('address')) {
    draft.location = lead.siteAddress || lead.addressLine1 || lead.addressLine2 || '';
    draft.city = lead.city || '';
    draft.state = lead.state || '';
    draft.pincode = lead.pincode || '';
  }

  if (has('notes')) {
    draft.notes = [lead.remarks, lead.customerNotes, lead.specialRequirement].filter(Boolean).join('\n\n');
  }

  if (has('custom_fields')) {
    const customFields: Record<string, string | number | boolean> = {};
    for (const m of mappings) {
      if (m.action === 'ignore') continue;
      if (m.sourceValue === null || m.sourceValue === undefined || m.sourceValue === '') continue;
      if (m.action === 'auto' || m.action === 'map') {
        if (m.targetKey) customFields[m.targetKey] = m.sourceValue as string | number | boolean;
      } else if (m.action === 'create') {
        customFields[m.createKey || m.sourceKey] = m.sourceValue as string | number | boolean;
      }
    }
    if (Object.keys(customFields).length) draft.customFields = customFields;
  }

  draft.transferOptions = {
    notes: has('notes'),
    attachments: has('attachments'),
    customFields: has('custom_fields'),
    contact: has('contact'),
    company: has('company'),
  };

  return draft;
}
