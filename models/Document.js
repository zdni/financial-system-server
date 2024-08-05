import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  document_type: {
    type: String,
    enum: [
      'pdf',
      'excel'
    ],
    default: 'pdf'
  }
}, {
  timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

export default mongoose.model('Document', DocumentSchema);