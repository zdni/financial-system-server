import mongoose from "mongoose";

const VendorSchema = mongoose.Schema({
  name: { type: String, required: true },
}, {
  timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

export default mongoose.model('Vendor', VendorSchema);