import { useEffect, useState } from "react";
import Button from "../Button/Button";
import Logo from "../Logo/Logo";
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
      <Logo />
      <nav className={styles.links}>
        <a href="#concept">What's this?</a>
        <a href="#chapters">Chapters</a>
        <a href="#audience">Why it matters</a>
      </nav>
      <div className={styles.cta}>
        <Button variant="ghost-dark" to="/about">
          About
        </Button>
        <Button variant="primary" to="/chapters?intro=story">
          Start investigation
        </Button>
      </div>
    </header>
  );
}
