import { useState } from "react";

const doctors = [
  { id: 1, avatar: "👨‍⚕️", name: "Dr. doctor1",  spec: "General Veterinarian", exp: "12 yrs", rating: "★★★★★ 4.9", avail: "Mon–Fri",  fee: "$60" },
  { id: 2, avatar: "👩‍⚕️", name: "Dr. doctor2",     spec: "Animal Surgeon",       exp: "9 yrs",  rating: "★★★★★ 4.8", avail: "Mon–Sat",  fee: "$80" },
  { id: 3, avatar: "👨‍⚕️", name: "Dr. doctor3",   spec: "Pet Behaviourist",     exp: "7 yrs",  rating: "★★★★☆ 4.6", avail: "Tue–Sat",  fee: "$65" },
  { id: 4, avatar: "👩‍⚕️", name: "Dr. doctor4",     spec: "Dermatologist",        exp: "11 yrs", rating: "★★★★★ 4.9", avail: "Mon–Thu",  fee: "$70" },
  { id: 5, avatar: "👨‍⚕️", name: "Dr. doctor5",  spec: "Dental Specialist",    exp: "8 yrs",  rating: "★★★★☆ 4.5", avail: "Wed–Sun",  fee: "$75" },
  { id: 6, avatar: "👩‍⚕️", name: "Dr. doctor6",   spec: "Nutritionist",         exp: "6 yrs",  rating: "★★★★★ 4.7", avail: "Mon–Fri",  fee: "$55" },
];

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const blank = { name: "", phone: "", email: "", petName: "", petType: "", doctor: "", date: "", time: "", issue: "" };

export default function DoctorsAppointment() {
  const [form, setForm] = useState(blank);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.doctor) {
      setError("Please select a doctor from the list above or the dropdown.");
      return;
    }
    setSubmitted(true);
    setForm(blank);
  };

  const selectDoctor = (name, spec) => {
    setForm((prev) => ({ ...prev, doctor: `${name} — ${spec}` }));
    document.getElementById("booking-form").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="page-banner">
        <div className="container">
          <h1>🩺 Book an Appointment</h1>
          <p>Connect with certified veterinary professionals — fast, easy, and online.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Our Doctors</h2>
          <p className="section-sub">Choose your preferred veterinarian below</p>
          <div className="doctors-grid">
            {doctors.map((d) => (
              <div key={d.id} className="doctor-card">
                <div className="doctor-avatar">{d.avatar}</div>
                <h3 className="doctor-name">{d.name}</h3>
                <p className="doctor-spec">{d.spec}</p>
                <p className="doctor-rating">{d.rating}</p>
                <p className="doctor-info">
                  {d.exp} experience · {d.avail}
                </p>
                <p style={{ fontWeight: 700, color: "var(--primary)", marginBottom: "1rem" }}>
                  Consultation: {d.fee}
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => selectDoctor(d.name, d.spec)}
                >
                  Select &amp; Book
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="booking-form">
        <div className="container" style={{ maxWidth: "860px" }}>
          <h2 className="section-title">Appointment Form</h2>
          <p className="section-sub">Fill in the details below to secure your booking</p>

          {submitted && (
            <div className="success-box">
              ✅{" "}
              <span>
                <strong>Appointment booked!</strong> Our team will contact you shortly to confirm.
              </span>
            </div>
          )}

          <div className="booking-form">
            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Your Full Name *</label>
                  <input name="name" value={form.name} onChange={change} placeholder="Kalyan" required />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input name="phone" type="tel" value={form.phone} onChange={change} placeholder="+91 0000000000" required />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={change} placeholder="kalyan@example.com" required />
                </div>
                <div className="form-group">
                  <label>Pet's Name *</label>
                  <input name="petName" value={form.petName} onChange={change} placeholder="Max" required />
                </div>
                <div className="form-group">
                  <label>Pet Type *</label>
                  <select name="petType" value={form.petType} onChange={change} required>
                    <option value="">Select pet type</option>
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Bird</option>
                    <option>Rabbit</option>
                    <option>Fish</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Doctor *</label>
                  <select name="doctor" value={form.doctor} onChange={change} required>
                    <option value="">Choose a doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id}>
                        {d.name} — {d.spec}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Preferred Date *</label>
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={change}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Time *</label>
                  <select name="time" value={form.time} onChange={change} required>
                    <option value="">Pick a time</option>
                    {timeSlots.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group full">
                  <label>Describe the Issue</label>
                  <textarea
                    name="issue"
                    value={form.issue}
                    onChange={change}
                    placeholder="Briefly describe your pet's symptoms or reason for visit..."
                    rows={4}
                  />
                </div>
              </div>
              {error && (
                <p style={{ color: "var(--red)", marginTop: "0.75rem", fontWeight: 600 }}>{error}</p>
              )}
              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: "1.5rem" }}>
                Confirm Appointment →
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
