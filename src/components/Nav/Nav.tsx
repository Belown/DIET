import { type MouseEvent, useEffect, useState } from "react";
import Button from "../Button/Button";
import Logo from "../Logo/Logo";
import styles from "./Nav.module.css";

const NAV_OFFSET = 88;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET);

    window.history.pushState(null, "", `#${id}`);
    window.scrollTo({
      top,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <Logo />
      <nav className={styles.links}>
        <a href="#concept" onClick={(event) => handleSectionClick(event, "concept")}>What's this?</a>
        <a href="#chapters" onClick={(event) => handleSectionClick(event, "chapters")}>Chapters</a>
        <a href="#audience" onClick={(event) => handleSectionClick(event, "audience")}>Why it matters</a>
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
