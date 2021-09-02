import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Col, } from 'reactstrap';
import $ from "jquery";
import { focusOnError, } from "../../layout/FormInputs";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { getAllReasonAPI, deleteReasonAPI, activeInactiveReasonStatus, } from '../actions/ReasonMaster';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import Switch from "react-switch";
import AddReason from './AddReason';
import { ADDITIONAL_MASTERS, OperationMaster, REASON, Reasonmaster } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import Row from 'reactstrap/lib/Row';
import LoaderCustom from '../../common/LoaderCustom';
import ReactExport from 'react-export-excel';
import { REASON_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class ReasonListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isEditFlag: false,
      isOpenDrawer: false,
      ID: '',
      tableData: [],
      ViewAccessibility: false,
      AddAccessibility: false,
      EditAccessibility: false,
      DeleteAccessibility: false,
      DownloadAccessibility: false,
      gridApi: null,
      gridColumnApi: null,
      rowData: null,
      sideBar: { toolPanels: ['columns'] },
      showData: false,
      isLoader: true,
      renderState: true
    }
  }

  componentWillUnmount() {
    this.props.getAllReasonAPI(false, (res) => { })
  }

  componentDidMount() {
    this.applyPermission(this.props.topAndLeftMenuData)
    setTimeout(() => {
      this.getTableListData()
    }, 2000);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.topAndLeftMenuData !== nextProps.topAndLeftMenuData) {
      this.applyPermission(nextProps.topAndLeftMenuData)
    }
  }

  /**
  * @method applyPermission
  * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
  */
  applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
      const accessData = Data && Data.Pages.find((el) => el.PageName === REASON)
      const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

      if (permmisionData !== undefined) {
        this.setState({
          ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
          AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
          EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
          DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
          DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
        })
      }

    }
  }

  // Get updated Supplier's list after any action performed.
  getUpdatedData = () => {
    setTimeout(() => {

      this.getTableListData()
    }, 500);
  }

  /**
   * @method getTableListData
   * @description Get user list data
   */
  getTableListData = () => {
    this.setState({ isLoader: true })
    this.props.getAllReasonAPI(true, (res) => {
      if (res.status === 204 && res.data === '') {
        this.setState({ tableData: [] })
      } else if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList
        this.setState({ tableData: Data }, () => this.setState({ isLoader: false, renderState: !this.state.renderState }))
      } else {
        this.setState({ tableData: [] })
      }
    })
  }

  /**
   * @method editItemDetails
   * @description confirm edit item
   */
  editItemDetails = (Id) => {
    this.setState({ isEditFlag: true, isOpenDrawer: true, ID: Id })
  }

  /**
   * @method deleteItem
   * @description confirm delete Item.
   */
  deleteItem = (Id) => {
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDeleteItem(Id)
      },
      onCancel: () => { },
    }
    return toastr.confirm(MESSAGES.REASON_DELETE_ALERT, toastrConfirmOptions)
  }

  /**
   * @method confirmDeleteItem
   * @description confirm delete item
   */
  confirmDeleteItem = (ID) => {
    this.props.deleteReasonAPI(ID, (res) => {
      if (res.data.Result === true) {
        toastr.success(MESSAGES.DELETE_REASON_SUCCESSFULLY)
        this.getTableListData()
      }
    })
  }

  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  buttonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

    const { EditAccessibility } = this.state;
    return (
      <>
        {EditAccessibility && <button className="Edit" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
        {/* {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />} */}
      </>
    )
  };

  /**
   * @method statusButtonFormatter
   * @description Renders buttons
   */
  statusButtonFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
    return (
      <>
        <label htmlFor="normal-switch" className="normal-switch">
          <Switch
            onChange={() => this.handleChange(cellValue, rowData)}
            checked={cellValue}
            background="#ff6600"
            onColor="#4DC771"
            onHandleColor="#ffffff"
            offColor="#FC5774"
            id="normal-switch"
            height={24}
          />
        </label>
      </>
    )
  }

  handleChange = (cell, row) => {
    let data = {
      Id: row.ReasonId,
      LoggedInUserId: loggedInUserId(),
      IsActive: !cell, //Status of the Reason.
    }
    this.props.activeInactiveReasonStatus(data, (res) => {
      if (res && res.data && res.data.Result) {
        if (cell == true) {
          toastr.success(MESSAGES.REASON_INACTIVE_SUCCESSFULLY)
        } else {
          toastr.success(MESSAGES.REASON_ACTIVE_SUCCESSFULLY)
        }
        this.getTableListData()
      }
    })
  }

  /**
   * @method indexFormatter
   * @description Renders serial number
   */
  indexFormatter = (cell, row, enumObject, rowIndex) => {
    let currentPage = this.refs.table.state.currPage
    let sizePerPage = this.refs.table.state.sizePerPage
    let serialNumber = ''
    if (currentPage === 1) {
      serialNumber = rowIndex + 1
    } else {
      serialNumber = rowIndex + 1 + sizePerPage * (currentPage - 1)
    }
    return serialNumber
  }

  onExportToCSV = (row) => {
    return this.state.userData // must return the data which you want to be exported
  }

  renderPaginationShowsTotal(start, to, total) {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  formToggle = () => {
    $("html,body").animate({ scrollTop: 0 }, "slow");
    this.setState({ isOpenDrawer: true })
  }

  closeVendorDrawer = (e = '') => {
    this.setState(
      {
        isOpenDrawer: false,
        isEditFlag: false,
        ID: '',
      },
      () => {
        this.getTableListData()
      },
    )
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

  onBtExport = () => {
    let tempArr = []
    const data = this.state.gridApi && this.state.gridApi.getModel().rowsToDisplay
    data && data.map((item => {
      tempArr.push(item.data)
    }))
    return this.returnExcelColumn(REASON_DOWNLOAD_EXCEl, this.props.reasonDataList)
  };

  returnExcelColumn = (data = [], TempData) => {
    let temp = []
    TempData && TempData.map((item) => {
      if (item.ECNNumber === null) {
        item.ECNNumber = ' '
      } else if (item.RevisionNumber === null) {
        item.RevisionNumber = ' '
      } else if (item.DrawingNumber === null) {
        item.DrawingNumber = ' '
      } else if (item.Technology === '-') {
        item.Technology = ' '
      } else {
        return false
      }
      return item
    })
    return (

      <ExcelSheet data={TempData} name={Reasonmaster}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }

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
    const { isEditFlag, isOpenDrawer, AddAccessibility, DownloadAccessibility } = this.state

    const options = {
      clearSearch: true,
      noDataText: (this.props.reasonDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
      exportCSVBtn: this.createCustomExportCSVButton,
      //paginationShowsTotal: true,
      paginationShowsTotal: this.renderPaginationShowsTotal,
      prePage: <span className="prev-page-pg"></span>, // Previous page button text
      nextPage: <span className="next-page-pg"></span>, // Next page button text
      firstPage: <span className="first-page-pg"></span>, // First page button text
      lastPage: <span className="last-page-pg"></span>,

    }

    const defaultColDef = {
      resizable: true,
      filter: true,
      sortable: true,
    };

    const frameworkComponents = {
      totalValueRenderer: this.buttonFormatter,
      customLoadingOverlay: LoaderCustom,
      customNoRowsOverlay: NoContentFound,
      statusButtonFormatter: this.statusButtonFormatter
    };

    return (
      <>

        {this.state.isLoader && <LoaderCustom />}
        <div className={`ag-grid-react container-fluid ${DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`}>

          <Row>
            <Col md={12}><h1 className="mb-0">Reason Master</h1></Col>
          </Row>
          <Row className="no-filter-row pt-4">
            <Col md={6} className="text-right filter-block"></Col>
            <Col md="6" className="text-right search-user-block pr-0">
              <div className="d-flex justify-content-end bd-highlight w100">
                <div>
                  {AddAccessibility && (
                    <button
                      type="button"
                      className={'user-btn mr5'}
                      title="Add"
                      onClick={this.formToggle}
                    >
                      <div className={'plus mr-0'}></div>
                    </button>
                  )}
                  {
                    DownloadAccessibility &&
                    <>

                      <ExcelFile filename={'Reason'} fileExtension={'.xls'} element={
                        <button type="button" className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                          {/* DOWNLOAD */}
                        </button>}>

                        {this.onBtExport()}
                      </ExcelFile>

                    </>

                    //   <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>

                  }

                  <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                    <div className="refresh mr-0"></div>
                  </button>

                </div>
              </div>
            </Col>
          </Row>
          {/* <BootstrapTable
            data={this.props.reasonDataList}
            striped={false}
            hover={false}
            bordered={false}
            options={options}
            search
            exportCSV={DownloadAccessibility}
            csvFileName={`${Reasonmaster}.csv`}
            //ignoreSinglePage
            ref={'table'}
            trClassName={'userlisting-row'}
            tableHeaderClass="my-custom-header"
            pagination
          > */}
          {/* <TableHeaderColumn dataField="Sr. No." width={'70'} csvHeader='Full-Name' dataFormat={this.indexFormatter}>Sr. No.</TableHeaderColumn> */}
          {/* <TableHeaderColumn
              dataField="Reason"
              dataAlign="left"
              dataSort={true}
            >
              Reason
          </TableHeaderColumn>
            <TableHeaderColumn
              width={100}
              dataField="IsActive"
              export={false}
              dataAlign="center"
              dataFormat={this.statusButtonFormatter}
            >
              Status
          </TableHeaderColumn>
            <TableHeaderColumn
              width={80}
              className="action"
              dataField="ReasonId"
              export={false}
              searchable={false}
              dataAlign="right"
              isKey={true}
              dataFormat={this.buttonFormatter}
            >
              Actions
            </TableHeaderColumn>
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
                rowData={this.props.reasonDataList}
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
                <AgGridColumn field="Reason" headerName="Reason"></AgGridColumn>
                <AgGridColumn field="IsActive" headerName="Status" cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                <AgGridColumn field="ReasonId" headerName="Actions" type="rightAligned" cellRenderer='totalValueRenderer'></AgGridColumn>
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


        </div>
        {isOpenDrawer && (
          <AddReason
            isOpen={isOpenDrawer}
            closeDrawer={this.closeVendorDrawer}
            isEditFlag={isEditFlag}
            ID={this.state.ID}
            anchor={'right'}
          />
        )}
      </>
    )
  }
}

/**
 * @method mapStateToProps
 * @description return state to component as props
 * @param {*} state
 */
function mapStateToProps({ reason, auth }) {
  const { loading, reasonDataList } = reason
  const { leftMenuData, topAndLeftMenuData } = auth
  return { loading, leftMenuData, reasonDataList, topAndLeftMenuData }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */

export default connect(mapStateToProps, {
  getAllReasonAPI,
  deleteReasonAPI,
  activeInactiveReasonStatus,
  getLeftMenu,
})(
  reduxForm({
    form: 'ReasonListing',
    onSubmitFail: (errors) => {
      focusOnError(errors)
    },
    enableReinitialize: true,
  })(ReasonListing),
)
