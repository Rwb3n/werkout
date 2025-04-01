const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     CredentialSchema:
 *       type: object
 *       required:
 *         - title
 *         - organization
 *         - year
 *       properties:
 *         title:
 *           type: string
 *           description: Credential title (e.g., certification name)
 *         organization:
 *           type: string
 *           description: Issuing organization
 *         year:
 *           type: number
 *           description: Year credential was issued
 *         verificationUrl:
 *           type: string
 *           description: URL for verification (optional)
 *         isVerified:
 *           type: boolean
 *           description: Whether the credential has been verified
 *     
 *     ServiceSchema:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *       properties:
 *         title:
 *           type: string
 *           description: Service title
 *         description:
 *           type: string
 *           description: Service description
 *         type:
 *           type: string
 *           enum: [one-on-one, group, online, consultation, assessment, other]
 *           description: Type of service
 *         isActive:
 *           type: boolean
 *           description: Whether service is currently offered
 *
 *     HoursSchema:
 *       type: object
 *       properties:
 *         open:
 *           type: string
 *           description: Opening time (format HH:MM)
 *         close:
 *           type: string
 *           description: Closing time (format HH:MM)
 *
 *     DocumentSchema:
 *       type: object
 *       required:
 *         - type
 *         - url
 *       properties:
 *         type:
 *           type: string
 *           enum: [license, certification, insurance, identification, other]
 *           description: Document type
 *         url:
 *           type: string
 *           description: URL of the document
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *           description: Upload date
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Verification status
 *
 *     GalleryItemSchema:
 *       type: object
 *       required:
 *         - type
 *         - url
 *       properties:
 *         type:
 *           type: string
 *           enum: [image, video]
 *           description: Media type
 *         url:
 *           type: string
 *           description: URL of the media
 *         caption:
 *           type: string
 *           description: Caption for the media
 *         isPublic:
 *           type: boolean
 *           description: Whether the item is publicly visible
 *
 *     ProviderProfile:
 *       type: object
 *       required:
 *         - userId
 *         - bio
 *         - providerType
 *       properties:
 *         userId:
 *           type: string
 *           description: Reference to the User model
 *         businessName:
 *           type: string
 *           description: Business or provider name
 *         bio:
 *           type: string
 *           description: Detailed profile description
 *         specialties:
 *           type: array
 *           items:
 *             type: string
 *           description: List of provider specialties
 *         experience:
 *           type: number
 *           description: Years of experience
 *         credentials:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CredentialSchema'
 *           description: Professional credentials and certifications
 *         services:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ServiceSchema'
 *           description: Services offered
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *           description: Languages spoken
 *         businessHours:
 *           type: object
 *           properties:
 *             monday:
 *               $ref: '#/components/schemas/HoursSchema'
 *             tuesday:
 *               $ref: '#/components/schemas/HoursSchema'
 *             wednesday:
 *               $ref: '#/components/schemas/HoursSchema'
 *             thursday:
 *               $ref: '#/components/schemas/HoursSchema'
 *             friday:
 *               $ref: '#/components/schemas/HoursSchema'
 *             saturday:
 *               $ref: '#/components/schemas/HoursSchema'
 *             sunday:
 *               $ref: '#/components/schemas/HoursSchema'
 *           description: Business hours by day of week
 *         responseTime:
 *           type: string
 *           enum: [immediate, within-hour, same-day, within-24-hours, within-48-hours]
 *           description: Typical response time
 *         providerType:
 *           type: string
 *           enum: [trainer, coach, gym, club, event_organizer]
 *           description: Type of provider
 *         verificationStatus:
 *           type: string
 *           enum: [pending, verified, rejected]
 *           description: Account verification status
 *         verificationDocuments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DocumentSchema'
 *           description: Documents for verification
 *         gallery:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GalleryItemSchema'
 *           description: Media gallery
 *         featuredStatus:
 *           type: object
 *           properties:
 *             isFeatured:
 *               type: boolean
 *               description: Whether provider is featured
 *             featuredUntil:
 *               type: string
 *               format: date-time
 *               description: Date until which provider is featured
 *           description: Featured status information
 *         completionScore:
 *           type: number
 *           description: Profile completion score (0-100)
 */

/**
 * Credentials Schema for certifications and qualifications
 */
const CredentialSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Credential title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  organization: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot be more than 100 characters']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1950, 'Year must be after 1950'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  verificationUrl: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

/**
 * Service Schema for services offered by provider
 */
const ServiceSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Service type is required'],
    enum: {
      values: ['one-on-one', 'group', 'online', 'consultation', 'assessment', 'other'],
      message: '{VALUE} is not a valid service type'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

/**
 * Business Hours Schema
 */
const HoursSchema = new Schema({
  open: {
    type: String,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Hours must be in format HH:MM (24-hour)'
    }
  },
  close: {
    type: String,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Hours must be in format HH:MM (24-hour)'
    }
  }
});

/**
 * Verification Document Schema
 */
