const mongoose = require('mongoose');

const categoryScoreSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    weightedScore: { type: Number, required: true, min: 0, max: 100 },
    weightPercentage: { type: Number, required: true },
    feedback: { type: String, default: '' },
  },
  { _id: false }
);

const skillMatchItemSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    matchType: { type: String, enum: ['exact', 'equivalent'], required: true },
    matchedWith: { type: String, default: null },
  },
  { _id: false }
);

const missingSkillDetailSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
    isRequired: { type: Boolean, default: true },
    reason: { type: String, required: true },
    suggestedLearningDirection: { type: String, required: true },
  },
  { _id: false }
);

const jobMatchSchema = new mongoose.Schema(
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
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
      required: [true, 'Job reference is required'],
      index: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchClassification: {
      type: String,
      enum: ['Excellent Match', 'Strong Match', 'Moderate Match', 'Low Match'],
      required: true,
    },
    categoryScores: {
      technicalSkills: { type: categoryScoreSchema, required: true },
      projectsRelevance: { type: categoryScoreSchema, required: true },
      educationCompatibility: { type: categoryScoreSchema, required: true },
      experienceInternships: { type: categoryScoreSchema, required: true },
      preferredSkills: { type: categoryScoreSchema, required: true },
    },
    matchedSkills: [skillMatchItemSchema],
    missingRequiredSkills: [missingSkillDetailSchema],
    missingPreferredSkills: [missingSkillDetailSchema],
    projectEvaluation: {
      relevanceScore: { type: Number, default: 0 },
      feedback: { type: String, default: '' },
      suggestions: { type: String, default: '' },
    },
    educationEvaluation: {
      compatibilityScore: { type: Number, default: 0 },
      feedback: { type: String, default: '' },
    },
    experienceEvaluation: {
      compatibilityScore: { type: Number, default: 0 },
      feedback: { type: String, default: '' },
      studentPerspective: { type: String, default: '' },
    },
    matchingExplanation: {
      type: String,
      default: '',
    },
    keyObservations: [{ type: String }],
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
  }
);

jobMatchSchema.index({ user: 1, job: 1 });
jobMatchSchema.index({ user: 1, resume: 1 });

const JobMatch = mongoose.model('JobMatch', jobMatchSchema);

module.exports = JobMatch;
