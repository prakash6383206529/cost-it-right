import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../../helper/validation";
import { renderText, renderSelectField } from "../../../../layout/FormInputs";
import { createMaterialAPI, getRawMaterialDataAPI, updateRawMaterialAPI, getRowMaterialDataAPI } from '../../../../../actions/master/Material';
import { getMaterialTypeSelectList } from '../../../../../actions/costing/CostWorking';
import { fetchPlantDataAPI, fetchRMGradeAPI, fetchSpecificationDataAPI } from '../../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../../helper/auth";

class AddMaterial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false,
            PlantId: ''
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    componentWillMount() {
        this.props.fetchPlantDataAPI(res => { });
        this.props.getMaterialTypeSelectList(() => { })
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        const { RawMaterialId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getRawMaterialDataAPI(RawMaterialId, res => {
                if (res && res.data && res.data.Result) {
                    let Data = res.data.Data;
                    this.props.fetchRMGradeAPI(Data.MaterialTypeId, res => { })
                    this.props.fetchSpecificationDataAPI(Data.RawMaterialGradeId, res => { })
                }
            });
        } else {
            this.props.getRawMaterialDataAPI('', res => { });
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel('2');
    }

    /**
    * @method renderListing
    * @description Used show plant master list
    */
    renderListing = (label) => {
        const { plantList, MaterialSelectList, rmGradeList, rmSpecification } = this.props;
        const temp = [];
        if (label === 'plant') {
            plantList && plantList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'material') {
            MaterialSelectList && MaterialSelectList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'rmGrade') {
            rmGradeList && rmGradeList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'specification') {
            rmSpecification && rmSpecification.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }


    /**
    * @method materialTypeHandler
    * @description  used to handle material type
    */
    materialTypeHandler = (e) => {
        this.props.fetchRMGradeAPI(e.target.value, res => { })
    }

    /**
    * @method handleGradeChange
    * @description  used to handle grade change
    */
    handleGradeChange = (e) => {
        this.props.fetchSpecificationDataAPI(e.target.value, res => { })
    }

    /**
    * @method handleSpecification
    * @description  used to handle specification change
    */
    handleSpecification = (e) => {

    }

    /**
    * @method plantHandler
    * @description Used to plant handle
    */
    plantHandler = (e) => {
        this.setState({
            PlantId: e.target.value
        });
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { RawMaterialId, MaterialSelectList, isEditFlag } = this.props;
        let loginUserId = loggedInUserId();

        if (isEditFlag) {

            let formData = {
                RawMaterialId: RawMaterialId,
                RawMaterialName: values.RawMaterialName,
                MaterialTypeId: values.MaterialTypeId,
                MaterialTypeName: '',
                RawMaterialGradeId: values.RawMaterialGradeId,
                RawMaterialGradeName: '',
                RawMaterialSpecificationId: values.RawMaterialSpecificationId,
                RawMaterialSpecificationName: '',
                Description: values.Description,
                PlantId: values.PlantId,
                PlantName: '',
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
                Density: 0
            }
            this.props.updateRawMaterialAPI(formData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.MATERIAL_UPDATE_SUCCESS);
                    this.toggleModel();
                    this.props.getRowMaterialDataAPI(res => { });
                }
            })

        } else {
            console.log('values', values)
            this.props.createMaterialAPI(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.MATERIAL_ADDED_SUCCESS);
                    this.toggleModel();
                }
            });
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Raw Material' : 'Add Raw Material'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Raw Material Name`}
                                                name={"RawMaterialName"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        {/* <Col md="6">
                                            <Field
                                                label={`${CONSTANT.DESCRIPTION}`}
                                                name={"Description"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col> */}
                                        <Col md="6">
                                            <Field
                                                label={`Material Type`}
                                                name={"MaterialTypeId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('material')}
                                                onChange={this.materialTypeHandler}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Grade`}
                                                name={"RawMaterialGradeId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                // required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderListing('rmGrade')}
                                                onChange={this.handleGradeChange}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Specification`}
                                                name={"RawMaterialSpecificationId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                // required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderListing('specification')}
                                                onChange={this.handleSpecification}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.PLANT}`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('plant')}
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
                                                {isEditFlag ? 'Update' : 'Add'}
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
function mapStateToProps({ comman, costWorking, material }) {
    const { plantList, rmGradeList, rmSpecification } = comman;
    const { MaterialSelectList } = costWorking;
    const { rawMaterialData } = material;

    let initialValues = {};
    if (rawMaterialData && rawMaterialData != undefined) {
        initialValues = {
            RawMaterialName: rawMaterialData.RawMaterialName,
            Description: rawMaterialData.Description,
            MaterialTypeId: rawMaterialData.MaterialTypeId,
            RawMaterialGradeId: rawMaterialData.RawMaterialGradeId,
            RawMaterialSpecificationId: rawMaterialData.RawMaterialSpecificationId,
            PlantId: rawMaterialData.PlantId,
        }
    }

    return { plantList, MaterialSelectList, rmGradeList, rmSpecification, initialValues, rawMaterialData }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
    {
        createMaterialAPI,
        fetchPlantDataAPI,
        fetchRMGradeAPI,
        getMaterialTypeSelectList,
        fetchSpecificationDataAPI,
        getRawMaterialDataAPI,
        updateRawMaterialAPI,
        getRowMaterialDataAPI,
    })(reduxForm({
        form: 'AddMaterial',
        enableReinitialize: true,
    })(AddMaterial));
