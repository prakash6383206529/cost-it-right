import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField, renderMultiSelectField, searchableSelect } from "../../../layout/FormInputs";
import { fetchBOMComboAPI, fetchPlantDataAPI } from '../../../../actions/master/Comman';
import { createBOMAPI } from '../../../../actions/master/BillOfMaterial';
import { getAllRawMaterialList } from '../../../../actions/master/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'

class AddBOM extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false,
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
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.fetchBOMComboAPI(res => { });
        this.props.fetchPlantDataAPI(() => { })
        this.props.getAllRawMaterialList(() => { });
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
    * @method handlePartSelection
    * @description called
    */
    handlePartSelection = e => {
        this.setState({
            selectedParts: e
        });
    };

    /**
     * @method renderSelectPartList
     * @description called
     */
    renderSelectPartList = () => {
        const { partList } = this.props;
        const temp = [];
        partList && partList.map(item => {
            if (item.Value != 0) {
                temp.push({ Text: item.Text, Value: item.Value })
            }
        }
        );
        return temp;
    }

    renderAssyPartList = () => {
        const { partList } = this.props;
        let temp = [];
        partList && partList.map(item =>
            temp.push({ label: item.Text, value: item.Value })
        );
        return temp;
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
        const formData = {
            IsAddNewChildPart: false,
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
            MaterialTypeId: "",
            RawMaterialId: materialType.value,
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
                formData.PartId = assyPartNo.value;
                formData.PartNumber = assyPartNo.label;
            } else {
                formData.PartId = ChildPart.value;
                formData.PartNumber = ChildPart.label;
            }
        }

        this.props.createBOMAPI(formData, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.BOM_ADD_SUCCESS);
                this.toggleModel();
            } else {
                toastr.error(res.data.message);
            }
        });
    }

    /**
    * @method renderTypeOfListing
    * @description Used show type of listing
    */
    renderTypeOfListing = (label) => {
        const { uniOfMeasurementList, partList, rowMaterialDetail, plantList } = this.props;
        const temp = [];
        if (label === 'material') {
            rowMaterialDetail && rowMaterialDetail.map(item =>
                temp.push({ label: item.RawMaterialName, value: item.RawMaterialId })
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
            this.props.change("AssemblyPartNumberMark", assyPartNo.label)
            if (assyPartNo.value == ChildPart.value) {
                this.props.change("BOMLevel", 0)
                this.setState({ isBOMDisabled: true })
            } else {
                this.props.change("BOMLevel", '')
                this.setState({ isBOMDisabled: false })
            }
        } else {
            this.props.change("AssemblyPartNumberMark", assyPartNo.label)
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
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{`${CONSTANT.ADD} ${CONSTANT.BOM}`}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
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
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`BOM Level`}
                                                name={"BOMLevel"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
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
                                                label="Raw Material Type"
                                                name="MaterialTypeId"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                options={this.renderTypeOfListing('material')}
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
                                                options={this.renderTypeOfListing('uom')}
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
                                                options={this.renderTypeOfListing('plant')}
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
                                                {`${CONSTANT.SAVE}`}
                                            </button>
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
function mapStateToProps({ comman, material }) {
    const { rowMaterialDetail } = material;
    const { uniOfMeasurementList, partList, materialTypeList, plantList } = comman;
    return { uniOfMeasurementList, materialTypeList, partList, plantList, rowMaterialDetail }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createBOMAPI,
    fetchBOMComboAPI,
    fetchPlantDataAPI,
    getAllRawMaterialList,
})(reduxForm({
    form: 'AddBOM',
    enableReinitialize: true,
})(AddBOM));
