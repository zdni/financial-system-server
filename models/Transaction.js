import mongoose from "mongoose";

function prefixSeq(seq, prefix) {
  seq = seq.toString();
  while(seq.length < prefix) seq = "0" + seq;
  return seq;
}

function suffixSeq(seq, suffix) {
  seq = seq.toString();
  while(seq.length < suffix) seq = seq + "0";
  return seq;
}

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1 },
  prefix: { type: Number, default: 0 },
  suffix: { type: Number, default: 0 },
});
const counter = mongoose.model('Counter', CounterSchema);

const TransactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  name: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  state: {
    type: String,
    enum: [
      'draft',
      'posted',
      'cancel',
    ],
    default: 'draft',
    required: true
  }
}, {
  timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

TransactionSchema.pre('save', function(next) {
  const doc = this;
  counter.findByIdAndUpdate({ _id: 'transactionSeq' }, { $inc: { seq: 1 } }).then((counter) => {
    doc.name = `TRANS/${suffixSeq(prefixSeq(counter.seq, counter.prefix), counter.suffix)}`;
    next();
  }).catch((error) => {
    return next(error);
  })
});

export default mongoose.model('Transaction', TransactionSchema);