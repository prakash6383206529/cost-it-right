
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { checkForDecimalAndNull } from "../../../helper/validation";
import {
  getPowerDetailDataList, getVendorPowerDetailDataList, getPlantListByState,
  deletePowerDetail, deleteVendorPowerDetail,
} from '../actions/Fuel';
import { getPlantBySupplier } from '../../../actions/Common';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import Switch from "react-switch";
import DayTime from '../../common/DayTimeWrapper'
import { GridTotalFormate } from '../../common/TableGridFunctions';
import LoaderCustom from '../../common/LoaderCustom';
import { PowerMaster } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { POWERLISTING_DOWNLOAD_EXCEl, POWERLISTING_VENDOR_DOWNLOAD_EXCEL } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { getConfigurationKey, searchNocontentFilter } from '../../../helper';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrapper } from '../../common/commonPagination';

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};



class PowerListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isEditFlag: false,
      IsVendor: false,
      tableData: [],
      shown: false,
      StateName: [],
      plant: [],
      vendorName: [],
      vendorPlant: [],
      showPopup: false,
      deletedId: '',
      isLoader: false,
      selectedRowData: false,
      noData: false
    }
  }

  /**
  * @method componentDidMount
  * @description Called after rendering the component
  */
  componentDidMount() {
    setTimeout(() => {
      if (!this.props.stopApiCallOnCancel) {
        this.getDataList()
      }
    }, 300);

  }

  getDataList = () => {
    const { StateName, plant, vendorName, vendorPlant } = this.state;
    this.setState({ isLoader: true })
    if (!this.state.IsVendor) {
      const filterData = {
        plantID: plant ? plant.value : '',
        stateID: StateName ? StateName.value : '',
      }
      this.props.getPowerDetailDataList(filterData, (res) => {
        this.setState({ isLoader: false })
        if (res && res.status === 200) {
          let Data = res.data.DataList;
          this.setState({ tableData: Data, isLoader: false })
        } else if (res && res.response && res.response.status === 412) {
          this.setState({ tableData: [], isLoader: false })
        } else {
          this.setState({ tableData: [], isLoader: false })
        }
      })

    } else {

      const filterData = {
        vendorID: vendorName && vendorName !== undefined ? vendorName.value : '',
        plantID: vendorPlant && vendorPlant !== undefined ? vendorPlant.value : '',
      }
      this.props.getVendorPowerDetailDataList(filterData, (res) => {
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

  }

  /**
  * @method viewOrEditItemDetails
  * @description edit or view material type
  */
  viewOrEditItemDetails = (Id, isViewMode) => {
    let data = {
      isEditFlag: true,
      Id: Id?.PowerId,
      IsVendor: this.state.IsVendor,
      isViewMode: isViewMode,
      plantId: Id?.PlantId
    }
    this.props.getDetails(data);
  }

  /**
  * @method deleteItem
  * @description confirm delete Raw Material details
  */
  deleteItem = (Id) => {
    this.setState({ showPopup: true, deletedId: Id })
  }

  /**
  * @method confirmDelete
  * @description confirm delete Raw Material details
  */
  confirmDelete = (ID) => {
    if (this.state.IsVendor) {
      this.props.deleteVendorPowerDetail(ID?.PowerDetailId, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.DELETE_POWER_SUCCESS);
          this.getDataList()
        }
      });
      this.setState({ showPopup: false })
    } else {
      this.props.deletePowerDetail(ID, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.DELETE_POWER_SUCCESS);
          this.getDataList()
        }
      });
      this.setState({ showPopup: false })
    }
  }
  onPopupConfirm = () => {
    this.confirmDelete(this.state.deletedId);
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
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
    const rowData = props?.data;
    let obj = {}
    obj.PowerId = rowData?.PowerId
    obj.PlantId = rowData?.PlantId
    obj.PowerDetailId = rowData?.PowerDetailId
    const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = this.props;
    return (
      <>
        {ViewAccessibility && <button title='View' className="View mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(obj, true)} />}
        {EditAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(obj, false)} />}
        {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(obj)} />}
      </>
    )
  };


  /**
* @method effectiveDateFormatter
* @description Renders buttons
*/
  effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
  }

  /**
  * @method costingHeadFormatter
  * @description Renders Costing head
  */
  costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
    return cell ? 'VBC' : 'ZBC';
  }

  /**
  * @method indexFormatter
  * @description Renders serial number
  */
  indexFormatter = (cell, row, enumObject, rowIndex) => {
    const { table } = this.refs;
    let currentPage = table && table.state && table.state.currPage ? table.state.currPage : '';
    let sizePerPage = table && table.state && table.state.sizePerPage ? table.state.sizePerPage : '';
    let serialNumber = '';
    if (currentPage === 1) {
      serialNumber = rowIndex + 1;
    } else {
      serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
    }
    return serialNumber;
  }

  renderSerialNumber = () => {
    return <>Sr. <br />No. </>
  }

  costFormatter = (props) => {
    const { initialConfiguration } = this.props
    const cellValue = props?.value;
    return cellValue != null ? checkForDecimalAndNull(cellValue, initialConfiguration.NoOfDecimalForPrice) : '';
  }

  costFormatterForVBC = (props) => {
    const { initialConfiguration } = this.props
    const cellValue = props?.value;
    return cellValue != null ? checkForDecimalAndNull(cellValue, initialConfiguration.NoOfDecimalForPrice) : '';
  }

  /**
  * @method effectiveDateFormatter
  * @description Renders buttons
  */
  effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
  }
  renderEffectiveDate = () => {
    return <>Effective <br />Date</>
  }


  /**
  * @method onPressVendor
  * @description Used for Vendor checked
  */
  onPressVendor = () => {
    this.setState({
      IsVendor: !this.state.IsVendor,
    }, () => {
      this.getDataList()
    });
  }



  formToggle = () => {
    this.props.formToggle()
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => { }

  returnExcelColumn = (data = [], TempData) => {
    let temp = []
    temp = TempData && TempData.map((item) => {
      if (item.Plants === '-') {
        item.Plants = ' '
      } if (item.Vendor === '-') {
        item.Vendor = ' '
      }
      return item
    })

    return (<ExcelSheet data={temp} name={`${PowerMaster}`}>
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
    this.setState({ selectedRowData: selectedRows })
  }
  onBtExport = () => {
    let tempArr = []
    tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()
    if (this.state.IsVendor) {
      tempArr = (tempArr && tempArr.length > 0) ? tempArr : (this.props.vendorPowerDataList ? this.props.vendorPowerDataList : [])
      return this.returnExcelColumn(POWERLISTING_VENDOR_DOWNLOAD_EXCEL, tempArr)
    } else {
      tempArr = (tempArr && tempArr.length > 0) ? tempArr : (this.props.powerDataList ? this.props.powerDataList : [])
      return this.returnExcelColumn(POWERLISTING_DOWNLOAD_EXCEl, tempArr)
    }
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
    const { isEditFlag, noData } = this.state;
    const ExcelFile = ReactExport.ExcelFile;

    var filterParams = {
      date: "",
      comparator: function (filterLocalDateAtMidnight, cellValue) {
        var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
        if (dateAsString == null) return -1;
        var dateParts = dateAsString.split('/');
        var cellDate = new Date(
          Number(dateParts[2]),
          Number(dateParts[1]) - 1,
          Number(dateParts[0])
        );
        if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
          return 0;
        }
        if (cellDate < filterLocalDateAtMidnight) {
          return -1;
        }
        if (cellDate > filterLocalDateAtMidnight) {
          return 1;
        }
      },
      browserDatePicker: true,
      minValidYear: 2000,
    };

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
      customNoRowsOverlay: NoContentFound,
      costFormatter: this.costFormatter,
      effectiveDateFormatter: this.effectiveDateFormatter,
    };

    return (

      <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
        {this.state.isLoader && <LoaderCustom />}
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
          <Row className="pt-4">
            <Col md="4" className="switch mb-1">
              <label className="switch-level">
                <div className={"left-title"}>Zero Based</div>
                <Switch
                  onChange={this.onPressVendor}
                  checked={this.state.IsVendor}
                  id="normal-switch"
                  disabled={isEditFlag ? true : false}
                  background="#4DC771"
                  onColor="#4DC771"
                  onHandleColor="#ffffff"
                  offColor="#4DC771"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  height={20}
                  width={46}
                />
                <div className={"right-title"}>Vendor Based</div>
              </label>
            </Col>
          </Row>
          <Row>

            <Col md="6" className="search-user-block mb-3">
              <div className="d-flex justify-content-end bd-highlight w100">
                <div>
                  <>
                    {this.state.shown ? (
                      <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                        <div className="cancel-icon-white"></div></button>
                    ) : (
                      ""
                    )}
                    {AddAccessibility && (
                      <button
                        type="button"
                        className={"user-btn mr5"}
                        onClick={this.formToggle}
                        title="Add"
                      >
                        <div className={"plus mr-0"}></div>
                        {/* ADD */}
                      </button>
                    )}
                    {
                      DownloadAccessibility &&
                      <>

                        <ExcelFile filename={'PowerMaster'} fileExtension={'.xls'} element={
                          <button type="button" className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                            {/* DOWNLOAD */}
                          </button>}>

                          {this.onBtExport()}
                        </ExcelFile>

                      </>

                    }
                    <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                      <div className="refresh mr-0"></div>
                    </button>

                  </>
                </div>
              </div>
            </Col>
          </Row>
        </form>
        <Row>
          <Col>


            <div className={`ag-grid-wrapper height-width-wrapper ${(this.props.powerDataList && this.props.powerDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
              {/* ZBC Listing */}
              <div className="ag-grid-header">
                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
              </div>
              <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                {!this.state.IsVendor &&
                  <AgGridReact
                    defaultColDef={defaultColDef}
                    floatingFilter={true}
                    domLayout='autoHeight'
                    // columnDefs={c}
                    rowData={this.props.powerDataList}
                    pagination={true}
                    paginationPageSize={10}
                    onGridReady={this.onGridReady}
                    gridOptions={gridOptions}
                    noRowsOverlayComponent={'customNoRowsOverlay'}
                    noRowsOverlayComponentParams={{
                      title: EMPTY_DATA,
                      imagClass: 'imagClass power-listing'
                    }}
                    rowSelection={'multiple'}
                    onFilterModified={(e) => { this.setState({ noData: searchNocontentFilter(e) }) }}
                    onSelectionChanged={this.onRowSelect}
                    frameworkComponents={frameworkComponents}
                  >
                    <AgGridColumn field="StateName"></AgGridColumn>
                    <AgGridColumn field="PlantName"></AgGridColumn>
                    <AgGridColumn field="NetPowerCostPerUnit" cellRenderer={'costFormatter'}></AgGridColumn>
                    <AgGridColumn field="EffectiveDate" cellRenderer='effectiveDateFormatter' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                    <AgGridColumn field="PowerId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                  </AgGridReact>}

                {/* VBC Listing */}
                {this.state.IsVendor &&
                  <AgGridReact
                    defaultColDef={defaultColDef}
                    domLayout='autoHeight'
                    rowData={this.props.vendorPowerDataList}
                    pagination={true}
                    paginationPageSize={defaultPageSize}
                    onGridReady={this.onGridReady}
                    gridOptions={gridOptions}
                    loadingOverlayComponent={'customLoadingOverlay'}
                    noRowsOverlayComponent={'customNoRowsOverlay'}
                    noRowsOverlayComponentParams={{
                      title: EMPTY_DATA,
                      imagClass: 'imagClass power-listing'
                    }}
                    frameworkComponents={frameworkComponents}
                  >
                    <AgGridColumn field="VendorName"></AgGridColumn>
                    {getConfigurationKey().IsVendorPlantConfigurable && <AgGridColumn field="VendorPlantName"></AgGridColumn>}
                    <AgGridColumn field="NetPowerCostPerUnit" cellRenderer={'costFormatterForVBC'}></AgGridColumn>
                    <AgGridColumn field="PowerDetailId" headerName="Action" type="rightAligned" cellRenderer={'totalValueRenderer'}></AgGridColumn>
                  </AgGridReact>}
                {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} />}
              </div>
            </div>
          </Col>
        </Row>
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.POWER_DELETE_ALERT}`} />
        }
      </div >
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ fuel, comman, supplier, auth }) {
  const { plantSelectList, stateSelectList, powerDataList, vendorPowerDataList } = fuel;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { filterPlantList, } = comman;
  const { initialConfiguration } = auth;
  return { vendorWithVendorCodeSelectList, filterPlantList, plantSelectList, stateSelectList, powerDataList, initialConfiguration, vendorPowerDataList }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getPowerDetailDataList,
  getVendorPowerDetailDataList,
  getPlantListByState,
  getPlantBySupplier,
  deletePowerDetail,
  deleteVendorPowerDetail,
})(reduxForm({
  form: 'PowerListing',
  enableReinitialize: true,
  touchOnChange: true
})(PowerListing));