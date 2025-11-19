import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"
import Gauge from "../components/Gauge";


//Gauge accepts ({ value, min, max, title }) => {
// like this:
//               Gauge 
                    // value={75} 
                    // min={0} 
                    // max={100} 
                    // title="Tester Guage Graph"


function GraphsToBackend() {
    const [IMU, setIMU] = useState([]); //initilize values (to []) for Gauge component 

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
    
    // OLD maxVal LOGIC
    // const maxVal = IMU < 100 ? 100 : IMU + maxVal + IMU*1/8

    // once the IMU value exceeds 100, then dynamically update the max value to be 100 or higher, 
    // dont ever decrease the max val for scope of relativity
    const latestVal = IMU[IMU.length - 1] || 0;
    const [maxVal, setMaxVal] = useState(100);
    if (latestVal > maxVal) {
        const increments = Math.ceil((latestVal - maxVal) / 100);
        setMaxVal(prev => prev + increments * 100);
    }

    return (
        <div>
            <Gauge
            value={latestVal}
            min={0}
            max={maxVal}
            title="IMU Data"
        />
        </div>
    );
}

export default GraphsToBackend;