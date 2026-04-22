"use client";
import { useState } from "react";
import { useCubeQuery } from "@cubejs-client/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MEASURES = [
  { value: "Orders.totalRevenue", label: "Chiffre d'affaires" },
  { value: "Orders.totalProfit", label: "Profit total" },
  { value: "Orders.totalCost", label: "Coût total" },
  { value: "Orders.count", label: "Nombre de commandes" },
  { value: "Orders.avgOrderValue", label: "Panier moyen" },
  { value: "Orders.profitMargin", label: "Marge (%)" },
  { value: "Orders.returnRate", label: "Taux de retour (%)" },
];

const DIMENSION_GROUPS = [
  {
    group: "Calendrier",
    color: "blue",
    dimensions: [
      { value: "Calendar.year", label: "Année" },
      { value: "Calendar.quarter", label: "Trimestre" },
      { value: "Calendar.month", label: "Mois" },
    ],
  },
  {
    group: "Produits",
    color: "green",
    dimensions: [
      { value: "Products.category", label: "Catégorie" },
      { value: "Products.subCategory", label: "Sous-catégorie" },
      { value: "Products.name", label: "Produit" },
    ],
  },
  {
    group: "Clients",
    color: "purple",
    dimensions: [
      { value: "Customers.name", label: "Nom client" },
      { value: "Customers.segment", label: "Segment" },
    ],
  },
  {
    group: "Régions",
    color: "orange",
    dimensions: [
      { value: "Regions.city", label: "Ville" },
      { value: "Regions.region", label: "Région" },
      { value: "Regions.country", label: "Pays" },
    ],
  },
  {
    group: "Commandes",
    color: "red",
    dimensions: [{ value: "Orders.status", label: "Statut" }],
  },
];

const GROUP_COLORS: Record<
  string,
  { active: string; badge: string; dot: string }
> = {
  blue: {
    active: "bg-blue-500 text-white",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
  },
  green: {
    active: "bg-green-500 text-white",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-400",
  },
  purple: {
    active: "bg-purple-500 text-white",
    badge: "bg-purple-100 text-purple-700",
    dot: "bg-purple-400",
  },
  orange: {
    active: "bg-orange-500 text-white",
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-400",
  },
  red: {
    active: "bg-red-500 text-white",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-400",
  },
};

const ALL_DIMENSIONS = DIMENSION_GROUPS.flatMap((g) =>
  g.dimensions.map((d) => ({ ...d, color: g.color, group: g.group })),
);

const CHART_TYPES = ["bar", "line", "pie"] as const;
const COLORS = [
  "#60a5fa", 
  "#34d399", 
  "#fbbf24", 
  "#f87171", 
  "#a78bfa", 
  "#f472b6", 
  "#2dd4bf", 
];

