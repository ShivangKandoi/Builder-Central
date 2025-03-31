import mongoose from 'mongoose';

export interface ITool extends mongoose.Document {
  name: string;
  shortDescription: string;
  description: string;
  deployedUrl: string;
  repositoryUrl?: string;
  technology?: string;
  tags: string[];
  image: string;
  author: mongoose.Types.ObjectId;
  ratings: {
    userId: mongoose.Types.ObjectId;
    rating: number;
  }[];
  loves: mongoose.Types.ObjectId[];
  comments: {
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  averageRating: number;
  views: number;
  shares: number;
  viewHistory: {
    date: string;
    count: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const toolSchema = new mongoose.Schema<ITool>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a tool name'],
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Please provide a short description'],
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
    },
    deployedUrl: {
      type: String,
      required: [true, 'Please provide a deployed URL'],
      trim: true,
    },
    repositoryUrl: {
      type: String,
      trim: true,
    },
    technology: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    image: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratings: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
    }],
    loves: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    averageRating: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    viewHistory: [{
      date: {
        type: String,
        required: true,
      },
      count: {
        type: Number,
        default: 0
      }
    }],
  },
  {
    timestamps: true,
  }
);

// Calculate average rating before saving
toolSchema.pre('save', function (next) {
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    this.averageRating = sum / this.ratings.length;
  } else {
    this.averageRating = 0;
  }
  next();
});

const Tool = mongoose.models.Tool || mongoose.model<ITool>('Tool', toolSchema);

export default Tool; 