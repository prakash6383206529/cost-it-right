import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, number, } from "../../../../helper/validation";
import { renderText, searchableSelect, } from "../../../layout/FormInputs";
import { createExchangeRate, getExchangeRateData, updateExchangeRate, getCurrencySelectList, } from '../../../../actions/master/ExchangeRateMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId, } from "../../../../helper/auth";
import $ from 'jquery';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
const selector = formValueSelector('AddExchangeRate');

class AddExchangeRate extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            currency: [],
            effectiveDate: '',
            ExchangeRateId: '',
        }
    }

    /**
     * @method componentDidMount
     * @description called after render the component
     */
    componentDidMount() {
        this.props.getCurrencySelectList(() => { })
        this.getDetail()
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
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
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
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getExchangeRateData(data.ID, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;

                    setTimeout(() => {
                        const { currencySelectList } = this.props;

                        const currencyObj = currencySelectList && currencySelectList.find(item => item.Value === Data.CurrencyId)

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            currency: currencyObj && currencyObj !== undefined ? { label: currencyObj.Text, value: currencyObj.Value } : [],
                            effectiveDate: moment(Data.EffectiveDate)._d
                        })
                    }, 500)

                }
            })
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
        this.props.getExchangeRateData('', () => { })
        this.props.hideForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { isEditFlag, currency, effectiveDate, ExchangeRateId } = this.state;

        /** Update existing detail of exchange master **/
        if (isEditFlag) {

            let updateData = {
                ExchangeRateId: ExchangeRateId,
                CurrencyId: currency.value,
                Currency: currency.label,
                CurrencyExchangeRate: values.CurrencyExchangeRate,
                BankRate: values.BankRate,
                CustomRate: values.CustomRate,
                BankCommissionPercentage: values.BankCommissionPercentage,
                EffectiveDate: effectiveDate,
                IsActive: true,
                LoggedInUserId: loggedInUserId(),
            }

            this.props.updateExchangeRate(updateData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.EXCHANGE_UPDATE_SUCCESS);
                    this.cancel()
                }
            });

        } else {/** Add new detail for creating exchange master **/

            let formData = {
                CurrencyId: currency.value,
                CurrencyExchangeRate: values.CurrencyExchangeRate,
                BankRate: values.BankRate,
                CustomRate: values.CustomRate,
                BankCommissionPercentage: values.BankCommissionPercentage,
                EffectiveDate: effectiveDate,
                LoggedInUserId: loggedInUserId(),
            }
            this.props.createExchangeRate(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.EXCHANGE_ADD_SUCCESS);
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
            <div>
                {/* {isLoader && <Loader />} */}
                <div className="login-container signup-form">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="shadow-lgg login-formg">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-heading mb-0">
                                            <h2>{isEditFlag ? 'Update Exchange Rate' : 'Add Exchange Rate'}</h2>
                                        </div>
                                    </div>
                                </div>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >

                                    <Row>
                                        <Col md="3">
                                            <Field
                                                name="Currency"
                                                type="text"
                                                label="Currency"
                                                component={searchableSelect}
                                                placeholder={'--Select Currency--'}
                                                options={this.renderListing('currency')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                validate={(this.state.currency == null || this.state.currency.length === 0) ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handleCurrency}
                                                valueDescription={this.state.currency}
                                                disabled={isEditFlag ? true : false}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`Currency Exchange Rate(INR)`}
                                                name={"CurrencyExchangeRate"}
                                                type="text"
                                                placeholder={'Enter'}
                                                validate={[required, number]}
                                                component={renderText}
                                                required={true}
                                                disabled={false}
                                                className=" "
                                                customClassName=" withBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`Bank Rate(INR)`}
                                                name={"BankRate"}
                                                type="text"
                                                placeholder={'Enter'}
                                                validate={[required, number]}
                                                component={renderText}
                                                required={true}
                                                disabled={false}
                                                className=" "
                                                customClassName=" withBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`Bank Commission(%)`}
                                                name={"BankCommissionPercentage"}
                                                type="text"
                                                placeholder={'Enter'}
                                                validate={[required, number]}
                                                component={renderText}
                                                required={true}
                                                disabled={false}
                                                className=" "
                                                customClassName=" withBorder"
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="3">
                                            <Field
                                                label={`Custom Rate(INR)`}
                                                name={"CustomRate"}
                                                type="text"
                                                placeholder={'Enter'}
                                                validate={[required, number]}
                                                component={renderText}
                                                required={true}
                                                disabled={false}
                                                className=" "
                                                customClassName=" withBorder"
                                            />
                                        </Col>
                                        <Col md="3">
                                            <div className="form-group">
                                                <label>
                                                    Effective Date
                                                        {/* <span className="asterisk-required">*</span> */}
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
                                                        autoComplete={'off'}
                                                        disabledKeyboardNavigation
                                                        onChangeRaw={(e) => e.preventDefault()}
                                                        disabled={false}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>






                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-right bluefooter-butn">
                                            <button
                                                type={'button'}
                                                className="reset mr15 cancel-btn"
                                                onClick={this.cancel} >
                                                <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                                            </button>
                                            <button
                                                type="submit"
                                                className="submit-button mr5 save-btn" >
                                                <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                                                {isEditFlag ? 'Update' : 'Save'}
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
    const { exchangeRate, } = state;
    const filedObj = selector(state, 'OperationCode');
    const { exchangeRateData, currencySelectList } = exchangeRate;

    let initialValues = {};
    if (exchangeRateData && exchangeRateData !== undefined) {
        initialValues = {
            CurrencyExchangeRate: exchangeRateData.CurrencyExchangeRate,
            BankRate: exchangeRateData.BankRate,
            BankCommissionPercentage: exchangeRateData.BankCommissionPercentage,
            CustomRate: exchangeRateData.CustomRate,
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

