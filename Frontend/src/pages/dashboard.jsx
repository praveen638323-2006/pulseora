import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [polls, setPolls] = useState([]);
  const [livePolls, setLivePolls] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState("live");

  const token = localStorage.getItem("token");

  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : { name: "User", email: "" };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [pollResponse, liveResponse] = await Promise.all([
        fetch("http://localhost:8080/api/polls", {
          headers,
        }),
        fetch("http://localhost:8080/api/polls/live"),
      ]);

      if (pollResponse.status === 401) {
        handleLogout();
        return;
      }

      if (!pollResponse.ok) {
        throw new Error("Unable to load your polls");
      }

      const pollData = await pollResponse.json();
      const liveData = await liveResponse.json();

      setPolls(
        Array.isArray(pollData)
          ? pollData
          : pollData.polls || []
      );

      setLivePolls(
        Array.isArray(liveData)
          ? liveData
          : liveData.polls || []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  async function deletePoll(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this poll?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/polls/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setPolls((current) =>
        current.filter((poll) => poll.id !== id)
      );

      setLivePolls((current) =>
        current.filter((poll) => poll.id !== id)
      );
    } catch (err) {
      console.error(err);
      alert("Unable to delete poll.");
    }
  }

  const filteredPolls = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return polls;

    return polls.filter((poll) =>
      poll.question?.toLowerCase().includes(query)
    );
  }, [polls, search]);

  const totalVotes = polls.reduce((total, poll) => {
    const pollVotes = (poll.options || []).reduce(
      (sum, option) => sum + (option.votes || 0),
      0
    );

    return total + pollVotes;
  }, 0);

  const stats = [
    {
      label: "Live polls",
      value: livePolls.length,
      icon: "◉",
      type: "live",
    },
    {
      label: "Total votes",
      value: totalVotes,
      icon: "◎",
      type: "votes",
    },
    {
      label: "Participants",
      value: totalVotes,
      icon: "○",
      type: "participants",
    },
    {
      label: "Total polls",
      value: polls.length,
      icon: "↗",
      type: "total",
    },
  ];

  function formatDate(date) {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="dashboard-page">

      {/* ================= NAVBAR ================= */}

      <header className="pulseora-navbar">
        <div className="nav-container">

          <Link to="/dashboard" className="pulseora-brand">
            <span className="brand-symbol">
              <span />
            </span>

            <span className="brand-text">
              PULSE<span>ORA</span>
            </span>
          </Link>

          <nav className="desktop-nav">
            <Link
              to="/dashboard"
              className="nav-item active"
            >
              Dashboard
            </Link>

            <Link
              to="/live-polls"
              className="nav-item"
            >
              Live Polls
            </Link>

            <Link
              to="/create-poll"
              className="nav-item"
            >
              Create
            </Link>
          </nav>

          <div className="nav-actions">

            <button
              className="theme-toggle"
              onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>

            <div className="profile-wrapper">

              <button
                className="profile-button"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="profile-avatar">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </span>

                <span className="profile-name">
                  {user.name || "User"}
                </span>

                <span className="profile-arrow">
                  {menuOpen ? "⌃" : "⌄"}
                </span>
              </button>

              {menuOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-user">
                    <strong>{user.name || "User"}</strong>
                    <span>{user.email}</span>
                  </div>

                  <div className="profile-divider" />

                  <button
                    onClick={handleLogout}
                    className="logout-button"
                  >
                    Sign out
                  </button>
                </div>
              )}

            </div>

            <button
              className="mobile-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open menu"
            >
              ☰
            </button>

          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="dashboard-main">

        {/* SIGNAL DECORATION */}

        <div className="signal-decoration">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        {/* ================= HERO ================= */}

        <section className="dashboard-hero">

          <div className="hero-content">

            <div className="hero-eyebrow">
              <span className="hero-dot" />
              Friday, 18 September
            </div>

            <h1>
              Your audience
              <br />
              <span>is speaking.</span>
            </h1>

            <p>
              Create live polls, collect opinions,
              and watch every vote happen in real time.
            </p>

            <div className="hero-actions">
              <Link
                to="/create-poll"
                className="primary-action"
              >
                <span>＋</span>
                Create a new poll
              </Link>

              <Link
                to="/live-polls"
                className="secondary-action"
              >
                Explore live polls
                <span>→</span>
              </Link>
            </div>

          </div>

          {/* SIGNAL VISUAL */}

          <div className="hero-signal">
            <div className="signal-status">
              <span className="signal-status-dot" />
              LIVE NETWORK
            </div>

            <div className="waveform">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="signal-caption">
              <span>REAL-TIME</span>
              <strong>Responses are flowing</strong>
            </div>
          </div>

        </section>

        {/* ================= STATS ================= */}

        <section className="stats-grid">

  {stats.map((stat) => {

    const handleStatClick = () => {

      if (stat.type === "live") {
        navigate("/live-polls");
        return;
      }

      if (stat.type === "total") {
        document
          .getElementById("your-polls")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

        setSelectedStat("total");
        return;
      }

      setSelectedStat(stat.type);
    };

    return (
      <button
        key={stat.label}
        type="button"
        onClick={handleStatClick}
        className={`stat-card stat-${stat.type} ${
          selectedStat === stat.type
            ? "stat-card-selected"
            : ""
        }`}
      >

        <div className="stat-top">

          <div className="stat-icon">
            {stat.icon}
          </div>

          {stat.type === "live" && (
            <span className="live-mini">
              LIVE
            </span>
          )}

        </div>

        <div className="stat-bottom">

          <span>{stat.label}</span>

          <strong>{stat.value}</strong>

        </div>

        <span className="stat-action">
          {stat.type === "live"
            ? "View live →"
            : stat.type === "total"
            ? "View polls →"
            : "View insight →"}
        </span>

      </button>
    );
  })}

