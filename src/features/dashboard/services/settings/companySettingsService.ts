import { CompanyDetails } from '@/features/dashboard/types/pdf';
import { BackendPendingError } from '@/core/api/capabilities';

/**
 * Company branding for PDF export.
 * Settings company API is pending — returns app-level defaults only (no fabricated GST/address).
 */
export async function fetchCompanyDetails(): Promise<CompanyDetails> {
  return {
    name: process.env.NEXT_PUBLIC_BRAND_COMPANY_NAME || 'PEB CRM',
    address: '',
    phone: '',
    email: '',
    gst: '',
    cin: '',
    website: '',
    brandingColors: {
      primary: [22, 160, 133],
      secondary: [52, 73, 94],
      accent: [241, 196, 15],
    },
  };
}

export async function checkLogoQuality(logoData?: string): Promise<{ isValid: boolean; warning?: string }> {
  if (!logoData) {
    return { isValid: false, warning: 'No logo provided' };
  }

  try {
    const img = new Image();
    img.src = logoData;

    return new Promise((resolve) => {
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        if (width < 500 || height < 500) {
          resolve({
            isValid: false,
            warning: `Logo quality warning: Current size is ${width}x${height}px. Minimum recommended size is 500x500px for best print quality. Export will continue but logo may appear blurry.`,
          });
        } else {
          resolve({ isValid: true });
        }
      };

      img.onerror = () => {
        resolve({ isValid: false, warning: 'Failed to load logo image' });
      };
    });
  } catch {
    return { isValid: false, warning: 'Error checking logo quality' };
  }
}

export async function requireCompanySettings(): Promise<never> {
  throw new BackendPendingError('settings-company');
}
