import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../lib/api";

const doctors = [
  { id: 1, avatar: "👨‍⚕️", name: "Dr. doctor1", spec: "General Veterinarian", exp: "12 yrs", rating: "★★★★★ 4.9", avail: "Mon-Fri", fee: "₹4,500" },
  { id: 2, avatar: "👩‍⚕️", name: "Dr. doctor2", spec: "Animal Surgeon", exp: "9 yrs", rating: "★★★★★ 4.8", avail: "Mon-Sat", fee: "₹6,000" },
  { id: 3, avatar: "👨‍⚕️", name: "Dr. doctor3", spec: "Pet Behaviourist", exp: "7 yrs", rating: "★★★★☆ 4.6", avail: "Tue-Sat", fee: "₹5,000" },
  { id: 4, avatar: "👩‍⚕️", name: "Dr. doctor4", spec: "Dermatologist", exp: "11 yrs", rating: "★★★★★ 4.9", avail: "Mon-Thu", fee: "₹5,500" },
  { id: 5, avatar: "👨‍⚕️", name: "Dr. doctor5", spec: "Dental Specialist", exp: "8 yrs", rating: "★★★★☆ 4.5", avail: "Wed-Sun", fee: "₹5,800" },
  { id: 6, avatar: "👩‍⚕️", name: "Dr. doctor6", spec: "Nutritionist", exp: "6 yrs", rating: "★★★★★ 4.7", avail: "Mon-Fri", fee: "₹4,000" },
];

