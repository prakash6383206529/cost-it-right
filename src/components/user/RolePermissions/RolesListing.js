import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import { getAllRoleAPI, deleteRoleAPI, getLeftMenu } from '../../../actions/auth/AuthActions';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { loggedInUserId } from '../../../helper/auth';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { ROLE } from '../../../config/constants';

class RolesListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditFlag: false,
      RoleId: '',
      tableData: [],
      AddAccessibility: false,
      EditAccessibility: false,
      DeleteAccessibility: false,
    }
  }


  componentWillMount() {
    let ModuleId = reactLocalStorage.get('ModuleId');
    this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
      const { leftMenuData } = this.props;
      if (leftMenuData != undefined) {
        let Data = leftMenuData;
        const accessData = Data && Data.find(el => el.PageName == ROLE)
        const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
        console.log('accessData: ', permmisionData);
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
    this.getRolesListData()
    //this.props.onRef(this)
  }

  getRolesListData = () => {
    this.props.getAllRoleAPI(res => {
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
    this.getRolesListData()
  }

  /**
  * @method editItemDetails
  * @description confirm edit item
  */
  editItemDetails = (Id) => {
    let requestData = {
      isEditFlag: true,
      RoleId: Id,
    }
    //this.props.getRoleDetail(requestData)
    this.props.getDetail(requestData)
  }

  /**
  * @method deleteItem
  * @description confirm delete part
  */
  deleteItem = (Id) => {
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDeleteItem(Id)
      },
      onCancel: () => console.log('CANCEL: clicked')
    };
    return toastr.confirm(`${MESSAGES.ROLE_DELETE_ALERT}`, toastrConfirmOptions);
  }

  /**
  * @method confirmDeleteItem
  * @description confirm delete Role item
  */
  confirmDeleteItem = (RoleId) => {
    this.props.deleteRoleAPI(RoleId, (res) => {
      if (res.data.Result === true) {
        toastr.success(MESSAGES.DELETE_ROLE_SUCCESSFULLY);
        this.getRolesListData();
      }
    });
  }

  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  buttonFormatter = (cell, row, enumObject, rowIndex) => {
    const { EditAccessibility, DeleteAccessibility } = this.state;
    return (
      <>
        {EditAccessibility && <button type={'button'} className="Edit mr5" onClick={() => this.editItemDetails(cell)} />}
        {DeleteAccessibility && <button type={'button'} className="Delete" onClick={() => this.deleteItem(cell)} />}
      </>
    )
  }

  formToggle = () => {
    this.props.formToggle()
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { isOpen, isEditFlag, editIndex, AddAccessibility } = this.state;
    const options = {
      clearSearch: true,
      noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
    };
    return (
      <>
        {this.props.loading && <Loader />}
        <Row className="pt-30">
          <Col md="8" className="filter-block">

          </Col>
          <Col md="4" className="search-user-block">
            {AddAccessibility && <div className="d-flex justify-content-end bd-highlight w100">
              <div>
                <button
                  type="button"
                  className={'user-btn'}
                  onClick={this.formToggle}>
                  <div className={'plus'}></div>ADD ROLE</button>
              </div>
            </div>}
          </Col>
        </Row>
        <Row class="mt-2">
          <Col>
            <BootstrapTable
              data={this.state.tableData}
              striped={false}
              bordered={false}
              hover={true}
              options={options}
              //search
              ignoreSinglePage
              ref={'table'}
              trClassName={'userlisting-row'}
              tableHeaderClass='my-custom-header'
              pagination>
              <TableHeaderColumn dataField="RoleName" isKey={true} dataAlign="left" dataSort={true}>Role</TableHeaderColumn>
              <TableHeaderColumn dataField="RoleId" dataAlign="right" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
            </BootstrapTable>
          </Col>
        </Row>
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
  const { roleList, leftMenuData, loading } = auth;

  return { roleList, leftMenuData, loading };
}


export default connect(mapStateToProps,
  {
    getAllRoleAPI,
    deleteRoleAPI,
    getLeftMenu,
  })(RolesListing);

