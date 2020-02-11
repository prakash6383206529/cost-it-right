import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderSelectField, renderNumberInputField, renderText, searchableSelect } from "../../../layout/FormInputs";
import {
    createFreightAPI, createAdditionalFreightAPI, getFreightDetailAPI, getAdditionalFreightByIdAPI,
    updateFreightAPI, getFreightByIdAPI, updateAdditionalFreightByIdAPI
} from '../../../../actions/master/Freight';
import { fetchFreightComboAPI, getPlantBySupplier } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../helper/auth";

class AddFreight extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            sourceSupplier: [],
            sourcePlant: [],
            sourceCity: [],
            destinationSupplier: [],
            destinationPlant: [],
            destinationCity: [],
            loadUnloadHead: [],
            packagingHead: [],
            freightType: 'Freight',
            packagingType: ''
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.fetchFreightComboAPI(res => { });
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { freightId, isEditFlag, FreightType } = this.props;
        if (isEditFlag) {
            if (FreightType == 1) {
                console.log("iffffffffffff")
                /** Get unit detail of the Freight  */
                this.setState({ freightType: 'Freight' }, () => {
                    this.props.getFreightByIdAPI(freightId, true, res => {
                        if (res && res.data && res.data.Data) {
                            const { freightData } = this.props;
                            if (freightData && freightData !== undefined) {
                                let response = res.data.Data;
                                this.setSearchableFields(response)
                            }
                        }
                    })
                })
            } else {
                console.log("elsssssssssssssss")
                /** Get unit detail of the Additional Freight  */
                this.setState({ freightType: 'Packaging' }, () => {
                    this.props.getAdditionalFreightByIdAPI(freightId, true, res => {
                        if (res && res.data && res.data.Data) {
                            const { freightData } = this.props;
                            if (freightData && freightData !== undefined) {
                                let response = res.data.Data;
                                this.setSearchableFields(response)
                            }
                        }
                    })
                })
            }
        }
    }

    setSearchableFields = (response) => {
        const { plantList, cityList, supplierList, costingHead } = this.props;

        if (plantList && cityList && supplierList && costingHead) {
            let tempObj1 = supplierList.find(item => item.Value == response.SourceSupplierId)
            let tempObj2 = plantList.find(item => item.Value == response.SourceSupplierPlantId)
            let tempObj3 = cityList.find(item => item.Value == response.SourceSupplierCityId)
            let tempObj4 = supplierList.find(item => item.Value == response.DestinationSupplierId)
            let tempObj5 = plantList.find(item => item.Value == response.DestinationSupplierPlantId)
            let tempObj6 = cityList.find(item => item.Value == response.DestinationSupplierCityId)
            let tempObj7 = costingHead.find(item => item.Value == response.PackagingCostingHeadsId)
            let tempObj8 = costingHead.find(item => item.Value == response.LodingUnloadingCostingHeadsId)

            this.setState({
                sourceSupplier: tempObj1 ? { label: tempObj1.Text, value: tempObj1.Value } : [],
                sourcePlant: tempObj2 ? { label: tempObj2.Text, value: tempObj2.Value } : [],
                sourceCity: tempObj3 ? { label: tempObj3.Text, value: tempObj3.Value } : [],
                destinationSupplier: tempObj4 ? { label: tempObj4.Text, value: tempObj4.Value } : [],
                destinationPlant: tempObj5 ? { label: tempObj5.Text, value: tempObj5.Value } : [],
                destinationCity: tempObj6 ? { label: tempObj6.Text, value: tempObj6.Value } : [],
                packagingHead: tempObj7 ? { label: tempObj7.Text, value: tempObj7.Value } : [],
                loadUnloadHead: tempObj8 ? { label: tempObj8.Text, value: tempObj8.Value } : [],
            })
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = (tabId = 1) => {
        this.props.onCancel(tabId);
    }

    /**
   * @method handlePlantSelection
   * @description called
   */
    handleTypeSelection = e => {
        this.setState({
            typeOfListing: e
        });
    };

    /**
    * @method selectType
    * @description Used show listing of unit of measurement
    */
    selectType = (label) => {
        const { plantList, cityList, supplierList, costingHead } = this.props;
        const temp = [];
        if (label === 'plant') {
            plantList && plantList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'city') {
            cityList && cityList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'supplier') {
            supplierList && supplierList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label === 'costingHeads') {
            costingHead && costingHead.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }


    /**
    * @method selectType
    * @description Used show listing of unit of measurement
    */
    searchableSelectType = (label) => {
        const { plantList, filterPlantList, cityList, supplierList, costingHead } = this.props;
        const temp = [];
        if (label === 'plant') {
            filterPlantList && filterPlantList.map(item => {
                if (item.Value != 0) {
                    temp.push({ label: item.Text, value: item.Value })
                }
            });
            return temp;
        }

        if (label === 'DestinationPlant') {
            plantList && plantList.map(item => {
                if (item.Value != 0) {
                    temp.push({ label: item.Text, value: item.Value })
                }
            });
            return temp;
        }

        if (label === 'city') {
            cityList && cityList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'supplier') {
            supplierList && supplierList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'costingHeads') {
            costingHead && costingHead.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { sourceSupplier, sourcePlant, sourceCity, destinationSupplier, destinationPlant, destinationCity,
            loadUnloadHead, packagingHead } = this.state;
        let loginUserId = loggedInUserId();

        /** Update detail of the existing Freight  */
        if (this.props.isEditFlag) {

            const { freightId } = this.props;
            let formData = {};
            if (this.state.freightType === 'Freight') {
                formData = {
                    IsOtherSource: false,
                    FreightId: freightId,
                    SourceSupplierName: sourceSupplier.label,
                    SourceSupplierCode: "",
                    SourceSupplierPlantName: sourcePlant.label,
                    SourceSupplierCityName: sourceCity.label,
                    DestinationSupplierName: destinationSupplier.label,
                    DestinationSupplierCode: "",
                    DestinationSupplierPlantName: destinationPlant.label,
                    DestinationSupplierCityName: destinationCity.label,
                    SourceSupplierId: sourceSupplier.value,
                    SourceSupplierPlantId: sourcePlant.value,
                    SourceSupplierCityId: sourceCity.value,
                    DestinationSupplierId: destinationSupplier.value,
                    DestinationSupplierPlantId: destinationPlant.value,
                    DestinationSupplierCityId: destinationCity.value,
                    PartTruckLoadRatePerKilogram: values.PartTruckLoadRatePerKilogram,
                    PartTruckLoadRateCubicFeet: values.PartTruckLoadRateCubicFeet,
                    FullTruckLoadRateOneTon: values.FullTruckLoadRateOneTon,
                    FullTruckLoadRateTwoTon: values.FullTruckLoadRateTwoTon,
                    FullTruckLoadRateFiveTon: values.FullTruckLoadRateFiveTon,
                    FullTruckLoadRateNineTon: values.FullTruckLoadRateNineTon,
                    FullTruckLoadRateElevenTon: values.FullTruckLoadRateElevenTon,
                    FullTruckLoadRateSixteenTon: values.FullTruckLoadRateSixteenTon,
                    FullTruckLoadRateTwentyFiveTon: values.FullTruckLoadRateTwentyFiveTon,
                    FullTruckLoadRateThirtyOneTon: values.FullTruckLoadRateThirtyOneTon,
                    FullTruckLoadRateTrailer: values.FullTruckLoadRateTrailer,
                    Expenses: values.Expenses,
                    TollTax: values.TollTax,
                    Concession: values.Concession,
                    IsActive: true,
                    CreatedBy: loginUserId,
                }

                this.props.updateFreightAPI(formData, (res) => {
                    if (res.data.Result) {
                        toastr.success(MESSAGES.UPDATE_FREIGHT_SUCESS);
                        this.toggleModel(2);
                    } else {
                        toastr.error(MESSAGES.SOME_ERROR);
                    }
                });
            }
            if (this.state.freightType === 'Packaging') {
                formData = {
                    IsOtherSource: true,
                    FreightType: 2,
                    SourceCityId: '',
                    DestinationCityId: '',
                    PartTruckLoadRatePerKilogram: '',
                    PartTruckLoadRateCubicFeet: '',
                    FullTruckLoadRateOneTon: '',
                    FullTruckLoadRateTwoTon: '',
                    FullTruckLoadRateFiveTon: '',
                    FullTruckLoadRateNineTon: '',
                    FullTruckLoadRateElevenTon: '',
                    FullTruckLoadRateSixteenTon: '',
                    FullTruckLoadRateTwentyFiveTon: '',
                    FullTruckLoadRateThirtyOneTon: '',
                    FullTruckLoadRateTrailer: '',
                    FreightId: freightId,
                    PlantId: values.PlantId,
                    SupplierId: values.SupplierId,
                    PerTrip: values.PerTrip,
                    PackagingCostingHeadsId: values.PackagingCostingHeadsId,
                    Packaging: values.Packaging,
                    PerKilogram: values.PerKilogram,
                    LodingUnloadingCostingHeadsId: values.LodingUnloadingCostingHeadsId,
                    LodingUnloading: values.LodingUnloading,
                    IsActive: true,
                    CreatedBy: loginUserId,
                }

                this.props.updateAdditionalFreightByIdAPI(formData, (res) => {
                    if (res.data.Result) {
                        toastr.success(MESSAGES.UPDATE_FREIGHT_SUCESS);
                        this.toggleModel(2);
                    } else {
                        toastr.error(MESSAGES.SOME_ERROR);
                    }
                });
            }

        } else {

            if (this.state.freightType === 'Freight') {
                console.log('this.state.freightType: ', this.state.freightType);
                let freighformData = {
                    IsOtherSource: false,
                    FreightTypeId: 1,
                    SourceSupplierId: sourceSupplier.value,
                    SourceSupplierPlantId: sourcePlant.value,
                    SourceSupplierCityId: sourceCity.value,
                    DestinationSupplierId: destinationSupplier.value,
                    DestinationSupplierPlantId: destinationPlant.value,
                    DestinationSupplierCityId: destinationCity.value,

                    PartTruckLoadRatePerKilogram: values.PartTruckLoadRatePerKilogram,
                    PartTruckLoadRateCubicFeet: values.PartTruckLoadRateCubicFeet,
                    FullTruckLoadRateOneTon: values.FullTruckLoadRateOneTon,
                    FullTruckLoadRateTwoTon: values.FullTruckLoadRateTwoTon,
                    FullTruckLoadRateFiveTon: values.FullTruckLoadRateFiveTon,
                    FullTruckLoadRateNineTon: values.FullTruckLoadRateNineTon,
                    FullTruckLoadRateElevenTon: values.FullTruckLoadRateElevenTon,
                    FullTruckLoadRateSixteenTon: values.FullTruckLoadRateSixteenTon,
                    FullTruckLoadRateTwentyFiveTon: values.FullTruckLoadRateTwentyFiveTon,
                    FullTruckLoadRateThirtyOneTon: values.FullTruckLoadRateThirtyOneTon,
                    FullTruckLoadRateTrailer: values.FullTruckLoadRateTrailer,
                    CreatedBy: loginUserId,
                }

                console.log('values: ', freighformData);
                this.props.createFreightAPI(freighformData, (res) => {
                    if (res.data.Result) {
                        toastr.success(MESSAGES.FREIGHT_ADDED_SUCCESS);
                        this.props.getFreightDetailAPI(res => { });
                        this.toggleModel(1);
                    } else {
                        toastr.error(res.data.Message);
                    }
                });
            }

            if (this.state.freightType === 'Packaging') {
                console.log('this.state.freightType: ', this.state.freightType);
                let packagingformData = {
                    IsOtherSource: false,
                    FreightTypeId: 2,
                    SourceSupplierId: sourceSupplier.value,
                    SourceSupplierPlantId: sourcePlant.value,
                    DestinationSupplierPlantId: destinationPlant.value,
                    PackagingCostingHeadsId: packagingHead.value,
                    LodingUnloadingCostingHeadsId: loadUnloadHead.value,
                    Trip: values.Trip,
                    PerTripRate: values.PerTripRate,
                    NetPackagingCost: values.NetPackagingCost,
                    TotalKilogram: values.TotalKilogram,
                    PerKilogramRate: values.PerKilogramRate,
                    NetLodingUnloadingCost: values.NetLodingUnloadingCost,
                    FreightDiscount: values.FreightDiscount,
                    IsActive: true,
                    IsModified: true,
                    CreatedDate: "",
                    CreatedBy: loginUserId,
                }

                console.log('values: ', packagingformData);
                this.props.createAdditionalFreightAPI(packagingformData, (res) => {
                    if (res.data.Result) {
                        toastr.success(MESSAGES.ADDITIONAL_FREIGHT_ADD_SUCCESS);
                        this.props.getFreightDetailAPI(res => { });
                        this.toggleModel(2);
                    } else {
                        toastr.error(res.data.Message);
                    }
                });
            }

        }

    }

    /**
    * @method freightTypeHandler
    * @description handle selection of freight type
    */
    freightTypeHandler = (value) => {
        this.setState({
            freightType: value
        });
    }

    /**
    * @method sourceSupplierHandler
    * @description Used to handle 
    */
    sourceSupplierHandler = (newValue, actionMeta) => {
        this.setState({ sourceSupplier: newValue, sourcePlant: [] }, () => {
            const { sourceSupplier } = this.state;
            if (sourceSupplier && sourceSupplier.value != '') {
                this.props.getPlantBySupplier(sourceSupplier.value, () => { })
            }
        });
    };

    /**
     * @method sourcePlantHandler
     * @description Used to handle 
     */
    sourcePlantHandler = (newValue, actionMeta) => {
        this.setState({ sourcePlant: newValue });
    };

    /**
     * @method sourceCityHandler
     * @description Used to handle 
     */
    sourceCityHandler = (newValue, actionMeta) => {
        this.setState({ sourceCity: newValue });
    };

    /**
    * @method destinationSupplierHandler
    * @description Used to handle 
    */
    destinationSupplierHandler = (newValue, actionMeta) => {
        this.setState({ destinationSupplier: newValue });
    };

    /**
    * @method destinationPlantHandler
    * @description Used to handle 
    */
    destinationPlantHandler = (newValue, actionMeta) => {
        this.setState({ destinationPlant: newValue });
    };

    /**
    * @method destinationCityHandler
    * @description Used to handle 
    */
    destinationCityHandler = (newValue, actionMeta) => {
        this.setState({ destinationCity: newValue });
    };

    /**
    * @method loadUnloadHandler
    * @description Used to handle 
    */
    loadUnloadHandler = (newValue, actionMeta) => {
        this.setState({ loadUnloadHead: newValue });
    };

    /**
    * @method packagingHeadsHandler
    * @description Used to handle 
    */
    packagingHeadsHandler = (newValue, actionMeta) => {
        this.setState({ packagingHead: newValue });
    };

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, FreightType, reset } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={() => this.toggleModel(1)} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={() => this.toggleModel(1)}>{isEditFlag ? 'Update Freight' : 'Add Freight'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row className={'supplierRadio'}>
                                        <Col className='form-group'>
                                            {(!isEditFlag || (isEditFlag && FreightType == 1)) &&
                                                <Label
                                                    className={'zbcwrapper'}
                                                    onChange={() => this.freightTypeHandler('Freight')}
                                                    check>
                                                    <Input
                                                        type="radio"
                                                        className={'Freight'}
                                                        checked={this.state.freightType == 'Freight' ? true : false}
                                                        name="FreightType"
                                                        value="Freight" />{' '}
                                                    Freight
                                            </Label>}
                                            {' '}
                                            {(!isEditFlag || (isEditFlag && FreightType == 2)) &&
                                                <Label
                                                    className={'vbcwrapper'}
                                                    onChange={() => this.freightTypeHandler('Packaging')}
                                                    check>
                                                    <Input
                                                        type="radio"
                                                        className={'Packaging'}
                                                        checked={this.state.freightType == 'Packaging' ? true : false}
                                                        name="FreightType"
                                                        value="Packaging" />{' '}
                                                    Packaging
                                            </Label>}
                                        </Col>
                                    </Row>
                                    <hr />
                                    {this.state.freightType === 'Freight' &&
                                        <Row>
                                            <Col md="4">
                                                <Field
                                                    name="SourceSupplierId"
                                                    type="text"
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    label="Source Supplier Name"
                                                    component={searchableSelect}
                                                    //validate={[required, maxLength50]}
                                                    options={this.searchableSelectType('supplier')}
                                                    //required={true}
                                                    handleChangeDescription={this.sourceSupplierHandler}
                                                    valueDescription={this.state.sourceSupplier}
                                                />
                                            </Col>
                                            <Col md="4">
                                                <Field
                                                    name="SourceSupplierCityId"
                                                    type="text"
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    label="Source Supplier City"
                                                    component={searchableSelect}
                                                    //validate={[required, maxLength50]}
                                                    options={this.searchableSelectType('city')}
                                                    //required={true}
                                                    handleChangeDescription={this.sourceCityHandler}
                                                    valueDescription={this.state.sourceCity}
                                                />
                                            </Col>
                                            <Col md="4">
                                                <Field
                                                    name="SourceSupplierPlantId"
                                                    type="text"
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    label="Source Supplier Plant"
                                                    component={searchableSelect}
                                                    //validate={[required, maxLength50]}
                                                    options={this.searchableSelectType('plant')}
                                                    //required={true}
                                                    handleChangeDescription={this.sourcePlantHandler}
                                                    valueDescription={this.state.sourcePlant}
                                                />
                                            </Col>
                                            {/* <Col md="4">
                                                <Field
                                                    name="DestinationSupplierId"
                                                    type="text"
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    label="Destination Supplier"
                                                    component={searchableSelect}
                                                    //validate={[required, maxLength50]}
                                                    options={this.searchableSelectType('supplier')}
                                                    //required={true}
                                                    handleChangeDescription={this.destinationSupplierHandler}
                                                    valueDescription={this.state.destinationSupplier}
                                                />
                                            </Col> */}
                                            <Col md="4">
                                                <Field
                                                    name="DestinationSupplierPlantId"
                                                    type="text"
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    label="Destination Supplier Plant"
                                                    component={searchableSelect}
                                                    //validate={[required, maxLength50]}
                                                    options={this.searchableSelectType('DestinationPlant')}
                                                    //required={true}
                                                    handleChangeDescription={this.destinationPlantHandler}
                                                    valueDescription={this.state.destinationPlant}
                                                />
                                            </Col>
                                            <Col md="4">
                                                <Field
                                                    name="DestinationSupplierCityId"
                                                    type="text"
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    label="Destination Supplier City"
                                                    component={searchableSelect}
                                                    //validate={[required, maxLength50]}
                                                    options={this.searchableSelectType('city')}
                                                    //required={true}
                                                    handleChangeDescription={this.destinationCityHandler}
                                                    valueDescription={this.state.destinationCity}
                                                />
                                            </Col>
                                        </Row>}
                                    {this.state.freightType === 'Freight' &&
                                        <Row>
                                            <Col md="12">
                                                <b>PTL(Part Truck Load)</b>
                                                <hr />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Rs/kg`}
                                                    name={"PartTruckLoadRatePerKilogram"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Rs/Cubic feet`}
                                                    name={"PartTruckLoadRateCubicFeet"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="12">
                                                <b>FTL(Full Truck Load)</b>
                                                <hr />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`1 tone Ace`}
                                                    name={"FullTruckLoadRateOneTon"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`2 Ton`}
                                                    name={"FullTruckLoadRateTwoTon"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`5 Ton`}
                                                    name={"FullTruckLoadRateFiveTon"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`9 Ton`}
                                                    name={"FullTruckLoadRateNineTon"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`11 Ton`}
                                                    name={"FullTruckLoadRateElevenTon"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`16 Ton`}
                                                    name={"FullTruckLoadRateSixteenTon"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`25 Ton`}
                                                    name={"FullTruckLoadRateTwentyFiveTon"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`31 Ton`}
                                                    name={"FullTruckLoadRateThirtyOneTon"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Trailer`}
                                                    name={"FullTruckLoadRateTrailer"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Expenses`}
                                                    name={"Expenses"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Toll Tax`}
                                                    name={"TollTax"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Concession`}
                                                    name={"Concession"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                        </Row>}

                                    {this.state.freightType === 'Packaging' &&
                                        <Row>
                                            <Col md="4">
                                                <Field
                                                    name="SourceSupplierId"
                                                    type="text"
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    label="Source Supplier Name"
                                                    component={searchableSelect}
                                                    //validate={[required, maxLength50]}
                                                    options={this.searchableSelectType('supplier')}
                                                    //required={true}
                                                    handleChangeDescription={this.sourceSupplierHandler}
                                                    valueDescription={this.state.sourceSupplier}
                                                />
                                            </Col>
                                            <Col md="4">
                                                <Field
                                                    name="SourceSupplierPlantId"
                                                    type="text"
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    label="Source Supplier Plant"
                                                    component={searchableSelect}
                                                    //validate={[required, maxLength50]}
                                                    options={this.searchableSelectType('plant')}
                                                    //required={true}
                                                    handleChangeDescription={this.sourcePlantHandler}
                                                    valueDescription={this.state.sourcePlant}
                                                />
                                            </Col>
                                            <Col md="4">
                                                <Field
                                                    name="DestinationSupplierPlantId"
                                                    type="text"
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    label="Destination Supplier Plant"
                                                    component={searchableSelect}
                                                    //validate={[required, maxLength50]}
                                                    options={this.searchableSelectType('plant')}
                                                    //required={true}
                                                    handleChangeDescription={this.destinationPlantHandler}
                                                    valueDescription={this.state.destinationPlant}
                                                />
                                            </Col>
                                        </Row>}
                                    {this.state.freightType === 'Packaging' &&
                                        <Row>
                                            <Col md="6">
                                                <Field
                                                    label={`Packaging Head`}
                                                    name="PackagingCostingHeadsId"
                                                    type="text"
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    component={searchableSelect}
                                                    //validate={[required, maxLength50]}
                                                    options={this.searchableSelectType('costingHeads')}
                                                    //required={true}
                                                    handleChangeDescription={this.packagingHeadsHandler}
                                                    valueDescription={this.state.packagingHead}
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Net Packaging Cost`}
                                                    name={"NetPackagingCost"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                    validate={[required]}
                                                    required={true}
                                                />
                                            </Col>
                                        </Row>}
                                    {this.state.freightType === 'Packaging' &&
                                        <Row>
                                            <Col md="6">
                                                <Field
                                                    label={`Loading Unloading Head`}
                                                    name="LodingUnloadingCostingHeadsId"
                                                    type="text"
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    component={searchableSelect}
                                                    //validate={[required, maxLength50]}
                                                    options={this.searchableSelectType('costingHeads')}
                                                    //required={true}
                                                    handleChangeDescription={this.loadUnloadHandler}
                                                    valueDescription={this.state.loadUnloadHead}
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Net Loading Unloading Cost`}
                                                    name={"NetLodingUnloadingCost"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                    validate={[required]}
                                                    required={true}
                                                />

                                            </Col>
                                        </Row>}
                                    {this.state.freightType === 'Packaging' &&
                                        <Row>
                                            <Col md="6">
                                                <Field
                                                    label={`Trip`}
                                                    name={"Trip"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Per Trip Rate`}
                                                    name={"PerTripRate"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                    validate={[required]}
                                                    required={true}
                                                />
                                            </Col>
                                        </Row>}
                                    {this.state.freightType === 'Packaging' &&
                                        <Row>
                                            <Col md="6">
                                                <Field
                                                    label={`Total Kilogram`}
                                                    name={"TotalKilogram"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Per Kilogram Rate`}
                                                    name={"PerKilogramRate"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                    validate={[required]}
                                                    required={true}
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={`Freight Discount`}
                                                    name={"FreightDiscount"}
                                                    type="text"
                                                    placeholder={''}
                                                    component={renderNumberInputField}
                                                    className=" withoutBorder"
                                                />
                                            </Col>
                                        </Row>}
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save'}
                                            </button>
                                            {!isEditFlag &&
                                                <button type={'button'} className="btn btn-secondary" onClick={reset} >
                                                    {'Reset'}
                                                </button>}
                                        </div>
                                    </Row>
                                </form>
                            </Container>
                        </Row>
                    </ModalBody>
                </Modal>
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state, ownProps) {
    const { comman, freight } = state;
    const { cityList, plantList, filterPlantList, supplierList, costingHead } = comman;
    const { freightData, PackagingData } = freight;
    let initialValues = {};
    if (ownProps.FreightType == 1) {
        console.log('111111')
        initialValues = {
            SourceSupplierId: freightData.SourceSupplierId,
            SourceSupplierPlantId: freightData.SourceSupplierPlantId,
            SourceSupplierCityId: freightData.SourceSupplierCityId,
            DestinationSupplierId: freightData.DestinationSupplierId,
            DestinationSupplierPlantId: freightData.DestinationSupplierPlantId,
            DestinationSupplierCityId: freightData.DestinationSupplierCityId,
            PartTruckLoadRatePerKilogram: freightData.PartTruckLoadRatePerKilogram ? freightData.PartTruckLoadRatePerKilogram : 0,
            PartTruckLoadRateCubicFeet: freightData.PartTruckLoadRateCubicFeet ? freightData.PartTruckLoadRateCubicFeet : 0,
            FullTruckLoadRateOneTon: freightData.FullTruckLoadRateOneTon ? freightData.FullTruckLoadRateOneTon : 0,
            FullTruckLoadRateTwoTon: freightData.FullTruckLoadRateTwoTon ? freightData.FullTruckLoadRateTwoTon : 0,
            FullTruckLoadRateFiveTon: freightData.FullTruckLoadRateFiveTon ? freightData.FullTruckLoadRateFiveTon : 0,
            FullTruckLoadRateNineTon: freightData.FullTruckLoadRateNineTon ? freightData.FullTruckLoadRateNineTon : 0,
            FullTruckLoadRateElevenTon: freightData.FullTruckLoadRateElevenTon ? freightData.FullTruckLoadRateElevenTon : 0,
            FullTruckLoadRateSixteenTon: freightData.FullTruckLoadRateSixteenTon ? freightData.FullTruckLoadRateSixteenTon : 0,
            FullTruckLoadRateTwentyFiveTon: freightData.FullTruckLoadRateTwentyFiveTon ? freightData.FullTruckLoadRateTwentyFiveTon : 0,
            FullTruckLoadRateThirtyOneTon: freightData.FullTruckLoadRateThirtyOneTon ? freightData.FullTruckLoadRateThirtyOneTon : 0,
            FullTruckLoadRateTrailer: freightData.FullTruckLoadRateTrailer ? freightData.FullTruckLoadRateTrailer : 0,
            Expenses: freightData.Expenses ? freightData.Expenses : 0,
            TollTax: freightData.TollTax ? freightData.TollTax : 0,
            Concession: freightData.Concession ? freightData.Concession : 0,
        }
    }

    if (ownProps.FreightType == 2) {
        console.log('22222')
        initialValues = {
            SourceSupplierId: PackagingData.SourceSupplierId,
            SourceSupplierPlantId: PackagingData.SourceSupplierPlantId,
            DestinationSupplierPlantId: PackagingData.DestinationSupplierPlantId,
            PackagingCostingHeadsId: PackagingData.PackagingCostingHeadsId,
            NetPackagingCost: PackagingData.NetPackagingCost,
            LodingUnloadingCostingHeadsId: PackagingData.LodingUnloadingCostingHeadsId,
            NetLodingUnloadingCost: PackagingData.NetLodingUnloadingCost,
            Trip: PackagingData.Trip,
            PerTripRate: PackagingData.PerTripRate,
            TotalKilogram: PackagingData.TotalKilogram,
            PerKilogramRate: PackagingData.PerKilogramRate,
            FreightDiscount: PackagingData.FreightDiscount,
        }
    }
    return { cityList, plantList, filterPlantList, supplierList, costingHead, initialValues, freightData, PackagingData }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createFreightAPI,
    createAdditionalFreightAPI,
    updateFreightAPI,
    getFreightByIdAPI,
    fetchFreightComboAPI,
    getFreightDetailAPI,
    getAdditionalFreightByIdAPI,
    updateAdditionalFreightByIdAPI,
    getPlantBySupplier,
})(reduxForm({
    form: 'AddFreight',
    enableReinitialize: true,
})(AddFreight));
