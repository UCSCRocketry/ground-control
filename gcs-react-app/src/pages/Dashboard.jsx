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
    const [startTimestamp, setStartTimestamp] = useState(null);
    const [lastTimestamp, setLastTimestamp] = useState(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

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

        const updateElapsedFromTimestamp = (timestamp) => {
            setStartTimestamp(prev => {
                const start = prev ?? timestamp;
                setElapsedSeconds(Math.floor((timestamp - start) / 1000));
                return start;
            });
            setLastTimestamp(timestamp);
        };

        socket.on("send_data_ba", (data) => {
            console.log(data);
            console.log("Received barometer data!");
            updateElapsedFromTimestamp(data[data.length - 1].timestamp);
            setBaro(baro => [...baro, ...data.map(packet => packet.payload), 0]);
            setBaro(baro => baro.slice(-11, -1));
        });

        socket.on("send_data_al", (data) => {
            console.log(data);
            console.log("Received accel low data!");
            updateElapsedFromTimestamp(data[data.length - 1].timestamp);
            setAccLo(accLo => [...accLo, ...data.map(packet => packet.payload), 0]);
            setAccLo(accLo => accLo.slice(-11, -1));
        });

        socket.on("send_data_ah", (data) => {
            console.log(data);
            console.log("Received accel high data!");
            updateElapsedFromTimestamp(data[data.length - 1].timestamp);
            setAccHi(accHi => [...accHi, ...data.map(packet => packet.payload), 0]);
            setAccHi(accHi => accHi.slice(-11, -1));
        });

        socket.on("send_data_ro", (data) => {
            console.log(data);
            console.log("Received gyro data!");
            updateElapsedFromTimestamp(data[data.length - 1].timestamp);
            setGyro(gyro => [...gyro, ...data.map(packet => [packet.payload.X, packet.payload.Y, packet.payload.Z]), 0]);
            setGyro(gyro => gyro.slice(-11, -1));
        });

        socket.on("send_data_IMU", (data) => {
            console.log(data);
            console.log("Received data!");
            updateElapsedFromTimestamp(data[data.length - 1].timestamp);
            setIMU(IMU => [...IMU, ...data.map(packet => packet.payload), 0]);
            setIMU(IMU => IMU.slice(-11, -1));
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

    //resets if we recieve anything but a timestamp (ex null)
    useEffect(() => {
        if (!startTimestamp || !lastTimestamp) {
            setElapsedSeconds(0);
        }
    }, [startTimestamp, lastTimestamp]);

    // get latest values from each data stream
    const latestBaro = baro[baro.length - 1] || 0;
    const latestAccLo = accLo[accLo.length - 1] || 0;
    const latestAccHi = accHi[accHi.length - 1] || 0;
    const latestGyro = gyro[gyro.length - 1] || [0, 0, 0];
    const latestIMU = IMU[IMU.length - 1] || 0;

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

    //calc altitude from barometer data
    const calculateAltitude = (pressures) => {
        if (!Array.isArray(pressures) || pressures.length === 0) {
            return Array.from({ length: 10 }, () => 0);
        }
        const p0 = pressures[0] || 1;
        return pressures.map((p) => {
            const ratio = p0 ? p / p0 : 1;
            // Barometric formula (relative altitude, meters)
            return 44330 * (1 - Math.pow(ratio, 1 / 5.255));
        });
    };

    const avgAcceleration = averageAcceleration();
    const velocitySeries = calculateVelocity();
    const altitudeSeries = calculateAltitude(baro);

    //set range for gauge individually instead of as a collective
    const getGaugeRange = (values, fallbackMin = 0, fallbackMax = 100) => {
        if (!Array.isArray(values) || values.length === 0) {
            return { min: fallbackMin, max: fallbackMax };
        }
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        if (minVal === maxVal) {
            const pad = Math.max(1, Math.abs(maxVal) * 0.1);
            return { min: maxVal - pad, max: maxVal + pad };
        }
        const pad = (maxVal - minVal) * 0.1;
        return { min: minVal - pad, max: maxVal + pad };
    };
    //start gauge ticks at zero 
    const clampRange = (range, minValue) => ({
        min: Math.max(minValue, range.min),
        max: Math.max(range.max, minValue)
    });

    const accelerationRange = clampRange(getGaugeRange(avgAcceleration, 0), 0);
    const velocityRange = clampRange(getGaugeRange(velocitySeries, 0), 0);
    const imuRange = getGaugeRange(IMU);
    const timeRange = { min: 0, max: Math.max(10, Math.ceil(elapsedSeconds * 1.1)) };
    const altitudeRange = getGaugeRange(altitudeSeries);

    // Use calculated and sensor data for graphs 
    const altitudeData = altitudeSeries;
    const velocityData = velocitySeries;
    const pitchData = gyro.length > 0 ? gyro.map(g => g[0]) : Array.from({ length: 10 }, () => 0);
    const rollData = gyro.length > 0 ? gyro.map(g => g[1]) : Array.from({ length: 10 }, () => 0);
    const yawData = gyro.length > 0 ? gyro.map(g => g[2]) : Array.from({ length: 10 }, () => 0);
    const accelerationData = avgAcceleration;
    const latestAvgAcceleration = avgAcceleration[avgAcceleration.length - 1] || 0;
    const latestVelocity = velocitySeries[velocitySeries.length - 1] || 0;
    const latestAltitude = altitudeSeries[altitudeSeries.length - 1] || 0;
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
                    value={latestAvgAcceleration}
                    min={accelerationRange.min}
                    max={accelerationRange.max}
                    title="Acceleration"
                    />
                    <Gauge
                    value={latestAltitude}
                    min={altitudeRange.min}
                    max={altitudeRange.max}
                    title="Altitude"
                    />
                    <Gauge
                    value={latestVelocity}
                    min={velocityRange.min}
                    max={velocityRange.max}
                    title="Velocity"
                    />
                    <Gauge //out of commission for now, wrong values
                    value={latestVal}
                    min={0}
                    max={100}
                    title="WIP: Battery Life"
                    />
                    <Gauge
                    value={elapsedSeconds}
                    min={timeRange.min}
                    max={timeRange.max}
                    title="Time Lapsed (s)"
                    />
                    <Gauge
                    value={latestVal}
                    min={0}
                    max={100}
                    title="WIP:Rate of Messaging"
                    />
                    <Gauge
                    value={latestVal}
                    min={0}
                    max={100}
                    title="WIP: Packet Loss"
                    />
                    <Gauge
                    value={latestVal}
                    min={0}
                    max={100}
                    title="EXTRA"
                    />
                </div>
            </div>
        </main>
    )
};