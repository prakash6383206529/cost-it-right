import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { checkForNull, loggedInUserId } from '../../../../helper';
import ProcessCost from '../CostingHeadCosts/Part/ProcessCost';
import { setSubAssemblyTechnologyArray, updateMultiTechnologyTopAndWorkingRowCalculation } from '../../actions/SubAssembly';
import { createToprowObjAndSave, findSurfaceTreatmentData, formatMultiTechnologyUpdate } from '../../CostingUtil';
import { getCostingCostDetails, gridDataAdded, saveAssemblyCostingRMCCTab, saveAssemblyPartRowCostingCalculation } from '../../actions/Costing';
import { useContext } from 'react';
import { NetPOPriceContext, costingInfoContext } from '../CostingDetailStepTwo';
import { useEffect } from 'react';
import { IsPartType, ViewCostingContext } from '../CostingDetails';
import { useRef } from 'react';
import { PART_TYPE_ASSEMBLY } from '../../../../config/masterData';
import { createSaveAssemblyRMCCObject } from '../../CostingUtilSaveObjects';

function AddAssemblyProcess(props) {
  const { item, isAssemblyTechnology, itemInState } = props;
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  // const [processGrid, setProcessGrid] = useState(subAssemblyTechnologyArray ? { CostingProcessCostResponse: subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostingProcessCostResponse, ProcessCostTotal: subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost } : []);
  const [processGrid, setProcessGrid] = useState();
  const dispatch = useDispatch()
  const { CostingEffectiveDate } = useSelector(state => state.costing)
  const costData = useContext(costingInfoContext)
  const { ToolTabData, ToolsDataList, ComponentItemDiscountData, RMCCTabData, SurfaceTabData, OverheadProfitTabData, DiscountCostData, PackageAndFreightTabData, checkIsToolTabChange, getAssemBOPCharge } = useSelector(state => state.costing)
  const CostingViewMode = useContext(ViewCostingContext);
  const drawerRef = useRef();
  const isPartType = useContext(IsPartType);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  // useEffect(() => {
  //   let obj = {
  //     CostingProcessCostResponse: subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostingProcessCostResponse
  //   }
  //   setProcessGrid(obj)
  // }, [])
  const netPOPrice = useContext(NetPOPriceContext);

  useEffect(() => {
    if (isAssemblyTechnology) {
      setProcessGrid(subAssemblyTechnologyArray ? { CostingProcessCostResponse: subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostingProcessCostResponse, ProcessCostTotal: subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost } : [])
    }
    return () => {
      setProcessGrid({})
    }
  }, [])

  useEffect(() => {
    if (!isAssemblyTechnology) {
      let arr = JSON.parse(sessionStorage.getItem('costingArray'))?.filter(element => element?.PartNumber === itemInState?.PartNumber && element?.AssemblyPartNumber === itemInState?.AssemblyPartNumber && element?.BOMLevel === itemInState?.BOMLevel)
      let obj = { ...processGrid }
      obj.CostingProcessCostResponse = arr && arr[0]?.CostingPartDetails?.CostingProcessCostResponse
      const totalProcessCost = arr && arr[0]?.CostingPartDetails?.CostingProcessCostResponse?.reduce((acc, item) => {
        if (!(item?.IsChild)) {
          return acc + checkForNull(item?.ProcessCost);
        }
        return acc;
      }, 0);
      obj.ProcessCostTotal = totalProcessCost
      setProcessGrid(obj)
    }

  }, [itemInState])

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
  }

  /**
  * @method saveData
  * @description SAVE DATA ASSEMBLY
  */
  const saveData = () => {
    const tabData = RMCCTabData && RMCCTabData[0]
    const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
    const overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]
    const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
    const toolTabData = ToolTabData && ToolTabData[0]
    const discountAndOtherTabData = DiscountCostData
    // let stCostingData = findSurfaceTreatmentData(item)
    let tempArr = processGrid.CostingProcessCostResponse
    let TotalProcessCost = 0
    tempArr && tempArr.map((item) => {
      if (!(item?.IsChild)) {
        TotalProcessCost = checkForNull(TotalProcessCost) + checkForNull(item?.ProcessCost)
      }
      return null
    })
    let tempRmCcTabArray
    let tempsubAssemblyTechnologyArray
    let totalCost

    let totalOverheadPrice = OverheadProfitTabData && (checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.OverheadCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ProfitCost) +
      checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.RejectionCost) +
      checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ICCCost))

    if (isAssemblyTechnology) {
      tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
      // UPDATING AT INDEX 0 BECAUSE NEED TO UPDATE THE LEVEL 0 ROW (ASSEMBLY)

      let costPerPieceTotal = 0
      tempsubAssemblyTechnologyArray[0].CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
        costPerPieceTotal = checkForNull(costPerPieceTotal) + checkForNull(item?.CostingPartDetails?.NetChildPartsCostWithQuantity)
        return null
      })

      tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetPOPrice =
        checkForNull(costPerPieceTotal) +
        checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalBoughtOutPartCost) +
        checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost) +
        checkForNull(TotalProcessCost)
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalCalculatedRMBOPCCCost =
        checkForNull(costPerPieceTotal) +
        checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalBoughtOutPartCost) +
        checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost) +
        checkForNull(TotalProcessCost)
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostingProcessCostResponse = processGrid.CostingProcessCostResponse
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalProcessCost = TotalProcessCost

      dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))

      totalCost = (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
        checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
        checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
        checkForNull(totalOverheadPrice) +
        checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) + checkForNull(DiscountCostData?.totalConditionCost)) -
        checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else {
      tempRmCcTabArray = item
      totalCost = (checkForNull(tempRmCcTabArray?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) +
        checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
        checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
        checkForNull(totalOverheadPrice) +
        checkForNull(DiscountCostData?.AnyOtherCost) + checkForNull(DiscountCostData?.totalConditionCost)) -
        checkForNull(DiscountCostData?.HundiOrDiscountValue)
    }
    let isTopRowAssemblyClicked = false

    let arr = JSON.parse(sessionStorage.getItem('costingArray'))?.filter(element => element?.PartType === 'Assembly')
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
        basicRate = checkForNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) + checkForNull(allCostingData?.NetSurfaceTreatmentCost)
        if (isTopRowAssemblyClicked) {
          basicRate = checkForNull(basicRate) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost)
            + checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
        }
      } else if (isAssemblyTechnology) {
        basicRate = checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
          checkForNull(allCostingData?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
          checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
      } else {
        basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
          checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
          checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
      }
      let totalCostSaveAPI = checkForNull(basicRate) + checkForNull(DiscountCostData?.totalConditionCost)

      let requestObj = createSaveAssemblyRMCCObject(item, costData, basicRate, totalCostSaveAPI, CostingEffectiveDate, processGrid?.CostingProcessCostResponse, false)
      if (isAssemblyTechnology) {
        let request = formatMultiTechnologyUpdate(tempsubAssemblyTechnologyArray[0], totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate, initialConfiguration?.IsAddPaymentTermInNetCost)
        dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))
        dispatch(gridDataAdded(true))
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
                  <div className="cr-process-costwrap multi-technology-container">
                    <ProcessCost
                      index={props.index}
                      data={processGrid}
                      setProcessCost={props.setProcessCost}
                      setOperationCost={props.setOperationCost}
                      setOtherOperationCost={props.setOtherOperationCost}
                      setToolCost={props.setToolCost}
                      item={item}
                      isAssemblyTechnology={props?.isAssemblyTechnology}
                      setProcessCostFunction={props?.setProcessCostFunction}
                      getValuesOfProcess={getValuesOfProcess}
                      setAssemblyProcessCost={props?.setAssemblyProcessCost}
                      IsAssemblyCalculation={true}
                    />
                  </div>
                </div>
              </Col>
            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-right">
                <button
                  id="AddAssemblyProcess_Cancel"
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                  <div className={'cancel-icon'}></div> {'Cancel'}
                </button>
                <button
                  id="AddAssemblyProcess_Save"
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

export default AddAssemblyProcess;