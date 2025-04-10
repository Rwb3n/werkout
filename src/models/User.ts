import mongoose, { Schema, Document, models, Model } from 'mongoose';

// Enum definitions based on potential spec (adjust if spec differs)
export enum UserType {
  Seeker = 'seeker',
  Provider = 'provider',
}

export enum LocationType {
  Point = 'Point',
}

// Interface for the User document
export interface IUser extends Document {
  clerkId: string; // From Clerk authentication
  email: string; // From Clerk
  firstName?: string; // Optional, from Clerk or profile
  lastName?: string; // Optional, from Clerk or profile
  profileImageUrl?: string; // Optional, from Clerk
  userType?: UserType; // Set during onboarding
  profileComplete: boolean; // Flag set after profile wizard completion
  isActive: boolean; // For soft deletes or disabling accounts
  location?: {
    type: LocationType;
    coordinates: [number, number]; // [longitude, latitude]
    address?: string; // Optional: Full address
  };
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(LocationType),
    default: LocationType.Point,
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    index: '2dsphere', // Geospatial index
  },
  address: { type: String }, // Optional full address string
}, { _id: false });

const UserSchema: Schema<IUser> = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    profileImageUrl: { type: String },
    userType: {
      type: String,
      enum: Object.values(UserType),
    },
    profileComplete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    location: { type: locationSchema }, // Embed the location subdocument
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Prevent model recompilation in Next.js dev environment
const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 