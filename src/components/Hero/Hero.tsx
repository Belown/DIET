import Button from "../Button/Button";
import styles from "./Hero.module.css";

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

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.text}>
        <p className="eyebrow">A hands-on playground for AI bias</p>
        <h1 className={styles.display}>
          Can a line<br />be unfair?
        </h1>
        <p className={styles.lede}>
          Every machine learning model draws a line somewhere. In this
          sandbox, <em>you'll</em> draw it yourself — on real-looking CV
          data — and watch what happens to the people on the other side.
          No lectures. No pre-reading. Just you, the data, and a few
          uncomfortable questions.
        </p>
        <div className={styles.ctaRow}>
          <Button variant="primary" to="/simulator" id="start">
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
          Here's the same scatter plot you'll see in phase 1. Can you find
          a line that's fair to both groups <em>and</em> accurate? That's
          the whole puzzle.
        </figcaption>
      </figure>
    </section>
  );
}
