import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../../helper';
import { getOverheadProfitTabData, gridDataAdded, isOverheadProfitDataChange, saveAssemblyOverheadProfitTab, saveAssemblyPartRowCostingCalculation, saveCostingPaymentTermDetail, saveDiscountOtherCostTab, setComponentOverheadItemData, setOverheadProfitData } from '../../../actions/Costing';
import { costingInfoContext, NetPOPriceContext } from '../../CostingDetailStepTwo';
import OverheadProfit from '.';
import Toaster from '../../../../common/Toaster';
import { MESSAGES } from '../../../../../config/message';
import { createToprowObjAndSave, formatMultiTechnologyUpdate } from '../../../CostingUtil';
import { IsPartType, ViewCostingContext } from '../../CostingDetails';
import { IdForMultiTechnology, PART_TYPE_ASSEMBLY } from '../../../../../config/masterData';
import { updateMultiTechnologyTopAndWorkingRowCalculation } from '../../../actions/SubAssembly';
import { WACTypeId } from '../../../../../config/constants';
import { PreviousTabData } from '../../CostingHeaderTabs';
function AssemblyOverheadProfit(props) {
  const { item } = props;

  const [IsOpen, setIsOpen] = useState(false);

  const [Count, setCount] = useState(0);

  const costData = useContext(costingInfoContext);
  const netPOPrice = useContext(NetPOPriceContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const isPartType = useContext(IsPartType);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate, RMCCTabData, SurfaceTabData, PackageAndFreightTabData, DiscountCostData, ToolTabData, getAssemBOPCharge, checkIsOverheadProfitChange, ComponentItemDiscountData, PaymentTermDataDiscountTab } = useSelector(state => state.costing)
  const OverheadProfitTabData = useSelector(state => state.costing.OverheadProfitTabData)

  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const partType = (IdForMultiTechnology.includes(String(costData.TechnologyId)) || costData.CostingTypeId === WACTypeId)
  const previousTab = useContext(PreviousTabData) || 0;
  const dispatch = useDispatch()

  const toggle = (BOMLevel, PartNumber, IsCollapse) => {
    const Params = {
      index: props.index,
      BOMLevel: BOMLevel,
      PartNumber: PartNumber,
      IsCollapse
    }

    setIsOpen(!IsOpen)
    setCount(Count + 1)
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
        PartId: item.PartId,
      }
      dispatch(getOverheadProfitTabData(data, false, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.DataList[0];
          props.toggleAssembly(Params, Data)
        }
      }))
    } else {

      props.toggleAssembly(Params)
    }
  }

  /*************************DON'T REMOVE FOR NOW MAY BE USE LATER******************************************/
  // const nestedAssembly = children && children.map(el => {
  //   if (el.PartType !== 'Sub Assembly') return false;
  //   return <AssemblyOverheadProfit
  //     index={index}
  //     item={el}
  //     children={el.CostingChildPartDetails}
  //     toggleAssembly={props.toggleAssembly}
  //     OverheadCost={props.OverheadCost}
  //     ProfitCost={props.ProfitCost}
  //     setOverheadDetail={props.setOverheadDetail}
  //     setProfitDetail={props.setProfitDetail}
  //     setRejectionDetail={props.setRejectionDetail}
  //     setICCDetail={props.setICCDetail}
  //     setPaymentTermsDetail={props.setPaymentTermsDetail}
  //     saveCosting={props.saveCosting}
  //   />
  // })

  const InjectDiscountAPICall = () => {
    let basicRate = 0
    if (Number(isPartType?.value) === PART_TYPE_ASSEMBLY && !partType) {
      basicRate = checkForNull(RMCCTabData[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else if (partType) {
      basicRate = checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) + checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else {
      basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    }

    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, CallingFrom: 3, BasicRate: basicRate }, res => {
      if (Number(previousTab) === 6) {
        dispatch(saveCostingPaymentTermDetail(PaymentTermDataDiscountTab, (res) => { }));
      }
    }))
  }

  /**
  * @method saveCosting
  * @description Used to Submit the form
  */
  const saveCosting = () => {
    const tabData = RMCCTabData && RMCCTabData[0]
    const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
    const overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]
    const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
    const toolTabData = ToolTabData && ToolTabData[0]

    const discountAndOtherTabData = DiscountCostData
    let reqData = {
      "CostingId": item.CostingId,
      "LoggedInUserId": loggedInUserId(),
      "IsIncludeSurfaceTreatmentWithOverheadAndProfit": props.IsIncludeSurfaceTreatment,
      "IsIncludeSurfaceTreatmentWithRejection": props.IsIncludeSurfaceTreatmentRejection,
      "IsIncludeToolCostWithOverheadAndProfit": props.IsIncludeToolCost,
      "IsIncludeOverheadAndProfitInICC": props.IncludeOverheadProfitInIcc,
      "IsIncludeToolCostInCCForICC": props?.IncludeToolcostInCCForICC,
      "IsApplicableForChildParts": false,
      "CostingNumber": costData.CostingNumber,
      "NetOverheadAndProfitCost": checkForNull(item?.CostingPartDetails?.OverheadCost) +
        checkForNull(item?.CostingPartDetails?.ProfitCost) +
        checkForNull(item?.CostingPartDetails?.RejectionCost) +
        checkForNull(item?.CostingPartDetails?.ICCCost),
      "CostingPartDetails": {
        ...item?.CostingPartDetails,
        NetOverheadAndProfitCost: checkForNull(item?.CostingPartDetails?.OverheadCost) + checkForNull(item?.CostingPartDetails?.RejectionCost) + checkForNull(item?.CostingPartDetails?.ProfitCost) + checkForNull(item?.CostingPartDetails?.ICCCost),
      },
      "EffectiveDate": CostingEffectiveDate,
      "TotalCost": netPOPrice,
      "BasicRate": discountAndOtherTabData?.BasicRateINR,
    }

    if (!CostingViewMode && checkIsOverheadProfitChange) {
      if (!IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId) {
        let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 3, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)

        dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
      }
      if (partType) {
        let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray[0]
        tempsubAssemblyTechnologyArray.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(item?.CostingPartDetails?.OverheadCost) + checkForNull(item?.CostingPartDetails?.RejectionCost) + checkForNull(item?.CostingPartDetails?.ProfitCost) + checkForNull(item?.CostingPartDetails?.ICCCost) +

          setTimeout(() => {
            let totalCost = ((checkForNull(tempsubAssemblyTechnologyArray?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
              checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
              checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) +
              checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost)
              + checkForNull(tempsubAssemblyTechnologyArray?.CostingPartDetails?.NetOverheadAndProfitCost) +
              checkForNull(DiscountCostData?.AnyOtherCost) + checkForNull(DiscountCostData?.totalConditionCost)) +
              (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) -
              checkForNull(DiscountCostData?.HundiOrDiscountValue))

            let request = formatMultiTechnologyUpdate(subAssemblyTechnologyArray[0], totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate, initialConfiguration?.IsAddPaymentTermInNetCost)
            dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))
            dispatch(gridDataAdded(true))
          }, 500);
      }
      dispatch(saveAssemblyOverheadProfitTab(reqData, res => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.OVERHEAD_PROFIT_COSTING_SAVE_SUCCESS);
          dispatch(isOverheadProfitDataChange(false))
          dispatch(setComponentOverheadItemData({}, () => { }))
          InjectDiscountAPICall()
          let arrTemp = [...OverheadProfitTabData]
          arrTemp[0].IsOpen = false
          dispatch(setOverheadProfitData(arrTemp, () => { }))
        }
      }))
    }
  }

  useEffect(() => {
    if (item.IsOpen === false && Count > 1) { }
  }, [item.IsOpen])

  useEffect(() => {
    dispatch(setComponentOverheadItemData(item, () => { }))
  }, [IsOpen])

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <tr className="accordian-row">
        <td className='part-overflow' onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
          <span className={`part-name ${item && item.BOMLevel}`} title={`${item && item.PartNumber}-${item && item.BOMLevel}`}>
            {item && item.PartNumber}-{item && item.BOMLevel}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
          </span>
        </td>
        <td>{item && item.PartType}</td>
        <td>{item?.CostingPartDetails && item?.CostingPartDetails?.OverheadCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.OverheadCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        <td>{item?.CostingPartDetails && item?.CostingPartDetails?.ProfitCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.ProfitCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        <td>{item?.CostingPartDetails && item?.CostingPartDetails?.RejectionCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.RejectionCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
        <td>{item?.CostingPartDetails && item?.CostingPartDetails?.ICCCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.ICCCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
      </tr>
      {item.IsOpen && <tr>
        <td colSpan={8} className="cr-innerwrap-td overhead-profit-container">
          <div className="user-page p-0">
            <div>
              <OverheadProfit
                index={props.index}
                data={item}
                OverheadCost={props.OverheadCost}
                ProfitCost={props.ProfitCost}
                setOverheadDetail={props.setOverheadDetail}
                setProfitDetail={props.setProfitDetail}
                setRejectionDetail={props.setRejectionDetail}
                setICCDetail={props.setICCDetail}
                saveCosting={saveCosting}
              />
            </div>
          </div >
        </td>
      </tr>}

      {/* {item.IsOpen && nestedAssembly} */}

    </ >
  );
}

export default AssemblyOverheadProfit;