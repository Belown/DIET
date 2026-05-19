import styles from "./Footer.module.css";

type Props = {
  className?: string;
};

export default function Footer({ className }: Props) {
  return (
    <footer className={`${styles.footer} ${className ?? ""}`.trim()}>
      <span>Θmen — A Time-Travel Investigation</span>
      <span className={styles.meta}>ETH Zurich · 2026</span>
    </footer>
  );
}
