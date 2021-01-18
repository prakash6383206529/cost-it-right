import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import BOPCost from './BOPCost';
import ProcessCost from './ProcessCost';
import RawMaterialCost from './RawMaterialCost';
import { getRMCCTabData, saveCostingRMCCTab } from '../../../actions/Costing';

function PartCompoment(props) {
  const { rmData, bopData, ccData, item } = props;

  const [IsOpen, setIsOpen] = useState(false);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);

  const toggle = (BOMLevel, PartNumber) => {
    setIsOpen(!IsOpen)
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
        PartId: item.PartId,
        //PlantId: costData.PlantId,
      }
      dispatch(getRMCCTabData(data, false, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.DataList[0].CostingPartDetails;
          props.setPartDetails(BOMLevel, PartNumber, Data)
        }
      }))
    }
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
        <td>
          <span style={{ position: 'relative' }} className={`cr-prt-nm cr-prt-link ${item && item.BOMLevel}`}>
            {item && item.PartName}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
          </span>
        </td>
        <td>{item && item.PartType}</td>
        <td>{item.TotalRawMaterialsCost}</td>
        <td>{item.TotalBoughtOutPartCost}</td>
        <td>{item.TotalConversionCost}</td>
        <td>{1}</td>
        <td>{item.GrandTotalCost}</td>
      </tr>
      {item.IsOpen && <tr>
        <td colSpan={7} className="cr-innerwrap-td">
          <div className="user-page p-0">
            <div>
              <RawMaterialCost
                index={props.index}
                data={rmData}
                setRMCost={props.setRMCost}
                item={item}
              />

              <BOPCost
                index={props.index}
                data={bopData}
                setBOPCost={props.setBOPCost}
                item={item}
              />

              <ProcessCost
                index={props.index}
                data={ccData}
                setProcessCost={props.setProcessCost}
                setOperationCost={props.setOperationCost}
                setToolCost={props.setToolCost}
                item={item}
              />
            </div>
          </div >
        </td>
      </tr>}
    </ >
  );
}

export default PartCompoment;