import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, number } from "../../../../helper/validation";
import { renderText, renderNumberInputField } from "../../../layout/FormInputs";
import {
    createDepreciationMasterAPI, getDepreciationDataAPI, getDepreciationListDataAPI,
    updateDepreciationAPI
} from '../../../../actions/master/MHRMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../helper/auth";

class AddDepreciation extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { DepreciationId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getDepreciationDataAPI(DepreciationId, res => { })
        } else {
            this.props.getDepreciationDataAPI('', res => { })
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
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { isEditFlag, DepreciationId } = this.props;
        values.CreatedBy = loggedInUserId();
        if (isEditFlag) {

            this.setState({ isSubmitted: true });
            let formData = {
                DepreciationId: DepreciationId,
                DepreciationType: values.DepreciationType,
                Shift: values.Shift,
                DepreciationRate: values.DepreciationRate,
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
            }
            this.props.updateDepreciationAPI(formData, (res) => {
                if (res && res.data && res.data.Result) {
                    toastr.success(MESSAGES.DEPRECIATION_UPDATE_SUCCESS);
                    this.toggleModel();
                    this.props.getDepreciationListDataAPI(res => { });
                }
            });

        } else {
            /** Add new detail of the depreciation  */
            this.props.createDepreciationMasterAPI(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.DEPRECIATION_ADD_SUCCESS);
                    this.toggleModel()
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
        const { handleSubmit, isEditFlag } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Depreciation' : 'Add Deprciation'}</ModalHeader>
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
                                                label={`${CONSTANT.DEPRECIATION} ${CONSTANT.TYPE}`}
                                                name={"DepreciationType"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.SHIFT}`}
                                                name={"Shift"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required, number]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="12">
                                            <Field
                                                label={`${CONSTANT.DEPRECIATION} ${CONSTANT.RATE}`}
                                                name={"DepreciationRate"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderNumberInputField}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save'}
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
function mapStateToProps({ MHRReducer }) {
    const { depreciationData, loading } = MHRReducer;
    let initialValues = {};
    if (depreciationData && depreciationData !== undefined) {
        initialValues = {
            DepreciationType: depreciationData.DepreciationType,
            Shift: depreciationData.Shift,
            DepreciationRate: depreciationData.DepreciationRate,
        }
    }
    return { depreciationData, loading, initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createDepreciationMasterAPI,
    getDepreciationDataAPI,
    getDepreciationListDataAPI,
    updateDepreciationAPI,
})(reduxForm({
    form: 'AddDepreciation',
    enableReinitialize: true,
})(AddDepreciation));
