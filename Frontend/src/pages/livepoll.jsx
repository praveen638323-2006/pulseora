import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./livepoll.css";

function LivePoll() {
  const [polls, setPolls] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLivePolls();
  }, []);

  async function loadLivePolls() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:8080/api/polls/live"
      );

      if (!response.ok) {
        throw new Error("Unable to load live polls");
      }

      const data = await response.json();

      const result = Array.isArray(data)
        ? data
        : data.polls || [];

      setPolls(result);
    } catch (err) {
      console.error("Live polls error:", err);
      setError(
        "Unable to load live polls. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredPolls = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return polls;
    }

    return polls.filter((poll) =>
      poll.question?.toLowerCase().includes(query)
    );
  }, [polls, search]);

  function getVoteCount(poll) {
    return (poll.options || []).reduce(
      (total, option) =>
        total + (option.votes || 0),
      0
    );
  }

  return (
    <div className="live-polls-page">

      {/* ================= NAVBAR ================= */}

      <header className="live-navbar">

        <div className="live-nav-inner">

          <Link
            to="/dashboard"
            className="live-brand"
          >
            <span className="live-brand-symbol">
              <span />
            </span>

            <span className="live-brand-text">
              PULSE<span>ORA</span>
            </span>
          </Link>

          <nav className="live-nav-links">

            <Link
              to="/dashboard"
              className="live-nav-link"
            >
              Dashboard
            </Link>

            <Link
              to="/live-polls"
              className="live-nav-link active"
            >
              Live Polls
            </Link>

            <Link
              to="/create-poll"
              className="live-nav-link"
            >
              Create
            </Link>

          </nav>

          <Link
            to="/create-poll"
            className="live-create-button"
          >
            <span>＋</span>
            Create Poll
          </Link>

        </div>

      </header>

      {/* ================= MAIN ================= */}

      <main className="live-polls-main">

        {/* HEADER */}

        <section className="live-page-header">

          <div className="live-header-content">

            <div className="live-kicker">
              <span className="live-header-dot" />
              PULSEORA / LIVE NETWORK
            </div>

            <h1>
              Live polls.
              <br />
              <span>Real responses.</span>
            </h1>

            <p>
              Explore polls that are currently collecting
              responses. Vote and watch the pulse change live.
            </p>

          </div>

          <div className="live-network-card">

            <div className="network-top">
              <span className="network-dot" />
              NETWORK ACTIVE
            </div>

            <div className="network-wave">
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

            <div className="network-bottom">
              <strong>{polls.length}</strong>
              <span>
                {polls.length === 1
                  ? "live poll"
                  : "live polls"}
              </span>
            </div>

          </div>

        </section>

        {/* SEARCH */}

        <section className="live-controls">

          <div className="live-result-count">
            <strong>
              {filteredPolls.length}
            </strong>

            <span>
              {filteredPolls.length === 1
                ? "poll available"
                : "polls available"}
            </span>
          </div>

          <div className="live-search">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search live polls..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

        </section>

        {/* ================= CONTENT ================= */}

        {loading ? (

          <div className="live-state">

            <div className="live-loader" />

            <h3>Connecting to live network</h3>

            <p>
              Loading active polls...
            </p>

          </div>

        ) : error ? (

          <div className="live-state live-error">

            <div className="state-icon">
              !
            </div>

            <h3>Something went wrong</h3>

            <p>{error}</p>

            <button
              type="button"
              className="retry-button"
              onClick={loadLivePolls}
            >
              Try again
            </button>

          </div>

        ) : filteredPolls.length === 0 ? (

          <div className="live-state">

            <div className="state-icon">
              ◌
            </div>

            <h3>
              {search
                ? "No matching polls"
                : "No live polls right now"}
            </h3>

            <p>
              {search
                ? "Try searching with another question."
                : "Create a poll and start collecting responses."}
            </p>

            {!search && (
              <Link
                to="/create-poll"
                className="retry-button"
              >
                Create a poll
              </Link>
            )}

          </div>

        ) : (

          <section className="live-polls-grid">

            {filteredPolls.map((poll) => {

              const votes = getVoteCount(poll);

              return (
                <article
                  className="live-poll-item"
                  key={poll.id}
                >

                  {/* CARD TOP */}

                  <div className="live-card-header">

                    <span className="live-card-badge">
                      <span />
                      LIVE
                    </span>

                    <span className="live-card-votes">
                      {votes}{" "}
                      {votes === 1
                        ? "vote"
                        : "votes"}
                    </span>

                  </div>

                  {/* QUESTION */}

                  <div className="live-card-content">

                    <span className="question-label">
                      POLL QUESTION
                    </span>

                    <h2>
                      {poll.question}
                    </h2>

                  </div>

                  {/* OPTIONS PREVIEW */}

                  <div className="option-preview">

                    {(poll.options || [])
                      .slice(0, 3)
                      .map((option, index) => {

                        const total =
                          votes || 1;

                        const percentage =
                          Math.round(
                            ((option.votes || 0) /
                              total) *
                              100
                          );

                        return (
                          <div
                            className="preview-option"
                            key={option.id}
                          >

                            <div className="preview-option-top">

                              <span>
                                {option.text}
                              </span>

                              <span>
                                {percentage}%
                              </span>

                            </div>

                            <div className="preview-bar">
                              <span
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>

                          </div>
                        );
                      })}

                  </div>

                  {/* CARD FOOTER */}

                  <div className="live-card-footer">

                    <span>
                      {poll.options?.length || 0}
                      {" "}
                      options
                    </span>

                    <Link
                      to={`/poll/${poll.id}`}
                      className="vote-now-button"
                    >
                      Vote now
                      <span>→</span>
                    </Link>

                  </div>

                </article>
              );
            })}

          </section>

        )}

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="live-footer">

        <div>
          <strong>PULSEORA</strong>
          <span>
            Ask. Vote. See the Pulse.
          </span>
        </div>

        <span>
          Real-time polling platform
        </span>

      </footer>

    </div>
  );
}

export default LivePoll;