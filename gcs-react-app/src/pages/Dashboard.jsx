import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client"
import {useNavigate}  from 'react-router-dom';
import Gauge from '../components/Gauge';
import CustomLineGraph from '../components/CustomLineGraph';
import '../styles/Dashboard.css';


//implements the dashboard page including backend connection and data handling
export default function Dashboard() {
    //BACKEND CONNECTION AND DATA HANDLING
    const [IMU, setIMU] = useState([]); //initilize values (to []) for Gauge component 

    // useEffect to connect to socket and receive data (backend)
    useEffect(() => {
        const socket = io("localhost:9999/", {
            transports: ["websocket"],
            cors: {
                origin: "http://localhost:3000/",
            },
        });

        socket.connect();
        
        socket.on("connect", (data) => {
            console.log("Connect event");
        });

        socket.on("connected", (data) => {
            console.log(data);
            console.log("Connected!");
        });

        socket.on("reconnect", (data) => {
            console.log("Reconnected!");
        })

        socket.on("send_data_IMU", (data) => {
            console.log(data);
            console.log("Received data!");
            setIMU(IMU => [...IMU, ...data.data, 0]);
            setIMU(IMU => IMU.slice(-6, -1));
        });

        socket.on("disconnect", (data) => {
            console.log(data);
            console.log("Disconnected!");
        });

        return () => {
            socket.offAny();
            socket.disconnect();
        }
        
    }, []);

    // once the IMU value exceeds 100, then dynamically update the max value to be 100 or higher, 
    // dont ever decrease the max val for scope of relativity
    const latestVal = IMU[IMU.length - 1] || 0;
    const [maxVal, setMaxVal] = useState(100);
    if (latestVal > maxVal) {
        const increments = Math.ceil((latestVal - maxVal) / 100);
        setMaxVal(prev => prev + increments * 100);
    }

    const generateData = () =>
        Array.from({ length: 10 }, () => Math.floor(Math.random() * 60 + 10));
      
    const altitudeData = generateData();
    const velocityData = generateData();
    const pitchData = generateData();
    const rollData = generateData();
    const yawData = generateData();
    const accelerationData = generateData();

    //FRONTEND VISUALIZATION
    return ( //returns the dashboard page with the gauges and the data 
        <main>
            <h1 className="dashboard-title">Dashboard</h1>
            <div className="main-dashboard-layout">
                {/* Left side - line graphs */}
                <div className="graphs-section">
                    <CustomLineGraph 
                        data={altitudeData} 
                        title="Altitude" 
                        xLabel="Time (s)" 
                        yLabel="Altitude (ft)" 
                    />
                    <CustomLineGraph 
                        data={pitchData} 
                        title="Pitch" 
                        xLabel="Time (s)" 
                        yLabel="Pitch (deg)" 
                    />
                    <CustomLineGraph 
                        data={velocityData} 
                        title="Velocity" 
                        xLabel="Time (s)" 
                        yLabel="Velocity (m/s)" 
                    />
                    <CustomLineGraph 
                        data={yawData} 
                        title="Yaw" 
                        xLabel="Time (s)" 
                        yLabel="Yaw (deg)" 
                    />
                    <CustomLineGraph 
                        data={accelerationData} 
                        title="Acceleration" 
                        xLabel="Time (s)" 
                        yLabel="Acceleration (m/s^2)" 
                    />
                    <CustomLineGraph 
                        data={rollData} 
                        title="Roll" 
                        xLabel="Time (s)" 
                        yLabel="Roll (deg)" 
                    />
                    <CustomLineGraph 
                        data={accelerationData} 
                        title="EXTRA" 
                        xLabel="Time (s)" 
                        yLabel="Acceleration (m/s^2)" 
                    />
                    <CustomLineGraph 
                        data={rollData} 
                        title="EXTRA" 
                        xLabel="Time (s)" 
                        yLabel="Roll (deg)" 
                    />
                </div>
                
                {/* Right side - gauge grid */}
                <div className="dashboard-container">    
                    <Gauge
                    value={latestVal}
                    min={0}
                    max={maxVal}
                    title="Acceleration"
                    />
                    <Gauge
                    value={latestVal}
                    min={0}
                    max={maxVal}
                    title="Altitude"
                    />
                    <Gauge
                    value={latestVal}
                    min={0}
                    max={maxVal}
                    title="Velocity"
                    />
                    <Gauge
                    value={latestVal}
                    min={0}
                    max={maxVal}
                    title="Battery Life"
                    />
                    <Gauge
                    value={latestVal}
                    min={0}
                    max={maxVal}
                    title="Time Lapsed"
                    />
                    <Gauge
                    value={latestVal}
                    min={0}
                    max={maxVal}
                    title="Rate of Messaging"
                    />
                    <Gauge
                    value={latestVal}
                    min={0}
                    max={maxVal}
                    title="Packet Loss"
                    />
                    <Gauge
                    value={latestVal}
                    min={0}
                    max={maxVal}
                    title="EXTRA"
                    />
                </div>
            </div>
        </main>
    )
};