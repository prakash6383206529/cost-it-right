import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../../helper/validation";
import { renderText, renderSelectField } from "../../../../layout/FormInputs";
import { createRMGradeAPI, getRMGradeDataAPI, updateRMGradeAPI, getRowMaterialDataAPI } from '../../../../../actions/master/Material';
import { getMaterialTypeSelectList } from '../../../../../actions/costing/CostWorking';
import { fetchRowMaterialAPI } from '../../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../../helper/auth";

class AddGrade extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            MaterialId: '',
            isEditFlag: false
        }
    }

    /**
    * @method componentWillMount
    * @description call before rendering the component
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
        const { GradeId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getRMGradeDataAPI(GradeId, res => {
                if (res && res.data && res.data.Result) {
                    let Data = res.data.Data;
                    const { MaterialSelectList } = this.props;
                    const tempObj = MaterialSelectList.find(item => item.Value == Data.MaterialTypeId)
                    this.setState({
                        MaterialId: tempObj.Value
                    });

                }
            });
        } else {
            this.props.getRMGradeDataAPI('', res => { });
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
    handleMaterial = (e) => {
        this.setState({
            MaterialId: e.target.value
        })
    }

    /**
    * @method renderTypeOfListing
    * @description Used show listing of row material
    */
    renderTypeOfListing = (label) => {
        const { rowMaterialList, MaterialSelectList } = this.props;
        const temp = [];

        // if (label === 'raw-material') {
        //     rowMaterialList && rowMaterialList.map(item =>
        //         temp.push({ Text: item.Text, Value: item.Value })
        //     );
        //     return temp;
        // }

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
        const { GradeId, isEditFlag } = this.props;
        const { MaterialId } = this.state;

        values.CreatedBy = loggedInUserId();

        if (isEditFlag) {
            let formData = {
                GradeId: GradeId,
                Grade: values.Grade,
                Description: values.Description,
                MaterialTypeId: MaterialId,
                MaterialTypeName: '',
                Density: '',
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
            }
            this.props.updateRMGradeAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.RM_GRADE_UPDATE_SUCCESS);
                    this.toggleModel();
                    this.props.getRowMaterialDataAPI(res => { });
                }
            })
        } else {
            this.props.createRMGradeAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.GRADE_ADD_SUCCESS);
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
        const { handleSubmit } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{`${CONSTANT.ADD} ${CONSTANT.GRADE}`}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row>
                                        <Col md="4">
                                            <Field
                                                label={'Material'}
                                                name={"MaterialId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('material')}
                                                onChange={this.handleMaterial}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label={`${CONSTANT.GRADE}`}
                                                name={"Grade"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="4">
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
                                        </Col>

                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {CONSTANT.SAVE}
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
    const { rowMaterialList } = comman;
    const { MaterialSelectList } = costWorking;
    const { gradeData } = material;
    let initialValues = {};

    if (gradeData && gradeData != undefined) {
        initialValues = {
            MaterialId: gradeData.MaterialTypeId,
            Grade: gradeData.Grade,
            Description: gradeData.Description,
        }
    }
    return { rowMaterialList, MaterialSelectList, gradeData, initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
    {
        createRMGradeAPI,
        fetchRowMaterialAPI,
        getMaterialTypeSelectList,
        getRMGradeDataAPI,
        updateRMGradeAPI,
        getRowMaterialDataAPI,
    })(reduxForm({
        form: 'AddGrade',
        enableReinitialize: true,
    })(AddGrade));
