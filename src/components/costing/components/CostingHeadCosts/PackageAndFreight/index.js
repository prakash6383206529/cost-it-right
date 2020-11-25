import React from 'react';
import PackageCost from './PackageCost';
import FreightCost from './FreightCost';

function PackageAndFreight(props) {

  const { surfaceData, transportationData, } = props;

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <PackageCost
            index={props.index}
            data={surfaceData}
            setSurfaceCost={props.setSurfaceCost}
          />
          <hr />
          <FreightCost
            index={props.index}
            data={surfaceData}
            setSurfaceCost={props.setSurfaceCost}
          />
        </div>
      </div >
    </ >
  );
}

export default PackageAndFreight;