import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

// Interface defining the structure of the SeekerProfile document
export interface ISeekerProfile extends Document {
  userId: Types.ObjectId; // Reference to the User model
  level?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  interests?: string[];
  // journey: Milestone[]; // Skipping journey/milestones for now, can add later
  createdAt: Date;
  updatedAt: Date;
}

const SeekerProfileSchema = new Schema<ISeekerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    goals: { type: [String] },
    interests: { type: [String], index: true }, // Index interests for potential matching
    // journey: { type: [MilestoneSchema] } // Add later if Milestone schema is defined
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Prevent model redefinition
const SeekerProfile = models.SeekerProfile || model<ISeekerProfile>('SeekerProfile', SeekerProfileSchema);

export default SeekerProfile; 