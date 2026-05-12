import Nav from "../../components/Nav/Nav";
import Footer from "../../components/Footer/Footer";
import Button from "../../components/Button/Button";
import styles from "./Landing.module.css";

const GROUP_A: Array<[number, number]> = [
  [160, 190], [200, 170], [240, 150], [280, 135], [320, 120],
  [360, 110], [400, 100], [440, 85], [480, 75], [520, 60],
  [260, 185], [330, 155], [390, 135], [220, 255], [350, 210],
];

const GROUP_B: Array<[number, number]> = [
  [100, 295], [140, 275], [180, 260], [220, 250], [260, 230],
  [300, 215], [340, 200], [380, 180], [150, 310], [230, 290],
  [290, 265], [420, 170], [460, 155], [110, 245], [180, 225],
];

type Step = {
  num: string;
  title: string;
  body: string;
  accent: "blue" | "pink" | "teal";
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Collect the evidence",
    body: "Open the candidate records and inspect the population before the machine learns from it. Missing data is the first clue.",
    accent: "blue",
  },
  {
    num: "02",
    title: "Draw the verdict line",
    body: "Sketch a decision boundary, chase accuracy, then compare how the same line treats two groups with different histories.",
    accent: "pink",
  },
  {
    num: "03",
    title: "Interrogate the system",
    body: "Unlock the hidden axis and watch why a model can look correct while still reproducing an unfair pattern.",
    accent: "teal",
  },
];

const TAKEAWAYS = [
  "A clear intuition for why Overall Accuracy and Equal Opportunity can point in opposite directions.",
  "A felt understanding of why relying on a single feature can quietly enforce inequality.",
  "A stronger habit of asking what evidence the model never got to see.",
];

export default function Landing() {
  return (
    <>
      <Nav />
      <main id="top">
        <section className={styles.hero}>
          <div className={styles.text}>
            <p className="eyebrow">Case file: Novus algorithm division</p>
            <h1 className={styles.display}>Detecting Bias</h1>
            <p className={styles.lede}>
              The city trusts a machine to draw the line. You travel through
              its data, interrogate its verdicts, and expose who disappears on
              the wrong side.
            </p>
            <div className={styles.ctaRow}>
              <Button variant="primary" to="/chapters?intro=story" id="start">
                Open case file
              </Button>
              <Button variant="outline" href="#how">
                Scan clues
              </Button>
            </div>
          </div>

          <figure className={styles.viz} aria-labelledby="vizTitle">
            <svg viewBox="0 0 600 380" role="img" aria-labelledby="vizTitle">
              <title id="vizTitle">
                A machine verdict boundary across two demographic groups
              </title>

              <line x1="60" y1="320" x2="560" y2="320" stroke="#1c2836" strokeWidth="1.5" />
              <line x1="60" y1="40" x2="60" y2="320" stroke="#1c2836" strokeWidth="1.5" />

              <text x="310" y="358" textAnchor="middle" fontSize="13" fill="#8ba4b8" fontFamily="JetBrains Mono, Consolas, monospace">
                TECHNICAL SCORE
              </text>
              <text x="22" y="180" textAnchor="middle" fontSize="13" fill="#8ba4b8" fontFamily="JetBrains Mono, Consolas, monospace" transform="rotate(-90 22 180)">
                EXPERIENCE
              </text>

              {GROUP_A.map(([cx, cy], i) => (
                <circle key={`a-${i}`} cx={cx} cy={cy} r="7" fill="#5b9bd5" opacity="0.9" />
              ))}
              {GROUP_B.map(([cx, cy], i) => (
                <circle key={`b-${i}`} cx={cx} cy={cy} r="7" fill="#b44cf0" opacity="0.9" />
              ))}

              <line
                x1="95"
                y1="290"
                x2="540"
                y2="95"
                stroke="#ff3347"
                strokeWidth="3"
                strokeDasharray="8 8"
                strokeLinecap="round"
                className={styles.boundary}
              />

              <g transform="translate(430, 55)">
                <rect x="-12" y="-8" width="140" height="58" rx="2" fill="#141b22" stroke="#1c2836" strokeWidth="1" />
                <circle cx="4" cy="10" r="6" fill="#5b9bd5" />
                <text x="20" y="14" fontSize="13" fontWeight="500" fill="#dce6f0" fontFamily="JetBrains Mono, Consolas, monospace">
                  Group A
                </text>
                <circle cx="4" cy="32" r="6" fill="#b44cf0" />
                <text x="20" y="36" fontSize="13" fontWeight="500" fill="#dce6f0" fontFamily="JetBrains Mono, Consolas, monospace">
                  Group B
                </text>
              </g>
            </svg>
            <figcaption className={styles.vizCaption}>
              AI verdict boundary: accuracy hides the missing witness.
            </figcaption>
          </figure>
        </section>

        <section className={styles.concept_section} id="concept">
          <div className={styles.concept_inner}>
            <p className="eyebrow eyebrow--light">Machine transcript</p>
            <h2 className="section__title">Accuracy is not<br />an alibi.</h2>
            <p className={styles.concept_lede}>
              Loss functions, gradients, and accuracy scores can all look clean
              while the case file underneath is contaminated. DIET turns that
              hidden record into evidence you can test.
            </p>
          </div>
        </section>

        <section className={styles.how_section} id="how">
          <p className="eyebrow">Three things you will do</p>
          <h2 className="section__title section__title--dark">
            Three clues.<br />One buried truth.
          </h2>

          <div className={styles.how_cards}>
            {STEPS.map((s) => (
              <article
                className={`${styles.how_card} ${styles[`how_accent_${s.accent}`]}`}
                key={s.num}
              >
                <div className={styles.how_num}>{s.num}</div>
                <h3 className={styles.how_title}>{s.title}</h3>
                <p className={styles.how_body}>{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.audience_section} id="audience">
          <div>
            <p className="eyebrow">Why bother?</p>
            <h2 className={`section__title section__title--dark ${styles.audience_title}`}>
              Because your<br />first model<br />will not be neutral.
            </h2>
            <p className={styles.audience_sub}>
              Built for CS and data science students who have been taught to
              chase accuracy, and are starting to wonder what that costs.
            </p>
          </div>
          <div>
            <ol className={styles.audience_goals}>
              {TAKEAWAYS.map((text, i) => (
                <li key={i}>
                  <span className={styles.audience_goalNum}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.audience_goalV}>{text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.cta_section}>
          <p className={`eyebrow ${styles.cta_eyebrow}`}>Case status</p>
          <h2 className={styles.cta_title}>Evidence waiting.</h2>
          <p className={styles.cta_sub}>
            Open the simulator and see why one line can tell two different stories.
          </p>
          <Button variant="primary" size="lg" to="/chapters?intro=story">
            Start investigation
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
