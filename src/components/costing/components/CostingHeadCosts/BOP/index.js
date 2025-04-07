import React, { useContext, useEffect } from 'react';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { getBOPData, } from '../../../actions/Costing';
import { useDispatch, useSelector } from 'react-redux';
import { checkForDecimalAndNull, showBopLabel } from '../../../../../helper';
import { IdForMultiTechnology } from '../../../../../config/masterData';
import { WACTypeId } from '../../../../../config/constants';

function BoughtOutPart(props) {
  const { item } = props;

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  // partType USED FOR CONDITIONAL RENDERING OF COLUMNS IN CASE OF NORMAL COSTING AND ASSEMBLY TECHNOLOGY COSTING  (TRUE FOR ASSEMBLY TECHNOLOGY)
  const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId)

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
        PartId: item.PartId,
        //PlantId: costData.PlantId,
      }
      setTimeout(() => {
        dispatch(getBOPData(data, (res) => {
          if (res && res.data && res.data.Result) {
            // let Data = res.data.DataList[0]?.CostingPartDetails;
            // props.setPartDetails(BOMLevel, PartNumber, Data)
          }
        }))
      }, 500)
    }
  }, [])

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr>
        <td className='part-overflow'>
          <span title={item && `Part Number: ${item.PartNumber}\nPart Name: ${item.PartName}`}
            style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
            {item && item.PartNumber}
          </span>
        </td>
        {partType && <td>{item && item.PartName}</td>}
        <td>{item && item.BOMLevel}</td>
        <td>{item && item.PartType}</td>
        <td>{item?.TotalRawMaterialsCostWithQuantity ? item?.TotalRawMaterialsCostWithQuantity : '-'}</td>
        {!partType && <td>{item?.CostingPartDetails?.BoughtOutPartRate !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.BoughtOutPartRate, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>}
        {!partType && <td>{'-'}</td>}
        <td>{item?.CostingPartDetails?.Quantity ? checkForDecimalAndNull(item?.CostingPartDetails?.Quantity, initialConfiguration?.NoOfDecimalForPrice) : 1}</td>
        {partType && <td>{item?.CostingPartDetails?.NetPOPrice ? checkForDecimalAndNull(item?.CostingPartDetails?.NetPOPrice, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
        <td>{item?.CostingPartDetails?.BoughtOutPartRate ? checkForDecimalAndNull(item?.CostingPartDetails?.BoughtOutPartRate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
        {costData.IsAssemblyPart && <td>{item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>}
        {partType && <td></td>}
        {!partType && <td></td>}
      </tr>
    </ >
  );
}

export default BoughtOutPart;