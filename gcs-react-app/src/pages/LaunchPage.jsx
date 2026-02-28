import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import CesiumMap from '../components/Cesium';
import Gauge from '../components/Gauge';
import CustomLineGraph from '../components/CustomLineGraph';
import "../styles/LaunchPage.css";
import launchesData from "../launches.json";

// Telemetry hook fake data rn (change to real WebSocket connection in future when backend is ready)
function useTelemetry() {
    const [packets, setPackets] = useState([]);
    const [connected, setConnected] = useState(false);
    const tRef = useRef(0);

    useEffect(() => {
        const connectTimer = setTimeout(() => setConnected(true), 1500);
        const interval = setInterval(() => {
            tRef.current += 400;
            const t = tRef.current;
            const alt = Math.max(0, 20 + Math.sin(t / 3000) * 15 + (Math.random() - 0.5) * 5);
            setPackets(prev => [...prev, {
                t,
                al:   parseFloat(alt.toFixed(2)),
                ah:   parseFloat((alt + (Math.random() - 0.5) * 2).toFixed(2)),
                ba:   parseFloat((1012 + Math.sin(t / 5000) * 2 + (Math.random() - 0.5)).toFixed(2)),
                ro_x: parseFloat((Math.sin(t / 5000) * 0.3 + (Math.random() - 0.5) * 0.05).toFixed(3)),
                ro_y: parseFloat((Math.cos(t / 4000) * 0.2 + (Math.random() - 0.5) * 0.05).toFixed(3)),
                ro_z: parseFloat(((t / 1000) % 360).toFixed(1)),
            }].slice(-150));
        }, 400);
        return () => { clearTimeout(connectTimer); clearInterval(interval); };
    }, []);

    return { packets, connected };
}

// Gauge wrapper to control Plotly size 
const GaugeCard = ({ title, value, min, max }) => (
    <div className="lp-gauge-wrap">
        <Gauge title={title} value={value} min={min} max={max} />
    </div>
);

// Dashboard 
const Dashboard = () => {
    const { packets, connected } = useTelemetry();
    const [view, setView] = useState('data');
    const latest = packets.length ? packets[packets.length - 1] : null;
    const vals = key => packets.map(p => p[key]);

    return (
        <div className="lp-dashboard">
            <div className="lp-dashboard-bar">
                <div className="lp-view-tabs">
                    <button className={view === 'data'  ? 'active' : ''} onClick={() => setView('data')}>Data</button>
                    <button className={view === 'split' ? 'active' : ''} onClick={() => setView('split')}>Map + Data</button>
                    <button className={view === 'map'   ? 'active' : ''} onClick={() => setView('map')}>Map</button>
                </div>
                <button className="lp-end-btn">End Recording</button>
            </div>

            <div className={`lp-body lp-body--${view}`}>

                {(view === 'map' || view === 'split') && (
                    <div className="lp-map-panel">
                        <CesiumMap />
                    </div>
                )}

                {(view === 'data' || view === 'split') && (
                    <div className="lp-data-panel">
                        {!connected ? (
                            <div className="lp-waiting">
                                <div className="lp-waiting-dot" />
                                <span>Waiting for signal...</span>
                            </div>
                        ) : (
                            <div className="lp-content">

                                {/* Charts — left side, 2 col */}
                                <div className="lp-charts-col">
                                    <CustomLineGraph title="Altitude"     data={vals('al')}   />
                                    <CustomLineGraph title="Pitch"        data={vals('ro_x')} />
                                    <CustomLineGraph title="Velocity"     data={vals('ro_y')} />
                                    <CustomLineGraph title="Yaw"          data={vals('ro_z')} />
                                    <CustomLineGraph title="Acceleration" data={vals('ba')}   />
                                    <CustomLineGraph title="Roll"         data={vals('ah')}   />
                                </div>

                                {/* Gauges — right side, 2 col */}
                                <div className="lp-gauges-col">
                                    <GaugeCard title="Acceleration"      value={latest?.ro_x ?? 0} min={-1}   max={1}    />
                                    <GaugeCard title="Altitude"          value={latest?.al   ?? 0} min={0}    max={50}   />
                                    <GaugeCard title="Velocity"          value={latest?.ro_y ?? 0} min={-1}   max={1}    />
                                    <GaugeCard title="Battery Life"      value={latest?.ba   ?? 0} min={1010} max={1020} />
                                    <GaugeCard title="Time Lapsed"       value={latest?.ro_z ?? 0} min={0}    max={360}  />
                                    <GaugeCard title="Rate of Messaging" value={latest?.ah   ?? 0} min={0}    max={50}   />
                                    <GaugeCard title="Packet Loss"       value={0}                 min={0}    max={100}  />
                                    <GaugeCard title="??????"            value={0}                 min={0}    max={100}  />
                                </div>

                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

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
                        <Dashboard />
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



