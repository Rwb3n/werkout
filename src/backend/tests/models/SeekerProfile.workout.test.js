const mongoose = require('mongoose');
const SeekerProfile = require('../../src/models/SeekerProfile.model');

// Test against an in-memory MongoDB instance
beforeAll(async () => {
  console.log('Setting up in-memory MongoDB connection');
  await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/werkout-test');
});

afterAll(async () => {
  console.log('Closing MongoDB connection');
  await mongoose.connection.close();
});

describe('SeekerProfile Workout Functionality Tests', () => {
  // Clear test data before each test
  beforeEach(async () => {
    await SeekerProfile.deleteMany({});
  });

  it('should add a workout record', async () => {
    // Mock user ID
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
    // Mock user ID
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
    }
    
    // Assertions
    expect(error).toBeDefined();
    expect(error.errors['workouts.0.workoutType']).toBeDefined();
    expect(error.errors['workouts.0.duration']).toBeDefined();
    expect(error.errors['workouts.0.intensityLevel']).toBeDefined();
  });

  it('should validate workout type enum values', async () => {
    // Mock user ID
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
    }
    
    // Assertions
    expect(error).toBeDefined();
    expect(error.errors['workouts.0.workoutType']).toBeDefined();
  });

  it('should update workout metrics', async () => {
    // Mock user ID
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
    
    // Assertions
    expect(updatedWorkout.duration).toBe(45);
    expect(updatedWorkout.metrics.distance).toBe(7.5);
    expect(updatedWorkout.metrics.caloriesBurned).toBe(450);
  });
}); 