# Wizard Integration Guide

This guide explains how to integrate the new multi-step wizard components and danger confirmation dialogs into your existing CRM pages.

## Overview

The refactoring introduces:
1. **FormWizard Component** - A reusable multi-step wizard with stepper, progress indicator, and navigation
2. **Danger Confirmation Dialogs** - Pre-configured delete confirmation dialogs for each entity type
3. **Wizard Form Components** - Module-specific wizard implementations for Lead, Customer, Project, and Inventory

## FormWizard Component

### Location
`src/components/wizard/FormWizard.tsx`

### Features
- Visual stepper with step numbers and completion indicators
- Progress bar showing completion percentage
- Step-by-step validation before proceeding
- Previous/Next navigation
- Optional review step
- Data preservation between steps
- Responsive design for desktop and mobile

### Props Interface

```typescript
interface FormWizardProps {
  steps: WizardStep[];           // Array of step definitions
  onSubmit: () => void | Promise<void>;  // Final submission handler
  isSubmitting?: boolean;         // Loading state
  onCancel?: () => void;         // Cancel handler
  submitButtonText?: string;      // Custom submit button text
  showReviewStep?: boolean;       // Enable review step
  reviewContent?: ReactNode;      // Review step content
  className?: string;             // Additional CSS classes
}

interface WizardStep {
  id: string;                    // Unique step identifier
  title: string;                 // Step title displayed in stepper
  description?: string;          // Optional step description
  content: ReactNode;            // Step content (form fields)
  validate?: () => boolean | { valid: boolean; errors?: Record<string, string> };
  // Optional validation function for the step
}
```

### Usage Example

```typescript
import { FormWizard, WizardStep } from '@/components/wizard/FormWizard';

const MyWizard = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  const step1: WizardStep = {
    id: 'basic',
    title: 'Basic Information',
    description: 'Enter your details',
    content: (
      <div className="space-y-4">
        <Input 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Name"
        />
        <Input 
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
        />
      </div>
    ),
    validate: () => {
      if (!formData.name) return { valid: false, errors: { name: 'Name is required' } };
      if (!formData.email) return { valid: false, errors: { email: 'Email is required' } };
      return { valid: true };
    },
  };

  const handleSubmit = async () => {
    // Submit logic
  };

  return (
    <FormWizard
      steps={[step1]}
      onSubmit={handleSubmit}
      onCancel={() => {}}
      submitButtonText="Submit"
      showReviewStep={true}
      reviewContent={<div>Review your data before submitting</div>}
    />
  );
};
```

## Module-Specific Wizards

### Lead Form Wizard

**Location:** `src/features/leads/components/LeadFormWizard.tsx`

**Steps:**
1. Basic Information - Customer name, company name, designation, website
2. Contact Information - Mobile, alternate mobile, email
3. Address Information - Address fields, city, state, pincode, country
4. Business Information - GST, PAN, industry, business type, company details, social links
5. Project & Notes - Project details, tags, notes, remarks, custom fields
6. Review - Summary of all entered data

**Integration:**

```typescript
import { LeadFormWizard } from '@/features/leads/components/LeadFormWizard';

// Replace existing LeadForm with LeadFormWizard
<LeadFormWizard
  initialData={leadData}
  existingLeads={leads}
  configuration={config}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={isSubmitting}
/>
```

### Customer Form Wizard

**Location:** `src/features/customers/components/CustomerFormWizard.tsx`

**Steps:**
1. Basic Information - Customer details, lead conversion option
2. Company Information - GST, PAN, industry, business type, website
3. Address Information - Address fields, city, state, pincode, country
4. Billing & Additional - Source, status, notes, custom fields
5. Review - Summary of all entered data

**Integration:**

```typescript
import { CustomerFormWizard } from '@/features/customers/components/CustomerFormWizard';

// Replace existing CustomerForm with CustomerFormWizard
<CustomerFormWizard
  initialData={customerData}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={isSubmitting}
  error={error}
  isEditMode={isEdit}
/>
```

### Project Form Wizard

**Location:** `src/features/projects/components/ProjectFormWizard.tsx`

**Steps:**
1. Basic Information - Project name, customer, project type, priority, lead selection
2. Budget & Timeline - Value, budget, dates, location, project manager
3. PEB Specifications - Structure type, roof type, dimensions, crane system, custom fields
4. Review - Summary of all entered data

**Integration:**

```typescript
import { ProjectFormWizard } from '@/features/projects/components/ProjectFormWizard';

// Replace existing ProjectForm with ProjectFormWizard
<ProjectFormWizard
  initialData={projectData}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={isSubmitting}
  prefillCustomerId={customerId}
  isEditMode={isEdit}
/>
```

### Inventory Form Wizard

**Location:** `src/features/inventory/components/InventoryItemFormWizard.tsx`

**Steps:**
1. General Information - Item master selection, read-only item details
2. Stock Levels - Current stock, reserved, issued, incoming, outgoing, status
3. Pricing & Warehouse - Purchase rate, warehouse, bin location
4. Reorder Settings - Minimum stock, reorder level, reorder quantity, safety stock, custom fields
5. Review - Summary of all entered data

**Integration:**

