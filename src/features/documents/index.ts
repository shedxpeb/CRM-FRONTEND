/**
 * Documents Module
 * Commercial Documents Management Module
 * Exports all components, hooks, services, types, and constants
 */

// Types
export * from './types';

// Constants
export * from './constants';

// Validations
export * from './validations';

// Services
export { documentsApi, templatesApi, approvalsApi, versionsApi } from './services/documentsApi';

// Hooks
export {
  useDocuments,
  useDocument,
  useDocumentStats,
  useDocumentActivities,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useSendDocument,
  useConvertDocument,
  useExportDocuments,
  useTemplates,
  useTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  usePendingApprovals,
  useRequestApproval,
  useApprovalDecision,
  useDocumentVersions,
  useCreateVersion,
} from './hooks/useDocuments';

// Components
export { DocumentActivityTimeline } from './components/DocumentActivityTimeline';
export { DocumentRowActions } from './components/DocumentRowActions';

// Pages
export { DocumentsDashboard } from './pages/DocumentsDashboard';
export { EstimatesPage } from './pages/EstimatesPage';
export { ProposalsPage } from './pages/ProposalsPage';
export { QuotationsPage } from './pages/QuotationsPage';
export { TemplatesPage } from './pages/TemplatesPage';
export { ApprovalsPage } from './pages/ApprovalsPage';
export { VersionHistoryPage } from './pages/VersionHistoryPage';
export { ActivityLogsPage } from './pages/ActivityLogsPage';
export { DocumentLibraryPage } from './pages/DocumentLibraryPage';
export { AnalyticsPage } from './pages/AnalyticsPage';
