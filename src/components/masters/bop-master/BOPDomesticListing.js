import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { EMPTY_DATA, BOP_MASTER_ID, BOPDOMESTIC, defaultPageSize, ENTRY_TYPE_DOMESTIC, FILE_URL, DRAFTID, ZBCTypeId } from '../../../config/constants';
import { getBOPDataList, deleteBOP } from '../actions/BoughtOutParts';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import DayTime from '../../common/DayTimeWrapper'
import BulkUpload from '../../massUpload/BulkUpload';
import { BOP_DOMESTIC_DOWNLOAD_EXCEl, } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import { getConfigurationKey, loggedInUserId, searchNocontentFilter, setLoremIpsum, showBopLabel, updateBOPValues, userDepartmetList } from '../../../helper';
import { BopDomestic, } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getListingForSimulationCombined, setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import WarningMessage from '../../common/WarningMessage';
import { hyphenFormatter } from '../masterUtil';
import { TourStartAction, disabledClass, useFetchAPICall } from '../../../actions/Common';
import _ from 'lodash';
import AnalyticsDrawer from '../material-master/AnalyticsDrawer';
import { reactLocalStorage } from 'reactjs-localstorage';
import { hideCustomerFromExcel, hideMultipleColumnFromExcel, hideColumnFromExcel, checkMasterCreateByCostingPermission } from '../../common/CommonFunctions';
import Attachament from '../../costing/components/Drawers/Attachament';
import Button from '../../layout/Button';
import { ApplyPermission } from ".";
import { useRef } from 'react';
import PaginationControls from '../../common/Pagination/PaginationControls';
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import { updatePageNumber, updatePageSize, updateCurrentRowIndex, updateGlobalTake, resetStatePagination } from '../../common/Pagination/paginationAction';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from '../../common/Tour/TourMessages';
import { useTranslation } from 'react-i18next';
import RfqMasterApprovalDrawer from '../material-master/RfqMasterApprovalDrawer';
import { useLabels, useWithLocalization } from '../../../helper/core';


