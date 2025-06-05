import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector, } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import {
  getToolTabData, saveToolTab, setToolTabData, getToolsProcessWiseDataListByCostingID,
  setComponentToolItemData, saveDiscountOtherCostTab, saveAssemblyPartRowCostingCalculation, isToolDataChange, saveCostingPaymentTermDetail
} from '../../actions/Costing';
import { costingInfoContext, IsNFRContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import Switch from "react-switch";
import Tool from '../CostingHeadCosts/Tool';
import Toaster from '../../../common/Toaster';
import { MESSAGES } from '../../../../config/message';
import { IsPartType, ViewCostingContext } from '../CostingDetails';
import LoaderCustom from '../../../common/LoaderCustom';
import NoContentFound from '../../../common/NoContentFound';
import { defaultPageSize, EMPTY_DATA, WACTypeId } from '../../../../config/constants';
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import { AgGridColumn } from 'ag-grid-react/lib/agGridColumn';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import AddTool from '../Drawers/AddTool';
import { gridDataAdded } from '../../actions/Costing'
import { createToprowObjAndSave, formatMultiTechnologyUpdate } from '../../CostingUtil';
import { IdForMultiTechnology, PART_TYPE_ASSEMBLY } from '../../../../config/masterData';
import { debounce } from 'lodash';
import { PaginationWrapper } from '../../../common/commonPagination';
import { updateMultiTechnologyTopAndWorkingRowCalculation } from '../../actions/SubAssembly';
import { PreviousTabData } from '../CostingHeaderTabs';
import _ from 'lodash'
import { useLabels } from '../../../../helper/core';
function TabToolCost(props) {
  const { handleSubmit } = useForm();
  const dispatch = useDispatch()
  const { ToolTabData, CostingEffectiveDate, ToolsDataList, ComponentItemDiscountData, PaymentTermDataDiscountTab, RMCCTabData, SurfaceTabData, OverheadProfitTabData, DiscountCostData, PackageAndFreightTabData, checkIsToolTabChange, getAssemBOPCharge } = useSelector(state => state.costing)
  const IsToolCostApplicable = useSelector(state => state.costing.IsToolCostApplicable)
  const [IsApplicableProcessWise, setIsApplicableProcessWise] = useState(ToolTabData?.[0]?.CostingPartDetails?.IsToolCostProcessWise ?? false)
  const [IsApplicableOverall, setIsApplicableOverall] = useState(false);
  const [netToolCostOverallApplicability, setNetToolCostOverallApplicability] = useState(0);
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [rowObjData, setRowObjData] = useState([])
  const [editIndex, setEditIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const IsLockTabInCBCCostingForCustomerRFQ = useContext(IsNFRContext);
  const netPOPrice = useContext(NetPOPriceContext);
  const [gridData, setGridData] = useState([])
  const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId)
  const [disableSwitch, setDisableSwitch] = useState(false)
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const isPartType = useContext(IsPartType);
  const [loader, setLoader] = useState(false)
  const [state, setState] = useState({
    toolmaintenanceCostPerPc: 0,
    toolInterestCostPerPc: 0,
    toolAmortizationCost: 0,
    netToolCost: 0,
    disableToggle: false
  })
  const { toolMaintenanceCostLabel, toolMaintenanceCostPerPcLabel, toolInterestRatePercentLabel, toolInterestCostLabel, toolInterestCostPerPcLabel } = useLabels();
  const previousTab = useContext(PreviousTabData) || 0;
  const dispense = () => {
    setIsApplicableProcessWise(IsToolCostApplicable)
  }
  const dispenseCallback = React.useCallback(dispense, [IsToolCostApplicable])

  useEffect(() => {
    dispenseCallback()
  }, [IsToolCostApplicable])

  useEffect(() => {

    if (IsApplicableProcessWise && gridData && gridData?.length === 0) {
      setDisableSwitch(false)
    } else if (gridData?.length > 0) {
      setDisableSwitch(true)
    }
  }, [gridData])




  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
      }
      dispatch(getToolTabData(data, true, (res) => { }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if ((CostingViewMode === false || IsLockTabInCBCCostingForCustomerRFQ===false) && ToolTabData?.length > 0) {
      let TopHeaderValues = ToolTabData && ToolTabData.length > 0 && ToolTabData[0]?.CostingPartDetails !== undefined ? ToolTabData[0]?.CostingPartDetails : null;
      //setTimeout(() => {

      let topHeaderData = {
        ToolCost: TopHeaderValues && TopHeaderValues.TotalToolCost,
        IsApplicableProcessWise: IsApplicableProcessWise,
      }
      if (props.activeTab === '5') {
        props.setHeaderCost(topHeaderData)
      }
      setState(prevState => ({
        ...prevState,
        netToolCost: TopHeaderValues?.TotalToolCost || 0
      }))
      //}, 1500)
    }

    const toolOperationId = gridData?.[0]?.ToolOperationId || null;
    if (ToolTabData) {
      if (ToolTabData[0]?.CostingPartDetails?.IsToolCostProcessWise && toolOperationId !== null) {
        
        setIsApplicableProcessWise(true)
      // CJ2-I262 It will help identify tool cost tab (Applicability: overall) previously saved or not.
      } else if(ToolTabData[0]?.CostingPartDetails?.IsToolCostProcessWise === false && toolOperationId !== null) {
        setIsApplicableOverall(true)
      }
    }
  }, [ToolTabData]);
  useEffect(() => {
    if (gridData && gridData?.length > 0) {
      const totalToolInterestCostPerPc = gridData.reduce((sum, item) => sum + (Number(item.ToolInterestCostPerPiece) || 0), 0);
      const totalToolMaintenanceCostPerPc = gridData.reduce((sum, item) => sum + (Number(item.ToolMaintenanceCostPerPiece) || 0), 0);
      const totalToolAmortizationCost = gridData.reduce((sum, item) => sum + (Number(item.ToolAmortizationCost) || 0), 0);
      const totalNetToolCost = gridData.reduce((sum, item) => sum + (Number(item.TotalToolCost) || 0), 0);
      setState({
        toolInterestCostPerPc: totalToolInterestCostPerPc,
        toolmaintenanceCostPerPc: totalToolMaintenanceCostPerPc,
        toolAmortizationCost: totalToolAmortizationCost,
        netToolCost: totalNetToolCost,
        disableToggle: IsApplicableProcessWise ? true : false
      });
    } else {
      setState({
        disableToggle: false
      })
    }
  }, [gridData])

  /**
  * @method setOverAllApplicabilityCost
  * @description SET OVERALL APPLICABILITY DEATILS
  */
  const setOverAllApplicabilityCost = (OverAllToolObj) => {
    dispatchOverallApplicabilityCost(OverAllToolObj, ToolTabData)
    //dispatch(setToolTabData(arr, () => { }))
  }
  const onGridReady = (params) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.paginationGoToPage(0);

  };

  const gridOptions = {
    clearSearch: true,
    noDataText: (ToolsDataList === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),
  };
  const defaultColDef = {

    resizable: true,
    filter: true,
    sortable: false,
  };
  /**
   * @method dispatchOverallApplicabilityCost
   * @description SET OVERALL APPLICABILITY DEATILS
   */
  const dispatchOverallApplicabilityCost = (OverAllToolObj, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {

        i.CostingPartDetails.OverAllApplicability = OverAllToolObj;
        i.CostingPartDetails.NetToolCost = OverAllToolObj.NetToolCost;
        i.CostingPartDetails.CostingToolCostResponse = [];

        return i;
      });

    } catch (error) {

    }
    return tempArr;

  }
  /**
* @method setToolCost
* @description SET TOOL COST
*/
  const setToolCost = (ToolGrid, IsChanged) => {
    const updatedToolTabData = _.cloneDeep(ToolTabData)
    let arr = dispatchToolCost(ToolGrid, IsChanged, updatedToolTabData)
    dispatch(setToolTabData(arr, () => {
      dispatch(setComponentToolItemData(arr[0], () => {
        dispatch(isToolDataChange(IsChanged))
      }))

    }))
  }

  /**
  * @method dispatchToolCost
  * @description SET TOOL COST
  */
  const dispatchToolCost = (ToolGrid, IsChanged, arr) => {
    const updatedToolTabData = _.cloneDeep(arr)
    let tempArr = [];
    let IsToolCostProcessWise = !updatedToolTabData?.[0]?.CostingPartDetails?.IsToolCostProcessWise ? IsApplicableProcessWise : updatedToolTabData?.[0]?.CostingPartDetails?.IsToolCostProcessWise
    try {
      tempArr = updatedToolTabData && updatedToolTabData.map(i => {

        i.CostingPartDetails.CostingToolCostResponse = ToolGrid;
        i.CostingPartDetails.TotalToolCost = getTotalCost(ToolGrid);
        i.CostingPartDetails.IsToolCostProcessWise = IsToolCostProcessWise
        i.CostingPartDetails.NetToolAmortizationCost = ToolGrid.reduce((sum, item) => sum + (Number(item.ToolAmortizationCost) || 0), 0);
        i.CostingPartDetails.NetToolMaintenanceCost = ToolGrid.reduce((sum, item) => sum + (Number(item.ToolMaintenanceCostPerPiece) || 0), 0);
        i.CostingPartDetails.NetToolInterestCost = ToolGrid.reduce((sum, item) => sum + (Number(item.ToolInterestCostPerPiece) || 0), 0);
        //i?.CostingPartDetails?.OverAllApplicability = {};
        i.IsChanged = IsChanged;

        return i;
      });
    } catch (error) {
    }
    return tempArr;
  }

  /**
  * @method getTotalCost
  * @description GET TOTAL COST
  */
  const getTotalCost = (item) => {
    let cost = 0;
    cost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.NetToolCost);
    }, 0)
    return cost;
  }

  /**
  * @method onPressApplicability
  * @description SET APPLICABILITY
  */
  const onPressApplicability = () => {
    setGridData([])
    setToolCost([], true)
    setTimeout(() => {
      setIsApplicableProcessWise(!IsApplicableProcessWise)
      dispatch(isToolDataChange(true))
    }, 300);
    
  }

  useEffect(() => {
    if (IsApplicableProcessWise && props.activeTab === '5') {
      setLoader(true)
    }
    if (ToolTabData && ToolTabData.length > 0) {
      setLoader(false)
      // CJ2-I262 From Backend we are getting CostingToolCostResponse with blank json object and all key values null.
      if (ToolTabData && ToolTabData?.[0]?.CostingPartDetails?.CostingToolCostResponse.length > 0 && ToolTabData?.[0]?.CostingPartDetails?.CostingToolCostResponse?.[0]?.ToolOperationId === null) {
        setGridData([])
      } else {
        setGridData(ToolTabData && ToolTabData[0]?.CostingPartDetails?.CostingToolCostResponse)
      }
    }

  }, [IsApplicableProcessWise, props.activeTab, ToolTabData])

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = debounce(handleSubmit(async (formData) => {
    if (checkIsToolTabChange) {
      const tabData = RMCCTabData[0]
      const surfaceTabData = SurfaceTabData[0]
      const overHeadAndProfitTabData = OverheadProfitTabData[0]
      const discountAndOtherTabData = DiscountCostData
      const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
      const toolTabData = ToolTabData && ToolTabData[0]
      
      const data = {
        "IsToolCostProcessWise": IsApplicableProcessWise,
        "CostingId": costData.CostingId,
        "PartId": costData.PartId,
        "LoggedInUserId": loggedInUserId(),
        "EffectiveDate": CostingEffectiveDate,
        "CostingNumber": costData.CostingNumber,
        "ToolCost": ToolTabData.TotalToolCost,
        "CostingPartDetails": ToolTabData && ToolTabData[0]?.CostingPartDetails,
        "TotalCost": netPOPrice,
        "BasicRate": discountAndOtherTabData?.BasicRateINR,
      }
      if (!IsApplicableProcessWise) {
        setIsApplicableOverall(true)
        setNetToolCostOverallApplicability(ToolTabData?.[0]?.CostingPartDetails?.TotalToolCost)
      }
      if (partType) {
 
        let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray[0]
        tempsubAssemblyTechnologyArray.CostingPartDetails.NetToolCost = ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost
        let totalOverheadPrice = checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.OverheadCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.RejectionCost) 
        let totalCost = (checkForNull(tempsubAssemblyTechnologyArray?.CostingPartDetails?.NetTotalRMBOPCC) +
          checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
          checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
          checkForNull(ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
          checkForNull(totalOverheadPrice) +
          checkForNull(DiscountCostData?.AnyOtherCost) + checkForNull(DiscountCostData?.totalConditionCost)) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) -
          checkForNull(DiscountCostData?.HundiOrDiscountValue)
 
        let request = formatMultiTechnologyUpdate(tempsubAssemblyTechnologyArray, totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate, initialConfiguration?.IsAddPaymentTermInNetCost)
        dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))
        dispatch(gridDataAdded(true))
      }
        // Calling API sequentially because 2nd API saveAssemblyPartRowCostingCalculation was setting IsToolCostProcessWise NULL in backend. 
        const apiCalls = [];
        apiCalls.push({
            label: 'saveToolTab',
            call: () => new Promise((resolve) => {
            dispatch(saveToolTab(data, res => resolve(res)))
            }),
        })
      if (costData.IsAssemblyPart === true && !partType) {
        if (!CostingViewMode || !IsLockTabInCBCCostingForCustomerRFQ) {
          let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 5, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)
          apiCalls.push({
            label: 'saveAssemblyPartRowCostingCalculation',
            call: () => new Promise((resolve) => {
              dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => resolve(res)));
            }),
          });
        }
      }
        try {
            for (const {call} of apiCalls) {
                await call()
            }
            Toaster.success(MESSAGES.TOOL_TAB_COSTING_SAVE_SUCCESS)
            dispatch(setComponentToolItemData({}, () => {}))
            dispatch(isToolDataChange(false));
            InjectDiscountAPICall()
        } catch (error) {
        }
    }
 
  }), 500);
  
  const InjectDiscountAPICall = () => {
    let basicRate = 0
    if (Number(isPartType?.value) === PART_TYPE_ASSEMBLY & !partType) {
      basicRate = checkForNull(RMCCTabData[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else if (partType) {
      let totalOverheadPrice = OverheadProfitTabData && (checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.OverheadCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ProfitCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.RejectionCost))
      basicRate = checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetTotalRMBOPCC) + checkForNull(totalOverheadPrice) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else {
      basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    }
    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, BasicRate: basicRate, CallingFrom: 5 }, (res) => {
      if (Number(previousTab) === 6) {
        dispatch(saveCostingPaymentTermDetail(PaymentTermDataDiscountTab, (res) => { }));
      }
    }));

  }


  const removeItems = (array, itemToRemove) => {
    // Determine the key to compare based on ProcessOrOperationType
    const compareKey = itemToRemove.ProcessOrOperationType === 'Operation' ? 'OperationChildIdRef' : 'ProcessIdRef';
    // Filter the array
    return array.filter(item => {
      // If the operation types don't match, keep the item
      if (item.ProcessOrOperationType !== itemToRemove.ProcessOrOperationType) return true;
      // If the ChildPartNumber doesn't match, keep the item
      if (item.ChildPartNumber !== itemToRemove.ChildPartNumber) return true;
      // If the ToolName doesn't match, keep the item
      if (item.ToolName !== itemToRemove.ToolName) return true;
      // If the relevant ID doesn't match or either is null, keep the item
      if (item[compareKey] !== itemToRemove[compareKey] || item[compareKey] === null || itemToRemove[compareKey] === null) return true;
      // Otherwise, filter the item out
      return false;
    });
  }

  const deleteItem = (index, data) => {
    const itemToDelete = data[index];
    const filteredList = removeItems(data, itemToDelete)
    setGridData(filteredList);
    setToolCost(filteredList, true);
  }


  const editItem = (index, data) => {
    let tempArr = data && data.find((el, i) => i === index)
    setEditIndex(index)
    setIsEditFlag(true)
    setRowObjData(tempArr)
    setDrawerOpen(true)
  }

  const buttonFormatter = (props) => {
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    const rowsToShowButtons = findRowsWithHighestBOMLevel(props?.agGridReact?.props?.rowData);
    const shouldShowButtons = rowsToShowButtons.has(props.rowIndex);
    return (
      <>
        {!shouldShowButtons && row?.PartType !== 'Component' && <div className={`${'lock_icon tooltip-n'}`} title='This part is already present at multiple level in this BOM. Please go to the lowest level to edit the data.'></div>}
        {((!CostingViewMode && !IsLockTabInCBCCostingForCustomerRFQ) && shouldShowButtons) && (
          <>
            <button
              title='Edit'
              className="Edit mr-2 align-middle"
              type={'button'}
              onClick={() => editItem(props?.rowIndex, props?.agGridReact?.props?.rowData)}
            />
            <button
              title='Delete'
              className="Delete align-middle"
              type={'button'}
              onClick={() => deleteItem(props?.rowIndex, props?.agGridReact?.props?.rowData)}
            />
          </>
        )}

      </>
    )
  }


  const decimalFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return checkForDecimalAndNull(cellValue, initialConfiguration?.NoOfDecimalForPrice)
  }
  const valueFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue ? checkForDecimalAndNull(cellValue, initialConfiguration?.NoOfDecimalForPrice) : '-'
  }
  const frameworkComponents = {
    customNoRowsOverlay: NoContentFound,
    totalValueRenderer: buttonFormatter,
    decimalFormatter: decimalFormatter,
    valueFormatter: valueFormatter
  };
  const onPageSizeChanged = (newPageSize) => {
    gridApi.paginationSetPageSize(Number(newPageSize));
  };

  // Function to generate a unique key and find rows with the highest BOMLevel for each unique combination
  const findRowsWithHighestBOMLevel = (data) => {
    const itemGroups = data.reduce((acc, item, index) => {
      // Determine the key based on ProcessOrOperationType
      const refId = item.ProcessOrOperationType === 'Operation' ? item.OperationChildIdRef : item.ProcessIdRef;
      const key = `${item.ChildPartNumber}-${refId}-${item.ToolName}`;

      const level = parseInt(item?.BOMLevel?.substring(1), 10); // Extract numerical part of BOMLevel

      if (!acc[key] || acc[key].highestLevel < level) {
        acc[key] = { highestIndex: index, highestLevel: level };
      }

      return acc;
    }, {});

    // Extract indices of items with the highest BOMLevel in their group
    return new Set(Object.values(itemGroups).map(group => group.highestIndex));
  };


  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    setEditIndex('')
    setRowObjData(gridData)
    setIsEditFlag(false)
    setDrawerOpen(true)
    dispatch(isToolDataChange(true))
  }

  const closeDrawer = (e = '', rowData = []) => {
    setLoader(true)

    if (rowData && rowData.length > 0) {
      if (editIndex !== '' && isEditFlag) {
        setGridData(rowData)
      } else {
        let tempArr = [...gridData, ...rowData]
        setGridData(tempArr)
      }
      dispatch(gridDataAdded(true))
    }
    setDrawerOpen(false)
    setTimeout(() => {

      setLoader(false)
    }, 200);
  }

  const disableToggle = (value) => {
    setDisableSwitch(value)
  }
  return (
    <>
      <div className="login-container signup-form">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">

              <Row className="m-0 py-3 costing-border border-bottom-0 align-items-center ">
                <Col md={IsApplicableProcessWise ? "4" : "9"} className="px-3 border-section">
                  <span className="d-inline-block pr-2 text-dark-blue">Applicability: </span>
                  <div className="switch d-inline-flex">
                    <label className="switch-level d-inline-flex w-auto">
                      <div className={"left-title ml-2 mr-1"}>{"Overall"}</div>
                      <span className="cr-sw-level h-auto">
                        <span className="d-inline-block" id="tooltab-switch">
                          <Switch
                            onChange={onPressApplicability}
                            checked={IsApplicableProcessWise}
                            id="normal-switch"
                            disabled={CostingViewMode || state.disableToggle || IsApplicableOverall || IsLockTabInCBCCostingForCustomerRFQ}
                            //disabled={true}
                            background="#4DC771"
                            onColor="#4DC771"
                            onHandleColor="#ffffff"
                            offColor="#CCC"
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={20}
                            width={46}
                            className="align-middle"
                          />
                        </span>
                      </span>
                      <div className={"right-title "}>{"Process Wise"}</div>
                    </label>
                  </div>
                </Col>
                <Col md={IsApplicableProcessWise ? "8" : "3"} className="border-section d-flex justify-content-between align-items-center text-dark-blue">
                  {IsApplicableProcessWise && <><div>
                    {"Net Tool Maintenance Cost (per pcs):"}
                    <span className="d-inline-block pl-1 font-weight-500">{checkForDecimalAndNull(state?.toolmaintenanceCostPerPc, initialConfiguration?.NoOfDecimalForPrice)}</span>
                  </div>
                    <div>
                      {"Net Tool Interest Cost (per pcs):"}
                      <span className="d-inline-block pl-1 font-weight-500">{checkForDecimalAndNull(state?.toolInterestCostPerPc, initialConfiguration?.NoOfDecimalForPrice)}</span>
                    </div>
                    <div>
                      {"Net Tool Amortization Cost :"}
                      <span className="d-inline-block pl-1 font-weight-500">{checkForDecimalAndNull(state?.toolAmortizationCost, initialConfiguration?.NoOfDecimalForPrice)}</span>
                    </div> </>}
                  <div>
                    {"Net Tool Cost:"}
                    {/* When Tool Cost Applicability is Overall.
                        ToolTabData?.[0]?.CostingPartDetails?.TotalToolCost used for Initial Page load.
                        netToolCostOverallApplicability is used when we save tool cost. 
                    */}
                    <span className="d-inline-block pl-1 font-weight-500">{checkForDecimalAndNull(IsApplicableProcessWise ? state?.netToolCost : netToolCostOverallApplicability ? netToolCostOverallApplicability : ToolTabData?.[0]?.CostingPartDetails?.TotalToolCost, initialConfiguration?.NoOfDecimalForPrice)}</span>
                  </div>
                  {IsApplicableProcessWise &&
                    <>
                      {(!CostingViewMode && !IsLockTabInCBCCostingForCustomerRFQ) && <button
                        type="button"
                        className={'user-btn tool-btn'}
                        onClick={DrawerToggle}
                      >
                        <div className={'plus'}></div>ADD TOOL</button>}
                    </>
                  }
                </Col>
              </Row>

              <form
                noValidate
                className="form costing-border border-top-0 px-3"
              >
                {!IsApplicableProcessWise &&
                  <Row>
                    <Col md="12">
                      <Table className="table cr-brdr-main" size="sm">
                        <tbody>
                          {ToolTabData && ToolTabData.map((item, index) => {
                            return (
                              <>
                                <tr>
                                  <td colSpan={2} className="cr-innerwrap-td pb-3">
                                    <div>
                                      <Tool
                                        index={index}
                                        IsApplicableProcessWise={IsApplicableProcessWise}
                                        data={item}
                                        // headCostRMCCBOPData={props.headCostRMCCBOPData}
                                        setOverAllApplicabilityCost={setOverAllApplicabilityCost}
                                        setToolCost={setToolCost}
                                        saveCosting={saveCosting}
                                        disableToggle={disableToggle}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              </>
                            );
                          })}
                        </tbody >
                      </Table >
                    </Col >
                  </Row >}

                {
                  loader ? <LoaderCustom /> :
                    IsApplicableProcessWise &&
                    <Row>
                      <Col>
                        {/* <----------------------START AG Grid convert on 21-10-2021---------------------------------------------> */}
                        <div className="ag-grid-react">
                          <div className={`ag-grid-wrapper height-width-wrapper ${gridData && gridData?.length <= 0 ? "overlay-contain" : ""}`}>
                            <div
                              className="ag-theme-material">
                              <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                // columnDefs={c}
                                rowData={gridData}
                                pagination={true}
                                paginationPageSize={defaultPageSize}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                loadingOverlayComponent={'customLoadingOverlay'}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{
                                  title: EMPTY_DATA,
                                  imagClass: 'imagClass'
                                }}
                                frameworkComponents={frameworkComponents}
                                suppressRowClickSelection={true}
                                rowSelection={'multiple'}
                              >
                                {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                                {/* <AgGridColumn field="ToolOperationId" headerName=" "></AgGridColumn> */}
                                {initialConfiguration?.IsShowCRMHead && <AgGridColumn field="ToolCRMHead" headerName="CRM Head"></AgGridColumn>}
                                <AgGridColumn field="BOMLevel" headerName="BOMLevel"></AgGridColumn>
                                <AgGridColumn field="ParentPartNumber" headerName="Parent Part Number" ></AgGridColumn>
                                <AgGridColumn field="ChildPartNumber" headerName="Child Part Number" ></AgGridColumn>
                                <AgGridColumn field="PartQuantity" headerName="Part Quantity" cellRenderer={'valueFormatter'}></AgGridColumn>
                                <AgGridColumn field="PartType" headerName="Part Type"></AgGridColumn>
                                <AgGridColumn field="ProcessOrOperation" headerName="Process/Operation" ></AgGridColumn>
                                <AgGridColumn field="ProcessOrOperationType" headerName="Process/Operation Type" ></AgGridColumn>
                                <AgGridColumn field="ProcessRunCount" headerName="Process Run Count" cellRenderer={'valueFormatter'}></AgGridColumn>
                                <AgGridColumn field="ToolCategory" headerName="Tool Category" ></AgGridColumn>
                                <AgGridColumn field="ToolName" headerName="Tool Name" ></AgGridColumn>
                                <AgGridColumn field="ToolCost" headerName="Tool Rate" cellRenderer={'decimalFormatter'}></AgGridColumn>
                                <AgGridColumn field="Life" headerName="Life/Amortization" cellRenderer={'valueFormatter'}></AgGridColumn>
                                <AgGridColumn field="ToolAmortizationCost" headerName="Tool Amortization Cost" cellRenderer={'valueFormatter'}></AgGridColumn>
                                <AgGridColumn field="ToolCostType" headerName="Tool Maintenance Applicability" ></AgGridColumn>
                                <AgGridColumn field="ToolMaintenancePercentage" headerName="Maintenance Tool Cost (%)" cellRenderer={'valueFormatter'}></AgGridColumn>
                                <AgGridColumn field="ToolApplicabilityCost" headerName="Cost (Applicability)" cellRenderer={'valueFormatter'}></AgGridColumn>
                                <AgGridColumn field="ToolMaintenanceCost" headerName={`${toolMaintenanceCostLabel}`} cellRenderer={'valueFormatter'}></AgGridColumn>
                                <AgGridColumn field="ToolMaintenanceCostPerPiece" headerName={`${toolMaintenanceCostPerPcLabel}`} cellRenderer={'valueFormatter'}></AgGridColumn>
                                <AgGridColumn field="ToolInterestRatePercent" headerName={`${toolInterestRatePercentLabel}`} cellRenderer={'valueFormatter'}></AgGridColumn>
                                <AgGridColumn field="ToolInterestCost" headerName={`${toolInterestCostLabel}`} cellRenderer={'valueFormatter'}></AgGridColumn>
                                <AgGridColumn field="ToolInterestCostPerPiece" headerName={`${toolInterestCostPerPcLabel}`} cellRenderer={'valueFormatter'}></AgGridColumn>
                                <AgGridColumn field="NetToolCost" headerName="Total Tool Cost" cellRenderer={'decimalFormatter'}></AgGridColumn>
                                <AgGridColumn width={160} field="Life" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" cellRenderer={'totalValueRenderer'}></AgGridColumn>
                              </AgGridReact>
                              {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                            </div>
                          </div>
                        </div>
                        {/* <--------------------AG Grid convert by 21-10-2021------> */}
                      </Col >
                    </Row >}

              </form >
            </div >
          </Col >
        </Row >
      </div >


      {(!CostingViewMode && !IsLockTabInCBCCostingForCustomerRFQ) && IsApplicableProcessWise &&
        <div className="col-sm-12 text-right bluefooter-butn btn-sticky-container">
          <button
            type={'button'}
            className="submit-button save-btn"
            onClick={saveCosting}
          >
            <div className={'save-icon'}></div>
            {'Save'}
          </button>
        </div>
      }

      {
        isDrawerOpen && <AddTool
          isOpen={isDrawerOpen}
          closeDrawer={closeDrawer}
          isEditFlag={isEditFlag}
          CostingViewMode={CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ}
          IsLockTabInCBCCostingForCustomerRFQ={IsLockTabInCBCCostingForCustomerRFQ} 
          ID={''}
          setToolCost={setToolCost}
          editIndex={editIndex}
          rowObjData={rowObjData}
          anchor={'right'}
          gridData={gridData}
        />
      }
    </>
  );
};

export default React.memo(TabToolCost);