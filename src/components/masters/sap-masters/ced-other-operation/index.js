import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddCEDotherOperation from './AddCEDotherOperation';
import { getCEDOtherOperationsAPI, deleteCEDotherOperationAPI } from '../../../../actions/master/OtherOperation';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';


class CEDoperationMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            CEDotherOperationId: '',
        }
    }

    /**
     * @method componentDidMount
     * @description  called before rendering the component
     */
    componentDidMount() {
        this.props.getCEDOtherOperationsAPI(res => { });
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
            this.props.getCEDOtherOperationsAPI(res => { });
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
            CEDotherOperationId: Id,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete CED Other Operation
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.CED_OTHER_OPERATION_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete CED Other Operation
    */
    confirmDelete = (ID) => {
        this.props.deleteCEDotherOperationAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_CED_OTHER_OPERATION_SUCCESS);
                this.props.getCEDOtherOperationsAPI(res => { });
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
                        <h3>{`${CONSTANT.CED_OTHER_OPERATION} ${CONSTANT.MASTER} `}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.CED_OTHER_OPERATION}`}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <div>
                            <Table className="table table-striped" bordered>
                                {this.props.cedOtherOperationList && this.props.cedOtherOperationList.length > 0 &&
                                    <thead>
                                        <tr>
                                            <th>Supplier Code</th>
                                            <th>Supplier Name</th>
                                            <th>Process</th>
                                            <th>Operation Rate</th>
                                            <th>UOM</th>
                                            <th>Trans. Rate</th>
                                            <th>Trans. UOM</th>
                                            <th>Overhead/Profit(%)</th>
                                            <th>{''}</th>
                                        </tr>
                                    </thead>}
                                <tbody >
                                    {this.props.cedOtherOperationList && this.props.cedOtherOperationList.length > 0 &&
                                        this.props.cedOtherOperationList.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td >{item.SupplierCode}</td>
                                                    <td>{item.SupplierName}</td>
                                                    <td>{item.OperationName}</td>
                                                    <td>{item.OperationRate}</td>
                                                    <td>{item.UnitOfMeasurementName}</td>
                                                    <td>{item.TrasnportationRate}</td>
                                                    <td>{item.TrasnportationUMOName}</td>
                                                    <td>{item.OverheadProfit}</td>
                                                    {/* <td>{item.CreatedBy}</td> */}
                                                    {/* <td>{''}</td> */}
                                                    <td>
                                                        <Button className="black-btn" onClick={() => this.editItemDetails(item.CEDOperationId)}><i className="fas fa-pencil-alt"></i></Button>
                                                        <Button className="black-btn" onClick={() => this.deleteItem(item.CEDOperationId)}><i className="far fa-trash-alt"></i></Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    {this.props.cedOtherOperationList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
                {isOpen && (
                    <AddCEDotherOperation
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        CEDotherOperationId={this.state.CEDotherOperationId}
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
    const { cedOtherOperationList, loading } = otherOperation;
    return { cedOtherOperationList, loading }
}


export default connect(
    mapStateToProps, {
    getCEDOtherOperationsAPI,
    deleteCEDotherOperationAPI,
}
)(CEDoperationMaster);

