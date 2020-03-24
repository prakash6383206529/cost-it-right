import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col } from 'reactstrap';
import {
    getSendForApprovalByCostingId, getAllApprovalDepartment, getAllApprovalUserByDepartment,
    sendForApproval, approvalProcess, finalApprovalProcess, getReasonSelectList,
} from '../../../actions/costing/Approval';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { required, isGuid } from "../../../helper/validation";
import { searchableSelect, renderTextAreaField } from "../../layout/FormInputs";
import { reactLocalStorage } from "reactjs-localstorage";
import { userDetails, loggedInUserId } from "../../../helper/auth";
import { PENDING, DRAFT, WAITING_FOR_APPROVAL, FINAL_APPROVAL } from '../../../config/constants';

class Approval extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            department: [],
            user: [],
            reason: [],
            LevelId: '',
            remarks: '',
            isRejected: false,
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { costingId, supplierId } = this.props;
        this.props.getReasonSelectList(() => { })
        this.props.getAllApprovalDepartment(() => { })
        this.props.getSendForApprovalByCostingId(costingId, (res) => {
            if (res && res.data && res.data.Data) {
                let Data = res.data.Data;
                setTimeout(() => { this.getData(Data) }, 500)
            }
        })
    }

    getData = (Data) => {
        const { reasonsList, costingStatusText } = this.props;
        if (costingStatusText != DRAFT) {
            const tempObj = reasonsList.find(item => item.Value == Data.ReasonId)
            this.setState({ reason: { label: tempObj.Text, value: tempObj.Value } });
        }
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
                        //UserId: userDetails.LoggedInUserId,
                        LoggedInUserId: userDetails.LoggedInUserId,
                        DepartmentId: department.value,
                        TechnologyId: this.props.TechnologyId,
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
        const { approvalUsersList } = this.props;
        if (newValue && newValue != null) {
            let tempObj = approvalUsersList.find(item => item.Value == newValue.value)
            this.setState({ user: newValue, LevelId: tempObj.LevelId });
        } else {
            this.setState({ LevelId: '', user: [] })
        }
    };

    /**
    * @method reasonHandler
    * @description Used to handle reason
    */
    reasonHandler = (newValue, actionMeta) => {
        this.setState({ reason: newValue });
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

    /**
    * @method handleMessageChange
    * @description used remarks handler
    */
    handleMessageChange = (e) => {
        this.setState({
            remarks: e.target.value
        })
    }

    onSubmit = (values) => {

        const { user, reason, LevelId, isRejected } = this.state;
        const { costingId, costingStatusText, approvalUsersList } = this.props;

        let tempObj = undefined;
        if (approvalUsersList != undefined) {
            tempObj = approvalUsersList.find(item => item.Text == FINAL_APPROVAL)
        }

        let userDetail = userDetails();
        const loginUserId = loggedInUserId();
        let requestData = {};

        //Send for approval, When costing status Draft.
        if (costingStatusText == DRAFT) {
            requestData = {
                CostingId: costingId,
                LoggedInUserId: loginUserId,
                SenderReasonId: reason.value,
                SenderRemark: values.Remarks,
                SenderLevelId: userDetail.LoggedInLevelId,
                ReceiverUserId: user.value,
                ReceiverLevelId: LevelId,
                CostVariancIdRef: '',
            }
            this.props.sendForApproval(requestData, (res) => {
                toastr.success(MESSAGES.COSTING_SENT_FOR_APPROVAL_SUCCESSFULLY)
                this.props.onCancelApproval();
            })
        }

        //Send for approval(to the next level), When costing status waiting for approval.
        if (costingStatusText == WAITING_FOR_APPROVAL && tempObj == undefined) {
            requestData = {
                CostingApprovalId: '',
                CostingId: costingId,
                IsApproved: isRejected ? false : true,
                ReceiverUserId: isRejected ? '' : user.value,
                ReceiverReasonId: reason.value,
                ReceiverLevelId: isRejected ? '' : LevelId,
                ReceiverRemark: values.Remarks,
                IsReceived: true,
                IsSendForNextLevel: isRejected ? false : true,
                LoggedInUserId: loginUserId,
                SenderReasonId: reason.value,
                SenderRemark: values.Remarks,
                SenderLevelId: userDetail.LoggedInLevelId,
            }
            this.props.approvalProcess(requestData, (res) => {
                toastr.success(MESSAGES.COSTING_SENT_FOR_APPROVAL_SUCCESSFULLY)
                this.props.onCancelApproval();
            })
        }

        //Final approval, When costing status waiting for approval.
        if (costingStatusText == WAITING_FOR_APPROVAL && tempObj != undefined) {
            requestData = {
                CostingApprovalId: '',
                CostingId: costingId,
                CostingStatusId: '',
                IsFinalApproval: true,
                IsApproved: isRejected ? false : true,
                LoggedInUserId: loginUserId,
                ReceiverRemark: values.Remarks,
            }
            this.props.finalApprovalProcess(requestData, (res) => {
                toastr.success(MESSAGES.COSTING_SENT_FOR_APPROVAL_SUCCESSFULLY)
                this.props.onCancelApproval();
            })
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, reset, costingStatusText, approvalData, reAssign } = this.props;

        let formHeading = '';
        if (costingStatusText == DRAFT || costingStatusText == PENDING) {
            formHeading = 'Send For Approval';
        } else if (costingStatusText == WAITING_FOR_APPROVAL) {
            formHeading = 'Approve';
        }

        return (
            <>
                <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit)}
                >
                    <Row>
                        <Col>
                            <h2>{formHeading}</h2>
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
                                //disabled={approvalData && approvalData != undefined ? isGuid(approvalData.ReasonId) : false}
                                disabled={costingStatusText != DRAFT ? true : false}
                            />
                        </Col>
                    </Row>
                    <Row className="mt20">
                        <Col>
                            <Field
                                label={'Remarks'}
                                name={`Remarks`}
                                placeholder="Type your message here..."
                                value={this.state.remarks}
                                className="withoutBorder"
                                onChange={this.handleMessageChange}
                                //validate={[required, maxLength5000]}
                                //required={true}
                                component={renderTextAreaField}
                                maxLength="5000"
                            />
                        </Col>
                    </Row>

                    <Row className="sf-btn-footer no-gutters justify-content-between">
                        <div className="col-sm-12 text-center">
                            <button type="submit" className="btn mr20 btn-primary" >
                                {(costingStatusText == DRAFT || costingStatusText == PENDING) ? 'Send For Approval' : 'Approve'}
                            </button>

                            {costingStatusText == WAITING_FOR_APPROVAL &&
                                <button
                                    type="submit"
                                    className="btn mr20 btn-primary"
                                    onClick={() => this.setState({ isRejected: true })} >
                                    {'Reject'}
                                </button>}

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
    approvalProcess,
    finalApprovalProcess,
    getReasonSelectList,
})(reduxForm({
    form: 'Approval',
    enableReinitialize: true,
})(Approval));