import React, { useState, useRef, useEffect } from 'react';
import type { ToolDefinition } from '@pdf-toolbox/shared';
import { executeTool } from '@pdf-toolbox/pdf-tools';
import type { ToolExecutionResponse, FileInputPayload } from '@pdf-toolbox/pdf-tools';
import { IconRenderer } from './IconRenderer';
import { FilePreviewGrid } from './FilePreviewGrid';
import type { PreviewFileItem } from './FilePreviewGrid';
import { SignaturePad } from './SignaturePad';
import {
  getPdfFirstPageThumbnail,
  convertPdfToImages,
  extractTextFromPdf,
  generateQrCodeDataUrl
} from '../utils/pdfHelper';
import type { PdfPageImage } from '../utils/pdfHelper';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import {
  UploadCloud,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Bookmark,
  Copy,
  Check,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ToolWorkspaceProps {
  tool: ToolDefinition;
  onBack: () => void;
  onSaveDocument?: (doc: { filename: string; size: number; toolId: string; blob: Blob }) => void;
  onRecordHistory?: (job: { toolId: string; filename: string; size: number; status: string }) => void;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  tool,
  onBack,
  onSaveDocument,
  onRecordHistory
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<PreviewFileItem[]>([]);
  const [options, setOptions] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    tool.options.forEach(opt => {
      initial[opt.id] = opt.defaultValue;
    });
    return initial;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ToolExecutionResponse | null>(null);
  const [savedToCloud, setSavedToCloud] = useState(false);

  // Specialized Tool State
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);
  const [renderedPdfImages, setRenderedPdfImages] = useState<PdfPageImage[]>([]);
  const [liveQrCodeUrl, setLiveQrCodeUrl] = useState<string>('');
  const [composedText, setComposedText] = useState<string>(
    '# Document Title\n\nType your content here or paste text to convert directly to a clean PDF document.\n\n- Point 1\n- Point 2\n- Point 3'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPending = tool.status.startsWith('pending-');

  // Live QR Code Generation
  useEffect(() => {
    if (tool.id === 'qr-code-to-pdf') {
      const content = options.qrContent || 'https://';
      generateQrCodeDataUrl(content).then(url => setLiveQrCodeUrl(url)).catch(() => {});
    }
  }, [tool.id, options.qrContent]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    setErrorMessage(null);

    // Validate size and count
    const maxSizeBytes = tool.maxFileSizeMB * 1024 * 1024;
    const validFiles: File[] = [];

    for (const f of newFiles) {
      if (f.size > maxSizeBytes && tool.maxFileSizeMB > 0) {
        setErrorMessage(`File "${f.name}" exceeds the maximum limit of ${tool.maxFileSizeMB} MB.`);
        return;
      }
      validFiles.push(f);
    }

    const newPreviewItems: PreviewFileItem[] = validFiles.map(f => {
      const isImg = f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(f.name);
      const isPdfFile = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: f,
        rotation: 0,
        isPdf: isPdfFile,
        isImage: isImg,
        thumbnailUrl: isImg ? URL.createObjectURL(f) : undefined
      };
    });

    // Asynchronously render PDF first page thumbnails
    newPreviewItems.forEach(item => {
      if (item.isPdf) {
        item.file.arrayBuffer().then(buf => {
          getPdfFirstPageThumbnail(new Uint8Array(buf), 0.4).then(thumb => {
            if (thumb) {
              setPreviewFiles(prev => prev.map(p => p.id === item.id ? { ...p, thumbnailUrl: thumb } : p));
            }
          });
        });
      }
    });

    if (tool.allowMultiple) {
      const combined = [...previewFiles, ...newPreviewItems].slice(0, tool.maxFiles || 200);
      setPreviewFiles(combined);
      setFiles(combined.map(p => p.file));
    } else {
      const single = [newPreviewItems[0]];
      setPreviewFiles(single);
      setFiles([single[0].file]);
    }
  };

  const handleReorderFiles = (reordered: PreviewFileItem[]) => {
    setPreviewFiles(reordered);
    setFiles(reordered.map(p => p.file));
  };

  const handleRemoveFile = (id: string) => {
    const updated = previewFiles.filter(p => p.id !== id);
    setPreviewFiles(updated);
    setFiles(updated.map(p => p.file));
    if (updated.length === 0) {
      setResult(null);
    }
  };

  const handleRotateFile = (id: string) => {
    setPreviewFiles(prev => prev.map(p => (
      p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    )));
  };

  const clearAllFiles = () => {
    // Revoke object URLs to avoid memory leaks
    previewFiles.forEach(p => {
      if (p.isImage && p.thumbnailUrl) {
        try { URL.revokeObjectURL(p.thumbnailUrl); } catch {}
      }
    });
    setFiles([]);
    setPreviewFiles([]);
    setResult(null);
    setErrorMessage(null);
    setRenderedPdfImages([]);
    setExtractedText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOptionChange = (optionId: string, value: any) => {
    setOptions(prev => ({ ...prev, [optionId]: value }));
  };

  // Convert WEBP or non-standard image to clean PNG for pdf-lib
  const ensureStandardImageBytes = async (file: File): Promise<{ data: Uint8Array; mimeType: string }> => {
    if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png') {
      const buf = await file.arrayBuffer();
      return { data: new Uint8Array(buf), mimeType: file.type };
    }
    // Convert WEBP, BMP, SVG to PNG in browser
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const pngBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(b => resolve(b || new Blob()), 'image/png');
      });
      const buf = await pngBlob.arrayBuffer();
      return { data: new Uint8Array(buf), mimeType: 'image/png' };
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  // Run the Tool Processing
  const handleProcess = async () => {
    const isTextComposer = tool.id === 'create-pdf';
    const isQrCode = tool.id === 'qr-code-to-pdf';

    if (!isTextComposer && !isQrCode && tool.maxFiles > 0 && files.length === 0) {
      setErrorMessage('Please select a file to process.');
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('Reading input data...');
    setErrorMessage(null);
    setResult(null);
    setSavedToCloud(false);
    setRenderedPdfImages([]);
    setExtractedText('');

    try {
      const primaryFile = files[0];
      const baseName = primaryFile ? primaryFile.name.replace(/\.[^/.]+$/, '') : 'document';

      // ==========================================
      // Handler 1: PDF to Images (Client Canvas)
      // ==========================================
      if (tool.id === 'pdf-to-images' && primaryFile) {
        setStatusMessage('Extracting and rendering PDF pages...');
        const buf = await primaryFile.arrayBuffer();
        const { images, zipBlob } = await convertPdfToImages(
          new Uint8Array(buf),
          options.format || 'png',
          2.0,
          (p, msg) => {
            setProgress(p);
            setStatusMessage(msg);
          }
        );
        setRenderedPdfImages(images);
        const zipBytes = new Uint8Array(await zipBlob.arrayBuffer());
        setResult({
          success: true,
          toolId: tool.id,
          outputData: zipBytes,
          outputMimeType: 'application/zip',
          outputFilename: `${baseName}-images.zip`,
          statusMessage: `Successfully converted ${images.length} pages to high-resolution ${options.format?.toUpperCase() || 'PNG'} images.`
        });
      }

      // ==========================================
      // Handler 2: PDF to Plain Text
      // ==========================================
      else if (tool.id === 'pdf-to-text' && primaryFile) {
        setStatusMessage('Reading text streams from PDF...');
        const buf = await primaryFile.arrayBuffer();
        const text = await extractTextFromPdf(new Uint8Array(buf), (p, msg) => {
          setProgress(p);
          setStatusMessage(msg);
        });
        setExtractedText(text);
        const enc = new TextEncoder();
        setResult({
          success: true,
          toolId: tool.id,
          outputData: enc.encode(text),
          outputMimeType: 'text/plain',
          outputFilename: `${baseName}-extracted.txt`,
          statusMessage: 'Text content successfully extracted from all pages.'
        });
      }

      // ==========================================
      // Handler 3: QR Code to PDF
      // ==========================================
      else if (tool.id === 'qr-code-to-pdf') {
        setStatusMessage('Generating vector QR code...');
        setProgress(30);
        const qrContent = options.qrContent || 'https://';
        const qrLabel = options.qrLabel || 'Scan QR Code';
        const qrDataUrl = await generateQrCodeDataUrl(qrContent);

        setProgress(60);
        setStatusMessage('Embedding QR code into PDF page...');
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Fetch image bytes from dataUrl
        const res = await fetch(qrDataUrl);
        const qrBytes = new Uint8Array(await res.arrayBuffer());
        const embeddedQr = await pdfDoc.embedPng(qrBytes);

        // Draw title
        page.drawText(qrLabel, {
          x: 100,
          y: 720,
          size: 24,
          font: font,
          color: rgb(0.1, 0.15, 0.25)
        });

        // Draw QR code centered
        page.drawImage(embeddedQr, {
          x: 147.64,
          y: 370,
          width: 300,
          height: 300
        });

        // Draw content caption
        page.drawText(qrContent, {
          x: 100,
          y: 330,
          size: 11,
          font: regularFont,
          color: rgb(0.4, 0.4, 0.4)
        });

        const outputBytes = await pdfDoc.save({ useObjectStreams: true });
        setResult({
          success: true,
          toolId: tool.id,
          outputData: outputBytes,
          outputMimeType: 'application/pdf',
          outputFilename: 'qrcode.pdf',
          statusMessage: 'Printable QR code document generated successfully.'
        });
      }

      // ==========================================
      // Handler 4: Create PDF (Text & Markdown)
      // ==========================================
      else if (tool.id === 'create-pdf') {
        setStatusMessage('Formatting and building PDF...');
        const res = await executeTool({
          toolId: 'create-pdf',
          files: [],
          options: {
            title: options.title || 'Document',
            content: composedText,
            fontSize: Number(options.fontSize) || 12
          },
          onProgress: (p, msg) => {
            setProgress(p);
            setStatusMessage(msg);
          }
        });
        setResult(res);
      }

      // ==========================================
      // Handler 5: WEBP to JPG / PNG
      // ==========================================
      else if ((tool.id === 'webp-to-jpg' || tool.id === 'webp-to-png') && files.length > 0) {
        setStatusMessage('Converting image formats in browser...');
        const targetMime = tool.id === 'webp-to-jpg' ? 'image/jpeg' : 'image/png';
        const targetExt = tool.id === 'webp-to-jpg' ? 'jpg' : 'png';

        if (files.length === 1) {
          const file = files[0];
          const imgUrl = URL.createObjectURL(file);
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = imgUrl;
          });
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 600;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(b => resolve(b || new Blob()), targetMime, 0.92);
          });
          URL.revokeObjectURL(imgUrl);
          const outputBytes = new Uint8Array(await blob.arrayBuffer());

          setResult({
            success: true,
            toolId: tool.id,
            outputData: outputBytes,
            outputMimeType: targetMime,
            outputFilename: `${baseName}.${targetExt}`,
            statusMessage: `Successfully converted to ${targetExt.toUpperCase()}.`
          });
        } else {
          // Multiple images: package into ZIP
          const zip = new JSZip();
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setProgress(Math.round((i / files.length) * 80));
            const imgUrl = URL.createObjectURL(file);
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
              const image = new Image();
              image.onload = () => resolve(image);
              image.onerror = reject;
              image.src = imgUrl;
            });
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 800;
            canvas.height = img.naturalHeight || 600;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            const blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob(b => resolve(b || new Blob()), targetMime, 0.92);
            });
            URL.revokeObjectURL(imgUrl);
            zip.file(`${file.name.replace(/\.[^/.]+$/, '')}.${targetExt}`, blob);
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const zipBytes = new Uint8Array(await zipBlob.arrayBuffer());
          setResult({
            success: true,
            toolId: tool.id,
            outputData: zipBytes,
            outputMimeType: 'application/zip',
            outputFilename: `converted-images.zip`,
            statusMessage: `Successfully converted ${files.length} images to ${targetExt.toUpperCase()} in ZIP archive.`
          });
        }
      }

      // ==========================================
      // Handler 6: Default Central PDF Tools
      // ==========================================
      else {
        // Build file payloads with rotation metadata from thumbnail grid
        const filePayloads: FileInputPayload[] = [];
        for (const pf of previewFiles) {
          if (tool.id === 'images-to-pdf') {
            const converted = await ensureStandardImageBytes(pf.file);
            filePayloads.push({
              name: pf.file.name,
              size: pf.file.size,
              mimeType: converted.mimeType,
              data: converted.data,
              rotation: pf.rotation
            });
          } else {
            const buffer = await pf.file.arrayBuffer();
            filePayloads.push({
              name: pf.file.name,
              size: pf.file.size,
              mimeType: pf.file.type || 'application/pdf',
              data: new Uint8Array(buffer),
              rotation: pf.rotation
            });
          }
        }

        // Add signature bytes if signing
        let execOptions = { ...options };
        if (tool.id === 'sign-pdf' && signatureDataUrl) {
          const res = await fetch(signatureDataUrl);
          const sigBytes = new Uint8Array(await res.arrayBuffer());
          execOptions.signatureImageBytes = sigBytes;
          execOptions.signatureImageMime = 'image/png';
        }

        const res = await executeTool({
          toolId: tool.id,
          files: filePayloads,
          options: execOptions,
          onProgress: (p, msg) => {
            setProgress(p);
            setStatusMessage(msg);
          }
        });

        setResult(res);
      }

      // Success animation & history recording
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}

      onRecordHistory?.({
        toolId: tool.id,
        filename: files[0]?.name || 'output-document',
        size: files[0]?.size || 0,
        status: 'completed'
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred during document processing.');
      onRecordHistory?.({
        toolId: tool.id,
        filename: files[0]?.name || 'unknown',
        size: 0,
        status: 'failed'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result?.outputData) return;

    const blob = new Blob([result.outputData as any], {
      type: result.outputMimeType || 'application/pdf'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.outputFilename || 'processed-document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadSingleImage = (img: PdfPageImage) => {
    const url = URL.createObjectURL(img.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-${String(img.pageNumber).padStart(3, '0')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleCopyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSaveToAccount = () => {
    if (!result?.outputData) return;
    const blob = new Blob([result.outputData as any], {
      type: result.outputMimeType || 'application/pdf'
    });
    onSaveDocument?.({
      filename: result.outputFilename || 'document.pdf',
      size: result.outputData.byteLength,
      toolId: tool.id,
      blob
    });
    setSavedToCloud(true);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="workspace-container">
      {/* Back button & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          className="btn-secondary"
          style={{ width: 'auto', padding: '0 0.875rem' }}
          aria-label="Back to all tools"
        >
          <ArrowLeft size={16} />
          <span>Back to Tools</span>
        </button>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{tool.name}</span>
      </div>

      <div className="workspace-header">
        <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }} className="tool-icon-wrapper">
          <IconRenderer name={tool.icon} size={28} />
        </div>
        <h1 className="workspace-title">{tool.name}</h1>
        <p className="workspace-desc">{tool.description}</p>
      </div>

      {/* If this is a pending phase tool, display explicit documented roadmap status */}
      {isPending ? (
        <div className="result-box" style={{ borderColor: 'var(--border-default)', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Feature Roadmap Status: {tool.status.toUpperCase()}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
                {tool.statusDetails || 'This tool is scheduled for subsequent phases in accordance with the master project specification.'}
              </p>
              <div style={{
                padding: '0.875rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                color: 'var(--text-muted)'
              }}>
                <strong>Architecture Note:</strong> This operation requires server-side containerized workers ({tool.engine === 'server' ? 'Google Cloud Run with LibreOffice / QPDF / Tesseract' : 'Dedicated engine'}). It will be enabled in its respective phase without mock placeholders.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Custom Composer for Create PDF */}
          {tool.id === 'create-pdf' && !result && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Text & Markdown Composer
              </h2>
              <textarea
                value={composedText}
                onChange={(e) => setComposedText(e.target.value)}
                rows={10}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  resize: 'vertical'
                }}
                placeholder="Type or paste your text here..."
              />
            </div>
          )}

          {/* Custom Live Preview for QR Code */}
          {tool.id === 'qr-code-to-pdf' && !result && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Live Vector QR Code Preview
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Update the URL in the options below to see real-time code changes:
              </p>
              {liveQrCodeUrl ? (
                <div style={{ display: 'inline-block', padding: '1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
                  <img src={liveQrCodeUrl} alt="QR Code" style={{ width: '180px', height: '180px' }} />
                  <div style={{ color: '#0f172a', fontWeight: 700, marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    {options.qrLabel || 'Scan QR Code'}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                  <QrCode size={48} />
                </div>
              )}
            </div>
          )}

          {/* Interactive Signature Pad for Sign PDF */}
          {tool.id === 'sign-pdf' && !result && (
            <SignaturePad onSignatureChange={(dataUrl) => setSignatureDataUrl(dataUrl)} />
          )}

          {/* File Upload Dropzone (When no files are loaded) */}
          {tool.id !== 'create-pdf' && tool.id !== 'qr-code-to-pdf' && tool.maxFiles > 0 && files.length === 0 && (
            <div
              className={`dropzone-box ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                accept={tool.supportedInputs.join(',')}
                multiple={tool.allowMultiple}
                onChange={handleFileChange}
              />
              <UploadCloud className="dropzone-icon" />
              <h2 className="dropzone-title">Choose files or drag & drop them here</h2>
              <p className="dropzone-subtitle">
                Supported: {tool.supportedInputs.join(', ')} (Max {tool.maxFileSizeMB} MB)
                {tool.allowMultiple ? ' • Add up to 200 files with thumbnail reordering' : ''}
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                Select {tool.allowMultiple ? 'Files' : 'File'}
              </button>
            </div>
          )}

          {/* Hidden Input for Adding More Files */}
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept={tool.supportedInputs.join(',')}
            multiple={tool.allowMultiple}
            onChange={handleFileChange}
          />

          {/* Interactive File Preview Grid (Supports 100+ files, Drag/Drop Reorder, Individual Rotations, Lightbox) */}
          {previewFiles.length > 0 && !result && (
            <FilePreviewGrid
              files={previewFiles}
              onReorder={handleReorderFiles}
              onRemove={handleRemoveFile}
              onRotate={handleRotateFile}
              onAddMore={() => fileInputRef.current?.click()}
              onClearAll={clearAllFiles}
              allowMultiple={tool.allowMultiple}
            />
          )}

          {/* Tool Options Configuration Form */}
          {tool.options.length > 0 && !result && (
            <div className="options-panel">
              <h2 className="options-title">
                <span>Configure Options</span>
              </h2>
              <div className="options-grid">
                {tool.options.map(opt => (
                  <div key={opt.id} className="form-group">
                    <label className="form-label">{opt.label}</label>
                    {opt.description && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {opt.description}
                      </span>
                    )}

                    {opt.type === 'select' && (
                      <select
                        className="form-select"
                        value={options[opt.id]}
                        onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                      >
                        {opt.options?.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    )}

                    {opt.type === 'text' && (
                      <input
                        type="text"
                        className="form-input"
                        value={options[opt.id]}
                        onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                      />
                    )}

                    {opt.type === 'number' && (
                      <input
                        type="number"
                        className="form-input"
                        min={opt.min}
                        max={opt.max}
                        step={opt.step}
                        value={options[opt.id]}
                        onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                      />
                    )}

                    {opt.type === 'range' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="range"
                          style={{ flex: 1 }}
                          min={opt.min}
                          max={opt.max}
                          step={opt.step}
                          value={options[opt.id]}
                          onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                        />
                        <span style={{ minWidth: '40px', fontWeight: 600, fontSize: '0.875rem' }}>
                          {options[opt.id]}
                        </span>
                      </div>
                    )}

                    {opt.type === 'checkbox' && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(options[opt.id])}
                          onChange={(e) => handleOptionChange(opt.id, e.target.checked)}
                        />
                        <span style={{ fontSize: '0.875rem' }}>Enable</span>
                      </label>
                    )}

                    {opt.type === 'radio' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {opt.options?.map(o => (
                          <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={opt.id}
                              value={o.value}
                              checked={String(options[opt.id]) === String(o.value)}
                              onChange={() => handleOptionChange(opt.id, o.value)}
                            />
                            <span style={{ fontSize: '0.875rem' }}>{o.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: 'var(--status-error-subtle)',
              border: '1px solid var(--status-error)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--status-error)',
              margin: '1.25rem 0',
              fontSize: '0.875rem'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Progress Indicator */}
          {isProcessing && (
            <div style={{ margin: '2rem 0', textAlign: 'center' }}>
              <div style={{
                height: '8px',
                width: '100%',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: 'var(--accent-primary)',
                  transition: 'width 200ms ease-in-out'
                }} />
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {statusMessage} ({progress}%)
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          {!result && !isProcessing && (tool.id === 'create-pdf' || tool.id === 'qr-code-to-pdf' || files.length > 0) && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ height: '48px', padding: '0 2.25rem', fontSize: '1.0625rem', fontWeight: 700 }}
                onClick={handleProcess}
              >
                Execute {tool.name}
              </button>
            </div>
          )}

          {/* Result Card */}
          {result && result.success && (
            <div className="result-box">
              <div className="result-icon-success">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="result-title">Processing Complete!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                {result.statusMessage}
              </p>

              {result.metadata && (
                <div className="result-metrics">
                  {result.metadata.originalSize !== undefined && (
                    <div className="metric-item">
                      <span className="metric-label">Original Size</span>
                      <span className="metric-value">{formatSize(result.metadata.originalSize)}</span>
                    </div>
                  )}
                  {result.metadata.compressedSize !== undefined && (
                    <div className="metric-item">
                      <span className="metric-label">Optimized Size</span>
                      <span className="metric-value">{formatSize(result.metadata.compressedSize)}</span>
                    </div>
                  )}
                  {result.metadata.savedPercentage !== undefined && (
                    <div className="metric-item">
                      <span className="metric-label">Saved</span>
                      <span className="metric-value" style={{ color: 'var(--status-success)' }}>
                        {result.metadata.savedPercentage}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Password Generator Text Output */}
              {result.metadata?.password && (
                <div style={{
                  margin: '1.5rem 0',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'monospace',
                  fontSize: '1.25rem',
                  letterSpacing: '0.05em',
                  userSelect: 'all',
                  wordBreak: 'break-all'
                }}>
                  {result.metadata.password}
                </div>
              )}

              {/* Extracted Text Preview Card for PDF to Text */}
              {extractedText && (
                <div style={{ margin: '1.5rem 0', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Extracted Document Text:</span>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ height: '30px', fontSize: '0.75rem' }}
                      onClick={handleCopyText}
                    >
                      {copiedText ? <Check size={14} style={{ color: 'var(--status-success)' }} /> : <Copy size={14} />}
                      <span>{copiedText ? 'Copied!' : 'Copy to Clipboard'}</span>
                    </button>
                  </div>
                  <pre style={{
                    maxHeight: '260px',
                    overflowY: 'auto',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'var(--text-primary)'
                  }}>
                    {extractedText}
                  </pre>
                </div>
              )}

              {/* Rendered PDF Images Grid for PDF to Images */}
              {renderedPdfImages.length > 0 && (
                <div style={{ margin: '1.5rem 0', textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    Rendered Page Images ({renderedPdfImages.length} Pages):
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '0.75rem',
                    maxHeight: '340px',
                    overflowY: 'auto',
                    padding: '0.5rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    {renderedPdfImages.map(img => (
                      <div
                        key={img.pageNumber}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <img
                          src={img.dataUrl}
                          alt={`Page ${img.pageNumber}`}
                          style={{ width: '100%', height: '110px', objectFit: 'contain', backgroundColor: '#ffffff' }}
                        />
                        <div style={{
                          padding: '0.375rem 0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid var(--border-subtle)'
                        }}>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>#{img.pageNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleImage(img)}
                            className="btn-icon"
                            style={{ width: '22px', height: '22px' }}
                            title="Download this page image"
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions: Download, Save to Cloud, Process Another */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  className="btn-primary"
                  onClick={handleDownload}
                  style={{ height: '46px', padding: '0 1.5rem' }}
                >
                  <Download size={18} />
                  <span>Download {result.outputFilename || 'Output'}</span>
                </button>

                <button
                  className="btn-secondary"
                  onClick={handleSaveToAccount}
                  disabled={savedToCloud}
                  style={{ height: '46px' }}
                >
                  <Bookmark size={18} />
                  <span>{savedToCloud ? 'Saved to Documents' : 'Save to Cloud'}</span>
                </button>

                <button
                  className="btn-secondary"
                  onClick={clearAllFiles}
                  style={{ height: '46px' }}
                >
                  <RotateCcw size={18} />
                  <span>Process Another</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
