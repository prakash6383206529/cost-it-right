import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addCostingOtherOperation } from '../../../actions/costing/CostWorking';
import { Button, Col, Row, Table, Label, Input } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import AddOtherOperationCosting from './AddOtherOperationCosting';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';

class OtherOperationGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            rowsCount: [1],
            isOpenOtherOperationModal: false,
            quantity: '',
            netcost: '',
        }
    }

    /**
     * @method componentDidMount
     * @description  called before mounting the component
     */
    componentDidMount() {
        const { costingId } = this.props;
        this.props.addCostingOtherOperation(costingId, res => { });
    }


    /**
     * @method addRows
     * @description  used to add Rows 
     */
    addRows = () => {
        // const { rowsCount } = this.state;
        // rowsCount.push(rowsCount.length + 1)
        // this.setState({
        //     rowsCount: rowsCount,
        // })
    }

    /**
     * @method deleteRows
     * @description  used to delete Row
     */
    deleteRows = (index) => {
        // const { rowsCount } = this.state;
        // const newTodos = rowsCount.filter((todo, i) => {
        //     if (index === i) {
        //         return false;
        //     }
        //     return true;
        // })
        // this.setState({
        //     rowsCount: newTodos
        // })
    }

    /**
     * @method openOtherOperationModal
     * @description  used to open Other Operation Modal 
     */
    openOtherOperationModal = () => {
        this.setState({
            isOpenOtherOperationModal: !this.state.isOpenOtherOperationModal,
        })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({
            isOpenOtherOperationModal: false,
        });
    }

    /**
     * @method quantityHandler
     * @description  used for quantity Handler
     */
    quantityHandler = (e) => {
        this.setState({
            quantity: e.target.value,
        });
    }

    /**
     * @method netcostHandler
     * @description  used for net cost Handler
     */
    netcostHandler = (e) => {
        this.setState({
            netcost: e.target.value,
        });
    }



    render() {

        const { rowsCount, isOpenOtherOperationModal } = this.state;
        const { supplierId, costingId, costingGridOtherOperationData } = this.props;
        const OtherOperations = costingGridOtherOperationData && costingGridOtherOperationData.OtherOperations;
        return (
            <div className={'create-costing-grid process-costing-grid'}>
                <Col>
                    <Row>
                        <h4>{`Other Operation Details For: ${this.props.partName}`}</h4>
                    </Row>
                    <hr />
                    <Row>
                        <button onClick={this.addRows} className={'btn btn-primary mr10 ml10'}>Add New Row</button>{''}
                        <button className={'btn btn-primary mr10'}>Save Process Cost</button>{''}
                        <button onClick={() => this.props.onCancelOperationGrid()} className={'btn btn-primary mr10'}>Close</button>{''}
                        <label className={'mr10'}>Total Process Cost: </label>
                        <input type="text" name="total-cost" className={''} />
                    </Row>
                    <hr />
                    <Table className="table table-striped" bordered>
                        <thead>
                            <tr>
                                <th>{`Process Operation`}</th>
                                <th>{`Process Code`}</th>
                                <th>{`Rate`}</th>
                                <th>{`UOM`}</th>
                                <th>{`Quantity`}</th>
                                <th>{`Net Cost`}</th>
                                <th>{`Delete`}</th>
                            </tr>
                        </thead>
                        <tbody >
                            <tr>
                                <td>
                                    <button onClick={this.openOtherOperationModal}>{'Add'}</button>
                                </td>
                                <td>{OtherOperations ? '' : '0'}</td>
                                <td>{OtherOperations ? '' : '0'}</td>
                                <td>{OtherOperations ? '' : '0'}</td>
                                <td>
                                    <input
                                        type="text"
                                        name="quantity"
                                        onChange={this.quantityHandler}
                                        value={this.state.quantity}
                                        id="quantity"
                                        placeholder=""
                                    />
                                </td>
                                <td>
                                    <Input
                                        type="text"
                                        name="netcost"
                                        onChange={this.netcostHandler}
                                        value={this.state.netcost}
                                        id="netcost"
                                        placeholder=""
                                    />
                                </td>
                                <td>
                                    <button onClick={this.deleteRows} className={'btn btn-danger'}>Delete</button>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
                {isOpenOtherOperationModal && (
                    <AddOtherOperationCosting
                        isOpen={isOpenOtherOperationModal}
                        onCancel={this.onCancel}
                        supplierId={supplierId}
                        costingId={costingId}
                    />
                )}
            </div>
        )
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ costWorking }) {
    const { costingGridOtherOperationData } = costWorking;

    return { costingGridOtherOperationData }
}

export default connect(mapStateToProps, {
    addCostingOtherOperation
})(OtherOperationGrid);