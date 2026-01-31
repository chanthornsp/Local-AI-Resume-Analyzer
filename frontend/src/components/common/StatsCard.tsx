/**
 * StatsCard Component
 * 
 * Displays a single statistic with icon and styling.
 */

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'gray';
  subtext?: string;
}

export function StatsCard({ label, value, icon, color = 'blue', subtext }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className={`rounded-lg border p-5 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {subtext && <p className="text-xs opacity-75">{subtext}</p>}
    </div>
  );
}
