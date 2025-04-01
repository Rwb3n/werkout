const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     MeasurementsSchema:
 *       type: object
 *       properties:
 *         height:
 *           type: number
 *           description: Height in centimeters
 *         weight:
 *           type: number
 *           description: Weight in kilograms
 *         bodyFat:
 *           type: number
 *           description: Body fat percentage
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: Date when measurements were last updated
 *
 *     JourneyMilestoneSchema:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: Milestone title
 *         description:
 *           type: string
 *           description: Detailed description of the milestone
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the milestone
 *         isPublic:
 *           type: boolean
 *           description: Whether the milestone is public
 *
 *     WorkoutMetricsSchema:
 *       type: object
 *       properties:
 *         distance:
 *           type: number
 *           description: Distance covered in kilometers (for cardio workouts)
 *         sets:
 *           type: number
 *           description: Number of sets (for strength workouts)
 *         reps:
 *           type: number
 *           description: Number of repetitions (for strength workouts)
 *         weight:
 *           type: number
 *           description: Weight used in kilograms (for strength workouts)
 *         calories:
 *           type: number
 *           description: Calories burned
 *
 *     WorkoutSchema:
 *       type: object
 *       required:
 *         - workoutType
 *         - duration
 *         - intensityLevel
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the workout
 *         workoutType:
 *           type: string
 *           enum: [strength, cardio, flexibility, sports, crossfit, other]
 *           description: Type of workout
 *         duration:
 *           type: number
 *           description: Duration in minutes
 *         intensityLevel:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Workout intensity level
 *         notes:
 *           type: string
 *           description: Additional notes
 *         metrics:
 *           $ref: '#/components/schemas/WorkoutMetricsSchema'
 *         isPublic:
 *           type: boolean
 *           description: Whether the workout is visible to others
 *
 *     SeekerProfile:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: Reference to the User model
 *         bio:
 *           type: string
 *           description: User biography
 *         fitnessLevel:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: User's fitness level
 *         fitnessGoals:
 *           type: array
 *           items:
 *             type: string
 *           description: User's fitness goals
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           description: User's fitness interests
 *         preferredTrainingTypes:
 *           type: array
 *           items:
 *             type: string
 *           description: User's preferred training types
 *         medicalConsiderations:
 *           type: string
 *           description: Any medical conditions to consider
 *         measurements:
 *           $ref: '#/components/schemas/MeasurementsSchema'
 *         fitnessJourney:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/JourneyMilestoneSchema'
 *           description: User's fitness journey milestones
 *         workouts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WorkoutSchema'
 *           description: User's recorded workouts
 *         completionScore:
 *           type: number
 *           description: Profile completion score (0-100)
 */

/**
 * Fitness Journey Schema for milestone tracking
 */
const FitnessJourneySchema = new Schema({
  title: {
    type: String,
    required: [true, 'Journey milestone title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: true
  }
});

/**
 * Measurement Schema for tracking physical measurements
 */
const MeasurementSchema = new Schema({
  height: {
    type: Number,
    min: [0, 'Height cannot be negative']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  bodyFat: {
    type: Number,
    min: [0, 'Body fat percentage cannot be negative'],
    max: [100, 'Body fat percentage cannot exceed 100']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

/**
 * Workout Schema for tracking fitness activities
 */
const WorkoutSchema = new Schema({
  date: {
    type: Date,
    required: [true, 'Workout date is required'],
    default: Date.now
  },
  workoutType: {
    type: String,
    required: [true, 'Workout type is required'],
    enum: {
      values: ['strength', 'cardio', 'flexibility', 'sports', 'crossfit', 'hiit', 'other'],
      message: '{VALUE} is not a valid workout type'
    }
  },
  duration: {
    type: Number,
    required: [true, 'Workout duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  intensityLevel: {
    type: String,
    required: [true, 'Intensity level is required'],
    enum: {
      values: ['low', 'medium', 'high', 'extreme'],
      message: '{VALUE} is not a valid intensity level'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  metrics: {
    distance: {
      type: Number,
      min: [0, 'Distance cannot be negative']
    },
    sets: {
      type: Number,
      min: [0, 'Sets cannot be negative']
    },
    reps: {
      type: Number,
      min: [0, 'Reps cannot be negative']
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    caloriesBurned: {
      type: Number,
      min: [0, 'Calories burned cannot be negative']
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  }
});

/**
 * Seeker Profile Schema
 * Extended profile information for fitness seekers
 */
const SeekerProfileSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot be more than 1000 characters']
  },
  fitnessLevel: {
    type: String,
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: '{VALUE} is not a valid fitness level'
    }
  },
  fitnessGoals: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  fitnessJourney: [FitnessJourneySchema],
  workouts: [WorkoutSchema],
  preferredTrainingTypes: [{
    type: String,
    trim: true
  }],
  medicalConsiderations: {
    type: String,
    trim: true,
    maxlength: [1000, 'Medical considerations cannot be more than 1000 characters']
  },
  measurements: MeasurementSchema,
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
SeekerProfileSchema.methods.calculateCompletionScore = function() {
  let score = 0;
  const totalFields = 8; // Number of main fields we're checking
  
  // Add points for each completed field
  if (this.bio && this.bio.length > 10) score += 1;
  if (this.fitnessLevel) score += 1;
  if (this.fitnessGoals && this.fitnessGoals.length > 0) score += 1;
  if (this.interests && this.interests.length > 0) score += 1;
  if (this.fitnessJourney && this.fitnessJourney.length > 0) score += 1;
  if (this.preferredTrainingTypes && this.preferredTrainingTypes.length > 0) score += 1;
  if (this.medicalConsiderations) score += 1;
  if (this.measurements && (this.measurements.height || this.measurements.weight)) score += 1;
  
  // Calculate percentage
  this.completionScore = Math.floor((score / totalFields) * 100);
  return this.completionScore;
};

/**
 * Add a fitness journey milestone
 */
SeekerProfileSchema.methods.addJourneyMilestone = function(milestone) {
  this.fitnessJourney.push(milestone);
  return this;
};

/**
 * Add a workout record
 */
SeekerProfileSchema.methods.addWorkout = function(workout) {
  this.workouts.push(workout);
  return this;
};

/**
 * Update measurements
 */
SeekerProfileSchema.methods.updateMeasurements = function(measurements) {
  this.measurements = {
    ...this.measurements,
    ...measurements,
    lastUpdated: Date.now()
  };
  return this;
};

/**
 * Pre-save middleware to calculate completion score
 */
SeekerProfileSchema.pre('save', function(next) {
  this.calculateCompletionScore();
  next();
});

/**
 * Create indexes
 */
SeekerProfileSchema.index({ userId: 1 }, { unique: true });
SeekerProfileSchema.index({ fitnessLevel: 1 });
SeekerProfileSchema.index({ interests: 1 });
SeekerProfileSchema.index({ 'fitnessJourney.isPublic': 1 });
SeekerProfileSchema.index({ 'workouts.date': 1 });
SeekerProfileSchema.index({ 'workouts.workoutType': 1 });

const SeekerProfile = mongoose.model('SeekerProfile', SeekerProfileSchema);

module.exports = SeekerProfile; 