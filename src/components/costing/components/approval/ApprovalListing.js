import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { SearchableSelectHookForm } from '../../../layout/HookFormInputs'
import { useForm, Controller } from 'react-hook-form'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { useDispatch, useSelector } from 'react-redux'
import { getApprovalList, getSelectedCostingList } from '../../actions/Approval'
import { loggedInUserId, userDetails } from '../../../../helper/auth'
import ApprovalSummary from './ApprovalSummary'
import { getAllPartSelectList, getCostingStatusSelectList, } from '../../actions/Costing'
import NoContentFound from '../../../common/NoContentFound'
import { CONSTANT } from '../../../../helper/AllConastant'
import moment from 'moment'
import ApproveRejectDrawer from './ApproveRejectDrawer'
import { checkForDecimalAndNull } from '../../../../helper'
import { getAllUserAPI } from '../../../../actions/auth/AuthActions'
import { PENDING } from '../../../../config/constants'
import { toastr } from 'react-redux-toastr'
import imgArrowDown from "../../../../assests/images/arrow-down.svg";
import imgArrowUP from "../../../../assests/images/arrow-up.svg";
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../../common/LoaderCustom'
import { Redirect } from 'react-router'

const gridOptions = {};

function ApprovalListing(props) {
  const loggedUser = loggedInUserId()
  const [shown, setshown] = useState(false)
  const [dShown,setDshown] = useState(false)

  const [tableData, setTableData] = useState([])
  const [partNoDropdown, setPartNoDropdown] = useState([])
  const [createdByDropdown, setCreatedByDropdown] = useState([])
  const [requestedByDropdown, setRequestedByDropdown] = useState([])
  const [statusDropdown, setStatusDropdown] = useState([])
  const [approvalData, setApprovalData] = useState('')
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [approveDrawer, setApproveDrawer] = useState(false)
  const [selectedIds, setSelectedIds] = useState('')
  const [reasonId, setReasonId] = useState('')
  const [showApprovalSumary, setShowApprovalSummary] = useState(false)
  const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false)
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [rowData, setRowData] = useState(null);
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
    dispatch(getAllPartSelectList(() => { }))
    dispatch(getSelectedCostingList(() => { }))
    dispatch(getAllUserAPI(() => { }))

  }, [])

  useEffect(() => {

  }, [selectedIds])

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
    }

    dispatch(
      getApprovalList(filterData, (res) => {

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

  const renderDropdownListing = (label) => {
    const tempDropdownList = []

    if (label === 'PartList') {
      partSelectList &&
        partSelectList.map((item) => {
          if (item.Value === '0') return false
          tempDropdownList.push({ label: item.Text, value: item.Value })
          return null
        })

      return tempDropdownList
    }

    if (label === 'Status') {
      statusSelectList &&
        statusSelectList.map((item) => {
          if (item.Value === '0') return false
          tempDropdownList.push({ label: item.Text, value: item.Value })
          return null
        })
      return tempDropdownList
    }
    if (label === 'users') {
      userList && userList.map((item) => {
        if (item.Value === '0') return false
        tempDropdownList.push({ label: item.Text, value: item.Value })
        return null
      })
      return tempDropdownList
    }
  }

  /**
   * @method onSubmit
   * @description filtering data on Apply button
   */
  const onSubmit = (values) => {
    const tempPartNo = getValues('partNo') ? getValues('partNo').value : '00000000-0000-0000-0000-000000000000'
    const tempcreatedBy = getValues('createdBy') ? getValues('createdBy').value : '00000000-0000-0000-0000-000000000000'
    const tempRequestedBy = getValues('requestedBy') ? getValues('requestedBy').value : '00000000-0000-0000-0000-000000000000'
    const tempStatus = getValues('status') ? getValues('status').value : '00000000-0000-0000-0000-000000000000'
    // const type_of_costing = 
    getTableData(tempPartNo, tempcreatedBy, tempRequestedBy, tempStatus)
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
          {cell}
        </div>
      </Fragment>
    )
  }

  const createdOnFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
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
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
  }

  const statusFormatter = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return <div className={cell}>{row.DisplayStatus}</div>
  }

  const renderPlant = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return (cell !== null && cell !== '-') ? `${cell}(${row.PlantCode})` : '-'
  }

  const renderVendor = (props) => {
    const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    return (cell !== null && cell !== '-') ? `${cell}(${row.VendorCode})` : '-'
  }

  const viewDetails = (approvalNumber, approvalProcessId) => {

    setApprovalData({ approvalProcessId: approvalProcessId, approvalNumber: approvalNumber })
    setShowApprovalSummary(true)
    return (
      <ApprovalSummary
        approvalNumber={approvalNumber ? approvalNumber : '2345438'}
        approvalProcessId={approvalProcessId ? approvalProcessId : '1'}
      />
    )
  }
  /**
   * @method resetHandler
   * @description Reseting all filter
   */
  const resetHandler = () => {
    setValue('partNo', '')
    setValue('createdBy', '')
    setValue('requestedBy', '')
    setValue('status', '')
    getTableData()
  }




  const onRowSelect = () => {
    var selectedRows = gridApi.getSelectedRows();
    setSelectedRowData(selectedRows)
    // if (isSelected) {
    //   let tempArr = [...selectedRowData, row]
    //   setSelectedRowData(tempArr)
    // } else {
    //   const CostingId = row.CostingId;
    //   let tempArr = selectedRowData && selectedRowData.filter(el => el.CostingId !== CostingId)
    //   setSelectedRowData(tempArr)
    // }
  }

  const onSelectAll = (isSelected, rows) => {
    if (isSelected) {
      setSelectedRowData(rows)
    } else {
      setSelectedRowData([])
    }
  }

  const selectRowProp = {
    mode: 'checkbox',
    clickToSelect: true,
    unselectable: selectedIds,
    onSelect: onRowSelect,
    onSelectAll: onSelectAll,
  };

  const options = {
    clearSearch: true,
    noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
    prePage: <span className="prev-page-pg"></span>, // Previous page button text
    nextPage: <span className="next-page-pg"></span>, // Next page button text
    firstPage: <span className="first-page-pg"></span>, // First page button text
    lastPage: <span className="last-page-pg"></span>,
    //exportCSVText: 'Download Excel',
    //onExportToCSV: this.onExportToCSV,
    //paginationShowsTotal: true,
    //paginationShowsTotal: this.renderPaginationShowsTotal,
  }

  const sendForApproval = () => {
    if (selectedRowData.length === 0) {
      toastr.warning('Please select atleast one approval to send for approval.')
      return false
    }
    let count = 0
    let technologyCount = 0
    selectedRowData.forEach((element, index, arr) => {
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
    selectedRowData.forEach((element, index, arr) => {
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
    if (technologyCount > 0) {
      return toastr.warning("Technology should be same for sending multiple costing for approval")
    }
    if (count > 0) {
      return toastr.warning("Reason should be same for sending multiple costing for approval")
    } else {
      setReasonId(selectedRowData[0].ReasonId)
    }
    setApproveDrawer(true)
  }

  const closeDrawer = (e = '') => {
    setApproveDrawer(false)
    getTableData()
    //setRejectDrawer(false)
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
    renderVendor: renderVendor,
    priceFormatter: priceFormatter,
    oldpriceFormatter: oldpriceFormatter,
    createdOnFormatter: createdOnFormatter,
    requestedOnFormatter: requestedOnFormatter,
    statusFormatter: statusFormatter,
    customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
    linkableFormatter: linkableFormatter
  };

  const isRowSelectable = rowNode => rowNode.data ? rowNode.data.Status === PENDING : false

  return (
    <Fragment>
      {
        !showApprovalSumary ?
          <div className={` ${!isApproval && 'container-fluid'} approval-listing-page`}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              {!isApproval && <h1 className="mb-0">Costing Approval</h1>}


              <Row className="pt-4 blue-before">
                {shown &&
                  <Col lg="10" md="12" className="filter-block">
                    <div className="d-inline-flex justify-content-start align-items-top w100">
                      <div className="flex-fills">
                        <h5>{`Filter By:`}</h5>
                      </div>

                      <div className="flex-fill filled-small hide-label">
                        <SearchableSelectHookForm
                          label={''}
                          name={'partNo'}
                          placeholder={'Part No.'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: false }}
                          register={register}
                          // defaultValue={plant.length !== 0 ? plant : ''}
                          options={renderDropdownListing('PartList')}
                          mandatory={false}
                          handleChange={() => { }}
                          errors={errors.partNo}
                        />
                      </div>
                      <div className="flex-fill filled-small hide-label">
                        <SearchableSelectHookForm
                          label={''}
                          name={'createdBy'}
                          placeholder={'Initiated By'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: false }}
                          register={register}
                          // defaultValue={plant.length !== 0 ? plant : ''}
                          options={renderDropdownListing('users')}
                          mandatory={false}
                          handleChange={() => { }}
                          errors={errors.createdBy}
                        />
                      </div>
                      <div className="flex-fill filled-small hide-label">
                        <SearchableSelectHookForm
                          label={''}
                          name={'requestedBy'}
                          placeholder={'Requested By'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: false }}
                          register={register}
                          // defaultValue={plant.length !== 0 ? plant : ''}
                          options={renderDropdownListing('users')}
                          mandatory={false}
                          handleChange={() => { }}
                          errors={errors.requestedBy}
                        />
                      </div>
                      <div className="flex-fill filled-small hide-label">
                        <SearchableSelectHookForm
                          label={''}
                          name={'status'}
                          placeholder={'Status'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: false }}
                          register={register}
                          // defaultValue={plant.length !== 0 ? plant : ''}
                          options={renderDropdownListing('Status')}
                          mandatory={false}
                          handleChange={() => { }}
                          errors={errors.status}
                        />
                      </div>


                      <div className="flex-fill filled-small hide-label">
                        <button
                          type="button"
                          //disabled={pristine || submitting}
                          onClick={resetHandler}
                          className="reset mr10"
                        >
                          {'Reset'}
                        </button>
                        <button
                          type="button"
                          //disabled={pristine || submitting}
                          onClick={onSubmit}
                          className="apply mr5"
                        >
                          {'Apply'}
                        </button>
                      </div>
                    </div>
                  </Col>
                }


                <Col md="6" lg="6" className="search-user-block mb-3">
                  <div className="d-flex justify-content-end bd-highlight w100">
                    <div>
                      {(shown) ? (
                        <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => setshown(!shown)}>
                          <div className="cancel-icon-white"></div></button>
                      ) : (
                        <button title="Filter" type="button" className="user-btn mr5" onClick={() => setshown(!shown)}>
                          <div className="filter mr-0"></div>
                        </button>
                      )}
                      <button title="send-for-approval" class="user-btn approval-btn" onClick={sendForApproval}>
                        <div className="send-for-approval mr-0" ></div>
                      </button>
                    </div>
                  </div>
                  {/* <Badge color="secondary" pill className="mr-1 md-badge-blue-grey">
                      Grant Marshall{' '}
                      <a href="">
                        <i className="ml-1 fa fa-times-circle"></i>
                      </a>
                    </Badge>
                    <Badge color="secondary" pill className="md-badge-blue-grey">
                      Kerri Barber{' '}
                      <a href="">
                        <i className="ml-1 fa fa-times-circle"></i>
                      </a>
                    </Badge> */}
                </Col>


                {/* <Col md="12"  className="mb-4">
            <Badge color="success" pill className="badge-small">Approved </Badge>
            <Badge color="danger" pill className="badge-small">Rejected</Badge>
            <Badge color="warning" pill className="badge-small">Pending for Approval</Badge>
          </Col> */}

                {/* <Col md="4" className="search-user-block">
            <div className="d-flex justify-content-end bd-highlight">
              <div>
                
            
                
              </div>
            </div>
          </Col> */}
              </Row>
            </form>

            {/* <BootstrapTable
              data={approvalList}
              striped={false}
              hover={false}
              bordered={false}
              options={options}
              search
              selectRow={selectRowProp}
              // exportCSV
              //ignoreSinglePage
              //ref={'table'}
              trClassName={'userlisting-row'}
              tableHeaderClass="my-custom-header"
              pagination
            >
              <TableHeaderColumn dataField="CostingId" isKey={true} hidden width={100} dataAlign="center" searchable={false} >{''}</TableHeaderColumn>
              <TableHeaderColumn dataField="ApprovalNumber" width={100} columnTitle={false} dataAlign="left" dataSort={true} dataFormat={linkableFormatter} >{`Approval No.`}</TableHeaderColumn>
              <TableHeaderColumn dataField="CostingNumber" width={90} columnTitle={true} dataAlign="left" dataSort={false}>{'Costing Id'}</TableHeaderColumn>
              <TableHeaderColumn dataField="PartNumber" width={90} columnTitle={true} dataAlign="left" dataSort={false}>{'Part No.'}</TableHeaderColumn>
              <TableHeaderColumn dataField="PartName" width={100} columnTitle={true} dataAlign="left" dataSort={false}>{'Part Name'}</TableHeaderColumn>
              <TableHeaderColumn dataField="PlantName" width={100} columnTitle={true} dataAlign="left" dataSort={false} dataFormat={renderPlant}>{'Plant'}</TableHeaderColumn>
              <TableHeaderColumn dataField="VendorName" width={100} columnTitle={true} dataAlign="left" dataSort={false} dataFormat={renderVendor} >{'Vendor'}</TableHeaderColumn>
              <TableHeaderColumn dataField="NetPOPrice" width={100} columnTitle={false} dataAlign="left" dataFormat={priceFormatter} dataSort={false}>{'New Price'}</TableHeaderColumn>
              <TableHeaderColumn dataField="OldPOPrice" width={100} columnTitle={false} dataAlign="left" dataFormat={oldpriceFormatter} dataSort={false}>{'Old PO Price'}</TableHeaderColumn>
              <TableHeaderColumn dataField={'Reason'} width={100} columnTitle={true} dataAlign="left" >{'Reason'}</TableHeaderColumn>
              <TableHeaderColumn dataField="CreatedBy" width={100} columnTitle={true} dataAlign="left" dataSort={false} >{'Initiated By'}</TableHeaderColumn>
              <TableHeaderColumn dataField="CreatedOn" width={100} columnTitle={true} dataAlign="left" dataSort={false} dataFormat={createdOnFormatter} >{'Created On'} </TableHeaderColumn>
              <TableHeaderColumn dataField="RequestedBy" width={100} columnTitle={true} dataAlign="left" dataSort={false}>{'Requested By'} </TableHeaderColumn>
              <TableHeaderColumn dataField="RequestedOn" width={100} columnTitle={true} dataAlign="left" dataSort={false} dataFormat={requestedOnFormatter}> {'Requested On '}</TableHeaderColumn>
              <TableHeaderColumn dataField="Status" width={140} dataAlign="center" dataFormat={statusFormatter} export={false} >  Status  </TableHeaderColumn>
            </BootstrapTable> */}
            <Row>
              <Col>
                <div className={`ag-grid-react`}>
                  <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                    <div className="ag-grid-header">
                      <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                    </div>
                    <div
                      className="ag-theme-material"
                    >
                      <AgGridReact
                        style={{ height: '100%', width: '100%' }}
                        defaultColDef={defaultColDef}
domLayout='autoHeight'
                        // columnDefs={c}
                        rowData={approvalList}
                        pagination={true}
                        paginationPageSize={10}
                        onGridReady={onGridReady}
                        gridOptions={gridOptions}
                        loadingOverlayComponent={'customLoadingOverlay'}
                        noRowsOverlayComponent={'customNoRowsOverlay'}
                        noRowsOverlayComponentParams={{
                          title: CONSTANT.EMPTY_DATA,
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
                        {isApproval && <AgGridColumn  headerClass="justify-content-center" cellClass="text-center" field="Status" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}
                        <AgGridColumn field="CostingNumber" headerName="Costing ID"></AgGridColumn>
                        <AgGridColumn field="PartNumber" headerName='Part No.'></AgGridColumn>
                        <AgGridColumn field="PartName" headerName="Part Name"></AgGridColumn>
                        <AgGridColumn field="PlantName" cellRenderer='renderPlant' headerName="Plant"></AgGridColumn>
                        <AgGridColumn field="VendorName" cellRenderer='renderVendor' headerName="Vendor"></AgGridColumn>
                        <AgGridColumn field="NetPOPrice" cellRenderer='priceFormatter' headerName="New Price"></AgGridColumn>
                        <AgGridColumn field="OldPOPrice" cellRenderer='oldpriceFormatter' headerName="Old PO Price"></AgGridColumn>
                        <AgGridColumn field='Reason' headerName="Reason"></AgGridColumn>
                        <AgGridColumn field="CreatedBy" headerName="Initiated By" ></AgGridColumn>
                        <AgGridColumn field="CreatedOn" cellRenderer='createdOnFormatter' headerName="Created On" ></AgGridColumn>
                        <AgGridColumn field="RequestedBy" headerName="Last Approval"></AgGridColumn>
                        <AgGridColumn field="RequestedOn" cellRenderer='requestedOnFormatter' headerName="Requested On"></AgGridColumn>
                        {!isApproval && <AgGridColumn  headerClass="justify-content-center" cellClass="text-center" field="Status" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}
                        

                      </AgGridReact>

                      <div className="paging-container d-inline-block float-right">
                        <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                          <option value="10" selected={true}>10</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

          </div>
          :
          // <Redirect
          //   to={{
          //       pathname: "/approval-summary",
          //   }}/>
          <ApprovalSummary
            approvalNumber={approvalData.approvalNumber}
            approvalProcessId={approvalData.approvalProcessId}
          /> //TODO list
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
    </Fragment>
  )
}

export default ApprovalListing
