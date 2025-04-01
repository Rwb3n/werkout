const mongoose = require('mongoose');
const ProviderProfile = require('../../src/models/ProviderProfile.model');

// Test against an in-memory MongoDB instance
beforeAll(async () => {
  console.log('Setting up in-memory MongoDB connection');
  await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/werkout-test');
});

afterAll(async () => {
  console.log('Closing MongoDB connection');
  await mongoose.connection.close();
});

describe('ProviderProfile Model Tests', () => {
  // Clear test data before each test
  beforeEach(async () => {
    await ProviderProfile.deleteMany({});
  });

  it('should create a new provider profile with valid fields', async () => {
    // Mock user ID
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Create sample profile
    const profileData = {
      userId: mockUserId,
      businessName: 'Fitness First',
      bio: 'Professional trainer with 10 years of experience in strength training and nutrition.',
      specialties: ['Strength Training', 'Weight Loss', 'Nutrition'],
      experience: 10,
      providerType: 'trainer',
      languages: ['English', 'Spanish']
    };

    const providerProfile = new ProviderProfile(profileData);
    const savedProfile = await providerProfile.save();
    
    // Assertions
    expect(savedProfile._id).toBeDefined();
    expect(savedProfile.userId.toString()).toBe(mockUserId.toString());
    expect(savedProfile.businessName).toBe(profileData.businessName);
    expect(savedProfile.bio).toBe(profileData.bio);
    expect(savedProfile.specialties).toEqual(expect.arrayContaining(profileData.specialties));
    expect(savedProfile.experience).toBe(profileData.experience);
    expect(savedProfile.providerType).toBe(profileData.providerType);
    expect(savedProfile.languages).toEqual(expect.arrayContaining(profileData.languages));
    expect(savedProfile.completionScore).toBeGreaterThan(0);
  });

  it('should enforce required fields', async () => {
    // Mock user ID
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Create profile without required fields
    const invalidProfile = new ProviderProfile({
      userId: mockUserId
      // Missing bio and providerType (required fields)
    });
    
    let error;
    try {
      await invalidProfile.save();
    } catch (err) {
      error = err;
    }
    
    // Assertions
    expect(error).toBeDefined();
    expect(error.errors.bio).toBeDefined();
    expect(error.errors.providerType).toBeDefined();
  });

  it('should validate provider type enum values', async () => {
    // Mock user ID
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Create profile with invalid provider type
    const invalidProfile = new ProviderProfile({
      userId: mockUserId,
      bio: 'Professional trainer',
      providerType: 'invalid-type' // Not in the enum
    });
    
    let error;
    try {
      await invalidProfile.save();
    } catch (err) {
      error = err;
    }
    
    // Assertions
    expect(error).toBeDefined();
    expect(error.errors.providerType).toBeDefined();
  });

  it('should add a credential', async () => {
    // Mock user ID
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Create base profile
    const providerProfile = new ProviderProfile({
      userId: mockUserId,
      bio: 'Professional trainer',
      providerType: 'trainer'
    });
    
    await providerProfile.save();
    
    // Add a credential
    const credential = {
      title: 'Certified Personal Trainer',
      organization: 'National Academy of Sports Medicine',
      year: 2018,
      verificationUrl: 'https://example.com/cert123'
    };
    
    providerProfile.addCredential(credential);
    await providerProfile.save();
    
    // Reload profile
    const updatedProfile = await ProviderProfile.findOne({ userId: mockUserId });
    
    // Assertions
    expect(updatedProfile.credentials).toHaveLength(1);
    expect(updatedProfile.credentials[0].title).toBe(credential.title);
    expect(updatedProfile.credentials[0].organization).toBe(credential.organization);
    expect(updatedProfile.credentials[0].year).toBe(credential.year);
    expect(updatedProfile.credentials[0].verificationUrl).toBe(credential.verificationUrl);
    expect(updatedProfile.credentials[0].isVerified).toBe(false);
  });

  it('should add a service', async () => {
    // Mock user ID
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Create base profile
    const providerProfile = new ProviderProfile({
      userId: mockUserId,
      bio: 'Professional trainer',
      providerType: 'trainer'
    });
    
    await providerProfile.save();
    
    // Add a service
    const service = {
      title: 'One-on-One Training',
      description: 'Personalized training sessions tailored to your goals',
      type: 'one-on-one',
      isActive: true
    };
    
    providerProfile.addService(service);
    await providerProfile.save();
    
    // Reload profile
    const updatedProfile = await ProviderProfile.findOne({ userId: mockUserId });
    
    // Assertions
    expect(updatedProfile.services).toHaveLength(1);
    expect(updatedProfile.services[0].title).toBe(service.title);
    expect(updatedProfile.services[0].description).toBe(service.description);
    expect(updatedProfile.services[0].type).toBe(service.type);
    expect(updatedProfile.services[0].isActive).toBe(service.isActive);
  });

  it('should add a gallery item', async () => {
    // Mock user ID
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Create base profile
    const providerProfile = new ProviderProfile({
      userId: mockUserId,
      bio: 'Professional trainer',
      providerType: 'trainer'
    });
    
    await providerProfile.save();
    
    // Add a gallery item
    const galleryItem = {
      type: 'image',
      url: 'https://example.com/image.jpg',
      caption: 'Training session',
      isPublic: true
    };
    
    providerProfile.addGalleryItem(galleryItem);
    await providerProfile.save();
    
    // Reload profile
    const updatedProfile = await ProviderProfile.findOne({ userId: mockUserId });
    
    // Assertions
    expect(updatedProfile.gallery).toHaveLength(1);
    expect(updatedProfile.gallery[0].type).toBe(galleryItem.type);
    expect(updatedProfile.gallery[0].url).toBe(galleryItem.url);
    expect(updatedProfile.gallery[0].caption).toBe(galleryItem.caption);
    expect(updatedProfile.gallery[0].isPublic).toBe(galleryItem.isPublic);
  });

  it('should add a verification document', async () => {
    // Mock user ID
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Create base profile
    const providerProfile = new ProviderProfile({
      userId: mockUserId,
      bio: 'Professional trainer',
      providerType: 'trainer'
    });
    
    await providerProfile.save();
    
    // Add a verification document
    const document = {
      type: 'certification',
      url: 'https://example.com/cert.pdf'
    };
    
    providerProfile.addVerificationDocument(document);
    await providerProfile.save();
    
    // Reload profile
    const updatedProfile = await ProviderProfile.findOne({ userId: mockUserId });
    
    // Assertions
    expect(updatedProfile.verificationDocuments).toHaveLength(1);
    expect(updatedProfile.verificationDocuments[0].type).toBe(document.type);
    expect(updatedProfile.verificationDocuments[0].url).toBe(document.url);
    expect(updatedProfile.verificationDocuments[0].status).toBe('pending');
  });

  it('should calculate profile completion score', async () => {
    // Mock user ID
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Create base profile with minimal fields
    const minimalProfile = new ProviderProfile({
      userId: mockUserId,
      bio: 'Professional trainer',
      providerType: 'trainer'
    });
    
    await minimalProfile.save();
    
    // Create a comprehensive profile
    const comprehensiveProfile = new ProviderProfile({
      userId: new mongoose.Types.ObjectId(),
      businessName: 'Fitness First',
      bio: 'Professional trainer with 10 years of experience in strength training and nutrition.',
      specialties: ['Strength Training', 'Weight Loss', 'Nutrition'],
      experience: 10,
      providerType: 'trainer',
      languages: ['English', 'Spanish'],
      responseTime: 'within-hour',
      credentials: [{
        title: 'Certified Personal Trainer',
        organization: 'National Academy of Sports Medicine',
        year: 2018
      }],
      services: [{
        title: 'One-on-One Training',
        description: 'Personalized training sessions',
        type: 'one-on-one'
      }],
      businessHours: {
        monday: { open: '09:00', close: '17:00' }
      },
      gallery: [{
        type: 'image',
        url: 'https://example.com/image.jpg'
      }],
      verificationDocuments: [{
        type: 'certification',
        url: 'https://example.com/cert.pdf'
      }]
    });
    
    await comprehensiveProfile.save();
    
    // Reload profiles
    const reloadedMinimal = await ProviderProfile.findOne({ userId: mockUserId });
    const reloadedComprehensive = await ProviderProfile.findById(comprehensiveProfile._id);
    
    // Assertions
    expect(reloadedMinimal.completionScore).toBeLessThan(reloadedComprehensive.completionScore);
    expect(reloadedComprehensive.completionScore).toBe(100); // All 10 fields completed
  });

  it('should enforce unique userId constraint', async () => {
    // Mock user ID
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Create first profile
    const profile1 = new ProviderProfile({
      userId: mockUserId,
      bio: 'Professional trainer',
      providerType: 'trainer'
    });
    
    await profile1.save();
    
    // Try to create second profile with same userId
    const profile2 = new ProviderProfile({
      userId: mockUserId,
      bio: 'Another trainer',
      providerType: 'coach'
    });
    
    let error;
    try {
      await profile2.save();
    } catch (err) {
      error = err;
    }
    
    // Assertions
    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });
}); 