import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

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

const graphStyle = {
  minHeight: '20rem',
  maxWidth: '1000px',
  width: '100%',
  border: '1px solid #C4C4C4',
  borderRadius: '0.375rem',
  padding: '0.5rem',
  marginBottom: '1rem', // Space between charts
};

const CustomLineGraph = ({ title, data, label = 'Home' }) => {
  const options = {
    scales: {
      x: {
        grid: { display: false },
        labels: [1, 2, 3, 4, 5],
        ticks: {
          color: 'black',
          font: { family: 'Nunito', size: 12 },
        },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        suggestedMin: 0,
        suggestedMax: 300,
        ticks: {
          stepSize: 10,
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
    datasets: [
      {
        label,
        borderColor: 'black',
        pointRadius: 0,
        fill: true,
        backgroundColor: 'lightblue',
        lineTension: 0.4,
        data,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={graphStyle}>
      <Line options={options} data={canvasData} />
    </div>
  );
};

export default CustomLineGraph;
