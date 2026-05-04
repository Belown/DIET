import Nav from "../../components/Nav/Nav";
import Footer from "../../components/Footer/Footer";
import Button from "../../components/Button/Button";
import styles from "./Landing.module.css";

// Definition of the data points for the hero section
const GROUP_A: Array<[number, number]> = [
  [160, 190], [200, 170], [240, 150], [280, 135], [320, 120],
  [360, 110], [400, 100], [440, 85],  [480, 75],  [520, 60],
  [260, 185], [330, 155], [390, 135],
  [220, 255], [350, 210],
];

const GROUP_B: Array<[number, number]> = [
  [100, 295], [140, 275], [180, 260], [220, 250], [260, 230],
  [300, 215], [340, 200], [380, 180], [150, 310], [230, 290],
  [290, 265], [420, 170], [460, 155],
  [110, 245], [180, 225],
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
    title: "Meet the data",
    body: "Open the dataset and get to know 200 candidates. Spot the patterns, find your favorites, and see what your model is about to learn from.",
    accent: "blue",
  },
  {
    num: "02",
    title: "Draw the line",
    body: "Sketch a decision boundary right on the scatter plot. Push your accuracy as high as you can — then watch how the same line tells two very different stories.",
    accent: "pink",
  },
  {
    num: "03",
    title: "Unlock the third axis",
    body: "Push your accuracy even higher with 3D surface — and discover why a model can be 90% right and still intrinsically favor one group far more often than the other.",
    accent: "teal",
  },
];

const TAKEAWAYS = [
  "A clear intuition for why Overall Accuracy and Equal Opportunity can point in opposite directions — and the math to back it up.",
  "A felt understanding of why relying on a single feature quietly enforces inequality — and concrete ways to push back.",
  "Questions you didn't have before. The good kind. The kind you bring to your next ML lecture.",
];

export default function Landing() {
  return (
    <>
      <Nav />
      <main id="top">
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.text}>
            <p className="eyebrow">A hands-on playground for AI bias</p>
            <h1 className={styles.display}>
              Can a line<br />be unfair?
            </h1>
            <p className={styles.lede}>
              Every model draws a line somewhere. Here, <em>you'll</em> draw it yourself — on real-looking CV data — and see who ends up on the other side.
            </p>
            <div className={styles.ctaRow}>
              <Button variant="primary" to="/chapters" id="start">
                Start exploring
              </Button>
              <Button variant="outline" href="#how">
                How it works
              </Button>
            </div>
          </div>

          <figure className={styles.viz} aria-labelledby="vizTitle">
            <svg viewBox="0 0 600 380" role="img" aria-labelledby="vizTitle">
              <title id="vizTitle">
                A 2D decision boundary across two demographic groups
              </title>

              <line x1="60" y1="320" x2="560" y2="320" stroke="#c9c9cd" strokeWidth="1.5" />
              <line x1="60" y1="40" x2="60" y2="320" stroke="#c9c9cd" strokeWidth="1.5" />

              <text x="310" y="358" textAnchor="middle" fontSize="13" fill="#8d969e" fontFamily="Inter, sans-serif">
                Technical Score →
              </text>
              <text x="22" y="180" textAnchor="middle" fontSize="13" fill="#8d969e" fontFamily="Inter, sans-serif" transform="rotate(-90 22 180)">
                Experience →
              </text>

              {GROUP_A.map(([cx, cy], i) => (
                <circle key={`a-${i}`} cx={cx} cy={cy} r="7" fill="#494fdf" opacity="0.9" />
              ))}
              {GROUP_B.map(([cx, cy], i) => (
                <circle key={`b-${i}`} cx={cx} cy={cy} r="7" fill="#e61e49" opacity="0.9" />
              ))}

              <line
                x1="95" y1="290" x2="540" y2="95"
                stroke="#191c1f" strokeWidth="3"
                strokeDasharray="8 8" strokeLinecap="round"
                className={styles.boundary}
              />

              <g transform="translate(430, 55)">
                <rect x="-12" y="-8" width="140" height="58" rx="10" fill="#ffffff" stroke="#c9c9cd" strokeWidth="1" />
                <circle cx="4" cy="10" r="6" fill="#494fdf" />
                <text x="20" y="14" fontSize="13" fontWeight="500" fill="#191c1f" fontFamily="Inter, sans-serif">
                  Group A
                </text>
                <circle cx="4" cy="32" r="6" fill="#e61e49" />
                <text x="20" y="36" fontSize="13" fontWeight="500" fill="#191c1f" fontFamily="Inter, sans-serif">
                  Group B
                </text>
              </g>
            </svg>
            <figcaption className={styles.vizCaption}>
              Find a line that's fair to both groups <em>and</em> accurate.
            </figcaption>
          </figure>
        </section>

        {/* Concept Section */}
        <section className={styles.concept_section} id="concept">
          <div className={styles.concept_inner}>
            <p className="eyebrow eyebrow--light">The short version</p>
            <h2 className="section__title">
              An accurate model isn't<br />the same thing as a fair one.
            </h2>
            <p className={styles.concept_lede}>
              Your ML class probably frames models as math: loss functions, gradients, accuracy scores. This is the other half of the story — where those numbers land on actual people, and where two candidates with identical qualifications can walk away with very different outcomes. We'll show you, not tell you.
            </p>
          </div>
        </section>

        {/* How Section */}
        <section className={styles.how_section} id="how">
          <p className="eyebrow">Three things you'll do</p>
          <h2 className="section__title section__title--dark">
            Three phases.<br />One manifold.
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

        {/* Audience Section */}
        <section className={styles.audience_section} id="audience">
          <div className={styles.audience_left}>
            <p className="eyebrow">Why bother?</p>
            <h2 className={`section__title section__title--dark ${styles.audience_title}`}>
              Because your<br />first model<br />won't be neutral.
            </h2>
            <p className={styles.audience_sub}>
              Built for CS and data science students who've been taught to chase accuracy, and are starting to wonder what that costs.
            </p>
          </div>
          <div className={styles.audience_right}>
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

        {/* CTA Section */}
        <section className={styles.cta_section}>
          <p className={`eyebrow ${styles.cta_eyebrow}`}>What about now</p>
          <h2 className={styles.cta_title}>Curious yet?</h2>
          <p className={styles.cta_sub}>
            Try out the sandbox, see why a line can tell 2 different stories.
          </p>
          <Button variant="primary" size="lg" to="/chapters">
            Start exploring
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
