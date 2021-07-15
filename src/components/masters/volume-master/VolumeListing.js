import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { Row, Col } from 'reactstrap'
import { focusOnError, searchableSelect } from '../../layout/FormInputs'
import { required } from '../../../helper/validation'
import { toastr } from 'react-redux-toastr'
import { MESSAGES } from '../../../config/message'
import { CONSTANT } from '../../../helper/AllConastant'
import NoContentFound from '../../common/NoContentFound'
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table'
import { getVolumeDataList, deleteVolume, getFinancialYearSelectList, } from '../actions/Volume'
import { getPlantSelectList, getVendorWithVendorCodeSelectList } from '../../../actions/Common'
import { getVendorListByVendorType } from '../actions/Material'
import $ from 'jquery'
import { costingHeadObjs, Months, VOLUME_DOWNLOAD_EXCEl } from '../../../config/masterData'
import AddVolume from './AddVolume'
import BulkUpload from '../../massUpload/BulkUpload'
import { VOLUME, VolumeMaster, ZBC } from '../../../config/constants'
import { checkPermission } from '../../../helper/util'
import { reactLocalStorage } from 'reactjs-localstorage'
import { loggedInUserId } from '../../../helper/auth'
import { getLeftMenu } from '../../../actions/auth/AuthActions'
import { GridTotalFormate } from '../../common/TableGridFunctions'
import ConfirmComponent from '../../../helper/ConfirmComponent'
import LoaderCustom from '../../common/LoaderCustom'
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const initialTableData = [
  {
    VolumeApprovedDetailId: 0,
    Month: 'April',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  { VolumeApprovedDetailId: 1, Month: 'May', BudgetedQuantity: 0, ApprovedQuantity: 0 },
  {
    VolumeApprovedDetailId: 2,
    Month: 'June',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 3,
    Month: 'July',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 4,
    Month: 'August',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 5,
    Month: 'September',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 6,
    Month: 'October',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 7,
    Month: 'November',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 8,
    Month: 'December',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 9,
    Month: 'January',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 10,
    Month: 'February',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
  {
    VolumeApprovedDetailId: 11,
    Month: 'March',
    BudgetedQuantity: 0,
    ApprovedQuantity: 0,
  },
]
class VolumeListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isEditFlag: false,
      isOpen: false,
      shown: false,
      tableData: [],
      showVolumeForm: false,
      data: { isEditFlag: false, ID: '' },

      year: [],
      month: [],
      vendorName: [],
      plant: [],
      costing_head: [],

      isActualBulkUpload: false,
      isBudgetedBulkUpload: false,

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
      showData: false

    }
  }

  componentDidMount() {
    let ModuleId = reactLocalStorage.get('ModuleId')
    this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
      const { leftMenuData } = this.props
      if (leftMenuData !== undefined) {
        let Data = leftMenuData
        const accessData = Data && Data.find((el) => el.PageName === VOLUME)
        const permmisionData =
          accessData &&
          accessData.Actions &&
          checkPermission(accessData.Actions)

        if (permmisionData !== undefined) {
          this.setState({
            ViewAccessibility:
              permmisionData && permmisionData.View
                ? permmisionData.View
                : false,
            AddAccessibility:
              permmisionData && permmisionData.Add ? permmisionData.Add : false,
            EditAccessibility:
              permmisionData && permmisionData.Edit
                ? permmisionData.Edit
                : false,
            DeleteAccessibility:
              permmisionData && permmisionData.Delete
                ? permmisionData.Delete
                : false,
            BulkUploadAccessibility:
              permmisionData && permmisionData.BulkUpload
                ? permmisionData.BulkUpload
                : false,
            DownloadAccessibility:
              permmisionData && permmisionData.Download
                ? permmisionData.Download
                : false,
          })
        }
      }
    })

    this.props.getPlantSelectList(() => { })
    this.props.getFinancialYearSelectList(() => { })
    // this.props.getVendorListByVendorType(true, () => { })
    this.props.getVendorWithVendorCodeSelectList()
    this.getTableListData()
  }

  /**
   * @method getTableListData
   * @description Get user list data
   */
  getTableListData = (year = '', month = '', vendor_id = '', plant_id = '', costing_head = '') => {
    let filterData = {
      year: year,
      month: month,
      vendor_id: vendor_id,
      plant_id: plant_id,
      costing_head: costing_head
    }
    this.props.getVolumeDataList(filterData, (res) => {
      if (res.status === 204 && res.data === '') {
        this.setState({ tableData: [] })
      } else if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList
        this.setState({
          tableData: Data.sort((a, b) => a.Sequence - b.Sequence).sort(
            (a, b) => a.Index - b.Index,
          ),
        })
      } else {
        this.setState({ tableData: [] })
      }
    })
  }

  /**
   * @method renderListing
   * @description Used show listing of unit of measurement
   */
  renderListing = (label) => {
    const { vendorWithVendorCodeSelectList, plantSelectList, financialYearSelectList, costingHead } = this.props
    const temp = []

    if (label === 'costingHead') {
      return costingHeadObjs;
    }


    if (label === 'VendorList') {
      vendorWithVendorCodeSelectList &&
        vendorWithVendorCodeSelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
    if (label === 'year') {
      financialYearSelectList &&
        financialYearSelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
    if (label === 'month') {
      Months &&
        Months.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
    if (label === 'plant') {
      plantSelectList &&
        plantSelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
  }

  /**
   * @method editItemDetails
   * @description confirm edit item
   */
  editItemDetails = (Id) => {
    this.setState({
      data: { isEditFlag: true, ID: Id },
      showVolumeForm: true,
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
      component: () => <ConfirmComponent />,
    }
    return toastr.confirm(MESSAGES.VOLUME_DELETE_ALERT, toastrConfirmOptions)
  }

  /**
   * @method confirmDeleteItem
   * @description confirm delete item
   */
  confirmDeleteItem = (ID) => {
    this.props.deleteVolume(ID, (res) => {
      if (res.data.Result === true) {
        toastr.success(MESSAGES.DELETE_VOLUME_SUCCESS)
        this.getTableListData(null, null, null, null, null, null)
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

    const { EditAccessibility, DeleteAccessibility } = this.state;
    return (
      <>
        {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
        {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
      </>
    )
  };

  /**
   * @method handleYear
   * @description called
   */
  handleYear = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ year: newValue })
    } else {
      this.setState({ year: [] })
    }
  }

  /**
   * @method handleMonth
   * @description called
   */
  handleMonth = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ month: newValue })
    } else {
      this.setState({ month: [] })
    }
  }

  /**
   * @method handleVendorName
   * @description called
   */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue })
    } else {
      this.setState({ vendorName: [] })
    }
  }

  /**
   * @method handlePlant
   * @description called
   */
  handlePlant = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ plant: newValue })
    } else {
      this.setState({ plant: [] })
    }
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
  renderOperationName = () => {
    return (
      <>
        Operation <br />
        Name{' '}
      </>
    )
  }
  renderOperationCode = () => {
    return (
      <>
        Operation <br />
        Code{' '}
      </>
    )
  }
  renderVendorName = () => {
    return (
      <>
        Vendor <br />
        Name{' '}
      </>
    )
  }

  /**
   * @method costingHeadFormatter
   * @description Renders Costing head
   */
  costingHeadFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue ? 'Vendor Based' : 'Zero Based'
  }

  onExportToCSV = (row) => {
    return this.state.userData // must return the data which you want to be exported
  }

  renderPaginationShowsTotal(start, to, total) {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  plantFormatter = (cell, row, enumObject, rowIndex) => {
    return row.IsVendor ? row.DestinationPlant : cell
  }
  /**
   * @method actualBulkToggle
   * @description OPEN ACTUAL BULK UPLOAD DRAWER FOR BULK UPLOAD
   */
  actualBulkToggle = () => {
    this.setState({ isActualBulkUpload: true })
  }

  /**
   * @method closeActualBulkUploadDrawer
   * @description CLOSE ACTUAL BULK DRAWER
   */
  closeActualBulkUploadDrawer = () => {
    this.setState({ isActualBulkUpload: false }, () => {
      this.getTableListData()
    })
  }

  /**
   * @method budgetedBulkToggle
   * @description OPEN BUDGETED BULK UPLOAD DRAWER FOR BULK UPLOAD
   */
  budgetedBulkToggle = () => {
    this.setState({ isBudgetedBulkUpload: true })
  }

  /**
   * @method closeBudgetedBulkUploadDrawer
   * @description CLOSE BUDGETED BULK DRAWER
   */
  closeBudgetedBulkUploadDrawer = () => {
    this.setState({ isBudgetedBulkUpload: false }, () => {
      this.getTableListData()
    })
  }

  /**
  * @method handleHeadChange
  * @description called
  */
  handleHeadChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ costing_head: newValue, });
    } else {
      this.setState({ costing_head: [], })
    }
  };

  /**
   * @method filterList
   * @description Filter user listing on the basis of role and department
   */
  filterList = () => {
    const { year, month, vendorName, plant, costing_head } = this.state
    const yearTemp = year ? year.value : null
    const monthTemp = month ? month.value : null
    const vendorNameTemp = vendorName ? vendorName.value : null
    const plantTemp = plant ? plant.value : null
    const costingHead = costing_head ? costing_head.value === ZBC ? 0 : 1 : null

    this.getTableListData(yearTemp, monthTemp, vendorNameTemp, plantTemp, costingHead)
  }

  /**
   * @method resetFilter
   * @description Reset user filter
   */
  resetFilter = () => {
    this.setState(
      {
        year: [],
        month: [],
        vendorName: [],
        plant: [],
        costing_head: []
      },
      () => {
        this.getTableListData()
      },
    )
  }

  formToggle = () => {
    this.setState({ showVolumeForm: true })
  }

  /**
   * @method hideForm
   * @description HIDE FORM
   */
  hideForm = () => {
    this.setState(
      { showVolumeForm: false, data: { isEditFlag: false, ID: '' } },
      () => {
        $('html, body').animate({ scrollTop: 0 }, 'slow')
        this.getTableListData()
      },
    )
  }

  /**
   * @name onSubmit
   * @param values
   * @desc Submit the signup form values.
   * @returns {{}}
   */
  onSubmit(values) { }

  onGridReady = (params) => {
    this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
    params.api.paginationGoToPage(0);
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

    return this.returnExcelColumn(VOLUME_DOWNLOAD_EXCEl, tempArr)
  };

  returnExcelColumn = (data = [], TempData) => {
    let temp = []
    TempData.map((item) => {
      if (item.IsVendor === true) {
        item.IsVendor = 'Vendor Based'
      } else if (item.IsVendor === false) {
        item.IsVendor = 'Zero Based'
      } else if (item.VendorName === '-') {
        item.VendorName = ' '
      } else if (item.Plant === '-') {
        item.Plant = ' '
      } else {
        return false
      }
      return item
    })
    return (

      <ExcelSheet data={TempData} name={VolumeMaster}>
        {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
      </ExcelSheet>);
  }

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
    const { handleSubmit } = this.props
    const {
      isEditFlag,
      showVolumeForm,
      data,
      isActualBulkUpload,
      isBudgetedBulkUpload,
      AddAccessibility,
      BulkUploadAccessibility,
      DownloadAccessibility
    } = this.state
    const options = {
      clearSearch: true,
      noDataText: (this.props.volumeDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
      //exportCSVText: 'Download Excel',
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
      costingHeadRenderer: this.costingHeadFormatter,
      customLoadingOverlay: LoaderCustom,
      customNoRowsOverlay: NoContentFound,
      indexFormatter: this.indexFormatter
    };

    if (showVolumeForm) {
      return (
        <AddVolume
          initialTableData={initialTableData}
          hideForm={this.hideForm}
          data={data}
        />
      )
    }

    return (
      <>
        {/* {this.props.loading && <Loader />} */}
        <div className={`ag-grid-react container-fluid blue-before-inside ${DownloadAccessibility ? "show-table-btn" : ""}`}>

          <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
            <Row>
              <Col md="12"><h1 className="mb-0">Volume Master</h1></Col>
            </Row>
            <Row className="pt-4 blue-before">
              {this.state.shown && (
                <Col md="11" className="filter-block">
                  <div className="d-inline-flex justify-content-start align-items-top w100">
                    <div className="flex-fills">
                      <h5>{`Filter By:`}</h5>
                    </div>
                    <div className="flex-fill">
                      <Field
                        name="costing_head"
                        type="text"
                        label=""
                        component={searchableSelect}
                        placeholder={"Costing Head"}
                        isClearable={false}
                        options={this.renderListing("costingHead")}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        validate={
                          this.state.costing_head == null ||
                            this.state.costing_head.length === 0
                            ? [required]
                            : []
                        }
                        required={true}
                        handleChangeDescription={this.handleHeadChange}
                        valueDescription={this.state.costing_head}
                      //disabled={isEditFlag ? true : false}
                      />
                    </div>
                    <div className="flex-fill">
                      <Field
                        name="year"
                        type="text"
                        label=""
                        component={searchableSelect}
                        placeholder={'-Year-'}
                        isClearable={false}
                        options={this.renderListing('year')}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        validate={
                          this.state.year == null || this.state.year.length === 0
                            ? [required]
                            : []
                        }
                        required={true}
                        handleChangeDescription={this.handleYear}
                        valueDescription={this.state.year}
                      //disabled={isEditFlag ? true : false}
                      />
                    </div>
                    <div className="flex-fill">
                      <Field
                        name="month"
                        type="text"
                        label=""
                        component={searchableSelect}
                        placeholder={'-Month-'}
                        isClearable={false}
                        options={this.renderListing('month')}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        validate={
                          this.state.month == null || this.state.month.length === 0
                            ? [required]
                            : []
                        }
                        required={true}
                        handleChangeDescription={this.handleMonth}
                        valueDescription={this.state.month}
                      //disabled={isEditFlag ? true : false}
                      />
                    </div>
                    <div className="flex-fill">
                      <Field
                        name="vendorName"
                        type="text"
                        label=""
                        component={searchableSelect}
                        placeholder={'-Vendors-'}
                        isClearable={false}
                        options={this.renderListing('VendorList')}
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
                      />
                    </div>
                    <div className="flex-fill">
                      <Field
                        name="plant"
                        type="text"
                        label=""
                        component={searchableSelect}
                        placeholder={'-Plant-'}
                        isClearable={false}
                        options={this.renderListing('plant')}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        validate={
                          this.state.plant == null || this.state.plant.length === 0
                            ? [required]
                            : []
                        }
                        required={true}
                        handleChangeDescription={this.handlePlant}
                        valueDescription={this.state.plant}
                        disabled={isEditFlag ? true : false}
                      />
                    </div>

                    <div className="flex-fill">
                      <button
                        type="button"
                        //disabled={pristine || submitting}
                        onClick={this.resetFilter}
                        className="reset mr10"
                      >
                        {'Reset'}
                      </button>
                      <button
                        type="button"
                        //disabled={pristine || submitting}
                        onClick={this.filterList}
                        className="user-btn mr5"
                      >
                        {'Apply'}
                      </button>
                    </div>
                  </div>
                </Col>)}

              <Col md="8" className="search-user-block mb-3">
                <div className="d-flex justify-content-end bd-highlight">
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
                                                    onClick={this.actualBulkToggle}
                                                    title="Actual Upload"
                                                >
                                                    <div className={"upload mr-0"}></div>
                                                    {/* Actual Upload */}
                                                </button>
                                            )}
                                            {BulkUploadAccessibility && (
                                                <button
                                                    type="button"
                                                    className={"user-btn mr5"}
                                                    onClick={this.budgetedBulkToggle}
                                                    title="Budgeted Bulk Upload"
                                                >
                                                    <div className={"upload mr-0"}></div>
                                                    {/* Budgeted Bulk Upload */}
                                                </button>
                                            )}
                                            {
                                                DownloadAccessibility &&
                                                <>

                                                    <ExcelFile filename={'VolumeMaster'} fileExtension={'.xls'} element={
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
          {/* <BootstrapTable
            data={this.props.volumeDataList}
            striped={false}
            hover={false}
            bordered={false}
            options={options}
            search
            exportCSV={DownloadAccessibility}
            csvFileName={`${VolumeMaster}.csv`}
            //ignoreSinglePage
            ref={'table'}
            trClassName={'userlisting-row'}
            tableHeaderClass="my-custom-header"
            pagination
          >
            <TableHeaderColumn dataField="IsVendor" columnTitle={true} dataAlign="left" dataSort={true} searchable={false} dataFormat={this.costingHeadFormatter} >{this.renderCostingHead()}</TableHeaderColumn>
            <TableHeaderColumn dataField="Year" width={100} columnTitle={true} dataAlign="left" searchable={false} dataSort={true} >{'Year'}</TableHeaderColumn>
            <TableHeaderColumn dataField="Month" width={100} columnTitle={true} dataAlign="left" searchable={false} dataSort={true} >{'Month'}</TableHeaderColumn>
            <TableHeaderColumn dataField="VendorName" columnTitle={true} searchable={false} dataAlign="left" dataSort={true} >{'Vendor Name'}</TableHeaderColumn>
            <TableHeaderColumn dataField="PartNumber" columnTitle={true} dataAlign="left" dataSort={true} >{'Part No.'}</TableHeaderColumn>
            <TableHeaderColumn dataField="PartName" columnTitle={true} dataAlign="left" dataSort={true} >{'Part Name'}</TableHeaderColumn>
            <TableHeaderColumn dataField="Plant" columnTitle={true} dataAlign="left" dataFormat={this.plantFormatter} dataSort={true}>{'Plant'}</TableHeaderColumn>
            <TableHeaderColumn dataField="BudgetedQuantity" width={150} searchable={false} columnTitle={true} dataAlign="left" dataSort={true} >{'Budgeted Quantity'}</TableHeaderColumn>
            <TableHeaderColumn dataField="ApprovedQuantity" width={150} columnTitle={true} searchable={false} dataAlign="left" dataSort={true} >{'Actual Quantity '}</TableHeaderColumn>
            <TableHeaderColumn dataAlign="right" width={100} className="action" dataField="VolumeId" searchable={false} export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
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
                // columnDefs={c}
                rowData={this.props.volumeDataList}
                pagination={true}
                editable={true}
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
                <AgGridColumn field="IsVendor" headerName="Costing Head"  cellRenderer={'costingHeadRenderer'}></AgGridColumn>
                <AgGridColumn field="Year" headerName="Year"></AgGridColumn>
                <AgGridColumn field="Month" headerName="Month"></AgGridColumn>
                <AgGridColumn field="VendorName" headerName="Vendor Name"></AgGridColumn>
                <AgGridColumn field="PartNumber" headerName="Part Number"></AgGridColumn>
                <AgGridColumn field="PartName" headerName="Part Name"></AgGridColumn>
                <AgGridColumn field="Plant" headerName="Plant"></AgGridColumn>
                <AgGridColumn field="BudgetedQuantity" headerName="Budgeted Quantity"></AgGridColumn>
                <AgGridColumn field="ApprovedQuantity" headerName="Approved Quantity"></AgGridColumn>
                <AgGridColumn field="VolumeId" headerName="Actions" cellRenderer={'totalValueRenderer'}></AgGridColumn>
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


          {isActualBulkUpload && (
            <BulkUpload
              isOpen={isActualBulkUpload}
              closeDrawer={this.closeActualBulkUploadDrawer}
              isEditFlag={false}
              fileName={'ActualVolume'}
              isZBCVBCTemplate={true}
              messageLabel={'Volume Actual'}
              anchor={'right'}
            />
          )}
          {isBudgetedBulkUpload && (
            <BulkUpload
              isOpen={isBudgetedBulkUpload}
              closeDrawer={this.closeBudgetedBulkUploadDrawer}
              isEditFlag={false}
              fileName={'BudgetedVolume'}
              isZBCVBCTemplate={true}
              messageLabel={'Volume Budgeted'}
              anchor={'right'}
            />
          )}
        </div>
      </>
    )
  }
}

/**
 * @method mapStateToProps
 * @description return state to component as props
 * @param {*} state
 */
function mapStateToProps({ comman, material, volume, auth }) {
  const { loading, plantSelectList, vendorWithVendorCodeSelectList } = comman
  const { vendorListByVendorType, } = material
  const { financialYearSelectList, volumeDataList } = volume
  const { leftMenuData } = auth
  return {
    loading,
    vendorListByVendorType,
    plantSelectList,
    financialYearSelectList,
    leftMenuData,
    volumeDataList,
    vendorWithVendorCodeSelectList
  }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
  getPlantSelectList,
  getVendorListByVendorType,
  getVolumeDataList,
  deleteVolume,
  getFinancialYearSelectList,
  getLeftMenu,
  getVendorWithVendorCodeSelectList
})(
  reduxForm({
    form: 'VolumeListing',
    onSubmitFail: (errors) => {
      focusOnError(errors)
    },
    enableReinitialize: true,
  })(VolumeListing),
)
