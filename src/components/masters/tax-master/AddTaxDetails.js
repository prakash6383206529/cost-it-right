import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, checkWhiteSpaces, maxLength80, positiveAndDecimalNumber, acceptAllExceptSingleSpecialCharacter, checkPercentageValue, decimalLengthThree } from "../../../helper/validation";
import { renderDatePicker, renderText, searchableSelect, validateForm } from "../../layout/FormInputs";
import { createTaxDetails, getTaxDetailsData, updateTaxDetails, } from '../actions/TaxMaster';
import { fetchCountryDataAPI, } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import DayTime from '../../common/DayTimeWrapper'
import LoaderCustom from '../../common/LoaderCustom';
const selector = formValueSelector('AddTaxDetails')

class AddTaxDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      country: [],
      effectiveDate: '',
      DataToCheck: [],
      DropdownChanged: true,
      isLoader: false
    }
  }

  UNSAFE_componentWillMount() {
    this.props.fetchCountryDataAPI(() => { })
  }

  /**
  * @method componentDidMount
  * @description called after render the component
  */
  componentDidMount() {
    const { ID, isEditFlag } = this.props;

    if (isEditFlag) {
      this.props.getTaxDetailsData(ID, res => {
        this.setState({ isLoader: true })
        this.props.fetchCountryDataAPI(() => {
          const { countryList } = this.props;
          if (res && res.data && res.data.Data) {
            let Data = res.data.Data;
            this.setState({ DataToCheck: Data })

            this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
            let countryObj = countryList && countryList.find(item => Number(item.Value) === Data.CountryId)
            setTimeout(() => {
              this.setState({
                country: countryObj && countryObj !== undefined ? { label: countryObj.Text, value: countryObj.Value } : [],
                effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : ''
              }, () => this.setState({ isLoader: false })
              )
            }, 500)
          }
        })
      })
    } else {
      this.setState({ isLoader: false })
      this.props.getTaxDetailsData('', res => { })
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.fieldsObj !== prevProps.fieldsObj) {
      // const { Rate } = this.props.fieldsObj
      if (this.props.fieldsObj) {
        checkPercentageValue(this.props.fieldsObj, "Rate percentage should not be more than 100") ? this.props.change('Rate', this.props.fieldsObj) : this.props.change('Rate', 0)
      }
    }
  }

  /**
  * @method toggleModel
  * @description Used to cancel modal
  */
  toggleModel = () => {
    this.props.onCancel();
  }

  toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.props.closeDrawer('')
  };

  /**
 * @method renderListing
 * @description Used show listing
 */
  renderListing = (label) => {
    const { countryList } = this.props;
    const temp = [];

    if (label === 'country') {
      countryList && countryList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
  };



  /**
  * @method countryHandler
  * @description Used to handle country
  */
  countryHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ country: newValue });
    } else {
      this.setState({ country: [], })
    }
    this.setState({ DropdownChanged: false })
  };

  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    this.setState({ effectiveDate: date, });
    this.setState({ DropdownChanged: false })
  };

  /**
 * @method cancel
 * @description used to Reset form
 */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      country: [],
    })
    this.toggleDrawer('')
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { country, effectiveDate, DataToCheck, DropdownChanged } = this.state;

    /** Update detail of TAX  */
    if (this.props.isEditFlag) {

      if (DataToCheck.TaxName === values.TaxName && DataToCheck.Rate === values.Rate && DropdownChanged) {

        this.toggleDrawer('')
        return false
      }

      const { ID } = this.props;

      let formData = {
        TaxDetailId: ID,
        Country: country.label,
        IsActive: true,
        TaxName: values.TaxName,
        CountryId: country.value,
        Rate: values.Rate,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        LoggedInUserId: loggedInUserId(),
      }

      this.props.reset()
      this.props.updateTaxDetails(formData, (res) => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.TAX_UPDATE_SUCCESS);
          this.cancel();
        }
      });

    } else {
      /** Add detail for TAX  */
      let reqData = {
        TaxName: values.TaxName,
        CountryId: country.value,
        Rate: values.Rate,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        LoggedInUserId: loggedInUserId(),
      }
      this.props.reset()
      this.props.createTaxDetails(reqData, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.TAX_ADD_SUCCESS);
          this.cancel();
        }
      });
    }
  }
  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      // cb();
    }
  };
  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, isEditFlag, } = this.props;
    return (
      <Drawer
        anchor={this.props.anchor}
        open={this.props.isOpen}
      // onClose={(e) => this.toggleDrawer(e)}
      >
        {this.state.isLoader && <LoaderCustom />}
        <Container>
          <div className={"drawer-wrapper"}>
            <form
              noValidate
              className="form"
              onSubmit={handleSubmit(this.onSubmit.bind(this))}
              onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
            >
              <Row className="drawer-heading">
                <Col>
                  <div className={"header-wrapper left"}>
                    <h3>
                      {isEditFlag
                        ? "UPDATE TAX DETAILS"
                        : "ADD TAX DETAILS"}
                    </h3>
                  </div>
                  <div
                    onClick={(e) => this.toggleDrawer(e)}
                    className={"close-button right"}
                  ></div>
                </Col>
              </Row>

              <Row className="pl-3">
                <div className="input-group form-group col-md-12 input-withouticon">
                  <Field
                    label="Tax Name"
                    name={"TaxName"}
                    type="text"
                    placeholder={"Enter"}
                    validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
                    component={renderText}
                    required={true}
                    customClassName={"withBorder"}
                  />
                </div>
                <div className="col-md-12 form-group">
                  <Field
                    name="CountryId"
                    type="text"
                    label="Country"
                    component={searchableSelect}
                    placeholder={"Select"}
                    options={this.renderListing("country")}
                    //onKeyUp={(e) => this.changeItemDesc(e)}
                    validate={
                      this.state.country == null ||
                        this.state.country.length === 0
                        ? [required]
                        : []
                    }
                    required={true}
                    handleChangeDescription={this.countryHandler}
                    valueDescription={this.state.country}
                  />
                </div>
                <div className="input-group form-group col-md-12 input-withouticon">
                  <Field
                    label="Rate (%)"
                    name={"Rate"}
                    type="text"
                    placeholder={"Enter"}
                    validate={[required, positiveAndDecimalNumber, decimalLengthThree]}
                    max='100'
                    component={renderText}
                    required={true}
                    customClassName={"withBorder"}
                  />
                </div>
                <div className="input-group form-group col-md-12 input-withouticon">
                  <div className="form-group">
                    {/* <label>
                      Effective Date
                          <span className="asterisk-required">*</span>
                    </label> */}
                    <div className="inputbox date-section">
                      {/* <DatePicker
                        name="EffectiveDate"
                        selected={this.state.effectiveDate}
                        onChange={this.handleEffectiveDateChange}
                        showMonthDropdown
                        showYearDropdown
                        dateFormat="dd/MM/yyyy"
                        //maxDate={new Date()}                      
                        placeholderText="Select date"
                        className="withBorder"
                        autoComplete={"off"}
                        disabledKeyboardNavigation
                        onChangeRaw={(e) => e.preventDefault()}
                        disabled={isEditFlag ? true : false}
                      /> */}
                      <Field
                        label="Effective Date"
                        name="EffectiveDate"
                        placeholder="Select date"
                        selected={this.state.effectiveDate}
                        onChange={this.handleEffectiveDateChange}
                        type="text"
                        validate={[required]}
                        autoComplete={'off'}
                        required={true}
                        changeHandler={(e) => {
                          // e.preventDefault()
                        }}
                        disabled={isEditFlag ? true : false}
                        component={renderDatePicker}
                        className="form-control"
                      //minDate={moment()}
                      />

                    </div>
                  </div>
                </div>
              </Row>

              <Row className="sf-btn-footer no-gutters justify-content-between">
                <div className="col-sm-12 text-right px-3">
                  <button
                    type={"button"}
                    className="mr15 cancel-btn"
                    onClick={this.cancel}
                  >
                    <div className={'cancel-icon'}></div>
                    {"Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="user-btn save-btn"
                  >
                    <div className={"save-icon"}></div>
                    {isEditFlag ? "Update" : "Save"}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
    );
  }
}



/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
  const { tax, comman } = state
  const { taxDetailsData } = tax;
  const { countryList, } = comman;
  const fieldsObj = selector(state, 'Rate')
  let initialValues = {};
  if (taxDetailsData && taxDetailsData !== undefined) {
    initialValues = {
      TaxName: taxDetailsData.TaxName,
      Rate: taxDetailsData.Rate,
    }
  }

  return { taxDetailsData, countryList, initialValues, fieldsObj };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  createTaxDetails,
  getTaxDetailsData,
  updateTaxDetails,
  fetchCountryDataAPI,
})(reduxForm({
  form: 'AddTaxDetails',
  validate: validateForm,
  enableReinitialize: true,
  touchOnChange: true
})(AddTaxDetails));
