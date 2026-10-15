import { getToolById, ToolDefinition } from '@pdf-toolbox/shared';
import { mergePdfs } from './operations/merge.js';
import { splitPdf, SplitResult } from './operations/split.js';
import { rotatePdfPages } from './operations/rotate.js';
import { removePdfPages } from './operations/removePages.js';
import { rearrangePdfPages, extractPdfPages } from './operations/rearrangePages.js';
import { addWatermark } from './operations/watermark.js';
import { addPageNumbers } from './operations/pageNumbers.js';
import { editOrRemoveMetadata } from './operations/metadata.js';
import { convertImagesToPdf, ImageInput } from './operations/imagesToPdf.js';
import { convertTextToPdf } from './operations/textToPdf.js';
import { compressPdf } from './operations/compress.js';
import { generateSecurePassword } from './operations/security.js';
import { halvePdfPages } from './operations/halvePages.js';
import { generateInvoicePdf } from './operations/invoice.js';
import { signPdfDocument } from './operations/sign.js';
import { changePdfPageSize } from './operations/changePageSize.js';
import { cropPdfPages } from './operations/cropPages.js';
import { overlayPdfDocuments } from './operations/overlayPdf.js';

export interface FileInputPayload {
  name: string;
  size: number;
  mimeType: string;
  data: Uint8Array;
  rotation?: number;
}

export interface ToolExecutionRequest {
  toolId: string;
  files: FileInputPayload[];
  options: Record<string, any>;
  onProgress?: (progress: number, message: string) => void;
}

export interface ToolExecutionResponse {
  success: boolean;
  toolId: string;
  outputData?: Uint8Array;
  outputMimeType?: string;
  outputFilename?: string;
  isZip?: boolean;
  metadata?: Record<string, any>;
  statusMessage: string;
  pendingNotice?: string;
}

