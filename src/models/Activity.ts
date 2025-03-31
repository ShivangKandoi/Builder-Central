import mongoose from 'mongoose';

export interface IActivity extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  toolId: mongoose.Types.ObjectId;
  type: 'view' | 'like' | 'favorite' | 'share' | 'comment' | 'update';
  message: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new mongoose.Schema<IActivity>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
      required: true,
    },
    type: {
      type: String,
      enum: ['view', 'like', 'favorite', 'share', 'comment', 'update'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ toolId: 1, timestamp: -1 });
activitySchema.index({ type: 1, timestamp: -1 });

const Activity = mongoose.models.Activity || mongoose.model<IActivity>('Activity', activitySchema);

export default Activity; 