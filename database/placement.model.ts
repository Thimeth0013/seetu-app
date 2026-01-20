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
      min: [0.01, 'Amount must be greater than 0'],
    },
  },
  {
    timestamps: true,
  }
);

//Pre-save validation
PlacementSchema.pre('save', async function () {
  const placement = this as IPlacement;

  // Load seetu when creating or updating amount
  if (placement.isNew || placement.isModified('amount')) {
    let seetu;

    try {
      seetu = await Seetu.findById(placement.seetuId).select(
        'minAmount maxAmount openingDate closingDate'
      );
    } catch {
      const err = new Error('Invalid seetu ID format');
      err.name = 'ValidationError';
      throw err;
    }

    if (!seetu) {
      const err = new Error('Seetu does not exist');
      err.name = 'ValidationError';
      throw err;
    }

    const now = new Date();

    if (now < seetu.openingDate) {
      const err = new Error('Seetu has not opened yet');
      err.name = 'ValidationError';
      throw err;
    }

    if (now >= seetu.closingDate) {
      const err = new Error('Seetu is already closed');
      err.name = 'ValidationError';
      throw err;
    }

    if (seetu.minAmount && placement.amount < seetu.minAmount) {
      const err = new Error(`Amount must be at least ${seetu.minAmount}`);
      err.name = 'ValidationError';
      throw err;
    }

    if (seetu.maxAmount && placement.amount > seetu.maxAmount) {
      const err = new Error(`Amount cannot exceed ${seetu.maxAmount}`);
      err.name = 'ValidationError';
      throw err;
    }
  }

  // Validate user exists
  if (placement.isNew || placement.isModified('userId')) {
    let userExists;

    try {
      userExists = await User.findById(placement.userId).select('_id');
    } catch {
      const err = new Error('Invalid user ID format');
      err.name = 'ValidationError';
      throw err;
    }

    if (!userExists) {
      const err = new Error('User does not exist');
      err.name = 'ValidationError';
      throw err;
    }
  }
});

// One placement per user per seetu
PlacementSchema.index(
  { seetuId: 1, userId: 1 },
  { unique: true, name: 'uniq_seetu_user' }
);

// Fast lookup by seetu
PlacementSchema.index({ seetuId: 1 });

// Fast lookup by user
PlacementSchema.index({ userId: 1 });

// Final leaderboard ordering (after close)
PlacementSchema.index({ seetuId: 1, amount: -1, createdAt: 1 });

const Placement =
  models.Placement || model<IPlacement>('Placement', PlacementSchema);

export default Placement;