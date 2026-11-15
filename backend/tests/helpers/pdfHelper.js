// Helper to construct valid test PDF buffers with deterministic offsets

function createSimplePdf(lines) {
  const contentStream =
    'BT\n/F1 12 Tf\n72 712 Td\n' +
    lines.map((line, idx) => (idx === 0 ? `(${line}) Tj` : `0 -18 Td\n(${line}) Tj`)).join('\n') +
    '\nET';

  const streamLength = Buffer.byteLength(contentStream, 'utf8');

  let body = '%PDF-1.4\n';
  const offsets = [];

  offsets.push(Buffer.byteLength(body, 'utf8'));
  body += '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';

  offsets.push(Buffer.byteLength(body, 'utf8'));
  body += '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';

  offsets.push(Buffer.byteLength(body, 'utf8'));
  body += '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';

  offsets.push(Buffer.byteLength(body, 'utf8'));
  body += `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`;

  offsets.push(Buffer.byteLength(body, 'utf8'));
  body += '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  const startxref = Buffer.byteLength(body, 'utf8');
  body += 'xref\n0 6\n0000000000 65535 f \n';
  for (const offset of offsets) {
    body += String(offset).padStart(10, '0') + ' 00000 n \n';
  }
  body += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  return Buffer.from(body, 'utf8');
}

function createBlankPdf() {
  return createSimplePdf(['  ']);
}

module.exports = {
  createSimplePdf,
  createBlankPdf,
};
