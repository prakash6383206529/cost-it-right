import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddOperation from './AddOperation';
import { getOperationsMasterAPI, deleteOperationAPI } from '../../../../actions/master/OtherOperation';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';

class OperationMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            operationId: '',
        }
    }

    /**
     * @method componentDidMount
     * @description  called before rendering the component
     */
    componentDidMount() {
        this.props.getOperationsMasterAPI(res => { });
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
            this.props.getOperationsMasterAPI(res => { });
        })
    }

    /**
    * @method editItemDetails
    * @description Edit operation detail
    */
    editItemDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            operationId: Id,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete operation
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.OPERATION_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete operation
    */
    confirmDelete = (operationId) => {
        this.props.deleteOperationAPI(operationId, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_OPERATION_SUCCESS);
                this.props.getOperationsMasterAPI(res => { });
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
                        <h3>{`${CONSTANT.OPERATION} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.OPERATION}`}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <div>
                            <Table className="table table-striped" size={'sm'} bordered>
                                {this.props.operationListData && this.props.operationListData.length > 0 &&
                                    <thead>
                                        <tr>
                                            <th>Operation Name</th>
                                            <th>Operation Code</th>
                                            {/* <th>Plant Name</th> */}
                                            <th>Description</th>
                                            {/* <th>Operation Cost</th> */}
                                            <th>{''}</th>
                                        </tr>
                                    </thead>}
                                <tbody >
                                    {this.props.operationListData && this.props.operationListData.length > 0 &&
                                        this.props.operationListData.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td >{item.OperationName}</td>
                                                    <td >{item.OperationCode}</td>
                                                    {/* <td>{item.PlantName}</td> */}
                                                    <td>{item.Description}</td>
                                                    {/* <td>{item.BasicOperationCost}</td> */}
                                                    <td>
                                                        <Button className="black-btn" onClick={() => this.editItemDetails(item.OperationId)}><i className="fas fa-pencil-alt"></i></Button>
                                                        <Button className="black-btn" onClick={() => this.deleteItem(item.OperationId)}><i className="far fa-trash-alt"></i></Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    {this.props.operationListData === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
                {isOpen && (
                    <AddOperation
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        operationId={this.state.operationId}
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
    const { operationListData, loading } = otherOperation;
    return { operationListData, loading }
}

export default connect(
    mapStateToProps, {
    getOperationsMasterAPI,
    deleteOperationAPI,
})(OperationMaster);

