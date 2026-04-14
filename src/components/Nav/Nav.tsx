import { useEffect, useState } from "react";
import Button from "../Button/Button";
import styles from "./Nav.module.css";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <a className={styles.brand} href="#top">
        DIET<span className={styles.dot}>.</span>
      </a>
      <nav className={styles.links}>
        <a href="#concept">What's this?</a>
        <a href="#how">How it works</a>
        <a href="#audience">Why it matters</a>
      </nav>
      <div className={styles.cta}>
        <Button variant="ghost-dark" to="/about">
          Read the brief
        </Button>
        <Button variant="primary" to="/simulator">
          Start exploring
        </Button>
      </div>
    </header>
  );
}
