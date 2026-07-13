import { Button } from '@/components/ui/button';
import { Download, RefreshCw, ChevronDown } from 'lucide-react';
import { ExportStatus, ExportType } from '@/features/dashboard/types/pdf';
import { memo } from 'react';

interface ExportButtonProps {
  onExport: (type: ExportType) => Promise<void>;
  isGenerating: boolean;
  progress?: number;
  status?: ExportStatus;
}

const EXPORT_TYPES = [
  { value: 'pdf' as ExportType, label: 'Export PDF', enabled: true },
  { value: 'excel' as ExportType, label: 'Export Excel', enabled: false },
  { value: 'csv' as ExportType, label: 'Export CSV', enabled: false },
];

export const ExportButton = memo(function ExportButton({ onExport, isGenerating, progress = 0, status = 'idle' }: ExportButtonProps) {
  const getStatusMessage = () => {
    switch (status) {
      case 'preparing':
        return 'Preparing Data...';
      case 'rendering':
        return 'Rendering Charts...';
      case 'generating':
        return 'Generating PDF...';
      case 'ready':
        return 'Download Ready';
      case 'error':
        return 'Export Failed';
      default:
        return 'Export PDF';
    }
  };

  const handleExport = (type: ExportType) => {
    onExport(type);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleExport('pdf')}
        disabled={isGenerating}
        className="flex items-center gap-2 h-8 sm:h-9 text-[10px] sm:text-xs px-2 sm:px-3 py-2"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
            <span>{getStatusMessage()}</span>
            {progress > 0 && <span>({progress}%)</span>}
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{getStatusMessage()}</span>
          </>
        )}
      </Button>
      
      {/* Future: Add dropdown for Excel/CSV when enabled */}
      {/* <Button variant="outline" disabled>
        <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button> */}
    </div>
  );
});
