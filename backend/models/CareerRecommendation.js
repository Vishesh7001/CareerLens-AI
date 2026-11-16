const mongoose = require('mongoose');

const careerPathItemSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    recommendationScore: { type: Number, required: true, min: 0, max: 100 },
    whyRecommended: { type: String, required: true },
    relevantExistingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    suggestedProjects: [{ type: String }],
    preparationPriorities: [{ type: String }],
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const careerRecommendationSchema = new mongoose.Schema(
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
    targetRole: {
      type: String,
      default: null,
    },
    primaryRecommendations: [careerPathItemSchema],
    alternativeRecommendations: [careerPathItemSchema],
    studentAdvice: {
      type: String,
      default: '',
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

careerRecommendationSchema.index({ user: 1, createdAt: -1 });

const CareerRecommendation = mongoose.model('CareerRecommendation', careerRecommendationSchema);

module.exports = CareerRecommendation;
