import "../styles/Launch.css";
import {useNavigate}  from 'react-router-dom';
import React from 'react';

export default function Launch({ id,name,timestamp }) {
    const navigate = useNavigate();
    
    const handleClick = () => {
      navigate(`/launch?id=${id}`);
    };

    return (
        <div className="launch-container">
            <main id="launch" onClick={handleClick}>
                <h1>{ name }</h1>
            </main>
            <div className="info-row">
                <p className="date">{timestamp}</p>
                <p className="edit">...</p>
            </div>
        </div>
    )
}