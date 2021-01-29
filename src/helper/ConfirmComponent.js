import React from 'react';
import { toastr } from "react-redux-toastr";

function Mycustomcomponent() {
  return (
    <div className="confirm-con-main w-100">
      <div className="d-flex justify-content-between header-bar">
        <h4>Confirm</h4>
        <button
          type="button"  class="close-toastr btn btn-link p-0" >
          <img alt={""} src={require("../assests/images/close-blue.svg")} />
        </button>
      </div>
      <div className="text-center img-block">
        <img alt={""} src={require("../assests/images/confirm.svg")} />
      </div>
    </div>
  );
}

export default Mycustomcomponent
