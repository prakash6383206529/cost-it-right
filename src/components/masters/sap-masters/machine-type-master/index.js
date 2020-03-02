import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import AddMachineType from './AddMachineType';
import { getMachineTypeListAPI, deleteMachineTypeAPI } from '../../../../actions/master/MachineMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';

class MachineTypeMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            MachineTypeId: '',
        }
    }

    /**
     * @method componentDidMount
     * @description  called before rendering the component
     */
    componentDidMount() {
        this.props.getMachineTypeListAPI(res => { });
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
        this.setState({ isOpen: false }, () => this.props.getMachineTypeListAPI(res => { }))
    }

    /**
    * @method editItemDetails
    * @description confirm delete Machine Type
    */
    editItemDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            MachineTypeId: Id,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete Machine Type
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(MESSAGES.MACHINE_TYPE_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Machine Type
    */
    confirmDelete = (Id) => {
        this.props.deleteMachineTypeAPI(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.DELETE_MACHINE_TYPE_SUCCESS);
                this.props.getMachineTypeListAPI(res => { });
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
                        <h3>{`Machine Type Master`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`Add Machine Type Master`}</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Table className="table table-striped" size={'sm'} bordered>

                            <thead>
                                <tr>
                                    <th>Machine Class Name</th>
                                    <th>Labour types</th>
                                    <th>{''}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.machineTypeDataList && this.props.machineTypeDataList.length > 0 &&
                                    this.props.machineTypeDataList.map((item, index) => {
                                        return (

                                            <tr key={index}>
                                                <td >{item.MachineClassName}</td>
                                                <td>{item.LabourTypeNames}</td>
                                                <td>
                                                    <Button className="black-btn" onClick={() => this.editItemDetails(item.MachineTypeId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="black-btn" onClick={() => this.deleteItem(item.MachineTypeId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.machineTypeDataList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {isOpen && (
                    <AddMachineType
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        MachineTypeId={this.state.MachineTypeId}
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
function mapStateToProps({ machine }) {
    const { machineTypeDataList, loading } = machine;
    return { machineTypeDataList, loading }
}

export default connect(mapStateToProps, {
    getMachineTypeListAPI,
    deleteMachineTypeAPI,
})(MachineTypeMaster);

