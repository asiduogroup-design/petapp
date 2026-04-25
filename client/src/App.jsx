import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Services from "./pages/Services";
import DoctorsAppointment from "./pages/DoctorsAppointment";
import MyAppointments from "./pages/MyAppointments";
import LoginRegister from "./pages/LoginRegister";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";


function Layout({ isLoggedIn, user, authToken, onLogin, onLogout }) {
  const { pathname } = useLocation();

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} user={user} onLogout={onLogout} />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/products"
          element={<Products isLoggedIn={isLoggedIn} authToken={authToken} />}
        />

        <Route path="/services" element={<Services />} />

        <Route
          path="/doctors"
          element={
            <DoctorsAppointment
              isLoggedIn={isLoggedIn}
              user={user}
              authToken={authToken}
            />
          }
        />

        <Route
          path="/my-appointments"
          element={
            <MyAppointments
              isLoggedIn={isLoggedIn}
              authToken={authToken}
            />
          }
        />

        <Route path="/login" element={<LoginRegister onLogin={onLogin} />} />

        <Route
          path="/payment"
          element={
            user ? (
              <Payment authToken={authToken} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/payment/success"
          element={
            user ? (
              <PaymentSuccess />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/user"
          element={
            user ? (
              <Profile />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

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


function App() {

  const [authToken, setAuthToken] = useState("");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showTimeout, setShowTimeout] = useState(false);

  const inactivityTimer = useRef(null);

  const isLoggedIn = Boolean(authToken && user);

  const API_BASE = import.meta.env.VITE_API_URL || "";



  // Restore session from localStorage
  useEffect(() => {

    const token = localStorage.getItem("petapp_token");

    if (!token) {
      setLoadingUser(false);
      return;
    }

    setAuthToken(token);

    fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setUser(data);
        } else {
          localStorage.removeItem("petapp_token");
        }
      })
      .catch(() => {
        localStorage.removeItem("petapp_token");
      })
      .finally(() => {
        setLoadingUser(false);
      });

  }, []);



  // Inactivity logout timer
  useEffect(() => {

    if (!isLoggedIn) return;

    const resetTimer = () => {

      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }

      inactivityTimer.current = setTimeout(() => {
        setShowTimeout(true);
        handleLogout();
      }, 15 * 60 * 1000);

    };

    const events = ["mousemove","keydown","click","scroll","touchstart"];

    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {

      events.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );

      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }

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



  function SessionTimeoutModal() {

    return (
      <div style={{
        position:"fixed",
        top:0,
        left:0,
        width:"100vw",
        height:"100vh",
        background:"rgba(0,0,0,0.4)",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        zIndex:9999
      }}>

        <div style={{
          background:"#fff",
          padding:32,
          borderRadius:12,
          boxShadow:"0 2px 16px #3332",
          minWidth:320,
          textAlign:"center"
        }}>

          <h2>Session Timed Out</h2>

          <p>Your session has expired due to inactivity.</p>

          <div style={{
            display:"flex",
            gap:16,
            justifyContent:"center",
            marginTop:24
          }}>

            <button
              onClick={()=>{
                setShowTimeout(false);
                window.location.href="/";
              }}
            >
              Go to Home
            </button>

            <button
              onClick={()=>{
                setShowTimeout(false);
                window.location.href="/login";
              }}
            >
              Login Again
            </button>

          </div>

        </div>
      </div>
    );
  }



  // Wait until user session restored
  if (loadingUser) {
    return (
      <div style={{ textAlign:"center", marginTop:80 }}>
        Loading...
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


export default App;