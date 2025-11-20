import React, { useState, useEffect } from 'react';

import { StubDatatable } from '../components/StubDatatable';
import { Map } from '../components/Map';
import { Graphs } from '../components/Graphs';
import { Overview } from './Overview';

import "../styles/LaunchData.css";


export const LaunchData = () => {
    const [toggle, setToggle] = useState(0);
    const tabs = [
        { id: 0, label: "Overview", icon: "/middle.png", content: <Overview /> },
        { id: 1, label: "Map", icon: "/pin.png", content: <Map /> },
        { id: 2, label: "Graphs", icon: "/chart.png", content: <Graphs /> },
        { id: 3, label: "Table", icon: "/file.png", content: <StubDatatable /> }
    ];

    const updateToggle = (id) => {
        setToggle(id);
        console.log(id);
    };


    return (
        <div className="LaunchData">

            {/* Launch tabs */}
            <div className="launch-tabs">

                {tabs
                    .map(tab => (
                        <div
                            key={tab.id}
                            className={`tab ${toggle === tab.id ? "active-launch-tab" : "inactive-launch-tab"}`}
                            onClick={() => updateToggle(tab.id)}
                        >
                            {tab.icon && <img src={tab.icon} alt={tab.label} />}
                            <p>{tab.label}</p>
                        </div>
                    ))}
            </div>

            {/* Tab content */}
            {tabs.map(tab => (
                <div
                    key={tab.id}
                    className={toggle === tab.id ? "show-tab-content" : "no-display"}
                >
                    {tab.content}
                </div>
            ))}

        </div>
    )
}
