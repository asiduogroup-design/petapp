import { Navigate } from "react-router-dom";

export default function UserProfile({ isLoggedIn, user }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const profile = user || {
    name: "Kalyan",
    email: "kalyan@example.com",
    phone: "+91 0000000000",
  };

  return (
    <section className="section user-page">
      <div className="container">
        <div className="user-card">
          <div className="user-hero">
            <div className="user-avatar">👤</div>
            <div>
              <h2>{profile.name}</h2>
              <p>Your PetCare account details and profile overview.</p>
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

            <div className="user-note">
              This page is ready for future additions like appointment history, pets, and orders.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}