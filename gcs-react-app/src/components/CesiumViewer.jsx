import React, { useState, useEffect, useRef } from "react";
import { Cartesian3, Color, Ion } from "cesium";
import { Viewer, Entity } from "resium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { io } from "socket.io-client"

/* 
 * opens a websocket connection
 * parses in data 
 * puts data in new entities
 * visualizes entity 
 * repeats
*/

const CesiumViewer = () => {
  const viewerRef = useRef(null);
  const [entities, setEntities] = useState([]);  //holds stuff like points or markers on map
  const [isFullscreen, setIsFullscreen] = useState(false); // fullscreen or not?


  useEffect(() => {
    console.log("Component mounted");
    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiYTYwZDIwZi0xNTkzLTQ3ZjUtOWEwNC03NzVjMmRiNDE0ZWIiLCJpZCI6MjcyOTc1LCJpYXQiOjE3Mzg1NjAwMTV9.ZM3udPGWtEBSmTb5qTKQOOsbyWje52wUg8B9vomxAUo';

    //open websocket
    //TALK W MICHAEL ABT THIS
    const socket = io("http://localhost:9999", {
      transports: ["websocket"],
      cors: {
        origin: "http://localhost:3000/",
      },
    });

    //backend connects to front
    socket.connect()
    
    socket.on("connect", () => {
      console.log("connect eventtt")
    });

    //testing connection
    socket.on("connected", (data) => {
      console.log(data);
      console.log("connecteddd!", data)
    });

    //fetches the real-time JSON data from websocket
    socket.on("send_data", (data) => {
      // const newData = JSON.parse(data); //commented out for testing with dummy data from backend
      console.log("Received data:", typeof data, data); // debug

    //   //UDPATE BASED ON MESSAGE RECIEVED
    //   //new entity per message
    //   const newEntity = {
    //     id: data.id,
    //     position: Cartesian3.fromDegrees(data.longitude, data.latitude, data.altitude),
    //     point: { pixelSize: 10, color: Color.RED },
    //     description: `ID: ${data.id}`,
    //   };

    //   setEntities((prevEntities) => [...prevEntities, newEntity]);
    // }); 
      if (!data || typeof data !== "object") {
        console.error("Invalid data format:", data);
        return;
      }

      if (!data.id || !data.longitude || !data.latitude || !data.altitude) {
        console.error("Incomplete data received:", data);
        return;
      }

      const newEntity = {
        id: data.id,
        position: Cartesian3.fromDegrees(data.longitude, data.latitude, data.altitude),
        point: { pixelSize: 10, color: Color.RED },
        description: `ID: ${data.id}`,
      };

      setEntities((prevEntities) => [...prevEntities, newEntity]);
    });

    return () => {
      socket.close();
      console.log("Component unmounted");
    };
  }, []);

    // fullscreen
    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        viewerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    };

  return (
    <div
      ref={viewerRef}
      style={{ width: "100%", height: isFullscreen ? "100vh" : "calc(100vh - 50px)" }}
    >
      {/* <button
        onClick={toggleFullscreen}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "10px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      </button> */}


      {/* problem in here */}
      {/* <Viewer>
        {entities.map((entity) => (
          <Entity
            key={entity.id}
            name={entity.description}
            position={entity.position}
            point={entity.point}
            description={entity.description}
          />
        ))}
      </Viewer> */}

      <Viewer full>
        <Entity
          description="test"
          name="tokyo"
          point={{ pixelSize: 10 }}
          position={Cartesian3.fromDegrees(139.767052, 35.681167, 100)}
        />
      </Viewer>
      {/* to here */}

    </div>
  );
};

export default CesiumViewer;
