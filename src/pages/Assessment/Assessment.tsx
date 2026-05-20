import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Nav from "../../components/Nav/Nav";
import Footer from "../../components/Footer/Footer";
import {
  BIAS_SECTIONS,
  FEEDBACK_STATEMENTS,
  LIKERT_OPTIONS,
  OPEN_ENDED_QUESTIONS,
} from "./assessmentData";
import styles from "./Assessment.module.css";

type Answers = Record<string, string>;
type Scale = Record<string, number>;
type Feedback = Record<number, number>;
type OpenEnded = Record<number, string>;

export default function Assessment() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "post" ? "post" : "pre";
  const isPost = mode === "post";

  const [answers, setAnswers] = useState<Answers>({});
  const [confidence, setConfidence] = useState<Scale>({});
  const [understanding, setUnderstanding] = useState<Scale>({});
  const [feedback, setFeedback] = useState<Feedback>({});
  const [openEnded, setOpenEnded] = useState<OpenEnded>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const allQuestionsAnswered = BIAS_SECTIONS.every((section) =>
      section.questions.every((q) => answers[q.id] && confidence[q.id]) &&
      understanding[section.id]
    );

    const feedbackComplete = !isPost || FEEDBACK_STATEMENTS.every((_, i) => feedback[i]);

    if (!allQuestionsAnswered || !feedbackComplete) {
      setError("Please answer all questions and ratings before submitting.");
      return;
    }

    setError("");
    setSubmitted(true);
    console.log({ mode, answers, confidence, understanding, ...(isPost && { feedback, openEnded }) });
  };

  if (submitted) {
    return <CompletionState isPost={isPost} />;
  }

  return (
    <>
      <Nav />
      <main className={styles.page}>
        <div className={styles.hero}>
          <span className={`eyebrow ${isPost ? styles.postBadge : styles.preBadge}`}>
            {isPost ? "Post-Game Assessment" : "Pre-Game Assessment"}
          </span>
          <h1 className={styles.title}>
            {isPost ? "Reflect on what you learned." : "Test your intuitions."}
          </h1>
          <p className={styles.lede}>
            {isPost
              ? "Now that you have completed the investigation, answer the same questions again. For each question, select the answer you believe is correct and rate how confident you are on the scale below."
              : "Before you begin the investigation, answer each question as best you can. For each question, select the answer you believe is correct and rate how confident you are in your answer using the scale below."}
          </p>
        </div>

        <div className={styles.sections}>
          {BIAS_SECTIONS.map((section, sectionIdx) => (
            <section key={section.id} className={styles.biasSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIndex}>
                  {String(sectionIdx + 1).padStart(2, "0")}
                </div>
                <div className={styles.sectionMeta}>
                  <p className={styles.sectionLabel}>{section.label}</p>
                  <p className={styles.definition}>{section.definition}</p>
                </div>
              </div>
              <div className={styles.scenario}>{section.scenario}</div>

              <div className={styles.questions}>
                {section.questions.map((question) => (
                  <div key={question.id} className={styles.questionCard}>
                    <div className={styles.questionHeader}>
                      <span className={styles.questionNumber}>{question.number}.</span>
                      <p className={styles.questionText}>{question.text}</p>
                    </div>

                    <fieldset className={styles.optionsFieldset}>
                      <legend className={styles.srOnly}>Answer for {question.number}</legend>
                      {question.options.map((option) => (
                        <label
                          key={option.key}
                          className={`${styles.option} ${answers[question.id] === option.key ? styles.optionSelected : ""}`}
                        >
                          <input
                            type="radio"
                            name={`answer-${question.id}`}
                            value={option.key}
                            checked={answers[question.id] === option.key}
                            onChange={() =>
                              setAnswers((prev) => ({ ...prev, [question.id]: option.key }))
                            }
                            className={styles.srOnly}
                          />
                          <span className={styles.optionKey}>{option.key}</span>
                          <span className={styles.optionText}>{option.text}</span>
                        </label>
                      ))}
                    </fieldset>

                    <div className={styles.scaleRow}>
                      <span className={styles.scaleRowLabel}>Confidence in answer:</span>
                      <fieldset className={styles.scaleFieldset}>
                        <legend className={styles.srOnly}>Confidence for {question.number}</legend>
                        <div className={styles.scaleButtons}>
                          {[1, 2, 3, 4, 5].map((val) => (
                            <label
                              key={val}
                              className={`${styles.scaleBtn} ${confidence[question.id] === val ? styles.scaleBtnSelected : ""}`}
                            >
                              <input
                                type="radio"
                                name={`confidence-${question.id}`}
                                value={val}
                                checked={confidence[question.id] === val}
                                onChange={() =>
                                  setConfidence((prev) => ({ ...prev, [question.id]: val }))
                                }
                                className={styles.srOnly}
                              />
                              {val}
                            </label>
                          ))}
                        </div>
                        <div className={styles.scaleEndLabels}>
                          <span>Not confident</span>
                          <span>Very confident</span>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.understandingRow}>
                <span className={styles.understandingLabel}>
                  Rate your understanding of {section.label}:
                </span>
                <fieldset className={styles.scaleFieldset}>
                  <legend className={styles.srOnly}>Understanding of {section.label}</legend>
                  <div className={styles.scaleButtons}>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <label
                        key={val}
                        className={`${styles.scaleBtn} ${styles.scaleBtnUnderstanding} ${understanding[section.id] === val ? styles.scaleBtnSelected : ""}`}
                      >
                        <input
                          type="radio"
                          name={`understanding-${section.id}`}
                          value={val}
                          checked={understanding[section.id] === val}
                          onChange={() =>
                            setUnderstanding((prev) => ({ ...prev, [section.id]: val }))
                          }
                          className={styles.srOnly}
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                  <div className={styles.scaleEndLabels}>
                    <span>No understanding</span>
                    <span>Full understanding</span>
                  </div>
                </fieldset>
              </div>
            </section>
          ))}

          {isPost && (
            <section className={styles.feedbackSection}>
              <div className={styles.feedbackHeader}>
                <span className="eyebrow">Your Feedback</span>
                <h2 className={styles.feedbackTitle}>Help us improve the game.</h2>
              </div>

              <div className={styles.likertList}>
                {FEEDBACK_STATEMENTS.map((statement, i) => (
                  <div key={i} className={styles.likertRow}>
                    <p className={styles.statementText}>{statement}</p>
                    <fieldset className={styles.likertFieldset}>
                      <legend className={styles.srOnly}>{statement}</legend>
                      <div className={styles.likertButtons}>
                        {LIKERT_OPTIONS.map((opt) => (
                          <label
                            key={opt.value}
                            className={`${styles.likertBtn} ${feedback[i] === opt.value ? styles.likertBtnSelected : ""}`}
                            title={opt.label}
                          >
                            <input
                              type="radio"
                              name={`feedback-${i}`}
                              value={opt.value}
                              checked={feedback[i] === opt.value}
                              onChange={() =>
                                setFeedback((prev) => ({ ...prev, [i]: opt.value }))
                              }
                              className={styles.srOnly}
                            />
                            <span className={styles.likertNum}>{opt.value}</span>
                            <span className={styles.likertLabel}>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                ))}
              </div>

              <div className={styles.openEndedList}>
                {OPEN_ENDED_QUESTIONS.map((question, i) => (
                  <div key={i} className={styles.openEndedRow}>
                    <label className={styles.openEndedLabel} htmlFor={`open-${i}`}>
                      {question}
                    </label>
                    <textarea
                      id={`open-${i}`}
                      className={styles.openEndedInput}
                      value={openEnded[i] ?? ""}
                      onChange={(e) =>
                        setOpenEnded((prev) => ({ ...prev, [i]: e.target.value }))
                      }
                      rows={4}
                      placeholder="Write your thoughts here…"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className={styles.submitArea}>
          {error && <p className={styles.errorMsg}>{error}</p>}
          <button className={styles.submitBtn} onClick={handleSubmit} type="button">
            Submit {isPost ? "Post-Game" : "Pre-Game"} Assessment
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}

function CompletionState({ isPost }: { isPost: boolean }) {
  return (
    <>
      <Nav />
      <main className={styles.page}>
        <div className={styles.completion}>
          <span className="eyebrow">Assessment complete</span>
          <h1 className={styles.title}>
            {isPost ? "Thank you for your feedback." : "Intuitions recorded."}
          </h1>
          <p className={styles.lede}>
            {isPost
              ? "Your responses help us improve the investigation. The case file is now closed."
              : "Your initial answers have been noted. Begin the investigation when you are ready."}
          </p>
          {!isPost && (
            <a href="/chapters?intro=story" className={styles.ctaLink}>
              Begin the investigation →
            </a>
          )}
          {isPost && (
            <a href="/" className={styles.ctaLink}>
              Return to home →
            </a>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
