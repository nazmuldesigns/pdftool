import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import {
  TOOLS_REGISTRY,
  CATEGORIES,
  getToolById,
  searchTools,
  calculateExpirationTimestamp,
  isExpired
} from '../packages/shared/dist/index.js';
import {
  mergePdfs,
  splitPdf,
  rotatePdfPages,
  addWatermark,
  addPageNumbers,
  editOrRemoveMetadata,
  compressPdf,
  generateSecurePassword,
  halvePdfPages,
  generateInvoicePdf,
  signPdfDocument,
  executeTool
} from '../packages/pdf-tools/dist/index.js';

// Helper to generate a minimal valid multi-page PDF in memory
async function createTestPdf(pageCount = 3, label = 'Test Document') {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`${label} - Page ${i + 1}`, { x: 50, y: 800, size: 14 });
  }
  return await doc.save();
}

test('Tool Registry - All tools have valid schemas and categories', () => {
  assert.ok(TOOLS_REGISTRY.length >= 25, `Expected at least 25 registered tools, got ${TOOLS_REGISTRY.length}`);

  for (const tool of TOOLS_REGISTRY) {
    assert.ok(tool.id, 'Tool has an ID');
    assert.ok(tool.name, `Tool ${tool.id} has a name`);
    assert.ok(CATEGORIES[tool.category], `Tool ${tool.id} has a valid category "${tool.category}"`);
    assert.ok(tool.shortDescription, `Tool ${tool.id} has shortDescription`);
    assert.ok(tool.outputFormat, `Tool ${tool.id} has outputFormat`);
    assert.ok(['client', 'server', 'hybrid'].includes(tool.engine), `Tool ${tool.id} has valid engine`);

    if (tool.status.startsWith('pending-')) {
      assert.ok(tool.statusDetails, `Pending tool ${tool.id} must document status details`);
    }
  }
});

test('Search Tools - query matching behaves properly', () => {
  const mergeMatches = searchTools('merge');
  assert.ok(mergeMatches.some(t => t.id === 'merge-pdf'), 'Found merge-pdf');

  const watermarkMatches = searchTools('watermark');
  assert.ok(watermarkMatches.some(t => t.id === 'add-watermark'), 'Found add-watermark');

  const emptyMatches = searchTools('');
  assert.equal(emptyMatches.length, TOOLS_REGISTRY.length, 'Empty search returns all tools');
});

test('Retention Policies - calculation and expiration detection', () => {
  const now = 1700000000000;
  const expireIn1Hour = calculateExpirationTimestamp(1, now);
  assert.equal(expireIn1Hour, now + 3600000);

  assert.equal(isExpired(expireIn1Hour, now + 3599999), false);
  assert.equal(isExpired(expireIn1Hour, now + 3600000), true);
  assert.equal(isExpired(expireIn1Hour, now + 3700000), true);
});

test('Password Generator - produces strong passwords of chosen length', () => {
  const pwd24 = generateSecurePassword({ length: 24, includeSpecial: true, includeNumbers: true });
  assert.equal(pwd24.length, 24);
  assert.match(pwd24, /[0-9]/, 'Has number');

  const pwd16 = generateSecurePassword({ length: 16 });
  assert.equal(pwd16.length, 16);
});

test('PDF Merge Operation - merges 2 PDFs preserving all pages', async () => {
  const pdf1 = await createTestPdf(2, 'Doc A');
  const pdf2 = await createTestPdf(3, 'Doc B');

  const merged = await mergePdfs([pdf1, pdf2]);
  const loadedMerged = await PDFDocument.load(merged);
  assert.equal(loadedMerged.getPageCount(), 5, 'Merged document should have 2 + 3 = 5 pages');
});

test('PDF Split Operation - extracts custom ranges and single pages', async () => {
  const source = await createTestPdf(6, 'Split Me');

  // Range split
  const rangeResult = await splitPdf(source, {
    splitMode: 'ranges',
    pageRanges: '2-4, 6',
    baseFilename: 'sample'
  });
  assert.equal(rangeResult.isZip, false);
  const loadedRange = await PDFDocument.load(rangeResult.data);
  assert.equal(loadedRange.getPageCount(), 4, 'Pages 2,3,4,6 = 4 pages');

  // All pages split (ZIP archive)
  const allResult = await splitPdf(source, {
    splitMode: 'all',
    baseFilename: 'sample'
  });
  assert.equal(allResult.isZip, true);
  assert.ok(allResult.data.byteLength > 100, 'Zip file created');
});

