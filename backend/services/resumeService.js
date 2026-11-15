const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pdfParse = require('pdf-parse');

/**
 * Validates that the buffer begins with the PDF magic bytes (%PDF-)
 * Prevents disguised files (e.g. .exe, .html renamed to .pdf)
 */
const validatePdfMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 5) {
    throw new Error('File is empty or too small to be a valid PDF document.');
  }

  // Magic bytes for %PDF- are 0x25, 0x50, 0x44, 0x46, 0x2D
  const header = buffer.slice(0, 5).toString('ascii');
  if (header !== '%PDF-') {
    throw new Error('Invalid file format: Document does not contain a valid PDF signature.');
  }
};

/**
 * Extracts plain text from a PDF Buffer
 * @param {Buffer} buffer
 * @returns {Promise<{ rawText: string, numPages: number, info: object }>}
 */
const extractTextFromPdf = async (buffer) => {
  validatePdfMagicBytes(buffer);

  try {
    // Pass as typed array object to guarantee pdf.js worker receives a clean, unpooled buffer
    const uint8Data = new Uint8Array(buffer);
    const data = await pdfParse({ data: uint8Data });
    const rawText = data.text ? data.text.trim() : '';

    if (!rawText || rawText.length < 20) {
      const error = new Error(
        'The uploaded PDF contains no extractable text. Please ensure the document is not an image-only scan or password-protected.'
      );
      error.statusCode = 400;
      throw error;
    }

    return {
      rawText,
      numPages: data.numpages || 1,
      info: data.info || {},
    };
  } catch (err) {
    if (err.statusCode) throw err;
    const error = new Error(`Failed to extract text from PDF: ${err.message || 'Corrupted or unsupported PDF'}`);
    error.statusCode = 400;
    throw error;
  }
};

/**
 * Resolves and ensures the resume storage directory exists
 */
const getStorageDir = () => {
  const configuredPath = process.env.RESUME_STORAGE_PATH || path.join(__dirname, '../uploads/resumes');
  let resolvedPath;

  if (path.isAbsolute(configuredPath)) {
    resolvedPath = configuredPath;
  } else {
    // If configuredPath is relative, prefer resolving relative to the backend root directory (__dirname/..)
    // unless a directory already exists relative to process.cwd()
    const backendRel = path.resolve(__dirname, '..', configuredPath);
    const cwdRel = path.resolve(process.cwd(), configuredPath);
    if (fs.existsSync(cwdRel) && !fs.existsSync(backendRel)) {
      resolvedPath = cwdRel;
    } else {
      resolvedPath = backendRel;
    }
  }

  if (!fs.existsSync(resolvedPath)) {
    fs.mkdirSync(resolvedPath, { recursive: true });
  }

  try {
    if (fs.existsSync(resolvedPath)) {
      resolvedPath = fs.realpathSync.native
        ? fs.realpathSync.native(resolvedPath)
        : fs.realpathSync(resolvedPath);
    }
  } catch (_) {}

  return resolvedPath;
};

/**
 * Saves a validated PDF buffer to disk with an isolated, collision-proof filename
 */
const saveResumeToDisk = async (userId, originalFileName, buffer) => {
  const storageDir = getStorageDir();

  // Sanitize original filename for safe storage metadata
  const sanitizedOriginal = path.basename(originalFileName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniquePrefix = `${userId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const storedFileName = `${uniquePrefix}.pdf`;
  const targetFilePath = path.join(storageDir, storedFileName);

  await fs.promises.writeFile(targetFilePath, buffer);

  return {
    storedFileName,
    filePath: targetFilePath,
    sanitizedOriginal,
  };
};

/**
 * Safely removes a file from disk
 */
const deleteFileFromDisk = async (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return;
    }

    const storageDir = getStorageDir();
    const fallbackPath = path.resolve(storageDir, path.basename(filePath));
    if (fs.existsSync(fallbackPath)) {
      await fs.promises.unlink(fallbackPath);
    }
  } catch (err) {
    console.error(`[Resume Storage] Warning: Could not delete file at ${filePath}:`, err.message);
  }
};

module.exports = {
  validatePdfMagicBytes,
  extractTextFromPdf,
  getStorageDir,
  saveResumeToDisk,
  deleteFileFromDisk,
};
