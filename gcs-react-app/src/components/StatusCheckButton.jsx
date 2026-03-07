import React from "react";

function StatusCheckButton({socket}) {
  const send_status_check = () => {
    socket.emit('send_ping');
  }
  return (
    <button className="control-button status-button" onClick={send_status_check}>
      Status Check Pings
    </button>
  );
}

export default StatusCheckButton;
