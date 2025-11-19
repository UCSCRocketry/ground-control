import "../styles/Launch.css";
import {useNavigate}  from 'react-router-dom';
import React from 'react';

export default function NewLaunch({ id,name,timestamp }) { //id = increment from last launch id, name = new_launch (to rename later), timestamp = current timestamp
    const navigate = useNavigate();
    
    const handleClick = () => {
      navigate(`/dashboard`); //navigate to new launch dashboard... aka dashboard of graphs (MVP)
    };

    return (
        <div className="launch-container">
            <main id="new-launch" onClick={handleClick}> {/* navigate to new launch page - graph dashboard */}
                <h1>New<br></br>Launch</h1>
            </main>
        </div> 
    )
}