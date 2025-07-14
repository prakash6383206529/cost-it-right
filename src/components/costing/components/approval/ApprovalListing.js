import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { getApprovalList, } from '../../actions/Approval'
import { getConfigurationKey, handleDepartmentHeader, loggedInUserId, userDetails } from '../../../../helper/auth'
import ApprovalSummary from './ApprovalSummary'
import NoContentFound from '../../../common/NoContentFound'
import { defaultPageSize, DRAFT, EMPTY_DATA, EMPTY_GUID, REJECTED, ZBCTypeId } from '../../../../config/constants'
import DayTime from '../../../common/DayTimeWrapper'
import CostingApproveReject from './CostingApproveReject'
import { allEqual, checkForDecimalAndNull, checkForNull, formViewData, getLocalizedCostingHeadValue, removeSpaces, searchNocontentFilter, setLoremIpsum } from '../../../../helper'
import { PENDING } from '../../../../config/constants'
import Toaster from '../../../common/Toaster'
import imgArrowDown from "../../../../assests/images/arrow-down.svg";
import imgArrowUP from "../../../../assests/images/arrow-up.svg";
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../../common/LoaderCustom'
import { Redirect } from 'react-router'
import WarningMessage from '../../../common/WarningMessage'
import { getVolumeDataByPartAndYear } from '../../../masters/actions/Volume'
import { getSingleCostingDetails, setCostingApprovalData, setCostingViewData, checkFinalUser, getReleaseStrategyApprovalDetails, setIsMultiVendor, setApplicabilityForChildParts } from '../../actions/Costing'
import SendForApproval from './SendForApproval'
import CostingDetailSimulationDrawer from '../../../simulation/components/CostingDetailSimulationDrawer'
import { PaginationWrapper } from '../../../common/commonPagination'
import _ from 'lodash';
import { checkFinalLevelApproverForApproval, setSelectedRowForPagination } from '../../../simulation/actions/Simulation'
import SingleDropdownFloationFilter from '../../../masters/material-master/SingleDropdownFloationFilter'
import { agGridStatus, isResetClick, getGridHeight, dashboardTabLock } from '../../../../actions/Common'
import PopupMsgWrapper from '../../../common/PopupMsgWrapper'
import ScrollToTop from '../../../common/ScrollToTop'
import { reactLocalStorage } from 'reactjs-localstorage'
import { costingTypeIdToApprovalTypeIdFunction } from '../../../common/CommonFunctions'
import TourWrapper from '../../../common/Tour/TourWrapper'
import { Steps } from '../TourMessages'
import { useTranslation } from 'react-i18next';
import { useLabels } from '../../../../helper/core'
import { fetchDivisionId } from '../../CostingUtil'
import CostingHeadDropdownFilter from '../../../masters/material-master/CostingHeadDropdownFilter'
import BulkDelete from '../../../../helper/BulkDelete'

const gridOptions = {};
const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]

