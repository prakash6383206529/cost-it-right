import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { checkForNull, getOverheadAndProfitCostTotal, loggedInUserId } from '../../../../helper';
import ProcessCost from '../CostingHeadCosts/Part/ProcessCost';
import { setSubAssemblyTechnologyArray, updateMultiTechnologyTopAndWorkingRowCalculation } from '../../actions/SubAssembly';
import { createToprowObjAndSave, findSurfaceTreatmentData, formatMultiTechnologyUpdate } from '../../CostingUtil';
import { getCostingCostDetails, gridDataAdded, saveAssemblyCostingRMCCTab, saveAssemblyPartRowCostingCalculation } from '../../actions/Costing';
import { useContext } from 'react';
import { IsNFRContext, NetPOPriceContext, costingInfoContext } from '../CostingDetailStepTwo';
import { useEffect } from 'react';
import { IsPartType, ViewCostingContext } from '../CostingDetails';
import { useRef } from 'react';
import { PART_TYPE_ASSEMBLY } from '../../../../config/masterData';
import { createSaveAssemblyRMCCObject } from '../../CostingUtilSaveObjects';

function AddAssemblyProcess(props) {
  const { item, isAssemblyTechnology, itemInState, IsLocked } = props;
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  // const [processGrid, setProcessGrid] = useState(subAssemblyTechnologyArray ? { CostingProcessCostResponse: subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostingProcessCostResponse, NetProcessCost: subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost } : []);
  const [processGrid, setProcessGrid] = useState();
  const [costingTechnologyId, setCostingTechnologyId] = useState(subAssemblyTechnologyArray[0]?.TechnologyId)
  const dispatch = useDispatch()
  const { CostingEffectiveDate } = useSelector(state => state.costing)
  const costData = useContext(costingInfoContext)
  const { ToolTabData, ToolsDataList, ComponentItemDiscountData, RMCCTabData, SurfaceTabData, OverheadProfitTabData, DiscountCostData, PackageAndFreightTabData, checkIsToolTabChange, getAssemBOPCharge } = useSelector(state => state.costing)
  const CostingViewMode = useContext(ViewCostingContext);
  const IsLockTabInCBCCostingForCustomerRFQ = useContext(IsNFRContext);
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
      let NetCCForOtherTechnologyCost = 0;
      const processCostResponse = subAssemblyTechnologyArray?.[0]?.CostingPartDetails?.CostingProcessCostResponse;

      if (processCostResponse) {
        processCostResponse.forEach(item => {
          if (!(item?.IsChild)) {
            const processCost = checkForNull(item?.ProcessCost);
            if (item?.ProcessTechnologyId !== costingTechnologyId) {
              NetCCForOtherTechnologyCost += processCost;
            }
          }
        });
      }

      setProcessGrid(subAssemblyTechnologyArray ? {
        CostingProcessCostResponse: processCostResponse,
        NetProcessCost: subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost,
        NetCCForOtherTechnologyCost: NetCCForOtherTechnologyCost
      } : [])
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
      let NetCCForOtherTechnologyCost = 0;
      const totalProcessCost = arr && arr[0]?.CostingPartDetails?.CostingProcessCostResponse?.reduce((acc, item) => {
        if (!(item?.IsChild)) {
          const processCost = checkForNull(item?.ProcessCost);
          if (item?.ProcessTechnologyId !== costingTechnologyId) {
            NetCCForOtherTechnologyCost += processCost;
          }
          return acc + processCost;
        }
        return acc;
      }, 0);
      obj.NetProcessCost = totalProcessCost;
      obj.NetCCForOtherTechnologyCost = NetCCForOtherTechnologyCost;
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

  const getValuesOfProcess = (gridData, NetProcessCost) => {
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
    let NetProcessCost = 0
    let NetCCForOtherTechnologyCost = 0
    let TechnologyId = subAssemblyTechnologyArray[0]?.TechnologyId
    tempArr && tempArr.map((item) => {
      if (!(item?.IsChild)) {
        // Always add to NetProcessCost for all technologies
        NetProcessCost = checkForNull(NetProcessCost) + checkForNull(item?.ProcessCost)
        if (item?.ProcessTechnologyId !== TechnologyId) {
          NetCCForOtherTechnologyCost = checkForNull(NetCCForOtherTechnologyCost) + checkForNull(item?.ProcessCost)
        }
      }
      return null
    })
    let tempRmCcTabArray
    let tempsubAssemblyTechnologyArray
    let totalCost

    let totalOverheadPrice = OverheadProfitTabData && (checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.OverheadCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ProfitCost) +
      checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.RejectionCost))

    if (isAssemblyTechnology) {
      tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
      // UPDATING AT INDEX 0 BECAUSE NEED TO UPDATE THE LEVEL 0 ROW (ASSEMBLY)

      let costPerPieceTotal = 0
      let CostPerAssemblyBOPTotal = 0
      tempsubAssemblyTechnologyArray[0].CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
        costPerPieceTotal = checkForNull(costPerPieceTotal) + checkForNull(item?.CostingPartDetails?.NetChildPartsCostWithQuantity)
        CostPerAssemblyBOPTotal = checkForNull(CostPerAssemblyBOPTotal) + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity)
        return null
      })

      tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetPOPrice =
        checkForNull(costPerPieceTotal) +
        checkForNull(CostPerAssemblyBOPTotal) +
        checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost) +

        checkForNull(NetProcessCost)
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetTotalRMBOPCC =
        checkForNull(costPerPieceTotal) +
        checkForNull(CostPerAssemblyBOPTotal) +
        checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost) +
        checkForNull(NetProcessCost)
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostingProcessCostResponse = processGrid.CostingProcessCostResponse
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetProcessCost = NetProcessCost
      // Update overhead and profit costs
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetProcessCostForOverhead = getOverheadAndProfitCostTotal(processGrid?.CostingProcessCostResponse, tempsubAssemblyTechnologyArray[0]?.TechnologyId)?.overheadProcessCost;
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetProcessCostForProfit = getOverheadAndProfitCostTotal(processGrid?.CostingProcessCostResponse, tempsubAssemblyTechnologyArray[0]?.TechnologyId)?.profitProcessCost;
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalProcessCostPerAssemblyForOverhead = getOverheadAndProfitCostTotal(processGrid?.CostingProcessCostResponse, tempsubAssemblyTechnologyArray[0]?.TechnologyId)?.overheadProcessCost;
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalProcessCostPerAssemblyForProfit = getOverheadAndProfitCostTotal(processGrid?.CostingProcessCostResponse, tempsubAssemblyTechnologyArray[0]?.TechnologyId)?.profitProcessCost;
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetCCForOtherTechnologyCost = checkForNull(getOverheadAndProfitCostTotal(processGrid?.CostingProcessCostResponse, tempsubAssemblyTechnologyArray[0]?.TechnologyId)?.ccForOtherTechnologyCost)
      // Update overhead and profit costs
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetCCForOtherTechnologyCostForOverhead = getOverheadAndProfitCostTotal(processGrid?.CostingProcessCostResponse, tempsubAssemblyTechnologyArray[0]?.TechnologyId)?.ccForOtherTechnologyCostForOverhead;
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetCCForOtherTechnologyCostForProfit = getOverheadAndProfitCostTotal(processGrid?.CostingProcessCostResponse, tempsubAssemblyTechnologyArray[0]?.TechnologyId)?.ccForOtherTechnologyCostForProfit;
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalCCForOtherTechnologyCostPerAssembly = checkForNull(getOverheadAndProfitCostTotal(processGrid?.CostingProcessCostResponse, tempsubAssemblyTechnologyArray[0]?.TechnologyId)?.ccForOtherTechnologyCost)
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForOverhead = getOverheadAndProfitCostTotal(processGrid?.CostingProcessCostResponse, tempsubAssemblyTechnologyArray[0]?.TechnologyId)?.ccForOtherTechnologyCostForOverhead;
      tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForProfit = getOverheadAndProfitCostTotal(processGrid?.CostingProcessCostResponse, tempsubAssemblyTechnologyArray[0]?.TechnologyId)?.ccForOtherTechnologyCostForProfit;
      
      dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))

      totalCost = (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
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
          if (!CostingViewMode && !IsLockTabInCBCCostingForCustomerRFQ) {
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
                    disabled={CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ || IsLocked ? true : false}
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