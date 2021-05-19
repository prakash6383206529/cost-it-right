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

function ApprovalListing() {
  const loggedUser = loggedInUserId()
  const [shown, setshown] = useState(false)

  const [tableData, setTableData] = useState([])
  const [partNoDropdown, setPartNoDropdown] = useState([])
  const [createdByDropdown, setCreatedByDropdown] = useState([])
  const [requestedByDropdown, setRequestedByDropdown] = useState([])
  const [statusDropdown, setStatusDropdown] = useState([])
  const [approvalData, setApprovalData] = useState('')
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [approveDrawer, setApproveDrawer] = useState(false)
  const [selectedIds, setSelectedIds] = useState('')

  const [showApprovalSumary, setShowApprovalSummary] = useState(false)
  const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false)
  const dispatch = useDispatch()

  const partSelectList = useSelector((state) => state.costing.partSelectList)
  const statusSelectList = useSelector((state) => state.approval.costingStatusList)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const approvalList = useSelector(state => state.approval.approvalList)
  const userList = useSelector(state => state.auth.userList)

  const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
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
  const linkableFormatter = (cell, row, enumObject, rowIndex) => {
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

  const createdOnFormatter = (cell, row, enumObject, rowIndex) => {
    console.log('cell: ', cell);
    return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
  }

  const priceFormatter = (cell, row, enumObject, rowIndex) => {
    return (
    <>
    <img className="arrow-ico mr-1 arrow-green" src={require("../../../../assests/images/arrow-up.svg")} alt="arro-up" />
    {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : ''}
    </>
    )
  }

  const oldpriceFormatter = (cell, row, enumObject, rowIndex) => {
    return (
    <>
    <img className="mr-1 arrow-ico arrow-red" src={require("../../../../assests/images/arrow-down.svg")} alt="arro-down" />
    {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : ''}
    </>
    )
  }

  const requestedOnFormatter = (cell, row, enumObject, rowIndex) => {
    return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
  }

  const statusFormatter = (cell, row, enumObject, rowIndex) => {
    return <div className={cell}>{row.DisplayStatus}</div>
  }

  const renderPlant = (cell, row, enumObject, rowIndex) => {
    return (cell !== null && cell !== '-') ? `${cell}(${row.PlantCode})` : '-'
  }

  const renderVendor = (cell, row, enumObject, rowIndex) => {
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




  const onRowSelect = (row, isSelected, e) => {
    if (isSelected) {
      let tempArr = [...selectedRowData, row]
      setSelectedRowData(tempArr)
    } else {
      const CostingId = row.CostingId;
      let tempArr = selectedRowData && selectedRowData.filter(el => el.CostingId !== CostingId)
      setSelectedRowData(tempArr)
    }
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
    setApproveDrawer(true)
  }

  const closeDrawer = (e = '') => {
    setApproveDrawer(false)
    getTableData()
    //setRejectDrawer(false)
  }

  return (
    <Fragment>
      {
        !showApprovalSumary ?
          <div className="container-fluid approval-listing-page">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              <h1 className="mb-0">Costing Approval</h1>


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
                          <img src={require("../../../../assests/images/times.png")} alt="cancel-icon.jpg" /></button>
                      ) : (
                        <button type="button" className="user-btn mr5" onClick={() => setshown(!shown)}>Show Filter</button>
                      )}
                      <button class="user-btn approval-btn" onClick={sendForApproval}>
                        <img
                          class="mr-1"
                          src={require('../../../../assests/images/send-for-approval.svg')}
                        ></img>{' '}
                        {'Send For Approval'}
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

            <BootstrapTable
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
              <TableHeaderColumn dataField="ApprovalNumber" columnTitle={true} dataAlign="left" dataSort={true} dataFormat={linkableFormatter} >{`Approval No.`}</TableHeaderColumn>
              <TableHeaderColumn dataField="CostingNumber" width={140} columnTitle={true} dataAlign="left" dataSort={false}>{'Costing Id'}</TableHeaderColumn>
              <TableHeaderColumn dataField="PartNumber" width={100} columnTitle={true} dataAlign="left" dataSort={false}>{'Part No.'}</TableHeaderColumn>
              <TableHeaderColumn dataField="PartName" columnTitle={true} dataAlign="left" dataSort={false}>{'Part Name'}</TableHeaderColumn>
              <TableHeaderColumn dataField="PlantName" columnTitle={true} dataAlign="left" dataSort={false} dataFormat={renderPlant}>{'Plant'}</TableHeaderColumn>
              <TableHeaderColumn dataField="VendorName" columnTitle={true} dataAlign="left" dataSort={false} dataFormat={renderVendor} >{'Vendor'}</TableHeaderColumn>

              <TableHeaderColumn dataField="NetPOPrice" columnTitle={true} dataAlign="left" dataFormat={priceFormatter} dataSort={false}>{'Price'}</TableHeaderColumn>
              <TableHeaderColumn dataField="OldPOPrice" columnTitle={true} dataAlign="left" dataFormat={oldpriceFormatter} dataSort={false}>{'Old PO Price'}</TableHeaderColumn>
              
              <TableHeaderColumn dataField="CreatedBy" columnTitle={true} dataAlign="left" dataSort={false} >{'Initiated By'}</TableHeaderColumn>
              <TableHeaderColumn dataField="CreatedOn" columnTitle={true} dataAlign="left" dataSort={false} dataFormat={createdOnFormatter} >{'Created On'} </TableHeaderColumn>
              <TableHeaderColumn dataField="RequestedBy" columnTitle={true} dataAlign="left" dataSort={false}>{'Requested By'} </TableHeaderColumn>
              <TableHeaderColumn dataField="RequestedOn" columnTitle={true} dataAlign="left" dataSort={false} dataFormat={requestedOnFormatter}> {'Requested On '}</TableHeaderColumn>
              <TableHeaderColumn dataField="Status" width={200} dataAlign="center" dataFormat={statusFormatter} export={false} >  Status  </TableHeaderColumn>
            </BootstrapTable>
          </div>
          :
          <ApprovalSummary
            approvalNumber={approvalData.approvalNumber}
            approvalProcessId={approvalData.approvalProcessId}
          /> //TODO list
      }
      {approveDrawer && (
        <ApproveRejectDrawer
          type={'Approve'}
          isOpen={approveDrawer}
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
