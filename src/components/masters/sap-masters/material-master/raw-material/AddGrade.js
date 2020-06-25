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
import Drawer from '@material-ui/core/Drawer';

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
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.toggleDrawer('')
    }

    toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        this.props.closeDrawer('')
    };




    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { GradeId, isEditFlag, material } = this.props;
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

            values.MaterialId = material.value;

            this.props.createRMGradeAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.GRADE_ADD_SUCCESS);
                    this.toggleDrawer('')
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
            <>
                <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
                    <Container>
                        <div className={'drawer-wrapper'}>
                            <form
                                noValidate
                                className="form"
                                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                            >
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={'header-wrapper left'}>
                                            <h3>{isEditFlag ? 'Update RM Grade' : 'Add RM Grade'}</h3>
                                        </div>
                                        <div
                                            onClick={(e) => this.toggleDrawer(e)}
                                            className={'close-button right'}>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <Field
                                            label={`RM Grade`}
                                            name={"Grade"}
                                            type="text"
                                            placeholder={''}
                                            validate={[required]}
                                            component={renderText}
                                            required={true}
                                            className=" "
                                            customClassName=" withBorder"
                                        />
                                    </Col>
                                </Row>
                                <Row className="sf-btn-footer no-gutters justify-content-between">
                                    <div className="col-md-12">
                                        <div className="text-center ">
                                            <input
                                                //disabled={pristine || submitting}
                                                onClick={this.cancel}
                                                type="button"
                                                value="Cancel"
                                                className="reset mr15 cancel-btn"
                                            />
                                            <input
                                                //disabled={isSubmitted ? true : false}
                                                type="submit"
                                                value={isEditFlag ? 'Update' : 'Save'}
                                                className="submit-button mr5 save-btn"
                                            />
                                        </div>
                                    </div>
                                </Row>
                            </form>
                        </div>
                    </Container>
                </Drawer>
            </>
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
