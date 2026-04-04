import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const blankLogin = { email: "", password: "" };
const blankReg = { name: "", email: "", phone: "", password: "", confirm: "" };

export default function LoginRegister({ onLogin }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [login, setLogin] = useState(blankLogin);
  const [reg, setReg] = useState(blankReg);
  const [loginDone, setLoginDone] = useState(false);
  const [regDone, setRegDone] = useState(false);
  const [regError, setRegError] = useState("");

  const changeLogin = (e) => setLogin((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const changeReg = (e) => setReg((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submitLogin = (e) => {
    e.preventDefault();
    const storedUser = localStorage.getItem("petapp_user");
    const parsedUser = storedUser
      ? JSON.parse(storedUser)
      : { name: "Kalyan", email: login.email, phone: "+91 0000000000" };
    localStorage.setItem("petapp_logged_in", "true");
    if (onLogin) {
      onLogin(parsedUser);
    }
    setLoginDone(true);
    navigate("/user");
  };

  const submitReg = (e) => {
    e.preventDefault();
    setRegError("");
    if (reg.password.length < 8) {
      setRegError("Password must be at least 8 characters.");
      return;
    }
    if (reg.password !== reg.confirm) {
      setRegError("Passwords do not match.");
      return;
    }
    localStorage.setItem(
      "petapp_user",
      JSON.stringify({
        name: reg.name,
        email: reg.email,
        phone: reg.phone || "+91 0000000000",
      })
    );
    setRegDone(true);
  };

  const switchTab = (t) => {
    setTab(t);
    setLoginDone(false);
    setRegDone(false);
    setRegError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-banner">
          <span style={{ fontSize: "2.2rem" }}>🐾</span>
          <div>
            <strong>Welcome to PetCare</strong>
            <span>Sign in to manage your pets and appointments</span>
          </div>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === "login" ? " active" : ""}`}
            onClick={() => switchTab("login")}
          >
            Login
          </button>
          <button
            className={`auth-tab${tab === "register" ? " active" : ""}`}
            onClick={() => switchTab("register")}
          >
            Register
          </button>
        </div>

        <div className="auth-body">
          {tab === "login" ? (
            loginDone ? (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
                <h3>Welcome back!</h3>
                <p style={{ color: "var(--text-muted)", marginTop: "0.4rem" }}>
                  You are successfully logged in.
                </p>
                <Link to="/" className="btn btn-primary btn-block" style={{ marginTop: "1.5rem" }}>
                  Go to Home
                </Link>
              </div>
            ) : (
              <>
                <h2 className="auth-title">Sign In</h2>
                <p className="auth-sub">Enter your credentials to access your account</p>
                <form className="auth-form" onSubmit={submitLogin}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      name="email"
                      type="email"
                      value={login.email}
                      onChange={changeLogin}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      name="password"
                      type="password"
                      value={login.password}
                      onChange={changeLogin}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div style={{ textAlign: "right", marginTop: "-0.25rem" }}>
                    <a
                      href="#"
                      style={{ fontSize: "0.85rem", color: "var(--primary)", textDecoration: "none" }}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    Sign In →
                  </button>
                </form>
                <p className="auth-footer">
                  New here?{" "}
                  <button
                    onClick={() => switchTab("register")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--primary)",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      padding: 0,
                    }}
                  >
                    Create an account
                  </button>
                </p>
              </>
            )
          ) : regDone ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎉</div>
              <h3>Account Created!</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "0.4rem" }}>
                Welcome to PetCare. Please sign in to continue.
              </p>
              <button
                className="btn btn-primary btn-block"
                style={{ marginTop: "1.5rem" }}
                onClick={() => switchTab("login")}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="auth-title">Create Account</h2>
              <p className="auth-sub">Join PetCare and give your pet the best life</p>
              <form className="auth-form" onSubmit={submitReg}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    name="name"
                    value={reg.name}
                    onChange={changeReg}
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={reg.email}
                    onChange={changeReg}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    type="tel"
                    value={reg.phone}
                    onChange={changeReg}
                    placeholder="+91 0000000000"
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    name="password"
                    type="password"
                    value={reg.password}
                    onChange={changeReg}
                    placeholder="Min 8 characters"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    name="confirm"
                    type="password"
                    value={reg.confirm}
                    onChange={changeReg}
                    placeholder="Repeat password"
                    required
                  />
                </div>
                {regError && (
                  <p style={{ color: "var(--red)", fontSize: "0.9rem", fontWeight: 600 }}>
                    {regError}
                  </p>
                )}
                <button type="submit" className="btn btn-primary btn-block">
                  Create Account →
                </button>
              </form>
              <p className="auth-footer">
                Already have an account?{" "}
                <button
                  onClick={() => switchTab("login")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--primary)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    padding: 0,
                  }}
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
