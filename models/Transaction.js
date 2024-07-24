import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  label: { type: String },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor"
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  debit: { type: Number },
  credit: { type: Number },
  state: {
    type: String,
    enum: [
      'draft',
      'posted',
      'cancel',
    ],
    default: 'posted',
    required: true
  }
}, {
  timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

export default mongoose.model('Transaction', TransactionSchema);