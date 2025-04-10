// import mongoose, { Schema, Document, models, model } from 'mongoose'; // mongoose import removed
import { Schema, Document, models, model } from 'mongoose';

// Interface defining the structure of the Location subdocument
interface ILocation {
  city: string;
  state: string;
  country: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

// Interface defining the structure of the ContactPreferences subdocument
interface IContactPreferences {
  whatsapp: boolean;
  email: boolean;
  phone: boolean;
}

// Interface defining the structure of the User document
export interface IUser extends Document {
  clerkId: string; // Link to Clerk user ID
  email: string;
  firstName?: string; // Optional, might come from Clerk
  lastName?: string;  // Optional, might come from Clerk
  userType: 'seeker' | 'provider';
  location: ILocation;
  contactPreferences: IContactPreferences;
  // isVerified: boolean; // Handled by Clerk
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Add references to ProviderProfile/SeekerProfile later if needed
}

const LocationSchema = new Schema<ILocation>({
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere' // Create geospatial index
    }
  }
}, { _id: false }); // Don't create a separate _id for the subdocument

const ContactPreferencesSchema = new Schema<IContactPreferences>({
  whatsapp: { type: Boolean, default: false },
  email: { type: Boolean, default: true },
  phone: { type: Boolean, default: false },
}, { _id: false });

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true }, // Ensure email is unique and stored consistently
    firstName: { type: String },
    lastName: { type: String },
    userType: { type: String, enum: ['seeker', 'provider'], required: true, index: true },
    location: { type: LocationSchema, required: true },
    contactPreferences: { type: ContactPreferencesSchema, required: true },
    // passwordHash is managed by Clerk
    // isVerified is managed by Clerk
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Prevent model redefinition in hot-reload environments
const User = models.User || model<IUser>('User', UserSchema);

export default User; 