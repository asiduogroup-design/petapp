import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import foodCategoryImage from "../assets/hero/food-category.svg";
import toysCategoryImage from "../assets/hero/toys-category.svg";
import medicinesCategoryImage from "../assets/hero/medicines-category.svg";
import clothingCategoryImage from "../assets/hero/clothing-category.svg";
import accessoriesCategoryImage from "../assets/hero/accessories-category.svg";

const offers = [
  {
    gradient: "linear-gradient(135deg,#0d9488,#0ea5e9)",
    badge: "📦 Free Shipping",
    title: "Free Delivery on Orders Over ₹2000",
    desc: "Get premium pet food and accessories delivered straight to your door at no extra cost.",
    cta: "Shop Now",
    to: "/products",
    emoji: "🚚",
  },
  {
    gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
    badge: "💉 Health Deal",
    title: "Free Checkup With Every Vaccination",
    desc: "Book a vaccination appointment and receive a complimentary health check for your pet.",
    cta: "Book Now",
    to: "/doctors",
    emoji: "💉",
  },
  {
    gradient: "linear-gradient(135deg,#8b5cf6,#ec4899)",
    badge: "✂️ Grooming",
    title: "10% Off Your First Grooming Session",
    desc: "New customers receive a special discount on our professional grooming service.",
    cta: "Learn More",
    to: "/services",
    emoji: "✂️",
  },
  {
    gradient: "linear-gradient(135deg,#14b8a6,#0f766e)",
    badge: "🎉 Seasonal Offer",
    title: "Flat 20% Off on All Pet Medicines",
    desc: "Get discounts on essential pet medications and health supplements for the season.",
    cta: "Shop Now",
    to: "/products",
    emoji: "💊",
  },
];

const products = [
  { id: 1, emoji: "🦴", name: "Premium Dog Kibble", cat: "Dog Food", price: "₹899", stars: "★★★★★" },
  { id: 2, emoji: "🐟", name: "Tuna & Shrimp Cat Treats", cat: "Cat Food", price: "₹349", stars: "★★★★☆" },
  { id: 3, emoji: "🐾", name: "Paw-Print Collar", cat: "Accessory", price: "₹599", stars: "★★★★★" },
  { id: 4, emoji: "🏡", name: "Orthopedic Pet Bed", cat: "Beds", price: "₹1,599", stars: "★★★★☆" },
  { id: 5, emoji: "🎾", name: "Interactive Fetch Ball", cat: "Toys", price: "₹399", stars: "★★★★★" },
  { id: 6, emoji: "💊", name: "Daily Multivitamin Chews", cat: "Health", price: "₹1,099", stars: "★★★★☆" },
];

const services = [
  { icon: "✂️", name: "Pet Grooming", desc: "Professional bathing, trimming, and breed-specific styling for all pets.", price: "from ₹1,200" },
  { icon: "💉", name: "Vaccination", desc: "Complete vaccination programs to keep your pets safe and healthy.", price: "from ₹1,500" },
  { icon: "🦷", name: "Dental Care", desc: "Professional dental cleaning and oral health assessments by expert vets.", price: "from ₹2,000" },
  { icon: "🏥", name: "Emergency Care", desc: "Round-the-clock emergency veterinary services when you need them most.", price: "Call for rates" },
];

const doctors = [
  { id: 1, avatar: "👨‍⚕️", name: "Dr. doctor1", spec: "General Veterinarian", exp: "12 yrs exp", rating: "★★★★★ 4.9", avail: "Mon–Fri" },
  { id: 2, avatar: "👩‍⚕️", name: "Dr. doctor2", spec: "Animal Surgeon", exp: "9 yrs exp", rating: "★★★★★ 4.8", avail: "Mon–Sat" },
  { id: 3, avatar: "👨‍⚕️", name: "Dr. doctor3", spec: "Pet Behaviourist", exp: "7 yrs exp", rating: "★★★★☆ 4.6", avail: "Tue–Sat" },
];

