"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

export default function RainChart({ district, t }) {
  const labels = district.history.map((_, index) => `${(index + 1) * 6}h`);
  const data = {
    labels,
    datasets: [
      {
        label: t.rainfall,
        data: district.history,
        borderColor: district.level.color,
        backgroundColor: "rgba(32, 220, 196, 0.16)",
        borderWidth: 3,
        pointBackgroundColor: "#e9fbff",
        pointBorderColor: district.level.color,
        pointRadius: 3,
        tension: 0.38,
        fill: true,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(5, 17, 32, 0.92)",
        borderColor: "rgba(125, 230, 255, 0.24)",
        borderWidth: 1,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(148, 163, 184, 0.08)" },
        ticks: { color: "rgba(218, 241, 255, 0.62)" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: {
          color: "rgba(218, 241, 255, 0.62)",
          callback: (value) => `${value}mm`,
        },
      },
    },
  };

  return (
    <section className="dashboard-panel chart-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t.forecast}</p>
          <h2>{district.name}</h2>
        </div>
        <span className="metric-pill">{district.riskScore}/100</span>
      </div>
      <div className="rain-chart-frame">
        <Line data={data} options={options} />
      </div>
    </section>
  );
}
