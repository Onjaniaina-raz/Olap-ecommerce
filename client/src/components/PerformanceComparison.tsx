"use client";
import { useState } from "react";
import cubejsApi from "@/lib/cube";

const QUERY = {
  measures: ["Orders.totalRevenue", "Orders.totalProfit", "Orders.count"],
  timeDimensions: [
    {
      dimension: "Orders.orderDate",
      granularity: "month" as const,
      dateRange: ["2023-01-01", "2024-12-31"] as [string, string],
    },
  ],
};

function BenchmarkBar({
  label,
  ms,
  max,
  color,
  sublabel,
}: {
  label: string;
  ms: number | null;
  max: number;
  color: string;
  sublabel: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <div>
          <span className="text-gray-600 font-medium">{label}</span>
          <span className="text-gray-400 text-xs ml-2">{sublabel}</span>
        </div>
        <span className="font-bold text-gray-800">
          {ms === null ? "..." : `${ms} ms`}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-4">
        {ms !== null && max > 0 && (
          <div
            className={`${color} h-4 rounded-full transition-all duration-700`}
            style={{ width: `${(ms / max) * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}

export default function PerformanceComparison() {
  const [firstMs, setFirstMs] = useState<number | null>(null);
  const [secondMs, setSecondMs] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  async function runBenchmark() {
    setRunning(true);
    setFirstMs(null);
    setSecondMs(null);
    setDone(false);

    try {
      // ── Requête 1 : construction de la pré-agrégation ─────────
      const t1 = performance.now();
      await cubejsApi.load(QUERY);
      const t2 = performance.now();
      setFirstMs(Math.round(t2 - t1));

      // ── Requête 2 : lecture depuis Cube Store (cache) ──────────
      const t3 = performance.now();
      await cubejsApi.load(QUERY);
      const t4 = performance.now();
      setSecondMs(Math.round(t4 - t3));
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
      setDone(true);
    }
  }

  const max = Math.max(firstMs ?? 0, secondMs ?? 0);
  const ratio =
    firstMs && secondMs && firstMs > secondMs
      ? Math.round(firstMs / secondMs)
      : null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-700">
          Impact des pré-agrégations
        </h2>
        <button
          onClick={runBenchmark}
          disabled={running}
          className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {running ? "⏳ Mesure en cours..." : "▶ Lancer le benchmark"}
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        Requête identique sur 20 000 lignes — 1ère exécution vs 2ème exécution
      </p>

      <div className="space-y-5">
        <BenchmarkBar
          label="1ère requête"
          sublabel="construction pré-agrégation"
          ms={firstMs}
          max={max}
          color="bg-orange-400"
        />
        <BenchmarkBar
          label="2ème requête"
          sublabel="lecture depuis Cube Store ⚡"
          ms={secondMs}
          max={max}
          color="bg-green-400"
        />
      </div>

      {done && ratio && (
        <p className="text-xs text-gray-400 mt-6 text-center">
          La 2ème requête est{" "}
          <span className="font-bold text-green-600">{ratio}x plus rapide</span>{" "}
          grâce aux pré-agrégations
        </p>
      )}

      {done && !ratio && (
        <p className="text-xs text-orange-400 mt-6 text-center">
          Les deux requêtes sont similaires — les pré-agrégations sont déjà en
          cache 
        </p>
      )}
    </div>
  );
}
