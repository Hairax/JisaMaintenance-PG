interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  color?: string;
  icon?: React.ReactNode;
}

export default function KpiCard({
  label,
  value,
  hint,
  color = '#1565C0',
  icon,
}: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-100 dark:border-[#2E2E2E] shadow-sm p-4 flex items-start gap-3 min-w-[150px]">
      {icon && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
          style={{ background: `${color}1A`, color }}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {label}
        </div>
        <div className="text-xl font-bold" style={{ color }}>
          {value}
        </div>
        {hint && (
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}
