import React, { useState, useEffect, useMemo } from 'react';
import { io } from "socket.io-client";
import Gauge from '../components/Gauge';
import CustomLineGraph from '../components/CustomLineGraph';
import '../styles/Dashboard.css';

// Small reusable wrapper: adds a Show/Hide toggle for any chart/gauge
function TogglePanel({ id, label, isOpen, onToggle, children }) {
  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.15)',
    background: 'white',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const labelStyle = {
    fontWeight: 600,
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const buttonStyle = {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.2)',
    background: 'white',
    cursor: 'pointer',
    fontWeight: 600,
    lineHeight: 1,
  };

  // When open, we still show a header row so you can collapse it again,
  // but we don't change your inner chart/gauge rendering.
  return (
    <div style={{ width: '100%' }}>
      <div
        style={headerStyle}
        onClick={() => onToggle(id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onToggle(id);
        }}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
        title={label}
      >
        <div style={labelStyle}>{label}</div>

        {/* stopPropagation so clicking the button doesn't double-trigger */}
        <button
          type="button"
          style={buttonStyle}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(id);
          }}
          aria-label={isOpen ? `Hide ${label}` : `Show ${label}`}
        >
          {isOpen ? 'Hide' : 'Show'}
        </button>
      </div>

      {isOpen && (
        <div id={`${id}-content`} style={{ marginTop: 10 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// implements the dashboard page including backend connection and data handling
export default function Dashboard() {
  // BACKEND CONNECTION AND DATA HANDLING
  const [IMU, setIMU] = useState([]);
  const [baro, setBaro] = useState([]);
  const [accLo, setAccLo] = useState([]);
  const [accHi, setAccHi] = useState([]);
  const [gyro, setGyro] = useState([]);
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Collapsed/open state for each panel
  // true = open, false = collapsed
  const [openPanels, setOpenPanels] = useState(() => ({
    // graphs
    graph_altitude: true,
    graph_pitch: true,
    graph_velocity: true,
    graph_yaw: true,
    graph_acceleration: true,
    graph_roll: true,
    graph_extra: true,

    // gauges
    gauge_accel: true,
    gauge_altitude: true,
    gauge_velocity: true,
    gauge_battery: true,
    gauge_time: true,
    gauge_rate: true,
    gauge_packet: true,
  }));

  const togglePanel = (id) => {
    setOpenPanels((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // useEffect to connect to socket and receive data (backend)
  useEffect(() => {
    const socket = io("localhost:9999/", {
      transports: ["websocket"],
      cors: { origin: "http://localhost:3000/" },
    });

    socket.connect();

    socket.on("connect", () => {
      console.log("Connect event");
    });

    socket.on("connected", (data) => {
      console.log(data);
      console.log("Connected!");
    });

    socket.on("reconnect", () => {
      console.log("Reconnected!");
    });

    const updateElapsedFromTimestamp = (timestamp) => {
      setStartTimestamp((prev) => {
        const start = prev ?? timestamp;
        setElapsedSeconds(Math.floor((timestamp - start) / 1000));
        return start;
      });
      setLastTimestamp(timestamp);
    };

    socket.on("send_data_ba", (data) => {
      console.log("Received barometer data!");
      updateElapsedFromTimestamp(data.timestamp);
      setBaro((baro) => [...baro, data.payload, 0]);
      setBaro((baro) => baro.slice(-11, -1));
    });

    socket.on("send_data_al", (data) => {
      console.log("Received accel low data!");
      updateElapsedFromTimestamp(data.timestamp);
      setAccLo((accLo) => [...accLo, data.payload, 0]);
      setAccLo((accLo) => accLo.slice(-11, -1));
    });

    socket.on("send_data_ah", (data) => {
      console.log("Received accel high data!");
      updateElapsedFromTimestamp(data.timestamp);
      setAccHi((accHi) => [...accHi, data.payload, 0]);
      setAccHi((accHi) => accHi.slice(-11, -1));
    });

    socket.on("send_data_ro", (data) => {
      console.log("Received gyro data!");
      updateElapsedFromTimestamp(data.timestamp);
      setGyro((gyro) => [...gyro, [data.payload.X, data.payload.Y, data.payload.Z], 0]);
      setGyro((gyro) => gyro.slice(-11, -1));
    });

    socket.on("send_data_IMU", (data) => {
      console.log("Received IMU data!");
      updateElapsedFromTimestamp(data.timestamp);
      setIMU((IMU) => [...IMU, ...data.data, 0]);
      setIMU((IMU) => IMU.slice(-6, -1));
    });

    socket.on("disconnect", (data) => {
      console.log(data);
      console.log("Disconnected!");
    });

    return () => {
      socket.offAny();
      socket.disconnect();
    };
  }, []);

  // resets if we recieve anything but a timestamp (ex null)
  useEffect(() => {
    if (!startTimestamp || !lastTimestamp) {
      setElapsedSeconds(0);
    }
  }, [startTimestamp, lastTimestamp]);

  // avg acceleration from both sensors
  const averageAcceleration = () => {
    if (accLo.length === 0 && accHi.length === 0) return Array.from({ length: 10 }, () => 0);
    const maxLength = Math.max(accLo.length, accHi.length);
    const avgAccel = [];
    for (let i = 0; i < maxLength; i++) {
      const loVal = accLo[i] || 0;
      const hiVal = accHi[i] || 0;
      avgAccel.push((loVal + hiVal) / 2);
    }
    return avgAccel;
  };

  // vel using acceleration data
  const calculateVelocity = () => {
    const avgAccel = averageAcceleration();
    if (avgAccel.length === 0) return Array.from({ length: 10 }, () => 0);

    const velocity = [0];
    const dt = 0.1; // TODO: make this dynamic
    for (let i = 1; i < avgAccel.length; i++) {
      velocity[i] = velocity[i - 1] + avgAccel[i - 1] * dt;
    }
    return velocity;
  };

  // altitude from barometer data
  const calculateAltitude = (pressures) => {
    if (!Array.isArray(pressures) || pressures.length === 0) {
      return Array.from({ length: 10 }, () => 0);
    }
    const p0 = pressures[0] || 1;
    return pressures.map((p) => {
      const ratio = p0 ? p / p0 : 1;
      return 44330 * (1 - Math.pow(ratio, 1 / 5.255));
    });
  };

  const avgAcceleration = useMemo(() => averageAcceleration(), [accLo, accHi]);
  const velocitySeries = useMemo(() => calculateVelocity(), [accLo, accHi]);
  const altitudeSeries = useMemo(() => calculateAltitude(baro), [baro]);

  // gauge ranges
  const getGaugeRange = (values, fallbackMin = 0, fallbackMax = 100) => {
    if (!Array.isArray(values) || values.length === 0) return { min: fallbackMin, max: fallbackMax };
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    if (minVal === maxVal) {
      const pad = Math.max(1, Math.abs(maxVal) * 0.1);
      return { min: maxVal - pad, max: maxVal + pad };
    }
    const pad = (maxVal - minVal) * 0.1;
    return { min: minVal - pad, max: maxVal + pad };
  };

  const clampRange = (range, minValue) => ({
    min: Math.max(minValue, range.min),
    max: Math.max(range.max, minValue),
  });

  const accelerationRange = clampRange(getGaugeRange(avgAcceleration, 0), 0);
  const velocityRange = clampRange(getGaugeRange(velocitySeries, 0), 0);
  const timeRange = { min: 0, max: Math.max(10, Math.ceil(elapsedSeconds * 1.1)) };
  const altitudeRange = getGaugeRange(altitudeSeries);

  // graph series
  const altitudeData = altitudeSeries;
  const velocityData = velocitySeries;
  const pitchData = gyro.length > 0 ? gyro.map((g) => g[0]) : Array.from({ length: 10 }, () => 0);
  const rollData = gyro.length > 0 ? gyro.map((g) => g[1]) : Array.from({ length: 10 }, () => 0);
  const yawData = gyro.length > 0 ? gyro.map((g) => g[2]) : Array.from({ length: 10 }, () => 0);
  const accelerationData = avgAcceleration;

  const latestAvgAcceleration = avgAcceleration[avgAcceleration.length - 1] || 0;
  const latestVelocity = velocitySeries[velocitySeries.length - 1] || 0;
  const latestAltitude = altitudeSeries[altitudeSeries.length - 1] || 0;
  const latestVal = 0;

  // FRONTEND VISUALIZATION
  return (
    <main>
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="main-dashboard-layout">
        {/* Left side - line graphs */}
        <div className="graphs-section" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <TogglePanel
            id="graph_altitude"
            label="Altitude (Graph)"
            isOpen={openPanels.graph_altitude}
            onToggle={togglePanel}
          >
            <CustomLineGraph data={altitudeData} title="Altitude" xLabel="Time (s)" yLabel="Altitude (ft)" />
          </TogglePanel>

          <TogglePanel
            id="graph_pitch"
            label="Pitch (Graph)"
            isOpen={openPanels.graph_pitch}
            onToggle={togglePanel}
          >
            <CustomLineGraph data={pitchData} title="Pitch" xLabel="Time (s)" yLabel="Pitch (deg)" />
          </TogglePanel>

          <TogglePanel
            id="graph_velocity"
            label="Velocity (Graph)"
            isOpen={openPanels.graph_velocity}
            onToggle={togglePanel}
          >
            <CustomLineGraph data={velocityData} title="Velocity" xLabel="Time (s)" yLabel="Velocity (m/s)" />
          </TogglePanel>

          <TogglePanel
            id="graph_yaw"
            label="Yaw (Graph)"
            isOpen={openPanels.graph_yaw}
            onToggle={togglePanel}
          >
            <CustomLineGraph data={yawData} title="Yaw" xLabel="Time (s)" yLabel="Yaw (deg)" />
          </TogglePanel>

          <TogglePanel
            id="graph_acceleration"
            label="Acceleration (Graph)"
            isOpen={openPanels.graph_acceleration}
            onToggle={togglePanel}
          >
            <CustomLineGraph
              data={accelerationData}
              title="Acceleration"
              xLabel="Time (s)"
              yLabel="Acceleration (m/s^2)"
            />
          </TogglePanel>

          <TogglePanel
            id="graph_roll"
            label="Roll (Graph)"
            isOpen={openPanels.graph_roll}
            onToggle={togglePanel}
          >
            <CustomLineGraph data={rollData} title="Roll" xLabel="Time (s)" yLabel="Roll (deg)" />
          </TogglePanel>

          <TogglePanel
            id="graph_extra"
            label="EXTRA (Graph)"
            isOpen={openPanels.graph_extra}
            onToggle={togglePanel}
          >
            <CustomLineGraph
              data={accelerationData}
              title="EXTRA"
              xLabel="Time (s)"
              yLabel="Acceleration (m/s^2)"
            />
          </TogglePanel>
        </div>

        {/* Right side - gauge grid */}
        <div className="dashboard-container" style={{ display: 'grid', gap: 14 }}>
          <TogglePanel
            id="gauge_accel"
            label="Acceleration (Gauge)"
            isOpen={openPanels.gauge_accel}
            onToggle={togglePanel}
          >
            <Gauge value={latestAvgAcceleration} min={accelerationRange.min} max={accelerationRange.max} title="Acceleration" />
          </TogglePanel>

          <TogglePanel
            id="gauge_altitude"
            label="Altitude (Gauge)"
            isOpen={openPanels.gauge_altitude}
            onToggle={togglePanel}
          >
            <Gauge value={latestAltitude} min={altitudeRange.min} max={altitudeRange.max} title="Altitude" />
          </TogglePanel>

          <TogglePanel
            id="gauge_velocity"
            label="Velocity (Gauge)"
            isOpen={openPanels.gauge_velocity}
            onToggle={togglePanel}
          >
            <Gauge value={latestVelocity} min={velocityRange.min} max={velocityRange.max} title="Velocity" />
          </TogglePanel>

          <TogglePanel
            id="gauge_battery"
            label="WIP: Battery Life (Gauge)"
            isOpen={openPanels.gauge_battery}
            onToggle={togglePanel}
          >
            <Gauge value={latestVal} min={0} max={100} title="WIP: Battery Life" />
          </TogglePanel>

          <TogglePanel
            id="gauge_time"
            label="Time Lapsed (Gauge)"
            isOpen={openPanels.gauge_time}
            onToggle={togglePanel}
          >
            <Gauge value={elapsedSeconds} min={timeRange.min} max={timeRange.max} title="Time Lapsed (s)" />
          </TogglePanel>

          <TogglePanel
            id="gauge_rate"
            label="WIP: Rate of Messaging (Gauge)"
            isOpen={openPanels.gauge_rate}
            onToggle={togglePanel}
          >
            <Gauge value={latestVal} min={0} max={100} title="WIP:Rate of Messaging" />
          </TogglePanel>

          <TogglePanel
            id="gauge_packet"
            label="WIP: Packet Loss (Gauge)"
            isOpen={openPanels.gauge_packet}
            onToggle={togglePanel}
          >
            <Gauge value={latestVal} min={0} max={100} title="WIP: Packet Loss" />
          </TogglePanel>
        </div>
      </div>
    </main>
  );
}
