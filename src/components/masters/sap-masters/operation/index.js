import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddOperation from './AddOperation';
import { getOperationsMasterAPI } from '../../../../actions/master/OtherOperation';
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
                            <Table className="table table-striped" bordered>
                                {this.props.operationListData && this.props.operationListData.length > 0 &&
                                    <thead>
                                        <tr>
                                            <th>Operation Name</th>
                                            <th>Operation Code</th>
                                            {/* <th>Plant Name</th> */}
                                            <th>Description</th>
                                            {/* <th>Operation Cost</th> */}
                                            {/* <th>Initiator</th> */}
                                            {/* <th>Created On</th> */}
                                            {/* <th>Modifier</th> */}
                                            {/* <th>Modified On</th> */}
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
                                                    {/* <td>{''}</td> */}
                                                    {/* <td>{''}</td> */}
                                                    {/* <td>{''}</td> */}
                                                    {/* <td>{''}</td> */}
                                                    {/* <td>
                                                    <Button className="black-btn" onClick={() => this.editPartDetails(index, item.Id)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="black-btn" onClick={() => this.deletePart(index, item.Id)}><i className="far fa-trash-alt"></i></Button>
                                                </td> */}
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
    const { operationListData, loading } = otherOperation;
    return { operationListData, loading }
}


export default connect(
    mapStateToProps, { getOperationsMasterAPI }
)(OperationMaster);

