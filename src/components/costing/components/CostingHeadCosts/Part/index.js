import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Col, Row } from 'reactstrap';
import BOPCost from './BOPCost';
import ProcessCost from './ProcessCost';
import RawMaterialCost from './RawMaterialCost';

function PartCompoment(props) {

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <RawMaterialCost />
          <hr />
          <BOPCost />
          <hr />
          <ProcessCost />
        </div>
      </div >
    </ >
  );
}

export default PartCompoment;