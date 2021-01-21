import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import BOPCost from './BOPCost';
import ProcessCost from './ProcessCost';
import RawMaterialCost from './RawMaterialCost';
import { getRMCCTabData, saveCostingRMCCTab, saveComponentCostingRMCCTab } from '../../../actions/Costing';
import { checkForDecimalAndNull, loggedInUserId } from '../../../../../helper';

function PartCompoment(props) {
  const { rmData, bopData, ccData, item } = props;

  const [IsOpen, setIsOpen] = useState(false);

  const dispatch = useDispatch()
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const costData = useContext(costingInfoContext);

  const toggle = (BOMLevel, PartNumber) => {
    setIsOpen(!IsOpen)
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
        PartId: item.PartId,
        //PlantId: costData.PlantId,
      }
      setTimeout(() => {
        dispatch(getRMCCTabData(data, false, (res) => {
          if (res && res.data && res.data.Result) {
            let Data = res.data.DataList[0].CostingPartDetails;
            props.setPartDetails(BOMLevel, PartNumber, Data)
          }
        }))
      }, 500)
    }
  }

  useEffect(() => {

    //return () => {
    if (IsOpen === false) {
      console.log('Save API Called!')
      let requestData = {
        "NetRawMaterialsCost": item.TotalRawMaterialsCost,
        "NetBoughtOutPartCost": item.TotalBoughtOutPartCost,
        "NetConversionCost": item.TotalConversionCost,
        "NetOperationCost": item.CostingPartDetails.CostingConversionCost && item.CostingPartDetails.CostingConversionCost.OperationCostTotal !== undefined ? item.CostingPartDetails.CostingConversionCost.OperationCostTotal : 0,
        "NetProcessCost": item.CostingPartDetails.CostingConversionCost && item.CostingPartDetails.CostingConversionCost.ProcessCostTotal !== undefined ? item.CostingPartDetails.CostingConversionCost.ProcessCostTotal : 0,
        "NetToolsCost": item.CostingPartDetails.CostingConversionCost && item.CostingPartDetails.CostingConversionCost.ToolsCostTotal !== undefined ? item.CostingPartDetails.CostingConversionCost.ToolsCostTotal : 0,
        "NetTotalRMBOPCC": item.GrandTotalCost,
        "NetSurfaceTreatmentCost": 0,
        "NetOverheadAndProfitCost": 0,
        "NetPackagingAndFreight": 0,
        "NetToolCost": 0,
        "DiscountsAndOtherCost": 0,
        "TotalCost": 0,
        "NetPOPrice": 0,
        "LoggedInUserId": loggedInUserId(),
        "IsSubAssemblyComponentPart": true,
        "CostingId": item.CostingId,
        "PartId": item.PartId,
        "CostingNumber": "",
        "PartNumber": item.PartNumber,
        "AssemblyPartId": item.AssemblyPartId,
        "AssemblyPartNumber": item.AssemblyPartNumber,
        "PlantId": "00000000-0000-0000-0000-000000000000",
        "VendorId": "00000000-0000-0000-0000-000000000000",
        "VendorCode": "",
        "VendorPlantId": "00000000-0000-0000-0000-000000000000",
        "TechnologyId": "00000000-0000-0000-0000-000000000000",
        "TypeOfCosting": "",
        "PlantCode": "",
        "Version": "",
        "ShareOfBusinessPercent": 0,
        CostingPartDetails: item.CostingPartDetails,
      }
      console.log('requestData', requestData)
      dispatch(saveComponentCostingRMCCTab(requestData, res => {
        console.log('Success', res)
      }))
    }
    //}
  }, [IsOpen])

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
        <td>
          <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
            {item && item.PartNumber}-{item && item.BOMLevel}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
          </span>
        </td>
        <td>{item && item.PartType}</td>
        <td>{checkForDecimalAndNull(item.TotalRawMaterialsCost, initialConfiguration.NumberOfDecimalForTransaction)}</td>
        <td>{checkForDecimalAndNull(item.TotalBoughtOutPartCost, initialConfiguration.NumberOfDecimalForTransaction)}</td>
        <td>{checkForDecimalAndNull(item.TotalConversionCost, initialConfiguration.NumberOfDecimalForTransaction)}</td>
        <td>{1}</td>
        <td>{checkForDecimalAndNull(item.GrandTotalCost, initialConfiguration.NumberOfDecimalForTransaction)}</td>
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