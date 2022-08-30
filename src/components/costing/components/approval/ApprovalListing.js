import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { getApprovalList, } from '../../actions/Approval'
import { loggedInUserId, userDetails } from '../../../../helper/auth'
import ApprovalSummary from './ApprovalSummary'
import NoContentFound from '../../../common/NoContentFound'
import { defaultPageSize, DRAFT, EMPTY_DATA, EMPTY_GUID } from '../../../../config/constants'
import DayTime from '../../../common/DayTimeWrapper'
import ApproveRejectDrawer from './ApproveRejectDrawer'
import { allEqual, checkForDecimalAndNull, checkForNull, formViewData, searchNocontentFilter } from '../../../../helper'
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
import CalculatorWrapper from '../../../common/Calculator/CalculatorWrapper'
import { getVolumeDataByPartAndYear } from '../../../masters/actions/Volume'
import { getSingleCostingDetails, setCostingApprovalData, setCostingViewData, checkFinalUser } from '../../actions/Costing'
import SendForApproval from './SendForApproval'
import CostingDetailSimulationDrawer from '../../../simulation/components/CostingDetailSimulationDrawer'
import { PaginationWrapper } from '../../../common/commonPagination'
import _ from 'lodash';
import { setSelectedRowForPagination } from '../../../simulation/actions/Simulation'

const gridOptions = {};
const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]

