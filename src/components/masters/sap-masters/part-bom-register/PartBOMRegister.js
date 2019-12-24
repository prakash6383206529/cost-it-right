import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import {
    renderText, renderSelectField, renderCheckboxInputField, renderMultiSelectField,
    searchableSelect
} from "../../../layout/FormInputs";
import { createPartAPI, updatePartsAPI, getOnePartsAPI, getAllPartsAPI } from '../../../../actions/master/Part';
import { fetchBOMComboAPI, fetchPlantDataAPI, fetchPartComboAPI } from '../../../../actions/master/Comman';
import { getAllBOMAPI, createBOMAPI } from '../../../../actions/master/BillOfMaterial';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'

class PartBOMRegister extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false,
            IsPartAssociatedWithBOM: false,
            selectedBOMs: [],
            selectedParts: [],
            assyPartNo: [],
            ChildPart: [],
            isBOMDisabled: false,
            materialType: [],
            selectedUOM: [],
            plantID: '',
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
        this.props.fetchPlantDataAPI(() => { })
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        const { partId, isEditFlag } = this.props;
        console.log('isEditFlag', isEditFlag);
        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getOnePartsAPI(partId, true, res => {
                    const { partData } = this.props;
                    this.setState({ IsPartAssociatedWithBOM: partData.IsPartAssociatedWithBOM })
                })
            })
        } else {
            this.props.getOnePartsAPI('', false, res => { })
        }
    }

    /**
    * @method handleTypeOfListingChange
    * @description  used to handle type of listing selection
    */
    handleTypeOfListingChange = (e) => {
        this.setState({
            typeOfListing: e
        })
    }

    /**
     * @method handleBOMSelection
     * @description Used for BOM numbers selection
     */
    handleBOMSelection = e => {
        this.setState({
            selectedBOMs: e
        });
    };

    /**
    * @method handleTypeOfListingChange
    * @description  used to handle type of listing selection
    */
    handleTypeOfListingChange = (e) => {
        this.setState({
            typeOfListing: e
        })
    }

    /**
    * @method handlePartSelection
    * @description called
    */
    handlePartSelection = e => {
        this.setState({
            selectedParts: e
        });
    };

    renderAssyPartList = () => {
        const { partList } = this.props;
        let temp = [];
        // partList && partList.map(item =>
        //     temp.push({ label: item.Text, value: item.Value })
        // );
        return temp;
    }

    /**
    * @method renderTypeOfListing
    * @description Used show select listings
    */
    renderTypeOfListing = (label) => {
        const { uniOfMeasurementList, plantList, materialTypeList, BOMListing } = this.props;
        const temp = [];
        if (label === 'material') {
            materialTypeList && materialTypeList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'uom') {
            uniOfMeasurementList && uniOfMeasurementList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
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

    onPressAssociatedWithBOM = () => {
        this.setState({ IsPartAssociatedWithBOM: !this.state.IsPartAssociatedWithBOM });
    }

    /**
    * @method renderTypeOfListing
    * @description Used show type of listing
    */
    renderBOMTypeListing = (label) => {
        const { uniOfMeasurementList, partList, materialTypeList, plantList } = this.props;
        const temp = [];
        if (label === 'material') {
            materialTypeList && materialTypeList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label === 'uom') {
            uniOfMeasurementList && uniOfMeasurementList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label === 'part') {
            partList && partList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'plant') {
            plantList && plantList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }

    /**
    * @method assyPartNoHandler
    * @description Used to handle 
    */
    assyPartNoHandler = (newValue, actionMeta) => {
        this.setState({ assyPartNo: newValue }, () => {
            this.checkIsPartIdSame()
        });
    };

    checkIsPartIdSame = () => {
        const { assyPartNo, ChildPart } = this.state;
        if (assyPartNo && ChildPart) {
            if (assyPartNo.value == ChildPart.value) {
                this.props.change("BOMLevel", 0)
                this.setState({ isBOMDisabled: true })
            } else {
                this.props.change("BOMLevel", '')
                this.setState({ isBOMDisabled: false })
            }
        } else {
            this.props.change("BOMLevel", '')
            this.setState({ isBOMDisabled: false })
        }
    }

    /**
    * @method ChildPartHandler
    * @description Used to handle 
    */
    ChildPartHandler = (newValue, actionMeta) => {
        this.setState({ ChildPart: newValue }, () => {
            this.checkIsPartIdSame()
        });
    };

    onPressAddChildPart = () => {
        this.setState({ IsChildPart: !this.state.IsChildPart }, () => {
            this.setState({ ChildPart: [] })
        })
    }

    /**
    * @method ChildPartHandler
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

    plantHandler = (e) => {
        this.setState({ plantID: e.target.value })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {

        const { selectedParts, materialType, selectedUOM, assyPartNo, ChildPart, plantID } = this.state;
        let plantArray = [];
        selectedParts && selectedParts.map((item, i) => {
            return plantArray.push({ PartId: item.Value });
        });
        /** Add new detail of the BOM  */
        const bomData = {
            MaterialTypeName: materialType.label,
            UnitOfMeasurementName: selectedUOM.label,
            AssemblyBOMId: assyPartNo.value,
            BillNumber: values.BillNumber,
            MaterialDescription: values.MaterialDescription,
            Quantity: values.Quantity,
            AssemblyPartNumberMark: assyPartNo.label,
            BOMLevel: values.BOMLevel,
            EcoNumber: values.EcoNumber,
            RevisionNumber: values.RevisionNumber,
            MaterialTypeId: materialType.value,
            UnitOfMeasurementId: selectedUOM.value,
            AssemblyBOMPartId: assyPartNo.value,
            AssemblyBOMPartNumber: assyPartNo.label,
            PartId: assyPartNo.value,
            PartNumber: assyPartNo.label,
            PlantId: plantID,
            CreatedBy: "",
            SerialNumber: 0,
            PartType: materialType.label,
            IsActive: true
        }

        if (assyPartNo.hasOwnProperty('value') && ChildPart.hasOwnProperty('value')) {
            if (assyPartNo.value == ChildPart.value) {
                bomData.PartId = assyPartNo.value;
                bomData.PartNumber = assyPartNo.label;
            } else {
                bomData.PartId = ChildPart.value;
                bomData.PartNumber = ChildPart.label;
            }
        }

        this.props.createBOMAPI(bomData, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.BOM_ADD_SUCCESS);
                this.toggleModel();
            } else {
                toastr.error(res.data.message);
            }
        });

        values.IndustrialIdentity = values.PartName;
        values.IsPartAssociatedWithBOM = this.state.IsPartAssociatedWithBOM;
        this.props.createPartAPI(values, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.PART_ADD_SUCCESS);
                this.props.getAllPartsAPI(res => { })
                this.toggleModel();
            } else {
                toastr.error(res.data.message);
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset, partData } = this.props;
        return (

            <Container className="top-margin">
                <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                >
                    <Row>
                        <Col md="4">
                            <label
                                className="custom-checkbox"
                                onChange={this.onPressAssociatedWithBOM}
                            >
                                Is Part Associated With BOM
                                                <input type="checkbox" checked={this.state.IsPartAssociatedWithBOM} />
                                <span
                                    className=" before-box"
                                    checked={this.state.IsPartAssociatedWithBOM}
                                    onChange={this.onPressAssociatedWithBOM}
                                />
                            </label>
                        </Col>
                        <Col md="4">
                            <Field
                                label="BOM Numbers"
                                name="SelectedBOM"
                                placeholder="--Select BOM Number--"
                                selection={this.state.selectedBOMs}
                                options={this.renderTypeOfListing('BOM')}
                                selectionChanged={this.handleBOMSelection}
                                optionValue={option => option.Value}
                                optionLabel={option => option.Text}
                                component={renderMultiSelectField}
                                mendatory={false}
                                className="withoutBorder"
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md="6">
                            <Field
                                label={`${CONSTANT.PART} ${CONSTANT.NUMBER}`}
                                name={"PartNumber"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=" withoutBorder"
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`${CONSTANT.PART} ${CONSTANT.NAME}`}
                                name={"PartName"}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                            />
                        </Col>
                        <Row />
                        <Row />
                        <Col md="6">
                            <Field
                                label={`${CONSTANT.MATERIAL} ${CONSTANT.TYPE}`}
                                name={"MaterialTypeId"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                required={true}
                                className=" withoutBorder custom-select"
                                options={this.renderTypeOfListing('material')}
                                onChange={this.handleTypeofListing}
                                optionValue={'Value'}
                                optionLabel={'Text'}
                                component={renderSelectField}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`${CONSTANT.UOM}`}
                                name={"UnitOfMeasurementId"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                required={true}
                                maxLength={26}
                                options={this.renderTypeOfListing('uom')}
                                onChange={this.handleTypeofListing}
                                optionValue={'Value'}
                                optionLabel={'Text'}
                                component={renderSelectField}
                                className=" withoutBorder custom-select"
                            />
                        </Col>
                        <Col md="12">
                            <Field
                                label={`${CONSTANT.PLANT}`}
                                name={"PlantId"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                required={true}
                                maxLength={26}
                                options={this.renderTypeOfListing('plant')}
                                onChange={this.handleTypeofListing}
                                optionValue={'Value'}
                                optionLabel={'Text'}
                                component={renderSelectField}
                                className=" withoutBorder custom-select"
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md="6">
                            <Field
                                label={`${CONSTANT.PART} ${CONSTANT.GROUPCODE}`}
                                name={"MaterialGroupCode"}
                                type="text"
                                placeholder={''}
                                component={renderText}
                                className=" withoutBorder "
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`${CONSTANT.PART} ${CONSTANT.DESCRIPTION}`}
                                name={"PartDescription"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=" withoutBorder "
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className={'pull-right'}>
                            <label
                                className="custom-checkbox pull-right"
                                onChange={this.onPressAddChildPart}
                            >
                                Add Child Part
                                                <input type="checkbox" checked={this.state.IsChildPart} />
                                <span
                                    className=" before-box"
                                    checked={this.state.IsChildPart}
                                    onChange={this.onPressAddChildPart}
                                />
                            </label>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={this.state.IsChildPart ? "6" : "12"}>
                            <Field
                                name="AssyPartNo"
                                type="text"
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                label="Assy Part No."
                                component={searchableSelect}
                                //validate={[required, maxLength50]}
                                options={this.renderAssyPartList()}
                                //options={options}
                                //required={true}
                                handleChangeDescription={this.assyPartNoHandler}
                                valueDescription={this.state.assyPartNo}
                            />
                        </Col>
                        {this.state.IsChildPart && <Col md="6">
                            <Field
                                label={'Child Part'}
                                name={'ChildPart'}
                                type="text"
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                component={searchableSelect}
                                //validate={[required, maxLength50]}
                                options={this.renderAssyPartList()}
                                //options={options}
                                //required={true}
                                handleChangeDescription={this.ChildPartHandler}
                                valueDescription={this.state.ChildPart}
                            />
                        </Col>}
                        <Col md="6">
                            <Field
                                label={`BOM Number`}
                                name={"BillNumber"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className="withoutBorder"
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Material Description`}
                                name={"MaterialDescription"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=" withoutBorder"
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`${CONSTANT.QUANTITY}`}
                                name={"Quantity"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderText}
                                required={true}
                                className=" withoutBorder"
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`${CONSTANT.ASSEMBLY} ${CONSTANT.PART} ${CONSTANT.NUMBER}`}
                                name={"AssemblyPartNumberMark"}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`BOM Level`}
                                name={"BOMLevel"}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                                disabled={this.state.isBOMDisabled}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`ECO ${CONSTANT.NUMBER}`}
                                name={"EcoNumber"}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`${CONSTANT.REVISION} ${CONSTANT.NUMBER}`}
                                name={"RevisionNumber"}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label="Material Type"
                                name="MaterialTypeId"
                                type="text"
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                component={searchableSelect}
                                //validate={[required, maxLength50]}
                                options={this.renderBOMTypeListing('material')}
                                //options={options}
                                //required={true}
                                handleChangeDescription={this.materialTypeHandler}
                                valueDescription={this.state.materialType}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={'Unit Of Measurement'}
                                name={'UnitOfMeasurementId'}
                                type="text"
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                component={searchableSelect}
                                //validate={[required]}
                                options={this.renderBOMTypeListing('uom')}
                                //required={true}
                                handleChangeDescription={this.uomHandler}
                                valueDescription={this.state.selectedUOM}
                            />
                        </Col>
                        <Col md="6">
                            <Field
                                label={`Plant`}
                                name={"PlantId"}
                                type="text"
                                placeholder={''}
                                validate={[required]}
                                required={true}
                                options={this.renderBOMTypeListing('plant')}
                                onChange={this.plantHandler}
                                optionValue={'Value'}
                                optionLabel={'Text'}
                                component={renderSelectField}
                                className=" withoutBorder custom-select"
                            />
                        </Col>
                    </Row>
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

        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ part, comman, billOfMaterial }) {
    const { uniOfMeasurementList, partData, materialTypeList } = part;
    const { BOMListing } = billOfMaterial;
    const { partList, plantList } = comman;

    let initialValues = {};
    if (partData && partData !== undefined) {
        initialValues = {
            PartNumber: partData.PartNumber,
            PartName: partData.PartName,
            MaterialTypeId: partData.MaterialTypeId,
            MaterialGroupCode: partData.MaterialGroupCode,
            PlantId: partData.PlantId,
            UnitOfMeasurementId: partData.UnitOfMeasurementId,
            PartDescription: partData.PartDescription,
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
    fetchPlantDataAPI
})(reduxForm({
    form: 'PartBOMRegister',
    enableReinitialize: true,
})(PartBOMRegister));
