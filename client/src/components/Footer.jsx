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
              <li>📍 Doo No :43-106-19, Near Sai Baba Temple, Beside Apollo Pharmacy, Nuzvid Main Road, P&t Colony, Singh Nagar, Vijayawada-520015, Andhra Pradesh</li>
              <li>
                <a
                  href="https://wa.me/918008882383"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                  aria-label="WhatsApp"
                >
                  <i className="bi bi-whatsapp" style={{ color: '#25D366', fontSize: '1.3em', marginRight: '0.3em' }}></i>
                  8008882383
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps?q=16.541611,80.637556"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#4285F4', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                  aria-label="View in Google Maps"
                >
                  <i className="bi bi-geo-alt-fill" style={{ color: '#EA4335', fontSize: '1.2em', marginRight: '0.3em' }}></i>
                  View in Google Maps
                </a>
              </li>
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
