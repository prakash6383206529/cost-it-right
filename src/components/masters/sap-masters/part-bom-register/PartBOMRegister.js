import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, FieldArray, formValueSelector, initialize } from "redux-form";
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import {
    renderText, renderSelectField, renderCheckboxInputField, renderMultiSelectField,
    searchableSelect, RFReactSelect, focusOnError,
} from "../../../layout/FormInputs";
import { createPartAPI, updatePartsAPI, getOnePartsAPI, getAllPartsAPI } from '../../../../actions/master/Part';
import { fetchBOMComboAPI, fetchPlantDataAPI, fetchPartComboAPI } from '../../../../actions/master/Comman';
import {
    getAllBOMAPI, createBOMAPI, checkCostingExistForPart, deleteExisCostingByPartID, getBOMDetailAPI,
    createNewBOMAPI, createAssemblyPartAPI, getAssemblyPartDataListAPI, getAssemblyPartDetailAPI,
    updateAssemblyPartAPI,
} from '../../../../actions/master/BillOfMaterial';
import { getAllRawMaterialList } from '../../../../actions/master/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import { loggedInUserId, userDetails } from "../../../../helper/auth";
import PartAssemblyListing from './PartAssemblyListing';
const selector = formValueSelector('PartBOMRegister');
const userDetail = userDetails()


const childPartsInitialData = {
    childPartsArray: [{
        PartId: '',
        CreatedBy: loggedInUserId(),
        CreatedDate: '',
        IsActive: true,
        IsExistPart: true,
        Quantity: 1,
        RevisionNumber: '',
        EcoNumber: '',
        PartNumber: '',
        PartName: '',
        PartDescription: '',
        IndustrialIdentity: '',
        MaterialGroupCode: '',
        IsOtherSource: true,
        PartFamily: '',
        PlantId: '',
        CompanyId: userDetail.CompanyId,
        MaterialTypeId: '',
        RawMaterialId: '',
        UnitOfMeasurementId: '',
        TechnologyId: '',
        IsAssembly: true,
        PartTypeId: '',
        IsChildPart: true,
        BOMNumber: ''
    }]
}

