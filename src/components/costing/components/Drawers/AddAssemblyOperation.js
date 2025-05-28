import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import Drawer from '@material-ui/core/Drawer';
import { getCostingCostDetails, gridDataAdded, saveAssemblyCostingRMCCTab, saveAssemblyPartRowCostingCalculation } from '../../actions/Costing';
import OperationCost from '../CostingHeadCosts/Part/OperationCost';
import ToolCost from '../CostingHeadCosts/Part/ToolCost';
import { checkForDecimalAndNull, checkForNull, getOverheadAndProfitCostTotal, loggedInUserId } from '../../../../helper';
import { ASSEMBLY } from '../../../../config/masterData';
import { IdForMultiTechnology, PART_TYPE_ASSEMBLY } from '../../../../config/masterData';
import { createToprowObjAndSave, findSurfaceTreatmentData, formatMultiTechnologyUpdate } from '../../CostingUtil';
import { setSubAssemblyTechnologyArray, updateMultiTechnologyTopAndWorkingRowCalculation } from '../../actions/SubAssembly';
import { useEffect } from 'react';
import { useRef } from 'react';
import { WACTypeId } from '../../../../config/constants';
import { IsPartType } from '../CostingDetails';
import { reactLocalStorage } from 'reactjs-localstorage';
import { createSaveAssemblyRMCCObject } from '../../CostingUtilSaveObjects';
import Toaster from '../../../common/Toaster';

