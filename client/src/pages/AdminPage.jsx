import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";
import { Link } from "react-router-dom";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      const token = localStorage.getItem("petapp_token");
      if (!token) {
        setError("Not logged in!");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Unauthorized or error fetching profile");
        }
        const userData = await res.json();
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUserProfile();
  }, []);

  if (loading) return <div className="container">Loading admin page...</div>;
  if (error) return <div className="container" style={{ color: "red" }}>{error}</div>;
  if (!user || user.role !== "admin") return <div className="container">Access denied. Admins only.</div>;

  return (
    <div className="container" style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h2>Admin Page</h2>
      <p>Welcome, {user.name}! You have admin access.</p>
      {/* Add admin features here */}
      <Link to="/">Go to Home</Link>
    </div>
  );
}
