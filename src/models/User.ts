import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  tools: mongoose.Types.ObjectId[];
  favorites: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    tools: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
    }],
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
    }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Function to drop 'username_1' index if it exists
async function dropUsernameIndex() {
  try {
    // Wait for connection to be established to ensure mongoose is fully initialized
    const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
    const collection = User.collection;
    
    // Get all existing indexes
    const indexes = await collection.indexes();
    
    // Check if username_1 index exists
    const usernameIndex = indexes.find(index => index.name === 'username_1');
    
    if (usernameIndex) {
      console.log('Found username_1 index - dropping it');
      await collection.dropIndex('username_1');
      console.log('Successfully dropped username_1 index');
    } else {
      console.log('No username_1 index found');
    }
  } catch (error) {
    console.error('Error handling username index:', error);
  }
}

// Initialize the model
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

// Try to drop username index after model is created (will run when imported)
dropUsernameIndex().catch(err => console.error('Failed to drop index:', err));

export default User; 