import React from 'react';

function ConfirmComponent() {
  return (
    <div className="confirm-con-main w-100">
      <div className="d-flex justify-content-center header-bar">
        <h4>Confirm</h4>
      </div>
      <div className="text-center img-block">
        <img alt={""} src={require("../assests/images/confirm.svg")} />
      </div>
    </div>
  );
}

export default ConfirmComponent;
