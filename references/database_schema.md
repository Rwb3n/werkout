# Werkout.in Database Schema

## Overview

This document outlines the database schema for the Werkout.in MVP. The schema is designed to support the core functionality of connecting fitness seekers with fitness providers, managing profiles, enabling search and discovery, and supporting community features. MongoDB is selected as the primary database due to its flexibility with evolving schemas and scalability.

## Data Models

### User Model

The base User model contains authentication and common user information.

```javascript
// users collection
{
  _id: ObjectId,
  email: String,              // Unique, required, indexed
  passwordHash: String,       // Bcrypt hashed password
  firstName: String,          // Required
  lastName: String,           // Required
  phoneNumber: String,        // Optional
  profilePicture: String,     // URL to profile image
  userType: String,           // "seeker" or "provider"
  location: {                 // Required
    city: String,
    state: String,
    country: String,
    coordinates: {            // GeoJSON Point
      type: String,           // "Point"
      coordinates: [Number]   // [longitude, latitude]
    }
  },
  socialMediaLinks: {         // Optional
    instagram: String,
    facebook: String,
    twitter: String,
    youtube: String,
    linkedin: String
  },
  contactPreferences: {       // Required
    whatsapp: Boolean,
    email: Boolean,
    phone: Boolean
  },
  isVerified: Boolean,        // Email verification status
  isActive: Boolean,          // Account status
  privacySettings: {          // Privacy controls
    showEmail: Boolean,
    showPhone: Boolean,
    showLocation: Boolean,
    showActivity: Boolean
  },
  notificationSettings: {     // Notification preferences
    email: Boolean,
    push: Boolean,
    sms: Boolean
  },
  createdAt: Date,            // Account creation timestamp
  updatedAt: Date,            // Last update timestamp
  lastLoginAt: Date           // Last login timestamp
}
```

### Seeker Profile Model

Extended profile information for fitness seekers.

