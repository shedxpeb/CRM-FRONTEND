'use client';

import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Upload, FileSpreadsheet, ChevronDown, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/toast';

interface ImportExportButtonProps {
  onExportAll: () => Promise<any[]>;
  onExportCurrent: () => any[];
  onExportSelected?: () => any[];
  onExportDateRange?: (fromDate: string, toDate: string) => Promise<any[]>;
  onExportToday?: () => Promise<any[]>;
  onImport?: (file: File) => Promise<void>;
  getHeaders: (data: any[]) => string[];
  getDataRow: (item: any) => any[];
  getFilename: (type: string, extra?: string) => string;
  selectedCount?: number;
  customFields?: Record<string, any>;
  disabled?: boolean;
}

export function ImportExportButton({
  onExportAll,
  onExportCurrent,
  onExportSelected,
  onExportDateRange,
  onExportToday,
  onImport,
  getHeaders,
  getDataRow,
  getFilename,
  selectedCount = 0,
  customFields = {},
  disabled = false,
}: ImportExportButtonProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDateRangeDialogOpen, setIsDateRangeDialogOpen] = useState(false);
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const isExportingRef = useRef(false);

  const formatDate = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return '';
    
    let date: Date;
    if (typeof dateValue === 'string') {
      const parts = dateValue.split('T')[0].split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}-${month}-${year}`;
      }
      date = new Date(dateValue);
    } else {
      date = dateValue;
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleExport = useCallback(async (exportType: 'all' | 'current' | 'selected' | 'dateRange' | 'today' = 'all') => {
    if (isExportingRef.current) return;
    
    try {
      isExportingRef.current = true;
      
      requestAnimationFrame(async () => {
        try {
          let dataToExport: any[] = [];
          
          if (exportType === 'current') {
            dataToExport = onExportCurrent();
          } else if (exportType === 'selected' && onExportSelected) {
            dataToExport = onExportSelected();
          } else if (exportType === 'dateRange' && onExportDateRange) {
            if (!exportDateFrom || !exportDateTo) {
              toast.error('Please select both from and to dates');
              isExportingRef.current = false;
              return;
            }
            dataToExport = await onExportDateRange(exportDateFrom, exportDateTo);
          } else if (exportType === 'today' && onExportToday) {
            dataToExport = await onExportToday();
          } else if (exportType === 'all') {
            dataToExport = await onExportAll();
          }
          
          if (dataToExport.length === 0) {
            toast.error('No data found to export');
            isExportingRef.current = false;
            return;
          }
          
          requestAnimationFrame(() => {
            try {
              const headers = getHeaders(dataToExport);
              
              // Add custom field headers
              const customFieldKeys = Object.keys(customFields || {});
              customFieldKeys.forEach(key => {
                const field = customFields[key];
                headers.push(field?.label || key);
              });
              
              // Prepare data rows
              const data = dataToExport.map(item => {
                const row = getDataRow(item);
                
                // Add custom field values
                customFieldKeys.forEach(key => {
                  const customValue = item.customFields?.[key];
                  if (Array.isArray(customValue)) {
                    row.push(customValue.join(', '));
                  } else {
                    row.push(customValue || '');
                  }
                });
                
                return row;
              });
              
              // Create worksheet
              const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
              
              // Create workbook
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Data');
              
              // Generate filename
              const extra = exportType === 'dateRange' ? `${exportDateFrom}_to_${exportDateTo}` : 
                          exportType === 'selected' ? `${selectedCount}` : undefined;
              const filename = getFilename(exportType, extra);
              
              // Download file
              XLSX.writeFile(wb, filename);
              
              toast.success(`Successfully exported ${dataToExport.length} items to Excel`);
              isExportingRef.current = false;
              setIsDropdownOpen(false);
              setIsDateRangeDialogOpen(false);
            } catch (error) {
              isExportingRef.current = false;
              console.error('Export failed:', error);
              toast.error('Failed to export');
            }
          });
        } catch (error) {
          isExportingRef.current = false;
          console.error('Export failed:', error);
          toast.error('Failed to export');
        }
      });
    } catch (error) {
      isExportingRef.current = false;
      console.error('Export failed:', error);
      toast.error('Failed to export');
    }
  }, [onExportAll, onExportCurrent, onExportSelected, onExportDateRange, onExportToday, getHeaders, getDataRow, getFilename, customFields, selectedCount, exportDateFrom, exportDateTo]);

  const handleImport = useCallback(() => {
    if (!onImport) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await onImport(file);
          toast.success('Import successful');
        } catch (error) {
          console.error('Import failed:', error);
          toast.error('Failed to import');
        }
      }
    };
    input.click();
  }, [onImport]);

  return (
    <>
      <div className="flex gap-2">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" disabled={disabled}>
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('all')}>
              <Download className="h-3.5 w-3.5 mr-2" />
              Export All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('current')}>
              <Download className="h-3.5 w-3.5 mr-2" />
              Export Current Page
            </DropdownMenuItem>
            {onExportSelected && selectedCount > 0 && (
              <DropdownMenuItem onClick={() => handleExport('selected')}>
                <Download className="h-3.5 w-3.5 mr-2" />
                Export Selected ({selectedCount})
              </DropdownMenuItem>
            )}
            {onExportDateRange && (
              <DropdownMenuItem onClick={() => setIsDateRangeDialogOpen(true)}>
                <Calendar className="h-3.5 w-3.5 mr-2" />
                Export by Date Range
              </DropdownMenuItem>
            )}
            {onExportToday && (
              <DropdownMenuItem onClick={() => handleExport('today')}>
                <Calendar className="h-3.5 w-3.5 mr-2" />
                Export Today
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {onImport && (
          <Button variant="outline" size="sm" onClick={handleImport} className="h-9 gap-1.5 text-xs" disabled={disabled}>
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Import</span>
          </Button>
        )}
      </div>

      {/* Date Range Dialog */}
      {onExportDateRange && (
        <Dialog open={isDateRangeDialogOpen} onOpenChange={setIsDateRangeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export by Date Range</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <input
                  type="date"
                  value={exportDateFrom}
                  onChange={(e) => setExportDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <input
                  type="date"
                  value={exportDateTo}
                  onChange={(e) => setExportDateTo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDateRangeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleExport('dateRange')}>
                  Export
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
