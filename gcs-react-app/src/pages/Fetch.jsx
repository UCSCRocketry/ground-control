import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"

function Fetch() {
    const [socketInstance, setSocketInstance] = useState("");
    const [baro, setBaro] = useState([]);
    const [accLo, setAccLo] = useState([]);
    const [accHi, setAccHi] = useState([]);
    const [gyro, setGyro] = useState([]);

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
            console.log("Received data!");
            setBaro(baro => [...baro, data.payload, 0]);
            setBaro(baro => baro.slice(-11, -1));
        });

        socket.on("send_data_al", (data) => {
            console.log(data);
            console.log("Received data!");
            setAccLo(accLo => [...accLo, data.payload, 0]);
            setAccLo(accLo => accLo.slice(-11, -1));
        });

        socket.on("send_data_ah", (data) => {
            console.log(data);
            console.log("Received data!");
            setAccHi(accHi => [...accHi, data.payload, 0]);
            setAccHi(accHi => accHi.slice(-11, -1));
        });
        

        socket.on("send_data_ro", (data) => {
            console.log(data);
            console.log("Received data!");
            setGyro(gyro => [...gyro, [data.payload.X, data.payload.Y, data.payload.Z], 0]);
            setGyro(gyro => gyro.slice(-11, -1));
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
            console.log("Disconnected!");
        });

        return () => {
            socket.offAny();
            socket.disconnect();
        }
        
        //return (() => {
          //  socket.disconnect()
        //})
        
    }, []);

    return (
        <div>
            <h1>Fetch Test</h1>
            {accHi && <p>
            ACCEL HIGH:
            <ol>
                {accHi.map((accHi, i) => (
                    <li key={i}>{accHi}</li>
                ))}
            </ol>
            </p>}
            {accLo && <p>
            ACCEL LOW:
            <ol>
                {accLo.map((accLo, i) => (
                    <li key={i}>{accLo}</li>
                ))}
            </ol>
            </p>}
            {gyro && <p>
            GYROSCOPE:
            <ol>
                {gyro.map((gyro, i) => (
                    <li key={i}>{gyro[0]}, {gyro[1]}, {gyro[2]}</li>
                ))}
            </ol>
            </p>}
            {baro && <p>
            BAROMETER:
            <ol>
                {baro.map((baro, i) => (
                    <li key={i}>{baro}</li>
                ))}
            </ol>
            </p>}
        </div>
    );
}

export default Fetch;