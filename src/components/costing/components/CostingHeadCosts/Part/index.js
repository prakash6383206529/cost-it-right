import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import BOPCost from './BOPCost';
import ProcessCost from './ProcessCost';
import RawMaterialCost from './RawMaterialCost';
import { getRMCCTabData, saveComponentCostingRMCCTab } from '../../../actions/Costing';
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../../helper';
import { LEVEL1 } from '../../../../../helper/AllConastant';

function PartCompoment(props) {
  const { rmData, bopData, ccData, item } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [Count, setCount] = useState(0);

  const dispatch = useDispatch()
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const costData = useContext(costingInfoContext);

  const toggle = (BOMLevel, PartNumber) => {
    setIsOpen(!IsOpen)
    setCount(Count + 1)
    setTimeout(() => {
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
    }, 500)
  }

  useEffect(() => {

    if (IsOpen === false && Count > 0) {
      let requestData = {
        "NetRawMaterialsCost": item.CostingPartDetails.TotalRawMaterialsCost,
        "NetBoughtOutPartCost": item.CostingPartDetails.TotalBoughtOutPartCost,
        "NetConversionCost": item.CostingPartDetails.TotalConversionCost,
        "NetOperationCost": item.CostingPartDetails.CostingConversionCost && item.CostingPartDetails.CostingConversionCost.OperationCostTotal !== undefined ? item.CostingPartDetails.CostingConversionCost.OperationCostTotal : 0,
        "NetProcessCost": item.CostingPartDetails.CostingConversionCost && item.CostingPartDetails.CostingConversionCost.ProcessCostTotal !== undefined ? item.CostingPartDetails.CostingConversionCost.ProcessCostTotal : 0,
        "NetToolsCost": item.CostingPartDetails.CostingConversionCost && item.CostingPartDetails.CostingConversionCost.ToolsCostTotal !== undefined ? item.CostingPartDetails.CostingConversionCost.ToolsCostTotal : 0,
        "NetTotalRMBOPCC": item.CostingPartDetails.TotalCalculatedRMBOPCCCost,
        "TotalCost": item.CostingPartDetails.TotalCalculatedRMBOPCCCost,
        "LoggedInUserId": loggedInUserId(),

        "IsSubAssemblyComponentPart": costData.IsAssemblyPart,
        "CostingId": item.CostingId,
        "PartId": item.PartId,                              //ROOT ID
        "CostingNumber": costData.CostingNumber,            //ROOT    
        "PartNumber": item.PartNumber,                      //ROOT

        "AssemblyCostingId": item.BOMLevel === LEVEL1 ? costData.CostingId : item.AssemblyCostingId,                  //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyCostingNumber": item.BOMLevel === LEVEL1 ? costData.CostingNumber : item.AssemblyCostingNumber,      //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyPartId": item.BOMLevel === LEVEL1 ? item.PartId : item.AssemblyPartId,                               //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyPartNumber": item.BOMLevel === LEVEL1 ? item.PartNumber : item.AssemblyPartNumber,                   //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID

        "PlantId": costData.PlantId,
        "VendorId": costData.VendorId,
        "VendorCode": costData.VendorCode,
        "VendorPlantId": costData.VendorPlantId,
        "TechnologyId": item.TechnologyId,
        "Technology": item.Technology,
        "TypeOfCosting": costData.VendorType,
        "PlantCode": costData.PlantCode,
        "Version": item.Version,
        "ShareOfBusinessPercent": item.ShareOfBusinessPercent,
        CostingPartDetails: item.CostingPartDetails,
      }
      dispatch(saveComponentCostingRMCCTab(requestData, res => {
        console.log('Success', res)
      }))
    }

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
        <td>{item.CostingPartDetails && item.CostingPartDetails.TotalRawMaterialsCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalRawMaterialsCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.TotalBoughtOutPartCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalBoughtOutPartCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.TotalConversionCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalConversionCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        {/* <td>{item.CostingPartDetails && item.CostingPartDetails.Quantity !== undefined ? checkForNull(item.CostingPartDetails.Quantity) : 1}</td> */}
        <td>{1}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.TotalCalculatedRMBOPCCCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalCalculatedRMBOPCCCost, initialConfiguration.NumberOfDecimalForTransaction) : 0}</td>
        <td>{''}</td>
      </tr>
      {item.IsOpen && <tr>
        <td colSpan={8} className="cr-innerwrap-td">
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

export default PartCompoment
