import React from 'react';
import PackageCost from './PackageCost';
import FreightCost from './FreightCost';

function PackageAndFreight(props) {

  const { packageData, freightData, } = props;

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
            data={packageData}
            setPackageCost={props.setPackageCost}
          />
          <hr />
          <FreightCost
            index={props.index}
            data={freightData}
            setFreightCost={props.setFreightCost}
          />
        </div>
      </div >
    </ >
  );
}

export default PackageAndFreight;