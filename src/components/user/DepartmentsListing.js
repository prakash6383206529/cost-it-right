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
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const gridOptions = {};

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
      isLoader: false,
      gridApi: null,
      gridColumnApi: null,
      rowData: null,
      sideBar: { toolPanels: ['columns'] },
      showData: false

    }
  }

  componentDidMount() {
    const { topAndLeftMenuData } = this.props;
    if (topAndLeftMenuData !== undefined) {
      const userMenu = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === 'Users');
      const accessData = userMenu && userMenu.Pages.find(el => el.PageName === DEPARTMENT)
      const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

      if (permmisionData !== undefined) {
        this.setState({
          AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
          EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
          DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
        })
      }
    }

    setTimeout(() => {
      this.getDepartmentListData();
    }, 500);
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
  buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

    const { EditAccessibility, DeleteAccessibility } = this.state;
    return (
      <>
        {EditAccessibility && <button className="Edit" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
        {DeleteAccessibility && <button className="Delete ml5" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
      </>
    )
  };


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
    //gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
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

    const defaultColDef = {
      resizable: true,
      filter: true,
      sortable: true,

    };

    const frameworkComponents = {
      totalValueRenderer: this.buttonFormatter,
      customNoRowsOverlay: NoContentFound,
    };


    return (
      <div className={"ag-grid-react"}>
        <>
          {this.state.isLoader && <Loader />}
          <Row className="pt-4 no-filter-row">
            <Col md="6" className="filter-block"></Col>
            <Col md="6" className="text-right search-user-block pr-0">
              {AddAccessibility && (
                <>
                  <button
                    type={"button"}
                    className={"user-btn mr5"}
                    onClick={this.openModel}
                    title="Add"
                  >
                    <div className={"plus mr-0"}></div>
                  </button>
                </>
              )}
              <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                <div className="refresh mr-0"></div>
              </button>
            </Col>

          </Row>

          <Row>
            <Col>
              {/* <BootstrapTable
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
            </BootstrapTable> */}

              <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                <div className="ag-grid-header">
                  <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                </div>
                <div
                  className="ag-theme-material"
                >
                  <AgGridReact
                    defaultColDef={defaultColDef}
                    floatingFilter = {true}
domLayout='autoHeight'
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
                    <AgGridColumn field="DepartmentName" headerName={getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}></AgGridColumn>
                    {getConfigurationKey().IsCompanyConfigureOnPlant && <AgGridColumn field="DepartmentCode" headerName="Company Code"></AgGridColumn>}
                    <AgGridColumn field="DepartmentId" headerName="Action" type="rightAligned" cellRenderer={'totalValueRenderer'}></AgGridColumn>
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
  const { departmentList, leftMenuData, loading, topAndLeftMenuData } = auth;

  return { departmentList, leftMenuData, loading, topAndLeftMenuData };
}

export default connect(mapStateToProps,
  {
    getAllDepartmentAPI,
    deleteDepartmentAPI,
    getLeftMenu,
  })(DepartmentsListing);

