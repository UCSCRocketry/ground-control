import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import "../styles/LaunchPage.css";
import launchesData from "../launches.json";

const LaunchScreen = () => {
    const [searchParams] = useSearchParams();
    const [launch, setLaunch] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const launchId = searchParams.get('id');
    
    useEffect(() => {
        if (launchId) {
            const foundLaunch = launchesData.launches.find(
                launch => launch.launch_id === parseInt(launchId)
            );
            
            setLaunch(foundLaunch);
            setLoading(false);
        }
    }, [launchId]);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
        
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <main id="launch-page">
            <div className="launch-detail-container">
                {loading ? (
                    <p>Loading launch details...</p>
                ) : launch ? (
                    <>
                        <div className="launch-header">
                            <h1>{launch.name}</h1>
                            <span className="launch-id">ID: {launch.launch_id}</span>
                            <p className="launch-time">
                                <strong>Launch Time:</strong> {formatTimestamp(launch.timestamp)}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="error-message">
                        <h2>Launch Not Found</h2>
                        <p>The launch with ID {launchId} could not be found.</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default LaunchScreen;