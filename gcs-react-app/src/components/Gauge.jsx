import React from 'react';
import Plot from 'react-plotly.js';
import {useNavigate}  from 'react-router-dom';

export default function Gauge({ value, min, max, title }) {
    const navigate = useNavigate();
      
    // navigate to a f  ull screen graph page
    const handleClick = () => {
      navigate(`/launch?id=${1}`); //TODO: replace this with route to full screen graph page
  };

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

    // datarevision makes the component dynamic 
    // const layout = { width: 800, height: 600, margin: { t: 0, b: 0 }, datarevision: value };
    const layout = { 
        autosize: true,
        margin: { t: 20, b: 0, l: 25, r:40 }, 
        datarevision: value,
        paper_bgcolor: 'white',
    };

    return (
      <div className="graph-container"> {/* launch-container -> graph-container */}
        <main id="gauge" onClick={handleClick}> {/* launch -> gauge */}
        {/* <Plot data={data} layout={layout} /> */}
          <Plot 
            data={data} 
            layout={layout} 
            useResizeHandler={true}
            style={{width: '100%', height: '100%'}}
          />
        </main>
      </div>

    ) 
}