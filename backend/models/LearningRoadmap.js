const mongoose = require('mongoose');

const roadmapItemSchema = new mongoose.Schema(
  {
    weekNumber: { type: Number, required: true },
    title: { type: String, required: true },
    learningObjective: { type: String, required: true },
    skillToLearn: { type: String, required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
    estimatedDuration: { type: String, default: '1 Week (8-10 hours)' },
    learningSequence: [{ type: String }],
    practicalExercises: [{ type: String }],
    suggestedMiniProjects: [{ type: String }],
    expectedOutcome: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const learningRoadmapSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Roadmap title is required'],
    },
    targetRole: {
      type: String,
      required: [true, 'Target role is required'],
    },
    companyName: {
      type: String,
      default: null,
    },
    summary: {
      type: String,
      default: '',
    },
    totalWeeks: {
      type: Number,
      default: 4,
    },
    items: [roadmapItemSchema],
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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
  }
);

learningRoadmapSchema.index({ user: 1, job: 1 });
learningRoadmapSchema.index({ user: 1, createdAt: -1 });

const LearningRoadmap = mongoose.model('LearningRoadmap', learningRoadmapSchema);

module.exports = LearningRoadmap;
