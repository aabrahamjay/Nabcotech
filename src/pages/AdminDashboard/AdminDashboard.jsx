import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  return (
    <div>
      <h2>All Orders</h2>
      {orders.map((order) => (
        <div key={order._id}>
          <p>
            {order.customerName} - ₦{order.totalAmount}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
