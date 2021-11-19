import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import {
    required, upper, email, minLength7, maxLength70, maxLength80, maxLength3, acceptAllExceptSingleSpecialCharacter,
    maxLength15, postiveNumber, maxLength10, maxLength6, checkWhiteSpaces
} from "../../../helper/validation";
import { renderText, renderEmailInputField, renderMultiSelectField, searchableSelect } from "../../layout/FormInputs";
import { createSupplierAPI, updateSupplierAPI, getSupplierByIdAPI, getRadioButtonSupplierType, getVendorTypesSelectList, } from '../actions/Supplier';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, getVendorPlantSelectList, getAllCities, getCityByCountry, } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import AddVendorPlantDrawer from './AddVendorPlantDrawer';
import LoaderCustom from '../../common/LoaderCustom';
import saveImg from '../../../assests/images/check.png'
import cancelImg from '../../../assests/images/times.png'

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
            DropdownChanged: true
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    UNSAFE_componentWillMount() {
        this.props.getVendorTypesSelectList()
        this.props.getVendorPlantSelectList(() => { })
        this.props.fetchCountryDataAPI(() => { })
        this.props.fetchStateDataAPI(0, () => { })
        this.props.fetchCityDataAPI(0, () => { })
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        this.props.getSupplierByIdAPI('', false, () => { })
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

        const { supplierData, isEditFlag } = this.props;
        if (isEditFlag) {

            //DefaultIds Get in Edit Mode.
            let DefaultVendorTypeIds = [];
            supplierData && supplierData.VendorTypes && supplierData.VendorTypes.map((item, index) => {
                DefaultVendorTypeIds.push(item.VendorTypeId)
                return null;
            })

            //Selected Vendor Type IDs.
            let SelectedVendorTypeIds = [];
            e && e.map((item, index) => {
                SelectedVendorTypeIds.push(Number(item.Value))
                return null;
            })

            //Removed Vendor Type Id's
            let removedVendorTypeIds = DefaultVendorTypeIds.filter(x => !SelectedVendorTypeIds.includes(x));

            if (removedVendorTypeIds.length === 0) {
                this.setState({ selectedVendorType: e });
            } else {
                Toaster.warning("You can not remove existing Vendor Type.");
                return false;
            }

        } else {
            this.setState({ selectedVendorType: e });
        }
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
        const { isEditFlag, ID } = this.props;
        if (isEditFlag) {
            this.setState({
                isLoader: true,
                isEditFlag: true,
                VendorId: ID,
                isVisible: true
            })
            this.props.getSupplierByIdAPI(ID, isEditFlag, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    let tempArr = [];
                    let tempVendorPlant = [];
                    this.props.fetchStateDataAPI(Data.CountryId, () => { })
                    this.props.fetchCityDataAPI(Data.StateId, () => { })
                    this.setState({ DataToCheck: Data })
                    Data && Data.VendorTypes.map((item) => {
                        tempArr.push({ Text: item.VendorType, Value: (item.VendorTypeId).toString() })
                        return null;
                    })

                    Data && Data.VendorPlants && Data.VendorPlants.map((item) => {
                        tempVendorPlant.push({ Text: item.PlantName, Value: item.PlantId })
                        return null;
                    })

                    setTimeout(() => {
                        const { countryList, stateList, cityList } = this.props;

                        const CountryObj = countryList && countryList.find(item => Number(item.Value) === Data.CountryId)
                        const StateObj = stateList && stateList.find(item => Number(item.Value) === Data.StateId)
                        const CityObj = cityList && cityList.find(item => Number(item.Value) === Data.CityId)

                        this.setState({
                            isEditFlag: true,
                            // isLoader: false,
                            selectedVendorType: tempArr,
                            country: CountryObj && CountryObj !== undefined ? { label: CountryObj.Text, value: CountryObj.Value } : [],
                            state: StateObj && StateObj !== undefined ? { label: StateObj.Text, value: StateObj.Value } : [],
                            city: CityObj && CityObj !== undefined ? { label: CityObj.Text, value: CityObj.Value } : [],
                            existedVendorPlants: tempVendorPlant,
                            selectedVendorPlants: tempVendorPlant,
                        }, () => this.setState({ isLoader: false }))
                    }, 1000)

                }
            })
        }
    }

    toggleDrawer = (event, formData) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('', formData)
    };

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = (formData = {}) => {
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
        this.toggleDrawer('', formData)
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { selectedVendorType, selectedVendorPlants, existedVendorPlants, city, VendorId, DropdownChanged, DataToCheck } = this.state;
        const { supplierData, vendorPlantSelectList } = this.props;


        let vendorArray = [];
        selectedVendorType && selectedVendorType.map((item) => {
            vendorArray.push({ VendorType: item.Text, VendorTypeId: item.Value })
            return vendorArray;
        })

        //Vendor Plants Array
        let VendorPlantsArray = [];
        vendorPlantSelectList && vendorPlantSelectList.map((item, index) => {
            VendorPlantsArray.push(item.Value)
            return null;
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

        //Additonal Vendor Plant Id's
        let AdditonalPlants = SelectedVendorPlantIds.filter(x => !DefaultVendorPlantIds.includes(x));

        //Removed Vendor Plant Id's
        let removedVendorPlants = DefaultVendorPlantIds.filter(x => !SelectedVendorPlantIds.includes(x));

        let vendorPlantArray = [];
        selectedVendorPlants && selectedVendorPlants.map((item) => {
            vendorPlantArray.push({ VendorType: item.Text, VendorTypeId: item.Value })
            return vendorPlantArray;
        })

        /** Update existing detail of supplier master **/
        if (this.state.isEditFlag) {

            if (DropdownChanged && DataToCheck.Email == values.Email && DataToCheck.PhoneNumber == values.PhoneNumber &&
                DataToCheck.Extension == values.Extension && DataToCheck.MobileNumber == values.MobileNumber &&
                DataToCheck.ZipCode == values.ZipCode && DataToCheck.AddressLine1 == values.AddressLine1 &&
                DataToCheck.AddressLine2 == values.AddressLine2) {

                this.toggleDrawer('')
                return false
            }

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
                AddedVendorPlants: AdditonalPlants,
                RemoveVendorPlants: removedVendorPlants,
                VendorTypes: vendorArray,
            }
            this.props.reset()
            this.props.updateSupplierAPI(formData, (res) => {
                if (res.data.Result) {
                    Toaster.success(MESSAGES.UPDATE_SUPPLIER_SUCESS);
                    this.cancel(formData)
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
                VendorPlants: vendorPlantArray,
                UserId: loggedInUserId(),
                AddressLine1: values.AddressLine1 ? values.AddressLine1.trim() : values.AddressLine1,
                AddressLine2: values.AddressLine2 ? values.AddressLine2.trim() : values.AddressLine2,
                ZipCode: values.ZipCode,
                PhoneNumber: values.PhoneNumber,
                Extension: values.Extension,
                CityId: city.value,
            }
            this.props.reset()
            this.props.createSupplierAPI(formData, (res) => {
                if (res.data.Result) {
                    Toaster.success(MESSAGES.SUPPLIER_ADDED_SUCCESS);
                    this.cancel(formData);
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
        const { handleSubmit, isEditFlag, isVisible } = this.props;
        const { country, isOpenVendorPlant } = this.state;
        return (
            <div>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    {this.state.isLoader && <LoaderCustom />}
                    <Container >
                        <div className={`drawer-wrapper WIDTH-700 drawer-700px`}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
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
                                <Row className="pl-3">
                                    <Col md="6 multiselect-section">
                                        <Field
                                            label="Vendor Type"
                                            name="VendorType"
                                            placeholder="Select"
                                            selection={(this.state.selectedVendorType == null || this.state.selectedVendorType.length === 0) ? [] : this.state.selectedVendorType}
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
                                            validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces]}
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
                                            placeholder={''}
                                            validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength15, checkWhiteSpaces]}
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
                                            //placeholder={'email@domain.com/co.us'}
                                            validate={[email, minLength7, maxLength70]}
                                            component={renderEmailInputField}
                                            required={false}
                                            customClassName={'withBorder '}
                                            className=" "

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
                                                    placeholder={''}
                                                    validate={[postiveNumber, maxLength10, checkWhiteSpaces]}
                                                    component={renderText}
                                                    //required={true}
                                                    maxLength={12}
                                                    customClassName={'withBorder'}
                                                />
                                            </Col>
                                            <Col md={4} className="pr-0">
                                                <Field
                                                    label="Ext."
                                                    name={"Extension"}
                                                    type="text"
                                                    placeholder={'Ext'}
                                                    validate={[postiveNumber, maxLength3, checkWhiteSpaces]}
                                                    component={renderText}
                                                    //required={true}
                                                    // maxLength={5}
                                                    customClassName={'withBorder'}
                                                /></Col>
                                        </Row>
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            name="MobileNumber"
                                            label="Mobile Number"
                                            type="text"
                                            placeholder={''}
                                            component={renderText}
                                            isDisabled={false}
                                            validate={[postiveNumber, maxLength10, checkWhiteSpaces]}
                                            // required={true}
                                            maxLength={12}
                                            customClassName={'withBorder'}
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
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
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
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
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
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
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
                                            placeholder={''}
                                            validate={[required, postiveNumber, maxLength6]}
                                            component={renderText}
                                            required={true}
                                            maxLength={26}
                                            className=" "
                                            customClassName=" withBorder"
                                        />
                                    </Col>
                                </Row>
                                <Row className="pl-3">
                                    <Col md="6">
                                        <Field
                                            label="Address 1"
                                            name={"AddressLine1"}
                                            type="text"
                                            placeholder={''}
                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength80]}
                                            component={renderText}
                                            //  required={true}
                                            maxLength={26}
                                            className=" "
                                            customClassName=" withBorder"
                                        />
                                    </Col>
                                    <Col md="6">
                                        <Field
                                            label="Address 2"
                                            name={"AddressLine2"}
                                            type="text"
                                            placeholder={''}
                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength80]}
                                            component={renderText}
                                            //required={true}
                                            maxLength={26}
                                            className=" "
                                            customClassName=" withBorder"
                                        />
                                    </Col>
                                </Row>

                                {/*  <Row className="pl-3"> 
                                  
                                    {this.checkVendorSelection() && checkVendorPlantConfigurable() && this.props.isEditFlag &&
                                        <>
                                            <Col md="12">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label="Vendor Plant"
                                                            name="SelectedPlants"
                                                            placeholder="--Select Plant--"
                                                            selection={this.state.selectedVendorPlants}
                                                            options={this.renderListing('vendorPlants')}
                                                            selectionChanged={this.handleVendorPlant}
                                                            optionValue={option => option.Value}
                                                            optionLabel={option => option.Text}
                                                            component={renderMultiSelectField}
                                                            mendatory={false}

                                                            className="multiselect-with-border"
                                                        />
                                                    </div>
                                                    {this.props.isEditFlag &&
                                                        <div
                                                            onClick={this.vendorPlantToggler}
                                                            className={'plus-icon-square mr30 right'}>
                                                        </div>}
                                                </div>
                                            </Col>
                                        </>}
                                </Row> */}
                                <Row className="sf-btn-footer no-gutters justify-content-between px-3 mb-3">
                                    <div className="col-sm-12 text-right px-3">
                                        <button
                                            type={'button'}
                                            disabled={this.state.isLoader}
                                            className=" mr15 cancel-btn"
                                            onClick={this.cancel} >
                                            <div className={'cancel-icon'}></div> {'Cancel'}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={this.state.isLoader}
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
    fetchCountryDataAPI,
    fetchStateDataAPI,
    fetchCityDataAPI,
    getAllCities,
    getCityByCountry,
    getVendorTypesSelectList,
    getVendorPlantSelectList,
})(reduxForm({
    form: 'AddVendorDrawer',
    enableReinitialize: true,
    touchOnChange: true
})(AddVendorDrawer));
