import express from "express";
import Order from "../models/Order.js";
import nodemailer from "nodemailer";
import fetch from "node-fetch"; // npm install node-fetch@2

const router = express.Router();

// Initiate payment
router.post("/initiate", async (req, res) => {
  try {
    const { customerName, email, phone, items, totalAmount } = req.body;

    // Create transaction via Paystack API
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: totalAmount * 100, // in kobo
          metadata: {
            customerName,
            phone,
            items,
          },
          callback_url: `${process.env.FRONTEND_URL}/payment-success`,
        }),
      }
    );

    const data = await response.json();

    if (!data.status) {
      return res.status(400).json({ success: false, message: data.message });
    }

    res.json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify payment after completion
router.post("/verify", async (req, res) => {
  try {
    const { reference, customerName, email, phone, items, totalAmount } =
      req.body;

    // Verify transaction with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not verified" });
    }

    // Save order to DB
    const order = new Order({
      customerName,
      email,
      phone,
      items,
      totalAmount,
      paystackRef: reference,
    });
    await order.save();

    // Send email to admins
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.ADMIN_EMAIL, pass: process.env.ADMIN_PASS },
    });

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAILS.split(","), // multiple recipients
      subject: `New Order from ${customerName}`,
      html: `
        <h3>New Order Received</h3>
        <p><b>Name:</b> ${customerName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Total:</b> ₦${totalAmount}</p>
        <h4>Items Ordered:</h4>
        <ul>
          ${items
            .map(
              (i) =>
                `<li>${i.name} × ${i.quantity} — ₦${i.price * i.quantity}</li>`
            )
            .join("")}
        </ul>
      `,
    });

    res.json({ success: true, message: "Payment verified and order saved ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
