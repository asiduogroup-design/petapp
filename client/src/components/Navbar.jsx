import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/services", label: "Services" },
  { to: "/doctors", label: "Doctors" },
];

export default function Navbar({ isLoggedIn, user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncCounts = () => {
      try {
        const wishlistRaw = localStorage.getItem("petapp_wishlist");
        const wishlist = wishlistRaw ? JSON.parse(wishlistRaw) : [];
        setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
      } catch (_err) {
        setWishlistCount(0);
      }

      try {
        const cartRaw = localStorage.getItem("petapp_cart");
        const cart = cartRaw ? JSON.parse(cartRaw) : [];
        const count = Array.isArray(cart)
          ? cart.reduce((sum, item) => sum + Number(item?.quantity || 0), 0)
          : 0;
        setCartCount(count);
      } catch (_err) {
        setCartCount(0);
      }
    };

    syncCounts();
    window.addEventListener("storage", syncCounts);
    window.addEventListener("petapp:storage-updated", syncCounts);

    return () => {
      window.removeEventListener("storage", syncCounts);
      window.removeEventListener("petapp:storage-updated", syncCounts);
    };
  }, []);

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
            {/* Admin link only for admin role */}
            {user && user.role === "admin" && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => (isActive ? "active" : "")}
                  onClick={() => setOpen(false)}
                >
                  Admin
                </NavLink>
              </li>
            )}
            {user && user.role !== "admin" && (
              <>
                <li>
                  <NavLink
                    to="/user"
                    className={({ isActive }) => (isActive ? "active" : "")}
                    onClick={() => setOpen(false)}
                  >
                    My Account
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/my-appointments"
                    className={({ isActive }) => (isActive ? "active" : "")}
                    onClick={() => setOpen(false)}
                  >
                    My Appointments
                  </NavLink>
                </li>
              </>
            )}
            {/* Login/Logout for mobile */}
            <li className="nav-mobile-action">
              {isLoggedIn ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onLogout();
                    setOpen(false);
                  }}
                  style={{ width: "100%" }}
                >
                  Logout
                </button>
              ) : (
                <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setOpen(false)} style={{ width: "100%" }}>
                  Login
                </Link>
              )}
            </li>
          </ul>

          <div className="nav-actions">
            {isLoggedIn && user && user.role !== "admin" && (
              <>
                <Link to="/user?section=wishlist" className="nav-icon-link" title="Wishlist" onClick={() => setOpen(false)}>
                  <FaHeart />
                  {wishlistCount > 0 && <span className="nav-icon-badge">{wishlistCount}</span>}
                </Link>
                <Link to="/user?section=cart" className="nav-icon-link" title="Cart" onClick={() => setOpen(false)}>
                  <FaShoppingCart />
                  {cartCount > 0 && <span className="nav-icon-badge">{cartCount}</span>}
                </Link>
              </>
            )}
            {/* Desktop only */}
            {isLoggedIn ? (
              <button
                type="button"
                className="btn btn-primary btn-sm nav-desktop-action"
                onClick={() => {
                  onLogout();
                  setOpen(false);
                }}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm nav-desktop-action" onClick={() => setOpen(false)}>
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
