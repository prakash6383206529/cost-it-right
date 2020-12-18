import React, { useState } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Row, Col } from 'reactstrap';
import { focusOnError, searchableSelect } from '../../layout/FormInputs';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

function ApprovalListing() {
    const [tableData, setTableData] = useState([])
  return (
    <>
      <form onSubmit={() => {}} noValidate>
        <div class="col-sm-4">
          <h3>Costing Approval</h3>
        </div>
        <hr />
        <Row className="pt-30">
          <Col md="8" className="filter-block">
            <div className="d-inline-flex justify-content-start align-items-top w100">
              <div className="flex-fills">
                <h5>{`Filter By:`}</h5>
              </div>

              <div className="flex-fill">
                <Field
                  name="partNo"
                  type="text"
                  label=""
                  component={searchableSelect}
                  placeholder={'Part No.'}
                  isClearable={false}
                  options={''}
                  //onKeyUp={(e) => this.changeItemDesc(e)}
                  //   validate={
                  //     this.state.year == null || this.state.year.length === 0
                  //       ? [required]
                  //       : []
                  //   }
                  required={true}
                  handleChangeDescription={() => {}}
                  //valueDescription={this.state.year}
                  //disabled={isEditFlag ? true : false}
                />
              </div>
              <div className="flex-fill">
                <Field
                  name="createdBy"
                  type="text"
                  label=""
                  component={searchableSelect}
                  placeholder={'Created By'}
                  isClearable={false}
                  options={''}
                  //onKeyUp={(e) => this.changeItemDesc(e)}
                  //   validate={
                  //     this.state.month == null || this.state.month.length === 0
                  //       ? [required]
                  //       : []
                  //   }
                  required={true}
                  handleChangeDescription={() => {}}
                  //valueDescription={this.state.month}
                  //disabled={isEditFlag ? true : false}
                />
              </div>
              <div className="flex-fill">
                <Field
                  name="requestedBy"
                  type="text"
                  label=""
                  component={searchableSelect}
                  placeholder={'-Requested By-'}
                  isClearable={false}
                  options={''}
                  //onKeyUp={(e) => this.changeItemDesc(e)}
                  //   validate={
                  //     this.state.vendorName == null ||
                  //     this.state.vendorName.length === 0
                  //       ? [required]
                  //       : []
                  //   }
                  required={true}
                  handleChangeDescription={() => {}}
                  //valueDescription={this.state.vendorName}
                  // disabled={isEditFlag ? true : false}
                />
              </div>
              <div className="flex-fill">
                <Field
                  name="status"
                  type="text"
                  label=""
                  component={searchableSelect}
                  placeholder={'-Status-'}
                  isClearable={false}
                  options={() => {}}
                  //onKeyUp={(e) => this.changeItemDesc(e)}
                  //   validate={
                  //     this.state.plant == null || this.state.plant.length === 0
                  //       ? [required]
                  //       : []
                  //   }
                  required={true}
                  handleChangeDescription={() => {}}
                  //   valueDescription={this.state.plant}
                  //   disabled={isEditFlag ? true : false}
                />
              </div>

              <div className="flex-fill">
                <button
                  type="button"
                  //disabled={pristine || submitting}
                  onClick={() => {}}
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
        options={''}
        search
        // exportCSV
        //ignoreSinglePage
        //ref={'table'}
        trClassName={'userlisting-row'}
        tableHeaderClass="my-custom-header"
        pagination
      >
        <TableHeaderColumn
          dataField="IsVendor"
          columnTitle={true}
          dataAlign="center"
          dataSort={true}
          //dataFormat={this.costingHeadFormatter}
        >
          {`Approval No.`}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="Year"
          width={100}
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Costing Id'}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="Month"
          width={100}
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Part No.'}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="VendorName"
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Part Name'}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="PartNumber"
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Created By'}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="PartName"
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Created On'}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="BudgetedQuantity"
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Requested By'}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="ApprovedQuantity"
          columnTitle={true}
          dataAlign="center"
          dataSort={false}
        >
          {'Reuested On '}
        </TableHeaderColumn>
        <TableHeaderColumn
          className="action"
          dataField="VolumeId"
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

export default reduxForm({
  form: 'ApprovalListing',
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
  enableReinitialize: true,
})(ApprovalListing)
