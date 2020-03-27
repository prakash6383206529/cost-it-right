import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddReason from './AddReason';
import { getAllReasonAPI, deleteReasonAPI } from '../../../../actions/master/ReasonMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { convertISOToUtcDate } from '../../../../helper/util';

class ReasonMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            ReasonId: '',
        }
    }

    /**
    * @method componentDidMount
    * @description  called before rendering the component
    */
    componentDidMount() {
        this.props.getAllReasonAPI(res => { });
    }

    /**
    * @method openModel
    * @description  used to open filter form 
    */
    openModel = () => {
        this.setState({ isOpen: true, isEditFlag: false })
    }

    /**
    * @method onCancel
    * @description  used to cancel filter form
    */
    onCancel = () => {
        this.setState({ isOpen: false }, () => {
            this.props.getAllReasonAPI(res => { })
        })
    }

    /**
    * @method editPartDetails
    * @description confirm delete part
    */
    editItem = (index, Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            ReasonId: Id,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete Reason
    */
    deleteItem = (index, Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(index, Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(MESSAGES.REASON_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteUOM
    * @description confirm delete unit of measurement
    */
    confirmDelete = (index, Id) => {
        this.props.deleteReasonAPI(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.DELETE_UOM_SUCCESS);
                this.props.getAllReasonAPI(res => { });
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag } = this.state;
        return (
            <Container className="top-margin">
                {/* {this.props.loading && <Loader />} */}
                <Row>
                    <Col>
                        <h3>{`Reason Master`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`Add Reason`}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Table className="table table-striped" size={'sm'} hover bordered>
                            {this.props.reasonDataList && this.props.reasonDataList.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>S. No.</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Create Date</th>
                                        <th>{''}</th>
                                    </tr>
                                </thead>}
                            <tbody>
                                {this.props.reasonDataList && this.props.reasonDataList.length > 0 &&
                                    this.props.reasonDataList.map((item, index) => {
                                        return (

                                            <tr key={index}>
                                                <td >{index + 1}</td>
                                                <td>{item.Reason}</td>
                                                <td>{item.IsActive ? 'Active' : 'Inactive'}</td>
                                                <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editItem(index, item.ReasonId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteItem(index, item.ReasonId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.reasonDataList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {isOpen && (
                    <AddReason
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        ReasonId={this.state.ReasonId}
                    />
                )}
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
    const { reasonDataList, loading } = reason;
    return { reasonDataList, loading }
}

export default connect(
    mapStateToProps, { getAllReasonAPI, deleteReasonAPI }
)(ReasonMaster);

