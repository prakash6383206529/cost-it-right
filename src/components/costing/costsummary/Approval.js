import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input, Table } from 'reactstrap';
import {
    getSendForApprovalByCostingId, getAllApprovalDepartment, getAllApprovalUserByDepartment,
    sendForApproval
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

class Approval extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            department: {},
            user: {},
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
        const { approvalDepartmentList, approvalUsersList } = this.props;
        const temp = [];

        if (label === 'department') {
            approvalDepartmentList && approvalDepartmentList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label === 'users') {
            approvalUsersList && approvalUsersList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
    }

    /**
    * @method departmentHandler
    * @description Used to handle 
    */
    departmentHandler = (newValue, actionMeta) => {
        let userDetails = reactLocalStorage.getObject("userDetail");
        this.setState({ department: newValue }, () => {
            const { department } = this.state;
            if (department && department.value != '') {
                let requestData = {
                    UserId: userDetails.LoggedInUserId,
                    DepartmentId: department.value,
                }
                this.props.getAllApprovalUserByDepartment(requestData, () => { })
            }
        });
    };

    /**
    * @method userHandler
    * @description Used to handle 
    */
    userHandler = (newValue, actionMeta) => {
        this.setState({ user: newValue }, () => {
        });
    };

    onSubmit = (values) => {
        const { department, user } = this.state;
        const { costingId, approvalData } = this.props;

        let requestData = {
            CostingId: costingId,
            CostingStatusId: "",
            IsFinalApproval: false,
            IsApproved: true,
            Remark: values.Remarks,
            LevelId: "",
            UserId: user.value,
            TechnologyId: approvalData.TechnologyId,
        }

        this.props.sendForApproval(requestData, (res) => {
            toastr.success(MESSAGES.COSTING_SENT_FOR_APPROVAL_SUCCESSFULLY)
            this.props.onCancelApproval();
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, reset } = this.props;
        return (
            <Container>
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{'Send For Approval'}</ModalHeader>
                    <ModalBody>
                        <Row>

                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit)}
                                >
                                    <Row>
                                        <Col md={"6"}>
                                            <Field
                                                label={'Department'}
                                                name={"Department"}
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                options={this.renderList('department')}
                                                //required={true}
                                                handleChangeDescription={this.departmentHandler}
                                                valueDescription={this.state.department}
                                            />
                                        </Col>
                                        <Col md={"6"}>
                                            <Field
                                                name={'user'}
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                label={'User'}
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                options={this.renderList('users')}
                                                //required={true}
                                                handleChangeDescription={this.userHandler}
                                                valueDescription={this.state.user}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
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
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {'Send For Approval'}
                                            </button>
                                            <button type={'button'} className="btn btn-secondary" onClick={reset} >
                                                {'Reset'}
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
function mapStateToProps(state) {
    const { approval } = state;
    const { approvalData, approvalDepartmentList, approvalUsersList, loading } = approval;
    let initialValues = {};

    return { loading, initialValues, approvalData, approvalDepartmentList, approvalUsersList }
}

export default connect(mapStateToProps, {
    getSendForApprovalByCostingId,
    getAllApprovalDepartment,
    getAllApprovalUserByDepartment,
    sendForApproval,
})(reduxForm({
    form: 'Approval',
    enableReinitialize: true,
})(Approval));