import { Link } from "react-router-dom";

const variantClasses = {
  primary: "button button--primary",
  secondary: "button button--secondary",
  ghost: "button button--ghost",
  danger: "button button--danger"
};

export default function Button({ to, href, variant = "primary", block = false, className = "", children, ...props }) {
  const classes = [variantClasses[variant] || variantClasses.primary, block ? "button--block" : "", className]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
