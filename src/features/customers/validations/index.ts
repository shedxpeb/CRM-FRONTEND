/**
 * Customer Validation Schemas
 * Using Zod for type-safe form validation
 */
import { z } from 'zod';

/**
 * Create Customer Validation Schema
 */
export const createCustomerSchema = z.object({
  customerName: z.string()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must be less than 100 characters'),

  companyName: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),

  mobile: z.string()
    .regex(/^\+91\s\d{5}\s\d{5}$/, 'Mobile number must be in format: +91 XXXXX XXXXX'),

  alternateMobile: z.string()
    .regex(/^\+91\s\d{5}\s\d{5}$/, 'Alternate mobile must be in format: +91 XXXXX XXXXX')
    .optional()
    .or(z.literal('')),

  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),

  gstNumber: z.string()
    .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GST number format')
    .optional()
    .or(z.literal('')),

  panNumber: z.string()
    .regex(/^[A-Z]{5}\d{4}[A-Z]{1}$/, 'Invalid PAN number format')
    .optional()
    .or(z.literal('')),

  industry: z.enum([
    'Manufacturing', 'Construction', 'Infrastructure', 'Logistics',
    'Agriculture', 'Commercial', 'Healthcare', 'Education', 'Retail', 'Other',
  ]),

  businessType: z.enum([
    'Pvt Ltd', 'LLP', 'Partnership', 'Proprietorship', 'Trust', 'Government', 'Other',
  ]),

  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),

  address: z.string()
    .min(2, 'Address is required')
    .max(500, 'Address must be less than 500 characters'),

  city: z.string()
    .min(2, 'City is required')
    .max(50, 'City must be less than 50 characters'),

  state: z.string()
    .min(2, 'State is required')
    .max(50, 'State must be less than 50 characters'),

  country: z.string()
    .max(50, 'Country must be less than 50 characters')
    .optional()
    .or(z.literal('')),

  pincode: z.string()
    .regex(/^\d{6}$/, 'Pincode must be 6 digits')
    .optional()
    .or(z.literal('')),

  assignedEmployeeId: z.string().optional(),

  source: z.enum([
    'Website', 'Referral', 'Cold Call', 'Email',
    'Social Media', 'Trade Show', 'Advertisement', 'Other',
  ]),

  status: z.enum(['Active', 'Inactive', 'Prospect', 'Converted', 'Churned'])
    .optional()
    .default('Prospect'),

  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

/**
 * Update Customer Validation Schema (all fields optional)
 */
export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
