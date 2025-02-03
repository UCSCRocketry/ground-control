import React from "react";
import "../styles/Cesium.css";
import CesiumViewer from "../components/CesiumViewer";

export default function Cesium() {
    return (
        <main>
            <h1>Real Time Geographical Map</h1>
            <CesiumViewer/>
        </main>
    )
}