export default function ExplorePage() {
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([
    "Orders.totalRevenue",
  ]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([
    "Products.category",
  ]);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");

  // Filtres
  const [yearFilter, setYearFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const toggleMeasure = (v: string) => {
    setSelectedMeasures((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  };

  const toggleDimension = (v: string) => {
    setSelectedDimensions((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  };

  const filters: object[] = [];
  if (segmentFilter !== "all")
    filters.push({
      member: "Customers.segment",
      operator: "equals",
      values: [segmentFilter],
    });
  if (statusFilter !== "all")
    filters.push({
      member: "Orders.status",
      operator: "equals",
      values: [statusFilter],
    });

  const dateRange: [string, string] =
    yearFilter === "all"
      ? ["2023-01-01", "2024-12-31"]
      : [`${yearFilter}-01-01`, `${yearFilter}-12-31`];

  const queryReady =
    selectedMeasures.length > 0 && selectedDimensions.length > 0;

  const { resultSet, isLoading, error } = useCubeQuery(
    queryReady
      ? {
          measures: selectedMeasures,
          dimensions: selectedDimensions,
          timeDimensions: [{ dimension: "Calendar.dateId", dateRange }],
          filters,
          order: { [selectedMeasures[0]]: "desc" },
          limit: 20,
        }
      : { measures: [], dimensions: [] },
    { skip: !queryReady },
  );

  const data = resultSet?.tablePivot() ?? [];

  const fmt = (v: number) =>
    v.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

  // Pour les graphiques on prend la 1ère dimension comme axe X et la 1ère mesure comme valeur
  const chartDimKey = selectedDimensions[0];
  const chartMeasKey = selectedMeasures[0];
  const chartData = data.map((row) => ({
    dim: String(row[chartDimKey] ?? "—"),
    value: Number(row[chartMeasKey] ?? 0),
  }));

  const getMeasureLabel = (v: string) =>
    MEASURES.find((m) => m.value === v)?.label ?? v;
  const getDimensionMeta = (v: string) =>
    ALL_DIMENSIONS.find((d) => d.value === v);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h2 className="text-base font-bold text-gray-800">
              Exploration OLAP
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Sélectionne plusieurs paramètres
            </p>
          </div>

          <div className="p-4 flex flex-col gap-5 flex-1">
            {/* Mesures */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Mesures
                {selectedMeasures.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium">
                    {selectedMeasures.length}
                  </span>
                )}
              </p>
              <div className="flex flex-col gap-1">
                {MEASURES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => toggleMeasure(m.value)}
                    className={`text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedMeasures.includes(m.value)
                        ? "bg-blue-500 text-white font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${
                        selectedMeasures.includes(m.value)
                          ? "border-white bg-white"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedMeasures.includes(m.value) && (
                        <span className="block w-1.5 h-1.5 rounded-sm bg-blue-500" />
                      )}
                    </span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions groupées */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Dimensions
                {selectedDimensions.length > 0 && (
                  <span className="ml-2 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs font-medium">
                    {selectedDimensions.length}
                  </span>
                )}
              </p>
              <div className="flex flex-col gap-4">
                {DIMENSION_GROUPS.map((group) => {
                  const c = GROUP_COLORS[group.color];
                  return (
                    <div key={group.group}>
                      <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                        {group.group}
                      </p>
                      <div className="flex flex-col gap-1">
                        {group.dimensions.map((d) => (
                          <button
                            key={d.value}
                            onClick={() => toggleDimension(d.value)}
                            className={`text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                              selectedDimensions.includes(d.value)
                                ? `${c.active} font-medium`
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <span
                              className={`w-3 h-3 rounded border flex-shrink-0 ${
                                selectedDimensions.includes(d.value)
                                  ? "border-white bg-white/30"
                                  : "border-gray-300"
                              }`}
                            />
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filtres */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Filtres
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Année
                  </label>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
                  >
                    <option value="all">Toutes</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Segment client
                  </label>
                  <select
                    value={segmentFilter}
                    onChange={(e) => setSegmentFilter(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
                  >
                    <option value="all">Tous</option>
                    <option value="New">New</option>
                    <option value="Loyal">Loyal</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Statut commande
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
                  >
                    <option value="all">Tous</option>
                    <option value="completed">Completed</option>
                    <option value="returned">Returned</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Type de graphique */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Visualisation
              </p>
              <div className="flex gap-2">
                {CHART_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                      chartType === t
                        ? "border-blue-500 bg-blue-50 text-blue-600 font-medium"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {t === "bar"
                      ? "Barres"
                      : t === "line"
                        ? "Courbe"
                        : "Camembert"}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setSelectedMeasures([]);
                setSelectedDimensions([]);
              }}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors text-left"
            >
              Réinitialiser la sélection
            </button>
          </div>
        </div>

        {/* ── Zone résultat scrollable ── */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {(selectedMeasures.length > 0 || selectedDimensions.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {selectedMeasures.map((v) => (
                <span
                  key={v}
                  className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
                >
                  {getMeasureLabel(v)}
                  <button
                    onClick={() => toggleMeasure(v)}
                    className="hover:text-blue-900 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedDimensions.map((v) => {
                const meta = getDimensionMeta(v);
                const c = meta ? GROUP_COLORS[meta.color].badge : "";
                return (
                  <span
                    key={v}
                    className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 ${c}`}
                  >
                    {meta?.label ?? v}
                    <button
                      onClick={() => toggleDimension(v)}
                      className="font-bold"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Graph */}
          {!queryReady ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center text-gray-400 h-64">
              Sélectionne au moins une mesure et une dimension
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                {selectedMeasures.map(getMeasureLabel).join(" · ")}
                <span className="text-gray-400 font-normal"> par </span>
                {selectedDimensions
                  .map((v) => getDimensionMeta(v)?.label)
                  .join(" & ")}
              </h2>

              {isLoading && (
                <div className="h-72 flex items-center justify-center text-gray-400">
                  Chargement...
                </div>
              )}
              {error && (
                <div className="h-72 flex items-center justify-center text-red-400">
                  Erreur : {error.message}
                </div>
              )}

              {!isLoading && !error && chartData.length > 0 && (
                <>
                  {chartType === "bar" && (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          tickFormatter={fmt}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="dim"
                          width={140}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {chartType === "line" && (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dim" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  {chartType === "pie" && (
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="dim"
                          cx="50%"
                          cy="50%"
                          outerRadius={130}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmt(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tableau multi-dimensions + multi-mesures */}
          {!isLoading && data.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Données brutes — {data.length} lignes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {selectedDimensions.map((d) => (
                        <th
                          key={d}
                          className="text-left py-2 px-3 text-gray-500 font-medium whitespace-nowrap"
                        >
                          {getDimensionMeta(d)?.label ?? d}
                        </th>
                      ))}
                      {selectedMeasures.map((m) => (
                        <th
                          key={m}
                          className="text-right py-2 px-3 text-gray-500 font-medium whitespace-nowrap"
                        >
                          {getMeasureLabel(m)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        {selectedDimensions.map((d) => (
                          <td
                            key={d}
                            className="py-2 px-3 text-gray-700 whitespace-nowrap"
                          >
                            {String(row[d] ?? "—")}
                          </td>
                        ))}
                        {selectedMeasures.map((m) => (
                          <td
                            key={m}
                            className="py-2 px-3 text-right font-medium text-gray-800 whitespace-nowrap"
                          >
                            {fmt(Number(row[m] ?? 0))}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
