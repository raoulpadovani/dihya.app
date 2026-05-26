const toneClasses = {
  neutral: "status-badge--neutral",
  success: "status-badge--success",
  warning: "status-badge--warning",
  danger: "status-badge--danger",
  accent: "status-badge--accent"
};

export default function StatusBadge({ children, tone = "neutral", className = "" }) {
  return (
    <span className={["status-badge", toneClasses[tone] || toneClasses.neutral, className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
