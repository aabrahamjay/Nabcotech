import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  customerName: String,
  email: String,
  phone: String,
  items: Array,
  totalAmount: Number,
  paystackRef: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", OrderSchema);
