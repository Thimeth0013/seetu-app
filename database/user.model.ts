import { Schema, model, models, Document } from 'mongoose';

// TypeScript interface for User document
export interface IUser extends Document {
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Username must be at least 2 characters long'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Create unique index on username for fast lookups and uniqueness enforcement
UserSchema.index({ username: 1 }, { unique: true, name: 'uniq_username' });

// Create index on isAdmin for admin queries
UserSchema.index({ isAdmin: 1 });

const User = models.User || model<IUser>('User', UserSchema);

export default User;