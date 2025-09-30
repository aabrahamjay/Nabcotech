import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../config";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);

  // Fetch all orders
  const fetchOrders = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Mark as delivered
  const markAsDelivered = async (orderId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/deliver`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.success) {
      alert("Order marked as delivered ✅");
      fetchOrders();
    } else {
      alert("Error: " + data.message);
    }
  };

  // ✅ Delete order
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      alert("Order deleted ❌");
      fetchOrders();
    } else {
      alert("Error: " + data.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Orders</h2>
      {orders.length === 0 && <p>No orders yet.</p>}

      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <h3>
            {order.customerName} — ₦{order.totalAmount}
          </h3>
          <p>Email: {order.email}</p>
          <p>Phone: {order.phone}</p>
          <p>
            Status: <b>{order.status || "Pending"}</b>
          </p>

          <h4>Items Ordered:</h4>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.name} × {item.quantity} — ₦{item.price * item.quantity}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "10px" }}>
            {order.status !== "Delivered" && (
              <button
                onClick={() => markAsDelivered(order._id)}
                style={{ marginRight: "10px", padding: "5px 10px" }}
              >
                ✅ Mark as Delivered
              </button>
            )}
            <button
              onClick={() => deleteOrder(order._id)}
              style={{
                padding: "5px 10px",
                backgroundColor: "red",
                color: "white",
              }}
            >
              ❌ Delete Order
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
