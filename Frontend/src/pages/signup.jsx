import API_URL from "../services/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./signup.css";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      setSuccess("Account created successfully! Redirecting...");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Navbar */}
      <nav className="signup-navbar">
        <Link to="/" className="signup-brand">
          <span className="signup-brand-symbol">◉</span>
          PULSEORA
        </Link>

        <div className="signup-nav-right">
          <span>Already a member?</span>
          <Link to="/" className="signup-signin-link">
            Sign in →
          </Link>
        </div>
      </nav>

      {/* Decorative background */}
      <div className="signup-grid" />
      <div className="signup-signal signup-signal-one" />
      <div className="signup-signal signup-signal-two" />

      {/* Main */}
      <main className="signup-main">
        <section className="signup-intro">
          <span className="signup-status">
            <span className="signup-status-dot" />
            JOIN THE PULSE
          </span>

          <h1>
            Make every
            <br />
            <span>voice count.</span>
          </h1>

          <p>
            Create live polls, hear your audience, and watch
            responses move in real time.
          </p>

          <div className="signup-feature-list">
            <div className="signup-feature">
              <span>01</span>
              <div>
                <strong>Create</strong>
                <small>Build a question in seconds.</small>
              </div>
            </div>

            <div className="signup-feature">
              <span>02</span>
              <div>
                <strong>Share</strong>
                <small>Send your live poll anywhere.</small>
              </div>
            </div>

            <div className="signup-feature">
              <span>03</span>
              <div>
                <strong>See the pulse</strong>
                <small>Watch responses update instantly.</small>
              </div>
            </div>
          </div>
        </section>

        <section className="signup-card">
          <div className="signup-card-top">
            <div>
              <span className="signup-kicker">ACCOUNT SETUP</span>
              <h2>Create your account.</h2>
              <p>It only takes a moment to get started.</p>
            </div>

            <div className="signup-card-orbit">
              <span />
            </div>
          </div>

          <form onSubmit={handleSignup} className="signup-form">
            <div className="signup-field">
              <label htmlFor="name">FULL NAME</label>

              <div className="signup-input-wrap">
                <span className="signup-input-icon">✦</span>

                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="signup-field">
              <label htmlFor="email">EMAIL ADDRESS</label>

              <div className="signup-input-wrap">
                <span className="signup-input-icon">@</span>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="signup-field">
              <label htmlFor="password">PASSWORD</label>

              <div className="signup-input-wrap">
                <span className="signup-input-icon">•</span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <span className="signup-hint">
                Minimum 6 characters
              </span>
            </div>

            {error && (
              <div className="signup-message signup-error">
                <span>!</span>
                {error}
              </div>
            )}

            {success && (
              <div className="signup-message signup-success">
                <span>✓</span>
                {success}
              </div>
            )}

            <button
              className="signup-submit"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading ? "Creating account..." : "Create account"}
              </span>
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="signup-divider">
            <span>SECURE ACCOUNT ACCESS</span>
          </div>

          <p className="signup-footer">
            Already have an account?{" "}
            <Link to="/">Sign in →</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default Signup;