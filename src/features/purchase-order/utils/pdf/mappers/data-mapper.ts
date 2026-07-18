// Data Mapper - Converts PurchaseOrder to PDF Data
import { PurchaseOrder } from '../../../types/purchase-order.types';
import { PurchaseOrderPDFData, OrganizationData, VendorData, ProjectData, PurchaseOrderData, PurchaseOrderItemData, TermData } from '../models/layout.types';

export interface PDFDataMapperOptions {
  organization: OrganizationData;
  project?: ProjectData;
}

export function mapPurchaseOrderToPDFData(po: PurchaseOrder, options: PDFDataMapperOptions): PurchaseOrderPDFData {
  return {
    organization: options.organization,
    vendor: mapVendorData(po),
    project: options.project || mapProjectData(po),
    purchaseOrder: mapPurchaseOrderData(po),
    items: mapItemData(po),
    terms: mapTermData(po),
    invoiceInstructions: getDefaultInvoiceInstructions(),
  };
}

function mapOrganizationData(organization: OrganizationData): OrganizationData {
  return organization;
}

function mapVendorData(po: PurchaseOrder): VendorData {
  return {
    id: po.vendorId,
    name: po.vendorName,
    code: po.vendorId.substring(0, 8).toUpperCase(),
    gst: po.vendor?.email ? 'Available' : 'N/A',
    pan: undefined,
    address: po.vendor?.email ? 'Vendor Address' : 'N/A',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400001',
    contactPerson: po.vendor?.contactPerson || 'Contact Person',
    phone: po.vendor?.phone || 'N/A',
    email: po.vendor?.email || 'N/A',
  };
}

function mapProjectData(po: PurchaseOrder): ProjectData | undefined {
  if (!po.projectId) return undefined;
  
  return {
    id: po.projectId,
    name: po.projectName || 'Main Project',
    code: po.projectId.substring(0, 8).toUpperCase(),
    address: 'Project Site Address',
    city: 'Mumbai',
    state: 'Maharashtra',
    deliveryContact: 'Site Manager',
    phone: '+91 9876543210',
    email: 'site@pebcrm.com',
  };
}

function mapPurchaseOrderData(po: PurchaseOrder): PurchaseOrderData {
  return {
    id: po.id,
    poNumber: po.poNumber,
    poNumberInt: po.poNumberInt,
    revision: 0,
    date: new Date(po.createdAt).toLocaleDateString(),
    status: po.status,
    expectedDeliveryDate: po.expectedDeliveryDate,
    paymentTerms: po.paymentTerms || 'Net 30',
    shippingTerms: 'FOB Destination',
    currency: 'INR',
    reference: po.poNumber,
    purchaseType: 'Standard',
    department: 'Procurement',
    createdBy: po.createdBy || 'Admin',
    approvedBy: po.approvedBy,
    approvedAt: po.approvedAt,
    subtotal: po.subtotal,
    discount: po.discount,
    discountType: po.discountType,
    tax: po.tax,
    freight: po.freight,
    packing: 0,
    otherCharges: 0,
    roundOff: po.roundOff,
    grandTotal: po.grandTotal,
    notes: po.notes,
    terms: po.terms,
  };
}

function mapItemData(po: PurchaseOrder): PurchaseOrderItemData[] {
  return (po.items || []).map((item: any) => ({
    id: item.id,
    itemCode: item.itemCode,
    itemName: item.itemName,
    description: item.description,
    hsnCode: item.hsnCode,
    quantity: item.quantity,
    unit: item.unit,
    rate: item.rate,
    discount: item.discount,
    discountType: item.discountType,
    gstRate: item.gstRate,
    gstAmount: item.gstAmount,
    total: item.total,
  }));
}

function mapTermData(po: PurchaseOrder): TermData[] {
  return [
    { label: 'Payment Terms', value: po.paymentTerms || 'Net 30' },
    { label: 'Delivery Terms', value: 'FOB Destination' },
    { label: 'Warranty', value: 'As per manufacturer warranty' },
    { label: 'Inspection', value: 'Material inspection at buyer premises' },
    { label: 'Transportation', value: 'Seller responsibility' },
  ];
}

function getDefaultInvoiceInstructions(): string[] {
  return [
    'Please quote Purchase Order number on all invoices and correspondence.',
    'Send original invoice along with goods delivery note.',
    'Ensure all goods are properly packed and labeled.',
    'Any discrepancies must be reported within 7 days of delivery.',
  ];
}
