import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, propTypes } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, positiveAndDecimalNumber, postiveNumber, maxLength10, checkPercentageValue, decimalLengthThree, } from "../../../helper/validation";
import { renderDatePicker, renderMultiSelectField, renderNumberInputField, searchableSelect, } from "../../layout/FormInputs";
import { updateInterestRate, createInterestRate, getPaymentTermsAppliSelectList, getICCAppliSelectList, getInterestRateData, } from '../actions/InterestRateMaster';
import { getVendorWithVendorCodeSelectList, getPlantSelectListByType } from '../../../actions/Common';
import { getVendorListByVendorType, } from '../actions/Material';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import Switch from "react-switch";
import DayTime from '../../common/DayTimeWrapper'
import "react-datepicker/dist/react-datepicker.css";
import LoaderCustom from '../../common/LoaderCustom';
import Toaster from '../../common/Toaster'
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import { SPACEBAR, ZBC } from '../../../config/constants';
import { onFocus, showDataOnHover } from '../../../helper';

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
      isViewMode: this.props?.data?.isViewMode ? true : false,
      isVendorNameNotSelected: false,
      InterestRateId: '',
      effectiveDate: '',
      Data: [],
      DropdownChanged: true,
      showPopup: false,
      updatedObj: {},
      setDisable: false,
      disablePopup: false,
      inputLoader: false,
      isDataChanged: this.props.data.isEditFlag,
      minEffectiveDate: '',
      showErrorOnFocus: false,
      showErrorOnFocusDate: false

    }
  }
  /**
  * @method componentWillMount
  * @description called before render the component
  */
  UNSAFE_componentWillMount() {
    if (!(this.props.data.isEditFlag || this.state.isViewMode))
      this.props.getVendorListByVendorType(true, () => { })
  }

  /**
   * @method componentDidMount
   * @description called after render the component
   */
  componentDidMount() {
    this.props.getPlantSelectListByType(ZBC, () => { })
    this.getDetail()
    if (!this.state.isViewMode) {
      this.props.getICCAppliSelectList(() => { })
      this.props.getPaymentTermsAppliSelectList(() => { })
    }

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
    const { vendorWithVendorCodeSelectList, plantSelectList, paymentTermsSelectList, iccApplicabilitySelectList } = this.props;
    const temp = [];
    if (label === 'VendorNameList') {
      vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null
      });
      return temp;
    }
    if (label === 'ICC') {
      iccApplicabilitySelectList && iccApplicabilitySelectList.map(item => {
        if (item.Value === '0' || item.Text === 'Net Cost') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null
      });
      return temp;
    }
    if (label === 'PaymentTerms') {
      paymentTermsSelectList && paymentTermsSelectList.map(item => {
        if (item.Value === '0' || item.Text === 'Net Cost') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null
      });
      return temp;
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item.PlantId === '0') return false
        temp.push({ Text: item.PlantNameCode, Value: item.PlantId })
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
    if (this.state.isEditFlag) {
      this.setState({ isDataChanged: true })
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
    if (this.state.isEditFlag) {
      this.setState({ isDataChanged: true })
    }
  };

  /**
  * @method handleChangeAnnualIccPercentage
  * @description called
  */
  handleChangeAnnualIccPercentage = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.Data.ICCPercent) &&
        String(this.state.ICCApplicability.label) === String(this.state.Data.ICCApplicability)) {
        this.setState({ isDataChanged: true })
      } else {
        this.setState({ isDataChanged: false })
      }
    }
  };

  /**
  * @method handleChangeRepaymentPeriod
  * @description called
  */
  handleChangeRepaymentPeriod = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.Data.RepaymentPeriod) && String(this.state.PaymentTermsApplicability.label) === String(this.state.Data.PaymentTermApplicability)) {
        this.setState({ isDataChanged: true })
      } else {
        this.setState({ isDataChanged: false })
      }
    }
  };

  /**
  * @method handleChangePaymentTermPercentage
  * @description called
  */
  handleChangePaymentTermPercentage = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.Data.PaymentTermPercent) && String(this.state.PaymentTermsApplicability.label) === String(this.state.Data.PaymentTermApplicability)) {
        this.setState({ isDataChanged: true })
      } else {
        this.setState({ isDataChanged: false })
      }
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
   * @method handlePlant
   * @description Used handle plants
   */
  handlePlant = (e) => {
    this.setState({ selectedPlants: e })
    this.setState({ DropdownChanged: false })
  }
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
          this.setState({ minEffectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '' })
          setTimeout(() => {
            const { paymentTermsSelectList, iccApplicabilitySelectList, } = this.props;
            const iccObj = iccApplicabilitySelectList && iccApplicabilitySelectList.find(item => item.Value === Data.ICCApplicability)
            const paymentObj = paymentTermsSelectList && paymentTermsSelectList.find(item => item.Value === Data.PaymentTermApplicability)

            this.setState({
              isEditFlag: true,
              IsVendor: Data.IsVendor,
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.VendorIdRef } : [],
              selectedPlants: [{ Text: Data.Plants[0].PlantName, Value: Data.Plants[0].PlantId }],
              ICCApplicability: iccObj && iccObj !== undefined ? { label: iccObj.Text, value: iccObj.Value } : [],
              PaymentTermsApplicability: paymentObj && paymentObj !== undefined ? { label: paymentObj.Text, value: paymentObj.Value } : [],
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : ''
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
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      vendorName: [],
      isEditFlag: false,
    })
    this.props.getInterestRateData('', () => { })
    this.props.hideForm(type)
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
        this.cancel('submit')
      }
    });
  }, 500)

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */

  onSubmit = debounce((values) => {

    const { Data, IsVendor, vendorName, ICCApplicability, selectedPlants, PaymentTermsApplicability, InterestRateId, effectiveDate, DropdownChanged } = this.state;
    const userDetail = userDetails()

    let plantArray = []
    selectedPlants && selectedPlants.map((item) => {
      plantArray.push({ PlantName: item.Text, PlantId: item.Value })
      return plantArray
    })

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

        this.cancel('cancel')
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
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Plants: plantArray
      }
      if (this.state.isEditFlag) {
        this.setState({ showPopup: true, updatedObj: updateData })




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
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Plants: plantArray
      }

      this.props.createInterestRate(formData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          // toastr.success(MESSAGES.INTEREST_RATE_ADDED_SUCCESS);
          Toaster.success(MESSAGES.INTEREST_RATE_ADDED_SUCCESS)
          this.cancel('submit');

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
    const { isEditFlag, isViewMode, setDisable, disablePopup, isDataChanged } = this.state;

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
                      <h1>{this.state.isViewMode ? "View" : this.state.isEditFlag ? "Update" : "Add"} Interest Rate</h1>
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
                        <Col md="3" className='mb-4'>

                          <label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
                          <div className='p-relative'>
                            {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                            <AsyncSelect
                              name="vendorName"
                              ref={this.myRef}
                              key={this.state.updateAsyncDropdown}
                              loadOptions={promiseOptions}
                              onChange={(e) => this.handleVendorName(e)}
                              noOptionsMessage={({ inputValue }) => !inputValue ? "Please enter vendor name/code" : "No results found"}
                              value={this.state.vendorName} isDisabled={(isEditFlag || this.state.inputLoader) ? true : false}
                              onKeyDown={(onKeyDown) => {
                                if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                              }}
                              onFocus={() => onFocus(this)}
                            />
                            {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
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
                          placeholder={isViewMode ? '-' : "Select"}
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
                            placeholder={isViewMode ? '-' : "Enter"}
                            validate={[required, positiveAndDecimalNumber, decimalLengthThree]}
                            max={100}
                            component={renderNumberInputField}
                            required={true}
                            onChange={(event) => this.handleChangeAnnualIccPercentage(event.target.value)}
                            disabled={isViewMode}
                            className=" "
                            customClassName=" withBorder"
                          />
                        </Col>
                      }
                      {((this.state.IsVendor === false && getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate) && (
                        <Col md="3">
                          <Field
                            label="Plant"
                            name="Plant"
                            placeholder={"Select"}
                            title={showDataOnHover(this.state.selectedPlants)}
                            selection={
                              this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
                            options={this.renderListing("plant")}
                            selectionChanged={this.handlePlant}
                            validate={
                              this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                            required={true}
                            optionValue={(option) => option.Value}
                            optionLabel={(option) => option.Text}
                            component={renderMultiSelectField}
                            mendatory={true}
                            disabled={isEditFlag || isViewMode}
                            className="multiselect-with-border"
                          />
                        </Col>)
                      )}
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
                          placeholder={isViewMode ? '-' : "Select"}
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
                              placeholder={isViewMode ? '-' : "Enter"}
                              validate={[postiveNumber, maxLength10]}
                              component={renderNumberInputField}
                              required={false}
                              onChange={(event) => this.handleChangeRepaymentPeriod(event.target.value)}
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
                              placeholder={isViewMode ? '-' : "Enter"}
                              validate={[positiveAndDecimalNumber, decimalLengthThree]}
                              component={renderNumberInputField}
                              max={100}
                              required={false}
                              onChange={(event) => this.handleChangePaymentTermPercentage(event.target.value)}
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

                            <Field
                              label="Effective Date"
                              name="EffectiveDate"
                              placeholder="Select date"
                              selected={this.state.effectiveDate}
                              onChange={this.handleEffectiveDateChange}
                              type="text"
                              minDate={this.state.minEffectiveDate}
                              validate={[required]}
                              autoComplete={'off'}
                              required={true}
                              changeHandler={(e) => {

                              }}
                              component={renderDatePicker}
                              disabled={isViewMode || isDataChanged}
                              className="form-control"
                              onFocus={() => onFocus(this, true)}
                            />
                          </div>
                          {this.state.showErrorOnFocusDate && this.state.effectiveDate === '' && <div className='text-help mt-1 p-absolute bottom-7'>This field is required.</div>}
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <div className="col-sm-12 text-right bluefooter-butn">
                      <button
                        type={"button"}
                        className=" mr15 cancel-btn"
                        onClick={() => { this.cancel('cancel') }}
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
    paymentTermsSelectList, iccApplicabilitySelectList, plantSelectList, vendorWithVendorCodeSelectList, interestRateData, initialValues, filedObj
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
  getPlantSelectListByType,
  createInterestRate,
  getInterestRateData,
  getPaymentTermsAppliSelectList,
  getICCAppliSelectList,
  getVendorListByVendorType,
  getVendorWithVendorCodeSelectList
})(reduxForm({
  form: 'AddInterestRate',
  enableReinitialize: true,
  touchOnChange: true
})(AddInterestRate));

