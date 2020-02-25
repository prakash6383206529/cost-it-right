import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddOtherOperation from './AddOtherOperation';
import { getOperationsAPI, deleteOtherOperationAPI } from '../../../../actions/master/OtherOperation';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import moment from 'moment';
import NoContentFound from '../../../common/NoContentFound';

class OtherOperationMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            OtherOperationId: '',
            OperationId: '',
        }
    }

    /**
     * @method componentDidMount
     * @description  called before rendering the component
     */
    componentDidMount() {
        this.props.getOperationsAPI(res => { });
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
            this.props.getOperationsAPI(res => { });
        })
    }

    /**
    * @method editItemDetails
    * @description Edit Other Operation detail
    */
    editItemDetails = (OtherOperationId, OperationId) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            OtherOperationId: OtherOperationId,
            OperationId: OperationId,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete Other Operation
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.OTHER_OPERATION_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Other Operation
    */
    confirmDelete = (operationId) => {
        this.props.deleteOtherOperationAPI(operationId, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_OTHER_OPERATION_SUCCESS);
                this.props.getOperationsAPI(res => { });
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, editIndex, uomId } = this.state;
        return (
            <Container className="top-margin">
                {/* {this.props.loading && <Loader />} */}
                <Row>
                    <Col>
                        <h3>{` ${CONSTANT.OTHER_OPERATION} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.OTHER_OPERATION}`}</Button>
                    </Col>
                </Row>

                <hr />
                <Row>
                    <Col>
                        <div>
                            <Table className="table table-striped" bordered>
                                {this.props.otherOperationList && this.props.otherOperationList.length > 0 &&
                                    <thead>
                                        <tr>
                                            <th>Process Code</th>
                                            <th>Supplier</th>
                                            <th>Process Operation</th>
                                            <th>UOM</th>
                                            <th>Technology</th>
                                            <th>Rate</th>
                                            <th>Created On</th>
                                            <th>{''}</th>
                                        </tr>
                                    </thead>}
                                <tbody >
                                    {this.props.otherOperationList && this.props.otherOperationList.length > 0 &&
                                        this.props.otherOperationList.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td >{item.OperationCode}</td>
                                                    <td>{item.SupplierName}</td>
                                                    <td>{item.ProcessName}</td>
                                                    <td>{item.UnitOfMeasurementName}</td>
                                                    <td>{item.TechnologyName}</td>
                                                    <td>{item.Rate}</td>
                                                    <td>{moment(item.CreatedDate).format('L')}</td>
                                                    <td>
                                                        <Button className="black-btn" onClick={() => this.editItemDetails(item.OtherOperationId, item.OperationId)}><i className="fas fa-pencil-alt"></i></Button>
                                                        <Button className="black-btn" onClick={() => this.deleteItem(item.OtherOperationId)}><i className="far fa-trash-alt"></i></Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    {this.props.otherOperationList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                </tbody>
                            </Table>
                        </div>
                        {/* </Table> */}
                    </Col>
                </Row>
                {isOpen && (
                    <AddOtherOperation
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        OperationId={this.state.OperationId}
                        OtherOperationId={this.state.OtherOperationId}
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
function mapStateToProps({ otherOperation }) {
    const { otherOperationList, loading } = otherOperation;
    return { otherOperationList, loading }
}


export default connect(
    mapStateToProps, {
    getOperationsAPI,
    deleteOtherOperationAPI,
}
)(OtherOperationMaster);

