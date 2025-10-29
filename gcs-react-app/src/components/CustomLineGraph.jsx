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


const CustomLineGraph = ({ title, data, label = 'Home' }) => {
  const navigate = useNavigate();
  // const [backgroundPattern, setBackgroundPattern] = useState('lightblue');
  
  // CHANGE THIS TO THE CORRECT PAGE FOR THE FULL SCREEN GRAPH PAGE
  const handleClick = () => {
    navigate(`/launch?id=${1}`); // TODO: replace this with route to full screen graph page
  };

  // // Create pattern from image
  // useEffect(() => {
  //   const img = new Image();
  //   img.onload = () => {
  //     const canvas = document.createElement('canvas');
  //     const ctx = canvas.getContext('2d');
  //     canvas.width = img.width;
  //     canvas.height = img.height;
  //     ctx.drawImage(img, 0, 0);
      
  //     // Create pattern
  //     const pattern = ctx.createPattern(img, 'repeat');
  //     setBackgroundPattern(pattern);
  //   };
  //   img.src = starClusterImage;
  // }, []);

  const options = {
    scales: {
      x: {
        grid: { display: false },
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        ticks: {
          color: 'black',
          font: { family: 'Nunito', size: 12 },
        },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        min: 0,
        max: 80,
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
        // backgroundColor: backgroundPattern,
        backgroundColor: 'white',
        lineTension: 0.4,
        data,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="custom-line-graph" onClick={handleClick}>
      <Line options={options} data={canvasData} />
    </div>
  );
};

export default CustomLineGraph;
