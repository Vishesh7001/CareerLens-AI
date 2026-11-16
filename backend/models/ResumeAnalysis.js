const mongoose = require('mongoose');

const categoryScoreSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 0 },
    feedback: { type: String, default: '' },
  },
  { _id: false }
);

const missingSkillSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    reason: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const projectAnalysisItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Project' },
    technologies: [{ type: String }],
    relevance: { type: String, default: 'Medium' },
    feedback: { type: String, default: '' },
    suggestions: { type: String, default: '' },
  },
  { _id: false }
);

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: [true, 'Resume reference is required'],
      index: true,
    },
    targetRole: {
      type: String,
      required: [true, 'Target career role is required'],
      trim: true,
    },
    jobDescription: {
      type: String,
      default: null,
      trim: true,
    },
    overallScore: {
      type: Number,
      required: [true, 'Overall resume score is required'],
      min: 0,
      max: 100,
    },
    categoryScores: {
      technicalSkills: { type: categoryScoreSchema, required: true },
      projects: { type: categoryScoreSchema, required: true },
      experience: { type: categoryScoreSchema, required: true },
      education: { type: categoryScoreSchema, required: true },
      certifications: { type: categoryScoreSchema, required: true },
      completeness: { type: categoryScoreSchema, required: true },
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    technicalSkillsAnalysis: {
      existingSkills: [{ type: String }],
      categorized: {
        programmingLanguages: [{ type: String }],
        frameworks: [{ type: String }],
        databases: [{ type: String }],
        tools: [{ type: String }],
        other: [{ type: String }],
      },
      roleRelevanceScore: { type: Number, default: 0 },
      summary: { type: String, default: '' },
    },
    missingSkills: [missingSkillSchema],
    projectAnalysis: [projectAnalysisItemSchema],
    experienceAnalysis: {
      hasExperience: { type: Boolean, default: false },
      level: { type: String, default: 'Entry' },
      summary: { type: String, default: '' },
      feedback: { type: String, default: '' },
      suggestions: { type: String, default: '' },
    },
    improvementSuggestions: [{ type: String }],
    aiFeedback: {
      summary: { type: String, default: '' },
      roleSuitability: { type: String, default: '' },
      mainImprovements: { type: String, default: '' },
      nextSteps: { type: String, default: '' },
    },
    analysisProvider: {
      type: String,
      required: true,
      default: 'fastapi-nlp-engine',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
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

// Index to retrieve the latest analysis for a specific resume and target role quickly
resumeAnalysisSchema.index({ user: 1, resume: 1, targetRole: 1, createdAt: -1 });

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

module.exports = ResumeAnalysis;
