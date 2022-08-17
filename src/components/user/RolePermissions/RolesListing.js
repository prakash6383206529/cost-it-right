import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getAllRoleAPI, deleteRoleAPI, activeInactiveRole } from '../../../actions/auth/AuthActions';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { checkPermission, showTitleForActiveToggle } from '../../../helper/util';
import { ROLE } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrapper } from '../../common/commonPagination';
import { loggedInUserId } from '../../../helper';
import Switch from "react-switch";

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
      ActivateAccessibility: false,
      isLoader: false,
      gridApi: null,
      gridColumnApi: null,
      rowData: null,
      sideBar: { toolPanels: ['columns'] },
      showData: false,
      showPopup: false,
      deletedId: '',
      cell: ''
    }
  }

  componentDidMount() {
    this.setState({ isLoader: true })
    const { topAndLeftMenuData } = this.props;
    if (topAndLeftMenuData !== undefined) {
      const userMenu = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === 'Users');
      const accessData = userMenu && userMenu.Pages.find(el => el.PageName === ROLE)
      const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

      if (permmisionData !== undefined) {
        this.setState({
          AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
          EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
          DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
          ActivateAccessibility: permmisionData && permmisionData.Activate ? permmisionData.Activate : false,
        })
      }
    }

    setTimeout(() => {
      this.getRolesListData()
    }, 500);
  }

  getRolesListData = () => {
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




  closePopUp = () => {
    this.setState({ showPopup: false })
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
        {EditAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
        {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
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
    this.state.gridApi.paginationSetPageSize(Number(newPageSize));
  };

  onFilterTextBoxChanged(e) {
    this.state.gridApi.setQuickFilter(e.target.value);
  }

  resetState() {
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
  }

  handleChange = (cell, row) => {

    this.setState({ showPopup: true, row: row, cell: cell })
      ;
  }
  onPopupConfirm = () => {


    let data = {
      Id: this.state.row.RoleId,
      ModifiedBy: loggedInUserId(),
      IsActive: !this.state.cell, //Status of the Reason.
    }
    this.props.activeInactiveRole(data, (res) => {
      if (res && res.data && res.data.Result) {
        if (Boolean(this.state.cell) === true) {
          Toaster.success(MESSAGES.ROLE_INACTIVE_SUCCESSFULLY)
        } else {
          Toaster.success(MESSAGES.ROLE_ACTIVE_SUCCESSFULLY)
        }
        this.getRolesListData();
      }
    })


    this.setState({ showPopup: false })
    this.setState({ showPopup2: false })


  }

  /**
* @method statusButtonFormatter
* @description Renders buttons
*/
  statusButtonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

    const { ActivateAccessibility } = this.state;
    if (rowData.UserId === loggedInUserId()) return null;
    showTitleForActiveToggle(props)
    return (
      <>
        <label htmlFor="normal-switch" className="normal-switch">
          {/* <span>Switch with default style</span> */}
          <Switch
            onChange={() => this.handleChange(cellValue, rowData)}
            checked={cellValue}
            disabled={!ActivateAccessibility}
            background="#ff6600"
            onColor="#4DC771"
            onHandleColor="#ffffff"
            offColor="#FC5774"
            id="normal-switch"
            height={24}
            className={cellValue ? "active-switch" : "inactive-switch"}
          />
        </label>
      </>
    )
  }


  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { AddAccessibility } = this.state;
    const options = {
      clearSearch: true,
      noDataText: (<NoContentFound title={EMPTY_DATA} />),
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
      statusButtonFormatter: this.statusButtonFormatter,
    };

    return (
      <div className={"ag-grid-react"}>
        <>
          {this.state.isLoader && <LoaderCustom />}
          <Row className="pt-4 ">
            <Col md="8" className="mb-2">

            </Col>
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


            </Col>
          </Row>
          <Row class="">
            <Col className="table-mt-0">
              <div className={`ag-grid-wrapper height-width-wrapper ${this.state.tableData && this.state.tableData?.length <= 0 ? "overlay-contain" : ""}`}>
                <div className="ag-grid-header">
                  <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                </div>
                <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
                  <AgGridReact
                    defaultColDef={defaultColDef}
                    floatingFilter={true}
                    domLayout='autoHeight'
                    // columnDefs={c}
                    rowData={this.state.tableData}
                    pagination={true}
                    paginationPageSize={10}
                    onGridReady={this.onGridReady}
                    gridOptions={gridOptions}
                    noRowsOverlayComponent={'customNoRowsOverlay'}
                    noRowsOverlayComponentParams={{
                      title: EMPTY_DATA,
                      imagClass: 'imagClass'
                    }}
                    frameworkComponents={frameworkComponents}
                  >
                    {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                    <AgGridColumn field="RoleName" headerName="Role"></AgGridColumn>
                    <AgGridColumn pinned="right" field="IsActive" headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                    <AgGridColumn field="RoleId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                  </AgGridReact>
                  {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} />}
                </div>
              </div>
              {
                this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${this.state.cell ? MESSAGES.ROLE_DEACTIVE_ALERT : MESSAGES.ROLE_ACTIVE_ALERT}`} />
              }

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
  const { roleList, leftMenuData, loading, topAndLeftMenuData } = auth;

  return { roleList, leftMenuData, loading, topAndLeftMenuData };
}


export default connect(mapStateToProps,
  {
    getAllRoleAPI,
    deleteRoleAPI,
    activeInactiveRole
  })(RolesListing);

