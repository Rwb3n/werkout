import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';

// Enum for fitness level (example, adjust as needed)
export enum FitnessLevel {
    Beginner = 'beginner',
    Intermediate = 'intermediate',
    Advanced = 'advanced',
}

// Interface for the SeekerProfile document
export interface ISeekerProfile extends Document {
  userId: Types.ObjectId; // Reference to the User model
  goals?: string[]; // e.g., ["Weight Loss", "Muscle Gain", "Improve Endurance"]
  fitnessLevel?: FitnessLevel;
  preferences?: string; // e.g., "Prefers morning workouts", "Likes group classes"
  healthConditions?: string; // Consider privacy implications, maybe store sensitive data elsewhere
  // Add other seeker-specific fields here
  createdAt: Date;
  updatedAt: Date;
}

const SeekerProfileSchema: Schema<ISeekerProfile> = new Schema(
  {
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true, // Each user can only have one seeker profile
        index: true 
    },
    goals: [{ type: String, trim: true }],
    fitnessLevel: {
      type: String,
      enum: Object.values(FitnessLevel),
    },
    preferences: { type: String, maxlength: 500 },
    healthConditions: { type: String, maxlength: 1000 }, // Store minimal, non-sensitive info if possible
    // Add other seeker-specific fields here
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Prevent model recompilation
const SeekerProfile: Model<ISeekerProfile> = 
    models.SeekerProfile || mongoose.model<ISeekerProfile>('SeekerProfile', SeekerProfileSchema);

export default SeekerProfile; 