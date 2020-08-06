import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { required, number, upper, email, minLength7, maxLength70 } from "../../../../helper/validation";
import {
    renderText, renderSelectField, renderEmailInputField, renderMultiSelectField,
    searchableSelect
} from "../../../layout/FormInputs";
import {
    createSupplierAPI, updateSupplierAPI, getSupplierByIdAPI, getRadioButtonSupplierType,
    getVendorTypesSelectList,
} from '../../../../actions/master/Supplier';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../helper/auth";
import VendorListing from './VendorListing';
import $ from 'jquery';

class AddSupplier extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            selectedVendorType: [],
            selectedPlants: [],
            plantsArray: [],

            country: [],
            state: [],
            city: [],

            isOpenFuel: false,
            isOpenPlant: false,

            isShowForm: false,
            VendorId: '',
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    componentWillMount() {
        this.props.getVendorTypesSelectList()
        this.props.fetchCountryDataAPI(() => { })
    }

    /**
   * @method componentDidMount
   * @description called after render the component
   */
    componentDidMount() {
        this.props.getSupplierByIdAPI('', false, () => { })
    }

    /**
    * @method handlePlantSelection
    * @description called
    */
    handlePlantSelection = e => {
        this.setState({ selectedPlants: e });
    };

    /**
    * @method handleVendorType
    * @description called
    */
    handleVendorType = (e) => {
        this.setState({ selectedVendorType: e });
    };

    /**
    * @method countryHandler
    * @description Used to handle country
    */
    countryHandler = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ country: newValue, state: [], city: [] }, () => {
                const { country } = this.state;
                this.props.fetchStateDataAPI(country.value, () => { })
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
        if (newValue && newValue != '') {
            this.setState({ state: newValue, city: [] }, () => {
                const { state } = this.state;
                this.props.fetchCityDataAPI(state.value, () => { })
            });
        } else {
            this.setState({ state: [], city: [] });
        }

    };

    /**
    * @method cityHandler
    * @description Used to handle city
    */
    cityHandler = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ city: newValue });
        } else {
            this.setState({ city: [] });
        }
    };

    fuelToggler = () => {
        this.setState({ isOpenFuel: true })
    }

    plantToggler = () => {
        this.setState({ isOpenPlant: true })
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { countryList, stateList, cityList, vendorTypeList } = this.props;
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
        if (label === 'vendorType') {
            vendorTypeList && vendorTypeList.map((item, i) => {
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
    }

    /**
    * @method renderSelectPlantList
    * @description Used to render listing of selected plants
    */
    renderSelectPlantList = () => {
        const { plantList } = this.props;
        const temp = [];
        plantList && plantList.map(item => {
            if (item.Value != 0) {
                temp.push({ Text: item.Text, Value: item.Value })
            }
        });
        return temp;
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
                VendorId: data.ID,
            })
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getSupplierByIdAPI(data.ID, data.isEditFlag, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    let tempArr = [];
                    this.props.fetchStateDataAPI(Data.CountryId, () => { })
                    this.props.fetchCityDataAPI(Data.StateId, () => { })

                    Data && Data.VendorTypes.map((item) => {
                        tempArr.push({ Text: item.VendorType, Value: item.VendorTypeId })
                    })

                    setTimeout(() => {
                        const { countryList, stateList, cityList } = this.props;

                        const CountryObj = countryList && countryList.find(item => item.Value == Data.CountryId)
                        const StateObj = stateList && stateList.find(item => item.Value == Data.StateId)
                        const CityObj = cityList && cityList.find(item => item.Value == Data.CityId)

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            selectedVendorType: tempArr,
                            country: { label: CountryObj.Text, value: CountryObj.Value },
                            state: { label: StateObj.Text, value: StateObj.Value },
                            city: { label: CityObj.Text, value: CityObj.Value },
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
            selectedVendorType: [],
            selectedPlants: [],
            plantsArray: [],
            country: [],
            state: [],
            city: [],
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
        this.props.getSupplierByIdAPI('', false, () => { })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { selectedVendorType, selectedPlants, plantsArray, country, state, city, VendorId } = this.state;
        const { reset } = this.props;

        let vendorArray = [];
        selectedVendorType && selectedVendorType.map((item) => {
            vendorArray.push({ VendorType: item.Text, VendorTypeId: item.Value })
            return vendorArray;
        })

        /** Update existing detail of supplier master **/
        if (this.state.isEditFlag) {
            let formData = {
                VendorId: VendorId,
                VendorCode: values.VendorCode,
                Email: values.Email,
                AddressId: '',
                AddressLine1: values.AddressLine1,
                AddressLine2: values.AddressLine2,
                ZipCode: values.ZipCode,
                PhoneNumber: values.PhoneNumber,
                MobileNumber: values.MobileNumber,
                Extension: values.Extension,
                LoggedInUserId: loggedInUserId(),
                VendorTypes: vendorArray,
            }
            this.props.updateSupplierAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_SUPPLIER_SUCESS);
                    this.clearForm()
                    this.child.getUpdatedData();
                }
            });
        } else {/** Add new detail for creating supplier master **/
            let formData = {
                VendorName: values.VendorName,
                VendorCode: values.VendorCode,
                Email: values.Email,
                MobileNumber: values.MobileNumber,
                IsActive: true,
                LoggedInUserId: loggedInUserId(),
                VendorTypes: vendorArray,
                UserId: loggedInUserId(),
                AddressLine1: values.AddressLine1,
                AddressLine2: values.AddressLine2,
                ZipCode: values.ZipCode,
                PhoneNumber: values.PhoneNumber,
                Extension: values.Extension,
                CityId: city.value,
            }
            this.props.createSupplierAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.SUPPLIER_ADDED_SUCCESS);
                    this.clearForm();
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
        const { handleSubmit, reset } = this.props;
        return (
            <div className="container-fluid">
                {/* {isLoader && <Loader />} */}
                <div className="login-container signup-form">
                    <div className="row">
                        {this.state.isShowForm &&
                            <div className="col-md-12">
                                <div className="shadow-lgg login-formg">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="form-heading mb-0">
                                                <h2>{this.state.isEditFlag ? 'Update Vendor' : 'Add Vendor'}</h2>
                                                <hr />
                                            </div>
                                        </div>
                                    </div>
                                    <form
                                        noValidate
                                        className="form"
                                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                    >
                                        <Row>
                                            <Col md="6">
                                                <Field
                                                    label="Vendor Type"
                                                    name="VendorType"
                                                    placeholder="--Select Vendor--"
                                                    selection={(this.state.selectedVendorType == null || this.state.selectedVendorType.length == 0) ? [] : this.state.selectedVendorType}
                                                    options={this.renderListing('vendorType')}
                                                    selectionChanged={this.handleVendorType}
                                                    optionValue={option => option.Value}
                                                    optionLabel={option => option.Text}
                                                    component={renderMultiSelectField}
                                                    mendatory={true}
                                                    className="multiselect-with-border"
                                                    disabled={this.state.isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Vendor Name`}
                                                    name={"VendorName"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                    disabled={this.state.isEditFlag ? true : false}
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="6">
                                                <Field
                                                    label={`Vendor Code`}
                                                    name={"VendorCode"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    normalize={upper}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                    disabled={this.state.isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Email Id`}
                                                    name={"Email"}
                                                    type="email"
                                                    //placeholder={'email@domain.com/co.us'}
                                                    validate={[required, email, minLength7, maxLength70]}
                                                    component={renderEmailInputField}
                                                    required={true}
                                                    customClassName={'withBorderEmail'}
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="6">
                                                <Row>
                                                    <Col md="9">
                                                        <Field
                                                            label="Phone Number"
                                                            name={"PhoneNumber"}
                                                            type="text"
                                                            placeholder={''}
                                                            validate={[number]}
                                                            component={renderText}
                                                            //required={true}
                                                            maxLength={12}
                                                            customClassName={'withBorder'}
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label="Extension"
                                                            name={"Extension"}
                                                            type="text"
                                                            placeholder={'Ext'}
                                                            validate={[number]}
                                                            component={renderText}
                                                            //required={true}
                                                            maxLength={5}
                                                            customClassName={'withBorder w100'}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    name="Mobile"
                                                    label="MobileNumber"
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderText}
                                                    isDisabled={false}
                                                    validate={[required, number, minLength7]}
                                                    required={true}
                                                    maxLength={12}
                                                    customClassName={'withBorder'}
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="6">
                                                <Field
                                                    name="CountryId"
                                                    type="text"
                                                    label="Country"
                                                    component={searchableSelect}
                                                    placeholder={'Select Country'}
                                                    options={this.renderListing('country')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.country == null || this.state.country.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.countryHandler}
                                                    valueDescription={this.state.country}
                                                    disabled={this.state.isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    name="StateId"
                                                    type="text"
                                                    label="State"
                                                    component={searchableSelect}
                                                    placeholder={'Select State'}
                                                    options={this.renderListing('state')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.state == null || this.state.state.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.stateHandler}
                                                    valueDescription={this.state.state}
                                                    disabled={this.state.isEditFlag ? true : false}
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="6">
                                                <Field
                                                    name="CityId"
                                                    type="text"
                                                    label="City"
                                                    component={searchableSelect}
                                                    placeholder={'Select city'}
                                                    options={this.renderListing('city')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.city == null || this.state.city.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.cityHandler}
                                                    valueDescription={this.state.city}
                                                    disabled={this.state.isEditFlag ? true : false}
                                                />
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
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>

                                        </Row>
                                        <Row>
                                            <Col md="6" >
                                                <Field
                                                    label="Address 2"
                                                    name={"AddressLine2"}
                                                    type="text"
                                                    placeholder={''}
                                                    //validate={[required]}
                                                    component={renderText}
                                                    //required={true}
                                                    maxLength={26}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label="ZipCode"
                                                    name={"ZipCode"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required, number]}
                                                    component={renderText}
                                                    required={true}
                                                    maxLength={26}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                        </Row>
                                        {/* <Row>
                                            <Col md="5">
                                                <Field
                                                    label="Vendor Plant"
                                                    name="SelectedPlants"
                                                    placeholder="--Select Plant--"
                                                    selection={this.state.selectedPlants}
                                                    options={this.renderSelectPlantList()}
                                                    selectionChanged={this.handlePlantSelection}
                                                    optionValue={option => option.Value}
                                                    optionLabel={option => option.Text}
                                                    component={renderMultiSelectField}
                                                    mendatory={false}
                                                    className="multiselect-with-border"
                                                />
                                            </Col>
                                            <Col md="1">
                                                <div
                                                    onClick={this.plantToggler}
                                                    className={'plus-icon mt30 mr15 right'}>
                                                </div>
                                            </Col>
                                        </Row> */}

                                        <Row className="sf-btn-footer no-gutters justify-content-between">
                                            <div className="col-md-12 bluefooter-butn text-right">
                                                <div className="">
                                                    {/* <input
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
                                                    /> */}
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
                        </div> {this.state.isEditFlag ? 'Update' : 'Save'}
                                                    </button>
                                                </div>
                                            </div>
                                        </Row>
                                    </form>
                                </div>
                            </div>}
                    </div>
                </div>
                <VendorListing
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
function mapStateToProps({ comman, supplier }) {
    const { countryList, stateList, cityList, plantList } = comman;
    const { supplierData, vendorTypeList } = supplier;
    let initialValues = {};
    if (supplierData && supplierData !== undefined) {
        initialValues = {
            VendorName: supplierData.VendorName,
            VendorCode: supplierData.VendorCode,
            Email: supplierData.Email,
            AddressLine1: supplierData.AddressLine1,
            AddressLine2: supplierData.AddressLine2,
            ZipCode: supplierData.ZipCode,
            PhoneNumber: supplierData.PhoneNumber,
            MobileNumber: supplierData.MobileNumber,
            Extension: supplierData.Extension,
        }
    }
    return { countryList, stateList, cityList, plantList, initialValues, supplierData, vendorTypeList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createSupplierAPI,
    updateSupplierAPI,
    getSupplierByIdAPI,
    getRadioButtonSupplierType,
    fetchCountryDataAPI,
    fetchStateDataAPI,
    fetchCityDataAPI,
    getVendorTypesSelectList,
})(reduxForm({
    form: 'AddSupplier',
    enableReinitialize: true,
})(AddSupplier));
