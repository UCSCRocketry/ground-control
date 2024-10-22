import React, { useState, useEffect } from "react";

function Fetch() {
    const [velocity, setVelocity] = useState(null);
    const [accel, setAccel] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5000/api/test", {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                setVelocity(data.velocity);
                setAccel(data.accel);
                console.log(data);
            })
            .catch((error) => console.log(error));
    }, []);

    return (
        <div>
            <h1>Fetch Test</h1>
            {velocity && <p>Velocity: {velocity}</p>}
            {accel && <p>Acceleration: {accel}</p>}
        </div>
    );
}

export default Fetch;