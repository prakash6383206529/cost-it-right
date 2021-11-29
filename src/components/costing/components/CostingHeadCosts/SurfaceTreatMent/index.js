import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, } from 'react-hook-form';
import { saveAssemblyPartRowCostingCalculation, saveComponentCostingSurfaceTab, saveDiscountOtherCostTab, setComponentDiscountOtherItemData } from '../../../actions/Costing';
import SurfaceTreatmentCost from './SurfaceTreatmentCost';
import TransportationCost from './TransportationCost';
import Drawer from '@material-ui/core/Drawer';
import { Row, Col, } from 'reactstrap';
import Toaster from '../../../../common/Toaster';
import { MESSAGES } from '../../../../../config/message';
import { costingInfoContext, NetPOPriceContext } from '../../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../../helper';

function SurfaceTreatment(props) {
  const { surfaceData, transportationData, item } = props;

  const { handleSubmit } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const dispatch = useDispatch()

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { ComponentItemDiscountData, CostingEffectiveDate, RMCCTabData, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, DiscountCostData } = useSelector(state => state.costing)
  const costData = useContext(costingInfoContext);
  const netPOPrice = useContext(NetPOPriceContext);

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

  /**
  * @method saveData
  * @description SAVE DATA ASSEMBLY
  */
  const saveData = () => {

    if (props.IsAssemblyCalculation) {
      const tabData = RMCCTabData[0]
      const surfaceTabData = SurfaceTabData[0]
      const overHeadAndProfitTabData = OverheadProfitTabData[0]
      const discountAndOtherTabData = DiscountCostData[0]
      let requestData = {
        "CostingId": item.CostingId,
        "PartId": item.PartId,
        "PartNumber": item.PartNumber,
        "BOMLevel": item.BOMLevel,
        "CostingNumber": costData.CostingNumber,
        "NetSurfaceTreatmentCost": item.CostingPartDetails.NetSurfaceTreatmentCost,
        "EffectiveDate": CostingEffectiveDate,
        "LoggedInUserId": loggedInUserId(),
        "TotalCost": netPOPrice,
        "CostingPartDetails": {
          "CostingDetailId": "00000000-0000-0000-0000-000000000000",
          "IsAssemblyPart": true,
          //"Type": "Assembly",
          "NetSurfaceTreatmentCost": item.CostingPartDetails.NetSurfaceTreatmentCost,
          "SurfaceTreatmentCost": item.CostingPartDetails.SurfaceTreatmentCost,
          "TransportationCost": item.CostingPartDetails.TransportationCost,
          "TotalSurfaceTreatmentCostPerAssembly": item.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly,
          "TotalTransportationCostPerAssembly": item.CostingPartDetails.TotalTransportationCostPerAssembly,
          "SurfaceTreatmentDetails": item.CostingPartDetails.SurfaceTreatmentDetails,
          "TransportationDetails": item.CostingPartDetails.TransportationDetails,
        },
      }
      let assemblyWorkingRow=[]
      surfaceTabData && surfaceTabData.CostingChildPartDetails && surfaceTabData.CostingChildPartDetails.map((item)=>{
        let subAssemblyObj ={
        "CostingId":item.CostingId,
        "CostingNumber": "", // Need to find out how to get it.
        "TotalRawMaterialsCostWithQuantity": item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
        "TotalBoughtOutPartCostWithQuantity": item.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
        "TotalConversionCostWithQuantity": item.CostingPartDetails?.TotalConversionCostWithQuantity,
        "TotalCalculatedRMBOPCCCostPerPC": item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity +item.CostingPartDetails?.TotalBoughtOutPartCost+item.CostingPartDetails?.TotalConversionCost,
        "TotalCalculatedRMBOPCCCostPerAssembly": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
        "TotalOperationCostPerAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostPerAssembly),
        "TotalOperationCostSubAssembly":checkForNull(item.CostingPartDetails?.TotalOperationCostSubAssembly),
        "TotalOperationCostComponent": item.CostingPartDetails.TotalOperationCostComponent,
        "SurfaceTreatmentCostPerAssembly":item.CostingPartDetails?.SurfaceTreatmentCost,
        "TransportationCostPerAssembly": item.CostingPartDetails?.TransportationCost,
        "TotalSurfaceTreatmentCostPerAssembly": item.CostingPartDetails?.NetSurfaceTreatmentCost,
        "TotalCostINR": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity
        }
        assemblyWorkingRow.push(subAssemblyObj)
        return assemblyWorkingRow
      })
      let assemblyRequestedData = {
        
          "TopRow": {
            "CostingId":tabData.CostingId,
            "CostingNumber": tabData.CostingNumber,
            "TotalRawMaterialsCostWithQuantity": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
            "TotalBoughtOutPartCostWithQuantity": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
            "TotalConversionCostWithQuantity": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
            "TotalCalculatedRMBOPCCCostPerPC": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity +tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity+ tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
            "TotalCalculatedRMBOPCCCostPerAssembly": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
            "NetRMCostPerAssembly": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
            "NetBOPCostAssembly": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
            "NetConversionCostPerAssembly":tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
            "NetRMBOPCCCost":tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
            "TotalOperationCostPerAssembly": tabData.CostingPartDetails.TotalOperationCostPerAssembly,
          "TotalOperationCostSubAssembly":checkForNull(tabData.CostingPartDetails?.TotalOperationCostSubAssembly),
          "TotalOperationCostComponent": checkForNull(tabData.CostingPartDetails?.TotalOperationCostComponent),
            "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
            "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
            "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
            "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
            "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails?.NetOverheadAndProfitCost,
            "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
            "NetToolCost": discountAndOtherTabData?.CostingPartDetails?.TotalToolCost,
            "NetOtherCost": discountAndOtherTabData?.CostingPartDetails?.NetOtherCost,
            "NetDiscounts":discountAndOtherTabData?.CostingPartDetails?.NetDiscountsCost,
            "TotalCostINR": netPOPrice,
            "TabId": 2
          },
           "WorkingRows": assemblyWorkingRow,
          "LoggedInUserId": loggedInUserId()
        
      }
      dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
      dispatch(saveComponentCostingSurfaceTab(requestData, res => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.SURFACE_TREATMENT_COSTING_SAVE_SUCCESS);
          InjectDiscountAPICall()
        }
        props.closeDrawer('')
      }))

    } else {

      let requestData = {
        "CostingId": item.CostingId,
        "PartId": item.PartId,
        "PartNumber": item.PartNumber,
        "BOMLevel": item.BOMLevel,
        "CostingNumber": costData.CostingNumber,
        "NetSurfaceTreatmentCost": item.CostingPartDetails.NetSurfaceTreatmentCost,
        "EffectiveDate": CostingEffectiveDate,
        "LoggedInUserId": loggedInUserId(),
        "TotalCost": netPOPrice,
        "CostingPartDetails": {
          "CostingDetailId": "00000000-0000-0000-0000-000000000000",
          "NetSurfaceTreatmentCost": item.CostingPartDetails.NetSurfaceTreatmentCost,
          "SurfaceTreatmentCost": item.CostingPartDetails.SurfaceTreatmentCost,
          "TransportationCost": item.CostingPartDetails.TransportationCost,
          "SurfaceTreatmentDetails": item.CostingPartDetails.SurfaceTreatmentDetails,
          "TransportationDetails": item.CostingPartDetails.TransportationDetails,
        },
      }
      dispatch(saveComponentCostingSurfaceTab(requestData, res => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.SURFACE_TREATMENT_COSTING_SAVE_SUCCESS);
          InjectDiscountAPICall()
        }
        props.closeDrawer('')
      }))
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
                          props.IsAssemblyCalculation ?
                            <>
                              {/* <Col md="4" className="cr-costlabel">{`Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly, initialConfiguration.NoOfDecimalForPrice) : 0}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Transportation Cost: ${item.CostingPartDetails && item.CostingPartDetails.TotalTransportationCostPerAssembly !== null ? checkForDecimalAndNull(item.CostingPartDetails.TotalTransportationCostPerAssembly, initialConfiguration.NoOfDecimalForPrice) : 0}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Net Operation Cost: ${(item.CostingPartDetails && item.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly !== null ? item.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly : 0) + (item.CostingPartDetails && item.CostingPartDetails.TotalTransportationCostPerAssembly !== null ? item.CostingPartDetails.TotalTransportationCostPerAssembly : 0)}`}</Col> */}
                              <Col md="4" className="cr-costlabel">{`Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.SurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.SurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Transportation Cost: ${item.CostingPartDetails && item.CostingPartDetails.TransportationCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TransportationCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Net Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.NetSurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</Col>
                            </>
                            :
                            <>
                              <Col md="4" className="cr-costlabel">{`Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.SurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.SurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Transportation Cost: ${item.CostingPartDetails && item.CostingPartDetails.TransportationCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.TransportationCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</Col>
                              <Col md="4" className="cr-costlabel">{`Net Operation Cost: ${item.CostingPartDetails && item.CostingPartDetails.NetSurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</Col>
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
                          />
                          {/* <hr /> */}

                          <TransportationCost
                            index={props.index}
                            data={transportationData}
                            item={props.item}
                            setTransportationCost={props.setTransportationCost}
                            IsAssemblyCalculation={props.IsAssemblyCalculation}
                            setAssemblyTransportationCost={props.setAssemblyTransportationCost}
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
                    className="submit-button mr5 save-btn"
                    onClick={saveData} >
                    <div className={'save-icon'}></div>
                    {'SAVE'}
                  </button>

                  <button
                    type={'button'}
                    className="reset mr15 cancel-btn"
                    onClick={cancel} >
                    <div className={'cancel-icon'}></div> {'Cancel'}
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