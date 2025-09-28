// routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Place a new order
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
      text: `New order from ${req.body.name}, total ₦${req.body.totalAmount}`,
    });

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
