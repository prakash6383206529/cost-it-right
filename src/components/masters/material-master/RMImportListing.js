import React from 'react';
import { Row, Col, } from 'reactstrap';
import {
  deleteRawMaterialAPI, getRMImportDataList, masterFinalLevelUser
} from '../actions/Material';
import { checkForDecimalAndNull } from "../../../helper/validation";
import { APPROVED_STATUS, defaultPageSize, EMPTY_DATA, RMIMPORT } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import 'react-input-range/lib/css/index.css';
import DayTime from '../../common/DayTimeWrapper'
import BulkUpload from '../../massUpload/BulkUpload';
import LoaderCustom from '../../common/LoaderCustom';
import { INR, RM_MASTER_ID, APPROVAL_ID } from '../../../config/constants'
import { RMIMPORT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { CheckApprovalApplicableMaster, getConfigurationKey, loggedInUserId, searchNocontentFilter, userDepartmetList, userDetails, } from '../../../helper';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getListingForSimulationCombined, setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import WarningMessage from '../../common/WarningMessage';
import { PaginationWrapper } from '../../common/commonPagination';
import _ from 'lodash';
import { disabledClass } from '../../../actions/Common';
import SelectRowWrapper from '../../common/SelectRowWrapper';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};



function RMImportListing(props) {
  const { AddAccessibility, BulkUploadAccessibility, ViewRMAccessibility, EditAccessibility, DeleteAccessibility, DownloadAccessibility, isSimulation, selectionForListingMasterAPI, objectForMultipleSimulation, apply, ListFor } = props;

  const [value, setvalue] = useState({ min: 0, max: 0 });
  const [isBulkUpload, setisBulkUpload] = useState(false);
  const [gridApi, setgridApi] = useState(null);   // DONT DELETE THIS STATE , IT IS USED BY AG GRID
  const [gridColumnApi, setgridColumnApi] = useState(null);   // DONT DELETE THIS STATE , IT IS USED BY AG GRID
  const [loader, setloader] = useState(false);
  const [isFinalLevelUser, setIsFinalLevelUser] = useState(false)
  const dispatch = useDispatch();
  const rmImportDataList = useSelector((state) => state.material.rmImportDataList);
  const filteredRMData = useSelector((state) => state.material.filteredRMData);
  const { selectedRowForPagination } = useSelector((state => state.simulation))
  const allRmDataList = useSelector((state) => state.material.allRmDataList);
  const [showPopup, setShowPopup] = useState(false)
  const [deletedId, setDeletedId] = useState('')
  const [showPopupBulk, setShowPopupBulk] = useState(false)
  const [disableDownload, setDisableDownload] = useState(false)
  const [disableFilter, setDisableFilter] = useState(true) // STATE MADE FOR CHECKBOX IN SIMULATION
  //STATES BELOW ARE MADE FOR PAGINATION PURPOSE
  const [warningMessage, setWarningMessage] = useState(false)
  const [globalTake, setGlobalTake] = useState(defaultPageSize)
  const [filterModel, setFilterModel] = useState({});
  const [pageNo, setPageNo] = useState(1)
  const [pageNoNew, setPageNoNew] = useState(1)
  const [totalRecordCount, setTotalRecordCount] = useState(0)
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
  const [currentRowIndex, setCurrentRowIndex] = useState(0)
  const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
  const [floatingFilterData, setFloatingFilterData] = useState({ CostingHead: "", TechnologyName: "", RawMaterial: "", RMGrade: "", RMSpec: "", RawMaterialCode: "", Category: "", MaterialType: "", Plant: "", UOM: "", VendorName: "", BasicRate: "", ScrapRate: "", RMFreightCost: "", RMShearingCost: "", NetLandedCost: "", EffectiveDate: "", DepartmentName: isSimulation ? userDepartmetList() : "", CustomerName: "" })
  const [noData, setNoData] = useState(false)
  const [dataCount, setDataCount] = useState(false)
  var filterParams = {
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
      var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
      setFloatingFilterData({ ...floatingFilterData, EffectiveDate: newDate })
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


  useEffect(() => {
    if (rmImportDataList?.length > 0) {
      setTotalRecordCount(rmImportDataList[0].TotalRecordCount)
    }
    else {
      setNoData(false)
    }
  }, [rmImportDataList])

  useEffect(() => {
    setTimeout(() => {
      if (!props.stopApiCallOnCancel) {
        let obj = {
          MasterId: RM_MASTER_ID,
          DepartmentId: userDetails().DepartmentId,
          LoggedInUserLevelId: userDetails().LoggedInMasterLevelId,
          LoggedInUserId: loggedInUserId()
        }
        dispatch(masterFinalLevelUser(obj, (res) => {
          if (res?.data?.Result) {
            setIsFinalLevelUser(res.data.Data.IsFinalApprovar)
          }
        }))

        return () => {
          dispatch(setSelectedRowForPagination([]))
        }
      }
    }, 300);

  }, [])

  useEffect(() => {
    setTimeout(() => {
      if (!props.stopApiCallOnCancel) {
        if (isSimulation && selectionForListingMasterAPI === 'Combined') {
          props?.changeSetLoader(true)
          dispatch(getListingForSimulationCombined(objectForMultipleSimulation, RMIMPORT, (res) => {
            props?.changeSetLoader(false)

          }))

        } else {
          if (isSimulation) {
            props?.changeTokenCheckBox(false)
          }
          getDataList(null, null, null, null, null, 0, 0, defaultPageSize, true, floatingFilterData)
        }

        setvalue({ min: 0, max: 0 });
      }
    }, 300);
    if (!props.stopApiCallOnCancel) {
      if (isSimulation && selectionForListingMasterAPI === 'Combined') {
        props?.changeSetLoader(true)
        dispatch(getListingForSimulationCombined(objectForMultipleSimulation, RMIMPORT, (res) => {
          props?.changeSetLoader(false)

        }))

      } else {
        if (isSimulation) {
          props?.changeTokenCheckBox(false)
        }
        getDataList(null, null, null, null, null, 0, 0, defaultPageSize, true, floatingFilterData)
      }

      setvalue({ min: 0, max: 0 });
    }
  }, [])


  /**
  * @method hideForm
  * @description HIDE DOMESTIC, IMPORT FORMS
  */
  const getDataList = (costingHead = null, plantId = null, materialId = null, gradeId = null, vendorId = null, technologyId = 0, skip = 0, take = 100, isPagination = true, dataObj) => {
    const { isSimulation } = props
    // TO HANDLE FUTURE CONDITIONS LIKE [APPROVED_STATUS, DRAFT_STATUS] FOR MULTIPLE STATUS
    let statusString = [APPROVED_STATUS].join(",")

    const filterData = {
      costingHead: isSimulation && filteredRMData && filteredRMData.costingHeadTemp ? filteredRMData.costingHeadTemp.value : costingHead,
      plantId: isSimulation && filteredRMData && filteredRMData.plantId ? filteredRMData.plantId.value : plantId,
      material_id: isSimulation && filteredRMData && filteredRMData.RMid ? filteredRMData.RMid.value : materialId,
      grade_id: isSimulation && filteredRMData && filteredRMData.RMGradeid ? filteredRMData.RMGradeid.value : gradeId,
      vendor_id: isSimulation && filteredRMData && filteredRMData.Vendorid ? filteredRMData.Vendorid.value : vendorId,
      technologyId: isSimulation ? props.technology : technologyId,
      net_landed_min_range: value.min,
      net_landed_max_range: value.max,
      statusId: CheckApprovalApplicableMaster(RM_MASTER_ID) ? APPROVAL_ID : 0,
      ListFor: ListFor,
      StatusId: statusString
    }

    if (isPagination === true) {
      setloader(true)
    }
    //THIS CONDTION IS FOR IF THIS COMPONENT IS RENDER FROM MASTER APPROVAL SUMMARY IN THIS NO GET API
    if (!props.isMasterSummaryDrawer) {
      dispatch(getRMImportDataList(filterData, skip, take, isPagination, dataObj, (res) => {

        if (isSimulation) {
          props?.changeTokenCheckBox(true)
        }
        if (res && res.status === 200) {
          setloader(false);

        } else if (res && res.response && res.response.status === 412) {
          setloader(false);

        } else {
          setloader(false);
        }

        if (res && res.status === 204) {
          setTotalRecordCount(0)
          setPageNo(0)
        }

        if (res && isPagination === false) {
          dispatch(disabledClass(false))
          setDisableDownload(false)
          setTimeout(() => {
            let button = document.getElementById('Excel-Downloads-rm-import')
            button && button.click()
          }, 500);
        }

        if (res) {
          let isReset = true
          setTimeout(() => {
            for (var prop in floatingFilterData) {
              if (isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
                if (floatingFilterData[prop] !== "") {
                  isReset = false
                }
              } else {

                if (prop !== "DepartmentName" && floatingFilterData[prop] !== "") {
                  isReset = false
                }
              }
            }
            // Sets the filter model via the grid API
            isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))
          }, 300);

          setTimeout(() => {
            setWarningMessage(false)
          }, 330);

          setTimeout(() => {
            setIsFilterButtonClicked(false)
          }, 600);
        }
      }))
    }
  }



  const onFloatingFilterChanged = (value) => {
    setDisableFilter(false)
    const model = gridOptions?.api?.getFilterModel();
    setFilterModel(model)

    if (rmImportDataList.length !== 0) {
      setNoData(searchNocontentFilter(value, noData))
    }
    if (!isFilterButtonClicked) {
      setWarningMessage(true)
    }
    if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {

      let isFilterEmpty = true

      if (model !== undefined && model !== null) {
        if (Object.keys(model).length > 0) {
          isFilterEmpty = false

          for (var property in floatingFilterData) {

            if (property === value.column.colId) {
              floatingFilterData[property] = ""
            }
          }
          setFloatingFilterData(floatingFilterData)
        }

        if (isFilterEmpty) {
          setWarningMessage(false)
          for (var prop in floatingFilterData) {

            if (isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
              if (prop !== "DepartmentName") {
                floatingFilterData[prop] = ""
              }
            } else {
              floatingFilterData[prop] = ""
            }
          }
          setFloatingFilterData(floatingFilterData)
        }
      }

    } else {
      if (value.column.colId === "EffectiveDate" || value.column.colId === "CreatedDate") {
        return false
      }
      setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
    }
  }


  const onSearch = () => {

    setWarningMessage(false)
    setIsFilterButtonClicked(true)
    setPageNo(1)
    setPageNoNew(1)
    setCurrentRowIndex(0)
    gridOptions?.columnApi?.resetColumnState();
    getDataList(null, null, null, null, null, 0, 0, globalTake, true, floatingFilterData)
  }


  const onBtPrevious = () => {
    if (currentRowIndex >= 10) {
      setPageNo(pageNo - 1)
      setPageNoNew(pageNo - 1)
      const previousNo = currentRowIndex - 10;
      getDataList(null, null, null, null, null, 0, previousNo, globalTake, true, floatingFilterData)
      setCurrentRowIndex(previousNo)
    }
  }

  const onBtNext = () => {

    if (pageSize.pageSize50 && pageNo >= Math.ceil(totalRecordCount / 50)) {
      return false
    }

    if (pageSize.pageSize100 && pageNo >= Math.ceil(totalRecordCount / 100)) {
      return false
    }

    if (currentRowIndex < (totalRecordCount - 10)) {
      setPageNo(pageNo + 1)
      setPageNoNew(pageNo + 1)
      const nextNo = currentRowIndex + 10;
      getDataList(null, null, null, null, null, 0, nextNo, globalTake, true, floatingFilterData)
      setCurrentRowIndex(nextNo)
    }
  };


  /**
  * @method editItemDetails
  * @description edit material type
  */
  const viewOrEditItemDetails = (Id, rowData = {}, isViewMode) => {
    console.log('rowData: ', rowData);
    let data = {
      isEditFlag: true,
      isViewFlag: isViewMode,
      Id: Id,
      costingTypeId: rowData.CostingTypeId,
      IsVendor: rowData.CostingHead === 'Vendor Based' ? true : rowData.CostingHead === 'Zero Based' ? false : rowData.CostingHead,
    }
    console.log('data: ', data);
    props.getDetails(data, rowData?.IsRMAssociated);
  }

  /**
  * @method deleteItem
  * @description confirm delete Raw Material details
  */
  const deleteItem = (Id) => {
    setShowPopup(true)
    setDeletedId(Id)
  }

  /**
  * @method confirmDelete
  * @description confirm delete Raw Material details
  */
  const confirmDelete = (ID) => {
    dispatch(deleteRawMaterialAPI(ID, (res) => {
      if (res.status === 417 && res.data.Result === false) {
        Toaster.error(res.data.Message)
      } else if (res && res.data && res.data.Result === true) {
        Toaster.success(MESSAGES.DELETE_RAW_MATERIAL_SUCCESS);
        resetState()
      }
    }));
    setShowPopup(false)
  }

  const onPopupConfirm = () => {
    confirmDelete(deletedId);
  }
  const closePopUp = () => {
    setShowPopup(false)
    setShowPopupBulk(false)
  }
  const onPopupConfirmBulk = () => {
    confirmDelete(deletedId);
  }

  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  const buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    let isEditbale = false
    let isDeleteButton = false


    if (EditAccessibility) {
      isEditbale = true
    } else {
      isEditbale = false
    }


    if (DeleteAccessibility && !rowData.IsRMAssociated) {
      isDeleteButton = true
    } else {
      isDeleteButton = false
    }


    return (
      <>
        {ViewRMAccessibility && <button title='View' className="View" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />}
        {isEditbale && <button title='Edit' className="Edit align-middle" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} />}
        {isDeleteButton && <button title='Delete' className="Delete align-middle" type={'button'} onClick={() => deleteItem(cellValue)} />}
      </>
    )
  };

  /**
  * @method costingHeadFormatter
  * @description Renders Costing head
  */
  const costingHeadFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;

    let data = (cellValue === true || cellValue === 'Vendor Based' || cellValue === 'VBC') ? 'Vendor Based' : 'Zero Based';

    return data;
  }


  const costFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue !== INR ? cellValue : '';
  }

  /**
  * @method effectiveDateFormatter
  * @description Renders buttons
  */
  const effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
  }

  /**
  * @method hyphenFormatter
  */
  const hyphenFormatter = (props) => {
    const cellValue = props?.value;
    return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
  }

  /**
  * @method shearingCostFormatter
  * @description Renders buttons
  */
  const shearingCostFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? cell : '-';
  }

  const statusFormatter = (props) => {
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    // CHANGE IN STATUS IN AFTER KAMAL SIR API
    return <div className={row.Status}>{row.DisplayStatus}</div>
  }

  /**
  * @method commonCostFormatter
  * @description Renders buttons
  */
  const commonCostFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? cell : '-';
  }
  /**
  * @method currencyFormatter
  * @description Renders buttons
  */
  const currencyFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? cell : '-';
  }


  const checkBoxRenderer = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;

    if (selectedRowForPagination?.length > 0) {
      selectedRowForPagination.map((item) => {
        if (item.RawMaterialId === props.node.data.RawMaterialId) {
          props.node.setSelected(true)
        }
        return null
      })
      return cellValue
    } else {
      return cellValue
    }

  }


  const formToggle = () => {
    props.formToggle()
  }

  const bulkToggle = () => {
    setisBulkUpload(true);
  }

  const closeBulkUploadDrawer = () => {
    setisBulkUpload(false);

    resetState()
  }

  /**
  * @method densityAlert
  * @description confirm Redirection to Material tab.
  */
  const densityAlert = () => {
    setShowPopupBulk(true)
  }


  const onGridReady = (params) => {
    setgridApi(params.api);

    setgridColumnApi(params.columnApi);
    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = (newPageSize) => {

    if (Number(newPageSize) === 10) {
      getDataList(null, null, null, null, null, 0, 0, 10, true, floatingFilterData)
      setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
      setGlobalTake(10)
      setPageNo(pageNoNew)
    }
    else if (Number(newPageSize) === 50) {
      getDataList(null, null, null, null, null, 0, 0, 50, true, floatingFilterData)
      setPageSize(prevState => ({ ...prevState, pageSize50: true, pageSize10: false, pageSize100: false }))
      setGlobalTake(50)
      if (pageNo > Math.ceil(totalRecordCount / 50)) {
        setPageNo(Math.ceil(totalRecordCount / 50))
        getDataList(null, null, null, null, null, 0, 0, 50, true, floatingFilterData)
      }
    }
    else if (Number(newPageSize) === 100) {
      getDataList(null, null, null, null, null, 0, 0, 100, true, floatingFilterData)
      setPageSize(prevState => ({ ...prevState, pageSize100: true, pageSize10: false, pageSize50: false }))
      setGlobalTake(100)
      if (pageNo > Math.ceil(totalRecordCount / 100)) {
        setPageNo(Math.ceil(totalRecordCount / 100))
        getDataList(null, null, null, null, null, 0, 0, 100, true, floatingFilterData)
      }
    }
    gridApi.paginationSetPageSize(Number(newPageSize));

  };

  const returnExcelColumn = (data = [], TempData) => {
    let temp = []
    temp = TempData && TempData.map((item) => {
      if (item.CostingHead === true) {
        item.CostingHead = 'Vendor Based'
        item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)
      } else if (item.CostingHead === false) {
        item.CostingHead = 'Zero Based'
        item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)
      } else {
        item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)
      }
      return item
    })
    return (

      <ExcelSheet data={temp} name={'RM Import'}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }


  const onExcelDownload = () => {
    dispatch(disabledClass(true))
    setDisableDownload(true)
    //let tempArr = gridApi && gridApi?.getSelectedRows()
    let tempArr = selectedRowForPagination
    if (tempArr?.length > 0) {
      setTimeout(() => {
        dispatch(disabledClass(false))
        setDisableDownload(false)
        let button = document.getElementById('Excel-Downloads-rm-import')
        button && button.click()
      }, 400);

    } else {

      getDataList(null, null, null, null, null, 0, 0, defaultPageSize, false, floatingFilterData) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    }

  }


  const onBtExport = () => {
    let tempArr = []

    //tempArr = gridApi && gridApi?.getSelectedRows()
    tempArr = selectedRowForPagination
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (allRmDataList ? allRmDataList : [])

    return returnExcelColumn(RMIMPORT_DOWNLOAD_EXCEl, tempArr)
  };

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
  }


  const resetState = () => {
    setIsFilterButtonClicked(false)
    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null);

    for (var prop in floatingFilterData) {
      if (isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
        if (prop !== "DepartmentName") {
          floatingFilterData[prop] = ""
        }
      } else {
        floatingFilterData[prop] = ""
      }
    }
    setFloatingFilterData(floatingFilterData)
    setWarningMessage(false)
    setPageNo(1)
    setPageNoNew(1)
    setCurrentRowIndex(0)
    getDataList(null, null, null, null, null, 0, 0, 10, true, floatingFilterData)
    dispatch(setSelectedRowForPagination([]))
    setGlobalTake(10)
    setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
    setDataCount(0)
  }


  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;

    return thisIsFirstColumn;

  }

  const onRowSelect = (event) => {

    var selectedRows = gridApi && gridApi?.getSelectedRows();
    if (selectedRows === undefined || selectedRows === null) {    //CONDITION FOR FIRST RENDERING OF COMPONENT
      selectedRows = selectedRowForPagination
    } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {  // CHECKING IF REDUCER HAS DATA

      let finalData = []
      if (event.node.isSelected() === false) {      // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

        for (let i = 0; i < selectedRowForPagination.length; i++) {
          if (selectedRowForPagination[i].RawMaterialId === event.data.RawMaterialId) {       // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
            continue;
          }
          finalData.push(selectedRowForPagination[i])
        }

      } else {
        finalData = selectedRowForPagination
      }
      selectedRows = [...selectedRows, ...finalData]
    }


    let uniqeArray = _.uniqBy(selectedRows, "RawMaterialId")           //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
    dispatch(setSelectedRowForPagination(uniqeArray))                   //SETTING CHECKBOX STATE DATA IN REDUCER
    setDataCount(uniqeArray.length)
    let finalArr = selectedRows
    let length = finalArr?.length
    let uniqueArray = _.uniqBy(finalArr, "RawMaterialId")

    if (isSimulation) {
      apply(uniqueArray, length)
    }
  }


  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: true,
    headerCheckboxSelectionFilteredOnly: true,
    headerCheckboxSelection: isSimulation ? isFirstColumn : false,
    checkboxSelection: isFirstColumn
  };


  const frameworkComponents = {
    totalValueRenderer: buttonFormatter,
    effectiveDateRenderer: effectiveDateFormatter,
    costingHeadRenderer: costingHeadFormatter,
    customNoRowsOverlay: NoContentFound,
    costFormatter: costFormatter,
    commonCostFormatter: commonCostFormatter,
    shearingCostFormatter: shearingCostFormatter,
    statusFormatter: statusFormatter,
    hyphenFormatter: hyphenFormatter,
    checkBoxRenderer: checkBoxRenderer,
    currencyFormatter: currencyFormatter

  };

  return (
    <div className={`ag-grid-react custom-pagination ${isSimulation ? 'simulation-height' : 'min-height100vh'}  ${DownloadAccessibility ? "show-table-btn" : ""}`}>
      {(loader && !props.isMasterSummaryDrawer) ? <LoaderCustom customClass="simulation-Loader" /> :
        <>
          <Row className={`filter-row-large pt-4 ${isSimulation ? "zindex-0" : ""}`}>
            <Col md="3" lg="3">
              <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
            </Col>
            <Col md="9" lg="9" className=" mb-3 d-flex justify-content-end">
              {/* SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY */}
              {disableDownload && <div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"><WarningMessage dClass="ml-4 mt-1" message={MESSAGES.DOWNLOADING_MESSAGE} /></div>}
              {(!props.isMasterSummaryDrawer) && <>

                {isSimulation &&
                  <div className="warning-message d-flex align-items-center">
                    {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                    <button disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                  </div>
                }
                {!isSimulation &&
                  <div className="d-flex justify-content-end bd-highlight w100">
                    <>
                      {
                        <div className="warning-message d-flex align-items-center">
                          {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                        </div>
                      }

                      {
                        <button disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                      }

                      {AddAccessibility && (
                        <button
                          type="button"
                          className={"user-btn mr5"}
                          onClick={formToggle}
                          title="Add"
                        >
                          <div className={"plus mr-0"}></div>
                          {/* ADD */}
                        </button>
                      )}
                      {BulkUploadAccessibility && (
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
                        DownloadAccessibility &&
                        <>
                          {disableDownload ? <div className='p-relative mr5'> <LoaderCustom customClass={"download-loader"} /> <button type="button" className={'user-btn'}><div className="download mr-0"></div>
                          </button></div> :

                            <>
                              <button type="button" onClick={onExcelDownload} className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                {/* DOWNLOAD */}
                              </button>

                              <ExcelFile filename={'RM Import'} fileExtension={'.xls'} element={
                                <button id={'Excel-Downloads-rm-import'} className="p-absolute" type="button" >
                                </button>}>
                                {onBtExport()}
                              </ExcelFile>

                            </>

                          }
                        </>
                      }
                    </>
                  </div>
                }
                <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                  <div className="refresh mr-0"></div>
                </button>
              </>}
            </Col>
          </Row>
          <Row>
            <Col>
              <div className={`ag-grid-wrapper ${(rmImportDataList && rmImportDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                <SelectRowWrapper dataCount={dataCount} className="mb-1 mt-n1" />
                <div className={`ag-theme-material ${loader && "max-loader-height"}`}>
                  {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                  <AgGridReact
                    style={{ height: '100%', width: '100%' }}
                    defaultColDef={defaultColDef}
                    floatingFilter={true}

                    domLayout='autoHeight'
                    rowData={rmImportDataList}
                    pagination={true}
                    paginationPageSize={globalTake}
                    onGridReady={onGridReady}
                    gridOptions={gridOptions}
                    noRowsOverlayComponent={'customNoRowsOverlay'}
                    noRowsOverlayComponentParams={{
                      title: EMPTY_DATA,
                      imagClass: 'imagClass'
                    }}
                    frameworkComponents={frameworkComponents}
                    rowSelection={'multiple'}
                    onFilterModified={onFloatingFilterChanged}
                    //onSelectionChanged={onRowSelect}
                    onRowSelected={onRowSelect}
                    suppressRowClickSelection={true}
                  >
                    <AgGridColumn cellClass="has-checkbox" field="CostingHead" headerName='Costing Head' cellRenderer={checkBoxRenderer}></AgGridColumn>
                    <AgGridColumn field="TechnologyName" headerName='Technology'></AgGridColumn>
                    <AgGridColumn field="RawMaterial" ></AgGridColumn>
                    <AgGridColumn field="RMGrade"></AgGridColumn>
                    <AgGridColumn field="RMSpec"></AgGridColumn>
                    <AgGridColumn field="RawMaterialCode" headerName='Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                    <AgGridColumn field="Category"></AgGridColumn>
                    <AgGridColumn field="MaterialType"></AgGridColumn>
                    <AgGridColumn field="Plant" headerName="Plant(Code)"></AgGridColumn>
                    <AgGridColumn field="VendorName" headerName="Vendor(Code)"></AgGridColumn>
                    <AgGridColumn field="CustomerName" headerName="CustomerName" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                    {/* <AgGridColumn field="DepartmentName" headerName="Department"></AgGridColumn> */}
                    <AgGridColumn field="UOM"></AgGridColumn>
                    <AgGridColumn field="Currency" cellRenderer={"currencyFormatter"}></AgGridColumn>
                    <AgGridColumn field="BasicRate" cellRenderer='commonCostFormatter'></AgGridColumn>
                    <AgGridColumn field="ScrapRate" cellRenderer='commonCostFormatter'></AgGridColumn>
                    <AgGridColumn field="RMFreightCost" headerName="Freight Cost" cellRenderer='commonCostFormatter'></AgGridColumn>
                    <AgGridColumn field="RMShearingCost" headerName="Shearing Cost" cellRenderer='shearingCostFormatter'></AgGridColumn>
                    <AgGridColumn field="NetLandedCost" headerName="Net Cost (Currency)" cellRenderer='costFormatter'></AgGridColumn>
                    <AgGridColumn field="NetLandedCostConversion" headerName="Net Cost(INR)" cellRenderer='costFormatter'></AgGridColumn>

                    <AgGridColumn field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                    {(!isSimulation && !props.isMasterSummaryDrawer) && <AgGridColumn width={160} field="RawMaterialId" cellClass={"actions-wrapper"} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                    <AgGridColumn field="VendorId" hide={true}></AgGridColumn>

                    <AgGridColumn field="TechnologyId" hide={true}></AgGridColumn>
                  </AgGridReact>
                  <div className='button-wrapper'>
                    {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={globalTake} />}

                    <div className="d-flex pagination-button-container">
                      <p><button className="previous-btn" type="button" disabled={false} onClick={() => onBtPrevious()}> </button></p>
                      {pageSize.pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 10)}</p>}
                      {pageSize.pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 50)}</p>}
                      {pageSize.pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 100)}</p>}
                      <p><button className="next-btn" type="button" onClick={() => onBtNext()}> </button></p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </>
      }
      {
        isBulkUpload && (
          <BulkUpload
            isOpen={isBulkUpload}
            closeDrawer={closeBulkUploadDrawer}
            isEditFlag={false}
            densityAlert={densityAlert}
            fileName={"RMImport"}
            isZBCVBCTemplate={true}
            messageLabel={"RM Import"}
            anchor={"right"}
            isFinalApprovar={isFinalLevelUser}
          />
        )
      }
      {
        showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`} />
      }
      {
        showPopupBulk && <PopupMsgWrapper isOpen={showPopupBulk} closePopUp={closePopUp} confirmPopup={onPopupConfirmBulk} message={`Recently Created Material's Density is not created, Do you want to create?`} />
      }
    </div >
  );
}


export default RMImportListing;

