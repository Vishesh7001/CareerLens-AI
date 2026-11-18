const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create PNG buffer from pixel function
function createPNG(width, height, getPixel) {
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcVal = zlib.crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflated),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Create ICO buffer from multiple PNG buffers
function createICO(pngBuffersWithSizes) {
  const count = pngBuffersWithSizes.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let currentOffset = 6 + count * 16;
  const dirEntries = [];
  const imageBuffers = [];

  for (const item of pngBuffersWithSizes) {
    const entry = Buffer.alloc(16);
    entry[0] = item.width >= 256 ? 0 : item.width;
    entry[1] = item.height >= 256 ? 0 : item.height;
    entry[2] = 0; // color count
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(item.buffer.length, 8);
    entry.writeUInt32LE(currentOffset, 12);
    dirEntries.push(entry);
    imageBuffers.push(item.buffer);
    currentOffset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

// CareerLens AI Brand Renderer with Anti-Aliasing
function renderBrandPixel(u, v) {
  // u, v in [0, 1]
  // Corner radius ratio for rounded-xl on 36px box: 10 / 36 = 0.2778
  const rCorner = 10 / 36;
  const qx = Math.abs(u - 0.5) - (0.5 - rCorner);
  const qy = Math.abs(v - 0.5) - (0.5 - rCorner);
  let distBox = 0;
  if (qx > 0 && qy > 0) {
    distBox = Math.sqrt(qx * qx + qy * qy) - rCorner;
  } else {
    distBox = Math.max(qx, qy) - rCorner;
  }

  // If outside rounded box, fully transparent
  if (distBox > 0) {
    return [0, 0, 0, 0];
  }

  // Background Forest Green: #244B38 -> (36, 75, 56)
  const bgR = 36;
  const bgG = 75;
  const bgB = 56;

  // Target rings geometry (proportions match 20px w-5 icon in 36px w-9 box)
  // Scale factor = (20 / 36) / 24 = 5 / 216
  const scale = (20 / 36) / 24;
  const rOuter = 10 * scale; // ~0.2315
  const rMid = 6 * scale;    // ~0.1389
  const rInner = 2 * scale;  // ~0.0463
  const strokeHalf = (2 * scale) / 2; // ~0.02315

  const dx = u - 0.5;
  const dy = v - 0.5;
  const distCenter = Math.sqrt(dx * dx + dy * dy);

  // Check if inside any of the 3 concentric rings
  const inOuterRing = Math.abs(distCenter - rOuter) <= strokeHalf;
  const inMidRing = Math.abs(distCenter - rMid) <= strokeHalf;
  const inInnerRing = Math.abs(distCenter - rInner) <= strokeHalf;

  if (inOuterRing || inMidRing || inInnerRing) {
    // Pure White: #FFFFFF -> (255, 255, 255, 255)
    return [255, 255, 255, 255];
  }

  return [bgR, bgG, bgB, 255];
}

// Supersampled renderer for sharp icons at any resolution
function renderIcon(size) {
  // Use 8x8 supersampling (64 rays per pixel) for ultra smooth anti-aliased edges
  const samples = size <= 32 ? 8 : 4;
  const step = 1 / samples;

  return createPNG(size, size, (px, py) => {
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    let aSum = 0;

    for (let sy = 0; sy < samples; sy++) {
      for (let sx = 0; sx < samples; sx++) {
        const u = (px + (sx + 0.5) * step) / size;
        const v = (py + (sy + 0.5) * step) / size;
        const [r, g, b, a] = renderBrandPixel(u, v);
        rSum += (r * a) / 255;
        gSum += (g * a) / 255;
        bSum += (b * a) / 255;
        aSum += a;
      }
    }

    const totalSamples = samples * samples;
    const finalA = Math.round(aSum / totalSamples);
    if (finalA === 0) {
      return [0, 0, 0, 0];
    }
    const finalR = Math.round((rSum / (aSum / 255)));
    const finalG = Math.round((gSum / (aSum / 255)));
    const finalB = Math.round((bSum / (aSum / 255)));

    return [finalR, finalG, finalB, finalA];
  });
}

// Generate SVG string
function generateBrandSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none">
  <rect width="36" height="36" rx="10" fill="#244B38"/>
  <circle cx="18" cy="18" r="8.333" stroke="#FFFFFF" stroke-width="1.667" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="18" cy="18" r="5" stroke="#FFFFFF" stroke-width="1.667" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="18" cy="18" r="1.667" stroke="#FFFFFF" stroke-width="1.667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
}

// Main execution
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating brand SVG assets...');
const svgContent = generateBrandSVG();
fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgContent, 'utf8');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');

console.log('Generating multi-resolution PNGs...');
const png16 = renderIcon(16);
const png32 = renderIcon(32);
const png48 = renderIcon(48);
const png180 = renderIcon(180);
const png192 = renderIcon(192);

fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);
fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), png48);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), png192);

console.log('Generating composite favicon.ico with 16, 32, and 48 px layers...');
const icoBuffer = createICO([
  { width: 16, height: 16, buffer: png16 },
  { width: 32, height: 32, buffer: png32 },
  { width: 48, height: 48, buffer: png48 },
]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

console.log('All favicon assets generated successfully in frontend/public/');
