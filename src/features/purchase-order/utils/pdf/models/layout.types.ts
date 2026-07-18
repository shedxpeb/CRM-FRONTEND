// PDF Layout Types and Interfaces
import jsPDF from 'jspdf';

export interface PDFLayoutConfig {
  orientation: 'portrait' | 'landscape';
  unit: 'mm' | 'pt' | 'px' | 'in';
  format: 'a4' | 'letter' | 'legal';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface PDFSection {
  type: string;
  render: (context: PDFRenderContext) => PDFRenderResult;
  priority?: number;
}

export interface PDFRenderContext {
  doc: jsPDF;
  y: number;
  pageWidth: number;
  pageHeight: number;
  contentWidth: number;
  currentPage: number;
  totalPages: number;
  data: PurchaseOrderPDFData;
  config: PDFLayoutConfig;
}

export interface PDFRenderResult {
  nextY: number;
  newPage?: boolean;
  height?: number;
}

export interface PurchaseOrderPDFData {
  organization: OrganizationData;
  vendor: VendorData;
  project?: ProjectData;
  purchaseOrder: PurchaseOrderData;
  items: PurchaseOrderItemData[];
  terms: TermData[];
  invoiceInstructions: string[];
}

export interface OrganizationData {
  name: string;
  logo?: string;
  gst: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
}

export interface VendorData {
  id: string;
  name: string;
  code: string;
  gst: string;
  pan?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface ProjectData {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  deliveryContact: string;
  phone: string;
  email: string;
}

export interface PurchaseOrderData {
  id: string;
  poNumber: string;
  poNumberInt: number;
  revision: number;
  date: string;
  status: string;
  expectedDeliveryDate?: string;
  paymentTerms: string;
  shippingTerms: string;
  currency: string;
  reference: string;
  purchaseType: string;
  department: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  subtotal: number;
  discount: number;
  discountType?: string;
  tax: number;
  freight: number;
  packing: number;
  otherCharges: number;
  roundOff: number;
  grandTotal: number;
  notes?: string;
  terms?: string;
}

export interface PurchaseOrderItemData {
  id: string;
  itemCode: string;
  itemName: string;
  description?: string;
  hsnCode?: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  discountType?: string;
  gstRate?: number;
  gstAmount: number;
  total: number;
}

export interface TermData {
  label: string;
  value: string;
}

export interface SignatureData {
  role: string;
  name: string;
  date?: string;
  signature?: string;
}
