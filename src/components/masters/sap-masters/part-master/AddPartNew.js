import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import {
    renderText, renderSelectField, renderCheckboxInputField, renderMultiSelectField,
    searchableSelect
} from "../../../layout/FormInputs";
import {
    createNewPartAPI, updatePartsAPI, getOnePartsAPI, updateNewPartsAPI, getNewPartsDataAPI, getAllPartsAPI,
    getAllNewPartsAPI
} from '../../../../actions/master/Part';
import { fetchPartComboAPI } from '../../../../actions/master/Comman';
import { getAllBOMAPI } from '../../../../actions/master/BillOfMaterial';
import { getAllRawMaterialList } from '../../../../actions/master/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId, userDetails } from "../../../../helper/auth";
const userDetail = userDetails()

class AddPartNew extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false,
            IsPartAssociatedWithBOM: false,
            selectedBOMs: [],
            materialType: [],
            selectedUOM: [],
            selectedPlant: [],
        }
    }

    /**
    * @method componentWillMount
    * @description Called before rendering the component
    */
    componentWillMount() {
        this.props.fetchPartComboAPI(res => { });
        this.props.getAllBOMAPI(res => { });
        this.props.getAllRawMaterialList(() => { });
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        const { partId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getNewPartsDataAPI(partId, res => {
                    if (res && res.data && res.data.Data) {
                        let Data = res.data.Data;
                        setTimeout(() => { this.getData(Data) }, 500)
                    }
                })
            })
        } else {
            this.props.getNewPartsDataAPI('', res => { })
        }
    }

    /**
    * @method getData
    * @description 
    */
    getData = (Data) => {
        const { uniOfMeasurementList, plantList, rowMaterialDetail } = this.props;
        const UOMObj = uniOfMeasurementList.find(item => item.Value == Data.UnitOfMeasurementId)
        const PlantObj = plantList.find(item => item.Value == Data.PlantId)
        const RMObj = rowMaterialDetail.find(item => item.RawMaterialId == Data.RawMaterialId)
        this.setState({
            materialType: { label: RMObj.RawMaterialName, value: RMObj.RawMaterialId },
            selectedUOM: { label: UOMObj.Text, value: UOMObj.Value },
            selectedPlant: { label: PlantObj.Text, value: PlantObj.Value },
        });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
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
    * @method renderListing
    * @description Used show select listings
    */
    renderListing = (label) => {
        const { uniOfMeasurementList, plantList, rowMaterialDetail, materialTypeList } = this.props;
        const temp = [];

        if (label === 'material') {
            temp.push({ Text: "--Select Material Type--", Value: 0 })
            rowMaterialDetail && rowMaterialDetail.map(item =>
                temp.push({ label: item.RawMaterialName, value: item.RawMaterialId })
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
    }

    onPressAssociatedWithBOM = () => {
        this.setState({ IsPartAssociatedWithBOM: !this.state.IsPartAssociatedWithBOM });
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { selectedPlant, materialType, selectedUOM } = this.state;
        /** Updating the existing part master detail **/

        let formData = {}
        if (this.props.isEditFlag) {

            const { partId } = this.props;
            this.setState({ isSubmitted: true });
            formData = {
                PartId: partId,
                PlantName: selectedPlant.label,
                CompanyName: '',
                MaterialTypeName: materialType.label,
                UnitOfMeasurementName: selectedUOM.label,
                RawMaterialName: '',
                TechnologyName: '',
                PartTypeName: '',
                CreatedByName: '',
                BillOfMaterialId: '',
                BOMLevel: 0,
                CreatedBy: loggedInUserId(),
                CreatedDate: '',
                IsActive: true,
                IsExistPart: true,
                Quantity: 1,
                RevisionNumber: values.RevisionNumber,
                EcoNumber: values.EcoNumber,
                PartNumber: values.PartNumber,
                PartName: values.PartName,
                PartDescription: values.PartDescription,
                IndustrialIdentity: values.PartName,
                MaterialGroupCode: values.MaterialGroupCode,
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
                BOMNumber: values.BOMNumber
            }
            this.props.updateNewPartsAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_PART_SUCESS);
                    this.props.getAllNewPartsAPI(res => { })
                    this.toggleModel();
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });

        } else {

            /** Adding new part master detail **/
            formData = {
                PartId: '',
                CreatedBy: loggedInUserId(),
                CreatedDate: '',
                IsActive: true,
                IsExistPart: true,
                Quantity: 1,
                RevisionNumber: values.RevisionNumber,
                EcoNumber: values.EcoNumber,
                PartNumber: values.PartNumber,
                PartName: values.PartName,
                PartDescription: values.PartDescription,
                IndustrialIdentity: values.PartName,
                MaterialGroupCode: values.MaterialGroupCode,
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
                BOMNumber: values.BOMNumber
            }

            this.props.createNewPartAPI(formData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.PART_ADD_SUCCESS);
                    this.props.getAllNewPartsAPI(res => { })
                    this.toggleModel();
                } else {
                    toastr.error(res.data.message);
                }
            });
        }

    }



    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset, partData } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Part' : 'Add Part'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row>
                                        {/* {isEditFlag == false &&
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
                                            </Col>} */}
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Part Number`}
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
                                                label={`Industrial Part Name`}
                                                name={"PartName"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>

                                        <Col md="4">
                                            <Field
                                                label={`BOM Number`}
                                                name={"BOMNumber"}
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
                                                label={`Material Group Code`}
                                                name={"MaterialGroupCode"}
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
                                                label={`ECO Number`}
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
function mapStateToProps({ part, comman, billOfMaterial, material }) {
    const { rowMaterialDetail } = material;
    const { uniOfMeasurementList, partData, newPartData, materialTypeList } = part;
    const { BOMListing } = billOfMaterial;
    const { plantList } = comman
    let initialValues = {};
    if (newPartData && newPartData !== undefined) {
        initialValues = {
            PartNumber: newPartData.PartNumber,
            PartName: newPartData.PartName,
            RawMaterialId: newPartData.MaterialTypeId,
            MaterialGroupCode: newPartData.MaterialGroupCode,
            PlantId: newPartData.PlantId,
            UnitOfMeasurementId: newPartData.UnitOfMeasurementId,
            BOMNumber: newPartData.BOMNumber,
            EcoNumber: newPartData.EcoNumber,
            RevisionNumber: newPartData.RevisionNumber,
            PartDescription: newPartData.PartDescription,
        }
    }
    return { uniOfMeasurementList, initialValues, materialTypeList, plantList, partData, newPartData, BOMListing, rowMaterialDetail }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createNewPartAPI,
    updatePartsAPI,
    getOnePartsAPI,
    fetchPartComboAPI,
    getAllPartsAPI,
    getAllNewPartsAPI,
    getNewPartsDataAPI,
    updateNewPartsAPI,
    getAllBOMAPI,
    getAllRawMaterialList,
})(reduxForm({
    form: 'AddPartNew',
    enableReinitialize: true,
})(AddPartNew));
