import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, number } from "../../../../helper/validation";
import { renderText, renderNumberInputField, searchableSelect } from "../../../layout/FormInputs";
import {
    createDepreciationMasterAPI, getDepreciationDataAPI, getDepreciationListDataAPI,
    updateDepreciationAPI
} from '../../../../actions/master/MHRMaster';
import { getDepreciationTypeSelectList, getShiftTypeSelectList } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../helper/auth";

class AddDepreciation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            depreciation: [],
            shift: [],
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentWillMount() {
        this.props.getDepreciationTypeSelectList(() => { })
        this.props.getShiftTypeSelectList(() => { })
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { DepreciationId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getDepreciationDataAPI(DepreciationId, res => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    setTimeout(() => { this.getData(Data) }, 500)
                }
            })
        } else {
            this.props.getDepreciationDataAPI('', res => { })
        }
    }

    /**
    * @method getData
    * @description Used to get Data
    */
    getData = (Data) => {
        const { DepreciationTypeSelectList, ShiftTypeSelectList } = this.props;
        const shiftObj = ShiftTypeSelectList.find(item => item.Value == Data.Shift)
        const depreciationObj = DepreciationTypeSelectList.find(item => item.Value == Data.DepreciationType)

        this.setState({
            shift: { label: shiftObj.Text, value: shiftObj.Value },
            depreciation: { label: depreciationObj.Text, value: depreciationObj.Value },
        });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    /**
    * @method depreciationHandler
    * @description Used to handle depreciation
    */
    depreciationHandler = (newValue, actionMeta) => {
        this.setState({ depreciation: newValue });
    };

    /**
    * @method shiftHandler
    * @description Used to handle shift
    */
    shiftHandler = (newValue, actionMeta) => {
        this.setState({ shift: newValue });
    };

    /**
    * @method renderListing
    * @description Used show listing
    */
    renderListing = (label) => {
        const { DepreciationTypeSelectList, ShiftTypeSelectList } = this.props;
        const temp = [];

        if (label == 'depreciation') {
            DepreciationTypeSelectList && DepreciationTypeSelectList.map(item => {
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label == 'shift') {
            ShiftTypeSelectList && ShiftTypeSelectList.map(item => {
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { depreciation, shift } = this.state;
        const { isEditFlag, DepreciationId } = this.props;
        values.CreatedBy = loggedInUserId();

        if (isEditFlag) {

            this.setState({ isSubmitted: true });
            let formData = {
                DepreciationId: DepreciationId,
                DepreciationType: depreciation.value,
                Shift: shift.value,
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
            let reqData = {
                DepreciationType: depreciation.value,
                Shift: shift.value,
                DepreciationRate: values.DepreciationRate,
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
            }
            this.props.createDepreciationMasterAPI(reqData, (res) => {
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
                                                name="DepreciationType"
                                                type="text"
                                                label="Depreciation Type"
                                                component={searchableSelect}
                                                placeholder={'Select Depreciation'}
                                                options={this.renderListing('depreciation')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.depreciationHandler}
                                                valueDescription={this.state.depreciation}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                name="Shift"
                                                type="text"
                                                label="Shift"
                                                component={searchableSelect}
                                                placeholder={'Select Shift'}
                                                options={this.renderListing('shift')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.shiftHandler}
                                                valueDescription={this.state.shift}
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
function mapStateToProps({ MHRReducer, comman }) {
    const { depreciationData, loading } = MHRReducer;
    const { DepreciationTypeSelectList, ShiftTypeSelectList } = comman;
    let initialValues = {};
    if (depreciationData && depreciationData !== undefined) {
        initialValues = {
            DepreciationType: depreciationData.DepreciationType,
            Shift: depreciationData.Shift,
            DepreciationRate: depreciationData.DepreciationRate,
        }
    }
    return { depreciationData, loading, initialValues, DepreciationTypeSelectList, ShiftTypeSelectList }
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
    getDepreciationTypeSelectList,
    getShiftTypeSelectList,
})(reduxForm({
    form: 'AddDepreciation',
    enableReinitialize: true,
})(AddDepreciation));
