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
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr'
import Switch from "react-switch";
import moment from 'moment';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import { PowerMaster } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { POWERLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

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
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDelete(Id);
      },
      onCancel: () => { },
      component: () => <ConfirmComponent />,
    };
    return toastr.confirm(`${MESSAGES.POWER_DELETE_ALERT}`, toastrConfirmOptions);
  }

  /**
  * @method confirmDelete
  * @description confirm delete Raw Material details
  */
  confirmDelete = (ID) => {
    if (this.state.IsVendor) {
      this.props.deleteVendorPowerDetail(ID, (res) => {
        if (res.data.Result === true) {
          toastr.success(MESSAGES.DELETE_POWER_SUCCESS);
          this.getDataList()
        }
      });
    } else {
      this.props.deletePowerDetail(ID, (res) => {
        if (res.data.Result === true) {
          toastr.success(MESSAGES.DELETE_POWER_SUCCESS);
          this.getDataList()
        }
      });
    }
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
  effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
    return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
  }

  renderEffectiveDate = () => {
    return <>Effective <br />Date</>
  }

  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { plantSelectList, stateSelectList, vendorWithVendorCodeSelectList, filterPlantList } = this.props;
    const temp = [];

    if (label === 'state') {
      stateSelectList && stateSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
    if (label === 'VendorNameList') {
      vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
    if (label === 'VendorPlant') {
      filterPlantList && filterPlantList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }

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

  /**
  * @method handleState
  * @description  STATE FILTER
  */
  handleState = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ StateName: newValue }, () => {
        const { StateName } = this.state;
        this.props.getPlantListByState(StateName.value, () => { })
      });
    } else {
      this.setState({ StateName: [], });
    }
  }

  /**
  * @method handlePlant
  * @description  PLANT FILTER
  */
  handlePlant = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ plant: newValue });
    } else {
      this.setState({ plant: [], });
    }
  }

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, selectedVendorPlants: [] }, () => {
        const { vendorName } = this.state;
        this.props.getPlantBySupplier(vendorName.value, () => { })
      });
    } else {
      this.setState({ vendorName: [], selectedVendorPlants: [], })
      this.props.getPlantBySupplier('', () => { })
    }
  };

  /**
  * @method handleVendorPlant
  * @description called
  */
  handleVendorPlant = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorPlant: newValue, });
    } else {
      this.setState({ vendorPlant: [], })
    }
  };

  /**
  * @method filterList
  * @description Filter user listing on the basis of role and department
  */
  filterList = () => {
    this.getDataList()
  }

  /**
  * @method resetFilter
  * @description Reset user filter
  */
  resetFilter = () => {
    this.setState({
      StateName: [],
      plant: [],
      vendorName: [],
      vendorPlant: [],
    }, () => {
      this.props.getPlantListByState('', () => { })
      this.props.getPlantBySupplier('', () => { })
      this.getDataList()
    })
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
    temp = TempData.map((item) => {
      if (item.IsVendor === true) {
        item.IsVendor = 'VBC'
      } if (item.IsVendor === false) {
        item.IsVendor = 'ZBV'
      } if (item.Plants === '-') {
        item.Plants = ' '
      } if (item.Vendor === '-') {
        item.Vendor = ' '
      } else {
        return false
      }
      return item
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
    return this.returnExcelColumn(POWERLISTING_DOWNLOAD_EXCEl, tempArr)
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
    const { handleSubmit, AddAccessibility, initialConfiguration, DownloadAccessibility } = this.props;
    const { isEditFlag, } = this.state;
    const options = {
      clearSearch: true,
      noDataText: (this.props.powerDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
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
      // customNoRowsOverlay: NoContentFound,
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
            {this.state.shown && (
              <Col md="8" className="filter-block mt-4">
                <div className="d-inline-flex justify-content-start align-items-top w100">
                  <div className="flex-fills">
                    <h5>{`Filter By:`}</h5>
                  </div>
                  {!this.state.IsVendor && (
                    <>
                      <div className="flex-fill">
                        <Field
                          name="state"
                          type="text"
                          label={""}
                          component={searchableSelect}
                          placeholder={"Select State"}
                          isClearable={false}
                          options={this.renderListing("state")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          //validate={(this.state.StateName == null || this.state.StateName.length == 0) ? [required] : []}
                          //required={true}
                          handleChangeDescription={this.handleState}
                          valueDescription={this.state.StateName}
                          disabled={false}
                        />
                      </div>
                      <div className="flex-fill">
                        <Field
                          name="plant"
                          type="text"
                          label={""}
                          component={searchableSelect}
                          placeholder={"Select Plant"}
                          isClearable={false}
                          options={this.renderListing("plant")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          //validate={(this.state.plant == null || this.state.plant.length == 0) ? [required] : []}
                          //required={true}
                          handleChangeDescription={this.handlePlant}
                          valueDescription={this.state.plant}
                        />
                      </div>
                    </>
                  )}
                  {this.state.IsVendor && (
                    <>
                      <div className="flex-fill">
                        <Field
                          name="VendorName"
                          type="text"
                          label={""}
                          component={searchableSelect}
                          placeholder={"Vendor Name"}
                          isClearable={false}
                          options={this.renderListing("VendorNameList")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={
                            this.state.vendorName == null ||
                              this.state.vendorName.length === 0
                              ? [required]
                              : []
                          }
                          required={true}
                          handleChangeDescription={this.handleVendorName}
                          valueDescription={this.state.vendorName}
                          disabled={isEditFlag ? true : false}
                          className="fullinput-icon"
                        />
                      </div>
                      {
                        initialConfiguration && initialConfiguration.IsVendorPlantConfigurable &&
                        <div className="flex-fill">
                          <Field
                            name="VendorPlant"
                            type="text"
                            label={""}
                            component={searchableSelect}
                            placeholder={"Vendor Plant"}
                            isClearable={false}
                            options={this.renderListing("VendorPlant")}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
                            validate={
                              this.state.vendorPlant == null ||
                                this.state.vendorPlant.length === 0
                                ? [required]
                                : []
                            }
                            required={true}
                            handleChangeDescription={this.handleVendorPlant}
                            valueDescription={this.state.vendorPlant}
                            disabled={isEditFlag ? true : false}
                            className="fullinput-icon"
                          />
                        </div>
                      }
                    </>
                  )}
                  <div className="flex-fill">
                    <button
                      type="button"
                      //disabled={pristine || submitting}
                      onClick={this.resetFilter}
                      className="reset mr10"
                    >
                      {"Reset"}
                    </button>
                    <button
                      type="button"
                      //disabled={pristine || submitting}
                      onClick={this.filterList}
                      className="user-btn mr5"
                    >
                      {"Apply"}
                    </button>
                  </div>
                </div>
              </Col>)}
            <Col md="6" className="search-user-block mb-3">
              <div className="d-flex justify-content-end bd-highlight w100">
                <div>
                  <>
                    {this.state.shown ? (
                      <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                        <div className="cancel-icon-white"></div></button>
                    ) : (
                      <button title="Filter" type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>
                                                    <div className="filter mr-0"></div>
                                                </button>
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

            {/* ZBC POWER LISTING */}
            {/* <BootstrapTable
                data={this.props.powerDataList}
                striped={false}
                hover={false}
                bordered={false}
                options={options}
                search
                exportCSV={DownloadAccessibility}
                csvFileName={`${PowerMaster}.csv`}
                //ignoreSinglePage
                ref={'table'}
                pagination>
             
                <TableHeaderColumn dataField="StateName" columnTitle={true} dataAlign="left" dataSort={true} >{'State'}</TableHeaderColumn>
                <TableHeaderColumn dataField="PlantName" columnTitle={true} dataAlign="left" dataSort={true} >{'Plant'}</TableHeaderColumn>
                <TableHeaderColumn searchable={false} dataField="NetPowerCostPerUnit" columnTitle={true} dataAlign="left" dataSort={true} dataFormat={this.costFormatter} >{'Net Cost Per Unit'}</TableHeaderColumn>
                <TableHeaderColumn dataAlign="right" searchable={false} width={100} dataField="PowerId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
              </BootstrapTable>} */}
            {/* {!this.state.IsVendor && */}

            {/* VENDOR POWER LISTING */}
            {/* {this.state.IsVendor &&
              <BootstrapTable
                data={this.props.vendorPowerDataList}
                striped={false}
                hover={false}
                bordered={false}
                options={options}
                search
                exportCSV={DownloadAccessibility}
                csvFileName={`${PowerMaster}.csv`}
                //ignoreSinglePage
                ref={'table'}
                pagination>
          
                <TableHeaderColumn dataField="VendorName" columnTitle={true} dataAlign="left" dataSort={true} >{'Vendor Name'}</TableHeaderColumn>
                {initialConfiguration && initialConfiguration.IsVendorPlantConfigurable && <TableHeaderColumn dataField="VendorPlantName" columnTitle={true} dataAlign="left" dataSort={true} >{'Vendor Plant'}</TableHeaderColumn>}
                <TableHeaderColumn searchable={false} dataField="NetPowerCostPerUnit" columnTitle={true} dataAlign="center" dataSort={true} dataFormat={this.costFormatterForVBC} >{'Net Cost Per Unit'}</TableHeaderColumn>
                <TableHeaderColumn dataAlign="right" searchable={false} width={100} dataField="PowerDetailId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
              </BootstrapTable>} */}

            <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
              <div className="ag-grid-header">
                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
              </div>
              <div
                className="ag-theme-material"
                style={{ height: '100%', width: '100%' }}
              >
                {!this.state.IsVendor &&
                  <AgGridReact
                    defaultColDef={defaultColDef}
                    // columnDefs={c}
                    rowData={this.props.powerDataList}
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
                    <AgGridColumn field="StateName"></AgGridColumn>
                    <AgGridColumn field="PlantName"></AgGridColumn>
                    <AgGridColumn field="NetPowerCostPerUnit" cellRenderer={'costFormatter'}></AgGridColumn>
                    <AgGridColumn field="PowerId" headerName="Action" cellRenderer={'totalValueRenderer'}></AgGridColumn>
                  </AgGridReact>}


                {this.state.IsVendor &&
                  <AgGridReact
                    defaultColDef={defaultColDef}
                    // columnDefs={c}
                    rowData={this.props.vendorPowerDataList}
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
                    <AgGridColumn field="VendorName"></AgGridColumn>
                    <AgGridColumn field="VendorPlantName"></AgGridColumn>
                    <AgGridColumn field="NetPowerCostPerUnit" cellRenderer={'costFormatterForVBC'}></AgGridColumn>
                    <AgGridColumn field="PowerDetailId" headerName="Action" cellRenderer={'totalValueRenderer'}></AgGridColumn>
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