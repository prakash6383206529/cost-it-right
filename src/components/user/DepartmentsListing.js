import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Container, Row, Col, Button, Table
} from 'reactstrap';
import { getAllDepartmentAPI, deleteDepartmentAPI, getLeftMenu } from '../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import { getConfigurationKey, loggedInUserId } from '../../helper/auth';
import { checkPermission } from '../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Department from './Department';
import { DEPARTMENT } from '../../config/constants';
import { GridTotalFormate } from '../common/TableGridFunctions';

class DepartmentsListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isEditFlag: false,
      tableData: [],
      AddAccessibility: false,
      EditAccessibility: false,
      DeleteAccessibility: false,
      isLoader: false
    }
  }

  UNSAFE_componentWillMount() {
    let ModuleId = reactLocalStorage.get('ModuleId');
    this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
      const { leftMenuData } = this.props;
      if (leftMenuData != undefined) {
        let Data = leftMenuData;
        const accessData = Data && Data.find(el => el.PageName == DEPARTMENT)
        const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

        if (permmisionData != undefined) {
          this.setState({
            AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
            EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
            DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
          })
        }
      }
    })
  }

  componentDidMount() {
    this.getDepartmentListData();
    //this.props.onRef(this)
  }

  getDepartmentListData = () => {
    this.setState({ isLoader: true })
    this.props.getAllDepartmentAPI(res => {
      if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList;
        this.setState({
          tableData: Data,
        }, () => this.setState({ isLoader: false }))
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
      onCancel: () => { }
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

  renderPaginationShowsTotal(start, to, total) {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  buttonFormatter = (cell, row, enumObject, rowIndex) => {
    const { EditAccessibility, DeleteAccessibility } = this.state;
    return (
      <>
        {EditAccessibility && <button type={'button'} className="Edit" onClick={() => this.editItemDetails(cell)} />}
        {DeleteAccessibility && <button type={'button'} className="Delete" onClick={() => this.deleteItem(cell)} />}
      </>
    )
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { isOpen, isEditFlag, DepartmentId, AddAccessibility } = this.state;
    const options = {
      clearSearch: true,
      noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
      paginationShowsTotal: this.renderPaginationShowsTotal,
      prePage: <span className="prev-page-pg"></span>, // Previous page button text
      nextPage: <span className="next-page-pg"></span>, // Next page button text
      firstPage: <span className="first-page-pg"></span>, // First page button text
      lastPage: <span className="last-page-pg"></span>,

    };
    return (
      <>
        {this.state.isLoader && <Loader />}
        <Row className="pt-4 no-filter-row">
          {AddAccessibility && (
            <>
              <Col md="6" className="filter-block"></Col>
              <Col md="6" className="text-right search-user-block pr-0">
                <button
                  type={"button"}
                  className={"user-btn "}
                  onClick={this.openModel}
                >
                  <div className={"plus"}></div>
                  {`ADD`}
                </button>
              </Col>
            </>
          )}
        </Row>

        <Row>
          <Col>
            <BootstrapTable
              data={this.state.tableData}
              striped={false}
              bordered={false}
              hover={false}
              options={options}
              search
              ignoreSinglePage
              ref={"table"}
              trClassName={"userlisting-row"}
              tableHeaderClass="my-custom-header"
              pagination
            >
              <TableHeaderColumn dataField="DepartmentName" isKey={true} dataAlign="left" dataSort={true}>{getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}</TableHeaderColumn>
              {getConfigurationKey().IsCompanyConfigureOnPlant && <TableHeaderColumn dataField="DepartmentCode" dataAlign="left" dataSort={true}>Company Code</TableHeaderColumn>}
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
            anchor={"right"}
            className={"test-rahul"}
          />
        )}
      </>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
  const { departmentList, leftMenuData, loading } = auth;

  return { departmentList, leftMenuData, loading };
}

export default connect(mapStateToProps,
  {
    getAllDepartmentAPI,
    deleteDepartmentAPI,
    getLeftMenu,
  })(DepartmentsListing);