function AddAssemblyOperation(props) {
  const { item, CostingViewMode, isAssemblyTechnology, itemInState } = props;
  const [IsOpenTool, setIsOpenTool] = useState(false);
  // const IsLocked = (item?.IsLocked ? item?.IsLocked : false) || (item?.IsPartLocked ? item?.IsPartLocked : false)
  let IsLocked = ''
  if (item?.PartType === 'Sub Assembly') {
    IsLocked = (item.IsLocked ? item.IsLocked : false)
  }
  else {
    IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
  }

  const drawerRef = useRef();

  const [operationGridData, setOperationGridData] = useState([]);
  const [operationCostAssemblyTechnology, setOperationCostAssemblyTechnology] = useState(item?.CostingPartDetails?.NetOperationCost);
  const [weldingCostAssemblyTechnology, setWeldingCostAssemblyTechnology] = useState(item?.CostingPartDetails?.NetWeldingCost);

  const costData = useContext(costingInfoContext)
  const isPartType = useContext(IsPartType);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId)
  const operationCost = item?.CostingPartDetails && item?.CostingPartDetails?.TotalOperationCostPerAssembly !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly, initialConfiguration?.NoOfDecimalForPrice) : 0
  const weldingCost = item?.CostingPartDetails && item?.CostingPartDetails?.TotalWeldingCostPerAssembly !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalWeldingCostPerAssembly, initialConfiguration?.NoOfDecimalForPrice) : 0
  const { RMCCTabData, CostingEffectiveDate, getAssemBOPCharge, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, DiscountCostData } = useSelector(state => state.costing)
  const dispatch = useDispatch()
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const netPOPrice = useContext(NetPOPriceContext);

  useEffect(() => {

    if (!CostingViewMode) {
      let arr = JSON.parse(sessionStorage.getItem('costingArray'))?.filter(element =>
        element?.PartNumber === itemInState?.PartNumber &&
        element?.AssemblyPartNumber === itemInState?.AssemblyPartNumber &&
        element?.BOMLevel === itemInState?.BOMLevel
      )
      if (arr && arr[0]?.CostingPartDetails?.CostingOperationCostResponse) {
        let operationCost = 0;
        let weldingCost = 0;

        const operationResponse = Array.isArray(arr[0]?.CostingPartDetails?.CostingOperationCostResponse)
          ? arr[0]?.CostingPartDetails?.CostingOperationCostResponse
          : [];

        operationResponse.forEach(item => {
          if (!item?.IsChild) {
            if (item?.ForType === "Welding") {
              weldingCost += checkForNull(item?.OperationCost);
            }
            operationCost += checkForNull(item?.OperationCost);
          }
        });

        setOperationGridData(operationResponse)
        setOperationCostAssemblyTechnology(operationCost)
        setWeldingCostAssemblyTechnology(weldingCost)
      }
    }
  }, [itemInState])

  // Restore subAssemblyTechnologyArray effect
  useEffect(() => {

    if (isAssemblyTechnology && subAssemblyTechnologyArray?.length > 0) {
      const operationResponse = Array.isArray(subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostingOperationCostResponse) ? subAssemblyTechnologyArray[0].CostingPartDetails.CostingOperationCostResponse : [];

      setOperationGridData(operationResponse)
      setOperationCostAssemblyTechnology(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost || 0)
      setWeldingCostAssemblyTechnology(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetWeldingCost || 0)
    }
    return () => {
      setOperationGridData([])
    }
  }, [])

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

  const getOperationGrid = (grid, operationCostAssemblyTechnology, isAssemblyTechnologyCall) => {
    setOperationGridData(grid)
    if (isAssemblyTechnologyCall) {
      setOperationCostAssemblyTechnology(operationCostAssemblyTechnology)

      let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray

      let costPerPieceTotal = 0
      let CostPerAssemblyBOPTotal = 0
      tempsubAssemblyTechnologyArray[0].CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
        costPerPieceTotal = checkForNull(costPerPieceTotal) + checkForNull(item?.CostingPartDetails?.NetChildPartsCostWithQuantity)
        CostPerAssemblyBOPTotal = checkForNull(CostPerAssemblyBOPTotal) + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity)
        return null
      })
      if (tempsubAssemblyTechnologyArray[0]) {

        let operation = 0, welding = 0
        grid?.forEach(el => {
          if (el?.ForType === "Welding") {
            welding += checkForNull(el?.OperationCost);
          }
          operation += checkForNull(el?.OperationCost);
        });

        setOperationCostAssemblyTechnology(operation);
        setWeldingCostAssemblyTechnology(welding);
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostingOperationCostResponse = grid;
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetPOPrice = checkForNull(costPerPieceTotal) + checkForNull(CostPerAssemblyBOPTotal) + checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost) + checkForNull(operation)
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetTotalRMBOPCC = checkForNull(costPerPieceTotal) + checkForNull(CostPerAssemblyBOPTotal) + checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost) + checkForNull(operation) + checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetLabourCost) + checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.IndirectLaborCost) + checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.StaffCost);
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetOperationCost = checkForNull(operation) || 0;
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetWeldingCost = checkForNull(welding) || 0;
        // Update overhead and profit costs
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetOperationCostForOverhead = getOverheadAndProfitCostTotal(grid, "Overhead")?.overheadOperationCost;
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetOperationCostForProfit = getOverheadAndProfitCostTotal(grid, "Profit")?.profitOperationCost;
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetWeldingCostForOverhead = getOverheadAndProfitCostTotal(grid, "Overhead")?.overheadWeldingCost;
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetWeldingCostForProfit = getOverheadAndProfitCostTotal(grid, "Profit")?.profitWeldingCost;
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalOperationCostPerAssemblyForOverhead = getOverheadAndProfitCostTotal(grid, "Overhead")?.overheadOperationCost;
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalOperationCostPerAssemblyForProfit = getOverheadAndProfitCostTotal(grid, "Profit")?.profitOperationCost;
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalWeldingCostPerAssemblyForOverhead = getOverheadAndProfitCostTotal(grid, "Overhead")?.overheadWeldingCost;
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalWeldingCostPerAssemblyForProfit = getOverheadAndProfitCostTotal(grid, "Profit")?.profitWeldingCost;
        // Update Redux state

        dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }));
      }
    }
  }

  /**
  * @method saveData
  * @description SAVE DATA ASSEMBLY
  */
  const saveData = () => {
    const hasMissingApplicability = operationGridData?.some(item => !item?.CostingConditionMasterAndTypeLinkingId);
    if (operationGridData?.length > 0 && hasMissingApplicability) {
      Toaster.warning('Please select Applicability for all operations');
      return false;
    }
    const tabData = RMCCTabData[0]
    const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
    const overHeadAndProfitTabData = OverheadProfitTabData[0]
    const discountAndOtherTabData = DiscountCostData
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
    let isTopRowAssemblyClicked = false
    let arr = JSON.parse(sessionStorage.getItem('costingArray'))?.filter(element => element?.PartType === 'Assembly')
    let arrST = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))?.filter(element => element?.PartType === 'Assembly')
    if (arr[0]?.PartType === 'Assembly' && arr[0]?.PartNumber === item?.PartNumber && arr[0]?.BOMLevel === item?.BOMLevel && arr[0]?.AssemblyPartNumber === item?.AssemblyPartNumber) {
      isTopRowAssemblyClicked = true
    }
    let basicRate = 0
    let obj = {
      costingId: item?.CostingId,
      subAsmCostingId: item?.SubAssemblyCostingId ?? item?.AssemblyCostingId,
      asmCostingId: item?.AssemblyCostingId
    }
    dispatch(getCostingCostDetails(obj, response => {
      let allCostingData = response?.data?.Data
      if (Number(isPartType?.value) === PART_TYPE_ASSEMBLY && !isAssemblyTechnology) {
        basicRate = checkForNull(item?.CostingPartDetails?.NetTotalRMBOPCC) + checkForNull(allCostingData?.NetSurfaceTreatmentCost)
        if (isTopRowAssemblyClicked) {
          basicRate = checkForNull(basicRate) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost)
            + checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
        }
      } else if (isAssemblyTechnology) {
        basicRate = checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetTotalRMBOPCC) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
          checkForNull(allCostingData?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
          checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
      } else {
        basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
          checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
          checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
      }

      let totalCostSaveAPI = checkForNull(basicRate)
      if (isTopRowAssemblyClicked) {
        totalCostSaveAPI = checkForNull(totalCostSaveAPI) + checkForNull(DiscountCostData?.totalConditionCost)
      }

      let requestObj = createSaveAssemblyRMCCObject(item, costData, basicRate, totalCostSaveAPI, CostingEffectiveDate, operationGridData, true)
      
      if (isAssemblyTechnology) {
        item.NetOperationCost = operationCostAssemblyTechnology
        item.NetWeldingCost = weldingCostAssemblyTechnology
        // item.NetPOPrice = netPOPrice
        // item.NetTotalRMBOPCC = checkForNull(item?.CostingPartDetails?.NetChildPartsCost) + checkForNull(item?.CostingPartDetails?.NetBoughtOutPartCost) + checkForNull(item?.NetOperationCost) + checkForNull(item?.NetProcessCost) + checkForNull(item?.NetLabourCost) + checkForNull(item?.IndirectLaborCost) + checkForNull(item?.StaffCost) + checkForNull(item?.NetWeldingCost)
        let request = formatMultiTechnologyUpdate(item, netPOPrice, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate, initialConfiguration?.IsAddPaymentTermInNetCost)
        dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => {
        }))
        dispatch(gridDataAdded(true))

        props?.setOperationCostFunction(operationCostAssemblyTechnology, operationGridData)
        dispatch(saveAssemblyCostingRMCCTab(requestObj, res => {
          props.closeDrawer('')
        }))
      } else {
        dispatch(saveAssemblyCostingRMCCTab(requestObj, res => {
          if (!CostingViewMode) {
            let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 1, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)

            dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
          }
          props.closeDrawer('')
        }))
      }
    }))


  }
  const handleRendered = () => {
    setTimeout(() => {
      const drawerEl = drawerRef.current;
      const divEl = drawerEl.querySelector('.MuiDrawer-paperAnchorBottom');
      divEl.removeAttribute('tabindex');
    }, 500);

  };
  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer className="bottom-drawer" anchor='bottom' open={props.isOpen}
        ref={drawerRef}
        onRendered={handleRendered}
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
                  <div className="cr-process-costwrap multi-technology-container">
                    <Row className="cr-innertool-cost">

                      <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Operation Cost: ${partType ? checkForNull(operationCostAssemblyTechnology) : checkForNull(operationCost)}`}</span></Col>
                      <Col md="3" className="cr-costlabel text-center"><span className="d-inline-block align-middle">{``}</span></Col>
                    </Row>

                    <OperationCost
                      // data={item?.CostingPartDetails !== undefined ? item?.CostingPartDetails?.CostingOperationCostResponse : []}
                      data={operationGridData}
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
                  id="AddAssemblyOperation_Cancel"
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                  <div className={'cancel-icon'}></div> {'Cancel'}
                </button>
                <button
                  id="AddAssemblyOperation_Save"
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