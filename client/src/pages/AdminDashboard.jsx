import { useEffect, useState } from "react";
import { FaUser, FaBox, FaClipboardList, FaCheck, FaBan, FaTrash, FaEye, FaCalendarAlt } from "react-icons/fa";

// Use VITE_API_URL from .env, fallback to relative path for local dev
const API_BASE = import.meta.env.VITE_API_URL || "";

const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const formatPaymentMode = (method) => {
  const normalized = String(method || "").toLowerCase();

  if (normalized === "cod" || normalized === "cash_on_delivery") return "Cash on Delivery";
  if (normalized === "cash") return "Cash";
  if (normalized === "upi") return "UPI";
  if (normalized === "card" || normalized === "credit_card" || normalized === "debit_card") return "Card";
  if (normalized === "razorpay") return "Online Payment (Card/UPI)";

  return method ? String(method).toUpperCase() : "-";
};

const SIDEBAR = [
  { key: "users", label: "Users", icon: <FaUser /> },
  { key: "products", label: "Products", icon: <FaBox /> },
  { key: "orders", label: "Orders", icon: <FaClipboardList /> },
  { key: "appointments", label: "Doctor Appointments", icon: <FaCalendarAlt /> },
];

export default function AdminDashboard() {
  const [section, setSection] = useState("users");
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, active: 0, blocked: 0, appointments: 0 });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const token = localStorage.getItem("petapp_token");

  // Add Product Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [addProductError, setAddProductError] = useState("");
  const [addProductForm, setAddProductForm] = useState({
    name: "",
    category: "food",
    quantity: 1,
    cost: "",
    image: "",
    description: ""
  });

  // Fetch stats, users, products, orders
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        // Users
        const res = await fetch(`${API_BASE}/api/users/all`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Unauthorized or error fetching users");
        const usersData = await res.json();
        setUsers(usersData);
        setStats(s => ({
          ...s,
          users: usersData.length,
          active: usersData.filter(u => !u.isBlocked).length,
          blocked: usersData.filter(u => u.isBlocked).length,
        }));
        // Products
        const resP = await fetch(`${API_BASE}/api/products`);
        const productsData = await resP.json();
        setProducts(productsData);
        setStats(s => ({ ...s, products: productsData.length }));
        // Orders
                // Appointments
                const resA = await fetch(`${API_BASE}/api/appointments`, { headers: { Authorization: `Bearer ${token}` } });
                if (resA.ok) {
                  const appointmentsData = await resA.json();
                  setAppointments(appointmentsData);
                  setStats(s => ({ ...s, appointments: appointmentsData.length }));
                }
        const resO = await fetch(`${API_BASE}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
        if (resO.ok) {
          const ordersData = await resO.json();
          setOrders(ordersData);
          setStats(s => ({ ...s, orders: ordersData.length }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Set up real-time polling for appointments (check every 10 seconds)
    const appointmentPollInterval = setInterval(async () => {
      try {
        const resA = await fetch(`${API_BASE}/api/appointments`, { headers: { Authorization: `Bearer ${token}` } });
        if (resA.ok) {
          const appointmentsData = await resA.json();
          setAppointments(appointmentsData);
        }
      } catch (err) {
        console.error("Error polling appointments:", err);
      }
    }, 10000);

    return () => clearInterval(appointmentPollInterval);
    // eslint-disable-next-line
  }, []);

  // User actions (same as before)
  async function handleUserAction(id, action, role) {
    setActionMsg("");
    let url = `${API_BASE}/api/users/${id}`;
    let method = "PATCH";
    let body = undefined;
    if (action === "block") url += "/block";
    else if (action === "unblock") url += "/unblock";
    else if (action === "role") { url += "/role"; body = JSON.stringify({ role }); }
    else if (action === "delete") { method = "DELETE"; body = undefined; }
    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
      });
      const data = await res.json();
      setActionMsg(data.message);
      // Refresh users
      const res2 = await fetch(`${API_BASE}/api/users/all`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(await res2.json());
    } catch (err) {
      setActionMsg("Action failed");
    }
  }

  // Delete order (admin only)
  async function handleDeleteOrder(orderId) {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setActionMsg(data.message || "Order deleted");

      const resO = await fetch(`${API_BASE}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
      if (resO.ok) {
        const ordersData = await resO.json();
        setOrders(ordersData);
        setStats((s) => ({ ...s, orders: ordersData.length }));
      }
    } catch (err) {
      setActionMsg("Order deletion failed");
    }
  }

  // Update appointment status (admin only)
  async function handleUpdateAppointmentStatus(appointmentId, newStatus) {
    setActionMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setActionMsg(`Appointment status updated to ${newStatus}`);

      // Refresh appointments
      const resA = await fetch(`${API_BASE}/api/appointments`, { headers: { Authorization: `Bearer ${token}` } });
      if (resA.ok) {
        const appointmentsData = await resA.json();
        setAppointments(appointmentsData);
      }
    } catch (err) {
      setActionMsg(`Status update failed: ${err.message}`);
    }
  }

  // Pagination and search helpers
  function paginate(arr) {
    const filtered = arr.filter(u =>
      Object.values(u).join(" ").toLowerCase().includes(search.toLowerCase())
    );
    const start = (page - 1) * perPage;
    return [filtered.slice(start, start + perPage), filtered.length];
  }

  // Render
  return (
    <div className="admin-dashboard-main">
      {/* Sidebar */}
      <aside className="admin-dashboard-sidebar">
        <h3>Admin</h3>
        {SIDEBAR.map(tab => (
          <div
            key={tab.key}
            onClick={() => { setSection(tab.key); setPage(1); setSearch(""); }}
            style={{
              display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
              padding: "10px 0", color: section === tab.key ? "#007bff" : "#333",
              fontWeight: section === tab.key ? 600 : 400,
            }}
          >
            {tab.icon} {tab.label}
          </div>
        ))}
      </aside>
      {/* Main Content */}
      <main className="admin-dashboard-content">
        {/* Dashboard Stats */}
        <div style={{ display: "flex", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
          <StatCard label="Total Users" value={stats.users} icon={<FaUser />} />
          <StatCard label="Active Users" value={stats.active} icon={<FaCheck />} />
          <StatCard label="Blocked Users" value={stats.blocked} icon={<FaBan />} />
          <StatCard label="Total Products" value={stats.products} icon={<FaBox />} />
          <StatCard label="Total Orders" value={stats.orders} icon={<FaClipboardList />} />
                  <StatCard label="Appointments" value={stats.appointments} icon={<FaCalendarAlt />} />
        </div>
        {/* Search bar */}
        <input
          type="text"
          placeholder={`Search ${section}...`}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ marginBottom: 16, padding: 8, width: 240, borderRadius: 6, border: "1px solid #ccc", maxWidth: "100%" }}
        />
        {/* Section Content */}
        {section === "users" && (
          <UserTable users={paginate(users)[0]} onAction={handleUserAction} loading={loading} error={error} actionMsg={actionMsg} />
        )}
        {section === "products" && (
          <>
            <form
              style={{ background: "#fff", padding: 24, borderRadius: 12, minWidth: 320, boxShadow: "0 2px 8px #eee", marginBottom: 24, maxWidth: 480 }}
              onSubmit={async (e) => {
                e.preventDefault();
                setAddProductLoading(true);
                setAddProductError("");
                try {
                  const res = await fetch(`${API_BASE}/api/products`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(addProductForm),
                  });
                  if (!res.ok) throw new Error((await res.json()).message || "Failed to add product");
                  setAddProductForm({ name: "", category: "food", quantity: 1, cost: "", image: "", description: "" });
                  // Refresh products
                  const resP = await fetch(`${API_BASE}/api/products`);
                  const refreshedProducts = await resP.json();
                  setProducts(refreshedProducts);
                  setStats(s => ({ ...s, products: refreshedProducts.length }));
                  setActionMsg("Product added successfully!");
                } catch (err) {
                  setAddProductError(err.message);
                } finally {
                  setAddProductLoading(false);
                }
              }}
            >
              <h2 style={{ marginBottom: 16 }}>Add Product</h2>
              <div style={{ marginBottom: 12 }}>
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  value={addProductForm.name}
                  onChange={e => setAddProductForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Category</label>
                <select
                  required
                  value={addProductForm.category}
                  onChange={e => setAddProductForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                >
                  <option value="food">Food</option>
                  <option value="toys">Toys</option>
                  <option value="medicines">Medicines</option>
                  <option value="clothing">Clothing</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Quantity</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={addProductForm.quantity}
                  onChange={e => setAddProductForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Cost</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={addProductForm.cost}
                  onChange={e => setAddProductForm(f => ({ ...f, cost: e.target.value }))}
                  placeholder="499"
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Image URL</label>
                <input
                  type="url"
                  value={addProductForm.image}
                  onChange={e => setAddProductForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://example.com/product.jpg"
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Description</label>
                <textarea
                  required
                  value={addProductForm.description}
                  onChange={e => setAddProductForm(f => ({ ...f, description: e.target.value }))}
                  style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                />
              </div>
              {addProductError && <div style={{ color: "red", marginBottom: 10 }}>{addProductError}</div>}
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" disabled={addProductLoading}>
                  {addProductLoading ? "Adding..." : "Add Product"}
                </button>
              </div>
            </form>
            <ProductTable products={paginate(products)[0]} loading={loading} error={error} />
          </>
        )}
        {section === "orders" && (
          <OrderTable
            orders={paginate(orders)[0]}
            loading={loading}
            error={error}
            onView={setSelectedOrder}
            onDelete={handleDeleteOrder}
          />
        )}
        {section === "appointments" && (
          <AppointmentTable appointments={paginate(appointments)[0]} loading={loading} error={error} onUpdateStatus={handleUpdateAppointmentStatus} actionMsg={actionMsg} />
        )}
        {/* Pagination */}
        <Pagination page={page} setPage={setPage} total={paginate(
          section === "users" ? users : section === "products" ? products : section === "appointments" ? appointments : orders
        )[1]} perPage={perPage} />
      </main>
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24, minWidth: 160, display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ fontSize: 28, color: "#007bff" }}>{icon}</span>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
        <div style={{ fontSize: 14, color: "#666" }}>{label}</div>
      </div>
    </div>
  );
}


