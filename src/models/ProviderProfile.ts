// import mongoose, { Schema, Document, models, model, Types } from 'mongoose'; // mongoose import removed
import { Schema, Document, models, model, Types } from 'mongoose';

// Interface for Credential subdocument
interface ICredential {
  title: string;
  organization: string;
  year?: number;
  isVerified: boolean;
}

// Interface for Service subdocument
interface IService {
  title: string;
  description: string;
  type?: 'one-on-one' | 'group' | 'online' | 'other';
  isActive: boolean;
}

// Interface for the ProviderProfile document
export interface IProviderProfile extends Document {
  userId: Types.ObjectId; // Reference to the User model
  bio: string;
  specialties: string[];
  experience?: number;
  credentials?: ICredential[];
  services?: IService[];
  languages?: string[];
  responseTime?: 'within_hour' | 'within_day' | 'within_few_days' | 'other';
  providerType: 'trainer' | 'coach' | 'group_leader' | 'gym' | 'studio';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const CredentialSchema = new Schema<ICredential>({
  title: { type: String, required: true },
  organization: { type: String, required: true },
  year: { type: Number },
  isVerified: { type: Boolean, default: false },
}, { _id: false }); // Use default _id generation within array if needed, or add custom ID logic

const ServiceSchema = new Schema<IService>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['one-on-one', 'group', 'online', 'other'] },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const ProviderProfileSchema = new Schema<IProviderProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    bio: { type: String, required: true },
    specialties: { type: [String], required: true, index: true }, // Index for searching
    experience: { type: Number },
    credentials: { type: [CredentialSchema] },
    services: { type: [ServiceSchema] },
    languages: { type: [String] },
    responseTime: { type: String, enum: ['within_hour', 'within_day', 'within_few_days', 'other'] },
    providerType: { type: String, enum: ['trainer', 'coach', 'group_leader', 'gym', 'studio'], required: true, index: true },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Prevent model redefinition
const ProviderProfile = models.ProviderProfile || model<IProviderProfile>('ProviderProfile', ProviderProfileSchema);

export default ProviderProfile; 