import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getOverheadProfitTabData, isOverheadProfitDataChange, setIncludeOverheadProfitIcc, setIncludeToolCostIcc, setOverheadProfitData, setSurfaceCostInOverheadProfit, setSurfaceCostInOverheadProfitRejection, setToolCostInOverheadProfit } from '../../actions/Costing';
import { costingInfoContext, } from '../CostingDetailStepTwo';
import { checkForNull, } from '../../../../helper';
import PartOverheadProfit from '../CostingHeadCosts/OverheadProfit/PartOverheadProfit';
import AssemblyOverheadProfit from '../CostingHeadCosts/OverheadProfit/AssemblyOverheadProfit';
import { LEVEL0 } from '../../../../config/constants';
import { ViewCostingContext } from '../CostingDetails';
import Toaster from '../../../common/Toaster';
import WarningMessage from '../../../common/WarningMessage';

function TabOverheadProfit(props) {

  const { handleSubmit, } = useForm();
  const [IsIncludeSurfaceTreatment, setIsIncludeSurfaceTreatment] = useState(false);
  const [IsIncludeSurfaceTreatmentRejection, setIsIncludeSurfaceTreatmentRejection] = useState(false);
  const [IsIncludeToolCost, setIsIncludeToolCost] = useState(false);
  const [isPressedST, setIsPressST] = useState(false)
  const [isPressedSTRejection, setIsPressSTRejection] = useState(false)
  const [isPressedToolCost, setIsPressToolCost] = useState(false)
  const [isPressedOverHeadAndProfit, setIsPressedOverHeadAndProfit] = useState(false)
  const [IncludeOverheadProfitInIcc, setIncludeOverheadProfitInIcc] = useState(false)
  const [IsIncludeToolCostInCCForICC, setIsIncludeToolCostInCCForICC] = useState(false)
  const [isPressedToolCostICC, setIsPressedToolCostICC] = useState(false)
  const dispatch = useDispatch()
  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
      }
      dispatch(getOverheadProfitTabData(data, true, (res) => { }))
    }
  }, [costData]);

  const OverheadProfitTabData = useSelector(state => state.costing.OverheadProfitTabData)
  const { ToolTabData, isBreakupBoughtOutPartCostingFromAPI } = useSelector(state => state.costing)

  useEffect(() => {

    if (OverheadProfitTabData && OverheadProfitTabData.length > 0) {
      if (OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithOverheadAndProfit !== null && !isPressedST) {

        setIsIncludeSurfaceTreatment(OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithOverheadAndProfit)
        dispatch(setSurfaceCostInOverheadProfit(OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithOverheadAndProfit, () => { }))
      }
    }
    if (OverheadProfitTabData && OverheadProfitTabData.length > 0) {
      if (OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithRejection !== null && !isPressedSTRejection) {
        dispatch(setSurfaceCostInOverheadProfitRejection(OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithRejection, () => { }))
        setIsIncludeSurfaceTreatmentRejection(OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithRejection)

      }

      if (OverheadProfitTabData[0].IsIncludeToolCostWithOverheadAndProfit !== null && !isPressedToolCost) {
        setIsIncludeToolCost(OverheadProfitTabData[0].IsIncludeToolCostWithOverheadAndProfit)
        dispatch(setToolCostInOverheadProfit(OverheadProfitTabData[0].IsIncludeToolCostWithOverheadAndProfit, () => { }))
      }

      if (OverheadProfitTabData[0].IsIncludeOverheadAndProfitInICC !== null && !isPressedOverHeadAndProfit) {
        setIncludeOverheadProfitInIcc(OverheadProfitTabData[0].IsIncludeOverheadAndProfitInICC)
        dispatch(setIncludeOverheadProfitIcc(OverheadProfitTabData[0].IsIncludeOverheadAndProfitInICC, () => { }))
      }

      if (OverheadProfitTabData[0].IsIncludeToolCostInCCForICC !== null && !isPressedToolCostICC) {
        setIsIncludeToolCostInCCForICC(OverheadProfitTabData[0].IsIncludeToolCostInCCForICC)
        dispatch(setIncludeToolCostIcc(OverheadProfitTabData[0].IsIncludeToolCostInCCForICC, () => { }))
      }
    }
  }, [OverheadProfitTabData])



  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      let TopHeaderValues = OverheadProfitTabData && OverheadProfitTabData.length > 0 && OverheadProfitTabData[0]?.CostingPartDetails !== undefined ? OverheadProfitTabData[0]?.CostingPartDetails : null;
      
      let topHeaderData = {
        NetOverheadProfitCost: TopHeaderValues && (checkForNull(TopHeaderValues.OverheadCost) +
          checkForNull(TopHeaderValues.ProfitCost) +
          checkForNull(TopHeaderValues.RejectionCost) +
          checkForNull(TopHeaderValues.ICCCost))
      }
      
      props.setHeaderCost(topHeaderData)
    }
  }, [OverheadProfitTabData]);

  /**
  * @method setPartDetails
  * @description SET PART DETAILS
  */
  const setPartDetails = (Params, Data = {}) => {
    let arr = formatData(Params, Data, OverheadProfitTabData)
    dispatch(setOverheadProfitData(arr, () => { }))
  }

  /**
  * @method formatData
  * @description FORMATE DATA FOR SET PART DETAILS
  */
  const formatData = (Params, Data, aar) => {
    let tempArr = [];
    try {
      tempArr = aar && aar.map(i => {

        if (i.IsAssemblyPart === true) {

          formatData(Params, Data, i.CostingChildPartDetails)

        } else if (i.PartNumber === Params.PartNumber && i.BOMLevel === Params.BOMLevel) {

          i.CostingPartDetails = Data;
          i.IsOpen = !i.IsOpen;

        } else {
          i.IsOpen = false;
          formatData(Params, Data, i.CostingChildPartDetails)
        }
        return i;

      });
    } catch (error) {

    }
    return tempArr;
  }

  /**
  * @method toggleAssembly
  * @description SET ASSEMBLY DETAILS
  */
  const toggleAssembly = (params, Children = {}) => {
    let arr = setAssembly(params, Children, OverheadProfitTabData)
    dispatch(setOverheadProfitData(arr, (res) => { }))
  }

  /**
  * @method setAssembly
  * @description SET ASSEMBLY DETAILS
  */
  const setAssembly = (params, Children, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {

        const { CostingChildPartDetails, CostingPartDetails } = Children;

        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          i.CostingChildPartDetails = params.BOMLevel !== LEVEL0 ? ChangeBOMLeveL(CostingChildPartDetails, params.BOMLevel) : i.CostingChildPartDetails;
          i.CostingPartDetails = CostingPartDetails;

          i.IsAssemblyPart = true;
          i.IsOpen = !i.IsOpen;

        } else {

          setAssembly(params, Children, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {

    }
    return tempArr;

  }

  /**
  * @method ChangeBOMLeveL
  * @description INCREASE BOM LEVEL BY 1 
  */
  const ChangeBOMLeveL = (item, level) => {
    let tempArr = [];
    const ChangedLevel = parseInt(level.substr(1, level.length - 1)) + 1;
    tempArr = item && item.map(i => {
      i.BOMLevel = "L" + ChangedLevel;
      return i;
    });
    return tempArr;
  }

  /**
  * @method setOverheadDetail
  * @description SET OVERHEAD DETAILS
  */
  const setOverheadDetail = (data, params) => {
    let arr = dispatchOverheadDetail(data, params, OverheadProfitTabData)
    dispatch(setOverheadProfitData(arr, (res) => { }))
  }

  /**
  * @method dispatchOverheadDetail
  * @description SET OVERHEAD DEATILS
  */
  const dispatchOverheadDetail = (data, params, arr) => {

    const { overheadObj, profitObj, modelType } = data;


    let OverheadCost = checkForNull(overheadObj.OverheadRMTotalCost) +
      checkForNull(overheadObj.OverheadBOPTotalCost) +
      checkForNull(overheadObj.OverheadCCTotalCost);

    if (overheadObj.IsOverheadFixedApplicable === true) {
      OverheadCost = overheadObj.OverheadFixedTotalCost;
    }

    if (overheadObj.IsOverheadCombined === true) {
      OverheadCost = overheadObj.OverheadCombinedTotalCost;
    }

    let ProfitCost = checkForNull(profitObj.ProfitRMTotalCost) +
      checkForNull(profitObj.ProfitBOPTotalCost) +
      checkForNull(profitObj.ProfitCCTotalCost);

    if (profitObj.IsProfitFixedApplicable === true) {
      ProfitCost = profitObj.ProfitFixedTotalCost;
    }

    if (profitObj.IsProfitCombined === true) {
      ProfitCost = profitObj.ProfitCombinedTotalCost;
    }

    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.CostingOverheadDetail = overheadObj;
          i.CostingPartDetails.CostingProfitDetail = profitObj;
          i.CostingPartDetails.OverheadCost = OverheadCost;
          i.CostingPartDetails.ProfitCost = ProfitCost;
          i.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(OverheadCost) + checkForNull(ProfitCost) + checkForNull(i?.CostingPartDetails?.RejectionCost) +
            checkForNull(i?.CostingPartDetails?.ICCCost)
          i.CostingPartDetails.TotalOverheadAndProfitPerAssembly = checkForNull(OverheadCost) + checkForNull(ProfitCost);
          i.CostingPartDetails.ModelType = modelType.label;
          i.CostingPartDetails.ModelTypeId = modelType.value;

          formatData(data, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          i.CostingPartDetails.CostingOverheadDetail = overheadObj;
          i.CostingPartDetails.CostingProfitDetail = profitObj;
          i.CostingPartDetails.OverheadCost = OverheadCost;
          i.CostingPartDetails.ProfitCost = ProfitCost;
          i.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(OverheadCost) + checkForNull(ProfitCost) + checkForNull(i?.CostingPartDetails?.RejectionCost) +
            checkForNull(i?.CostingPartDetails?.ICCCost)
          i.CostingPartDetails.TotalOverheadAndProfitPerAssembly = checkForNull(OverheadCost) + checkForNull(ProfitCost);
          i.CostingPartDetails.ModelType = modelType.label;
          i.CostingPartDetails.ModelTypeId = modelType.value;

        } else {
          i.IsOpen = false;
          formatData(data, params, i.CostingChildPartDetails)
        }
        return i;

      });
    } catch (error) {

    }
    return tempArr;
  }

  /**
* @method setProfitDetail
* @description SET PROFIT DETAILS
*/
  const setProfitDetail = (data, params) => {
    let arr = dispatchProfitDetail(data, params, OverheadProfitTabData)
    dispatch(setOverheadProfitData(arr, (res) => { }))
  }

  /**
  * @method setProfitDetail
  * @description SET PROFIT DETAIL COST
  */
  const dispatchProfitDetail = (data, params, arr) => {

    const { overheadObj, profitObj } = data;
    let OverheadCost = checkForNull(overheadObj.OverheadRMTotalCost) +
      checkForNull(overheadObj.OverheadBOPTotalCost) +
      checkForNull(overheadObj.OverheadCCTotalCost);

    let ProfitCost = checkForNull(profitObj.ProfitRMTotalCost) +
      checkForNull(profitObj.ProfitBOPTotalCost) +
      checkForNull(profitObj.ProfitCCTotalCost);

    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.CostingProfitDetail = profitObj;
          i.CostingPartDetails.ProfitCost = ProfitCost;
          i.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(OverheadCost) + checkForNull(ProfitCost) + checkForNull(i?.CostingPartDetails?.RejectionCost) +
            checkForNull(i?.CostingPartDetails?.ICCCost)
          i.CostingPartDetails.TotalOverheadAndProfitPerAssembly = checkForNull(OverheadCost) + checkForNull(ProfitCost);

          formatData(data, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          i.CostingPartDetails.CostingProfitDetail = profitObj;
          i.CostingPartDetails.ProfitCost = ProfitCost;
          i.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(OverheadCost) + checkForNull(ProfitCost) + checkForNull(i?.CostingPartDetails?.RejectionCost) +
            checkForNull(i?.CostingPartDetails?.ICCCost)
          i.CostingPartDetails.TotalOverheadAndProfitPerAssembly = checkForNull(OverheadCost) + checkForNull(ProfitCost);

        } else {
          i.IsOpen = false;
          formatData(data, params, i.CostingChildPartDetails)
        }
        return i;

      });
    } catch (error) {

    }
    return tempArr;

  }

  /**
* @method setRejectionDetail
* @description SET REJECTION DETAILS
*/
  const setRejectionDetail = (data, params) => {
    let arr = dispatchRejectionDetail(data, params, OverheadProfitTabData)
    dispatch(setOverheadProfitData(arr, (res) => { }))
  }


  /**
  * @method dispatchRejectionDetail
  * @description SET REJECTION DETAIL 
  */
  const dispatchRejectionDetail = (rejectionObj, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {
          i.CostingPartDetails.CostingRejectionDetail = rejectionObj;
          i.CostingPartDetails.RejectionCost = rejectionObj.RejectionTotalCost;
          i.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(i?.CostingPartDetails?.OverheadCost) +     // IF PROBLEM IN TOTAL COST OF OVERHEAD PROFIT TAB COMMENT THIS
            checkForNull(i?.CostingPartDetails?.ProfitCost) +
            checkForNull(rejectionObj.RejectionTotalCost) +
            checkForNull(i?.CostingPartDetails?.ICCCost)


          formatData(rejectionObj, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {
          i.CostingPartDetails.CostingRejectionDetail = rejectionObj;
          i.CostingPartDetails.RejectionCost = rejectionObj.RejectionTotalCost;
          i.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(i?.CostingPartDetails?.OverheadCost) +
            checkForNull(i?.CostingPartDetails?.ProfitCost) +
            checkForNull(rejectionObj.RejectionTotalCost) +
            checkForNull(i?.CostingPartDetails?.ICCCost)
        } else {
          i.IsOpen = false;
          formatData(rejectionObj, params, i.CostingChildPartDetails)
        }
        return i;

      });
    } catch (error) {

    }
    return tempArr;

  }

  /**
  * @method setICCDetail
  * @description SET ICC DETAILS
  */
  const setICCDetail = (data, params) => {
    let arr = dispatchICCDetail(data, params, OverheadProfitTabData)
    dispatch(setOverheadProfitData(arr, (res) => { }))
  }

  /**
  * @method dispatchICCDetail
  * @description SET ICC DETAIL 
  */
  const dispatchICCDetail = (ICCObj, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.ICCCost = ICCObj && ICCObj.NetCost ? checkForNull(ICCObj.NetCost) : 0;
          i.CostingPartDetails.CostingInterestRateDetail = {
            ...i?.CostingPartDetails?.CostingInterestRateDetail,
            ICCApplicabilityDetail: ICCObj,
            IsInventoryCarringCost: ICCObj && ICCObj.NetCost ? true : false,
            NetICC: ICCObj && ICCObj.NetCost ? checkForNull(ICCObj.NetCost) : 0,
          };
          // i?.CostingPartDetails?.NetOverheadAndProfitCost = checkForNull(i?.CostingPartDetails?.OverheadCost) +
          //   checkForNull(i?.CostingPartDetails?.ProfitCost) +
          //   checkForNull(i?.CostingPartDetails?.RejectionCost) +
          //   checkForNull(ICCObj.NetCost) +
          //   checkForNull(i?.CostingPartDetails?.PaymentTermCost);

          formatData(ICCObj, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          i.CostingPartDetails.ICCCost = ICCObj && ICCObj.NetCost ? checkForNull(ICCObj.NetCost) : 0;
          i.CostingPartDetails.CostingInterestRateDetail = {
            ...i?.CostingPartDetails?.CostingInterestRateDetail,
            ICCApplicabilityDetail: ICCObj,
            IsInventoryCarringCost: ICCObj && ICCObj.NetCost ? true : false,
            NetICC: ICCObj && ICCObj.NetCost ? checkForNull(ICCObj.NetCost) : 0,
          };
          // i?.CostingPartDetails?.NetOverheadAndProfitCost = checkForNull(i?.CostingPartDetails?.OverheadCost) +
          //   checkForNull(i?.CostingPartDetails?.ProfitCost) +
          //   checkForNull(i?.CostingPartDetails?.RejectionCost) +
          //   checkForNull(ICCObj.NetCost) +
          //   checkForNull(i?.CostingPartDetails?.PaymentTermCost);

        } else {
          i.IsOpen = false;
          formatData(ICCObj, params, i.CostingChildPartDetails)
        }
        return i;

      });
    } catch (error) {

    }
    return tempArr;

  }


  /**
* @method setPaymentTermsDetail
* @description SET PAYMENT TERMS DETAIL 
*/
  const setPaymentTermsDetail = (data, params) => {
    let arr = dispatchPaymentTermsDetail(data, params, OverheadProfitTabData)
    dispatch(setOverheadProfitData(arr, (res) => { }))
  }

  /**
  * @method dispatchPaymentTermsDetail
  * @description SET PAYMENT TERMS DETAIL 
  */
  const dispatchPaymentTermsDetail = (PaymentTermObj, params, arr) => {

    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          // i.CostingPartDetails.PaymentTermCost = PaymentTermObj && PaymentTermObj.NetCost ? checkForNull(PaymentTermObj.NetCost) : 0;
          // i.CostingPartDetails.CostingInterestRateDetail = {
          //   ...i?.CostingPartDetails?.CostingInterestRateDetail,
          //   PaymentTermDetail: PaymentTermObj,
          //   IsPaymentTerms: PaymentTermObj && PaymentTermObj?.NetCost ? true : false,
          //   NetPaymentTermCost: PaymentTermObj && PaymentTermObj.NetCost ? checkForNull(PaymentTermObj.NetCost) : 0,
          // };
          // i?.CostingPartDetails?.NetOverheadAndProfitCost = checkForNull(i?.CostingPartDetails?.OverheadCost) +
          //   checkForNull(i?.CostingPartDetails?.ProfitCost) +
          //   checkForNull(i?.CostingPartDetails?.RejectionCost) +
          //   checkForNull(i?.CostingPartDetails?.ICCCost) +
          //   checkForNull(PaymentTermObj.NetCost);

          formatData(PaymentTermObj, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          // i.CostingPartDetails.PaymentTermCost = PaymentTermObj && PaymentTermObj.NetCost ? checkForNull(PaymentTermObj.NetCost) : 0;
          // i.CostingPartDetails.CostingInterestRateDetail = {
          //   ...i?.CostingPartDetails?.CostingInterestRateDetail,
          //   PaymentTermDetail: PaymentTermObj,
          //   IsPaymentTerms: PaymentTermObj && PaymentTermObj?.NetCost ? true : false,
          //   NetPaymentTermCost: PaymentTermObj && PaymentTermObj.NetCost ? checkForNull(PaymentTermObj.NetCost) : 0,
          // };
          // i?.CostingPartDetails?.NetOverheadAndProfitCost = checkForNull(i?.CostingPartDetails?.OverheadCost) +
          //   checkForNull(i?.CostingPartDetails?.ProfitCost) +
          //   checkForNull(i?.CostingPartDetails?.RejectionCost) +
          //   checkForNull(i?.CostingPartDetails?.ICCCost) +
          //   checkForNull(PaymentTermObj.NetCost);

        } else {
          i.IsOpen = false;
          formatData(PaymentTermObj, params, i.CostingChildPartDetails)
        }
        return i;

      });
    } catch (error) {

    }
    return tempArr;

  }

  /**
  * @method onPressIncludeSurfaceTreatment
  * @description SET INCLUDE SURFACE TREATMENT
  */
  const onPressIncludeSurfaceTreatment = () => {
    dispatch(setSurfaceCostInOverheadProfit(!IsIncludeSurfaceTreatment, () => { }))
    setIsIncludeSurfaceTreatment(!IsIncludeSurfaceTreatment)
    setIsPressST(true)
    dispatch(isOverheadProfitDataChange(true))
  }

  /**
  * @method onPressIncludeSurfaceTreatmentRejection
  * @description SET INCLUDE SURFACE TREATMENT
  */
  const onPressIncludeSurfaceTreatmentRejection = () => {
    dispatch(setSurfaceCostInOverheadProfitRejection(!IsIncludeSurfaceTreatmentRejection, () => { }))
    setIsIncludeSurfaceTreatmentRejection(!IsIncludeSurfaceTreatmentRejection)
    setIsPressSTRejection(true)
    dispatch(isOverheadProfitDataChange(true))
  }

  const onPressIncludeToolCost = () => {
    if (ToolTabData[0]?.CostingPartDetails?.CostingToolCostResponse[0]?.ToolCostType && ToolTabData[0].CostingPartDetails.CostingToolCostResponse[0].ToolCostType !== 'Fixed') {
      Toaster.warning('Tool Maintenance Applicability should be Fixed to add tool cost in overhead & profit.')
      return false
    } else {
      dispatch(setToolCostInOverheadProfit(!IsIncludeToolCost, () => { }))
      setIsIncludeToolCost(!IsIncludeToolCost)
      setIsPressToolCost(true)
      dispatch(isOverheadProfitDataChange(true))
    }
  }

  const onPressIncludeOverheadProfitInIcc = () => {

    dispatch(setIncludeOverheadProfitIcc(!IncludeOverheadProfitInIcc, () => { }))
    setIsPressedOverHeadAndProfit(true)
    setIncludeOverheadProfitInIcc(!IncludeOverheadProfitInIcc)
    dispatch(isOverheadProfitDataChange(true))
  }
  const onPressIsIncludeToolCostInCCForICC = () => {
    if (ToolTabData[0]?.CostingPartDetails?.CostingToolCostResponse[0]?.ToolCostType && ToolTabData[0].CostingPartDetails.CostingToolCostResponse[0].ToolCostType !== 'Fixed') {
      Toaster.warning('Tool Maintenance Applicability should be Fixed to add tool cost in ICC.')
      return false
    } else {
      dispatch(setIncludeToolCostIcc(!IsIncludeToolCostInCCForICC, () => { }))
      setIsPressedToolCostICC(true)
      setIsIncludeToolCostInCCForICC(!IsIncludeToolCostInCCForICC)
      dispatch(isOverheadProfitDataChange(true))
    }
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => { }

  return (
    <>
      <div className="login-container signup-form">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">

              <Row className="m-0 border-left border-right">
                {/* {costData.IsAssemblyPart &&
                  <Col md="12" className="px-30 py-4 costing-border-x border-bottom-0">
                    <span className="d-inline-block pr-2 text-dark-blue">Applicability:</span>
                    <div className="switch d-inline-flex">
                      <label className="switch-level d-inline-flex w-auto">
                        <div className={"left-title"}>{" Assembly Level"}</div>
                        <span className="cr-sw-level">
                          <span className="cr-switch-icon">
                            <Switch
                              onChange={onPressApplicability}
                              checked={IsApplicableForChildParts}
                              id="normal-switch"
                              disabled={costData.IsAssemblyPart ? true : false}
                              background="#4DC771"
                              onColor="#4DC771"
                              onHandleColor="#ffffff"
                              offColor="#CCC"
                              uncheckedIcon={false}
                              checkedIcon={false}
                              height={20}
                              width={46}
                            />
                          </span>
                        </span>
                        <div className={"right-title"}>{"Sub Assembly Level"}</div>
                      </label>
                    </div>
                  </Col>
                } */}

                <Col md="12" className="py-3 overhead-profit-tab">
                  <label
                    id="Overhead_profit_checkbox1"
                    className={`custom-checkbox mb-0 w-fit-content`}
                    onChange={onPressIncludeSurfaceTreatment}
                  >
                    Include Surface Treatment Cost in CC for Overhead and Profit
                    <input
                      type="checkbox"
                      checked={IsIncludeSurfaceTreatment}
                      disabled={(CostingViewMode || (OverheadProfitTabData && OverheadProfitTabData[0]?.IsOpen === false)) ? true : false}
                    />
                    <span
                      className=" before-box"
                      checked={IsIncludeSurfaceTreatment}
                      onChange={onPressIncludeSurfaceTreatment}
                    />
                  </label>
                  <label
                    id="Overhead_profit_checkbox2"
                    className={`custom-checkbox mb-0 w-fit-content`}
                    onChange={onPressIncludeSurfaceTreatmentRejection}
                  >
                    Include Surface Treatment Cost in CC for Rejection
                    <input
                      type="checkbox"
                      checked={IsIncludeSurfaceTreatmentRejection}
                      disabled={(CostingViewMode || (OverheadProfitTabData && OverheadProfitTabData[0]?.IsOpen === false)) ? true : false}
                    />
                    <span
                      className=" before-box"
                      checked={IsIncludeSurfaceTreatmentRejection}
                      onChange={onPressIncludeSurfaceTreatmentRejection}
                    />
                  </label>

                  <label
                    id="Overhead_profit_checkbox3"
                    className={`custom-checkbox mb-0 w-fit-content`}
                    onChange={onPressIncludeToolCost}
                  >
                    Include Tool cost in CC for Overhead and Profit
                    <input
                      type="checkbox"
                      checked={IsIncludeToolCost}
                      disabled={(CostingViewMode || (OverheadProfitTabData && OverheadProfitTabData[0]?.IsOpen === false)) ? true : false}
                    />
                    <span
                      className=" before-box"
                      checked={IsIncludeToolCost}
                      onChange={onPressIncludeToolCost}
                    />
                  </label>

                  <label
                    id="Overhead_profit_checkbox4"
                    className={`custom-checkbox mb-0 w-fit-content`}
                    onChange={onPressIncludeOverheadProfitInIcc}
                  >
                    Include Overhead & Profit in ICC
                    <input
                      type="checkbox"
                      checked={IncludeOverheadProfitInIcc}
                      disabled={(CostingViewMode || (OverheadProfitTabData && OverheadProfitTabData[0]?.IsOpen === false)) ? true : false}
                    />
                    <span
                      className=" before-box"
                      checked={IncludeOverheadProfitInIcc}
                      onChange={onPressIncludeOverheadProfitInIcc}
                    />
                  </label>

                  <label
                    id="Overhead_profit_checkbox5"
                    className={`custom-checkbox mb-0 w-fit-content`}
                    onChange={onPressIsIncludeToolCostInCCForICC}
                  >
                    Include Tool Cost in CC for ICC
                    <input
                      type="checkbox"
                      checked={IsIncludeToolCostInCCForICC}
                      disabled={(CostingViewMode || (OverheadProfitTabData && OverheadProfitTabData[0]?.IsOpen === false)) ? true : false}
                    />
                    <span
                      className=" before-box"
                      checked={IsIncludeToolCostInCCForICC}
                      onChange={onPressIsIncludeToolCostInCCForICC}
                    />
                  </label>

                </Col>
              </Row>

              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}              >
                <Row>
                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                      <thead>
                        <tr>
                          <th className="py-3 align-middle" style={{ width: "100px" }}>{`Part Number`}</th>
                          <th className="py-3 align-middle" style={{ width: '100px' }}>{`Type`}</th>
                          <th className="py-3 align-middle" style={{ width: "100px" }}>{`Net Overhead`}</th>
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Net Profit`}</th>
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Net Rejection`}</th>
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Net ICC`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {OverheadProfitTabData && OverheadProfitTabData.map((item, index) => {

                          if (item && (item.PartType === 'Component' || isBreakupBoughtOutPartCostingFromAPI)) {

                            return (
                              < >
                                <PartOverheadProfit
                                  index={index}
                                  item={item}
                                  IsIncludeSurfaceTreatment={IsIncludeSurfaceTreatment}
                                  IsIncludedSurfaceInRejection={IsIncludeSurfaceTreatmentRejection}
                                  IsIncludeToolCost={IsIncludeToolCost}
                                  IncludeOverheadProfitInIcc={IncludeOverheadProfitInIcc}
                                  IncludeToolcostInCCForICC={IsIncludeToolCostInCCForICC}
                                  setPartDetails={setPartDetails}
                                  setOverheadDetail={setOverheadDetail}
                                  setProfitDetail={setProfitDetail}
                                  setRejectionDetail={setRejectionDetail}
                                  setICCDetail={setICCDetail}
                                />
                              </>
                            )

                          } else {
                            return (
                              < >
                                <AssemblyOverheadProfit
                                  index={index}
                                  item={item}
                                  children={item.CostingChildPartDetails}
                                  IsIncludeSurfaceTreatment={IsIncludeSurfaceTreatment}
                                  IsIncludeSurfaceTreatmentRejection={IsIncludeSurfaceTreatmentRejection}
                                  IsIncludeToolCost={IsIncludeToolCost}
                                  IncludeOverheadProfitInIcc={IncludeOverheadProfitInIcc}
                                  IncludeToolcostInCCForICC={IsIncludeToolCostInCCForICC}
                                  setPartDetails={setPartDetails}
                                  toggleAssembly={toggleAssembly}
                                  setOverheadDetail={setOverheadDetail}
                                  setProfitDetail={setProfitDetail}
                                  setRejectionDetail={setRejectionDetail}
                                  setICCDetail={setICCDetail}
                                />
                              </>
                            )
                          }

                        })}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </form>
              {OverheadProfitTabData && OverheadProfitTabData[0]?.IsOpen === false && <WarningMessage dClass={"col-md-12 pr-0 justify-content-end"} message={'Please open the accordion first, if you wish to tick/untick the checkboxes.'} />}
            </div >
          </Col >
        </Row >
      </div >
    </>
  );
};

export default React.memo(TabOverheadProfit);