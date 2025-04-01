# Profile Management Implementation Kickoff

This document provides specific guidance for beginning the implementation of profile management features for Sprint 2. It outlines the first steps for both backend and frontend components, focusing on the initial implementation of user and provider profile functionality.

## 1. Technical Debt Resolution (First Priority)

Before starting new feature implementation, the team must address the identified technical debt from Sprint 1:

1. **Database Indexing Optimization (D3)**
   ```javascript
   // Update geospatial index in User model
   UserSchema.index({ 'location.coordinates': '2dsphere' });
   
   // Add compound index for search efficiency
   UserSchema.index({ userType: 1, 'location.coordinates': '2dsphere' });
   ```

2. **Frontend Authentication Flow Refactoring (D2)**
   - Create a unified authentication context to prevent duplication
   - Implement custom hooks for auth state management
   - Move Clerk-specific logic to separate utility functions

3. **API Error Handling Standardization (D1)**
   - Update error middleware to ensure consistent format across all endpoints
   - Implement standardized error response builder function

## 2. Backend Implementation: First Steps

### 2.1. SeekerProfile Endpoints (D1)

1. **Create Controller Structure**
   ```javascript
   // src/backend/src/controllers/seekerProfile.controller.js
   
   const SeekerProfileController = {
     getProfile: async (req, res, next) => {
       try {
         // Implementation
       } catch (error) {
         next(error);
       }
     },
     
     updateProfile: async (req, res, next) => {
       try {
         // Implementation
       } catch (error) {
         next(error);
       }
     },
     
     getCompletionScore: async (req, res, next) => {
       try {
         // Implementation
       } catch (error) {
         next(error);
       }
     }
   };
   
   module.exports = SeekerProfileController;
   ```

2. **Implement Services Layer**
   ```javascript
   // src/backend/src/services/seekerProfile.service.js
   
   const UserModel = require('../models/User');
   const SeekerProfileModel = require('../models/SeekerProfile');
   
   const SeekerProfileService = {
     getProfileByUserId: async (userId) => {
       // Implementation
     },
     
     createOrUpdateProfile: async (userId, profileData) => {
       // Implementation
     },
     
     calculateCompletionScore: async (userId) => {
       // Implementation
     }
   };
   
   module.exports = SeekerProfileService;
   ```

3. **Set Up API Routes**
   ```javascript
   // src/backend/src/routes/seekerProfile.routes.js
   
   const express = require('express');
   const router = express.Router();
   const seekerProfileController = require('../controllers/seekerProfile.controller');
   const { requireAuth, requireRole } = require('../middleware/auth.middleware');
   const { validateSeekerProfile } = require('../validations/seeker.validation');
   
   router.get('/profile', 
     requireAuth, 
     requireRole('seeker'), 
     seekerProfileController.getProfile
   );
   
   router.post('/profile',
     requireAuth,
     requireRole('seeker'),
     validateSeekerProfile,
     seekerProfileController.updateProfile
   );
   
   router.get('/profile/completion',
     requireAuth,
     requireRole('seeker'),
     seekerProfileController.getCompletionScore
   );
   
   module.exports = router;
   ```

4. **Implement Schema Updates**
   ```javascript
   // Update SeekerProfile schema with new fields from profile-management-plan.md
   // src/backend/src/models/SeekerProfile.js
   
   const mongoose = require('mongoose');
   const Schema = mongoose.Schema;
   
   // Add new fields to existing schema
   const SeekerProfileSchema = new Schema({
     // Existing fields...
     
     // New fields
     socialProfiles: {
       instagram: String,
       facebook: String,
       twitter: String,
       youtube: String,
       tiktok: String
     },
     fitnessJourney: [{
       date: Date,
       title: String,
       description: String,
       image: String,
       isPublic: Boolean
     }],
     preferences: {
       preferredTrainingTypes: [String],
       availability: {
         // Days and times structure
       },
       privacySettings: {
         showJourney: Boolean,
         showMeasurements: Boolean
       }
     }
   });
   ```

