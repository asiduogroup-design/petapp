import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/services", label: "Services" },
  { to: "/doctors", label: "Doctors" },
];

export default function Navbar({ isLoggedIn, user, onLogout }) {
    console.log("Navbar user:", user);
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Logo left */}
          <Link to="/" className="nav-logo" onClick={() => setOpen(false)} style={{ marginRight: 0 }}>
            <img
              src="https://res.cloudinary.com/dlx9tnj7p/image/upload/v1775200169/Kalyaan_Pet_Shop_logo_design_qxfec5.png"
              alt="Kalyan Pet Shop"
              className="nav-logo-image"
              loading="eager"
              referrerPolicy="no-referrer"
            />
          </Link>
          {/* Hamburger right */}
          <button
            className="hamburger"
            style={{ marginLeft: "auto", marginRight: 0 }}
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span style={{ backgroundColor: "#007bff", display: "block", height: "3px", width: "25px", margin: "4px 0" }} />
            <span style={{ backgroundColor: "#007bff", display: "block", height: "3px", width: "25px", margin: "4px 0" }} />
            <span style={{ backgroundColor: "#007bff", display: "block", height: "3px", width: "25px", margin: "4px 0" }} />
          </button>
        </div>
        {/* Mobile menu overlay */}
        <ul className={`nav-menu${open ? " open" : ""}`} style={{ position: open ? 'absolute' : undefined, top: 70, left: 0, right: 0, background: '#fff', zIndex: 1000, flexDirection: 'column', alignItems: 'center', display: open ? 'flex' : 'none', boxShadow: open ? '0 2px 16px #3332' : undefined }}>
          {navLinks.map((link) => (
            <li key={link.to} style={{ width: '100%', textAlign: 'center', margin: '0.5rem 0' }}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '0.75rem 0', fontSize: '1.1rem' }}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          {/* Admin link only for admin role */}
          {user && user.role === "admin" && (
            <li style={{ width: '100%', textAlign: 'center', margin: '0.5rem 0' }}>
              <NavLink
                to="/admin"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '0.75rem 0', fontSize: '1.1rem', background: '#ccfbf1', borderRadius: 8 }}
              >
                Admin
              </NavLink>
            </li>
          )}
          {/* Always show login/logout in mobile menu */}
          <li style={{ width: '100%', textAlign: 'center', margin: '0.5rem 0' }}>
            {isLoggedIn ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ width: '90%', margin: '0.5rem auto' }}
                onClick={() => {
                  onLogout();
                  setOpen(false);
                }}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" style={{ width: '90%', margin: '0.5rem auto', display: 'inline-block' }} onClick={() => setOpen(false)}>
                Login
              </Link>
            )}
          </li>
        </ul>
        {/* Desktop nav actions (hidden on mobile) */}
        <div className="nav-actions" style={{ display: 'none' }} />
      </div>
    </nav>
  );
}
