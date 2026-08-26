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
    .regex(/^\+?[\d\s\-()]{7,15}$/, 'Mobile number is invalid (7-15 digits, optional +country code)'),

  alternateMobile: z.string()
    .optional()
    .nullable()
    .refine(val => !val || val === '' || /^\+?[\d\s\-()]{7,15}$/.test(val), 'Alternate mobile number is invalid'),

  email: z.string()
    .optional()
    .nullable()
    .refine(val => !val || val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'Invalid email address'),

  gstNumber: z.string()
    .optional()
    .nullable()
    .refine(val => !val || val === '' || /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(val), 'Invalid GST number format'),

  panNumber: z.string()
    .optional()
    .nullable()
    .refine(val => !val || val === '' || /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(val), 'Invalid PAN number format'),

  industry: z.string().min(1, 'Industry is required'),

  businessType: z.string().min(1, 'Business type is required'),

  website: z.string()
    .optional()
    .nullable()
    .refine(val => !val || val === '' || /^https?:\/\/.+\..+/.test(val), 'Invalid website URL'),

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
    .optional()
    .nullable()
    .refine(val => !val || val === '' || val.length <= 50, 'Country must be less than 50 characters'),

  pincode: z.string()
    .optional()
    .nullable()
    .refine(val => !val || val === '' || /^\d{6}$/.test(val), 'Pincode must be 6 digits'),

  assignedEmployeeId: z.string()
    .optional()
    .nullable(),

  source: z.string().min(1, 'Source is required'),

  status: z.string().optional().default('Prospect'),

  notes: z.string()
    .optional()
    .nullable()
    .refine(val => !val || val === '' || val.length <= 1000, 'Notes must be less than 1000 characters'),

  leadId: z.string()
    .optional()
    .nullable(),

  projectTitle: z.string()
    .optional()
    .nullable()
    .refine(val => !val || val === '' || (val.length >= 3 && val.length <= 200), 'Project name must be between 3 and 200 characters'),

  projectType: z.string()
    .optional()
    .nullable(),

  projectCode: z.string()
    .optional()
    .nullable()
    .refine(val => !val || val === '' || val.length <= 50, 'Project code must be less than 50 characters'),

  accountTier: z.string().optional(),

  creditLimit: z.number().optional(),

  customFields: z.record(z.string(), z.any()).optional(),
});

/**
 * Update Customer Validation Schema (all fields optional)
 */
export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
