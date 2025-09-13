import React, { useState, useEffect } from 'react';
import Launch from "../components/Launch";
import NewLaunch from "../components/NewLaunch";
import launchesData from "../launches.json";

import "../styles/Home.css";

export default function Home() {
    const [launches, setLaunches] = useState([]); //state to store list of launches to display on home page
    useEffect(() => {
        setLaunches(launchesData.launches); //json file of launches 
    }, []);

    

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear().toString().substr(-2); // Get last 2 digits

        return `${formattedHours}:${formattedMinutes}${ampm} ${month}/${day}/${year}`;
    }

    return (
        <main>
            <h1 className="recent-launches">Recent Launches</h1>
            <div class="launches-container">
                <NewLaunch />
                {launches.map((launch) => (
                    <Launch 
                    key={launch.launch_id}
                    id={launch.launch_id}
                    name={launch.name}
                    timestamp={formatTimestamp(launch.timestamp)}
                    />
                ))}
            </div>
        </main>
    )
}