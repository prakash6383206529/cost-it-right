import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getOverheadProfitTabData, setOverheadProfitData, saveCostingOverheadProfitTab, setSurfaceCostInOverheadProfit } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, } from '../../../../helper';
import Switch from "react-switch";
import PartOverheadProfit from '../CostingHeadCosts/OverheadProfit/PartOverheadProfit';
import AssemblyOverheadProfit from '../CostingHeadCosts/OverheadProfit/AssemblyOverheadProfit';
import { LEVEL0 } from '../../../../helper/AllConastant';
import { ViewCostingContext } from '../CostingDetails';

function TabOverheadProfit(props) {

  const { handleSubmit, } = useForm();

  const [IsApplicableForChildParts, setIsApplicableForChildParts] = useState(false);
  const [IsIncludeSurfaceTreatment, setIsIncludeSurfaceTreatment] = useState(false);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

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

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    let TopHeaderValues = OverheadProfitTabData && OverheadProfitTabData.length > 0 && OverheadProfitTabData[0].CostingPartDetails !== undefined ? OverheadProfitTabData[0].CostingPartDetails : null;
    let topHeaderData = {
      NetOverheadProfitCost: TopHeaderValues && (checkForNull(TopHeaderValues.OverheadCost) +
        checkForNull(TopHeaderValues.ProfitCost) +
        checkForNull(TopHeaderValues.RejectionCost) +
        checkForNull(TopHeaderValues.ICCCost) +
        checkForNull(TopHeaderValues.PaymentTermCost))
    }
    props.setHeaderCost(topHeaderData)
  }, [OverheadProfitTabData]);

  const filteredUsers = React.useMemo(() => {
    setIsIncludeSurfaceTreatment(OverheadProfitTabData && OverheadProfitTabData.length > 0 && OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithOverheadAndProfit)
    dispatch(setSurfaceCostInOverheadProfit(OverheadProfitTabData && OverheadProfitTabData.length > 0 && OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithOverheadAndProfit, () => { }))
  }, [OverheadProfitTabData && OverheadProfitTabData.length > 0 && OverheadProfitTabData[0].IsIncludeSurfaceTreatmentWithOverheadAndProfit]
  );

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

    let OverheadCost = checkForDecimalAndNull(overheadObj.OverheadRMTotalCost, initialConfiguration.NoOfDecimalForPrice) +
      checkForDecimalAndNull(overheadObj.OverheadBOPTotalCost, initialConfiguration.NoOfDecimalForPrice) +
      checkForDecimalAndNull(overheadObj.OverheadCCTotalCost, initialConfiguration.NoOfDecimalForPrice);

    if (overheadObj.IsOverheadFixedApplicable === true) {
      OverheadCost = overheadObj.OverheadFixedTotalCost;
    }

    if (overheadObj.IsOverheadCombined === true) {
      OverheadCost = overheadObj.OverheadCombinedTotalCost;
    }

    let ProfitCost = checkForDecimalAndNull(profitObj.ProfitRMTotalCost, initialConfiguration.NoOfDecimalForPrice) +
      checkForDecimalAndNull(profitObj.ProfitBOPTotalCost, initialConfiguration.NoOfDecimalForPrice) +
      checkForDecimalAndNull(profitObj.ProfitCCTotalCost, initialConfiguration.NoOfDecimalForPrice);

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
          i.CostingPartDetails.NetOverheadAndProfitCost = OverheadCost + ProfitCost + checkForNull(i.CostingPartDetails.RejectionCost) +
            checkForNull(i.CostingPartDetails.ICCCost) +
            checkForNull(i.CostingPartDetails.PaymentTermCost);
          i.CostingPartDetails.TotalOverheadAndProfitPerAssembly = OverheadCost + ProfitCost;
          i.CostingPartDetails.ModelType = modelType.label;
          i.CostingPartDetails.ModelTypeId = modelType.value;

          formatData(data, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          i.CostingPartDetails.CostingOverheadDetail = overheadObj;
          i.CostingPartDetails.CostingProfitDetail = profitObj;
          i.CostingPartDetails.OverheadCost = OverheadCost;
          i.CostingPartDetails.ProfitCost = ProfitCost;
          i.CostingPartDetails.NetOverheadAndProfitCost = OverheadCost + ProfitCost + checkForNull(i.CostingPartDetails.RejectionCost) +
            checkForNull(i.CostingPartDetails.ICCCost) +
            checkForNull(i.CostingPartDetails.PaymentTermCost);
          i.CostingPartDetails.TotalOverheadAndProfitPerAssembly = OverheadCost + ProfitCost;
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

    let OverheadCost = checkForDecimalAndNull(overheadObj.OverheadRMTotalCost, initialConfiguration.NoOfDecimalForPrice) +
      checkForDecimalAndNull(overheadObj.OverheadBOPTotalCost, initialConfiguration.NoOfDecimalForPrice) +
      checkForDecimalAndNull(overheadObj.OverheadCCTotalCost, initialConfiguration.NoOfDecimalForPrice);

    let ProfitCost = checkForDecimalAndNull(profitObj.ProfitRMTotalCost, initialConfiguration.NoOfDecimalForPrice) +
      checkForDecimalAndNull(profitObj.ProfitBOPTotalCost, initialConfiguration.NoOfDecimalForPrice) +
      checkForDecimalAndNull(profitObj.ProfitCCTotalCost, initialConfiguration.NoOfDecimalForPrice);

    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.CostingProfitDetail = profitObj;
          i.CostingPartDetails.ProfitCost = ProfitCost;
          i.CostingPartDetails.NetOverheadAndProfitCost = OverheadCost + ProfitCost + checkForNull(i.CostingPartDetails.RejectionCost) +
            checkForNull(i.CostingPartDetails.ICCCost) +
            checkForNull(i.CostingPartDetails.PaymentTermCost);
          i.CostingPartDetails.TotalOverheadAndProfitPerAssembly = OverheadCost + ProfitCost;

          formatData(data, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          i.CostingPartDetails.CostingProfitDetail = profitObj;
          i.CostingPartDetails.ProfitCost = ProfitCost;
          i.CostingPartDetails.NetOverheadAndProfitCost = OverheadCost + ProfitCost + checkForNull(i.CostingPartDetails.RejectionCost) +
            checkForNull(i.CostingPartDetails.ICCCost) +
            checkForNull(i.CostingPartDetails.PaymentTermCost);
          i.CostingPartDetails.TotalOverheadAndProfitPerAssembly = OverheadCost + ProfitCost;

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
          // i.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(i.CostingPartDetails.OverheadCost) +
          //   checkForNull(i.CostingPartDetails.ProfitCost) +
          //   checkForNull(rejectionObj.RejectionTotalCost) +
          //   checkForNull(i.CostingPartDetails.ICCCost) +
          //   checkForNull(i.CostingPartDetails.PaymentTermCost);

          formatData(rejectionObj, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {
          i.CostingPartDetails.CostingRejectionDetail = rejectionObj;
          i.CostingPartDetails.RejectionCost = rejectionObj.RejectionTotalCost;
          // i.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(i.CostingPartDetails.OverheadCost) +
          //   checkForNull(i.CostingPartDetails.ProfitCost) +
          //   checkForNull(rejectionObj.RejectionTotalCost) +
          //   checkForNull(i.CostingPartDetails.ICCCost) +
          //   checkForNull(i.CostingPartDetails.PaymentTermCost);

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
            ...i.CostingPartDetails.CostingInterestRateDetail,
            ICCApplicabilityDetail: ICCObj,
            IsInventoryCarringCost: ICCObj && ICCObj.NetCost ? true : false,
            NetICC: ICCObj && ICCObj.NetCost ? checkForNull(ICCObj.NetCost) : 0,
          };
          // i.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(i.CostingPartDetails.OverheadCost) +
          //   checkForNull(i.CostingPartDetails.ProfitCost) +
          //   checkForNull(i.CostingPartDetails.RejectionCost) +
          //   checkForNull(ICCObj.NetCost) +
          //   checkForNull(i.CostingPartDetails.PaymentTermCost);

          formatData(ICCObj, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          i.CostingPartDetails.ICCCost = ICCObj && ICCObj.NetCost ? checkForNull(ICCObj.NetCost) : 0;
          i.CostingPartDetails.CostingInterestRateDetail = {
            ...i.CostingPartDetails.CostingInterestRateDetail,
            ICCApplicabilityDetail: ICCObj,
            IsInventoryCarringCost: ICCObj && ICCObj.NetCost ? true : false,
            NetICC: ICCObj && ICCObj.NetCost ? checkForNull(ICCObj.NetCost) : 0,
          };
          // i.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(i.CostingPartDetails.OverheadCost) +
          //   checkForNull(i.CostingPartDetails.ProfitCost) +
          //   checkForNull(i.CostingPartDetails.RejectionCost) +
          //   checkForNull(ICCObj.NetCost) +
          //   checkForNull(i.CostingPartDetails.PaymentTermCost);

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

          i.CostingPartDetails.PaymentTermCost = PaymentTermObj && PaymentTermObj.NetCost ? checkForNull(PaymentTermObj.NetCost) : 0;
          i.CostingPartDetails.CostingInterestRateDetail = {
            ...i.CostingPartDetails.CostingInterestRateDetail,
            PaymentTermDetail: PaymentTermObj,
            IsPaymentTerms: PaymentTermObj ? true : false,
            NetPaymentTermCost: PaymentTermObj && PaymentTermObj.NetCost ? checkForNull(PaymentTermObj.NetCost) : 0,
          };
          // i.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(i.CostingPartDetails.OverheadCost) +
          //   checkForNull(i.CostingPartDetails.ProfitCost) +
          //   checkForNull(i.CostingPartDetails.RejectionCost) +
          //   checkForNull(i.CostingPartDetails.ICCCost) +
          //   checkForNull(PaymentTermObj.NetCost);

          formatData(PaymentTermObj, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          i.CostingPartDetails.PaymentTermCost = PaymentTermObj && PaymentTermObj.NetCost ? checkForNull(PaymentTermObj.NetCost) : 0;
          i.CostingPartDetails.CostingInterestRateDetail = {
            ...i.CostingPartDetails.CostingInterestRateDetail,
            PaymentTermDetail: PaymentTermObj,
            IsPaymentTerms: PaymentTermObj ? true : false,
            NetPaymentTermCost: PaymentTermObj && PaymentTermObj.NetCost ? checkForNull(PaymentTermObj.NetCost) : 0,
          };
          // i.CostingPartDetails.NetOverheadAndProfitCost = checkForNull(i.CostingPartDetails.OverheadCost) +
          //   checkForNull(i.CostingPartDetails.ProfitCost) +
          //   checkForNull(i.CostingPartDetails.RejectionCost) +
          //   checkForNull(i.CostingPartDetails.ICCCost) +
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
  * @method onPressApplicability
  * @description SET ASSEMBLY LEVEL APPLICABILITY
  */
  const onPressApplicability = () => {
    setIsApplicableForChildParts(!IsApplicableForChildParts)
  }

  /**
  * @method onPressIncludeSurfaceTreatment
  * @description SET INCLUDE SURFACE TREATMENT
  */
  const onPressIncludeSurfaceTreatment = () => {
    dispatch(setSurfaceCostInOverheadProfit(!IsIncludeSurfaceTreatment, () => { }))
    setIsIncludeSurfaceTreatment(!IsIncludeSurfaceTreatment)
  }

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {
    const data = {
      // "CostingId": costData.CostingId,
      // "PartId": costData.PartId,
      // "PartNumber": costData.PartNumber,
      // "NetPOPrice": props.netPOPrice,
      // "LoggedInUserId": loggedInUserId(),
      // "IsApplicableForChildParts": IsApplicableForChildParts,
      // "NetOverheadAndProfitCost": OverheadCost + ProfitCost,
      // "OverheadNetCost": OverheadCost,
      // "ProfitNetCost": ProfitCost,
      // "RejectionNetCost": RejectionCost,
      // "ICCCost": ICCCost,
      // "PaymentTermCost": PaymentTermCostValue,
      // "CostingPartDetails": tabData
    }

    dispatch(saveCostingOverheadProfitTab(data, res => { }))

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

              <Row className="m-0">
                {costData.IsAssemblyPart &&
                  <Col md="6" className="px-30 py-4 costing-border-x border-bottom-0">
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
                          <div className={"right-title"}>
                            {"Sub Assembly Level"}
                          </div>
                        </span>
                      </label>
                    </div>
                  </Col>}

                <Col md="6" className="px-30 py-4 costing-border-x border-bottom-0">
                  <label
                    className={`custom-checkbox mb-0`}
                    onChange={onPressIncludeSurfaceTreatment}
                  >
                    Include Surface Treatment Cost in Overhead & Profit
                    <input
                      type="checkbox"
                      checked={IsIncludeSurfaceTreatment}
                      disabled={CostingViewMode ? true : false}
                    />
                    <span
                      className=" before-box"
                      checked={IsIncludeSurfaceTreatment}
                      onChange={onPressIncludeSurfaceTreatment}
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
                          <th className="py-3 align-middle" style={{ width: "100px" }}>{`Net Overheads`}</th>
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Net Profit`}</th>
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Net Rejection`}</th>
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Net ICC`}</th>
                          <th className="py-3 align-middle costing-border-right" style={{ width: "150px" }}>{`Payment Terms`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {OverheadProfitTabData && OverheadProfitTabData.map((item, index) => {

                          if (item && item.PartType === 'Component') {

                            return (
                              < >
                                <PartOverheadProfit
                                  index={index}
                                  item={item}
                                  IsIncludeSurfaceTreatment={IsIncludeSurfaceTreatment}
                                  setPartDetails={setPartDetails}
                                  setOverheadDetail={setOverheadDetail}
                                  setProfitDetail={setProfitDetail}
                                  setRejectionDetail={setRejectionDetail}
                                  setICCDetail={setICCDetail}
                                  setPaymentTermsDetail={setPaymentTermsDetail}
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
                                  setPartDetails={setPartDetails}
                                  toggleAssembly={toggleAssembly}
                                  setOverheadDetail={setOverheadDetail}
                                  setProfitDetail={setProfitDetail}
                                  setRejectionDetail={setRejectionDetail}
                                  setICCDetail={setICCDetail}
                                  setPaymentTermsDetail={setPaymentTermsDetail}
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
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default React.memo(TabOverheadProfit);