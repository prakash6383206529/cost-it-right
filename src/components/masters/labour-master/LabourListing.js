import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import { required } from "../../../helper/validation";
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { getLabourDataList, deleteLabour, getLabourTypeByPlantSelectList } from '../actions/Labour';
import { getPlantListByState, getZBCPlantList, getStateSelectList, } from '../actions/Fuel';
import { getMachineTypeSelectList, } from '../actions/MachineMaster';
import Switch from "react-switch";
import AddLabour from './AddLabour';
import BulkUpload from '../../massUpload/BulkUpload';
import { ADDITIONAL_MASTERS, LABOUR, LabourMaster } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import moment from 'moment';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import { LABOUR_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class LabourListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tableData: [],
      shown: false,
      EmploymentTerms: [],
      vendorName: [],
      stateName: [],

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
      isLoader: true,
      showPopup:false,
      deletedId:''
    }
  }

  componentDidMount() {
    this.applyPermission(this.props.topAndLeftMenuData)
    setTimeout(() => {
      this.props.getZBCPlantList(() => { })
      this.props.getStateSelectList(() => { })
      this.props.getMachineTypeSelectList(() => { })
      // this.getTableListData()
      this.filterList()
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
      const accessData = Data && Data.Pages.find((el) => el.PageName === LABOUR)
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
    this.props.getLabourDataList(false, {}, (res) => { })
  }

  /**
   * @method getTableListData
   * @description Get Data List
   */
  getTableListData = (employment_terms = '', state = 0, plant = '', labour_type = 0, machine_type = 0) => {

    let filterData = {
      employment_terms: employment_terms,
      state: state,
      plant: plant,
      labour_type: labour_type,
      machine_type: machine_type,
    }

    this.props.getLabourDataList(true, filterData, (res) => {
      if (res.status === 204 && res.data === '') {
        this.setState({ tableData: [] })
      } else if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList
        this.setState({ tableData: Data, }, () => { this.setState({ isLoader: false }) })
      } else {
      }
    })
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
    this.setState({showPopup:true, deletedId:Id })
    const toastrConfirmOptions = {
      onOk: () => {
        this.confirmDeleteItem(Id)
      },
      onCancel: () => { },
      component: () => <ConfirmComponent />
    };
    // return Toaster.confirm(MESSAGES.LABOUR_DELETE_ALERT, toastrConfirmOptions);
  }

  /**
   * @method confirmDeleteItem
   * @description confirm delete item
   */
  confirmDeleteItem = (ID) => {
    this.props.deleteLabour(ID, (res) => {
      if (res.data.Result === true) {
        Toaster.success(MESSAGES.DELETE_LABOUR_SUCCESS)
        console.log("deleted");
        //this.getTableListData(null, null, null, null)
        this.filterList()
      }
      else {
        console.log("not deleted");
      }
    })
    this.setState({showPopup:false})
  }
 
  onPopupConfirm =() => {
    this.confirmDeleteItem(this.state.deletedId);
}
closePopUp= () =>{
    this.setState({showPopup:false})
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
    //             Toaster.success(MESSAGES.VENDOR_INACTIVE_SUCCESSFULLY)
    //         } else {
    //             Toaster.success(MESSAGES.VENDOR_ACTIVE_SUCCESSFULLY)
    //         }
    //         this.getTableListData(null, null, null, null)
    //     }
    // })
  }


  /**
   * @method statusButtonFormatter
   * @description Renders buttons
   */
  statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
    return (
      <>
        <label htmlFor="normal-switch" className="normal-switch">
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

  /**
  * @method costingHeadFormatter
  * @description Renders Costing head
  */
  costingHeadFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue ? 'Contractual' : 'Employed'
  }

  /**
   * @method dashFormatter
   * @description Renders Costing head
   */
  dashFormatter = (cell, row, enumObject, rowIndex) => {
    return cell !== 'NA' ? cell : '-'
  }

  /**
  * @method effectiveDateFormatter
  * @description Renders buttons
  */
  effectiveDateFormatter = (props) => {
    const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
  }



  renderPaginationShowsTotal(start, to, total) {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  /**
   * @method filterList
   * @description Filter user listing on the basis of role and department
   */
  filterList = () => {
    const {
      EmploymentTerms, StateName, plant, labourType, machineType, } = this.state
    const ETerms = EmploymentTerms ? EmploymentTerms.value : ''
    const State = StateName ? StateName.value : 0
    const Plant = plant ? plant.value : ''
    const labour = labourType ? labourType.value : 0
    const machine = machineType ? machineType.value : 0
    this.getTableListData(ETerms, State, Plant, labour, machine)
  }



  /**
   * @method formToggle
   * @description OPEN ADD FORM
   */
  formToggle = () => {
    this.setState({ toggleForm: true })
  }

  /**
   * @method hideForm
   * @description HIDE ADD FORM
   */
  hideForm = () => {
    this.setState(
      {
        toggleForm: false,
        data: { isEditFlag: false, ID: '' },
      },
      () => {
        // this.getTableListData()
        this.filterList()
      },
    )
  }

  /**
   * @method bulkToggle
   * @description OPEN BULK UPLOAD DRAWER
   */
  bulkToggle = () => {
    this.setState({ isBulkUpload: true })
  }

  /**
   * @method closeBulkUploadDrawer
   * @description CLOSED BULK UPLOAD DRAWER
   */
  closeBulkUploadDrawer = () => {
    this.setState({ isBulkUpload: false }, () => {
      this.getTableListData(null, null, null, null)
    })
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

    return this.returnExcelColumn(LABOUR_DOWNLOAD_EXCEl, this.props.labourDataList)
  };

  returnExcelColumn = (data = [], TempData) => {
    let temp = []
    TempData && TempData.map((item) => {
      if (item.Specification === null) {
        item.Specification = ' '
      } else if (item.IsContractBase === true) {
        item.IsContractBase = 'Contractual'
      } else if (item.IsContractBase === false) {
        item.IsContractBase = 'Employed'
      } else if (item.Vendor === '-') {
        item.Vendor = ' '
      } else if (item.Plant === '-') {
        item.Plant = ' '
      } else {
        return false
      }
      return item
    })
    return (

      <ExcelSheet data={TempData} name={LabourMaster}>
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
    const { handleSubmit } = this.props
    const {
      toggleForm,
      data,
      isBulkUpload,
      AddAccessibility,
      BulkUploadAccessibility,
      DownloadAccessibility,
    } = this.state

    if (toggleForm) {
      return <AddLabour hideForm={this.hideForm} data={data} />
    }
    const options = {
      clearSearch: true,
      noDataText: (this.props.labourDataList === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),
      // exportCSVBtn: this.createCustomExportCSVButton,
      // onExportToCSV: this.handleExportCSVButtonClick,
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
      costingHeadFormatter: this.costingHeadFormatter,
      effectiveDateRenderer: this.effectiveDateFormatter
    };

    return (
      <>
        {/* {this.state.isLoader && <LoaderCustom />} */}
        <div className={`ag-grid-react container-fluid ${DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`}>

          <form
            onSubmit={handleSubmit(this.onSubmit.bind(this))}
            noValidate
          >
            <Row>
              <Col md="12">
                <h1 className="mb-0">Labour Master</h1>
              </Col>
            </Row>
            <Row className="pt-4 filter-row-large blue-before">

              <Col md="6" className="search-user-block mb-3">
                <div className="d-flex justify-content-end bd-highlight w100">
                  <div>
                    {this.state.shown ? (
                      <button type="button" className="user-btn mr5 filter-btn-top " onClick={() => this.setState({ shown: !this.state.shown })}>
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

                        <ExcelFile filename={'Labour'} fileExtension={'.xls'} element={
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
                floatingFilter={true}
                domLayout='autoHeight'
                // columnDefs={c}
                rowData={this.props.labourDataList}
                pagination={true}
                paginationPageSize={10}
                onGridReady={this.onGridReady}
                gridOptions={gridOptions}
                loadingOverlayComponent={'customLoadingOverlay'}
                noRowsOverlayComponent={'customNoRowsOverlay'}
                noRowsOverlayComponentParams={{
                  title: EMPTY_DATA,
                  imagClass: 'imagClass'
                }}
                frameworkComponents={frameworkComponents}
              >
                <AgGridColumn field="IsContractBase" headerName="Employment Terms" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                <AgGridColumn field="Vendor" headerName="Vendor Name"></AgGridColumn>
                <AgGridColumn field="Plant" headerName="Plant"></AgGridColumn>
                <AgGridColumn field="State" headerName="State"></AgGridColumn>
                <AgGridColumn field="MachineType" headerName="Machine Type"></AgGridColumn>
                <AgGridColumn field="LabourType" headerName="Labour Type"></AgGridColumn>
                <AgGridColumn width={205} field="LabourRate" headerName="Rate Per Person/Annum"></AgGridColumn>
                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'}></AgGridColumn>
                <AgGridColumn field="LabourId" width={120} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
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

          {isBulkUpload && (
            <BulkUpload
              isOpen={isBulkUpload}
              closeDrawer={this.closeBulkUploadDrawer}
              isEditFlag={false}
              fileName={'Labour'}
              isZBCVBCTemplate={false}
              messageLabel={'Labour'}
              anchor={'right'}
            />
          )}
         {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.LABOUR_DELETE_ALERT}`}  />
         }
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
function mapStateToProps({ labour, auth, fuel, machine }) {
  const { loading, labourTypeByPlantSelectList, labourDataList } = labour
  const { plantSelectList, stateSelectList } = fuel
  const { machineTypeSelectList } = machine
  const { leftMenuData, initialConfiguration, topAndLeftMenuData } = auth
  return {
    loading,
    leftMenuData,
    plantSelectList,
    stateSelectList,
    labourTypeByPlantSelectList,
    machineTypeSelectList,
    labourDataList,
    initialConfiguration,
    topAndLeftMenuData,
  }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
  getLabourDataList,
  deleteLabour,
  getPlantListByState,
  getZBCPlantList,
  getStateSelectList,
  getMachineTypeSelectList,
  getLabourTypeByPlantSelectList,
  getLeftMenu,
})(
  reduxForm({
    form: 'LabourListing',
    onSubmitFail: (errors) => {
      focusOnError(errors)
    },
    enableReinitialize: true,
  })(LabourListing),
)
