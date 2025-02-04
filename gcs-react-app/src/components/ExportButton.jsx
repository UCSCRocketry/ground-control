import React from 'react'; //import react library
import "../styles/ExportButton.css"; //import css file
//import export button icon
//import {useNavigate} from "react-router-dom";

const ExportButton = () => {   //function when button is clicked
    const handleClick = async () => {
        try {   //request to backend
            const response = await fetch("http://localhost:3000/serial_data.csv", {
                method: "GET",  //request type, GET
                headers: {
                    "Content-Type": "application/json", //json data type
                },
            });
   
        if (response.ok) {  //checks if successful
            const blob = await response.blob();  //converts CSV to blob
            const url = window.URL.createObjectURL(blob);  //creates url to download blob
            const link = document.createElement("a");  //anchor element, location
            link.href = url;
            link.download = "serial_data.csv";  //filename
            link.click();  //triggers download
            window.URL.revokeObjectURL(url);  //cleans up url?
        } else {
            alert("Failed to export CSV");  //error message
        }
    } catch (error) {
        console.error("Error exporting CSV:", error);  // Log any errors to the console
    }
};

    return (
        <button className="export-button" onClick={handleClick}>
            Export Data
        </button>
    );
};

export default ExportButton;    //exports component to be used in other files



