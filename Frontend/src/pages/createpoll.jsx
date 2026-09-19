import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./createpoll.css";

function CreatePoll() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const addOption = () => {
    if (options.length >= 6) {
      setError("Maximum 6 options are allowed.");
      return;
    }

    setOptions([...options, ""]);
    setError("");
  };

  const updateOption = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
    setError("");
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;

    setOptions(
      options.filter((_, optionIndex) => optionIndex !== index)
    );

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanQuestion = question.trim();
    const cleanOptions = options.map((option) => option.trim());

    if (!cleanQuestion) {
      setError("Please enter a poll question.");
      return;
    }

    if (cleanOptions.some((option) => !option)) {
      setError("Please fill all options.");
      return;
    }

    if (cleanOptions.length < 2) {
      setError("At least 2 options are required.");
      return;
    }

    if (cleanOptions.length > 6) {
      setError("Maximum 6 options are allowed.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/polls",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            question: cleanQuestion,
            options: cleanOptions,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create poll."
        );
      }

      const pollId = data.poll.id;

      navigate(`/poll/${pollId}`);
    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">

      {/* ================= NAVBAR ================= */}

      <header className="create-navbar">

        <div className="create-nav-inner">

          <Link
            to="/dashboard"
            className="create-brand"
          >
            <span className="create-brand-symbol">
              <span />
            </span>

            <span className="create-brand-text">
              PULSE<span>ORA</span>
            </span>
          </Link>

          <div className="create-nav-right">

            <Link
              to="/dashboard"
              className="create-back-link"
            >
              ← Dashboard
            </Link>

          </div>

        </div>

      </header>

      {/* ================= MAIN ================= */}

      <main className="create-main">

        <div className="create-layout">

          {/* ================= LEFT ================= */}

          <section className="create-content">

            <div className="create-kicker">
              <span className="create-kicker-dot" />
              PULSEORA / CREATE
            </div>

            <h1>
              Ask something.
              <br />
              <span>Hear everyone.</span>
            </h1>

            <p className="create-intro">
              Create a live question, share it with your
              audience, and watch responses arrive in real time.
            </p>

            <form
              className="create-form"
              onSubmit={handleSubmit}
            >

              {/* QUESTION */}

              <div className="field-section">

                <div className="field-heading">
                  <div>
                    <span className="field-number">
                      01
                    </span>

                    <label htmlFor="question">
                      Your question
                    </label>
                  </div>

                  <span className="character-count">
                    {question.length}/120
                  </span>
                </div>

                <textarea
                  id="question"
                  className="question-input"
                  placeholder="What do you want to ask?"
                  value={question}
                  maxLength={120}
                  onChange={(e) =>
                    setQuestion(e.target.value)
                  }
                  required
                />

              </div>

              {/* OPTIONS */}

              <div className="field-section">

                <div className="field-heading">

                  <div>
                    <span className="field-number">
                      02
                    </span>

                    <label>
                      Answer options
                    </label>
                  </div>

                  <span className="options-count">
                    {options.length}/6
                  </span>

                </div>

                <div className="create-options">

                  {options.map((option, index) => (
                    <div
                      className="create-option-row"
                      key={index}
                    >

                      <span className="option-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        maxLength={60}
                        onChange={(e) =>
                          updateOption(
                            index,
                            e.target.value
                          )
                        }
                        required
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          className="remove-option"
                          onClick={() =>
                            removeOption(index)
                          }
                          aria-label={`Remove option ${
                            index + 1
                          }`}
                        >
                          ×
                        </button>
                      )}

                    </div>
                  ))}

                </div>

                <button
                  type="button"
                  className="add-option-button"
                  onClick={addOption}
                  disabled={options.length >= 6}
                >
                  <span>＋</span>
                  Add another option
                </button>

              </div>

              {/* ERROR */}

              {error && (
                <div className="create-error">
                  <span>!</span>
                  {error}
                </div>
              )}

              {/* SUBMIT */}

              <button
                className="create-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="create-spinner" />
                    Creating your poll...
                  </>
                ) : (
                  <>
                    Launch live poll
                    <span>→</span>
                  </>
                )}
              </button>

              <p className="create-note">
                Your poll will be stored securely and ready
                to receive live responses.
              </p>

            </form>

          </section>

          {/* ================= PREVIEW ================= */}

          <aside className="create-preview">

            <div className="preview-label">
              LIVE PREVIEW
            </div>

            <div className="preview-card">

              <div className="preview-top">

                <span>
                  <i />
                  LIVE POLL
                </span>

                <span>
                  0 votes
                </span>

              </div>

              <div className="preview-question">

                <span>
                  PULSEORA / QUESTION
                </span>

                <h2>
                  {question.trim() ||
                    "Your question will appear here"}
                </h2>

              </div>

              <div className="preview-options">

                {options.map((option, index) => (
                  <div
                    className="preview-option"
                    key={index}
                  >

                    <span className="preview-option-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span>
                      {option.trim() ||
                        `Option ${index + 1}`}
                    </span>

                    <span className="preview-arrow">
                      →
                    </span>

                  </div>
                ))}

              </div>

              <div className="preview-footer">
                <span>
                  Choose one response
                </span>

                <span>
                  PULSEORA
                </span>
              </div>

            </div>

            <div className="preview-signal">

              <span className="signal-dot" />

              <div>
                <strong>
                  Ready for responses
                </strong>

                <p>
                  Results update instantly as votes arrive.
                </p>
              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}

export default CreatePoll;