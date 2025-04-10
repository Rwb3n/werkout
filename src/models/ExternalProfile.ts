import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';

// Interface for the ExternalProfile document
export interface IExternalProfile extends Document {
  userId: Types.ObjectId; // Reference to the User model
  provider: string; // e.g., 'strava', 'google', 'facebook'
  providerUserId: string; // User ID from the external provider
  accessToken: string; // Encrypted access token
  refreshToken?: string; // Encrypted refresh token (if applicable)
  expiresAt?: Date; // Token expiry date
  scopes?: string[]; // Scopes granted by the user
  profileData?: Record<string, any>; // Store basic profile info from the provider (e.g., name, picture)
  lastSync?: Date; // Timestamp of the last data synchronization
  createdAt: Date;
  updatedAt: Date;
}

const ExternalProfileSchema: Schema<IExternalProfile> = new Schema(
  {
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        index: true 
    },
    provider: { type: String, required: true, index: true },
    providerUserId: { type: String, required: true, index: true },
    accessToken: { type: String, required: true }, // Should be encrypted before saving
    refreshToken: { type: String }, // Should be encrypted before saving
    expiresAt: { type: Date },
    scopes: [{ type: String }],
    profileData: { type: Schema.Types.Mixed }, // Store arbitrary JSON data from provider
    lastSync: { type: Date },
    // Composite unique index to ensure a user can only link one account per provider
    // index: { userId: 1, provider: 1 }, { unique: true } // Add this if needed
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Apply the composite unique index if needed
// ExternalProfileSchema.index({ userId: 1, provider: 1 }, { unique: true });

// Prevent model recompilation
const ExternalProfile: Model<IExternalProfile> = 
    models.ExternalProfile || mongoose.model<IExternalProfile>('ExternalProfile', ExternalProfileSchema);

export default ExternalProfile; 