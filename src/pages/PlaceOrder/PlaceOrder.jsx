import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import API_BASE_URL from "../../config";
import "./PlaceOrder.css";

const PlaceOrder = () => {
  const { getTotalCartAmount, cartItems, food_list, setCartItems } =
    useContext(StoreContext);

  const [loading, setLoading] = useState(false);

  const totalAmount =
    getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 500;

  // ✅ Verify payment after redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference");

    if (reference) {
      const orderData = JSON.parse(localStorage.getItem("pendingOrder"));

      (async () => {
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/paystack/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference,
              ...orderData,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert("✅ Payment successful and order saved!");
            setCartItems({});
            localStorage.removeItem("pendingOrder");
            window.history.replaceState({}, document.title, "/placeorder");
          } else {
            // Fallback: assume webhook saved it
            alert(
              "⚠️ Could not verify immediately. Please check your email for confirmation."
            );
          }
        } catch (err) {
          console.error(err);
          alert("Something went wrong verifying payment.");
        }
      })();
    }
  }, [setCartItems]);

  // ✅ Place order & initiate Paystack
  const placeOrder = async (e) => {
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

    // Save order in case redirect breaks
    localStorage.setItem(
      "pendingOrder",
      JSON.stringify({
        customerName: `${firstName} ${lastName}`,
        email,
        phone,
        items: orderedItems,
        totalAmount,
      })
    );

    try {
      setLoading(true);

      const initRes = await fetch(`${API_BASE_URL}/paystack/initiate`, {
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

      if (!initData.success) {
        setLoading(false);
        return alert("Payment initiation failed: " + initData.message);
      }

      // Redirect to Paystack
      window.location.href = initData.authorization_url;
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
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
              <p>₦{getTotalCartAmount()}</p>
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
          <button onClick={placeOrder} disabled={loading}>
            {loading ? "Processing..." : "Proceed To Payment"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
