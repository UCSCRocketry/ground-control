import React from 'react';
import CustomLineGraph from "./../components/CustomLineGraph";


const generateData = () =>
  Array.from({ length: 10 }, () => Math.floor(Math.random() * 60 + 10));

const Dashboard = () => {
  const velocityData = generateData();
  const accelerationData = generateData();

  return (
    <div>
      <CustomLineGraph title="Velocity" data={velocityData} label="Velocity" />
      <CustomLineGraph title="Acceleration" data={accelerationData} label="Acceleration" />
    </div>
  );
};

export default Dashboard;

