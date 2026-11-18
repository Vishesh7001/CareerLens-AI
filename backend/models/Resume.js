const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    storedFileName: {
      type: String,
      required: [true, 'Stored file name is required'],
      trim: true,
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    storageType: {
      type: String,
      enum: ['local', 'gridfs'],
      default: 'local',
    },
    gridFsFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      default: 'application/pdf',
    },
    rawText: {
      type: String,
      required: [true, 'Extracted raw text is required'],
    },
    parsedData: {
      personalInfo: {
        fullName: { type: String, default: null },
        email: { type: String, default: null },
        phone: { type: String, default: null },
        location: { type: String, default: null },
        linkedin: { type: String, default: null },
        github: { type: String, default: null },
        portfolio: { type: String, default: null },
      },
      education: [
        {
          institution: { type: String, default: null },
          degree: { type: String, default: null },
          specialization: { type: String, default: null },
          graduationYear: { type: String, default: null },
          grade: { type: String, default: null },
        },
      ],
      skills: {
        programmingLanguages: [{ type: String }],
        frameworks: [{ type: String }],
        databases: [{ type: String }],
        tools: [{ type: String }],
        other: [{ type: String }],
      },
      experience: [
        {
          company: { type: String, default: null },
          position: { type: String, default: null },
          duration: { type: String, default: null },
          description: { type: String, default: null },
        },
      ],
      projects: [
        {
          title: { type: String, default: null },
          technologies: [{ type: String }],
          description: { type: String, default: null },
          link: { type: String, default: null },
        },
      ],
      certifications: [
        {
          name: { type: String, default: null },
          issuer: { type: String, default: null },
          date: { type: String, default: null },
        },
      ],
    },
    parsingStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    parsingError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        // Do not expose sensitive internal filesystem paths to the client
        delete ret.filePath;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;