</section>
{selectedStat === "votes" && (
  <section className="stat-detail-panel">

    <div className="detail-panel-header">
      <div>
        <span className="detail-kicker">
          VOTE ACTIVITY
        </span>

        <h3>Total votes collected</h3>

        <p>
          A quick view of the responses received
          across your polls.
        </p>
      </div>

      <button
        type="button"
        className="detail-close"
        onClick={() => setSelectedStat(null)}
      >
        ×
      </button>
    </div>

    <div className="detail-number">
      {totalVotes}
    </div>

    <div className="detail-status">
      <span className="detail-live-dot" />
      Responses are being tracked
    </div>

  </section>
)}


{selectedStat === "participants" && (
  <section className="stat-detail-panel">

    <div className="detail-panel-header">
      <div>
        <span className="detail-kicker">
          PARTICIPANT INSIGHT
        </span>

        <h3>People who responded</h3>

        <p>
          Unique authenticated voters across
          your polls.
        </p>
      </div>

      <button
        type="button"
        className="detail-close"
        onClick={() => setSelectedStat(null)}
      >
        ×
      </button>
    </div>

    <div className="detail-number">
      {totalVotes}
    </div>

    <div className="detail-status">
      <span className="detail-live-dot" />
      Unique responses recorded
    </div>

  </section>
)}


        {/* ================= LIVE SECTION ================= */}

        <section className="live-section">

          <div className="section-heading">

            <div>
              <div className="section-kicker">
                REAL-TIME
              </div>

              <h2>Live right now</h2>

              <p>
                Polls currently receiving responses.
              </p>
            </div>

            <Link
              to="/live-polls"
              className="section-link"
            >
              Explore all
              <span>→</span>
            </Link>

          </div>

          {loading ? (
            <div className="dashboard-message">
              <div className="loader" />
              Loading live polls...
            </div>
          ) : error ? (
            <div className="dashboard-message error">
              {error}
            </div>
          ) : livePolls.length === 0 ? (
            <div className="empty-live">
              <div className="empty-icon">◌</div>

              <h3>No live polls yet</h3>

              <p>
                Create your first poll and start
                collecting responses.
              </p>

              <Link
                to="/create-poll"
                className="primary-action"
              >
                Create poll
              </Link>
            </div>
          ) : (
            <div className="live-grid">

              {livePolls.slice(0, 3).map((poll) => {

                const voteCount = (poll.options || []).reduce(
                  (sum, option) =>
                    sum + (option.votes || 0),
                  0
                );

                return (
                  <article
                    className="live-poll-card"
                    key={poll.id}
                  >

                    <div className="poll-card-top">

                      <span className="live-badge">
                        <span />
                        LIVE
                      </span>

                      <span className="vote-count">
                        {voteCount}{" "}
                        {voteCount === 1
                          ? "vote"
                          : "votes"}
                      </span>

                    </div>

                    <h3>{poll.question}</h3>

                    <div className="poll-card-footer">

                      <span>
                        {poll.options?.length || 0}
                        {" "}
                        options
                      </span>

                      <Link
                        to={`/poll/${poll.id}`}
                        className="arrow-button"
                      >
                        →
                      </Link>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* ================= WORKSPACE ================= */}

        <section
          className="workspace-section"
          id="your-polls"
        >

          <div className="workspace-heading">

            <div>
              <div className="section-kicker">
                WORKSPACE
              </div>

              <h2>Your polls</h2>

              <p>
                Manage and monitor your created polls.
              </p>
            </div>

            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search your polls..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

          </div>

          {loading ? (
            <div className="dashboard-message">
              <div className="loader" />
              Loading your polls...
            </div>
          ) : filteredPolls.length === 0 ? (
            <div className="empty-workspace">

              <div className="empty-icon">
                +
              </div>

              <h3>
                {search
                  ? "No matching polls"
                  : "Your workspace is empty"}
              </h3>

              <p>
                {search
                  ? "Try a different search."
                  : "Create a poll to get started."}
              </p>

              {!search && (
                <Link
                  to="/create-poll"
                  className="primary-action"
                >
                  Create your first poll
                </Link>
              )}

            </div>
          ) : (
            <div className="workspace-list">

              {filteredPolls.map((poll) => {

                const votes = (poll.options || []).reduce(
                  (sum, option) =>
                    sum + (option.votes || 0),
                  0
                );

                return (
                  <div
                    className="workspace-row"
                    key={poll.id}
                  >

                    <div className="workspace-poll-info">

                      <div className="workspace-poll-icon">
                        ?
                      </div>

                      <div>
                        <h3>{poll.question}</h3>

                        <p>
                          {poll.options?.length || 0}
                          {" "}options · Created{" "}
                          {formatDate(poll.createdAt)}
                        </p>
                      </div>

                    </div>

                    <div className="workspace-poll-stats">

                      <div>
                        <strong>{votes}</strong>
                        <span>votes</span>
                      </div>

                      <Link
                        to={`/poll/${poll.id}`}
                        className="row-view-button"
                      >
                        View
                      </Link>

                      <button
                        className="row-delete-button"
                        onClick={() =>
                          deletePoll(poll.id)
                        }
                        title="Delete poll"
                      >
                        ×
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="dashboard-footer">
        <div>
          <strong>PULSEORA</strong>
          <span>Ask. Vote. See the Pulse.</span>
        </div>

        <span>
          Real-time polling platform
        </span>
      </footer>

    </div>
  );
}

export default Dashboard;