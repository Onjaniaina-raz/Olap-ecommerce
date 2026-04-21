'use client';
import { useState } from 'react';
import { useCubeQuery } from '@cubejs-client/react';
import KpiCard from '@/components/KpiCard';
import RevenueChart from '@/components/RevenueChart';
import CategoryChart from '@/components/CategoryChart';
import RegionChart from '@/components/RegionChart';

const YEARS = ['2023', '2024'];

function useDashboardKpis(dateRange: [string, string]) {
  return useCubeQuery({
    measures: [
      'Orders.totalRevenue',
      'Orders.totalProfit',
      'Orders.count',
      'Orders.avgOrderValue',
      'Orders.returnRate',
      'Orders.profitMargin',
    ],
    timeDimensions: [{
      dimension: 'Orders.orderDate',
      dateRange,
    }],
  });
}

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const dateRange: [string, string] = selectedYear === 'all'
    ? ['2023-01-01', '2024-12-31']
    : [`${selectedYear}-01-01`, `${selectedYear}-12-31`];

  const { resultSet, isLoading } = useDashboardKpis(dateRange);

  const row = resultSet?.tablePivot()[0];
  const fmt = (n: unknown) =>
    Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 0 });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard E-commerce</h1>
          <p className="text-gray-500 mt-1">
            Analyse OLAP —{' '}
            {selectedYear === 'all' ? '2023 & 2024' : `Année ${selectedYear}`}
          </p>
        </div>

        {/* Filtre année */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">Année :</span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                selectedYear === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Tout
            </button>
            {YEARS.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-200 transition-colors ${
                  selectedYear === year
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard
          title="Chiffre d'affaires"
          value={isLoading ? '...' : `${fmt(row?.['Orders.totalRevenue'])} €`}
          subtitle={selectedYear === 'all' ? '2023 & 2024' : `Année ${selectedYear}`}
          color="blue"
        />
        <KpiCard
          title="Profit total"
          value={isLoading ? '...' : `${fmt(row?.['Orders.totalProfit'])} €`}
          subtitle={selectedYear === 'all' ? '2023 & 2024' : `Année ${selectedYear}`}
          color="green"
        />
        <KpiCard
          title="Commandes"
          value={isLoading ? '...' : fmt(row?.['Orders.count'])}
          subtitle={selectedYear === 'all' ? '2023 & 2024' : `Année ${selectedYear}`}
          color="purple"
        />
        <KpiCard
          title="Panier moyen"
          value={isLoading ? '...' : `${fmt(row?.['Orders.avgOrderValue'])} €`}
          color="orange"
        />
        <KpiCard
          title="Marge"
          value={isLoading ? '...' : `${Number(row?.['Orders.profitMargin']).toFixed(1)} %`}
          color="green"
        />
        <KpiCard
          title="Taux de retour"
          value={isLoading ? '...' : `${Number(row?.['Orders.returnRate']).toFixed(1)} %`}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <RevenueChart dateRange={dateRange} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryChart dateRange={dateRange} />
          <RegionChart dateRange={dateRange} />
        </div>
      </div>
    </main>
  );
}