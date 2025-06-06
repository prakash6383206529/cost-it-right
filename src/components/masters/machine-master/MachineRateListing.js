import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { defaultPageSize, EMPTY_DATA, MACHINERATE, MACHINE_MASTER_ID, FILE_URL, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT } from '../../../config/constants';
import { getMachineDataList, deleteMachine, copyMachine, getProcessGroupByMachineId } from '../actions/MachineMaster';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import BulkUpload from '../../massUpload/BulkUpload';
import { MACHINERATE_DOWNLOAD_EXCEl } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import DayTime from '../../common/DayTimeWrapper'
import { MachineRate } from '../../../config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrapper } from '../../common/commonPagination'
import { loggedInUserId, getConfigurationKey, userDepartmetList, searchNocontentFilter, setLoremIpsum, showEntryType, getLocalizedCostingHeadValue } from '../../../helper'
import { getListingForSimulationCombined } from '../../simulation/actions/Simulation';
import ProcessGroupDrawer from './ProcessGroupDrawer'
import WarningMessage from '../../common/WarningMessage';
import _ from 'lodash';
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import PaginationControls from '../../common/Pagination/PaginationControls';
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import { disabledClass, isResetClick, setResetCostingHead } from '../../../actions/Common';
import AnalyticsDrawer from '../material-master/AnalyticsDrawer';
import { reactLocalStorage } from 'reactjs-localstorage';
import { checkMasterCreateByCostingPermission, hideCustomerFromExcel } from '../../common/CommonFunctions';
import Attachament from '../../costing/components/Drawers/Attachament';
import Button from '../../layout/Button';
import { ApplyPermission } from ".";
import { resetStatePagination, updateCurrentRowIndex, updatePageNumber } from '../../common/Pagination/paginationAction';

import { Steps } from '../../common/Tour/TourMessages';
import TourWrapper from '../../common/Tour/TourWrapper';
import { useTranslation } from 'react-i18next';
import { TourStartAction } from '../../../actions/Common';
import { useLabels, useWithLocalization } from '../../../helper/core';
import Switch from 'react-switch'
import MRSimulation from '../../simulation/components/SimulationPages/MRSimulation';

import CostingHeadDropdownFilter from '../material-master/CostingHeadDropdownFilter';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

