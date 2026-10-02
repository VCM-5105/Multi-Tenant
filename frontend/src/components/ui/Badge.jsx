export default function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    brand: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  // Auto-detect based on text value
  const lower = String(children || "").toLowerCase();
  let selected = variant;
  if (selected === "default") {
    if (["active", "completed", "resolved"].includes(lower)) selected = "success";
    else if (["in_progress", "in_review", "pending"].includes(lower)) selected = "warning";
    else if (["suspended", "declined", "urgent", "overdue"].includes(lower)) selected = "danger";
  }

  const appliedClass = variants[selected] || variants.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${appliedClass} ${className}`}
    >
      {children}
    </span>
  );
}
