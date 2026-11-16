const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: [20000, 'Job description cannot exceed 20,000 characters'],
    },
    jobType: {
      type: String,
      enum: ['Internship', 'Full-time', 'Part-time', 'Entry-level'],
      default: 'Full-time',
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote / Hybrid',
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },
    applicationDeadline: {
      type: String,
      trim: true,
      default: null,
    },
    extractedRequirements: {
      requiredSkills: [{ type: String }],
      preferredSkills: [{ type: String }],
      requiredQualifications: [{ type: String }],
      experienceRequirements: { type: String, default: '' },
      projectRequirements: [{ type: String }],
      responsibilities: [{ type: String }],
      softSkills: [{ type: String }],
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

jobDescriptionSchema.index({ user: 1, createdAt: -1 });

const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);

module.exports = JobDescription;
