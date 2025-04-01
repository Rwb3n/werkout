const mongoose = require('mongoose');
const SeekerProfile = require('../../../src/backend/src/models/SeekerProfile.model');
const TestLogger = require('../../utils/testLogger');

// Initialize the test logger
const logger = new TestLogger('seeker_profile_model_test');

// Test against an in-memory MongoDB instance
beforeAll(async () => {
  logger.info('Setting up in-memory MongoDB connection');
  await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/werkout-test');
});

afterAll(async () => {
  logger.info('Closing MongoDB connection');
  await mongoose.connection.close();
  logger.finalize(true);
});

describe('SeekerProfile Model Tests', () => {
  // Clear test data before each test
  beforeEach(async () => {
    await SeekerProfile.deleteMany({});
  });

  it('should create a new seeker profile with valid fields', async () => {
    logger.info('Testing seeker profile creation with valid fields');
    
    // Mock user ID
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Create sample profile
    const profileData = {
      userId: mockUserId,
      bio: 'Fitness enthusiast looking to improve overall health',
      fitnessLevel: 'intermediate',
      fitnessGoals: ['Weight loss', 'Muscle gain'],
      interests: ['Yoga', 'HIIT'],
      preferredTrainingTypes: ['Group classes', 'One-on-one']
    };

    const seekerProfile = new SeekerProfile(profileData);
    const savedProfile = await seekerProfile.save();
    
    logger.info(`Created profile with ID: ${savedProfile._id}`);
    
    // Assertions
    expect(savedProfile._id).toBeDefined();
    expect(savedProfile.userId.toString()).toBe(mockUserId.toString());
    expect(savedProfile.bio).toBe(profileData.bio);
    expect(savedProfile.fitnessLevel).toBe(profileData.fitnessLevel);
    expect(savedProfile.fitnessGoals).toEqual(expect.arrayContaining(profileData.fitnessGoals));
    expect(savedProfile.interests).toEqual(expect.arrayContaining(profileData.interests));
    expect(savedProfile.completionScore).toBeGreaterThan(0);
    
    logger.info(`Profile completion score: ${savedProfile.completionScore}%`);
  });

  it('should calculate the profile completion score', async () => {
    logger.info('Testing profile completion score calculation');
    
    // Create profiles with varying levels of completeness
    const mockUserId1 = new mongoose.Types.ObjectId();
    const mockUserId2 = new mongoose.Types.ObjectId();
    
    // Minimal profile (few fields)
    const minimalProfile = new SeekerProfile({
      userId: mockUserId1,
      bio: 'Short bio'
    });
    
    // Comprehensive profile (most fields)
    const comprehensiveProfile = new SeekerProfile({
      userId: mockUserId2,
      bio: 'Detailed biography with information about fitness journey',
      fitnessLevel: 'advanced',
      fitnessGoals: ['Marathon training', 'Bodybuilding competition'],
      interests: ['CrossFit', 'Running', 'Swimming'],
      preferredTrainingTypes: ['High intensity', 'Functional training'],
      medicalConsiderations: 'Previous knee injury',
      measurements: {
        height: 180,
        weight: 75,
        bodyFat: 15
      },
      fitnessJourney: [
        {
          title: 'First 5K',
          description: 'Completed my first 5K run',
          date: new Date('2023-01-15'),
          isPublic: true
        }
      ]
    });
    
    await minimalProfile.save();
    await comprehensiveProfile.save();
    
    // Reload from database
    const savedMinimal = await SeekerProfile.findOne({ userId: mockUserId1 });
    const savedComprehensive = await SeekerProfile.findOne({ userId: mockUserId2 });
    
    logger.info(`Minimal profile score: ${savedMinimal.completionScore}%`);
    logger.info(`Comprehensive profile score: ${savedComprehensive.completionScore}%`);
    
    // Assertions
    expect(savedMinimal.completionScore).toBeLessThan(savedComprehensive.completionScore);
    expect(savedComprehensive.completionScore).toBe(100); // All fields completed
  });

  it('should add a fitness journey milestone', async () => {
    logger.info('Testing adding fitness journey milestone');
    
    const mockUserId = new mongoose.Types.ObjectId();
    const seekerProfile = new SeekerProfile({
      userId: mockUserId,
      bio: 'Fitness enthusiast'
    });
    
    await seekerProfile.save();
    
    // Add a milestone
    const milestone = {
      title: 'Weight loss goal achieved',
      description: 'Lost 10kg over 3 months',
      date: new Date(),
      isPublic: true
    };
    
    seekerProfile.addJourneyMilestone(milestone);
    await seekerProfile.save();
    
    // Reload profile
    const updatedProfile = await SeekerProfile.findOne({ userId: mockUserId });
    
    logger.info(`Journey milestone added: ${updatedProfile.fitnessJourney[0].title}`);
    
    // Assertions
    expect(updatedProfile.fitnessJourney).toHaveLength(1);
    expect(updatedProfile.fitnessJourney[0].title).toBe(milestone.title);
    expect(updatedProfile.fitnessJourney[0].description).toBe(milestone.description);
  });

  it('should update measurements', async () => {
    logger.info('Testing measurement updates');
    
    const mockUserId = new mongoose.Types.ObjectId();
    const seekerProfile = new SeekerProfile({
      userId: mockUserId,
      bio: 'Fitness tracker'
    });
    
    await seekerProfile.save();
    
    // Update measurements
    const measurements = {
      height: 175,
      weight: 70,
      bodyFat: 18
    };
    
    seekerProfile.updateMeasurements(measurements);
    await seekerProfile.save();
    
    // Reload profile
    const updatedProfile = await SeekerProfile.findOne({ userId: mockUserId });
    
    logger.info(`Measurements updated: height=${updatedProfile.measurements.height}, weight=${updatedProfile.measurements.weight}`);
    
    // Assertions
    expect(updatedProfile.measurements.height).toBe(measurements.height);
    expect(updatedProfile.measurements.weight).toBe(measurements.weight);
    expect(updatedProfile.measurements.bodyFat).toBe(measurements.bodyFat);
    expect(updatedProfile.measurements.lastUpdated).toBeDefined();
  });

  it('should reject an invalid fitness level', async () => {
    logger.info('Testing validation for invalid fitness level');
    
    const mockUserId = new mongoose.Types.ObjectId();
    const invalidProfile = new SeekerProfile({
      userId: mockUserId,
      fitnessLevel: 'expert' // Not in the enum
    });
    
    let error;
    try {
      await invalidProfile.save();
    } catch (err) {
      error = err;
      logger.info(`Validation error: ${err.message}`);
    }
    
    // Assertions
    expect(error).toBeDefined();
    expect(error.errors.fitnessLevel).toBeDefined();
  });

  it('should enforce unique userId constraint', async () => {
    logger.info('Testing unique userId constraint');
    
    const mockUserId = new mongoose.Types.ObjectId();
    
    // Create first profile
    const profile1 = new SeekerProfile({
      userId: mockUserId,
      bio: 'First profile'
    });
    
    await profile1.save();
    
    // Try to create second profile with same userId
    const profile2 = new SeekerProfile({
      userId: mockUserId,
      bio: 'Second profile'
    });
    
    let error;
    try {
      await profile2.save();
    } catch (err) {
      error = err;
      logger.info(`Duplicate key error: ${err.message}`);
    }
    
    // Assertions
    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });

  it('should add a workout record', async () => {
    logger.info('Testing adding workout record');
    
    const mockUserId = new mongoose.Types.ObjectId();
    const seekerProfile = new SeekerProfile({
      userId: mockUserId,
      bio: 'Fitness enthusiast'
    });
    
    await seekerProfile.save();
    
    // Add a workout
    const workout = {
      date: new Date(),
      workoutType: 'strength',
      duration: 60,
      intensityLevel: 'medium',
      notes: 'Focused on upper body strength',
      metrics: {
        sets: 4,
        reps: 12,
        weight: 50
      },
      isPublic: true
    };
    
    seekerProfile.addWorkout(workout);
    await seekerProfile.save();
    
    // Reload profile
    const updatedProfile = await SeekerProfile.findOne({ userId: mockUserId });
    
    logger.info(`Workout added: ${updatedProfile.workouts[0].workoutType}, duration: ${updatedProfile.workouts[0].duration} mins`);
    
    // Assertions
    expect(updatedProfile.workouts).toHaveLength(1);
    expect(updatedProfile.workouts[0].workoutType).toBe(workout.workoutType);
    expect(updatedProfile.workouts[0].duration).toBe(workout.duration);
    expect(updatedProfile.workouts[0].intensityLevel).toBe(workout.intensityLevel);
    expect(updatedProfile.workouts[0].notes).toBe(workout.notes);
    expect(updatedProfile.workouts[0].metrics.sets).toBe(workout.metrics.sets);
    expect(updatedProfile.workouts[0].metrics.reps).toBe(workout.metrics.reps);
    expect(updatedProfile.workouts[0].metrics.weight).toBe(workout.metrics.weight);
    expect(updatedProfile.workouts[0].isPublic).toBe(workout.isPublic);
  });

  it('should validate required workout fields', async () => {
    logger.info('Testing workout field validation');
    
    const mockUserId = new mongoose.Types.ObjectId();
    const seekerProfile = new SeekerProfile({
      userId: mockUserId,
      bio: 'Fitness enthusiast'
    });
    
    await seekerProfile.save();
    
    // Add workout with missing required fields
    const invalidWorkout = {
      date: new Date(),
      // Missing workoutType, duration, and intensityLevel
      notes: 'Cardio session'
    };
    
    seekerProfile.workouts.push(invalidWorkout);
    
    let error;
    try {
      await seekerProfile.save();
    } catch (err) {
      error = err;
      logger.info(`Validation error: ${err.message}`);
    }
    
    // Assertions
    expect(error).toBeDefined();
    expect(error.errors['workouts.0.workoutType']).toBeDefined();
    expect(error.errors['workouts.0.duration']).toBeDefined();
    expect(error.errors['workouts.0.intensityLevel']).toBeDefined();
  });

  it('should validate workout type enum values', async () => {
    logger.info('Testing workout type enum validation');
    
    const mockUserId = new mongoose.Types.ObjectId();
    const seekerProfile = new SeekerProfile({
      userId: mockUserId,
      bio: 'Fitness enthusiast'
    });
    
    await seekerProfile.save();
    
    // Add workout with invalid workout type
    const invalidWorkout = {
      date: new Date(),
      workoutType: 'invalid-type', // Not in the enum
      duration: 45,
      intensityLevel: 'medium'
    };
    
    seekerProfile.workouts.push(invalidWorkout);
    
    let error;
    try {
      await seekerProfile.save();
    } catch (err) {
      error = err;
      logger.info(`Validation error: ${err.message}`);
    }
    
    // Assertions
    expect(error).toBeDefined();
    expect(error.errors['workouts.0.workoutType']).toBeDefined();
  });

  it('should update workout metrics', async () => {
    logger.info('Testing updating workout metrics');
    
    const mockUserId = new mongoose.Types.ObjectId();
    const seekerProfile = new SeekerProfile({
      userId: mockUserId,
      bio: 'Fitness enthusiast'
    });
    
    // Initial workout
    const initialWorkout = {
      date: new Date(),
      workoutType: 'cardio',
      duration: 30,
      intensityLevel: 'high',
      metrics: {
        distance: 5,
        caloriesBurned: 300
      }
    };
    
    seekerProfile.workouts.push(initialWorkout);
    await seekerProfile.save();
    
    // Get the saved workout id
    const savedProfile = await SeekerProfile.findOne({ userId: mockUserId });
    const workoutId = savedProfile.workouts[0]._id;
    
    // Update the workout
    savedProfile.workouts[0].duration = 45;
    savedProfile.workouts[0].metrics.distance = 7.5;
    savedProfile.workouts[0].metrics.caloriesBurned = 450;
    
    await savedProfile.save();
    
    // Reload the profile
    const updatedProfile = await SeekerProfile.findOne({ userId: mockUserId });
    const updatedWorkout = updatedProfile.workouts.id(workoutId);
    
    logger.info(`Updated workout: duration=${updatedWorkout.duration}, distance=${updatedWorkout.metrics.distance}`);
    
    // Assertions
    expect(updatedWorkout.duration).toBe(45);
    expect(updatedWorkout.metrics.distance).toBe(7.5);
    expect(updatedWorkout.metrics.caloriesBurned).toBe(450);
  });
}); 