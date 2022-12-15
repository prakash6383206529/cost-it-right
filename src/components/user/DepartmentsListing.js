import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Row, Col
} from 'reactstrap';
import { getAllDepartmentAPI, deleteDepartmentAPI } from '../../actions/auth/AuthActions';
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { COMPANY, defaultPageSize, EMPTY_DATA } from '../../config/constants';
import NoContentFound from '../common/NoContentFound';
import { getConfigurationKey } from '../../helper/auth';
import { checkPermission, searchNocontentFilter } from '../../helper/util';
import Department from './Department';
import { DEPARTMENT } from '../../config/constants';
import { GridTotalFormate } from '../common/TableGridFunctions';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import LoaderCustom from '../common/LoaderCustom';
import { PaginationWrapper } from '../common/commonPagination';

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
      showData: false,
      showPopup: false,
      deletedId: '',
      noData: false

    }
  }

  componentDidMount() {
    this.setState({ isLoader: true })
    const { topAndLeftMenuData } = this.props;
    if (topAndLeftMenuData !== undefined) {
      const userMenu = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === 'Users');
      const accessData = userMenu && userMenu.Pages.find(el => (el.PageName === DEPARTMENT || el.PageName === COMPANY))
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
  closeDrawer = (e = '', type) => {
    this.setState({ isOpen: false }, () => {
      if (type === 'submit') {
        this.getDepartmentListData()
      }
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
    this.setState({ showPopup: true, deletedId: Id })
  }

  onPopupConfirm = () => {
    this.confirmDeleteItem(this.state.deletedId);

  }
  closePopUp = () => {
    this.setState({ showPopup: false })
  }
  /**
   * @method confirmDeleteItem
   * @description confirm delete Department item
   */
  confirmDeleteItem = (DepartmentId) => {
    this.props.deleteDepartmentAPI(DepartmentId, (res) => {
      if (res && res.data && res.data.Result === true) {
        Toaster.success(MESSAGES.DELETE_DEPARTMENT_SUCCESSFULLY);
        this.getDepartmentListData();
      } else if (res.data.Result === false && res.statusText === "Found") {
        Toaster.warning(res.data.Message)
      }
    });
    this.setState({ showPopup: false })
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
        {EditAccessibility && <button title='Edit' className="Edit" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
        {DeleteAccessibility && <button title='Delete' className="Delete ml5" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
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
    this.state.gridApi.paginationSetPageSize(Number(newPageSize));
  };

  onFilterTextBoxChanged(e) {
    this.state.gridApi.setQuickFilter(e.target.value);
  }

  resetState() {
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
  }


  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { isOpen, isEditFlag, DepartmentId, AddAccessibility, noData } = this.state;

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
          {this.state.isLoader && <LoaderCustom />}
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
              <div className={`ag-grid-wrapper height-width-wrapper ${(this.state.tableData && this.state.tableData?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                <div className="ag-grid-header">
                  <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => this.onFilterTextBoxChanged(e)} />
                </div>
                <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
                  {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                  <AgGridReact
                    defaultColDef={defaultColDef}
                    floatingFilter={true}
                    domLayout='autoHeight'
                    // columnDefs={c}
                    rowData={this.state.tableData}
                    pagination={true}
                    paginationPageSize={defaultPageSize}
                    onGridReady={this.onGridReady}
                    gridOptions={gridOptions}
                    loadingOverlayComponent={'customLoadingOverlay'}
                    noRowsOverlayComponent={'customNoRowsOverlay'}
                    onFilterModified={(e) => { this.setState({ noData: searchNocontentFilter(e) }) }}
                    noRowsOverlayComponentParams={{
                      title: EMPTY_DATA,
                      imagClass: 'imagClass'
                    }}
                    frameworkComponents={frameworkComponents}
                  >
                    {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                    <AgGridColumn field="DepartmentName" headerName={getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}></AgGridColumn>
                    <AgGridColumn field="DepartmentCode" headerName={getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company Code' : 'Department Code'}></AgGridColumn>
                    <AgGridColumn field="DepartmentId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                  </AgGridReact>
                  {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} />}
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
          {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.DEPARTMENT_DELETE_ALERT}`} />
          }
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
  })(DepartmentsListing);

