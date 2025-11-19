import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  token: string;
  userAgent: string;
  ipAddress: string;
  loginTime: Date;
  lastActivity: Date;
  logoutTime?: Date;
  isActive: boolean;
  forcedLogout?: boolean;
}

const UserSessionSchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  deviceId: { 
    type: String, 
    required: true 
  },
  token: { 
    type: String, 
    required: true 
  },
  userAgent: { 
    type: String, 
    required: true 
  },
  ipAddress: { 
    type: String, 
    required: true 
  },
  loginTime: { 
    type: Date, 
    default: Date.now 
  },
  lastActivity: { 
    type: Date, 
    default: Date.now 
  },
  logoutTime: { 
    type: Date 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  forcedLogout: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

// Índice para búsquedas eficientes
UserSessionSchema.index({ userId: 1, isActive: 1 });
UserSessionSchema.index({ token: 1 });
UserSessionSchema.index({ deviceId: 1 });

export default mongoose.model<IUserSession>('UserSession', UserSessionSchema);