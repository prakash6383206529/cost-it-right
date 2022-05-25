import React, { useEffect, useContext, useState } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForNull, CheckIsCostingDateSelected } from '../../../../helper';
import { ViewCostingContext } from '../CostingDetails';
import DayTime from '../../../common/DayTimeWrapper'
import AddBOPHandling from '../Drawers/AddBOPHandling';
import AssemblyTechnology from '../CostingHeadCosts/SubAssembly/AssemblyTechnology';
import { tempObject } from '../../../../config/masterData';
import { setSubAssemblyTechnologyArray } from '../../actions/SubAssembly';

function TabAssemblyTechnology(props) {

  const { handleSubmit } = useForm()

  const dispatch = useDispatch()

  const { CostingEffectiveDate, checkIsDataChange } = useSelector(state => state.costing)

  const [isOpenBOPDrawer, setIsOpenBOPDrawer] = useState(false)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)

  useEffect(() => {
    dispatch(setSubAssemblyTechnologyArray(tempObject, res => { }))

    // API FOR FIRST TIME DATA LOAD
    // dispatch(getSubAssemblyAPI(tempObject, res => { }))
  }, [])

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      let TopHeaderValues = subAssemblyTechnologyArray && subAssemblyTechnologyArray.length > 0 && subAssemblyTechnologyArray[0].CostingPartDetails !== undefined ? subAssemblyTechnologyArray[0].CostingPartDetails : null;
      let topHeaderData = {};
      topHeaderData = {
        NetRawMaterialsCost: TopHeaderValues?.EditPartCost ? TopHeaderValues.EditPartCost : 0,
        NetBoughtOutPartCost: TopHeaderValues?.CostPerAssemblyBOP ? TopHeaderValues.CostPerAssemblyBOP : 0,
        NetConversionCost: (TopHeaderValues?.OperationCostValue || TopHeaderValues?.ProcessCostValue) ? (checkForNull(TopHeaderValues?.ProcessCostValue) + checkForNull(TopHeaderValues?.OperationCostValue)) : 0,
        NetToolsCost: TopHeaderValues?.TotalToolCost ? TopHeaderValues.TotalToolCost : 0,
        NetTotalRMBOPCC: TopHeaderValues?.CostPerAssembly ? TopHeaderValues.CostPerAssembly : 0,
        OtherOperationCost: TopHeaderValues?.CostingConversionCost?.OtherOperationCostTotal ? TopHeaderValues.CostingConversionCost.OtherOperationCostTotal : 0,   //HELP
        ProcessCostTotal: TopHeaderValues?.ProcessCostValue ? TopHeaderValues?.ProcessCostValue : 0,
        OperationCostTotal: TopHeaderValues?.OperationCostValue ? TopHeaderValues?.OperationCostValue : 0,
        TotalOperationCostPerAssembly: TopHeaderValues?.TotalOperationCostPerAssembly ? TopHeaderValues.TotalOperationCostPerAssembly : 0,
        TotalOperationCostSubAssembly: TopHeaderValues?.TotalOperationCostSubAssembly ? TopHeaderValues.TotalOperationCostSubAssembly : 0,
        TotalOtherOperationCostPerAssembly: TopHeaderValues?.TotalOtherOperationCostPerAssembly ? checkForNull(TopHeaderValues.TotalOtherOperationCostPerAssembly) : 0
      }
      props.setHeaderCost(topHeaderData)
    }
  }, [subAssemblyTechnologyArray]);

  const setOperationCostFunction = (value, gridData) => {
    // gridData contains Operaion Grid

    let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
    // UPDATING AT INDEX 0 BECAUSE NEED TO UPDATE THE LEVEL 0 ROW (ASSEMBLY)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.OperationCostValue = value
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssembly = checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.EditPartCost) + (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.CostPerAssemblyBOP)) + (checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.ProcessCostValue) + checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.OperationCostValue))
    dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))
  }

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {

    // if (ErrorObjRMCC && Object.keys(ErrorObjRMCC).length > 0) return false;

    // MAY BE USED LATER
    // if (Object.keys(ComponentItemData).length > 0 && ComponentItemData.IsOpen !== false && checkIsDataChange === true) {
    //   let requestData = {
    //     "NetRawMaterialsCost": ComponentItemData.CostingPartDetails.TotalRawMaterialsCost,
    //     "NetBoughtOutPartCost": ComponentItemData.CostingPartDetails.TotalBoughtOutPartCost,
    //     "NetConversionCost": ComponentItemData.CostingPartDetails.TotalConversionCost,
    //     "NetOperationCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.OperationCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.OperationCostTotal : 0,
    //     "NetProcessCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.ProcessCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.ProcessCostTotal : 0,
    //     "NetOtherOperationCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.OtherOperationCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.OtherOperationCostTotal : 0,
    //     "NetToolCost": ComponentItemData.CostingPartDetails.TotalToolCost,
    //     "NetTotalRMBOPCC": ComponentItemData.CostingPartDetails.TotalCalculatedRMBOPCCCost,
    //     "TotalCost": costData.IsAssemblyPart ? ComponentItemData.CostingPartDetails.TotalCalculatedRMBOPCCCost : netPOPrice,
    //     "LoggedInUserId": loggedInUserId(),
    //     "EffectiveDate": CostingEffectiveDate,

    //     "IsSubAssemblyComponentPart": costData.IsAssemblyPart,
    //     "CostingId": ComponentItemData.CostingId,
    //     "PartId": ComponentItemData.PartId,                              //ROOT ID
    //     "CostingNumber": costData.CostingNumber,                         //ROOT    
    //     "PartNumber": ComponentItemData.PartNumber,                      //ROOT

    //     // "AssemblyCostingId": ComponentItemData.BOMLevel === LEVEL1 ? costData.CostingId : ComponentItemData.AssemblyCostingId,                  //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
    //     "AssemblyCostingNumber": ComponentItemData.BOMLevel === LEVEL1 ? costData.CostingNumber : ComponentItemData.AssemblyCostingNumber,      //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
    //     "AssemblyPartId": ComponentItemData.BOMLevel === LEVEL1 ? ComponentItemData.PartId : ComponentItemData.AssemblyPartId,                               //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
    //     "AssemblyPartNumber": ComponentItemData.BOMLevel === LEVEL1 ? ComponentItemData.PartNumber : ComponentItemData.AssemblyPartNumber,                   //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
    //     "AssemblyCostingId": ComponentItemData.AssemblyCostingId,
    //     "SubAssemblyCostingId": ComponentItemData.SubAssemblyCostingId,
    //     "PlantId": costData.PlantId,
    //     "VendorId": costData.VendorId,
    //     "VendorCode": costData.VendorCode,
    //     "VendorPlantId": costData.VendorPlantId,
    //     "TechnologyId": ComponentItemData.TechnologyId,
    //     "Technology": ComponentItemData.Technology,
    //     "TypeOfCosting": costData.VendorType,
    //     "PlantCode": costData.PlantCode,
    //     "Version": ComponentItemData.Version,
    //     "ShareOfBusinessPercent": ComponentItemData.ShareOfBusinessPercent,
    //     CostingPartDetails: ComponentItemData.CostingPartDetails,
    //   }
    //   if (costData.IsAssemblyPart) {
    //     let assemblyWorkingRow = []
    //     const tabData = subAssemblyTechnologyArray[0]
    //     const surfaceTabData = SurfaceTabData[0]
    //     const overHeadAndProfitTabData = OverheadProfitTabData[0]
    //     const discountAndOtherTabData = DiscountCostData
    //     tabData && tabData.CostingChildPartDetails && tabData.CostingChildPartDetails.map((item) => {
    //       if (item.PartType === 'Sub Assembly') {
    //         let subAssemblyObj = {
    //           "CostingId": item.CostingId,
    //           "SubAssemblyCostingId": item.SubAssemblyCostingId,
    //           "CostingNumber": "", // Need to find out how to get it.
    //           "TotalRawMaterialsCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalRawMaterialsCost * item.CostingPartDetails.Quantity : item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
    //           "TotalBoughtOutPartCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalBoughtOutPartCost * item.CostingPartDetails.Quantity : item.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
    //           "TotalConversionCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalConversionCost * item.CostingPartDetails.Quantity : item.CostingPartDetails?.TotalConversionCostWithQuantity,
    //           "TotalCalculatedRMBOPCCCostPerPC": item.CostingPartDetails?.TotalRawMaterialsCost + item.CostingPartDetails?.TotalBoughtOutPartCost + item.CostingPartDetails?.TotalConversionCost,
    //           "TotalCalculatedRMBOPCCCostPerAssembly": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
    //           "TotalOperationCostPerAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostPerAssembly),
    //           "TotalOperationCostSubAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostSubAssembly),
    //           "TotalOperationCostComponent": item.CostingPartDetails.TotalOperationCostComponent,
    //           "SurfaceTreatmentCostPerAssembly": 0,
    //           "TransportationCostPerAssembly": 0,
    //           "TotalSurfaceTreatmentCostPerAssembly": 0,
    //           "TotalCostINR": netPOPrice
    //         }
    //         assemblyWorkingRow.push(subAssemblyObj)
    //         return assemblyWorkingRow
    //       }
    //     })
    //     let assemblyRequestedData = {

    //       "TopRow": {
    //         "CostingId": tabData.CostingId,
    //         "CostingNumber": tabData.CostingNumber,
    //         "TotalRawMaterialsCostWithQuantity": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
    //         "TotalBoughtOutPartCostWithQuantity": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
    //         "TotalConversionCostWithQuantity": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
    //         "TotalCalculatedRMBOPCCCostPerPC": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity + tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity + tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
    //         "TotalCalculatedRMBOPCCCostPerAssembly": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
    //         "NetRMCostPerAssembly": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
    //         "NetBOPCostAssembly": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
    //         "NetConversionCostPerAssembly": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
    //         "NetRMBOPCCCost": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
    //         "TotalOperationCostPerAssembly": tabData.CostingPartDetails.TotalOperationCostPerAssembly,
    //         "TotalOperationCostSubAssembly": checkForNull(tabData.CostingPartDetails?.TotalOperationCostSubAssembly),
    //         "TotalOperationCostComponent": checkForNull(tabData.CostingPartDetails?.TotalOperationCostComponent),
    //         "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
    //         "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
    //         "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
    //         "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
    //         "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails ? (checkForNull(overHeadAndProfitTabData.CostingPartDetails.OverheadCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.ProfitCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.RejectionCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.ICCCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.PaymentTermCost)) : 0,
    //         "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
    //         "NetToolCost": ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
    //         "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
    //         "NetDiscounts": discountAndOtherTabData?.HundiOrDiscountValue,
    //         "TotalCostINR": netPOPrice,
    //         "TabId": 1
    //       },
    //       "WorkingRows": assemblyWorkingRow,
    //       "BOPHandlingCharges": {
    //         "AssemblyCostingId": tabData.CostingId,
    //         "IsApplyBOPHandlingCharges": true,
    //         "BOPHandlingPercentage": getAssemBOPCharge.BOPHandlingPercentage,
    //         "BOPHandlingCharges": getAssemBOPCharge.BOPHandlingCharges
    //       },
    //       "LoggedInUserId": loggedInUserId()

    //     }
    //     if (!CostingViewMode) {

    //       dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
    //     }
    //   }

    //   dispatch(saveComponentCostingRMCCTab(requestData, res => {
    //     if (res.data.Result) {
    //       Toaster.success(MESSAGES.RMCC_TAB_COSTING_SAVE_SUCCESS);
    //       dispatch(CloseOpenAccordion())
    //       dispatch(setComponentItemData({}, () => { }))
    //       InjectDiscountAPICall()
    //       dispatch(isDataChange(false))
    //     }
    //   }))
    // }
    // else {
    //   dispatch(CloseOpenAccordion())
    //   dispatch(isDataChange(false))
    // }
  }

  const bopHandlingDrawer = () => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
    setIsOpenBOPDrawer(true)
  }

  const handleBOPCalculationAndClose = (e = '') => {
    setIsOpenBOPDrawer(false)
  }

  const setBOPCostWithAsssembly = (obj, item) => {
    let totalBOPCost = checkForNull(obj?.BOPHandlingChargeApplicability) + checkForNull(obj?.BOPHandlingCharges)
    let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssembly = checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.EditPartCost) + checkForNull(totalBOPCost) + (checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.ProcessCostValue) + checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.OperationCostValue))
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssemblyBOP = checkForNull(totalBOPCost)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.BOPHandlingCharges = checkForNull(obj?.BOPHandlingCharges)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.IsApplyBOPHandlingCharges = obj.IsApplyBOPHandlingCharges
    dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = (values) => { }

  return (
    <>
      <div className="login-container signup-form" id="rm-cc-costing-header">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">
              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Row>
                  <Col md="12">
                    <Table className="table cr-brdr-main mb-0 rmcc-main-headings" size="sm">
                      <thead>
                        <tr>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Part Number`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Part Name`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '70px' }}>{`Level`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Type`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Technology`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Quantity`} </th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Cost/Pc`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Operation Cost`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Process Cost`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`BOP Cost`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Cost/Assembly`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Action`}</th>
                          {
                            costData.IsAssemblyPart && <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{
                              <button
                                type="button"
                                className={'user-btn add-oprn-btn'}
                                onClick={bopHandlingDrawer}>
                                <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`BOP H`}</button>}
                            </th>
                          }
                        </tr>
                      </thead>
                      <tbody>
                        {
                          subAssemblyTechnologyArray && subAssemblyTechnologyArray.map((item, index) => {
                            return (
                              < >
                                <AssemblyTechnology
                                  index={index}
                                  item={item}
                                  children={item.CostingChildPartDetails}
                                  subAssembId={item.CostingId}
                                  setOperationCostFunction={setOperationCostFunction}
                                />
                              </>
                            )
                          })
                        }

                      </tbody>
                    </Table>
                  </Col>
                </Row>
                {
                  isOpenBOPDrawer &&
                  <AddBOPHandling
                    isOpen={isOpenBOPDrawer}
                    closeDrawer={handleBOPCalculationAndClose}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                    isAssemblyTechnology={true}
                    setBOPCostWithAsssembly={setBOPCostWithAsssembly}
                  />
                }

                {!CostingViewMode &&
                  <div className="col-sm-12 text-right bluefooter-butn btn-stciky-container">
                    <button type={"button"} className="reset mr15 cancel-btn" onClick={props.backBtn}>
                      <div className={'cancel-icon'}></div>
                      {"Cancel"}
                    </button>
                    <button
                      type={'button'}
                      className="submit-button mr5 save-btn"
                      onClick={saveCosting}
                      disabled={checkIsDataChange || (DayTime(CostingEffectiveDate).isValid() === false) ? true : false}
                    >
                      <div className={'save-icon'}></div>
                      {'Save'}
                    </button>
                  </div>}
              </form>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default TabAssemblyTechnology;