### 2.2. ProviderProfile Endpoints (D1)

Follow similar steps as SeekerProfile for the provider profile endpoints, adapting for provider-specific fields and functionality.

## 3. Frontend Implementation: First Steps

### 3.1. Profile Page Components (D4)

1. **Create Profile Page Structure**
   ```jsx
   // src/frontend/pages/profile/index.js
   
   import { useEffect, useState } from 'react';
   import { useAuth } from '../../hooks/useAuth';
   import ProfileHeader from '../../components/profile/ProfileHeader';
   import ProfileTabs from '../../components/profile/ProfileTabs';
   import ProfileCompletion from '../../components/profile/ProfileCompletion';
   
   export default function ProfilePage() {
     const { user } = useAuth();
     const [profile, setProfile] = useState(null);
     const [loading, setLoading] = useState(true);
     
     useEffect(() => {
       // Fetch profile data based on user type
       const fetchProfile = async () => {
         // Implementation
       };
       
       if (user) {
         fetchProfile();
       }
     }, [user]);
     
     if (loading) return <div>Loading profile...</div>;
     
     return (
       <div className="profile-page">
         <ProfileHeader user={user} profile={profile} />
         <ProfileCompletion score={profile?.completionScore} />
         <ProfileTabs user={user} profile={profile} />
       </div>
     );
   }
   ```

2. **Create Reusable Profile Form Component**
   ```jsx
   // src/frontend/components/profile/ProfileForm.js
   
   import { useForm } from 'react-hook-form';
   
   export default function ProfileForm({ 
     profile, 
     onSubmit, 
     isLoading 
   }) {
     const { register, handleSubmit, formState: { errors } } = useForm({
       defaultValues: profile || {}
     });
     
     return (
       <form onSubmit={handleSubmit(onSubmit)}>
         {/* Form fields implementation */}
         <div className="form-group">
           <label>Bio</label>
           <textarea 
             {...register('bio', { required: 'Bio is required' })}
             className={errors.bio ? 'error' : ''}
           />
           {errors.bio && <span className="error-message">{errors.bio.message}</span>}
         </div>
         
         {/* Additional form fields */}
         
         <button 
           type="submit" 
           disabled={isLoading}
           className="submit-button"
         >
           {isLoading ? 'Saving...' : 'Save Profile'}
         </button>
       </form>
     );
   }
   ```

3. **Implement Profile Header Component**
   ```jsx
   // src/frontend/components/profile/ProfileHeader.js
   
   import Image from 'next/image';
   
   export default function ProfileHeader({ user, profile }) {
     return (
       <div className="profile-header">
         <div className="profile-photo">
           {profile?.profilePicture ? (
             <Image 
               src={profile.profilePicture} 
               alt={user.name} 
               width={120} 
               height={120} 
               className="rounded-full"
             />
           ) : (
             <div className="placeholder-avatar">{user.name[0]}</div>
           )}
         </div>
         
         <div className="profile-info">
           <h1>{user.name}</h1>
           <p className="location">{profile?.location?.city}, {profile?.location?.state}</p>
           {profile?.userType === 'provider' && (
             <div className="specialties">
               {profile.specialties?.map(specialty => (
                 <span key={specialty} className="specialty-tag">{specialty}</span>
               ))}
             </div>
           )}
         </div>
         
         <button className="edit-button">Edit Profile</button>
       </div>
     );
   }
   ```

### 3.2. Profile Completion Component (D4)

```jsx
// src/frontend/components/profile/ProfileCompletion.js

export default function ProfileCompletion({ score }) {
  const completionPercentage = score || 0;
  
  return (
    <div className="profile-completion">
      <h3>Profile Completion</h3>
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      <p>{completionPercentage}% Complete</p>
    </div>
  );
}
```

## 4. Integration Testing Setup

