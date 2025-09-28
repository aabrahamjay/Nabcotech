import React, { useContext } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";

const PlaceOrder = () => {
  const { getTotalCartAmount, cartItems, food_list } = useContext(StoreContext);

  // Total with delivery fee
  const totalAmount =
    getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 500;

  const payWithPaystack = (e) => {
    e.preventDefault();

    // Collect form inputs
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

    // ✅ Prepare cart items to send to backend
    const orderedItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        quantity: cartItems[item._id],
        total: item.price * cartItems[item._id],
      }));

    // Paystack setup
    const handler = window.PaystackPop.setup({
      key: "pk_test_eba97a61f898f2d39488c328aecb007fc3770517", // replace with your Paystack public key
      email: email,
      amount: totalAmount * 100, // in kobo
      currency: "NGN",
      ref: "" + Math.floor(Math.random() * 1000000000 + 1), // unique ref
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
        alert("Payment successful! Ref: " + response.reference);

        // ✅ Send order details to backend
        fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: `${firstName} ${lastName}`,
            email,
            phone,
            items: orderedItems,
            totalAmount,
            paystackRef: response.reference,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              alert("Order saved! Admin notified ✅");
            } else {
              alert("Failed to save order: " + data.message);
            }
          })
          .catch((err) => {
            console.error(err);
            alert("Error sending order to backend");
          });
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
