import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import { checkForDecimalAndNull, required } from "../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { getLabourDataList, deleteLabour, getLabourTypeByPlantSelectList } from '../actions/Labour';
import { getPlantListByState, getZBCPlantList, getStateSelectList, } from '../actions/Fuel';
import { getMachineTypeSelectList, } from '../actions/MachineMaster';
import Switch from "react-switch";
import AddLabour from './AddLabour';
import BulkUpload from '../../massUpload/BulkUpload';
import { LABOUR } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import moment from 'moment';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';

class LabourListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tableData: [],

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
    }
  }

  componentDidMount() {
    let ModuleId = reactLocalStorage.get('ModuleId')
    this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
      const { leftMenuData } = this.props
      if (leftMenuData !== undefined) {
        let Data = leftMenuData
        const accessData = Data && Data.find((el) => el.PageName === LABOUR)
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
          })
        }
      }
    })

    this.props.getZBCPlantList(() => { })
    this.props.getStateSelectList(() => { })
    this.props.getMachineTypeSelectList(() => { })
    // this.getTableListData()
    this.filterList()
  }

  /**
   * @method getTableListData
   * @description Get Data List
   */
  getTableListData = (
    employment_terms = '',
    state = '',
    plant = '',
    labour_type = '',
    machine_type = '',
  ) => {
    let filterData = {
      employment_terms: employment_terms,
      state: state,
      plant: plant,
      labour_type: labour_type,
      machine_type: machine_type,
    }
    this.props.getLabourDataList(filterData, (res) => {
      if (res.status === 204 && res.data === '') {
        this.setState({ tableData: [] })
      } else if (res && res.data && res.data.DataList) {
        let Data = res.data.DataList
        this.setState({
          tableData: Data,
        })
      } else {
      }
    })
  }

  /**
   * @method renderListing
   * @description Used show listing of unit of measurement
   */
  renderListing = (label) => {
    const {
      plantSelectList,
      stateSelectList,
      machineTypeSelectList,
      labourTypeByPlantSelectList,
    } = this.props
    const temp = []

    if (label === 'EmploymentTerms') {
      let tempObj = [
        { label: 'Employed', value: 'Employed' },
        { label: 'Contractual', value: 'Contractual' },
      ]
      return tempObj
    }

    if (label === 'state') {
      stateSelectList &&
        stateSelectList.map((item) => {
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

    if (label === 'MachineTypeList') {
      machineTypeSelectList &&
        machineTypeSelectList.map((item) => {
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }

    if (label === 'labourList') {
      labourTypeByPlantSelectList &&
        labourTypeByPlantSelectList.map((item) => {
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
    return toastr.confirm(MESSAGES.LABOUR_DELETE_ALERT, toastrConfirmOptions);
  }

  /**
   * @method confirmDeleteItem
   * @description confirm delete item
   */
  confirmDeleteItem = (ID) => {
    this.props.deleteLabour(ID, (res) => {
      if (res.data.Result === true) {
        toastr.success(MESSAGES.DELETE_LABOUR_SUCCESS)
        //this.getTableListData(null, null, null, null)
        this.filterList()
      }
    })
  }

  /**
   * @method buttonFormatter
   * @description Renders buttons
   */
  buttonFormatter = (cell, row, enumObject, rowIndex) => {
    const { EditAccessibility, DeleteAccessibility } = this.state
    return (
      <>
        {EditAccessibility && (
          <button
            className="Edit mr-2"
            type={'button'}
            onClick={() => this.editItemDetails(cell)}
          />
        )}
        {DeleteAccessibility && (
          <button
            className="Delete"
            type={'button'}
            onClick={() => this.deleteItem(row.LabourDetailsId)}
          />
        )}
      </>
    )
  }

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
   * @method handleHeadChange
   * @description called
   */
  handleHeadChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ EmploymentTerms: newValue })
    } else {
      this.setState({ EmploymentTerms: '' })
    }
  }

  /**
   * @method handleState
   * @description  STATE FILTER
   */
  handleState = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ StateName: newValue }, () => {
        const { StateName } = this.state
        this.props.getPlantListByState(StateName.value, () => { })
      })
    } else {
      this.setState({ StateName: [] })
      this.props.getZBCPlantList(() => { })
    }
  }

  /**
   * @method handlePlant
   * @description  PLANT FILTER
   */
  handlePlant = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ plant: newValue }, () => {
        const { plant } = this.state
        this.props.getLabourTypeByPlantSelectList(plant.value, () => { })
      })
    } else {
      this.setState({ plant: [] })
    }
  }

  /**
   * @method labourHandler
   * @description called
   */
  labourHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ labourType: newValue })
    } else {
      this.setState({ labourType: [] })
    }
  }

  /**
   * @method handleMachineType
   * @description called
   */
  handleMachineType = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ machineType: newValue })
    } else {
      this.setState({ machineType: [] })
    }
  }

  /**
   * @method statusButtonFormatter
   * @description Renders buttons
   */
  statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
    return (
      <>
        <label htmlFor="normal-switch">
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
  costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
    return cell ? 'Contractual' : 'Employed'
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
  effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
    return cell != null ? moment(cell).format('DD/MM/YYYY') : ''
  }

  renderEffectiveDate = () => {
    return <> Effective Date </>
  }

  renderEmploymentTerm = () => {
    return <> Employment <br />Terms </>
  }
  renderVendorName = () => {
    return <> Vendor <br />Name</>
  }

  renderMachineType = () => {
    return <> Machine <br />Type</>
  }
  renderRatePerPerson = () => {
    return <>Rate Per <br />Person/Annum</>
  }

  renderLabourType = () => {
    return <>Labour <br />Type</>
  }

  onExportToCSV = (row) => {
    // ...
    return this.state.userData // must return the data which you want to be exported
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
      EmploymentTerms,
      StateName,
      plant,
      labourType,
      machineType,
    } = this.state
    const ETerms = EmploymentTerms ? EmploymentTerms.value : ''
    const State = StateName ? StateName.value : ''
    const Plant = plant ? plant.value : ''
    const labour = labourType ? labourType.value : ''
    const machine = machineType ? machineType.value : ''
    this.getTableListData(ETerms, State, Plant, labour, machine)
  }

  /**
   * @method resetFilter
   * @description Reset user filter
   */
  resetFilter = () => {
    this.setState(
      {
        EmploymentTerms: [],
        StateName: [],
        plant: [],
        labourType: [],
        machineType: [],
      },
      () => {
        this.props.getZBCPlantList(() => { })
        this.props.getStateSelectList(() => { })
        this.props.getMachineTypeSelectList(() => { })
        this.props.getLabourTypeByPlantSelectList('', () => { })
        this.getTableListData()
      },
    )
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
    } = this.state

    if (toggleForm) {
      return <AddLabour hideForm={this.hideForm} data={data} />
    }
    const options = {
      clearSearch: true,
      noDataText: (this.props.labourDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
      //exportCSVText: 'Download Excel',
      //onExportToCSV: this.onExportToCSV,
      //paginationShowsTotal: true,
      paginationShowsTotal: this.renderPaginationShowsTotal,
      prePage: <span className="prev-page-pg"></span>, // Previous page button text
      nextPage: <span className="next-page-pg"></span>, // Next page button text
      firstPage: <span className="first-page-pg"></span>, // First page button text
      lastPage: <span className="last-page-pg"></span>,

    }

    return (
      <>
        {/* {this.props.loading && <Loader />} */}
        <div className="container-fluid">
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
              {this.state.shown && (
                <Col md="12" className="filter-block col-lg-10 labour-filter-block">
                  <div className="d-inline-flex justify-content-start align-items-top w100">
                    <div className="flex-fills">
                      <h5>{`Filter By:`}</h5>
                    </div>
                    <div className="flex-fill">
                      <Field
                        name="Employment Terms"
                        type="text"
                        label=""
                        component={searchableSelect}
                        placeholder={"Employment"}
                        isClearable={false}
                        options={this.renderListing("EmploymentTerms")}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        validate={
                          this.state.EmploymentTerms == null || this.state.EmploymentTerms.length === 0 ? [required] : []}
                        required={true}
                        handleChangeDescription={this.handleHeadChange}
                        valueDescription={this.state.EmploymentTerms}
                      />
                    </div>
                    <div className="flex-fill">
                      <Field
                        name="state"
                        type="text"
                        label={""}
                        component={searchableSelect}
                        placeholder={"State"}
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
                        placeholder={"Plant"}
                        isClearable={false}
                        options={this.renderListing("plant")}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        //validate={(this.state.plant == null || this.state.plant.length == 0) ? [required] : []}
                        //required={true}
                        handleChangeDescription={this.handlePlant}
                        valueDescription={this.state.plant}
                      />
                    </div>
                    <div className="flex-fill">
                      <Field
                        name="LabourTypeIds"
                        type="text"
                        label=""
                        component={searchableSelect}
                        placeholder={"Labour Type"}
                        isClearable={false}
                        options={this.renderListing("labourList")}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        //validate={(this.state.labourType == null || this.state.labourType.length == 0) ? [required] : []}
                        //required={true}
                        handleChangeDescription={this.labourHandler}
                        valueDescription={this.state.labourType}
                      />
                    </div>
                    <div className="flex-fill pr-0">
                      <Field
                        name="MachineType"
                        type="text"
                        label=""
                        component={searchableSelect}
                        placeholder={"Machine Type"}
                        isClearable={false}
                        options={this.renderListing("MachineTypeList")}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        //validate={(this.state.machineType == null || this.state.machineType.length == 0) ? [required] : []}
                        //required={true}
                        handleChangeDescription={this.handleMachineType}
                        valueDescription={this.state.machineType}
                        disabled={false}
                      />
                    </div>
                    <div className="flex-fill">
                      <button
                        type="button"
                        //disabled={pristine || submitting}
                        onClick={this.resetFilter}
                        className="reset mr5 px-2"
                      >
                        {"Reset"}
                      </button>
                      <button
                        type="button"
                        //disabled={pristine || submitting}
                        onClick={this.filterList}
                        className="user-btn mr0"
                      >
                        {"Apply"}
                      </button>
                    </div>
                  </div>
                </Col>
              )}
              <Col md="6" className="search-user-block mb-3">
                <div className="d-flex justify-content-end bd-highlight w100">
                  <div>
                    {this.state.shown ? (
                      <button type="button" className="user-btn mr5 filter-btn-top " onClick={() => this.setState({ shown: !this.state.shown })}>
                        <img src={require("../../../assests/images/times.png")} alt="cancel-icon.jpg" /></button>
                    ) : (
                        <button type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
                      )}
                    {BulkUploadAccessibility && (
                      <button
                        type="button"
                        className={"user-btn mr5"}
                        onClick={this.bulkToggle}
                      >
                        <div className={"upload"}></div>Bulk Upload
                      </button>
                    )}
                    {AddAccessibility && (
                      <button
                        type="button"
                        className={"user-btn"}
                        onClick={this.formToggle}
                      >
                        <div className={"plus"}></div>ADD
                      </button>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </form>
          <BootstrapTable
            data={this.props.labourDataList}
            striped={false}
            hover={false}
            bordered={false}
            options={options}
            search
            // exportCSV
            //ignoreSinglePage
            ref={'table'}
            trClassName={'userlisting-row'}
            tableHeaderClass="my-custom-header"
            pagination
          >
            {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
            <TableHeaderColumn width={110} dataField="IsContractBase" columnTitle={true} dataAlign="left" dataSort={true} dataFormat={this.costingHeadFormatter}  >  {this.renderEmploymentTerm()}  </TableHeaderColumn>
            <TableHeaderColumn
              dataField="Vendor"
              columnTitle={true}
              width={110}
              dataAlign="left"
              dataFormat={this.dashFormatter}
            >
              {this.renderVendorName()}
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="Plant"
              columnTitle={true}
              dataAlign="left"
              width={100}
            >
              {'Plant'}
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="State"
              columnTitle={true}
              dataAlign="left"
              width={150}
            >
              {'State'}
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="MachineType"
              columnTitle={true}
              dataAlign="left"
              width={100}
            >
              {this.renderMachineType()}
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="LabourType"
              columnTitle={true}
              dataAlign="left"
              width={100}
            >
              {this.renderLabourType()}
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="LabourRate"
              columnTitle={true}
              width={120}
              dataAlign="left"
            >
              {this.renderRatePerPerson()}
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="EffectiveDate"
              dataSort={true}
              columnTitle={true}
              dataAlign="left"
              dataSort={true}
              width={120}
              dataFormat={this.effectiveDateFormatter}
            >
              {this.renderEffectiveDate()}
            </TableHeaderColumn>
            <TableHeaderColumn
              dataAlign="right"
              className="action"
              searchable={false}
              dataField="LabourId"
              export={false}
              isKey={true}
              width={100}
              dataFormat={this.buttonFormatter}
            >
              Actions
          </TableHeaderColumn>
          </BootstrapTable>
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
  const { leftMenuData, initialConfiguration } = auth
  return {
    loading,
    leftMenuData,
    plantSelectList,
    stateSelectList,
    labourTypeByPlantSelectList,
    machineTypeSelectList,
    labourDataList,
    initialConfiguration
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
