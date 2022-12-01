import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import {
    required, upper, email, minLength7, maxLength70, maxLength80, minLength10, maxLength71, maxLength5, maxLength12, alphaNumeric, acceptAllExceptSingleSpecialCharacter,
    postiveNumber, maxLength6, checkWhiteSpaces, checkSpacesInString
} from "../../../helper/validation";
import { renderText, renderEmailInputField, renderMultiSelectField, searchableSelect, renderNumberInputField, focusOnError } from "../../layout/FormInputs";
import { createSupplierAPI, updateSupplierAPI, getSupplierByIdAPI, getRadioButtonSupplierType, getVendorTypesSelectList, } from '../actions/Supplier';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, getVendorPlantSelectList, getAllCities, getCityByCountry, } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import AddVendorPlantDrawer from './AddVendorPlantDrawer';
import LoaderCustom from '../../common/LoaderCustom';
import { debounce } from 'lodash';
import { showDataOnHover } from '../../../helper';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';

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
            isOpenVendorPlant: false,
            VendorId: '',
            isVisible: false,
            vendor: '',
            DataToCheck: [],
            DropdownChanged: true,
            isViewMode: this.props?.isViewMode ? true : false,
            setDisable: false,
            showPopup: false
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    UNSAFE_componentWillMount() {
        if (!this.props.isViewMode) {
            this.props.getVendorTypesSelectList(() => { })
        }
        if (!(this.props.isEditFlag || this.props.isViewMode)) {
            this.props.getVendorPlantSelectList(() => { })
            this.props.fetchCountryDataAPI(() => { })
            this.props.fetchStateDataAPI(0, () => { })
            this.props.fetchCityDataAPI(0, () => { })
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        if (!(this.props.isEditFlag || this.props.isViewFlag)) {
            this.props.getSupplierByIdAPI('', false, () => { })
        }
        this.getDetail()
    }

    /**
    * @method handleVendorPlant
    * @description called
    */
    handleVendorPlant = e => {
        this.setState({ selectedVendorPlants: e });
    };

    /**
    * @method handleVendorType
    * @description called
    */
    handleVendorType = (e) => {
        this.setState({ selectedVendorType: e });
        this.setState({ DropdownChanged: false })
    };

    checkVendorSelection = () => {
        const { selectedVendorType } = this.state;
        let isContent = selectedVendorType && selectedVendorType.find(item => {
            if (item.Text === 'VBC' || item.Text === 'BOP' || item.Text === 'RAW MATERIAL') {
                return true;
            }
            return false;
        })
        return (isContent && isContent.Text) ? true : false;
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
        this.setState({ DropdownChanged: false })
    };

    /**
    * @method stateHandler
    * @description Used to handle state
    */
    stateHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
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
        if (newValue && newValue !== '') {
            this.setState({ city: newValue });
        } else {
            this.setState({ city: [] });
        }
        this.setState({ DropdownChanged: false })
    };

    vendorPlantToggler = () => {
        this.setState({ isOpenVendorPlant: true })
    }

    closeVendorDrawer = (e = '') => {
        this.setState({ isOpenVendorPlant: false }, () => {
            this.getDetail()
            this.props.getVendorPlantSelectList(() => { })
        })
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { countryList, stateList, cityList, vendorTypeList, vendorPlantSelectList, IsVendor } = this.props;
        const temp = [];
        if (label === 'country') {
            countryList && countryList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'state') {
            stateList && stateList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'city') {
            cityList && cityList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'vendorType') {
            const { isRM } = this.props

            vendorTypeList && vendorTypeList.map((item, i) => {
                if (item.Value === '0') return false;
                if (isRM === true && IsVendor === false) {
                    if (item.Text === 'RAW MATERIAL') {
                        temp.push({ Text: item.Text, Value: item.Value })
                    } else {
                        return null
                    }
                }
                else if (IsVendor === true) {
                    if (item.Text === 'PART') {
                        temp.push({ Text: item.Text, Value: item.Value })
                    }
                }
                else {
                    temp.push({ Text: item.Text, Value: item.Value })
                }
                return null;
            });
            return temp;
        }
        if (label === 'vendorPlants') {
            vendorPlantSelectList && vendorPlantSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
                return null;
            });
            return temp;
        }
    }

    /**
    * @method getDetail
    * @description used to get user detail
    */
    getDetail = () => {
        const { isEditFlag, ID, } = this.props;
        if (isEditFlag) {
            this.setState({
                isLoader: true,
                isEditFlag: true,
                VendorId: ID,
                isVisible: true,

            })
            this.props.getSupplierByIdAPI(ID, isEditFlag, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    let tempArr = [];
                    this.setState({ DataToCheck: Data })
                    Data && Data.VendorTypes.map((item) => {
                        tempArr.push({ Text: item.VendorType, Value: (item.VendorTypeId).toString() })
                        return null;
                    })

                    setTimeout(() => {
                        this.setState({
                            isEditFlag: true,
                            // isLoader: false,
                            selectedVendorType: tempArr,
                            country: Data.Country !== undefined ? { label: Data.Country, value: Data.CountryId } : [],
                            state: Data.State !== undefined ? { label: Data.State, value: Data.StateId } : [],
                            city: Data.City !== undefined ? { label: Data.City, value: Data.CityId } : [],
                        }, () => this.setState({ isLoader: false }))
                    }, 1000)

                }
            })
        }
    }

    toggleDrawer = (event, formData, type) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('', formData, type)
    };

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = (formData = {}, type) => {
        const { reset } = this.props;
        reset();
        this.setState({
            selectedVendorType: [],
            selectedVendorPlants: [],
            plantsArray: [],
            country: [],
            state: [],
            city: [],
            isEditFlag: false,
        })
        this.props.getSupplierByIdAPI('', false, () => { })
        this.toggleDrawer('', formData, type)
    }
    cancelHandler = () => {
        this.setState({ showPopup: true })
    }
    onPopupConfirm = () => {
        this.cancel('submit')
        this.setState({ showPopup: false })
    }
    closePopUp = () => {
        this.setState({ showPopup: false })
    }
    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = debounce((values) => {
        const { selectedVendorType, selectedVendorPlants, existedVendorPlants, city, VendorId, DropdownChanged, DataToCheck } = this.state;
        const { supplierData } = this.props;


        let vendorArray = [];
        selectedVendorType && selectedVendorType.map((item) => {
            vendorArray.push({ VendorType: item.Text, VendorTypeId: item.Value })
            return vendorArray;
        })

        //DefaultIds Get in Edit Mode.
        let DefaultVendorPlantIds = [];
        existedVendorPlants && existedVendorPlants.map((item, index) => {
            DefaultVendorPlantIds.push(item.Value)
            return null;
        })

        //Selected Vendor Plant IDs.
        let SelectedVendorPlantIds = [];
        selectedVendorPlants && selectedVendorPlants.map((item, index) => {
            SelectedVendorPlantIds.push(item.Value)
            return null;
        })

        /** Update existing detail of supplier master **/
        if (this.state.isEditFlag) {

            if (DropdownChanged && DataToCheck.Email === values.Email && DataToCheck.PhoneNumber === values.PhoneNumber &&
                DataToCheck.Extension === values.Extension && DataToCheck.MobileNumber === values.MobileNumber &&
                DataToCheck.ZipCode === values.ZipCode && DataToCheck.AddressLine1 === values.AddressLine1 &&
                DataToCheck.AddressLine2 === values.AddressLine2) {

                this.toggleDrawer('', '', 'cancel')
                return false
            }
            this.setState({ setDisable: true })
            let formData = {
                VendorId: VendorId,
                VendorCode: values.VendorCode,
                Email: values.Email,
                AddressId: supplierData.AddressId,
                AddressLine1: values.AddressLine1 ? values.AddressLine1.trim() : values.AddressLine1,
                AddressLine2: values.AddressLine2 ? values.AddressLine2.trim() : values.AddressLine2,
                ZipCode: values.ZipCode,
                PhoneNumber: values.PhoneNumber,
                MobileNumber: values.MobileNumber,
                Extension: values.Extension,
                LoggedInUserId: loggedInUserId(),
                VendorTypes: vendorArray,
            }
            this.props.reset()
            this.props.updateSupplierAPI(formData, (res) => {
                this.setState({ setDisable: false })
                if (res?.data?.Result) {
                    Toaster.success(MESSAGES.UPDATE_SUPPLIER_SUCESS);
                    this.cancel(formData, 'submit')
                }
            });
        } else {/** Add new detail for creating supplier master **/
            this.setState({ setDisable: true })
            let formData = {
                VendorName: values.VendorName,
                VendorCode: values.VendorCode,
                Email: values.Email,
                MobileNumber: values.MobileNumber,
                IsActive: true,
                LoggedInUserId: loggedInUserId(),
                VendorTypes: vendorArray,
                UserId: loggedInUserId(),
                AddressLine1: values.AddressLine1 ? values.AddressLine1.trim() : values.AddressLine1,
                AddressLine2: values.AddressLine2 ? values.AddressLine2.trim() : values.AddressLine2,
                ZipCode: values.ZipCode,
                PhoneNumber: values.PhoneNumber,
                Extension: values.Extension,
                CityId: city.value,
                VendorId: VendorId,
            }
            this.props.reset()
            this.props.createSupplierAPI(formData, (res) => {
                this.setState({ setDisable: false })
                if (res?.data?.Result) {
                    Toaster.success(MESSAGES.SUPPLIER_ADDED_SUCCESS);
                    formData.VendorId = res.data.Identity
                    this.cancel(formData, 'submit');
                }
            })
        }
    }, 500)


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
        const { handleSubmit, isEditFlag } = this.props;
        const { country, isOpenVendorPlant, isViewMode, setDisable } = this.state;
        return (
            <div>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen}
                >
                    {this.state.isLoader && <LoaderCustom customClass={`${isEditFlag ? 'update-vendor-loader' : ''}`} />}
                    <Container >
                        <div className={`drawer-wrapper drawer-700px`}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={'header-wrapper left'}>
                                            <h3>{isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Vendor</h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e, '', 'cancel')}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="pl-3">
                                    <Col md="6 multiselect-section">
                                        <Field
                                            label="Vendor Type"
                                            name="VendorType"
                                            placeholder="Select"
                                            title={showDataOnHover(this.state.selectedVendorType)}
                                            selection={(this.state.selectedVendorType == null || this.state.selectedVendorType.length === 0) ? [] : this.state.selectedVendorType}
                                            options={this.renderListing('vendorType')}
                                            validate={(this.state.selectedVendorType == null || this.state.selectedVendorType.length === 0) ? [required] : []}
                                            selectionChanged={this.handleVendorType}
                                            optionValue={option => option.Value}
                                            optionLabel={option => option.Text}
                                            component={renderMultiSelectField}
                                            mendatory={true}
                                            className="multiselect-with-border"
                                            disabled={isViewMode}
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            label={`Vendor Name`}
                                            name={"VendorName"}
                                            type="text"
                                            placeholder={this.state.isEditFlag ? '-' : 'Enter'}
                                            validate={[required, maxLength71, checkWhiteSpaces, checkSpacesInString]}
                                            component={renderText}
                                            required={true}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={this.state.isEditFlag ? true : false}
                                        />
                                    </Col>
                                </Row>
                                <Row className="pl-3">
                                    <Col md="6">
                                        <Field
                                            label={`Vendor Code`}
                                            name={"VendorCode"}
                                            type="text"
                                            placeholder={this.state.isEditFlag ? '-' : 'Enter'}
                                            validate={[required, alphaNumeric, maxLength71, checkWhiteSpaces, checkSpacesInString]}
                                            component={renderText}
                                            required={true}
                                            normalize={upper}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={this.state.isEditFlag ? true : false}
                                        />
                                    </Col>

                                    <Col md="6" className="email-input">
                                        <Field
                                            label={`Email Id`}
                                            name={"Email"}
                                            type="email"
                                            placeholder={isViewMode ? '-' : 'Enter'}
                                            validate={[email, minLength7, maxLength70]}
                                            component={renderEmailInputField}
                                            required={false}
                                            customClassName={'withBorder '}
                                            className=" "
                                            isDisabled={isViewMode}

                                        />
                                    </Col>
                                </Row>
                                <Row className="pl-3">
                                    <Col md="6">
                                        <Row>
                                            <Col md={8}>
                                                <Field
                                                    label="Phone Number"
                                                    name={"PhoneNumber"}
                                                    type="text"
                                                    placeholder={isViewMode ? '-' : 'Enter'}
                                                    validate={[postiveNumber, minLength10, maxLength12, checkWhiteSpaces]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    maxLength={12}
                                                    customClassName={'withBorder'}
                                                    disabled={isViewMode}
                                                />
                                            </Col>
                                            <Col md={4} className="pr-0">
                                                <Field
                                                    label="Ext."
                                                    name={"Extension"}
                                                    type="text"
                                                    placeholder={isViewMode ? '-' : 'Ext'}
                                                    validate={[postiveNumber, maxLength5, checkWhiteSpaces]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    // maxLength={5}
                                                    customClassName={'withBorder'}
                                                    disabled={isViewMode}
                                                /></Col>
                                        </Row>
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            name="MobileNumber"
                                            label="Mobile Number"
                                            type="text"
                                            placeholder={isViewMode ? '-' : 'Enter'}
                                            component={renderNumberInputField}
                                            isDisabled={false}
                                            validate={[postiveNumber, minLength10, maxLength12, checkWhiteSpaces]}
                                            maxLength={12}
                                            customClassName={'withBorder'}
                                            disabled={isViewMode}
                                        />
                                    </Col>

                                    <Col md="6">
                                        <div className="form-group inputbox withBorder ">
                                            <Field
                                                name="CountryId"
                                                type="text"
                                                label="Country"
                                                component={searchableSelect}
                                                placeholder={'Select'}
                                                options={this.renderListing('country')}
                                                validate={(this.state.country == null || this.state.country.length === 0) ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.countryHandler}
                                                valueDescription={this.state.country}
                                                disabled={this.state.isEditFlag ? true : false}
                                            />
                                        </div>
                                    </Col>
                                    {(country.length === 0 || country.label === 'India') &&
                                        <Col md="6">
                                            <div className="form-group inputbox withBorder ">
                                                <Field
                                                    name="StateId"
                                                    type="text"
                                                    label="State"
                                                    component={searchableSelect}
                                                    placeholder={'Select'}
                                                    options={this.renderListing('state')}
                                                    validate={(this.state.state == null || this.state.state.length === 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.stateHandler}
                                                    valueDescription={this.state.state}
                                                    disabled={this.state.isEditFlag ? true : false}
                                                />
                                            </div>
                                        </Col>}
                                    <Col md="6">
                                        <div className="form-group inputbox withBorder ">
                                            <Field
                                                name="CityId"
                                                type="text"
                                                label="City"
                                                component={searchableSelect}
                                                placeholder={'Select'}
                                                options={this.renderListing('city')}
                                                validate={(this.state.city == null || this.state.city.length === 0) ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.cityHandler}
                                                valueDescription={this.state.city}
                                                disabled={this.state.isEditFlag ? true : false}
                                            />
                                        </div>
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            label="ZipCode"
                                            name={"ZipCode"}
                                            type="text"
                                            placeholder={isViewMode ? '-' : 'Enter'}
                                            validate={[required, postiveNumber, maxLength6]}
                                            component={renderNumberInputField}
                                            required={true}
                                            maxLength={26}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={isViewMode}
                                        />
                                    </Col>
                                </Row>
                                <Row className="pl-3">
                                    <Col md="6">
                                        <Field
                                            label="Address 1"
                                            name={"AddressLine1"}
                                            type="text"
                                            placeholder={isViewMode ? '-' : 'Enter'}
                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength80]}
                                            component={renderText}
                                            //  required={true}
                                            maxLength={26}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={isViewMode}
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            label="Address 2"
                                            name={"AddressLine2"}
                                            type="text"
                                            placeholder={isViewMode ? '-' : 'Enter'}
                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength80]}
                                            component={renderText}
                                            //required={true}
                                            maxLength={26}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={isViewMode}
                                        />
                                    </Col>
                                </Row>


                                <Row className="sf-btn-footer no-gutters justify-content-between px-3 mb-3">
                                    <div className="col-sm-12 text-right px-3">
                                        <button
                                            type={'button'}
                                            disabled={this.state.isLoader || setDisable}
                                            className=" mr15 cancel-btn"
                                            onClick={this.cancelHandler} >
                                            <div className={'cancel-icon'}></div> {'Cancel'}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={this.state.isLoader || isViewMode || setDisable ? true : false}
                                            className="user-btn save-btn">
                                            <div className={"save-icon"}></div>
                                            {isEditFlag ? 'Update' : 'Save'}
                                        </button>
                                    </div>
                                </Row>
                            </form>

                        </div>
                    </Container>
                </Drawer>
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
                }
                {isOpenVendorPlant && <AddVendorPlantDrawer
                    isOpen={isOpenVendorPlant}
                    closeDrawer={this.closeVendorDrawer}
                    isEditFlag={false}
                    VendorId={this.state.VendorId}
                    ID={''}
                    anchor={'right'}
                />}
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
    const { countryList, stateList, cityList, plantList, vendorPlantSelectList, } = comman;
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
    return {
        countryList, stateList, cityList, plantList, initialValues, supplierData, vendorTypeList,
        vendorPlantSelectList,
    }
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
    getAllCities,
    fetchCountryDataAPI,
    fetchStateDataAPI,
    fetchCityDataAPI,
    getCityByCountry,
    getVendorTypesSelectList,
    getVendorPlantSelectList,
})(reduxForm({
    form: 'AddVendorDrawer',
    enableReinitialize: true,
    touchOnChange: true,
    onSubmitFail: (errors) => {
        focusOnError(errors)
    },
})(AddVendorDrawer));
