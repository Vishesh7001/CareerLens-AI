const mongoose = require('mongoose');

const questionEvaluationSchema = new mongoose.Schema(
  {
    overallScore: { type: Number, min: 0, max: 100 },
    performanceLabel: {
      type: String,
      enum: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
    },
    criterionScores: { type: Map, of: Number, default: {} },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    missingConcepts: [{ type: String }],
    incorrectConcepts: [{ type: String }],
    improvementSuggestions: [{ type: String }],
    improvedSampleAnswer: { type: String, default: '' },
    explanation: { type: String, default: '' },
    provider: { type: String, default: 'fastapi-ai-engine' },
    evaluatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const interviewQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    questionText: { type: String, required: true },
    category: { type: String, enum: ['technical', 'hr'], required: true },
    difficulty: { type: String, required: true },
    topic: { type: String, default: 'General' },
    order: { type: Number, required: true },
    expectedConcepts: [{ type: String }],
    evaluationCriteria: [{ type: String }],
    sampleAnswer: { type: String, default: '' },
    draftAnswer: { type: String, default: '' },
    answer: { type: String, default: '' },
    wordCount: { type: Number, default: 0 },
    answerSubmittedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['pending', 'answered', 'skipped'],
      default: 'pending',
    },
    evaluation: { type: questionEvaluationSchema, default: null },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
      default: null,
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Interview role is required'],
    },
    customRole: {
      type: String,
      default: null,
    },
    interviewType: {
      type: String,
      enum: ['Technical Interview', 'HR Interview', 'Mixed Interview'],
      required: [true, 'Interview type is required'],
      default: 'Technical Interview',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: [true, 'Difficulty level is required'],
      default: 'Intermediate',
    },
    totalQuestions: {
      type: Number,
      enum: [5, 10, 15],
      required: [true, 'Total questions count is required'],
      default: 5,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
      index: true,
    },
    questions: [interviewQuestionSchema],
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    performanceLabel: {
      type: String,
      default: null,
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    performanceBreakdown: {
      type: Map,
      of: Number,
      default: {},
    },
    summaryFeedback: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      recommendations: [{ type: String }],
      readinessAssessment: { type: String, default: '' },
    },
    provider: {
      type: String,
      default: 'fastapi-ai-engine',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
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

interviewSessionSchema.index({ user: 1, createdAt: -1 });
interviewSessionSchema.index({ user: 1, status: 1 });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

module.exports = InterviewSession;
