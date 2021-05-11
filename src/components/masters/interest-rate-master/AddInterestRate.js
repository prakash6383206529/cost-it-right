import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, reset, propTypes } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, number, positiveAndDecimalNumber, postiveNumber, maxLength10, checkPercentageValue, decimalLengthThree, } from "../../../helper/validation";
import { renderDatePicker, renderText, searchableSelect, } from "../../layout/FormInputs";
import { updateInterestRate, createInterestRate, getPaymentTermsAppliSelectList, getICCAppliSelectList, getInterestRateData, } from '../actions/InterestRateMaster';
import { getVendorWithVendorCodeSelectList } from '../../../actions/Common';
import { getVendorListByVendorType, } from '../actions/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, userDetails } from "../../../helper/auth";
import Switch from "react-switch";
import $ from 'jquery';
import moment from 'moment';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoaderCustom from '../../common/LoaderCustom';
const selector = formValueSelector('AddInterestRate');

class AddInterestRate extends Component {
  static propTypes = { ...propTypes }
  constructor(props) {
    super(props);
    this.state = {
      IsVendor: false,

      vendorName: [],
      ICCApplicability: [],
      PaymentTermsApplicability: [],

      isEditFlag: false,
      InterestRateId: '',
      effectiveDate: '',
      Data: [],
      DropdownChanged: true
    }
  }
  /**
  * @method componentWillMount
  * @description called before render the component
  */
  UNSAFE_componentWillMount() {
    this.props.getVendorListByVendorType(true, () => { })

  }

  /**
   * @method componentDidMount
   * @description called after render the component
   */
  componentDidMount() {
    this.props.getICCAppliSelectList(() => { })
    this.props.getVendorWithVendorCodeSelectList()
    this.props.getPaymentTermsAppliSelectList(() => { })
    this.getDetail()
  }

