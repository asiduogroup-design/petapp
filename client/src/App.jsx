import { useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Services from "./pages/Services";
import DoctorsAppointment from "./pages/DoctorsAppointment";
import LoginRegister from "./pages/LoginRegister";
import UserProfile from "./pages/UserProfile";

function Layout({ isLoggedIn, user, authToken, onLogin, onLogout }) {
  const { pathname } = useLocation();

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} />
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
          path="/user"
          element={<UserProfile isLoggedIn={isLoggedIn} user={user} authToken={authToken} />}
        />
        <Route
          path="/user/orders"
          element={<UserProfile isLoggedIn={isLoggedIn} user={user} authToken={authToken} />}
        />
        <Route
          path="/user/appointments"
          element={<UserProfile isLoggedIn={isLoggedIn} user={user} authToken={authToken} />}
        />
      </Routes>
      {pathname !== "/login" && <Footer />}
    </>
  );
}

export default function App() {
  const [authToken, setAuthToken] = useState("");
  const [user, setUser] = useState(null);
  const isLoggedIn = Boolean(authToken && user);

  const handleLogin = ({ token, user: nextUser }) => {
    setAuthToken(token || "");
    setUser(nextUser || null);
  };

  const handleLogout = () => {
    setAuthToken("");
    setUser(null);
  };

  return (
    <BrowserRouter>
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
