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
          return closingDate > (this as any).openingDate;
        },
        message: 'Closing date must be after opening date',
      },
    },
    minAmount: {
      type: Number,
      min: [0, 'Minimum amount cannot be negative'],
      validate: {
        validator: function (this: ISeetu, minAmount: number) {
          if (this.maxAmount && minAmount) {
            return minAmount <= this.maxAmount;
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
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Pre-save hook to validate user exists before creating seetu
SeetuSchema.pre('save', async function () {
  const seetu = this as ISeetu;

  if (seetu.isModified('createdBy') || seetu.isNew) {
    try {
      const userExists = await User.findById(seetu.createdBy).select('_id');

      if (!userExists) {
        const error = new Error(`User with ID ${seetu.createdBy} does not exist`);
        error.name = 'ValidationError';
        throw error;
      }
    } catch {
      const validationError = new Error('Invalid user ID format or database error');
      validationError.name = 'ValidationError';
      throw validationError;
    }
  }
});

// Create index on createdBy for user's seetus lookup
SeetuSchema.index({ createdBy: 1 });

// Create index on dates for filtering by status (upcoming/open/closed)
SeetuSchema.index({ openingDate: 1, closingDate: 1 });

// Create index on closingDate for closed seetus queries
SeetuSchema.index({ closingDate: -1 });

const Seetu = models.Seetu || model<ISeetu>('Seetu', SeetuSchema);

export default Seetu;