  componentDidUpdate(prevProps) {
    if (this.props.filedObj !== prevProps.filedObj) {
      const { ICCPercent, PaymentTermPercent } = this.props.filedObj

      if (ICCPercent) {
        checkPercentageValue(ICCPercent, "ICC percentage should not be more than 100") ? this.props.change('ICCPercent', ICCPercent) : this.props.change('ICCPercent', 0)
      }
      if (PaymentTermPercent) {
        checkPercentageValue(PaymentTermPercent, "Payment percentage should not be more than 100") ? this.props.change('PaymentTermPercent', PaymentTermPercent) : this.props.change('PaymentTermPercent', 0)
      }

    }
  }

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { vendorWithVendorCodeSelectList, paymentTermsSelectList, iccApplicabilitySelectList } = this.props;
    const temp = [];
    if (label === 'VendorNameList') {
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
  * @method onPressVendor
  * @description Used for Vendor checked
  */
  onPressVendor = () => {
    this.setState({ IsVendor: !this.state.IsVendor, });
  }

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, });
    } else {
      this.setState({ vendorName: [], })
    }
  };

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
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    this.setState({ effectiveDate: moment(date)._isValid ? moment(date)._d : '', });
    this.setState({ DropdownChanged: false })
  };

  /**
  * @method getDetail
  * @description used to get user detail
  */
  getDetail = () => {
    const { data } = this.props;
    if (data && data.isEditFlag) {
      this.setState({
        isLoader: true,
        isEditFlag: true,
        InterestRateId: data.ID,
      })
      $('html, body').animate({ scrollTop: 0 }, 'slow');
      this.props.getInterestRateData(data.ID, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          this.setState({ Data: Data })
          this.props.change("EffectiveDate", moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')
          setTimeout(() => {
            const { vendorWithVendorCodeSelectList, paymentTermsSelectList, iccApplicabilitySelectList, } = this.props;

            const vendorObj = vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.find(item => item.Value === Data.VendorIdRef)
            const iccObj = iccApplicabilitySelectList && iccApplicabilitySelectList.find(item => item.Value === Data.ICCApplicability)
            const paymentObj = paymentTermsSelectList && paymentTermsSelectList.find(item => item.Value === Data.PaymentTermApplicability)

            this.setState({
              isEditFlag: true,
              // isLoader: false,
              IsVendor: Data.IsVendor,
              vendorName: vendorObj && vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
              ICCApplicability: iccObj && iccObj !== undefined ? { label: iccObj.Text, value: iccObj.Value } : [],
              PaymentTermsApplicability: paymentObj && paymentObj !== undefined ? { label: paymentObj.Text, value: paymentObj.Value } : [],
              effectiveDate: moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : ''
            }, () => this.setState({ isLoader: false }))
          }, 500)

        }
      })
    } else {
      this.setState({
        isLoader: false,
      })
      this.props.getInterestRateData('', () => { })
    }
  }


  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      vendorName: [],
      isEditFlag: false,
    })
    this.props.getInterestRateData('', () => { })
    this.props.hideForm()
  }

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */

  onSubmit = (values) => {

    const { Data, IsVendor, vendorName, ICCApplicability, PaymentTermsApplicability, InterestRateId, effectiveDate, DropdownChanged } = this.state;
    const userDetail = userDetails()

    /** Update existing detail of supplier master **/
    if (this.state.isEditFlag) {

      if (Data.ICCApplicability == ICCApplicability.label && Data.ICCPercent == values.ICCPercent &&
        Data.PaymentTermApplicability == PaymentTermsApplicability.label &&
        Data.PaymentTermPercent == values.PaymentTermPercent &&
        Data.RepaymentPeriod == values.RepaymentPeriod && DropdownChanged) {
        console.log('cancle')
        this.cancel()
        return false;
      }
      else {

      }

      let updateData = {
        VendorInterestRateId: InterestRateId,
        ModifiedBy: loggedInUserId(),
        VendorName: IsVendor ? vendorName.label : userDetail.ZBCSupplierInfo.VendorName,
        ICCApplicability: ICCApplicability.value,
        PaymentTermApplicability: PaymentTermsApplicability.value,
        Isvendor: IsVendor,
        VendorIdRef: IsVendor ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        ICCPercent: values.ICCPercent,
        PaymentTermPercent: values.PaymentTermPercent,
        RepaymentPeriod: values.RepaymentPeriod,
        EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
      }
      if (this.state.isEditFlag) {
        const toastrConfirmOptions = {
          onOk: () => {
            this.props.reset()
            this.props.updateInterestRate(updateData, (res) => {
              if (res.data.Result) {
                toastr.success(MESSAGES.UPDATE_INTEREST_RATE_SUCESS);
                this.cancel()
              }
            });
          },
          onCancel: () => { },
        }
        return toastr.confirm(`${'You have changed SOB percent So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
      }


    } else {/** Add new detail for creating operation master **/

      let formData = {
        Isvendor: IsVendor,
        VendorIdRef: IsVendor ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        ICCApplicability: ICCApplicability.label,
        ICCPercent: values.ICCPercent,
        PaymentTermApplicability: PaymentTermsApplicability.label,
        PaymentTermPercent: values.PaymentTermPercent,
        RepaymentPeriod: values.RepaymentPeriod,
        EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId()
      }
      this.props.reset()
      this.props.createInterestRate(formData, (res) => {

        if (res.data.Result) {
          toastr.success(MESSAGES.INTEREST_RATE_ADDED_SUCCESS);
          this.cancel();

        }
      });
    }

  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, } = this.props;
    const { isEditFlag, } = this.state;
    return (
      <div className="container-fluid">
        {this.state.isLoader && <LoaderCustom />}
        <div className="login-container signup-form">
          <div className="row">
            <div className="col-md-12">
              <div className="shadow-lgg login-formg">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-heading mb-0">
                      <h1>
                        {this.state.isEditFlag
                          ? "Update Interest Rate"
                          : "Add Interest Rate"}
                      </h1>
                    </div>
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
                      {this.state.IsVendor && (
                        <Col md="3">
                          <div className="d-flex justify-space-between align-items-center inputwith-icon">
                            <div className="fullinput-icon">
                              <Field
                                name="VendorName"
                                type="text"
                                label="Vendor Name"
                                component={searchableSelect}
                                placeholder={"Select"}
                                options={this.renderListing("VendorNameList")}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={
                                  this.state.vendorName == null ||
                                    this.state.vendorName.length === 0
                                    ? [required]
                                    : []
                                }
                                required={true}
                                handleChangeDescription={
                                  this.handleVendorName
                                }
                                valueDescription={this.state.vendorName}
                                disabled={isEditFlag ? true : false}
                              />
                            </div>
                          </div>
                        </Col>
                      )}
                    </Row>

                    <Row>
                      <Col md="12">
                        <div className="left-border">{"ICC:"}</div>
                      </Col>
                      <Col md="3">
                        <Field
                          name="ICCApplicability"
                          type="text"
                          label="ICC Applicability"
                          component={searchableSelect}
                          placeholder={"Select"}
                          options={this.renderListing("ICC")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={
                            this.state.ICCApplicability == null ||
                              this.state.ICCApplicability.length === 0
                              ? [required]
                              : []
                          }
                          required={true}
                          handleChangeDescription={
                            this.handleICCApplicability
                          }
                          valueDescription={this.state.ICCApplicability}
                          disabled={false}
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Annual ICC (%)`}
                          name={"ICCPercent"}
                          type="text"
                          placeholder={"Enter"}
                          validate={[required, positiveAndDecimalNumber, decimalLengthThree]}
                          max={100}
                          component={renderText}
                          required={true}
                          disabled={false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Col md="12">
                        <div className="left-border">{"Payment Terms:"}</div>
                      </Col>
                      <Col md="3">
                        <Field
                          name="PaymentTermsApplicability"
                          type="text"
                          label="Payment Terms Applicability"
                          component={searchableSelect}
                          placeholder={"Select"}
                          options={this.renderListing("PaymentTerms")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={
                            this.state.PaymentTermsApplicability == null ||
                              this.state.PaymentTermsApplicability.length === 0
                              ? [required]
                              : []
                          }
                          required={true}
                          handleChangeDescription={
                            this.handlePaymentApplicability
                          }
                          valueDescription={
                            this.state.PaymentTermsApplicability
                          }
                          disabled={false}
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Repayment Period (Days)`}
                          name={"RepaymentPeriod"}
                          type="text"
                          placeholder={"Enter"}
                          validate={[required, postiveNumber, maxLength10]}
                          component={renderText}
                          required={true}
                          disabled={false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Payment Term (%)`}
                          name={"PaymentTermPercent"}
                          type="text"
                          placeholder={"Enter"}
                          validate={[required, positiveAndDecimalNumber, decimalLengthThree]}
                          component={renderText}
                          max={100}
                          required={true}
                          disabled={false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      <Col md="3">
                        <div className="form-group">
                          {/* <label>
                            Effective Date */}
                          {/* <span className="asterisk-required">*</span> */}
                          {/* </label> */}
                          <div className="inputbox date-section">
                            {/* <DatePicker
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
                              // disabled={isEditFlag ? true : false}
                              component={renderDatePicker}
                              disabled={isEditFlag ? true : false
                              }
                              className="form-control"
                            //minDate={moment()}
                            />

                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <div className="col-sm-12 text-right bluefooter-butn">
                      <button
                        type={"button"}
                        className=" mr15 cancel-btn"
                        onClick={this.cancel}
                      >
                        <div className={"cross-icon"}>
                          <img
                            src={require("../../../assests/images/times.png")}
                            alt="cancel-icon.jpg"
                          />
                        </div>{" "}
                        {"Cancel"}
                      </button>
                      <button
                        type="submit"
                        className="user-btn mr5 save-btn"
                      >
                        <div className={"check-icon"}>
                          <img
                            src={require("../../../assests/images/check.png")}
                            alt="check-icon.jpg"
                          />{" "}
                        </div>
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
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
  const { interestRate, material, comman } = state;

  const filedObj = selector(state, 'ICCPercent', 'PaymentTermPercent');

  const { vendorListByVendorType } = material;
  const { paymentTermsSelectList, iccApplicabilitySelectList, interestRateData } = interestRate;
  const { vendorWithVendorCodeSelectList } = comman;

  let initialValues = {};
  if (interestRateData && interestRateData !== undefined) {
    initialValues = {
      ICCPercent: interestRateData.ICCPercent,
      RepaymentPeriod: interestRateData.RepaymentPeriod,
      PaymentTermPercent: interestRateData.PaymentTermPercent,

    }
  }

  return {
    paymentTermsSelectList, iccApplicabilitySelectList, vendorWithVendorCodeSelectList, interestRateData, initialValues, filedObj
  }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  updateInterestRate,
  createInterestRate,
  getInterestRateData,
  getPaymentTermsAppliSelectList,
  getICCAppliSelectList,
  getVendorListByVendorType,
  getVendorWithVendorCodeSelectList
})(reduxForm({
  form: 'AddInterestRate',
  enableReinitialize: true,
})(AddInterestRate));

