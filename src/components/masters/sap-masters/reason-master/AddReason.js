import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, focusOnError } from "../../../layout/FormInputs";
import { createReasonAPI, getReasonAPI, updateReasonAPI, setEmptyReason } from '../../../../actions/master/ReasonMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message'
import { loggedInUserId } from '../../../../helper/auth';
import ReasonListing from './ReasonListing';
import $ from 'jquery';

class AddReason extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            IsActive: false,
            isEditFlag: false,
            ReasonId: '',
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {

    }

    /**
    * @method activeHandler
    * @description Used to for status
    */
    activeHandler = () => {
        this.setState({ IsActive: !this.state.IsActive })
    }

    /**
    * @method getDetail
    * @description used to get user detail
    */
    getDetail = (data) => {
        if (data && data.isEditFlag) {
            this.setState({
                isLoader: true,
                isEditFlag: true,
                isShowForm: true,
                ReasonId: data.ID,
            })
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getReasonAPI(data.ID, res => {
                if (res && res.data && res.data.Data) {
                    const Data = res.data.Data;
                    this.setState({ IsActive: Data.IsActive })
                }
            })
        }
    }

    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    clearForm = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            IsActive: false,
            isShowForm: false,
            isEditFlag: false,
        })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        this.clearForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { ReasonId, isEditFlag } = this.state;
        const { reset } = this.props;

        /** Update detail of the existing UOM  */
        if (isEditFlag) {
            let formData = {
                ReasonId: ReasonId,
                Reason: values.Reason,
                IsActive: this.state.IsActive,
                CreatedBy: loggedInUserId(),
                CreatedDate: '',
            }
            this.props.updateReasonAPI(formData, (res) => {
                //if (res & res.data && res.data.Result) {
                toastr.success(MESSAGES.UPDATE_REASON_SUCESS);
                this.clearForm()
                this.props.setEmptyReason();
                this.child.getUpdatedData();
                //}
            });
        } else {

            /** Add detail for creating new UOM  */
            values.IsActive = this.state.IsActive;
            values.CreatedBy = loggedInUserId();
            values.CreatedDate = '';

            this.props.createReasonAPI(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.REASON_ADD_SUCCESS);
                    this.clearForm()
                    this.props.setEmptyReason();
                    this.child.getUpdatedData();
                }
            });
        }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset, pristine, submitting } = this.props;
        return (
            <div>
                {/* {isLoader && <Loader />} */}
                <div className="login-container signup-form">
                    <div className="row">
                        {this.state.isShowForm &&
                            <div className="col-md-12">
                                <div className="shadow-lgg login-formg pt-30">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-heading mb-0">
                                                <h2>{this.state.isEditFlag ? 'Update Reason Master' : 'Add Reason Master'}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <form
                                        noValidate
                                        className="form"
                                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                    >
                                        <Row>

                                            <Col md="6">
                                                <Field
                                                    label={`Reason`}
                                                    name={"Reason"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                    disabled={this.state.isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="6">
                                                <Col className={'pull-right'}>
                                                    <label
                                                        className="custom-checkbox pull-right"
                                                        onChange={this.activeHandler}
                                                    >
                                                        Status
                                                <input type="checkbox" checked={this.state.IsActive} />
                                                        <span
                                                            className=" before-box"
                                                            checked={this.state.IsActive}
                                                            onChange={this.activeHandler}
                                                        />
                                                    </label>
                                                </Col>
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
                                                        value={this.state.isEditFlag ? 'Update' : 'Save'}
                                                        className="submit-button mr5 save-btn"
                                                    />
                                                </div>
                                            </div>
                                        </Row>
                                    </form>
                                </div>
                            </div>}
                    </div>
                </div>
                <ReasonListing
                    onRef={ref => (this.child = ref)}
                    getDetail={this.getDetail}
                    formToggle={this.formToggle}
                    isShowForm={this.state.isShowForm}
                />
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ reason }) {
    const { reasonData } = reason;
    let initialValues = {};
    if (reasonData && reasonData !== undefined) {
        initialValues = {
            Reason: reasonData.Reason,
        }
    }
    return { reasonData, initialValues };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createReasonAPI,
    getReasonAPI,
    updateReasonAPI,
    setEmptyReason,
})(reduxForm({
    form: 'AddReason',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(AddReason));
