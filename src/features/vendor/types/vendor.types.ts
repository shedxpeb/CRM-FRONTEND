export interface Vendor {
  id: string;
  organizationId: string;
  vendorNumber: number;
  companyName: string;
  gstNumber?: string;
  panNumber?: string;
  contactPerson: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  bankDetails?: any;
  paymentTerms?: string;
  creditLimit?: number;
  creditDays?: number;
  outstanding: number;
  status: string;
  notes?: string;
  attachments: string[];
  customFields?: any;
  createdById?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedById?: string;
  purchaseOrders?: PurchaseOrder[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: string;
  grandTotal: number;
  createdAt: string;
}

export interface CreateVendorDto {
  companyName: string;
  gstNumber?: string;
  panNumber?: string;
  contactPerson: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  bankDetails?: any;
  paymentTerms?: string;
  creditLimit?: number;
  creditDays?: number;
  status?: string;
  notes?: string;
  attachments?: string[];
  customFields?: any;
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {}

export interface VendorQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: {
    search?: string;
    status?: string;
  };
}

export interface VendorStats {
  total: number;
  active: number;
  inactive: number;
}

export interface PaginatedVendorData {
  data: Vendor[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
