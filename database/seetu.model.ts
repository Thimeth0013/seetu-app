import { Schema, model, models, Document, Types } from 'mongoose';
import User from './user.model';

// TypeScript interface for Seetu document
export interface ISeetu extends Document {
  title: string;
  openingDate: Date;
  closingDate: Date;
  minAmount?: number;
  maxAmount?: number;
  createdBy: Types.ObjectId;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SeetuSchema = new Schema<ISeetu>(
  {
    title: {
      type: String,
      required: [true, 'Seetu title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    openingDate: {
      type: Date,
      required: [true, 'Opening date is required'],
    },
    closingDate: {
      type: Date,
      required: [true, 'Closing date is required'],
      validate: {
        validator: function (closingDate: Date) {
          // Access the document context
          return closingDate > (this as any).openingDate;
        },
        message: 'Closing date must be after opening date',
      },
    },
    minAmount: {
      type: Number,
      min: [0, 'Minimum amount cannot be negative'],
      validate: {
        validator: function (minAmount: number) {
          const doc = this as any;
          // Only validate if both values exist
          if (doc.maxAmount !== undefined && minAmount !== undefined) {
            return minAmount <= doc.maxAmount;
          }
          return true;
        },
        message: 'Minimum amount cannot be greater than maximum amount',
      },
    },
    maxAmount: {
      type: Number,
      min: [0, 'Maximum amount cannot be negative'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user ID is required'],
    },
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Pre-save hook to validate user exists before creating seetu
SeetuSchema.pre('save', async function () {
  if (this.isModified('createdBy') || this.isNew) {
    try {
      const userExists = await User.findById(this.createdBy).select('_id');

      if (!userExists) {
        const error = new Error(`User with ID ${this.createdBy} does not exist`);
        error.name = 'ValidationError';
        throw error;
      }
    } catch (err: any) {
      // If it's already a validation error, re-throw it
      if (err.name === 'ValidationError') {
        throw err;
      }
      // Otherwise, create a new validation error
      const validationError = new Error('Invalid user ID format or database error');
      validationError.name = 'ValidationError';
      throw validationError;
    }
  }
});

// Create compound index for efficient queries
SeetuSchema.index({ archived: 1, openingDate: -1 });
SeetuSchema.index({ archived: 1, closingDate: -1 });
SeetuSchema.index({ createdBy: 1, archived: 1 });

const Seetu = models.Seetu || model<ISeetu>('Seetu', SeetuSchema);

export default Seetu;