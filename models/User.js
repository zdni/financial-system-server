import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: [
      'superadmin',
      'admin',
      'staff',
    ],
    default: 'staff'
  },
  status: { 
    type: String, 
    required: true,
    enum: [
      'active',
      'inactive',
    ],
    default: 'active'
  },
}, {
  timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

export default mongoose.model('User', UserSchema);