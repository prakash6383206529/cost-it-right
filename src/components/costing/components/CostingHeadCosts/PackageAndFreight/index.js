import React from 'react';
import PackageCost from './PackageCost';
import FreightCost from './FreightCost';

function PackageAndFreight(props) {

  const { item, } = props;

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0 pt-3">
        <div>
          <PackageCost
            index={props.index}
            item={item}
            data={item.CostingPartDetails.CostingPackagingDetail}
            setPackageCost={props.setPackageCost}
          />
          <FreightCost
            index={props.index}
            item={item}
            data={item.CostingPartDetails.CostingFreightDetail}
            setFreightCost={props.setFreightCost}
          />
        </div>
      </div >
    </ >
  );
}

export default PackageAndFreight;