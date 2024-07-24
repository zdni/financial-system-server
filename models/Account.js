import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  account_type: { 
    type: String,
    enum: [
      'income',
      'expense'
    ],
    default: 'income'
  }
}, {
  timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

export default mongoose.model('Account', AccountSchema);