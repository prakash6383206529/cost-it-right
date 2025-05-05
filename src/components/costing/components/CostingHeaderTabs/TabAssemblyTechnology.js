import React, { useEffect, useContext, useState } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForNull, CheckIsCostingDateSelected, getConfigurationKey, showBopLabel } from '../../../../helper';
import { SelectedCostingDetail, ViewCostingContext } from '../CostingDetails';
import DayTime from '../../../common/DayTimeWrapper'
import AddBOPHandling from '../Drawers/AddBOPHandling';
import AssemblyTechnology from '../CostingHeadCosts/SubAssembly/AssemblyTechnology';
import { tempObject } from '../../../../config/masterData';
import { getSubAssemblyAPI, setSubAssemblyTechnologyArray } from '../../actions/SubAssembly';
import { getRMCCTabData } from '../../actions/Costing';
import { reactLocalStorage } from 'reactjs-localstorage';

function TabAssemblyTechnology(props) {

  const { handleSubmit } = useForm()

  const dispatch = useDispatch()

  const { CostingEffectiveDate, checkIsDataChange, currencySource, exchangeRateData } = useSelector(state => state.costing)

  const [isOpenBOPDrawer, setIsOpenBOPDrawer] = useState(false)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)

  useEffect(() => {
    // dispatch(setSubAssemblyTechnologyArray(tempObject, res => { }))

    // API FOR FIRST TIME DATA LOAD
    // dispatch(getSubAssemblyAPI(tempObject, res => { }))
  }, [])
  const selectedCostingDetail = useContext(SelectedCostingDetail);


  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        AssemCostingId: selectedCostingDetail.AssemblyCostingId ? selectedCostingDetail.AssemblyCostingId : costData.CostingId,
        subAsmCostingId: selectedCostingDetail.SubAssemblyCostingId ? selectedCostingDetail.SubAssemblyCostingId : costData.CostingId,
        EffectiveDate: CostingEffectiveDate ? CostingEffectiveDate : null
      }
      dispatch(getRMCCTabData(data, true, (res) => {

        // dispatch(setAllCostingInArray(res.data.DataList,false))
        let tempArr = [];
        tempArr = [res?.data?.DataList[0], ...res?.data?.DataList[0]?.CostingChildPartDetails]
        sessionStorage.setItem('costingArray', JSON.stringify(tempArr));

      }))
    }
  }, [Object.keys(costData).length > 0])


  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      let TopHeaderValues = subAssemblyTechnologyArray && subAssemblyTechnologyArray.length > 0 && subAssemblyTechnologyArray[0]?.CostingPartDetails !== undefined ? subAssemblyTechnologyArray[0]?.CostingPartDetails : null;
      let topHeaderData = {};
      let TotalLabourCost = checkForNull(TopHeaderValues?.NetLabourCost) + checkForNull(TopHeaderValues?.IndirectLaborCost) + checkForNull(TopHeaderValues?.StaffCost)
      topHeaderData = {
        NetRawMaterialsCost: TopHeaderValues?.NetChildPartsCost ? TopHeaderValues.NetChildPartsCost : 0,
        NetBoughtOutPartCost: TopHeaderValues?.NetBoughtOutPartCost ? TopHeaderValues.NetBoughtOutPartCost : 0,
        NetConversionCost: (TopHeaderValues?.NetOperationCost || TopHeaderValues?.NetProcessCost || TotalLabourCost) ? (checkForNull(TopHeaderValues?.NetProcessCost) + checkForNull(TopHeaderValues?.NetOperationCost) + checkForNull(TotalLabourCost)) : 0,
        NetToolsCost: TopHeaderValues?.TotalToolCost ? TopHeaderValues.TotalToolCost : 0,
        NetTotalRMBOPCC: (TopHeaderValues?.NetTotalRMBOPCC) ? TopHeaderValues.NetTotalRMBOPCC : 0,
        OtherOperationCost: TopHeaderValues?.CostingConversionCost?.NetOtherOperationCost ? TopHeaderValues.CostingConversionCost.NetOtherOperationCost : 0,   //HELP
        NetProcessCost: TopHeaderValues?.NetProcessCost ? TopHeaderValues?.NetProcessCost : 0,
        NetOperationCost: TopHeaderValues?.NetOperationCost ? TopHeaderValues?.NetOperationCost : 0,
        TotalOperationCostPerAssembly: TopHeaderValues?.TotalOperationCostPerAssembly ? TopHeaderValues.TotalOperationCostPerAssembly : 0,
        TotalOperationCostSubAssembly: TopHeaderValues?.TotalOperationCostSubAssembly ? TopHeaderValues.TotalOperationCostSubAssembly : 0,
        TotalOtherOperationCostPerAssembly: TopHeaderValues?.TotalOtherOperationCostPerAssembly ? checkForNull(TopHeaderValues.TotalOtherOperationCostPerAssembly) : 0
      }

      props.setHeaderCost(topHeaderData)
    }
  }, [subAssemblyTechnologyArray]);

  const setOperationCostFunction = (value, gridData) => {

    // let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
    // // UPDATING AT INDEX 0 BECAUSE NEED TO UPDATE THE LEVEL 0 ROW (ASSEMBLY)
    // tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost = value
    // tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.AssemblyCostingOperationCostRequest = gridData
    // tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetPOPrice = checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetPOPrice) + (checkForNull(tempsubAssemblyTechnologyArray[0]??.CostingPartDetails?.NetBoughtOutPartCost)) + (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost) + checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost))
    // dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))
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
    //     "NetRawMaterialsCost": ComponentItemData?.CostingPartDetails?.NetRawMaterialsCost,
    //     "NetBoughtOutPartCost": ComponentItemData?.CostingPartDetails?.NetBoughtOutPartCost,
    //     "NetConversionCost": ComponentItemData?.CostingPartDetails?.NetConversionCost,
    //     "NetOperationCost": ComponentItemData?.CostingPartDetails?.CostingConversionCost && ComponentItemData?.CostingPartDetails?.CostingConversionCost.NetOperationCost !== undefined ? ComponentItemData?.CostingPartDetails?.CostingConversionCost.NetOperationCost : 0,
    //     "NetProcessCost": ComponentItemData?.CostingPartDetails?.CostingConversionCost && ComponentItemData?.CostingPartDetails?.CostingConversionCost.NetProcessCost !== undefined ? ComponentItemData?.CostingPartDetails?.CostingConversionCost.NetProcessCost : 0,
    //     "NetOtherOperationCost": ComponentItemData?.CostingPartDetails?.CostingConversionCost && ComponentItemData?.CostingPartDetails?.CostingConversionCost.NetOtherOperationCost !== undefined ? ComponentItemData?.CostingPartDetails?.CostingConversionCost.NetOtherOperationCost : 0,
    //     "NetToolCost": ComponentItemData?.CostingPartDetails?.TotalToolCost,
    //     "NetTotalRMBOPCC": ComponentItemData?.CostingPartDetails?.NetTotalRMBOPCC,
    //     "TotalCost": costData.IsAssemblyPart ? ComponentItemData?.CostingPartDetails?.NetTotalRMBOPCC : netPOPrice,
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
    //     CostingPartDetails: ComponentItemData?.CostingPartDetails,
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
    //           "TotalRawMaterialsCostWithQuantity": item.PartType === 'Part' ? item?.CostingPartDetails?.NetRawMaterialsCost * item?.CostingPartDetails?.Quantity : item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
    //           "TotalBoughtOutPartCostWithQuantity": item.PartType === 'Part' ? item?.CostingPartDetails?.NetBoughtOutPartCost * item?.CostingPartDetails?.Quantity : item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
    //           "TotalConversionCostWithQuantity": item.PartType === 'Part' ? item?.CostingPartDetails?.NetConversionCost * item?.CostingPartDetails?.Quantity : item?.CostingPartDetails?.TotalConversionCostWithQuantity,
    //           "TotalCalculatedRMBOPCCCostPerPC": item?.CostingPartDetails?.NetRawMaterialsCost + item?.CostingPartDetails?.NetBoughtOutPartCost + item?.CostingPartDetails?.NetConversionCost,
    //           "TotalCalculatedRMBOPCCCostPerAssembly": item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
    //           "TotalOperationCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly),
    //           "TotalOperationCostSubAssembly": checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssembly),
    //           "TotalOperationCostComponent": item?.CostingPartDetails?.TotalOperationCostComponent,
    //           "SurfaceTreatmentCostPerAssembly": 0,
    //           "TransportationCostPerAssembly": 0,
    //           "TotalSurfaceTreatmentCostPerAssembly": 0,
    //           "NetPOPrice": netPOPrice
    //         }
    //         assemblyWorkingRow.push(subAssemblyObj)
    //         return assemblyWorkingRow
    //       }
    //     })
    //     let assemblyRequestedData = {

    //       "TopRow": {
    //         "CostingId": tabData.CostingId,
    //         "CostingNumber": tabData.CostingNumber,
    //         "TotalRawMaterialsCostWithQuantity": tabData?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
    //         "TotalBoughtOutPartCostWithQuantity": tabData?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
    //         "TotalConversionCostWithQuantity": tabData?.CostingPartDetails?.TotalConversionCostWithQuantity,
    //         "TotalCalculatedRMBOPCCCostPerPC": tabData?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity + tabData?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity + tabData?.CostingPartDetails?.TotalConversionCostWithQuantity,
    //         "TotalCalculatedRMBOPCCCostPerAssembly": tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
    //         "NetRawMaterialsCost": tabData?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
    //         "NetBoughtOutPartCost": tabData?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
    //         "NetConversionCost": tabData?.CostingPartDetails?.TotalConversionCostWithQuantity,
    //         "NetTotalRMBOPCC": tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
    //         "TotalOperationCostPerAssembly": tabData?.CostingPartDetails?.TotalOperationCostPerAssembly,
    //         "TotalOperationCostSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssembly),
    //         "TotalOperationCostComponent": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostComponent),
    //         "SurfaceTreatmentCostPerAssembly": surfaceTabData?.CostingPartDetails?.SurfaceTreatmentCost,
    //         "TransportationCostPerAssembly": surfaceTabData?.CostingPartDetails?.TransportationCost,
    //         "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost,
    //         "NetSurfaceTreatmentCost": surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost,
    //         "NetOverheadAndProfits": overHeadAndProfitTabData?.CostingPartDetails ? (checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.OverheadCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.RejectionCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ICCCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.PaymentTermCost)) : 0,
    //         "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]??.CostingPartDetails?.NetFreightPackagingCost,
    //         "NetToolCost": ToolTabData[0]??.CostingPartDetails?.TotalToolCost,
    //         "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
    //         "NetDiscountsCost": discountAndOtherTabData?.HundiOrDiscountValue,
    //         "NetPOPrice": netPOPrice,
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
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
    setIsOpenBOPDrawer(true)
  }

  const handleBOPCalculationAndClose = (e = '') => {
    setIsOpenBOPDrawer(false)
  }

  const setBOPCostWithAsssembly = (obj, item) => {
    let totalBOPCost = checkForNull(obj?.BOPHandlingChargeApplicability) + checkForNull(obj?.BOPHandlingCharges)
    let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetPOPrice = checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetPOPrice) + checkForNull(totalBOPCost) + (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost) + checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost))
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetBoughtOutPartCost = checkForNull(totalBOPCost)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.BOPHandlingCharges = checkForNull(obj?.BOPHandlingCharges)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.BOPHandlingPercentage = checkForNull(obj?.BOPHandlingPercentage)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.IsApplyBOPHandlingCharges = obj.IsApplyBOPHandlingCharges
    dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = (values) => { }

  const setAssemblyLabourCost = (data) => {
    let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
    tempsubAssemblyTechnologyArray[0].NetLabourCost = checkForNull(data.NetLabourCost)
    tempsubAssemblyTechnologyArray[0].IndirectLaborCost = checkForNull(data.IndirectLaborCost)
    tempsubAssemblyTechnologyArray[0].StaffCost = checkForNull(data.StaffCost)
    tempsubAssemblyTechnologyArray[0].StaffCostPercentage = checkForNull(data.StaffCostPercentage)
    tempsubAssemblyTechnologyArray[0].IndirectLaborCostPercentage = checkForNull(data.IndirectLaborCostPercentage)
    tempsubAssemblyTechnologyArray[0].TotalLabourCost = checkForNull(data.NetLabourCost) + checkForNull(data.IndirectLaborCost) + checkForNull(data.StaffCost)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetLabourCost = checkForNull(data.NetLabourCost)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.IndirectLaborCost = checkForNull(data.IndirectLaborCost)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.StaffCost = checkForNull(data.StaffCost)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.StaffCostPercentage = checkForNull(data.StaffCostPercentage)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.IndirectLaborCostPercentage = checkForNull(data.IndirectLaborCostPercentage)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalLabourCost = checkForNull(data.NetLabourCost) + checkForNull(data.IndirectLaborCost) + checkForNull(data.StaffCost)

    tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetLabourCRMHead = data.NetLabourCRMHead ? data.NetLabourCRMHead : ''
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.IndirectLabourCRMHead = data.IndirectLabourCRMHead ? data.IndirectLabourCRMHead : ''
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.StaffCRMHead = data.StaffCRMHead ? data.StaffCRMHead : ''

    let costPerPieceTotal = 0
    let CostPerAssemblyBOPTotal = 0
    tempsubAssemblyTechnologyArray[0].CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
      costPerPieceTotal = checkForNull(costPerPieceTotal) + checkForNull(item?.CostingPartDetails?.NetChildPartsCostWithQuantity)
      CostPerAssemblyBOPTotal = checkForNull(CostPerAssemblyBOPTotal) + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity)
      return null
    })

    tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetTotalRMBOPCC =
      checkForNull(costPerPieceTotal) +
      checkForNull(CostPerAssemblyBOPTotal) +
      checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost) +
      checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost) +
      checkForNull(data.NetLabourCost) + checkForNull(data.IndirectLaborCost) + checkForNull(data.StaffCost)
    dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))
  }

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
                    <Table className="table cr-brdr-main mb-0" size="sm">
                      <thead>
                        <tr>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Part Number`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Part Name`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '70px' }}>{`Level`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Type`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '130px' }}>{`Technology`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Quantity`} </th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Part Cost/Pc`}</th>
                          {/* <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Operation Cost`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Process Cost`}</th> */}
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`${showBopLabel()} Cost`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Part Cost/Assembly`}</th>
                          {/* <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Action`}</th> */}
                          {
                            costData.IsAssemblyPart && <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{
                              // <button
                              //   type="button"
                              //   className={'user-btn add-oprn-btn'}
                              //   onClick={bopHandlingDrawer}>
                              //   <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`BOP H`}</button>
                            }
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
                                  setAssemblyLabourCost={setAssemblyLabourCost}
                                />
                              </>
                            )
                          })
                        }

                      </tbody>
                    </Table>
                  </Col>
                </Row>
                {/* {
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
                } */}

                {!CostingViewMode &&
                  <div className="col-sm-12 text-right d-flex align-items-center justify-content-end bluefooter-butn btn-sticky-container">
                    <button type={"button"} className="reset mr15 cancel-btn" onClick={props.backBtn}>
                      <div className={'cancel-icon'}></div>
                      {"Cancel"}
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
