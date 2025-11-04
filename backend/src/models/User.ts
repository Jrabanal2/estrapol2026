import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';

const PagePermissionSchema = new Schema({
  page: { type: String, required: true },
  access: { type: Boolean, default: false },
  functions: [{ type: String }]
});

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'premium', 'basic'],
    default: 'basic'
  },
  permissions: [PagePermissionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  currentSession: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices para mejor performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ phone: 1 });

export default mongoose.model<IUser>('User', UserSchema);