import React from "react";

function DisarmButton({socket}) {

  const send_disarm = () => {
    socket.emit('send_disarm');
  }

  return (
    <button className="control-button disarm-button" onClick={send_disarm}>
      Disarm
    </button>
  );
}

export default DisarmButton;