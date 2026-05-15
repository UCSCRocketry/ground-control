import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import '../styles/CustomLineGraph.css';
import starClusterImage from '../assets/starCluster.jpg';

// Register necessary chart.js components and plugins
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const plugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart, args, options) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = options.color || '#99ffff';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};
ChartJS.register(plugin);


const CustomLineGraph = ({ title, data, label = 'Home', clickable = true }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
  navigate('/fullscreen-graph', {
    state: {
      title,
      data: resolvedData,
      label,
    },
  });
};

  const resolvedData = Array.isArray(data) ? data : [];
  const hasData = resolvedData.length > 0;
  const rawMin = hasData ? Math.min(...resolvedData) : 0;
  const rawMax = hasData ? Math.max(...resolvedData) : 80;
  const range = rawMax - rawMin;
  const padding = range === 0 ? Math.max(1, Math.abs(rawMax) * 0.1) : range * 0.1;
  const yMin = hasData ? rawMin - padding : 0;
  const yMax = hasData ? rawMax + padding : 80;
  const labels = resolvedData.map((_, idx) => idx + 1);

  const options = {
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: 'black',
          font: { family: 'Nunito', size: 12 },
        },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        min: yMin,
        max: yMax,
        ticks: {
          color: 'black',
          font: { family: 'Nunito', size: 12 },
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      customCanvasBackgroundColor: { color: 'white' },
      legend: { display: false },
      title: { display: true, text: title },
    },
  };

  const canvasData = {
    labels,
    datasets: [
      {
        label,
        borderColor: 'black',
        pointRadius: 0,
        fill: true,
        // backgroundColor: backgroundPattern,
        backgroundColor: 'white',
        lineTension: 0.4,
        data: resolvedData,
        borderWidth: 1,
      },
    ],
  };

  return (
  <div
    className="custom-line-graph"
    onClick={clickable ? handleClick : undefined}
    style={{ cursor: clickable ? 'pointer' : 'default' }}
  >
    <Line options={options} data={canvasData} />
  </div>
);
};

export default CustomLineGraph;
