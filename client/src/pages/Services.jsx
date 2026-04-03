import { useState } from "react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: "✂️",
    name: "Pet Grooming",
    desc: "Our certified groomers handle bathing, trimming, nail clipping, ear cleaning, and breed-specific styling for dogs, cats, and small pets.",
    price: "from ₹1,200",
    duration: "60–90 min",
    highlight: true,
  },
  {
    icon: "💉",
    name: "Vaccination",
    desc: "Keep your pet protected with full vaccination schedules for dogs, cats, and small animals — including rabies, DHPP, FeLV, and more.",
    price: "from ₹1,500",
    duration: "20 min",
  },
  {
    icon: "🦷",
    name: "Dental Care",
    desc: "Prevent periodontal disease with professional dental cleaning, polishing, and oral health assessments by our specialist vets.",
    price: "from ₹2,000",
    duration: "45 min",
  },
  {
    icon: "🏥",
    name: "Emergency Care",
    desc: "Round-the-clock emergency veterinary care for critical situations. Walk-ins welcome. We are always here when your pet needs us most.",
    price: "Call for rates",
    duration: "Varies",
  },
  {
    icon: "🍽️",
    name: "Nutrition Counseling",
    desc: "Personalized meal plans and dietary advice tailored to your pet's breed, age, and health condition by certified animal nutritionists.",
    price: "from ₹2,500",
    duration: "30 min",
  },
  {
    icon: "🧠",
    name: "Behaviour Training",
    desc: "From puppy basics to advanced obedience, our trainers use positive reinforcement techniques to help your pet become their best self.",
    price: "from ₹3,000",
    duration: "1 hr",
  },
];

const steps = [
  { n: "1", title: "Choose a Service", desc: "Browse our list and pick the service your pet needs." },
  { n: "2", title: "Select a Doctor", desc: "Choose from our verified veterinary professionals." },
  { n: "3", title: "Book Appointment", desc: "Pick a convenient date and time online." },
  { n: "4", title: "Visit & Get Care", desc: "Bring your pet in and let our team do the rest." },
];

const faqs = [
  {
    q: "How do I prepare my pet for a grooming session?",
    a: "Ensure your pet has been exercised and is calm. Bring any specific product requests and inform us of any skin sensitivities or allergies before the session.",
  },
  {
    q: "Do I need an appointment for emergency care?",
    a: "No. Walk-ins are always welcome for our emergency care service. We are available 24/7 for critical cases — just come in or call ahead.",
  },
  {
    q: "What vaccinations does my puppy need?",
    a: "Puppies typically need DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza), Rabies, and Bordetella. Our vet will create a customised schedule based on your pet's age and lifestyle.",
  },
  {
    q: "How often should my pet visit the vet?",
    a: "Healthy adult pets should visit at least once a year for a wellness check. Senior pets or those with health conditions should visit every 6 months.",
  },
  {
    q: "Can I bring multiple pets in one visit?",
    a: "Yes! We encourage multi-pet visits. Please let us know when booking so we can allocate enough time for all your furry family members.",
  },
];

export default function Services() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <div className="page-banner">
        <div className="container">
          <h1>🏥 Our Services</h1>
          <p>Comprehensive pet care — from grooming to emergency treatment — all under one roof.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          <p className="section-sub">Expert care designed around your pet's unique needs</p>
          <div className="services-grid">
            {services.map((s, i) => (
              <div key={i} className={`service-card${s.highlight ? " service-highlight" : ""}`}>
                <span className="service-icon">{s.icon}</span>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
                <div
                  style={{
                    marginTop: "0.75rem",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <span>⏱ {s.duration}</span>
                  <span className="service-price">{s.price}</span>
                </div>
                <Link
                  to="/doctors"
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: "1rem", width: "100%", justifyContent: "center", borderRadius: "8px" }}
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Getting started is simple</p>
          <div className="services-process">
            {steps.map((step) => (
              <div key={step.n} className="process-step">
                <div className="step-num">{step.n}</div>
                <h3>{step.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "0.4rem" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: "780px" }}>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-sub">Got questions? We have answers.</p>
          <div className="faq">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <span>{openFaq === i ? "▲" : "▼"}</span>
                </button>
                {openFaq === i && <div className="faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
