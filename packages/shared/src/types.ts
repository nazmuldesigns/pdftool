/**
 * PDF Toolbox Shared Types & Interfaces
 */

export type ToolCategory =
  | 'core'
  | 'creation'
  | 'invoice'
  | 'editing'
  | 'organization'
  | 'optimization'
  | 'security'
  | 'viewing'
  | 'convert-to-pdf'
  | 'convert-from-pdf'
  | 'image-conversion'
  | 'platform';

export type ToolStatus =
  | 'ready'               // Fully implemented & operational
  | 'in-progress'         // Actively being enhanced
  | 'pending-phase-2'     // Scheduled for Phase 2: Core PDF extension
  | 'pending-phase-3'     // Scheduled for Phase 3: Conversions (Office, etc.)
  | 'pending-phase-4'     // Scheduled for Phase 4: Interactive editing & security
  | 'pending-phase-5';    // Scheduled for Phase 5: OCR, PDF/A, E-Invoicing

export type ToolEngine = 'client' | 'server' | 'hybrid';

export interface ToolOptionDefinition {
  id: string;
  label: string;
  type: 'select' | 'number' | 'text' | 'checkbox' | 'radio' | 'range' | 'color';
  description?: string;
  defaultValue: any;
  options?: { label: string; value: any; description?: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  shortDescription: string;
  description: string;
  icon: string; // Lucide icon identifier
  badge?: 'Popular' | 'Core' | 'New' | 'Private & Fast' | 'Cloud Assisted' | 'Pending Phase';
  status: ToolStatus;
  statusDetails?: string;
  supportedInputs: string[];
  supportedMimeTypes: string[];
  outputFormat: string;
  outputMimeType: string;
  engine: ToolEngine;
  maxFileSizeMB: number;
  maxFiles: number;
  allowMultiple: boolean;
  options: ToolOptionDefinition[];
  keywords: string[];
  limitations?: string[];
}

export type JobStatus = 'idle' | 'queued' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface ProcessingJob {
  id: string;
  toolId: string;
  status: JobStatus;
  progress: number; // 0 - 100
  statusMessage?: string;
  originalFiles: {
    name: string;
    size: number;
    type: string;
  }[];
  outputFile?: {
    name: string;
    size: number;
    url?: string;
    blob?: Blob;
    mimeType: string;
  };
  options: Record<string, any>;
  errorMessage?: string;
  createdAt: number;
  completedAt?: number;
  durationMs?: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoDownload: boolean;
  highQualityPreviews: boolean;
  retentionHours: number;
  analyticsConsent: boolean;
}

export interface SavedDocument {
  id: string;
  userId: string;
  filename: string;
  storageObjectPath?: string;
  contentType: string;
  size: number;
  toolUsed: string;
  createdAt: number;
  expiresAt: number;
  starred?: boolean;
}
