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
    const [baro, setBaro] = useState([]);
    const [accLo, setAccLo] = useState([]);
    const [accHi, setAccHi] = useState([]);
    const [gyro, setGyro] = useState([]);

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

        socket.on("send_data_ba", (data) => {
            console.log(data);
            console.log("Received barometer data!");
            setBaro(baro => [...baro, data.payload, 0]);
            setBaro(baro => baro.slice(-11, -1));
        });

        socket.on("send_data_al", (data) => {
            console.log(data);
            console.log("Received accel low data!");
            setAccLo(accLo => [...accLo, data.payload, 0]);
            setAccLo(accLo => accLo.slice(-11, -1));
        });

        socket.on("send_data_ah", (data) => {
            console.log(data);
            console.log("Received accel high data!");
            setAccHi(accHi => [...accHi, data.payload, 0]);
            setAccHi(accHi => accHi.slice(-11, -1));
        });

        socket.on("send_data_ro", (data) => {
            console.log(data);
            console.log("Received gyro data!");
            setGyro(gyro => [...gyro, [data.payload.X, data.payload.Y, data.payload.Z], 0]);
            setGyro(gyro => gyro.slice(-11, -1));
        });

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

    // get latest values from each data stream
    const latestBaro = baro[baro.length - 1] || 0;
    const latestAccLo = accLo[accLo.length - 1] || 0;
    const latestAccHi = accHi[accHi.length - 1] || 0;
    const latestGyro = gyro[gyro.length - 1] || [0, 0, 0];
    const latestIMU = IMU[IMU.length - 1] || 0;

    // dynamic max value calculation based on all sensor data
    const allValues = [latestBaro, latestAccLo, latestAccHi, latestIMU, ...latestGyro];
    const maxCurrentValue = Math.max(...allValues);
    const [maxVal, setMaxVal] = useState(100);
    if (maxCurrentValue > maxVal) {
        const increments = Math.ceil((maxCurrentValue - maxVal) / 100);
        setMaxVal(prev => prev + increments * 100);
    }
    
    // get avg acceleration from both sensors
    const averageAcceleration = () => {
        if (accLo.length === 0 && accHi.length === 0) return Array.from({ length: 10 }, () => 0);
        const maxLength = Math.max(accLo.length, accHi.length);
        const avgAccel = [];
        for (let i = 0; i < maxLength; i++) {
            const loVal = accLo[i] || 0;
            const hiVal = accHi[i] || 0;
            avgAccel.push((loVal + hiVal) / 2);
        }
        return avgAccel;
    };

    // calc vel using acceleration data
    const calculateVelocity = () => {
        const avgAccel = averageAcceleration();
        if (avgAccel.length === 0) return Array.from({ length: 10 }, () => 0);
        
        const velocity = [0];
        const dt = 0.1; // assume 0.1 second time steps //TODO: make this dynamic
        
        for (let i = 1; i < avgAccel.length; i++) {
            // v = v0 + a*dt (simple Euler integration) //TODO: make this dynamic
            velocity[i] = velocity[i-1] + avgAccel[i-1] * dt;
        }
        return velocity;
    };

    // Use calculated and sensor data for graphs (keep original titles)
    const altitudeData = baro.length > 0 ? baro : Array.from({ length: 10 }, () => 0);
    const velocityData = calculateVelocity();
    const pitchData = gyro.length > 0 ? gyro.map(g => g[0]) : Array.from({ length: 10 }, () => 0);
    const rollData = gyro.length > 0 ? gyro.map(g => g[1]) : Array.from({ length: 10 }, () => 0);
    const yawData = gyro.length > 0 ? gyro.map(g => g[2]) : Array.from({ length: 10 }, () => 0);
    const accelerationData = averageAcceleration();
    const latestVal = 0;


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
                    value={averageAcceleration()[averageAcceleration().length - 1] || 0}
                    min={0}
                    max={maxVal}
                    title="Acceleration"
                    />
                    <Gauge
                    value={latestBaro}
                    min={0}
                    max={maxVal}
                    title="Altitude"
                    />
                    <Gauge
                    value={calculateVelocity()[calculateVelocity().length - 1] || 0}
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