'use client';
import { useCubeQuery } from '@cubejs-client/react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import dayjs from 'dayjs';

interface Props {
  dateRange: [string, string];
}

export default function RevenueChart({ dateRange }: Props) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['Orders.totalRevenue', 'Orders.totalProfit'],
    timeDimensions: [{
      dimension: 'Orders.orderDate',
      granularity: 'month',
      dateRange,
    }],
    order: { 'Orders.orderDate': 'asc' },
  });

  if (isLoading) return <div className="h-72 flex items-center justify-center text-gray-400">Chargement...</div>;
  if (error)     return <div className="h-72 flex items-center justify-center text-red-400">Erreur : {error.message}</div>;

  const data = resultSet?.tablePivot().map(row => ({
    month:   dayjs(row['Orders.orderDate.month'] as string).format('MMM YYYY'),
    revenue: Math.round(Number(row['Orders.totalRevenue'])),
    profit:  Math.round(Number(row['Orders.totalProfit'])),
  })) ?? [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Chiffre d'affaires & Profit mensuel</h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} />
          <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} €`} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Chiffre d'affaires" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="profit"  stroke="#10b981" name="Profit" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}