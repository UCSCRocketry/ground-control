import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"
import CustomLineGraph from "./../components/CustomLineGraph";


const generateData = () =>
  Array.from({ length: 5 }, () => Math.floor(Math.random() * 60 + 10));

const Dashboard = () => {
  const [socketInstance, setSocketInstance] = useState("");
  const [IMU, setIMU] = useState([]);
  const [highG, setHighG] = useState([]);
  const [lowG, setLowG] = useState([]);
  const [gyro, setGyro] = useState([]);
  const [baro, setBaro] = useState([]);
  const [mag, setMag] = useState([]);

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

      socket.on("send_data_HIGH_G_ACCEL", (data) => {
          console.log(data);
          console.log("Received data!");
          setHighG(highG => [...highG, ...data.data, 0]);
          setHighG(highG => highG.slice(-6, -1));
      });

      socket.on("send_data_LOW_G_ACCEL", (data) => {
          console.log(data);  
          console.log("Received data!");
          setLowG(lowG => [...lowG, ...data.data, 0]);
          setLowG(lowG => lowG.slice(-6, -1));
      });

      socket.on("send_data_GYROSCOPE", (data) => {
          console.log(data);
          console.log("Received data!");
          setGyro(gyro => [...gyro, ...data.data, 0]);
          setGyro(gyro => gyro.slice(-6, -1));
      });

      socket.on("send_data_BAROMETER", (data) => {
          console.log(data);
          console.log("Received data!");
          setBaro(baro => [...baro, ...data.data, 0]);
          setBaro(baro => baro.slice(-6, -1));
      });

      socket.on("send_data_MAGNETOMETER", (data) => {
          console.log(data);
          console.log("Received data!");
          setMag(mag => [...mag, ...data.data, 0]);
          setMag(mag => mag.slice(-6, -1));
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
      <CustomLineGraph title="IMU" data={IMU} label="IMU" />
      
    </div>
  );
};

export default Dashboard;

