import React, { useContext } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";

const PlaceOrder = () => {
  const { getTotalCartAmount, cartItems, food_list, setCartItems } =
    useContext(StoreContext);

  // Total with delivery fee
  const totalAmount =
    getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 500;

  const payWithPaystack = (e) => {
    e.preventDefault();

    // Collect form inputs
    const email = document.querySelector('input[type="email"]').value.trim();
    const phone = document.querySelector('input[type="number"]').value.trim();
    const firstName = document
      .querySelector('input[placeholder="First Name"]')
      .value.trim();
    const lastName = document
      .querySelector('input[placeholder="LastName"]')
      .value.trim();

    // ✅ Validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName) {
      alert("Please enter your first name");
      return;
    }
    if (!lastName) {
      alert("Please enter your last name");
      return;
    }
    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!phone || phone.length < 10) {
      alert("Please enter a valid phone number (at least 10 digits)");
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

    // Continue with Paystack setup...
    const handler = window.PaystackPop.setup({
      key: "pk_test_eba97a61f898f2d39488c328aecb007fc3770517",
      email,
      amount: totalAmount * 100,
      currency: "NGN",
      ref: "" + Math.floor(Math.random() * 1000000000 + 1),
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
              setCartItems({});
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
