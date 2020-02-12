import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input, Table } from 'reactstrap';
import {
    getSendForApprovalByCostingId, getAllApprovalDepartment, getAllApprovalUserByDepartment,
    sendForApproval, getReasonSelectList,
} from '../../../actions/costing/Approval';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { convertISOToUtcDate } from '../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import NoContentFound from '../../common/NoContentFound';
import { required } from "../../../helper/validation";
import { renderText, renderNumberInputField, searchableSelect, renderTextAreaField } from "../../layout/FormInputs";
import { reactLocalStorage } from "reactjs-localstorage";
import { loggedInUserId } from "../../../helper/auth";

class Approval extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            department: [],
            user: [],
            reason: [],
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { costingId, supplierId } = this.props;
        this.props.getSendForApprovalByCostingId(costingId, () => { })
        this.props.getAllApprovalDepartment(() => { })
        this.props.getReasonSelectList(() => { })
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancelApproval();
    }

    /**
    * @method renderList
    * @description Used renderList for searchable dropdown
    */
    renderList = (label) => {
        const { approvalDepartmentList, approvalUsersList, reasonsList } = this.props;
        const temp = [];

        if (label === 'department') {
            approvalDepartmentList && approvalDepartmentList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'users') {
            approvalUsersList && approvalUsersList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'reason') {
            reasonsList && reasonsList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
    }

    /**
    * @method departmentHandler
    * @description Used to handle 
    */
    departmentHandler = (newValue, actionMeta) => {
        let userDetails = reactLocalStorage.getObject("userDetail");
        if (newValue && newValue != null) {
            this.setState({ department: newValue, user: [] }, () => {
                const { department } = this.state;
                if (department && department.value != '') {
                    let requestData = {
                        UserId: userDetails.LoggedInUserId,
                        DepartmentId: department.value,
                    }
                    this.props.getAllApprovalUserByDepartment(requestData, () => { })
                }
            });
        } else {
            this.setState({ department: [], user: [] })
        }
    };

    /**
    * @method userHandler
    * @description Used to handle 
    */
    userHandler = (newValue, actionMeta) => {
        this.setState({ user: newValue }, () => {
        });
    };

    /**
    * @method reasonHandler
    * @description Used to handle reason
    */
    reasonHandler = (newValue, actionMeta) => {
        this.setState({ reason: newValue }, () => {
        });
    };

    /**
    * @method cancel
    * @description used to cancel form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            department: [],
            user: [],
        })
        this.props.onCancelApproval();
    }

    /**
    * @method resetForm
    * @description used to cancel reset
    */
    resetForm = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            department: [],
            user: [],
        })
    }

    onSubmit = (values) => {
        console.log('Approval form')
        const { department, user, reason } = this.state;
        const { costingId, approvalData } = this.props;
        const loginUserId = loggedInUserId();

        // let requestData = {
        //     CostingId: costingId,
        //     CostingStatusId: "",
        //     IsFinalApproval: false,
        //     IsApproved: true,
        //     Remark: values.Remarks,
        //     LevelId: "",
        //     UserId: user.value,
        //     TechnologyId: approvalData.TechnologyId,
        // }

        let requestData = {
            CostingId: costingId,
            IsFinalApproval: false,
            IsApproved: true,
            CostingApprovalId: '',
            LoggedInUserId: loginUserId,
            SenderReasonId: reason.value,
            SenderRemark: values.Remarks,
            SenderLevelId: '', //need to bind from user data
            SentDate: '',
            ReceiverUserId: user.value,
            ReceiverLevelId: '', //need to incorporate
            ReceiverRemark: '',
            ReceivedDate: '',
            CostVariancIdRef: '',
            IsActive: true,
            TechnologyId: '',
        }

        // this.props.sendForApproval(requestData, (res) => {
        //     toastr.success(MESSAGES.COSTING_SENT_FOR_APPROVAL_SUCCESSFULLY)
        //     this.props.onCancelApproval();
        // })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, reset } = this.props;
        return (

            <>
                <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit)}
                >
                    <Row>
                        <Col>
                            <h2>Send For Approval</h2>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={"4"}>
                            <Field
                                label={'Department'}
                                name={"Department"}
                                type="text"
                                component={searchableSelect}
                                options={this.renderList('department')}
                                placeholder={'Select Department'}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                //validate={[required, maxLength50]}
                                //required={true}
                                handleChangeDescription={this.departmentHandler}
                                valueDescription={this.state.department}
                            />
                        </Col>
                        <Col md={"4"}>
                            <Field
                                label={'User'}
                                name={'user'}
                                type="text"
                                component={searchableSelect}
                                options={this.renderList('users')}
                                placeholder={'Select User'}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                //validate={[required, maxLength50]}
                                //required={true}
                                handleChangeDescription={this.userHandler}
                                valueDescription={this.state.user}
                            />
                        </Col>
                        <Col md={"4"}>
                            <Field
                                label={'Reason'}
                                name={'reason'}
                                type="text"
                                component={searchableSelect}
                                options={this.renderList('reason')}
                                placeholder={'Select Reason'}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                //validate={[required, maxLength50]}
                                //required={true}
                                handleChangeDescription={this.reasonHandler}
                                valueDescription={this.state.reason}
                            />
                        </Col>
                    </Row>
                    <Row className="mt20">
                        <Col>
                            <Field
                                label={'Remarks'}
                                name={`Remarks`}
                                placeholder="Type your message here..."
                                //onChange={this.handleMessageChange}
                                value={0}
                                className="withoutBorder"
                                //validate={[required, maxLength5000]}
                                //onChange={}
                                component={renderTextAreaField}
                                //required={true}
                                maxLength="5000"
                            />
                        </Col>
                    </Row>

                    <Row className="sf-btn-footer no-gutters justify-content-between">
                        <div className="col-sm-12 text-center">
                            <button type="submit" className="btn mr20 btn-primary" >
                                {'Send For Approval'}
                            </button>
                            <button type={'button'} className="btn mr20 btn-secondary" onClick={this.resetForm} >
                                {'Reset'}
                            </button>
                            <button type={'button'} className="btn btn-secondary" onClick={this.cancel} >
                                {'Cancel'}
                            </button>
                        </div>
                    </Row>
                </form>
            </>

        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const { approval } = state;
    const { approvalData, approvalDepartmentList, approvalUsersList, reasonsList, loading } = approval;
    let initialValues = {};

    return { loading, initialValues, approvalData, approvalDepartmentList, approvalUsersList, reasonsList }
}

export default connect(mapStateToProps, {
    getSendForApprovalByCostingId,
    getAllApprovalDepartment,
    getAllApprovalUserByDepartment,
    sendForApproval,
    getReasonSelectList,
})(reduxForm({
    form: 'Approval',
    enableReinitialize: true,
})(Approval));