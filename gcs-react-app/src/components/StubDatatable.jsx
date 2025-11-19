import React, { useState, useEffect } from 'react';
import Papa, { parse } from "papaparse";

import "../styles/StubDatatable.css"
import dummyCSV from "../dummy_rocketpacketdata_1.csv"

export const StubDatatable = ({ }) => {
    const [toggle, setToggle] = useState(1);
    const [dummyData, setDummyData] = useState([]);

    useEffect(() => {
        fetch(dummyCSV)
            .then(res => res.text())
            .then(text => {
                const parsed = Papa.parse(text, { header: true });
                console.log(parsed.data);
                setDummyData(parsed.data);
            });
    }, []);

    const updateToggle = (id) => {
        setToggle(id);
    }

    return (
        <div className="StubDatatable">

            <div className="frame">
                <div className="tabs">
                    <ul>
                        <li className={toggle === 1 ? "active-tab-1" : "inactive-tab-1"} onClick={() => updateToggle(1)}>Timestamp Table</li>
                        <li className={toggle === 2 ? "active-tab-2" : "inactive-tab-2"} onClick={() => updateToggle(2)}>Packet Table</li>
                    </ul>
                </div>

                {/* TIMESTAMP TAB */}

                <div className={toggle === 1 ? "show-content" : "content"}>
                    <table>
                        <thead>
                            <tr className='header'>
                                <th>Timestamp (ms)</th>
                                <th>Pressure</th>
                                <th>Acceleration (ms)</th>
                                <th>Roll</th>
                                <th>Pitch</th>
                                <th>Yaw</th>
                                <th>Velocity</th>
                                <th>Altitude</th>
                                <th>Battery Life</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className='table-row'>
                                <td>283593792</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                            </tr>
                            <tr className='table-row'>
                                <td>283593792</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                            </tr>
                            <tr className='table-row'>
                                <td>283593792</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                            </tr>
                            <tr className='table-row'>
                                <td>283593792</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                            </tr>
                            <tr className='table-row'>
                                <td>283593792</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                            </tr>
                            <tr className='table-row'>
                                <td>283593792</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                            </tr>
                            <tr className='table-row'>
                                <td>283593792</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                            </tr>
                            <tr className='table-row'>
                                <td>283593792</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                                <td>32767</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* PACKET ID TAB */}

                <div className={toggle === 2 ? "show-content" : "content"}>
                    <table>
                        <thead>
                            <tr className='header'>
                                <th>Sequence (Packet) ID</th>
                                <th>Sensor</th>
                                <th>Timestamp (ms)</th>
                                <th>Payload</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyData.map((data, index) => (
                                <tr className='table-row' key={index}>
                                    <td>{data.seqid}</td>
                                    <td>{data.id}</td>
                                    <td>{data.timestamp}</td>
                                    <td>{data.payload}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
