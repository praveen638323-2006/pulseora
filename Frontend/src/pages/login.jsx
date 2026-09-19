import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      const redirectTo =
        location.state?.from || "/dashboard";

      navigate(redirectTo);
    } catch (err) {
      setError(
        err.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ================= NAVBAR ================= */}

      <nav className="login-navbar">

        <Link to="/" className="login-brand">

          <span className="login-brand-symbol">
            <span />
          </span>

          <span>
            PULSE<span>ORA</span>
          </span>

        </Link>

        <div className="login-nav-right">
          <span>New here?</span>

          <Link to="/signup">
            Create account →
          </Link>
        </div>

      </nav>


      {/* ================= MAIN ================= */}

      <main className="login-main">

        {/* Background signal decoration */}

        <div className="login-signal signal-one" />
        <div className="login-signal signal-two" />
        <div className="login-grid" />


        <section className="login-layout">

          {/* ================= LEFT ================= */}

          <div className="login-intro">

            <div className="login-status">
              <span className="login-live-dot" />
              PULSEORA / LIVE POLLING
            </div>

            <h1>
              Stay in
              <br />
              <span>the pulse.</span>
            </h1>

            <p>
              Create live questions, share them with
              your audience, and watch responses arrive
              in real time.
            </p>

            <div className="login-feature-list">

              <div className="login-feature">
                <span>01</span>
                <div>
                  <strong>Create</strong>
                  <small>Ask anything worth hearing.</small>
                </div>
              </div>

              <div className="login-feature">
                <span>02</span>
                <div>
                  <strong>Share</strong>
                  <small>Reach your audience instantly.</small>
                </div>
              </div>

              <div className="login-feature">
                <span>03</span>
                <div>
                  <strong>See live</strong>
                  <small>Watch the pulse change in real time.</small>
                </div>
              </div>

            </div>

          </div>


          {/* ================= LOGIN CARD ================= */}

          <div className="login-card">

            <div className="login-card-top">

              <div>
                <span className="login-card-kicker">
                  ACCOUNT ACCESS
                </span>

                <h2>
                  Welcome back.
                </h2>

                <p>
                  Sign in to continue to PULSEORA.
                </p>
              </div>

              <div className="login-card-orbit">
                <span />
              </div>

            </div>


            <form onSubmit={handleLogin}>

              {/* EMAIL */}

              <div className="login-input-group">

                <label htmlFor="email">
                  EMAIL ADDRESS
                </label>

                <div className="login-input-wrap">

                  <span className="login-input-icon">
                    @
                  </span>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                    required
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="login-input-group">

                <label htmlFor="password">
                  PASSWORD
                </label>

                <div className="login-input-wrap">

                  <span className="login-input-icon">
                    •
                  </span>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>


              {/* ERROR */}

              {error && (
                <div className="login-error">

                  <span>!</span>

                  <p>{error}</p>

                </div>
              )}


              {/* SUBMIT */}

              <button
                className="login-submit"
                type="submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="login-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span>→</span>
                  </>
                )}

              </button>

            </form>


            <div className="login-divider">
              <span />
              SECURE ACCOUNT ACCESS
              <span />
            </div>


            <div className="login-footer">

              <span>
                Don't have an account?
              </span>

              <Link to="/signup">
                Create one →
              </Link>

            </div>

          </div>

        </section>

      </main>


      {/* ================= BOTTOM ================= */}

      <footer className="login-bottom">

        <span>
          PULSEORA
        </span>

        <span>
          ASK. VOTE. SEE THE PULSE.
        </span>

        <span>
          ● REALTIME
        </span>

      </footer>

    </div>
  );
}

export default Login;