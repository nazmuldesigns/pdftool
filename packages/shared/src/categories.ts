import { ToolCategory } from './types.js';

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  order: number;
}

export const CATEGORIES: Record<ToolCategory, CategoryInfo> = {
  'core': {
    id: 'core',
    name: 'Core PDF Tools',
    tagline: 'The essential PDF toolkit',
    description: 'Merge, split, compress, edit, sign, and convert PDF documents in your browser or with cloud speed.',
    icon: 'Layers',
    order: 1,
  },
  'organization': {
    id: 'organization',
    name: 'Page Organization',
    tagline: 'Rearrange and structure document pages',
    description: 'Reorder, rotate, remove, extract, halve, and assemble PDF pages visually.',
    icon: 'Grid',
    order: 2,
  },
  'optimization': {
    id: 'optimization',
    name: 'Optimization & Repair',
    tagline: 'Reduce file size and restore documents',
    description: 'Compress, optimize for web delivery, flatten form elements, rasterize, and repair damaged files.',
    icon: 'Zap',
    order: 3,
  },
  'security': {
    id: 'security',
    name: 'Security & Privacy',
    tagline: 'Protect and control sensitive information',
    description: 'Password-protect, unlock, redact sensitive data, remove metadata, and generate secure passwords.',
    icon: 'ShieldCheck',
    order: 4,
  },
  'editing': {
    id: 'editing',
    name: 'PDF Editing & Annotation',
    tagline: 'Add text, forms, watermarks, and numbers',
    description: 'Overlay watermarks, add page numbers, crop pages, change page size, and edit document metadata.',
    icon: 'FileEdit',
    order: 5,
  },
  'creation': {
    id: 'creation',
    name: 'PDF Creation & Authoring',
    tagline: 'Build documents from scratch or scans',
    description: 'Create PDFs from scratch, compose letters, capture documents with camera, and generate QR codes.',
    icon: 'FilePlus2',
    order: 6,
  },
  'convert-to-pdf': {
    id: 'convert-to-pdf',
    name: 'Convert to PDF',
    tagline: 'Transform documents and images into standard PDF',
    description: 'Convert Word, PowerPoint, Excel, Images, Text, RTF, Markdown, and OpenOffice files into clean PDFs.',
    icon: 'FileUp',
    order: 7,
  },
  'convert-from-pdf': {
    id: 'convert-from-pdf',
    name: 'Convert from PDF',
    tagline: 'Extract content into editable formats',
    description: 'Export PDFs into Word, PowerPoint, Excel, Images (JPG, PNG), Text, HTML, and Markdown.',
    icon: 'FileDown',
    order: 8,
  },
  'image-conversion': {
    id: 'image-conversion',
    name: 'Image Converter',
    tagline: 'Batch image format interchange',
    description: 'Convert between HEIC, WEBP, PNG, and JPG with quality preservation.',
    icon: 'Image',
    order: 9,
  },
  'invoice': {
    id: 'invoice',
    name: 'Invoice & E-Invoicing',
    tagline: 'Standard and electronic invoicing tools',
    description: 'Create visual invoices, generate ZUGFeRD / Factur-X XML e-invoices, and validate e-invoice schemas.',
    icon: 'Receipt',
    order: 10,
  },
  'viewing': {
    id: 'viewing',
    name: 'Viewing & Validation',
    tagline: 'Inspect, compare, and verify documents',
    description: 'View PDFs with search, visually compare two PDF files side by side, and check compliance.',
    icon: 'Eye',
    order: 11,
  },
  'platform': {
    id: 'platform',
    name: 'Platform & Productivity',
    tagline: 'Saved documents, PWA, and history',
    description: 'Access cross-device history, saved documents, offline support, and workspace preferences.',
    icon: 'Sparkles',
    order: 12,
  },
};
