import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";

const CART_KEY = "petapp_cart";

const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout."));
    document.body.appendChild(script);
  });

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

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [cart]
  );
  const taxes = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + taxes;

  const orderItems = useMemo(
    () =>
      cart.map((item) => ({
        productId: String(item.id),
        name: item.name,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
      })),
    [cart]
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.fullName || !form.email || !form.phone || !form.address || !form.city || !form.pincode) {
      return "Please complete all billing and shipping details.";
    }

    return "";
  };

  const completePaidOrder = (createdOrder, paymentId) => {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event("petapp:storage-updated"));
    const placedItemCount = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
    setCart([]);
    navigate("/payment/success", {
      replace: true,
      state: {
        orderId: createdOrder?._id,
        paymentMethod: "razorpay",
        paymentId,
        total: grandTotal,
        itemCount: placedItemCount,
        items: createdOrder?.items || orderItems,
        billingDetails: createdOrder?.billingDetails || form,
        createdAt: createdOrder?.createdAt || new Date().toISOString(),
      },
    });
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
      const razorpayOrder = await apiRequest("/orders/razorpay/create", {
        method: "POST",
        token: authToken,
        body: {
          amount: grandTotal,
          currency: "INR",
        },
      });

      if (razorpayOrder.mock) {
        const response = {
          razorpay_order_id: razorpayOrder.razorpayOrderId,
          razorpay_payment_id: razorpayOrder.mockPaymentId,
          razorpay_signature: razorpayOrder.mockSignature,
        };

        const createdOrder = await apiRequest("/orders/razorpay/verify", {
          method: "POST",
          token: authToken,
          body: {
            ...response,
            items: orderItems,
            total: grandTotal,
            billingDetails: form,
          },
        });

        completePaidOrder(createdOrder, response.razorpay_payment_id);
        return;
      }

      await loadRazorpayCheckout();

      const checkout = new window.Razorpay({
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Pet App",
        description: "Pet supplies order payment",
        order_id: razorpayOrder.razorpayOrderId,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          address: `${form.address}, ${form.city} - ${form.pincode}`,
        },
        theme: {
          color: "#0f766e",
        },
        handler: async (response) => {
          try {
            const createdOrder = await apiRequest("/orders/razorpay/verify", {
              method: "POST",
              token: authToken,
              body: {
                ...response,
                items: orderItems,
                total: grandTotal,
                billingDetails: form,
              },
            });

            completePaidOrder(createdOrder, response.razorpay_payment_id);
          } catch (verifyError) {
            setError(verifyError.message || "Payment verification failed. Please contact support.");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      });

      checkout.open();
    } catch (requestError) {
      setError(requestError.message || "Payment failed. Please try again.");
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
        <p style={{ color: "#64748b", marginBottom: 20 }}>
          Enter billing and shipping details. Razorpay Checkout will collect payment details securely.
        </p>

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
            <h3 style={{ marginBottom: 14 }}>Billing & Shipping Details</h3>
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

            <div
              style={{
                marginTop: 18,
                border: "1px dashed #99f6e4",
                borderRadius: 10,
                padding: 12,
                background: "#f0fdfa",
                color: "#115e59",
                fontWeight: 600,
              }}
            >
              Card, UPI, wallet and netbanking details are entered only inside Razorpay Checkout.
            </div>

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
                  <p style={{ fontWeight: 700 }}>Rs. {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
            <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "12px 0" }} />
            <p style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span>Subtotal</span>
              <strong>Rs. {subtotal.toLocaleString("en-IN")}</strong>
            </p>
            <p style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span>Tax (5%)</span>
              <strong>Rs. {taxes.toLocaleString("en-IN")}</strong>
            </p>
            <p style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 18 }}>
              <span>Total</span>
              <strong>Rs. {grandTotal.toLocaleString("en-IN")}</strong>
            </p>
            <p
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px dashed #cbd5e1",
                color: "#0f766e",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Delivery Charges: Real-time and payable separately at delivery.
            </p>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={submitting}>
              {submitting ? "Opening Razorpay..." : "Pay with Razorpay"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block"
              style={{ marginTop: 10 }}
              onClick={() => navigate("/user?section=cart")}
              disabled={submitting}
            >
              Back to Cart
            </button>
          </aside>
        </form>
      </div>
    </section>
  );
}
