# Werkout.in API Endpoints

This document provides an overview of the API endpoints available in the Werkout.in platform.

## Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user profile (requires authentication)

## Seeker Profiles

The Seeker Profile API allows fitness seekers to manage their profiles and track their fitness journey.

### Profile Management

- `GET /api/seekers/profile` - Get the current user's seeker profile
- `POST /api/seekers/profile` - Create or update a seeker profile
- `POST /api/seekers/profile/journey` - Add a fitness journey milestone
- `PUT /api/seekers/profile/measurements` - Update fitness measurements
- `GET /api/seekers/profile/completion` - Get profile completion score and missing fields

### Workout Tracking

- `POST /api/seekers/profile/workouts` - Add a new workout
  
  **Request Body**:
  ```json
  {
    "date": "2025-04-01T09:00:00Z",  // Optional, defaults to current time
    "workoutType": "strength",        // Required: "strength", "cardio", "flexibility", "sports", "crossfit", "hiit", "other"
    "duration": 60,                   // Required: minutes
    "intensityLevel": "medium",       // Required: "low", "medium", "high", "extreme"
    "notes": "Upper body focus day",  // Optional
    "metrics": {                      // Optional
      "sets": 4,                      // Optional
      "reps": 12,                     // Optional
      "weight": 50,                   // Optional
      "distance": null,               // Optional
      "caloriesBurned": 300           // Optional
    },
    "isPublic": false                 // Optional, defaults to false
  }
  ```
  
  **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "workout-id",
      "date": "2025-04-01T09:00:00Z",
      "workoutType": "strength",
      "duration": 60,
      "intensityLevel": "medium",
      "notes": "Upper body focus day",
      "metrics": {
        "sets": 4,
        "reps": 12,
        "weight": 50,
        "caloriesBurned": 300
      },
      "isPublic": false
    }
  }
  ```

- `GET /api/seekers/profile/workouts` - Get all workouts
  
  **Response**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "workout-id",
        "date": "2025-04-01T09:00:00Z",
        "workoutType": "strength",
        "duration": 60,
        "intensityLevel": "medium",
        "notes": "Upper body focus day",
        "metrics": {
          "sets": 4,
          "reps": 12,
          "weight": 50,
          "caloriesBurned": 300
        },
        "isPublic": false
      }
    ]
  }
  ```

- `GET /api/seekers/profile/workouts/:id` - Get a specific workout
  
  **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "workout-id",
      "date": "2025-04-01T09:00:00Z",
      "workoutType": "strength",
      "duration": 60,
      "intensityLevel": "medium",
      "notes": "Upper body focus day",
      "metrics": {
        "sets": 4,
        "reps": 12,
        "weight": 50,
        "caloriesBurned": 300
      },
      "isPublic": false
    }
  }
  ```

- `PUT /api/seekers/profile/workouts/:id` - Update a workout
  
  **Request Body**:
  ```json
  {
    "duration": 75,
    "metrics": {
      "sets": 5,
      "reps": 10,
      "weight": 55
    }
  }
  ```
  
  **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "workout-id",
      "date": "2025-04-01T09:00:00Z",
      "workoutType": "strength",
      "duration": 75,
      "intensityLevel": "medium",
      "notes": "Upper body focus day",
      "metrics": {
        "sets": 5,
        "reps": 10,
        "weight": 55,
        "caloriesBurned": 300
      },
      "isPublic": false
    }
  }
  ```

- `DELETE /api/seekers/profile/workouts/:id` - Delete a workout
  
  **Response**:
  ```json
  {
    "success": true,
    "message": "Workout removed"
  }
  ```

## Provider Profiles

The Provider Profile API allows fitness providers to manage their profiles, services, and availability.

- `GET /api/providers/profile` - Get the current user's provider profile
- `POST /api/providers/profile` - Create or update a provider profile
- `POST /api/providers/services` - Add a service offering
- `GET /api/providers/services` - Get all service offerings

## Events

The Events API allows providers to create and manage fitness events, and seekers to discover and join them.

- `POST /api/events` - Create a new event (provider only)
- `GET /api/events` - Get all events with filtering options
- `GET /api/events/:id` - Get a specific event
- `POST /api/events/:id/join` - Join an event (seeker only)

## Search

The Search API allows users to discover fitness providers, events, and other users.

- `GET /api/search/providers` - Search for providers
- `GET /api/search/events` - Search for events
- `GET /api/search/seekers` - Search for seekers (with privacy filters)

## Reviews

The Reviews API allows users to leave reviews for providers, events, and other users.

- `POST /api/reviews` - Leave a review
- `GET /api/reviews/:id` - Get a specific review
- `GET /api/reviews/provider/:id` - Get all reviews for a provider

## Health Check

- `GET /api/health` - System health check endpoint 