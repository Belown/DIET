import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Button.module.css";

type Variant = "primary" | "outline" | "ghost-dark";
type Size = "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    to?: undefined;
  };

type LinkProps = CommonProps & {
  to: string;
  id?: string;
};

type Props = AnchorProps | LinkProps;

const variantClass: Record<Variant, string> = {
  primary: styles.primary,
  outline: styles.outline,
  "ghost-dark": styles.ghostDark,
};

export default function Button(props: Props) {
  const { variant = "primary", size = "md", className, children } = props;

  const classes = [
    styles.btn,
    variantClass[variant],
    size === "lg" ? styles.lg : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if ("to" in props && props.to !== undefined) {
    return (
      <Link to={props.to} id={props.id} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as AnchorProps;
  return (
    <a className={classes} {...rest}>
      {children}
    </a>
  );
}
