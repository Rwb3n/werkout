import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';

// Enum for Response Time (adjust values/labels as needed)
export enum ResponseTime {
    WithinHour = 'within_hour',
    WithinFewHours = 'within_few_hours',
    Within24Hours = 'within_24_hours',
    MoreThan24Hours = 'more_than_24_hours',
}

// Interface for the ProviderProfile document
export interface IProviderProfile extends Document {
  userId: Types.ObjectId; // Reference to the User model
  bio?: string;
  specialties?: string[];
  certifications?: string[];
  yearsOfExperience?: number;
  servicesOffered?: string[]; // e.g., ["Personal Training", "Nutrition Coaching"]
  availability?: string; // Could be structured object later, e.g., { Mon: "9-5", Tue: "10-6" }
  responseTime?: ResponseTime;
  websiteUrl?: string;
  // Consider adding fields for pricing, client testimonials (references?), etc.
  // The following fields are automatically added by timestamps: true
  // createdAt: Date;
  // updatedAt: Date;
}

const ProviderProfileSchema: Schema<IProviderProfile> = new Schema(
  {
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true, // Each user can only have one provider profile
        index: true 
    },
    bio: { type: String, maxlength: 1000 },
    specialties: [{ type: String, trim: true }], // Array of strings
    certifications: [{ type: String, trim: true }],
    yearsOfExperience: { type: Number, min: 0 },
    servicesOffered: [{ type: String, trim: true }],
    availability: { type: String }, // Simple string for now
    responseTime: {
      type: String,
      enum: Object.values(ResponseTime),
    },
    websiteUrl: { type: String },
    // Add other provider-specific fields here
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Prevent model recompilation
const ProviderProfile: Model<IProviderProfile> = 
    models.ProviderProfile || mongoose.model<IProviderProfile>('ProviderProfile', ProviderProfileSchema);

export default ProviderProfile; 