import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, number, positiveAndDecimalNumber, maxLength10, checkPercentageValue, decimalLengthsix, decimalLengthThree, } from "../../../helper/validation";
import { createExchangeRate, getExchangeRateData, updateExchangeRate, getCurrencySelectList, } from '../actions/ExchangeRateMaster';
import Toaster from '../../common/Toaster';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, } from "../../../helper/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DayTime from '../../common/DayTimeWrapper'
import { renderDatePicker, renderText, searchableSelect, } from "../../layout/FormInputs";
import LoaderCustom from '../../common/LoaderCustom';
import ConfirmComponent from '../../../helper/ConfirmComponent';
const
  selector = formValueSelector('AddExchangeRate');

class AddExchangeRate extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      isEditFlag: false,
      currency: [],
      effectiveDate: '',
      ExchangeRateId: '',
      DropdownChanged: true,
      DataToChange: [],
      showPopup: false,
      updatedObj: {}
    }
  }

  /**
   * @method componentDidMount
   * @description called after render the component
   */
  componentDidMount() {

    this.props.getCurrencySelectList(() => { })
    // this.props.getExchangeRateData('', (res) => { })
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
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { currencySelectList } = this.props;
    const temp = [];
    if (label === 'currency') {
      currencySelectList && currencySelectList.map(item => {
        if (item.Value === '0' || item.Text === 'INR') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
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
          setTimeout(() => {
            const { currencySelectList } = this.props;

            const currencyObj = currencySelectList && currencySelectList.find(item => Number(item.Value) === Data.CurrencyId)

            this.setState({
              isEditFlag: true,
              // isLoader: false,
              currency: currencyObj && currencyObj !== undefined ? { label: currencyObj.Text, value: currencyObj.Value } : [],
              effectiveDate: DayTime(Data.EffectiveDate)._isValid ? DayTime(Data.EffectiveDate)._d : ''
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


  cancel = () => {

    const { reset } = this.props;
    reset();
    this.setState({
      selectedTechnology: [],
      isEditFlag: false,
    })
    this.props.hideForm()
    // this.props.getExchangeRateData('', (res) => { })
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { isEditFlag, currency, effectiveDate, ExchangeRateId, DataToChange, DropdownChanged } = this.state;

    /** Update existing detail of exchange master **/
    if (isEditFlag) {

      if (DataToChange.CurrencyExchangeRate == values.CurrencyExchangeRate &&
        DataToChange.BankRate == values.BankRate && DataToChange.CustomRate == values.CustomRate &&
        DataToChange.BankCommissionPercentage == values.BankCommissionPercentage && DropdownChanged
      ) {
        this.cancel()
        return false;
      }

      let updateData = {
        ExchangeRateId: ExchangeRateId,
        CurrencyId: currency.value,
        Currency: currency.label,
        CurrencyExchangeRate: values.CurrencyExchangeRate,
        BankRate: values.BankRate,
        CustomRate: values.CustomRate,
        BankCommissionPercentage: values.BankCommissionPercentage,
        EffectiveDate: DayTime(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
        IsActive: true,
        LoggedInUserId: loggedInUserId(),
        IsForcefulUpdated: true
      }
      if (isEditFlag) {
        this.setState({ showPopup: true, updatedObj: updateData })
        const toastrConfirmOptions = {
          onOk: () => {
            this.props.reset()
            this.props.updateExchangeRate(updateData, (res) => {
              if (res.data.Result) {
                Toaster.success(MESSAGES.EXCHANGE_UPDATE_SUCCESS);
                this.cancel()
              }
            });
          },
          onCancel: () => { },
          component: () => <ConfirmComponent />,
        }
        // return toastr.confirm(`${'You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
      }


    } else {/** Add new detail for creating exchange master **/

      let formData = {
        CurrencyId: currency.value,
        CurrencyExchangeRate: values.CurrencyExchangeRate,
        BankRate: values.BankRate,
        CustomRate: values.CustomRate,
        BankCommissionPercentage: values.BankCommissionPercentage,
        EffectiveDate: DayTime(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
        LoggedInUserId: loggedInUserId(),
      }

      this.props.reset()
      this.props.createExchangeRate(formData, (res) => {
        if (res.data.Result) {

          Toaster.success(MESSAGES.EXCHANGE_ADD_SUCCESS);
          this.cancel();
        }
      });
    }

  }

  onPopupConfirm = () => {
    this.props.reset()
    this.props.updateExchangeRate(this.state.updatedObj, (res) => {
      if (res.data.Result) {
        Toaster.success(MESSAGES.EXCHANGE_UPDATE_SUCCESS);
        this.cancel()
      }
    });
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
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
                        {isEditFlag
                          ? "Update Exchange Rate"
                          : "Add Exchange Rate"}
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
                      <Col md="4">
                        <Field
                          name="Currency"
                          type="text"
                          label="Currency"
                          component={searchableSelect}
                          placeholder={"Select"}
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
                      <Col md="4">
                        <Field
                          label={`Currency Exchange Rate(INR)`}
                          name={"CurrencyExchangeRate"}
                          type="text"
                          placeholder={"Enter"}
                          validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                          component={renderText}
                          required={true}
                          disabled={false}
                          className=" "
                          customClassName="withBorder"
                        />
                      </Col>
                      <Col md="4">
                        <Field
                          label={`Bank Rate(INR)`}
                          name={"BankRate"}
                          type="text"
                          placeholder={"Enter"}
                          validate={[positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                          component={renderText}
                          disabled={false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      <Col md="4">
                        <Field
                          label={`Bank Commission(%)`}
                          name={"BankCommissionPercentage"}
                          type="text"
                          placeholder={"Enter"}
                          validate={[positiveAndDecimalNumber, maxLength10, decimalLengthThree]}
                          component={renderText}
                          max={100}
                          disabled={false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>

                      <Col md="4">
                        <Field
                          label={`Custom Rate(INR)`}
                          name={"CustomRate"}
                          type="text"
                          placeholder={"Enter"}
                          validate={[positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                          component={renderText}
                          disabled={false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      <Col md="4">
                        <div className="form-group">
                          <label>
                            Effective Date
                            <span className="asterisk-required">*</span>
                          </label>
                          <div className="inputbox date-section">
                            <DatePicker
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
                              validate={[required]}
                              onChangeRaw={(e) => e.preventDefault()}
                              required
                              disabled={isEditFlag ? true : false}

                            />
                            {/* <Field
                              label="Effective Date"
                              name="EffectiveDate"
                              // selected={this.state.effectiveDate}
                              onChange={this.handleEffectiveDateChange}
                              type="text"
                              validate={[required]}
                              autoComplete={'off'}
                              required={true}
                              changeHandler={(e) => {
                                //e.preventDefault()
                              }}
                              component={renderDatePicker}
                              className="form-control"
                            //minDate={moment()}
                            /> */}
                          </div>
                        </div>
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
                        <div className={'cancel-icon'}></div>
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
          {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} />
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
  const { exchangeRate, } = state;  //why not selector jere......from
  const filedObj = selector(state, 'OperationCode', 'EffectiveDate', 'BankCommissionPercentage');
  const { exchangeRateData, currencySelectList } = exchangeRate;

  let initialValues = {};
  if (exchangeRateData && exchangeRateData !== undefined) {
    initialValues = {
      CurrencyExchangeRate: exchangeRateData.CurrencyExchangeRate ? exchangeRateData.CurrencyExchangeRate : '',
      BankRate: exchangeRateData.BankRate ? exchangeRateData.BankRate : '',
      BankCommissionPercentage: exchangeRateData.BankCommissionPercentage ? exchangeRateData.BankCommissionPercentage : '',
      CustomRate: exchangeRateData.CustomRate ? exchangeRateData.CustomRate : '',
      // EffectiveDate: exchangeRateData.EffectiveDate ? exchangeRateData.EffectiveDate : ''
      EffectiveDate: DayTime(exchangeRateData.EffectiveDate).utc._isValid ? DayTime(exchangeRateData.EffectiveDate) : ''
      // effectiveDate: moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : ''

    }
  }

  return { exchangeRateData, currencySelectList, filedObj, initialValues }
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
})(reduxForm({
  form: 'AddExchangeRate',
  enableReinitialize: true,
})(AddExchangeRate));