export async function executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResponse> {
  const { toolId, files, options, onProgress } = request;
  const tool = getToolById(toolId);

  if (!tool) {
    throw new Error(`Tool "${toolId}" is not recognized in the registry.`);
  }

  // Handle pending tools with explicit, documented phase status
  if (tool.status.startsWith('pending-')) {
    onProgress?.(100, tool.statusDetails || 'This tool is scheduled for subsequent phases.');
    return {
      success: false,
      toolId,
      statusMessage: 'Phase Scheduled Feature',
      pendingNotice: tool.statusDetails || `This tool is scheduled in accordance with the phased development roadmap (${tool.status}).`
    };
  }

  // Validate files requirement
  if (tool.maxFiles > 0 && files.length === 0) {
    throw new Error(`Please upload at least one file to use ${tool.name}.`);
  }

  const primaryFile = files[0];
  const baseName = primaryFile ? primaryFile.name.replace(/\.[^/.]+$/, '') : 'document';

  onProgress?.(5, `Starting ${tool.name}...`);

  switch (toolId) {
    case 'merge-pdf': {
      const buffers = files.map(f => f.data);
      const mergedBytes = await mergePdfs(buffers, {
        outlineMode: options.outlineMode,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: mergedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-merged.pdf`,
        statusMessage: `Successfully merged ${files.length} documents.`
      };
    }

    case 'split-pdf': {
      const result: SplitResult = await splitPdf(primaryFile.data, {
        splitMode: options.splitMode || 'ranges',
        pageRanges: options.pageRanges,
        intervalCount: Number(options.intervalCount) || 1,
        baseFilename: baseName,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: result.data,
        outputMimeType: result.mimeType,
        outputFilename: result.filename,
        isZip: result.isZip,
        statusMessage: 'PDF successfully split.'
      };
    }

    case 'compress-pdf': {
      const result = await compressPdf(primaryFile.data, {
        compressionLevel: options.compressionLevel || 'medium',
        removeMetadata: options.removeMetadata !== false,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: result.data,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-compressed.pdf`,
        metadata: {
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          savedBytes: result.savedBytes,
          savedPercentage: result.savedPercentage
        },
        statusMessage: `Compressed: Saved ${result.savedPercentage}% (${Math.round(result.savedBytes / 1024)} KB reduction).`
      };
    }

    case 'rotate-pages': {
      const rotatedBytes = await rotatePdfPages(primaryFile.data, {
        rotationAngle: Number(options.rotationAngle) || 90,
        targetPages: options.targetPages || 'all',
        customRange: options.customRange,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: rotatedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-rotated.pdf`,
        statusMessage: 'Pages rotated successfully.'
      };
    }

    case 'remove-pages': {
      const removedBytes = await removePdfPages(primaryFile.data, {
        pagesToRemove: options.pagesToRemove || '1',
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: removedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-removed-pages.pdf`,
        statusMessage: 'Unwanted pages permanently removed.'
      };
    }

    case 'extract-pages': {
      const extractedBytes = await extractPdfPages(
        primaryFile.data,
        options.pagesToExtract || '1',
        onProgress
      );
      return {
        success: true,
        toolId,
        outputData: extractedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-extracted.pdf`,
        statusMessage: 'Selected pages extracted into new document.'
      };
    }

    case 'rearrange-pages': {
      const rearrangedBytes = await rearrangePdfPages(primaryFile.data, {
        pageOrder: options.pageOrder || 'reverse',
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: rearrangedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-reordered.pdf`,
        statusMessage: 'Page order successfully rearranged.'
      };
    }

    case 'add-watermark': {
      const watermarkedBytes = await addWatermark(primaryFile.data, {
        watermarkText: options.watermarkText || 'CONFIDENTIAL',
        fontSize: Number(options.fontSize) || 48,
        opacity: Number(options.opacity) || 0.3,
        rotation: Number(options.rotation) || 45,
        color: options.color || 'gray',
        position: options.position || 'center',
        xPercent: options.xPercent !== undefined ? Number(options.xPercent) : 50,
        yPercent: options.yPercent !== undefined ? Number(options.yPercent) : 50,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: watermarkedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-watermarked.pdf`,
        statusMessage: 'Watermark stamped across all pages.'
      };
    }

    case 'add-page-numbers': {
      const numberedBytes = await addPageNumbers(primaryFile.data, {
        position: options.position || 'bottom-center',
        format: options.format || 'page-of-total',
        startPage: Number(options.startPage) || 1,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: numberedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-numbered.pdf`,
        statusMessage: 'Page numbering added.'
      };
    }

    case 'edit-metadata': {
      const updatedBytes = await editOrRemoveMetadata(primaryFile.data, {
        title: options.title,
        author: options.author,
        subject: options.subject,
        keywords: options.keywords,
        removeOnly: false,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: updatedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-metadata.pdf`,
        statusMessage: 'Document metadata updated.'
      };
    }

    case 'remove-metadata': {
      const cleanedBytes = await editOrRemoveMetadata(primaryFile.data, {
        removeOnly: true,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: cleanedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-clean.pdf`,
        statusMessage: 'All metadata and tracking records scrubbed.'
      };
    }

    case 'images-to-pdf': {
      const imagePayloads: ImageInput[] = files.map(f => ({
        name: f.name,
        data: f.data,
        mimeType: f.mimeType,
        rotation: f.rotation
      }));
      const pdfBytes = await convertImagesToPdf(imagePayloads, {
        pageSize: options.pageSize || 'a4',
        orientation: options.orientation || 'auto',
        margin: options.margin || 'none',
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: pdfBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-images.pdf`,
        statusMessage: `Converted ${files.length} images to PDF.`
      };
    }

    case 'create-pdf': {
      const content = options.content || (primaryFile ? new TextDecoder('utf-8').decode(primaryFile.data) : 'My PDF Document');
      const pdfBytes = await convertTextToPdf(content, {
        documentTitle: options.title || 'Created Document',
        fontSize: Number(options.fontSize) || 12,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: pdfBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${(options.title || 'document').toLowerCase().replace(/[^a-z0-9_-]/gi, '-')}.pdf`,
        statusMessage: 'New PDF document created successfully.'
      };
    }

    case 'text-to-pdf': {
      const textDecoder = new TextDecoder('utf-8');
      const text = textDecoder.decode(primaryFile.data);
      const pdfBytes = await convertTextToPdf(text, {
        documentTitle: options.documentTitle || primaryFile.name.replace(/\.[^/.]+$/, ''),
        fontSize: Number(options.fontSize) || 11,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: pdfBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}.pdf`,
        statusMessage: 'Text document formatted and rendered to PDF.'
      };
    }

    case 'change-page-size': {
      const resizedBytes = await changePdfPageSize(primaryFile.data, {
        pageSize: options.pageSize || 'a4',
        orientation: options.orientation || 'portrait',
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: resizedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-resized.pdf`,
        statusMessage: `Document page size changed to ${(options.pageSize || 'A4').toUpperCase()}.`
      };
    }

    case 'crop-pages': {
      const croppedBytes = await cropPdfPages(primaryFile.data, {
        margin: Number(options.margin) || 28.3,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: croppedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-cropped.pdf`,
        statusMessage: 'Document margins cropped successfully.'
      };
    }

    case 'overlay-pdf': {
      const overlayFile = files[1] || primaryFile;
      const overlayBytes = await overlayPdfDocuments(primaryFile.data, overlayFile.data, {
        opacity: Number(options.opacity) || 0.85,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: overlayBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-overlay.pdf`,
        statusMessage: 'Document overlay applied successfully.'
      };
    }

    case 'password-generator': {
      const length = Number(options.length) || 20;
      const pwd = generateSecurePassword({
        length,
        includeSpecial: options.includeSpecial !== false,
        includeNumbers: options.includeNumbers !== false
      });
      const enc = new TextEncoder();
      return {
        success: true,
        toolId,
        outputData: enc.encode(pwd),
        outputMimeType: 'text/plain',
        outputFilename: 'secure-password.txt',
        metadata: { password: pwd },
        statusMessage: `Generated ${length}-character high-entropy password.`
      };
    }

    case 'halve-pages': {
      const halvedBytes = await halvePdfPages(primaryFile.data, {
        splitDirection: options.splitDirection || 'vertical',
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: halvedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-halved.pdf`,
        statusMessage: 'Document pages successfully halved.'
      };
    }

    case 'sign-pdf': {
      const signedBytes = await signPdfDocument(primaryFile.data, {
        signatureText: options.signatureText || 'Digitally Signed',
        signatureImageBytes: options.signatureImageBytes,
        signatureImageMime: options.signatureImageMime || 'image/png',
        pageNumber: Number(options.pageNumber) || undefined,
        xPosition: options.xPosition !== undefined ? Number(options.xPosition) : undefined,
        yPosition: options.yPosition !== undefined ? Number(options.yPosition) : undefined,
        stampWidth: options.stampWidth !== undefined ? Number(options.stampWidth) : undefined,
        stampHeight: options.stampHeight !== undefined ? Number(options.stampHeight) : undefined,
        includeDate: Boolean(options.includeDate),
        dateString: options.dateString,
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: signedBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `${baseName}-signed.pdf`,
        statusMessage: 'Electronic signature placed on document.'
      };
    }

    case 'invoice-generator': {
      const invoiceBytes = await generateInvoicePdf({
        currency: options.currency || 'USD',
        onProgress
      });
      return {
        success: true,
        toolId,
        outputData: invoiceBytes,
        outputMimeType: 'application/pdf',
        outputFilename: `invoice-${Date.now()}.pdf`,
        statusMessage: 'Standard invoice PDF successfully generated.'
      };
    }

    default:
      throw new Error(`Handler for tool "${toolId}" is not yet configured.`);
  }
}
