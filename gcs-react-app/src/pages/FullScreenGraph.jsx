import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomLineGraph from '../components/CustomLineGraph';
import '../styles/FullScreenGraph.css';

const FullScreenGraph = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { title, data, label } = location.state || {};

  if (!data) {
    return (
      <div className="full-screen-graph-page">
        <button className="full-screen-back-button" onClick={() => navigate(-1)}>
          Back
        </button>

        <h2>No chart data found.</h2>
      </div>
    );
  }

  return (
    <div className="full-screen-graph-page">
      <button className="full-screen-back-button" onClick={() => navigate(-1)}>
        Back
      </button>

      <div className="full-screen-graph-wrapper">
        <CustomLineGraph
          title={title}
          data={data}
          label={label}
          clickable={false}
        />
      </div>
    </div>
  );
};

export default FullScreenGraph;