// Generate 15-minute time slots from 8 AM to 8 PM (48 slots total)
function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const displayHour = hour > 12 ? hour - 12 : hour;
      const period = hour >= 12 ? "PM" : "AM";
      const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const displayTime = `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
      slots.push({ time: timeStr, display: displayTime });
    }
  }
  return slots;
}

function normalizeTimeSlot(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.trim();

  if (/^\d{2}:\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const match = trimmedValue.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!match) {
    return trimmedValue;
  }

  let [, hourText, minuteText, periodText] = match;
  let hour = Number(hourText);
  const period = periodText.toUpperCase();

  if (period === "AM") {
    hour = hour === 12 ? 0 : hour;
  } else {
    hour = hour === 12 ? 12 : hour + 12;
  }

  return `${String(hour).padStart(2, "0")}:${minuteText}`;
}

const getInitialForm = (user) => ({
  name: user?.name || "",
  phone: user?.phone || "",
  email: user?.email || "",
  petName: "",
  petType: "",
  numberOfPets: "",
  doctor: "",
  date: "",
  timeSlot: "",
  issue: "",
});

export default function DoctorsAppointment({ isLoggedIn, user, authToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(() => getInitialForm(user));
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const allSlots = generateTimeSlots();

  useEffect(() => {
    // Pre-select doctor if passed from Home page
    if (location.state?.selectedDoctor) {
      const doctor = location.state.selectedDoctor;
      setForm((prev) => ({ 
        ...prev, 
        doctor: `${doctor.name} - ${doctor.spec}` 
      }));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
    }));
  }, [user]);

  // Fetch available slots when doctor or date changes
  useEffect(() => {
    if (form.doctor && form.date) {
      fetchAvailableSlots();
    }
  }, [form.doctor, form.date]);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      // Use full doctor name as stored in database
      const doctorName = form.doctor; // Keep full name like "Dr. doctor1 - General Veterinarian"
      const data = await apiRequest(
        `/appointments/available/${encodeURIComponent(doctorName)}/${form.date}`
      );
      setAvailableSlots((data.availableSlots || []).map(normalizeTimeSlot));
      setBookedSlots((data.bookedSlots || []).map(normalizeTimeSlot));
      // Reset timeSlot selection when slots change
      setForm((prev) => ({ ...prev, timeSlot: "" }));
    } catch (err) {
      console.error("Error fetching slots:", err);
      setAvailableSlots([]);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const change = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const selectTimeSlot = (slotTime) => {
    const normalizedSlotTime = normalizeTimeSlot(slotTime);

    if (availableSlots.includes(normalizedSlotTime)) {
      setForm((prev) => ({ ...prev, timeSlot: normalizedSlotTime }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);

    if (!form.doctor) {
      setError("Please select a doctor from the list above or the dropdown.");
      return;
    }

    if (!form.timeSlot) {
      setError("Please select a time slot.");
      return;
    }

    if (!isLoggedIn || !authToken) {
      setError("Please log in before booking an appointment.");
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/appointments", {
        method: "POST",
        token: authToken,
        body: form,
      });
      setSubmitted(true);
      // Immediately refresh available slots to show the newly booked slot as grey
      await fetchAvailableSlots();
      setForm(getInitialForm(user));
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectDoctor = (name, spec) => {
    setForm((prev) => ({ ...prev, doctor: `${name} - ${spec}` }));
    document.getElementById("booking-form").scrollIntoView({ behavior: "smooth" });
  };

  const getSlotStatus = (slotTime) => {
    const normalizedSlotTime = normalizeTimeSlot(slotTime);

    // If slot is in booked list, it's booked
    if (bookedSlots && bookedSlots.length > 0 && bookedSlots.includes(normalizedSlotTime)) {
      return "booked";
    }

    if (availableSlots && availableSlots.length > 0 && !availableSlots.includes(normalizedSlotTime)) {
      return "unavailable";
    }

    // Otherwise it's available
    return "available";
  };

  return (
    <>
      <div className="page-banner">
        <div className="container">
          <h1>🩺 Book an Appointment</h1>
          <p>Connect with certified veterinary professionals - fast, easy, and online.</p>
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
                <button className="btn btn-primary btn-sm" onClick={() => selectDoctor(d.name, d.spec)}>
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
              ✓{" "}
              <span>
                <strong>Appointment booked!</strong> Your booking is now saved in your profile history.
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
                  <label>Number of Pets *</label>
                  <input type="number" name="numberOfPets" value={form.numberOfPets} onChange={change} placeholder="1" min="1" max="10" required />
                </div>
                <div className="form-group">
                  <label>Select Doctor *</label>
                  <select name="doctor" value={form.doctor} onChange={change} required>
                    <option value="">Choose a doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={`${d.name} - ${d.spec}`}>
                        {d.name} - {d.spec}
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
              </div>

              {/* Visual Time Slot Picker */}
              <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "1rem" }}>
                  Select Time Slot *
                </label>
                
                {!form.doctor || !form.date ? (
                  <p style={{ 
                    textAlign: "center", 
                    color: "var(--secondary)", 
                    padding: "2rem",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    fontStyle: "italic"
                  }}>
                    Select a doctor and date above to see available time slots
                  </p>
                ) : loadingSlots ? (
                  <p style={{ textAlign: "center", color: "var(--secondary)", padding: "1rem" }}>Loading available slots...</p>
                ) : (
                  <>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                      gap: "8px",
                      marginBottom: "1.5rem"
                    }}>
                      {allSlots.map((slot) => {
                        const status = getSlotStatus(slot.time);
                        const normalizedSlotTime = normalizeTimeSlot(slot.time);
                        const isSelected = form.timeSlot === normalizedSlotTime;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => selectTimeSlot(slot.time)}
                            disabled={status === "booked"}
                            style={{
                              padding: "12px",
                              border: "2px solid transparent",
                              borderRadius: "8px",
                              cursor: status !== "available" ? "not-allowed" : "pointer",
                              fontWeight: 500,
                              fontSize: "13px",
                              transition: "all 0.2s",
                              backgroundColor: isSelected
                                ? "var(--primary)"
                                : status !== "available"
                                ? "#e0e0e0"
                                : "#e8f5e9",
                              color: isSelected ? "white" : status !== "available" ? "#999" : "var(--primary)",
                              borderColor: isSelected ? "var(--primary)" : "transparent",
                              opacity: status !== "available" ? 0.6 : 1,
                            }}
                          >
                            {slot.display}
                          </button>
                        );
                      })}
                    </div>
                    {form.timeSlot && (
                      <p style={{ color: "var(--primary)", fontWeight: 600, marginBottom: "0.5rem" }}>
                        ✓ Selected: {allSlots.find(s => s.time === form.timeSlot)?.display}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="form-grid" style={{ marginTop: "1.5rem" }}>
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
              <button
                type="submit"
                className="btn btn-primary btn-block"
                style={{ marginTop: "1.5rem" }}
                disabled={submitting}
              >
                {submitting ? "Confirming Appointment..." : "Confirm Appointment →"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