const renderMembers = ({
    fields,
    ChildPartHandler,
    renderListing,
    newPartRMTypeHandler,
    uomChildHandler,
    childPlantHandler,
    isEditFlag,
    meta: { error, submitFailed } }) => {

    return (

        <>
            <div>
                <button type="button" onClick={() => fields.push(childPartsInitialData.childPartsArray[0])}>
                    Add More Child Part
                </button>
                {/* {submitFailed && error && <span>{error}</span>} */}
            </div>
            {fields.map((cost, index) => {
                return (
                    <Card className={'BOM_Card mb20'}>
                        <CardBody>
                            <Row>
                                <Col md='2'>
                                    {fields.length > 1 ? <button
                                        type="button"
                                        className={'btn btn-danger'}
                                        title="Delete"
                                        onClick={() => fields.remove(index)}
                                    >Delete</button> : ''}
                                </Col>
                            </Row>
                            <Row>
                                <Col md="4">
                                    <Field
                                        label={'Child Part'}
                                        name={`${cost}.PartId`}
                                        component={RFReactSelect}
                                        options={renderListing('ChildPart')}
                                        labelKey={'label'}
                                        valueKey={'value'}
                                        onChangeHsn={ChildPartHandler}
                                        validate={[required]}
                                        mendatory={true}
                                        selType={'ChildPartId'}
                                        rowIndex={index}
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label={'Raw Material Type'}
                                        name={`${cost}.RawMaterialId`}
                                        component={RFReactSelect}
                                        options={renderListing('material')}
                                        labelKey={'label'}
                                        valueKey={'value'}
                                        onChangeHsn={newPartRMTypeHandler}
                                        validate={[required]}
                                        mendatory={true}
                                        selType={'RawMaterialId'}
                                        rowIndex={index}
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label={'UOM'}
                                        name={`${cost}.UnitOfMeasurementId`}
                                        component={RFReactSelect}
                                        options={renderListing('searchableUOM')}
                                        labelKey={'label'}
                                        valueKey={'value'}
                                        onChangeHsn={uomChildHandler}
                                        validate={[required]}
                                        mendatory={true}
                                        selType={'UnitOfMeasurementId'}
                                        rowIndex={index}
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md="4">
                                    <Field
                                        label={'Plant'}
                                        name={`${cost}.PlantId`}
                                        component={RFReactSelect}
                                        options={renderListing('searchablePlant')}
                                        labelKey={'label'}
                                        valueKey={'value'}
                                        onChangeHsn={childPlantHandler}
                                        validate={[required]}
                                        mendatory={true}
                                        selType={'PlantId'}
                                        rowIndex={index}
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>
                                {/* <Col md='4'>
                                    <Field
                                        label={'BOM Level'}
                                        name={`${cost}.BOMNumber`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={false}
                                    />
                                </Col> */}
                                <Col md='4'>
                                    <Field
                                        label={'Quantity'}
                                        name={`${cost}.Quantity`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={false}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                {/* <Col md='4'>
                                    <Field
                                        label={'ECO Number'}
                                        name={`${cost}.EcoNumber`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={false}
                                    />
                                </Col>
                                <Col md='4'>
                                    <Field
                                        label={'Revision Number'}
                                        name={`${cost}.RevisionNumber`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={false}
                                    />
                                </Col> */}
                                <Col md='4'>
                                    <Field
                                        label={'Part Group Code'}
                                        name={`${cost}.MaterialGroupCode`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={true}
                                    />
                                </Col>
                                <Col md='4'>
                                    <Field
                                        label={'Part Description'}
                                        name={`${cost}.PartDescription`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={true}
                                    />
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>)
            }
            )}
        </>
    )
}

const newPartsInitialData = {
    newPartsArray: [{
        PartId: '',
        CreatedBy: loggedInUserId(),
        CreatedDate: '',
        IsActive: true,
        IsExistPart: false,
        Quantity: 1,
        RevisionNumber: '',
        EcoNumber: '',
        PartNumber: '',
        PartName: '',
        PartDescription: '',
        IndustrialIdentity: '',
        MaterialGroupCode: '',
        IsOtherSource: true,
        PartFamily: '',
        PlantId: '',
        CompanyId: userDetail.CompanyId,
        MaterialTypeId: '',
        RawMaterialId: '',
        UnitOfMeasurementId: '',
        TechnologyId: '',
        IsAssembly: true,
        PartTypeId: '',
        IsChildPart: true,
        BOMNumber: ''
    }]
}

const renderNewPartMembers = ({
    fields,
    ChildPartHandler,
    renderListing,
    newPartRMTypeHandler,
    uomChildHandler,
    childPlantHandler,
    meta: { error, submitFailed } }) => {

    return (

        <>
            <div>
                <button type="button" onClick={() => fields.push(newPartsInitialData.newPartsArray[0])}>
                    Add More New Part
                </button>
                {/* {submitFailed && error && <span>{error}</span>} */}
            </div>
            {fields.map((cost, index) => {
                return (
                    <Card className={'BOM_Card mb20'}>
                        <CardBody>
                            <Row>
                                <Col md='2'>
                                    {fields.length > 1 ? <button
                                        type="button"
                                        className={'btn btn-danger'}
                                        title="Delete"
                                        onClick={() => fields.remove(index)}
                                    >Delete</button> : ''}
                                </Col>
                            </Row>
                            <Row>
                                <Col md='4'>
                                    <Field
                                        label={'Part Number'}
                                        name={`${cost}.PartNumber`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={false}
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label={`Part Name`}
                                        name={`${cost}.PartName`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                    />
                                </Col>
                                {/* <Col md="4">
                                    <Field
                                        label={`BOM Level`}
                                        name={`${cost}.BOMLevel`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={false}
                                    />
                                </Col> */}
                            </Row>
                            <Row>
                                <Col md="4">
                                    <Field
                                        label={'Raw Material Type'}
                                        name={`${cost}.RawMaterialId`}
                                        component={RFReactSelect}
                                        options={renderListing('material')}
                                        labelKey={'label'}
                                        valueKey={'value'}
                                        onChangeHsn={newPartRMTypeHandler}
                                        //validate={[required]}
                                        //mendatory={false}
                                        selType={'RawMaterialId'}
                                        rowIndex={index}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label={'UOM'}
                                        name={`${cost}.UnitOfMeasurementId`}
                                        component={RFReactSelect}
                                        options={renderListing('searchableUOM')}
                                        labelKey={'label'}
                                        valueKey={'value'}
                                        onChangeHsn={uomChildHandler}
                                        //validate={[required]}
                                        //mendatory={false}
                                        selType={'UnitOfMeasurementId'}
                                        rowIndex={index}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label={'Plant'}
                                        name={`${cost}.PlantId`}
                                        component={RFReactSelect}
                                        options={renderListing('searchablePlant')}
                                        labelKey={'label'}
                                        valueKey={'value'}
                                        onChangeHsn={childPlantHandler}
                                        //validate={[required]}
                                        //mendatory={false}
                                        selType={'PlantId'}
                                        rowIndex={index}
                                        disabled={true}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md='4'>
                                    <Field
                                        label={'Quantity'}
                                        name={`${cost}.Quantity`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={false}
                                    />
                                </Col>
                                <Col md='4'>
                                    <Field
                                        label={'Part Group Code'}
                                        name={`${cost}.MaterialGroupCode`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={false}
                                    />
                                </Col>
                                <Col md='4'>
                                    <Field
                                        label={'Part Description'}
                                        name={`${cost}.PartDescription`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={false}
                                    />
                                </Col>
                                {/* <Col md='4'>
                                    <Field
                                        label={'ECO Number'}
                                        name={`${cost}.EcoNumber`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={false}
                                    />
                                </Col>
                                <Col md='4'>
                                    <Field
                                        label={'Revision Number'}
                                        name={`${cost}.RevisionNumber`}
                                        type="text"
                                        placeholder={''}
                                        //validate={[required]}
                                        component={renderText}
                                        //required={true}
                                        className=" withoutBorder"
                                        disabled={false}
                                    />
                                </Col> */}
                            </Row>
                        </CardBody>
                    </Card>)
            }
            )}
        </>
    )
}

class PartBOMRegister extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            selectedParts: [],
            assyPartNo: [],
            ChildPart: [],
            materialType: [],
            newPartRMType: [],
            selectedUOM: [],
            plantID: '',
            isChildPart: false,
            selectedPlant: [],
            selectedChildPlant: [],
        }
    }

    /**
    * @method componentWillMount
    * @description Called before rendering the component
    */
    componentWillMount() {
        this.props.fetchPartComboAPI(res => { });
        this.props.getAllBOMAPI(res => { });
        this.props.fetchBOMComboAPI(res => { });
        this.props.fetchPlantDataAPI(() => { });
        this.props.getAllRawMaterialList(() => { });
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {

    }

    /**
    * @method renderListing
    * @description Used show select listings
    */
    renderListing = (label) => {
        const { uniOfMeasurementList, plantList, partList, materialTypeList, rowMaterialDetail, BOMListing } = this.props;
        const { assyPartNo } = this.state;
        const temp = [];

        if (label === 'AssyPart') {
            partList && partList.length > 0 && partList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'ChildPart') {
            partList && partList.length > 0 && partList.map(item => {
                if (item.Value == 0) return false;
                if (assyPartNo && assyPartNo.value == item.Value) {
                    return false;
                }
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'material') {
            rowMaterialDetail && rowMaterialDetail.map(item =>
                temp.push({ label: item.RawMaterialName, value: item.RawMaterialId })
            );
            return temp;
        }
        if (label === 'uom') {
            uniOfMeasurementList && uniOfMeasurementList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'searchableUOM') {
            uniOfMeasurementList && uniOfMeasurementList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'searchablePlant') {
            plantList && plantList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'plant') {
            plantList && plantList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'BOM') {
            BOMListing && BOMListing.map(item =>
                temp.push({ Text: item.BillNumber, Value: item.BillOfMaterialId })
            );
            return temp;
        }
    }

    /**
    * @method checkCostingExistForPart
    * @description Used to check costing exist for selected part.
    */
    checkCostingExistForPart = (PartId) => {
        this.props.checkCostingExistForPart(PartId, (Message) => {
            if (Message != '') {
                //toastr.warning(Message)
                this.deleteExistCosting(Message, PartId);
            }
        })
    }

    /**
    * @method deleteExistCosting
    * @description Use to delete exist costing
    */
    deleteExistCosting = (Message, PartId) => {
        const { reset } = this.props;
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteCosting(PartId)
            },
            onCancel: () => {
                this.setState({ assyPartNo: [] })
                this.props.getBOMDetailAPI(false, '', () => {
                    this.setState({
                        materialType: [],
                        selectedUOM: [],
                    })
                })
            }
        };
        return toastr.confirm(`${Message}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteCosting
    * @description confirm delete costing for the part
    */
    confirmDeleteCosting = (PartId) => {
        this.props.deleteExisCostingByPartID(PartId, (res) => {
            if (res.data.Result) {
                toastr.success("Costing has been deleted for selected part.");
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        });
    }

    /**
    * @method assyPartNoHandler
    * @description Used to handle 
    */
    assyPartNoHandler = (newValue, actionMeta) => {
        if (newValue != null) {
            this.setState({ assyPartNo: newValue }, () => {
                const { assyPartNo } = this.state;
                this.props.getBOMDetailAPI(true, assyPartNo.value, (res) => {
                    const { uniOfMeasurementList, rowMaterialDetail, unitBOMDetail } = this.props;
                    if (unitBOMDetail && unitBOMDetail != undefined) {

                        const tempMaterialObj = rowMaterialDetail.find(item => item.RawMaterialId == unitBOMDetail.RawMaterialId)
                        const tempUOMObj = uniOfMeasurementList.find(item => item.Value == unitBOMDetail.UnitOfMeasurementId)

                        this.setState({
                            materialType: { label: tempMaterialObj.RawMaterialName, value: tempMaterialObj.RawMaterialId },
                            selectedUOM: { label: tempUOMObj.Text, value: tempUOMObj.Value },
                        })

                    }
                })
            });
        };
    }

    /**
    * @method ChildPartHandler
    * @description Used to handle Child Part
    */
    ChildPartHandler = (value, index, type) => {
        this.props.getOnePartsAPI(value, true, res => {
            const { partData } = this.props;
            if (partData && partData != undefined) {

                this.props.change(`childPartsArray[${index}]['PartNumber']`, partData.PartNumber);
                this.props.change(`childPartsArray[${index}]['PartName']`, partData.PartNumber);
                this.props.change(`childPartsArray[${index}]['MaterialGroupCode']`, partData.MaterialGroupCode);
                this.props.change(`childPartsArray[${index}]['PartDescription']`, partData.PartDescription);
                this.props.change(`childPartsArray[${index}]['PlantId']`, partData.PlantId);
                this.props.change(`childPartsArray[${index}]['RawMaterialId']`, partData.RawMaterialId);
                this.props.change(`childPartsArray[${index}]['UnitOfMeasurementId']`, partData.UnitOfMeasurementId);

            }
        })
    };

    /**
    * @method newPartRMTypeHandler
    * @description Used to handle process
    */
    newPartRMTypeHandler = (value, index, type) => {

    };

    /**
    * @method uomChildHandler
    * @description Used to handle process
    */
    uomChildHandler = (value, index, type) => {

    };

    /**
    * @method materialTypeHandler
    * @description Used to handle 
    */
    materialTypeHandler = (newValue, actionMeta) => {
        this.setState({ materialType: newValue });
    };

    /**
    * @method uomHandler
    * @description Used to handle 
    */
    uomHandler = (newValue, actionMeta) => {
        this.setState({ selectedUOM: newValue });
    };

    /**
    * @method plantHandler
    * @description Used to Submit the form
    */
    plantHandler = (newValue, actionMeta) => {
        this.setState({ selectedPlant: newValue })
    }

    /**
    * @method childPlantHandler
    * @description Used to Submit the form
    */
    childPlantHandler = (newValue, actionMeta) => {
        this.setState({ selectedChildPlant: newValue })
    }

    /**
    * @method getAssemblyPartDetail
    * @description Used to call get assembly part data API
    */
    getAssemblyPartDetail = (data) => {
        if (data && data.isEditFlag) {
            this.props.getAssemblyPartDetailAPI(data.PartId, (res) => {
                if (res && res.data && res.data.Data) {
                    const { uniOfMeasurementList, plantList, rowMaterialDetail } = this.props;
                    const Data = res.data.Data;
                    const UOMObj = uniOfMeasurementList && uniOfMeasurementList.find(item => item.Value == Data.UnitOfMeasurementId)
                    const PlantObj = plantList && plantList.find(item => item.Value == Data.PlantId)
                    const RMObj = rowMaterialDetail && rowMaterialDetail.find(item => item.RawMaterialId == Data.RawMaterialId)

                    this.setState({
                        selectedPlant: { label: PlantObj.Text, value: PlantObj.Value },
                        materialType: { label: RMObj.RawMaterialName, value: RMObj.RawMaterialId },
                        selectedUOM: { label: UOMObj.Text, value: UOMObj.Value },
                        isChildPart: true,
                        isEditFlag: true,
                    });
                }
            })
        } else {
            this.props.getAssemblyPartDetailAPI('', (res) => { })
        }
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset, initialize, destroy } = this.props;
        reset();
        //destroy();
        initialize();
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { selectedParts, isChildPart, isNewPart, selectedChildPlant, newPartRMType,
            selectedPlant, selectedUOM, materialType, isEditFlag } = this.state;
        const { childPartsRow, AssemblyPartData } = this.props;
        let loginUserId = loggedInUserId();

        let plantArray = [];
        selectedParts && selectedParts.map((item, i) => {
            return plantArray.push({ PartId: item.Value });
        });

        let tempArray1 = [];
        let tempArray2 = [];
        let tempArray3 = [];

        const childPartArray = childPartsRow.childPartsArray;
        const newPartArray = childPartsRow.newPartsArray;

        childPartArray && childPartArray.map((item) => {
            item.EcoNumber = values.EcoNumber;
            item.RevisionNumber = values.RevisionNumber;
            item.BOMNumber = values.BillNumber;

            tempArray1.push(item)
            return tempArray1
        })

        newPartArray && newPartArray.map((item) => {
            item.EcoNumber = values.EcoNumber;
            item.RevisionNumber = values.RevisionNumber;
            item.BOMNumber = values.BillNumber;

            tempArray2.push(item)
            return tempArray2
        })

        if (isChildPart && isNewPart) {
            tempArray3 = tempArray1.concat(tempArray2)
        } else if (isNewPart) {
            tempArray3 = tempArray2;
        } else if (isChildPart) {
            tempArray3 = tempArray1;
        }

        if (isEditFlag) {

            const updateData = {
                PartId: AssemblyPartData.PartId,
                BillOfMaterialId: AssemblyPartData.BillOfMaterialId,
                ChildParts: tempArray3,
                PlantName: AssemblyPartData.PlantName,
                CompanyName: '',
                MaterialTypeName: '',
                UnitOfMeasurementName: selectedUOM.label,
                RawMaterialName: materialType.label,
                TechnologyName: '',
                PartTypeName: '',
                CreatedByName: '',
                BOMLevel: values.BOMLevel,
                IsForceUpdate: true,
                CreatedBy: loggedInUserId(),
                CreatedDate: '',
                IsActive: true,
                IsExistPart: true,
                Quantity: AssemblyPartData.Quantity,
                RevisionNumber: values.RevisionNumber,
                EcoNumber: values.EcoNumber,
                PartNumber: AssemblyPartData.PartNumber,
                PartName: AssemblyPartData.PartName,
                PartDescription: AssemblyPartData.PartDescription,
                IndustrialIdentity: AssemblyPartData.IndustrialIdentity,
                MaterialGroupCode: AssemblyPartData.MaterialGroupCode,
                IsOtherSource: true,
                PartFamily: '',
                PlantId: selectedPlant.value,
                CompanyId: userDetail.CompanyId,
                MaterialTypeId: '',
                RawMaterialId: materialType.value,
                UnitOfMeasurementId: selectedUOM.value,
                TechnologyId: '',
                IsAssembly: true,
                PartTypeId: '',
                IsChildPart: true,
                BOMNumber: AssemblyPartData.BOMNumber
            }

            /** Add new detail of the BOM  */
            this.props.updateAssemblyPartAPI(updateData, (res) => {
                if (res.data.Result == true) {
                    toastr.success(MESSAGES.BOM_ADD_SUCCESS);
                    this.props.getAssemblyPartDataListAPI(res => { });
                }
            });

        } else {

            const formData = {
                ChildParts: tempArray3,
                PartId: '',
                CreatedBy: loggedInUserId(),
                CreatedDate: '',
                IsActive: true,
                IsExistPart: isChildPart ? true : false,
                Quantity: values.Quantity,
                RevisionNumber: values.RevisionNumber,
                EcoNumber: values.EcoNumber,
                PartNumber: values.AssyPartNo,
                PartName: values.AssyPartNo,
                PartDescription: values.PartDescription,
                IndustrialIdentity: '',
                MaterialGroupCode: '',
                IsOtherSource: true,
                PartFamily: '',
                PlantId: selectedPlant.value,
                CompanyId: userDetail.CompanyId,
                MaterialTypeId: '',
                RawMaterialId: materialType.value,
                UnitOfMeasurementId: selectedUOM.value,
                TechnologyId: '',
                IsAssembly: true,
                PartTypeId: '',
                IsChildPart: false,
                BOMNumber: values.BillNumber
            }

            /** Add new detail of the BOM  */
            this.props.createAssemblyPartAPI(formData, (res) => {
                if (res.data.Result == true) {
                    toastr.success(MESSAGES.BOM_ADD_SUCCESS);
                    this.props.getAssemblyPartDataListAPI(res => { });
                }
            });
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, reset, partData, pristine,
            submitting } = this.props;
        const { isEditFlag } = this.state;

        return (

            <Container className="top-margin BOM_form">
                <Row>
                    <Col>
                        <h3><b>{'Add Assembly Part'}</b></h3>
                    </Col>
                </Row>
                <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                >

                    <Card className={'BOM_Card mb20'}>
                        <CardBody>
                            <Row>
                                <Col md={"4"}>
                                    <Field
                                        label={`Assy Part No.`}
                                        name={"AssyPartNo"}
                                        type="text"
                                        placeholder={''}
                                        validate={[required]}
                                        component={renderText}
                                        required={true}
                                        className="withoutBorder"
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label={`BOM Number`}
                                        name={"BillNumber"}
                                        type="text"
                                        placeholder={''}
                                        validate={[required]}
                                        component={renderText}
                                        required={true}
                                        className="withoutBorder"
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label={`Part Description`}
                                        name={"PartDescription"}
                                        type="text"
                                        placeholder={''}
                                        validate={[required]}
                                        component={renderText}
                                        required={true}
                                        className=" withoutBorder"
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label={`Quantity`}
                                        name={"Quantity"}
                                        type="text"
                                        placeholder={''}
                                        validate={[required]}
                                        component={renderText}
                                        required={true}
                                        className=" withoutBorder"
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label={`ECO ${CONSTANT.NUMBER}`}
                                        name={"EcoNumber"}
                                        type="text"
                                        placeholder={''}
                                        component={renderText}
                                        //validate={[required]}
                                        //required={true}
                                        className=" withoutBorder"
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label={`Revision Number`}
                                        name={"RevisionNumber"}
                                        type="text"
                                        placeholder={''}
                                        component={renderText}
                                        //validate={[required]}
                                        //required={true}
                                        className=" withoutBorder"
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label="Assembly Raw Material"
                                        name="MaterialTypeId"
                                        type="text"
                                        component={searchableSelect}
                                        options={this.renderListing('material')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={[required, maxLength50]}
                                        //required={true}
                                        handleChangeDescription={this.materialTypeHandler}
                                        valueDescription={this.state.materialType}
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label={'Assembly Unit Of Measurement'}
                                        name={'UnitOfMeasurementId'}
                                        type="text"
                                        component={searchableSelect}
                                        options={this.renderListing('searchableUOM')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={[required]}
                                        //required={true}
                                        handleChangeDescription={this.uomHandler}
                                        valueDescription={this.state.selectedUOM}
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>
                                <Col md="4">
                                    <Field
                                        label={'Assembly Plant'}
                                        name={'PlantId'}
                                        type="text"
                                        component={searchableSelect}
                                        options={this.renderListing('searchablePlant')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={[required]}
                                        //required={true}
                                        handleChangeDescription={this.plantHandler}
                                        valueDescription={this.state.selectedPlant}
                                        disabled={isEditFlag ? true : false}
                                    />
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    <Row className={'mt20'}>
                        <Col md="2">
                            <button
                                type="button"
                                onClick={() => this.setState({ isChildPart: !this.state.isChildPart })}
                                className={'btn btn-primary'}>Add Child Part</button>
                        </Col>
                    </Row>

                    {/* Below code for Add Child Part */}

                    {this.state.isChildPart &&
                        <>
                            <Row className={'mt20'}>
                                <Col>
                                    <h3><b>{'Add Child Part'}</b></h3>
                                    <hr />
                                </Col>
                            </Row>
                            <FieldArray
                                name="childPartsArray"
                                renderListing={this.renderListing}
                                ChildPartHandler={this.ChildPartHandler}
                                newPartRMTypeHandler={this.newPartRMTypeHandler}
                                uomChildHandler={this.uomChildHandler}
                                userDetail={userDetail}
                                component={renderMembers}
                                isEditFlag={isEditFlag}
                            />
                        </>
                    }

                    <hr />

                    <Row className={'mt20'}>
                        <Col md="2">
                            <button
                                type="button"
                                onClick={() => this.setState({ isNewPart: !this.state.isNewPart })}
                                className={'btn btn-primary'}>Add New Part</button>
                        </Col>
                    </Row>

                    {/* Below code for Add New Part */}

                    {this.state.isNewPart &&
                        <>
                            <Row className={'mt20'}>
                                <Col>
                                    <h3><b>{'Add New Part'}</b></h3>
                                    <hr />
                                </Col>
                            </Row>
                            <FieldArray
                                name="newPartsArray"
                                renderListing={this.renderListing}
                                newPartRMTypeHandler={this.newPartRMTypeHandler}
                                uomChildHandler={this.uomChildHandler}
                                userDetail={userDetail}
                                component={renderNewPartMembers}
                                isEditFlag={isEditFlag}
                            />
                        </>
                    }

                    <Row className="sf-btn-footer no-gutters justify-content-between">
                        <div className="col-sm-12 text-center">
                            <button type="submit" className="btn dark-pinkbtn" >
                                {isEditFlag ? 'Update' : 'Save'}
                            </button>
                            {!isEditFlag &&
                                <button type={'button'} className="btn btn-secondary" disabled={pristine || submitting} onClick={reset} >
                                    {'Reset'}
                                </button>
                            }
                        </div>
                    </Row>

                </form>
                <PartAssemblyListing
                    getAssemblyPartDetail={this.getAssemblyPartDetail}
                />
            </Container>

        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
        */
function mapStateToProps(state) {
    const { part, comman, billOfMaterial, material } = state;
    const childPartsRow = selector(state, 'childPartsArray', 'newPartsArray');
    const { rowMaterialDetail } = material;
    const { partList, plantList } = comman;
    const { uniOfMeasurementList, partData, materialTypeList } = part;
    const { BOMListing, unitBOMDetail, AssemblyPartData } = billOfMaterial;

    let initialValues = {};
    if (AssemblyPartData && AssemblyPartData != undefined) {
        initialValues = {
            AssyPartNo: AssemblyPartData.PartNumber,
            BillNumber: AssemblyPartData.BOMNumber,
            PartDescription: AssemblyPartData.PartDescription,
            Quantity: AssemblyPartData.Quantity,
            EcoNumber: AssemblyPartData.EcoNumber,
            RevisionNumber: AssemblyPartData.RevisionNumber,
            childPartsArray: AssemblyPartData.ChildParts,
        }
    } else {
        initialValues = {
            childPartsArray: [{
                PartId: '',
                CreatedBy: loggedInUserId(),
                CreatedDate: '',
                IsActive: true,
                IsExistPart: true,
                Quantity: 1,
                RevisionNumber: '',
                EcoNumber: '',
                PartNumber: '',
                PartName: '',
                PartDescription: '',
                IndustrialIdentity: '',
                MaterialGroupCode: '',
                IsOtherSource: true,
                PartFamily: '',
                PlantId: '',
                CompanyId: userDetail.CompanyId,
                MaterialTypeId: '',
                RawMaterialId: '',
                UnitOfMeasurementId: '',
                TechnologyId: '',
                IsAssembly: true,
                PartTypeId: '',
                IsChildPart: true,
                BOMNumber: ''
            }],
            newPartsArray: [{
                PartId: '',
                CreatedBy: loggedInUserId(),
                CreatedDate: '',
                IsActive: true,
                IsExistPart: false,
                Quantity: 1,
                RevisionNumber: '',
                EcoNumber: '',
                PartNumber: '',
                PartName: '',
                PartDescription: '',
                IndustrialIdentity: '',
                MaterialGroupCode: '',
                IsOtherSource: true,
                PartFamily: '',
                PlantId: '',
                CompanyId: userDetail.CompanyId,
                MaterialTypeId: '',
                RawMaterialId: '',
                UnitOfMeasurementId: '',
                TechnologyId: '',
                IsAssembly: true,
                PartTypeId: '',
                IsChildPart: true,
                BOMNumber: ''
            }]
        }
    }
    return {
        uniOfMeasurementList,
        initialValues,
        materialTypeList,
        plantList,
        partData,
        BOMListing,
        partList,
        plantList,
        rowMaterialDetail,
        unitBOMDetail,
        AssemblyPartData,
        childPartsRow,
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createPartAPI,
    updatePartsAPI,
    getOnePartsAPI,
    fetchPartComboAPI,
    getAllPartsAPI,
    getAllBOMAPI,
    createBOMAPI,
    fetchBOMComboAPI,
    fetchPlantDataAPI,
    getAllRawMaterialList,
    checkCostingExistForPart,
    deleteExisCostingByPartID,
    getBOMDetailAPI,
    createNewBOMAPI,
    createAssemblyPartAPI,
    getAssemblyPartDataListAPI,
    getAssemblyPartDetailAPI,
    updateAssemblyPartAPI,
})(reduxForm({
    form: 'PartBOMRegister',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(PartBOMRegister));
