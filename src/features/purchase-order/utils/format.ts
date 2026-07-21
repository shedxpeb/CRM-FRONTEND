export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
  return `${symbol}${formatted}`;
}

export function formatDate(date?: string): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date?: string): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateLineAmount(item: {
  quantity: number;
  rate: number;
  discount?: number;
  discountType?: string;
}): number {
  const subtotal = item.quantity * item.rate;
  const discountAmount =
    item.discountType === 'Percentage'
      ? (subtotal * (item.discount || 0)) / 100
      : item.discount || 0;
  return subtotal - discountAmount;
}

export async function fetchPdfBlob(id: string): Promise<Blob> {
  const { getAccessToken } = await import('@/core/auth/session');
  const token = getAccessToken() || '';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}/purchase-order/${id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw new Error('Failed to load PDF');
  }
  return res.blob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getPdfUrl(id: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  return `${baseUrl}/purchase-order/${id}/pdf`;
}
