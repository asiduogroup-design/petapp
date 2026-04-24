import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { FaTrash, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function MyAppointments({ isLoggedIn, authToken }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [updating, setUpdating] = useState(false);

  // Fetch appointments on mount and set up polling
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const result = await apiRequest("/appointments/my", {
          method: "GET",
          token: authToken,
        });
        setAppointments(result);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchAppointments, 10000);

    return () => clearInterval(interval);
  }, [isLoggedIn, authToken, navigate]);

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    setUpdating(true);
    setActionMsg("");
    try {
      const response = await fetch(`${API_BASE}/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || "Failed to cancel appointment");
      }

      setActionMsg("Appointment cancelled successfully!");
      // Refresh appointments
      const result = await apiRequest("/appointments/my", {
        method: "GET",
        token: authToken,
      });
      setAppointments(result);
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      setActionMsg(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle style={{ color: "#28a745", marginRight: 8 }} />;
      case "cancelled":
        return <FaTimesCircle style={{ color: "#dc3545", marginRight: 8 }} />;
      case "confirmed":
        return <FaCheckCircle style={{ color: "#007bff", marginRight: 8 }} />;
      default:
        return <FaClock style={{ color: "#ffc107", marginRight: 8 }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return { background: "#d1ecf1", color: "#0c5460", border: "1px solid #bee5eb" };
      case "cancelled":
        return { background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb" };
      case "confirmed":
        return { background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" };
      default:
        return { background: "#fff3cd", color: "#856404", border: "1px solid #ffeaa7" };
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <p>Please log in to view your appointments.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ marginBottom: 30, fontSize: 28, color: "#333" }}>My Appointments</h1>

      {actionMsg && (
        <div
          style={{
            marginBottom: 20,
            padding: "12px 16px",
            borderRadius: 8,
            background: actionMsg.includes("Error") ? "#ffe6e6" : "#e6ffe6",
            color: actionMsg.includes("Error") ? "#d32f2f" : "#388e3c",
            border: actionMsg.includes("Error") ? "1px solid #ffcdd2" : "1px solid #c8e6c9",
          }}
        >
          {actionMsg}
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 20, padding: 16, background: "#ffebee", color: "#d32f2f", borderRadius: 8, border: "1px solid #ffcdd2" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#f5f5f5", borderRadius: 8 }}>
          <p style={{ fontSize: 16, color: "#666" }}>No appointments found. Book one now!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: 20,
          }}
        >
          {appointments.map((apt) => (
            <div
              key={apt._id}
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: 20,
                border: "1px solid #f0f0f0",
              }}
            >
              {/* Status Badge */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: 16, justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {getStatusIcon(apt.status)}
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "capitalize",
                      ...getStatusColor(apt.status),
                    }}
                  >
                    {apt.status}
                  </span>
                </div>
                {apt.status !== "cancelled" && apt.status !== "completed" && (
                  <button
                    onClick={() => handleCancelAppointment(apt._id)}
                    disabled={updating}
                    style={{
                      background: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 10px",
                      cursor: updating ? "not-allowed" : "pointer",
                      fontSize: 12,
                      opacity: updating ? 0.6 : 1,
                    }}
                  >
                    <FaTrash style={{ marginRight: 4 }} /> Cancel
                  </button>
                )}
              </div>

              {/* Appointment Details */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ margin: "8px 0", fontSize: 14 }}>
                  <strong>Doctor:</strong> {apt.doctor}
                </p>
                <p style={{ margin: "8px 0", fontSize: 14 }}>
                  <strong>Pet:</strong> {apt.petName} ({apt.petType})
                </p>
                <p style={{ margin: "8px 0", fontSize: 14 }}>
                  <strong>Date & Time:</strong> {apt.date} at {apt.timeSlot}
                </p>
                <p style={{ margin: "8px 0", fontSize: 14 }}>
                  <strong>Issue:</strong> {apt.issue || "General checkup"}
                </p>
              </div>

              {/* Divider */}
              <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #eee" }} />

              {/* Contact & Details */}
              <div style={{ fontSize: 13, color: "#666" }}>
                <p style={{ margin: "4px 0" }}>
                  <strong>Phone:</strong> {apt.phone}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Email:</strong> {apt.email}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Booked On:</strong> {apt.createdAt ? new Date(apt.createdAt).toLocaleDateString() : "-"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
