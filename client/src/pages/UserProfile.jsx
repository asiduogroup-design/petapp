import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { apiRequest } from "../lib/api";

const formatDateTime = (value) => {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value) => {
  if (!value) return "Not selected";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const parseAppointmentDateTime = (appointment) => {
  if (!appointment?.date) return null;

  const baseDate = new Date(appointment.date);
  if (Number.isNaN(baseDate.getTime())) return null;

  const match = String(appointment.time || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    baseDate.setHours(0, 0, 0, 0);
    return baseDate;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  baseDate.setHours(hours, minutes, 0, 0);
  return baseDate;
};

const getAppointmentStatus = (appointment) => {
  if (appointment?.status === "Canceled") return "Canceled";
  if (!appointment?.date) return "Booked";

  const appointmentDateTime = parseAppointmentDateTime(appointment);
  if (!appointmentDateTime) return "Booked";

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const visitDate = new Date(appointmentDateTime);
  visitDate.setHours(0, 0, 0, 0);

  if (appointmentDateTime < now) return "Completed";
  if (visitDate.getTime() === today.getTime()) return "Today";
  return "Booked";
};

const getBadgeClass = (status) => {
  if (status === "Completed") return "history-badge completed";
  if (status === "Canceled") return "history-badge canceled";
  if (status === "Today") return "history-badge today";
  return "history-badge";
};

const canCancelAppointment = (appointment, now) => {
  if (!appointment || appointment.status === "Canceled") return false;

  const appointmentDateTime = parseAppointmentDateTime(appointment);
  if (!appointmentDateTime) return false;

  return appointmentDateTime.getTime() - now.getTime() > 60 * 60 * 1000;
};

export default function UserProfile({ isLoggedIn, user, authToken }) {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const profile = user || {
    name: "Kalyan",
    email: "kalyan@example.com",
    phone: "+91 0000000000",
  };

  const activePage = location.pathname.endsWith("/orders")
    ? "orders"
    : location.pathname.endsWith("/appointments")
      ? "appointments"
      : "overview";

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (!authToken || !isLoggedIn) {
        if (!isMounted) return;
        setOrders([]);
        setAppointments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const [ordersResponse, appointmentsResponse] = await Promise.all([
          apiRequest("/orders", { token: authToken }),
          apiRequest("/appointments", { token: authToken }),
        ]);

        if (!isMounted) return;

        setOrders(ordersResponse.orders || []);
        setAppointments(appointmentsResponse.appointments || []);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [authToken]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { appointment } = await apiRequest(`/appointments/${appointmentId}/cancel`, {
        method: "PATCH",
        token: authToken,
      });

      setAppointments((currentAppointments) =>
        currentAppointments.map((currentAppointment) =>
          currentAppointment._id === appointment._id ? appointment : currentAppointment
        )
      );
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <section className="section user-page">
      <div className="container">
        <div className="user-card">
          <div className="user-hero">
            <div className="user-avatar">👤</div>
            <div>
              <h2>{profile.name}</h2>
              <p>Your PetCare account details, orders, and appointment history.</p>
            </div>
          </div>

          <div className="user-body">
            <div className="user-info-grid">
              <div className="user-info-card">
                <span>Full Name</span>
                <strong>{profile.name}</strong>
              </div>
              <div className="user-info-card">
                <span>Email</span>
                <strong>{profile.email}</strong>
              </div>
              <div className="user-info-card">
                <span>Phone Number</span>
                <strong>{profile.phone}</strong>
              </div>
              <div className="user-info-card">
                <span>Status</span>
                <strong>Logged In</strong>
              </div>
            </div>

            <div className="user-nav-grid">
              <Link
                to="/user/orders"
                className={`user-nav-card${activePage === "orders" ? " active" : ""}`}
              >
                <div>
                  <h3>Orders</h3>
                  <p>Open your product order history.</p>
                </div>
                <span className="user-count">{orders.length}</span>
              </Link>

              <Link
                to="/user/appointments"
                className={`user-nav-card${activePage === "appointments" ? " active" : ""}`}
              >
                <div>
                  <h3>Doctor Appointments</h3>
                  <p>See booked, today, and completed visits.</p>
                </div>
                <span className="user-count">{appointments.length}</span>
              </Link>
            </div>

            {activePage === "overview" && (
              <div className="user-overview-note">
                Choose `Orders` or `Doctor Appointments` above to open the full history page.
              </div>
            )}

            {activePage === "orders" && (
              <div className="user-history-card">
                <div className="user-section-head">
                  <div>
                    <h3>Orders History</h3>
                    <p>Your old and recent product orders are shown here.</p>
                  </div>
                  <Link to="/user" className="user-back-link">
                    Back to Profile
                  </Link>
                </div>

                {loading ? (
                  <div className="user-empty-state">Loading orders...</div>
                ) : loadError ? (
                  <div className="user-empty-state">{loadError}</div>
                ) : orders.length === 0 ? (
                  <div className="user-empty-state">
                    No order history found yet. Add a product from the products page and it will appear here.
                  </div>
                ) : (
                  <div className="user-history-list">
                    {orders.map((order) => (
                      <article key={order._id} className="history-item">
                        <div className="history-item-top">
                          <div className="history-title-wrap">
                            <span className="history-emoji">{order.emoji}</span>
                            <div>
                              <h4>{order.productName}</h4>
                              <p>{order.category}</p>
                            </div>
                          </div>
                          <span className="history-badge completed">Completed</span>
                        </div>
                        <div className="history-meta">
                          <span>Brand: {order.brand}</span>
                          <span>Size: {order.size}</span>
                          <span>Price: ₹{Number(order.price).toLocaleString("en-IN")}</span>
                          <span>Ordered On: {formatDateTime(order.orderedAt)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activePage === "appointments" && (
              <div className="user-history-card">
                <div className="user-section-head">
                  <div>
                    <h3>Doctor Appointment History</h3>
                    <p>Future booked visits and already completed appointments are shown here.</p>
                  </div>
                  <Link to="/user" className="user-back-link">
                    Back to Profile
                  </Link>
                </div>

                {loading ? (
                  <div className="user-empty-state">Loading appointments...</div>
                ) : loadError ? (
                  <div className="user-empty-state">{loadError}</div>
                ) : appointments.length === 0 ? (
                  <div className="user-empty-state">
                    No appointment history found yet. Book a doctor appointment and it will appear here.
                  </div>
                ) : (
                  <div className="user-history-list">
                    {appointments.map((appointment) => {
                      const status = getAppointmentStatus(appointment);
                      const isCancelable = canCancelAppointment(appointment, now);

                      return (
                        <article key={appointment._id} className="history-item">
                          <div className="history-item-top">
                            <div className="history-title-wrap">
                              <span className="history-emoji">🩺</span>
                              <div>
                                <h4>{appointment.doctor}</h4>
                                <p>{appointment.petName} · {appointment.petType}</p>
                              </div>
                            </div>
                            <span className={getBadgeClass(status)}>{status}</span>
                          </div>
                          <div className="history-meta">
                            <span>Date: {formatDate(appointment.date)}</span>
                            <span>Time: {appointment.time || "Not selected"}</span>
                            <span>Booked On: {formatDateTime(appointment.bookedAt)}</span>
                            {appointment.canceledAt && (
                              <span>Canceled On: {formatDateTime(appointment.canceledAt)}</span>
                            )}
                            <span>Issue: {appointment.issue || "No issue details added"}</span>
                          </div>
                          <div className="history-actions">
                            <button
                              type="button"
                              className="btn btn-sm history-cancel-btn"
                              onClick={() => cancelAppointment(appointment._id)}
                              disabled={!isCancelable}
                              title={
                                isCancelable
                                  ? "Cancel appointment"
                                  : "Appointments cannot be canceled within 1 hour of the visit"
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
