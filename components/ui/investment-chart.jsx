"use client";

import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function InvestmentChart({ data }) {
  return <Bar data={data} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />;
}
