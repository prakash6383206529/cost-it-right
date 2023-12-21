import React, { useState, useEffect, useContext } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { APPROVED_STATUS, defaultPageSize, EMPTY_DATA, MACHINERATE, MACHINE_MASTER_ID, FILE_URL } from '../../../config/constants';
import { getMachineDataList, deleteMachine, copyMachine, getProcessGroupByMachineId } from '../actions/MachineMaster';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
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
import { loggedInUserId, getConfigurationKey, userDepartmetList, searchNocontentFilter } from '../../../helper'
import { getListingForSimulationCombined } from '../../simulation/actions/Simulation';
import ProcessGroupDrawer from './ProcessGroupDrawer'
import WarningMessage from '../../common/WarningMessage';
import _ from 'lodash';
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import { disabledClass } from '../../../actions/Common';
import AnalyticsDrawer from '../material-master/AnalyticsDrawer';
import { reactLocalStorage } from 'reactjs-localstorage';
import { hideCustomerFromExcel } from '../../common/CommonFunctions';
import Attachament from '../../costing/components/Drawers/Attachament';
import Button from '../../layout/Button';
import { ApplyPermission } from ".";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const MachineRateListing = (props) => {
  const dispatch = useDispatch();
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
    isLoader: true,
    showPopup: false,
    showCopyPopup: false,
    deletedId: '',
    copyId: '',
    isProcessGroup: getConfigurationKey().IsMachineProcessGroup, // UNCOMMENT IT AFTER DONE FROM BACKEND AND REMOVE BELOW CODE
    // isProcessGroup: false,
    isOpenProcessGroupDrawer: false,
    analyticsDrawer: false,
    selectedRowData: [],

    //states for pagination purpose
    floatingFilterData: { CostingHead: "", Technology: "", VendorName: "", Plant: "", MachineNumber: "", MachineName: "", MachineTypeName: "", MachineTonnage: "", ProcessName: "", MachineRate: "", EffectiveDateNew: "", DepartmentName: props.isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant ? userDepartmetList() : "", CustomerName: "", UOM: "" },
    warningMessage: false,
    filterModel: {},
    pageNo: 1,
    pageNoNew: 1,
    totalRecordCount: 0,
    isFilterButtonClicked: false,
    currentRowIndex: 0,
    pageSize: { pageSize10: true, pageSize50: false, pageSize100: false },
    globalTake: defaultPageSize,
    disableFilter: true,
    noData: false,
    dataCount: 0,
    inRangeDate: [],
    attachment: false,
    viewAttachment: []

  });
  const { machineDatalist, allMachineDataList } = useSelector(state => state.machine)
  const { selectedRowForPagination } = useSelector(state => state.simulation);
  const permissions = useContext(ApplyPermission);

  // const { auth } = useSelector((state) => state); // state;
  // const { initialConfiguration } = useSelector((state) => state.auth); // state.auth;


  useEffect(() => {
    const fetchData = async () => {
      setTimeout(() => {
        if (!props.stopApiCallOnCancel) {
          if (props.isSimulation) {
            // Set isLoader to false if it's a simulation
            props?.changeSetLoader(true);
            dispatch(getListingForSimulationCombined(props.objectForMultipleSimulation, MACHINERATE, () => {
              props?.changeSetLoader(false);
            }));
          }

          // Fetch data for Master
          if (props.selectionForListingMasterAPI === 'Master') {
            getDataList("", 0, "", 0, "", "", 0, defaultPageSize, true, state.floatingFilterData);
          }
        }
      }, 300);
    };

    fetchData();

    return () => {
      // Cleanup logic for componentWillUnmount
      dispatch(setSelectedRowForPagination([]));
    };
  }, []); // useEffect will run when props change


  const getDataList = (costing_head = '', technology_id = 0, vendor_id = '', machine_type_id = 0, process_id = '', plant_id = '', skip = 0, take = 100, isPagination = true, dataObj = {}) => {
    if (state.filterModel?.EffectiveDateNew) {
      if (state.filterModel.EffectiveDateNew.dateTo) {
        let temp = []
        temp.push(DayTime(state.filterModel.EffectiveDateNew.dateFrom).format('DD/MM/YYYY'))
        temp.push(DayTime(state.filterModel.EffectiveDateNew.dateTo).format('DD/MM/YYYY'))

        dataObj.dateArray = temp
      }

    }

    // TO HANDLE FUTURE CONDITIONS LIKE [APPROVED_STATUS, DRAFT_STATUS] FOR MULTIPLE STATUS
    let statusString = [props?.approvalStatus].join(",")

    const filterData = {
      costing_head: costing_head,
      technology_id: props.isSimulation ? props.technology.value : technology_id,
      vendor_id: vendor_id,
      machine_type_id: machine_type_id,
      process_id: process_id,
      plant_id: plant_id,
      StatusId: statusString
    }

    dataObj.IsCustomerDataShow = reactLocalStorage.getObject('cbcCostingPermission')
    console.log(
      dataObj.IsCustomerDataShow
    );
    if (props.isSimulation) {
      dataObj.TechnologyId = props.technology.value
      dataObj.Technologies = props.technology.label
    }

    if (props.isMasterSummaryDrawer !== undefined && !props.isMasterSummaryDrawer) {
      if (props.isSimulation) {
        props?.changeTokenCheckBox(false)
      }
      setState((prevState) => ({
        ...prevState, isLoader: isPagination ? true : false
      }))
      let FloatingfilterData = state.filterModel
      let obj = { ...state.floatingFilterData }
      dispatch(getMachineDataList(filterData, skip, take, isPagination, dataObj, (res) => {
        setState((prevState) => ({
          ...prevState, noData: false
        }))
        if (props.isSimulation) {
          props?.changeTokenCheckBox(true)
        }
        setState((prevState) => ({
          ...prevState, isLoader: false
        }))

        if (res && isPagination === false) {
          setState((prevState) => ({
            ...prevState, disableDownload: false
          }))
          dispatch(disabledClass(false))
          setTimeout(() => {
            let button = document.getElementById('Excel-Downloads-machine')
            button && button.click()
          }, 500);
        }

        if (res) {
          if (res && res.status === 204) {
            setState((prevState) => ({
              ...prevState, totalRecordCount: 0, pageNo: 0
            }))
          }
          if (res && res.data && res.data.DataList.length > 0) {
            setState((prevState) => ({
              ...prevState, totalRecordCount: res.data.DataList[0].TotalRecordCount
            }))
          }
          let isReset = true
          setTimeout(() => {
            for (var prop in obj) {

              if (props.isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
                if (prop !== "DepartmentName" && obj[prop] !== "") {
                  isReset = false
                }
              } else {
                if (obj[prop] !== "") {
                  isReset = false
                }
              }
            }
            // Sets the filter model via the grid API
            isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(FloatingfilterData))
            setTimeout(() => {
              setState((prevState) => ({
                ...prevState, warningMessage: false
              }))
            }, 23);

          }, 300);

          setTimeout(() => {
            setState((prevState) => ({
              ...prevState, warningMessage: false
            }))
          }, 335);

          setTimeout(() => {
            setState((prevState) => ({
              ...prevState, isFilterButtonClicked: false
            }))
          }, 600);
        }
      }))
    }
  }


  const onFloatingFilterChanged = (value) => {
    console.log("onFloatingFilterChanged", value);
    setTimeout(() => {
      if (machineDatalist?.length !== 0) {
        setState((prevState) => ({
          ...prevState,
          noData: searchNocontentFilter(value, state.noData),
        }));
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

          setState((prevState) => ({
            ...prevState,
            floatingFilterData: state.floatingFilterData,
          }));
        }

        if (isFilterEmpty) {
          setState((prevState) => ({ ...prevState, warningMessage: false }));
          for (var prop in state.floatingFilterData) {
            state.floatingFilterData[prop] = "";
          }
          setState((prevState) => ({
            ...prevState,
            floatingFilterData: state.floatingFilterData,
          }));
        }
      }
    } else {
      if (
        value.column.colId === "EffectiveDate" ||
        value.column.colId === "CreatedDate"
      ) {
        return false;
      }
      setState((prevState) => ({
        ...prevState,
        floatingFilterData: {
          ...prevState.floatingFilterData,
          [value.column.colId]: value.filterInstance.appliedModel.filter,
        },
      }));
    }
  };

  const onSearch = () => {
    setState((prevState) => ({
      ...prevState,
      warningMessage: false,
      pageNo: 1,
      pageNoNew: 1,
      currentRowIndex: 0,
    }));
    getDataList(
      "",
      0,
      '',
      0,
      "",
      "",
      0,
      state.globalTake,
      true,
      state.floatingFilterData
    );
  };


  const resetState = () => {
    setState((prevState) => ({
      ...prevState,
      noData: false,
    }));
    state.gridApi.deselectAll();
    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null);
    for (var prop in state.floatingFilterData) {
      state.floatingFilterData[prop] = "";
    }
    setState((prevState) => ({
      ...prevState,
      floatingFilterData: state.floatingFilterData,
      warningMessage: false,

      pageNo: 1,
      pageNoNew: 1,
      currentRowIndex: 0,
    }));
    getDataList("", 0, 0, "", '', 10, true, state.floatingFilterData);
    dispatch(setSelectedRowForPagination([]));

    setState((prevState) => ({
      ...prevState,
      globalTake: 10,
      dataCount: 0,


      pageSize: {
        ...prevState.pageSize,
        pageSize10: true,
        pageSize50: false,
        pageSize100: false,
      },
    }));
  };

  const onBtPrevious = () => {
    if (state.currentRowIndex >= 10) {
      const previousNo = state.currentRowIndex - 10;
      const newPageNo = state.pageNo - 1;

      setState((prevState) => ({
        ...prevState,
        pageNo: newPageNo >= 1 ? newPageNo : 1,
        pageNoNew: newPageNo >= 1 ? newPageNo : 1,
        currentRowIndex: previousNo,
      }));


      getDataList(
        '',
        0,
        "",
        0,
        "",
        '',
        previousNo,
        state.globalTake,
        true,
        state.floatingFilterData

      )
    }
  };

  const onBtNext = () => {
    if (
      state?.pageSize?.pageSize50 &&
      state.pageNo >= Math.ceil(state.totalRecordCount / 50)
    ) {
      return false;
    }

    if (
      state?.pageSize?.pageSize100 &&
      state?.pageNo >= Math.ceil(state.totalRecordCount / 100)
    ) {
      return false;
    }

    if (state.currentRowIndex < state.totalRecordCount - 10) {
      setState((prevState) => ({
        ...prevState,
        pageNo: state.pageNo + 1,
        pageNoNew: state.pageNo + 1,
      }));
      const nextNo = state.currentRowIndex + 10;
      getDataList(
        "",
        0,
        "",
        "",
        nextNo,
        state.globalTake,
        true,
        state.floatingFilterData
      );

      getDataList(
        '',
        0,
        "",
        0,
        "",
        '',
        nextNo,
        state.globalTake,
        true,
        state.floatingFilterData

      )
      // skip, take, isPagination, floatingFilterData, (res)
      setState((prevState) => ({ ...prevState, currentRowIndex: nextNo }));
    }
  };

  const onPageSizeChanged = (newPageSize) => {
    let pageSize, totalRecordCount;

    if (Number(newPageSize) === 10) {
      pageSize = 10;
    } else if (Number(newPageSize) === 50) {
      pageSize = 50;
    } else if (Number(newPageSize) === 100) {
      pageSize = 100;
    }

    totalRecordCount = Math.ceil(state.totalRecordCount / pageSize);

    getDataList(
      '',
      0,
      "",
      0,
      "",
      '',
      state.currentRowIndex,
      pageSize,
      true,
      state.floatingFilterData

    );
    //  costing_head = '', technology_id = 0, vendor_id = '', machine_type_id = 0, process_id = '', plant_id = '', skip = 0, take = 100, isPagination = true, dataObj) => {
    //data, skip, take, isPagination, obj, callback
    setState((prevState) => ({
      ...prevState,
      globalTake: pageSize,
      pageNo: Math.min(state.pageNo, totalRecordCount), // Ensure pageNo is within bounds
      pageSize: {
        pageSize10: pageSize === 10,
        pageSize50: pageSize === 50,
        pageSize100: pageSize === 100,
      },
    }));

    state.gridApi.paginationSetPageSize(Number(newPageSize));
  };


  const viewOrEditItemDetails = (Id, rowData, isViewMode) => {
    let data = {
      isEditFlag: true,
      Id: Id,
      IsVendor: rowData.CostingHead,
      isViewMode: isViewMode,
      costingTypeId: rowData.CostingTypeId,
    }
    props.getDetails(data, rowData?.IsMachineAssociated);
  }

  /**
   * @method viewProcessGroupDetail
   * @description VIEW PROCESS GROUP LIST 
  */

  const viewProcessGroupDetail = (rowData) => {
    dispatch(getProcessGroupByMachineId(rowData.MachineId, res => {
      if (res.data.Result || res.status === 204) {
        setState((prevState) => ({
          ...prevState,
          isOpenProcessGroupDrawer: true
        }))
      }
    }))
  }

  const closeProcessGroupDrawer = () => {
    setState((prevState) => ({
      ...prevState, isOpenProcessGroupDrawer: false
    }))
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
    setState((prevState) => ({
      ...prevState, showCopyPopup: true, copyId: Id
    }))
  }

  /**
  * @method deleteItem
  * @description confirm delete Raw Material details
  */
  const deleteItem = (Id) => {
    setState((prevState) => ({
      ...prevState, showPopup: true, deletedId: Id
    }))
  }

  /**
  * @method confirmDelete
  * @description confirm delete Raw Material details
  */
  const confirmDelete = (ID) => {
    const loggedInUser = loggedInUserId()
    dispatch(deleteMachine(ID, loggedInUser, (res) => {
      if (res.data.Result === true) {
        Toaster.success(MESSAGES.DELETE_MACHINE_SUCCESS);
        resetState()
        setState((prevState) => ({
          ...prevState, dataCount: 0
        }))
      }
    }));
  }
  const onPopupConfirm = () => {
    confirmDelete(state.deletedId);
    setState((prevState) => ({
      ...prevState, showPopup: false
    }))

  }
  const onCopyPopupConfirm = () => {
    confirmCopy(state.copyId);
    setState((prevState) => ({
      ...prevState, showCopyPopup: false
    }))

  }
  const closePopUp = () => {
    setState((prevState) => ({
      ...prevState, showPopup: false, showCopyPopup: false
    }))
  }


  const showAnalytics = (cell, rowData) => {
    setState((prevState) => ({
      ...prevState, selectedRowData: rowData, analyticsDrawer: true
    }))
  }


  const buttonFormatter = (props) => {

    const cellValue = props?.value;
    const rowData = props?.data;

    let isEditable = false
    let isDeleteButton = false


    if (permissions.Edit) {
      isEditable = true
    } else {
      isEditable = false
    }


    if (permissions.Delete && !rowData.IsMachineAssociated) {
      isDeleteButton = true
    } else {
      isDeleteButton = false
    }

    return (
      <>
        <button className="cost-movement" title='Cost Movement' type={'button'} onClick={() => showAnalytics(cellValue, rowData)}> </button>
        {state.isProcessGroup && <button className="group-process" type={'button'} title={'View Process Group'} onClick={() => viewProcessGroupDetail(rowData)} />}
        {permissions.View && <button title="View" className="View" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />}
        {isEditable && <button title="Edit" className="Edit" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} />}
        <button className="Copy All Costing" title="Copy Machine" type={'button'} onClick={() => copyItem(cellValue)} />
        {isDeleteButton && <button title="Delete" className="Delete" type={'button'} onClick={() => deleteItem(cellValue)} />}
      </>
    )
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

  /**
   * @method hyphenFormatter
   */
  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
  }


  const effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value ? props?.value : props.data.EffectiveDate;
    return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
  }

  const renderPlantFormatter = (props) => {
    const row = props?.data;

    const value = row.CostingHead === 'VBC' ? row.DestinationPlant : row.Plants
    return value
  }
  const viewAttachmentData = (index) => {
    setState((prevState) => ({
      ...prevState, viewAttachment: index, attachment: true
    }))
  }
  const closeAttachmentDrawer = (e = '') => {
    setState((prevState) => ({
      ...prevState, attachment: false
    }))
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

            }) : <button
              type='button'
              title='View Attachment'
              className='btn-a pl-0'
              onClick={() => viewAttachmentData(row)}
            >View Attachment</button>}
        </div>
      </>
    )

  }
  const bulkToggle = () => {
    setState((prevState) => ({
      ...prevState, isBulkUpload: true
    }))
  }

  const closeBulkUploadDrawer = (event, type) => {
    setState((prevState) => ({
      ...prevState, isBulkUpload: false
    }))
    if (type !== 'cancel') {
      resetState()
    }
  }


  const displayForm = () => {
    props.displayForm()
  }


  const returnExcelColumn = (data = [], TempData) => {
    let excelData = hideCustomerFromExcel(data, "CustomerName")
    let temp = []
    temp = TempData && TempData.map((item) => {
      if (item.MachineTonnage === null) {
        item.MachineTonnage = ' '
      } else if (item.EffectiveDate === null) {
        item.EffectiveDate = ' '
      }
      else if (item.Plants === '-') {
        item.Plants = ' '
      } else if (item.MachineTypeName === '-') {
        item.MachineTypeName = ' '
      } else if (item.VendorName === '-') {
        item.VendorName = ' '
      }
      if (item.EffectiveDate !== null) {
        item.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY')
      }

      return item
    })

    return (<ExcelSheet data={temp} name={`${MachineRate}`}>
      {excelData && excelData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)
      }
    </ExcelSheet>);
  }

  const onGridReady = (params) => {
    setState((prevState) => ({
      ...prevState, gridApi: params.api, gridColumnApi: params.columnApi
    }))

    params.api.paginationGoToPage(0);
    const checkBoxInstance = document.querySelectorAll('.ag-input-field-input.ag-checkbox-input');
    checkBoxInstance.forEach((checkBox, index) => {
      const specificId = `Machine_checkBox${index / 11}`;
      checkBox.id = specificId;
    })
    const floatingFilterInstances = document.querySelectorAll('.ag-input-field-input.ag-text-field-input');
    floatingFilterInstances.forEach((floatingFilter, index) => {
      const specificId = `Machine_Floating${index}`;
      floatingFilter.id = specificId;
    });
  };

  const onExcelDownload = () => {

    setState((prevState) => ({
      ...prevState, disableDownload: true
    }))
    dispatch(disabledClass(true))

    //let tempArr = state.gridApi && state.gridApi?.getSelectedRows()
    let tempArr = selectedRowForPagination
    if (tempArr?.length > 0) {
      setTimeout(() => {
        setState((prevState) => ({
          ...prevState, disableDownload: false
        }))
        dispatch(disabledClass(false))
        let button = document.getElementById('Excel-Downloads-machine')
        button && button.click()
      }, 400);

    } else {

      getDataList("", 0, "", 0, "", "", 0, defaultPageSize, false, state.floatingFilterData)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }
  }

  const onBtExport = () => {
    let tempArr = []
    //tempArr = state.gridApi && state.gridApi?.getSelectedRows()
    tempArr = selectedRowForPagination
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (allMachineDataList ? allMachineDataList : [])
    return returnExcelColumn(MACHINERATE_DOWNLOAD_EXCEl, tempArr)
  };

  const onFilterTextBoxChanged = (e) => {
    state.gridApi.setQuickFilter(e.target.value);
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

  var handleDate = (newDate) => {

    let temp = state.inRangeDate
    temp.push(newDate)
    setState((prevState) => ({
      ...prevState, inRangeDate: temp
    }))
    if (props?.benchMark) {
      props?.handleDate(state.inRangeDate)
    }
    setTimeout(() => {
      var y = document.getElementsByClassName('ag-radio-button-input');
      var radioBtn = y[0];
      radioBtn?.click()

    }, 300);
  }

  var setDate = (date) => {
    setState((prevState) => ({
      ...prevState, floatingFilterData: { ...state.floatingFilterData, EffectiveDateNew: date, newDate: date }
    }))
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
    setState((prevState) => ({
      ...prevState, analyticsDrawer: false
    }))
  }

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: isFirstColumn,
    headerCheckboxSelection: (props.isSimulation || props?.benchMark) ? isFirstColumn : false,
  };

  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    effectiveDateRenderer: effectiveDateFormatter,
    costingHeadRenderer: costingHeadFormatter,
    customNoRowsOverlay: NoContentFound,
    hyphenFormatter: hyphenFormatter,
    renderPlantFormatter: renderPlantFormatter,
    attachmentFormatter: attachmentFormatter,
  };


  const onRowSelect = (event) => {
    let selectedRows = state.gridApi.getSelectedRows();
 
    if (selectedRows === undefined || selectedRows === null) {
      // CONDITION FOR FIRST RENDERING OF COMPONENT
      selectedRows = selectedRowForPagination;
    } else {
      if (event.node.isSelected() === false) {
        // CHECKING IF CURRENT CHECKBOX IS UNSELECTED
        selectedRows = selectedRows.filter(row => row.BoughtOutPartId !== event.data.BoughtOutPartId);
      }
    }
 
    let uniqueArray = _.uniqBy(selectedRows, "MachineProcessRateId");
    dispatch(setSelectedRowForPagination(uniqueArray));
 
    // Calculate dataCount based on the length of uniqueArray
    const newDataCount = uniqueArray.length;
 
    setState((prevState) => ({ ...prevState, dataCount: newDataCount }));
 
    if (props.isSimulation && !props?.isFromVerifyPage) {
      props.apply(uniqueArray, newDataCount);
    }
 
    setState((prevState) => ({ ...prevState, selectedRowData: selectedRows }));
 
    if (props?.benchMark && newDataCount > 1) {
      dispatch(setSelectedRowForPagination([]));
      state.gridApi.deselectAll();
      Toaster.warning("Please select a single BOP with the same category");
    }
  };

  return (
    <div className={`ag-grid-react ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${permissions.Download ? "show-table-btn" : ""} ${props.isSimulation ? 'simulation-height' : ''}`}>
      <form
        // onSubmit={handleSubmit(onSubmit.bind(this))} 
        noValidate>
        {(state.isLoader && !props.isMasterSummaryDrawer) && <LoaderCustom customClass="simulation-Loader" />}
        {state.disableDownload && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />}
        <Row className={`${props?.isMasterSummaryDrawer ? '' : 'pt-4'} filter-row-large ${(props.isSimulation || props.benchMark) ? 'simulation-filter zindex-0' : ''}`}>
          <Col md="3" lg="3">
            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
          </Col>
          <Col md="9" lg="9" className="pl-0 mb-3">
            <div className="d-flex justify-content-end bd-highlight w100 p-relative">
              {state.shown ? (
                <button
                  type="button"
                  className="user-btn mr5 filter-btn-top"
                  onClick={() => {
                    setState((prevState) => ({
                      ...prevState,
                      shown: !state.shown,
                    }));
                    getDataList();
                  }}
                >
                  <div className="cancel-icon-white"></div>
                </button>
              ) : (
                <>
                </>
              )}

              {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                <div className="warning-message d-flex align-items-center">
                  {state.warningMessage && !state.disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                </div>
              }

              {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                <button disabled={state.disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>

              }
              {permissions.Add && (
                <button
                  type="button"
                  className={"user-btn mr5"}
                  onClick={displayForm}
                  title="Add"
                >
                  <div className={"plus mr-0"}></div>
                  {/* ADD */}
                </button>
              )}
              {permissions.BulkUpload && (
                <button
                  type="button"
                  className={"user-btn mr5"}
                  onClick={bulkToggle}
                  title="Bulk Upload"
                >
                  <div className={"upload mr-0"}></div>
                  {/* Bulk Upload */}
                </button>
              )}
              {
                permissions.Download &&
                <>
                  <button title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" onClick={onExcelDownload} className={'user-btn mr5'}><div className="download mr-1" title="Download"></div>
                    {/* DOWNLOAD */}
                    {`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                  </button>

                  <ExcelFile filename={'Machine Rate'} fileExtension={'.xls'} element={
                    <button id={'Excel-Downloads-machine'} className="p-absolute" type="button" >
                    </button>}>
                    {onBtExport()}
                  </ExcelFile>
                </>
              }
              <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                <div className="refresh mr-0"></div>
              </button>

            </div>
          </Col>
        </Row>

      </form>
      <Row>
        <Col>
          <div className={`ag-grid-wrapper height-width-wrapper ${(machineDatalist && machineDatalist?.length <= 0) || noData ? "overlay-contain" : ""}`}>
            <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
              {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
              <AgGridReact
                defaultColDef={defaultColDef}
                floatingFilter={true}
                domLayout='autoHeight'
                rowData={machineDatalist}
                pagination={true}
                paginationPageSize={state.globalTake}
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                noRowsOverlayComponent={'customNoRowsOverlay'}
                noRowsOverlayComponentParams={{
                  title: EMPTY_DATA,
                  imagClass: 'imagClass'
                }}
                frameworkComponents={frameworkComponents}

                rowSelection={'multiple'}
                onRowSelected={onRowSelect}
                onFilterModified={onFloatingFilterChanged}
                suppressRowClickSelection={true}
                enableBrowserTooltips={true}
              >
                <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'costingHeadRenderer'}></AgGridColumn>
                {!isSimulation && <AgGridColumn field="Technology" headerName="Technology"></AgGridColumn>}
                {/* <AgGridColumn field="DepartmentName" headerName="Department"></AgGridColumn> */}
                <AgGridColumn field="MachineName" headerName="Machine Name" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn field="MachineNumber" headerName="Machine Number" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn field="MachineTypeName" headerName="Machine Type" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn field="MachineTonnage" cellRenderer={'hyphenFormatter'} headerName="Machine Tonnage"></AgGridColumn>
                <AgGridColumn field="ProcessName" headerName="Process Name"></AgGridColumn>
                <AgGridColumn field="UOM" headerName='UOM'></AgGridColumn>
                <AgGridColumn field="VendorName" headerName="Vendor (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                {reactLocalStorage.getObject('cbcCostingPermission') && <AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                <AgGridColumn field="Plant" headerName="Plant (Code)" cellRenderer='hyphenFormatter'></AgGridColumn>
                <AgGridColumn field="MachineRate" headerName="Machine Rate"></AgGridColumn>
                <AgGridColumn field="EffectiveDateNew" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                {!isSimulation && !props?.isMasterSummaryDrawer && <AgGridColumn field="MachineId" width={230} cellClass={"actions-wrapper ag-grid-action-container"} pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                {props.isMasterSummaryDrawer && <AgGridColumn field="Attachements" headerName='Attachments' cellRenderer={'attachmentFormatter'}></AgGridColumn>}
                {props.isMasterSummaryDrawer && <AgGridColumn field="Remark" tooltipField="Remark" ></AgGridColumn>}
              </AgGridReact>
              <div className='button-wrapper'>
                {!state.isLoader && <PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} globalTake={state.globalTake} />}
                {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                  <div className="d-flex pagination-button-container">
                    <p>
                      <Button
                        id="bopDomesticListing_previous"
                        variant="previous-btn"
                        onClick={() => onBtPrevious()}
                      />
                    </p>
                    {state?.pageSize?.pageSize10 && (
                      <p className="next-page-pg custom-left-arrow">
                        Page{" "}
                        <span className="text-primary">
                          {state.pageNo}
                        </span>{" "}
                        of {Math.ceil(state.totalRecordCount / 10)}
                      </p>
                    )}
                    {state?.pageSize?.pageSize50 && (
                      <p className="next-page-pg custom-left-arrow">
                        Page{" "}
                        <span className="text-primary">
                          {state.pageNo}
                        </span>{" "}
                        of {Math.ceil(state.totalRecordCount / 50)}
                      </p>
                    )}
                    {state?.pageSize?.pageSize100 && (
                      <p className="next-page-pg custom-left-arrow">
                        Page{" "}
                        <span className="text-primary">
                          {state.pageNo}
                        </span>{" "}
                        of {Math.ceil(state.totalRecordCount / 100)}
                      </p>
                    )}
                    <p>
                      <Button
                        id="bopDomesticListing_next"
                        variant="next-btn"
                        onClick={() => onBtNext()}
                      />
                    </p>
                  </div>
                }
              </div>
            </div>
          </div>

        </Col>
      </Row>
      {
        isBulkUpload && <BulkUpload
          isOpen={isBulkUpload}
          closeDrawer={closeBulkUploadDrawer}
          isEditFlag={false}
          fileName={'Machine'}
          isZBCVBCTemplate={true}
          isMachineMoreTemplate={true}
          messageLabel={'Machine'}
          anchor={'right'}
          masterId={MACHINE_MASTER_ID}
        />
      }


      {
        state.analyticsDrawer &&
        <AnalyticsDrawer
          isOpen={state.analyticsDrawer}
          ModeId={4}
          closeDrawer={closeAnalyticsDrawer}
          anchor={"right"}
          isReport={state.analyticsDrawer}
          selectedRowData={state.selectedRowData}
          isSimulation={true}
          //cellValue={cellValue}
          rowData={state.selectedRowData}
        />
      }
      {
        state.attachment && (
          <Attachament
            isOpen={state.attachment}
            index={state.viewAttachment}
            closeDrawer={closeAttachmentDrawer}
            anchor={'right'}
            gridListing={true}
          />
        )
      }


      {
        state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.MACHINE_DELETE_ALERT}`} />
      }
      {
        state.showCopyPopup && <PopupMsgWrapper isOpen={state.showCopyPopup} closePopUp={closePopUp} confirmPopup={onCopyPopupConfirm} message={`${MESSAGES.COPY_MACHINE_POPUP}`} />
      }
      {
        state.isOpenProcessGroupDrawer && <ProcessGroupDrawer anchor={'right'} isOpen={state.isOpenProcessGroupDrawer} toggleDrawer={closeProcessGroupDrawer} isViewFlag={true} />
      }
    </div >
  );
}


export default MachineRateListing
