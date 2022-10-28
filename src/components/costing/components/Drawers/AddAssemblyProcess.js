import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { checkForNull, loggedInUserId } from '../../../../helper';
import ProcessCost from '../CostingHeadCosts/Part/ProcessCost';
import { setSubAssemblyTechnologyArray, updateMultiTechnologyTopAndWorkingRowCalculation } from '../../actions/SubAssembly';
import { findSurfaceTreatmentData, formatMultiTechnologyUpdate } from '../../CostingUtil';
import { saveAssemblyCostingRMCCTab } from '../../actions/Costing';
import { useContext } from 'react';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { useEffect } from 'react';
import { ViewCostingContext } from '../CostingDetails';

function AddAssemblyProcess(props) {
  const { item } = props;
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const [processGrid, setProcessGrid] = useState(subAssemblyTechnologyArray ? { CostingProcessCostResponse: subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostingProcessCostResponse, ProcessCostTotal: subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost } : []);
  const [totalProcessCost, setTotalProcessCost] = useState(0);
  const dispatch = useDispatch()
  const { CostingEffectiveDate } = useSelector(state => state.costing)
  const costData = useContext(costingInfoContext)
  const { ToolTabData, ToolsDataList, ComponentItemDiscountData, RMCCTabData, SurfaceTabData, OverheadProfitTabData, DiscountCostData, PackageAndFreightTabData, checkIsToolTabChange, getAssemBOPCharge } = useSelector(state => state.costing)
  const CostingViewMode = useContext(ViewCostingContext);

  // useEffect(() => {
  //   let obj = {
  //     CostingProcessCostResponse: subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostingProcessCostResponse
  //   }
  //   setProcessGrid(obj)
  // }, [])

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

  const getValuesOfProcess = (gridData, ProcessCostTotal) => {
    setProcessGrid(gridData)
    setTotalProcessCost(ProcessCostTotal)
  }

  /**
  * @method saveData
  * @description SAVE DATA ASSEMBLY
  */
  const saveData = () => {
    const tabData = RMCCTabData && RMCCTabData[0]
    const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
    const overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]
    const discountAndOtherTabData = DiscountCostData && DiscountCostData[0]
    const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
    const toolTabData = ToolTabData && ToolTabData[0]

    // let stCostingData = findSurfaceTreatmentData(item)
    let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
    // UPDATING AT INDEX 0 BECAUSE NEED TO UPDATE THE LEVEL 0 ROW (ASSEMBLY)

    let costPerPieceTotal = 0
    tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
      costPerPieceTotal = checkForNull(costPerPieceTotal) + checkForNull(item?.CostingPartDetails?.NetChildPartsCostWithQuantity)
      return null
    })
    let TotalProcessCost = 0
    TotalProcessCost = processGrid.CostingProcessCostResponse.reduce((accummlator, el) => {
      return accummlator + checkForNull(el?.ProcessCost)
    }, 0)

    tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetPOPrice =
      checkForNull(costPerPieceTotal) +
      checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalBoughtOutPartCost) +
      checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost) +
      checkForNull(TotalProcessCost)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalCalculatedRMBOPCCCost =
      checkForNull(costPerPieceTotal) +
      checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalBoughtOutPartCost) +
      checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost) +
      checkForNull(TotalProcessCost)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostingProcessCostResponse = processGrid.CostingProcessCostResponse
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalProcessCost = TotalProcessCost

    dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))

    let totalCost = (checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
      checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
      checkForNull(PackageAndFreightTabData[0].CostingPartDetails?.NetFreightPackagingCost) +
      checkForNull(ToolTabData && ToolTabData[0].CostingPartDetails?.TotalToolCost) +
      checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) +
      checkForNull(DiscountCostData?.AnyOtherCost)) -
      checkForNull(DiscountCostData?.HundiOrDiscountValue)

    let request = formatMultiTechnologyUpdate(tempsubAssemblyTechnologyArray[0], totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData)
    dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))

    let requestData = {
      "CostingId": item.CostingId,
      "CostingNumber": item.CostingNumber,
      "CostingDetailId": "00000000-0000-0000-0000-000000000000",
      "PartId": item.PartId,
      "PartNumber": item.PartNumber,
      "PartTypeId": item.PartTypeId,
      "Type": item.PartType,
      "SubAssemblyCostingId": item.SubAssemblyCostingId,
      "PlantId": costData.PlantId,
      "VendorId": costData.VendorId,
      "VendorCode": costData.VendorCode,
      "VendorPlantId": costData.VendorPlantId,
      "TechnologyName": item.Technology,
      "TechnologyId": item.TechnologyId,
      "TypeOfCosting": costData.VendorType,
      "PlantCode": costData.PlantCode,
      "PlantName": costData.PlantName,
      "Version": item.Version,
      "ShareOfBusinessPercent": item.ShareOfBusinessPercent,

      "NetRawMaterialsCost": item.CostingPartDetails.TotalRawMaterialsCost,
      "NetBoughtOutPartCost": item.CostingPartDetails.TotalBoughtOutPartCost,
      "NetConversionCost": item.CostingPartDetails.TotalConversionCost,
      "TotalProcessCost": TotalProcessCost,
      "TotalOperationCost": item.CostingPartDetails.TotalOperationCost ? item.CostingPartDetails.TotalOperationCost : 0,
      "NetTotalRMBOPCC": item.CostingPartDetails.TotalCalculatedRMBOPCCCost,
      // "TotalCost": stCostingData && Object.keys.length > 0 ? checkForNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(stCostingData.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys) : item.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity,
      "LoggedInUserId": loggedInUserId(),
      "EffectiveDate": CostingEffectiveDate,

      "IsSubAssemblyComponentPart": costData.IsAssemblyPart,
      "NetOperationCostPerAssembly": item.CostingPartDetails.TotalOperationCostPerAssembly,
      "NetToolCostPerAssembly": item.CostingPartDetails.TotalToolCostPerAssembly,
      "CostingPartDetails": {
        "CostingId": item.CostingId,
        "CostingNumber": item.CostingNumber,
        "CostingDetailId": "00000000-0000-0000-0000-000000000000",
        "PartId": item.PartId,
        "PartNumber": item.PartNumber,
        "PartName": item.PartName,
        "PartTypeId": item.PartTypeId,
        "Type": item.PartType,
        "TotalRawMaterialsCost": item.CostingPartDetails.TotalRawMaterialsCost,
        "TotalBoughtOutPartCost": item.CostingPartDetails.TotalBoughtOutPartCost,
        "TotalConversionCost": item.CostingPartDetails.TotalConversionCost,
        "TotalCalculatedRMBOPCCCost": item.CostingPartDetails.TotalCalculatedRMBOPCCCost,
        "TotalRawMaterialsCostWithQuantity": item.CostingPartDetails.TotalRawMaterialsCostWithQuantity,
        "TotalBoughtOutPartCostWithQuantity": item.CostingPartDetails.TotalBoughtOutPartCostWithQuantity,
        "TotalConversionCostWithQuantity": item.CostingPartDetails.TotalConversionCostWithQuantity,
        "TotalCalculatedRMBOPCCCostWithQuantity": item.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity,
        "Quantity": item.CostingPartDetails.Quantity,
        "IsOpen": true,
        "IsShowToolCost": item.CostingPartDetails.IsShowToolCost === null ? true : true,
        "TotalOperationCostPerAssembly": item.CostingPartDetails.TotalOperationCostPerAssembly,
        "TotalToolCostPerAssembly": item.CostingPartDetails.TotalToolCostPerAssembly,
        "AssemblyCostingOperationCostRequest": item.CostingPartDetails.CostingOperationCostResponse ? item.CostingPartDetails.CostingOperationCostResponse : [],
        "AssemblyCostingToolsCostRequest": item.CostingPartDetails.CostingToolCostResponse ? item.CostingPartDetails.CostingToolCostResponse : [],
        "AssemblyCostingProcessCostResponse": processGrid?.CostingProcessCostResponse ? processGrid?.CostingProcessCostResponse : [],
        // "TotalProcessCost": TotalProcessCost,
        // "TotalOperationCost": item.CostingPartDetails.TotalOperationCost,
      }
    }
    dispatch(saveAssemblyCostingRMCCTab(requestData, res => {
      props.closeDrawer('')
    }))

  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer className="bottom-drawer" anchor='bottom' open={props.isOpen}
      >
        <div className="container-fluid add-operation-drawer">
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading sticky-top-0">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'Add Assembly Process Cost'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>

            <Row className="mb-3 pt-3">
              <Col>
                <div className="user-page p-0">
                  <div className="cr-process-costwrap">
                    {/* <Row className="cr-innertool-cost">

                      <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Process Cost: ${item?.CostingPartDetails && item?.CostingPartDetails?.TotalOperationCostPerAssembly !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>
                      <Col md="3" className="cr-costlabel text-center"><span className="d-inline-block align-middle">{``}</span></Col>
                    </Row> */}


                    <ProcessCost
                      index={props.index}
                      data={processGrid}
                      setProcessCost={props.setProcessCost}
                      setOperationCost={props.setOperationCost}
                      setOtherOperationCost={props.setOtherOperationCost}
                      setToolCost={props.setToolCost}
                      item={item}
                      isAssemblyTechnology={true}
                      setProcessCostFunction={props.setProcessCostFunction}
                      getValuesOfProcess={getValuesOfProcess}
                    />
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-right">
                <button
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                  <div className={'cancel-icon'}></div> {'Cancel'}
                </button>
                <button
                  disabled={CostingViewMode ? true : false}
                  type={'button'}
                  className="submit-button mr15 save-btn"
                  onClick={saveData} >
                  <div className={'save-icon'}></div>
                  {'SAVE'}
                </button>
              </div>
            </Row>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

//export default React.memo(AddAssemblyProcess);
export default AddAssemblyProcess;