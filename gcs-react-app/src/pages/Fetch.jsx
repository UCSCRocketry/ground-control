import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"

function Fetch() {
    const [socketInstance, setSocketInstance] = useState("");
    const [velocity, setVelocity] = useState(null);
    const [accel, setAccel] = useState(null);

    useEffect(() => {
        const socket = io("localhost:9999/", {
            transports: ["websocket"],
            cors: {
                origin: "http://localhost:3000/",
            },
        });
        
        socket.on("connect", (data) => {
            console.log(data);
        });

        socket.on("send_data", (data) => {
            console.log(data);
            setVelocity(data.velocity);
            setAccel(data.accel);
        });
        /*
        fetch("http://localhost:9999/api/test", {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                setVelocity(data.velocity);
                setAccel(data.accel);
                console.log(data);
            })
            .catch((error) => console.log(error));
        */
        socket.on("disconnect", (data) => {
            console.log(data);
        });

        return function cleanup() {
            socket.disconnect();
        }
        
        //return (() => {
          //  socket.disconnect()
        //})
        
    }, []);

    return (
        <div>
            <h1>Fetch Test</h1>
            {velocity && <p>Velocity: {velocity}</p>}
            {accel && <p>Acceleration: {accel}</p>}
            <div>
            </div>
        </div>
    );
}

export default Fetch;