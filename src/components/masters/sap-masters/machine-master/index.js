import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import AddMachine from './AddMachine';
import { getMachineListAPI, deleteMachineAPI } from '../../../../actions/master/MachineMaster';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import NoContentFound from '../../../common/NoContentFound';

class MachineMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            machineId: '',
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        this.props.getMachineListAPI(() => { })
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
        this.setState({ isOpen: false }, () => this.props.getMachineListAPI(() => { }))
    }

    /**
  * @method editItem
  * @description used to edit machine details
  */
    editItem = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            machineId: Id,
        })
    }

    /**
    * @method delete 
    * @description confirm delete machine
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(MESSAGES.MACHINE_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete machine
    */
    confirmDelete = (Id) => {
        this.props.deleteMachineAPI(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.DELETE_MACHINE_SUCCESS);
                this.props.getMachineListAPI(res => { });
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, machineId } = this.state;
        return (
            <Container className="top-margin">
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`Machine Master`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`Add Machine Master`}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Table className="table table-striped" bordered>
                            <thead>
                                <tr>
                                    <th>{`Machine Name`}</th>
                                    <th>{`Machine Number`}</th>
                                    <th>{`Power`}</th>
                                    <th>{`Depreciation`}</th>
                                    <th>{`Labour Type`}</th>
                                    <th>{`Fuel Type`}</th>
                                    <th>{`Shift`}</th>
                                    <th>{`Cost`}</th>
                                    <th>{`Mfd year`}</th>
                                    <th>{`Maintenance Cost`}</th>
                                    <th>{`PUC`}</th>
                                    <th>{`Effective Date`}</th>
                                    <th>{``}</th>
                                </tr>
                            </thead>
                            <tbody >
                                {this.props.machineDatalist && this.props.machineDatalist.length > 0 &&
                                    this.props.machineDatalist.map((item, index) => {
                                        return (
                                            <tr>
                                                <td>{''}</td>
                                                <td>{''}</td>
                                                <td>{''}</td>
                                                <td>{''}</td>
                                                <td>{''}</td>
                                                <td>{''}</td>
                                                <td>{''}</td>
                                                <td>{''}</td>
                                                <td>{''}</td>
                                                <td>{''}</td>
                                                <td>{''}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editItem(item.MachineId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteItem(item.MachineId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.machineDatalist === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {isOpen && (
                    <AddMachine
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        machineId={machineId}
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
    const { loading, machineDatalist } = machine;

    return { loading, machineDatalist }
}

export default connect(mapStateToProps,
    {
        getMachineListAPI,
        deleteMachineAPI,
    }
)(MachineMaster);

