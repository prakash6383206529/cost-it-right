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

class AddReason extends Component {
    constructor(props) {
        super(props);
        this.state = {
            IsActive: false,
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { ReasonId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getReasonAPI(ReasonId, res => {
                    if (res && res.data && res.data.Data) {
                        const Data = res.data.Data;
                        this.setState({ IsActive: Data.IsActive })
                    }
                })
            })
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
    * @method activeHandler
    * @description Used to cancel modal
    */
    activeHandler = () => {
        this.setState({
            IsActive: !this.state.IsActive
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {

        /** Update detail of the existing UOM  */
        if (this.props.isEditFlag) {
            const { ReasonId } = this.props;
            this.setState({ isSubmitted: true });
            let formData = {
                ReasonId: ReasonId,
                ECostingStatus: 0,
                Reason: values.Reason,
                IsActive: this.state.IsActive,
                CreatedBy: loggedInUserId(),
                CreatedDate: '',
            }
            this.props.updateReasonAPI(formData, (res) => {
                //if (res & res.data && res.data.Result) {
                console.log(res.data.Result)
                toastr.success(MESSAGES.UPDATE_REASON_SUCESS);
                this.props.setEmptyReason();
                this.props.onCancel();
                //}
            });
        } else {
            /** Add detail for creating new UOM  */
            values.IsActive = this.state.IsActive;

            this.props.createReasonAPI(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.REASON_ADD_SUCCESS);
                    this.props.onCancel();
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
        const { handleSubmit, isEditFlag, reset } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Reason' : 'Add Reason'}</ModalHeader>
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
                                                label="Reason"
                                                name={"Reason"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <label
                                                className="custom-checkbox"
                                                onChange={this.activeHandler}
                                            >
                                                Is Active
                                                <input type="checkbox" checked={this.state.IsActive} />
                                                <span
                                                    className=" before-box"
                                                    checked={this.state.IsActive}
                                                    onChange={this.activeHandler}
                                                />
                                            </label>
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
