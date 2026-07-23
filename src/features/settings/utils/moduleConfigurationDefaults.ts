/**
 * Settings-owned default configuration per module.
 * Consumed by settingsApi and module configuration hooks as schema defaults.
 */

export const LEAD_MODULE_DEFAULTS = {
  statuses: [
    'New',
    'Contacted',
    'DesignPending',
    'BOQPending',
    'EstimateSent',
    'ProposalSent',
    'Negotiation',
    'Approved',
    'Rejected',
    'Converted',
  ],
  priorities: ['Low', 'Medium', 'High', 'Urgent'],
  sources: [
    'Website',
    'Referral',
    'ColdCall',
    'Email',
    'SocialMedia',
    'TradeShow',
    'Advertisement',
    'Other',
  ],
  projectTypes: [
    'Factory',
    'Warehouse',
    'IndustrialShed',
    'Commercial',
    'Residential',
    'ColdStorage',
    'Other',
  ],
  structureTypes: ['PEB', 'SteelStructure', 'Hybrid', 'Other'],
  roofTypes: ['MetalSheet', 'DeckSheet', 'SandwichPanel', 'Other'],
  wallTypes: ['MetalSheet', 'BrickWall', 'SandwichPanel', 'Other'],
  materialPreferences: ['Standard', 'Premium', 'Economy'],
  customFields: [
    {
      key: 'budgetRange',
      label: 'Budget Range',
      type: 'select' as const,
      options: ['Under ₹10L', '₹10L – ₹50L', 'Above ₹50L'],
    },
  ],
};

export const CUSTOMER_MODULE_DEFAULTS = {
  statuses: ['Active', 'Inactive', 'Prospect', 'Converted', 'Churned'],
  customerTypes: ['Pvt Ltd', 'LLP', 'Partnership', 'Proprietorship', 'Trust', 'Government', 'Other'],
  territories: ['North', 'South', 'East', 'West', 'Central', 'International'],
  sources: [
    'Website',
    'Referral',
    'Cold Call',
    'Email',
    'Social Media',
    'Trade Show',
    'Advertisement',
    'Other',
  ],
  industries: [
    'Manufacturing',
    'Construction',
    'Infrastructure',
    'Logistics',
    'Agriculture',
    'Commercial',
    'Healthcare',
    'Education',
    'Retail',
    'Other',
  ],
  customFields: [
    {
      key: 'accountTier',
      label: 'Account Tier',
      type: 'select' as const,
      options: ['Standard', 'Premium', 'Enterprise'],
    },
    { key: 'creditLimit', label: 'Credit Limit (₹L)', type: 'number' as const },
  ],
};

export const PROJECT_MODULE_DEFAULTS = {
  statuses: [
    'Lead',
    'Estimate',
    'Proposal',
    'Quotation',
    'Approved',
    'Design',
    'BOQ',
    'Procurement',
    'Fabrication',
    'Dispatch',
    'Installation',
    'Completion',
    'After Sales',
    'On Hold',
    'Cancelled',
  ],
  stages: ['Design', 'BOQ', 'Procurement', 'Fabrication', 'Dispatch', 'Installation', 'Handover'],
  priorities: ['Low', 'Medium', 'High', 'Urgent'],
  healthIndicators: ['Healthy', 'At Risk', 'Critical'],
  projectTypes: [
    'Industrial Shed',
    'Warehouse',
    'Factory',
    'Commercial Building',
    'Showroom',
    'School',
    'Hospital',
    'Sports Complex',
    'Airport Terminal',
    'Other',
  ],
  structureTypes: ['PEB Building', 'Conventional Steel', 'Hybrid', 'Pre-Engineered', 'Cold Storage'],
  roofTypes: ['Standing Seam', 'Ribbed', 'Corrugated', 'Insulated Panel', 'Skylight'],
  wallTypes: ['Sandwich Panel', 'Single Skin', 'Brick Wall', 'Curtain Wall', 'Other'],
  craneSystems: ['Single Girder', 'Double Girder', 'Underhung', 'Top Running', 'None'],
  customFields: [
    { key: 'siteAccess', label: 'Site Access Notes', type: 'textarea' as const },
    {
      key: 'windZone',
      label: 'Wind Zone',
      type: 'select' as const,
      options: ['Zone I', 'Zone II', 'Zone III', 'Zone IV', 'Zone V'],
    },
    { key: 'seismicZone', label: 'Seismic Zone', type: 'text' as const },
  ],
};

