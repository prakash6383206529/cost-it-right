import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Table } from 'reactstrap';
import { required, checkForDecimalAndNull, positiveAndDecimalNumber, maxLength10, decimalLengthsix } from "../../../helper/validation";
import {
  searchableSelect, focusOnError, renderText,
} from "../../layout/FormInputs";
import { getUOMSelectList, fetchStateDataAPI, getAllCity } from '../../../actions/Common';
import { getFuelComboData, createFuelDetail, updateFuelDetail, getFuelDetailData, } from '../actions/Fuel';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA } from '../../../config/constants'
import { loggedInUserId } from "../../../helper/auth";
import Toaster from '../../common/Toaster';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddFuelNameDrawer from './AddFuelNameDrawer';
import NoContentFound from '../../common/NoContentFound';
import DayTime from '../../common/DayTimeWrapper'
import { AcceptableFuelUOM } from '../../../config/masterData'
import LoaderCustom from '../../common/LoaderCustom';
const selector = formValueSelector('AddFuel');

class AddFuel extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      isEditFlag: false,
      FuelDetailId: '',

      fuel: [],
      UOM: [],
      StateName: [],
      effectiveDate: '',

      rateGrid: [],

      files: [],
      errors: [],

      isOpenFuelDrawer: false,
      AddUpdate: true,
      DeleteChanged: true,
      HandleChanged: true,
      RateChange: []
    }
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    const { data } = this.props;
    this.getDetails(data);
    this.props.getUOMSelectList(() => { })
    this.props.getFuelComboData(() => { })
    this.props.getAllCity(countryId => {
      this.props.fetchStateDataAPI(countryId, () => { })
    })

  }

  /**
  * @method getDetails
  * @description Used to get Details
  */
  getDetails = (data) => {
    if (data && data.isEditFlag) {
      this.setState({
        isEditFlag: false,
        isLoader: true,
        FuelDetailId: data.Id,
      })
      this.props.getFuelDetailData(data.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ RateChange: Data })
          setTimeout(() => {
            const { fuelComboSelectList } = this.props;

            const fuelObj = fuelComboSelectList && fuelComboSelectList.Fuels.find(item => Number(item.Value) === Data.FuelId)
            //const StateObj = fuelComboSelectList && fuelComboSelectList.States.find(item => item.Value == Data.StateId)
            const UOMObj = fuelComboSelectList && fuelComboSelectList.UnitOfMeasurements.find(item => item.Value === Data.UnitOfMeasurementId)

            let rateGridArray = Data && Data.FuelDetatils.map((item) => {
              return {
                Id: item.Id,
                StateLabel: item.StateName,
                StateId: item.StateId,
                //effectiveDate: moment(item.EffectiveDate).format('DD/MM/YYYY'),
                effectiveDate: DayTime(item.EffectiveDate)._d,
                Rate: item.Rate,
              }
            })

            this.setState({
              isEditFlag: true,
              // isLoader: false,
              fuel: fuelObj && fuelObj !== undefined ? { label: fuelObj.Text, value: fuelObj.Value } : [],
              UOM: UOMObj && UOMObj !== undefined ? { label: UOMObj.Display, value: UOMObj.Value } : [],
              rateGrid: rateGridArray,
            }, () => this.setState({ isLoader: false }))
          }, 200)
        }
      })
    } else {
      this.setState({
        isEditFlag: false,
        isLoader: false,
        FuelDetailId: '',
      })
      this.props.getFuelDetailData('', res => { })
    }
  }

  /**
  * @method handleFuel
  * @description called
  */
  handleFuel = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ fuel: newValue, })
    } else {
      this.setState({ fuel: [] })
    }
  };

  /**
  * @method handleUOM
  * @description called
  */
  handleUOM = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ UOM: newValue, })
    } else {
      this.setState({ UOM: [] })
    }
  };

  /**
  * @method handleState
  * @description called
  */
  handleState = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ StateName: newValue, })
    } else {
      this.setState({ StateName: [] })
    }
    this.setState({ HandleChanged: false })
  };

  checkForSpecialCharacter = (value) => {
    if (value && !/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/.test(value)) {
      return false;
    }
    return true;
  }


  rateTableHandler = () => {
    const { StateName, rateGrid, effectiveDate, } = this.state;
    const { fieldsObj } = this.props;
    const Rate = fieldsObj && fieldsObj !== undefined ? fieldsObj : 0;
    const tempArray = [];
    if (decimalLengthsix(Rate)) {
      Toaster.warning("Decimal value should not be more than 6")
      return false
    }
    if (!this.checkForSpecialCharacter(Rate)) {
      Toaster.warning("Enter valid value")
      return false

    } else {
      if (StateName.length === 0 || effectiveDate === '' || Rate === 0) {
        Toaster.warning('Fields should not be empty');
        return false;
      }
    }



    tempArray.push(...rateGrid, {
      Id: '',
      StateLabel: StateName ? StateName.label : '',
      StateId: StateName ? StateName.value : '',
      //effectiveDate: moment(effectiveDate).format('DD/MM/YYYY'),
      effectiveDate: effectiveDate,
      Rate: Rate,
    })

    this.setState({
      rateGrid: tempArray,
      StateName: [],
      effectiveDate: new Date(),
    }, () => this.props.change('Rate', 0));
    this.setState({ AddUpdate: false })
  }

  /**
* @method updateRateGrid
* @description Used to handle updateProcessGrid
*/
  updateRateGrid = () => {
    const { StateName, rateGrid, effectiveDate, rateGridEditIndex } = this.state;
    const { fieldsObj } = this.props;
    const Rate = fieldsObj && fieldsObj !== undefined ? fieldsObj : 0;
    let tempArray = [];

    let tempData = rateGrid[rateGridEditIndex];
    tempData = {
      Id: tempData.Id,
      StateLabel: StateName.label,
      StateId: StateName.value,
      //effectiveDate: moment(effectiveDate).format('DD/MM/YYYY'),
      effectiveDate: effectiveDate,
      Rate: Rate,
    }

    tempArray = Object.assign([...rateGrid], { [rateGridEditIndex]: tempData })

    this.setState({
      rateGrid: tempArray,
      StateName: [],
      effectiveDate: new Date(),
      rateGridEditIndex: '',
      isEditIndex: false,
    }, () => this.props.change('Rate', 0));
    this.setState({ AddUpdate: false })
  };

  /**
  * @method resetRateGridData
  * @description Used to handle setTechnologyLevel
  */
  resetRateGridData = () => {
    this.setState({
      StateName: [],
      processGridEditIndex: '',
      isEditIndex: false,
    }, () => this.props.change('Rate', 0));
  };

  /**
  * @method editItemDetails
  * @description used to Reset form
  */
  editItemDetails = (index) => {
    const { rateGrid } = this.state;
    const tempData = rateGrid[index];

    this.setState({
      rateGridEditIndex: index,
      isEditIndex: true,
      //effectiveDate: new Date(moment(tempData.effectiveDate).format('DD/MM/YYYY')),
      effectiveDate: tempData.effectiveDate,
      StateName: { label: tempData.StateLabel, value: tempData.StateId },
    }, () => this.props.change('Rate', tempData.Rate))
  }

  /**
  * @method deleteItem
  * @description used to Reset form
  */
  deleteItem = (index) => {
    const { rateGrid } = this.state;

    let tempData = rateGrid.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });

    this.setState({
      rateGrid: tempData
    })
    this.setState({ DeleteChanged: false })
  }

  fuelToggler = () => {
    this.setState({ isOpenFuelDrawer: true })
  }

  closeFuelDrawer = (e = '') => {
    this.setState({ isOpenFuelDrawer: false }, () => {
      this.props.getFuelComboData(() => { })
    })
  }

  /**
 * @method handleChange
 * @description Handle Effective Date
 */
  handleEffectiveDateChange = (date) => {
    this.setState({
      effectiveDate: date,
    });
    this.setState({ HandleChanged: false })
  };

  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { fuelComboSelectList, UOMSelectList, stateList } = this.props;
    const temp = [];
    if (label === 'fuel') {
      fuelComboSelectList && fuelComboSelectList.Fuels.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
    if (label === 'state') {
      stateList && stateList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
    if (label === 'uom') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptableFuelUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        temp.push({ label: item.Display, value: item.Value })

      });
      return temp;
    }
  }

  formToggle = () => {
    this.setState({
      isShowForm: !this.state.isShowForm
    })
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      FuelDetailId: '',
      fuel: [],
      UOM: [],
      StateName: [],
      effectiveDate: '',
      rateGrid: [],
      isEditFlag: false,
    })
    this.props.getFuelDetailData('', res => { })
    this.props.hideForm()
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { isEditFlag, rateGrid, fuel, UOM, FuelDetailId, AddUpdate, RateChange, DeleteChanged, HandleChanged } = this.state;

    if (rateGrid.length === 0) {
      Toaster.warning('Rate should not be empty.');
      return false;
    }

    let fuelDetailArray = rateGrid && rateGrid.map((item) => {
      return {
        Id: item.Id,
        Rate: item.Rate,
        EffectiveDate: item.effectiveDate,
        StateId: item.StateId
      }
    })

    if (isEditFlag) {



      let addRow = 0
      let count = 0
      if (rateGrid.length > this.state.RateChange.FuelDetatils.length) {
        addRow = 1
      }
      if (addRow == 0) {
        for (let i = 0; i < rateGrid.length; i++) {
          let grid = this.state.RateChange.FuelDetatils[i]
          let sgrid = rateGrid[i]
          if (grid.Rate == sgrid.Rate && grid.StateName == sgrid.StateLabel) {
            count++
          }
        }
      }
      // let sebGrid = DataToChangeZ.SEBChargesDetails[0]
      if (HandleChanged && addRow == 0 && count == rateGrid.length && DeleteChanged) {
        this.cancel()
        return false
      }


      // 
      // 
      // 
      // 
      // if (AddUpdate && (HandleChanged) && DeleteChanged) {
      //   
      //   this.cancel()
      //   return false
      // }

      let requestData = {
        FuelDetailId: FuelDetailId,
        LoggedInUserId: loggedInUserId(),
        FuelId: fuel.value,
        UnitOfMeasurementId: UOM.value,
        FuelDetatils: fuelDetailArray,
      }

      this.props.reset()
      this.props.updateFuelDetail(requestData, (res) => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.UPDATE_FUEL_DETAIL_SUCESS);
          this.cancel();
        }
      })

    } else {

      const formData = {
        LoggedInUserId: loggedInUserId(),
        FuelId: fuel.value,
        UnitOfMeasurementId: UOM.value,
        FuelDetatils: fuelDetailArray,
      }

      this.props.reset()
      this.props.createFuelDetail(formData, (res) => {
        if (res && res.data && res.data.Result) {
          Toaster.success(MESSAGES.FUEL_ADD_SUCCESS);
          this.cancel();
        }
      });
    }
  }

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, initialConfiguration, } = this.props;
    const { isOpenFuelDrawer, isEditFlag } = this.state;

    return (
      <>
        {this.state.isLoader && <LoaderCustom />}
        <div className="container-fluid">
          <div className="">
            <div className="login-container signup-form">
              <div className="row">
                <div className="col-md-12">
                  <div className="shadow-lgg login-formg">
                    <div className="row">
                      <div className="col-md-6">
                        <h1>{isEditFlag ? `Update Fuel` : `Add Fuel`}</h1>
                      </div>
                    </div>
                    <form
                      noValidate
                      className="form"
                      onSubmit={handleSubmit(this.onSubmit.bind(this))}
                      onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                    >
                      <div className="add-min-height">
                        <Row>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Fuel:"}</h5>
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="Fuel"
                                  type="text"
                                  label="Fuel Name"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("fuel")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={
                                    this.state.fuel == null ||
                                      this.state.fuel.length === 0
                                      ? [required]
                                      : []
                                  }
                                  required={true}
                                  handleChangeDescription={this.handleFuel}
                                  valueDescription={this.state.fuel}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                              {!isEditFlag && (
                                <div
                                  onClick={this.fuelToggler}
                                  className={"plus-icon-square  right"}
                                ></div>
                              )}
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="UnitOfMeasurementId"
                                  type="text"
                                  label="UOM"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("uom")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={
                                    this.state.UOM == null ||
                                      this.state.UOM.length === 0
                                      ? [required]
                                      : []
                                  }
                                  required={true}
                                  handleChangeDescription={this.handleUOM}
                                  valueDescription={this.state.UOM}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                            </div>
                          </Col>
                        </Row>

                        <Row>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Rate:"}</h5>
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="state"
                                  type="text"
                                  label="State"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("state")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  //validate={(this.state.StateName == null || this.state.StateName.length == 0) ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleState}
                                  valueDescription={this.state.StateName}
                                  disabled={false}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Rate (INR)`}
                              name={"Rate"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                              component={renderText}
                              required={true}
                              className=""
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <div className="form-group">
                              <label>Effective Date<span className="asterisk-required">*</span>
                                {/* <span className="asterisk-required">*</span> */}
                              </label>
                              <div className="inputbox date-section">
                                <DatePicker
                                  required
                                  name="EffectiveDate"
                                  selected={this.state.effectiveDate}
                                  onChange={this.handleEffectiveDateChange}
                                  showMonthDropdown
                                  showYearDropdown
                                  dateFormat="dd/MM/yyyy"
                                  //maxDate={new Date()}
                                  dropdownMode="select"
                                  placeholderText="Select date"
                                  className="withBorder"
                                  autoComplete={"off"}
                                  disabledKeyboardNavigation
                                  onChangeRaw={(e) => e.preventDefault()}
                                  disabled={false}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <div>
                              {this.state.isEditIndex ? (
                                <>
                                  <button type="button" className={"btn btn-primary mt30 pull-left mr5"} onClick={this.updateRateGrid}>Update</button>
                                  {/* <button type="button" className={'btn btn-secondary mt30 pull-left'} onClick={this.resetRateGridData} >Cancel</button> */}
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className={"user-btn mt30 pull-left"}
                                  onClick={this.rateTableHandler}
                                >
                                  <div className={"plus"}></div>ADD
                                </button>
                              )}
                            </div>
                          </Col>
                          <Col md="12">
                            <Table className="table border" size="sm">
                              <thead>
                                <tr>
                                  <th>{`State`}</th>
                                  <th>{`Rate (INR)`}</th>
                                  <th>{`Effective From`}</th>
                                  <th>{`Action`}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.rateGrid &&
                                  this.state.rateGrid.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{item.StateLabel}</td>
                                        <td>{checkForDecimalAndNull(item.Rate, initialConfiguration.NoOfDecimalForPrice)}</td>
                                        {/* <td>{item.effectiveDate}</td> */}
                                        <td>
                                          {DayTime(item.effectiveDate).format(
                                            "DD/MM/YYYY"
                                          )}
                                        </td>
                                        <td>
                                          <button
                                            className="Edit mr-2"
                                            type={"button"}
                                            onClick={() =>
                                              this.editItemDetails(index)
                                            }
                                          />
                                          <button
                                            className="Delete"
                                            type={"button"}
                                            onClick={() =>
                                              this.deleteItem(index)
                                            }
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </Table>
                            {this.state.rateGrid.length === 0 && (
                              <NoContentFound title={EMPTY_DATA} />
                            )}
                          </Col>
                        </Row>
                      </div>

                      <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                          <button
                            type={"button"}
                            className="mr15 cancel-btn"
                            onClick={this.cancel}
                          >
                            <div className={"cancel-icon"}></div>
                            {"Cancel"}
                          </button>
                          <button
                            type="submit"
                            className="user-btn mr5 save-btn"
                          >
                            <div className={"save-icon"}></div>
                            {isEditFlag ? "Update" : "Save"}
                          </button>
                        </div>
                      </Row>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isOpenFuelDrawer && (
            <AddFuelNameDrawer
              isOpen={isOpenFuelDrawer}
              closeDrawer={this.closeFuelDrawer}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
            />
          )}
        </div>
      </>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
  const { fuel, auth, comman } = state;
  const fieldsObj = selector(state, 'Rate');
  let initialValues = {};

  const { UOMSelectList, stateList } = comman;
  const { fuelComboSelectList } = fuel;
  const { initialConfiguration } = auth;

  return { initialValues, fieldsObj, fuelComboSelectList, initialConfiguration, UOMSelectList, stateList }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getFuelComboData,
  createFuelDetail,
  updateFuelDetail,
  getFuelDetailData,
  getUOMSelectList,
  fetchStateDataAPI,
  getAllCity
})(reduxForm({
  form: 'AddFuel',
  enableReinitialize: true,
  onSubmitFail: errors => {
    focusOnError(errors);
  },
})(AddFuel));
