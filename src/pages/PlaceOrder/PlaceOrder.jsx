import React, { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./PlaceOrder.css";

const PlaceOrder = () => {
  const { getTotalCartAmount, cartItems, food_list, setCartItems } =
    useContext(StoreContext);
  const totalAmount =
    getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 500;

  const payWithPaystack = async (e) => {
    e.preventDefault();

    const email = document.querySelector('input[type="email"]').value.trim();
    const phone = document.querySelector('input[type="number"]').value.trim();
    const firstName = document
      .querySelector('input[placeholder="First Name"]')
      .value.trim();
    const lastName = document
      .querySelector('input[placeholder="LastName"]')
      .value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !emailRegex.test(email) ||
      !phone ||
      phone.length < 10
    ) {
      return alert("Please fill in all fields correctly.");
    }

    const orderedItems = food_list
      .filter((item) => cartItems[item._id] > 0)
      .map((item) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        quantity: cartItems[item._id],
      }));

    // 1️⃣ Call backend to initiate transaction
    const initRes = await fetch("http://localhost:5000/api/paystack/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: `${firstName} ${lastName}`,
        email,
        phone,
        items: orderedItems,
        totalAmount,
      }),
    });
    const initData = await initRes.json();

    if (!initData.success)
      return alert("Payment initiation failed: " + initData.message);

    // 2️⃣ Open Paystack iframe with returned authorization_url
    const handler = window.PaystackPop.setup({
      key: "pk_test_eba97a61f898f2d39488c328aecb007fc3770517", // public key
      email,
      amount: totalAmount * 100,
      currency: "NGN",
      ref: initData.reference,
      callback: function (response) {
        (async () => {
          const verifyRes = await fetch(
            "http://localhost:5000/api/paystack/verify",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reference: response.reference, // better: use response.reference
                customerName: `${firstName} ${lastName}`,
                email,
                phone,
                items: orderedItems,
                totalAmount,
              }),
            }
          );
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment successful and order saved ✅");
            setCartItems({});
          } else {
            alert("Payment verification failed: " + verifyData.message);
          }
        })();
      },

      onClose: function () {
        alert("Payment not completed.");
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
