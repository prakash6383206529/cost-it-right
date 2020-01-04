import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField, renderCheckboxInputField, renderMultiSelectField } from "../../../layout/FormInputs";
import { createPartAPI, updatePartsAPI, getOnePartsAPI, getAllPartsAPI } from '../../../../actions/master/Part';
import { fetchPartComboAPI } from '../../../../actions/master/Comman';
import { getAllBOMAPI } from '../../../../actions/master/BillOfMaterial';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'

class AddPart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false,
            IsPartAssociatedWithBOM: false,
            selectedBOMs: [],
        }
    }

    /**
    * @method componentWillMount
    * @description Called before rendering the component
    */
    componentWillMount() {
        this.props.fetchPartComboAPI(res => { });
        this.props.getAllBOMAPI(res => { });
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
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        /** Updating the existing part master detail **/
        if (this.props.isEditFlag) {
            const { partId } = this.props;
            this.setState({ isSubmitted: true });
            let formData = {
                PartNumber: values.PartNumber,
                PartName: values.PartName,
                IndustrialIdentity: values.PartName,
                MaterialTypeId: values.MaterialTypeId,
                MaterialGroupCode: values.MaterialGroupCode,
                UnitOfMeasurementId: values.UnitOfMeasurementId,
                PlantId: values.PlantId,
                PartDescription: values.PartDescription,
                PartId: partId,
                IsAssembly: this.state.IsPartAssociatedWithBOM,
                IsPartAssociatedWithBOM: this.state.IsPartAssociatedWithBOM,
            }
            this.props.updatePartsAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_PART_SUCESS);
                    this.props.getAllPartsAPI(res => { })
                    this.toggleModel();
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        } else { /** Adding new part master detail **/
            values.IndustrialIdentity = values.PartName;
            values.IsPartAssociatedWithBOM = this.state.IsPartAssociatedWithBOM;
            values.IsAssembly = this.state.IsPartAssociatedWithBOM;
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
                                        {isEditFlag == false &&
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
                                            </Col>}
                                        {/* <Col md="4">
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
                                        </Col> */}
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
function mapStateToProps({ part, comman, billOfMaterial }) {
    const { uniOfMeasurementList, partData, materialTypeList } = part;
    const { BOMListing } = billOfMaterial;
    const { plantList } = comman
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
    return { uniOfMeasurementList, initialValues, materialTypeList, plantList, partData, BOMListing }
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
})(reduxForm({
    form: 'AddPart',
    enableReinitialize: true,
})(AddPart));
