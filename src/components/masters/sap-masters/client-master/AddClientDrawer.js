import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, number, email, minLength7, maxLength70, minLength10 } from "../../../../helper/validation";
import { renderText, renderEmailInputField, searchableSelect } from "../../../layout/FormInputs";
import { createClient, updateClient, getClientData } from '../../../../actions/master/Client';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, getCityByCountry, } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId, } from "../../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';

class AddClientDrawer extends Component {
    constructor(props) {
        super(props);
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
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        this.props.fetchCountryDataAPI(() => { })
        this.getDetail()
    }

    getAllCityData = () => {
        const { country } = this.state;
        if (country && country.label !== 'India') {
            this.props.getCityByCountry(country.value, '00000000000000000000000000000000', () => { })
        } else {
            this.props.fetchStateDataAPI(country.value, () => { })
        }
    }

    /**
    * @method countryHandler
    * @description Used to handle country
    */
    countryHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ country: newValue, state: [], city: [] }, () => {
                this.getAllCityData()
            });
        } else {
            this.setState({ country: [], state: [], city: [] })
        }
    };

    /**
    * @method stateHandler
    * @description Used to handle state
    */
    stateHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ state: newValue, city: [], }, () => {
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
        if (label === 'city') {
            cityList && cityList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

    }

    /**
    * @method getDetail
    * @description used to get user detail
    */
    getDetail = () => {
        const { isEditFlag, ID } = this.props;
        if (isEditFlag) {
            this.setState({
                isLoader: true,
                ClientId: ID,
            })
            this.props.getClientData(ID, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;

                    this.props.fetchStateDataAPI(Data.CountryId, () => { })
                    this.props.fetchCityDataAPI(Data.StateId, () => { })

                    setTimeout(() => {
                        const { countryList, stateList, cityList } = this.props;

                        const CountryObj = countryList && countryList.find(item => item.Value === Data.CountryId)
                        const StateObj = stateList && stateList.find(item => item.Value === Data.StateId)
                        const CityObj = cityList && cityList.find(item => item.Value === Data.CityId)

                        this.setState({
                            isLoader: false,
                            country: CountryObj && CountryObj !== undefined ? { label: CountryObj.Text, value: CountryObj.Value } : [],
                            state: StateObj && StateObj !== undefined ? { label: StateObj.Text, value: StateObj.Value } : [],
                            city: CityObj && CityObj !== undefined ? { label: CityObj.Text, value: CityObj.Value } : [],
                        })
                    }, 500)

                }
            })
        } else {
            this.props.getClientData('', () => { })
        }
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            city: [],
            country: [],
            state: [],
        })
        this.props.getClientData('', () => { })
        this.props.fetchStateDataAPI(0, () => { })
        this.toggleDrawer('')
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { city, } = this.state;
        const { isEditFlag, ID } = this.props;

        /** Update existing detail of supplier master **/
        if (isEditFlag) {
            let updateData = {
                ClientId: ID,
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

            this.props.updateClient(updateData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.CLIENT_UPDATE_SUCCESS);
                    this.cancel();
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
            this.props.createClient(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.CLIENT_ADD_SUCCESS);
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
        const { handleSubmit, isEditFlag, } = this.props;
        const { country } = this.state;
        return (
            <div>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container >
                        <div className={'drawer-wrapper'}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={'header-wrapper left'}>
                                            <h3>{isEditFlag ? 'Update Client' : 'Add Client'}</h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="6">
                                        <Field
                                            label={`Company Name`}
                                            name={"CompanyName"}
                                            type="text"
                                            placeholder={''}
                                            validate={[required]}
                                            component={renderText}
                                            required={true}
                                            className=""
                                            customClassName={'withBorder'}
                                            disabled={isEditFlag ? true : false}
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            label={`Client Name`}
                                            name={"ClientName"}
                                            type="text"
                                            placeholder={''}
                                            validate={[required]}
                                            component={renderText}
                                            required={true}
                                            className=""
                                            customClassName={'withBorder'}
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            name="ClientEmailId"
                                            label="Email Id"
                                            component={renderEmailInputField}
                                            placeholder={'Enter'}
                                            validate={[required, email, minLength7, maxLength70]}
                                            required={true}
                                            maxLength={70}
                                            isDisabled={this.state.isEditFlag ? true : false}
                                            customClassName={'withBorderEmail'}
                                        />
                                    </Col>

                                    <Col md="6">
                                        <Row>
                                            <Col className="Phone phoneNumber" md="8">
                                                <Field
                                                    label="Phone No."
                                                    name={"PhoneNumber"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required, number]}
                                                    component={renderText}
                                                    required={true}
                                                    maxLength={12}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                />
                                            </Col>
                                            <Col className="Ext phoneNumber" md="4">
                                                <Field
                                                    label="Ex."
                                                    name={"Extension"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required, number]}
                                                    component={renderText}
                                                    required={true}
                                                    maxLength={3}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md='6'>
                                        <Field
                                            name="MobileNumber"
                                            label="Mobile No."
                                            type="text"
                                            placeholder={''}
                                            component={renderText}
                                            isDisabled={false}
                                            validate={[required, number, minLength10]}
                                            required={true}
                                            maxLength={10}
                                            customClassName={'withBorder'}
                                        />
                                    </Col>
                                    <Col md='6'>
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
                                </Row>
                                <Row>
                                    {(country.length === 0 || country.label === 'India') &&
                                        <Col md='6'>
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
                                        </Col>}
                                    <Col md='6'>
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

                                    <Col md='6'>
                                        <Field
                                            label="ZipCode"
                                            name={"ZipCode"}
                                            type="text"
                                            placeholder={''}
                                            validate={[required, number]}
                                            component={renderText}
                                            required={true}
                                            maxLength={6}
                                            customClassName={'withBorder'}
                                        />
                                    </Col>
                                </Row>

                                <Row className="sf-btn-footer no-gutters justify-content-between">
                                    <div className="col-md-12  text-right">
                                        <div className="">
                                            <button
                                                type={'button'}
                                                className="reset mr15 cancel-btn"
                                                onClick={this.cancel} >
                                                <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                                            </button>
                                            <button
                                                type="submit"
                                                className="submit-button mr5 save-btn" >
                                                <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' />
                                                </div> {this.props.isEditFlag ? 'Update' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                </Row>
                            </form>
                        </div>
                    </Container>
                </Drawer>
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
    fetchCountryDataAPI,
    fetchStateDataAPI,
    fetchCityDataAPI,
    createClient,
    updateClient,
    getClientData,
    getCityByCountry,
})(reduxForm({
    form: 'AddClientDrawer',
    enableReinitialize: true,
})(AddClientDrawer));
