import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddProcess from './AddProcess';
import { getProcessDataAPI, deleteProcessAPI } from '../../../../actions/master/Process';
import { CONSTANT } from '../../../../helper/AllConastant'
import { MESSAGES } from '../../../../config/message';
import { toastr } from 'react-redux-toastr';

class ProcessMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            ProcessId: '',
        }
    }

    componentDidMount() {
        this.props.getProcessDataAPI(res => { });
    }

    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({
            isOpen: true,
            isEditFlag: false,
        })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({ isOpen: false }, () => {
            this.props.getProcessDataAPI(res => { });
        })
    }

    /**
    * @method editPartDetails
    * @description confirm delete part
    */
    editRow = (index, Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            ProcessId: Id,
        })
    }

    /**
    * @method deleteRow
    * @description confirm delete
    */
    deleteRow = (index, Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(index, Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.CONFIRM_DELETE} UOM ?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete unit of measurement
    */
    confirmDelete = (index, Id) => {
        this.props.deleteProcessAPI(index, Id, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_PROCESS_SUCCESS);
                this.props.getProcessDataAPI(res => { });
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
        const { isOpen, isEditFlag, ProcessId } = this.state;
        return (
            <Container className="top-margin">
                <Row>
                    <Col>
                        <h3>Process Master </h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>Add Process</Button>
                    </Col>
                </Row>
                <hr />
                <Col>
                    <Table className="table table-striped" hover bordered>
                        <thead>
                            <tr>
                                <th>{`${CONSTANT.PROCESS} ${CONSTANT.NAME}`}</th>
                                <th>{`${CONSTANT.PROCESS} ${CONSTANT.CODE}`}</th>
                                <th>{`${CONSTANT.PROCESS} ${CONSTANT.DESCRIPTION}`}</th>
                                <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th>
                                <th>{`Status`}</th>
                                <th>{``}</th>
                            </tr>
                        </thead>
                        <tbody >
                            {this.props.processList && this.props.processList.length > 0 &&
                                this.props.processList.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td >{item.ProcessName}</td>
                                            <td>{item.ProcessCode}</td>
                                            <td>{item.Description}</td>
                                            <td>{item.PlantName}</td>
                                            <td>{item && item.IsActive ? 'Active' : 'Inactive'}</td>
                                            <td>
                                                <Button className="btn btn-secondary" onClick={() => this.editRow(index, item.ProcessId)}><i className="fas fa-pencil-alt"></i></Button>
                                                <Button className="btn btn-danger" onClick={() => this.deleteRow(index, item.ProcessId)}><i className="far fa-trash-alt"></i></Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </Table>
                </Col>
                {isOpen && (
                    <AddProcess
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        ProcessId={ProcessId}
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
function mapStateToProps({ process }) {
    const { processList } = process;
    return { processList }
}


export default connect(mapStateToProps, {
    getProcessDataAPI,
    deleteProcessAPI
}
)(ProcessMaster);

