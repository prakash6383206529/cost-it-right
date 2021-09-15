import React, { useEffect, } from 'react';
import { useDispatch, } from 'react-redux';
import PackageCost from './PackageCost';
import FreightCost from './FreightCost';
import { setComponentPackageFreightItemData } from '../../../actions/Costing';

function PackageAndFreight(props) {

  const { item, } = props;

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setComponentPackageFreightItemData(item, () => { }))
  }, [item.CostingPartDetails.CostingPackagingDetail, item.CostingPartDetails.CostingFreightDetail])

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0 pb-3">
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