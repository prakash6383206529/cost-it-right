import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
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
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const gridOptions = {};

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
      isLoader: false,
      gridApi: null,
      gridColumnApi: null,
      rowData: null,
      sideBar: { toolPanels: ['columns'] },
      showData: false

    }
  }


  UNSAFE_componentWillMount() {
    let ModuleId = reactLocalStorage.get('ModuleId');
    this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
      const { leftMenuData } = this.props;
      if (leftMenuData !== undefined) {
        let Data = leftMenuData;
        const accessData = Data && Data.find(el => el.PageName === ROLE)
        const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

        if (permmisionData !== undefined) {
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
    setTimeout(() => {

      this.getRolesListData()
    }, 500);
    //this.props.onRef(this)
  }

  getRolesListData = () => {
    this.setState({ isLoader: true })
    this.props.getAllRoleAPI(res => {
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
      onCancel: () => { },
      component: () => <ConfirmComponent />
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
  buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

    const { EditAccessibility, DeleteAccessibility } = this.state;
    return (
      <>
        {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
        {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
      </>
    )
  };

  formToggle = () => {
    this.props.formToggle()
  }

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
    params.api.paginationGoToPage(0);
  };

  onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById('page-size').value;
    this.state.gridApi.paginationSetPageSize(Number(value));
  };

  onFilterTextBoxChanged(e) {
    this.state.gridApi.setQuickFilter(e.target.value);
  }

  resetState() {
    gridOptions.columnApi.resetColumnState();
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { AddAccessibility } = this.state;
    const options = {
      clearSearch: true,
      noDataText: (<NoContentFound title={CONSTANT.EMPTY_DATA} />),
      paginationShowsTotal: this.renderPaginationShowsTotal,
      prePage: <span className="prev-page-pg"></span>, // Previous page button text
      nextPage: <span className="next-page-pg"></span>, // Next page button text
      firstPage: <span className="first-page-pg"></span>, // First page button text
      lastPage: <span className="last-page-pg"></span>,

    };

    const defaultColDef = {
      resizable: true,
      filter: true,
      sortable: true,

    };

    const frameworkComponents = {
      totalValueRenderer: this.buttonFormatter,
      customLoadingOverlay: LoaderCustom,
      customNoRowsOverlay: NoContentFound,
    };

    return (
      <div className={"ag-grid-react"}>
        <>
          {this.state.isLoader && <LoaderCustom />}
          <Row className="pt-4 ">
            <Col md="8" className="mb-2">

            </Col>
<<<<<<< HEAD
            <Col md="4" >
              {AddAccessibility && <div className="d-flex justify-content-end bd-highlight w100">
                <div>
                  <button
                    type="button"
                    className={'user-btn '}
                    onClick={this.formToggle}>
                    <div className={'plus'}></div>ADD</button>
                </div>
              </div>}

              <button type="button" className="user-btn refresh-icon" onClick={() => this.resetState()}></button>
=======
            <Col md="6" className="search-user-block mb-3">
              <div className="d-flex justify-content-end bd-highlight w100">
                {AddAccessibility &&
                  <div>
                    <button
                      type="button"
                      className={'user-btn mr5'}
                      title="Add"
                      onClick={this.formToggle}>
                      <div className={'plus mr-0'}></div></button>
                  </div>
                }
                <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
              </div>

>>>>>>> m1-frontend

            </Col>
          </Row>
          <Row class="">
            <Col className="table-mt-0">
              {/* <BootstrapTable
              data={this.state.tableData}
              striped={false}
              bordered={false}
              hover={false}
              options={options}
              //search
              ignoreSinglePage
              ref={'table'}
              trClassName={'userlisting-row'}
              tableHeaderClass='my-custom-header'
              pagination>
              <TableHeaderColumn dataField="RoleName" isKey={true} dataAlign="left" dataSort={true}>Role</TableHeaderColumn>
              <TableHeaderColumn dataField="RoleId" dataAlign="right" dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
            </BootstrapTable> */}

              <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                <div className="ag-grid-header">
<<<<<<< HEAD
                  <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Filter..." onChange={(e) => this.onFilterTextBoxChanged(e)} />
=======
                  <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
>>>>>>> m1-frontend
                </div>
                <div
                  className="ag-theme-material"
                  style={{ height: '100%', width: '100%' }}
                >
                  <AgGridReact
                    defaultColDef={defaultColDef}
                    // columnDefs={c}
                    rowData={this.state.tableData}
                    pagination={true}
                    paginationPageSize={10}
                    onGridReady={this.onGridReady}
                    gridOptions={gridOptions}
                    loadingOverlayComponent={'customLoadingOverlay'}
                    noRowsOverlayComponent={'customNoRowsOverlay'}
                    noRowsOverlayComponentParams={{
                      title: CONSTANT.EMPTY_DATA,
                    }}
                    frameworkComponents={frameworkComponents}
                  >
                    {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                    <AgGridColumn field="RoleName" headerName="Role"></AgGridColumn>
<<<<<<< HEAD
                    <AgGridColumn field="RoleId" headerName="Action" type="rightAligned" cellRenderer={'totalValueRenderer'}></AgGridColumn>
=======
                    <AgGridColumn field="RoleId" headerName="Action"  cellRenderer={'totalValueRenderer'}></AgGridColumn>
>>>>>>> m1-frontend
                  </AgGridReact>
                  <div className="paging-container d-inline-block float-right">
                    <select className="form-control paging-dropdown" onChange={(e) => this.onPageSizeChanged(e.target.value)} id="page-size">
                      <option value="10" selected={true}>10</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
              </div>


            </Col>
          </Row>
        </ >
      </div>
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

