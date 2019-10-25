import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddCEDotherOperation from './AddCEDotherOperation';
import { getCEDOtherOperationsAPI } from '../../../../actions/master/OtherOperation';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import moment from 'moment';

class CEDoperationMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
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
    * @method editPartDetails
    * @description confirm delete part
    */
    editPartDetails = (index, Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            uomId: Id,
        })
    }

    /**
    * @method deletePart
    * @description confirm delete part
    */
    deletePart = (index, Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteUOM(index, Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.CONFIRM_DELETE} UOM ?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteUOM
    * @description confirm delete unit of measurement
    */
    confirmDeleteUOM = (index, Id) => {
        // this.props.deleteUnitOfMeasurementAPI(index, Id, (res) => {
        //     if (res.data.Result === true) {
        //         toastr.success(MESSAGES.DELETE_UOM_SUCCESS);
        //         this.props.getUnitOfMeasurementAPI(res => { });
        //     } else {
        //         toastr.error(MESSAGES.SOME_ERROR);
        //     }
        // });
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
                        <h3>{`${CONSTANT.ADD} ${CONSTANT.CED_OTHER_OPERATION}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.CED_OTHER_OPERATION}`}</Button>
                    </Col>
                </Row>

                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.ADD} ${CONSTANT.CED_OTHER_OPERATION} ${CONSTANT.DETAILS}`} </h5>
                    </Col>
                </Row>
                <Col>
                    <div>
                        <Table className="table table-striped" bordered>
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
                                    <th>Initiator</th>
                                    <th>Created On</th>
                                </tr>
                            </thead>
                            <tbody >
                                {this.props.cedOtherOperationList && this.props.cedOtherOperationList.length > 0 &&
                                    this.props.cedOtherOperationList.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.SupplierId}</td>
                                                <td>{item.SupplierName}</td>
                                                <td>{item.OperationName}</td>
                                                <td>{item.OperationRate}</td>
                                                <td>{item.UnitOfMeasurementName}</td>
                                                <td>{item.TrasnportationRate}</td>
                                                <td>{item.TrasnportationUMOName}</td>
                                                <td>{item.OverheadProfit}</td>
                                                <td>{item.CreatedBy}</td>
                                                <td>{''}</td>
                                                {/* <td>
                                                    <Button className="black-btn" onClick={() => this.editPartDetails(index, item.Id)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="black-btn" onClick={() => this.deletePart(index, item.Id)}><i className="far fa-trash-alt"></i></Button>
                                                </td> */}
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </Table>
                    </div>
                    {/* </Table> */}
                </Col>
                {isOpen && (
                    <AddCEDotherOperation
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        editIndex={editIndex}
                        uomId={uomId}
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
    mapStateToProps, { getCEDOtherOperationsAPI }
)(CEDoperationMaster);

