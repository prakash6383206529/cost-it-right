import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { getApprovalList, } from '../../actions/Approval'
import { loggedInUserId, userDetails } from '../../../../helper/auth'
import ApprovalSummary from './ApprovalSummary'
import NoContentFound from '../../../common/NoContentFound'
import { DRAFT, EMPTY_DATA } from '../../../../config/constants'
import DayTime from '../../../common/DayTimeWrapper'
import ApproveRejectDrawer from './ApproveRejectDrawer'
import { checkForDecimalAndNull, checkForNull } from '../../../../helper'
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
import { setCostingApprovalData } from '../../actions/Costing'
import SendForApproval from './SendForApproval'

const gridOptions = {};
const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]

function ApprovalListing(props) {
  const { isDashboard } = props
  const loggedUser = loggedInUserId()
  const [shown, setshown] = useState(false)
  const [dShown, setDshown] = useState(false)

  const [tableData, setTableData] = useState([])
  const [approvalData, setApprovalData] = useState('')
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [approveDrawer, setApproveDrawer] = useState(false)
  const [openDraftDrawer, setOpenDraftDrawer] = useState(false)
  const [selectedIds, setSelectedIds] = useState('')
  const [reasonId, setReasonId] = useState('')
  const [showApprovalSumary, setShowApprovalSummary] = useState(false)
  const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false)
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [rowData, setRowData] = useState(null);
  const [isLoader, setIsLoader] = useState(true)
  const dispatch = useDispatch()

  const partSelectList = useSelector((state) => state.costing.partSelectList)
  const statusSelectList = useSelector((state) => state.approval.costingStatusList)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const approvalList = useSelector(state => state.approval.approvalList)
  const userList = useSelector(state => state.auth.userList)

  const isApproval = props.isApproval;

  const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })
  useEffect(() => {
    getTableData()
  }, [])


  /**
   * @method getTableData
   * @description getting approval list table
   */

  const getTableData = (
    partNo = '00000000-0000-0000-0000-000000000000',
    createdBy = '00000000-0000-0000-0000-000000000000',
    requestedBy = '00000000-0000-0000-0000-000000000000',
    status = '00000000-0000-0000-0000-000000000000',
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

    dispatch(
      getApprovalList(filterData, (res) => {
        setIsLoader(false)
        if (res.status === 204 && res.data === '') {
          setTableData([])
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
          setSelectedIds(temp)
          let Data = res.data.DynamicData
          setShowFinalLevelButton(Data.IsFinalLevelButtonShow)
          //  setTableData(Data)
        } else {
          setTableData([])
        }
      }),
    )
  }


  /**
   * @method linkableFormatter
   * @description Renders Name link
   */
  const linkableFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return (
      <Fragment>
        <div
          onClick={() => viewDetails(row.ApprovalNumber, row.ApprovalProcessId)}
          className={'link'}
        >
          {(cell === '' || cell === null) ? '-' : cell}
        </div>
      </Fragment>
    )
  }

  const createdOnFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '';
  }

  const priceFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return (
      <>
        <img className={`${row.OldPOPrice > row.NetPOPrice ? 'arrow-ico mr-1 arrow-green' : 'mr-1 arrow-ico arrow-red'}`} src={row.OldPOPrice > row.NetPOPrice ? imgArrowDown : imgArrowUP} alt="arro-up" />
        {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : ''}
      </>
    )
  }

  const oldpriceFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return (
      <>
        {/* <img className={`${row.OldPOPrice > row.NetPOPrice ? 'arrow-ico mr-1 arrow-green' : 'mr-1 arrow-ico arrow-red'}`} src={row.OldPOPrice > row.NetPOPrice ? imgArrowDown : imgArrowUP} alt="arro-up" /> */}
        {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : ''}
      </>
    )
  }

  const requestedOnFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '';
  }

  const statusFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return <div className={cell}>{row.DisplayStatus}</div>
  }

  const renderPlant = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
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

  const allEqual = arr => arr.every(val => val === arr[0]);

  const onRowSelect = () => {
    var selectedRows = gridApi.getSelectedRows();

    let count = 0
    let technologyCount = 0
    let departmentCount = 0
    let statusArr = []

    selectedRows.forEach((element, index, arr) => {
      if (index > 0) {
        if (element.ReasonId !== arr[index - 1].ReasonId) {
          count = count + 1
        } else {
          return false
        }
      } else {
        return false
      }
    })
    selectedRows.forEach((element, index, arr) => {
      if (index > 0) {
        if (element.TechnologyId !== arr[index - 1].TechnologyId) {
          technologyCount = technologyCount + 1
        } else {
          return false
        }
      } else {
        return false
      }
    })

    selectedRows.forEach((element, index, arr) => {
      if (index > 0) {
        if (element.DepartmentId !== arr[index - 1].DepartmentId) {
          departmentCount = departmentCount + 1
        } else {
          return false
        }
      } else {
        return false
      }
    })

    selectedRows.map(item => statusArr.push(item.SimulationTechnologyHead))


    if (departmentCount > 0) {
      gridApi.deselectAll()
      return Toaster.warning("Department should be same for sending multiple costing for approval")
    }
    if (technologyCount > 0) {
      gridApi.deselectAll()
      return Toaster.warning("Technology should be same for sending multiple costing for approval")
    }
    if (count > 0) {
      // gridApi.deselectAll()
      // return Toaster.warning("Reason should be same for sending multiple costing for approval")
    }
    if (!allEqual(statusArr)) {
      Toaster.warning('Please select costing which have same status')
      gridApi.deselectAll()
    }

    else {
      setReasonId(selectedRows && selectedRows[0]?.ReasonId)
    }
    setSelectedRowData(selectedRows)
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
      costingObj.variance = Number(item.NetPOPrice && item.NetPOPrice !== '-' ? item.oldNetPOPrice : 0) - Number(item.NetPOPrice && item.NetPOPrice !== '-' ? item.NetPOPrice : 0)
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
        let variance = Number(item.poPrice && item.poPrice !== '-' ? item.oldPoPrice : 0) - Number(item.poPrice && item.poPrice !== '-' ? item.poPrice : 0)
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
            })
            budgetedQtyArr.map((data) => {
              // if (data.Sequence >= sequence) {
              totalBudgetedQty += parseInt(data.BudgetedQuantity)
              // }
            })
            costingObj.consumptionQty = checkForNull(actualQty)
            costingObj.remainingQty = checkForNull(totalBudgetedQty - actualQty)
            costingObj.annualImpact = variance !== '' ? totalBudgetedQty * variance : 0
            costingObj.yearImpact = variance !== '' ? (totalBudgetedQty - actualQty) * variance : 0

          }
        })

        )
      }
      temp.push(costingObj)
      dispatch(setCostingApprovalData(temp))
    })
    if (selectedRowData[0].Status === DRAFT) {
      setOpenDraftDrawer(true)
    } else {

      setApproveDrawer(true)
    }
  }

  const closeDrawer = (e = '') => {
    setApproveDrawer(false)
    getTableData()
    //setRejectDrawer(false)
  }

  const closeShowApproval = (e = '') => {
    setOpenDraftDrawer(false)
    gridApi.deselectAll()
    getTableData()
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
    headerCheckboxSelection: isFirstColumn,
    checkboxSelection: isFirstColumn
  };

  const onGridReady = (params) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.paginationGoToPage(0);

  };

  const onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById('page-size').value;
    gridApi.paginationSetPageSize(Number(value));
  };

  const onFilterTextBoxChanged = (e) => {
    gridApi.setQuickFilter(e.target.value);
  }


  const frameworkComponents = {
    renderPlant: renderPlant,
    renderVendor: renderVendor,
    priceFormatter: priceFormatter,
    oldpriceFormatter: oldpriceFormatter,
    createdOnFormatter: createdOnFormatter,
    requestedOnFormatter: requestedOnFormatter,
    statusFormatter: statusFormatter,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
    linkableFormatter: linkableFormatter,
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
  const resetState = () => {
    gridOptions?.columnApi?.resetColumnState();
  }
  return (
    <Fragment>
      <CalculatorWrapper />
      {
        !showApprovalSumary &&
        <div className={` ${!isApproval && 'container-fluid'} approval-listing-page`}>
          <form noValidate>

            {!isApproval && <h1 className="mb-0">Costing Approval</h1>}

            {isLoader && <LoaderCustom />}
            <Row className="pt-4 blue-before">
              <Col md="6" lg="6" className="search-user-block mb-3">

                <div className="d-flex justify-content-end bd-highlight w100">
                  <div>
                    <button type="button" className="user-btn mr-2" title="Reset Grid" onClick={() => resetState()}>
                      <div className="refresh mr-0"></div>
                    </button>
                    <button title="Send For Approval" class="user-btn approval-btn" type='button' onClick={sendForApproval}>
                      <div className="send-for-approval mr-0" ></div>
                    </button>
                  </div>
                </div>
              </Col>
            </Row>
          </form>
          <Row>
            <Col>
              <div className={`ag-grid-react`}>
                <div className={`ag-grid-wrapper height-width-wrapper min-height-auto ${approvalList && approvalList?.length <= 0 ? "overlay-contain" : ""}`}>
                  <div className="ag-grid-header">
                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                  </div>
                  <div
                    className="ag-theme-material"
                  >
                    <AgGridReact
                      floatingFilter={true}
                      style={{ height: '100%', width: '100%' }}
                      defaultColDef={defaultColDef}
                      domLayout='autoHeight'
                      // columnDefs={c}
                      rowData={approvalList}
                      pagination={true}
                      paginationPageSize={10}
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
                      onSelectionChanged={onRowSelect}
                      isRowSelectable={isRowSelectable}
                    >
                      <AgGridColumn field="CostingId" hide dataAlign="center" searchable={false} ></AgGridColumn>
                      <AgGridColumn cellClass="has-checkbox" field="ApprovalNumber" cellRenderer='linkableFormatter' headerName="Approval No."></AgGridColumn>
                      {isApproval && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" field="Status" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}
                      <AgGridColumn field="CostingNumber" headerName="Costing ID"></AgGridColumn>
                      <AgGridColumn field="PartNumber" headerName='Part No.'></AgGridColumn>
                      <AgGridColumn field="PartName" headerName="Part Name"></AgGridColumn>
                      <AgGridColumn field="VendorName" cellRenderer='renderVendor' headerName="Vendor"></AgGridColumn>
                      <AgGridColumn field="PlantName" cellRenderer='renderPlant' headerName="Plant"></AgGridColumn>
                      <AgGridColumn field='TechnologyName' headerName="Technology"></AgGridColumn>
                      <AgGridColumn field="NetPOPrice" cellRenderer='priceFormatter' headerName="New Price"></AgGridColumn>
                      <AgGridColumn field="OldPOPrice" cellRenderer='oldpriceFormatter' headerName="Old PO Price"></AgGridColumn>
                      <AgGridColumn field='Reason' headerName="Reason"></AgGridColumn>
                      <AgGridColumn field="CreatedBy" headerName="Initiated By" ></AgGridColumn>
                      <AgGridColumn field="CreatedOn" cellRenderer='createdOnFormatter' headerName="Created On" ></AgGridColumn>
                      <AgGridColumn field="RequestedBy" headerName="Last Approval"></AgGridColumn>
                      <AgGridColumn field="RequestedOn" cellRenderer='requestedOnFormatter' headerName="Requested On"></AgGridColumn>
                      {!isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="Status" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}
                    </AgGridReact>

                    <div className="paging-container d-inline-block float-right">
                      <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                        <option value="10" selected={true}>10</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
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

    </Fragment>
  )
}

export default ApprovalListing