function ApprovalListing(props) {
  const { isDashboard } = props
  const loggedUser = loggedInUserId()
  const [loader, setloader] = useState(false);
  const [approvalData, setApprovalData] = useState('')
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [approveDrawer, setApproveDrawer] = useState(false)
  const [openDraftDrawer, setOpenDraftDrawer] = useState(false)
  const [reasonId, setReasonId] = useState('')
  const [showApprovalSumary, setShowApprovalSummary] = useState(false)
  const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false)
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useDispatch()
  const { selectedRowForPagination } = useSelector((state => state.simulation))
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const approvalList = useSelector(state => state.approval.approvalList)
  const approvalListDraft = useSelector(state => state.approval.approvalListDraft)

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
  const [floatingFilterData, setFloatingFilterData] = useState({ ApprovalNumber: "", CostingNumber: "", PartNumber: "", PartName: "", VendorName: "", PlantName: "", TechnologyName: "", NetPOPrice: "", OldPOPrice: "", Reason: "", EffectiveDate: "", CreatedBy: "", CreatedOn: "", RequestedBy: "", RequestedOn: "" })

  const isApproval = props.isApproval;
  let approvalGridData = isDashboard ? approvalList : approvalListDraft

  useEffect(() => {
    getTableData("", "", "", "", 0, defaultPageSize, true, floatingFilterData)
  }, [])


  useEffect(() => {
    if (approvalGridData?.length > 0) {
      setTotalRecordCount(approvalGridData[0].TotalRecordCount)
    }
    else {
      setNoData(false)
    }

  }, [approvalGridData])


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

    dispatch(
      getApprovalList(filterData, skip, take, isPagination, dataObj, (res) => {
        if (res.status === 204 && res.data === '') {
          setloader(false)
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
          //  setTableData(Data)

          if (res) {
            let isReset = true
            setTimeout(() => {
              for (var prop in floatingFilterData) {
                if (floatingFilterData[prop] !== "") {
                  isReset = false
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
        } else {
          setloader(false)
        }
      }),
    )
  }

  const onFloatingFilterChanged = (value) => {
    if ((isDashboard ? approvalList : approvalListDraft)?.length !== 0 || (isDashboard ? approvalList : approvalListDraft)?.length !== 0) setNoData(searchNocontentFilter(value, noData))
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
    return (
      <Fragment>
        {(cell === '' || cell === null) ? <div className='ml-4'>-</div> : <div onClick={() => viewDetails(row.ApprovalNumber, row.ApprovalProcessId)} className={'link'}>{cell}</div>}
      </Fragment>
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
        <img className={`${(row.NetPOPrice === 0 || row.OldPOPrice === row.NetPOPrice) ? '' : (row.OldPOPrice > row.NetPOPrice ? 'arrow-ico mr-1 arrow-green' : 'mr-1 arrow-ico arrow-red')}`} src={row.OldPOPrice > row.NetPOPrice ? imgArrowDown : imgArrowUP} alt="arro-up" />
        {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : '-'}
      </>
    )
  }

  const oldpriceFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return (
      <>
        {/* <img className={`${row.OldPOPrice > row.NetPOPrice ? 'arrow-ico mr-1 arrow-green' : 'mr-1 arrow-ico arrow-red'}`} src={row.OldPOPrice > row.NetPOPrice ? imgArrowDown : imgArrowUP} alt="arro-up" /> */}
        {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : '-'}
      </>
    )
  }

  const requestedOnFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '-';
  }
  const reasonFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? cell : '-';
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

  const renderVendor = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return (cell !== null && cell !== '-') ? `${cell}(${row.VendorCode})` : '-'
  }


  const viewDetails = (approvalNumber, approvalProcessId) => {
    setApprovalData({ approvalProcessId: approvalProcessId, approvalNumber: approvalNumber })
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
      Toaster.warning(selectedRows[0].ApprovalLockedMessage)
      gridApi.deselectAll()
      return false
    }

    let reasonArray = []
    let technologyArray = []
    let departmentArray = []
    let vendorArray = []
    let statusArray = []
    let effectiveDateArray = []
    let plantArray = []
    let partArray = []

    uniqeArray && uniqeArray.map((item) => {
      reasonArray.push(item.ReasonId)
      technologyArray.push(item.TechnologyId)
      departmentArray.push(item.DepartmentId)
      vendorArray.push(item.VendorId)
      statusArray.push(item.SimulationTechnologyHead)
      effectiveDateArray.push(item.EffectiveDate)
      plantArray.push(item.PlantCode)
      partArray.push(item.PartNumber)
      return null
    })

    if (!allEqual(departmentArray)) {
      gridApi.deselectAll()
      Toaster.warning("Department should be same for sending costings for approval")
    } else if (!allEqual(technologyArray)) {
      gridApi.deselectAll()
      Toaster.warning("Technology should be same for sending costings for approval")
    } else if (!allEqual(vendorArray)) {
      gridApi.deselectAll()
      Toaster.warning("Vendor should be same for sending costings for approval")
    } else if (!allEqual(reasonArray)) {
      gridApi.deselectAll()
      Toaster.warning("Reason should be same for sending costings for approval")
    } else if (!allEqual(statusArray)) {
      gridApi.deselectAll()
      Toaster.warning('Status should be same for sending costings for approval')
    } else if (!allEqual(effectiveDateArray)) {
      gridApi.deselectAll()
      Toaster.warning('Effective Date should be same for sending costings for approval')
    } else if (!allEqual(plantArray)) {
      gridApi.deselectAll()
      Toaster.warning('Plant should be same for sending costings for approval')
    } else {
      setReasonId(uniqeArray && uniqeArray[0]?.ReasonId)
    }
    if (uniqeArray.length > 1 && allEqual(vendorArray) && allEqual(plantArray) && allEqual(partArray)) {
      gridApi.deselectAll()
      Toaster.warning('Vendor and Plant should be different against a Part number')
    }

    setSelectedRowData(uniqeArray)
  }


  const sendForApproval = () => {
    if (selectedRowData.length === 0) {
      Toaster.warning('Please select atleast one approval to send for approval.')
      return false
    }
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
        dispatch(getVolumeDataByPartAndYear(item.PartId, year, res => {
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
    let obj = {
      DepartmentId: selectedRowData[0].Status === DRAFT ? EMPTY_GUID : selectedRowData[0]?.DepartmentId,
      UserId: loggedInUserId(),
      TechnologyId: selectedRowData[0].TechnologyId,
      Mode: 'costing'
    }
    dispatch(checkFinalUser(obj, res => {
      if (res && res.data && res.data.Result) {
        if (selectedRowData[0].Status === DRAFT) {
          setOpenDraftDrawer(res.data.Data.IsFinalApprover ? false : true)
          if (res.data.Data.IsFinalApprover) {
            Toaster.warning("Final level aprrover can not send draft costing for aprroval")
            gridApi.deselectAll()
          }
        }
        else {
          setShowFinalLevelButton(res.data.Data.IsFinalApprover)
          setApproveDrawer(true)
        }
      }
    }))
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
    sortable: true,
    headerCheckboxSelectionFilteredOnly: true,
    headerCheckboxSelection: isFirstColumn,
    checkboxSelection: isFirstColumn
  };

  const onGridReady = (params) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
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
      getTableData("", "", "", "", currentRowIndex, 50, true, floatingFilterData)
      setPageSize(prevState => ({ ...prevState, pageSize50: true, pageSize10: false, pageSize100: false }))
      setGlobalTake(50)

      if (pageNo >= Math.ceil(totalRecordCount / 50)) {
        setPageNo(Math.ceil(totalRecordCount / 50))
        getTableData("", "", "", "", 0, 50, true, floatingFilterData)
      }
    }
    else if (Number(newPageSize) === 100) {
      getTableData("", "", "", "", currentRowIndex, 100, true, floatingFilterData)
      setPageSize(prevState => ({ ...prevState, pageSize100: true, pageSize10: false, pageSize50: false }))
      setGlobalTake(100)
      if (pageNo >= Math.ceil(totalRecordCount / 100)) {
        setPageNo(Math.ceil(totalRecordCount / 100))
        getTableData("", "", "", "", 0, 100, true, floatingFilterData)
      }
    }

    gridApi.paginationSetPageSize(Number(newPageSize));

  };

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
  }


  const frameworkComponents = {
    renderPlant: renderPlant,
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
    lastApprovalFormatter: lastApprovalFormatter
  };

  const isRowSelectable = rowNode => rowNode.data ? (rowNode.data.Status === PENDING || rowNode.data.Status === DRAFT) : false

  if (showApprovalSumary === true) {

    return <Redirect
      to={{
        pathname: "/approval-summary",
        state: {
          approvalNumber: approvalData.approvalNumber,
          approvalProcessId: approvalData.approvalProcessId
        }
      }}
    />
  }

  return (
    <Fragment>
      <CalculatorWrapper />

      {
        !showApprovalSumary &&
        <> {
          (loader) ? <LoaderCustom customClass="center-loader" /> :
            <div className={` ${!isApproval && 'container-fluid'} approval-listing-page`}>
              <form noValidate>
                <Row className="pt-4 blue-before">
                  <Col md="6" lg="6" className="search-user-block mb-3">

                    <div className="d-flex justify-content-end bd-highlight w100">
                      <div className="warning-message d-flex align-items-center">
                        {warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                        <button disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                      </div>
                      <div>
                        <button type="button" className="user-btn mr-2" title="Reset Grid" onClick={() => resetState()}>
                          <div className="refresh mr-0"></div>
                        </button>
                        <button
                          title="Send For Approval"
                          class="user-btn approval-btn"
                          type='button'
                          onClick={sendForApproval}
                          disabled={(isDashboard ? (approvalList && approvalList.length === 0) : (approvalListDraft && approvalListDraft.length === 0)) ? true : false}
                        >
                          <div className="send-for-approval mr-0" ></div>
                        </button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </form>
              <Row>
                <Col>
                  <div className={`ag-grid-react custom-pagination`}>

                    <div id={'parentId'} className={`ag-grid-wrapper height-width-wrapper min-height-auto ${isDashboard ? (approvalList && approvalList?.length <= 0) || noData ? "overlay-contain" : "" : (approvalListDraft && approvalListDraft?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                      <div className="ag-grid-header">
                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                      </div>
                      <div className="ag-theme-material">
                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found approval-listing" />}
                        <AgGridReact
                          floatingFilter={true}
                          style={{ height: '100%', width: '100%' }}
                          defaultColDef={defaultColDef}
                          domLayout='autoHeight'
                          // columnDefs={c}
                          rowData={isDashboard ? approvalList : approvalListDraft}
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
                        >
                          <AgGridColumn field="CostingId" hide dataAlign="center" searchable={false} ></AgGridColumn>
                          <AgGridColumn cellClass="has-checkbox" field="ApprovalNumber" cellRenderer='linkableFormatter' headerName="Approval No."></AgGridColumn>
                          {isApproval && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" field="Status" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}
                          <AgGridColumn field="CostingNumber" headerName="Costing ID" cellRenderer='hyperLinkableFormatter' ></AgGridColumn>
                          <AgGridColumn field="PartNumber" headerName='Part No.'></AgGridColumn>
                          <AgGridColumn field="PartName" headerName="Part Name"></AgGridColumn>
                          <AgGridColumn field="VendorName" cellRenderer='renderVendor' headerName="Vendor"></AgGridColumn>
                          <AgGridColumn field="PlantName" cellRenderer='renderPlant' headerName="Plant"></AgGridColumn>
                          <AgGridColumn field='TechnologyName' headerName="Technology"></AgGridColumn>
                          <AgGridColumn field="NetPOPrice" cellRenderer='priceFormatter' headerName="New Price"></AgGridColumn>
                          <AgGridColumn field="OldPOPrice" cellRenderer='oldpriceFormatter' headerName="Old PO Price"></AgGridColumn>
                          <AgGridColumn field='Reason' headerName="Reason" cellRenderer={"reasonFormatter"}></AgGridColumn>
                          <AgGridColumn field="EffectiveDate" cellRenderer='dateFormatter' headerName="Effective Date" ></AgGridColumn>
                          <AgGridColumn field="CreatedBy" headerName="Initiated By" ></AgGridColumn>
                          <AgGridColumn field="CreatedOn" cellRenderer='dateFormatter' headerName="Created On" ></AgGridColumn>
                          <AgGridColumn field="RequestedBy" headerName="Last Approved/Rejected By" cellRenderer={"lastApprovalFormatter"}></AgGridColumn>
                          <AgGridColumn field="RequestedOn" cellRenderer='requestedOnFormatter' headerName="Requested On"></AgGridColumn>
                          {!isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}
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



                        <div className="text-right pb-3">
                          <WarningMessage message="It may take up to 5 minutes for the status to be updated." />
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
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
        <ApproveRejectDrawer
          type={'Approve'}
          isOpen={approveDrawer}
          reasonId={reasonId}
          closeDrawer={closeDrawer}
          //tokenNo={approvalNumber}
          approvalData={selectedRowData}
          anchor={'right'}
          IsFinalLevel={!showFinalLevelButtons}
        />
      )}
      {
        openDraftDrawer &&
        <SendForApproval
          isOpen={openDraftDrawer}
          closeDrawer={closeShowApproval}
          anchor={'right'}
          isApprovalisting={true}
          technologyId={selectedRowData[0].TechnologyId}
        />
      }
      {
        isOpen &&
        <CostingDetailSimulationDrawer
          isOpen={isOpen}
          closeDrawer={closeUserDetails}
          anchor={"right"}
          isReport={isOpen}
          selectedRowData={selectedRowData}
          isSimulation={false}
          simulationDrawer={false}
        />
      }
    </Fragment>
  )
}

export default ApprovalListing
