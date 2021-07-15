import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import AddUOM from './AddUOM';
import { getUnitOfMeasurementAPI, deleteUnitOfMeasurementAPI, activeInactiveUOM } from '../actions/unitOfMeasurment';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import Switch from "react-switch";
import { UOM, UomMaster } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { applySuperScript } from '../../../helper/validation';
import ReactExport from 'react-export-excel';
import { UOM_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class UOMMaster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isEditFlag: false,
      uomId: '',
      dataList: [],

      ViewAccessibility: false,
      AddAccessibility: false,
      EditAccessibility: false,
      DeleteAccessibility: false,
      DownloadAccessibility: false,
      gridApi: null,
      gridColumnApi: null,
      rowData: null,
      sideBar: { toolPanels: ['columns'] },
      showData: false

    }
  }

  /**
   * @method componentDidMount
   * @description  called before rendering the component
   */
  componentDidMount() {
    let ModuleId = reactLocalStorage.get('ModuleId');
    this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
      const { leftMenuData } = this.props;
      if (leftMenuData !== undefined) {
        let Data = leftMenuData;
        const accessData = Data && Data.find(el => el.PageName === UOM)
        const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

        if (permmisionData !== undefined) {
          this.setState({
            ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
            AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
            EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
            DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
          })
        }
      }
    })

    this.getUOMDataList()
  }

  getUOMDataList = () => {
    this.props.getUnitOfMeasurementAPI(res => {
      if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList;
        this.setState({ dataList: Data })
      }
    });
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
   * @method closeDrawer
   * @description  used to cancel filter form
   */
  closeDrawer = (e = '') => {
    this.setState({ isOpen: false }, () => {
      this.getUOMDataList()
    })
  }

  /**
  * @method editItemDetails
  * @description confirm delete UOM
  */
  editItemDetails = (Id) => {
    this.setState({
      isEditFlag: true,
      isOpen: true,
      uomId: Id,
    })
  }

  /**
  * @method deleteItem
  * @description confirm delete UOM
  */
  deleteItem = (Id) => {
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDeleteUOM(Id)
      },
      onCancel: () => { }
    };
    return toastr.confirm(`Are you sure you want to delete UOM?`, toastrConfirmOptions);
  }

  /**
  * @method confirmDeleteUOM
  * @description confirm delete unit of measurement
  */
  confirmDeleteUOM = (Id) => {
    this.props.deleteUnitOfMeasurementAPI(Id, (res) => {
      if (res.data.Result) {
        toastr.success(MESSAGES.DELETE_UOM_SUCCESS);
        this.getUOMDataList()
      }
    });
  }

  renderPaginationShowsTotal(start, to, total) {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  /**
  * @method applySuperScriptFormatter
  * @description Renders buttons
  */
  applySuperScriptFormatter = (cell, row, enumObject, rowIndex) => {
    if (cell && cell.indexOf('^') !== -1) {
      return applySuperScript(cell)
    } else {
      return cell;
    }
  }

  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  buttonFormatter = (props) => {
    const { EditAccessibility } = this.state;
    const cellValue = props?.value;
    const rowData = props?.data;

    return (
      <>
        {EditAccessibility && <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cellValue)} />}
        {/* <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} /> */}
      </>
    )
  }

  // unitFormatter = (cell, row, enumObject, rowIndex) => {
  //   return 
  // }

  /**
  * @method statusButtonFormatter
  * @description Renders buttons
  */
  statusButtonFormatter = (props) => {
    const cellValue = props?.value;
    const rowData = props?.data;

    return (
      <>
        <label htmlFor="normal-switch">
          {/* <span>Switch with default style</span> */}
          <Switch
            onChange={() =>
              this.handleChange(cellValue, rowData, '', '')
            }
            checked={cellValue}
            background="#ff6600"
            onColor="#4DC771"
            offColor="#FC5774"
            onHandleColor="#ffffff"
            id="normal-switch"
            height={24}
          />
        </label>
      </>
    );
  }

  handleChange = (cell, row, enumObject, rowIndex) => {
    let data = {
      Id: row.Id,
      LoggedInUserId: loggedInUserId(),
      IsActive: !cell, //Status of the UOM.
    }
    this.props.activeInactiveUOM(data, res => {
      if (res && res.data && res.data.Result) {
        if (cell === true) {
          toastr.success(MESSAGES.UOM_INACTIVE_SUCCESSFULLY)
        } else {
          toastr.success(MESSAGES.UOM_ACTIVE_SUCCESSFULLY)
        }
        this.getUOMDataList()
      }
    })
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

    return this.returnExcelColumn(UOM_DOWNLOAD_EXCEl, tempArr)
  };

  returnExcelColumn = (data = [], TempData) => {
    let temp = []
    // TempData.map((item) => {
    //     if (item.RMName === '-') {
    //         item.RMName = ' '
    //     } if (item.RMGrade === '-') {
    //         item.RMGrade = ' '
    //     } else {
    //         return false
    //     }
    //     return item
    // })
    return (

      <ExcelSheet data={TempData} name={UomMaster}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }

  onFilterTextBoxChanged(e) {
    this.state.gridApi.setQuickFilter(e.target.value);
  }

  resetState() {
    gridOptions.columnApi.resetColumnState();
  }

  createCustomExportCSVButton = (onClick) => {
    return (
      <ExportCSVButton btnText='Download' onClick={() => this.handleExportCSVButtonClick(onClick)} />
    );
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { isOpen, isEditFlag, uomId, AddAccessibility } = this.state;
    const options = {
      clearSearch: true,
      noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
      //exportCSVText: 'Download Excel',
      //onExportToCSV: this.onExportToCSV,
      exportCSVBtn: this.createCustomExportCSVButton,
      //paginationShowsTotal: true,
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
      // customLoadingOverlay: LoaderCustom,
      customNoRowsOverlay: NoContentFound,
      hyphenFormatter: this.hyphenFormatter,
    };

    return (
      <>
        <div className={`ag-grid-react container-fluid ${DownloadAccessibility ? "show-table-btn" : ""}`}>
          {/* {this.props.loading && <Loader />} */}
          <Row>
            <Col md={12}>
              <h1 className="mb-0">{`Unit of Measurement Master`}</h1>
            </Col>
          </Row>
          <Row className="no-filter-row pt-4">
            {AddAccessibility && (
              <>
                <Col md={6} className="text-right filter-block mr5"></Col>
                {/* <Col md={6} className="text-right search-user-block pr-0">
                  <button
                    type={"button"}
                    className={"user-btn"}
                    onClick={this.openModel}
                  >
                    <div className={"plus"}></div>
                    {`ADD`}
                  </button>
                </Col> */}
              </>
            )}
            <Col md={6} className="text-right search-user-block pr-0">
            {
              DownloadAccessibility &&
              <>
                <ExcelFile filename={UomMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}>
                  <div className="download mr-0" title="Download"></div></button>}>
                  {this.onBtExport()}
                </ExcelFile>
              </>
              //   <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>
            }

              <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                  <div className="refresh mr-0"></div>
              </button>
            </Col>
          </Row>

          <Row>
            <Col>
              {/* <BootstrapTable
                data={this.state.dataList}
                striped={false}
                hover={false}
                bordered={false}
                options={options}
                search
                exportCSV
                csvFileName={`${UomMaster}.csv`}
                //ignoreSinglePage
                ref={"table"}
                trClassName={"userlisting-row"}
                tableHeaderClass="my-custom-class"
                pagination
              >
                <TableHeaderColumn dataField="Unit" isKey={true} dataAlign="left" dataSort={true} dataFormat={this.applySuperScriptFormatter}> Unit</TableHeaderColumn>
                <TableHeaderColumn dataField="UnitSymbol" dataAlign="left" dataFormat={this.applySuperScriptFormatter} dataSort={true}>Unit Symbol</TableHeaderColumn>
                <TableHeaderColumn dataField="UnitType" dataAlign="left" dataSort={true}>Unit Type</TableHeaderColumn> */}
              {/* <TableHeaderColumn
                  dataField="IsActive"
                  dataFormat={this.statusButtonFormatter}
                >
                  Status
                    </TableHeaderColumn> */}
              {/* <TableHeaderColumn
                  width={100}
                  dataField="Id"
                  isKey={true}
                  dataAlign="right"
                  dataFormat={this.buttonFormatter}
                >
                  Actions
                    </TableHeaderColumn> */}
              {/* </BootstrapTable> */}

              <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                <div className="ag-grid-header">
                  <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                </div>
                <div
                  className="ag-theme-material"
                  style={{ height: '100%', width: '100%' }}
                >
                  <AgGridReact
                    defaultColDef={defaultColDef}
                    // columnDefs={c}
                    rowData={this.state.dataList}
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
                    <AgGridColumn field="Unit" headerName="Unit"></AgGridColumn>
                    <AgGridColumn field="UnitSymbol" headerName="Unit Symbol"></AgGridColumn>
                    <AgGridColumn field="UnitType" headerName="Unit Type"></AgGridColumn>
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
            <AddUOM
              isOpen={isOpen}
              closeDrawer={this.closeDrawer}
              isEditFlag={isEditFlag}
              ID={uomId}
              anchor={"right"}
            />
          )}
        </div>
      </>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
        */
function mapStateToProps({ unitOfMeasrement, auth }) {
  const { unitOfMeasurementList, loading, } = unitOfMeasrement;
  const { leftMenuData } = auth;
  return { unitOfMeasurementList, leftMenuData, loading }
}

export default connect(
  mapStateToProps, {
  getUnitOfMeasurementAPI,
  deleteUnitOfMeasurementAPI,
  activeInactiveUOM,
  getLeftMenu,
}
)(UOMMaster);

