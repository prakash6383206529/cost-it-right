import React from 'react';
import SurfaceTreatmentCost from './SurfaceTreatmentCost';
import TransportationCost from './TransportationCost';

function SurfaceTreatment(props) {

  const { surfaceData, transportationData, } = props;

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <SurfaceTreatmentCost
            index={props.index}
            data={surfaceData}
            setSurfaceCost={props.setSurfaceCost}
          />
          <hr />

          <TransportationCost
            index={props.index}
            data={transportationData}
            setTransportationCost={props.setTransportationCost}
          />
        </div>
      </div >
    </ >
  );
}

export default SurfaceTreatment;