```javascript
// seekerProfiles collection
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to users collection
  bio: String,                // Optional, personal description
  fitnessLevel: String,       // "beginner", "intermediate", "advanced"
  fitnessGoals: [String],     // Array of goals
  interests: [String],        // Array of fitness interests
  fitnessJourney: [{          // Array of milestones
    title: String,
    description: String,
    date: Date,
    isPublic: Boolean
  }],
  preferredTrainingTypes: [String], // Array of training preferences
  medicalConsiderations: String,    // Optional, private
  measurements: {             // Optional, private
    height: Number,
    weight: Number,
    bodyFat: Number,
    lastUpdated: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Provider Profile Model

Extended profile information for fitness providers (trainers, coaches, gyms, etc.).

```javascript
// providerProfiles collection
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to users collection
  businessName: String,       // Optional, for gyms/clubs
  bio: String,                // Required, professional description
  specialties: [String],      // Array of specialties, indexed
  experience: Number,         // Years of experience
  credentials: [{             // Array of certifications
    title: String,
    organization: String,
    year: Number,
    verificationUrl: String,  // Optional
    isVerified: Boolean
  }],
  services: [{                // Array of services offered
    title: String,
    description: String,
    type: String,             // "one-on-one", "group", "online", etc.
    isActive: Boolean
  }],
  languages: [String],        // Languages spoken
  businessHours: {            // Operating hours
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  responseTime: String,       // Typical response time
  providerType: String,       // "trainer", "coach", "gym", "club", "event_organizer"
  verificationStatus: String, // "pending", "verified", "rejected"
  verificationDocuments: [{   // Documents for verification
    type: String,
    url: String,
    uploadedAt: Date,
    status: String            // "pending", "approved", "rejected"
  }],
  gallery: [{                 // Photos/videos
    type: String,             // "image" or "video"
    url: String,
    caption: String,
    isPublic: Boolean
  }],
  featuredStatus: {           // For premium/featured providers
    isFeatured: Boolean,
    featuredUntil: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model

Reviews and ratings for providers.

```javascript
// reviews collection
{
  _id: ObjectId,
  providerId: ObjectId,       // Reference to providerProfiles
  reviewerId: ObjectId,       // Reference to users (seeker)
  rating: Number,             // 1-5 scale
  title: String,              // Optional
  content: String,            // Review text
  isVerifiedClient: Boolean,  // Whether reviewer was a client
  providerResponse: {         // Optional response from provider
    content: String,
    createdAt: Date
  },
  helpfulVotes: Number,       // Number of helpful votes
  reportCount: Number,        // Number of reports
  isPublic: Boolean,          // Visibility status
  createdAt: Date,
  updatedAt: Date
}
```

### Connection Model

Connections between seekers and providers.

```javascript
// connections collection
{
  _id: ObjectId,
  seekerId: ObjectId,         // Reference to users (seeker)
  providerId: ObjectId,       // Reference to users (provider)
  status: String,             // "pending", "active", "declined", "blocked"
  initiatedBy: ObjectId,      // Who initiated the connection
  notes: String,              // Private notes (visible only to creator)
  lastInteractionDate: Date,  // Last communication date
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model

Fitness events created by providers.

```javascript
// events collection
{
  _id: ObjectId,
  creatorId: ObjectId,        // Reference to users (provider)
  title: String,              // Required
  description: String,        // Required
  eventType: String,          // "class", "workshop", "competition", etc.
  category: String,           // Fitness category
  startDate: Date,            // Required
  endDate: Date,              // Required
  location: {
    name: String,             // Venue name
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {            // GeoJSON Point
      type: String,           // "Point"
      coordinates: [Number]   // [longitude, latitude]
    }
  },
  isOnline: Boolean,          // Whether event is virtual
  onlineUrl: String,          // Link for virtual events
  capacity: Number,           // Maximum attendees
  currentAttendees: Number,   // Current registration count
  price: {                    // Optional if free
    amount: Number,
    currency: String
  },
  isFree: Boolean,
  image: String,              // Event banner image URL
  requirements: [String],     // What to bring/prepare
  registrationDeadline: Date, // Optional
  isPublic: Boolean,          // Visibility status
  attendees: [{               // Registered attendees
    userId: ObjectId,         // Reference to users
    registrationDate: Date,
    status: String            // "registered", "attended", "cancelled"
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Group Model

Fitness groups created by providers or seekers.

```javascript
// groups collection
{
  _id: ObjectId,
  name: String,               // Required
  description: String,        // Required
  category: String,           // Fitness category
  creatorId: ObjectId,        // Reference to users
  location: {                 // General location
    city: String,
    state: String,
    country: String
  },
  image: String,              // Group banner image URL
  isPublic: Boolean,          // Whether group is public or private
  membershipApproval: String, // "automatic" or "manual"
  members: [{                 // Group members
    userId: ObjectId,         // Reference to users
    role: String,             // "admin", "moderator", "member"
    joinedAt: Date,
    status: String            // "active", "inactive", "banned"
  }],
  memberCount: Number,        // Total member count
  events: [ObjectId],         // References to events collection
  discussions: [{             // Group discussions
    _id: ObjectId,
    creatorId: ObjectId,      // Reference to users
    title: String,
    content: String,
    comments: [{
      userId: ObjectId,       // Reference to users
      content: String,
      createdAt: Date
    }],
    createdAt: Date,
    updatedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Success Story Model

Success stories shared by seekers.

```javascript
// successStories collection
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to users (seeker)
  trainerId: ObjectId,        // Reference to users (provider)
  title: String,              // Required
  content: String,            // Required
  goal: String,               // Fitness goal
  duration: String,           // Time period
  achievement: String,        // What was achieved
  beforeImage: String,        // Before image URL
  afterImage: String,         // After image URL
  isPublic: Boolean,          // Visibility status
  isVerified: Boolean,        // Whether verified by trainer
  likes: Number,              // Like count
  comments: [{                // Comments on story
    userId: ObjectId,         // Reference to users
    content: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Challenge Model

Fitness challenges created by providers.

```javascript
// challenges collection
{
  _id: ObjectId,
  creatorId: ObjectId,        // Reference to users (provider)
  title: String,              // Required
  description: String,        // Required
  category: String,           // Fitness category
  startDate: Date,            // Required
  endDate: Date,              // Required
  rules: [String],            // Challenge rules
  image: String,              // Challenge banner image URL
  isPublic: Boolean,          // Visibility status
  participants: [{            // Challenge participants
    userId: ObjectId,         // Reference to users
    joinedAt: Date,
    progress: [{              // Progress updates
      date: Date,
      value: Number,          // Progress value
      notes: String,
      proofUrl: String        // Optional proof image/video
    }],
    status: String            // "active", "completed", "dropped"
  }],
  participantCount: Number,   // Total participant count
  discussions: [{             // Challenge discussions
    _id: ObjectId,
    userId: ObjectId,         // Reference to users
    content: String,
    createdAt: Date,
    comments: [{
      userId: ObjectId,       // Reference to users
      content: String,
      createdAt: Date
    }]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model

Direct messages between users.

```javascript
// messages collection
{
  _id: ObjectId,
  conversationId: ObjectId,   // Reference to conversations
  senderId: ObjectId,         // Reference to users
  receiverId: ObjectId,       // Reference to users
  content: String,            // Message content
  isRead: Boolean,            // Read status
  readAt: Date,               // When message was read
  createdAt: Date             // When message was sent
}
```

### Conversation Model

Conversations between users.

```javascript
// conversations collection
{
  _id: ObjectId,
  participants: [ObjectId],   // References to users
  lastMessageId: ObjectId,    // Reference to messages
  lastMessageAt: Date,        // Timestamp of last message
  isActive: Boolean,          // Whether conversation is active
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model

User notifications.

```javascript
// notifications collection
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to users
  type: String,               // Notification type
  title: String,              // Notification title
  content: String,            // Notification content
  relatedId: ObjectId,        // Related entity (event, message, etc.)
  isRead: Boolean,            // Read status
  readAt: Date,               // When notification was read
  createdAt: Date             // When notification was created
}
```

### Specialty Model

Fitness specialties/categories.

```javascript
// specialties collection
{
  _id: ObjectId,
  name: String,               // Required, unique
  description: String,        // Optional
  icon: String,               // Icon URL
  isActive: Boolean,          // Whether specialty is active
  createdAt: Date,
  updatedAt: Date
}
```

## Database Indexes

To optimize query performance, the following indexes will be created:

### User Indexes
```javascript
// users collection
{ email: 1 }, { unique: true }
{ "location.coordinates": "2dsphere" }
{ userType: 1 }
{ createdAt: 1 }
```

### Provider Profile Indexes
```javascript
// providerProfiles collection
{ userId: 1 }, { unique: true }
{ specialties: 1 }
{ providerType: 1 }
{ "location.coordinates": "2dsphere" }
{ verificationStatus: 1 }
{ featuredStatus.isFeatured: 1 }
```

### Seeker Profile Indexes
```javascript
// seekerProfiles collection
{ userId: 1 }, { unique: true }
{ fitnessLevel: 1 }
{ interests: 1 }
```

### Review Indexes
```javascript
// reviews collection
{ providerId: 1 }
{ reviewerId: 1 }
{ rating: 1 }
{ createdAt: 1 }
```

### Event Indexes
```javascript
// events collection
{ creatorId: 1 }
{ startDate: 1 }
{ category: 1 }
{ "location.coordinates": "2dsphere" }
{ "attendees.userId": 1 }
```

### Group Indexes
```javascript
// groups collection
{ creatorId: 1 }
{ category: 1 }
{ "members.userId": 1 }
{ "location.city": 1, "location.state": 1 }
```

### Challenge Indexes
```javascript
// challenges collection
{ creatorId: 1 }
{ category: 1 }
{ startDate: 1, endDate: 1 }
{ "participants.userId": 1 }
```

### Message Indexes
```javascript
// messages collection
{ conversationId: 1 }
{ senderId: 1 }
{ receiverId: 1 }
{ createdAt: 1 }
```

### Notification Indexes
```javascript
// notifications collection
{ userId: 1 }
{ isRead: 1 }
{ createdAt: 1 }
```

## Data Relationships

The schema uses a combination of embedded documents and references to model relationships:

1. **One-to-One Relationships**:
   - User to SeekerProfile/ProviderProfile (referenced by userId)

2. **One-to-Many Relationships**:
   - Provider to Events (referenced by creatorId)
   - Provider to Reviews (referenced by providerId)
   - User to Notifications (referenced by userId)

3. **Many-to-Many Relationships**:
   - Users to Conversations (array of references)
   - Users to Groups (embedded array of members)
   - Users to Events (embedded array of attendees)
   - Users to Challenges (embedded array of participants)

## Data Validation

MongoDB schema validation will be implemented to ensure data integrity:

```javascript
// Example validation for users collection
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "passwordHash", "firstName", "lastName", "userType", "location"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        userType: {
          enum: ["seeker", "provider"]
        },
        // Additional validation rules...
      }
    }
  }
});
```

## Data Migration Strategy

For future schema changes, the following migration strategy will be employed:

1. **Versioning**: Track schema versions in application code
2. **Backward Compatibility**: Ensure new schema changes are backward compatible
3. **Incremental Updates**: Update documents incrementally as they are accessed
4. **Background Jobs**: Run background jobs for batch updates of existing documents

## Scalability Considerations

The schema is designed with scalability in mind:

1. **Sharding Keys**: Collections like users, events, and messages can be sharded by appropriate fields
2. **Denormalization**: Strategic denormalization to reduce joins and improve read performance
3. **Compound Indexes**: Optimize for common query patterns
4. **TTL Indexes**: Automatic expiration for temporary data like notifications

## Data Security

To ensure data security:

1. **Sensitive Data**: Passwords are stored as bcrypt hashes
2. **Access Control**: Field-level access control based on user roles
3. **Encryption**: Sensitive fields can be encrypted at rest
4. **Audit Trail**: Changes to critical data are logged

## Future Schema Enhancements

For post-MVP phases, the schema can be extended to include:

1. **Payment Information**: For premium features and monetization
2. **Analytics Data**: User engagement and platform metrics
3. **Content Management**: Blog posts and educational content
4. **Affiliate Marketing**: Tracking for affiliate programs
5. **Advanced Permissions**: More granular access control
