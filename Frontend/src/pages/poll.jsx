import API_URL from "../services/api";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./poll.css";

function Poll() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // =========================
  // LOAD POLL
  // =========================

  useEffect(() => {
    if (!token) {
      navigate("/", {
        state: {
          from: `/poll/${id}`,
        },
      });

      return;
    }

    loadPoll();
  }, [id]);

  async function loadPoll() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
       `${API_URL}/api/polls/${id}`
      );

      if (!response.ok) {
        throw new Error("Poll not found");
      }

      const data = await response.json();

      // Backend returns:
      // { poll: {...} }
      //
      // This also supports:
      // { id: "...", question: "...", options: [...] }

      const pollData = data.poll || data;

      setPoll(pollData);
    } catch (err) {
      console.error("Load poll error:", err);
      setError("Unable to load this poll.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // REAL-TIME SSE
  // =========================

  useEffect(() => {
    if (!id) return;

    const eventSource = new EventSource(
      `${API_URL}/api/polls/${id}/stream`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Support both:
        // { poll: {...} }
        // and
        // {...}

        const updatedPoll = data.poll || data;

        if (updatedPoll && updatedPoll.id) {
          setPoll(updatedPoll);
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = () => {
      console.log("Live connection temporarily unavailable.");
    };

    return () => {
      eventSource.close();
    };
  }, [id]);

  // =========================
  // VOTE
  // =========================

  async function handleVote() {
    if (!selectedOption) {
      setError("Please select an option before voting.");
      return;
    }

    try {
      setVoting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/polls/${id}/vote`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            optionId: selectedOption,
          }),
        }
      );

      const data = await response.json();

      // =========================
      // AUTH ERROR
      // =========================

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/", {
          state: {
            from: `/poll/${id}`,
          },
        });

        return;
      }

      // =========================
      // OTHER BACKEND ERRORS
      // =========================

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to submit your vote."
        );
      }

      // =========================
      // UPDATE POLL
      // =========================

      // Backend returns:
      // { poll: {...} }
      //
      // Also supports direct poll object.

      const updatedPoll = data.poll || data;

      setPoll(updatedPoll);

      setMessage("Your vote has been recorded.");

      // Prevent another vote from same UI
      setSelectedOption("");
    } catch (err) {
      console.error("Vote error:", err);

      setError(
        err.message || "Unable to submit your vote."
      );
    } finally {
      setVoting(false);
    }
  }

  // =========================
  // COPY POLL LINK
  // =========================

  async function copyPollLink() {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      setMessage("Poll link copied.");
    } catch (err) {
      console.error("Copy error:", err);

      setMessage("Unable to copy the link.");
    }
  }

  // =========================
  // SHARE POLL
  // =========================

  async function sharePoll() {
    const shareData = {
      title: poll?.question || "PULSEORA Poll",

      text: "Join this live poll on PULSEORA.",

      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          window.location.href
        );

        setMessage("Poll link copied.");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Share error:", err);
      }
    }
  }

  // =========================
  // LOADING SCREEN
  // =========================

  if (loading) {
    return (
      <div className="poll-page">
        <div className="poll-loading">
          <div className="poll-loader" />

          <p>Loading live poll...</p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR SCREEN
  // =========================

  if (error && !poll) {
    return (
      <div className="poll-page">
        <div className="poll-error-page">
          <div className="error-icon">!</div>

          <h2>Poll unavailable</h2>

          <p>{error}</p>

          <Link
            to="/dashboard"
            className="poll-primary-button"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  // =========================
  // TOTAL VOTES
  // =========================

  const totalVotes = (poll.options || []).reduce(
    (total, option) =>
      total + (option.votes || 0),
    0
  );

  // =========================
  // UI
  // =========================

  return (
    <div className="poll-page">

      {/* ================= HEADER ================= */}

      <header className="poll-navbar">
        <div className="poll-nav-inner">

          <Link
            to="/dashboard"
            className="poll-brand"
          >
            <span className="poll-brand-symbol">
              <span />
            </span>

            <span>
              PULSE<span>ORA</span>
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="poll-back-link"
          >
            ← Dashboard
          </Link>

        </div>
      </header>


      {/* ================= MAIN ================= */}

      <main className="poll-main">

        {/* ================= TOP META ================= */}

        <div className="poll-meta-row">

          <div className="poll-live-status">
            <span className="poll-live-dot" />
            LIVE POLL
          </div>

          <div className="poll-vote-counter">
            {totalVotes}{" "}
            {totalVotes === 1
              ? "vote"
              : "votes"}
          </div>

        </div>


        {/* ================= QUESTION ================= */}

        <section className="poll-question-section">

          <div className="poll-question-kicker">
            PULSEORA / LIVE RESPONSE
          </div>

          <h1>
            {poll.question}
          </h1>

          <p className="poll-question-description">
            Choose one option and submit your response.
            Results update live as people vote.
          </p>

        </section>


        {/* ================= SHARE ACTIONS ================= */}

        <div className="poll-actions">

          <button
            onClick={copyPollLink}
            className="poll-action-button"
          >
            <span>↗</span>

            Copy poll link
          </button>


          <button
            onClick={sharePoll}
            className="poll-action-button share"
          >
            <span>↑</span>

            Share poll
          </button>

        </div>


        {/* ================= VOTING CARD ================= */}

        <section className="voting-layout">

          <div className="voting-card">

            <div className="voting-card-header">

              <div>

                <span className="card-label">
                  YOUR RESPONSE
                </span>

                <h2>
                  What do you think?
                </h2>

              </div>

              <span className="option-count">
                {poll.options?.length || 0} options
              </span>

            </div>


            {/* ================= OPTIONS ================= */}

            <div className="options-list">

              {(poll.options || []).map(
                (option, index) => (

                  <label
                    key={option.id}
                    className={`poll-option ${
                      selectedOption === option.id
                        ? "selected"
                        : ""
                    }`}
                  >

                    <input
                      type="radio"
                      name="poll-option"
                      value={option.id}
                      checked={
                        selectedOption === option.id
                      }
                      onChange={() => {
                        setSelectedOption(
                          option.id
                        );

                        setError("");
                        setMessage("");
                      }}
                    />


                    <span className="option-radio">
                      <span />
                    </span>


                    <span className="option-number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>


                    <span className="option-text">
                      {option.text}
                    </span>


                    <span className="option-arrow">
                      →
                    </span>

                  </label>

                )
              )}

            </div>


            {/* ================= ERROR MESSAGE ================= */}

            {error && (
              <div className="poll-message poll-error">
                <span>!</span>

                {error}
              </div>
            )}


            {/* ================= SUCCESS MESSAGE ================= */}

            {message && (
              <div className="poll-message poll-success">
                <span>✓</span>

                {message}
              </div>
            )}


            {/* ================= SUBMIT ================= */}

            <button
              className="vote-submit-button"
              onClick={handleVote}
              disabled={voting}
            >

              {voting ? (
                <>
                  <span className="button-loader" />

                  Submitting...
                </>
              ) : (
                <>
                  Submit vote

                  <span>→</span>
                </>
              )}

            </button>


            <p className="vote-note">
              Your account can vote once in this poll.
            </p>

          </div>


          {/* ================= LIVE INFO ================= */}

          <aside className="live-info-card">

            <div className="live-info-header">

              <span className="poll-live-dot" />

              LIVE RESULTS

            </div>


            <div className="mini-wave">

              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />

            </div>


            <div className="live-info-number">
              {totalVotes}
            </div>


            <p>
              {totalVotes === 1
                ? "response received"
                : "responses received"}
            </p>


            <div className="live-info-line" />


            <span className="live-info-caption">
              Results update automatically
            </span>

          </aside>

        </section>

      </main>

    </div>
  );
}

export default Poll;