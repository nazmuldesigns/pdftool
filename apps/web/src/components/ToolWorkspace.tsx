import React, { useState, useRef } from 'react';
import type { ToolDefinition } from '@pdf-toolbox/shared';
import { executeTool } from '@pdf-toolbox/pdf-tools';
import type { ToolExecutionResponse, FileInputPayload } from '@pdf-toolbox/pdf-tools';
import { IconRenderer } from './IconRenderer';
import {
  UploadCloud,
  FileText,
  Trash2,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Bookmark
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPending = tool.status.startsWith('pending-');

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

    if (tool.allowMultiple) {
      setFiles(prev => [...prev, ...validFiles].slice(0, tool.maxFiles));
    } else {
      setFiles([validFiles[0]]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length <= 1) {
      setResult(null);
    }
  };

  const clearAllFiles = () => {
    setFiles([]);
    setResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOptionChange = (optionId: string, value: any) => {
    setOptions(prev => ({ ...prev, [optionId]: value }));
  };

  // Run the Tool Processing
  const handleProcess = async () => {
    if (tool.maxFiles > 0 && files.length === 0) {
      setErrorMessage('Please select a file to process.');
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('Reading files...');
    setErrorMessage(null);
    setResult(null);
    setSavedToCloud(false);

    try {
      // Convert File[] to FileInputPayload[] (ArrayBuffer -> Uint8Array)
      const filePayloads: FileInputPayload[] = [];
      for (const f of files) {
        const buffer = await f.arrayBuffer();
        filePayloads.push({
          name: f.name,
          size: f.size,
          mimeType: f.type || 'application/pdf',
          data: new Uint8Array(buffer)
        });
      }

      const res = await executeTool({
        toolId: tool.id,
        files: filePayloads,
        options,
        onProgress: (p, msg) => {
          setProgress(p);
          setStatusMessage(msg);
        }
      });

      setResult(res);

      if (res.success) {
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch {}

        onRecordHistory?.({
          toolId: tool.id,
          filename: res.outputFilename || files[0]?.name || 'document.pdf',
          size: res.outputData?.byteLength || 0,
          status: 'completed'
        });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred during processing.');
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
      {/* Back button & Header */}
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

      {/* If this is a pending phase tool, display explicit documented status */}
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
          {/* File Upload Dropzone */}
          {tool.maxFiles > 0 && files.length === 0 && (
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
                {tool.allowMultiple ? ' • Multiple files supported' : ''}
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

          {/* Selected Files List */}
          {files.length > 0 && !result && (
            <div className="file-queue">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Selected Files ({files.length}{tool.allowMultiple ? ` / ${tool.maxFiles}` : ''})
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {tool.allowMultiple && files.length < tool.maxFiles && (
                    <button
                      className="btn-secondary"
                      style={{ height: '32px', fontSize: '0.8125rem' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      + Add more
                    </button>
                  )}
                  <button
                    className="btn-secondary"
                    style={{ height: '32px', fontSize: '0.8125rem', color: 'var(--status-error)' }}
                    onClick={clearAllFiles}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {files.map((file, idx) => (
                <div key={idx} className="file-item">
                  <div className="file-item-info">
                    <FileText size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                    <div>
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{formatSize(file.size)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="btn-icon"
                    title="Remove file"
                  >
                    <Trash2 size={16} style={{ color: 'var(--status-error)' }} />
                  </button>
                </div>
              ))}
            </div>
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
          {!result && !isProcessing && (tool.maxFiles === 0 || files.length > 0) && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ height: '48px', padding: '0 2rem', fontSize: '1rem' }}
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
