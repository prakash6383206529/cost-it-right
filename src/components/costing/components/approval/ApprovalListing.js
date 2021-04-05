import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { SearchableSelectHookForm } from '../../../layout/HookFormInputs'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { useDispatch, useSelector } from 'react-redux'
import { getApprovalList } from '../../actions/Approval'
import { loggedInUserId } from '../../../../helper/auth'
import { Badge } from 'reactstrap'
import { values } from 'lodash'
import ApprovalSummary from './ApprovalSummary'
import {
  getAllPartSelectList,
  getCostingStatusSelectList,
} from '../../actions/Costing'
import NoContentFound from '../../../common/NoContentFound'
import { CONSTANT } from '../../../../helper/AllConastant'
import moment from 'moment'
import ApproveRejectDrawer from './ApproveRejectDrawer'
import { checkForDecimalAndNull } from '../../../../helper'

function ApprovalListing() {
  const loggedUser = loggedInUserId()

  const [tableData, setTableData] = useState([])
  const [partNoDropdown, setPartNoDropdown] = useState([])
  const [createdByDropdown, setCreatedByDropdown] = useState([])
  const [requestedByDropdown, setRequestedByDropdown] = useState([])
  const [statusDropdown, setStatusDropdown] = useState([])
  const [approvalData, setApprovalData] = useState('')
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [approveDrawer, setApproveDrawer] = useState(false)

  console.log(selectedRowData, "SELET");
  const [showApprovalSumary, setShowApprovalSummary] = useState(false)
  const dispatch = useDispatch()
  const partSelectList = useSelector((state) => state.costing.partSelectList)
  const statusSelectList = useSelector((state) => state.costing.costingStatusSelectList)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

  const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })
  useEffect(() => {
    getTableData()
    dispatch(getAllPartSelectList(() => { }))
    dispatch(getCostingStatusSelectList(() => { }))
  }, [])
  /**
   * @method getTableData
   * @description getting approval list table
   */

  const getTableData = (
    partNo = '',
    createdBy = ' ',
    requestedBy = ' ',
    status = ' ',
  ) => {
    let filterData = {
      loggedUser: loggedUser,
      partNo: partNo,
      createdBy: createdBy,
      requestedBy: requestedBy,
      status: status,
    }
    function uniqueFilter(data, key) {
      const arrayUniqueByKey = [
        ...new Map(data.map((item) => [item[key], item])).values(),
      ]
      return arrayUniqueByKey
    }

    dispatch(
      getApprovalList(filterData, (res) => {

        if (res.status === 204 && res.data === '') {
          setTableData([])
        } else if (res && res.data && res.data.DataList) {
          let Data = res.data.DataList

          const key = Data.CreatedBy
          let tempcreatedBy = []
          const createdArray = uniqueFilter(Data, key)
          createdArray &&
            createdArray.map((item) => {
              tempcreatedBy.push({
                label: item.CreatedBy,
                value: item.CreatedById,
              })
            })
          setRequestedByDropdown(tempcreatedBy)
          const key2 = Data.RequestedBy
          let tempRequestedBy = []
          const requestedArray = uniqueFilter(Data, key2)
          requestedArray &&
            requestedArray.map((item) => {
              tempRequestedBy.push({
                label: item.RequestedBy,
                value: item.RequestedById,
              })
            })
          setRequestedByDropdown(tempRequestedBy)
          setTableData(
            Data.sort((a, b) => a.Sequence - b.Sequence).sort(
              (a, b) => a.Index - b.Index,
            ),
          )
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
  }

  /**
   * @method onSubmit
   * @description filtering data on Apply button
   */
  const onSubmit = (values) => {
    console.log(values, "VAL");
    console.log(getValues('createdBy'), "PN", getValues('status'), "gggggggggggggg", getValues('requestedBy'));
    const tempPartNo = getValues('partNo') ? getValues('partNo').label : ''
    const tempcreatedBy = getValues('createdBy') ? getValues('createdBy').label : ''
    const tempRequestedBy = getValues('requestedBy') ? getValues('requestedBy').label : ''
    const tempStatus = getValues('status') ? getValues('status').label : ''
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
    return cell != null ? moment(cell).format('DD/MM/YYYY HH:mm') : '';
  }

  const priceFormatter = (cell, row, enumObject, rowIndex) => {
    return cell != null ? checkForDecimalAndNull(cell, initialConfiguration.NoOfDecimalForPrice) : '';
  }

  const requestedOnFormatter = (cell, row, enumObject, rowIndex) => {
    return cell != null ? moment(cell).format('DD/MM/YYYY HH:mm') : '';
  }

  const statusFormatter = (cell, row, enumObject, rowIndex) => {
    return <div className={cell}>{cell}</div>
  }

  const viewDetails = (approvalNumber, approvalProcessId) => {

    setApprovalData({ approvalProcessId: approvalProcessId, approvalNumber: approvalNumber })
    setShowApprovalSummary(true)
    return (
      <ApprovalSummary
        approvalNumber={approvalNumber ? approvalNumber : '2345438'}
        approvalProcessId={approvalProcessId ? approvalProcessId : '1'}
      /> //TODO list
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
    // unselectable: selectedIds,
    onSelect: onRowSelect,
    onSelectAll: onSelectAll,
  };

  const options = {
    clearSearch: true,
    noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
    //exportCSVText: 'Download Excel',
    //onExportToCSV: this.onExportToCSV,
    //paginationShowsTotal: true,
    //paginationShowsTotal: this.renderPaginationShowsTotal,

  }

  const sendForApproval = () => {
    console.log(selectedRowData, "seleted row data");
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
          <>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="col-sm-4">
                <h3>Costing Approval</h3>
              </div>
              <hr />

              <Row className="pt-30 mb-2">
                <Col lg="10" md="12" className="filter-block mb-2">
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
                        placeholder={'Created By'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        // defaultValue={plant.length !== 0 ? plant : ''}
                        options={createdByDropdown}
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
                        options={requestedByDropdown}
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
                <Row>
                  {/* <Col md="6"></Col> */}
                  <Col md="12" className="tag-container ml-12 mt-2">
                    <button class="user-btn mr-1 mb-2" onClick={sendForApproval}>
                      <img
                        class="mr-1"
                        src={require('../../../../assests/images/send-for-approval.svg')}
                      ></img>{' '}
                      {'Send For Approval'}
                    </button>
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
                </Row>

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
              data={tableData}
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
              <TableHeaderColumn dataField="ApprovalNumber" columnTitle={true} dataAlign="center" dataSort={true} dataFormat={linkableFormatter} >{`Approval No.`}</TableHeaderColumn>
              <TableHeaderColumn dataField="CostingNumber" width={100} columnTitle={true} dataAlign="center" isKey={true} dataSort={false}>{'Costing Id'}</TableHeaderColumn>
              <TableHeaderColumn dataField="PartNumber" width={100} columnTitle={true} dataAlign="center" dataSort={false}>{'Part No.'}</TableHeaderColumn>
              <TableHeaderColumn dataField="PartName" columnTitle={true} dataAlign="center" dataSort={false}>{'Part Name'}</TableHeaderColumn>
              <TableHeaderColumn dataField="NetPOPrice" columnTitle={true} dataAlign="center" dataFormat={priceFormatter} dataSort={false}>{'Price'}</TableHeaderColumn>
              <TableHeaderColumn dataField="CreatedBy" columnTitle={true} dataAlign="center" dataSort={false} >{'Created By'}</TableHeaderColumn>
              <TableHeaderColumn dataField="CreatedOn" columnTitle={true} dataAlign="center" dataSort={false} dataFormat={createdOnFormatter} >{'Created On'} </TableHeaderColumn>
              <TableHeaderColumn dataField="RequestedBy" columnTitle={true} dataAlign="center" dataSort={false}>{'Requested By'} </TableHeaderColumn>
              <TableHeaderColumn dataField="RequestedOn" columnTitle={true} dataAlign="center" dataSort={false} dataFormat={requestedOnFormatter}> {'Requested On '}</TableHeaderColumn>
              <TableHeaderColumn dataField="Status" dataFormat={statusFormatter} export={false} >  Status  </TableHeaderColumn>
            </BootstrapTable>
          </>
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
        />
      )}
    </Fragment>
  )
}

export default ApprovalListing