function UserTable({ users, onAction, loading, error, actionMsg }) {
  if (loading) return <div>Loading users...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24, overflowX: "auto" }} className="responsive-table">
      <h3 style={{ marginBottom: 16 }}>User Management</h3>
      {actionMsg && <div style={{ color: "green", marginBottom: 10 }}>{actionMsg}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr style={{ background: "#f7f7fa" }}>
            <th style={{ textAlign: "center" }}>Name</th>
            <th style={{ textAlign: "center" }}>Email</th>
            <th style={{ textAlign: "center" }}>Phone</th>
            <th style={{ textAlign: "center" }}>Role</th>
            <th style={{ textAlign: "center" }}>Status</th>
            <th style={{ textAlign: "center" }}>Email Verified</th>
            <th style={{ textAlign: "center" }}>Registered</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} style={{ background: u.isBlocked ? "#ffeaea" : "#fff" }}>
              <td style={{ textAlign: "center" }}>{u.name}</td>
              <td style={{ textAlign: "center" }}>{u.email}</td>
              <td style={{ textAlign: "center" }}>{u.phone || "-"}</td>
              <td style={{ textAlign: "center" }}>{u.role}</td>
              <td style={{ textAlign: "center" }}>{u.isBlocked ? "Blocked" : "Active"}</td>
              <td style={{ textAlign: "center" }}>{u.isEmailVerified ? "Yes" : "No"}</td>
              <td style={{ textAlign: "center" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
              <td style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                {u.role !== "admin" && (
                  <button title="Promote to Admin" style={iconBtnStyle} onClick={() => onAction(u._id, "role", "admin")}><FaCheck /></button>
                )}
                {u.role === "admin" && (
                  <button title="Demote to User" style={iconBtnStyle} onClick={() => onAction(u._id, "role", "user")}><FaBan /></button>
                )}
                {u.isBlocked ? (
                  <button title="Unblock" style={iconBtnStyle} onClick={() => onAction(u._id, "unblock")}><FaCheck /></button>
                ) : (
                  <button title="Block" style={iconBtnStyle} onClick={() => onAction(u._id, "block")}><FaBan /></button>
                )}
                <button title="Delete" style={{ ...iconBtnStyle, color: "#d9534f" }} onClick={() => {
                  if (window.confirm("Are you sure you want to delete this user?")) onAction(u._id, "delete");
                }}><FaTrash /></button>
                <button title="View Details" style={iconBtnStyle} onClick={() => alert(JSON.stringify(u, null, 2))}><FaEye /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



function ProductTable({ products, loading, error }) {
  if (loading) return <div>Loading products...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24, overflowX: "auto" }} className="responsive-table">
      <h3 style={{ marginBottom: 16 }}>Product Management</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
        <thead>
          <tr style={{ background: "#f7f7fa" }}>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Cost</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id || p.id}>
              <td>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
                  />
                ) : (
                  <span style={{ display: "inline-block", width: 48, textAlign: "center" }}>{p.emoji || "-"}</span>
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.category || p.cat || '-'}</td>
              <td>{p.cost != null || p.price != null ? `Rs. ${Number(p.cost ?? p.price).toLocaleString("en-IN")}` : "-"}</td>
              <td>{p.quantity ?? p.stock ?? '-'}</td>
              <td>{p.status || (!p.adopted ? "Active" : "Inactive")}</td>
              <td>
                <button style={iconBtnStyle}><FaEye /></button>
                {/* Add edit/delete actions as needed */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderTable({ orders, loading, error, onView, onDelete }) {
  if (loading) return <div>Loading orders...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24, overflowX: "auto" }} className="responsive-table">
      <h3 style={{ marginBottom: 16 }}>Order Management</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
        <thead>
          <tr style={{ background: "#f7f7fa" }}>
            <th>Order ID</th>
            <th>User</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o._id}</td>
              <td>{o.user?.name || "-"}</td>
              <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}</td>
              <td>{o.status}</td>
              <td>
                <button style={iconBtnStyle} onClick={() => onView(o)} title="View Order Details"><FaEye /></button>
                <button style={{ ...iconBtnStyle, color: "#d9534f" }} onClick={() => onDelete(o._id)} title="Delete Order"><FaTrash /></button>
                {/* Add update/cancel actions as needed */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderDetailsModal({ order, onClose }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemSubtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    return sum + price * quantity;
  }, 0);
  const orderTotal = Number(order.total || 0);
  const orderExtra = Math.max(0, orderTotal - itemSubtotal);

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <h3 style={{ marginBottom: 6 }}>Order Details</h3>
            <p style={{ color: "#64748b", fontSize: 14 }}>Order ID: {order._id}</p>
          </div>
          <button type="button" style={closeBtnStyle} onClick={onClose}>Close</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
          <DetailBox label="Customer" value={order.user?.name || order.billingDetails?.fullName || "-"} />
          <DetailBox label="Date" value={order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"} />
          <DetailBox label="Payment Mode" value={formatPaymentMode(order.paymentMethod)} />
          <DetailBox label="Total Amt Paid" value={formatMoney(order.total)} />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
            <thead>
              <tr style={{ background: "#f7f7fa" }}>
                <th style={detailThStyle}>Product Name</th>
                <th style={detailThStyle}>Quantity</th>
                <th style={detailThStyle}>Price</th>
                <th style={detailThStyle}>Total Amt Paid</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item, index) => {
                  const quantity = Number(item.quantity || 1);
                  const price = Number(item.price || 0);
                  const amount = price * quantity;
                  const extraShare = itemSubtotal > 0 ? orderExtra * (amount / itemSubtotal) : 0;

                  return (
                    <tr key={`${item.productId || item.name || "item"}-${index}`}>
                      <td style={detailTdStyle}>{item.name || "Product"}</td>
                      <td style={detailTdStyle}>{quantity}</td>
                      <td style={detailTdStyle}>{formatMoney(price)}</td>
                      <td style={detailTdStyle}>{formatMoney(amount + extraShare)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td style={detailTdStyle} colSpan={4}>No product details available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ minWidth: 220, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
            <p style={{ display: "flex", justifyContent: "space-between", gap: 20, fontWeight: 700 }}>
              <span>Total Paid</span>
              <span>{formatMoney(order.total)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, background: "#f8fafc" }}>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#0f172a", fontWeight: 700, wordBreak: "break-word" }}>{value}</p>
    </div>
  );
}