function ApprovalListing(props) {
  const { isDashboard, delegation } = props
  const loggedUser = loggedInUserId()
  const [loader, setloader] = useState(false);
  const [approvalData, setApprovalData] = useState('')
  const [selectedRowData, setSelectedRowData] = useState([]);
  const { t } = useTranslation("Costing")
  const [approveDrawer, setApproveDrawer] = useState(false)
  const [openDraftDrawer, setOpenDraftDrawer] = useState(false)
  const [reasonId, setReasonId] = useState('')
  const [showApprovalSumary, setShowApprovalSummary] = useState(false)
  const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false)
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isOpen, setIsOpen] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const dispatch = useDispatch()
  const { selectedRowForPagination } = useSelector((state => state.simulation))
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const approvalList = useSelector(state => state.approval.approvalList)
  const approvalListDraft = useSelector(state => state.approval.approvalListDraft)
  const [showExtraData, setShowExtraData] = useState(false)
  const [render, setRender] = useState(false)
  //STATES BELOW ARE MADE FOR PAGINATION PURPOSE
  const [disableFilter, setDisableFilter] = useState(true)
  const [warningMessage, setWarningMessage] = useState(false)
  const [globalTake, setGlobalTake] = useState(defaultPageSize)
  const [filterModel, setFilterModel] = useState({});
  const [pageNo, setPageNo] = useState(1)
  const [pageNoNew, setPageNoNew] = useState(1)
  const [totalRecordCount, setTotalRecordCount] = useState(1)
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
  const [currentRowIndex, setCurrentRowIndex] = useState(0)
  const [noData, setNoData] = useState(false)
  const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
  const [floatingFilterData, setFloatingFilterData] = useState({ ApprovalNumber: "", CostingNumber: "", PartNumber: "", PartName: "", VendorName: "", PlantName: "", TechnologyName: "", NetPOPriceNew: "", OldPOPriceNew: "", Reason: "", EffectiveDate: "", CreatedBy: "", CreatedOn: "", RequestedBy: "", RequestedOn: "", CostingCurrency: "", ExchangeRateSourceName: "" })
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [releaseStrategyDetails, setReleaseStrategyDetails] = useState({})
  const [technologyForCosting, setTechnologyForCosting] = useState('')
  const [dataCount, setDataCount] = useState(0)
  const BulkDeleteType = _.get(props, 'BulkDeleteType', '')
  const isApproval = props.isApproval;
  let approvalGridData = isDashboard ? approvalList : approvalListDraft
  const statusColumnData = useSelector((state) => state.comman.statusColumnData);
  const { technologyLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels();
  var floatingFilterStatus = {
    maxValue: 1,
    suppressFilterButton: true,
    component: 'costingApproval',
    location: "costing"
  }
  const [selectedDataObj, setSelectedDataObj] = useState({
    DisplayStatus: [],
    DepartmentId: [],
    TechnologyName: [],
    PlantId: [],
    VendorId: [],
    ReasonId: [],
    EffectiveDate: [],
    PartNumber: [],
    TokenNo: []
  })
  const { vendorLabel } = useLabels()
  useEffect(() => {
    setIsSuperAdmin(userDetails()?.Role === "SuperAdmin")
    return () => {
      reactLocalStorage.setObject('receiverId', null);
    }
  }, [])

  useEffect(() => {
    if (props.activeTab === "3" || isDashboard) {
      resetState()
    }
    dispatch(isResetClick(false))
    dispatch(agGridStatus("", ""))
  }, [props.activeTab])


  useEffect(() => {
    if (approvalGridData?.length > 0) {
      setTotalRecordCount(approvalGridData[0].TotalRecordCount)
    }
    else {
      setNoData(false)
    }
    dispatch(getGridHeight({ value: approvalGridData?.length, component: 'costingApproval' }))
  }, [approvalGridData])


  useEffect(() => {
    setTimeout(() => {
      if (statusColumnData && statusColumnData.data) {
        setDisableFilter(false)
        setWarningMessage(true)
        setFloatingFilterData(prevState => ({ ...prevState, DisplayStatus: removeSpaces(statusColumnData.data) }))
      }
    }, 200)
  }, [statusColumnData])


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

  var filterParamsSecond = {
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
      var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
      setFloatingFilterData({ ...floatingFilterData, RequestedOn: newDate })
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
  //**  HANDLE TOGGLE EXTRA DATA */
  const toggleExtraData = (showTour) => {
    setRender(true)
    setTimeout(() => {
      setShowExtraData(showTour)
      setRender(false)
    }, 100);


  }
  var filterParamsThird = {
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
      var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
      setFloatingFilterData({ ...floatingFilterData, CreatedOn: newDate })
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
  const floatingFilterStatusCostingHead = {
    maxValue: 1,
    suppressFilterButton: true,
    component: CostingHeadDropdownFilter,
    onFilterChange: (originalValue, value) => {
      setWarningMessage(true);
      // setSelectedCostingHead(originalValue);
      setDisableFilter(false);
      setFloatingFilterData(prevState => ({
        ...prevState,
        CostingHead: value
      }));
    }
  };

  /**
   * @method getTableData
   * @description getting approval list table
   */

  const getTableData = (
    partNo = '00000000-0000-0000-0000-000000000000',
    createdBy = '00000000-0000-0000-0000-000000000000',
    requestedBy = '00000000-0000-0000-0000-000000000000',
    status = '00000000-0000-0000-0000-000000000000',
    skip = 0, take = 10, isPagination = true, dataObj

  ) => {
    if (isDashboard) {
      dataObj.DisplayStatus = props.status
    }
    let filterData = {
      loggedUser: loggedUser,
      logged_in_user_level_id: userDetails().LoggedInLevelId,
      partNo: partNo,
      createdBy: createdBy,
      requestedBy: requestedBy,
      status: status,
      isDashboard: isDashboard ?? false
    }
    setloader(true)
    isDashboard && dispatch(dashboardTabLock(true))        // LOCK DASHBOARD TAB WHEN LOADING
    dispatch(
      getApprovalList(filterData, skip, take, isPagination, dataObj, delegation, (res) => {
        if (res.status === 204 && res.data === '') {
          setloader(false)
          dispatch(dashboardTabLock(false))      // UNLOCK DASHBOARD TAB AFTER LOADING  
          setTotalRecordCount(0)
          setPageNo(0)
          let isReset = true
          setTimeout(() => {
            for (var prop in floatingFilterData) {
              if (props?.status) {   // CONDITION WHEN RENDERED FROM DASHBOARD
                if (prop !== 'DisplayStatus' && floatingFilterData[prop] !== "") {
                  isReset = false
                }
              }
              else {
                if (floatingFilterData[prop] !== "") {
                  isReset = false
                }
              }
            }

            // Sets the filter model via the grid API
            isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))
          }, 300);

          setTimeout(() => {
            setWarningMessage(false)
            dispatch(isResetClick(false))
          }, 330);

          setTimeout(() => {
            setIsFilterButtonClicked(false)
          }, 600);

        } else if (res && res.data && res.data.DataList) {
          let unSelectedData = res.data.DataList
          let temp = []


          unSelectedData.map(item => {
            if (item.Status !== PENDING) {
              temp.push(item.CostingId)
              return null
            }
            return temp
          })
          setloader(false)
          dispatch(dashboardTabLock(false))
          //  setTableData(Data)

          if (res) {
            let isReset = true
            setTimeout(() => {
              for (var prop in floatingFilterData) {
                if (props?.status) {    // CONDITION WHEN RENDERED FROM DASHBOARD
                  if (prop !== 'DisplayStatus' && floatingFilterData[prop] !== "") {
                    isReset = false
                  }
                }
                else {
                  if (floatingFilterData[prop] !== "") {
                    isReset = false
                  }
                }
              }
              // Sets the filter model via the grid API
              isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))
            }, 300);

            setTimeout(() => {
              setWarningMessage(false)
              dispatch(isResetClick(false))
            }, 330);

            setTimeout(() => {
              setIsFilterButtonClicked(false)
            }, 600);
          }
        } else {
          setloader(false)
        }
      }),
    )
  }

  const onFloatingFilterChanged = (value) => {
    setTimeout(() => {
      if ((isDashboard ? approvalList : approvalListDraft)?.length !== 0 || (isDashboard ? approvalList : approvalListDraft)?.length !== 0) setNoData(searchNocontentFilter(value, noData))
    }, 500);
    setDisableFilter(false)
    const model = gridOptions?.api?.getFilterModel();
    setFilterModel(model)
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

          for (var prop in floatingFilterData) {
            if (prop !== "DepartmentCode") {
              floatingFilterData[prop] = ""
            }
          }
          setFloatingFilterData(floatingFilterData)
          setWarningMessage(false)
        }
      }

    } else {

      if (value.column.colId === "EffectiveDate" || value.column.colId === "RequestedOn" || value.column.colId === "CreatedOn") {
        return false
      }
      setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
    }
  }


  const onSearch = () => {

    setWarningMessage(false)
    setIsFilterButtonClicked(true)
    setPageNo(1)
    setCurrentRowIndex(0)
    gridOptions?.columnApi?.resetColumnState();
    getTableData("", "", "", "", 0, globalTake, true, floatingFilterData)
  }

  const resetState = () => {
    dispatch(agGridStatus("", ""))
    dispatch(isResetClick(true))
    setIsFilterButtonClicked(false)
    gridOptions?.columnApi?.resetColumnState(null);
    gridOptions?.api?.setFilterModel(null);
    for (var prop in floatingFilterData) {

      if (prop !== "DepartmentCode") {
        floatingFilterData[prop] = ""
      }
    }
    setFloatingFilterData(floatingFilterData)
    setWarningMessage(false)
    setPageNo(1)
    setCurrentRowIndex(0)
    dispatch(setSelectedRowForPagination([]))
    getTableData("", "", "", "", 0, 10, true, floatingFilterData)
    setGlobalTake(10)
    setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
    setDataCount(0)
  }


  const onBtPrevious = () => {
    if (currentRowIndex >= 10) {
      setPageNo(pageNo - 1)
      setPageNoNew(pageNo - 1)
      const previousNo = currentRowIndex - 10;
      getTableData("", "", "", "", previousNo, globalTake, true, floatingFilterData)
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
      getTableData("", "", "", "", nextNo, globalTake, true, floatingFilterData)
      setCurrentRowIndex(nextNo)
    }
  };



  /**
   * @method linkableFormatter
   * @description Renders Name link
   */
  const linkableFormatter = (props) => {

    if (selectedRowForPagination?.length > 0) {
      selectedRowForPagination.map((item) => {

        if (item.CostingId === props.node.data.CostingId) {
          props.node.setSelected(true)
        }
        return null
      })

    }


    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    // Store receiverId in localStorage before returning cell
    if (row?.ReceiverId) {
      reactLocalStorage.setObject('receiverId', row.ReceiverId);
    }
    return (
      <Fragment>
        {(cell === '' || cell === null) ? <div className='ml-4'>-</div> : <div id={`Costing_Approval_No_${props?.rowIndex}`} onClick={() => viewDetails(row.ApprovalNumber, row.ApprovalProcessId, row?.ReceiverId)} className={'link'}>{cell}</div>}
      </Fragment >
    )
  }

  const closeUserDetails = () => {
    // setIsViewRM(false)
    setIsOpen(false)
    // setUserId("")

  }

  const viewDetailCostingID = (UserId, cell, row) => {

    if (row.CostingId && Object.keys(row.CostingId).length > 0) {
      dispatch(getSingleCostingDetails(row.CostingId, (res) => {
        if (res.data.Data) {
          let dataFromAPI = res.data.Data

          const tempObj = formViewData(dataFromAPI)
          dispatch(setCostingViewData(tempObj))
          setTechnologyForCosting(tempObj[0]?.technology)
          dispatch(setIsMultiVendor(dataFromAPI?.IsMultiVendorCosting))
          dispatch(setApplicabilityForChildParts(dataFromAPI?.CostingPartDetails?.IsIncludeChildPartsApplicabilityCost ?? false))

        }
      },
      ))
    }
    setIsOpen(true)
    // setUserId(UserId)
  }

  const hyperLinkableFormatter = (props) => {

    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return (
      <>
        <div
          id={`Costing_Approval_Costing_Id_${props?.rowIndex}`}
          onClick={() => viewDetailCostingID(row.UserId, cell, row)}
          className={'link'}
        >{cell}</div>
      </>
    )
  }

  const dateFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '-';
  }

  const priceFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return (
      <>
        <img className={`arrow-ico mr-1 ${(row.NetPOPrice === 0 || row.OldPOPrice === row.NetPOPrice || cell === null) ? '' : (row.OldPOPrice > row.NetPOPrice ? 'arrow-green' : 'arrow-red')}`} src={row.OldPOPrice > row.NetPOPrice ? imgArrowDown : imgArrowUP} alt="arro-up" />
        {cell != null ? row.NetPOPriceNew : '-'}
      </>
    )
  }

  const oldpriceFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return (
      <>
        {/* <img className={`${row.OldPOPrice > row.NetPOPrice ? 'arrow-ico mr-1 arrow-green' : 'mr-1 arrow-ico arrow-red'}`} src={row.OldPOPrice > row.NetPOPrice ? imgArrowDown : imgArrowUP} alt="arro-up" /> */}
        {cell != null ? cell : '-'}
      </>
    )
  }

  const requestedOnFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '-';
  }
  const reasonFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return !cell ? '-' : cell;
  }
  const basicRateFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return !cell ? '-' : checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice);
  }
  const lastApprovalFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? cell : '-';
  }

  const statusFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return <div className={cell}>{row.DisplayStatus}</div>
  }

  const renderPlant = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return (cell !== null && cell !== '-') ? `${cell}` : '-'
  }
  const renderCustomer = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return (cell !== null && cell !== '-') ? `${cell}` : '-'
  }

  const renderVendor = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return (cell !== null && cell !== '-') ? `${cell}` : '-'
  }


  const viewDetails = (approvalNumber, approvalProcessId, receiverId = null) => {
    setApprovalData({ approvalProcessId: approvalProcessId, approvalNumber: approvalNumber, receiverId: receiverId })
    setShowApprovalSummary(true)
    // props.closeDashboard()
    return (
      <ApprovalSummary
        approvalNumber={approvalNumber ? approvalNumber : '2345438'}
        approvalProcessId={approvalProcessId ? approvalProcessId : '1'}
      />
    )
  }

  const onRowSelect = (event) => {
    var selectedRows = gridApi.getSelectedRows();
    let temp = []


    if (selectedRows === undefined || selectedRows === null) {    //CONDITION FOR FIRST RENDERING OF COMPONENT
      selectedRows = selectedRowForPagination
    } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {  // CHECKING IF REDUCER HAS DATA

      let finalData = []
      if (event.node.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

        for (let i = 0; i < selectedRowForPagination.length; i++) {
          if (selectedRowForPagination[i].RawMaterialId === event.data.RawMaterialId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
            continue;
          }
          finalData.push(selectedRowForPagination[i])
        }

      } else {
        finalData = selectedRowForPagination
      }
      selectedRows = [...selectedRows, ...finalData]

    }

    let uniqeArray = _.uniqBy(selectedRows, "CostingId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
    dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
    let finalArr = selectedRows
    let uniqueArray = _.uniqBy(finalArr, "CostingId")



    uniqueArray && uniqueArray.map((item, index) => {
      if (item.IsApprovalLocked) {
        temp.push(item.CostingNumber)
        return false
      }
      return null
    })

    if (temp.length > 1) {
      Toaster.warning(`A part or it's child part/parent part  costing for costing numbers ${temp.map(item => item)} is under approval.Please approve that first.`)
      gridApi.deselectAll()
      setSelectedRowData([])
      return false
    } else if (temp.length === 1) {
      if (selectedRows[0]?.ApprovalLockedMessage && selectedRows[0]?.Status !== "PendingForApproval") {
        Toaster.warning(selectedRows[0]?.ApprovalLockedMessage)
        gridApi.deselectAll()
        return false
      }
    }

    let reasonArray = []
    let technologyArray = []
    let departmentArray = []
    let vendorArray = []
    let statusArray = []
    let effectiveDateArray = []
    let plantArray = []
    let partArray = []
    let tokenArr = []
    uniqeArray && uniqeArray.map((item) => {
      reasonArray.push(item.ReasonId)
      technologyArray.push(item.TechnologyId)
      departmentArray.push(item.DepartmentId)
      vendorArray.push(item.VendorId)
      statusArray.push(item.Status)
      effectiveDateArray.push(item.EffectiveDate)
      plantArray.push(item.PlantCode)
      partArray.push(item.PartNumber)
      tokenArr.push(item?.ApprovalNumber)
      return null
    })
    setSelectedDataObj({
      DisplayStatus: statusArray,
      DepartmentId: departmentArray,
      TechnologyName: technologyArray,
      PlantId: plantArray,
      VendorId: vendorArray,
      ReasonId: reasonArray,
      EffectiveDate: effectiveDateArray,
      PartNumber: partArray,
      TokenNo: tokenArr
    })

    // if (!allEqual(departmentArray)) {
    //   gridApi.deselectAll()
    //   Toaster.warning(`${handleDepartmentHeader()} should be same for sending costings for approval`)
    //   // return Toaster.warning("Purchase Group should be same for sending multiple costing for approval")   //RE
    // } else if (!allEqual(technologyArray)) {
    //   gridApi.deselectAll()
    //   Toaster.warning(`${technologyLabel} should be same for sending costings for approval`)
    // } else if (!allEqual(vendorArray)) {
    //   gridApi.deselectAll()
    //   Toaster.warning(`${vendorLabel} should be same for sending costings for approval`)
    // } else if (!allEqual(reasonArray)) {
    //   gridApi.deselectAll()
    //   Toaster.warning("Reason should be same for sending costings for approval")
    //   //REASON CHECK IS NOT APPLICABLE IN RE   //RE
    //   // else if (!allEqual(reasonArray)) {
    //   //   gridApi.deselectAll()
    //   //   Toaster.warning("Reason should be same for sending multiple costing for approval")
    //   // }
    // } else if (!allEqual(statusArray)) {
    //   gridApi.deselectAll()
    //   Toaster.warning('Status should be same for sending costings for approval')
    // } else if (!allEqual(effectiveDateArray)) {
    //   gridApi.deselectAll()
    //   Toaster.warning('Effective Date should be same for sending costings for approval')
    // } else if (!allEqual(plantArray)) {
    //   gridApi.deselectAll()
    //   Toaster.warning('Plant should be same for sending costings for approval')
    // } else {
    //   setReasonId(uniqeArray && uniqeArray[0]?.ReasonId)
    // }
    // if (uniqeArray.length > 1 && allEqual(vendorArray) && allEqual(plantArray) && allEqual(partArray)) {
    //   gridApi.deselectAll()
    //   Toaster.warning(`${vendorLabel} and Plant should be different against a Part number`)
    // }

    setSelectedRowData(uniqeArray)
    setDataCount(uniqeArray.length)
  }

  const costingIdObj = (list) => {
    let data = []
    list && list?.map(item => {
      let obj = {}
      obj.CostingId = item?.CostingId
      data.push(obj)
    })
    return data
  }

  const sendForApproval = () => {
    if (selectedRowData?.length === 0) {
      Toaster.warning("Please select at least one costing to send for approval.")
      return false
    }
    if (!allEqual(selectedDataObj.DisplayStatus)) {
      Toaster.warning('Please select same status for sending multiple costing for approval')
      return false
    }
    let requestObject = {
      LoggedInUserId: loggedInUserId(),
      Mode: 'Costing',
      ApprovalTokens: selectedDataObj.TokenNo,
    }
    dispatch(checkFinalLevelApproverForApproval(requestObject, res => {
      let Data = res?.data?.Data
      if (Data?.IsFinalApprover && !Data?.IsNotFinalApproverForAllToken) {
        setShowFinalLevelButton(false)
        setApproveDrawer(true)
      } else if (!Data?.IsFinalApprover && Data?.IsNotFinalApproverForAllToken) {
        Toaster.warning(Data?.Message)
        return false
      } else {
        setShowFinalLevelButton(true)
        const validationChecks = [
          {
            condition: !allEqual(selectedDataObj.PlantId),
            field: 'Plant'
          },
          {
            condition: !allEqual(selectedDataObj.DepartmentId),
            field: handleDepartmentHeader()
          },
          {
            condition: !allEqual(selectedDataObj.ReasonId),
            field: 'Reason'
          },
          {
            condition: !allEqual(selectedDataObj.PartNumber),
            field: 'Part Number'
          },
          {
            condition: !allEqual(selectedDataObj.VendorId),
            field: 'Vendor'
          },
          {
            condition: !allEqual(selectedDataObj.TechnologyName),
            field: 'Technology'
          },
          {
            condition: !allEqual(selectedDataObj.EffectiveDate),
            field: 'Effective Date'
          }
        ]
        const failedChecks = validationChecks
          .filter(check => check.condition)
          .map(check => check.field)

        if (failedChecks.length > 0) {
          const fields = failedChecks.join(', ')
          Toaster.warning(`${fields} should be same for sending multiple costing for approval`)
          return false
        }
        // MINDA
        if (initialConfiguration.IsReleaseStrategyConfigured && selectedRowData && selectedRowData[0]?.Status === DRAFT) {
          let dataList = costingIdObj(selectedRowData)
          let requestObject = {
            "RequestFor": "COSTING",
            "TechnologyId": selectedRowData[0].TechnologyId,
            "LoggedInUserId": loggedInUserId(),
            "ReleaseStrategyApprovalDetails": dataList
          }
          dispatch(getReleaseStrategyApprovalDetails(requestObject, (res) => {
            setReleaseStrategyDetails(res?.data?.Data)
            if (res?.data?.Data?.IsUserInApprovalFlow) {
              if (selectedRowData.length === 0) {
                Toaster.warning('Please select atleast one approval to send for approval.')
                return false
              }
              if (selectedRowData && selectedRowData[0]?.IsRegularizationLimitCrossed !== 'No') {
                setShowPopup(true)
              } else {
                sendForApprovalDrawer()
              }
            } else if (res?.data?.Data?.IsPFSOrBudgetingDetailsExist === false) {

              if (selectedRowData.length === 0) {
                Toaster.warning('Please select atleast one approval to send for approval.')
                return false
              }
              if (selectedRowData && selectedRowData[0]?.IsRegularizationLimitCrossed !== 'No') {
                setShowPopup(true)
              } else {
                sendForApprovalDrawer()
              }

            } else if (res?.data?.Data?.IsFinalApprover === true) {
              Toaster.warning('This is final level user')
            } else if (res?.data?.Result === false) {
              Toaster.warning(res?.data?.Message)
            } else {
              Toaster.warning('This user is not in approval cycle')
            }
          }))
        } else {

          if (selectedRowData.length === 0) {
            Toaster.warning('Please select atleast one approval to send for approval.')
            return false
          }
          if (selectedRowData && selectedRowData[0]?.IsRegularizationLimitCrossed !== 'No') {
            setShowPopup(true)
          } else {
            sendForApprovalDrawer()
          }

        }
      }
    }))
  }


  const sendForApprovalDrawer = () => {

    let temp = []

    selectedRowData && selectedRowData.map(item => {
      let costingObj = {}
      costingObj.typeOfCosting = item.TypeOfCosting
      costingObj.plantCode = item.PlantCode
      costingObj.plantName = item.PlantName
      costingObj.plantId = item.PlantId
      costingObj.vendorId = item.VendorId
      costingObj.vendorName = item.VendorName
      costingObj.vendorCode = item.VendorCode
      costingObj.vendorPlantId = item?.VendorPlantId
      costingObj.vendorPlantName = item?.VendorPlantName
      costingObj.vendorPlantCode = item?.VendorPlantCode
      costingObj.costingName = item.CostingNumber
      costingObj.costingId = item.CostingId
      costingObj.oldPrice = item.OldPOPrice
      costingObj.revisedPrice = item.NetPOPrice
      costingObj.nPOPriceWithCurrency = item.NetPOPriceOtherCurrency
      costingObj.currencyRate = item.CurrencyExchangeRate
      costingObj.variance = (item.OldPOPrice && item.OldPOPrice !== '-' ? item.OldPOPrice : 0) - (item.NetPOPrice && item.NetPOPrice !== '-' ? item.NetPOPrice : 0)
      costingObj.reason = ''
      costingObj.ecnNo = ''
      costingObj.effectiveDate = DayTime(item.EffectiveDate).format('YYYY-MM-DD HH:mm:ss')
      costingObj.isDate = item.EffectiveDate ? true : false
      costingObj.partNo = item.PartNumber
      costingObj.partId = item.PartId
      costingObj.partName = item.PartName
      costingObj.destinationPlantCode = item.DestinationPlantCode
      costingObj.destinationPlantName = item.DestinationPlantName
      costingObj.destinationPlantId = item.DestinationPlantId
      costingObj.technologyId = item?.TechnologyId
      costingObj.CostingHead = item?.CostingHead
      costingObj.costingTypeId = item.CostingTypeId
      costingObj.customerId = item.CustomerId
      costingObj.customerName = item.CustomerName
      costingObj.customerCode = item.CustomerCode
      costingObj.customer = item.Customer
      costingObj.BasicRate = item.BasicRate
      costingObj.BudgetedPrice=item?.BudgetedPrice
      costingObj.BudgetedPriceVariance=item?.BudgetedPriceVariance
      let date = costingObj.effectiveDate
      if (costingObj.effectiveDate) {
        let variance = Number(item.OldPOPrice && item.OldPOPrice !== '-' ? item.OldPOPrice : 0) - Number(item.NetPOPrice && item.NetPOPrice !== '-' ? item.NetPOPrice : 0)
        let month = new Date(date).getMonth()
        let year = ''
        let sequence = SEQUENCE_OF_MONTH[month]

        if (month <= 2) {
          year = `${new Date(date).getFullYear() - 1}-${new Date(date).getFullYear()}`
        } else {
          year = `${new Date(date).getFullYear()}-${new Date(date).getFullYear() + 1}`
        }
        dispatch(getVolumeDataByPartAndYear(item.PartId, year, item.CostingTypeId === ZBCTypeId ? item.PlantId : item.DestinationPlantId, item.VendorId, item.CustomerId, item.CostingTypeId, res => {
          if (res.data.Result === true || res.status === 202) {
            let approvedQtyArr = res.data.Data.VolumeApprovedDetails
            let budgetedQtyArr = res.data.Data.VolumeBudgetedDetails
            let actualQty = 0
            let totalBudgetedQty = 0
            let actualRemQty = 0
            approvedQtyArr.map((data) => {
              if (data.Sequence < sequence) {
                // if(data.Date <= moment(effectiveDate).format('dd/MM/YYYY')){ 
                //   actualQty += parseInt(data.ApprovedQuantity)
                // }
                actualQty += parseInt(data.ApprovedQuantity)
              } else if (data.Sequence >= sequence) {
                actualRemQty += parseInt(data.ApprovedQuantity)
              }
              return null
            })
            budgetedQtyArr.map((data) => {
              // if (data.Sequence >= sequence) {
              totalBudgetedQty += parseInt(data.BudgetedQuantity)
              // }
              return null
            })
            costingObj.consumptionQty = checkForNull(actualQty)
            costingObj.remainingQty = checkForNull(totalBudgetedQty - actualQty)
            costingObj.annualImpact = variance !== '' ? totalBudgetedQty * variance : 0
            costingObj.yearImpact = variance !== '' ? (totalBudgetedQty - actualQty) * variance : 0

          }
        }))
      }
      temp.push(costingObj)
      dispatch(setCostingApprovalData(temp))
      return null
    })
    let divisionReqData = {
      "PlantId": selectedRowData[0].PlantId,
      "PartId": selectedRowData[0].PartId
    }
    fetchDivisionId(divisionReqData, dispatch).then((divisionId) => {
      selectedRowData[0].DivisionId = divisionId
      let obj = {
        DepartmentId: selectedRowData[0].Status === DRAFT ? EMPTY_GUID : selectedRowData[0]?.DepartmentId,
        UserId: loggedInUserId(),
        TechnologyId: selectedRowData[0].TechnologyId,
        Mode: 'costing',
        approvalTypeId: costingTypeIdToApprovalTypeIdFunction(selectedRowData[0]?.ApprovalTypeId ?? selectedRowData[0]?.CostingTypeId),
        plantId: selectedRowData[0].PlantId ?? EMPTY_GUID,
        divisionId: divisionId,
        ReceiverId: selectedRowData[0]?.ReceiverId
      }

      dispatch(checkFinalUser(obj, res => {
        if (res && res.data && res.data.Result) {
          if (selectedRowData[0].Status === DRAFT) {
            setOpenDraftDrawer(res.data.Data.IsFinalApprover ? false : true)
            if (res.data.Data.IsFinalApprover) {
              Toaster.warning("Final level approver can not send draft costing for approval")
              gridApi.deselectAll()
            }
          }
          else {
            setShowFinalLevelButton(!res.data.Data.IsFinalApprover)
            setApproveDrawer(true)
          }
        }
      }))
    })
  }

  const closeDrawer = (e = '', type) => {
    setApproveDrawer(false)
    gridApi.deselectAll()
    if (type !== "cancel") {
      getTableData("", "", "", "", 0, 10, true, floatingFilterData)
    }
  }

  const closeShowApproval = (e = '', type) => {
    setOpenDraftDrawer(false)
    gridApi.deselectAll()
    if (type !== "Cancel") {
      getTableData("", "", "", "", 0, 10, true, floatingFilterData)
    }
  }

  const isFirstColumn = (params) => {
    var displayedColumns = params.columnApi.getAllDisplayedColumns();
    var thisIsFirstColumn = displayedColumns[0] === params.column;

    return thisIsFirstColumn;
  }

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,
    headerCheckboxSelectionFilteredOnly: true,
    headerCheckboxSelection: isFirstColumn,
    checkboxSelection: isFirstColumn
  };
  setTimeout(() => {
    const checkBoxInstance = document.querySelectorAll('.ag-input-field-input.ag-checkbox-input');

    checkBoxInstance.forEach((checkBox, index) => {
      const specificId = `Simulation_Approval_Checkbox${index}`;
      checkBox.id = specificId;
    })
  }, 2000);
  const floatingFilterInstances = document.querySelectorAll('.ag-input-field-input.ag-text-field-input');
  floatingFilterInstances.forEach((floatingFilter, index) => {
    const specificId = `Simulation_Approval_Floating${index}`;
    floatingFilter.id = specificId;
  });

  const onGridReady = (params) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    const checkBoxInstance = document.querySelectorAll('.ag-input-field-input.ag-checkbox-input');

    checkBoxInstance.forEach((checkBox, index) => {
      const specificId = `Costing_Approval_Checkbox${index}`;
      checkBox.id = specificId;
    })

    const floatingFilterInstances = document.querySelectorAll('.ag-input-field-input.ag-text-field-input');
    floatingFilterInstances.forEach((floatingFilter, index) => {
      const specificId = `Costing_Approval_Floating${index}`;
      floatingFilter.id = specificId;
    });
    params.api.paginationGoToPage(0);
  };

  const onPageSizeChanged = (newPageSize) => {
    if (Number(newPageSize) === 10) {
      getTableData("", "", "", "", currentRowIndex, 10, true, floatingFilterData)
      setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
      setGlobalTake(10)
      setPageNo(pageNoNew)
    }
    else if (Number(newPageSize) === 50) {
      setPageSize(prevState => ({ ...prevState, pageSize50: true, pageSize10: false, pageSize100: false }))
      setGlobalTake(50)

      if (pageNo >= Math.ceil(totalRecordCount / 50)) {
        setPageNo(Math.ceil(totalRecordCount / 50))
        getTableData("", "", "", "", 0, 50, true, floatingFilterData)
      } else {
        getTableData("", "", "", "", currentRowIndex, 50, true, floatingFilterData)
      }
    }
    else if (Number(newPageSize) === 100) {
      setPageSize(prevState => ({ ...prevState, pageSize100: true, pageSize10: false, pageSize50: false }))
      setGlobalTake(100)
      if (pageNo >= Math.ceil(totalRecordCount / 100)) {
        setPageNo(Math.ceil(totalRecordCount / 100))
        getTableData("", "", "", "", 0, 100, true, floatingFilterData)
      } else {
        getTableData("", "", "", "", currentRowIndex, 100, true, floatingFilterData)
      }
    }

    gridApi.paginationSetPageSize(Number(newPageSize));
    if (isDashboard) {
      props?.isPageNoChange('costing')
    }
  };

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
  }

  const onPopupConfirm = () => {
    setShowPopup(false)
    sendForApprovalDrawer()
  }

  const closePopUp = () => {
    setShowPopup(false)
  }
  const renderRowData = () => {
    if (isDashboard) {
      return approvalList; // Return simulationApprovalList if isDashboard is true
    } else {
      if (showExtraData && approvalListDraft && approvalListDraft.length > 0) {
        return [...setLoremIpsum(approvalListDraft[0]), ...approvalListDraft]; // Apply the second operation if showExtraData is true
      } else {
        return approvalListDraft; // Return simulationApprovalListDraft if showExtraData is false
      }
    }
  }
  const combinedCostingHeadRenderer = (props) => {
    // Call the existing checkBoxRenderer

    // Get and localize the cell value
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);

    // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
    return localizedValue;
  };
  const frameworkComponents = {
    combinedCostingHeadRenderer: combinedCostingHeadRenderer,
    renderPlant: renderPlant,
    renderCustomer: renderCustomer,
    renderVendor: renderVendor,
    priceFormatter: priceFormatter,
    oldpriceFormatter: oldpriceFormatter,
    dateFormatter: dateFormatter,
    requestedOnFormatter: requestedOnFormatter,
    statusFormatter: statusFormatter,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
    linkableFormatter: linkableFormatter,
    hyperLinkableFormatter: hyperLinkableFormatter,
    reasonFormatter: reasonFormatter,
    lastApprovalFormatter: lastApprovalFormatter,
    statusFilter: SingleDropdownFloationFilter,
    basicRateFormatter: basicRateFormatter,
    statusFilterCostingHead: CostingHeadDropdownFilter
  };

  const isRowSelectable = rowNode => {
    return rowNode.data ? (rowNode.data.Status === PENDING || rowNode.data.Status === DRAFT) : false;
  }
  if (showApprovalSumary === true) {

    return <Redirect
      to={{
        pathname: "/approval-summary",
        state: {
          approvalNumber: approvalData.approvalNumber,
          approvalProcessId: approvalData.approvalProcessId,
          receiverId: approvalData.receiverId,
          fromDashboard: isDashboard // Add this flag
        }
      }}
    />
  }

  return (
    <Fragment>
      {
        !showApprovalSumary &&
        <> {

          <div className={` ${!isApproval && 'container-fluid'} approval-listing-page ${loader ? 'dashboard-loader' : ''}`} id={'approval-go-to-top'}>
            {(loader) ? <LoaderCustom customClass={isDashboard ? "dashboard-loader" : "loader-center"} /> : <div>
              {!isDashboard && <ScrollToTop pointProp={"approval-go-to-top"} />}
              <form noValidate>
                <Row className="pt-4 blue-before">
                  <Col md="6" lg="6" className="search-user-block mb-3">

                    <div className="d-flex justify-content-end bd-highlight w100">
                      <div className="warning-message d-flex align-items-center">
                        {warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                        <button id='Costing_Approval_Filter' disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                      </div >
                      {BulkDeleteType && <BulkDelete type={BulkDeleteType} deletePermission={true} dataCount={dataCount} bulkDeleteData={selectedRowData}/>}
                      <div>
                        <button type="button" id="Costing_Approval_Reset" className="user-btn mr-2" title="Reset Grid" onClick={() => resetState()}>
                          <div className="refresh mr-0"></div>
                        </button>
                        {!props.hidesendBtn && <button
                          id={"Costing_Approval_Send"}
                          title="Send For Approval"
                          class="user-btn approval-btn"
                          type='button'
                          onClick={sendForApproval}
                          disabled={((isDashboard ? (approvalList && approvalList.length === 0) : (approvalListDraft && approvalListDraft.length === 0)) || isSuperAdmin) ? true : false}
                        >
                          <div className="send-for-approval mr-0" ></div>
                        </button>}
                      </div>
                    </div >
                  </Col >
                </Row >
              </form >
              <Row>
                <Col>
                  <div className={`ag-grid-react grid-parent-wrapper custom-pagination`}>

                    <div id={'parentId'} className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative ${isDashboard ? (approvalList && approvalList?.length <= 0) || noData ? "overlay-contain" : "" : (approvalListDraft && approvalListDraft?.length <= 0) || noData ? "overlay-contain" : ""} ${isDashboard ? "grid-parent-wrapper" : ""}`}>
                      <div className="ag-grid-header">
                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                        {!isDashboard && <TourWrapper
                          buttonSpecificProp={{
                            id: "costing_approval_listing_Tour", onClick: toggleExtraData
                          }}
                          stepsSpecificProp={{
                            steps: Steps(t).COSTING_APPROVAL
                          }} />}
                      </div>
                      <div className="ag-theme-material">
                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found approval-listing" />}
                        {render ? <LoaderCustom customClass="loader-center" /> : <AgGridReact
                          floatingFilter={true}
                          style={{ height: '100%', width: '100%' }}
                          defaultColDef={defaultColDef}
                          domLayout='autoHeight'
                          // columnDefs={c}
                          rowData={renderRowData()}
                          pagination={true}
                          paginationPageSize={globalTake}
                          onGridReady={onGridReady}
                          gridOptions={gridOptions}
                          //loadingOverlayComponent={'customLoadingOverlay'}
                          noRowsOverlayComponent={'customNoRowsOverlay'}
                          noRowsOverlayComponentParams={{
                            title: EMPTY_DATA,
                            imagClass: "imagClass"
                          }}
                          frameworkComponents={frameworkComponents}
                          suppressRowClickSelection={true}
                          rowSelection={'multiple'}
                          // frameworkComponents={frameworkComponents}
                          onFilterModified={onFloatingFilterChanged}
                          //onSelectionChanged={onRowSelect}
                          onRowSelected={onRowSelect}
                          isRowSelectable={isRowSelectable}
                          enableBrowserTooltips={true}
                        >
                          <AgGridColumn field="CostingId" hide dataAlign="center" searchable={false} ></AgGridColumn>
                          <AgGridColumn cellClass="has-checkbox" field="ApprovalNumber" cellRenderer='linkableFormatter' headerName="Approval No."></AgGridColumn>
                          {/* {isApproval && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" field="Status" cellRenderer='statusFormatter' headerName="Status" floatingFilterComponent="statusFilter" floatingFilterComponentParams={floatingFilterStatus} ></AgGridColumn>} */}
                          <AgGridColumn field="CostingNumber" headerName="Costing Id" cellRenderer='hyperLinkableFormatter' ></AgGridColumn>
                          <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'combinedCostingHeadRenderer'} floatingFilterComponentParams={floatingFilterStatusCostingHead}
                            floatingFilterComponent="statusFilterCostingHead" ></AgGridColumn>
                          <AgGridColumn field="CostingCurrency" headerName="Costing Currency" ></AgGridColumn>
                          <AgGridColumn field="ExchangeRateSourceName" headerName="Exchange Rate Source Name" ></AgGridColumn>
                          <AgGridColumn field="PartNumber" headerName='Part No.'></AgGridColumn>
                          <AgGridColumn field="PartName" headerName="Part Name"></AgGridColumn>
                          <AgGridColumn field="VendorName" cellRenderer='renderVendor' headerName={`${vendorLabel} (Code)`}></AgGridColumn>
                          <AgGridColumn field="PlantName" cellRenderer='renderPlant' headerName="Plant (Code)"></AgGridColumn>
                          {reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="Customer" cellRenderer='renderCustomer' headerName="Customer (Code)"></AgGridColumn>}
                          <AgGridColumn field='TechnologyName' headerName={technologyLabel}></AgGridColumn>
                          {initialConfiguration?.IsBasicRateAndCostingConditionVisible && <AgGridColumn field="BasicRate" cellRenderer='basicRateFormatter' headerName="Basic Price"></AgGridColumn>}
                          <AgGridColumn field="OldPOPriceNew" cellRenderer='oldpriceFormatter' headerName="Existing Net Cost"></AgGridColumn>
                          <AgGridColumn field="NetPOPriceNew" cellRenderer='priceFormatter' headerName="Revised Net Cost"></AgGridColumn>
                          <AgGridColumn field="NCCPartQuantity" headerName="Quantity" cellRenderer={"reasonFormatter"} ></AgGridColumn>
                          <AgGridColumn field="IsRegularized" headerName="Is Regularized" cellRenderer={"reasonFormatter"} ></AgGridColumn>
                          <AgGridColumn field='Reason' headerName="Reason" cellRenderer={"reasonFormatter"}></AgGridColumn>
                          <AgGridColumn field="EffectiveDate" cellRenderer='dateFormatter' headerName="Effective Date" filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                          <AgGridColumn field="CreatedBy" headerName="Initiated By" ></AgGridColumn>
                          <AgGridColumn field="CreatedOn" cellRenderer='dateFormatter' headerName="Created On" filter="agDateColumnFilter" filterParams={filterParamsThird}></AgGridColumn>
                          <AgGridColumn field="RequestedBy" headerName="Last Approved/Rejected By" cellRenderer={"lastApprovalFormatter"}></AgGridColumn>
                          <AgGridColumn field="RequestedOn" cellRenderer='requestedOnFormatter' headerName="Requested On" filter="agDateColumnFilter" filterParams={filterParamsSecond}></AgGridColumn>
                          {!isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="Status" tooltipField="TooltipText" cellRenderer='statusFormatter' headerName="Status" floatingFilterComponent="statusFilter" floatingFilterComponentParams={floatingFilterStatus}></AgGridColumn>}
                        </AgGridReact>}

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
                        {
                          showPopup && <PopupMsgWrapper className={'main-modal-container'} isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`Quantity for this costing lies between regularization limit & maximum deviation limit. Do you wish to continue?`} />
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right pb-3">
                    <WarningMessage message="It may take up to 5 minutes for the status to be updated." />
                  </div>
                </Col>
              </Row>
            </div >}
          </div >
        }</>

        // :
        // // <Redirect
        // //   to={{
        // //       pathname: "/approval-summary",
        // //   }}/>
        // <ApprovalSummary
        //   approvalNumber={approvalData.approvalNumber}
        //   approvalProcessId={approvalData.approvalProcessId}
        // /> //TODO list
      }
      {approveDrawer && (
        <CostingApproveReject
          type={'Approve'}
          isOpen={approveDrawer}
          reasonId={reasonId}
          closeDrawer={closeDrawer}
          //tokenNo={approvalNumber}
          approvalData={selectedRowData}
          anchor={'right'}
          IsNotFinalLevel={showFinalLevelButtons}
          costingTypeId={selectedRowData[0]?.CostingTypeId}
          TechnologyId={selectedRowData[0]?.TechnologyId}
          releaseStrategyDetails={releaseStrategyDetails}
          isApprovalListing={true}
        />
      )}
      {
        openDraftDrawer &&
        <SendForApproval
          isOpen={openDraftDrawer}
          closeDrawer={closeShowApproval}
          anchor={'right'}
          isApprovalisting={true}
          dataSelected={selectedRowData}
          selectedRows={selectedRowData}
          technologyId={selectedRowData[0].TechnologyId}
          callSapCheckAPI={false}
        />
      }
      {
        isOpen &&
        <CostingDetailSimulationDrawer
          isOpen={isOpen}
          isReport={isOpen}
          closeDrawer={closeUserDetails}
          anchor={"right"}
          isSummaryDrawer={isOpen}
          selectedRowData={selectedRowData}
          isSimulation={false}
          simulationDrawer={false}
          selectedTechnology={technologyForCosting}
        />
      }
    </Fragment >
  )
}

export default ApprovalListing
