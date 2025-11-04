import mongoose, { Schema } from 'mongoose';

const UserSessionSchema = new Schema({
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
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('UserSession', UserSessionSchema);
// import mongoose, { Schema } from 'mongoose';
// import { IUserSession } from '../types';

// const UserSessionSchema = new Schema({
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   deviceId: {
//     type: String,
//     required: true
//   },
//   token: {
//     type: String,
//     required: true
//   },
//   ipAddress: {
//     type: String,
//     required: true
//   },
//   userAgent: {
//     type: String,
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   loginTime: {
//     type: Date,
//     default: Date.now
//   },
//   lastActivity: {
//     type: Date,
//     default: Date.now
//   }
// });


// UserSessionSchema.index({ userId: 1, deviceId: 1 });
// UserSessionSchema.index({ token: 1 });
// UserSessionSchema.index({ isActive: 1 });

// export default mongoose.model<IUserSession>('UserSession', UserSessionSchema);