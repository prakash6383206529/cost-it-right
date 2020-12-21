import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { useDispatch } from 'react-redux';
import { getApprovalList } from '../actions/Approval';
import { loggedInUserId } from '../../../helper';
import { Badge } from 'reactstrap';
import { values } from 'lodash';

function ApprovalListing() {
  const loggedUser = loggedInUserId()
  console.log(loggedUser, 'user id')
  const [tableData, setTableData] = useState([])
  const [partNoDropdown, setPartNoDropdown] = useState([])
  const [createdByDropdown, setCreatedByDropdown] = useState([])
  const [requestedByDropdown, setRequestedByDropdown] = useState([])
  const [statusDropdown, setStatusDropdown] = useState([])
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    errors
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  useEffect(() => {
    getTableData()
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

    dispatch(
      getApprovalList(filterData, (res) => {
        console.log(res, 'Response for Approval List')
        if (res.status === 204 && res.data === '') {
          setTableData([])
        } else if (res && res.data && res.data.DataList) {
          let Data = res.data.DataList
          console.log(Data, 'Data')
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
  /**
   * @method onSubmit
   * @description filtering data on Apply button
  */
  const onSubmit = (values) => {
    console.log(values);
    const tempPartNo = values.partNo.value
    const tempcreatedBy = values.createdBy.value
    const tempRequestedBy = values.requestedBy.value
    const tempStatus = values.status.value
    getTableData(tempPartNo, tempcreatedBy, tempRequestedBy, tempStatus)
  }
/**
 * @method resetHandler
 * @description Reseting all filter
*/
const resetHandler = () => {
    getTableData()
}
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="col-sm-4">
          <h3>Costing Approval</h3>
        </div>
        <hr />
        <Row className="pt-30">
          <Col md="12" className="filter-block mb-2">
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
                  rules={{ required: true }}
                  register={register}
                  // defaultValue={plant.length !== 0 ? plant : ''}
                  options={partNoDropdown}
                  mandatory={false}
                  handleChange={() => {}}
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
                  rules={{ required: true }}
                  register={register}
                  // defaultValue={plant.length !== 0 ? plant : ''}
                  options={createdByDropdown}
                  mandatory={false}
                  handleChange={() => {}}
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
                  rules={{ required: true }}
                  register={register}
                  // defaultValue={plant.length !== 0 ? plant : ''}
                  options={requestedByDropdown}
                  mandatory={false}
                  handleChange={() => {}}
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
                  rules={{ required: true }}
                  register={register}
                  // defaultValue={plant.length !== 0 ? plant : ''}
                  options={statusDropdown}
                  mandatory={false}
                  handleChange={() => {}}
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
                  onClick={() => {}}
                  className="apply mr5"
                >
                  {'Apply'}
                </button>
              </div>
            </div>
          </Col>
          <Col md="12"  className="tag-container mb-4">
            <Badge color="secondary" pill className="mr-1 md-badge-blue-grey">Grant Marshall <a href=""><i className="ml-1 fa fa-times-circle"></i></a></Badge>
            <Badge color="secondary" pill className="md-badge-blue-grey">Kerri Barber <a href=""><i className="ml-1 fa fa-times-circle"></i></a></Badge>
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
        data={tableData}
        striped={false}
        hover={false}
        bordered={false}
        //options={''}
        search
        // exportCSV
        //ignoreSinglePage
        //ref={'table'}
        trClassName={'userlisting-row'}
        tableHeaderClass="my-custom-header"
        pagination
      >
        <TableHeaderColumn
          dataField="ApprovalNumber"
          columnTitle={true}
          dataAlign="center"
          dataSort={true}
          //dataFormat={this.costingHeadFormatter}
        >
          {`Approval No.`}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="CostingNumber"
          width={100}
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Costing Id'}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="PartNumber"
          width={100}
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Part No.'}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="PartName"
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Part Name'}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="CreatedBy"
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Created By'}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="CreatedOn"
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Created On'}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="RequestedBy"
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Requested By'}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="RequestedOn"
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Reuested On '}
        </TableHeaderColumn>
        <TableHeaderColumn
          className="action"
          dataField="Status"
          export={false}
          isKey={true}
          // dataFormat={this.buttonFormatter}
        >
          Status
        </TableHeaderColumn>
      </BootstrapTable>
    </>
  )
}

export default ApprovalListing
