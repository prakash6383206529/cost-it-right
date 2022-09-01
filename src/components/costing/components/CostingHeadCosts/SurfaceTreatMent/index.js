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
import { costingInfoContext, NetPOPriceContext } from '../../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../../helper';
import { createToprowObjAndSave, findrmCctData } from '../../../CostingUtil';
import { ViewCostingContext } from '../../CostingDetails';
import { useState } from 'react';
import { debounce } from 'lodash';

function SurfaceTreatment(props) {
  const { surfaceData, transportationData, item } = props;



  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)

  const { handleSubmit } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const dispatch = useDispatch()

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { ComponentItemDiscountData, CostingEffectiveDate, RMCCTabData, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, DiscountCostData, ToolTabData, getAssemBOPCharge } = useSelector(state => state.costing)
  const price = useContext(NetPOPriceContext)
  const costData = useContext(costingInfoContext);

  const CostingViewMode = useContext(ViewCostingContext);
  const [transportationObject, setTransportationObject] = useState({})
  const [surfaceTreatmentData, setSurfacTreatmenteData] = useState({})
  const [surfaceTableData, setSurfacetableData] = useState(item.CostingPartDetails.SurfaceTreatmentDetails)
  const [transportObj, setTrasportObj] = useState(item.CostingPartDetails.TransportationDetails)

  const [callDiscountApi, setCallDiscountApi] = useState(false)


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
  const saveData = debounce(handleSubmit(() => {
    if (transportationObject.UOM === "Percentage" && transportationObject.Rate !== null && transportationObject.Rate > 100) {
      return false
    }
    if (!IsLocked) {

      if (props.IsAssemblyCalculation) {
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

    const callApi = () => {
      let rmCcData = findrmCctData(item)
      // THIS CONDITION IS USED FOR ASSEMBLY COSTING ,IN ASSEMBLY COSTING TOTAL COST IS SUM OF RMCCTAB DATA + SURFACE TREATEMNT TAB DATA OF THAT PART NUMBER (FOR PART/COMPONENT &ASSEMBLY KEY IS DIFFERENT)
      let surfacTreatmentCost = (item.PartType === 'Component' || item.PartType === 'Part') ? checkForNull(item.CostingPartDetails.NetSurfaceTreatmentCost) : checkForNull(item.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys)
      let rmCCCost = rmCcData !== undefined && (rmCcData.PartType === 'Part') ? checkForNull(rmCcData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) : checkForNull(rmCcData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity)
      const tabData = RMCCTabData[0]

      const surfaceTabData = SurfaceTabData[0]
      const overHeadAndProfitTabData = OverheadProfitTabData[0]
      const discountAndOtherTabData = DiscountCostData[0]

      const totalCost = ((checkForNull(tabData.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
        checkForNull(PackageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(ToolTabData?.CostingPartDetails?.TotalToolCost)
        + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost)) - checkForNull(DiscountCostData?.HundiOrDiscountValue))
        + checkForNull(DiscountCostData?.AnyOtherCost)

      if (props.IsAssemblyCalculation) {

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
          "TotalCost": costData.IsAssemblyPart ? rmCcData && Object.keys(rmCcData).length > 0 ? checkForNull(surfacTreatmentCost) + checkForNull(rmCCCost) : checkForNull(surfacTreatmentCost) : checkForNull(totalCost),
          "CostingPartDetails": {
            "CostingDetailId": "00000000-0000-0000-0000-000000000000",
            "IsAssemblyPart": true,
            //"Type": "Assembly",
            "NetSurfaceTreatmentCost": item.CostingPartDetails.NetSurfaceTreatmentCost,
            "SurfaceTreatmentCost": item.CostingPartDetails.SurfaceTreatmentCost,
            "TransportationCost": item.CostingPartDetails.TransportationCost,
            "TotalSurfaceTreatmentCostPerAssembly": item.CostingPartDetails.NetSurfaceTreatmentCost,
            "TotalTransportationCostPerAssembly": item.CostingPartDetails.TransportationCost,
            "SurfaceTreatmentDetails": item.CostingPartDetails.SurfaceTreatmentDetails,
            "TransportationDetails": item.CostingPartDetails.TransportationDetails,
          },
        }
        if (!CostingViewMode) {
          let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, totalCost, getAssemBOPCharge, 2, CostingEffectiveDate)
          dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))

          dispatch(saveCostingSurfaceTab(requestData, res => {
            if (res.data.Result) {
              Toaster.success(MESSAGES.SURFACE_TREATMENT_COSTING_SAVE_SUCCESS);
              setCallDiscountApi(true)
              props.closeDrawer('')
            }
          }))
        }

      } else {

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
          "TotalCost": costData.IsAssemblyPart ? rmCcData && Object.keys(rmCcData).length > 0 ? checkForNull(surfacTreatmentCost) + checkForNull(rmCCCost) : checkForNull(surfacTreatmentCost) : checkForNull(totalCost),
          "CostingPartDetails": {
            "CostingDetailId": "00000000-0000-0000-0000-000000000000",
            "NetSurfaceTreatmentCost": item.CostingPartDetails.NetSurfaceTreatmentCost,
            "SurfaceTreatmentCost": item.CostingPartDetails.SurfaceTreatmentCost,
            "TransportationCost": item.CostingPartDetails.TransportationCost,
            "SurfaceTreatmentDetails": item.CostingPartDetails.SurfaceTreatmentDetails,
            "TransportationDetails": item.CostingPartDetails.TransportationDetails,
          },
        }
        dispatch(saveCostingSurfaceTab(requestData, res => {
          if (res.data.Result) {
            Toaster.success(MESSAGES.SURFACE_TREATMENT_COSTING_SAVE_SUCCESS);
            setCallDiscountApi(true)
            props.closeDrawer('')
          }
        }))
      }
    }
  }), 500);


  useEffect(() => {
    if (callDiscountApi) {
      InjectDiscountAPICall()
    }
  }, [callDiscountApi])
  const InjectDiscountAPICall = () => {
    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, EffectiveDate: CostingEffectiveDate, TotalCost: price }, res => {
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

                            </>
                            :
                            <>
                              <Col md="4" className="cr-costlabel">{`Operation Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked) ? checkForNull(item?.CostingPartDetails?.SurfaceTreatmentCost) : surfaceCost(surfaceTreatmentData?.gridData), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Extra Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked) ? checkForNull(item.CostingPartDetails.TransportationCost) : checkForNull(transportObj?.TransportationCost), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Net Operation Cost: ${(CostingViewMode || IsLocked) ?
                                checkForDecimalAndNull(item.CostingPartDetails.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) :
                                checkForDecimalAndNull(checkForNull(surfaceCost(surfaceTreatmentData?.gridData)) + checkForNull(transportObj?.TransportationCost), initialConfiguration.NoOfDecimalForPrice)}`}</Col>
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
            </form>
          </div>
        </div>
      </Drawer>

    </ >
  );
}

export default SurfaceTreatment;