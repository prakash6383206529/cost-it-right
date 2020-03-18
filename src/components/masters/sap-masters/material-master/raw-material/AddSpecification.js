import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../../helper/validation";
import { renderText, renderSelectField } from "../../../../layout/FormInputs";
import {
    createRMSpecificationAPI, updateRMSpecificationAPI, getRMSpecificationDataAPI,
    getRowMaterialDataAPI,
} from '../../../../../actions/master/Material';
import { getMaterialTypeSelectList } from '../../../../../actions/costing/CostWorking';
import { fetchRowMaterialAPI, fetchRMGradeAPI } from '../../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../../helper/auth";

class AddSpecification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            GradeId: '',
            isEditFlag: false
        }
    }

    /**
    * @method componentWillMount
    * @description Called before render the component
    */
    componentWillMount() {
        this.props.fetchRowMaterialAPI(res => { });
        this.props.getMaterialTypeSelectList(() => { })
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        const { SpecificationId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getRMSpecificationDataAPI(SpecificationId, res => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    this.props.fetchRMGradeAPI(Data.MaterialTypeId, res => { })
                }
            });
        } else {
            this.props.getRMSpecificationDataAPI('', res => { });
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel('5');
    }

    /**
    * @method handleMaterialChange
    * @description  used to material change and get grade's
    */
    handleMaterialChange = (e) => {
        this.props.fetchRMGradeAPI(e.target.value, res => { })
    }

    /**
    * @method handleGrade
    * @description  used to handle type of listing change
    */
    handleGrade = (e) => {
        this.setState({ GradeId: e })
    }

    /**
    * @method renderTypeOfListing
    * @description Used show listing of row material
    */
    renderTypeOfListing = (label) => {
        const { rowMaterialList, rmGradeList, MaterialSelectList } = this.props;
        const temp = [];
        if (label === 'rmList') {
            rowMaterialList && rowMaterialList.map(item =>
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

        if (label === 'material') {
            MaterialSelectList && MaterialSelectList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { SpecificationId, isEditFlag } = this.props;

        values.CreatedBy = loggedInUserId();

        if (isEditFlag) {
            let formData = {
                SpecificationId: SpecificationId,
                Specification: values.Specification,
                Description: values.Description,
                GradeId: values.GradeId,
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
                GradeName: '',
                MaterialTypeId: values.MaterialTypeId,
                MaterialTypeName: '',
            }
            this.props.updateRMSpecificationAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.SPECIFICATION_UPDATE_SUCCESS);
                    this.toggleModel();
                    this.props.getRowMaterialDataAPI(res => { });
                }
            })
        } else {

            this.props.createRMSpecificationAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.SPECIFICATION_ADD_SUCCESS);
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Specification' : 'Add Specification'}</ModalHeader>
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
                                                label={'Material Type'}
                                                name={"MaterialTypeId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderTypeOfListing('material')}
                                                onChange={(Value) => this.handleMaterialChange(Value)}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.GRADE}`}
                                                name={"GradeId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderTypeOfListing('rmGrade')}
                                                onChange={this.handleGrade}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.SPECIFICATION}`}
                                                name={"Specification"}
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
    const { rowMaterialList, rmGradeList } = comman;
    const { specificationData } = material;
    const { MaterialSelectList } = costWorking;
    let initialValues = {};
    if (specificationData && specificationData != undefined) {
        initialValues = {
            MaterialTypeId: specificationData.MaterialTypeId,
            GradeId: specificationData.GradeId,
            Specification: specificationData.Specification,
            Description: specificationData.Description,
        }
    }

    return { rowMaterialList, rmGradeList, MaterialSelectList, specificationData, initialValues }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
    createRMSpecificationAPI,
    fetchRowMaterialAPI,
    fetchRMGradeAPI,
    getMaterialTypeSelectList,
    updateRMSpecificationAPI,
    getRMSpecificationDataAPI,
    updateRMSpecificationAPI,
    getRowMaterialDataAPI,
})(reduxForm({
    form: 'AddSpecification',
    enableReinitialize: true,
})(AddSpecification));
