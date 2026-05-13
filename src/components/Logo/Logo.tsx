import { Link } from "react-router-dom";
import styles from "./Logo.module.css";

type Props = {
  className?: string;
};

export default function Logo({ className }: Props) {
  return (
    <Link to="/" className={`${styles.logo} ${className ?? ""}`.trim()}>
      <span className={styles.mark}>Θ</span>men<span className={styles.dot}>.</span>
    </Link>
  );
}
