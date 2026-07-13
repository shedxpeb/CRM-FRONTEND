import { CompanyDetails } from '@/features/dashboard/types/pdf';

export async function fetchCompanyDetails(): Promise<CompanyDetails> {
  // For now, return mock data
  // TODO: Integrate with Settings module when available
  
  return {
    name: 'PEB CRM',
    address: '123 Industrial Area, Mumbai, Maharashtra, India',
    phone: '+91 98765 43210',
    email: 'info@pebcrm.com',
    gst: '27AABCU9603R1ZM',
    cin: 'U72900MH2020PTC123456',
    website: 'www.pebcrm.com',
    brandingColors: {
      primary: [22, 160, 133], // Teal
      secondary: [52, 73, 94], // Dark blue-gray
      accent: [241, 196, 15], // Yellow
    },
    // logo: base64ImageString, // TODO: Fetch from Settings
  };
}

export async function checkLogoQuality(logoData?: string): Promise<{ isValid: boolean; warning?: string }> {
  if (!logoData) {
    return { isValid: false, warning: 'No logo provided' };
  }

  try {
    // Extract dimensions from base64 image
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
  } catch (error) {
    return { isValid: false, warning: 'Error checking logo quality' };
  }
}
