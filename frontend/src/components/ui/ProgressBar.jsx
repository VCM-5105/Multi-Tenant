export default function ProgressBar({ value = 0, max = 100, showLabel = true, className = "" }) {
  const percentage = Math.min(Math.max(Math.round(value), 0), max);

  // Dynamic bar coloring based on completion level
  let barColor = "bg-indigo-600";
  if (percentage === 100) barColor = "bg-emerald-500";
  else if (percentage < 25) barColor = "bg-slate-400";

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-medium text-slate-600">
          <span>Derived Progress</span>
          <span className="font-semibold text-slate-900">{percentage}%</span>
        </div>
      )}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
        <div
          className={`h-full transition-all duration-500 rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
