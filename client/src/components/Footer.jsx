import { Link } from "react-router-dom";

const clinicDetails = {
  name: "Kalyan Pets & Clinic",
  addressLine1: "Doo No :43-106-19, Near Sai Baba Temple",
  addressLine2: "Beside Apollo Pharmacy, Nuzvid Main Road, P&T Colony",
  cityLine: "Singh Nagar, Vijayawada - 520015, Andhra Pradesh",
  hours: "Mon-Sun: 9:00 AM - 10:00 PM",
  specialties: "Pet Clinic, Veterinary Care, Pet Food, Dog Accessories",
  mapUrl: "https://maps.google.com/?q=16.5416181,80.6375518",
  listingUrl:
    "https://www.justdial.com/Vijayawada/Kalyan-Pets-Clinic-Near-Sai-Baba-Temple-Beside-Apollo-Pharmacy-Singh-Nagar/0866PX866-X866-230803161734-T1Q8_BZDET",
};

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
              <span className="nav-logo-text">PetCare</span>
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
            <h4>Contact Us</h4>
            <ul>
              <li>{clinicDetails.name}</li>
              <li>{clinicDetails.addressLine1}</li>
              <li>{clinicDetails.addressLine2}</li>
              <li>{clinicDetails.cityLine}</li>
              <li>{clinicDetails.hours}</li>
              <li>{clinicDetails.specialties}</li>
              <li>
                <a href={clinicDetails.mapUrl} target="_blank" rel="noreferrer">
                  View on Google Maps
                </a>
              </li>
              <li>
                <a href={clinicDetails.listingUrl} target="_blank" rel="noreferrer">
                  View business listing
                </a>
              </li>
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
