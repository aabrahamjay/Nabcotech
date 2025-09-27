import React, { useContext } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";

const PlaceOrder = () => {
  const { getTotalCartAmount } = useContext(StoreContext);

  // Total with delivery fee
  const totalAmount =
    getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 500;

  const payWithPaystack = (e) => {
    e.preventDefault();

    // Get user info from form inputs (later you can use state for this)
    const email = document.querySelector('input[type="email"]').value;
    const phone = document.querySelector('input[type="number"]').value;
    const firstName = document.querySelector(
      'input[placeholder="First Name"]'
    ).value;
    const lastName = document.querySelector(
      'input[placeholder="LastName"]'
    ).value;

    if (!email || !phone || !firstName || !lastName) {
      alert("Please fill all details");
      return;
    }

    // Paystack payment setup
    const handler = window.PaystackPop.setup({
      key: "pk_test_eba97a61f898f2d39488c328aecb007fc3770517", // Replace with your Paystack public key
      email: email,
      amount: totalAmount * 100, // kobo (multiply by 100)
      currency: "NGN",
      ref: "" + Math.floor(Math.random() * 1000000000 + 1), // Unique ref
      metadata: {
        custom_fields: [
          {
            display_name: `${firstName} ${lastName}`,
            variable_name: "mobile_number",
            value: phone,
          },
        ],
      },
      callback: function (response) {
        alert("Payment successful. Reference: " + response.reference);
        // 👉 You can now send the reference to your backend for verification
      },
      onClose: function () {
        alert("Transaction was not completed, window closed.");
      },
    });

    handler.openIframe();
  };

  return (
    <form className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input type="text" placeholder="First Name" />
          <input type="text" placeholder="LastName" />
        </div>
        <input type="email" placeholder="Email address" />
        <input type="number" placeholder="Phone" />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p> ₦{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₦{getTotalCartAmount() === 0 ? 0 : 500}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₦{totalAmount}</b>
            </div>
          </div>
          <button onClick={payWithPaystack}>Proceed To Payment</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