export const ITEM_MODULE_DEFAULTS = {
  brands: ['Tata Steel', 'JSW', 'SAIL', 'AMNS', 'Other'],
  units: ['Kg', 'Ton', 'Meter', 'SqMeter', 'CuMeter', 'Nos', 'Box', 'Bundle', 'Set', 'Liter', 'Bag', 'Roll'],
  itemTypes: ['Raw Material', 'Finished Good', 'Consumable', 'Service', 'Asset'],
  taxTypes: ['CGST', 'SGST', 'IGST', 'CESS'],
  customFields: [
    {
      key: 'coatingType',
      label: 'Coating Type',
      type: 'select' as const,
      options: ['Galvanized', 'Painted', 'Bare'],
    },
    { key: 'fireRating', label: 'Fire Rating', type: 'text' as const },
  ],
};

export const INVENTORY_MODULE_DEFAULTS = {
  warehouses: ['Main Warehouse', 'Fabrication Yard', 'Site Store', 'Transit'],
  stockStatuses: ['In Stock', 'Low Stock', 'Out of Stock', 'Critical', 'On Order', 'Discontinued'],
  movementTypes: [
    'Stock In',
    'Stock Out',
    'Transfer',
    'Adjustment',
    'Reservation',
    'Release',
    'Consumption',
  ],
  units: ['Kg', 'Ton', 'Meter', 'SqMeter', 'CuMeter', 'Nos', 'Box', 'Bundle', 'Set', 'Liter', 'Bag', 'Roll'],
  customFields: [
    {
      key: 'storageCondition',
      label: 'Storage Condition',
      type: 'select' as const,
      options: ['Indoor', 'Outdoor', 'Climate Controlled'],
    },
    { key: 'handlingNotes', label: 'Handling Notes', type: 'textarea' as const },
  ],
};

export const DOCUMENT_MODULE_DEFAULTS = {
  estimateTypes: ['Standard', 'Detailed', 'Budgetary'],
  proposalTypes: ['Technical', 'Commercial', 'Combined'],
  quotationTypes: ['Standard', 'Revise', 'Final'],
  documentStatuses: [
    'Draft',
    'Sent',
    'Viewed',
    'Accepted',
    'Rejected',
    'Expired',
    'Converted',
    'Cancelled',
  ],
  approvalStatuses: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
  customFields: [
    { key: 'deliveryLocation', label: 'Delivery Location', type: 'text' as const },
    { key: 'specialTerms', label: 'Special Terms', type: 'textarea' as const },
  ],
};

export const FINANCE_MODULE_DEFAULTS = {
  expenseCategories: [
    'Material Purchase',
    'Labour Cost',
    'Transport',
    'Machinery',
    'Fabrication',
    'Installation',
    'Site Expenses',
    'Administrative Expenses',
    'Miscellaneous Expenses',
  ],
  paymentMethods: [
    'Bank Transfer',
    'UPI',
    'Cash',
    'Cheque',
    'RTGS',
    'NEFT',
    'IMPS',
    'Credit Card',
    'Debit Card',
  ],
  vendorTypes: ['Supplier', 'Contractor', 'Service Provider', 'Transporter', 'Other'],
  bankAccountTypes: ['Current Account', 'Savings Account', 'Overdraft', 'Cash Credit'],
  transactionCategories: [
    'Project Revenue',
    'Advance Payment',
    'Stage Payment',
    'Partial Payment',
    'Final Payment',
    'Miscellaneous Income',
  ],
  invoiceStatuses: ['Draft', 'Sent', 'Viewed', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
  paymentStatuses: ['Pending', 'Processing', 'Completed', 'Failed', 'Refunded', 'Cancelled'],
  expenseStatuses: ['Pending', 'Approved', 'Rejected', 'Paid', 'Cancelled'],
  gstTypes: ['CGST', 'SGST', 'IGST', 'CESS'],
};

export const ACCOUNTING_MODULE_DEFAULTS = {
  accountTypes: ['Asset', 'Liability', 'Equity', 'Income', 'Expense'],
  accountGroups: [
    'Current Assets',
    'Fixed Assets',
    'Current Liabilities',
    'Long Term Liabilities',
    'Equity',
    'Direct Income',
    'Indirect Income',
    'Direct Expenses',
    'Indirect Expenses',
  ],
  journalTypes: ['Sales', 'Purchase', 'Payment', 'Receipt', 'Contra', 'Journal'],
  taxCategories: ['Output GST', 'Input GST', 'TDS', 'TCS'],
  gstSettings: {
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    cessRate: 0,
  },
};

export function resolveSettingsValue<T>(value: T | undefined, fallback: T): T {
  return value !== undefined && value !== null ? value : fallback;
}
