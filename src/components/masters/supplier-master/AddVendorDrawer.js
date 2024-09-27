import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Table, } from 'reactstrap';
import {
    required, upper, email, minLength7, maxLength70, maxLength80, minLength10, maxLength71, maxLength5, maxLength12, alphaNumeric, acceptAllExceptSingleSpecialCharacter,
    postiveNumber, maxLength6, checkWhiteSpaces, checkSpacesInString, number, hashValidation, getNameBySplitting, getCodeBySplitting
} from "../../../helper/validation";
import { renderText, renderEmailInputField, renderMultiSelectField, searchableSelect, focusOnError, renderTextInputField } from "../../layout/FormInputs";
import { createSupplierAPI, updateSupplierAPI, getSupplierByIdAPI, getRadioButtonSupplierType, getVendorTypesSelectList, } from '../actions/Supplier';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, getVendorPlantSelectList, getAllCities, getPlantSelectListByType, getCityByCountryAction } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import AddVendorPlantDrawer from './AddVendorPlantDrawer';
import LoaderCustom from '../../common/LoaderCustom';
import { debounce } from 'lodash';
import { showDataOnHover } from '../../../helper';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getCostingSpecificTechnology } from '../../costing/actions/Costing';
import { EMPTY_DATA, GUIDE_BUTTON_SHOW, ZBC } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import Button from '../../layout/Button';

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
            isLoader: false,
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
            showPopup: false,
            isCriticalVendor: false,
            Technology: [],
            technologyList: [],
            errorObj: {
                technology: false,
                plant: false,
            },
            technologyPlantGrid: [],
            isEditIndex: false,
            disablePlant: false
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    UNSAFE_componentWillMount() {
        const { initialConfiguration } = this.props
        if (!this.props.isViewMode) {
            this.props.getVendorTypesSelectList(() => { })
            if (initialConfiguration?.IsCriticalVendorConfigured) {
                this.props.getCostingSpecificTechnology(loggedInUserId(), (res) => {
                    let list = res?.data?.SelectList?.filter(element => element?.Value !== '0')
                    this.setState({ technologyList: list })
                })
                this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
            }
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
            this.props.getCityByCountryAction(country.value, '00000000000000000000000000000000','', () => { })
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
        const { selectedPlants, technologyPlantGrid } = this.state
        const { countryList, stateList, cityList, vendorTypeList, vendorPlantSelectList, IsVendor, costingSpecifiTechnology, plantSelectList } = this.props;
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
        if (label === 'technology') {
            const temp = [];

            costingSpecifiTechnology?.forEach((item) => {
                if (item?.Value === '0') {
                    temp.push({ Text: "Select All", Value: item?.Value });
                } else {
                    temp.push({ Text: item?.Text, Value: item?.Value });
                }
            });

            const isSelectAllOnly = temp.length === 1 && temp[0]?.Text === "Select All" && temp[0]?.Value === "0";

            if (isSelectAllOnly) {
                return [];
            } else {
                return temp;
            }
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.forEach(item => {
                if (item.PlantId === '0') return false;
                else if (
                    selectedPlants?.some(
                        item1 =>
                            item1?.PlantNameCode === item?.PlantNameCode &&
                            Number(item1?.PlantId) === Number(item?.PlantId)
                    ) ||
                    technologyPlantGrid.some(
                        gridItem => gridItem.PlantId === item?.PlantId
                    )
                ) {
                    // Skip adding the plant if it is already selected or present in the technologyPlantGrid
                } else {
                    temp.push({ Text: item.PlantNameCode, Value: item.PlantId });
                }
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
                    let technologyList = []
                    Data?.VendorTechnologies && Data?.VendorTechnologies?.map(item => {
                        let obj = {}
                        obj.Text = item?.TechnologyName
                        obj.Value = item?.TechnologyId
                        technologyList.push(obj)
                    })
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
                            Technology: technologyList,
                            isCriticalVendor: Data.IsCriticalVendor,
                            technologyPlantGrid: Data.VendorPlants
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
        // this.setState({ showPopup: true })
        this.cancel('')
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
        const { selectedVendorType, selectedVendorPlants, existedVendorPlants, city, VendorId, DropdownChanged, DataToCheck, isCriticalVendor, technologyPlantGrid } = this.state;
        const { supplierData } = this.props;
        if (isCriticalVendor && technologyPlantGrid && technologyPlantGrid.length === 0) {
            Toaster.warning('Table entry required.');
            return false;
        }

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
                DataToCheck.AddressLine2 === values.AddressLine2 && DataToCheck.IsCriticalVendor === isCriticalVendor && JSON.stringify(DataToCheck.VendorPlants) === JSON.stringify(technologyPlantGrid)) {

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
                IsCriticalVendor: isCriticalVendor,
                // VendorTechnologies: isCriticalVendor ? technologyList : [],
                VendorPlants: isCriticalVendor ? this.state.technologyPlantGrid : []
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
                IsCriticalVendor: isCriticalVendor,
                // VendorTechnologies: technologyList,
                VendorPlants: this.state.technologyPlantGrid

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

    criticalityHandleChange = () => {
        this.setState({ isCriticalVendor: !this.state.isCriticalVendor })
    }

    handleTechnologyChange = (newValue) => {
        const { technologyList } = this.state
        this.setState({ DropdownChanged: false })
        if (newValue?.filter(element => element?.Value === '0')?.length > 0) {
            this.setState({ Technology: technologyList, errorObj: { ...this.state.errorObj, technology: false } })
        } else {
            this.setState({ Technology: newValue, errorObj: { ...this.state.errorObj, technology: false } })
        }
    }
    /**
       * @method handlePlantChange
       * @description Used handle vendor plants
       */
    handlePlantChange = (newValue) => {
        this.setState({ DropdownChanged: false })
        this.setState({ selectedPlants: newValue, errorObj: { ...this.state.errorObj, plant: false } })
    }
    handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };
    tableHandler = () => {
        const { Technology, selectedPlants, technologyPlantGrid } = this.state;

        // Check if both Technology and selectedPlants are not selected
        if ((!Technology || Technology.length === 0) && (!selectedPlants || selectedPlants.length === 0)) {
            this.setState({
                errorObj: { technology: true, plant: true }
            });
            return; // Exit the function to prevent further execution
        }

        // Check if Technology is not selected
        if (!Technology || Technology.length === 0) {
            this.setState({ errorObj: { ...this.state.errorObj, technology: true } });
            return; // Exit the function to prevent further execution
        }

        // Check if selectedPlants are not selected
        if (!selectedPlants || selectedPlants.length === 0) {
            this.setState({ errorObj: { ...this.state.errorObj, plant: true } });
            return; // Exit the function to prevent further execution
        }
        let vendorArray = []
        Technology && Technology.map(item => {
            let obj = {
                TechnologyName: item.Text,
                TechnologyId: item.Value
            }
            vendorArray.push(obj)
        }
        )
        let array = []
        selectedPlants && selectedPlants.map(item => {
            let obj = {
                PlantId: item.Value,
                PlantName: getNameBySplitting(item.Text),
                PlantCode: getCodeBySplitting(item.Text),
                VendorTechnologies: vendorArray
            }
            array.push(obj)
        })



        // Add the new item to the technologyPlantGrid array
        const updatedGrid = [...technologyPlantGrid, ...array];

        // Update the state with the updated grid
        this.setState({
            technologyPlantGrid: updatedGrid,
            Technology: [],
            selectedPlants: [],
            errorObj: { technology: false, plant: false }
        });
    };
    tableReset = () => {
        this.setState({
            Technology: [],
            errorObj: [],
            selectedPlants: [],
            isEditIndex: false,
            disablePlant: false
        }, () => this.props.change('Technology', ''));
        this.props.change('SourceSupplierPlantId', '')
    }
    /**     
 * @method deleteItem
 * @description DELETE ROW ENTRY FROM TABLE 
 */
    deleteItem = (index) => {
        const { technologyPlantGrid } = this.state;

        let tempData = technologyPlantGrid.filter((item, i) => {
            if (i === index) {
                return false;
            }
            return true;
        });

        this.setState({
            technologyPlantGrid: tempData,
            Technology: [],
            selectedPlants: [],
            isEditIndex: false,
            disablePlant: false
        })
    }
    /**
* @method editItemDetails
* @description used to Reset form
*/
    editItemDetails = (index) => {
        const { technologyPlantGrid } = this.state;

        // Get the selected item from the grid
        const selectedGridItem = technologyPlantGrid[index];

        // Extract the necessary properties for editing
        const selectedPlants = [
            {
                Text: `${selectedGridItem?.PlantName} (${selectedGridItem?.PlantCode})` || '',
                Value: selectedGridItem?.PlantId || ''
            }
        ];
        const Technology = selectedGridItem?.VendorTechnologies?.map(({ TechnologyName, TechnologyId }) => ({
            Text: TechnologyName,
            Value: TechnologyId
        })) || [];

        // Set the selected technology and plants in the state
        this.setState({
            Technology,
            selectedPlants,
            selectedIndex: index, // Store the index of the selected item for updating
            isEditIndex: true,
            disablePlant: true,
            errorObj: {
                technology: false,
                plant: false
            }
        });
    };

    updateTable = () => {
        const { technologyPlantGrid, Technology, selectedPlants, selectedIndex } = this.state;

        // Check if both Technology and selectedPlants are not selected
        if ((!Technology || Technology.length === 0) && (!selectedPlants || selectedPlants.length === 0)) {
            this.setState({
                errorObj: { technology: true, plant: true }
            });
            return; // Exit the function to prevent further execution
        }

        // Check if Technology is not selected
        if (!Technology || Technology.length === 0) {
            this.setState({ errorObj: { ...this.state.errorObj, technology: true } });
            return; // Exit the function to prevent further execution
        }

        // Check if selectedPlants are not selected
        if (!selectedPlants || selectedPlants.length === 0) {
            this.setState({ errorObj: { ...this.state.errorObj, plant: true } });
            return; // Exit the function to prevent further execution
        }
        // Create a new item based on the selected technologies and plants
        const newItem = {
            PlantId: selectedPlants[0]?.Value || '',
            PlantName: getNameBySplitting(selectedPlants[0]?.Text),
            PlantCode: getCodeBySplitting(selectedPlants[0]?.Text),
            VendorTechnologies: Technology.map(({ Text, Value }) => ({
                VendorTechnologyId: '', // Add the missing property, or replace it with an appropriate value
                TechnologyName: Text,
                TechnologyId: Value
            }))
        };


        // Update the grid by replacing the existing item with the new item
        const updatedGrid = [...technologyPlantGrid];
        updatedGrid[selectedIndex] = newItem;

        // Clear the selected technology and plants after updating
        this.setState({
            technologyPlantGrid: updatedGrid,
            Technology: [],
            selectedPlants: [],
            selectedIndex: -1, // Reset the selectedIndex
            isEditIndex: false,
            disablePlant: false,
        });
    };

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, initialConfiguration, t } = this.props;
        const { country, isOpenVendorPlant, isViewMode, setDisable, isCriticalVendor } = this.state;
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
                                            <h3>{`${isViewMode ? "View" : isEditFlag ? "Update " : "Add "}${t('VendorLabel', { ns: 'MasterLabels', defaultValue: 'Vendor' })}`}

                                                {!isViewMode && <TourWrapper
                                                    buttonSpecificProp={{ id: "Add_Vendor_Drawer" }}
                                                    stepsSpecificProp={{
                                                        steps: Steps(t, { isEditFlag: isEditFlag }).VENDOR_FORM
                                                    }} />}
                                            </h3>
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
                                            label={t('VendorLabel', { ns: 'MasterLabels', defaultValue: 'Vendor' }) + " Type"}
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
                                            label={t('VendorLabel', { ns: 'MasterLabels', defaultValue: 'Vendor' }) + " Name"}
                                            name={"VendorName"}
                                            type="text"
                                            placeholder={this.state.isEditFlag ? '-' : 'Enter'}
                                            validate={[required, maxLength71, checkWhiteSpaces, checkSpacesInString, hashValidation]}
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
                                            label={t('VendorLabel', { ns: 'MasterLabels', defaultValue: 'Vendor' }) + " Code"}
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
                                            id='AddVendorDrawer_VendorEmail'
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
                                                    validate={[postiveNumber, minLength10, maxLength12, checkWhiteSpaces, number]}
                                                    component={renderTextInputField}
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
                                                    validate={[postiveNumber, maxLength5, checkWhiteSpaces, number]}
                                                    component={renderTextInputField}
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
                                            component={renderTextInputField}
                                            isDisabled={false}
                                            validate={[postiveNumber, minLength10, maxLength12, checkWhiteSpaces, number]}
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
                                            validate={[required, postiveNumber, maxLength6, number]}
                                            component={renderTextInputField}
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
                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength80, hashValidation]}
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
                                            validate={[acceptAllExceptSingleSpecialCharacter, maxLength80, hashValidation]}
                                            component={renderText}
                                            //required={true}
                                            maxLength={26}
                                            className=" "
                                            customClassName=" withBorder"
                                            disabled={isViewMode}
                                        />
                                    </Col>
                                </Row>
                                {initialConfiguration?.IsCriticalVendorConfigured && <Row className="pl-3">
                                    <Col md="6" className='mt-1'>
                                        <label
                                            className={`custom-checkbox`}
                                            onChange={this.criticalityHandleChange}
                                        >
                                            Potentiality
                                            <input
                                                type="checkbox"
                                                checked={isCriticalVendor}
                                                disabled={isViewMode ? true : false}
                                            />
                                            <span
                                                className=" before-box"
                                                checked={isCriticalVendor}
                                                onChange={this.criticalityHandleChange}
                                            />
                                        </label>
                                    </Col>
                                </Row>}
                                {initialConfiguration?.IsCriticalVendorConfigured && isCriticalVendor &&
                                    <>
                                        <Row className="pl-3">
                                            <Col md="4">
                                                <div className='vendor-drawer'>
                                                    <Field
                                                        label="Plant (Code)"
                                                        name="SourceSupplierPlantId"
                                                        placeholder={"Select"}
                                                        title={showDataOnHover(this.state.selectedPlants)}
                                                        selection={
                                                            this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
                                                        options={this.renderListing("plant")}
                                                        selectionChanged={this.handlePlantChange}
                                                        required={true}
                                                        optionValue={(option) => option.Value}
                                                        optionLabel={(option) => option.Text}
                                                        component={renderMultiSelectField}
                                                        mendatory={true}
                                                        disabled={isViewMode || this.state.disablePlant ? true : false}
                                                        className="multiselect-with-border"
                                                        vendorMaster={true}
                                                    />
                                                    {this.state.errorObj?.plant && <div className='text-help p-absolute bottom-7'>This field is required.</div>}
                                                </div>
                                            </Col>

                                            <Col md="4">
                                                <div className='vendor-drawer'>
                                                    <Field
                                                        label={t('TechnologyLabel', { ns: 'MasterLabels', defaultValue: 'Technology' })}
                                                        name="Technology"
                                                        placeholder={"Select"}
                                                        selection={this.state.Technology == null || this.state.Technology.length === 0 ? [] : this.state.Technology}
                                                        options={this.renderListing("technology")}
                                                        required={true}
                                                        selectionChanged={this.handleTechnologyChange}
                                                        optionValue={(option) => option.Value}
                                                        optionLabel={(option) => option.Text}
                                                        component={renderMultiSelectField}
                                                        mendatory={true}
                                                        disabled={isViewMode ? true : false}
                                                        className="multiselect-with-border"
                                                        vendorMaster={true}
                                                    />
                                                    {this.state.errorObj?.technology && <div className='text-help p-absolute bottom-7'>This field is required.</div>}
                                                </div>
                                            </Col>
                                            <Col md="4" className='pl-0 mb-2 d-flex align-items-center'>
                                                <div className='d-flex'>
                                                    {this.state.isEditIndex ?
                                                        <button
                                                            type="button"
                                                            disabled={this.state.isViewMode}
                                                            className={'btn btn-primary pull-left mr5'}
                                                            onClick={this.updateTable}
                                                        >Update</button>
                                                        :
                                                        <button
                                                            type="button"
                                                            className={`${isViewMode ? 'disabled-button user-btn' : 'user-btn'} pull-left mr5`}
                                                            disabled={isViewMode ? true : false}
                                                            onClick={this.tableHandler}
                                                        >
                                                            <div className={'plus'}></div>ADD</button>}
                                                    <button
                                                        type="button"
                                                        disabled={isViewMode ? true : false}
                                                        className={`${isViewMode ? 'disabled-button reset-btn' : 'reset-btn'} pull-left`}
                                                        onClick={this.tableReset}
                                                    >Reset</button>
                                                </div>
                                            </Col></Row>
                                        <Col md="12" className='px-2'>
                                            <Table className="table border" size="sm" >
                                                <thead>
                                                    <tr>
                                                        <th className='border'>{`Plant (Code)`}</th>
                                                        <th>{`${t('TechnologyLabel', { ns: 'MasterLabels', defaultValue: 'Technology' })}`}</th>
                                                        <th className='border text-right'>{`Action`}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        this.state.technologyPlantGrid &&
                                                        this.state.technologyPlantGrid.map((item, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td className='border'>{`${item.PlantName} (${item.PlantCode})`}</td>
                                                                    <td>{item.VendorTechnologies?.map(technologyItem => technologyItem.TechnologyName).join(', ')}</td>
                                                                    <td className='border'>
                                                                        <div className='d-flex justify-content-end'>
                                                                            <button title='Edit' className="Edit mr-1" type={'button'} disabled={isViewMode} onClick={() => this.editItemDetails(index)} />
                                                                            <button title='Delete' className="Delete mx-0" type={'button'} disabled={isViewMode} onClick={() => this.deleteItem(index)} />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                    <tr>
                                                        {this.state.technologyPlantGrid?.length === 0 && <td colSpan={"6"}>
                                                            <NoContentFound title={EMPTY_DATA} />
                                                        </td>}
                                                    </tr>
                                                </tbody>
                                            </Table>

                                        </Col>
                                    </>
                                }
                                <Row className="sf-btn-footer no-gutters justify-content-between px-3 mb-3">
                                    <div className="col-sm-12 text-right px-3">
                                        <button
                                            type={'button'}
                                            disabled={this.state.isLoader || setDisable}
                                            className=" mr15 cancel-btn"
                                            id='AddVendorDrawer_Cancel'
                                            onClick={this.cancelHandler} >
                                            <div className={'cancel-icon'}></div> {'Cancel'}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={this.state.isLoader || isViewMode || setDisable ? true : false}
                                            className="user-btn save-btn"
                                            id='AddVendorDrawer_Save'>
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
function mapStateToProps({ comman, supplier, costing, auth }) {
    const { countryList, stateList, cityList, plantList, vendorPlantSelectList, plantSelectList } = comman;
    const { supplierData, vendorTypeList } = supplier;
    const { costingSpecifiTechnology } = costing
    const { initialConfiguration } = auth;
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
        vendorPlantSelectList, costingSpecifiTechnology, initialConfiguration, plantSelectList
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
    getCityByCountryAction,
    getVendorTypesSelectList,
    getVendorPlantSelectList,
    getCostingSpecificTechnology,
    getPlantSelectListByType
})(reduxForm({
    form: 'AddVendorDrawer',
    enableReinitialize: true,
    touchOnChange: true,
    onSubmitFail: (errors) => {
        focusOnError(errors)
    },
})(withTranslation(['VendorMaster', 'MasterLabels'])(AddVendorDrawer)));
