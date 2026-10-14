import { ToolDefinition } from './types.js';

export const TOOLS_REGISTRY: ToolDefinition[] = [
  // ==========================================
  // Category A: Core PDF tools
  // ==========================================
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    category: 'core',
    shortDescription: 'Combine multiple PDF files into a single unified document in seconds.',
    description: 'Easily merge two or more PDF documents into one. Drag to rearrange document order, preview pages, and produce a clean, seamless output file.',
    icon: 'Layers',
    badge: 'Popular',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 50,
    allowMultiple: true,
    options: [
      {
        id: 'outlineMode',
        label: 'Bookmarks / Table of Contents',
        type: 'select',
        defaultValue: 'preserve',
        options: [
          { label: 'Preserve existing outlines', value: 'preserve' },
          { label: 'Generate TOC from file names', value: 'generate' },
          { label: 'Discard bookmarks', value: 'discard' }
        ]
      }
    ],
    keywords: ['combine', 'join', 'merge', 'concatenate', 'append', 'unify']
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    category: 'core',
    shortDescription: 'Separate a PDF into individual pages or specific custom ranges.',
    description: 'Extract specific pages or extract every page into separate files, or extract custom page intervals (e.g. 1-3, 5, 7-10) with full client-side security.',
    icon: 'Scissors',
    badge: 'Popular',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.zip',
    outputMimeType: 'application/zip',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'splitMode',
        label: 'Split Mode',
        type: 'radio',
        defaultValue: 'ranges',
        options: [
          { label: 'Custom Page Ranges (e.g. 1-3, 5)', value: 'ranges' },
          { label: 'Extract Every Page into Separate File', value: 'all' },
          { label: 'Split by Page Interval', value: 'interval' }
        ]
      },
      {
        id: 'pageRanges',
        label: 'Page Ranges',
        type: 'text',
        defaultValue: '1-2',
        description: 'Comma-separated page numbers or ranges (e.g. 1, 3-5, 8)'
      },
      {
        id: 'intervalCount',
        label: 'Interval Count',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 100,
        description: 'Split every N pages'
      }
    ],
    keywords: ['split', 'extract', 'separate', 'divide', 'cut', 'pages']
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    category: 'core',
    shortDescription: 'Reduce PDF file size while optimizing quality for web or archiving.',
    description: 'Compress high-resolution images, strip unneeded structural metadata, and optimize vector streams to achieve significant size reduction.',
    icon: 'FileArchive',
    badge: 'Popular',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'compressionLevel',
        label: 'Compression Preset',
        type: 'select',
        defaultValue: 'medium',
        options: [
          { label: 'Balanced (Recommended - Best quality/size)', value: 'medium', description: 'Optimal for daily sharing and emails' },
          { label: 'Maximum Compression (Smallest size)', value: 'high', description: 'Downsamples images for maximum reduction' },
          { label: 'Light Compression (High Quality)', value: 'low', description: 'Removes redundant metadata and objects' }
        ]
      },
      {
        id: 'removeMetadata',
        label: 'Strip Document Metadata',
        type: 'checkbox',
        defaultValue: true,
        description: 'Remove author, producer, and editing history'
      }
    ],
    keywords: ['compress', 'shrink', 'reduce size', 'optimize', 'minify']
  },
  {
    id: 'rotate-pages',
    name: 'Rotate Pages',
    category: 'organization',
    shortDescription: 'Rotate orientation of all or selected pages permanently.',
    description: 'Rotate PDF pages by 90°, 180°, or 270° clockwise. Choose to rotate all pages or only odd, even, or custom individual pages.',
    icon: 'RotateCw',
    badge: 'Core',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'rotationAngle',
        label: 'Rotation Direction',
        type: 'radio',
        defaultValue: 90,
        options: [
          { label: '90° Clockwise', value: 90 },
          { label: '180° Upside Down', value: 180 },
          { label: '90° Counter-Clockwise (270°)', value: 270 }
        ]
      },
      {
        id: 'targetPages',
        label: 'Target Pages',
        type: 'select',
        defaultValue: 'all',
        options: [
          { label: 'All Pages', value: 'all' },
          { label: 'Only Portrait Pages', value: 'portrait' },
          { label: 'Only Landscape Pages', value: 'landscape' },
          { label: 'Custom Range', value: 'custom' }
        ]
      },
      {
        id: 'customRange',
        label: 'Custom Range (if selected)',
        type: 'text',
        defaultValue: '1',
        description: 'e.g. 1, 3-5'
      }
    ],
    keywords: ['rotate', 'turn', 'orientation', 'landscape', 'portrait', 'flip']
  },
  {
    id: 'remove-pages',
    name: 'Remove Pages',
    category: 'organization',
    shortDescription: 'Delete unwanted pages from your PDF document.',
    description: 'Select and permanently remove blank, redundant, or sensitive pages from your PDF with visual confirmation.',
    icon: 'Trash2',
    badge: 'Core',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'pagesToRemove',
        label: 'Pages to Delete',
        type: 'text',
        defaultValue: '1',
        description: 'Comma separated list of pages to delete (e.g. 1, 4-6)'
      }
    ],
    keywords: ['delete pages', 'remove pages', 'trash', 'cut pages', 'drop pages']
  },
  {
    id: 'extract-pages',
    name: 'Extract Pages',
    category: 'organization',
    shortDescription: 'Extract chosen pages into a new clean PDF document.',
    description: 'Pick specific page numbers or page ranges to extract and assemble into a brand-new standalone PDF.',
    icon: 'Copy',
    badge: 'Core',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'pagesToExtract',
        label: 'Pages to Extract',
        type: 'text',
        defaultValue: '1',
        description: 'Comma separated list of pages (e.g. 1-3, 5)'
      }
    ],
    keywords: ['extract', 'select', 'pull pages', 'export pages']
  },
  {
    id: 'rearrange-pages',
    name: 'Rearrange Pages',
    category: 'organization',
    shortDescription: 'Reorder PDF pages visually or with custom ordering.',
    description: 'Change the order of pages in your document with drag-and-drop or explicit sequence notation.',
    icon: 'ArrowUpDown',
    badge: 'Core',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'pageOrder',
        label: 'New Page Order',
        type: 'text',
        defaultValue: 'reverse',
        description: 'Type "reverse" for reverse order or a sequence e.g. "3, 1, 2"'
      }
    ],
    keywords: ['reorder', 'sort', 'rearrange', 'shuffle', 'reverse']
  },
  {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    category: 'core',
    shortDescription: 'Convert JPG, PNG, WEBP, and GIF images into a polished PDF.',
    description: 'Combine multiple image files into a single elegant PDF document. Customize page orientation, margins, and layout.',
    icon: 'Images',
    badge: 'Popular',
    status: 'ready',
    supportedInputs: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
    supportedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 100,
    allowMultiple: true,
    options: [
      {
        id: 'pageSize',
        label: 'Page Size',
        type: 'select',
        defaultValue: 'a4',
        options: [
          { label: 'A4 (210 x 297 mm)', value: 'a4' },
          { label: 'US Letter (8.5 x 11 in)', value: 'letter' },
          { label: 'Fit to Image Dimensions', value: 'fit' }
        ]
      },
      {
        id: 'orientation',
        label: 'Orientation',
        type: 'select',
        defaultValue: 'auto',
        options: [
          { label: 'Automatic (Based on Image)', value: 'auto' },
          { label: 'Portrait', value: 'portrait' },
          { label: 'Landscape', value: 'landscape' }
        ]
      },
      {
        id: 'margin',
        label: 'Margins',
        type: 'select',
        defaultValue: 'none',
        options: [
          { label: 'No Margin (Full Bleed)', value: 'none' },
          { label: 'Small Margin (10mm)', value: 'small' },
          { label: 'Standard Margin (20mm)', value: 'standard' }
        ]
      }
    ],
    keywords: ['jpg to pdf', 'png to pdf', 'photos to pdf', 'pictures to pdf', 'images to pdf']
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images',
    category: 'core',
    shortDescription: 'Render and extract high-resolution JPG or PNG images from PDF pages.',
    description: 'Render every page of your PDF into crisp, high-resolution PNG or JPG images packaged in a zip archive or downloaded individually.',
    icon: 'FileImage',
    badge: 'Popular',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.zip',
    outputMimeType: 'application/zip',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'imageFormat',
        label: 'Format',
        type: 'radio',
        defaultValue: 'png',
        options: [
          { label: 'PNG (Lossless, sharp text)', value: 'png' },
          { label: 'JPG (Smaller size, photos)', value: 'jpeg' }
        ]
      },
      {
        id: 'scaleDpi',
        label: 'Rendering Quality / DPI',
        type: 'select',
        defaultValue: '2',
        options: [
          { label: 'Standard Web (150 DPI)', value: '1.5' },
          { label: 'High Resolution (300 DPI)', value: '2' },
          { label: 'Ultra High (600 DPI)', value: '3' }
        ]
      }
    ],
    keywords: ['pdf to jpg', 'pdf to png', 'extract pages as images', 'convert pdf to image']
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    category: 'security',
    shortDescription: 'Encrypt your PDF with standard password protection.',
    description: 'Apply industry-standard encryption to restrict opening or modifying the document without an authorized password.',
    icon: 'Lock',
    badge: 'Pending Phase',
    status: 'pending-phase-2',
    statusDetails: 'Requires containerized Cloud Run QPDF worker engine for cryptographic PDF encryption.',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'server',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'userPassword',
        label: 'Document Open Password',
        type: 'text',
        defaultValue: '',
        description: 'Required to open and view the document'
      },
      {
        id: 'confirmPassword',
        label: 'Confirm Password',
        type: 'text',
        defaultValue: '',
        description: 'Re-enter password for verification'
      }
    ],
    keywords: ['password', 'encrypt', 'lock', 'secure pdf', 'protect']
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    category: 'security',
    shortDescription: 'Remove password and restrictions from authorized PDFs.',
    description: 'Provide the document password once to permanently remove encryption and save an unencumbered PDF for easy viewing and editing.',
    icon: 'Unlock',
    badge: 'Pending Phase',
    status: 'pending-phase-2',
    statusDetails: 'Requires containerized Cloud Run QPDF worker engine for cryptographic PDF decryption.',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'server',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'currentPassword',
        label: 'Current Password',
        type: 'text',
        defaultValue: '',
        description: 'Enter existing password to decrypt'
      }
    ],
    keywords: ['unlock', 'decrypt', 'remove password', 'unprotect']
  },
  {
    id: 'add-watermark',
    name: 'Add Watermark',
    category: 'editing',
    shortDescription: 'Stamp customized text or image watermarks onto PDF pages.',
    description: 'Apply dynamic text watermarks (e.g. "CONFIDENTIAL", "DRAFT", or custom date/text) with angle, opacity, color, and font size controls.',
    icon: 'Stamp',
    badge: 'Core',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'watermarkText',
        label: 'Watermark Text',
        type: 'text',
        defaultValue: 'CONFIDENTIAL',
        description: 'Text to stamp across pages'
      },
      {
        id: 'fontSize',
        label: 'Font Size',
        type: 'range',
        defaultValue: 48,
        min: 12,
        max: 120,
        step: 2
      },
      {
        id: 'opacity',
        label: 'Opacity (Transparency)',
        type: 'range',
        defaultValue: 0.3,
        min: 0.05,
        max: 1.0,
        step: 0.05
      },
      {
        id: 'rotation',
        label: 'Angle (Degrees)',
        type: 'range',
        defaultValue: 45,
        min: -90,
        max: 90,
        step: 5
      },
      {
        id: 'color',
        label: 'Color',
        type: 'select',
        defaultValue: 'gray',
        options: [
          { label: 'Neutral Gray', value: 'gray' },
          { label: 'Alert Red', value: 'red' },
          { label: 'Royal Blue', value: 'blue' },
          { label: 'Black', value: 'black' }
        ]
      }
    ],
    keywords: ['watermark', 'stamp', 'confidential', 'draft', 'overlay text']
  },
  {
    id: 'add-page-numbers',
    name: 'Add Page Numbers',
    category: 'editing',
    shortDescription: 'Insert customized page numbering headers or footers.',
    description: 'Number your document pages with configurable formats (e.g. "Page {n} of {total}"), position (bottom center, top right, etc.), and margins.',
    icon: 'Hash',
    badge: 'Core',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'position',
        label: 'Position',
        type: 'select',
        defaultValue: 'bottom-center',
        options: [
          { label: 'Bottom Center', value: 'bottom-center' },
          { label: 'Bottom Right', value: 'bottom-right' },
          { label: 'Bottom Left', value: 'bottom-left' },
          { label: 'Top Right', value: 'top-right' },
          { label: 'Top Center', value: 'top-center' }
        ]
      },
      {
        id: 'format',
        label: 'Numbering Format',
        type: 'select',
        defaultValue: 'page-of-total',
        options: [
          { label: 'Page 1 of 10', value: 'page-of-total' },
          { label: '1 / 10', value: 'n-slash-total' },
          { label: 'Page 1', value: 'page-n' },
          { label: '1 (Plain number)', value: 'plain' }
        ]
      },
      {
        id: 'startPage',
        label: 'Start Numbering At Page',
        type: 'number',
        defaultValue: 1,
        min: 1
      }
    ],
    keywords: ['page numbers', 'numbering', 'pagination', 'footer numbers', 'header numbers']
  },
  {
    id: 'edit-metadata',
    name: 'Edit Metadata',
    category: 'editing',
    shortDescription: 'View and update PDF Title, Author, Subject, and Keywords.',
    description: 'Inspect existing document metadata fields and update them to clean or customize document identity before sharing.',
    icon: 'FileSpreadsheet',
    badge: 'Core',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'title',
        label: 'Title',
        type: 'text',
        defaultValue: '',
        description: 'Document title'
      },
      {
        id: 'author',
        label: 'Author',
        type: 'text',
        defaultValue: '',
        description: 'Document author or creator'
      },
      {
        id: 'subject',
        label: 'Subject',
        type: 'text',
        defaultValue: '',
        description: 'Summary subject'
      },
      {
        id: 'keywords',
        label: 'Keywords',
        type: 'text',
        defaultValue: '',
        description: 'Comma separated search keywords'
      }
    ],
    keywords: ['metadata', 'author', 'title', 'properties', 'tags']
  },
  {
    id: 'remove-metadata',
    name: 'Remove Metadata',
    category: 'security',
    shortDescription: 'Scrub all identifying metadata and tracking info from PDFs.',
    description: 'Permanently remove Author, Producer, Creation Date, Modification History, and embedded editing signatures to ensure complete document privacy.',
    icon: 'ShieldOff',
    badge: 'Private & Fast',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [],
    keywords: ['scrub', 'sanitize', 'strip metadata', 'clean pdf', 'privacy']
  },
  {
    id: 'create-pdf',
    name: 'Create PDF',
    category: 'creation',
    shortDescription: 'Compose and generate a clean PDF document directly from formatted text.',
    description: 'Quickly write rich notes, memos, letters, or formatted text documents and export them immediately as a professional PDF.',
    icon: 'FilePlus',
    badge: 'Core',
    status: 'ready',
    supportedInputs: ['.txt', '.md'],
    supportedMimeTypes: ['text/plain', 'text/markdown'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 10,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'documentTitle',
        label: 'Document Heading',
        type: 'text',
        defaultValue: 'My Document'
      },
      {
        id: 'fontSize',
        label: 'Body Font Size',
        type: 'select',
        defaultValue: '12',
        options: [
          { label: 'Compact (10pt)', value: '10' },
          { label: 'Standard (12pt)', value: '12' },
          { label: 'Large (14pt)', value: '14' }
        ]
      }
    ],
    keywords: ['new pdf', 'create pdf', 'write pdf', 'compose', 'generator']
  },
  {
    id: 'qr-code-to-pdf',
    name: 'QR Code Generator',
    category: 'creation',
    shortDescription: 'Generate high-resolution printable QR codes saved as PDF.',
    description: 'Convert any URL, contact card, or plain text into a crisp vector QR code formatted for clean printing on standard paper sizes.',
    icon: 'QrCode',
    badge: 'New',
    status: 'ready',
    supportedInputs: ['.txt'],
    supportedMimeTypes: ['text/plain'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 5,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'qrContent',
        label: 'QR Code URL or Content',
        type: 'text',
        defaultValue: 'https://',
        description: 'The URL or message encoded into the QR code'
      },
      {
        id: 'qrLabel',
        label: 'Caption Label',
        type: 'text',
        defaultValue: 'Scan me',
        description: 'Optional text printed below the QR code'
      }
    ],
    keywords: ['qr code', 'barcode', 'scan', 'print qr', 'url to qr']
  },
  {
    id: 'password-generator',
    name: 'Secure Password Generator',
    category: 'security',
    shortDescription: 'Generate cryptographically strong passwords for document protection.',
    description: 'Create high-entropy random passwords compliant with modern cryptographic standards to secure your sensitive PDF archives.',
    icon: 'KeyRound',
    badge: 'Private & Fast',
    status: 'ready',
    supportedInputs: [],
    supportedMimeTypes: [],
    outputFormat: '.txt',
    outputMimeType: 'text/plain',
    engine: 'client',
    maxFileSizeMB: 0,
    maxFiles: 0,
    allowMultiple: false,
    options: [
      {
        id: 'length',
        label: 'Password Length',
        type: 'range',
        defaultValue: 20,
        min: 8,
        max: 64,
        step: 1
      },
      {
        id: 'includeSpecial',
        label: 'Include Symbols',
        type: 'checkbox',
        defaultValue: true
      },
      {
        id: 'includeNumbers',
        label: 'Include Numbers',
        type: 'checkbox',
        defaultValue: true
      }
    ],
    keywords: ['password', 'generate password', 'security', 'crypto', 'random password']
  },
  {
    id: 'view-pdf',
    name: 'View & Read PDF',
    category: 'viewing',
    shortDescription: 'Open and inspect PDF files with fast browser rendering and page navigation.',
    description: 'A private in-browser PDF reader with zoom controls, thumbnail previews, full-text search, and responsive layout.',
    icon: 'Eye',
    badge: 'Core',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 150,
    maxFiles: 1,
    allowMultiple: false,
    options: [],
    keywords: ['view', 'reader', 'preview', 'read pdf', 'display pdf']
  },
  {
    id: 'sign-pdf',
    name: 'Sign PDF',
    category: 'core',
    shortDescription: 'Draw, type, or upload an electronic signature and place it on document pages.',
    description: 'Easily draw your electronic signature, type a stylized name, or upload a signature image. Position and resize signatures on any page. Note: Electronic signatures are distinct from cryptographic digital signatures.',
    icon: 'PenTool',
    badge: 'Popular',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'signatureText',
        label: 'Signature Text / Initials',
        type: 'text',
        defaultValue: '',
        description: 'Type signature if not drawing'
      }
    ],
    keywords: ['sign', 'signature', 'draw signature', 'e-sign', 'initials']
  },

  // ==========================================
  // Category B & C: Creation & Invoices (Documented Status)
  // ==========================================
  {
    id: 'invoice-generator',
    name: 'Create Invoice',
    category: 'invoice',
    shortDescription: 'Generate professional PDF invoices with automated totals and tax calculation.',
    description: 'Build clean, standardized customer invoices. Input line items, tax rates, billing addresses, and export compliant PDFs ready to send.',
    icon: 'Receipt',
    badge: 'New',
    status: 'ready',
    supportedInputs: ['.json'],
    supportedMimeTypes: ['application/json'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 10,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'currency',
        label: 'Currency',
        type: 'select',
        defaultValue: 'USD',
        options: [
          { label: 'USD ($)', value: 'USD' },
          { label: 'EUR (€)', value: 'EUR' },
          { label: 'GBP (£)', value: 'GBP' },
          { label: 'CAD ($)', value: 'CAD' }
        ]
      }
    ],
    keywords: ['invoice', 'bill', 'receipt', 'accounting', 'tax invoice']
  },
  {
    id: 'e-invoice-generator',
    name: 'Electronic Invoice (ZUGFeRD / Factur-X)',
    category: 'invoice',
    shortDescription: 'Generate hybrid PDF/A-3 invoices with embedded e-invoice XML schemas.',
    description: 'Compliant electronic invoice generation supporting EN 16931 standards (ZUGFeRD 2.2 / Factur-X). Embeds structured XML payloads into archival PDF/A-3 files.',
    icon: 'FileCode2',
    badge: 'Pending Phase',
    status: 'pending-phase-5',
    statusDetails: 'Scheduled for Phase 5: Advanced Tools & E-Invoice Schemas. Supports ZUGFeRD 2.2 and Factur-X EN 16931 compliant XML serialization.',
    supportedInputs: ['.pdf', '.xml'],
    supportedMimeTypes: ['application/pdf', 'application/xml', 'text/xml'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'server',
    maxFileSizeMB: 50,
    maxFiles: 1,
    allowMultiple: false,
    options: [],
    keywords: ['zugferd', 'factur-x', 'e-invoice', 'electronic invoice', 'xml invoice']
  },
  {
    id: 'validate-e-invoice',
    name: 'Validate E-Invoice',
    category: 'invoice',
    shortDescription: 'Validate electronic invoice XML syntax and EN 16931 schema compliance.',
    description: 'Inspect PDF/A-3 or standalone XML e-invoices against Schematron rules and European standard requirements.',
    icon: 'CheckCircle2',
    badge: 'Pending Phase',
    status: 'pending-phase-5',
    statusDetails: 'Scheduled for Phase 5. Validates Schematron and EN 16931 business rules for ZUGFeRD and Peppol BIS Billing 3.0.',
    supportedInputs: ['.pdf', '.xml'],
    supportedMimeTypes: ['application/pdf', 'application/xml'],
    outputFormat: '.json',
    outputMimeType: 'application/json',
    engine: 'server',
    maxFileSizeMB: 25,
    maxFiles: 1,
    allowMultiple: false,
    options: [],
    keywords: ['validate invoice', 'zugferd check', 'e-invoice validation']
  },

  // ==========================================
  // Category D: PDF Editing
  // ==========================================
  {
    id: 'crop-pages',
    name: 'Crop Pages',
    category: 'editing',
    shortDescription: 'Trim margins and crop specific regions across document pages.',
    description: 'Set custom page margins or crop boxes to eliminate unnecessary white space, headers, or scanning borders.',
    icon: 'Crop',
    badge: 'New',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'margin',
        label: 'Margin Trim (pt)',
        type: 'number',
        defaultValue: 28,
        min: 5,
        max: 150,
        description: 'Amount of margin to trim from all sides (28pt ≈ 10mm)'
      }
    ],
    keywords: ['crop', 'trim', 'margins', 'cut margins']
  },
  {
    id: 'change-page-size',
    name: 'Change Page Size',
    category: 'editing',
    shortDescription: 'Resize pages to standard dimensions (A4, Letter, A3, Legal).',
    description: 'Scale or pad pages to match international paper standards while preserving content proportions.',
    icon: 'Maximize2',
    badge: 'New',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [
      {
        id: 'pageSize',
        label: 'Target Page Size',
        type: 'select',
        defaultValue: 'a4',
        options: [
          { label: 'A4 (210 × 297 mm)', value: 'a4' },
          { label: 'US Letter (8.5 × 11 in)', value: 'letter' },
          { label: 'US Legal (8.5 × 14 in)', value: 'legal' },
          { label: 'A3 (297 × 420 mm)', value: 'a3' }
        ]
      },
      {
        id: 'orientation',
        label: 'Orientation',
        type: 'select',
        defaultValue: 'portrait',
        options: [
          { label: 'Portrait', value: 'portrait' },
          { label: 'Landscape', value: 'landscape' }
        ]
      }
    ],
    keywords: ['resize', 'page size', 'a4', 'letter', 'scale']
  },
  {
    id: 'overlay-pdf',
    name: 'Overlay PDF',
    category: 'editing',
    shortDescription: 'Overlay a letterhead or template PDF onto existing document pages.',
    description: 'Superimpose corporate stationery, background graphics, or legal templates across every page.',
    icon: 'Layers2',
    badge: 'New',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 2,
    allowMultiple: true,
    options: [
      {
        id: 'opacity',
        label: 'Overlay Opacity',
        type: 'range',
        defaultValue: 0.85,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        description: 'Transparency of the overlay layer (0.1 to 1.0)'
      }
    ],
    keywords: ['overlay', 'letterhead', 'stationery', 'background', 'underlay']
  },

  // ==========================================
  // Category F: Optimization & Repair
  // ==========================================
  {
    id: 'ocr-pdf',
    name: 'OCR Scanned PDF',
    category: 'optimization',
    shortDescription: 'Optical Character Recognition to convert scanned images into selectable, searchable text.',
    description: 'Analyze scanned document pages using Tesseract OCR to generate a searchable text layer while preserving original layout.',
    icon: 'ScanText',
    badge: 'Pending Phase',
    status: 'pending-phase-5',
    statusDetails: 'Scheduled for Phase 5: Containerized Cloud Worker with Tesseract OCR engine.',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'server',
    maxFileSizeMB: 150,
    maxFiles: 1,
    allowMultiple: false,
    options: [],
    keywords: ['ocr', 'searchable', 'text recognition', 'scanned pdf']
  },
  {
    id: 'repair-pdf',
    name: 'Repair PDF',
    category: 'optimization',
    shortDescription: 'Recover readable content from damaged or corrupted PDF files.',
    description: 'Analyze damaged PDF xref tables, reconstruct stream dictionaries, and rebuild structurally corrupted files using QPDF / Ghostscript recovery workers.',
    icon: 'Wrench',
    badge: 'Pending Phase',
    status: 'pending-phase-5',
    statusDetails: 'Scheduled for Phase 5: Cloud Run worker leveraging QPDF structural rebuild routines.',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'server',
    maxFileSizeMB: 150,
    maxFiles: 1,
    allowMultiple: false,
    options: [],
    keywords: ['repair', 'corrupted', 'fix pdf', 'recovery', 'rebuild']
  },
  {
    id: 'pdf-to-pdfa',
    name: 'Convert PDF to PDF/A',
    category: 'optimization',
    shortDescription: 'Convert documents into standardized archival formats (PDF/A-1b, PDF/A-2b).',
    description: 'Ensure long-term document preservation and compliance by embedding all fonts, defining color profiles, and stripping device-dependent features.',
    icon: 'Archive',
    badge: 'Pending Phase',
    status: 'pending-phase-5',
    statusDetails: 'Scheduled for Phase 5: Archival conformance engine via Ghostscript / VeraPDF validation.',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'server',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [],
    keywords: ['pdf/a', 'archive', 'long-term', 'iso 19005', 'compliance']
  },

  // ==========================================
  // Category G: Security & Privacy
  // ==========================================
  {
    id: 'redact-pdf',
    name: 'Permanently Redact PDF',
    category: 'security',
    shortDescription: 'Permanently remove underlying sensitive text, numbers, and images.',
    description: 'True structural redaction: strips underlying vector characters, image tiles, and metadata rather than merely superimposing a visual black box.',
    icon: 'Eraser',
    badge: 'Pending Phase',
    status: 'pending-phase-4',
    statusDetails: 'Scheduled for Phase 4: Deep content stream sanitization and redaction engine.',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'server',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [],
    keywords: ['redact', 'blackout', 'privacy', 'censor', 'sanitize text']
  },

  // ==========================================
  // Category H: Viewing & Validation
  // ==========================================
  {
    id: 'compare-pdf',
    name: 'Compare Two PDFs',
    category: 'viewing',
    shortDescription: 'Visually and textually highlight differences between two document revisions.',
    description: 'Side-by-side comparative diff showing modified text, inserted pages, and pixel-level graphic changes between two PDF versions.',
    icon: 'GitCompare',
    badge: 'Pending Phase',
    status: 'pending-phase-5',
    statusDetails: 'Scheduled for Phase 5: Dual-canvas difference rendering engine.',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 100,
    maxFiles: 2,
    allowMultiple: true,
    options: [],
    keywords: ['compare', 'diff', 'versions', 'side by side', 'changes']
  },

  // ==========================================
  // Category I: Convert to PDF (Office & Formats)
  // ==========================================
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    category: 'convert-to-pdf',
    shortDescription: 'Convert Microsoft Word documents (.docx, .doc) into high-fidelity PDFs.',
    description: 'Convert Word documents preserving typography, tables, headers, footers, and hyperlinks using server-side containerized LibreOffice.',
    icon: 'FileText',
    badge: 'Pending Phase',
    status: 'pending-phase-3',
    statusDetails: 'Scheduled for Phase 3: Cloud Run containerized LibreOffice conversion worker.',
    supportedInputs: ['.docx', '.doc', '.dotx'],
    supportedMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'server',
    maxFileSizeMB: 100,
    maxFiles: 10,
    allowMultiple: true,
    options: [],
    keywords: ['word to pdf', 'docx to pdf', 'doc to pdf', 'microsoft word']
  },
  {
    id: 'powerpoint-to-pdf',
    name: 'PowerPoint to PDF',
    category: 'convert-to-pdf',
    shortDescription: 'Convert PowerPoint presentations (.pptx, .ppt) to PDF slides.',
    description: 'Export slides with high-resolution layout fidelity ready for presenting, printing, and archiving.',
    icon: 'Presentation',
    badge: 'Pending Phase',
    status: 'pending-phase-3',
    statusDetails: 'Scheduled for Phase 3: Cloud Run LibreOffice presentation converter.',
    supportedInputs: ['.pptx', '.ppt'],
    supportedMimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'server',
    maxFileSizeMB: 100,
    maxFiles: 10,
    allowMultiple: true,
    options: [],
    keywords: ['pptx to pdf', 'powerpoint to pdf', 'slides to pdf']
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    category: 'convert-to-pdf',
    shortDescription: 'Convert Excel spreadsheets (.xlsx, .xls) to structured PDF tables.',
    description: 'Fit worksheets onto standard pages with formatting, calculations, and tables preserved.',
    icon: 'Sheet',
    badge: 'Pending Phase',
    status: 'pending-phase-3',
    statusDetails: 'Scheduled for Phase 3: Cloud Run spreadsheet conversion worker.',
    supportedInputs: ['.xlsx', '.xls', '.csv'],
    supportedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'server',
    maxFileSizeMB: 50,
    maxFiles: 10,
    allowMultiple: true,
    options: [],
    keywords: ['excel to pdf', 'xlsx to pdf', 'spreadsheet to pdf', 'csv to pdf']
  },
  {
    id: 'text-to-pdf',
    name: 'Text & Markdown to PDF',
    category: 'convert-to-pdf',
    shortDescription: 'Convert plain text (.txt) and Markdown (.md) to formatted PDF.',
    description: 'Instantly convert code snippets, notes, and Markdown files into cleanly formatted PDF documents.',
    icon: 'FileCode',
    badge: 'Core',
    status: 'ready',
    supportedInputs: ['.txt', '.md'],
    supportedMimeTypes: ['text/plain', 'text/markdown'],
    outputFormat: '.pdf',
    outputMimeType: 'application/pdf',
    engine: 'client',
    maxFileSizeMB: 10,
    maxFiles: 1,
    allowMultiple: false,
    options: [],
    keywords: ['text to pdf', 'markdown to pdf', 'txt to pdf', 'md to pdf']
  },

  // ==========================================
  // Category J: Convert PDF to Other Formats
  // ==========================================
  {
    id: 'pdf-to-word',
    name: 'PDF to Word (DOCX)',
    category: 'convert-from-pdf',
    shortDescription: 'Convert PDF documents into editable Microsoft Word (.docx) files.',
    description: 'Extract layout, paragraph flows, and tabular data into an editable DOCX document using PyMuPDF / LibreOffice text reconstruction.',
    icon: 'FileEdit',
    badge: 'Pending Phase',
    status: 'pending-phase-3',
    statusDetails: 'Scheduled for Phase 3: Dedicated structural text and layout reconstructor.',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.docx',
    outputMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    engine: 'server',
    maxFileSizeMB: 100,
    maxFiles: 1,
    allowMultiple: false,
    options: [],
    keywords: ['pdf to word', 'pdf to docx', 'editable word', 'convert to word']
  },
  {
    id: 'pdf-to-text',
    name: 'PDF to Plain Text',
    category: 'convert-from-pdf',
    shortDescription: 'Extract raw text streams and content from PDF pages.',
    description: 'Fast, client-side extraction of all readable text from any PDF document, exportable as a plain UTF-8 text file.',
    icon: 'FileText',
    badge: 'Core',
    status: 'ready',
    supportedInputs: ['.pdf'],
    supportedMimeTypes: ['application/pdf'],
    outputFormat: '.txt',
    outputMimeType: 'text/plain',
    engine: 'client',
    maxFileSizeMB: 50,
    maxFiles: 1,
    allowMultiple: false,
    options: [],
    keywords: ['pdf to text', 'extract text', 'copy text', 'txt export']
  },

  // ==========================================
  // Category K: Image Conversions
  // ==========================================
  {
    id: 'webp-to-jpg',
    name: 'WEBP to JPG',
    category: 'image-conversion',
    shortDescription: 'Convert modern WEBP graphics to universal JPEG format.',
    description: 'High-speed browser-based canvas conversion with custom JPEG quality compression controls.',
    icon: 'Image',
    badge: 'Private & Fast',
    status: 'ready',
    supportedInputs: ['.webp'],
    supportedMimeTypes: ['image/webp'],
    outputFormat: '.jpg',
    outputMimeType: 'image/jpeg',
    engine: 'client',
    maxFileSizeMB: 50,
    maxFiles: 50,
    allowMultiple: true,
    options: [
      {
        id: 'quality',
        label: 'JPEG Quality',
        type: 'range',
        defaultValue: 0.92,
        min: 0.5,
        max: 1.0,
        step: 0.05
      }
    ],
    keywords: ['webp to jpg', 'webp to jpeg', 'convert webp']
  },
  {
    id: 'webp-to-png',
    name: 'WEBP to PNG',
    category: 'image-conversion',
    shortDescription: 'Convert WEBP files to lossless PNG with transparency.',
    description: 'Preserve alpha transparency and convert WEBP assets to standard PNG format directly in your browser.',
    icon: 'Image',
    badge: 'Private & Fast',
    status: 'ready',
    supportedInputs: ['.webp'],
    supportedMimeTypes: ['image/webp'],
    outputFormat: '.png',
    outputMimeType: 'image/png',
    engine: 'client',
    maxFileSizeMB: 50,
    maxFiles: 50,
    allowMultiple: true,
    options: [],
    keywords: ['webp to png', 'transparent png', 'image convert']
  }
];

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOLS_REGISTRY.find(tool => tool.id === id);
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  return TOOLS_REGISTRY.filter(tool => tool.category === category);
}

export function searchTools(query: string): ToolDefinition[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return TOOLS_REGISTRY;
  return TOOLS_REGISTRY.filter(tool => {
    return (
      tool.name.toLowerCase().includes(clean) ||
      tool.shortDescription.toLowerCase().includes(clean) ||
      tool.category.toLowerCase().includes(clean) ||
      tool.keywords.some(k => k.toLowerCase().includes(clean))
    );
  });
}
