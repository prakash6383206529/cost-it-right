import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { checkForDecimalAndNull, required } from "../../../helper/validation";
import {
  getPowerDetailDataList, getVendorPowerDetailDataList, getFuelComboData, getPlantListByState,
  getZBCPlantList, getStateSelectList, deletePowerDetail, deleteVendorPowerDetail,
} from '../actions/Fuel';
import { getPlantBySupplier } from '../../../actions/Common';
import { getVendorWithVendorCodeSelectList, } from '../actions/Supplier';
import { searchableSelect } from "../../layout/FormInputs";
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import Switch from "react-switch";
import moment from 'moment';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import { PowerMaster } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { POWERLISTING_DOWNLOAD_EXCEl, POWERLISTING_VENDOR_DOWNLOAD_EXCEL } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { li } from 'react-dom-factories';
import { getConfigurationKey } from '../../../helper';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';

const ExcelFile = ReactExport.ExcelFile;
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
      showPopup:false,
      deletedId:''
    }
  }

  /**
  * @method componentDidMount
  * @description Called after rendering the component
  */
  componentDidMount() {
    this.props.getZBCPlantList(() => { })
    this.props.getStateSelectList(() => { })
    this.props.getVendorWithVendorCodeSelectList();
    this.getDataList()
  }

  getDataList = () => {
    const { StateName, plant, vendorName, vendorPlant } = this.state;
    if (!this.state.IsVendor) {

      const filterData = {
        plantID: plant ? plant.value : '',
        stateID: StateName ? StateName.value : '',
      }
      this.props.getPowerDetailDataList(filterData, (res) => {
        if (res && res.status === 200) {
          let Data = res.data.DataList;
          this.setState({ tableData: Data })
        } else if (res && res.response && res.response.status === 412) {
          this.setState({ tableData: [] })
        } else {
          this.setState({ tableData: [] })
        }
      })

    } else {

      const filterData = {
        vendorID: vendorName && vendorName !== undefined ? vendorName.value : '',
        plantID: vendorPlant && vendorPlant !== undefined ? vendorPlant.value : '',
      }
      this.props.getVendorPowerDetailDataList(filterData, (res) => {
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
  * @method editItemDetails
  * @description edit material type
  */
  editItemDetails = (Id) => {
    let data = {
      isEditFlag: true,
      Id: Id,
      IsVendor: this.state.IsVendor,
    }
    this.props.getDetails(data);
  }

  /**
  * @method deleteItem
  * @description confirm delete Raw Material details
  */
  deleteItem = (Id) => {
    this.setState({showPopup:true, deletedId:Id })
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDelete(Id);
      },
      onCancel: () => { },
      component: () => <ConfirmComponent />,
    };
    // return Toaster.confirm(`${MESSAGES.POWER_DELETE_ALERT}`, toastrConfirmOptions);
  }

  /**
  * @method confirmDelete
  * @description confirm delete Raw Material details
  */
  confirmDelete = (ID) => {
    if (this.state.IsVendor) {
      this.props.deleteVendorPowerDetail(ID, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.DELETE_POWER_SUCCESS);
          this.getDataList()
        }
      });
    } else {
      this.props.deletePowerDetail(ID, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.DELETE_POWER_SUCCESS);
          this.getDataList()
        }
      });
      this.setState({showPopup:false})
    }
  }
  onPopupConfirm =() => {
    this.confirmDelete(this.state.deletedId);
}
closePopUp= () =>{
    this.setState({showPopup:false})
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
    return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
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
    var value = document.getElementById('page-size').value;
    this.state.gridApi.paginationSetPageSize(Number(value));
  };

  onBtExport = () => {
    let tempArr = []
    const data = this.state.gridApi && this.state.gridApi.getModel().rowsToDisplay
    data && data.map((item => {
      tempArr.push(item.data)
    }))

    let listing = []
    let downloadTemp = ''
    if (this.state.IsVendor) {
      listing = this.props.vendorPowerDataList
      downloadTemp = POWERLISTING_VENDOR_DOWNLOAD_EXCEL
    } else {
      listing = this.props.powerDataList
      downloadTemp = POWERLISTING_DOWNLOAD_EXCEl
    }
    return this.returnExcelColumn(downloadTemp, listing)
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
    const { handleSubmit, AddAccessibility, initialConfiguration, DownloadAccessibility } = this.props;
    const { isEditFlag, } = this.state;
    const options = {
      clearSearch: true,
      noDataText: (this.props.powerDataList === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),
      paginationShowsTotal: this.renderPaginationShowsTotal,
      exportCSVBtn: this.createCustomExportCSVButton,
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
      // effectiveDateRenderer: this.effectiveDateFormatter,
      // costingHeadRenderer: this.costingHeadFormatter,
      // customLoadingOverlay: LoaderCustom,
      customNoRowsOverlay: NoContentFound,
      // freightCostFormatter: this.freightCostFormatter,
      // shearingCostFormatter: this.shearingCostFormatter,
      costFormatter: this.costFormatter
    };

    return (

      <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
        {/* {this.props.loading && <Loader />} */}
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

                      //   <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>

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



            <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
              {/* ZBC Listing */}
              <div className="ag-grid-header">
                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
              </div>
              <div
                className="ag-theme-material"
              >
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
                    loadingOverlayComponent={'customLoadingOverlay'}
                    noRowsOverlayComponent={'customNoRowsOverlay'}
                    noRowsOverlayComponentParams={{
                      title: EMPTY_DATA,
                      imagClass: 'imagClass power-listing'
                    }}
                    frameworkComponents={frameworkComponents}
                  >
                    <AgGridColumn field="StateName"></AgGridColumn>
                    <AgGridColumn field="PlantName"></AgGridColumn>
                    <AgGridColumn field="NetPowerCostPerUnit" cellRenderer={'costFormatter'}></AgGridColumn>
                    <AgGridColumn field="PowerId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                  </AgGridReact>}

                {/* VBC Listing */}
                {this.state.IsVendor &&
                  <AgGridReact
                    defaultColDef={defaultColDef}
                    domLayout='autoHeight'
                    floatingFilter={true}
                    // columnDefs={c}
                    rowData={this.props.vendorPowerDataList}
                    pagination={true}
                    paginationPageSize={10}
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
        {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.POWER_DELETE_ALERT}`}  />
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
  getFuelComboData,
  getPlantListByState,
  getZBCPlantList,
  getStateSelectList,
  getVendorWithVendorCodeSelectList,
  getPlantBySupplier,
  deletePowerDetail,
  deleteVendorPowerDetail,
})(reduxForm({
  form: 'PowerListing',
  enableReinitialize: true,
})(PowerListing));