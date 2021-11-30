import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext, NetPOPriceContext } from '../../CostingDetailStepTwo';
import BOPCost from './BOPCost';
import ProcessCost from './ProcessCost';
import RawMaterialCost from './RawMaterialCost';
import {
  getRMCCTabData, saveComponentCostingRMCCTab, setComponentItemData, saveDiscountOtherCostTab,
  setComponentDiscountOtherItemData,
  saveAssemblyPartRowCostingCalculation,
  setAllCostingInArray
} from '../../../actions/Costing';
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../../helper';
import { LEVEL1 } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { MESSAGES } from '../../../../../config/message';
import { ViewCostingContext } from '../../CostingDetails';
import { createToprowObjAndSave } from '../../../CostingUtil';

function PartCompoment(props) {
  const { rmData, bopData, ccData, item } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [Count, setCount] = useState(0);

  const dispatch = useDispatch()
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { ComponentItemDiscountData, ComponentItemData, CloseOpenAccordion, CostingEffectiveDate, RMCCTabData, CostingDataList, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, DiscountCostData, getAssemBOPCharge } = useSelector(state => state.costing)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);



  const toggle = (BOMLevel, PartNumber) => {
    setIsOpen(!IsOpen)
    setCount(Count + 1)
    setTimeout(() => {
      if (Object.keys(costData).length > 0) {
        const data = {
          CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
          PartId: item.PartId,
        }
        dispatch(getRMCCTabData(data, false, (res) => {
          if (res && res.data && res.data.Result) {
            let Data = res.data.DataList[0].CostingPartDetails;
            // dispatch(setAllCostingInArray(Data))
            props.setPartDetails(BOMLevel, PartNumber, Data, item)
          }
        }))
      }
    }, 500)
  }

  useEffect(() => {
    dispatch(setComponentItemData(item, () => { }))
  }, [IsOpen])

  useEffect(() => {
    if (IsOpen === true) {
      toggle(item.BOMLevel, item.PartNumber)
    }
  }, [CloseOpenAccordion])

  useEffect(() => {

    // OBJECT FOR SENDING OBJECT TO API
    if (!CostingViewMode && IsOpen === false && Count > 0 && Object.keys(ComponentItemData).length > 0) {
      const tabData = RMCCTabData[0]
      const surfaceTabData = SurfaceTabData[0]
      const overHeadAndProfitTabData = OverheadProfitTabData[0]
      const discountAndOtherTabData = DiscountCostData

      let requestData = {

        "NetRawMaterialsCost": item.CostingPartDetails.TotalRawMaterialsCost,
        "NetBoughtOutPartCost": item.CostingPartDetails.TotalBoughtOutPartCost,
        "NetConversionCost": item.CostingPartDetails.TotalConversionCost,
        "NetOperationCost": item.CostingPartDetails.CostingConversionCost && item.CostingPartDetails.CostingConversionCost.OperationCostTotal !== undefined ? item.CostingPartDetails.CostingConversionCost.OperationCostTotal : 0,
        "NetProcessCost": item.CostingPartDetails.CostingConversionCost && item.CostingPartDetails.CostingConversionCost.ProcessCostTotal !== undefined ? item.CostingPartDetails.CostingConversionCost.ProcessCostTotal : 0,
        "NetOtherOperationCost": item.CostingPartDetails.CostingConversionCost && item.CostingPartDetails.CostingConversionCost.OtherOperationCostTotal !== undefined ? item.CostingPartDetails.CostingConversionCost.OtherOperationCostTotal : 0,
        "NetToolsCost": item.CostingPartDetails.CostingConversionCost && item.CostingPartDetails.CostingConversionCost.ToolsCostTotal !== undefined ? item.CostingPartDetails.CostingConversionCost.ToolsCostTotal : 0,
        "NetTotalRMBOPCC": item.CostingPartDetails.TotalCalculatedRMBOPCCCost,
        "TotalCost": netPOPrice,
        "NetOverheadAndProfitCost": checkForNull(item.CostingPartDetails.OverheadCost) +
          checkForNull(item.CostingPartDetails.ProfitCost) +
          checkForNull(item.CostingPartDetails.RejectionCost) +
          checkForNull(item.CostingPartDetails.ICCCost) +
          checkForNull(item.CostingPartDetails.PaymentTermCost),
        "LoggedInUserId": loggedInUserId(),
        "EffectiveDate": CostingEffectiveDate,

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
 
    
      let assemblyRequestedData = createToprowObjAndSave(tabData,surfaceTabData,PackageAndFreightTabData,overHeadAndProfitTabData,ToolTabData,discountAndOtherTabData,netPOPrice,getAssemBOPCharge,1)
      dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))

      dispatch(saveComponentCostingRMCCTab(requestData, res => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.RMCC_TAB_COSTING_SAVE_SUCCESS);
          dispatch(setComponentItemData({}, () => { }))
          InjectDiscountAPICall()
        }
      }))
    }

  }, [IsOpen])

  const InjectDiscountAPICall = () => {
    dispatch(saveDiscountOtherCostTab(ComponentItemDiscountData, res => {
      dispatch(setComponentDiscountOtherItemData({}, () => { }))
    }))
  }

  /**
   * @method render
   * @description Renders the component
   */
  return (
    <>
      <tr className="accordian-row" onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
        <td>
          <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
            {item && item.PartNumber}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
          </span>
        </td>
        <td>{item && item.BOMLevel}</td>
        <td>{item && item.PartType}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.TotalRawMaterialsCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.TotalBoughtOutPartCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.TotalConversionCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalConversionCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.Quantity !== undefined ? checkForNull(item.CostingPartDetails.Quantity) : 1}</td>
        <td>{item.CostingPartDetails && item.CostingPartDetails.TotalCalculatedRMBOPCCCost !== null ? checkForDecimalAndNull(checkForNull(item.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(item.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(item.CostingPartDetails.TotalConversionCost), initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        {costData.IsAssemblyPart && <td>{checkForDecimalAndNull(checkForNull(item.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(item.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(item.CostingPartDetails.TotalConversionCost) * item.CostingPartDetails.Quantity, initialConfiguration.NoOfDecimalForPrice)}</td>}

        <td className="text-right"><div className={`${item.IsLocked ? 'lock_icon' : ''}`}>{''}</div></td>

      </tr>
      {item.IsOpen && <tr>
        <td colSpan={`${costData.IsAssemblyPart ? 10 : 9}`} className="cr-innerwrap-td pb-4">
          <div className="user-page p-0">
            <div>
              <RawMaterialCost
                index={props.index}
                data={rmData}
                setRMCost={props.setRMCost}
                setRMMasterBatchCost={props.setRMMasterBatchCost}
                item={item}
              />

              <BOPCost
                index={props.index}
                data={bopData}
                setBOPCost={props.setBOPCost}
                setBOPHandlingCost={props.setBOPHandlingCost}
                item={item}
              />

              <ProcessCost
                index={props.index}
                data={ccData}
                rmFinishWeight={rmData.length > 0 && rmData[0].FinishWeight !== undefined ? rmData[0].FinishWeight : 0}
                setProcessCost={props.setProcessCost}
                setOperationCost={props.setOperationCost}
                setOtherOperationCost={props.setOtherOperationCost}
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
