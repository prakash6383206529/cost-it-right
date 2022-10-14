import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, } from 'react-hook-form';
import { saveAssemblyPartRowCostingCalculation, saveCostingSurfaceTab, saveDiscountOtherCostTab, setComponentDiscountOtherItemData } from '../../../actions/Costing';
import SurfaceTreatmentCost from './SurfaceTreatmentCost';
import TransportationCost from './TransportationCost';
import Drawer from '@material-ui/core/Drawer';
import { Row, Col, } from 'reactstrap';
import Toaster from '../../../../common/Toaster';
import { MESSAGES } from '../../../../../config/message';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../../helper';
import { createToprowObjAndSave, findrmCctData } from '../../../CostingUtil';
import { ViewCostingContext } from '../../CostingDetails';
import { useState } from 'react';
import { ASSEMBLY } from '../../../../../config/masterData';

function SurfaceTreatment(props) {
  const { surfaceData, transportationData, item } = props;

  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)

  const { handleSubmit } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const dispatch = useDispatch()

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const { ComponentItemDiscountData, CostingEffectiveDate, RMCCTabData, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, DiscountCostData, ToolTabData, getAssemBOPCharge } = useSelector(state => state.costing)
  const costData = useContext(costingInfoContext);

  const CostingViewMode = useContext(ViewCostingContext);
  const [transportationObject, setTransportationObject] = useState({})
  const [surfaceTreatmentData, setSurfacTreatmenteData] = useState({})
  const [surfaceTableData, setSurfacetableData] = useState(item.CostingPartDetails.SurfaceTreatmentDetails)
  const [transportObj, setTrasportObj] = useState(item.CostingPartDetails.TransportationDetails)
  const partType = Number(costData?.TechnologyId) === ASSEMBLY

  useEffect(() => {
    setTrasportObj(item?.CostingPartDetails?.TransportationDetails)
  }, [item?.CostingPartDetails?.TransportationDetails])

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

  const onSubmit = data => toggleDrawer('')



  const setTransportationObj = (obj) => {

    setTransportationObject(obj)
    setTrasportObj(obj.tempObj)

  }

  const setSurfaceData = (obj) => {
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
  const saveData = () => {
    if (partType) {
      // WILL GET EXECUTE WHEN TECHNOLOGY OF COSTING WILL BE ASSEMBLY
      props.setSurfaceTreatmentCostAssemblyTechnology(item.CostingPartDetails.SurfaceTreatmentCost, item.CostingPartDetails.TransportationCost, item.CostingPartDetails.NetSurfaceTreatmentCost, surfaceTreatmentData.gridData, transportationObject)
    }
    if (transportationObject.UOM === "Percentage" && transportationObject.Rate !== null && transportationObject.Rate > 100) {
      return false
    }
    if (!IsLocked) {

      if (props.IsAssemblyCalculation && !partType) {
        props.setAssemblySurfaceCost(surfaceTreatmentData.gridData, surfaceTreatmentData.Params, JSON.stringify(surfaceTreatmentData.gridData) !== JSON.stringify(surfaceTreatmentData.OldGridData) ? true : false, props.item)
        props.setAssemblyTransportationCost(transportObj, transportationObject.Params, item)
        setTimeout(() => {
          callApi()
        }, (500));
      } else {
        props.setSurfaceCost(surfaceTreatmentData.gridData, surfaceTreatmentData.Params, JSON.stringify(surfaceTreatmentData.gridData) !== JSON.stringify(surfaceTreatmentData.OldGridData) ? true : false)
        props.setTransportationCost(transportObj, transportationObject.Params)
        setTimeout(() => {
          callApi()
        }, (500));
      }
    }

    const mergedAPI = (totalCostAPI, IsAssemblyCalculation, IsAssemblyPart) => {
      const tabData = RMCCTabData && RMCCTabData[0]
      const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
      const overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]
      const discountAndOtherTabData = DiscountCostData && DiscountCostData[0]

      let requestData = {
        "CostingId": item.CostingId,
        "PartId": item.PartId,
        "PartNumber": item.PartNumber,
        "BOMLevel": item.BOMLevel,
        "CostingNumber": item.CostingNumber,
        "NetSurfaceTreatmentCost": item.CostingPartDetails.NetSurfaceTreatmentCost,
        "EffectiveDate": CostingEffectiveDate,
        "LoggedInUserId": loggedInUserId(),
        // THIS CONDITION IS USED FOR ASSEMBLY COSTING ,IN ASSEMBLY COSTING TOTAL COST IS SUM OF RMCCTAB DATA + SURFACE TREATEMNT TAB DATA OF THAT PART NUMBER (FOR PART/COMPONENT &ASSEMBLY KEY IS DIFFERENT)
        "TotalCost": totalCostAPI,
        "CostingPartDetails": {
          "CostingDetailId": "00000000-0000-0000-0000-000000000000",
          "NetSurfaceTreatmentCost": item.CostingPartDetails.NetSurfaceTreatmentCost,
          "SurfaceTreatmentCost": item.CostingPartDetails.SurfaceTreatmentCost,
          "TransportationCost": item.CostingPartDetails.TransportationCost,
          "SurfaceTreatmentDetails": item.CostingPartDetails.SurfaceTreatmentDetails,
          "TransportationDetails": item.CostingPartDetails.TransportationDetails,
        },
      }
      // IN COSTING VIEW MODE
      if (!CostingViewMode) {
        // WHEN PARTTYPE IS ASSEMBLY AND NOT ASSEMBLY TECHNOLOGY
        if (IsAssemblyCalculation && !partType) {

          requestData.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = item.CostingPartDetails.NetSurfaceTreatmentCost
          requestData.CostingPartDetails.TotalTransportationCostPerAssembly = item.CostingPartDetails.TransportationCost
          requestData.CostingPartDetails.IsAssemblyPart = IsAssemblyPart

          let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, totalCostAPI, getAssemBOPCharge, 2, CostingEffectiveDate)
          dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
        }

        dispatch(saveCostingSurfaceTab(requestData, res => {
          if (res.data.Result) {
            Toaster.success(MESSAGES.SURFACE_TREATMENT_COSTING_SAVE_SUCCESS);
            InjectDiscountAPICall()
          }
          props.closeDrawer('')
        }))
      }
    }

    const callApi = () => {
      let rmCcData = 0
      let surfacTreatmentCost = 0
      let rmCCCost = 0
      let tabData = 0
      let surfaceTabData = 0
      let overHeadAndProfitTabData = 0
      let totalCost = 0
      let totalCostAPI = 0

      if (!partType) {
        rmCcData = findrmCctData(item)
        // THIS CONDITION IS USED FOR ASSEMBLY COSTING ,IN ASSEMBLY COSTING TOTAL COST IS SUM OF RMCCTAB DATA + SURFACE TREATEMNT TAB DATA OF THAT PART NUMBER (FOR PART/COMPONENT &ASSEMBLY KEY IS DIFFERENT)
        surfacTreatmentCost = (item.PartType === 'Component' || item.PartType === 'Part') ? checkForNull(item.CostingPartDetails.NetSurfaceTreatmentCost) : checkForNull(item.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys)
        rmCCCost = rmCcData !== undefined && (rmCcData.PartType === 'Part') ? checkForNull(rmCcData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) : checkForNull(rmCcData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity)
        tabData = RMCCTabData && RMCCTabData[0]
        surfaceTabData = SurfaceTabData && SurfaceTabData[0]
        overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]

        totalCost = ((checkForNull(tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
          checkForNull(PackageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(ToolTabData?.CostingPartDetails?.TotalToolCost)
          + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost)) - checkForNull(DiscountCostData?.HundiOrDiscountValue))
          + checkForNull(DiscountCostData?.AnyOtherCost)

        if (props.IsAssemblyCalculation) {
          totalCostAPI = costData.IsAssemblyPart ? rmCcData && Object.keys(rmCcData).length > 0 ? checkForNull(surfacTreatmentCost) + checkForNull(rmCCCost) : checkForNull(surfacTreatmentCost) : checkForNull(totalCost)
          mergedAPI(totalCostAPI, props.IsAssemblyCalculation, true)
        } else {
          totalCostAPI = costData.IsAssemblyPart ? rmCcData && Object.keys(rmCcData).length > 0 ? checkForNull(surfacTreatmentCost) + checkForNull(rmCCCost) : checkForNull(surfacTreatmentCost) : checkForNull(totalCost)
          mergedAPI(totalCostAPI, false, false)
        }
      } else if (partType) {
        totalCostAPI = ((checkForNull(subAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssembly) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
          checkForNull(PackageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(ToolTabData?.CostingPartDetails?.TotalToolCost)
          + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost)) - checkForNull(DiscountCostData?.HundiOrDiscountValue))
          + checkForNull(DiscountCostData?.AnyOtherCost)
        mergedAPI(totalCostAPI, false, false)

      }
    }
  }

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
              onSubmit={handleSubmit(onSubmit)}
            >
              <Row className="mb-3 pt-3">
                <Col>
                  <div className="user-page p-0 px-3">
                    <div className="cr-process-costwrap">
                      <Row className="cr-innertool-cost">
                        {
                          (item.PartType !== 'Part' && item.PartType !== 'Component') ?
                            <>
                              <Col md="4" className="cr-costlabel">{`Operation Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked) ? item.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly : surfaceCost(surfaceTreatmentData?.gridData), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Transportation Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked) ? item.CostingPartDetails.TotalTransportationCostPerAssembly : checkForNull(transportObj?.TransportationCost), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Net Operation Cost:  ${(CostingViewMode || IsLocked) ? checkForDecimalAndNull((item.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly) + (item.CostingPartDetails && item.CostingPartDetails.TotalTransportationCostPerAssembly !== null ? item.CostingPartDetails.TotalTransportationCostPerAssembly : 0), initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(checkForNull(surfaceCost(surfaceTreatmentData.gridData)) + checkForNull(transportObj?.TransportationCost), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
                              {/* <Col md="4" className="cr-costlabel">{`Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.SurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.SurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Extra Cost: ${item.CostingPartDetails && item.CostingPartDetails.TransportationCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TransportationCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Net Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.NetSurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</Col> */}
                            </>
                            :
                            <>
                              <Col md="4" className="cr-costlabel">{`Operation Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked) ? checkForNull(item?.CostingPartDetails?.SurfaceTreatmentCost) : surfaceCost(surfaceTreatmentData?.gridData), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Extra Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked) ? checkForNull(item.CostingPartDetails.TransportationCost) : checkForNull(transportObj?.TransportationCost), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Net Operation Cost: ${checkForDecimalAndNull(checkForNull(surfaceCost(surfaceTreatmentData?.gridData)) + checkForNull(transportObj?.TransportationCost), initialConfiguration.NoOfDecimalForPrice)}`} </Col>
                            </>
                        }
                      </Row>

                      {/* <hr /> */}
                      <div className="user-page px-3 pb-3">
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

                    </div>
                  </div>
                </Col>
              </Row>

              <Row className="sf-btn-footer no-gutters justify-content-between mx-0">
                <div className="col-sm-12 text-right">
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
            </form>
          </div>
        </div>
      </Drawer>

    </ >
  );
}

export default SurfaceTreatment;