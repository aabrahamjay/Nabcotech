import express from "express";
import Order from "../models/Order.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware for admin auth
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res
      .status(403)
      .json({ success: false, message: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ success: false, message: "Invalid token" });
    req.adminId = decoded.id;
    next();
  });
};

// Place order
router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    // Send email to admin
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: "New Order Received",
      text: `New order from ${req.body.customerName}, total ₦${req.body.totalAmount}`,
    });

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all orders (admin only)
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark order as delivered
router.put("/:id/deliver", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.status = "Delivered";
    await order.save();
    res.json({ success: true, message: "Order marked as delivered" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
