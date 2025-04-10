import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IConnection extends Document {
  seekerId: Types.ObjectId; // Reference to the User (Seeker)
  providerId: Types.ObjectId; // Reference to the User (Provider)
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  initiatedBy: 'seeker' | 'provider';
  message?: string; // Optional message with the request
  createdAt: Date;
  updatedAt: Date;
}

const connectionSchema: Schema = new Schema({
  seekerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'blocked'],
    default: 'pending',
    required: true,
  },
  initiatedBy: {
      type: String,
      enum: ['seeker', 'provider'],
      required: true
  },
  message: {
      type: String,
      trim: true,
      maxlength: 500
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Ensure a unique connection between a seeker and a provider
connectionSchema.index({ seekerId: 1, providerId: 1 }, { unique: true });

// Check if the model already exists before defining it
const Connection: Model<IConnection> = mongoose.models.Connection || mongoose.model<IConnection>('Connection', connectionSchema);

export default Connection; 