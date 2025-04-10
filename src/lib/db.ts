import mongoose from 'mongoose';

// Define an interface for the structure of the cached object
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Augment the NodeJS global type to declare the mongoose property
declare global {
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Initialize cached, ensuring it's always of type MongooseCache after this block
let cached: MongooseCache;
if (global.mongoose) {
    cached = global.mongoose;
} else {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDb(): Promise<typeof mongoose> { // Return mongoose instance
  if (cached.conn) {
    console.log('Using cached database connection.');
    return cached.conn;
  }

  // Explicitly check MONGODB_URI again inside the function scope for type safety
  if (!MONGODB_URI) {
    // This should technically not be reachable due to the top-level check,
    // but it satisfies the TS compiler and provides an extra safety net.
    console.error('MONGODB_URI is not defined. This should not happen.');
    throw new Error('MONGODB_URI is not defined.');
  }

  if (!cached.promise) {
    console.log('Creating new database connection promise.');
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      // Consider adding serverSelectionTimeoutMS for faster error feedback
      // serverSelectionTimeoutMS: 5000, 
    };

    // MONGODB_URI is guaranteed to be a string here due to the check above.
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('Database connected!');
      return mongooseInstance;
    }).catch(err => {
      console.error('Database connection error:', err);
      // Make sure promise rejection is handled, reset promise if needed
      cached.promise = null; 
      throw err; // Rethrow the error to be caught by the caller
    });
  }
  
  try {
    console.log('Awaiting database connection promise.');
    cached.conn = await cached.promise;
  } catch (e) {
      // If the promise was rejected, ensure conn remains null
      cached.conn = null;
      console.error('Failed to establish database connection:', e);
      throw e; // Rethrow or handle as appropriate for your application
  }
  
  // Ensure we don't return null if the connection failed
  if (!cached.conn) {
      throw new Error("Database connection failed.");
  }

  return cached.conn;
}

export default connectDb; 