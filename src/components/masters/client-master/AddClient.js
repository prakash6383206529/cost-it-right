import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import {
    required, email, minLength7, maxLength70, minLength10, acceptAllExceptSingleSpecialCharacter,
    maxLength80, maxLength20, postiveNumber, maxLength5, maxLength12, checkWhiteSpaces, checkSpacesInString, number
} from "../../../helper/validation";
import { renderText, renderEmailInputField, searchableSelect, renderTextInputField, validateForm, } from "../../layout/FormInputs";
import { createClient, updateClient, getClientData } from '../actions/Client';
import { fetchStateDataAPI, fetchCityDataAPI } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import ClientListing from './ClientListing';

class AddClient extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            isShowForm: false,
            ClientId: '',
            city: [],
            country: [],
            state: [],
            showStateCity: true,
        }
    }

    /**
    * @method countryHandler
    * @description Used to handle country
    */
    countryHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ country: newValue, state: [], city: [], }, () => {
                const { country } = this.state;
                if (country.label === 'India') {
                    this.setState({ showStateCity: true })
                } else {
                    this.setState({ showStateCity: false })
                }
                this.props.fetchStateDataAPI(country.value, () => { })
            });
        } else {
            this.setState({ country: [], state: [], city: [], showStateCity: true })
        }
    };

    /**
    * @method stateHandler
    * @description Used to handle state
    */
    stateHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ state: newValue }, () => {
                const { state } = this.state;
                this.props.fetchCityDataAPI(state.value, () => { })
            });
        } else {
            this.setState({ state: [], city: [] });
        }

    };

    /**
    * @method cityHandler
    * @description Used to handle City
    */
    cityHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ city: newValue });
        } else {
            this.setState({ city: [] });
        }
    };

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { countryList, stateList, cityList } = this.props;
        const temp = [];

        if (label === 'country') {
            countryList && countryList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null
            });
            return temp;
        }
        if (label === 'state') {
            stateList && stateList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null
            });
            return temp;
        }
        if (label === 'city') {
            cityList && cityList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null
            });
            return temp;
        }

    }


    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                {/* <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(cell)} /> */}
                <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(cell, rowIndex)} />
            </>
        )
    }

    /**
    * @method getDetail
    * @description used to get user detail
    */
    getDetail = (data) => {
        if (data && data.isEditFlag) {
            this.setState({
                isLoader: true,
                isEditFlag: true,
                isShowForm: true,
                ClientId: data.ID,
            })
            this.props.getClientData(data.ID, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;

                    setTimeout(() => {
                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            country: Data.CountryName !== undefined ? { label: Data.CountryName, value: Data.CountryId } : [],
                            state: Data.StateName !== undefined ? { label: Data.StateName, value: Data.StateId } : [],
                            city: Data.CityName !== undefined ? { label: Data.CityName, value: Data.CityId } : [],
                        })
                    }, 500)

                }
            })
        }
    }

    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    clearForm = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            isShowForm: false,
            isEditFlag: false,
        })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.clearForm();
        //this.props.getVolumeData('', () => { })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { ClientId, city, } = this.state;

        /** Update existing detail of supplier master **/
        if (this.state.isEditFlag) {
            let updateData = {
                ClientId: ClientId,
                ClientName: values.ClientName,
                CompanyName: values.CompanyName,
                ClientEmailId: values.ClientEmailId,
                MobileNumber: values.MobileNumber,
                ZipCode: values.ZipCode,
                PhoneNumber: values.PhoneNumber,
                Extension: values.Extension,
                CityId: city.value,
                LoggedInUserId: loggedInUserId(),
            }

            this.props.reset()
            this.props.updateClient(updateData, (res) => {
                if (res.data.Result) {
                    Toaster.success(MESSAGES.CLIENT_UPDATE_SUCCESS);
                    this.clearForm()
                    this.child.getUpdatedData();
                }
            });

        } else {/** Add new detail for creating supplier master **/

            let formData = {
                ClientName: values.ClientName,
                CompanyName: values.CompanyName,
                ClientEmailId: values.ClientEmailId,
                MobileNumber: values.MobileNumber,
                ZipCode: values.ZipCode,
                PhoneNumber: values.PhoneNumber,
                Extension: values.Extension,
                CityId: city.value,
                LoggedInUserId: loggedInUserId(),
            }
            this.props.reset()
            this.props.createClient(formData, (res) => {
                if (res.data.Result) {
                    Toaster.success(MESSAGES.CLIENT_ADD_SUCCESS);
                    this.clearForm();
                    this.child.getUpdatedData();
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
        const { handleSubmit, } = this.props;
        const { isEditFlag, } = this.state;

        return (
            <div>
                <div className="login-container signup-form">
                    <div className="row">
                        {this.state.isShowForm &&
                            <div className="col-md-12">
                                <div className="shadow-lgg login-formg">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-heading mb-0">
                                                <h2>{this.state.isEditFlag ? 'Update Customer' : 'Add Customer'}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <form
                                        noValidate
                                        className="form"
                                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                        onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                                    >
                                        <Row>
                                            <Col md="3">
                                                <Field
                                                    label={`Company Name`}
                                                    name={"CompanyName"}
                                                    type="text"
                                                    placeholder={isEditFlag ? '-' : "Enter"}
                                                    validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces, checkSpacesInString]}
                                                    component={renderText}
                                                    required={true}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Client Name`}
                                                    name={"ClientName"}
                                                    type="text"
                                                    placeholder={isEditFlag ? '-' : "Enter"}
                                                    validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, checkSpacesInString]}
                                                    component={renderText}
                                                    required={true}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="ClientEmailId"
                                                    label="Email Id"
                                                    component={renderEmailInputField}
                                                    placeholder={isEditFlag ? '-' : "Enter"}
                                                    validate={[required, email, minLength7, maxLength70]}
                                                    required={true}
                                                    maxLength={70}
                                                    isDisabled={this.state.isEditFlag ? true : false}
                                                    customClassName={'withBorderEmail'}
                                                />
                                            </Col>

                                            <Col md="3">
                                                <Row>
                                                    <Col className="Phone phoneNumber" md="9">
                                                        <Field
                                                            label="Phone No."
                                                            name={"PhoneNumber"}
                                                            type="text"
                                                            placeholder={isEditFlag ? '-' : "Enter"}
                                                            validate={[required, postiveNumber, minLength10, maxLength12, checkWhiteSpaces, number]}
                                                            component={renderTextInputField}
                                                            required={true}
                                                            // maxLength={10}
                                                            className=""
                                                            customClassName={'withBorder'}
                                                        />
                                                    </Col>
                                                    <Col className="Ext phoneNumber" md="3">
                                                        <Field
                                                            label="Extension"
                                                            name={"Extension"}
                                                            type="text"
                                                            placeholder={isEditFlag ? '-' : "Enter"}
                                                            validate={[required, postiveNumber, maxLength5, checkWhiteSpaces, number]}
                                                            component={renderTextInputField}
                                                            required={true}
                                                            // maxLength={3}
                                                            className=""
                                                            customClassName={'withBorder'}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md='3'>
                                                <Field
                                                    name="MobileNumber"
                                                    label="Mobile No."
                                                    type="text"
                                                    placeholder={isEditFlag ? '-' : "Enter"}
                                                    component={renderTextInputField}
                                                    isDisabled={false}
                                                    validate={[required, postiveNumber, minLength10, maxLength12, checkWhiteSpaces, number]}
                                                    required={true}
                                                    // maxLength={10}
                                                    customClassName={'withBorder'}
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md='3'>
                                                <Field
                                                    name="CountryId"
                                                    type="text"
                                                    label="Country"
                                                    component={searchableSelect}
                                                    placeholder={'Select Country'}
                                                    options={this.renderListing('country')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.country == null || this.state.country.length === 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.countryHandler}
                                                    valueDescription={this.state.country}
                                                />
                                            </Col>
                                            {this.state.showStateCity &&
                                                <>
                                                    <Col md='3'>
                                                        <Field
                                                            name="StateId"
                                                            type="text"
                                                            label="State"
                                                            component={searchableSelect}
                                                            placeholder={'Select State'}
                                                            options={this.renderListing('state')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.state == null || this.state.state.length === 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.stateHandler}
                                                            valueDescription={this.state.state}
                                                        />
                                                    </Col>
                                                    <Col md='3'>
                                                        <Field
                                                            name="CityId"
                                                            type="text"
                                                            label="City"
                                                            component={searchableSelect}
                                                            placeholder={'Select City'}
                                                            options={this.renderListing('city')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.city == null || this.state.city.length === 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.cityHandler}
                                                            valueDescription={this.state.city}
                                                        />
                                                    </Col>
                                                </>}
                                            <Col md='3'>
                                                <Field
                                                    label="ZipCode"
                                                    name={"ZipCode"}
                                                    type="text"
                                                    placeholder={isEditFlag ? '-' : "Enter"}
                                                    validate={[required, postiveNumber]}
                                                    component={renderText}
                                                    required={true}
                                                    maxLength={6}
                                                    customClassName={'withBorder'}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="sf-btn-footer no-gutters justify-content-between">
                                            <div className="col-md-12">
                                                <div className="text-center ">
                                                    <input
                                                        //disabled={pristine || submitting}
                                                        onClick={this.cancel}
                                                        type="button"
                                                        value="Cancel"
                                                        className="reset mr15 cancel-btn"
                                                    />
                                                    <input
                                                        //disabled={isSubmitted ? true : false}
                                                        type="submit"
                                                        value={this.state.isEditFlag ? 'Update' : 'Save'}
                                                        className="submit-button mr5 save-btn"
                                                    />
                                                </div>
                                            </div>
                                        </Row>
                                    </form>
                                </div>
                            </div>}
                    </div>
                </div>
                <ClientListing
                    onRef={ref => (this.child = ref)}
                    getDetail={this.getDetail}
                    formToggle={this.formToggle}
                    isShowForm={this.state.isShowForm}
                />
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, client }) {
    const { countryList, stateList, cityList } = comman;
    const { clientData } = client;

    let initialValues = {};
    if (clientData && clientData !== undefined) {
        initialValues = {
            ClientName: clientData.ClientName,
            CompanyName: clientData.CompanyName,
            ClientEmailId: clientData.ClientEmailId,
            MobileNumber: clientData.MobileNumber,
            ZipCode: clientData.ZipCode,
            PhoneNumber: clientData.PhoneNumber,
            Extension: clientData.Extension,
        }
    }

    return { countryList, stateList, cityList, initialValues, clientData, }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    fetchStateDataAPI,
    fetchCityDataAPI,
    createClient,
    updateClient,
    getClientData
})(reduxForm({
    form: 'AddClient',
    validate: validateForm,
    enableReinitialize: true,
    touchOnChange: true
})(AddClient));

