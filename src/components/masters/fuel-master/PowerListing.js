import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required } from "../../../helper/validation";
import {
  getPowerDetailDataList, getVendorPowerDetailDataList, getFuelComboData, getPlantListByState,
  getZBCPlantList, getStateSelectList, deletePowerDetail, deleteVendorPowerDetail,
} from '../actions/Fuel';
import { getPlantBySupplier } from '../../../actions/Common';
import { getVendorWithVendorCodeSelectList, } from '../actions/Supplier';
import { searchableSelect } from "../../layout/FormInputs";
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import Switch from "react-switch";
import moment from 'moment';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';

class PowerListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isEditFlag: false,
      IsVendor: false,
      tableData: [],

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
  buttonFormatter = (cell, row, enumObject, rowIndex) => {
    const { DeleteAccessibility, EditAccessibility } = this.props;
    return (
      <>
        {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cell)} />}
        {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
      </>
    )
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
  onSubmit = (values) => {

  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, AddAccessibility, initialConfiguration } = this.props;
    const { isEditFlag, } = this.state;
    const options = {
      clearSearch: true,
      noDataText: (this.props.powerDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
      paginationShowsTotal: this.renderPaginationShowsTotal,
      prePage: <span className="prev-page-pg"></span>, // Previous page button text
      nextPage: <span className="next-page-pg"></span>, // Next page button text
      firstPage: <span className="first-page-pg"></span>, // First page button text
      lastPage: <span className="last-page-pg"></span>,

    };

    return (

      <div>
        {/* {this.props.loading && <Loader />} */}
        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
          <Row className="pt-4">
            <Col md="4" className="switch mb15">
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
                        <img src={require("../../../assests/images/times.png")} alt="cancel-icon.jpg" /></button>
                    ) : (
                        <button type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
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
                  </>
                </div>
              </div>
            </Col>
          </Row>
        </form>
        <Row>
          <Col>

            {/* ZBC POWER LISTING */}
            {!this.state.IsVendor &&
              <BootstrapTable
                data={this.props.powerDataList}
                striped={false}
                hover={false}
                bordered={false}
                options={options}
                search
                // exportCSV
                //ignoreSinglePage
                ref={'table'}
                pagination>
                {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                <TableHeaderColumn dataField="StateName" columnTitle={true} dataAlign="left" dataSort={true} >{'State'}</TableHeaderColumn>
                <TableHeaderColumn dataField="PlantName" columnTitle={true} dataAlign="left" dataSort={true} >{'Plant'}</TableHeaderColumn>
                <TableHeaderColumn searchable={false} dataField="NetPowerCostPerUnit" columnTitle={true} dataAlign="left" dataSort={true} >{'Net Cost Per Unit'}</TableHeaderColumn>
                <TableHeaderColumn dataAlign="right" searchable={false} width={100} dataField="PowerId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
              </BootstrapTable>}

            {/* VENDOR POWER LISTING */}
            {this.state.IsVendor &&
              <BootstrapTable
                data={this.props.powerDataList}
                striped={false}
                hover={false}
                bordered={false}
                options={options}
                search
                // exportCSV
                //ignoreSinglePage
                ref={'table'}
                pagination>
                {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                <TableHeaderColumn dataField="VendorName" columnTitle={true} dataAlign="left" dataSort={true} >{'Vendor Name'}</TableHeaderColumn>
                {initialConfiguration && initialConfiguration.IsVendorPlantConfigurable && <TableHeaderColumn dataField="VendorPlantName" columnTitle={true} dataAlign="left" dataSort={true} >{'Vendor Plant'}</TableHeaderColumn>}
                <TableHeaderColumn searchable={false} dataField="NetPowerCostPerUnit" columnTitle={true} dataAlign="center" dataSort={true} >{'Net Cost Per Unit'}</TableHeaderColumn>
                <TableHeaderColumn searchable={false} width={100} dataField="PowerDetailId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
              </BootstrapTable>}

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
  const { plantSelectList, stateSelectList, powerDataList } = fuel;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { filterPlantList, } = comman;
  const { initialConfiguration } = auth;
  return { vendorWithVendorCodeSelectList, filterPlantList, plantSelectList, stateSelectList, powerDataList, initialConfiguration }
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