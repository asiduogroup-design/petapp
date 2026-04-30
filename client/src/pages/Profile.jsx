import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHeart, FaBoxOpen, FaUserCircle, FaStethoscope, FaShoppingCart } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL || "";

const SIDEBAR = [
  { key: "profile", label: "My Profile", icon: <FaUserCircle /> },
  { key: "cart", label: "My Cart", icon: <FaShoppingCart /> },
  { key: "orders", label: "Order History", icon: <FaBoxOpen /> },
  { key: "appointments", label: "Doctor Appointments", icon: <FaStethoscope /> },
  { key: "wishlist", label: "Wishlist", icon: <FaHeart /> },
];

const WISHLIST_KEY = "petapp_wishlist";
const CART_KEY = "petapp_cart";

function formatTimeSlot(timeSlot) {
  if (!timeSlot || typeof timeSlot !== "string") return "-";

  const [h, m] = timeSlot.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeSlot;

  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 || 12;
  return `${displayHour}:${String(m).padStart(2, "0")} ${period}`;
}

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [section, setSection] = useState("profile");
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      const token = localStorage.getItem("petapp_token");

      if (!token) {
        setError("Please log in to view your dashboard.");
        setLoading(false);
        return;
      }

      try {
        const [meRes, orderRes, appointmentRes] = await Promise.all([
          fetch(`${API_BASE}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/orders/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/appointments/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!meRes.ok) {
          throw new Error("Unauthorized. Please login again.");
        }

        const meData = await meRes.json();
        setUser(meData);

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(Array.isArray(orderData) ? orderData : []);
        }

        if (appointmentRes.ok) {
          const appointmentData = await appointmentRes.json();
          setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const allowedSections = new Set(["profile", "cart", "orders", "appointments", "wishlist"]);
    const requestedSection = new URLSearchParams(location.search).get("section");

    if (requestedSection && allowedSections.has(requestedSection)) {
      setSection(requestedSection);
      return;
    }

    setSection("profile");
  }, [location.search]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      setWishlist(stored ? JSON.parse(stored) : []);
    } catch (_err) {
      setWishlist([]);
    }

    try {
      const storedCart = localStorage.getItem(CART_KEY);
      setCart(storedCart ? JSON.parse(storedCart) : []);
    } catch (_err) {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    const syncCollections = () => {
      try {
        const stored = localStorage.getItem(WISHLIST_KEY);
        setWishlist(stored ? JSON.parse(stored) : []);
      } catch (_err) {
        setWishlist([]);
      }

      try {
        const storedCart = localStorage.getItem(CART_KEY);
        setCart(storedCart ? JSON.parse(storedCart) : []);
      } catch (_err) {
        setCart([]);
      }
    };

    window.addEventListener("storage", syncCollections);
    window.addEventListener("petapp:storage-updated", syncCollections);

    return () => {
      window.removeEventListener("storage", syncCollections);
      window.removeEventListener("petapp:storage-updated", syncCollections);
    };
  }, []);

  const quickStats = useMemo(
    () => ({
      orders: orders.length,
      appointments: appointments.length,
      wishlist: wishlist.length,
      cart: cart.reduce((sum, item) => sum + Number(item?.quantity || 0), 0),
    }),
    [orders.length, appointments.length, wishlist.length, cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [cart]
  );

  const removeWishlistItem = (index) => {
    const next = wishlist.filter((_, i) => i !== index);
    setWishlist(next);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("petapp:storage-updated"));
  };

  const updateCartQuantity = (id, nextQuantity) => {
    const quantity = Math.max(1, Number(nextQuantity || 1));
    const next = cart.map((item) =>
      String(item.id) === String(id) ? { ...item, quantity } : item
    );

    setCart(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("petapp:storage-updated"));
  };

  const removeCartItem = (id) => {
    const next = cart.filter((item) => String(item.id) !== String(id));
    setCart(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("petapp:storage-updated"));
  };

  const viewOrder = (order) => {
    navigate("/payment/success", {
      state: {
        orderId: order._id,
        paymentMethod: order.paymentMethod,
        paymentId: order.razorpayPaymentId,
        total: order.total,
        itemCount: Array.isArray(order.items) ? order.items.length : 0,
        items: order.items || [],
        billingDetails: order.billingDetails || {},
        createdAt: order.createdAt,
      },
    });
  };

  if (loading) {
    return <div className="container" style={{ padding: "2rem 0" }}>Loading your dashboard...</div>;
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "2rem 0" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #fee2e2" }}>
          <p style={{ color: "#b91c1c", fontWeight: 600 }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-main" style={{ paddingTop: 16 }}>
      <aside className="admin-dashboard-sidebar">
        <h3>User Panel</h3>
        {SIDEBAR.map((tab) => (
          <div
            key={tab.key}
            onClick={() => setSection(tab.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              padding: "10px 0",
              color: section === tab.key ? "#007bff" : "#333",
              fontWeight: section === tab.key ? 700 : 500,
            }}
          >
            {tab.icon} {tab.label}
          </div>
        ))}
      </aside>

      <main className="admin-dashboard-content">
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <MiniStat title="Cart" value={quickStats.cart} />
          <MiniStat title="Orders" value={quickStats.orders} />
          <MiniStat title="Appointments" value={quickStats.appointments} />
          <MiniStat title="Wishlist" value={quickStats.wishlist} />
        </div>

        {section === "cart" && (
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>My Cart</h3>
            {!cart.length ? (
              <EmptyState title="Your cart is empty" ctaLabel="Add Products" ctaTo="/products" />
            ) : (
              <>
                <div style={{ display: "grid", gap: 12 }}>
                  {cart.map((item) => (
                    <div
                      key={String(item.id)}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 700, marginBottom: 4 }}>{item.name || "Cart Item"}</p>
                        <p style={{ color: "#64748b", fontSize: 14 }}>{item.category || item.cat || "Pet Product"}</p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                          type="number"
                          min="1"
                          value={Number(item.quantity || 1)}
                          onChange={(e) => updateCartQuantity(item.id, e.target.value)}
                          style={{ width: 72, padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 8 }}
                        />
                        <p style={{ fontWeight: 700, color: "#0f766e", minWidth: 100 }}>
                          ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-IN")}
                        </p>
                        <button className="btn btn-outline btn-sm" onClick={() => removeCartItem(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <p style={{ marginTop: 16, fontWeight: 800, fontSize: 18, textAlign: "right", color: "#0f172a" }}>
                  Total: ₹
                  {cartTotal.toLocaleString("en-IN")}
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                  <button className="btn btn-primary" onClick={() => navigate("/payment")}>
                    Proceed to Payment
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {section === "profile" && (
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>My Profile</h3>
            <p><strong>Name:</strong> {user?.name || "-"}</p>
            <p><strong>Email:</strong> {user?.email || "-"}</p>
            <p><strong>Phone:</strong> {user?.phone || "-"}</p>
            <p><strong>Role:</strong> {user?.role || "user"}</p>
            <p><strong>Joined:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</p>
          </div>
        )}

        {section === "orders" && (
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24, overflowX: "auto" }}>
            <h3 style={{ marginBottom: 16 }}>Order History</h3>
            {!orders.length ? (
              <EmptyState title="No orders yet" ctaLabel="Browse Products" ctaTo="/products" />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
                <thead>
                  <tr style={{ background: "#f7f7fa" }}>
                    <th style={thStyle}>Order ID</th>
                    <th style={thStyle}>Items</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td style={tdStyle}>{order._id}</td>
                      <td style={tdStyle}>{Array.isArray(order.items) ? order.items.length : 0}</td>
                      <td style={tdStyle}>₹{Number(order.total || 0).toLocaleString("en-IN")}</td>
                      <td style={tdStyle}>{order.status || "pending"}</td>
                      <td style={tdStyle}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => viewOrder(order)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {section === "appointments" && (
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24, overflowX: "auto" }}>
            <h3 style={{ marginBottom: 16 }}>Doctor Appointment History</h3>
            {!appointments.length ? (
              <EmptyState title="No appointments yet" ctaLabel="Book Appointment" ctaTo="/doctors" />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                <thead>
                  <tr style={{ background: "#f7f7fa" }}>
                    <th style={thStyle}>Doctor</th>
                    <th style={thStyle}>Pet</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>Issue</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td style={tdStyle}>{appointment.doctor || "-"}</td>
                      <td style={tdStyle}>{appointment.petName || "-"} ({appointment.petType || "-"})</td>
                      <td style={tdStyle}>{appointment.date || "-"}</td>
                      <td style={tdStyle}>{formatTimeSlot(appointment.timeSlot || appointment.time)}</td>
                      <td style={tdStyle}>{appointment.issue || "-"}</td>
                      <td style={tdStyle}>{appointment.status || "pending"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {section === "wishlist" && (
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>My Wishlist</h3>
            {!wishlist.length ? (
              <EmptyState title="Wishlist is empty" ctaLabel="Find Products" ctaTo="/products" />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {wishlist.map((item, index) => (
                  <div key={`${item.name || "wish"}-${index}`} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{item.emoji || "🐾"}</div>
                    <p style={{ fontWeight: 700 }}>{item.name || "Wishlist Item"}</p>
                    <p style={{ color: "#64748b", fontSize: 14 }}>{item.category || item.cat || "Pet Product"}</p>
                    <p style={{ color: "#0f766e", fontWeight: 700, margin: "8px 0" }}>
                      {item.price ? `₹${Number(item.price).toLocaleString("en-IN")}` : "Price not available"}
                    </p>
                    <button className="btn btn-outline btn-sm" onClick={() => removeWishlistItem(index)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function MiniStat({ title, value }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, minWidth: 150 }}>
      <div style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function EmptyState({ title, ctaLabel, ctaTo }) {
  return (
    <div style={{ border: "1px dashed #cbd5e1", borderRadius: 10, padding: 24, textAlign: "center" } }>
      <p style={{ marginBottom: 14, color: "#475569", fontWeight: 600 }}>{title}</p>
      <Link to={ctaTo} className="btn btn-primary btn-sm">{ctaLabel}</Link>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px 12px",
  fontWeight: 700,
  fontSize: 14,
};

const tdStyle = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top",
};
