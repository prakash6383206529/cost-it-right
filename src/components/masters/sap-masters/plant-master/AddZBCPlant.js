import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { required, number, maxLength6, maxLength10 } from "../../../../helper/validation";
import { userDetails, loggedInUserId } from "../../../../helper/auth";
import { renderText, renderSelectField, searchableSelect } from "../../../layout/FormInputs";
import { createPlantAPI, getPlantUnitAPI, updatePlantAPI } from '../../../../actions/master/Plant';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, fetchSupplierCityDataAPI } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import ZBCPlantListing from "./ZBCPlantListing";
import $ from 'jquery';

class AddZBCPlant extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            isLoader: false,
            PlantId: '',
            city: [],
            country: [],
            state: [],
            isShowForm: false,
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    componentDidMount() {
        this.props.fetchCountryDataAPI(() => { })

    }

    /**
    * @method getDetails
    * @description Used to cancel modal
    */
    getDetails = (data) => {
        if (data && data.isEditFlag) {
            this.setState({
                isEditFlag: false,
                isLoader: true,
                isShowForm: true,
                PlantId: data.Id,
            })
            if (data.passwordFlag == false) {
                $('html, body').animate({ scrollTop: 0 }, 'slow');
            }
            this.props.getPlantUnitAPI(data.Id, true, res => {
                if (res && res.data && res.data.Result) {

                    const Data = res.data.Data;

                    this.props.fetchStateDataAPI(Data.CountryId, () => { })
                    this.props.fetchCityDataAPI(Data.StateId, () => { })

                    setTimeout(() => {
                        const { countryList, stateList, cityList } = this.props;

                        const CountryObj = countryList && countryList.find(item => item.Value == Data.CountryId)
                        const StateObj = stateList && stateList.find(item => item.Value == Data.StateId)
                        const CityObj = cityList && cityList.find(item => item.Value == Data.CityIdRef)

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            country: { label: CountryObj.Text, value: CountryObj.Value },
                            state: { label: StateObj.Text, value: StateObj.Value },
                            city: { label: CityObj.Text, value: CityObj.Value },
                        })
                    }, 500)
                }
            })
        } else {
            this.props.getPlantUnitAPI('', false, res => { })
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    /**
    * @method selectType
    * @description Used show listing of unit of measurement
    */
    selectType = (label) => {
        const { countryList, stateList, cityList } = this.props;
        const temp = [];

        if (label === 'country') {
            countryList && countryList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label === 'state') {
            stateList && stateList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label === 'city') {
            cityList && cityList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

    }



    /**
    * @method countryHandler
    * @description Used to handle country
    */
    countryHandler = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ country: newValue }, () => {
                const { country } = this.state;
                this.props.fetchStateDataAPI(country.value, () => { })
            });
        } else {
            this.setState({ country: [], state: [], city: [], })
        }
    };

    /**
    * @method stateHandler
    * @description Used to handle state
    */
    stateHandler = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
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
        if (newValue && newValue != '') {
            this.setState({ city: newValue });
        } else {
            this.setState({ city: [] });
        }
    };

    /**
   * @method cancel
   * @description used to Reset form
   */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.props.getPlantUnitAPI('', false, res => { })
        this.setState({
            isEditFlag: false,
            isShowForm: false,
            country: [],
            state: [],
            city: [],
        })
    }

    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        console.log("values", values)
        const { country, state, city, PlantId, isEditFlag } = this.state;
        const { reset } = this.props;
        const userDetail = userDetails();

        if (isEditFlag) {
            this.setState({ isSubmitted: true });
            let updateData = {
                PlantId: PlantId,
                CreatedDate: '',
                CityName: city.label,
                IsActive: true,
                ModifiedBy: loggedInUserId(),
                PlantName: values.PlantName,
                PlantCode: values.PlantCode,
                IsVendor: false,
                AddressLine1: values.AddressLine1,
                AddressLine2: values.AddressLine2,
                ZipCode: values.ZipCode,
                PhoneNumber: values.PhoneNumber,
                Extension: values.Extension,
                CreatedByUserId: loggedInUserId(),
                CityId: city.value,
                EVendorType: 0,
                VendorId: userDetail.ZBCSupplierInfo.VendorId,
            }
            this.props.updatePlantAPI(PlantId, updateData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_PLANT_SUCESS);
                    reset();
                    this.setState({
                        PlantId: '',
                        isEditFlag: false,
                        isShowForm: false,
                        country: [],
                        state: [],
                        city: [],
                    })
                    this.child.getUpdatedData();
                }
            });

        } else {

            let formData = {
                PlantName: values.PlantName,
                PlantCode: values.PlantCode,
                IsVendor: false,
                AddressLine1: values.AddressLine1,
                AddressLine2: values.AddressLine2,
                ZipCode: values.ZipCode,
                PhoneNumber: values.PhoneNumber,
                Extension: values.Extension,
                CreatedByUserId: loggedInUserId(),
                CityId: city.value,
                EVendorType: 0,
                VendorId: userDetail.ZBCSupplierInfo.VendorId,
            }

            this.props.createPlantAPI(formData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.PLANT_ADDED_SUCCESS);
                    reset();
                    this.setState({
                        isShowForm: false,
                        country: [],
                        state: [],
                        city: [],
                    })
                    this.child.getUpdatedData();
                }
            });
        }
    }



    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, plantUnitDetail, reset } = this.props;
        const { isEditFlag } = this.state;
        return (
            <>
                <Container>
                    <div className="login-container signup-form">

                        <Row>
                            {/* <Col md="12">
                                <h3>{`Plant Master`}</h3>
                            </Col> */}
                            {this.state.isShowForm &&
                                <Col md="12" className="p-0">
                                    <div className="shadow-lgg login-formg pt-30">
                                        <Row>
                                            <Col md="6">
                                                <div className="form-heading mb-0">
                                                    <h2>{this.state.isEditFlag ? 'Update ZBC Plant' : 'Add  ZBC Plant'}</h2>
                                                </div>
                                            </Col>
                                        </Row>
                                        <form
                                            noValidate
                                            className="form"
                                            onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                        >
                                            <Row>
                                                <Col md="6">
                                                    <Field
                                                        label={`Plant Name`}
                                                        name={"PlantName"}
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
                                                        label={`Plant Code`}
                                                        name={"PlantCode"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md="6">
                                                    <Row>
                                                        <Col className="Phone phoneNumber" md="9">
                                                            <Field
                                                                label="Phone Number"
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
                                                        <Col className="Ext phoneNumber" md="3">
                                                            <Field
                                                                label="Extension"
                                                                name={"Extension"}
                                                                type="text"
                                                                placeholder={''}
                                                                validate={[required]}
                                                                component={renderText}
                                                                required={true}
                                                                maxLength={5}
                                                                className=""
                                                                customClassName={'withBorder'}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col md="6">
                                                    <Field
                                                        label="Address 1"
                                                        name={"AddressLine1"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        maxLength={26}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md="6">
                                                    <Field
                                                        label="Address 2"
                                                        name={"AddressLine2"}
                                                        type="text"
                                                        placeholder={''}
                                                        //validate={[required]}
                                                        component={renderText}
                                                        //required={true}
                                                        maxLength={26}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>
                                                <Col md="6">
                                                    <Field
                                                        name="CountryId"
                                                        type="text"
                                                        label="Country"
                                                        component={searchableSelect}
                                                        placeholder={'Select Country'}
                                                        options={this.selectType('country')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.country == null || this.state.country.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.countryHandler}
                                                        valueDescription={this.state.country}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md="6">
                                                    <Field
                                                        name="StateId"
                                                        type="text"
                                                        label="State"
                                                        component={searchableSelect}
                                                        placeholder={'Select State'}
                                                        options={this.selectType('state')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.state == null || this.state.state.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.stateHandler}
                                                        valueDescription={this.state.state}
                                                    />
                                                </Col>
                                                <Col md="6">
                                                    <Field
                                                        name="CityId"
                                                        type="text"
                                                        label="City"
                                                        component={searchableSelect}
                                                        placeholder={'Select City'}
                                                        options={this.selectType('city')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.city == null || this.state.city.length == 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.cityHandler}
                                                        valueDescription={this.state.city}
                                                    />
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md="6">
                                                    <Field
                                                        label="ZipCode"
                                                        name={"ZipCode"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required, number, maxLength6]}
                                                        component={renderText}
                                                        required={true}
                                                        //maxLength={6}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                    />
                                                </Col>
                                            </Row>

                                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                                <div className="col-sm-12 text-right bluefooter-butn">
                                                    <button
                                                        type="submit"
                                                        className="submit-button mr5 save-btn" >
                                                        {isEditFlag ? 'Update' : 'Save'}
                                                    </button>

                                                    <button
                                                        type={'button'}
                                                        className="reset mr15 cancel-btn"
                                                        onClick={this.cancel} >
                                                        {'Cancel'}
                                                    </button>
                                                </div>
                                            </Row>
                                        </form>
                                    </div>
                                </Col>
                            }
                        </Row>
                    </div>
                    <ZBCPlantListing
                        onRef={ref => (this.child = ref)}
                        getDetails={this.getDetails}
                        formToggle={this.formToggle}
                        isShowForm={this.state.isShowForm}
                    />
                </Container>
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, plant }) {
    const { countryList, stateList, cityList } = comman;
    const { plantUnitDetail } = plant;
    let initialValues = {};
    if (plantUnitDetail && plantUnitDetail !== undefined) {
        initialValues = {
            PlantName: plantUnitDetail.PlantName,
            PlantCode: plantUnitDetail.PlantCode,
            PhoneNumber: plantUnitDetail.PhoneNumber,
            Extension: plantUnitDetail.Extension,
            AddressLine1: plantUnitDetail.AddressLine1,
            AddressLine2: plantUnitDetail.AddressLine2,
            ZipCode: plantUnitDetail.ZipCode,
        }
    }
    return { countryList, stateList, cityList, initialValues, plantUnitDetail }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createPlantAPI,
    fetchCountryDataAPI,
    fetchStateDataAPI,
    fetchCityDataAPI,
    getPlantUnitAPI,
    fetchSupplierCityDataAPI,
    updatePlantAPI
})(reduxForm({
    form: 'AddZBCPlant',
    enableReinitialize: true,
})(AddZBCPlant));
