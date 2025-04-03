import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../../helper';
import {
  getOverheadProfitTabData, saveComponentOverheadProfitTab, setComponentOverheadItemData,
  saveDiscountOtherCostTab, isOverheadProfitDataChange, openCloseStatus, setOverheadProfitData, saveCostingPaymentTermDetail
} from '../../../actions/Costing';
import { costingInfoContext, NetPOPriceContext } from '../../CostingDetailStepTwo';
import OverheadProfit from '.';
import Toaster from '../../../../common/Toaster';
import { MESSAGES } from '../../../../../config/message';
import { IsPartType } from '../../CostingDetails';
import { PART_TYPE_ASSEMBLY } from '../../../../../config/masterData';
import { PreviousTabData } from '../../CostingHeaderTabs';
function PartOverheadProfit(props) {

  const { item } = props;
  const [Count, setCount] = useState(0);
  const [IsOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch()

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { ComponentItemDiscountData, CostingEffectiveDate, checkIsOverheadProfitChange, OverheadProfitTabData, PaymentTermDataDiscountTab } = useSelector(state => state.costing)
  const { DiscountCostData, RMCCTabData, SurfaceTabData, PackageAndFreightTabData, ToolTabData } = useSelector(state => state.costing)


  const costData = useContext(costingInfoContext);
  const netPOPrice = useContext(NetPOPriceContext);
  const isPartType = useContext(IsPartType);
  const previousTab = useContext(PreviousTabData) || 0;
  const toggle = (BOMLevel, PartNumber) => {
    const Params = {
      index: props.index,
      BOMLevel: BOMLevel,
      PartNumber: PartNumber,
    }

    setIsOpen(!IsOpen)
    setCount(Count + 1)
    dispatch(openCloseStatus({ overheadProfit: !item.IsOpen }))
    setTimeout(() => {
      if (Object.keys(costData).length > 0) {
        const data = {
          CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
          PartId: item.PartId,
        }
        dispatch(getOverheadProfitTabData(data, false, (res) => {
          if (res && res.data && res.data.Result) {
            let Data = res.data.DataList[0]?.CostingPartDetails;
            props.setPartDetails(Params, Data)
          }
        }))
      }
    }, 500)
  }



  /**
  * @method SAVE API CALL WHEN COMPONENT CLOSED
  * @description Used to Submit the form
  */
  useEffect(() => {
    if (item.IsOpen === false && Count > 1) { }
  }, [item.IsOpen])

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const saveCosting = (values) => {
    if (checkIsOverheadProfitChange) {
      let basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
      let reqData = {
        "CostingId": item.CostingId,
        "LoggedInUserId": loggedInUserId(),
        "IsSurfaceTreatmentApplicable": true,
        "IsApplicableForChildParts": false,
        "CostingNumber": costData.CostingNumber,
        "IsIncludeSurfaceTreatmentWithOverheadAndProfit": props?.IsIncludeSurfaceTreatment,
        "IsIncludeSurfaceTreatmentWithRejection": props?.IsIncludedSurfaceInRejection,
        "IsIncludeToolCostWithOverheadAndProfit": props?.IsIncludeToolCost,
        "IsIncludeOverheadAndProfitInICC": props?.IncludeOverheadProfitInIcc,
        "IsIncludeToolCostInCCForICC": props?.IncludeToolcostInCCForICC,
        "NetOverheadAndProfitCost": checkForNull(item?.CostingPartDetails?.OverheadCost) + checkForNull(item?.CostingPartDetails?.RejectionCost) + checkForNull(item?.CostingPartDetails?.ProfitCost) + checkForNull(item?.CostingPartDetails?.ICCCost),
        "BasicRate": basicRate,
        "CostingPartDetails": {
          ...item?.CostingPartDetails,
          NetOverheadAndProfitCost: checkForNull(item?.CostingPartDetails?.OverheadCost) + checkForNull(item?.CostingPartDetails?.RejectionCost) + checkForNull(item?.CostingPartDetails?.ProfitCost) + checkForNull(item?.CostingPartDetails?.ICCCost),
        },
        "EffectiveDate": CostingEffectiveDate,
        "TotalCost": netPOPrice,
      }

      dispatch(saveComponentOverheadProfitTab(reqData, res => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.OVERHEAD_PROFIT_COSTING_SAVE_SUCCESS);
          dispatch(setComponentOverheadItemData({}, () => { }))
          InjectDiscountAPICall()
          dispatch(isOverheadProfitDataChange(false))
          let arrTemp = [...OverheadProfitTabData]
          arrTemp[0].IsOpen = false
          dispatch(setOverheadProfitData(arrTemp, () => { }))
        }
      }))
    }
  }

  const InjectDiscountAPICall = () => {
    let basicRate = 0
    if (Number(isPartType?.value) === PART_TYPE_ASSEMBLY) {
      basicRate = checkForNull(RMCCTabData[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else {
      basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    }
    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, BasicRate: basicRate }, res => {
      if (Number(previousTab) === 6) {
        dispatch(saveCostingPaymentTermDetail(PaymentTermDataDiscountTab, (res) => { }));
      }
    }))
  }

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
        <td className='part-overflow' id="overhead_profit_arrow" onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
          <span className={`part-name ${item && item.BOMLevel}`} title={`${item && item.PartNumber}-${item && item.BOMLevel}`}>
            {item && item.PartNumber}-{item && item.BOMLevel}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
          </span>
        </td>
        <td>{item && item.PartType}</td>
        <td>{item?.CostingPartDetails && item?.CostingPartDetails?.OverheadCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.OverheadCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
        <td>{item?.CostingPartDetails && item?.CostingPartDetails?.ProfitCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.ProfitCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
        <td>{item?.CostingPartDetails && item?.CostingPartDetails?.RejectionCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.RejectionCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
        <td>{item?.CostingPartDetails && item?.CostingPartDetails?.ICCCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.ICCCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
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
                setPaymentTermsDetail={props.setPaymentTermsDetail}
                saveCosting={saveCosting}
              />
            </div>
          </div >
        </td>
      </tr>}

    </ >
  );
}

export default PartOverheadProfit;