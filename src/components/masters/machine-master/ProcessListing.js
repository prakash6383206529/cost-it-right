import React, { Component } from 'react'
import { connect } from 'react-redux'
import { reduxForm } from 'redux-form'
import { Row, Col } from 'reactstrap'
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants'
import {
  deleteProcess,
  getProcessDataList,
  getMachineSelectListByPlant,
} from '../actions/Process';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster'
import AddProcessDrawer from './AddProcessDrawer';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import LoaderCustom from '../../common/LoaderCustom'
import DayTime from '../../common/DayTimeWrapper'
import { ProcessMaster } from '../../../config/constants'
import ReactExport from 'react-export-excel';
import { PROCESSLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper'
import { PaginationWrapper } from '../../common/commonPagination'
import { searchNocontentFilter } from '../../../helper'
import SelectRowWrapper from '../../common/SelectRowWrapper'


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
      showPopup: false,
      deletedId: '',
      isLoader: false,
      noData: false,
      dataCount: 0
    }
  }

  /**
  * @method componentDidMount
  * @description Called after rendering the component
  */
  componentDidMount() {
    setTimeout(() => {
      this.getDataList()
    }, 300);
  }

  getDataList = (plant_id = '', machine_id = '') => {
    const filterData = {
      plant_id: plant_id,
      machine_id: machine_id,
    }
    this.setState({ isLoader: true })
    this.props.getProcessDataList(filterData, (res) => {
      this.setState({ isLoader: false })
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
        {EditAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
        {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
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
    this.setState({ isLoader: true })
    this.props.getProcessDataList(filterData, (res) => {
      this.setState({ isLoader: false })
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
    this.setState({ showPopup: true, deletedId: Id })
  }

  /**
   * @method confirmDelete
   * @description DELETE PROCESS
   */
  confirmDelete = (ID) => {
    this.props.deleteProcess(ID, (res) => {
      if (res.data.Result === true) {
        Toaster.success(MESSAGES.PROCESS_DELETE_SUCCESSFULLY)
        this.getDataList()
      }
    })
    this.setState({ showPopup: false })
  }
  onPopupConfirm = () => {
    this.confirmDelete(this.state.deletedId);
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
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
        {EditAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
        {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
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
    return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
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

  closeProcessDrawer = (e = '', formData, type) => {
    this.setState({ isOpenProcessDrawer: false }, () => {
      if (type === 'submit')
        this.getDataList()
    })

  }
  /**
    * @method onFloatingFilterChanged
    * @description Filter data when user type in searching input
    */
  onFloatingFilterChanged = (value) => {
    this.props.processList.length !== 0 && this.setState({ noData: searchNocontentFilter(value, this.state.noData) })
  }
  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  onSubmit = (values) => { }

  returnExcelColumn = (data = [], TempData) => {
    let temp = []
    temp = TempData

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
    this.state.gridApi.paginationSetPageSize(Number(newPageSize));
  };
  onRowSelect = () => {
    const selectedRows = this.state.gridApi?.getSelectedRows()
    this.setState({ selectedRowData: selectedRows, dataCount: selectedRows.length })
  }
  onBtExport = () => {
    let tempArr = []
    tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()
    tempArr = (tempArr && tempArr.length > 0) ? tempArr : (this.props.processList ? this.props.processList : [])
    return this.returnExcelColumn(PROCESSLISTING_DOWNLOAD_EXCEl, tempArr)
  };

  onFilterTextBoxChanged(e) {
    this.state.gridApi.setQuickFilter(e.target.value);
  }

  resetState() {
    this.state.gridApi.deselectAll()
    gridOptions.columnApi.resetColumnState();
    gridOptions.api.setFilterModel(null);
  }


  /**
   * @method render
   * @description Renders the component
   */
  render() {
    const { handleSubmit, AddAccessibility, DownloadAccessibility } = this.props;
    const { isOpenProcessDrawer, isEditFlag, noData } = this.state;
    const ExcelFile = ReactExport.ExcelFile;

    const isFirstColumn = (params) => {

      var displayedColumns = params.columnApi.getAllDisplayedColumns();
      var thisIsFirstColumn = displayedColumns[0] === params.column;
      return thisIsFirstColumn;
    }

    const defaultColDef = {
      resizable: true,
      filter: true,
      sortable: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: isFirstColumn
    };

    const frameworkComponents = {
      totalValueRenderer: this.buttonFormatter,
      costingHeadRenderer: this.costingHeadFormatter,
      customNoRowsOverlay: NoContentFound,
    };

    return (
      <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
        {this.state.isLoader && <LoaderCustom />}
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
            <div className={`ag-grid-wrapper height-width-wrapper ${(this.props.processList && this.props.processList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
              <div className="ag-grid-header">
                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                <SelectRowWrapper dataCount={this.state.dataCount} />
              </div>
              <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                <AgGridReact
                  defaultColDef={defaultColDef}
                  floatingFilter={true}
                  domLayout='autoHeight'
                  // columnDefs={c}
                  rowData={this.props.processList}
                  pagination={true}
                  paginationPageSize={defaultPageSize}
                  onGridReady={this.onGridReady}
                  gridOptions={gridOptions}
                  rowSelection={'multiple'}
                  onSelectionChanged={this.onRowSelect}
                  noRowsOverlayComponent={'customNoRowsOverlay'}
                  noRowsOverlayComponentParams={{
                    title: EMPTY_DATA,
                  }}
                  frameworkComponents={frameworkComponents}
                  onFilterModified={this.onFloatingFilterChanged}
                  suppressRowClickSelection={true}
                >
                  <AgGridColumn field="ProcessName" headerName="Process Name" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                  <AgGridColumn field="ProcessCode" headerName="Process Code"></AgGridColumn>
                  <AgGridColumn field="ProcessId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                </AgGridReact>
                {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} />}
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
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.PROCESS_DELETE_ALERT}`} />
        }
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
  deleteProcess,
  getProcessDataList,
  getMachineSelectListByPlant,
})(
  reduxForm({
    form: 'ProcessListing',
    enableReinitialize: true,
    touchOnChange: true
  })(ProcessListing),
)
