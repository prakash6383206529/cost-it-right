import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, } from 'react-hook-form';
import { gridDataAdded, saveAssemblyPartRowCostingCalculation, saveCostingPaymentTermDetail, saveCostingSurfaceTab, saveDiscountOtherCostTab, setComponentDiscountOtherItemData } from '../../../actions/Costing';
import SurfaceTreatmentCost from './SurfaceTreatmentCost';
import TransportationCost from './TransportationCost';
import Drawer from '@material-ui/core/Drawer';
import { Row, Col, } from 'reactstrap';
import Toaster from '../../../../common/Toaster';
import { MESSAGES } from '../../../../../config/message';
import { costingInfoContext, netHeadCostContext, NetPOPriceContext } from '../../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../../helper';
import { createToprowObjAndSave, findrmCctData, formatMultiTechnologyUpdate } from '../../../CostingUtil';
import { IsPartType, ViewCostingContext } from '../../CostingDetails';
import { useState } from 'react';
import { IdForMultiTechnology, PART_TYPE_ASSEMBLY } from '../../../../../config/masterData';
import { debounce } from 'lodash';
import { updateMultiTechnologyTopAndWorkingRowCalculation } from '../../../actions/SubAssembly';
import { ASSEMBLY, ASSEMBLYNAME, LEVEL0, WACTypeId } from '../../../../../config/constants';
import { reactLocalStorage } from 'reactjs-localstorage';
import { PreviousTabData } from '../../CostingHeaderTabs';
function SurfaceTreatment(props) {
  const { surfaceData, transportationData, item } = props;
  const previousTab = useContext(PreviousTabData) || 0;
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
  const { handleSubmit } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const dispatch = useDispatch()

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const { ComponentItemDiscountData, CostingEffectiveDate, RMCCTabData, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, DiscountCostData, ToolTabData, getAssemBOPCharge, isBreakupBoughtOutPartCostingFromAPI, PaymentTermDataDiscountTab } = useSelector(state => state.costing)
  const price = useContext(NetPOPriceContext)
  const costData = useContext(costingInfoContext);

  const CostingViewMode = useContext(ViewCostingContext);
  const [transportationObject, setTransportationObject] = useState({})
  const [surfaceTreatmentData, setSurfacTreatmenteData] = useState({})
  const [callDiscountApi, setCallDiscountApi] = useState(false)
  const [surfaceTableData, setSurfacetableData] = useState(item.CostingPartDetails.SurfaceTreatmentDetails)
  const [transportObj, setTrasportObj] = useState(item.CostingPartDetails.TransportationDetails)
  const partType = IdForMultiTechnology.includes(String(costData?.TechnologyId))

  const [errorObjectTransport, setErrorObjectTransport] = useState({})
  const [errorObjectSurfaceTreatment, setErrorObjectSurfaceTreatment] = useState({})
  const [callAPI, setCallAPI] = useState(false)
  const headerCosts = useContext(netHeadCostContext);
  const isPartType = useContext(IsPartType);

  useEffect(() => {
    setTrasportObj(item?.CostingPartDetails?.TransportationDetails)
  }, [item?.CostingPartDetails?.TransportationDetails])

  useEffect(() => {
    const callApi = () => {
      setCallAPI(false)
      let rmCcData = 0
      let tabData = 0
      let surfaceTabData = 0
      let overHeadAndProfitTabData = 0
      let toolTabData = 0
      let packageAndFreightTabData = 0

      surfaceTabData = SurfaceTabData && SurfaceTabData[0]
      tabData = RMCCTabData && RMCCTabData[0]
      overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]
      packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
      toolTabData = ToolTabData && ToolTabData[0]

      let basicRateTemp = ''
      let totalCostTemp = ''

      if (tabData?.PartType === 'Assembly') {
        rmCcData = findrmCctData(item)
        switch (item?.PartType) {
          case 'Part':
            basicRateTemp = checkForNull(rmCcData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) + checkForNull(item?.CostingPartDetails?.NetSurfaceTreatmentCost)
            totalCostTemp = checkForNull(rmCcData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) + checkForNull(item?.CostingPartDetails?.NetSurfaceTreatmentCost)

            break;
          case 'Sub Assembly':
            basicRateTemp = checkForNull(rmCcData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys)
            totalCostTemp = checkForNull(rmCcData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys)

            break;
          case 'Assembly':
            basicRateTemp = ((checkForNull(tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
              checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost)
              + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(DiscountCostData?.AnyOtherCost)) - checkForNull(DiscountCostData?.HundiOrDiscountValue))

            totalCostTemp = ((checkForNull(tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
              checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost)
              + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(DiscountCostData?.AnyOtherCost) +
              checkForNull(DiscountCostData?.totalConditionCost)) - checkForNull(DiscountCostData?.HundiOrDiscountValue))

            break;

          default:
            break;
        }
      } else if (tabData?.PartType === 'Component') {

        basicRateTemp = ((checkForNull(tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
          checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost)
          + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(DiscountCostData?.AnyOtherCost)) - checkForNull(DiscountCostData?.HundiOrDiscountValue))

        totalCostTemp = ((checkForNull(tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
          checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost)
          + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(DiscountCostData?.AnyOtherCost) +
          checkForNull(DiscountCostData?.totalConditionCost)) - checkForNull(DiscountCostData?.HundiOrDiscountValue))

      } else if (partType) {

        basicRateTemp = (checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
          checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
          checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(DiscountCostData?.AnyOtherCost)) -
          checkForNull(DiscountCostData?.HundiOrDiscountValue)

        totalCostTemp = (checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
          checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
          checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(DiscountCostData?.AnyOtherCost) + checkForNull(DiscountCostData?.totalConditionCost)) -
          checkForNull(DiscountCostData?.HundiOrDiscountValue)

      }

      if (!partType) {
        if (props.IsAssemblyCalculation) {
          mergedAPI(totalCostTemp, props.IsAssemblyCalculation, true, basicRateTemp)
        } else {
          mergedAPI(totalCostTemp, false, false, basicRateTemp)
        }
      } else if (partType) {

        mergedAPI(totalCostTemp, false, false, basicRateTemp)

      }
    }

    const mergedAPI = (totalCostAPI, IsAssemblyCalculation, IsAssemblyPart, basicRateTemp) => {
      const tabData = RMCCTabData && RMCCTabData[0]

      const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
      const overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]
      const discountAndOtherTabData = DiscountCostData

      const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
      const toolTabData = ToolTabData && ToolTabData[0]


      let totalPOriceForAssembly = checkForNull(surfaceTabData?.CostingPartDetails?.BasicRate) + checkForNull(discountAndOtherTabData?.totalConditionCost) + checkForNull(discountAndOtherTabData?.totalNpvCost)

      let basicRate = surfaceTabData?.CostingPartDetails.BasicRate

      let requestData = {
        "CostingId": item.CostingId,
        "PartId": item.PartId,
        "PartNumber": item.PartNumber,
        "BOMLevel": item.BOMLevel,
        "CostingNumber": item.CostingNumber,
        "NetSurfaceTreatmentCost": item?.CostingPartDetails?.NetSurfaceTreatmentCost,
        "EffectiveDate": CostingEffectiveDate,
        "LoggedInUserId": loggedInUserId(),
        // THIS CONDITION IS USED FOR ASSEMBLY COSTING ,IN ASSEMBLY COSTING TOTAL COST IS SUM OF RMCCTAB DATA + SURFACE TREATEMNT TAB DATA OF THAT PART NUMBER (FOR PART/COMPONENT &ASSEMBLY KEY IS DIFFERENT)
        "TotalCost": totalCostAPI,
        "BasicRate": basicRateTemp,
        "CostingPartDetails": {
          "CostingDetailId": "00000000-0000-0000-0000-000000000000",
          "NetSurfaceTreatmentCost": item?.CostingPartDetails?.NetSurfaceTreatmentCost,
          "SurfaceTreatmentCost": item?.CostingPartDetails?.SurfaceTreatmentCost,
          "TransportationCost": item?.CostingPartDetails?.TransportationCost,
          "SurfaceTreatmentDetails": item?.CostingPartDetails?.SurfaceTreatmentDetails,
          "TransportationDetails": item?.CostingPartDetails?.TransportationDetails,
        },
      }
      // IN COSTING VIEW MODE
      if (!CostingViewMode) {
        // WHEN PARTTYPE IS ASSEMBLY AND NOT ASSEMBLY TECHNOLOGY
        if (IsAssemblyCalculation && !partType) {

          requestData.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = item?.CostingPartDetails?.NetSurfaceTreatmentCost
          requestData.CostingPartDetails.TotalTransportationCostPerAssembly = item?.CostingPartDetails?.TransportationCost
          requestData.CostingPartDetails.IsAssemblyPart = IsAssemblyPart

          let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, totalPOriceForAssembly, getAssemBOPCharge, 2, CostingEffectiveDate, initialConfiguration?.IsShowCostingLabour, basicRate, isPartType)
          dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
        } else if (partType) {
          setTimeout(() => {
            let request = formatMultiTechnologyUpdate(subAssemblyTechnologyArray[0], totalPOriceForAssembly, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate)
            dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))
            dispatch(gridDataAdded(true))
          }, 500);
        }

        setTimeout(() => {
          dispatch(saveCostingSurfaceTab(requestData, res => {
            if (res.data.Result) {
              Toaster.success(MESSAGES.SURFACE_TREATMENT_COSTING_SAVE_SUCCESS);
              setCallDiscountApi(true)
              props.closeDrawer('')
            }
          }))
        }, 500);
      }
    }
    if (callAPI) {
      callApi()
    }

  }, [DiscountCostData, callAPI])

  /**
  * @method toggleDrawer
  * @description TOGGLE DRAWER
  */
  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('')
  };

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer()
  }
  const setTransportationObj = (obj, errorObjectTransport) => {
    setErrorObjectTransport(errorObjectTransport)
    setTransportationObject(obj)
    setTrasportObj(obj.tempObj)

  }

  const setSurfaceData = (obj, errorObjectSurfaceTreatment) => {
    setErrorObjectSurfaceTreatment(errorObjectSurfaceTreatment)
    setSurfacTreatmenteData(obj)
    setSurfacetableData(obj.gridData)
  }


  /**
  * @method surfaceCost
  * @description GET SURFACE TREATMENT COST
  */
  const surfaceCost = (item) => {
    let cost = 0;
    cost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.SurfaceTreatmentCost);
    }, 0)
    return cost;
  }


  /**
  * @method saveData
  * @description SAVE DATA ASSEMBLY
  */
  const saveData = debounce(handleSubmit(() => {
    let count = 0
    let countST = 0
    for (var prop in errorObjectTransport) {
      if (Object.keys(errorObjectTransport[prop])?.length > 0) {
        count++
      }
    }
    for (var prop in errorObjectSurfaceTreatment) {
      if (Object.keys(errorObjectSurfaceTreatment[prop])?.length > 0) {
        countST++
      }
    }
    if (errorObjectSurfaceTreatment && (count !== 0 || countST !== 0)) return false;

    if (partType) {
      // WILL GET EXECUTE WHEN TECHNOLOGY OF COSTING WILL BE ASSEMBLY

      setTimeout(() => {
        setCallAPI(true)
      }, 200);
      props.setSurfaceTreatmentCostAssemblyTechnology(surfaceTreatmentData?.gridData, transportObj, surfaceTreatmentData.Params)
    }
    if (transportationObject.UOM === "Percentage" && transportationObject.Rate !== null && transportationObject.Rate > 100) {
      return false
    }
    if ((IsLocked === false || !CostingViewMode) && partType === false) {
      if (props.IsAssemblyCalculation) {
        props.setAssemblySurfaceCost(surfaceTreatmentData.gridData, surfaceTreatmentData.Params, JSON.stringify(surfaceTreatmentData.gridData) !== JSON.stringify(surfaceTreatmentData.OldGridData) ? true : false, props.item)
        props.setAssemblyTransportationCost(transportObj, transportationObject.Params, item)
        setCallAPI(true)
      } else {
        props.setSurfaceCost(surfaceTreatmentData.gridData, surfaceTreatmentData.Params, JSON.stringify(surfaceTreatmentData.gridData) !== JSON.stringify(surfaceTreatmentData.OldGridData) ? true : false)
        props.setTransportationCost(transportObj, transportationObject.Params)
        setCallAPI(true)

      }
    }

  }), 500);


  useEffect(() => {
    if (callDiscountApi) {
      InjectDiscountAPICall()
      // setCallDiscountApi(false)
    }
  }, [callDiscountApi])
  // }, [ComponentItemDiscountData, callDiscountApi])

  const InjectDiscountAPICall = () => {
    // if (props.activeTab === '2') {
    const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
    const discountAndOtherTabData = DiscountCostData
    // let basicRate = surfaceTabData?.CostingPartDetails.BasicRate



    let basicRate = 0
    if (Number(isPartType?.value) === PART_TYPE_ASSEMBLY && !partType) {
      basicRate = checkForNull(RMCCTabData[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else if (partType) {
      let totalOverheadPrice = OverheadProfitTabData && (checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.OverheadCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ProfitCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.RejectionCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.PaymentTermCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ICCCost))
      basicRate = checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) + checkForNull(totalOverheadPrice) +
        checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else {
      basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    }

    let totalPOriceForAssembly = checkForNull(basicRate) + checkForNull(discountAndOtherTabData?.totalConditionCost) + checkForNull(discountAndOtherTabData?.totalNpvCost)
    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, EffectiveDate: CostingEffectiveDate, TotalCost: totalPOriceForAssembly, BasicRate: basicRate, NetPOPrice: totalPOriceForAssembly }, res => {
      if (Number(previousTab) === 6) {
        dispatch(saveCostingPaymentTermDetail(PaymentTermDataDiscountTab, (res) => { }));
      }
    }))
    // }
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <Drawer className="bottom-drawer" anchor='bottom' open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <div className="container-fluid">
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading sticky-top-0">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'Add Operation'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>
            <form
              noValidate
              className="form"

            >
              <Row className="mb-3 pt-3">
                <Col>
                  <div className="user-page p-0 px-3">
                    <div className="cr-process-costwrap">
                      <Row className="cr-innertool-cost">
                        {
                          (item.PartType !== 'Part' && item.PartType !== 'Component') ?
                            <>
                              <Col md="4" className="cr-costlabel">{`Operation Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked) ? item?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly : surfaceCost(surfaceTreatmentData?.gridData), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Transportation Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked) ? item?.CostingPartDetails?.TotalTransportationCostPerAssembly : checkForNull(transportObj?.TransportationCost), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Net Operation Cost:  ${(CostingViewMode || IsLocked) ? checkForDecimalAndNull((item?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + (item?.CostingPartDetails && item?.CostingPartDetails?.TotalTransportationCostPerAssembly !== null ? item?.CostingPartDetails?.TotalTransportationCostPerAssembly : 0), initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(checkForNull(surfaceCost(surfaceTreatmentData.gridData)) + checkForNull(transportObj?.TransportationCost), initialConfiguration.NoOfDecimalForPrice)}`}</Col>

                            </>
                            :
                            <>
                              <Col md="4" className="cr-costlabel">{`Operation Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked) ? checkForNull(item?.CostingPartDetails?.SurfaceTreatmentCost) : surfaceCost(surfaceTreatmentData?.gridData), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Extra Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked) ? checkForNull(item?.CostingPartDetails?.TransportationCost) : checkForNull(transportObj?.TransportationCost), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Net Operation Cost: ${(CostingViewMode || IsLocked) ?
                                checkForDecimalAndNull(item?.CostingPartDetails?.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) :
                                checkForDecimalAndNull(checkForNull(surfaceCost(surfaceTreatmentData?.gridData)) + checkForNull(transportObj?.TransportationCost), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
                            </>
                        }
                      </Row >

                      {/* <hr /> */}
                      < div className="user-page px-3 pb-3" >
                        <div>
                          <SurfaceTreatmentCost
                            index={props.index}
                            data={surfaceData}
                            item={props.item}
                            setSurfaceCost={props.setSurfaceCost}
                            IsAssemblyCalculation={props.IsAssemblyCalculation}
                            setAssemblySurfaceCost={props.setAssemblySurfaceCost}
                            setAssemblyTransportationCost={props.setAssemblyTransportationCost}
                            setSurfaceData={setSurfaceData}
                          />
                          {/* <hr /> */}

                          <TransportationCost
                            index={props.index}
                            data={transportationData}
                            item={props.item}
                            getTransportationObj={setTransportationObj}
                            setTransportationCost={props.setTransportationCost}
                            IsAssemblyCalculation={props.IsAssemblyCalculation}
                            setAssemblyTransportationCost={props.setAssemblyTransportationCost}
                            surfaceCost={surfaceCost(surfaceTableData)}
                          />
                        </div>
                      </div >

                    </div >
                  </div >
                </Col >
              </Row >

              <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                <div className="col-sm-12 text-right bluefooter-butn">
                  <button
                    type={'button'}
                    className="reset mr5 cancel-btn"
                    onClick={cancel} >
                    <div className={'cancel-icon'}></div> {'Cancel'}
                  </button>
                  <button
                    type={'button'}
                    className="submit-button mr15 save-btn"
                    disabled={(CostingViewMode || IsLocked) ? true : false}
                    onClick={saveData} >
                    <div className={'save-icon'}></div>
                    {'SAVE'}
                  </button>
                </div>
              </Row>
            </form >
          </div >
        </div >
      </Drawer >

    </ >
  );
}

export default SurfaceTreatment;