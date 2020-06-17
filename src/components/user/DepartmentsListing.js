import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Container, Row, Col, Button, Table
} from 'reactstrap';
import { getAllDepartmentAPI, deleteDepartmentAPI } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Department from './Department';

class DepartmentsListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isEditFlag: false,
      tableData: [],
    }
  }

  componentDidMount() {
    this.getDepartmentListData();
    //this.props.onRef(this)
  }

  getDepartmentListData = () => {
    this.props.getAllDepartmentAPI(res => {
      if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList;
        this.setState({
          tableData: Data,
        })
      }
    });
  }

  /**
  * @method getUpdatedData
  * @description get updated data after updatesuccess
  */
  getUpdatedData = () => {
    this.getDepartmentListData()
  }

  /**
   * @method closeDrawer
   * @description  used to cancel filter form
   */
  closeDrawer = (e = '') => {
    this.setState({ isOpen: false }, () => {
      this.getDepartmentListData()
    })
  }

  /**
   * @method openModel
   * @description  used to open filter form 
   */
  openModel = () => {
    this.setState({
      isOpen: true,
      isEditFlag: false
    })
  }

  /**
  * @method editItemDetails
  * @description confirm edit item
  */
  editItemDetails = (Id) => {
    this.setState({
      isEditFlag: true,
      isOpen: true,
      DepartmentId: Id,
    })
  }

  /**
  * @method deleteItem
  * @description confirm delete Department
  */
  deleteItem = (Id) => {
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDeleteItem(Id)
      },
      onCancel: () => console.log('CANCEL: clicked')
    };
    return toastr.confirm(`${MESSAGES.DEPARTMENT_DELETE_ALERT}`, toastrConfirmOptions);
  }

  /**
  * @method confirmDeleteItem
  * @description confirm delete Department item
  */
  confirmDeleteItem = (DepartmentId) => {
    this.props.deleteDepartmentAPI(DepartmentId, (res) => {
      if (res && res.data && res.data.Result === true) {
        toastr.success(MESSAGES.DELETE_DEPARTMENT_SUCCESSFULLY);
        this.getDepartmentListData();
      } else if (res.data.Result === false && res.statusText == "Found") {
        toastr.warning(res.data.Message)
      }
    });
  }

  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  buttonFormatter = (cell, row, enumObject, rowIndex) => {
    return (
      <>
        <button type={'button'} className="Edit mr5" onClick={() => this.editItemDetails(cell)} />
        <button type={'button'} className="Delete" onClick={() => this.deleteItem(cell)} />
      </>
    )
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { isOpen, isEditFlag, DepartmentId } = this.state;
    const options = {
      clearSearch: true,
      noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
    };
    return (
      <>
        {this.props.loading && <Loader />}
        <Row>
          <Col className="text-right">
            <button
              type={'button'}
              className={'user-btn'}
              onClick={this.openModel}>
              <div className={'plus'}></div>{`ADD`}</button>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col>
            <BootstrapTable
              data={this.state.tableData}
              striped={false}
              bordered={false}
              hover={true}
              options={options}
              search
              ignoreSinglePage
              ref={'table'}
              trClassName={'userlisting-row'}
              tableHeaderClass='my-custom-header'
              pagination>
              <TableHeaderColumn dataField="DepartmentName" isKey={true} dataAlign="left" dataSort={true}>Department</TableHeaderColumn>
              <TableHeaderColumn dataField="DepartmentId" dataAlign="right" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
            </BootstrapTable>
          </Col>
        </Row>
        {isOpen && (
          <Department
            isOpen={isOpen}
            closeDrawer={this.closeDrawer}
            isEditFlag={isEditFlag}
            DepartmentId={DepartmentId}
            anchor={'right'}
            className={"test-rahul"}
          />
        )}
      </ >
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
  const { departmentList, loading } = auth;

  return { departmentList, loading };
}


export default connect(mapStateToProps,
  {
    getAllDepartmentAPI,
    deleteDepartmentAPI,

  })(DepartmentsListing);

