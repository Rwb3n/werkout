const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User Schema
 * Core user information with authentication details
 * Using Clerk for authentication, so password fields are not needed
 */
const UserSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },
  userType: {
    type: String,
    enum: {
      values: ['seeker', 'provider'],
      message: '{VALUE} is not a valid user type'
    },
    required: [true, 'User type is required']
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    }
  },
  socialMediaLinks: {
    instagram: {
      type: String,
      trim: true
    },
    facebook: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    }
  },
  contactPreferences: {
    whatsapp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    },
    phone: {
      type: Boolean,
      default: true
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  privacySettings: {
    showEmail: {
      type: Boolean,
      default: false
    },
    showPhone: {
      type: Boolean,
      default: false
    },
    showLocation: {
      type: Boolean,
      default: true
    },
    showActivity: {
      type: Boolean,
      default: true
    }
  },
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  activityTracking: {
    lastActive: {
      type: Date,
      default: Date.now
    },
    sessionCount: {
      type: Number,
      default: 0
    },
    totalTimeActive: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    notificationFrequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'immediate'
    },
    contentPreferences: [{
      type: String,
      trim: true
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * Update user's last active time
 */
UserSchema.methods.updateActivity = function() {
  this.activityTracking.lastActive = Date.now();
  this.activityTracking.sessionCount += 1;
  return this.save();
};

/**
 * Get full name
 */
UserSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

/**
 * Create indexes
 */
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ clerkId: 1 }, { unique: true });
UserSchema.index({ 'location.coordinates': '2dsphere' });
UserSchema.index({ userType: 1 });
UserSchema.index({ createdAt: 1 });

const User = mongoose.model('User', UserSchema);

module.exports = User; 