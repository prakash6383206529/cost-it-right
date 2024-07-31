import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import { required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, maxPercentValue, number, checkWhiteSpaces, percentageLimitValidation, checkPercentageValue, } from "../../../helper/validation";
import { createExchangeRate, getExchangeRateData, updateExchangeRate, getCurrencySelectList, } from '../actions/ExchangeRateMaster';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, } from "../../../helper/auth";
import "react-datepicker/dist/react-datepicker.css";
import DayTime from '../../common/DayTimeWrapper'
import { renderDatePicker, renderText, renderTextInputField, searchableSelect, } from "../../layout/FormInputs";
import LoaderCustom from '../../common/LoaderCustom';
import { debounce } from 'lodash';
import { onFocus } from '../../../helper';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { CBCTypeId, searchCount, SPACEBAR, VBC_VENDOR_TYPE, VBCTypeId, ZBCTypeId } from '../../../config/constants';
import { reactLocalStorage } from 'reactjs-localstorage';
import AsyncSelect from 'react-select/async';
import { autoCompleteDropdown, getCostingTypeIdByCostingPermission } from '../../common/CommonFunctions';
import { getClientSelectList, } from '../actions/Client';
import { getExchangeRateSource, getVendorNameByVendorSelectList } from '../../../actions/Common';
const
  selector = formValueSelector('AddExchangeRate');

