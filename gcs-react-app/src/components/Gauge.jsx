import React from 'react';
import Plot from 'react-plotly.js';

const Gauge = ({ value, min, max, title }) => {
  const data = [
    {
      domain: { x: [0, 1], y: [0, 1] },
      value: value,
      title: { text: title },
      type: 'indicator',
      mode: 'gauge+number',
      gauge: {
        axis: { range: [min, max] },

        // uncomment for colored ranges (ex if you want to show the range we want to be in as yellow )
        // steps: [
        //   { range: [min, (max - min) / 3], color: 'red' },
        //   { range: [(max - min) / 3, 2 * (max - min) / 3], color: 'yellow' },
        //   { range: [2 * (max - min) / 3, max], color: 'green' },
        // ],

      },
    },
  ];

  const layout = { width: 800, height: 600 };

  return <Plot data={data} layout={layout} />;
};

export default Gauge;