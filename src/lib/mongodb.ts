import mongoose from 'mongoose';
// Import models to ensure they are registered with mongoose
import '../models/User';
import '../models/Tool';
import '../models/Activity';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: Cached | undefined;
}

let cached: Cached = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Function to check and remove username index if it exists
async function checkAndRemoveUsernameIndex() {
  try {
    // Get a reference to the User collection
    const db = mongoose.connection.db;
    if (!db) return;

    const collections = await db.listCollections().toArray();
    const usersCollection = collections.find(col => col.name === 'users');
    
    if (usersCollection) {
      const usersCol = db.collection('users');
      const indexes = await usersCol.indexes();
      
      // Check if username_1 index exists
      const usernameIndex = indexes.find(index => index.name === 'username_1');
      
      if (usernameIndex) {
        console.log('Found username_1 index - dropping it');
        await usersCol.dropIndex('username_1');
        console.log('Successfully dropped username_1 index');
      }
    }
  } catch (error) {
    console.error('Error checking/removing username index:', error);
  }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    
    // Check and remove username index after connection is established
    await checkAndRemoveUsernameIndex();
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB; 