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
      // Refresh orders
      const resO = await fetch(`${API_BASE}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
      if (resO.ok) {
        const ordersData = await resO.json();
        setOrders(ordersData);
        setStats(s => ({ ...s, orders: ordersData.length }));
      }
    } catch (err) {
      setActionMsg("Order deletion failed");
    }
  }
import { useEffect, useState } from "react";

// Use VITE_API_URL from .env, fallback to relative path for local dev
const API_BASE = import.meta.env.VITE_API_URL || "";
import { FaUser, FaBox, FaClipboardList, FaCheck, FaBan, FaTrash, FaEye } from "react-icons/fa";

const SIDEBAR = [
  { key: "users", label: "Users", icon: <FaUser /> },
  { key: "products", label: "Products", icon: <FaBox /> },
  { key: "orders", label: "Orders", icon: <FaClipboardList /> },
];

export default function AdminDashboard() {
  const [section, setSection] = useState("users");
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, active: 0, blocked: 0 });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const token = localStorage.getItem("petapp_token");

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
        // Products (pets)
        const resP = await fetch(`${API_BASE}/api/pets`);
        const productsData = await resP.json();
        setProducts(productsData);
        setStats(s => ({ ...s, products: productsData.length }));
        // Orders
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
    <div style={{ display: "flex", minHeight: "80vh" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#f7f7fa", padding: 24, borderRight: "1px solid #eee" }}>
        <h3 style={{ marginBottom: 32, color: "#333" }}>Admin</h3>
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
      <main style={{ flex: 1, padding: 32 }}>
        {/* Dashboard Stats */}
        <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
          <StatCard label="Total Users" value={stats.users} icon={<FaUser />} />
          <StatCard label="Active Users" value={stats.active} icon={<FaCheck />} />
          <StatCard label="Blocked Users" value={stats.blocked} icon={<FaBan />} />
          <StatCard label="Total Products" value={stats.products} icon={<FaBox />} />
          <StatCard label="Total Orders" value={stats.orders} icon={<FaClipboardList />} />
        </div>
        {/* Search bar */}
        <input
          type="text"
          placeholder={`Search ${section}...`}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ marginBottom: 16, padding: 8, width: 240, borderRadius: 6, border: "1px solid #ccc" }}
        />
        {/* Section Content */}
        {section === "users" && (
          <UserTable users={paginate(users)[0]} onAction={handleUserAction} loading={loading} error={error} actionMsg={actionMsg} />
        )}
        {section === "products" && (
          <ProductTable products={paginate(products)[0]} loading={loading} error={error} />
        )}
        {section === "orders" && (
          <OrderTable orders={paginate(orders)[0]} loading={loading} error={error} />
        )}
        {/* Pagination */}
        <Pagination page={page} setPage={setPage} total={paginate(
          section === "users" ? users : section === "products" ? products : orders
        )[1]} perPage={perPage} />
      </main>
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
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24 }}>
      <h3 style={{ marginBottom: 16 }}>User Management</h3>
      {actionMsg && <div style={{ color: "green", marginBottom: 10 }}>{actionMsg}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24 }}>
      <h3 style={{ marginBottom: 16 }}>Product Management</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f7f7fa" }}>
            <th>Name</th>
            <th>Species/Category</th>
            <th>Age/Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id || p.id}>
              <td>{p.name}</td>
              <td>{p.species}</td>
              <td>{p.age}</td>
              <td>{p.adopted ? "Inactive" : "Active"}</td>
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

function OrderTable({ orders, loading, error }) {
  if (loading) return <div>Loading orders...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24 }}>
      <h3 style={{ marginBottom: 16 }}>Order Management</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                <button style={iconBtnStyle}><FaEye /></button>
                <button style={{ ...iconBtnStyle, color: "#d9534f" }} onClick={() => handleDeleteOrder(o._id)} title="Delete Order"><FaTrash /></button>
                {/* Add update/cancel actions as needed */}
              </td>
            </tr>
          ))}
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
