import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Services from "./pages/Services";
import DoctorsAppointment from "./pages/DoctorsAppointment";
import LoginRegister from "./pages/LoginRegister";
import AdminDashboard from "./pages/AdminDashboard";
import { Navigate } from "react-router-dom";


function Layout({ isLoggedIn, user, authToken, onLogin, onLogout }) {
  const { pathname } = useLocation();
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products isLoggedIn={isLoggedIn} authToken={authToken} />} />
        <Route path="/services" element={<Services />} />
        <Route
          path="/doctors"
          element={<DoctorsAppointment isLoggedIn={isLoggedIn} user={user} authToken={authToken} />}
        />
        <Route path="/login" element={<LoginRegister onLogin={onLogin} />} />
        <Route
          path="/admin"
          element={
            user && user.role === "admin" ? (
              <AdminDashboard />
            ) : user ? (
              <Navigate to="/user" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      {pathname !== "/login" && <Footer />}
    </>
  );
}
  const [authToken, setAuthToken] = useState("");
  const [user, setUser] = useState(null);
  const [showTimeout, setShowTimeout] = useState(false);
  const inactivityTimer = useRef(null);
  const isLoggedIn = Boolean(authToken && user);

  // Persist session on refresh
  useEffect(() => {
    const token = localStorage.getItem("petapp_token");
    if (token && !authToken) {
      setAuthToken(token);
      // Optionally, fetch user info with token here if needed
    }
    // eslint-disable-next-line
  }, []);

  // Inactivity auto-logout logic
  useEffect(() => {
    if (!isLoggedIn) return;
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        setShowTimeout(true);
        handleLogout();
      }, 15 * 60 * 1000); // 15 minutes
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isLoggedIn]);

  const handleLogin = ({ token, user: nextUser }) => {
    setAuthToken(token || "");
    setUser(nextUser || null);
    if (token) {
      localStorage.setItem("petapp_token", token);
    }
  };

  const handleLogout = () => {
    setAuthToken("");
    setUser(null);
    localStorage.removeItem("petapp_token");
  };

  // Session timeout modal
  function SessionTimeoutModal() {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
      }}>
        <div style={{ background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 2px 16px #3332", minWidth: 320, textAlign: "center" }}>
          <h2>Session Timed Out</h2>
          <p>Your session has expired due to inactivity.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
            <button onClick={() => { setShowTimeout(false); window.location.href = "/"; }} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "#007bff", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Go to Home</button>
            <button onClick={() => { setShowTimeout(false); window.location.href = "/login"; }} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: "#28a745", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Login Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {showTimeout && <SessionTimeoutModal />}
      <Layout
        isLoggedIn={isLoggedIn}
        user={user}
        authToken={authToken}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </BrowserRouter>
  );
}
