import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-logo" aria-label="Kalyan Pet Shop">
              <img
                src="https://res.cloudinary.com/dlx9tnj7p/image/upload/v1775200169/Kalyaan_Pet_Shop_logo_design_qxfec5.png"
                alt="Kalyan Pet Shop"
                className="nav-logo-image"
                loading="eager"
                referrerPolicy="no-referrer"
              />
            </Link>
            <p>Your one-stop destination for premium pet products, expert care, and happy pets.</p>
            <div className="footer-socials">
              <a href="#" className="footer-social-link" aria-label="Facebook">📘</a>
              <a href="#" className="footer-social-link" aria-label="Instagram">📸</a>
              <a href="#" className="footer-social-link" aria-label="Twitter">🐦</a>
              <a href="#" className="footer-social-link" aria-label="YouTube">▶️</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/doctors">Doctors</Link></li>
              <li><Link to="/login">Login / Register</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><a href="#">Pet Grooming</a></li>
              <li><a href="#">Vaccination</a></li>
              <li><a href="#">Dental Care</a></li>
              <li><a href="#">Emergency Care</a></li>
              <li><a href="#">Nutrition Advice</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>📍 123 Pet Lane, NY 10001</li>
              <li>📞 +1 (555) 234-5678</li>
              <li>✉️ hello@petcare.com</li>
              <li>🕐 Mon–Sat: 8am – 8pm</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 PetCare. All rights reserved.</span>
          <span>Made with ❤️ for pets everywhere</span>
        </div>
      </div>
    </footer>
  );
}
