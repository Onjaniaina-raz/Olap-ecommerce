interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export default function KpiCard({ title, value, subtitle, color = 'blue' }: KpiCardProps) {
  const colors: Record<string, string> = {
    blue:   'border-blue-500 bg-blue-50',
    green:  'border-green-500 bg-green-50',
    purple: 'border-purple-500 bg-purple-50',
    orange: 'border-orange-500 bg-orange-50',
  };

  return (
    <div className={`rounded-xl border-l-4 p-5 shadow-sm ${colors[color]}`}>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}