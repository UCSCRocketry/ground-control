import React from "react";

function ArmButton({socket}) {

  const send_arm = () => {
    socket.emit('send_arm');
  }

  return (
    <button className="control-button arm-button" onClick={send_arm}>
      Arm
    </button>
  );
}

export default ArmButton;