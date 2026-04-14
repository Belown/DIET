import type { AnchorHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "outline" | "ghost-dark";
type Size = "md" | "lg";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary: styles.primary,
  outline: styles.outline,
  "ghost-dark": styles.ghostDark,
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: Props) {
  const classes = [
    styles.btn,
    variantClass[variant],
    size === "lg" ? styles.lg : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a className={classes} {...rest}>
      {children}
    </a>
  );
}
