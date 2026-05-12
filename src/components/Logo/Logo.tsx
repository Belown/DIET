import { Link } from "react-router-dom";
import styles from "./Logo.module.css";

type Props = {
  className?: string;
};

export default function Logo({ className }: Props) {
  return (
    <Link to="/" className={`${styles.logo} ${className ?? ""}`.trim()}>
      TELLTALE<span className={styles.dot}>.</span>
    </Link>
  );
}
