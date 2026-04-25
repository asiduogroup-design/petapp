import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";

const CART_KEY = "petapp_cart";

export default function Payment({ authToken }) {
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  });

  const [method, setMethod] = useState("card");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    upiId: "",
  });

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [cart]
  );
  const shipping = subtotal > 0 ? 49 : 0;
  const taxes = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + shipping + taxes;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.fullName || !form.email || !form.phone || !form.address || !form.city || !form.pincode) {
      return "Please complete all billing details.";
    }

    if (method === "card") {
      if (!form.cardNumber || !form.cardName || !form.expiry || !form.cvv) {
        return "Please complete all card details.";
      }
    }

    if (method === "upi") {
      if (!form.upiId) {
        return "Please enter your UPI ID.";
      }
    }

    return "";
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Your cart is empty. Add products before payment.");
      return;
    }

    if (!authToken) {
      setError("Please log in to continue payment.");
      navigate("/login");
      return;
    }

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSubmitting(true);

    try {
      const createdOrder = await apiRequest("/orders", {
        method: "POST",
        token: authToken,
        body: {
          items: cart.map((item) => ({
            productId: String(item.id),
            name: item.name,
            quantity: Number(item.quantity || 1),
            price: Number(item.price || 0),
          })),
          total: grandTotal,
          paymentMethod: method,
        },
      });

      localStorage.removeItem(CART_KEY);
      window.dispatchEvent(new Event("petapp:storage-updated"));
      const placedItemCount = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
      setCart([]);
      navigate("/payment/success", {
        replace: true,
        state: {
          orderId: createdOrder?._id,
          paymentMethod: method,
          total: grandTotal,
          itemCount: placedItemCount,
        },
      });
    } catch (requestError) {
      setError(requestError.message || "Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.length) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e5e7eb" }}>
            <h2 style={{ marginBottom: 10 }}>Payment</h2>
            <p style={{ color: "#64748b", marginBottom: 14 }}>Your cart is empty.</p>
            <button className="btn btn-primary" onClick={() => navigate("/products")}>Go to Products</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 1100 }}>
        <h2 className="section-title" style={{ textAlign: "left", marginBottom: 12 }}>Secure Checkout</h2>
        <p style={{ color: "#64748b", marginBottom: 20 }}>Complete your payment to place the order.</p>

        <form
          onSubmit={placeOrder}
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            alignItems: "start",
          }}
        >
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
            <h3 style={{ marginBottom: 14 }}>Billing Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Kalyan" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={onChange} placeholder="kalyan@example.com" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={onChange} placeholder="+91 0000000000" required />
              </div>
              <div className="form-group">
                <label>City</label>
                <input name="city" value={form.city} onChange={onChange} placeholder="Chennai" required />
              </div>
              <div className="form-group full">
                <label>Address</label>
                <input name="address" value={form.address} onChange={onChange} placeholder="Street, Area, Landmark" required />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input name="pincode" value={form.pincode} onChange={onChange} placeholder="600001" required />
              </div>
            </div>

            <h3 style={{ marginBottom: 14, marginTop: 20 }}>Payment Method</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <button type="button" className={`btn btn-sm ${method === "card" ? "btn-primary" : "btn-outline"}`} onClick={() => setMethod("card")}>Card</button>
              <button type="button" className={`btn btn-sm ${method === "upi" ? "btn-primary" : "btn-outline"}`} onClick={() => setMethod("upi")}>UPI</button>
              <button type="button" className={`btn btn-sm ${method === "cod" ? "btn-primary" : "btn-outline"}`} onClick={() => setMethod("cod")}>Cash on Delivery</button>
            </div>

            {method === "card" && (
              <div className="form-grid">
                <div className="form-group full">
                  <label>Card Number</label>
                  <input name="cardNumber" value={form.cardNumber} onChange={onChange} placeholder="1234 5678 9012 3456" />
                </div>
                <div className="form-group">
                  <label>Name on Card</label>
                  <input name="cardName" value={form.cardName} onChange={onChange} placeholder="Kalyan" />
                </div>
                <div className="form-group">
                  <label>Expiry</label>
                  <input name="expiry" value={form.expiry} onChange={onChange} placeholder="MM/YY" />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input name="cvv" value={form.cvv} onChange={onChange} placeholder="123" />
                </div>
              </div>
            )}

            {method === "upi" && (
              <div className="form-group" style={{ marginTop: 8 }}>
                <label>UPI ID</label>
                <input name="upiId" value={form.upiId} onChange={onChange} placeholder="name@upi" />
              </div>
            )}

            {error && <p style={{ color: "#b91c1c", marginTop: 12, fontWeight: 600 }}>{error}</p>}
          </div>

          <aside style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20, height: "fit-content" }}>
            <h3 style={{ marginBottom: 12 }}>Order Summary</h3>
            <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
              {cart.map((item) => (
                <div key={String(item.id)} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <p style={{ color: "#334155", fontSize: 14 }}>
                    {item.name} x {Number(item.quantity || 1)}
                  </p>
                  <p style={{ fontWeight: 700 }}>₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
            <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "12px 0" }} />
            <p style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span>Subtotal</span>
              <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
            </p>
            <p style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span>Shipping</span>
              <strong>₹{shipping.toLocaleString("en-IN")}</strong>
            </p>
            <p style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span>Tax (5%)</span>
              <strong>₹{taxes.toLocaleString("en-IN")}</strong>
            </p>
            <p style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 18 }}>
              <span>Total</span>
              <strong>₹{grandTotal.toLocaleString("en-IN")}</strong>
            </p>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={submitting}>
              {submitting ? "Processing..." : "Pay Now"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block"
              style={{ marginTop: 10 }}
              onClick={() => navigate("/user?section=cart")}
            >
              Back to Cart
            </button>
          </aside>
        </form>
      </div>
    </section>
  );
}