const heroSlides = [
  {
    badge: "�️ Pet Products & Accessories",
    title: "Everything Your Pet",
    highlight: "Needs & Wants",
    desc: "Shop premium food, medicines, toys, clothing, and accessories for all your beloved pets.",
    cta: "Shop Now",
    to: "/products",
    stats: [
      { value: "500+", label: "Products" },
      { value: "50+", label: "Brands" },
    ],
    visualHeading: "Product Categories",
    visuals: [
      { image: foodCategoryImage, label: "Food" },
      { image: toysCategoryImage, label: "Toys" },
      { image: medicinesCategoryImage, label: "Medicines" },
      { image: clothingCategoryImage, label: "Clothing" },
      { image: accessoriesCategoryImage, label: "Accessories" },
    ],
  },
  {
    badge: "✂️ Complete Care Services",
    title: "Professional Services For",
    highlight: "Every Pet Need",
    desc: "From grooming and vaccinations to dental and emergency care, everything is handled by experts.",
    cta: "Book Now",
    to: "/services",
    stats: [
      { value: `${services.length}+`, label: "Service Types" },
      { value: "24/7", label: "Support" },
    ],
    visualHeading: "Popular Services",
    visuals: [
      { image: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=300&q=80", label: "Vaccination" },
      { image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=300&q=80", label: "Grooming" },
      { image: "https://images.unsplash.com/photo-1558929996-da64ba858215?auto=format&fit=crop&w=300&q=80", label: "Spa Bath" },
      { image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=300&q=80", label: "Dental" },
      { image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=300&q=80", label: "Emergency" },
    ],
  },
  {
    badge: "🩺 Trusted Vet Network",
    title: "Fast Doctor Booking For",
    highlight: "Healthy Pets",
    desc: "Schedule consultations with experienced veterinarians for routine checkups and urgent concerns.",
    cta: "Book Vet Now",
    to: "/doctors",
    stats: [
      { value: `${doctors.length}+`, label: "Expert Vets" },
      { value: "1,200+", label: "Appointments Monthly" },
    ],
    visualHeading: "Vet Care In Action",
    visuals: [
      { image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=300&q=80", label: "Consultation" },
      { image: "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&w=300&q=80", label: "Checkup" },
      { image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80", label: "Dog Care" },
      { image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80", label: "Cat Care" },
      { image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=300&q=80", label: "Treatment" },
    ],
  },
];

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const onTouchStart = (e) => {
    setTouchStartX(e.changedTouches[0].clientX);
  };

  const onTouchEnd = (e) => {
    if (touchStartX === null) {
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const diff = touchStartX - endX;
    const swipeThreshold = 50;

    if (diff > swipeThreshold) {
      nextSlide();
    } else if (diff < -swipeThreshold) {
      prevSlide();
    }

    setTouchStartX(null);
  };

  const currentSlide = heroSlides[activeSlide];

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="hero-slide" key={activeSlide}>
            <div className="hero-layout">
              <div className="hero-copy">
                <span className="hero-badge">{currentSlide.badge}</span>
                <h1 className="hero-headline">
                  {currentSlide.title} <span>{currentSlide.highlight}</span>
                </h1>
                <p>{currentSlide.desc}</p>

                <div className="hero-btns">
                  <Link to={currentSlide.to} className="btn btn-accent">
                    {currentSlide.cta}
                  </Link>
                </div>

                <div className="hero-stats">
                  {currentSlide.stats.map((stat) => (
                    <div className="hero-stat" key={stat.label}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hero-visual" aria-hidden="true">
                <p className="hero-visual-title">{currentSlide.visualHeading}</p>
                <div className="hero-visual-grid">
                  {currentSlide.visuals.map((item) => (
                    <div className="hero-visual-item" key={item.label}>
                      <img
                        src={item.image}
                        alt={item.label}
                        className="hero-visual-image"
                        loading="lazy"
                      />
                      <span className="hero-visual-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hero-controls" aria-label="Hero carousel controls">
            <button type="button" className="hero-arrow" onClick={prevSlide} aria-label="Previous slide">
              ←
            </button>
            <div className="hero-dots">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.badge}
                  type="button"
                  className={`hero-dot${index === activeSlide ? " active" : ""}`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button type="button" className="hero-arrow" onClick={nextSlide} aria-label="Next slide">
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Offers() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Special Offers</h2>
        <p className="section-sub">Exclusive deals crafted for you and your beloved pets</p>
        <div className="offers-grid">
          {offers.map((offer, i) => (
            <div
              key={i}
              className="offer-card"
              style={{ background: offer.gradient }}
              data-emoji={offer.emoji}
            >
              <span className="offer-badge">{offer.badge}</span>
              <h3>{offer.title}</h3>
              <p>{offer.desc}</p>
              <Link to={offer.to} className="btn btn-sm">
                {offer.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductsSection() {
  return (
    <section className="section section-alt">
      <div className="container">
        <h2 className="section-title">Popular Products</h2>
        <p className="section-sub">Hand-picked essentials for happy, healthy pets</p>
        <div className="products-grid home-products-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <div className="product-img">{p.emoji}</div>
              <div className="product-body">
                <span className="product-cat">{p.cat}</span>
                <p className="product-name">{p.name}</p>
                <p className="product-star">{p.stars}</p>
                <p className="product-price">{p.price}</p>
                <div className="product-actions">
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all-wrap">
          <Link to="/products" className="btn btn-outline">
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Our Services</h2>
        <p className="section-sub">Professional care services for every kind of pet</p>
        <div className="services-grid">
          {services.map((s, i) => (
            <div key={i} className={`service-card${s.highlight ? " service-highlight" : ""}`}>
              <span className="service-icon">{s.icon}</span>
              <h3>{s.name}</h3>
              <p>{s.desc}</p>
              <span className="service-price">{s.price}</span>
            </div>
          ))}
        </div>
        <div className="view-all-wrap">
          <Link to="/services" className="btn btn-outline">
            Explore All Services →
          </Link>
        </div>
      </div>
    </section>
  );
}

function DoctorsSection() {
  const navigate = useNavigate();

  const handleBookAppointment = (doctor) => {
    navigate("/doctors", { state: { selectedDoctor: doctor } });
  };

  return (
    <section className="section section-alt">
      <div className="container">
        <h2 className="section-title">Meet Our Doctors</h2>
        <p className="section-sub">Certified veterinary professionals dedicated to your pet's health</p>
        <div className="doctors-grid">
          {doctors.map((d) => (
            <div key={d.id} className="doctor-card">
              <div className="doctor-avatar">{d.avatar}</div>
              <h3 className="doctor-name">{d.name}</h3>
              <p className="doctor-spec">{d.spec}</p>
              <p className="doctor-rating">{d.rating}</p>
              <p className="doctor-info">
                {d.exp} · Available {d.avail}
              </p>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => handleBookAppointment(d)}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
        <div className="view-all-wrap">
          <Link to="/doctors" className="btn btn-outline">
            View All Doctors →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Offers />
      <ProductsSection />
      <ServicesSection />
      <DoctorsSection />
    </>
  );
}
