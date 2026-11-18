const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
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
 * Resolves and ensures the resume storage directory exists (Local Disk Mode)
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
 * Saves a validated PDF buffer to disk with an isolated, collision-proof filename (Local Disk Mode)
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
    storageType: 'local',
    storedFileName,
    filePath: targetFilePath,
    sanitizedOriginal,
    gridFsFileId: null,
  };
};

/**
 * Safely removes a file from disk (Local Disk Mode)
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

// =========================================================================
// MongoDB GridFS Storage Provider (Vercel Serverless / Cloud Production)
// =========================================================================

let gridFsBucket = null;

/**
 * Obtain or initialize the MongoDB GridFSBucket instance
 */
const getGridFsBucket = () => {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    throw new Error('Database is not connected. Cannot access GridFS bucket.');
  }

  if (!gridFsBucket || gridFsBucket.s.db !== mongoose.connection.db) {
    gridFsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'resumes_gridfs',
    });
  }

  return gridFsBucket;
};

/**
 * Saves a validated PDF buffer into MongoDB GridFS
 * @param {string|ObjectId} userId
 * @param {string} originalFileName
 * @param {Buffer} buffer
 * @returns {Promise<{ storageType: string, storedFileName: string, filePath: string, gridFsFileId: ObjectId, sanitizedOriginal: string }>}
 */
const saveResumeToGridFs = async (userId, originalFileName, buffer) => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGridFsBucket();
      const sanitizedOriginal = path.basename(originalFileName).replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniquePrefix = `${userId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const storedFileName = `${uniquePrefix}.pdf`;

      const uploadStream = bucket.openUploadStream(storedFileName, {
        metadata: {
          userId: userId.toString(),
          originalFileName: sanitizedOriginal,
          uploadedAt: new Date(),
        },
        contentType: 'application/pdf',
      });

      uploadStream.on('error', (err) => {
        reject(new Error(`GridFS upload failed: ${err.message}`));
      });

      uploadStream.on('finish', () => {
        resolve({
          storageType: 'gridfs',
          storedFileName,
          filePath: `gridfs://${uploadStream.id.toString()}`,
          gridFsFileId: uploadStream.id,
          sanitizedOriginal,
        });
      });

      uploadStream.end(buffer);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Open a readable stream from MongoDB GridFS for downloading
 * @param {string|ObjectId} fileId
 */
const openGridFsDownloadStream = (fileId) => {
  const bucket = getGridFsBucket();
  const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
  return bucket.openDownloadStream(objectId);
};

/**
 * Delete a file and its chunks from MongoDB GridFS
 * @param {string|ObjectId} fileId
 */
const deleteFileFromGridFs = async (fileId) => {
  if (!fileId) return;
  try {
    const bucket = getGridFsBucket();
    const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
    await bucket.delete(objectId);
  } catch (err) {
    console.warn(`[GridFS Storage] Notice: Could not delete GridFS file (${fileId}):`, err.message);
  }
};

/**
 * Determine active storage type
 * Defaults to 'local' for local development & test runner; uses 'gridfs' in Vercel or when configured
 */
const getStorageType = () => {
  if (process.env.STORAGE_TYPE) {
    return process.env.STORAGE_TYPE.toLowerCase();
  }
  if (process.env.VERCEL) {
    return 'gridfs';
  }
  return 'local';
};

/**
 * Unified storage saver: routes to GridFS or Local Disk based on runtime environment
 */
const saveResumeFile = async (userId, originalFileName, buffer) => {
  const storageType = getStorageType();
  if (storageType === 'gridfs') {
    return await saveResumeToGridFs(userId, originalFileName, buffer);
  }
  return await saveResumeToDisk(userId, originalFileName, buffer);
};

/**
 * Unified storage deleter: removes from GridFS or Local Disk based on resume document metadata
 */
const deleteResumeFile = async (resumeDoc) => {
  if (!resumeDoc) return;

  const isGridFs =
    resumeDoc.storageType === 'gridfs' ||
    Boolean(resumeDoc.gridFsFileId) ||
    (typeof resumeDoc.filePath === 'string' && resumeDoc.filePath.startsWith('gridfs://'));

  if (isGridFs) {
    const fileId = resumeDoc.gridFsFileId || (resumeDoc.filePath ? resumeDoc.filePath.replace('gridfs://', '') : null);
    if (fileId) {
      await deleteFileFromGridFs(fileId);
    }
  } else if (resumeDoc.filePath) {
    await deleteFileFromDisk(resumeDoc.filePath);
  }
};

module.exports = {
  validatePdfMagicBytes,
  extractTextFromPdf,
  getStorageDir,
  saveResumeToDisk,
  deleteFileFromDisk,
  saveResumeToGridFs,
  openGridFsDownloadStream,
  deleteFileFromGridFs,
  getStorageType,
  saveResumeFile,
  deleteResumeFile,
};