test('PDF Rotate Operation - rotates target pages', async () => {
  const source = await createTestPdf(3, 'Rotate Doc');
  const rotated = await rotatePdfPages(source, {
    rotationAngle: 90,
    targetPages: 'all'
  });
  const loaded = await PDFDocument.load(rotated);
  const firstPage = loaded.getPage(0);
  assert.equal(firstPage.getRotation().angle, 90);
});

test('PDF Watermark Operation - applies watermark without corrupting structure', async () => {
  const source = await createTestPdf(2, 'Watermark Doc');
  const watermarked = await addWatermark(source, {
    watermarkText: 'CONFIDENTIAL TEST',
    color: 'red',
    fontSize: 36
  });
  const loaded = await PDFDocument.load(watermarked);
  assert.equal(loaded.getPageCount(), 2);
});

test('PDF Page Numbers Operation - appends numbering', async () => {
  const source = await createTestPdf(4, 'Numbered Doc');
  const numbered = await addPageNumbers(source, {
    position: 'bottom-center',
    format: 'page-of-total'
  });
  const loaded = await PDFDocument.load(numbered);
  assert.equal(loaded.getPageCount(), 4);
});

test('PDF Metadata Operation - updates and scrubs metadata', async () => {
  const source = await createTestPdf(2, 'Meta Doc');

  const withMeta = await editOrRemoveMetadata(source, {
    title: 'Custom Title 123',
    author: 'Antigravity Engineer'
  });
  const loadedWithMeta = await PDFDocument.load(withMeta);
  assert.equal(loadedWithMeta.getTitle(), 'Custom Title 123');
  assert.equal(loadedWithMeta.getAuthor(), 'Antigravity Engineer');

  const scrubbed = await editOrRemoveMetadata(withMeta, {
    removeOnly: true
  });
  const loadedScrubbed = await PDFDocument.load(scrubbed);
  assert.equal(loadedScrubbed.getTitle(), '');
  assert.equal(loadedScrubbed.getAuthor(), '');
});

test('PDF Compress Operation - produces valid PDF and computes savings', async () => {
  const source = await createTestPdf(5, 'Compressible Document');
  const result = await compressPdf(source, { compressionLevel: 'medium' });

  assert.ok(result.compressedSize > 0);
  assert.equal(typeof result.savedPercentage, 'number');
  const loaded = await PDFDocument.load(result.data);
  assert.equal(loaded.getPageCount(), 5);
});

test('Central Adapter - handles real operations and pending-phase notices gracefully', async () => {
  const source = await createTestPdf(2, 'Adapter Test');

  // 1. Working tool
  const rotateResp = await executeTool({
    toolId: 'rotate-pages',
    files: [{ name: 'test.pdf', size: source.byteLength, mimeType: 'application/pdf', data: source }],
    options: { rotationAngle: 180, targetPages: 'all' }
  });
  assert.equal(rotateResp.success, true);
  assert.ok(rotateResp.outputData);

  // 2. Pending-phase tool (documented notice, no fake success, no broken button)
  const ocrResp = await executeTool({
    toolId: 'ocr-pdf',
    files: [{ name: 'scan.pdf', size: source.byteLength, mimeType: 'application/pdf', data: source }],
    options: {}
  });
  assert.equal(ocrResp.success, false);
  assert.ok(ocrResp.pendingNotice);
  assert.match(ocrResp.pendingNotice, /Phase 5/);
});

test('PDF Halve Pages Operation - splits sheets into dual pages', async () => {
  const source = await createTestPdf(2, 'Landscape Sheet');
  const halved = await halvePdfPages(source, { splitDirection: 'vertical' });
  const loaded = await PDFDocument.load(halved);
  assert.equal(loaded.getPageCount(), 4, '2 pages halved vertically = 4 pages');
});

test('Invoice Generation Operation - creates valid PDF with financial totals', async () => {
  const invoicePdf = await generateInvoicePdf({
    invoiceNumber: 'INV-TEST-001',
    clientName: 'Acme Corp',
    currency: 'USD',
    taxRatePercent: 10,
    items: [
      { description: 'Service A', quantity: 2, rate: 100 }
    ]
  });
  const loaded = await PDFDocument.load(invoicePdf);
  assert.equal(loaded.getPageCount(), 1);
});

test('PDF Sign Operation - places electronic signature on document', async () => {
  const source = await createTestPdf(3, 'Contract Document');
  const signed = await signPdfDocument(source, {
    signatureText: 'Jane Doe',
    pageNumber: 3
  });
  const loaded = await PDFDocument.load(signed);
  assert.equal(loaded.getPageCount(), 3);
});
