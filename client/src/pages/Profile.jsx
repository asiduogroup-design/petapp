import { useEffect, useState } from "react";

export default function Profile() {
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
        const res = await fetch("/api/users/me", {
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

  if (loading) return <div className="container">Loading profile...</div>;
  if (error) return <div className="container" style={{ color: "red" }}>{error}</div>;
  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h2>My Profile</h2>
      <div style={{ background: "#f9f9f9", padding: 20, borderRadius: 8 }}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
        <p><strong>Registered:</strong> {new Date(user.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
