import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import AddPower from './AddPower';
import { getPowerDataListAPI, deletePowerAPI } from '../../../../actions/master/PowerMaster';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import NoContentFound from '../../../common/NoContentFound';

class PowerMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            powerId: '',
        }
    }

    /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
    componentDidMount() {
        this.props.getPowerDataListAPI(() => { })
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
        this.setState({ isOpen: false }, () => this.props.getPowerDataListAPI(() => { }))
    }

    /**
  * @method editItem
  * @description used to edit Power Details
  */
    editItem = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            powerId: Id,
        })
    }

    /**
    * @method delete 
    * @description confirm delete power
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(MESSAGES.POWER_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete power
    */
    confirmDelete = (Id) => {
        this.props.deletePowerAPI(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.POWER_DELETE_SUCCESS);
                this.props.getPowerDataListAPI(() => { })
            }
        });
    }
    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, powerId } = this.state;
        return (
            <Container className="top-margin">
                {this.props.loading && <Loader />}
                <Row>
                    <Col>
                        <h3>{`Machine Master`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`Add Power Master`}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <Table className="table table-striped" size={'sm'} bordered>
                            <thead>
                                <tr>
                                    <th>{`Power`}</th>
                                    <th>{`Power supplier Name`}</th>
                                    <th>{`Plant`}</th>
                                    <th>{`UOM`}</th>
                                    <th>{`Fuel`}</th>
                                    <th>{`Unit Consumption`}</th>
                                    <th>{`Per unit Cost`}</th>
                                    <th>{`Total Cost`}</th>
                                    <th>{``}</th>
                                </tr>
                            </thead>
                            <tbody >
                                {this.props.powerList && this.props.powerList.length > 0 &&
                                    this.props.powerList.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{item.PowerType}</td>
                                                <td>{item.PowerSupplierName}</td>
                                                <td>{item.PlantName}</td>
                                                <td>{item.UnitOfMeasurementName}</td>
                                                <td>{item.FuelName}</td>
                                                <td>{item.TotalUnitCharge}</td>
                                                <td>{item.FuelCostPerUnit}</td>
                                                <td>{item.NetPowerCost}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editItem(item.PowerId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteItem(item.PowerId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.powerList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {isOpen && (
                    <AddPower
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        powerId={powerId}
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
function mapStateToProps({ power }) {
    const { powerList, loading } = power;

    return { loading, powerList }
}

export default connect(mapStateToProps,
    {
        getPowerDataListAPI,
        deletePowerAPI,
    })(PowerMaster);

