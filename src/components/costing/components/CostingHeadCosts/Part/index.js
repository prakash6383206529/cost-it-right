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
  isDataChange,
  savePartNumber,
  setPartNumberArrayAPICALL,
  setProcessGroupGrid,
  saveBOMLevel,
  saveAssemblyNumber,
  setIsBreakupBoughtOutPartCostingFromAPI,
  openCloseStatus,
  saveCostingPaymentTermDetail,
  getCostingCostDetails

} from '../../../actions/Costing';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, CheckIsCostingDateSelected } from '../../../../../helper';
import { EMPTY_GUID, LEVEL1 } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { MESSAGES } from '../../../../../config/message';
import { IsPartType, IsNFR, ViewCostingContext } from '../../CostingDetails';
import { checkNegativeValue, createToprowObjAndSave, errorCheck, errorCheckObject, findSurfaceTreatmentData } from '../../../CostingUtil';
import _ from 'lodash';
import { PreviousTabData } from '../../CostingHeaderTabs';
import { TOOLING_ID } from '../../../../../config/masterData';
import { useLabels } from '../../../../../helper/core';
import { createSaveComponentObject } from '../../../CostingUtilSaveObjects';
function PartCompoment(props) {

  const { rmData, bopData, ccData, item } = props;

  const [IsOpen, setIsOpen] = useState(false);
  const [totalFinishWeight, setTotalFinishWeight] = useState(0);
  const [totalGrossWeight, setTotalGrossWeight] = useState(0);
  const [Count, setCount] = useState(0);
  const { CostingEffectiveDate, partNumberAssembly, partNumberArrayAPICall, bomLevel, assemblyNumber } = useSelector(state => state.costing)
  const { ComponentItemData, RMCCTabData, checkIsDataChange, DiscountCostData, OverheadProfitTabData, SurfaceTabData, ToolTabData, PackageAndFreightTabData, getAssemBOPCharge, isBreakupBoughtOutPartCostingFromAPI, PaymentTermDataDiscountTab } = useSelector(state => state.costing)

  const dispatch = useDispatch()
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { ComponentItemDiscountData, CloseOpenAccordion, ErrorObjRMCC, ErrorObjOverheadProfit, openAllTabs } = useSelector(state => state.costing)
  const { vendorLabel } = useLabels()
  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);
  const isNFR = useContext(IsNFR);
  const isPartType = useContext(IsPartType);
  const previousTab = useContext(PreviousTabData) || 0;
  const { currencySource, exchangeRateData } = useSelector((state) => state?.costing);

  const toggle = (BOMLevel, PartNumber, IsOpen, AssemblyPartNumber) => {

    if (ComponentItemData?.CostingPartDetails?.CostingConversionCost?.CostingOperationCostResponse?.length > 0) {
      const operations = ComponentItemData?.CostingPartDetails?.CostingConversionCost?.CostingOperationCostResponse;
      const hasMissingApplicability = operations?.some(item => !item?.CostingConditionMasterAndTypeLinkingId);

      if (operations?.length > 0 && hasMissingApplicability) {
        Toaster.warning('Please select Applicability for all operations');
        return false;
      }
    }
    const hasNegativeValue = checkNegativeValue(ComponentItemData?.CostingPartDetails?.CostingRawMaterialsCost, 'NetLandedCost', 'Net Landed Cost')
    if (hasNegativeValue) {
      return false;
    }
    let isOpen = IsOpen

    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
    dispatch(openCloseStatus({ RMC: !IsOpen }))

    if (isNFR && !openAllTabs && false) {
      Toaster.warning(`All Raw Material's price has not added in the Raw Material master against this ${vendorLabel} and plant.`)
      return false;
    }
    let tempErrorObjRMCC = { ...ErrorObjRMCC }
    delete tempErrorObjRMCC?.bopGridFields

    if (errorCheck(ErrorObjRMCC) || errorCheckObject(tempErrorObjRMCC) || errorCheckObject(ErrorObjOverheadProfit)) return false;

    setIsOpen(!IsOpen)
    setCount(Count + 1)
    setTimeout(() => {
      if ((partNumberAssembly !== '' && partNumberAssembly !== PartNumber) ||
        (partNumberAssembly !== '' && partNumberAssembly === PartNumber && bomLevel !== BOMLevel)) {
        Toaster.warning('Close accordion first.')
        return false
      }

      let apiCall = true
      let obj = { part: PartNumber, assembly: AssemblyPartNumber }
      assemblyNumber && assemblyNumber?.map((item) => {
        if (_.isEqual(obj, item)) {
          apiCall = false
        }
        return null
      })
      dispatch(openCloseStatus({ RMC: !IsOpen }))
      if (Object.keys(costData).length > 0 && apiCall && !isOpen) {
        const data = {
          CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
          PartId: item.PartId,
          AssemCostingId: item.AssemblyCostingId,
          subAsmCostingId: props.subAssembId !== null ? props.subAssembId : EMPTY_GUID,
          EffectiveDate: CostingEffectiveDate,
          isComponentCosting: item?.PartType === "Component" ? true : false
        }
        dispatch(savePartNumber(PartNumber))
        dispatch(setPartNumberArrayAPICALL([...partNumberArrayAPICall, PartNumber]))
        dispatch(saveAssemblyNumber([...assemblyNumber, { part: PartNumber, assembly: AssemblyPartNumber }]))
        dispatch(saveBOMLevel(BOMLevel))
        // dispatch(savePartNumber(_.uniq([...partNumberAssembly, PartNumber])))
        dispatch(getRMCCTabData(data, false, (res) => {
          if (res && res.data && res.data.Result) {
            let Data = res.data.DataList[0]?.CostingPartDetails;
            dispatch(setIsBreakupBoughtOutPartCostingFromAPI(res?.data?.DataList[0]?.IsBreakupBoughtOutPart))
            dispatch(setProcessGroupGrid(Data.CostingConversionCost.CostingProcessCostResponse))
            // dispatch(setAllCostingInArray(Data))
            props.setPartDetails(BOMLevel, PartNumber, Data, item)
            // dispatch(isDataChange(false))
          }
        }))
      } else {
        props.setPartDetails(BOMLevel, PartNumber, item?.CostingPartDetails, item)
        if (IsOpen) {                       // TRUE WHEN ACC IS OPEN,    CLICKED TO CLOSE ACC
          dispatch(savePartNumber(''))
          dispatch(saveBOMLevel(''))
        } else {
          dispatch(savePartNumber(PartNumber))
          dispatch(saveBOMLevel(BOMLevel))

        }
      }
    }, 500)

  }
  useEffect(() => {
    let totalFinishWeight = 0
    let totalGrossWeight = 0

    totalFinishWeight = rmData && rmData.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.FinishWeight)
    }, 0)

    totalGrossWeight = rmData && rmData.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.GrossWeight)
    }, 0)

    setTotalFinishWeight(totalFinishWeight)
    setTotalGrossWeight(totalGrossWeight)
  }, [rmData])

  useEffect(() => {
    dispatch(setComponentItemData(item, () => { }))
  }, [IsOpen])

  useEffect(() => {
    if (IsOpen === true) {
      toggle(item.BOMLevel, item.PartNumber, item.IsOpen, item?.AssemblyPartNumber)
    }
  }, [CloseOpenAccordion])



  /*************************************************************ACCORDIAN SAVE COMMENTED REMOVED*******************************************************************************/
  useEffect(() => {
    // OBJECT FOR SENDING OBJECT TO API
    if (!CostingViewMode && item.IsOpen && Object.keys(ComponentItemData).length > 0 && checkIsDataChange === true) {
      const hasNegativeValue = checkNegativeValue(ComponentItemData?.CostingPartDetails?.CostingRawMaterialsCost, 'NetLandedCost', 'Net Landed Cost')
      if (hasNegativeValue) {
        return false;
      }
      let stCostingData = findSurfaceTreatmentData(ComponentItemData)

      // let requestData = {
      //   "NetRawMaterialsCost": item?.CostingPartDetails?.NetRawMaterialsCost,
      //   "NetBoughtOutPartCost": item?.CostingPartDetails?.NetBoughtOutPartCost,
      //   "NetConversionCost": item?.CostingPartDetails?.NetConversionCost,
      //   "NetOperationCost": item?.CostingPartDetails?.CostingConversionCost && item?.CostingPartDetails?.CostingConversionCost.NetOperationCost !== undefined ? item?.CostingPartDetails?.CostingConversionCost.NetOperationCost : 0,
      //   "NetProcessCost": item?.CostingPartDetails?.CostingConversionCost && item?.CostingPartDetails?.CostingConversionCost.NetProcessCost !== undefined ? item?.CostingPartDetails?.CostingConversionCost.NetProcessCost : 0,
      //   "NetOtherOperationCost": item?.CostingPartDetails?.CostingConversionCost && item?.CostingPartDetails?.CostingConversionCost.NetOtherOperationCost !== undefined ? item?.CostingPartDetails?.CostingConversionCost.NetOtherOperationCost : 0,
      //   "NetToolsCost": item?.CostingPartDetails?.CostingConversionCost && item?.CostingPartDetails?.CostingConversionCost.ToolsCostTotal !== undefined ? item?.CostingPartDetails?.CostingConversionCost.ToolsCostTotal : 0,
      //   "NetTotalRMBOPCC": item?.CostingPartDetails?.NetTotalRMBOPCC,
      //   //"TotalCost": costData.IsAssemblyPart ? item?.CostingPartDetails?.NetTotalRMBOPCC : netPOPrice,   //NEED TO ADD SURFACE TREATMENT COST OF CHILD LATER
      //   "TotalCost": costData.IsAssemblyPart ? (stCostingData && Object.keys(stCostingData).length > 0) ? (checkForNull(stCostingData?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(item?.CostingPartDetails?.NetTotalRMBOPCC)) : item?.CostingPartDetails?.NetTotalRMBOPCC : netPOPrice,
      //   "LoggedInUserId": loggedInUserId(),
      //   "EffectiveDate": CostingEffectiveDate,

      //   "IsSubAssemblyComponentPart": costData.IsAssemblyPart,
      //   "CostingId": item.CostingId,
      //   "PartId": item.PartId,                              //ROOT ID
      //   "CostingNumber": costData.CostingNumber,            //ROOT    
      //   "PartNumber": item.PartNumber,                      //ROOT
      //   "CalculatorType": item.CalculatorType ?? '',
      //   // "AssemblyCostingId": item.BOMLevel === LEVEL1 ? costData.CostingId : item.AssemblyCostingId,                  //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
      //   "AssemblyCostingNumber": item.BOMLevel === LEVEL1 ? costData.CostingNumber : item.AssemblyCostingNumber,      //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
      //   "AssemblyPartId": item.BOMLevel === LEVEL1 ? item.PartId : item.AssemblyPartId,                               //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
      //   "AssemblyPartNumber": item.BOMLevel === LEVEL1 ? item.PartNumber : item.AssemblyPartNumber,                   //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
      //   "AssemblyCostingId": ComponentItemData.AssemblyCostingId,                          // HELP
      //   "SubAssemblyCostingId": ComponentItemData.SubAssemblyCostingId,                         // HELP

      //   "PlantId": costData.PlantId,
      //   "VendorId": costData.VendorId,
      //   "VendorCode": costData.VendorCode,
      //   "VendorPlantId": costData.VendorPlantId,
      //   "TechnologyId": item.TechnologyId,
      //   "Technology": item.Technology,
      //   "TypeOfCosting": costData.VendorType,
      //   "PlantCode": costData.PlantCode,
      //   "Version": item.Version,
      //   "ShareOfBusinessPercent": item.ShareOfBusinessPercent,
      //   CostingPartDetails: item?.CostingPartDetails,

      // }
      let basicRateComponent = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)

      let netPOPrice = checkForNull(basicRateComponent) + checkForNull(DiscountCostData?.totalConditionCost)


      if (costData.IsAssemblyPart && !CostingViewMode) {
        const tabData = RMCCTabData[0]
        const surfaceTabData = SurfaceTabData[0]
        const overHeadAndProfitTabData = OverheadProfitTabData[0]
        const discountAndOtherTabData = DiscountCostData

        let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 1, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)

        dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
      }

      let obj = {
        costingId: ComponentItemData?.CostingId,
        subAsmCostingId: ComponentItemData?.SubAssemblyCostingId,
        asmCostingId: ComponentItemData?.AssemblyCostingId
      }
      dispatch(getCostingCostDetails(obj, response => {
        let allCostingData = response?.data?.Data
        let basicRate
        let netPOPriceTemp

        if (ComponentItemData?.PartType === "Component") {// COMPONENT
          basicRate = basicRateComponent
          basicRate = netPOPrice
        } else if (ComponentItemData?.PartType === "Part") {// CHILD PART OF ASM : COMPONENT
          basicRate = (checkForNull(allCostingData?.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.NetTotalRMBOPCC))
          netPOPriceTemp = (checkForNull(allCostingData?.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.NetTotalRMBOPCC))
        }

        let requestData = createSaveComponentObject(item, CostingEffectiveDate, basicRate, netPOPriceTemp)

        if (response?.data?.Result) {
          dispatch(saveComponentCostingRMCCTab(requestData, res => {
            if (res.data.Result) {
              Toaster.success(MESSAGES.RMCC_TAB_COSTING_SAVE_SUCCESS);
              dispatch(setComponentItemData({}, () => { }))
              InjectDiscountAPICall()
              dispatch(isDataChange(false))
            }
          }))
        }
      }))

    }
    else {
      // dispatch(isDataChange(false))
    }

  }, [IsOpen])

  const InjectDiscountAPICall = () => {
    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, RFQCostingAttachments: [] }, res => {
      if (Number(previousTab) === 6) {
        dispatch(saveCostingPaymentTermDetail(PaymentTermDataDiscountTab, (res) => { }));
      }
    }))
  }


  /**
   * @method render
   * @description Renders the component
   */
  return (
    <>

      <tr className="accordian-row" id={`${item && item.PartNumber}`}>

        <td className='part-overflow' onClick={() => toggle(item.BOMLevel, item.PartNumber, item.IsOpen, item?.AssemblyPartNumber)}>
          <span className={`part-name ${item && item.BOMLevel}`} title={item && `Part Number: ${item.PartNumber}\nPart Name: ${item.PartName} \nRevision Number: ${item.RevisionNumber ?? '-'}`}>
            {item && item.PartNumber}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
          </span>
        </td>
        <td>{item && item.BOMLevel}</td>
        <td>{item && item.PartType}</td>
        <td>{item?.CostingPartDetails && item?.CostingPartDetails?.NetRawMaterialsCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.NetRawMaterialsCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
        {!isBreakupBoughtOutPartCostingFromAPI && <td>{item?.CostingPartDetails && item?.CostingPartDetails?.NetBoughtOutPartCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.NetBoughtOutPartCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>}
        <td>{item?.CostingPartDetails && item?.CostingPartDetails?.NetConversionCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.NetConversionCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
        <td>{item?.CostingPartDetails && item?.CostingPartDetails?.Quantity !== undefined ? checkForNull(item?.CostingPartDetails?.Quantity) : 1}</td>
        <td>{item?.CostingPartDetails && item?.CostingPartDetails?.NetTotalRMBOPCC !== null ? checkForDecimalAndNull(checkForNull(item?.CostingPartDetails?.NetRawMaterialsCost) + checkForNull(item?.CostingPartDetails?.NetBoughtOutPartCost) + checkForNull(item?.CostingPartDetails?.NetConversionCost), initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
        {costData.IsAssemblyPart && <td>{checkForDecimalAndNull((checkForNull(item?.CostingPartDetails?.NetRawMaterialsCost) + checkForNull(item?.CostingPartDetails?.NetBoughtOutPartCost) + checkForNull(item?.CostingPartDetails?.NetConversionCost)) * item?.CostingPartDetails?.Quantity, initialConfiguration?.NoOfDecimalForPrice)}</td>}
        {/*WHEN COSTING OF THAT PART IS  APPROVED SO COSTING COMES AUTOMATICALLY FROM BACKEND AND THIS KEY WILL COME TRUE (WORK LIKE VIEW MODE)*/}
        <td className="text-right"><div id="lock_icon" className={`${(item.IsLocked || item.IsPartLocked) ? 'lock_icon tooltip-n' : ''}`}>{(item.IsLocked || item.IsPartLocked) && <span class="tooltiptext">{`${item.IsLocked ? "Child parts costing are coming from individual costing, please edit there if want to change costing." : "This part is already present at multiple level in this BOM. Please go to the lowest level to enter the data."}`}</span>}</div></td>
      </tr>
      {item.IsOpen && <tr>
        <td colSpan={`${costData.IsAssemblyPart ? 10 : 9}`} className="cr-innerwrap-td pb-4">
          <div className="user-page p-0">
            <div>
              <RawMaterialCost
                index={props.index}
                data={rmData}
                setRMCost={props.setRMCost}
                item={item}
              />

              {(!isBreakupBoughtOutPartCostingFromAPI && costData?.TechnologyId !== TOOLING_ID) && <BOPCost
                index={props.index}
                data={bopData}
                setBOPCost={props.setBOPCost}
                setBOPHandlingCost={props.setBOPHandlingCost}
                item={item}
              />}

              {costData?.TechnologyId !== TOOLING_ID && <ProcessCost
                index={props.index}
                data={ccData}
                rmFinishWeight={rmData && rmData.length > 0 && rmData[0].FinishWeight !== undefined ? totalFinishWeight : 0}
                rmGrossWeight={rmData && rmData.length > 0 && rmData[0].GrossWeight !== undefined ? totalGrossWeight : 0}
                setConversionCost={props.setConversionCost}
                item={item}
                isAssemblyTechnology={false}
              />}
            </div>
          </div >
        </td>
      </tr>}
    </ >
  );
}

export default PartCompoment