const DocumentSchema = new Schema({
  type: {
    type: String,
    required: [true, 'Document type is required'],
    enum: {
      values: ['license', 'certification', 'insurance', 'identification', 'other'],
      message: '{VALUE} is not a valid document type'
    }
  },
  url: {
    type: String,
    required: [true, 'Document URL is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  }
});

/**
 * Gallery Item Schema
 */
const GalleryItemSchema = new Schema({
  type: {
    type: String,
    required: [true, 'Media type is required'],
    enum: {
      values: ['image', 'video'],
      message: '{VALUE} is not a valid media type'
    }
  },
  url: {
    type: String,
    required: [true, 'Media URL is required']
  },
  caption: {
    type: String,
    trim: true,
    maxlength: [200, 'Caption cannot be more than 200 characters']
  },
  isPublic: {
    type: Boolean,
    default: true
  }
});

/**
 * Provider Profile Schema
 * Extended profile information for fitness providers
 */
const ProviderProfileSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    trim: true,
    maxlength: [100, 'Business name cannot be more than 100 characters']
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    trim: true,
    maxlength: [2000, 'Bio cannot be more than 2000 characters']
  },
  specialties: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    default: 0
  },
  credentials: [CredentialSchema],
  services: [ServiceSchema],
  languages: [{
    type: String,
    trim: true
  }],
  businessHours: {
    monday: HoursSchema,
    tuesday: HoursSchema,
    wednesday: HoursSchema,
    thursday: HoursSchema,
    friday: HoursSchema,
    saturday: HoursSchema,
    sunday: HoursSchema
  },
  responseTime: {
    type: String,
    enum: {
      values: ['immediate', 'within-hour', 'same-day', 'within-24-hours', 'within-48-hours'],
      message: '{VALUE} is not a valid response time'
    },
    default: 'within-24-hours'
  },
  providerType: {
    type: String,
    required: [true, 'Provider type is required'],
    enum: {
      values: ['trainer', 'coach', 'gym', 'club', 'event_organizer'],
      message: '{VALUE} is not a valid provider type'
    }
  },
  verificationStatus: {
    type: String,
    enum: {
      values: ['pending', 'verified', 'rejected'],
      message: '{VALUE} is not a valid verification status'
    },
    default: 'pending'
  },
  verificationDocuments: [DocumentSchema],
  gallery: [GalleryItemSchema],
  featuredStatus: {
    isFeatured: {
      type: Boolean,
      default: false
    },
    featuredUntil: {
      type: Date
    }
  },
  completionScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * Calculate profile completion score
 */
ProviderProfileSchema.methods.calculateCompletionScore = function() {
  let score = 0;
  const totalFields = 10; // Number of main fields we're checking
  
  // Add points for each completed field
  if (this.bio && this.bio.length > 50) score += 1;
  if (this.businessName) score += 1;
  if (this.specialties && this.specialties.length > 0) score += 1;
  if (this.credentials && this.credentials.length > 0) score += 1;
  if (this.services && this.services.length > 0) score += 1;
  if (this.languages && this.languages.length > 0) score += 1;
  if (this.gallery && this.gallery.length > 0) score += 1;
  if (this.verificationDocuments && this.verificationDocuments.length > 0) score += 1;
  
  // Check if business hours are set
  let hasBusinessHours = false;
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const day of daysOfWeek) {
    if (this.businessHours && this.businessHours[day] && 
        this.businessHours[day].open && this.businessHours[day].close) {
      hasBusinessHours = true;
      break;
    }
  }
  if (hasBusinessHours) score += 1;
  
  // Check if provider type is set
  if (this.providerType) score += 1;
  
  // Calculate percentage
  this.completionScore = Math.floor((score / totalFields) * 100);
  return this.completionScore;
};

/**
 * Add a credential
 */
ProviderProfileSchema.methods.addCredential = function(credential) {
  this.credentials.push(credential);
  return this;
};

/**
 * Add a service
 */
ProviderProfileSchema.methods.addService = function(service) {
  this.services.push(service);
  return this;
};

/**
 * Add a gallery item
 */
ProviderProfileSchema.methods.addGalleryItem = function(item) {
  this.gallery.push(item);
  return this;
};

/**
 * Add a verification document
 */
ProviderProfileSchema.methods.addVerificationDocument = function(document) {
  this.verificationDocuments.push(document);
  return this;
};

/**
 * Pre-save middleware to calculate completion score
 */
ProviderProfileSchema.pre('save', function(next) {
  this.calculateCompletionScore();
  next();
});

/**
 * Create indexes
 */
ProviderProfileSchema.index({ userId: 1 }, { unique: true });
ProviderProfileSchema.index({ specialties: 1 });
ProviderProfileSchema.index({ providerType: 1 });
ProviderProfileSchema.index({ verificationStatus: 1 });
ProviderProfileSchema.index({ 'featuredStatus.isFeatured': 1 });

const ProviderProfile = mongoose.model('ProviderProfile', ProviderProfileSchema);

module.exports = ProviderProfile; 