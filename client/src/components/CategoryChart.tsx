'use client';
import { useCubeQuery } from '@cubejs-client/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = [
  "#60a5fa", 
  "#34d399", 
  "#fbbf24", 
  "#f87171", 
  "#a78bfa", 
  "#f472b6", 
  "#2dd4bf", 
];

interface Props {
  dateRange: [string, string];
}

export default function CategoryChart({ dateRange }: Props) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['Orders.totalRevenue'],
    dimensions: ['Products.category'],
    timeDimensions: [{
      dimension: 'Orders.orderDate',
      dateRange,
    }],
    order: { 'Orders.totalRevenue': 'desc' },
  });

  if (isLoading) return <div className="h-72 flex items-center justify-center text-gray-400">Chargement...</div>;
  if (error)     return <div className="h-72 flex items-center justify-center text-red-400">Erreur : {error.message}</div>;

  const data = resultSet?.tablePivot().map(row => ({
    category: row['Products.category'] as string,
    revenue:  Math.round(Number(row['Orders.totalRevenue'])),
  })) ?? [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Chiffre d'affaires par catégorie</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} />
          <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} €`} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}