const MachineRateListing = (props) => {
  const dispatch = useDispatch();

  const { t } = useTranslation("common")
  const [state, setState] = useState({
    isEditFlag: false,
    tableData: [],
    shown: false,
    costingHead: [],
    plant: [],
    technology: [],
    vendorName: [],
    processName: [],
    machineType: [],
    isBulkUpload: false,
    isLoader: false,
    showPopup: false,
    showCopyPopup: false,
    deletedId: '',
    copyId: '',
    isProcessGroup: getConfigurationKey().IsMachineProcessGroup,
    isOpenProcessGroupDrawer: false,
    analyticsDrawer: false,
    selectedRowData: [],
    floatingFilterData: { CostingHead: "", Technology: "", VendorName: "", Plant: "", MachineNumber: "", MachineName: "", MachineTypeName: "", TonnageCapacity: "", ProcessName: "", MachineRate: "", EffectiveDateNew: "", DepartmentName: props.isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant ? userDepartmetList() : "", CustomerName: "", UOM: "", Currency: "", ExchangeRateSourceName: "", OtherNetCost: "" },
    warningMessage: false,
    filterModel: {},
    totalRecordCount: 0,
    isFilterButtonClicked: false,
    disableFilter: true,
    noData: false,
    dataCount: 0,
    inRangeDate: [],
    attachment: false,
    viewAttachment: [],
    render: false,
    isImport: props?.isImport ? props?.isImport : false,
    editSelectedList: false,

  });
  const [searchText, setSearchText] = useState('');
  const [pageRecord, setPageRecord] = useState(0)
  const { machineDatalist, allMachineDataList } = useSelector(state => state?.machine)
  const { selectedRowForPagination, simulationCostingStatus, tokenForSimulation } = useSelector(state => state?.simulation);
  const { globalTakes } = useSelector(state => state?.pagination);
  const permissions = useContext(ApplyPermission);
  const tourStartData = useSelector(state => state?.comman.tourStartData);
  const { technologyLabel, vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels();
  useEffect(() => {
    const fetchData = async () => {
      setTimeout(() => {
        if (!props.stopApiCallOnCancel) {
          if (props.isSimulation) {
            if (props.selectionForListingMasterAPI === 'Combined') {
              props?.changeSetLoader(true);
              dispatch(getListingForSimulationCombined(props.objectForMultipleSimulation, MACHINERATE, (res) => {
                props?.changeSetLoader(false);
              }));
            }
          }
          if (props.selectionForListingMasterAPI === 'Master') {
            getDataList("", 0, "", 0, "", "", 0, defaultPageSize, true, state?.floatingFilterData, state?.isImport);
          }
        }


      }, 300);
    };

    fetchData();
    return () => {
      dispatch(setSelectedRowForPagination([]));
      dispatch(resetStatePagination());
      reactLocalStorage.setObject('selectedRow', {});
    };
    // eslint-disable-next-line
  }, []);
  const floatingFilterStatus = {
    maxValue: 1,
    suppressFilterButton: true,
    component: CostingHeadDropdownFilter,
    onFilterChange: (originalValue, value) => {
      setState((prevState) => ({ ...prevState, floatingFilterData: { ...prevState.floatingFilterData, CostingHead: value } }));
      setState((prevState) => ({ ...prevState, disableFilter: false }));
    }
  };

  const getDataList = (costing_head = '', technology_id = 0, vendor_id = '', machine_type_id = 0, process_id = '', plant_id = '', skip = 0, take = 10, isPagination = true, dataObj = {}, MachineEntryType = false) => {
    setPageRecord(skip)
    if (state?.filterModel?.EffectiveDateNew) {
      if (state?.filterModel.EffectiveDateNew.dateTo) {
        let temp = []
        temp.push(DayTime(state?.filterModel.EffectiveDateNew.dateFrom).format('DD/MM/YYYY'))
        temp.push(DayTime(state?.filterModel.EffectiveDateNew.dateTo).format('DD/MM/YYYY'))
        dataObj.dateArray = temp
      }
    }
    let statusString = [props?.approvalStatus].join(",")
    const filterData = {
      costing_head: costing_head, technology_id: props?.isSimulation ? props?.technology?.value : technology_id, vendor_id: isSimulation && props?.FromExchangeRate ? props?.vendorLabel?.value : vendor_id, machine_type_id: machine_type_id, process_id: process_id, plant_id: plant_id, StatusId: statusString, MachineEntryType: !isSimulation ? (MachineEntryType ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC) : props?.FromExchangeRate ? ENTRY_TYPE_IMPORT : null, Currency: isSimulation && props?.fromListData && props?.fromListData ? props?.fromListData : '',
      LocalCurrency: isSimulation && props?.toListData && props?.toListData ? props?.toListData : '', ListFor: props?.ListFor ? props?.ListFor : '',
      EffectiveDate: isSimulation && props?.minDate ? props?.minDate : '',
    }
    const { zbc, vbc, cbc } = reactLocalStorage.getObject('CostingTypePermission')
    dataObj.IsCustomerDataShow = cbc
    dataObj.IsVendorDataShow = vbc
    dataObj.IsZeroDataShow = zbc
    if (props?.isSimulation && !props?.isFromVerifyPage) {
      dataObj.TechnologyId = props?.technology?.value
      dataObj.Technologies = props?.technology?.label
    }
    if (props.isSimulation) {
      dataObj.isRequestForPendingSimulation = simulationCostingStatus ? true : false
    }
    if (props.isMasterSummaryDrawer !== undefined && !props.isMasterSummaryDrawer) {
      if (props.isSimulation && !props?.isFromVerifyPage) { props?.changeTokenCheckBox(false) }
      setState((prevState) => ({ ...prevState, isLoader: isPagination ? true : false }))
      let FloatingfilterData = state?.filterModel
      let obj = { ...state?.floatingFilterData }
      dataObj.Currency = state?.floatingFilterData?.Currency
      dataObj.ExchangeRateSourceName = state?.floatingFilterData?.ExchangeRateSourceName
      dispatch(getMachineDataList(filterData, skip, take, isPagination, dataObj, (res) => {
        setState((prevState) => ({ ...prevState, noData: false }))
        if (props.isSimulation && !props?.isFromVerifyPage) { props?.changeTokenCheckBox(true) }
        setState((prevState) => ({ ...prevState, isLoader: false }))
        if (res && isPagination === false) {
          setState((prevState) => ({ ...prevState, disableDownload: false }))
          dispatch(disabledClass(false))
          setTimeout(() => {
            let button = document.getElementById('Excel-Downloads-machine')
            button && button.click()
          }, 500);
        }

        if (res) {
          if (res && res.status === 204) {
            setState((prevState) => ({
              ...prevState, totalRecordCount: 0,
              //  pageNo: 0
            }))
            dispatch(updatePageNumber(0));
          }
          if (res && res.data && res.data.DataList.length > 0) {
            setState((prevState) => ({ ...prevState, totalRecordCount: res.data.DataList[0].TotalRecordCount }))
          }
          let isReset = true
          setTimeout(() => {
            for (var prop in obj) {
              if (props.isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
                if (prop !== "DepartmentName" && obj[prop] !== "") {
                  isReset = false
                }
              } else {
                if (obj[prop] !== "") { isReset = false }
              }
            }
            // Sets the filter model via the grid API
            isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(FloatingfilterData))
            setTimeout(() => {
              setState((prevState) => ({ ...prevState, warningMessage: false }))
            }, 23);
          }, 300);
          setTimeout(() => {
            setState((prevState) => ({ ...prevState, warningMessage: false }))
          }, 335);
          setTimeout(() => {
            setState((prevState) => ({ ...prevState, isFilterButtonClicked: false }))
          }, 600);
        }
      }))
    }

    else {
      setState((prevState) => ({
        ...prevState, isLoader: false
      }))

    }
  }



  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if (machineDatalist?.length !== 0) {
        setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state?.noData), totalRecordCount: state?.gridApi?.getDisplayedRowCount() }));
      }
    }, 500);
    setState((prevState) => ({ ...prevState, disableFilter: false }));
    const model = gridOptions?.api?.getFilterModel();
    setState((prevState) => ({ ...prevState, filterModel: model }));
    if (!state?.isFilterButtonClicked) {
      setState((prevState) => ({ ...prevState, warningMessage: true }));
    }
    if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
      let isFilterEmpty = true;
      if (model !== undefined && model !== null) {
        if (Object.keys(model).length > 0) {
          isFilterEmpty = false;
          for (var property in state?.floatingFilterData) {
            if (property === value.column.colId) { state.floatingFilterData[property] = ""; }
          }

          setState((prevState) => ({ ...prevState, floatingFilterData: state?.floatingFilterData, }));
        }

        if (isFilterEmpty) {
          setState((prevState) => ({ ...prevState, warningMessage: false }));
          for (var prop in state?.floatingFilterData) {
            state.floatingFilterData[prop] = "";
          }
          setState((prevState) => ({ ...prevState, floatingFilterData: state?.floatingFilterData, }));
        }
      }
    } else {
      if (value.column.colId === "EffectiveDate" || value.column.colId === "CreatedDate") {
        return false;
      }
      setState((prevState) => ({ ...prevState, floatingFilterData: { ...prevState.floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter, }, }));
    }
  };

  const onSearch = () => {
    setState((prevState) => ({
      ...prevState, warningMessage: false,
      //  pageNo: 1, pageNoNew: 1, currentRowIndex: 0,
    }));
    dispatch(updatePageNumber(1));
    dispatch(updateCurrentRowIndex(0))
    getDataList("", 0, '', 0, "", "", 0, globalTakes, true, state?.floatingFilterData, state?.isImport);
  };


  const resetState = () => {
    setState((prevState) => ({ ...prevState, noData: false, warningMessage: false, }));
    dispatch(setResetCostingHead(true, "costingHead"));
    setState((prevState) => ({ ...prevState, isFilterButtonClicked: false, }));
    dispatch(isResetClick(true, "Operation"));
    setSearchText(''); // Clear the search text state
    if (state?.gridApi) { state?.gridApi.setQuickFilter(''); }
    state?.gridApi.deselectAll();
    gridOptions?.columnApi?.resetColumnState(null);
    const val = gridOptions?.api?.setFilterModel({});
    for (var prop in state?.floatingFilterData) {
      state.floatingFilterData[prop] = "";
    }
    dispatch(resetStatePagination());
    dispatch(updateCurrentRowIndex(10))
    setState((prevState) => ({ ...prevState, noData: false, warningMessage: false, dataCount: 0, isFilterButtonClicked: false, floatingFilterData: state?.floatingFilterData, warningMessage: false }));
    // getDataList("", 0, 0, "", '', 10, true, state?.floatingFilterData);
    getDataList("", 0, '', 0, "", "", 0, defaultPageSize, true, state?.floatingFilterData, state?.isImport)
    dispatch(setSelectedRowForPagination([]));
    setSearchText(''); // Assuming this state is bound to the input value
    reactLocalStorage.setObject('selectedRow', {});
  };

  const viewOrEditItemDetails = (Id, rowData, isViewMode) => {
    let data = { isEditFlag: true, Id: Id, IsVendor: rowData.CostingHead, isViewMode: isViewMode, costingTypeId: rowData.CostingTypeId, }
    props.getDetails(data, rowData?.IsMachineAssociated);
  }

  /**
   * @method viewProcessGroupDetail
   * @description VIEW PROCESS GROUP LIST 
  */

  const viewProcessGroupDetail = (rowData) => {
    dispatch(getProcessGroupByMachineId(rowData.MachineId, res => {
      if (res.data.Result || res.status === 204) {
        setState((prevState) => ({ ...prevState, isOpenProcessGroupDrawer: true }))
      }
    }))
  }

  const closeProcessGroupDrawer = () => {
    setState((prevState) => ({ ...prevState, isOpenProcessGroupDrawer: false }))
  }


  /**
  * @method copyItem
  * @description edit material type
  */
  const confirmCopy = (Id) => {
    dispatch(copyMachine(Id, (res) => {
      if (res.data.Result === true) {
        Toaster.success(MESSAGES.COPY_MACHINE_SUCCESS);
        resetState()
      }
    }));
  }
  const copyItem = (Id) => {
    setState((prevState) => ({ ...prevState, showCopyPopup: true, copyId: Id }))
  }

  /**
  * @method deleteItem
  * @description confirm delete Raw Material details
  */
  const deleteItem = (Id) => {
    setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }))
  }
  const cancel = () => {
    props?.cancelImportList();
  };
  const editSelectedData = () => {
    setState((prevState) => ({ ...prevState, editSelectedList: true, tempList: state?.gridApi?.getSelectedRows() ? state?.gridApi?.getSelectedRows() : [], }));
  };
  const backToSimulation = (value) => {
    setState((prevState) => ({ ...prevState, editSelectedList: false }));
  };
  /**
  * @method confirmDelete
  * @description confirm delete Raw Material details
  */
  const confirmDelete = (ID) => {
    const loggedInUser = loggedInUserId()
    dispatch(deleteMachine(ID, loggedInUser, (res) => {
      if (res?.data?.Result === true) {
        Toaster.success(MESSAGES.DELETE_MACHINE_SUCCESS);
        dispatch(setSelectedRowForPagination([]));
        if (state?.gridApi) {
          state?.gridApi?.deselectAll();
        }
        getDataList("", 0, "", 0, "", "", pageRecord, globalTakes, true, state?.floatingFilterData, state?.isImport);
        setState((prevState) => ({ ...prevState, dataCount: 0 }))
      }
    }));
  }
  const onPopupConfirm = () => {
    confirmDelete(state?.deletedId);
    setState((prevState) => ({ ...prevState, showPopup: false }))

  }
  const onCopyPopupConfirm = () => {
    confirmCopy(state?.copyId);
    setState((prevState) => ({ ...prevState, showCopyPopup: false }))

  }
  const closePopUp = () => {
    setState((prevState) => ({ ...prevState, showPopup: false, showCopyPopup: false }))
  }


  const showAnalytics = (cell, rowData) => {
    setState((prevState) => ({ ...prevState, selectedRowData: rowData, analyticsDrawer: true }))
  }


  const { benchMark } = props
  const buttonFormatter = (props) => {
    const cellValue = props?.value;
    const rowData = props?.data;
    let isEditable = false
    let isDeleteButton = false
    if (permissions?.Edit && rowData?.IsEditable) { isEditable = true }
    else { isEditable = false }


    if (tourStartData.showExtraData && props.rowIndex === 0) {
      isDeleteButton = true
    } else {
      if (permissions?.Delete && !rowData.IsMachineAssociated) {
        isDeleteButton = true
      }
    }
    return (
      <>
        <button className="cost-movement Tour_List_Cost_Movement" title='Cost Movement' type={'button'} onClick={() => showAnalytics(cellValue, rowData)}> </button>

        {(!benchMark) && (
          <>
            {state?.isProcessGroup && <button className="group-process Tour_List_Process_Group" type={'button'} title={'View Process Group'} onClick={() => viewProcessGroupDetail(rowData)} />}
            {permissions?.View && <button title="View" className="View Tour_List_View" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />}
            {isEditable && <button title="Edit" className="Edit Tour_List_Edit" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} />}
            <button className="Copy All Costing Tour_List_Copy" title="Copy Machine" type={'button'} onClick={() => copyItem(cellValue)} />
            {isDeleteButton && <button title="Delete" className="Delete Tour_List_Delete" type={'button'} onClick={() => deleteItem(cellValue)} />}
          </>
        )}
      </>
    )
  };
  const combinedCostingHeadRenderer = (props) => {
    // Call the existing checkBoxRenderer
    costingHeadFormatter(props);

    // Get and localize the cell value
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);

    // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
    return localizedValue;
  };
  /**
  * @method costingHeadFormatter
  * @description Renders Costing head
  */
  const costingHeadFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    if (selectedRowForPagination?.length > 0) {
      selectedRowForPagination.map((item) => {
        if (item.MachineProcessRateId === props.node.data.MachineProcessRateId) {
          props.node.setSelected(true)
        }
        return null
      })
      return cellValue
    } else {
      return cellValue
    }
  }

  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
  }


  const effectiveDateFormatter = (props) => {
    if (tourStartData?.showExtraData && props?.rowIndex === 0) {
      return "Lorem Ipsum";
    } else {
      const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value ? props?.value : props.data.EffectiveDate;
      return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }
  }

  const renderPlantFormatter = (props) => {
    const row = props?.data;
    const value = row.CostingHead === 'VBC' ? row.DestinationPlant : row.Plants
    return value
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
              return (<a href={fileURL} target="_blank" rel="noreferrer"> {f.OriginalFileName} </a>)
            }) : <button type='button' title='View Attachment' className='btn-a pl-0' onClick={() => viewAttachmentData(row)} >View Attachment</button>}  </div>
      </>
    )

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


  const displayForm = () => {
    if (checkMasterCreateByCostingPermission()) {
      props.displayForm()
    }
  }


  const returnExcelColumn = (data = [], TempData) => {
    let excelData = hideCustomerFromExcel(data, "CustomerName")
    let temp = []
    temp = TempData && TempData.map((item) => {
      if (item.MachineTonnage === null) {
        item.MachineTonnage = ' '
      } else if (item.Plants === '-') {
        item.Plants = ' '
      } else if (item.MachineTypeName === '-') {
        item.MachineTypeName = ' '
      } else if (item.VendorName === '-') {
        item.VendorName = ' '
      }
      if (item?.EffectiveDateNew?.includes('T')) {
        item.EffectiveDateNew = DayTime(item.EffectiveDateNew).format('DD/MM/YYYY')
      }
      return item
    })

    return (<ExcelSheet data={temp} name={`${MachineRate}`}>
      {excelData && excelData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
    </ExcelSheet>);
  }

  const onGridReady = (params) => {
    setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
    params.api.paginationGoToPage(0);
    const checkBoxInstance = document.querySelectorAll('.ag-input-field-input.ag-checkbox-input');
    checkBoxInstance.forEach((checkBox, index) => {
      const specificId = `Machine_checkBox${Math.ceil(index / 11)}`;
      checkBox.id = specificId;
    })
    const floatingFilterInstances = document.querySelectorAll('.ag-input-field-input.ag-text-field-input');
    floatingFilterInstances.forEach((floatingFilter, index) => {
      const specificId = `Machine_Floating${index}`;
      floatingFilter.id = specificId;
    });
  };

  const onExcelDownload = () => {
    setState((prevState) => ({ ...prevState, disableDownload: true }))
    dispatch(disabledClass(true))
    //let tempArr = state?.gridApi && state?.gridApi?.getSelectedRows()
    let tempArr = selectedRowForPagination
    if (tempArr?.length > 0) {
      setTimeout(() => {
        setState((prevState) => ({ ...prevState, disableDownload: false }))
        dispatch(disabledClass(false))
        let button = document.getElementById('Excel-Downloads-machine')
        button && button.click()
      }, 400);
    } else {
      getDataList("", 0, "", 0, "", "", 0, defaultPageSize, false, state?.floatingFilterData, state?.isImport)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }
  }
  const MACHINERATE_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(MACHINERATE_DOWNLOAD_EXCEl, "MasterLabels")
  const onBtExport = () => {
    let tempArr = []
    //tempArr = state?.gridApi && state?.gridApi?.getSelectedRows()
    tempArr = selectedRowForPagination
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (allMachineDataList ? allMachineDataList : [])
    const filteredLabels = MACHINERATE_DOWNLOAD_EXCEl_LOCALIZATION.filter(column => {
      if (column.value === "ExchangeRateSourceName") {
        return getConfigurationKey().IsSourceExchangeRateNameVisible
      }
      return true;
    })
    return returnExcelColumn(filteredLabels, tempArr)
  };
  /**
                 @method toggleExtraData
                 @description Handle specific module tour state to display lorem data
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


  const onFilterTextBoxChanged = (e) => {
    setSearchText(state?.gridApi.setQuickFilter(e.target.value))
  }


  const { isSimulation } = props;
  const { isBulkUpload, noData } = state;

  var filterParams = {
    date: "",
    inRangeInclusive: true,
    filterOptions: ['equals', 'inRange'],
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
      var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
      handleDate(newDate)// FOR COSTING BENCHMARK MACHINE REPORT
      let date = document.getElementsByClassName('ag-input-field-input')
      for (let i = 0; i < date.length; i++) {
        if (date[i].type === 'radio') {
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

  const handleDate = (newDate) => {
    let temp = state?.inRangeDate
    temp.push(newDate)
    setState((prevState) => ({ ...prevState, inRangeDate: temp }))
    if (props?.benchMark) { props?.handleDate(state?.inRangeDate) }
    setTimeout(() => {
      var y = document.getElementsByClassName('ag-radio-button-input');
      var radioBtn = y[0];
      radioBtn?.click()

    }, 300);
  }

  const setDate = (date) => {
    setState((prevState) => ({ ...prevState, floatingFilterData: { ...state?.floatingFilterData, EffectiveDateNew: date, newDate: date } }))
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

  const closeAnalyticsDrawer = () => {
    setState((prevState) => ({ ...prevState, analyticsDrawer: false }))
  }

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: isFirstColumn,
    headerCheckboxSelection: (props.isSimulation || props?.benchMark) ? isFirstColumn : false,
  };
  const importToggle = () => {
    setState((prevState) => ({ ...prevState, isImport: !state?.isImport }));
    getDataList("", 0, '', 0, "", "", 0, globalTakes, true, state?.floatingFilterData, !state?.isImport)

  }

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    effectiveDateRenderer: effectiveDateFormatter,
    costingHeadRenderer: combinedCostingHeadRenderer,
    customNoRowsOverlay: NoContentFound,
    hyphenFormatter: hyphenFormatter,
    renderPlantFormatter: renderPlantFormatter,
    attachmentFormatter: attachmentFormatter,
    statusFilter: CostingHeadDropdownFilter,
  };

  const onRowSelect = (event) => {
    let selectedRowForPagination = reactLocalStorage.getObject('selectedRow').selectedRow

    var selectedRows = state?.gridApi && state?.gridApi?.getSelectedRows();
    if (selectedRows === undefined || selectedRows === null) {
      selectedRows = selectedRowForPagination;
    } else if (
      selectedRowForPagination && selectedRowForPagination.length > 0
    ) {
      let finalData = [];
      if (event.node.isSelected() === false) {
        // CHECKING IF CURRENT CHECKBOX IS UNSELECTED
        for (let i = 0; i < selectedRowForPagination.length; i++) {
          if (selectedRowForPagination[i].MachineProcessRateId === event.data.MachineProcessRateId) {
            continue;
          }
          finalData.push(selectedRowForPagination[i]);
        }
      } else {
        finalData = selectedRowForPagination;
      }
      selectedRows = [...selectedRows, ...finalData];
    }

    let uniqeArray = _.uniqBy(selectedRows, "MachineProcessRateId")
    reactLocalStorage.setObject('selectedRow', { selectedRow: uniqeArray })
    setState((prevState) => ({ ...prevState, dataCount: uniqeArray.length }))
    dispatch(setSelectedRowForPagination(uniqeArray))
    let finalArr = selectedRows;
    let length = finalArr?.length;
    let uniqueArray = _.uniqBy(finalArr, "MachineProcessRateId");
    uniqueArray = uniqueArray.map(item => ({ ...item, EffectiveDate: item.EffectiveDate?.includes('T') ? DayTime(item.EffectiveDate).format('DD/MM/YYYY') : item.EffectiveDate }));
    if (props.isSimulation && !props?.isFromVerifyPage) {
      props.apply(uniqueArray, length);
    }
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows }));

    if (props?.benchMark) {
      let uniqueArrayNew = _.uniqBy(uniqueArray, "CostingTypeId");
      if (uniqueArrayNew.length > 1) {
        dispatch(setSelectedRowForPagination([]));
        state?.gridApi.deselectAll();
        Toaster.warning("Please select multiple machine rate's with same category")
      }
    }
  };

  const currencyRateRenderer = (params) => {
    const { MachineEntryType, LocalCurrency, Currency, MachineRateConversion, MachineRateLocalConversion, MachineRate } = params.data;
    if (MachineEntryType === null || MachineEntryType === undefined) {
      return LocalCurrency;
    }
    return MachineEntryType === ENTRY_TYPE_IMPORT ? MachineRate : MachineRateLocalConversion;
  }

  return (
    <div>
      {!state?.editSelectedList && (
        <div className={`ag-grid-react grid-parent-wrapper ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${permissions?.Download ? "show-table-btn" : ""} ${props.isSimulation ? 'simulation-height' : ''}`}>
          {(state?.isLoader && !props.isMasterSummaryDrawer) && <LoaderCustom customClass="simulation-Loader" />} {state?.disableDownload && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />}
          <form noValidate> {(state?.isLoader && !props.isMasterSummaryDrawer) && <LoaderCustom customClass="simulation-Loader" />}
            {state?.disableDownload && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />}
            {!isSimulation && <Row>
              <Col md="4" className="switch mt-3 mb-1">
                <label className="switch-level">
                  <div className="left-title">Domestic</div>
                  <Switch
                    onChange={importToggle}
                    checked={state?.isImport}
                    id="normal-switch"

                    background="#4DC771"
                    onColor="#4DC771"
                    onHandleColor="#ffffff"
                    offColor="#4DC771"
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={20}
                    width={46}
                  />
                  <div className="right-title">Import</div>
                </label>
              </Col>
            </Row>}
            <Row className={`${props?.isMasterSummaryDrawer ? '' : 'pt-2'} filter-row-large ${(props.isSimulation || props.benchMark) ? 'simulation-filter zindex-0' : ''}`}>
              <Col md="3" lg="3">
                <input type="text" className="form-control table-search" value={searchText} id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={onFilterTextBoxChanged} />
                {(!props.isSimulation && !props.benchMark && !props?.isMasterSummaryDrawer) && (<TourWrapper
                  buttonSpecificProp={{
                    id: "MachineRate_Listing_Tour",
                    onClick: toggleExtraData
                  }} stepsSpecificProp={{
                    steps: Steps(t, { addLimit: false, viewProcessGroup: true, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                  }}
                />)}
              </Col>
              <Col md="9" lg="9" className="pl-0 mb-3 d-flex justify-content-end">
                <div className="d-flex justify-content-end bd-highlight w100 p-relative">

                  {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                    <div className="warning-message d-flex align-items-center">
                      {state?.warningMessage && !state?.disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                    </div>
                  }
                  {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                    <>
                      <button disabled={state?.disableFilter} title="Filtered data" type="button" class="user-btn mr5 Tour_List_Filter" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                      {permissions?.Add && !state.isImport && (<button type="button" className={"user-btn mr5 Tour_List_Add"} onClick={displayForm} title="Add">  <div className={"plus mr-0"}></div>{/* ADD */}</button>)}
                      {permissions?.BulkUpload && (<button type="button" className={"user-btn mr5 Tour_List_BulkUpload"} onClick={bulkToggle} title="Bulk Upload"><div className={"upload mr-0"}></div>{/* Bulk Upload */} </button>)}
                      {permissions?.Download && <>  <button title={`Download ${state?.dataCount === 0 ? "All" : "(" + state?.dataCount + ")"}`} type="button" disabled={state?.totalRecordCount === 0} onClick={onExcelDownload} className={'user-btn mr5 Tour_List_Download'}><div className="download mr-1" title="Download"></div> {/* DOWNLOAD */} {`${state?.dataCount === 0 ? "All" : "(" + state?.dataCount + ")"}`} </button>

                        <ExcelFile filename={'Machine Rate'} fileExtension={'.xls'} element={
                          <button id={'Excel-Downloads-machine'} className="p-absolute " type="button" >
                          </button>}>
                          {onBtExport()}
                        </ExcelFile>
                      </>
                      }

                    </>
                  }
                  <Button id='machineRateListing_reset' className="user-btn Tour_List_Reset mr-1" onClick={() => resetState()}>  <div className="refresh mr-0"></div></Button>

                </div>
                {props.isSimulation && props.isFromVerifyPage && (
                  <button type="button" className={"apply"} onClick={cancel}                        >
                    <div className={"back-icon"}></div>Back
                  </button>

                )}
              </Col>
            </Row>
          </form>
          <Row>
            <Col>

              <div id="machine-master-grid" className={`ag-grid-wrapper grid-parent-wrapper machine-master-grid height-width-wrapper ${(machineDatalist && machineDatalist?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                <div className={`ag-theme-material ${state?.isLoader && "max-loader-height"}`}>
                  {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                  {state?.render ? <LoaderCustom customClass="loader-center" /> : <AgGridReact

                    defaultColDef={defaultColDef}
                    floatingFilter={true}
                    domLayout='autoHeight'
                    rowData={tourStartData.showExtraData ? [...setLoremIpsum(machineDatalist[0]), ...machineDatalist] : machineDatalist}

                    pagination={true}
                    paginationPageSize={globalTakes}
                    onGridReady={onGridReady}
                    gridOptions={gridOptions}
                    noRowsOverlayComponent={'customNoRowsOverlay'}
                    noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
                    frameworkComponents={frameworkComponents}
                    rowSelection={'multiple'}
                    onRowSelected={onRowSelect}
                    onFilterModified={onFloatingFilterChanged}
                    suppressRowClickSelection={true}
                    enableBrowserTooltips={true}
                  >
                    { }
                    <AgGridColumn field="CostingHead" headerName="Costing Head" floatingFilterComponentParams={floatingFilterStatus}
                      floatingFilterComponent="statusFilter"
                      cellRenderer={combinedCostingHeadRenderer}></AgGridColumn>
                    {isSimulation && <AgGridColumn field="EntryType" headerName="Entry Type"></AgGridColumn>}
                    {!isSimulation && <AgGridColumn field="Technology" headerName={technologyLabel}></AgGridColumn>}

                    <AgGridColumn field="MachineName" headerName="Machine Name" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                    <AgGridColumn field="MachineNumber" headerName="Machine Number" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                    <AgGridColumn field="MachineTypeName" headerName="Machine Type" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                    <AgGridColumn field="TonnageCapacity" cellRenderer={'hyphenFormatter'} headerName="Machine Tonnage"></AgGridColumn>
                    <AgGridColumn field="ProcessName" headerName="Process Name"></AgGridColumn>
                    <AgGridColumn field="Type" headerName="Type"></AgGridColumn>
                    <AgGridColumn field='Applicability' headerName='Applicability'></AgGridColumn>
                    <AgGridColumn field='Percentage' headerName='Percentage'></AgGridColumn>
                    <AgGridColumn field="UOM" headerName='UOM'></AgGridColumn>
                    <AgGridColumn field="VendorName" headerName={`${vendorLabel} (Code)`} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                    {reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                    <AgGridColumn field="Plant" headerName="Plant (Code)" cellRenderer='hyphenFormatter'></AgGridColumn>
                    {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn field="ExchangeRateSourceName" headerName="Exchange Rate Source" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                    <AgGridColumn field="Currency" headerName="Currency"></AgGridColumn>
                    <AgGridColumn width={200} field="MachineRate" headerName="Machine Rate" cellRenderer={currencyRateRenderer}></AgGridColumn>
                    {/* <AgGridColumn width={200} field="MachineRate" headerName="Machine Rate (Currency)" cellRenderer={hyphenFormatter}></AgGridColumn> */}
                    <AgGridColumn field="EffectiveDateNew" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                    {!isSimulation && !props?.isMasterSummaryDrawer && <AgGridColumn field="MachineId" width={230} cellClass={"actions-wrapper ag-grid-action-container"} pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                    {props.isMasterSummaryDrawer && <AgGridColumn field="Attachements" headerName='Attachments' cellRenderer={'attachmentFormatter'}></AgGridColumn>}
                    {props.isMasterSummaryDrawer && <AgGridColumn field="Remark" tooltipField="Remark" ></AgGridColumn>}
                  </AgGridReact >}
                  <div className='button-wrapper'> {!state?.isLoader &&
                    <PaginationWrappers gridApi={state?.gridApi} module="Machine" totalRecordCount={state?.totalRecordCount} getDataList={(...args) => getDataList(...args, state?.isImport)} floatingFilterData={state?.floatingFilterData} />
                  }
                    {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                      <PaginationControls totalRecordCount={state?.totalRecordCount} getDataList={(...args) => getDataList(...args, state?.isImport)} floatingFilterData={state?.floatingFilterData} module="Machine"
                      />}
                  </div >
                </div >
              </div >

            </Col >
          </Row >
          {
            props.isSimulation && props.isFromVerifyPage && (
              <Row>
                <Col md="12" className="d-flex justify-content-end align-items-center">
                  <WarningMessage dClass="mr-5" message={`Please check the Machine Rate that you want to edit.`} />
                  <Button className={"apply"} id={"operationListing_editSelectedData"} disabled={state?.gridApi?.getSelectedRows()?.length === 0} onClick={editSelectedData} icon="edit-icon" buttonName="Edit" />
                </Col>
              </Row>
            )
          }
          {isBulkUpload && <BulkUpload isOpen={isBulkUpload} closeDrawer={closeBulkUploadDrawer} isEditFlag={false} fileName={'Machine'} isZBCVBCTemplate={true} isMachineMoreTemplate={true} messageLabel={'Machine'} anchor={'right'} masterId={MACHINE_MASTER_ID} />}
          {state?.analyticsDrawer && <AnalyticsDrawer isOpen={state?.analyticsDrawer} ModeId={4} closeDrawer={closeAnalyticsDrawer} anchor={"right"} isReport={state?.analyticsDrawer} selectedRowData={state?.selectedRowData} isSimulation={true} rowData={state?.selectedRowData} />}
          {state?.attachment && (<Attachament isOpen={state?.attachment} index={state?.viewAttachment} closeDrawer={closeAttachmentDrawer} anchor={'right'} gridListing={true} />)}
          {state?.showPopup && <PopupMsgWrapper isOpen={state?.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.MACHINE_DELETE_ALERT}`} />}
          {state?.showCopyPopup && <PopupMsgWrapper isOpen={state?.showCopyPopup} closePopUp={closePopUp} confirmPopup={onCopyPopupConfirm} message={`${MESSAGES.COPY_MACHINE_POPUP}`} />}
          {state?.isOpenProcessGroupDrawer && <ProcessGroupDrawer anchor={'right'} isOpen={state?.isOpenProcessGroupDrawer} toggleDrawer={closeProcessGroupDrawer} isViewFlag={true} />}

        </div >)
      }
      {
        state?.editSelectedList && (
          <MRSimulation
            backToSimulation={backToSimulation}
            // isbulkUpload={isbulkUpload}
            // rowCount={rowCount}
            list={state?.tempList ? state?.tempList : []}
            // technology={technology.label}
            // technologyId={technology.value}
            // master={master.label}
            tokenForMultiSimulation={
              tokenForSimulation?.length !== 0
                ? [{ SimulationId: tokenForSimulation?.value }]
                : []
            }
          />
        )
      }
    </div >


  );
}


export default MachineRateListing