### 4.1. Backend API Tests (QA, D1)

```javascript
// src/backend/tests/integration/seekerProfile.test.js

const request = require('supertest');
const app = require('../../src/server');
const mongoose = require('mongoose');
const { setupTestDB } = require('../utils/setupTestDB');

setupTestDB();

describe('Seeker Profile API', () => {
  let authToken;
  let testUser;
  
  beforeAll(async () => {
    // Create test user and get auth token
  });
  
  describe('GET /api/seekers/profile', () => {
    test('should return seeker profile when authenticated', async () => {
      const res = await request(app)
        .get('/api/seekers/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('userId');
    });
    
    test('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .get('/api/seekers/profile');
      
      expect(res.status).toBe(401);
    });
  });
  
  // Additional tests
});
```

### 4.2. Frontend Component Tests (QA, D4)

```javascript
// src/frontend/tests/components/profile/ProfileForm.test.js

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileForm from '../../../components/profile/ProfileForm';

describe('ProfileForm Component', () => {
  const mockProfile = {
    bio: 'Test bio',
    fitnessLevel: 'intermediate'
  };
  
  const mockSubmit = jest.fn();
  
  test('renders form with profile data', () => {
    render(<ProfileForm profile={mockProfile} onSubmit={mockSubmit} />);
    
    expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
    expect(screen.getByDisplayValue('intermediate')).toBeInTheDocument();
  });
  
  test('submits form with updated data', async () => {
    render(<ProfileForm profile={mockProfile} onSubmit={mockSubmit} />);
    
    const bioInput = screen.getByLabelText(/bio/i);
    fireEvent.change(bioInput, { target: { value: 'Updated bio' } });
    
    fireEvent.click(screen.getByText('Save Profile'));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ bio: 'Updated bio' }),
        expect.anything()
      );
    });
  });
  
  // Additional tests
});
```

## 5. First Week Implementation Plan

### Week 5, Days 1-2: Technical Debt Resolution

- **D1**: Standardize API error handling
- **D2**: Refactor frontend authentication flow
- **D3**: Optimize database indexing
- **All**: Complete outstanding Sprint 1 tasks

### Week 5, Days 3-5: Initial Profile Implementation

- **D1**: Implement seeker profile backend endpoints
- **D4**: Create profile page and form components
- **D1, D4**: Integrate frontend with backend APIs
- **QA**: Begin setting up test framework for profile features

### Week 5, Days 6-7: Provider Profile Beginning

- **D1**: Start provider profile backend endpoints
- **D4**: Begin provider profile form components
- **QA, D1**: Initial unit tests for seeker profile

## 6. Development Guidelines

1. **Code Organization**
   - Follow established project structure
   - Keep components modular and reusable
   - Use consistent naming conventions

2. **Documentation Requirements**
   - Document all API endpoints with Swagger
   - Add JSDoc comments to all functions
   - Create implementation notes for completed features

3. **Testing Standards**
   - 85% code coverage target for all new components
   - Integration tests for all API endpoints
   - Component tests for all UI elements
   - E2E tests for critical user flows

4. **Performance Considerations**
   - Optimize API response sizes
   - Use proper indexing for database queries
   - Implement frontend data caching where appropriate

5. **Collaboration Workflow**
   - Daily stand-ups to report progress and blockers
   - Code reviews required for all pull requests
   - Technical discussions in dedicated Slack channel
   - Document design decisions in implementation notes

## 7. Key Resources and References

- [Profile Management Plan](./profile-management-plan.md) - Detailed technical specifications
- [Task Breakdown](./task-breakdown.md) - Complete task list with dependencies
- [Task Assignments](./task-assignments.md) - Team member assignments
- [User Profile Mockup](../../references/user_profile.md) - UI specifications for seeker profiles
- [Trainer Profile Mockup](../../references/trainer_profile.md) - UI specifications for provider profiles
- [Database Schema](../../references/database_schema.md) - Data model specifications 