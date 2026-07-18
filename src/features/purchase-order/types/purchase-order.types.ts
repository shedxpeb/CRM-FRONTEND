export interface PurchaseOrder {
  id: string;
  organizationId: string;
  poNumber: string;
  poNumberInt: number;
  vendorId: string;
  vendorName: string;
  projectId?: string;
  projectName?: string;
  warehouseId?: string;
  warehouseName?: string;
  paymentTerms?: string;
  expectedDeliveryDate?: string;
  status: string;
  subtotal: number;
  discount: number;
  discountType?: string;
  tax: number;
  freight: number;
  roundOff: number;
  grandTotal: number;
  notes?: string;
  terms?: string;
  internalNotes?: string;
  approvedById?: string;
  approvedBy?: string;
  approvedAt?: string;
  pdfGenerated: boolean;
  pdfUrl?: string;
  sentToVendor: boolean;
  sentAt?: string;
  customFields?: any;
  createdById?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedById?: string;
  items?: PurchaseOrderItem[];
  vendor?: Vendor;
  timeline?: PurchaseOrderTimeline[];
}

export interface PurchaseOrderItem {
  id: string;
  organizationId: string;
  purchaseOrderId: string;
  itemMasterId?: string;
  itemCode: string;
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate?: number;
  gstAmount: number;
  discount: number;
  discountType?: string;
  total: number;
  hsnCode?: string;
  receivedQuantity: number;
  pendingQuantity?: number;
  customFields?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderTimeline {
  id: string;
  organizationId: string;
  purchaseOrderId: string;
  action: string;
  performedById?: string;
  performedBy?: string;
  metadata?: any;
  createdAt: string;
}

export interface Vendor {
  id: string;
  companyName: string;
  contactPerson: string;
  email?: string;
  phone: string;
}

export interface CreatePurchaseOrderItemDto {
  itemMasterId?: string;
  itemCode: string;
  itemName: string;
  description?: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate?: number;
  discount?: number;
  discountType?: string;
  hsnCode?: string;
}

export interface CreatePurchaseOrderDto {
  vendorId: string;
  projectId?: string;
  warehouseId?: string;
  paymentTerms?: string;
  expectedDeliveryDate?: string;
  status?: string;
  discount?: number;
  discountType?: string;
  freight?: number;
  notes?: string;
  terms?: string;
  internalNotes?: string;
  items: CreatePurchaseOrderItemDto[];
  customFields?: any;
}

export interface UpdatePurchaseOrderDto extends Partial<CreatePurchaseOrderDto> {}

export interface PurchaseOrderQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: {
    search?: string;
    status?: string;
    vendorId?: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface PurchaseOrderStats {
  total: number;
  draft: number;
  approved: number;
  pendingApproval: number;
  sent: number;
  totalPurchase: number;
}

export interface PaginatedPurchaseOrderData {
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
