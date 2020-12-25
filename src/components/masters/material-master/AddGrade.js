import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required } from "../../../helper/validation";
import { renderText, } from "../../layout/FormInputs";
import { createRMGradeAPI, getRMGradeDataAPI, updateRMGradeAPI, getRowMaterialDataAPI, getMaterialTypeSelectList } from '../actions/Material';
import { getRawMaterialSelectList } from '../../../actions/Common';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';

class AddGrade extends Component {
    constructor(props) {
        super(props);
        this.state = {
            MaterialId: '',
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        const { ID, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getRMGradeDataAPI(ID, res => { });
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
        const { ID, isEditFlag, RawMaterial } = this.props;

        if (isEditFlag) {
            let formData = {
                GradeId: ID,
                Grade: values.Grade,
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
            }
            this.props.updateRMGradeAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.RM_GRADE_UPDATE_SUCCESS);
                    this.toggleDrawer('')
                }
            })
        } else {

            values.RawMaterialId = RawMaterial.value;
            values.CreatedBy = loggedInUserId();

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
                                </form>
                                <div className="col-md-12">
                                    <Row className="sf-btn-footer no-gutters justify-content-between m-0">
                                        <div className="text-right w-100">
                                            <button
                                                onClick={this.cancel}
                                                type="submit"
                                                value="CANCEL"
                                                className="reset mr15 cancel-btn">
                                                <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div>CANCEL</button>
                                            <button
                                                type="submit"
                                                // disabled={isSubmitted ? true : false}
                                                className="btn-primary save-btn"
                                            >	<div className={'check-icon'}><i class="fa fa-check" aria-hidden="true"></i>
                                                </div>
                                                {this.props.isEditFlag ? 'UPDATE' : 'SAVE'}
                                            </button>
                                        </div>
                                    </Row>
                                </div>
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
function mapStateToProps({ comman, material }) {
    const { rowMaterialList } = comman;
    const { gradeData, MaterialSelectList } = material;
    let initialValues = {};

    if (gradeData && gradeData !== undefined) {
        initialValues = {
            Grade: gradeData.Grade,
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
        getRawMaterialSelectList,
        getMaterialTypeSelectList,
        getRMGradeDataAPI,
        updateRMGradeAPI,
        getRowMaterialDataAPI,
    })(reduxForm({
        form: 'AddGrade',
        enableReinitialize: true,
    })(AddGrade));
