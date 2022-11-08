import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import Drawer from '@material-ui/core/Drawer';
import { saveAssemblyCostingRMCCTab, saveAssemblyPartRowCostingCalculation } from '../../actions/Costing';
import OperationCost from '../CostingHeadCosts/Part/OperationCost';
import ToolCost from '../CostingHeadCosts/Part/ToolCost';
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../helper';
import { ASSEMBLY } from '../../../../config/masterData';
import { IdForMultiTechnology } from '../../../../config/masterData';
import { createToprowObjAndSave, findSurfaceTreatmentData, formatMultiTechnologyUpdate } from '../../CostingUtil';
import { setSubAssemblyTechnologyArray, updateMultiTechnologyTopAndWorkingRowCalculation } from '../../actions/SubAssembly';
import { useEffect } from 'react';

function AddAssemblyOperation(props) {
  const { item, CostingViewMode, isAssemblyTechnology } = props;
  const [IsOpenTool, setIsOpenTool] = useState(false);
  const IsLocked = (item?.IsLocked ? item?.IsLocked : false) || (item?.IsPartLocked ? item?.IsPartLocked : false)

  const dispatch = useDispatch()
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)

  const { RMCCTabData, CostingEffectiveDate, getAssemBOPCharge, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, DiscountCostData } = useSelector(state => state.costing)

  const netPOPrice = useContext(NetPOPriceContext);

  const [operationGridData, setOperationGridData] = useState([]);
  const [operationCostAssemblyTechnology, setOperationCostAssemblyTechnology] = useState(item?.CostingPartDetails?.TotalOperationCost);

  const costData = useContext(costingInfoContext)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const partType = IdForMultiTechnology.includes(String(costData?.TechnologyId))
  const operationCost = item?.CostingPartDetails && item?.CostingPartDetails?.TotalOperationCostPerAssembly !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly, initialConfiguration.NoOfDecimalForPrice) : 0

  useEffect(() => {
    let operationCost = operationGridData && operationGridData.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.OperationCost)
    }, 0)
    setOperationCostAssemblyTechnology(operationCost)
  }, [operationGridData])

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

  const getOperationGrid = (grid, operationCostAssemblyTechnology) => {
    setOperationCostAssemblyTechnology(operationCostAssemblyTechnology)
    setOperationGridData(grid)
    let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray

    let costPerPieceTotal = 0
    tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
      costPerPieceTotal = checkForNull(costPerPieceTotal) + checkForNull(item?.CostingPartDetails?.NetChildPartsCostWithQuantity)
      return null
    })

    let totalOperationCost = grid && grid.length > 0 && grid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el?.OperationCost)
    }, 0)

    tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostingOperationCostResponse = grid;
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetPOPrice =
      checkForNull(costPerPieceTotal) +
      checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalBoughtOutPartCost) +
      checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost) +
      checkForNull(totalOperationCost)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalCalculatedRMBOPCCCost =
      checkForNull(costPerPieceTotal) +
      checkForNull(tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalBoughtOutPartCost) +
      checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost) +
      checkForNull(totalOperationCost)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalOperationCost = totalOperationCost ? totalOperationCost : 0;

    dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))

  }

  /**
  * @method saveData
  * @description SAVE DATA ASSEMBLY
  */
  const saveData = () => {
    const tabData = RMCCTabData[0]
    const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
    const overHeadAndProfitTabData = OverheadProfitTabData[0]
    const discountAndOtherTabData = DiscountCostData[0]
    const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
    const toolTabData = ToolTabData && ToolTabData[0]

    let stCostingData = findSurfaceTreatmentData(item)
    let operData = operationGridData && operationGridData.map((item1) => {
      item1.IsChildPart = true
      item1.CostingId = item?.CostingId
      item1.PartId = item?.PartId
      item1.PartNumber = item?.PartNumber
      item1.PartName = item?.PartName
      // operData.OperationDetailId = item
      return item1
    })


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
      "TotalProcessCost": item.CostingPartDetails.TotalProcessCost,
      "TotalOperationCost": operationCostAssemblyTechnology,
      "NetTotalRMBOPCC": item.CostingPartDetails.TotalCalculatedRMBOPCCCost,
      "TotalCost": stCostingData && Object.keys.length > 0 ? checkForNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(stCostingData.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys) : item.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity,
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
        "AssemblyCostingOperationCostRequest": operData,
        "AssemblyCostingToolsCostRequest": item.CostingPartDetails.CostingToolCostResponse ? item.CostingPartDetails.CostingToolCostResponse : [],
        "AssemblyCostingProcessCostResponse": item.CostingPartDetails.CostingProcessCostResponse ? item.CostingPartDetails.CostingProcessCostResponse : [],
        "TotalOperationCost": operationCostAssemblyTechnology,
      }
    }
    if (isAssemblyTechnology) {
      item.TotalOperationCost = operationCostAssemblyTechnology
      let request = formatMultiTechnologyUpdate(item, netPOPrice, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData)
      dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => {
      }))

      props?.setOperationCostFunction(operationCostAssemblyTechnology, operationGridData)
      dispatch(saveAssemblyCostingRMCCTab(requestData, res => {
        props.closeDrawer('')
      }))
    } else {
      dispatch(saveAssemblyCostingRMCCTab(requestData, res => {
        if (!CostingViewMode) {
          let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 1, CostingEffectiveDate)

          if (!CostingViewMode && !partType) {
            let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 1, CostingEffectiveDate)

            dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
          }
          props.closeDrawer('')
        }
      }))
    }
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
                  <h3>{'Add Assembly Operation Cost'}</h3>
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
                    <Row className="cr-innertool-cost">

                      <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Operation Cost: ${partType ? operationCostAssemblyTechnology : operationCost}`}</span></Col>
                      <Col md="3" className="cr-costlabel text-center"><span className="d-inline-block align-middle">{``}</span></Col>
                    </Row>

                    <OperationCost
                      data={item.CostingPartDetails !== undefined ? item.CostingPartDetails?.CostingOperationCostResponse : []}
                      setAssemblyOperationCost={props.setAssemblyOperationCost}
                      item={props.item}
                      IsAssemblyCalculation={true}
                      getOperationGrid={getOperationGrid}
                    />
                  </div >
                </div >
              </Col >
            </Row >

            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-right">
                <button
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                  <div className={'cancel-icon'}></div> {'Cancel'}
                </button>
                <button
                  disabled={(CostingViewMode || IsLocked)}
                  type={'button'}
                  className="submit-button mr15 save-btn"
                  onClick={saveData} >
                  <div className={'save-icon'}></div>
                  {'SAVE'}
                </button>
              </div>
            </Row>
          </div >
        </div >
      </Drawer >
    </div >
  );
}

export default AddAssemblyOperation;