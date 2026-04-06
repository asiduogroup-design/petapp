import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/services", label: "Services" },
  { to: "/doctors", label: "Doctors" },
];

export default function Navbar({ isLoggedIn, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-inner">
          <Link to="/" className="nav-logo" onClick={() => setOpen(false)}>
            <img
              src="https://res.cloudinary.com/dlx9tnj7p/image/upload/v1775200169/Kalyaan_Pet_Shop_logo_design_qxfec5.png"
              alt="Kalyan Pet Shop"
              className="nav-logo-image"
              loading="eager"
              referrerPolicy="no-referrer"
            />
          </Link>

          <ul className={`nav-menu${open ? " open" : ""}`}>
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {isLoggedIn ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onLogout();
                  setOpen(false);
                }}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                Login
              </Link>
            )}
            <button
              className="hamburger"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
