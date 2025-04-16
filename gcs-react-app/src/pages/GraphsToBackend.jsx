import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"
import Gauge from "./../components/Gauge";


//Gauge accepts ({ value, min, max, title }) => {
// like this:
//               Gauge value={75} min={0} max={100} title="Tester Guage Graph"


function GraphsToBackend() {
    const [socketInstance, setSocketInstance] = useState("");
    const [IMU, setIMU] = useState([]);

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

    return (
        <div>
            <h1>IMU Test</h1>
            {IMU && <p>
            IMU:
            
            {/* create base line empty component */}
            <ol>
                return (
                        <div>
                        <Gauge value={0} min={0} max={100} title="Tester Guage Graph" />
                        </div>
                        );
            </ol>


            {/* pass updating values from backend into gauge */}
            <ol>                
                {IMU.map((value, i) => {
                    
                    //if value < 100 then set maxVal to 100 otherwise add 100 to it if its over 100
                    const maxVal = value < 100 ? 100 : value + 100
                    
                    return (
                    <div>
                    <Gauge value={value} min={0} max={maxVal} title="Tester Guage Graph" />
                    </div>
                    );
                })}
            </ol>


            </p>}
        </div>
    );
}

export default GraphsToBackend;