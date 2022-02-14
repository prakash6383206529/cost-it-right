import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, propTypes } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, positiveAndDecimalNumber, postiveNumber, maxLength10, checkPercentageValue, decimalLengthThree, } from "../../../helper/validation";
import { renderDatePicker, renderText, searchableSelect, } from "../../layout/FormInputs";
import { updateInterestRate, createInterestRate, getPaymentTermsAppliSelectList, getICCAppliSelectList, getInterestRateData, } from '../actions/InterestRateMaster';
import { getVendorWithVendorCodeSelectList, getPlantSelectListByType } from '../../../actions/Common';
import { getVendorListByVendorType, } from '../actions/Material';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, userDetails } from "../../../helper/auth";
import Switch from "react-switch";
import DayTime from '../../common/DayTimeWrapper'
import "react-datepicker/dist/react-datepicker.css";
import LoaderCustom from '../../common/LoaderCustom';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import { ZBC } from '../../../config/constants';
import Toaster from '../../common/Toaster'
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { debounce } from 'lodash';
import TooltipCustom from '../../common/Tooltip';
import AsyncSelect from 'react-select/async';

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
      isViewMode: this.props?.data?.isViewMode ? true : false,
      isEditFlag: false,
      isViewMode: this.props?.data?.isViewMode ? true : false,
      isVendorNameNotSelected: false,
      InterestRateId: '',
      effectiveDate: '',
      Data: [],
      DropdownChanged: true,
      plant: [],
      showPopup: false,
      updatedObj: {},
      setDisable: false,
      disablePopup: false,
      inputLoader: false,
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
    this.props.getPaymentTermsAppliSelectList(() => { })
    this.props.getPlantSelectListByType(ZBC, () => { })
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
    const { vendorWithVendorCodeSelectList, paymentTermsSelectList, iccApplicabilitySelectList, plantSelectList } = this.props;
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
        if (item.Value === '0' || item.Text === 'Net Cost') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
    if (label === 'PaymentTerms') {
      paymentTermsSelectList && paymentTermsSelectList.map(item => {
        if (item.Value === '0' || item.Text === 'Net Cost') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
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
  * @method onPressVendor
  * @description Used for Vendor checked
  */
  onPressVendor = () => {
    this.setState({ IsVendor: !this.state.IsVendor, });
    this.setState({ inputLoader: true })
    this.props.getVendorWithVendorCodeSelectList(() => { this.setState({ inputLoader: false }) })
  }

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false });
    } else {
      this.setState({ vendorName: [], })
    }
  };

  handlePlant = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ plant: newValue });
    } else {
      this.setState({ plant: [] })
    }
    this.setState({ DropdownChanged: false })
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
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    this.setState({ effectiveDate: DayTime(date).isValid() ? DayTime(date) : '', });
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
      this.props.getInterestRateData(data.ID, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          this.setState({ Data: Data })
          this.props.change("EffectiveDate", DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          setTimeout(() => {
            const { vendorWithVendorCodeSelectList, paymentTermsSelectList, iccApplicabilitySelectList, plantSelectList } = this.props;

            const vendorObj = vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.find(item => item.Value === Data.VendorIdRef)
            const iccObj = iccApplicabilitySelectList && iccApplicabilitySelectList.find(item => item.Value === Data.ICCApplicability)
            const paymentObj = paymentTermsSelectList && paymentTermsSelectList.find(item => item.Value === Data.PaymentTermApplicability)
            const plantObj = plantSelectList && plantSelectList.find((item) => item.Value === Data.PlantId)

            this.setState({
              isEditFlag: true,
              IsVendor: Data.IsVendor,
              vendorName: vendorObj && vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
              ICCApplicability: iccObj && iccObj !== undefined ? { label: iccObj.Text, value: iccObj.Value } : [],
              PaymentTermsApplicability: paymentObj && paymentObj !== undefined ? { label: paymentObj.Text, value: paymentObj.Value } : [],
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              plant: plantObj && plantObj !== undefined ? { label: plantObj.Text, value: plantObj.Value } : [],
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


  onPopupConfirm = debounce(() => {
    this.setState({ disablePopup: true })
    this.props.updateInterestRate(this.state.updatedObj, (res) => {
      this.setState({ setDisable: false })
      if (res?.data?.Result) {
        Toaster.success(MESSAGES.UPDATE_INTEREST_RATE_SUCESS);
        this.setState({ showPopup: false })
        this.cancel()
      }
    });
  }, 500)

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */

  onSubmit = debounce((values) => {

    const { Data, IsVendor, vendorName, ICCApplicability, PaymentTermsApplicability, InterestRateId, effectiveDate, DropdownChanged, plant } = this.state;
    const userDetail = userDetails()


    if (vendorName.length <= 0) {

      if (IsVendor) {
        this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
        return false
      }
    }
    this.setState({ isVendorNameNotSelected: false })

    /** Update existing detail of supplier master **/
    if (this.state.isEditFlag) {

      if (Data.ICCApplicability === ICCApplicability.label && Data.ICCPercent === values.ICCPercent &&
        Data.PaymentTermApplicability === PaymentTermsApplicability.label &&
        Data.PaymentTermPercent === values.PaymentTermPercent &&
        Data.RepaymentPeriod === values.RepaymentPeriod && DropdownChanged) {

        this.cancel()
        return false;
      }
      else {

      }
      this.setState({ setDisable: true, disablePopup: false })
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
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD'),
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        PlantId: plant.value
      }
      if (this.state.isEditFlag) {
        this.setState({ showPopup: true, updatedObj: updateData })

        const toastrConfirmOptions = {
          onOk: () => {

            this.props.updateInterestRate(updateData, (res) => {
              this.setState({ setDisable: false })
              if (res?.data?.Result) {
                Toaster.success(MESSAGES.UPDATE_INTEREST_RATE_SUCESS);
                this.setState({ showPopup: false })
                this.cancel()
              }
            });
          },
          onCancel: () => { },
          component: () => <ConfirmComponent />
        }



      }


    } else {/** Add new detail for creating operation master **/

      this.setState({ setDisable: true })
      let formData = {
        Isvendor: IsVendor,
        VendorIdRef: IsVendor ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        ICCApplicability: ICCApplicability.label,
        ICCPercent: values.ICCPercent,
        PaymentTermApplicability: PaymentTermsApplicability.label,
        PaymentTermPercent: values.PaymentTermPercent,
        RepaymentPeriod: values.RepaymentPeriod,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD'),
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        PlantId: plant.value
      }

      this.props.createInterestRate(formData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          // toastr.success(MESSAGES.INTEREST_RATE_ADDED_SUCCESS);
          Toaster.success(MESSAGES.INTEREST_RATE_ADDED_SUCCESS)
          this.cancel();

        }
      });
    }

  }, 500)

  closePopUp = () => {
    this.setState({ showPopup: false, setDisable: false })
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    let pos_drop_down = "auto"
    if (window.screen.width > 1366) {
      pos_drop_down = "auto";
    }
    else {
      pos_drop_down = "top";
    }
    const { handleSubmit, } = this.props;
    const { isEditFlag, isViewMode, setDisable, disablePopup } = this.state;

    const filterList = (inputValue) => {
      let tempArr = []

      tempArr = this.renderListing("VendorNameList").filter(i =>
        i.label !== null && i.label.toLowerCase().includes(inputValue.toLowerCase())
      );

      if (tempArr.length <= 100) {
        return tempArr
      } else {
        return tempArr.slice(0, 100)
      }
    };

    const promiseOptions = inputValue =>
      new Promise(resolve => {
        resolve(filterList(inputValue));


      });
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
                        <>
                        <Col md="3" className='mb-4'>

                          <label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
                          {this.state.inputLoader && <LoaderCustom customClass={`input-loader zero-based `} />}
                          <AsyncSelect
                            name="vendorName"
                            ref={this.myRef}
                            key={this.state.updateAsyncDropdown}
                            loadOptions={promiseOptions}
                            onChange={(e) => this.handleVendorName(e)}
                            noOptionsMessage={({ inputValue }) => !inputValue ? "Please enter vendor name/code" : "No results found"}
                            value={this.state.vendorName} isDisabled={isEditFlag ? true : false} />
                          {this.state.isVendorNameNotSelected && <div className='text-help'>This field is required.</div>}
                            
                          </Col>
                          <Col md="3" >
                            <Field
                              name="Plant"
                              type="text"
                              label={"Plant"}
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("plant")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={
                                this.state.plant == null ||
                                  this.state.plant.length === 0
                                  ? [required]
                                  : []
                              }
                              required={true}
                              handleChangeDescription={this.handlePlant}
                              valueDescription={this.state.plant}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col>
                        </>
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
                          disabled={isViewMode}
                        />
                      </Col>
                      {
                        this.state.ICCApplicability.label !== 'Fixed' &&

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
                            disabled={isViewMode}
                            className=" "
                            customClassName=" withBorder"
                          />
                        </Col>
                      }
                    </Row>

                    <Row>
                      <Col md="12">
                        <div className="left-border">{"Payment Terms:"}</div>
                      </Col>
                      <Col md="3">
                        <Field
                          name="PaymentTermsApplicability"
                          menuPlacement={pos_drop_down}
                          type="text"
                          label="Payment Terms Applicability"
                          component={searchableSelect}
                          placeholder={"Select"}
                          options={this.renderListing("PaymentTerms")}
                          validate={
                            this.state.PaymentTermsApplicability == null ||
                              this.state.PaymentTermsApplicability.length === 0
                              ? []
                              : []
                          }
                          required={false}
                          handleChangeDescription={
                            this.handlePaymentApplicability
                          }
                          valueDescription={
                            this.state.PaymentTermsApplicability
                          }
                          disabled={isViewMode}
                        />
                      </Col>
                      {
                        this.state.PaymentTermsApplicability.label !== 'Fixed' &&
                        <>

                          <Col md="3">
                            <Field
                              label={`Repayment Period (Days)`}
                              name={"RepaymentPeriod"}
                              type="text"
                              placeholder={"Enter"}
                              validate={[postiveNumber, maxLength10]}
                              component={renderText}
                              required={false}
                              disabled={isViewMode}
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
                              validate={[positiveAndDecimalNumber, decimalLengthThree]}
                              component={renderText}
                              max={100}
                              required={false}
                              disabled={isViewMode}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                        </>
                      }
                      <Col md="3">
                        <div className="form-group">

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

                  <Row className="sf-btn-footer no-gutters justify-content-between">
                    <div className="col-sm-12 text-right bluefooter-butn">
                      <button
                        type={"button"}
                        className=" mr15 cancel-btn"
                        onClick={this.cancel}
                        disabled={setDisable}
                      >
                        <div className={"cancel-icon"}></div>
                        {"Cancel"}
                      </button>
                      <button
                        type="submit"
                        disabled={isViewMode || setDisable}
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
          {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} disablePopup={disablePopup} />
          }
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
  const { interestRate, comman } = state;

  const filedObj = selector(state, 'ICCPercent', 'PaymentTermPercent');


  const { paymentTermsSelectList, iccApplicabilitySelectList, interestRateData } = interestRate;
  const { vendorWithVendorCodeSelectList, plantSelectList } = comman;

  let initialValues = {};
  if (interestRateData && interestRateData !== undefined) {
    initialValues = {
      ICCPercent: interestRateData.ICCPercent,
      RepaymentPeriod: interestRateData.RepaymentPeriod,
      PaymentTermPercent: interestRateData.PaymentTermPercent,

    }
  }

  return {
    paymentTermsSelectList, iccApplicabilitySelectList, vendorWithVendorCodeSelectList, interestRateData, initialValues, filedObj, plantSelectList
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
  getVendorWithVendorCodeSelectList,
  getPlantSelectListByType
})(reduxForm({
  form: 'AddInterestRate',
  enableReinitialize: true,
})(AddInterestRate));

