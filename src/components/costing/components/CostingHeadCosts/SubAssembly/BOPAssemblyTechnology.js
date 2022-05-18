import React from 'react';
import { useSelector } from 'react-redux';
import { checkForDecimalAndNull } from '../../../../../helper';

function BOPAssemblyTechnology(props) {
  const { item } = props;

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr>
        <td>
          <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
            {item && item.PartNumber}
          </span>
        </td>

        <td>{item && item.PartName}</td>
        <td>{item && item.BOMLevel}</td>
        <td>{item && item.PartType}</td>
        <td>{item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity ? item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity : 'Sheet Metal'}</td>
        <td>{item?.CostingPartDetails?.QuantityForSubAssembly ? checkForDecimalAndNull(item.CostingPartDetails.QuantityForSubAssembly, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        <td>{item?.CostingPartDetails?.CostPerPiece ? checkForDecimalAndNull(item.CostingPartDetails.CostPerPiece, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>

        <td>{item?.CostingPartDetails?.CostPerPiece ? '-' : '-'}</td>
        <td>{item?.CostingPartDetails?.CostPerPiece ? '-' : '-'}</td>

        <td>{item?.CostingPartDetails?.CostPerAssemblyBOP ? checkForDecimalAndNull(item.CostingPartDetails.CostPerAssemblyBOP, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>

        <td>{'-'}</td>
        <td></td>
        <td></td>




      </tr>
    </ >
  );
}

export default BOPAssemblyTechnology;