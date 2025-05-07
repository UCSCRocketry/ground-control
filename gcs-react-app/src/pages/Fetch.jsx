import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"

function Fetch() {
    const [socketInstance, setSocketInstance] = useState("");
    const [baro, setBaro] = useState([]);
    const [gps, setGPS] = useState([]);
    const [accel, setAccel] = useState([]);
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

        socket.on("send_data_BARO", (data) => {
            console.log(data);
            console.log("Received data!");
            setBaro(baro => [...baro, ...data.data, 0]);
            setBaro(baro => baro.slice(-6, -1));
        });

        socket.on("send_data_GPS", (data) => {
            console.log(data);
            console.log("Received data!");
            setGPS(gps => [...gps, ...data.data, 0]);
            setGPS(gps => gps.slice(-6, -1));
        });

        socket.on("send_data_ACCEL", (data) => {
            console.log(data);
            console.log("Received data!");
            setAccel(accel => [...accel, ...data.data, 0]);
            setAccel(accel => accel.slice(-6, -1));
        });

        socket.on("send_data_GYRO", (data) => {
            console.log(data);
            console.log("Received data!");
            setGyro(gyro => [...gyro, ...data.data, 0]);
            setGyro(gyro => gyro.slice(-6, -1));
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
            {gps && <p>
            GPS:
            <ol>
                {gps.map((gps, i) => (
                    <li key={i}>{gps}</li>
                ))}
            </ol>
            </p>}
            {accel && <p>
            ACCEL:
            <ol>
                {accel.map((accel, i) => (
                    <li key={i}>{accel}</li>
                ))}
            </ol>
            </p>}
            {gyro && <p>
            GYROSCOPE:
            <ol>
                {gyro.map((gyro, i) => (
                    <li key={i}>{gyro}</li>
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