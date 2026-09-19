import API_URL from "../services/api";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function Result() {
  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid poll ID.");
      setLoading(false);
      return;
    }

    // Connect to Go backend SSE stream
    const eventSource = new EventSource(
      `${API_URL}/api/polls/${id}/stream`
    );

    eventSource.onmessage = (event) => {
      try {
        const updatedPoll = JSON.parse(event.data);

        setPoll(updatedPoll);
        setLoading(false);
        setError("");
      } catch (err) {
        console.error("Failed to parse live poll data:", err);
      }
    };

    eventSource.onerror = () => {
      setError("Live connection lost. Trying to reconnect...");
    };

    // Cleanup when leaving page
    return () => {
      eventSource.close();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="app-page">
        <nav className="navbar">
          <div className="logo">
            Poll<span>Live</span>
          </div>

          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </nav>

        <main className="poll-container">
          <div className="poll-box">
            <span className="live-badge">
              ● LIVE RESULTS
            </span>

            <h1>Loading results...</h1>

            <p
              style={{
                color: "#8993a7",
                fontSize: "14px",
              }}
            >
              Connecting to live poll...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="app-page">
        <main className="poll-container">
          <div className="poll-box">
            <h1>Poll not found</h1>

            <p style={{ color: "#ff6b6b" }}>
              {error || "Unable to load poll."}
            </p>

            <Link to="/dashboard">
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Calculate total votes
  const totalVotes = poll.options.reduce(
    (total, option) => total + option.votes,
    0
  );

  return (
    <div className="app-page">
      <nav className="navbar">
        <div className="logo">
          Poll<span>Live</span>
        </div>

        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <main className="poll-container">
        <div className="poll-box">

          <span className="live-badge">
            ● LIVE RESULTS
          </span>

          <h1>{poll.question}</h1>

          {poll.options.map((option) => {
            const percentage =
              totalVotes === 0
                ? 0
                : Math.round(
                    (option.votes / totalVotes) * 100
                  );

            return (
              <div
                className="result-item"
                key={option.id}
              >
                <div className="result-header">
                  <span>{option.text}</span>

                  <span>
                    {option.votes}{" "}
                    {option.votes === 1 ? "vote" : "votes"}{" "}
                    ({percentage}%)
                  </span>
                </div>

                <div className="progress-bg">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}

          <p
            style={{
              marginTop: "25px",
              color: "#8993a7",
              fontSize: "13px",
            }}
          >
            Total votes: {totalVotes}
          </p>

          {error && (
            <p
              style={{
                marginTop: "10px",
                color: "#ffb86c",
                fontSize: "13px",
              }}
            >
              {error}
            </p>
          )}

          <p
            style={{
              marginTop: "10px",
              color: "#4ade80",
              fontSize: "13px",
            }}
          >
            ● Live updates enabled
          </p>

        </div>
      </main>
    </div>
  );
}

export default Result;