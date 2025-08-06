import React, { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ComparisonChart = ({ title, labels, values }) => {
  const data = {
    labels,
    datasets: [
      {
        label: title, // this is the dataset label (shows in legend if enabled)
        data: values.map(v => Number(v) || 0),
        backgroundColor: labels.map((_, i) => {
          const colors = ['#6b5b95', '#feb236', '#d64161', '#ff7b25', '#86af49'];
          return colors[i % colors.length];
        }),
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false }, // legend off (optional)
      title: {
        display: true, // ✅ explicitly enable title
        text: title,   // ✅ this is the chart title text
        font: { size: 16 },
      },
    },
    scales: {
      x: { beginAtZero: true },
    },
  };

  return <Bar data={data} options={options} />;
};


export default ComparisonChart;
