export default function Input({ label, as = "input", helperText, className = "", children, ...props }) {
  let control = null;

  if (as === "textarea") {
    control = <textarea className={["field__control", className].filter(Boolean).join(" ")} {...props} />;
  } else if (as === "select") {
    control = (
      <select className={["field__control", className].filter(Boolean).join(" ")} {...props}>
        {children}
      </select>
    );
  } else {
    control = <input className={["field__control", className].filter(Boolean).join(" ")} {...props} />;
  }

  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {control}
      {helperText ? <small className="field__helper">{helperText}</small> : null}
    </label>
  );
}
