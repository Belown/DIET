import { Link, useLocation } from "react-router-dom";
import type { MouseEvent } from "react";
import styles from "./Logo.module.css";

type Props = {
  className?: string;
};

export default function Logo({ className }: Props) {
  const location = useLocation();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    if (location.pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: 0, left: 0 });
  };

  return (
    <Link to="/" className={`${styles.logo} ${className ?? ""}`.trim()} onClick={handleClick}>
      <span className={styles.mark}>Θ</span>men<span className={styles.dot}>.</span>
    </Link>
  );
}
