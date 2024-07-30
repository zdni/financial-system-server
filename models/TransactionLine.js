import mongoose from "mongoose";

const TransactionLineSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  label: { type: String },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: true,
  },
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
}, {
  timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

export default mongoose.model('TransactionLine', TransactionLineSchema);