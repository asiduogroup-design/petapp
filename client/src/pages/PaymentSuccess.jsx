import { Link, useLocation, useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderId = location.state?.orderId || "";
  const paymentMethod = location.state?.paymentMethod || "";
  const total = Number(location.state?.total || 0);
  const itemCount = Number(location.state?.itemCount || 0);

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 860 }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 28,
            boxShadow: "0 4px 18px rgba(2, 6, 23, 0.06)",
          }}
        >
          <p
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#ecfdf5",
              color: "#047857",
              border: "1px solid #a7f3d0",
              borderRadius: 999,
              padding: "6px 12px",
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Payment Successful
          </p>

          <h2 style={{ marginBottom: 10 }}>Order Confirmed</h2>
          <p style={{ color: "#475569", marginBottom: 18 }}>
            Your order has been placed successfully. We will update your order status in your account.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <SummaryCard label="Order ID" value={orderId || "Will be available in Order History"} />
            <SummaryCard label="Items" value={itemCount > 0 ? String(itemCount) : "-"} />
            <SummaryCard
              label="Payment Method"
              value={paymentMethod ? paymentMethod.toUpperCase() : "-"}
            />
            <SummaryCard
              label="Amount Paid"
              value={total > 0 ? `₹${total.toLocaleString("en-IN")}` : "-"}
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => navigate("/user?section=orders")}>View Order History</button>
            <Link to="/products" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: 12,
        background: "#f8fafc",
      }}
    >
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>{label}</p>
      <p style={{ color: "#0f172a", fontWeight: 700, fontSize: 14, wordBreak: "break-word" }}>{value}</p>
    </div>
  );
}
