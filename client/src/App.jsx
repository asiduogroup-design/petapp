import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Services from "./pages/Services";
import DoctorsAppointment from "./pages/DoctorsAppointment";

import LoginRegister from "./pages/LoginRegister";
import UserProfile from "./pages/UserProfile";

import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function Layout({ isLoggedIn, onLogin, onLogout }) {
  const { pathname } = useLocation();
  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/services" element={<Services />} />
        <Route path="/doctors" element={<DoctorsAppointment />} />
        <Route path="/login" element={<LoginRegister onLogin={onLogin} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      {pathname !== "/login" && <Footer />}
    </>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("petapp_logged_in") === "true");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("petapp_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    if (userData) {
      localStorage.setItem("petapp_user", JSON.stringify(userData));
      setUser(userData);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("petapp_logged_in");
    localStorage.removeItem("petapp_token");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Layout isLoggedIn={isLoggedIn} user={user} onLogin={handleLogin} onLogout={handleLogout} />
    </BrowserRouter>
  );
}
