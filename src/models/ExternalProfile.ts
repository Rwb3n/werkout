// import mongoose, { Schema, Document, models, model, Types } from 'mongoose'; // mongoose import removed
import { Schema, Document, models, model, Types } from 'mongoose';

// Define possible platforms
type PlatformType = 'instagram' | 'tiktok' | 'strava' | 'youtube';

// Interface for the ExternalProfile document
export interface IExternalProfile extends Document {
  userId: Types.ObjectId; // Reference to the User model
  platform: PlatformType;
  username: string;
  profileUrl: string;
  accessToken?: string; // Store securely (consider encryption layer)
  refreshToken?: string; // Store securely
  tokenExpiry?: Date;
  lastSyncedAt?: Date;
  isActive: boolean;
  metadata?: object; // For storing platform-specific profile details
  createdAt: Date;
  updatedAt: Date;
}

const ExternalProfileSchema = new Schema<IExternalProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    platform: { 
      type: String, 
      enum: ['instagram', 'tiktok', 'strava', 'youtube'], 
      required: true 
    },
    username: { type: String, required: true },
    profileUrl: { type: String, required: true },
    // IMPORTANT: Access/Refresh tokens should ideally be encrypted before saving
    // Consider using mongoose-encryption or a similar library/pattern
    accessToken: { type: String }, 
    refreshToken: { type: String },
    tokenExpiry: { type: Date },
    lastSyncedAt: { type: Date },
    isActive: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed }, // Use Mixed for flexible object storage
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only connect one account per platform
ExternalProfileSchema.index({ userId: 1, platform: 1 }, { unique: true });

// Prevent model redefinition
const ExternalProfile = models.ExternalProfile || model<IExternalProfile>('ExternalProfile', ExternalProfileSchema);

export default ExternalProfile; 