```typescript
import { InventoryItemFormWizard } from '@/features/inventory/components/InventoryItemFormWizard';

// Replace existing InventoryItemForm with InventoryItemFormWizard
<InventoryItemFormWizard
  initialData={inventoryData}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={isSubmitting}
  mode="create" // or "edit"
/>
```

## Danger Confirmation Dialogs

### Location
`src/components/dialog/DangerConfirmationDialog.tsx`

### Pre-configured Dialogs

The component includes pre-configured dialogs for each entity type:

- **DeleteLeadDialog** - For lead deletion with specific consequences
- **DeleteCustomerDialog** - For customer deletion with specific consequences
- **DeleteProjectDialog** - For project deletion with specific consequences
- **DeleteInventoryDialog** - For inventory deletion with specific consequences
- **DeleteDocumentDialog** - For document deletion with specific consequences

### Base Dialog Interface

```typescript
interface DangerConfirmationDialogProps {
  open: boolean;                          // Dialog open state
  onOpenChange: (open: boolean) => void;  // Open state handler
  onConfirm: () => void | Promise<void>; // Confirmation handler
  isDeleting?: boolean;                   // Loading state
  title: string;                          // Dialog title
  entityName: string;                     // Name of entity being deleted
  consequences: string[];                 // List of consequences
  additionalInfo?: string;               // Additional context
  confirmText?: string;                  // Checkbox confirmation text
}
```

### Integration Example

```typescript
import { DeleteLeadDialog } from '@/components/dialog/DangerConfirmationDialog';

const MyComponent = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteLead(leadId);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setShowDeleteDialog(true)}>Delete</Button>
      <DeleteLeadDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        entityName={`${lead.customerName} (${lead.companyName})`}
      />
    </>
  );
};
```

### Updated Row Actions

The following row action components have been updated to use danger confirmation dialogs:

- `src/features/leads/components/LeadRowActions.tsx`
- `src/features/customers/components/CustomerRowActions.tsx`
- `src/features/projects/components/ProjectRowActions.tsx`
- `src/features/inventory/components/InventoryRowActions.tsx`

These components now automatically show the appropriate danger confirmation dialog when the delete action is triggered. No additional integration is required for these components.

## Migration Steps

### Step 1: Replace Form Components

For each module, replace the existing form component with the wizard version:

**Before:**
```typescript
import { LeadForm } from '@/features/leads/components/LeadForm';
<LeadForm {...props} />
```

**After:**
```typescript
import { LeadFormWizard } from '@/features/leads/components/LeadFormWizard';
<LeadFormWizard {...props} />
```

### Step 2: Verify Props Compatibility

The wizard components maintain the same prop interfaces as the original forms, so no prop changes are required. However, verify that:

- All callback functions (`onSubmit`, `onCancel`) handle async operations properly
- Initial data structures match the expected types
- Configuration objects are passed correctly

### Step 3: Test Validation

Each step validates its own fields before allowing navigation to the next step. Test that:

- Required fields show appropriate error messages
- Navigation is blocked when validation fails
- Users can go back to previous steps to fix errors
- Final submission validates all data

### Step 4: Test Delete Workflows

Verify that delete actions now show the danger confirmation dialog:

- Click delete on any entity row
- Confirm the dialog appears with appropriate consequences
- Verify the checkbox must be checked before deletion
- Confirm deletion proceeds only after confirmation
- Verify loading states work correctly

## Customization

### Adding Custom Steps

To add custom steps to a wizard:

```typescript
const customStep: WizardStep = {
  id: 'custom',
  title: 'Custom Step',
  description: 'Custom description',
  content: <YourCustomForm />,
  validate: () => {
    // Your validation logic
    return { valid: true };
  },
};
```

### Custom Validation

The `validate` function can return either a boolean or an object with validation errors:

```typescript
validate: () => {
  const errors: Record<string, string> = {};
  if (!formData.requiredField) {
    errors.requiredField = 'This field is required';
  }
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  return { valid: true };
}
```

### Custom Review Content

Provide custom review content for the final step:

```typescript
<FormWizard
  steps={steps}
  reviewContent={
    <div className="space-y-4">
      <h3>Review Your Data</h3>
      {/* Custom review layout */}
    </div>
  }
/>
```

## Benefits

1. **Improved UX** - Large forms are broken into manageable steps
2. **Better Validation** - Step-by-step validation reduces user frustration
3. **Data Safety** - Danger confirmation dialogs prevent accidental deletions
4. **Consistency** - All modules follow the same pattern
5. **Maintainability** - Reusable components reduce code duplication
6. **Responsive** - Works well on both desktop and mobile devices

## Troubleshooting

### Validation Not Working

Ensure your `validate` function returns the correct format:
- Boolean: `true` for valid, `false` for invalid
- Object: `{ valid: boolean, errors?: Record<string, string> }`

### Step Navigation Issues

Check that:
- Step IDs are unique
- `validate` functions are properly defined
- Error state is being cleared when users fix issues

### Delete Dialog Not Showing

Verify that:
- The dialog component is imported correctly
- State management (`showDeleteDialog`) is working
- The `onConfirm` handler is async if needed

## Support

For issues or questions about the wizard integration, refer to the component source files or contact the development team.
