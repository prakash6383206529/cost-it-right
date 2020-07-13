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
import Drawer from '@material-ui/core/Drawer';

class AddVendorDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedVendorType: [],
            selectedPlants: [],
            plantsArray: [],

            country: [],
            state: [],
            city: [],

            isOpenFuel: false,
            isOpenPlant: false,
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
        const { supplierId, isEditFlag } = this.props;

        if (isEditFlag) {

        } else {

        }
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };

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
    * @method handleCityChange
    * @description  used to handle city selection
    */
    handleCityChange = (e) => {
        this.setState({
            CityId: e.target.value
        });
    }

    /**
    * @method countryHandler
    * @description Used to handle country
    */
    countryHandler = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ country: newValue, state: [], city: [], }, () => {
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
            this.setState({ state: newValue, city: [], }, () => {
                const { state } = this.state;
                this.props.fetchCityDataAPI(state.value, () => { })
            });
        } else {
            this.setState({ state: [], city: [], });
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
    * @method checkVendorType
    * @description Used to render listing of selected plants
    */
    checkVendorType = () => {
        const { selectedVendorType } = this.state;
        let isContent = selectedVendorType && selectedVendorType.find(item => {
            if (item.Text == 'BOP' || item.Text == 'RAW MATERIAL') {
                return true;
            }
            return false;
        })
        //console.log('isContent', isContent)
        return (isContent == null || isContent == undefined) ? true : false;
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.toggleDrawer('')
        //this.props.getRMSpecificationDataAPI('', res => { });
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { selectedVendorType, selectedPlants, plantsArray, country, state, city, } = this.state;
        const { vendorTypeList } = this.props;
        let loginUserId = loggedInUserId();

        let vendorArray = [];
        selectedVendorType && selectedVendorType.map((item) => {
            vendorArray.push({ VendorType: item.Text, VendorTypeId: item.Value })
            return vendorArray;
        })

        /** Update existing detail of supplier master **/
        if (this.props.isEditFlag) {
            const { supplierId } = this.props;
            let formData = {
                VendorId: '',
                VendorCode: values.VendorCode,
                Email: values.Email,
                AddressId: '',
                AddressLine1: values.AddressLine1,
                AddressLine2: values.AddressLine2,
                ZipCode: values.ZipCode,
                PhoneNumber: values.PhoneNumber,
                Extension: '',
                LoggedInUserId: loggedInUserId(),
                AddedPlants: [],
                RemovePlants: [],
            }
            this.setState({ isSubmitted: true });
            this.props.updateSupplierAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_SUPPLIER_SUCESS);
                    this.toggleDrawer('')
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
            console.log('formData', formData)
            this.props.createSupplierAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.SUPPLIER_ADDED_SUCCESS);
                    this.toggleDrawer('')
                }
            });
        }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset } = this.props;
        //console.log('sssssssssssss', this.checkVendorType())
        return (
            <div>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container>
                        <div className={'drawer-wrapper'}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={'header-wrapper left'}>
                                            <h3>{isEditFlag ? 'Update Vendor' : 'Add Vendor'}</h3>
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
                                            disabled={false}
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
                                            name="MobileNumber"
                                            label="MobileNumber"
                                            type="text"
                                            placeholder={''}
                                            component={renderText}
                                            isDisabled={false}
                                            validate={[number, minLength7]}
                                            //required={true}
                                            maxLength={70}
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
                                            validate={[required]}
                                            component={renderText}
                                            required={true}
                                            maxLength={26}
                                            className=" "
                                            customClassName=" withBorder"
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            label="Zip Code"
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
                                {/* {this.checkVendorType() &&
                                    <Row>
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
                                    </Row>} */}

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
                                                value={isEditFlag ? 'Update' : 'Save'}
                                                className="submit-button mr5 save-btn"
                                            />
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
    form: 'AddVendorDrawer',
    enableReinitialize: true,
})(AddVendorDrawer));
