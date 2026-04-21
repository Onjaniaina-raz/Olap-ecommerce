'use client';
import { useCubeQuery } from '@cubejs-client/react';
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface Props {
  dateRange: [string, string];
}

export default function RegionChart({ dateRange }: Props) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['Orders.totalRevenue'],
    dimensions: ['Regions.city'],
    timeDimensions: [{
      dimension: 'Orders.orderDate',
      dateRange,
    }],
    order: { 'Orders.totalRevenue': 'desc' },
  });

  if (isLoading) return <div className="h-72 flex items-center justify-center text-gray-400">Chargement...</div>;
  if (error)     return <div className="h-72 flex items-center justify-center text-red-400">Erreur : {error.message}</div>;

  const data = resultSet?.tablePivot().map(row => ({
    name:  row['Regions.city'] as string,
    value: Math.round(Number(row['Orders.totalRevenue'])),
  })) ?? [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Chiffre d'affaires par ville</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} €`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}