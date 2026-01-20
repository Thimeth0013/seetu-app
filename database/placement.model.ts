import { Schema, model, models, Document, Types } from 'mongoose';
import Seetu from './seetu.model';
import User from './user.model';

// TypeScript interface for Placement document
export interface IPlacement extends Document {
  seetuId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlacementSchema = new Schema<IPlacement>(
  {
    seetuId: {
      type: Schema.Types.ObjectId,
      ref: 'Seetu',
      required: [true, 'Seetu ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Pre-save hook to validate seetu and user exist, and amount is within limits
PlacementSchema.pre('save', async function () {
  const placement = this as IPlacement;

  // Validate seetu exists and get min/max limits
  if (placement.isModified('seetuId') || placement.isNew) {
    try {
      const seetu = await Seetu.findById(placement.seetuId).select('minAmount maxAmount openingDate closingDate');

      if (!seetu) {
        const error = new Error(`Seetu with ID ${placement.seetuId} does not exist`);
        error.name = 'ValidationError';
        throw error;
      }

      // Check if seetu is open (only on new placements, not updates)
      const now = new Date();
      if (placement.isNew) {
        if (now < seetu.openingDate) {
          const error = new Error('Cannot place amount before seetu opens');
          error.name = 'ValidationError';
          throw error;
        }
        if (now >= seetu.closingDate) {
          const error = new Error('Cannot place amount after seetu closes');
          error.name = 'ValidationError';
          throw error;
        }
      }

      // Validate amount against min/max limits
      if (seetu.minAmount && placement.amount < seetu.minAmount) {
        const error = new Error(`Amount must be at least ${seetu.minAmount} LKR`);
        error.name = 'ValidationError';
        throw error;
      }

      if (seetu.maxAmount && placement.amount > seetu.maxAmount) {
        const error = new Error(`Amount cannot exceed ${seetu.maxAmount} LKR`);
        error.name = 'ValidationError';
        throw error;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'ValidationError') {
        throw err;
      }
      const validationError = new Error('Invalid seetu ID format or database error');
      validationError.name = 'ValidationError';
      throw validationError;
    }
  }

  // Validate user exists
  if (placement.isModified('userId') || placement.isNew) {
    try {
      const userExists = await User.findById(placement.userId).select('_id');

      if (!userExists) {
        const error = new Error(`User with ID ${placement.userId} does not exist`);
        error.name = 'ValidationError';
        throw error;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'ValidationError') {
        throw err;
      }
      const validationError = new Error('Invalid user ID format or database error');
      validationError.name = 'ValidationError';
      throw validationError;
    }
  }
});

// Create index on seetuId for faster queries
PlacementSchema.index({ seetuId: 1 });

// Create index on userId for user's placements lookup
PlacementSchema.index({ userId: 1 });

// Create compound index for seetu placements sorted by update time (for tie-breaking)
PlacementSchema.index({ seetuId: 1, updatedAt: 1 });

// Enforce one placement per user per seetu
PlacementSchema.index({ seetuId: 1, userId: 1 }, { unique: true, name: 'uniq_seetu_user' });

const Placement = models.Placement || model<IPlacement>('Placement', PlacementSchema);

export default Placement;