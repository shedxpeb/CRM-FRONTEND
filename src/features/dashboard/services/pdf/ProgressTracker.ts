import { ExportStatus } from '@/features/dashboard/types/pdf';

export class ProgressTracker {
  private status: ExportStatus;
  private message: string;
  private progress: number;
  private onUpdate?: (status: ExportStatus, message: string, progress: number) => void;

  constructor(onUpdate?: (status: ExportStatus, message: string, progress: number) => void) {
    this.status = 'idle';
    this.message = '';
    this.progress = 0;
    this.onUpdate = onUpdate;
  }

  update(status: ExportStatus, message: string, progress: number): void {
    this.status = status;
    this.message = message;
    this.progress = progress;
    
    if (this.onUpdate) {
      this.onUpdate(status, message, progress);
    }
  }

  getStatus(): ExportStatus {
    return this.status;
  }

  getMessage(): string {
    return this.message;
  }

  getProgress(): number {
    return this.progress;
  }
}
