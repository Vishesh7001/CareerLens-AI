const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');
const {
  validatePdfMagicBytes,
  extractTextFromPdf,
  saveResumeToDisk,
  deleteFileFromDisk,
  getStorageDir,
} = require('../services/resumeService');
const { parseResumeText } = require('../services/resumeParserService');

/**
 * @desc    Upload, extract text, and parse a candidate resume
 * @route   POST /api/resumes/upload
 * @access  Private (Authenticated User)
 */
const uploadResume = async (req, res, next) => {
  let savedFilePath = null;

  try {
    // 1. Verify file was provided by multipart handler
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a PDF resume file in the "resume" field.',
      });
    }

    const { buffer, originalname, size, mimetype } = req.file;

    // 2. Validate PDF signature (magic bytes %PDF-)
    validatePdfMagicBytes(buffer);

    // 3. Extract text from PDF
    const { rawText } = await extractTextFromPdf(buffer);

    // 4. Parse structured sections via rule-based parser
    const parsedData = parseResumeText(rawText);

    // If candidate's name wasn't detected in the resume text, provide fallback from user account
    if (!parsedData.personalInfo.fullName && req.user && req.user.fullName) {
      parsedData.personalInfo.fullName = req.user.fullName;
    }
    // If email wasn't found, fallback to user's registered email
    if (!parsedData.personalInfo.email && req.user && req.user.email) {
      parsedData.personalInfo.email = req.user.email;
    }

    // 5. Check if user already has an active resume
    let existingResume = await Resume.findOne({ user: req.user._id });
    const oldFilePath = existingResume ? existingResume.filePath : null;

    // 6. Save new file to configured storage directory
    const saved = await saveResumeToDisk(req.user._id, originalname, buffer);
    savedFilePath = saved.filePath;

    // 7. Persist or update resume record in MongoDB
    if (existingResume) {
      existingResume.originalFileName = saved.sanitizedOriginal || originalname;
      existingResume.storedFileName = saved.storedFileName;
      existingResume.filePath = saved.filePath;
      existingResume.fileSize = size;
      existingResume.mimeType = mimetype || 'application/pdf';
      existingResume.rawText = rawText;
      existingResume.parsedData = parsedData;
      existingResume.parsingStatus = 'completed';
      existingResume.parsingError = null;

      await existingResume.save();

      // Clean up previous file from disk
      if (oldFilePath && oldFilePath !== savedFilePath) {
        await deleteFileFromDisk(oldFilePath);
      }

      return res.status(200).json({
        success: true,
        message: 'Resume updated and parsed successfully.',
        resume: existingResume,
      });
    } else {
      const newResume = await Resume.create({
        user: req.user._id,
        originalFileName: saved.sanitizedOriginal || originalname,
        storedFileName: saved.storedFileName,
        filePath: saved.filePath,
        fileSize: size,
        mimeType: mimetype || 'application/pdf',
        rawText,
        parsedData,
        parsingStatus: 'completed',
        parsingError: null,
      });

      return res.status(201).json({
        success: true,
        message: 'Resume uploaded and parsed successfully.',
        resume: newResume,
      });
    }
  } catch (error) {
    // If saving succeeded but DB or subsequent step failed, clean up the newly created file
    if (savedFilePath) {
      await deleteFileFromDisk(savedFilePath);
    }

    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to process and parse resume.',
    });
  }
};

/**
 * @desc    Get the authenticated user's active resume and parsed details
 * @route   GET /api/resumes
 * @access  Private (Authenticated User)
 */
const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      return res.status(200).json({
        success: true,
        resume: null,
      });
    }

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download the authenticated user's uploaded resume PDF
 * @route   GET /api/resumes/download
 * @access  Private (Authenticated User)
 */
const downloadResume = async (req, res, next) => {
  try {
    // 1. Retrieve the resume record exclusively for the authenticated user (User isolation)
    // Client-supplied parameters (query, body, params) for path or file are completely ignored
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found for this account.',
      });
    }

    if (!resume.filePath && !resume.storedFileName) {
      return res.status(404).json({
        success: false,
        message: 'Resume file record is incomplete.',
      });
    }

    // 2. Resolve canonical storage directory
    const storageDir = getStorageDir();
    let canonicalStorageDir = path.resolve(storageDir);
    try {
      if (fs.existsSync(canonicalStorageDir)) {
        canonicalStorageDir = fs.realpathSync.native
          ? fs.realpathSync.native(canonicalStorageDir)
          : fs.realpathSync(canonicalStorageDir);
      }
    } catch (_) {}

    // 3. Resolve candidate file path strictly from database values
    let candidatePath = resume.filePath
      ? path.resolve(canonicalStorageDir, resume.filePath)
      : path.resolve(canonicalStorageDir, resume.storedFileName);

    // If candidate path does not exist on disk, attempt fallback via storedFileName in storage directory
    if (!fs.existsSync(candidatePath) && resume.storedFileName) {
      const fallbackPath = path.resolve(canonicalStorageDir, resume.storedFileName);
      if (fs.existsSync(fallbackPath)) {
        candidatePath = fallbackPath;
      }
    }

    // Canonicalize target path if it exists to resolve symlinks and on-disk filesystem casing
    let canonicalTarget = candidatePath;
    try {
      if (fs.existsSync(candidatePath)) {
        canonicalTarget = fs.realpathSync.native
          ? fs.realpathSync.native(candidatePath)
          : fs.realpathSync(candidatePath);
      }
    } catch (_) {}

    // 4. Robust path traversal prevention using path.relative()
    const relative = path.relative(canonicalStorageDir, canonicalTarget);
    const isInsideStorage =
      Boolean(relative) &&
      !relative.startsWith('..') &&
      !path.isAbsolute(relative);

    if (!isInsideStorage) {
      return res.status(403).json({
        success: false,
        message: 'Access to the requested file path is forbidden.',
      });
    }

    // 5. Verify the file exists on server storage
    if (!fs.existsSync(canonicalTarget)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file is not found on the server storage.',
      });
    }

    // 6. Verify that the requested file is a regular file before streaming
    const stat = fs.statSync(canonicalTarget);
    if (!stat.isFile()) {
      return res.status(403).json({
        success: false,
        message: 'Access to the requested file path is forbidden.',
      });
    }

    // 7. Preserve secure download headers and stream with original filename
    const downloadFileName = resume.originalFileName || 'resume.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(downloadFileName)}"`
    );

    return res.download(canonicalTarget, downloadFileName, (err) => {
      if (err && !res.headersSent) {
        next(err);
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete the authenticated user's resume (record + file on disk)
 * @route   DELETE /api/resumes
 * @access  Private (Authenticated User)
 */
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found to delete.',
      });
    }

    // Safely remove file on disk
    await deleteFileFromDisk(resume.filePath);

    // Delete record from MongoDB
    await Resume.deleteOne({ _id: resume._id });

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResume,
  downloadResume,
  deleteResume,
};