import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { Row, Col } from 'reactstrap'
import { searchableSelect } from '../../layout/FormInputs'
import { Loader } from '../../common/Loader'
import { EMPTY_DATA } from '../../../config/constants'
import {
  getInitialPlantSelectList, getInitialMachineSelectList, deleteProcess,
  getProcessDataList,
  getMachineSelectListByPlant,
  getPlantSelectListByMachine,
} from '../actions/Process';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import AddProcessDrawer from './AddProcessDrawer';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom'
import moment from 'moment'
import { ProcessMaster } from '../../../config/constants'
import ReactExport from 'react-export-excel';
import { PROCESSLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class ProcessListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenProcessDrawer: false,
      isEditFlag: false,
      Id: '',
      tableData: [],

      plant: [],
      machine: [],
      gridApi: null,
      gridColumnApi: null,
      rowData: null,
    }
  }

  /**
  * @method componentDidMount
  * @description Called after rendering the component
  */
  componentDidMount() {
    this.props.getInitialPlantSelectList(() => { })
    this.props.getInitialMachineSelectList(() => { })
    this.getDataList()
  }

  getDataList = (plant_id = '', machine_id = '') => {
    const filterData = {
      plant_id: plant_id,
      machine_id: machine_id,
    }
    this.props.getProcessDataList(filterData, (res) => {
      if (res && res.status === 200) {
        let Data = res.data.DataList;
        this.setState({ tableData: Data })
      } else if (res && res.response && res.response.status === 412) {
        this.setState({ tableData: [] })
      } else {
        this.setState({ tableData: [] })
      }
    })
  }

  /**
  * @method handlePlant
  * @description  PLANT FILTER
  */
  handlePlant = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ plant: newValue }, () => {
        const { plant } = this.state;
        this.props.getMachineSelectListByPlant(plant.value, () => { })
      });
    } else {
      this.setState({ plant: [], });
      this.props.getInitialMachineSelectList(() => { })
    }
  }


  /**
  * @method editItemDetails
  * @description EDIT ITEM
  */
  editItemDetails = (Id) => {
    this.setState({ isOpenProcessDrawer: true, isEditFlag: true, Id: Id, })
  }

  /**
  * @method deleteItem
  * @description CONFIRM DELETE ITEM
  */
  deleteItem = (Id) => {
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDelete(Id);
      },
      onCancel: () => { },
      component: () => <ConfirmComponent />,
    };
    return toastr.confirm(`${MESSAGES.PROCESS_DELETE_ALERT}`, toastrConfirmOptions);
  }

  /**
  * @method confirmDelete
  * @description DELETE PROCESS
  */
  confirmDelete = (ID) => {
    this.props.deleteProcess(ID, (res) => {
      if (res.data.Result === true) {
        toastr.success(MESSAGES.PROCESS_DELETE_SUCCESSFULLY);
        this.getDataList()
      }
    });
  }

  /**
  * @method renderPaginationShowsTotal
  * @description Pagination
  */
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

    const { EditAccessibility, DeleteAccessibility } = this.props;
    return (
      <>
        {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
        {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
      </>
    )
  };

  /**
  * @method costingHeadFormatter
  * @description Renders Costing head
  */
  costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
    return cell ? 'VBC' : 'ZBC';
  }

  getDataList = (plant_id = '', machine_id = '') => {
    const filterData = {
      plant_id: plant_id,
      machine_id: machine_id,
    }
    this.props.getProcessDataList(filterData, (res) => {
      if (res && res.status === 200) {
        let Data = res.data.DataList
        this.setState({ tableData: Data })
      } else if (res && res.response && res.response.status === 412) {
        this.setState({ tableData: [] })
      } else {
        this.setState({ tableData: [] })
      }
    })
  }

  /**
   * @method handlePlant
   * @description  PLANT FILTER
   */
  handlePlant = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ plant: newValue }, () => {
        const { plant } = this.state
        this.props.getMachineSelectListByPlant(plant.value, () => { })
      })
    } else {
      this.setState({ plant: [] })
      this.props.getInitialMachineSelectList(() => { })
    }
  }


  /**
   * @method editItemDetails
   * @description EDIT ITEM
   */
  editItemDetails = (Id) => {
    this.setState({ isOpenProcessDrawer: true, isEditFlag: true, Id: Id })
  }

  /**
   * @method deleteItem
   * @description CONFIRM DELETE ITEM
   */
  deleteItem = (Id) => {
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDelete(Id)
      },
      onCancel: () => { },
      component: () => <ConfirmComponent />,
    }
    return toastr.confirm(
      `${MESSAGES.PROCESS_DELETE_ALERT}`,
      toastrConfirmOptions,
    )
  }

  /**
   * @method confirmDelete
   * @description DELETE PROCESS
   */
  confirmDelete = (ID) => {
    this.props.deleteProcess(ID, (res) => {
      if (res.data.Result === true) {
        toastr.success(MESSAGES.PROCESS_DELETE_SUCCESSFULLY)
        this.getDataList()
      }
    })
  }


  /**
* @method buttonFormatter
* @description Renders buttons
*/
  buttonFormatter = (props) => {

    const cellValue = props?.value;
    const rowData = props?.data;

    const { EditAccessibility, DeleteAccessibility } = this.props;
    return (
      <>
        {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
        {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
      </>
    )
  };


  /**
   * @method costingHeadFormatter
   * @description Renders Costing head
   */
  costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
    return cell ? 'VBC' : 'ZBC'
  }

  /**
* @method effectiveDateFormatter
* @description Renders buttons
*/
  effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
  }
  /**
   * @method indexFormatter
   * @description Renders serial number
   */
  indexFormatter = (cell, row, enumObject, rowIndex) => {
    const { table } = this.refs
    let currentPage =
      table && table.state && table.state.currPage ? table.state.currPage : ''
    let sizePerPage =
      table && table.state && table.state.sizePerPage
        ? table.state.sizePerPage
        : ''
    let serialNumber = ''
    if (currentPage === 1) {
      serialNumber = rowIndex + 1
    } else {
      serialNumber = rowIndex + 1 + sizePerPage * (currentPage - 1)
    }
    return serialNumber
  }

  renderSerialNumber = () => {
    return (
      <>
        Sr. <br />
        No.{' '}
      </>
    )
  }

  renderCostingHead = () => {
    return (
      <>
        Costing <br />
        Head{' '}
      </>
    )
  }

  /**
   * @method renderListing
   * @description Used to show type of listing
   */
  renderListing = (label) => {
    const { filterSelectList } = this.props
    const temp = []

    if (label === 'plant') {
      filterSelectList &&
        filterSelectList.plants &&
        filterSelectList.plants.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }

    if (label === 'Machine') {
      filterSelectList &&
        filterSelectList.machine &&
        filterSelectList.machine.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
  }



  processToggler = () => {
    this.setState({ isOpenProcessDrawer: true, isEditFlag: false, Id: '' })
  }

  closeProcessDrawer = (e = '') => {
    this.setState({ isOpenProcessDrawer: false }, () => {
      this.getDataList()
    })
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  onSubmit = (values) => { }

  returnExcelColumn = (data = [], TempData) => {
    let temp = []
    temp = TempData.map((item) => {
      if (item.IsVendor === true) {
        item.IsVendor = 'Vendor Based'
      } else if (item.IsVendor === false) {
        item.IsVendor = 'Zero Based'
      } else if (item.VendorName === '-') {
        item.VendorName = ' '
      } else {
        return false
      }
      return item
    })

    return (<ExcelSheet data={temp} name={`${ProcessMaster}`}>
      {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)
      }
    </ExcelSheet>);
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
    return this.returnExcelColumn(PROCESSLISTING_DOWNLOAD_EXCEl, tempArr)
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
    const { handleSubmit, AddAccessibility, DownloadAccessibility } = this.props;
    const { isOpenProcessDrawer, isEditFlag } = this.state;

    const options = {
      clearSearch: true,
      noDataText: (this.props.processList === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),
      paginationShowsTotal: this.renderPaginationShowsTotal,
      exportCSVBtn: this.createCustomExportCSVButton,
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
      costingHeadRenderer: this.costingHeadFormatter,
      customLoadingOverlay: LoaderCustom,
      customNoRowsOverlay: NoContentFound,
      hyphenFormatter: this.hyphenFormatter
    };

    return (
      <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
        {/* {this.props.loading && <Loader />} */}
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
          <Row className="pt-4">

            <Col md="6" className="search-user-block mb-3">
              <div className="d-flex justify-content-end bd-highlight w100">
                <div>
                  {this.state.shown ? (
                    <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                      <div className="cancel-icon-white"></div></button>
                  ) : (
                    ''
                    // <button type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
                  )}
                  {AddAccessibility && <button
                    type="button"
                    className={'user-btn mr5'}
                    title="Add"
                    onClick={this.processToggler}>
                    <div className={'plus mr-0'}></div></button>}
                  {
                    DownloadAccessibility &&
                    <>
                      <ExcelFile filename={ProcessMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'} title="Download"><div className="download mr-0"></div></button>}>
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

        </form>
        <Row>
          <Col>
            {/* <BootstrapTable
              data={this.props.processList}
              striped={false}
              hover={false}
              bordered={false}
              options={options}
              search
              exportCSV={DownloadAccessibility}
              csvFileName={`${ProcessMaster}.csv`}
              //ignoreSinglePage
              ref={'table'}
              pagination
            >
              <TableHeaderColumn dataField="ProcessName" width={200} columnTitle={true} dataAlign="left" dataSort={true}>{'Process Name'}</TableHeaderColumn>
              <TableHeaderColumn dataField="ProcessCode" width={200} columnTitle={true} dataAlign="left" dataSort={true}>{'Process Code'}</TableHeaderColumn> */}
            {/* <TableHeaderColumn searchable={false} dataField="EffectiveDate" width={100} columnTitle={true} dataFormat={this.effectiveDateFormatter} dataAlign="left" >{'Effective Date'}</TableHeaderColumn> */}
            {/* <TableHeaderColumn dataField="Plants" width={100} columnTitle={true} dataAlign="left" dataSort={true}>{'Plant'}</TableHeaderColumn> */}
            {/* <TableHeaderColumn dataField="Machines" width={100}  columnTitle={true}   dataAlign="left" dataSort={true}>{'Machine'}</TableHeaderColumn> */}
            {/* <TableHeaderColumn width={100} dataAlign="right" searchable={false} dataField="ProcessId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
            </BootstrapTable> */}

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
                  floatingFilter={true}
                  domLayout='autoHeight'
                  // columnDefs={c}
                  rowData={this.props.processList}
                  pagination={true}
                  paginationPageSize={10}
                  onGridReady={this.onGridReady}
                  gridOptions={gridOptions}
                  loadingOverlayComponent={'customLoadingOverlay'}
                  noRowsOverlayComponent={'customNoRowsOverlay'}
                  noRowsOverlayComponentParams={{
                    title: EMPTY_DATA,
                  }}
                  frameworkComponents={frameworkComponents}
                >
                  <AgGridColumn field="ProcessName" headerName="Process Name" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                  <AgGridColumn field="ProcessCode" headerName="Process Code"></AgGridColumn>
                  <AgGridColumn field="ProcessId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
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
        {isOpenProcessDrawer && (
          <AddProcessDrawer
            isOpen={isOpenProcessDrawer}
            closeDrawer={this.closeProcessDrawer}
            isEditFlag={isEditFlag}
            isMachineShow={true}
            ID={this.state.Id}
            anchor={'right'}
          />
        )}
      </div>
    )
  }
}

/**
 * @method mapStateToProps
 * @description return state to component as props
 * @param {*} state
 */
function mapStateToProps({ process }) {
  const { filterSelectList, processList } = process
  return { filterSelectList, processList }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
  getInitialPlantSelectList,
  getInitialMachineSelectList,
  deleteProcess,
  getProcessDataList,
  getMachineSelectListByPlant,
  getPlantSelectListByMachine,
})(
  reduxForm({
    form: 'ProcessListing',
    enableReinitialize: true,
  })(ProcessListing),
)
