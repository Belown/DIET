import { Link } from "react-router-dom";
import Nav from "../../components/Nav/Nav";
import Footer from "../../components/Footer/Footer";
import styles from "./About.module.css";

export default function About() {
  return (
    <>
      <Nav />
      <main className={styles.page}>
        <section className={styles.section}>
          <p className="eyebrow">About the project</p>
          <h1 className={styles.title}>
            A time-travel case file for AI fairness.
          </h1>
          <p className={styles.lede}>
            Θmen is a teaching prototype about how AI bias enters a system
            before anyone sees the final verdict. Players investigate Novus by
            tracing bias through data collection, algorithmic fairness choices,
            and human feedback used to guide AI behavior.
          </p>
          <div className={styles.facts}>
            <div className={styles.fact}>
              <span className={styles.factK}>Audience</span>
              <span className={styles.factV}>
                Non-CS students meeting AI fairness for the first time.
              </span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factK}>Format</span>
              <span className={styles.factV}>
                A three-chapter interactive investigation.
              </span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factK}>Chapters</span>
              <span className={styles.factV}>
                Sampling Bias, COMPAS Trade-offs, and LLM Alignment.
              </span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factK}>Team</span>
              <span className={styles.factV}>
                Wanglei Shen, Zihan Li, Inés Araujo, Sophia Kacem, Rui Wang.
              </span>
            </div>
          </div>
          <Link to="/chapters" className={styles.back}>
            Open the chapters
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
