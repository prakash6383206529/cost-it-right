import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { getVendorWithVendorCodeSelectList } from '../../../actions/Common';
import { getInterestRateDataList, deleteInterestRate, getPaymentTermsAppliSelectList, getICCAppliSelectList, } from '../actions/InterestRateMaster';
import { getVendorListByVendorType, } from '../actions/Material';
import Switch from "react-switch";
import moment from 'moment';
import AddInterestRate from './AddInterestRate';
import BulkUpload from '../../massUpload/BulkUpload';
import { ADDITIONAL_MASTERS, InterestMaster, INTEREST_RATE } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import ReactExport from 'react-export-excel';
import { INTERESTRATE_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class InterestRateListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],

      vendorName: [],
      ICCApplicability: [],
      PaymentTermsApplicability: [],
      shown: false,
      data: { isEditFlag: false, ID: '' },
      toggleForm: false,
      isBulkUpload: false,

      ViewAccessibility: false,
      AddAccessibility: false,
      EditAccessibility: false,
      DeleteAccessibility: false,
      BulkUploadAccessibility: false,
      DownloadAccessibility: false,
      gridApi: null,
      gridColumnApi: null,
      rowData: null,
      sideBar: { toolPanels: ['columns'] },
      showData: false,
      isLoader: true,
    }
  }

  componentDidMount() {

    this.applyPermission(this.props.topAndLeftMenuData)

    setTimeout(() => {
      this.props.getVendorWithVendorCodeSelectList()
      this.props.getICCAppliSelectList(() => { })
      this.props.getPaymentTermsAppliSelectList(() => { })
      this.getTableListData()
    }, 500);
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
      const accessData = Data && Data.Pages.find(el => el.PageName === INTEREST_RATE)
      const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

      if (permmisionData !== undefined) {
        this.setState({
          ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
          AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
          EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
          DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
          BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
          DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
        })
      }

    }
  }

  componentWillUnmount() {
    this.props.getInterestRateDataList(false, {}, (res) => { })
  }


  /**
  * @method getTableListData
  * @description Get list data
  */
  getTableListData = (vendor = '', icc_applicability = '', payment_term_applicability = '') => {
    let filterData = {
      vendor: vendor,
      icc_applicability: icc_applicability,
      payment_term_applicability: payment_term_applicability,
    }
    this.props.getInterestRateDataList(true, filterData, res => {
      if (res.status === 204 && res.data === '') {
        this.setState({ tableData: [], })
      } else if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList;
        this.setState({ tableData: Data, }, () => { this.setState({ isLoader: false }) })
      } else {
        this.setState({ tableData: [], })
      }
    });
  }

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { vendorWithVendorCodeSelectList, paymentTermsSelectList, iccApplicabilitySelectList, } = this.props;
    const temp = [];

    if (label === 'costingHead') {
      let tempObj = [
        { label: 'ZBC', value: 'ZBC' },
        { label: 'VBC', value: 'VBC' },
      ]
      return tempObj;
    }

    if (label === 'VendorList') {
      vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
    if (label === 'ICC') {
      iccApplicabilitySelectList && iccApplicabilitySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
    if (label === 'PaymentTerms') {
      paymentTermsSelectList && paymentTermsSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
  }

  /**
  * @method editItemDetails
  * @description confirm edit item
  */
  editItemDetails = (Id) => {
    this.setState({
      data: { isEditFlag: true, ID: Id },
      toggleForm: true,
    })
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
      component: () => <ConfirmComponent />
    };
    return toastr.confirm(MESSAGES.INTEREST_DELETE_ALERT, toastrConfirmOptions);
  }

  /**
  * @method confirmDeleteItem
  * @description confirm delete item
  */
  confirmDeleteItem = (ID) => {
    this.props.deleteInterestRate(ID, (res) => {
      if (res.data.Result === true) {
        toastr.success(MESSAGES.DELETE_INTEREST_RATE_SUCCESS);
        this.getTableListData()
      }
    });
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
    return <> Effective Date </>
  }

  /**
  * @method buttonFormatter
  * @description Renders buttons
  */
  buttonFormatter = (props) => {

    const cellValue = props?.value;
    const rowData = props?.data;

    const { EditAccessibility, DeleteAccessibility } = this.state;
    return (
      <>
        {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
        {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
      </>
    )
  };

  handleChange = (cell, row, enumObject, rowIndex) => {
    let data = {
      Id: row.VendorId,
      ModifiedBy: loggedInUserId(),
      IsActive: !cell, //Status of the user.
    }
    // this.props.activeInactiveVendorStatus(data, res => {
    //     if (res && res.data && res.data.Result) {
    //         if (cell == true) {
    //             toastr.success(MESSAGES.VENDOR_INACTIVE_SUCCESSFULLY)
    //         } else {
    //             toastr.success(MESSAGES.VENDOR_ACTIVE_SUCCESSFULLY)
    //         }
    //         this.getTableListData(null, null, null, null)
    //     }
    // })
  }

  /**
  * @method handleICCApplicability
  * @description called
  */
  handleICCApplicability = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ ICCApplicability: newValue, });
    } else {
      this.setState({ ICCApplicability: [], })
    }
  };

  /**
  * @method handlePaymentApplicability
  * @description called
  */
  handlePaymentApplicability = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ PaymentTermsApplicability: newValue, });
    } else {
      this.setState({ PaymentTermsApplicability: [], })
    }
  };

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue });
    } else {
      this.setState({ vendorName: [] })
    }
  };

  /**
  * @method statusButtonFormatter
  * @description Renders buttons
  */
  statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
    return (
      <>
        <label htmlFor="normal-switch" className="normal-switch">
          {/* <span>Switch with default style</span> */}
          <Switch
            onChange={() => this.handleChange(cell, row, enumObject, rowIndex)}
            checked={cell}
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


  /**
  * @method indexFormatter
  * @description Renders serial number
  */
  indexFormatter = (cell, row, enumObject, rowIndex) => {
    let currentPage = this.refs.table.state.currPage;
    let sizePerPage = this.refs.table.state.sizePerPage;
    let serialNumber = '';
    if (currentPage === 1) {
      serialNumber = rowIndex + 1;
    } else {
      serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
    }
    return serialNumber;
  }



  /**
  * @method costingHeadFormatter
  * @description Renders Costing head
  */
  costingHeadFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue ? 'Vendor Based' : 'Zero Based';
  }

  /**
  * @method hyphenFormatter
  */
  hyphenFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null ? cellValue : '-';
  }

  renderVendorName = () => {
    return <>Vendor<br /> Name</>
  }

  onExportToCSV = (row) => {
    // ...
    return this.state.userData; // must return the data which you want to be exported
  }

  renderPaginationShowsTotal(start, to, total) {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  /**
  * @method filterList
  * @description Filter user listing on the basis of role and department
  */
  filterList = () => {
    const { vendorName, ICCApplicability, PaymentTermsApplicability, } = this.state;

    const vendorTemp = vendorName ? vendorName.value : '';
    const iccTemp = ICCApplicability ? ICCApplicability.value : '';
    const paymentTemp = PaymentTermsApplicability ? PaymentTermsApplicability.value : '';

    this.getTableListData(vendorTemp, iccTemp, paymentTemp)
  }

  /**
  * @method resetFilter
  * @description Reset user filter
  */
  resetFilter = () => {
    this.setState({
      vendorName: [],
      ICCApplicability: [],
      PaymentTermsApplicability: [],
    }, () => {
      this.getTableListData()
    })
  }

  formToggle = () => {
    this.setState({ toggleForm: true })
  }

  hideForm = () => {
    this.setState({
      toggleForm: false,
      data: { isEditFlag: false, ID: '' }
    }, () => {
      this.getTableListData()
    })
  }

  bulkToggle = () => {
    this.setState({ isBulkUpload: true })
  }

  closeBulkUploadDrawer = () => {
    this.setState({ isBulkUpload: false }, () => {
      this.getTableListData()
    })
  }

  /**
  * @name onSubmit
  * @param values
  * @desc Submit the signup form values.
  * @returns {{}}
  */
  onSubmit(values) {
  }

  onGridReady = (params) => {
    this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })

    params.api.paginationGoToPage(0);
    //if resolution greater than 1920 table listing fit to 100%
    window.screen.width >= 1921 && params.api.sizeColumnsToFit()
    //if resolution greater than 1920 table listing fit to 100%
  };

  onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById('page-size').value;
    this.state.gridApi.paginationSetPageSize(Number(value));
  };

  onBtExport = () => {
    let tempArr = []
    const data = this.state.gridApi && this.state.gridApi.length > 0 && this.state.gridApi.getModel().rowsToDisplay
    data && data.map((item => {
      tempArr.push(item.data)
    }))

    return this.returnExcelColumn(INTERESTRATE_DOWNLOAD_EXCEl, this.props.interestRateDataList)
  };

  returnExcelColumn = (data = [], TempData) => {
    let temp = []
    TempData && TempData.map((item) => {
      if (item.ICCPercent === null) {
        item.ICCPercent = ' '
      } else if (item.PaymentTermPercent === null) {
        item.PaymentTermPercent = ' '
      } else if (item.IsVendor === true) {
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
    return (

      <ExcelSheet data={TempData} name={InterestMaster}>
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
    const { handleSubmit, } = this.props;
    const { toggleForm, data, isBulkUpload, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.state;

    if (toggleForm) {
      return (
        <AddInterestRate
          hideForm={this.hideForm}
          data={data}
        />
      )
    }
    const defaultColDef = {
      resizable: true,
      filter: true,
      sortable: true,

    };

    const frameworkComponents = {
      totalValueRenderer: this.buttonFormatter,
      effectiveDateRenderer: this.effectiveDateFormatter,
      customLoadingOverlay: LoaderCustom,
      customNoRowsOverlay: NoContentFound,
      costingHeadFormatter: this.costingHeadFormatter,
      hyphenFormatter: this.hyphenFormatter
    };
    const options = {
      clearSearch: true,
      noDataText: (this.props.interestRateDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
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

    return (
      <>
        {this.state.isLoader && <LoaderCustom />}
        <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
          <form
            onSubmit={handleSubmit(this.onSubmit.bind(this))}
            noValidate
          >
            <Row>
              <Col md="12">
                <h1 className="mb-0">Interest Rate Master</h1>
              </Col>
            </Row>
            <Row className="pt-4 filter-row-large blue-before">
              {this.state.shown &&
                <Col lg="10" md="12" className="filter-block interest-rate-filter-block">
                  <div className="d-inline-flex justify-content-start align-items-top w100">
                    <div className="flex-fills">
                      <h5>{`Filter By:`}</h5>
                    </div>
                    <div className="flex-fill">
                      <Field
                        name="vendorName"
                        type="text"
                        label=""
                        component={searchableSelect}
                        placeholder={"Vendors"}
                        isClearable={false}
                        options={this.renderListing("VendorList")}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        //validate={(this.state.vendorName == null || this.state.vendorName.length === 0) ? [required] : []}
                        //required={true}
                        handleChangeDescription={this.handleVendorName}
                        valueDescription={this.state.vendorName}
                      />
                    </div>
                    <div className="flex-fill">
                      <Field
                        name="ICCApplicability"
                        type="text"
                        label=""
                        component={searchableSelect}
                        placeholder={"ICC Applicability"}
                        isClearable={false}
                        options={this.renderListing("ICC")}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        //validate={(this.state.ICCApplicability == null || this.state.ICCApplicability.length === 0) ? [required] : []}
                        //required={true}
                        handleChangeDescription={this.handleICCApplicability}
                        valueDescription={this.state.ICCApplicability}
                        disabled={false}
                      />
                    </div>
                    <div className="flex-fill">
                      <Field
                        name="PaymentTermsApplicability"
                        type="text"
                        label=""
                        component={searchableSelect}
                        placeholder={"Payment Term Applicability"}
                        isClearable={false}
                        options={this.renderListing("PaymentTerms")}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        //validate={(this.state.PaymentTermsApplicability == null || this.state.PaymentTermsApplicability.length === 0) ? [required] : []}
                        //required={true}
                        handleChangeDescription={
                          this.handlePaymentApplicability
                        }
                        valueDescription={
                          this.state.PaymentTermsApplicability
                        }
                        disabled={false}
                      />
                    </div>

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
                </Col>}
              <Col md="6" className="search-user-block mb-3">
                <div className="d-flex justify-content-end bd-highlight w100">
                  <div>
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
                    {BulkUploadAccessibility && (
                      <button
                        type="button"
                        className={"user-btn mr5"}
                        onClick={this.bulkToggle}
                        title="Bulk Upload"
                      >
                        <div className={"upload mr-0"}></div>
                        {/* Bulk Upload */}
                      </button>
                    )}
                    {
                      DownloadAccessibility &&
                      <>

                        <ExcelFile filename={'InterestMaster'} fileExtension={'.xls'} element={
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
          </form>


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
                rowData={this.props.interestRateDataList}
                pagination={true}
                paginationPageSize={10}
                onGridReady={this.onGridReady}
                gridOptions={gridOptions}
                // loadingOverlayComponent={'customLoadingOverlay'}
                noRowsOverlayComponent={'customNoRowsOverlay'}
                noRowsOverlayComponentParams={{
                  title: CONSTANT.EMPTY_DATA,
                  imagClass:'imagClass'
                }}
                frameworkComponents={frameworkComponents}
              >
                <AgGridColumn width={140} field="IsVendor" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                <AgGridColumn field="VendorName" headerName="Vendor Name"></AgGridColumn>
                <AgGridColumn field="ICCApplicability" headerName="ICC Applicability"></AgGridColumn>
                <AgGridColumn width={140} field="ICCPercent" headerName="Annual ICC(%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn width={220} field="PaymentTermApplicability" headerName="Payment Term Applicability"></AgGridColumn>
                <AgGridColumn width={210} field="RepaymentPeriod" headerName="Repayment Period(Days)"></AgGridColumn>
                <AgGridColumn width={245} field="PaymentTermPercent" headerName="Payment Term Interest Rate(%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'}></AgGridColumn>
                <AgGridColumn width={120} field="VendorInterestRateId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
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

          {
            isBulkUpload && <BulkUpload
              isOpen={isBulkUpload}
              closeDrawer={this.closeBulkUploadDrawer}
              isEditFlag={false}
              fileName={'InterestRate'}
              isZBCVBCTemplate={true}
              messageLabel={'Interest Rate'}
              anchor={'right'}
            />
          }
        </div >
      </ >
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material, auth, interestRate, comman }) {
  const { leftMenuData, initialConfiguration, topAndLeftMenuData } = auth;
  const { vendorListByVendorType } = material;
  const { paymentTermsSelectList, iccApplicabilitySelectList, interestRateDataList } = interestRate;
  const { vendorWithVendorCodeSelectList } = comman;
  return { vendorListByVendorType, paymentTermsSelectList, iccApplicabilitySelectList, leftMenuData, interestRateDataList, vendorWithVendorCodeSelectList, initialConfiguration, topAndLeftMenuData };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getInterestRateDataList,
  deleteInterestRate,
  getVendorListByVendorType,
  getPaymentTermsAppliSelectList,
  getICCAppliSelectList,
  getLeftMenu,
  getVendorWithVendorCodeSelectList
})(reduxForm({
  form: 'InterestRateListing',
  onSubmitFail: errors => {
    focusOnError(errors);
  },
  enableReinitialize: true,
})(InterestRateListing));
