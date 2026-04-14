import { Link } from "react-router-dom";
import Nav from "../components/Nav/Nav";
import Footer from "../components/Footer/Footer";
import styles from "./About.module.css";

export default function About() {
  return (
    <>
      <Nav />
      <main className={styles.page}>
        <section className={styles.section}>
          <p className="eyebrow">About the project</p>
          <h1 className={styles.title}>
            A sandbox for thinking about fairness.
          </h1>
          <p className={styles.lede}>
            DIET is a teaching prototype built around one idea: an accurate
            model isn't the same thing as a fair one. You'll train a tiny
            classifier on synthetic CV data, audit it, and watch what happens
            when "good enough" accuracy leaves a whole group behind.
          </p>
          <div className={styles.facts}>
            <div className={styles.fact}>
              <span className={styles.factK}>Audience</span>
              <span className={styles.factV}>
                Undergrad CS students meeting ML fairness for the first time.
              </span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factK}>Format</span>
              <span className={styles.factV}>
                A three-phase interactive sandbox — no lectures, no quizzes.
              </span>
            </div>
            <div className={styles.fact}>
              <span className={styles.factK}>Status</span>
              <span className={styles.factV}>
                Prototype, under active development in 2026.
              </span>
            </div>
          </div>
          <Link to="/simulator" className={styles.back}>
            → Open the simulator
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