class AddExchangeRate extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      isEditFlag: false,
      isViewMode: this.props?.data?.isViewMode ? true : false,
      currency: [],
      effectiveDate: '',
      ExchangeRateId: '',
      DropdownChanged: true,
      DataToChange: [],
      updatedObj: {},
      setDisable: false,
      minEffectiveDate: '',
      isFinancialDataChange: false,
      showErrorOnFocusDate: false,
      showPopup: false,
      costingTypeId: ZBCTypeId,
      customer: [],
      vendorName: [],
      vendorFilterList: [],
      budgeting: false,
      exchangeRateSource: [],
      toCurrency: []
    }
  }

  /**
   * @method componentDidMount
   * @description called after render the component
   */
  componentDidMount() {
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() })
    if (!(this.props.data.isEditFlag || this.props.data.isViewFlag)) {
      this.props.getCurrencySelectList(true, () => { })
    }
    if (getCostingTypeIdByCostingPermission() === CBCTypeId) {
      this.props.getClientSelectList(() => { })
    }
    this.props.getExchangeRateSource((res) => { })
    this.getDetail()
  }


  componentDidUpdate(prevProps) {
    if (this.props.filedObj !== prevProps.filedObj) {
      const { BankCommissionPercentage } = this.props.filedObj
      if (BankCommissionPercentage) {
        checkPercentageValue(BankCommissionPercentage, "Bank commission percentage should not be more than 100") ? this.props.change('BankCommissionPercentage', BankCommissionPercentage) : this.props.change('BankCommissionPercentage', 0)
      }
    }
  }
  /**
   * @method onPressVendor
   * @description Used for Vendor checked
   */
  onPressVendor = (costingHeadFlag) => {
    const fieldsToClear = [
      'Currency',
      'EffectiveDate',
      'vendorName',
      'clientName',
      'CurrencyExchangeRate'
    ];
    fieldsToClear.forEach(fieldName => {
      this.props.dispatch(clearFields('AddExchangeRate', false, false, fieldName));
    });
    this.setState({
      vendorName: [],
      costingTypeId: costingHeadFlag,
      vendorLocation: [],
      selectedPlants: [],
    });
    if (costingHeadFlag === CBCTypeId) {
      this.props.getClientSelectList(() => { })
    }
  }
  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { currencySelectList, clientSelectList, exchangeRateSourceList } = this.props;
    const temp = [];
    if (label === 'currency') {
      currencySelectList && currencySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'ClientList') {
      clientSelectList && clientSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'exchangeSource') {
      exchangeRateSourceList && exchangeRateSourceList.map((item) => {
        if (item.Value === '--Exchange Rate Source Name--') return false

        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }
  }

  /**
  * @method handleCurrency
  * @description called
  */
  handleCurrency = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ currency: newValue, });
    } else {
      this.setState({ currency: [], })
    }
  };

  /**
  * @method handleToCurrency
  * @description called
  */
  handleToCurrency = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ toCurrency: newValue, });
    } else {
      this.setState({ toCurrency: [], })
    }
  };
  /**
* @method handleExchangeRateSource
* @description called
*/
  handleExchangeRateSource = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ exchangeRateSource: newValue, });
    } else {
      this.setState({ exchangeRateSource: [], })
    }
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
  * @method getDetail
  * @description used to get user detail
  */
  getDetail = () => {
    const { data } = this.props;

    if (data && data.isEditFlag) {
      this.setState({
        isLoader: true,
        isEditFlag: true,
        ExchangeRateId: data.ID,
      })
      this.props.getExchangeRateData(data.ID, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          this.setState({ DataToChange: Data })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.props.change('CurrencyExchangeRate', Data.CurrencyExchangeRate)
          setTimeout(() => {
            this.setState({ minEffectiveDate: Data.EffectiveDate })
            this.setState({
              isEditFlag: true,
              // isLoader: false,
              currency: Data.Currency !== undefined ? { label: Data.Currency, value: Data.CurrencyId } : [],
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(new Date(Data.EffectiveDate)).format('MM/DD/YYYY') : '',
              costingTypeId: Data.CostingHeadId,
              customer: Data.CustomerName !== undefined ? { label: `${Data.CustomerName} (${Data.CustomerCode})`, value: Data.CustomerId } : [],
              vendorName: Data.VendorName !== undefined ? { label: `${Data.VendorName} (${Data.VendorCode})`, value: Data.VendorIdRef } : [],
              budgeting: Data.IsBudgeting ? Data.IsBudgeting : false
            }, () => this.setState({ isLoader: false }))
          }, 500)

        }
      })
    }
    else {
      this.setState({
        isLoader: false,
      })
      this.props.change('BankRate', '')
      this.props.change('CustomRate', '')
      this.props.change('CurrencyExchangeRate', '')
      this.props.change('BankCommissionPercentage', '')
      this.props.change('EffectiveDate', '')
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
      selectedTechnology: [],
      isEditFlag: false,
    })
    this.props.hideForm(type)
  }
  cancelHandler = () => {
    if (this.state.isViewMode) {
      this.cancel('cancel')
    } else {
      this.setState({ showPopup: true })
    }
  }
  onPopupConfirm = () => {
    this.cancel('cancel')
    this.setState({ showPopup: false })
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
  }
  onFinancialDataChange = (e) => {

    if (e.target.name === "CurrencyExchangeRate") {
      if (e.target.value === this.state.DataToChange.CurrencyExchangeRate && this.state.DataToChange.BankRate === this.props.filedObj.BankRate && this.state.DataToChange.BankCommissionPercentage === this.props.filedObj.BankCommissionPercentage && this.state.DataToChange.CustomRate === this.props.filedObj.CustomRate) {
        this.setState({ isFinancialDataChange: false })
        return
      }
    } else if (e.target.name === "BankRate") {
      if (e.target.value === this.state.DataToChange.BankRate && this.state.DataToChange.CurrencyExchangeRate === this.props.filedObj.CurrencyExchangeRate && this.state.DataToChange.BankCommissionPercentage === this.props.filedObj.BankCommissionPercentage && this.state.DataToChange.CustomRate === this.props.filedObj.CustomRate) {
        this.setState({ isFinancialDataChange: false })
        return
      }
    }
    else if (e.target.name === "BankCommissionPercentage") {
      if (e.target.value === this.state.DataToChange.BankCommissionPercentage && this.state.DataToChange.BankRate === this.props.filedObj.BankRate && this.state.DataToChange.CurrencyExchangeRate === this.props.filedObj.CurrencyExchangeRate && this.state.DataToChange.CustomRate === this.props.filedObj.CustomRate) {
        this.setState({ isFinancialDataChange: false })
        return
      }
    }
    else if (e.target.name === "CustomRate") {
      if (e.target.value === this.state.DataToChange.CustomRate && this.state.DataToChange.BankRate === this.props.filedObj.BankRate && this.state.DataToChange.BankCommissionPercentage === this.props.filedObj.BankCommissionPercentage && this.state.DataToChange.CurrencyExchangeRate === this.props.filedObj.CurrencyExchangeRate) {
        this.setState({ isFinancialDataChange: false })
        return
      }
    }
    this.setState({ isFinancialDataChange: true })

  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { isEditFlag, currency, effectiveDate, ExchangeRateId, DataToChange, DropdownChanged, customer, costingTypeId, vendorName, budgeting, toCurrency, exchangeRateSource } = this.state;

    /** Update existing detail of exchange master **/
    if (isEditFlag) {
      if (DataToChange.CurrencyExchangeRate === values.CurrencyExchangeRate &&
        (DataToChange.BankRate === values.BankRate || values.BankRate === undefined || values.BankRate === '') && (DataToChange.CustomRate === values.CustomRate || values.CustomRate === undefined || values.CustomRate === '') &&
        DropdownChanged && (DataToChange.BankCommissionPercentage === values.BankCommissionPercentage || values.BankCommissionPercentage === undefined || values.BankCommissionPercentage === '')
      ) {
        this.cancel('cancel')
        return false;
      }

      if (this.state.isFinancialDataChange) {
        if ((DayTime(DataToChange.EffectiveDate).format("DD/MM/YYYY") === DayTime(effectiveDate).format("DD/MM/YYYY"))) {
          this.setState({ setDisable: false })
          Toaster.warning('Please update the effective date')
          return false
        }
      }

      this.setState({ setDisable: true })
      let updateData = {
        ExchangeRateId: ExchangeRateId,
        FromCurrencyId: currency.value,
        FromCurrency: currency.label,
        CurrencyExchangeRate: values.CurrencyExchangeRate,
        BankRate: values.BankRate,
        CustomRate: values.CustomRate,
        BankCommissionPercentage: values.BankCommissionPercentage,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        IsActive: true,
        LoggedInUserId: loggedInUserId(),
        IsForcefulUpdated: true,
        CustomerId: customer.value,
        CostingHeadId: costingTypeId,
        VendorId: vendorName.value,
        IsBudgeting: budgeting,
        ToCurrencyId: toCurrency.value,
        ExchangeRateSourceName: exchangeRateSource.label
      }
      if (isEditFlag) {
        this.props.updateExchangeRate(updateData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.EXCHANGE_UPDATE_SUCCESS);
            this.cancel('submit')
          }
        });
        // return toastr.confirm(`${'You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
      }
    } else {/** Add new detail for creating exchange master **/

      this.setState({ setDisable: true })
      let formData = {
        FromCurrencyId: currency.value,
        CurrencyExchangeRate: values.CurrencyExchangeRate,
        BankRate: values.BankRate,
        CustomRate: values.CustomRate,
        BankCommissionPercentage: values.BankCommissionPercentage,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        LoggedInUserId: loggedInUserId(),
        CustomerId: customer.value,
        CostingHeadId: costingTypeId,
        VendorId: vendorName.value,
        IsBudgeting: budgeting,
        ToCurrencyId: toCurrency.value,
        ExchangeRateSourceName: exchangeRateSource.label
      }
      this.props.createExchangeRate(formData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {

          Toaster.success(MESSAGES.EXCHANGE_ADD_SUCCESS);
          this.cancel('submit');
        }
      });
    }

  }, 500)

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };
  /**
  * @method handleCustomer
  * @description called
  */
  handleCustomer = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ customer: newValue });
    } else {
      this.setState({ customer: [] })
    }
  };


  onBudgetingChange = () => {
    this.setState({ budgeting: !this.state.budgeting })
  }

  /**
* @method handleVendorName
* @description called
*/
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false, }, () => {
      });
    } else {
      this.setState({ vendorName: [], })
    }
  };
  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, } = this.props;
    const { isEditFlag, isViewMode, setDisable, costingTypeId } = this.state;
    const filterList = async (inputValue) => {
      const { vendorFilterList } = this.state
      if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
      }
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && vendorFilterList !== resultInput) {
        this.setState({ inputLoader: true })
        let res
        res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)

        this.setState({ inputLoader: false })
        this.setState({ vendorFilterList: resultInput })
        let vendorDataAPI = res?.data?.SelectList
        if (inputValue) {
          return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
        } else {
          return vendorDataAPI
        }
      }
      else {
        if (inputValue?.length < searchCount) return false
        else {
          let VendorData = reactLocalStorage?.getObject('Data')
          if (inputValue) {
            return autoCompleteDropdown(inputValue, VendorData, false, [], false)
          } else {
            return VendorData
          }
        }
      }
    };
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
                        {isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Exchange Rate
                      </h1>
                    </div>
                  </div>
                </div>
                <form
                  noValidate
                  className="form"
                  onSubmit={handleSubmit((e) => this.onSubmit(e))}
                  onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                >
                  <div className="add-min-height">
                    <Row>
                      <Col md="12">
                        {(reactLocalStorage.getObject('CostingTypePermission').zbc) && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                          <input
                            type="radio"
                            name="costingHead"
                            checked={
                              costingTypeId === ZBCTypeId ? true : false
                            }
                            onClick={() =>
                              this.onPressVendor(ZBCTypeId)
                            }
                            disabled={isEditFlag ? true : false}
                          />{" "}
                          <span>Zero Based</span>
                        </Label>}
                        {(reactLocalStorage.getObject('CostingTypePermission').vbc) && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                          <input
                            type="radio"
                            name="costingHead"
                            checked={
                              costingTypeId === VBCTypeId ? true : false
                            }
                            onClick={() =>
                              this.onPressVendor(VBCTypeId)
                            }
                            disabled={isEditFlag ? true : false}
                          />{" "}
                          <span>Vendor Based</span>
                        </Label>}
                        {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                          <input
                            type="radio"
                            name="costingHead"
                            checked={
                              costingTypeId === CBCTypeId ? true : false
                            }
                            onClick={() =>
                              this.onPressVendor(CBCTypeId)
                            }
                            disabled={isEditFlag ? true : false}
                          />{" "}
                          <span>Customer Based</span>
                        </Label>}
                      </Col>
                    </Row>
                    <Row>
                      {costingTypeId === VBCTypeId && (
                        <>
                          <Col md="3" className='mb-4'>
                            <label>{"Vendor (Code)"}<span className="asterisk-required">*</span></label>
                            <div className="d-flex justify-space-between align-items-center async-select">
                              <div className="fullinput-icon p-relative">
                                {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                <AsyncSelect
                                  name="vendorName"
                                  ref={this.myRef}
                                  key={this.state.updateAsyncDropdown}
                                  loadOptions={filterList}
                                  onChange={(e) => this.handleVendorName(e)}
                                  value={this.state.vendorName}
                                  noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                  isDisabled={(isEditFlag) ? true : false}
                                  onFocus={() => onFocus(this)}
                                  onKeyDown={(onKeyDown) => {
                                    if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                  }}
                                />
                              </div>
                            </div>
                            {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
                          </Col>
                        </>
                      )}
                      {costingTypeId === CBCTypeId && (
                        <Col md="3">
                          <Field
                            name="clientName"
                            type="text"
                            label={"Customer (Code)"}
                            component={searchableSelect}
                            placeholder={isEditFlag ? '-' : "Select"}
                            options={this.renderListing("ClientList")}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
                            validate={
                              this.state.customer == null ||
                                this.state.customer.length === 0
                                ? [required]
                                : []
                            }
                            required={true}
                            handleChangeDescription={this.handleCustomer}
                            valueDescription={this.state.customer}
                            disabled={isEditFlag ? true : false}
                          />
                        </Col>
                      )}


                      <Col md="3">
                        <Field
                          name="Currency"
                          type="text"
                          label="From Currency"
                          component={searchableSelect}
                          placeholder={isEditFlag ? '-' : "Select"}
                          onChange={this.onFinancialDataChange}
                          options={this.renderListing("currency")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={
                            this.state.currency == null ||
                              this.state.currency.length === 0
                              ? [required]
                              : []
                          }
                          required={true}
                          handleChangeDescription={this.handleCurrency}
                          valueDescription={this.state.currency}
                          disabled={isEditFlag ? true : false}
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          name="ToCurrency"
                          type="text"
                          label="To Currency"
                          component={searchableSelect}
                          placeholder={isEditFlag ? '-' : "Select"}
                          onChange={this.onFinancialDataChange}
                          options={this.renderListing("currency")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={
                            this.state.toCurrency == null ||
                              this.state.toCurrency.length === 0
                              ? [required]
                              : []
                          }
                          required={true}
                          handleChangeDescription={this.handleToCurrency}
                          valueDescription={this.state.toCurrency}
                          disabled={isEditFlag ? true : false}
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          name="ExchangeSource"
                          type="text"
                          label="Exchange Rate Source"
                          component={searchableSelect}
                          placeholder={isEditFlag ? '-' : "Select"}
                          onChange={(e) => { }}
                          options={this.renderListing("exchangeSource")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          required={false}
                          handleChangeDescription={this.handleExchangeRateSource}
                          disabled={isEditFlag ? true : false}
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Currency Exchange Rate (${reactLocalStorage.getObject("baseCurrency")})`}
                          name={"CurrencyExchangeRate"}
                          type="text"
                          placeholder={isViewMode ? '-' : 'Enter'}
                          validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                          component={renderTextInputField}
                          required={true}
                          onChange={this.onFinancialDataChange}
                          disabled={isViewMode}
                          className=" "
                          customClassName="withBorder"
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Bank Rate (${reactLocalStorage.getObject("baseCurrency")})`}
                          name={"BankRate"}
                          type="text"
                          placeholder={isViewMode ? '-' : 'Enter'}
                          validate={[positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                          component={renderTextInputField}
                          disabled={isViewMode}
                          onChange={this.onFinancialDataChange}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Bank Commission(%)`}
                          name={"BankCommissionPercentage"}
                          type="text"
                          placeholder={isViewMode ? '-' : 'Enter'}
                          validate={[number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation]}
                          component={renderText}
                          max={100}
                          disabled={isViewMode}
                          onChange={this.onFinancialDataChange}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>

                      <Col md="3">
                        <Field
                          label={`Custom Rate (${reactLocalStorage.getObject("baseCurrency")})`}
                          name={"CustomRate"}
                          type="text"
                          placeholder={isViewMode ? '-' : 'Enter'}
                          validate={[positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                          component={renderTextInputField}
                          disabled={isViewMode}
                          onChange={this.onFinancialDataChange}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      <Col md="3">
                        <div className="inputbox date-section form-group">
                          <Field
                            label="Effective Date"
                            name="EffectiveDate"
                            selected={DayTime(this.state.effectiveDate).isValid() ? new Date(this.state.effectiveDate) : null}
                            onChange={this.handleEffectiveDateChange}
                            type="text"
                            validate={[required]}
                            autoComplete={"off"}
                            required={true}
                            changeHandler={(e) => {
                            }}
                            component={renderDatePicker}
                            disabled={isViewMode || (!this.state.isFinancialDataChange && isEditFlag)}
                            placeholderText={isViewMode || (!this.state.isFinancialDataChange && isEditFlag) ? '-' : "Select Date"}
                          />
                        </div>
                      </Col>

                      <label
                        className={`custom-checkbox w-auto mt-4 ml-4 ${costingTypeId === VBCTypeId ? "" : ""
                          }`}
                        onChange={this.onBudgetingChange}
                      >
                        Budgeting
                        <input
                          type="checkbox"
                          checked={this.state.budgeting}
                          disabled={isViewMode}
                        />
                        <span
                          className=" before-box p-0"
                          checked={this.state.budgeting}
                          onChange={this.onBudgetingChange}
                        />
                      </label>

                    </Row>
                  </div>
                  <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <div className="col-sm-12 text-right bluefooter-butn">
                      <button
                        type={"button"}
                        className="mr15 cancel-btn"
                        onClick={this.cancelHandler}
                        disabled={setDisable}
                      >
                        <div className={'cancel-icon'}></div>
                        {"Cancel"}
                      </button>
                      {!isViewMode && <button
                        type="submit"
                        disabled={isViewMode || setDisable}
                        className="user-btn mr5 save-btn"
                      >
                        <div className={"save-icon"}></div>
                        {isEditFlag ? "Update" : "Save"}
                      </button>}
                    </div>
                  </Row>
                </form>
              </div>
            </div>
          </div>
        </div>
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
        }
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
  const { exchangeRate, client, comman } = state;  //why not selector jere......from
  const filedObj = selector(state, 'OperationCode', 'EffectiveDate', 'BankCommissionPercentage', 'BankRate', 'CustomRate', 'CurrencyExchangeRate');
  const { exchangeRateData, currencySelectList } = exchangeRate;
  const { clientSelectList } = client;
  const { exchangeRateSourceList } = comman

  let initialValues = {};
  if (exchangeRateData && exchangeRateData !== undefined) {
    initialValues = {
      BankRate: exchangeRateData.BankRate ? exchangeRateData.BankRate : '',
      BankCommissionPercentage: exchangeRateData.BankCommissionPercentage ? exchangeRateData.BankCommissionPercentage : '',
      CustomRate: exchangeRateData.CustomRate ? exchangeRateData.CustomRate : '',
    }
  }
  return { exchangeRateData, currencySelectList, filedObj, initialValues, clientSelectList, exchangeRateSourceList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  createExchangeRate,
  updateExchangeRate,
  getExchangeRateData,
  getCurrencySelectList,
  getClientSelectList,
  getExchangeRateSource
})(reduxForm({
  form: 'AddExchangeRate',
  enableReinitialize: true,
})(AddExchangeRate));