function AppointmentTable({ appointments, loading, error, onUpdateStatus, actionMsg }) {
  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!appointments.length) return <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24 }}>No appointments found.</div>;
  
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return { background: "#d4edda", color: "#155724" };
      case "completed":
        return { background: "#d1ecf1", color: "#0c5460" };
      case "cancelled":
        return { background: "#f8d7da", color: "#721c24" };
      default: // pending
        return { background: "#fff3cd", color: "#856404" };
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24, overflowX: "auto" }} className="responsive-table">
      <h3 style={{ marginBottom: 16 }}>Doctor Appointments</h3>
      {actionMsg && <div style={{ color: actionMsg.includes("failed") ? "red" : "green", marginBottom: 10, padding: "10px", background: actionMsg.includes("failed") ? "#ffe6e6" : "#e6ffe6", borderRadius: 6 }}>{actionMsg}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
        <thead>
          <tr style={{ background: "#f7f7fa" }}>
            <th style={{ padding: "10px 12px", textAlign: "left" }}>Patient Name</th>
            <th style={{ padding: "10px 12px", textAlign: "left" }}>Phone</th>
            <th style={{ padding: "10px 12px", textAlign: "left" }}>Email</th>
            <th style={{ padding: "10px 12px", textAlign: "left" }}>Pet</th>
            <th style={{ padding: "10px 12px", textAlign: "left" }}>Count</th>
            <th style={{ padding: "10px 12px", textAlign: "left" }}>Doctor</th>
            <th style={{ padding: "10px 12px", textAlign: "left" }}>Date</th>
            <th style={{ padding: "10px 12px", textAlign: "left" }}>Time</th>
            <th style={{ padding: "10px 12px", textAlign: "left" }}>Issue</th>
            <th style={{ padding: "10px 12px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "10px 12px", textAlign: "left" }}>Actions</th>
            <th style={{ padding: "10px 12px", textAlign: "left" }}>Booked On</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => {
            const statusColor = getStatusColor(a.status);
            const isCompleted = a.status === "completed";
            const isCancelled = a.status === "cancelled";
            
            return (
              <tr key={a._id} style={{ borderBottom: "1px solid #f0f0f0", background: isCancelled ? "#ffeaea" : isCompleted ? "#e6f7ff" : "#fff" }}>
                <td style={{ padding: "10px 12px" }}>{a.name}</td>
                <td style={{ padding: "10px 12px" }}>{a.phone}</td>
                <td style={{ padding: "10px 12px" }}>{a.email}</td>
                <td style={{ padding: "10px 12px" }}>{a.petName} ({a.petType})</td>
                <td style={{ padding: "10px 12px" }}>{a.numberOfPets}</td>
                <td style={{ padding: "10px 12px" }}>{a.doctor}</td>
                <td style={{ padding: "10px 12px" }}>{a.date}</td>
                <td style={{ padding: "10px 12px" }}>{a.timeSlot}</td>
                <td style={{ padding: "10px 12px", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.issue || "-"}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    ...statusColor
                  }}>{a.status}</span>
                </td>
                <td style={{ padding: "10px 12px", display: "flex", gap: 4 }}>
                  {!isCancelled && !isCompleted && (
                    <>
                      <button 
                        title="Mark as Completed" 
                        style={{ ...iconBtnStyle, color: "#28a745" }}
                        onClick={() => onUpdateStatus(a._id, "completed")}
                      >
                        ✓
                      </button>
                      <button 
                        title="Cancel Appointment" 
                        style={{ ...iconBtnStyle, color: "#dc3545" }}
                        onClick={() => {
                          if (window.confirm("Are you sure you want to cancel this appointment?")) {
                            onUpdateStatus(a._id, "cancelled");
                          }
                        }}
                      >
                        ✕
                      </button>
                    </>
                  )}
                  {(isCompleted || isCancelled) && (
                    <span style={{ fontSize: 12, color: "#999" }}>No actions</span>
                  )}
                </td>
                <td style={{ padding: "10px 12px" }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ page, setPage, total, perPage }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  return (
    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
      <span>Page {page} of {totalPages}</span>
      <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
    </div>
  );
}

const iconBtnStyle = {
  background: "#f7f7fa",
  border: "1px solid #ddd",
  borderRadius: 6,
  padding: 6,
  cursor: "pointer",
  fontSize: 16,
  color: "#007bff",
  outline: "none",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 9999,
};

const modalStyle = {
  width: "min(900px, 100%)",
  maxHeight: "88vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 20px 50px rgba(15, 23, 42, 0.22)",
  padding: 24,
};

const closeBtnStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#fff",
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: 700,
};

const detailThStyle = {
  textAlign: "left",
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  fontWeight: 700,
};

const detailTdStyle = {
  textAlign: "left",
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  verticalAlign: "top",
};
