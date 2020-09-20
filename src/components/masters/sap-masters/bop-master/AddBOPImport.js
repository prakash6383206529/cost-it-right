import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required, checkForNull, maxLength100 } from "../../../../helper/validation";
import {
    renderText, renderNumberInputField, searchableSelect,
    renderMultiSelectField, renderTextAreaField
} from "../../../layout/FormInputs";
import {
    fetchMaterialComboAPI, getCityBySupplier, getPlantBySupplier, getUOMSelectList,
    getCurrencySelectList,
} from '../../../../actions/master/Comman';
import {
    createBOPImport, updateBOPImport, getBOPCategorySelectList,
    getBOPImportById,
} from '../../../../actions/master/BoughtOutParts';
import { getVendorListByVendorType } from '../../../../actions/master/Material';
import BOPDomesticListing from './BOPDomesticListing';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId } from "../../../../helper/auth";
import Switch from "react-switch";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import $ from 'jquery';
import { FILE_URL } from '../../../../config/constants';
import AddBOPCategory from './AddBOPCategory';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
const selector = formValueSelector('AddBOPImport');

class AddBOPImport extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            IsVendor: false,

            BOPCategory: [],
            isCategoryDrawerOpen: false,

            selectedPartAssembly: [],
            selectedPlants: [],

            isOpenVendor: false,

            vendorName: [],
            selectedVendorPlants: [],
            vendorLocation: [],

            sourceLocation: [],

            UOM: [],
            isOpenUOM: false,

            effectiveDate: '',
            remarks: '',
        }
    }

    /**
    * @method componentWillMount
    * @description Called before render the component
    */
    UNSAFE_componentWillMount() {
        this.props.getUOMSelectList(() => { })
        this.props.getBOPCategorySelectList(() => { })
    }

    /**
     * @method componentDidMount
     * @description Called after rendering the component
     */
    componentDidMount() {
        this.props.fetchMaterialComboAPI(res => { });
        this.props.getVendorListByVendorType(false, () => { })
        this.props.getCurrencySelectList(() => { })
    }

    /**
    * @method onPressVendor
    * @description Used for Vendor checked
    */
    onPressVendor = () => {
        this.setState({
            IsVendor: !this.state.IsVendor,
            vendorName: [],
            selectedVendorPlants: [],
            vendorLocation: [],
        }, () => {
            const { IsVendor } = this.state;
            this.props.getVendorListByVendorType(IsVendor, () => { })
        });
    }

    /**
    * @method handleCategoryChange
    * @description  used to handle BOP Category Selection
    */
    handleCategoryChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ BOPCategory: newValue });
        } else {
            this.setState({ BOPCategory: [], });

        }
    }


    /**
    * @method handleMessageChange
    * @description used remarks handler
    */
    handleMessageChange = (e) => {
        this.setState({
            remarks: e.target.value
        })
    }

    /**
    * @method getDetails
    * @description Used to get Details
    */
    getDetails = (data) => {
        if (data && data.isEditFlag) {
            this.setState({
                isEditFlag: false,
                isLoader: true,
                isShowForm: true,
                BOPID: data.Id,
            })
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getBOPImportById(data.Id, res => {
                if (res && res.data && res.data.Result) {

                    const Data = res.data.Data;

                    this.props.getVendorListByVendorType(Data.IsVendor, () => { })
                    this.props.getPlantBySupplier(Data.Vendor, () => { })
                    this.props.getCityBySupplier(Data.Vendor, () => { })

                    setTimeout(() => {
                        const { cityList, bopCategorySelectList,
                            filterCityListBySupplier, vendorListByVendorType } = this.props;

                        const categoryObj = bopCategorySelectList && bopCategorySelectList.find(item => item.Value === Data.Category)

                        let plantArray = [];
                        Data && Data.Plant.map((item) => {
                            plantArray.push({ Text: item.PlantName, Value: item.PlantId })
                            return plantArray;
                        })

                        const vendorObj = vendorListByVendorType && vendorListByVendorType.find(item => item.Value === Data.Vendor)

                        let vendorPlantArray = [];
                        Data && Data.VendorPlant.map((item) => {
                            vendorPlantArray.push({ Text: item.PlantName, Value: item.PlantId })
                            return vendorPlantArray;
                        })

                        const vendorLocationObj = filterCityListBySupplier && filterCityListBySupplier.find(item => item.Value === Data.VendorLocation)
                        const sourceLocationObj = cityList && cityList.find(item => item.Value === Data.SourceLocation)

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            isShowForm: true,
                            IsVendor: Data.IsVendor,
                            BOPCategory: { label: categoryObj.Text, value: categoryObj.Value },
                            selectedPlants: plantArray,
                            vendorName: { label: vendorObj.Text, value: vendorObj.Value },
                            selectedVendorPlants: vendorPlantArray,
                            vendorLocation: { label: vendorLocationObj.Text, value: vendorLocationObj.Value },
                            sourceLocation: { label: sourceLocationObj.Text, value: sourceLocationObj.Value },
                            remarks: Data.Remark,
                        })
                    }, 200)
                }
            })
        } else {
            this.props.getBOPImportById('', res => { })
        }

    }


    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { vendorListByVendorType, bopCategorySelectList, plantList, filterPlantList, cityList,
            filterCityListBySupplier, UOMSelectList, currencySelectList, } = this.props;
        const temp = [];
        if (label === 'BOPCategory') {
            bopCategorySelectList && bopCategorySelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'PartAssembly') {
            // plantList && plantList.map(item => {
            //     if (item.Value == '0') return false;
            //     temp.push({ Text: item.Text, Value: item.Value })
            // });
            return temp;
        }
        if (label === 'plant') {
            plantList && plantList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorNameList') {
            vendorListByVendorType && vendorListByVendorType.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorPlant') {
            filterPlantList && filterPlantList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorLocation') {
            filterCityListBySupplier && filterCityListBySupplier.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'SourceLocation') {
            cityList && cityList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'uom') {
            UOMSelectList && UOMSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'currency') {
            currencySelectList && currencySelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

    }

    categoryToggler = () => {
        this.setState({ isCategoryDrawerOpen: true })
    }

    closeCategoryDrawer = (e = '') => {
        this.setState({ isCategoryDrawerOpen: false }, () => {
            this.props.getBOPCategorySelectList(() => { })
        })
    }

    /**
    * @method handlePartAssembly
    * @description Used handle Part Assembly
    */
    handlePartAssembly = (e) => {
        this.setState({ selectedPartAssembly: e })
    }

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorName: newValue, selectedVendorPlants: [], vendorLocation: [] }, () => {
                const { vendorName } = this.state;
                this.props.getPlantBySupplier(vendorName.value, () => { })
                this.props.getCityBySupplier(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [], selectedVendorPlants: [], vendorLocation: [] })
        }
    };

    vendorToggler = () => {
        this.setState({ isOpenVendor: true })
    }

    closeVendorDrawer = (e = '') => {
        this.setState({ isOpenVendor: false }, () => {
            const { IsVendor } = this.state;
            this.props.getVendorListByVendorType(IsVendor, () => { })
        })
    }

    /**
    * @method handleVendorPlant
    * @description called
    */
    handleVendorPlant = (e) => {
        this.setState({ selectedVendorPlants: e })
    };

    /**
    * @method handleVendorLocation
    * @description called
    */
    handleVendorLocation = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorLocation: newValue, });
        } else {
            this.setState({ vendorLocation: [], })
        }
    };

    /**
    * @method handleSourceSupplierCity
    * @description called
    */
    handleSourceSupplierCity = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ sourceLocation: newValue, });
        } else {
            this.setState({ sourceLocation: [], })
        }
    };

    /**
    * @method handleUOM
    * @description called
    */
    handleUOM = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ UOM: newValue, })
        } else {
            this.setState({ UOM: [] })
        }
    };

    uomToggler = () => {
        this.setState({ isOpenUOM: true })
    }

    closeUOMDrawer = (e = '') => {
        this.setState({ isOpenUOM: false })
    }

    handleCalculation = () => {
        const { fieldsObj } = this.props
        const NoOfPieces = fieldsObj && fieldsObj.NumberOfPieces !== undefined ? fieldsObj.NumberOfPieces : 0;
        const BasicRate = fieldsObj && fieldsObj.BasicRate !== undefined ? fieldsObj.BasicRate : 0;
        const NetLandedCost = checkForNull(BasicRate / NoOfPieces)
        this.props.change('NetLandedCost', NetLandedCost)
    }

    /**
    * @method handleChange
    * @description Handle Effective Date
    */
    handleEffectiveDateChange = (date) => {
        this.setState({
            effectiveDate: date,
        });
    };



    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    clearForm = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            remarks: '',
            isShowForm: false,
            IsVendor: false,
        })
        this.props.getBOPImportById('', res => { })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        this.clearForm()
    }

    /**
    * @method resetForm
    * @description used to Reset form
    */
    resetForm = () => {
        this.clearForm()
    }



    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { IsVendor, BOPCategory, selectedPartAssembly, selectedPlants, vendorName,
            selectedVendorPlants, vendorLocation, sourceLocation, remarks,
            BOPID, isEditFlag, files, effectiveDate, } = this.state;

        let plantArray = [];
        selectedPlants && selectedPlants.map((item) => {
            plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
            return plantArray;
        })

        let vendorPlantArray = [];
        selectedVendorPlants && selectedVendorPlants.map((item) => {
            vendorPlantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
            return vendorPlantArray;
        })

        if (isEditFlag) {

            let requestData = {
                BoughtOutPartId: BOPID,
                Parts: [],
                Source: values.Source,
                SourceLocation: values.sourceLocation,
                BasicRate: values.BasicRate,
                NetLandedCost: values.NetLandedCost,
                Remark: remarks,
                LoggedInUserId: loggedInUserId(),
                Plant: plantArray,
                Attachements: []
            }

            this.props.updateBOPImport(requestData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_BOP_SUCESS);
                    this.clearForm();
                    this.child.getUpdatedData();
                }
            })

        } else {

            const formData = {
                IsVendor: IsVendor,
                EntryType: 0,
                BoughtOutPartNumber: values.BoughtOutPartNumber,
                BoughtOutPartName: values.BoughtOutPartName,
                CategoryId: BOPCategory.value,
                Parts: [],
                Specification: values.Specification,
                Vendor: vendorName.value,
                VendorLocation: vendorLocation.value,
                Source: values.Source,
                SourceLocation: sourceLocation.value,
                EffectiveDate: effectiveDate,
                BasicRate: values.BasicRate,
                NumberOfPieces: values.NumberOfPieces,
                NetLandedCost: values.NetLandedCost,
                Remark: remarks,
                IsActive: true,
                LoggedInUserId: loggedInUserId(),
                Plant: plantArray,
                VendorPlant: vendorPlantArray,
                Attachements: files
            }

            this.props.createBOPImport(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.BOP_ADD_SUCCESS);
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
        const { handleSubmit, } = this.props;
        const { isCategoryDrawerOpen, isOpenVendor, isOpenUOM, isEditFlag, } = this.state;

        return (
            <>
                <div>
                    <div className="login-container signup-form">
                        <div className="row">
                            {this.state.isShowForm &&
                                <div className="col-md-12">
                                    <div className="shadow-lgg login-formg">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-heading">
                                                    <h2>{isEditFlag ? `Update BOP Details` : `Add BOP Details`}</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <form
                                            noValidate
                                            className="form"
                                            onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                        >
                                            <Row>
                                                <Col md="4" className="switch mb15">
                                                    <label>
                                                        <div className={'left-title'}>Zero Based</div>
                                                        <Switch
                                                            onChange={this.onPressVendor}
                                                            checked={this.state.IsVendor}
                                                            id="normal-switch"
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                        <div className={'right-title'}>Vendor Based</div>
                                                    </label>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md="4">
                                                    <Field
                                                        label={`BOP Part No`}
                                                        name={"PartNumber"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        disabled={false}
                                                        className=" "
                                                        customClassName=" withBorder"
                                                    />
                                                </Col>
                                                <Col md="4">
                                                    <Field
                                                        label={`BOP Part Name`}
                                                        name={"BOPPartName"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        disabled={false}
                                                        className=" "
                                                        customClassName=" withBorder"
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        name="BOPCategory"
                                                        type="text"
                                                        label="BOP Category"
                                                        component={searchableSelect}
                                                        placeholder={'BOP Category'}
                                                        options={this.renderListing('BOPCategory')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.BOPCategory == null || this.state.BOPCategory.length === 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleCategoryChange}
                                                        valueDescription={this.state.BOPCategory}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </Col>
                                                <Col md="1">
                                                    <div
                                                        onClick={this.categoryToggler}
                                                        className={'plus-icon-square mt30 mr15 right'}>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md="4">
                                                    <Field
                                                        label="Part/ Assembly No."
                                                        name="PartAssemblyNo"
                                                        placeholder="--Select--"
                                                        selection={(this.state.selectedPartAssembly == null || this.state.selectedPartAssembly.length === 0) ? [] : this.state.selectedPartAssembly}
                                                        options={this.renderListing('PartAssembly')}
                                                        selectionChanged={this.handlePartAssembly}
                                                        optionValue={option => option.Value}
                                                        optionLabel={option => option.Text}
                                                        component={renderMultiSelectField}
                                                        mendatory={true}
                                                        className="multiselect-with-border"
                                                    //disabled={(this.state.IsVendor || isEditFlag) ? true : false}
                                                    />
                                                </Col>
                                                <Col md="4">
                                                    <Field
                                                        label={`Specification`}
                                                        name={"Specification"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        //validate={[required]}
                                                        component={renderText}
                                                        //required={true}
                                                        disabled={false}
                                                        className=" "
                                                        customClassName=" withBorder"
                                                    />
                                                </Col>
                                                {!this.state.IsVendor &&
                                                    <Col md="4">
                                                        <Field
                                                            label="Plant"
                                                            name="Plant"
                                                            placeholder="--Select--"
                                                            selection={(this.state.selectedPlants == null || this.state.selectedPlants.length === 0) ? [] : this.state.selectedPlants}
                                                            options={this.renderListing('plant')}
                                                            selectionChanged={this.handlePlant}
                                                            optionValue={option => option.Value}
                                                            optionLabel={option => option.Text}
                                                            component={renderMultiSelectField}
                                                            mendatory={true}
                                                            className="multiselect-with-border"
                                                            disabled={(this.state.IsVendor || isEditFlag) ? true : false}
                                                        />
                                                    </Col>}
                                            </Row>

                                            <Row>
                                                <Col md="12">
                                                    <div className="left-border">
                                                        {'Vendor'}
                                                    </div>
                                                </Col>
                                                <Col md="3">
                                                    <Field
                                                        name="vendorName"
                                                        type="text"
                                                        label="Vendor Name"
                                                        component={searchableSelect}
                                                        placeholder={'Vendor'}
                                                        options={this.renderListing('VendorNameList')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.vendorName == null || this.state.vendorName.length === 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleVendorName}
                                                        valueDescription={this.state.vendorName}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </Col>
                                                <Col md="1">
                                                    <div
                                                        onClick={this.vendorToggler}
                                                        className={'plus-icon-square mt30 mr15 right'}>
                                                    </div>
                                                </Col>
                                                <Col md="4">
                                                    <Field
                                                        label="Vendor Plant"
                                                        name="VendorPlant"
                                                        placeholder="--- Plant ---"
                                                        selection={(this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length === 0) ? [] : this.state.selectedVendorPlants}
                                                        options={this.renderListing('VendorPlant')}
                                                        selectionChanged={this.handleVendorPlant}
                                                        optionValue={option => option.Value}
                                                        optionLabel={option => option.Text}
                                                        component={renderMultiSelectField}
                                                        mendatory={true}
                                                        className="multiselect-with-border"
                                                        disabled={isEditFlag ? true : (this.state.IsVendor ? false : true)}
                                                    />
                                                </Col>
                                                <Col md="4">
                                                    <Field
                                                        name="VendorLocation"
                                                        type="text"
                                                        label="Vendor Location"
                                                        component={searchableSelect}
                                                        placeholder={'Location'}
                                                        options={this.renderListing('VendorLocation')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.vendorLocation == null || this.state.vendorLocation.length === 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleVendorLocation}
                                                        valueDescription={this.state.vendorLocation}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </Col>
                                            </Row>

                                            {this.state.IsVendor &&
                                                <Row>
                                                    <Col md="4">
                                                        <Field
                                                            label={`Source`}
                                                            name={"Source"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderText}
                                                            required={true}
                                                            disabled={false}
                                                            className=" "
                                                            customClassName=" withBorder"
                                                        />
                                                    </Col>
                                                    <Col md="4">
                                                        <Field
                                                            name="SourceLocation"
                                                            type="text"
                                                            label="Source Location"
                                                            component={searchableSelect}
                                                            placeholder={'--- Plant ---'}
                                                            options={this.renderListing('SourceLocation')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.sourceLocation == null || this.state.sourceLocation.length === 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.handleSourceSupplierCity}
                                                            valueDescription={this.state.sourceLocation}
                                                        />
                                                    </Col>
                                                </Row>}

                                            <Row>
                                                <Col md="12">
                                                    <div className="left-border">
                                                        {'Cost:'}
                                                    </div>
                                                </Col>
                                                <Col md="4">
                                                    <Field
                                                        name="Currency"
                                                        type="text"
                                                        label="Currency"
                                                        component={searchableSelect}
                                                        placeholder={'--- Select Currency ---'}
                                                        options={this.renderListing('currency')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.currency == null || this.state.currency.length === 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleCurrency}
                                                        valueDescription={this.state.currency}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </Col>
                                                <Col md="4">
                                                    <Field
                                                        label={`No. Of Pcs.`}
                                                        name={"NumberOfPieces"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[required]}
                                                        component={renderNumberInputField}
                                                        onChange={this.handleCalculation}
                                                        required={true}
                                                        className=""
                                                        customClassName=" withBorder"
                                                    />
                                                </Col>
                                                <Col md="4">
                                                    <Field
                                                        label={`Basic Rate (INR)`}
                                                        name={"BasicRate"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[required]}
                                                        component={renderNumberInputField}
                                                        onChange={this.handleCalculation}
                                                        required={true}
                                                        disabled={false}
                                                        className=" "
                                                        customClassName=" withBorder"
                                                    />
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md="4">
                                                    <Field
                                                        label={`Net Landed Cost (INR)`}
                                                        name={"NetLandedCost"}
                                                        type="text"
                                                        placeholder={''}
                                                        validate={[required]}
                                                        component={renderText}
                                                        required={true}
                                                        disabled={true}
                                                        className=" "
                                                        customClassName=" withBorder"
                                                    />
                                                </Col>
                                                <Col md="4">
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
                                                                disabled={isEditFlag ? true : false}
                                                            />
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md="12">
                                                    <div className="left-border">
                                                        {'Remarks & Attachment'}
                                                    </div>
                                                </Col>
                                                <Col md="6">
                                                    <Field
                                                        label={'Remarks'}
                                                        name={`Remark`}
                                                        placeholder="Type here..."
                                                        value={this.state.remarks}
                                                        className=""
                                                        customClassName=" textAreaWithBorder"
                                                        onChange={this.handleMessageChange}
                                                        validate={[required, maxLength100]}
                                                        required={true}
                                                        component={renderTextAreaField}
                                                        maxLength="5000"
                                                    />
                                                </Col>
                                                <Col md="6">

                                                </Col>
                                            </Row>

                                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                                <div className="col-sm-12 text-center">
                                                    <button
                                                        type={'button'}
                                                        className="reset mr15 cancel-btn"
                                                        onClick={this.cancel} >
                                                        {'Cancel'}
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="submit-button mr5 save-btn" >
                                                        {isEditFlag ? 'Update' : 'Save'}
                                                    </button>
                                                </div>
                                            </Row>
                                        </form>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <BOPDomesticListing
                        onRef={ref => (this.child = ref)}
                        getDetails={this.getDetails}
                        formToggle={this.formToggle}
                        isShowForm={this.state.isShowForm} />
                </div>
                {isCategoryDrawerOpen && <AddBOPCategory
                    isOpen={isCategoryDrawerOpen}
                    closeDrawer={this.closeCategoryDrawer}
                    isEditFlag={false}
                    //RawMaterial={this.state.RawMaterial}
                    anchor={'right'}
                />}
                {isOpenVendor && <AddVendorDrawer
                    isOpen={isOpenVendor}
                    closeDrawer={this.closeVendorDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
                {isOpenUOM && <AddUOM
                    isOpen={isOpenUOM}
                    closeDrawer={this.closeUOMDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const { comman, material, boughtOutparts, } = state;
    const fieldsObj = selector(state, 'NumberOfPieces', 'BasicRate',);

    const { bopCategorySelectList, bopData, } = boughtOutparts;
    const { plantList, filterPlantList, filterCityListBySupplier, cityList,
        UOMSelectList, currencySelectList, } = comman;
    const { vendorListByVendorType } = material;

    let initialValues = {};
    if (bopData && bopData !== undefined) {
        initialValues = {
            BoughtOutPartNumber: bopData.BoughtOutPartNumber,
            BoughtOutPartName: bopData.BoughtOutPartName,
            Specification: bopData.Specification,
            Source: bopData.Source,
            BasicRate: bopData.BasicRatePerUOM,
            NumberOfPieces: bopData.NumberOfPieces,
            NetLandedCost: bopData.NetLandedCost,
            Remark: bopData.Remark,
        }
    }

    return {
        vendorListByVendorType, bopCategorySelectList, plantList, filterPlantList, filterCityListBySupplier,
        cityList, UOMSelectList, currencySelectList, fieldsObj, initialValues,
    }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getVendorListByVendorType,
    getPlantBySupplier,
    getCityBySupplier,
    fetchMaterialComboAPI,
    getUOMSelectList,
    getCurrencySelectList,
    createBOPImport,
    updateBOPImport,
    getBOPCategorySelectList,
    getBOPImportById,
})(reduxForm({
    form: 'AddBOPImport',
    enableReinitialize: true,
})(AddBOPImport));
