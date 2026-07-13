import { redirect } from 'next/navigation';
import { ROUTES } from '@/core/routes';

/**
 * Legacy route — canonical Item Master lives at /dashboard/item.
 */
export default function ItemMasterRedirectPage() {
  redirect(ROUTES.items);
}