const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};
const BOPDomesticListing = (props) => {

  const permissions = useContext(ApplyPermission);
  const dispatch = useDispatch();
  const searchRef = useRef(null);
  const { bopDomesticList, allBopDataList } = useSelector(state => state.boughtOutparts);
  const { initialConfiguration } = useSelector(state => state.auth);
  const { selectedRowForPagination } = useSelector(state => state.simulation)
  const { globalTakes } = useSelector((state) => state.pagination);
  const tourStartData = useSelector(state => state.comman.tourStartData);
  // const isRfq = props?.quotationId !== null || props?.quotationId !== '' || props?.quotationId !== undefined ? true : false
  const isRfq = props?.quotationId !== null && props?.quotationId !== '' && props?.quotationId !== undefined;

  const { t } = useTranslation("common")
  const { technologyLabel, vendorLabel } = useLabels();
  const [state, setState] = useState({
    isOpen: false,
    isEditFlag: false,
    tableData: [],
    isBulkUpload: false,
    shown: false,
    costingHead: [],
    BOPCategory: [],
    plant: [],
    vendor: [],
    gridApi: null,
    gridColumnApi: null,
    rowData: null,
    sideBar: { toolPanels: ['columns'] },
    showData: false,
    showPopup: false,
    deletedId: '',
    isLoader: true,
    disableFilter: true,
    disableDownload: false,
    dateArray: [],
    inRangeDate: [],
    analyticsDrawer: false,
    selectedRowData: [],
    floatingFilterData: { CostingHead: "", BoughtOutPartNumber: "", BoughtOutPartName: "", BoughtOutPartCategory: "", UOM: "", Specification: "", Plants: "", Vendor: "", BasicRate: "", NetLandedCost: "", EffectiveDate: "", DepartmentName: props.isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant ? userDepartmetList() : "", CustomerName: "", NumberOfPieces: "", NetCostWithoutConditionCost: "", NetConditionCost: "", IsBreakupBoughtOutPart: "", TechnologyName: "", SAPCode: "", Currency: "", ExchangeRateSourceName: "", OtherNetCost: "" },
    warningMessage: false,
    filterModel: {},
    // pageNo: 1,
    // pageNoNew: 1,
    totalRecordCount: 0,
    isFilterButtonClicked: false,
    // currentRowIndex: 0,
    // pageSize: { pageSize10: true, pageSize50: false, pageSize100: false },
    noData: false,
    dataCount: 0,
    attachment: false,
    viewAttachment: [],
    render: true,
    compareDrawer: false,
    rowDataForCompare: [],

  });





  useEffect(() => {
    setTimeout(() => {
      if (!props.stopApiCallOnCancel) {
        getDataList("", 0, "", "", 0, defaultPageSize, true, state.floatingFilterData);
      }
    }, 300);

    return () => {
      setTimeout(() => {
        if (!props.stopApiCallOnCancel) {
          dispatch(setSelectedRowForPagination([]));
          dispatch(resetStatePagination());

        }
      }, 300)
    };
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
  useEffect(() => {
    if (bopDomesticList?.length > 0) {
      setState((prevState) => ({ ...prevState, totalRecordCount: bopDomesticList[0].TotalRecordCount, isLoader: false, render: false }));
    }

    if (props.isSimulation) {
      props.callBackLoader(state.isLoader);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bopDomesticList]);

  const getDataList = (bopFor = '', CategoryId = 0, vendorId = '', plantId = '', skip = 0, take = 10, isPagination = true, dataObj, isReset = false) => {
    const { floatingFilterData } = state
    if (state.filterModel?.EffectiveDate && !isReset) {
      if (state.filterModel.EffectiveDate.dateTo) {
        let temp = []
        temp.push(DayTime(state.filterModel.EffectiveDate.dateFrom).format('DD/MM/YYYY'))
        temp.push(DayTime(state.filterModel.EffectiveDate.dateTo).format('DD/MM/YYYY'))
        dataObj.dateArray = temp
      }

    }
    let statusString = [props?.approvalStatus].join(",")
    const filterData = {
      ...floatingFilterData, bop_for: bopFor, category_id: CategoryId, vendor_id: vendorId, plant_id: plantId, ListFor: props.ListFor, IsBOPAssociated: props?.isBOPAssociated,
      StatusId: statusString
    }
    const { isMasterSummaryDrawer } = props

    if (props.isSimulation && props.selectionForListingMasterAPI === 'Combined') {
      props?.changeSetLoader(true)
      dispatch(getListingForSimulationCombined(props.objectForMultipleSimulation, BOPDOMESTIC, (res) => {
        props?.changeSetLoader(false)
        setState((prevState) => ({ ...prevState, isLoader: false }))
      }))
    } else {
      setState((prevState) => ({ ...prevState, isLoader: isPagination ? true : false }))
      if (isMasterSummaryDrawer !== undefined && !isMasterSummaryDrawer) {
        if (props.isSimulation) {
          props?.changeTokenCheckBox(false)
        }
        dataObj.EntryType = Number(ENTRY_TYPE_DOMESTIC)
        dataObj.Currency = floatingFilterData?.Currency
        dataObj.ExchangeRateSourceName = floatingFilterData?.ExchangeRateSourceName
        dataObj.OtherNetCost = floatingFilterData?.OtherNetCost
        dispatch(getBOPDataList(filterData, skip, take, isPagination, dataObj, false, (res) => {


          setState((prevState) => ({ ...prevState, isLoader: false, noData: false }))
          if (props.isSimulation) {
            props?.changeTokenCheckBox(true)
          }
          if (res && res.status === 200) {
            let Data = res.data.DataList;
            setState((prevState) => ({ ...prevState, tableData: Data }))
          } else if (res && res.response && res.response.status === 412) {
            setState((prevState) => ({ ...prevState, tableData: [] }))

          } else {
            setState((prevState) => ({ ...prevState, tableData: [] }))
          }

          if (res && res.status === 204) {
            setState((prevState) => ({
              ...prevState, totalRecordCount: 0,
              // pageNo: 0
            }))
            dispatch(updatePageNumber(0))
          }

          if (res && isPagination === false) {
            setState((prevState) => ({ ...prevState, disableDownload: false }))
            setTimeout(() => {
              dispatch(disabledClass(false))
              let button = document.getElementById('Excel-Downloads-bop-domestic')
              button && button.click()
            }, 500);
          }

          if (res) {
            if (res && res.data && res.data.DataList.length > 0) {
              setState((prevState) => ({ ...prevState, totalRecordCount: res.data.DataList[0].TotalRecordCount }))
            }
            let isReset = true
            setTimeout(() => {
              for (var prop in floatingFilterData) {

                if (prop !== "DepartmentName" && prop !== 'EntryType' && floatingFilterData[prop] !== "") {
                  isReset = false
                }

              }
              isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(state.filterModel))
            }, 300);
            setTimeout(() => {
              setState((prevState) => ({ ...prevState, warningMessage: false }))
            }, 335);

            setTimeout(() => {
              setState((prevState) => ({ ...prevState, isFilterButtonClicked: false }))
            }, 600);
          }
        }))
      } else {
        setState((prevState) => ({ ...prevState, isLoader: false }))
      }

    }
  }
  const onFloatingFilterChanged = (value) => {
    let originalValue;
    setTimeout(() => {
      if (bopDomesticList?.length !== 0) {
        setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData), }));
      }
    }, 500);
    setState((prevState) => ({ ...prevState, disableFilter: false }));
    const model = gridOptions?.api?.getFilterModel();

    setState((prevState) => ({ ...prevState, filterModel: model }));
    if (!state.isFilterButtonClicked) {
      setState((prevState) => ({ ...prevState, warningMessage: true }));
    }

    if (
      value?.filterInstance?.appliedModel === null ||
      value?.filterInstance?.appliedModel?.filter === ""
    ) {
      let isFilterEmpty = true;

      if (model !== undefined && model !== null) {
        if (Object.keys(model).length > 0) {
          isFilterEmpty = false;

          for (var property in state.floatingFilterData) {
            if (property === value.column.colId) {
              state.floatingFilterData[property] = "";
            }
          }

          setState((prevState) => ({ ...prevState, floatingFilterData: state.floatingFilterData, }));
        }

        if (isFilterEmpty) {
          setState((prevState) => ({ ...prevState, warningMessage: false }));
          for (var prop in state.floatingFilterData) {
            state.floatingFilterData[prop] = "";
          }
          setState((prevState) => ({ ...prevState, floatingFilterData: state.floatingFilterData, }));
        }
      }
    } else {
      if (
        value.column.colId === "EffectiveDate" ||
        value.column.colId === "CreatedDate"
      ) {
        return false;
      }
      setState((prevState) => ({ ...prevState, floatingFilterData: { ...prevState.floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter, }, }));
    }
    if (value.column.colId === "BasicRate") {
      originalValue = getOriginalBasicRate(value.filterInstance.appliedModel.filter);
    } else if (value.column.colId === "NetCostWithoutConditionCost") {
      originalValue = getOriginalNetCostWithoutConditionCost(value.filterInstance.appliedModel.filter);
    } else if (value.column.colId === "NetLandedCost") {
      originalValue = getOriginalNetLandedCost(value.filterInstance.appliedModel.filter);
    }
    if (originalValue !== undefined) {
      setState((prevState) => ({
        ...prevState, floatingFilterData: { ...prevState.floatingFilterData, [value.column.colId]: originalValue, },
      }));
    }

  };
  const getTolerance = () => {
    const noOfDecimalForPrice = getConfigurationKey()?.NoOfDecimalForPrice;
    if (noOfDecimalForPrice !== undefined) {
      // Tolerance should be half of the least significant digit 
      return 0.5 * Math.pow(10, -noOfDecimalForPrice);
    }
    return 0;
  };

  const getOriginalBasicRate = (filteredText) => {
    const parsedFilterText = parseFloat(filteredText);
    const tolerance = getTolerance();
    const originalData = bopDomesticList.find((item) => {
      if (item.OriginalBasicRate !== null) {
        const roundedOriginal = parseFloat(item.OriginalBasicRate.toFixed(getConfigurationKey()?.NoOfDecimalForPrice));
        return Math.abs(roundedOriginal - parsedFilterText) <= tolerance;
      }
      // Skip this iteration if the value is null
      return false;
    });
    return originalData ? originalData.OriginalBasicRate : filteredText;
  };
  const getOriginalNetLandedCost = (filteredText) => {
    const parsedFilterText = parseFloat(filteredText);
    const tolerance = getTolerance();
    const originalData = bopDomesticList.find((item) => {
      if (item.OriginalNetLandedCost !== null) {
        const roundedOriginal = parseFloat(item.OriginalNetLandedCost.toFixed(getConfigurationKey()?.NoOfDecimalForPrice));
        return Math.abs(roundedOriginal - parsedFilterText) <= tolerance;
      }
      // Skip this iteration if the value is null
      return false;
    });
    return originalData ? originalData.OriginalNetLandedCost : filteredText;
  };

  const getOriginalNetCostWithoutConditionCost = (filteredText) => {
    const parsedFilterText = parseFloat(filteredText);
    const tolerance = getTolerance();

    // Find the first non-null item that matches the criteria
    const originalItem = bopDomesticList.find((item) => {
      // Continue if the original value is not null
      if (item.OriginalNetCostWithoutConditionCost !== null) {
        const roundedOriginal = parseFloat(item.OriginalNetCostWithoutConditionCost.toFixed(getConfigurationKey()?.NoOfDecimalForPrice));
        return Math.abs(roundedOriginal - parsedFilterText) <= tolerance;
      }
      // Skip this iteration if the value is null
      return false;
    });

    // Return either the found original value as a string or the input filtered text
    return originalItem ? originalItem.OriginalNetCostWithoutConditionCost : filteredText;
  };



  const onSearch = () => {
    setState((prevState) => ({
      ...prevState, warningMessage: false,
      // pageNo: 1, pageNoNew: 1,currentRowIndex: 0,
    }));
    dispatch(updateCurrentRowIndex(0));
    dispatch(updatePageNumber(1));
    getDataList("", 0, "", "", 0, globalTakes, true, state.floatingFilterData);
  };

  const resetState = () => {
    setState((prevState) => ({ ...prevState, noData: false, inRangeDate: [], isFilterButtonClicked: false }));
    state.gridApi.setQuickFilter(null)
    state.gridApi.deselectAll();
    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null);
    for (var prop in state.floatingFilterData) {
      state.floatingFilterData[prop] = "";
    }
    setState((prevState) => ({
      ...prevState, floatingFilterData: state.floatingFilterData, warningMessage: false,
      //  pageNo: 1, pageNoNew: 1, currentRowIndex: 0,
    }));
    dispatch(updateCurrentRowIndex(0));
    dispatch(updatePageNumber(1));
    getDataList("", 0, "", "", 0, 10, true, state.floatingFilterData);
    dispatch(setSelectedRowForPagination([]));
    setState((prevState) => ({
      ...prevState,
      // globalTake: 10,
      dataCount: 0,
      // pageSize: { ...prevState.pageSize, pageSize10: true, pageSize50: false, pageSize100: false, },
    }));
    dispatch(updateGlobalTake(10));
    dispatch(updatePageSize({ pageSize10: true, pageSize50: false, pageSize100: false }));
    if (searchRef.current) {
      searchRef.current.value = '';
    }
  };

  /**
  * @method editItemDetails
  * @description edit material type
  */
  const viewOrEditItemDetails = (Id, rowData, isViewMode) => {
    let data = { isEditFlag: true, Id: Id, IsVendor: rowData.CostingHead, isViewMode: isViewMode, costingTypeId: rowData.CostingTypeId, showPriceFields: rowData.StatusId !== DRAFTID, }
    props.getDetails(data, rowData?.IsBOPAssociated);
  }

  /**
  * @method deleteItem
  * @description confirm delete Raw Material details
  */
  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }))
  }
  /**
  * @method confirmDelete
  * @description confirm delete Raw Material details
  */
  const confirmDelete = (ID) => {
    const loggedInUser = loggedInUserId()
    dispatch(deleteBOP(ID, loggedInUser, (res) => {
      if (res.data.Result === true) {
        Toaster.success(MESSAGES.BOP_DELETE_SUCCESS);
        resetState()
      }
    }));
    setState((prevState) => ({ ...prevState, showPopup: false }))
  }
  const onPopupConfirm = () => {
    confirmDelete(state.deletedId);
  }
  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false }))
  }

  const bulkToggle = () => {
    if (checkMasterCreateByCostingPermission(true)) {
      setState((prevState) => ({ ...prevState, isBulkUpload: true }))
    }
  }

  const closeBulkUploadDrawer = (event, type) => {
    setState((prevState) => ({ ...prevState, isBulkUpload: false }))
    if (type !== 'cancel') {
      resetState()
    }
  }

  const showAnalytics = (cell, rowData) => {
    setState((prevState) => ({ ...prevState, selectedRowData: rowData, analyticsDrawer: true }))
  }
  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  const { benchMark, isMasterSummaryDrawer } = props
  const buttonFormatter = (props) => {

    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    let isEditbale = false
    let isDeleteButton = false
    if (permissions?.Edit) {
      isEditbale = true
    } else {
      isEditbale = false
    }


    if (isRfq && isMasterSummaryDrawer) {
      return (
        <button className="Balance mb-0 button-stick" type="button" onClick={() => handleCompareDrawer(rowData)}>

        </button>
      );
    }
    if (tourStartData.showExtraData && props.rowIndex === 0) {
      isDeleteButton = true
    } else {
      if (permissions?.Delete && !rowData.IsBOPAssociated) {
        isDeleteButton = true
      }
    }
    return (
      <>
        <Button id={`bopDomesticListing_movement${props.rowIndex}`} className={"mr-1 Tour_List_Cost_Movement"} variant="cost-movement" onClick={() => showAnalytics(cellValue, rowData)} title={"Cost Movement"} />

        {(!benchMark) && (
          <>
            {permissions?.View && <Button id={`bopDomesticListing_view${props.rowIndex}`} className={"mr-1 Tour_List_View"} variant="View" onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} title={"View"} />}
            {isEditbale && <Button id={`bopDomesticListing_edit${props.rowIndex}`} className={"mr-1 Tour_List_Edit"} variant="Edit" onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} title={"Edit"} />}
            {isDeleteButton && <Button id={`bopDomesticListing_delete${props.rowIndex}`} className={"mr-1 Tour_List_Delete"} variant="Delete" onClick={() => deleteItem(cellValue)} title={"Delete"} />}
          </>
        )}

      </>
    )
  };

  const handleCompareDrawer = (data) => {

    setState((prevState) => ({ ...prevState, compareDrawer: true, rowDataForCompare: [data] }))
  }

  /**
      * @method commonCostFormatter
      * @description Renders buttons
      */
  const commonCostFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell ? cell : '-';
  }
  /**
  * @method costingHeadFormatter
  * @description Renders Costing head
  */
  const costingHeadFormatter = (props) => {
    let cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    if (cellValue === true) {
      cellValue = "Vendor Based";
    } else if (cellValue === false) {
      cellValue = 'Zero Based'
    }
    if (selectedRowForPagination?.length > 0) {
      selectedRowForPagination.map((item) => {
        if (item.BoughtOutPartId === props.node.data.BoughtOutPartId) {
          props.node.setSelected(true)
        }
        return null
      })
      return cellValue
    } else {
      return cellValue
    }

  }
  const viewAttachmentData = (index) => {
    setState((prevState) => ({ ...prevState, viewAttachment: index, attachment: true }))
  }
  const closeAttachmentDrawer = (e = '') => {
    setState((prevState) => ({ ...prevState, attachment: false }))
  }
  const attachmentFormatter = (props) => {
    const row = props?.data;
    let files = row?.Attachements
    if (files && files?.length === 0) {
      return '-'
    }

    return (
      <>
        <div className={"attachment images"}>
          {files && files.length === 1 ?
            files.map((f) => {
              const withOutTild = f.FileURL?.replace("~", "");
              const fileURL = `${FILE_URL}${withOutTild}`;
              return (
                <a href={fileURL} target="_blank" rel="noreferrer">
                  {f.OriginalFileName}
                </a>
              )
            }) :
            <button type='button' title='View Attachment' className='btn-a pl-0' onClick={() => viewAttachmentData(row)}                        >View Attachment</button>
            //  <Button
            //     type='button'
            //     id='bopDomesticListing_btnViewAttachment'
            //      title='View Attachment'
            //      className='btn-a pl-0'
            //      onClick={() => viewAttachmentData(row)}
            //      buttonName={'View Attachment'}/>
          }
        </div>
      </>
    )

  }
  const closeCompareDrawer = (event, type) => {
    setState((prevState) => ({ ...prevState, compareDrawer: false }));
    if (type !== 'cancel') {
      resetState()
    }
  }
  const formToggle = () => {
    if (checkMasterCreateByCostingPermission()) {
      props.displayForm()
    }
  }

  /**
      * @method effectiveDateFormatter
      * @description Renders buttons
      */
  const effectiveDateFormatter = (props) => {
    if (tourStartData?.showExtraData && props?.rowIndex === 0) {
      return "Lorem Ipsum";
    } else {
      const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
      return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }
  }
  const onGridReady = (params) => {
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
    params.api.paginationGoToPage(0);
    const checkBoxInstance = document.querySelectorAll('.ag-input-field-input.ag-checkbox-input');
    checkBoxInstance.forEach((checkBox, index) => {
      const specificId = `BOP_Domestic_Checkbox${index / 11}`;
      checkBox.id = specificId;
    })
    const floatingFilterInstances = document.querySelectorAll('.ag-input-field-input.ag-text-field-input');
    floatingFilterInstances.forEach((floatingFilter, index) => {
      const specificId = `BOP_Domestic_Floating${index}`;
      floatingFilter.id = specificId;
    });
  };
  /**
           * @method toggleExtraData
           * @description Handle specific module tour state to display lorem data
           */
  const toggleExtraData = (showTour) => {
    dispatch(TourStartAction({
      showExtraData: showTour,
    }));
    setState((prevState) => ({ ...prevState, render: true }));
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, render: false }));
    }, 100);

  }

  const onExcelDownload = () => {
    setState((prevState) => ({ ...prevState, disableDownload: true }))
    dispatch(disabledClass(true))

    //let tempArr = state.gridApi && state.gridApi?.getSelectedRows()
    let tempArr = selectedRowForPagination
    if (tempArr?.length > 0) {
      setTimeout(() => {
        setState((prevState) => ({ ...prevState, disableDownload: false }))
        dispatch(disabledClass(false))
        let button = document.getElementById('Excel-Downloads-bop-domestic')
        button && button.click()
      }, 400);

    } else {

      getDataList("", 0, "", "", 0, defaultPageSize, false, state.floatingFilterData)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }
  }
  const BOP_DOMESTIC_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(BOP_DOMESTIC_DOWNLOAD_EXCEl, "MasterLabels")

  const onBtExport = () => {
    const bopMasterName = showBopLabel();
    let tempArr = []
    //tempArr = state.gridApi && state.gridApi?.getSelectedRows()
    tempArr = selectedRowForPagination
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (allBopDataList ? allBopDataList : [])
    const { updatedLabels } = updateBOPValues(BOP_DOMESTIC_DOWNLOAD_EXCEl_LOCALIZATION, [], bopMasterName, 'label')
    const filteredLabels = updatedLabels.filter(column => {
      if (column.value === "NetConditionCost" || column.value === "NetCostWithoutConditionCost") {
        return initialConfiguration?.IsBasicRateAndCostingConditionVisible && ((props.isMasterSummaryDrawer && bopDomesticList[0]?.CostingTypeId === ZBCTypeId) || !props.isMasterSummaryDrawer)
      }
      if (column.value === "CustomerName") {
        return reactLocalStorage.getObject('CostingTypePermission').cbc
      }
      if (column.value === "NumberOfPieces") {
        return getConfigurationKey().IsMinimumOrderQuantityVisible
      }
      if (column.value === "SAPCode") {
        return getConfigurationKey().IsSAPCodeRequired
      }
      if (column.value === "ExchangeRateSourceName") {
        return getConfigurationKey().IsSourceExchangeRateNameVisible
      }
      return true;
    })
    return returnExcelColumn(filteredLabels, tempArr)
  };

  const returnExcelColumn = (data = [], TempData) => {
    let temp = []
    let tempData = [...data]
    const bopMasterName = showBopLabel();

    tempData = hideCustomerFromExcel(tempData, "CustomerName")
    if (!getConfigurationKey().IsMinimumOrderQuantityVisible) {
      tempData = hideColumnFromExcel(tempData, 'Quantity')
    } else if (!getConfigurationKey().IsBasicRateAndCostingConditionVisible) {
      tempData = hideMultipleColumnFromExcel(tempData, ["NetConditionCost", "NetCostWithoutConditionCost"])
    } else if (!getConfigurationKey()?.IsBoughtOutPartCostingConfigured) {
      tempData = hideMultipleColumnFromExcel(tempData, ["IsBreakupBoughtOutPart", "TechnologyName"])
    } else if (!reactLocalStorage.getObject('CostingTypePermission').cbc) {
      tempData = hideColumnFromExcel(tempData, 'CustomerName')
    } else {
      tempData = data
    }
    if (!getConfigurationKey().IsSAPCodeRequired) {
      tempData = hideColumnFromExcel(tempData, "SAPCode")
    }
    temp = TempData && TempData.map((item) => {
      if (item.Plants === '-') {
        item.Plants = ' '
      } if (item.Vendor === '-') {
        item.Vendor = ' '
      }
      if (item.EffectiveDate?.includes('T')) {
        item.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY')
      }
      if (item === 'BOP' || item === 'BoughtOutPart') {
        item.label = bopMasterName;
      }

      // Check for empty fields and replace with hyphen
      for (const key in item) {
        if (item[key] === null || item[key] === undefined || item[key] === "") {
          item[key] = "-"; // Set to hyphen if data is not available
        }
      }
      return item;
    })

    return (
      <ExcelSheet data={temp} name={BopDomestic}>
        {tempData && tempData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }

  const onFilterTextBoxChanged = (e) => {
    state.gridApi.setQuickFilter(e.target.value);
  }
  const { isBulkUpload, noData } = state;
  var filterParams = {
    date: "", inRangeInclusive: true, filterOptions: ['equals', 'inRange'],
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
      var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
      handleDate(newDate)// FOR COSTING BENCHMARK BOP REPORT
      let date = document.getElementsByClassName('ag-input-field-input')
      for (let i = 0; i < date.length; i++) {
        if (date[i].type == 'radio') {
          date[i].click()
        }
      }

      setDate(newDate)
      if (dateAsString == null) return -1;
      var dateParts = dateAsString.split('/');
      var cellDate = new Date(
        Number(dateParts[2]),
        Number(dateParts[1]) - 1,
        Number(dateParts[0])
      );
      if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        return 0;
      }
      if (cellDate < filterLocalDateAtMidnight) {
        return -1;
      }
      if (cellDate > filterLocalDateAtMidnight) {
        return 1;
      }
    },

    browserDatePicker: true,
    minValidYear: 2000,

  };

  var setDate = (date) => {
    setState((prevState) => ({ ...prevState, floatingFilterData: { ...prevState.floatingFilterData, newDate: date }, }));
  };

  var handleDate = (newDate) => {
    let temp = state.inRangeDate
    temp.push(newDate)
    setState((prevState) => ({ ...prevState, inRangeDate: temp }))
    if (props?.benchMark) {
      props?.handleDate(state.inRangeDate)
    }
    setTimeout(() => {
      var y = document.getElementsByClassName('ag-radio-button-input');
      var radioBtn = y[0];
      radioBtn?.click()

    }, 300);
  }
  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;
    if (props?.isMasterSummaryDrawer) {
      return false
    } else {
      return thisIsFirstColumn;
    }

  }
  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    headerCheckboxSelectionFilteredOnly: true,
    headerCheckboxSelection: (props.isSimulation || props.benchMark) ? isFirstColumn : false,
    checkboxSelection: isFirstColumn
  };

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    customNoRowsOverlay: NoContentFound,
    hyphenFormatter: hyphenFormatter,
    costingHeadFormatter: costingHeadFormatter,
    effectiveDateFormatter: effectiveDateFormatter,
    // checkBoxRenderer: checkBoxRenderer,
    commonCostFormatter: commonCostFormatter,
    attachmentFormatter: attachmentFormatter,
  };

  const closeAnalyticsDrawer = () => {
    setState((prevState) => ({ ...prevState, analyticsDrawer: false }))
  }
  const onRowSelect = (event) => {
    var selectedRows = state.gridApi.getSelectedRows();
    if (selectedRows === undefined || selectedRows === null) {   //CONDITION FOR FIRST RENDERING OF COMPONENT
      selectedRows = selectedRowForPagination
    } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {   // CHECKING IF REDUCER HAS DATA
      let finalData = []
      if (event.node.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED
        for (let i = 0; i < selectedRowForPagination.length; i++) {
          if (selectedRowForPagination[i].BoughtOutPartId === event.data.BoughtOutPartId) {     // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
            continue;
          } finalData.push(selectedRowForPagination[i])
        }
      } else { finalData = selectedRowForPagination }
      selectedRows = [...selectedRows, ...finalData]
    }
    let uniqeArray = _.uniqBy(selectedRows, "BoughtOutPartId")           //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
    dispatch(setSelectedRowForPagination(uniqeArray))
    const newDataCount = uniqeArray.length;
    setState((prevState) => ({ ...prevState, dataCount: newDataCount }))
    let finalArr = selectedRows
    let length = finalArr?.length
    let uniqueArray = _.uniqBy(finalArr, "BoughtOutPartId")
    if (props.isSimulation) {
      props.apply(uniqueArray, length)
    }
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows }))
    if (props?.benchMark) {
      let uniqueArrayNew = _.uniqBy(uniqueArray, "CategoryId");
      if (uniqueArrayNew.length > 1) {
        dispatch(setSelectedRowForPagination([]));
        state.gridApi.deselectAll();
        Toaster.warning("Please select multiple bop's with same category");
      }
    }
  }

  return (
    <div className={`ag-grid-react ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${permissions?.Download ? "show-table-btn" : ""} ${props.isSimulation ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
      {(state.isLoader && !props.isMasterSummaryDrawer) && <LoaderCustom customClass="simulation-Loader" />}
      {state.disableDownload && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />}
      <form noValidate >
        <Row className={`${props?.isMasterSummaryDrawer ? '' : 'pt-4'} ${props?.benchMark ? 'zindex-2' : 'filter-row-large'}  ${props.isSimulation ? 'simulation-filter zindex-0 ' : ''}`}>
          <Col md="3" lg="3">
            <input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
            {(!props.isSimulation && !props.benchMark && !props?.isMasterSummaryDrawer) && (<TourWrapper
              buttonSpecificProp={{ id: "BOP_Domestic_Listing_Tour", onClick: toggleExtraData }}
              stepsSpecificProp={{
                steps: Steps(t, { addLimit: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
              }} />)}
          </Col>
          <Col md="9" lg="9" className="mb-3">
            <div className="d-flex justify-content-end bd-highlight w100">
              {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) && (
                <>
                  <div className="warning-message d-flex align-items-center">
                    {state.warningMessage && !state.disableDownload && (
                      <>
                        <WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} />
                        <div className='right-hand-arrow mr-2'></div>
                      </>
                    )}
                  </div>
                  <Button id="bopDomesticListing_filter" className={"mr5 Tour_List_Filter"} onClick={() => onSearch()} title={"Filtered data"} icon={"filter"} disabled={state.disableFilter} />
                  {permissions?.Add && (
                    <Button id="bopDomesticListing_add" className={"mr5 Tour_List_Add"} onClick={formToggle} title={"Add"} icon={"plus"} />
                  )}
                  {permissions?.BulkUpload && (
                    <Button id="bopDomesticListing_bulkUpload" className={"mr5 Tour_List_BulkUpload"} onClick={bulkToggle} title={"Bulk Upload"} icon={"upload"} />
                  )}
                  {permissions?.Download && (
                    <>
                      <Button className="mr5 Tour_List_Download" id={"bopDomesticListing_excel_download"} onClick={onExcelDownload} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />
                      <ExcelFile filename={`${showBopLabel()} Domestic`} fileExtension={'.xls'} element={<Button id={"Excel-Downloads-bop-domestic"} className="p-absolute" />}>
                        {onBtExport()}
                      </ExcelFile>
                    </>
                  )}
                </>
              )}
              <Button id={"bopDomesticListing_refresh"} className={"Tour_List_Reset"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
            </div>
          </Col>
        </Row>

      </form >

      <Row>
        <Col>

          <div className={`ag-grid-wrapper ${props?.isDataInMaster && !noData ? 'master-approval-overlay' : ''} ${(bopDomesticList && bopDomesticList?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
            <div className={`ag-theme-material p-relative ${(state.isLoader && !props.isMasterSummaryDrawer) && "max-loader-height"}`}>
              {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found bop-drawer" />}
              {(state.render || state.isLoader) ? <LoaderCustom customClass="loader-center" /> : <AgGridReact

                defaultColDef={defaultColDef}
                floatingFilter={true}
                domLayout='autoHeight'
                rowData={tourStartData.showExtraData && bopDomesticList ? [...setLoremIpsum(bopDomesticList[0]), ...bopDomesticList] : bopDomesticList}

                pagination={true}
                paginationPageSize={globalTakes}
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                noRowsOverlayComponent={'customNoRowsOverlay'}
                noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
                frameworkComponents={frameworkComponents}
                rowSelection={'multiple'}
                //onSelectionChanged={onRowSelect}
                onRowSelected={onRowSelect}
                onFilterModified={onFloatingFilterChanged}
                suppressRowClickSelection={true}
                enableBrowserTooltips={true}  >
                <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                <AgGridColumn field="BoughtOutPartNumber" headerName={`${showBopLabel()} Part No.`}></AgGridColumn>
                <AgGridColumn field="BoughtOutPartName" headerName={`${showBopLabel()} Part Name`}></AgGridColumn>
                <AgGridColumn field="BoughtOutPartCategory" headerName={`${showBopLabel()} Category`}></AgGridColumn>
                <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                <AgGridColumn field="Specification" headerName="Specification" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                {getConfigurationKey().IsSAPCodeRequired && <AgGridColumn field="SAPPartNumber" headerName="SAP Code" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                <AgGridColumn field="Plants" cellRenderer={'hyphenFormatter'} headerName="Plant (Code)"></AgGridColumn>
                <AgGridColumn field="Vendor" headerName={`${vendorLabel} (Code)`} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                {reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                {/* <AgGridColumn field="DepartmentName" headerName="Department"></AgGridColumn> */}
                {props?.isMasterSummaryDrawer && <AgGridColumn field="IncoSummary" headerName="Inco Terms"></AgGridColumn>}
                {props?.isMasterSummaryDrawer && getConfigurationKey().IsShowPaymentTermsFields && <AgGridColumn field="PaymentSummary" headerName="Payment Terms"></AgGridColumn>}
                {getConfigurationKey().IsMinimumOrderQuantityVisible && <AgGridColumn field="NumberOfPieces" headerName="Minimum Order Quantity"></AgGridColumn>}
                {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn field="ExchangeRateSourceName" headerName="Exchange Rate Source"></AgGridColumn>}
                <AgGridColumn field="Currency" headerName="Currency"></AgGridColumn>
                <AgGridColumn field="BasicRate" headerName="Basic Rate" cellRenderer={'commonCostFormatter'} ></AgGridColumn>
                <AgGridColumn field="OtherNetCost" headerName='Other Net Cost' cellRenderer='commonCostFormatter'></AgGridColumn>

                {/* {initialConfiguration?.IsBasicRateAndCostingConditionVisible && ((props.isMasterSummaryDrawer && bopDomesticList[0]?.CostingTypeId === ZBCTypeId) || !props.isMasterSummaryDrawer) && <AgGridColumn field="NetCostWithoutConditionCost" headerName="Basic Price" cellRenderer={'commonCostFormatter'} ></AgGridColumn>} */}
                {initialConfiguration?.IsBasicRateAndCostingConditionVisible && ((props.isMasterSummaryDrawer && bopDomesticList[0]?.CostingTypeId === ZBCTypeId) || !props.isMasterSummaryDrawer) && <AgGridColumn field="NetConditionCost" headerName="Net Condition Cost" cellRenderer={'commonCostFormatter'} ></AgGridColumn>}

                <AgGridColumn field="NetLandedCost" headerName="Net Cost" cellRenderer={'commonCostFormatter'} ></AgGridColumn>
                {initialConfiguration?.IsBoughtOutPartCostingConfigured && <AgGridColumn field="IsBreakupBoughtOutPart" headerName={`Detailed ${showBopLabel()}`}></AgGridColumn>}
                {initialConfiguration?.IsBoughtOutPartCostingConfigured && <AgGridColumn field="TechnologyName" headerName={technologyLabel} cellRenderer={'hyphenFormatter'} ></AgGridColumn>}
                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter" filterParams={filterParams} ></AgGridColumn>
                {((!props?.isSimulation && !props?.isMasterSummaryDrawer) || (isRfq && props?.isMasterSummaryDrawer)) && <AgGridColumn field="BoughtOutPartId" width={170} pinned="right" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                {props.isMasterSummaryDrawer && <AgGridColumn field="Attachements" headerName='Attachments' cellRenderer={'attachmentFormatter'}></AgGridColumn>}
                {props.isMasterSummaryDrawer && <AgGridColumn field="Remark" tooltipField="Remark" ></AgGridColumn>}
              </AgGridReact>}
              <div className={`button-wrapper ${props?.isMasterSummaryDrawer ? 'mb-5' : ''}`}>
                {!state.isLoader && !props.isMasterSummaryDrawer &&
                  <PaginationWrappers gridApi={state.gridApi} totalRecordCount={state.totalRecordCount} getDataList={getDataList} floatingFilterData={state.floatingFilterData} module="BOP" />}
                <PaginationControls totalRecordCount={state.totalRecordCount} getDataList={getDataList} floatingFilterData={state.floatingFilterData} module="BOP" />
              </div>
            </div>
          </div>
        </Col>
      </Row>
      {isBulkUpload && <BulkUpload isOpen={isBulkUpload} closeDrawer={closeBulkUploadDrawer} isEditFlag={false} fileName={`${showBopLabel()} Domestic`} isZBCVBCTemplate={true} messageLabel={`${showBopLabel()} Domestic`} anchor={'right'} masterId={BOP_MASTER_ID} typeOfEntryId={ENTRY_TYPE_DOMESTIC} />}
      {state.analyticsDrawer && <AnalyticsDrawer isOpen={state.analyticsDrawer} ModeId={2} closeDrawer={closeAnalyticsDrawer} anchor={"right"} isReport={state.analyticsDrawer} selectedRowData={state.selectedRowData} isSimulation={true} rowData={state.selectedRowData} />}
      {state.attachment && (<Attachament isOpen={state.attachment} index={state.viewAttachment} closeDrawer={closeAttachmentDrawer} anchor={'right'} gridListing={true} />)}
      {state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.BOP_DELETE_ALERT}`} />}
      {initialConfiguration?.IsBoughtOutPartCostingConfigured && !props.isSimulation && initialConfiguration.IsMasterApprovalAppliedConfigure && !props.isMasterSummaryDrawer && <WarningMessage dClass={'w-100 justify-content-end'} message={`${MESSAGES.BOP_BREAKUP_WARNING}`} />}
      {
        state.compareDrawer &&
        <RfqMasterApprovalDrawer
          isOpen={state.compareDrawer}
          anchor={'right'}
          selectedRows={props.bopDataResponse}
          type={'Bought Out Part'}
          quotationId={props.quotationId}
          closeDrawer={closeCompareDrawer}
        // selectedRow = {props.bopDataResponse}
        />

      }
    </div >


  );
};

export default BOPDomesticListing;
