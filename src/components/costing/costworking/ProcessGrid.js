import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createNewCosting, getCostingBySupplier, getCostingDetailsById } from '../../../actions/costing/CostWorking';
import { Button, Col, Row, Table, Label, Input } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import AddMHRCosting from './AddMHRCosting';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';

class ProcessGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            rowsCount: [1],
            isOpenMHRModal: false,
        }
    }

    /**
     * @method componentDidMount
     * @description  called before mounting the component
     */
    componentDidMount() { }


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
     * @method openMHRModal
     * @description  used to open MHR Modal 
     */
    openMHRModal = () => {
        this.setState({
            isOpenMHRModal: !this.state.isOpenMHRModal,
        })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({
            isOpenMHRModal: false,
        });
    }

    render() {

        const { rowsCount, isOpenMHRModal } = this.state;
        const { supplierId, costingId } = this.props;

        return (
            <div className={'create-costing-grid process-costing-grid'}>
                <div className={'create-costing-grid process-costing-grid'}>
                    <Row>
                        <button onClick={this.addRows} className={'btn btn-primary mr10 ml10'}>Add New Row</button>{''}
                        <button className={'btn btn-primary mr10'}>Save Process Cost</button>{''}
                        <button onClick={() => this.props.onCancelProcessGrid()} className={'btn btn-primary mr10'}>Close</button>{''}
                        <label className={'mr10'}>Total Process Cost: </label>
                        <input type="text" name="total-cost" className={''} />
                    </Row>
                    <hr />
                    <Table className="table table-striped" bordered>
                        <thead>
                            <tr>
                                <th>{`Operation / Process Description`}</th>
                                <th>{`Machine`}</th>
                                <th>{`UOM`}</th>
                                <th>{`MHR`}</th>
                                <th>{`Cycle Time(Sec)`}</th>
                                <th>{`Efficiency (%)`}</th>
                                <th>{`Quantity`}</th>
                                <th>{`Cavity`}</th>
                                <th>{`Cost/Pc (Rs)`}</th>
                                <th>{`Delete`}</th>
                            </tr>
                        </thead>
                        <tbody >
                            {rowsCount && rowsCount.map((index) => {
                                return (
                                    <tr>
                                        <td>
                                            <Input type="select" name="selectMulti" id="exampleSelectMulti" >
                                                <option>1</option>
                                                <option>2</option>
                                                <option>3</option>
                                                <option>4</option>
                                                <option>5</option>
                                            </Input>
                                        </td>
                                        <td>
                                            <button onClick={this.openMHRModal}>{'Add'}</button>
                                        </td>
                                        <td>{'UOM Value'}</td>
                                        <td>{'MHR Value'}</td>
                                        <td>
                                            <Input type="text" name="cycle-time" id="CycleTime" placeholder="" />
                                        </td>
                                        <td>
                                            <Input type="text" name="efficiency" id="efficiency" placeholder="" />
                                        </td>
                                        <td>
                                            <Input type="text" name="Quantity" id="Quantity" placeholder="" />
                                        </td>
                                        <td>
                                            <Input type="text" name="cavity" id="cavity" placeholder="" />
                                        </td>
                                        <td><Input type="text" name="cost" id="cost" placeholder="" disabled /></td>
                                        <td>{index > 0 ? <button onClick={(index) => this.deleteRows(index)} className={'btn btn-danger'}>Delete</button> : ''}</td>
                                    </tr>

                                )
                            })}
                        </tbody>
                    </Table>
                </div>

                {isOpenMHRModal && (
                    <AddMHRCosting
                        isOpen={isOpenMHRModal}
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
    //const { activeCostingListData, getCostingDetailData, costingGridRMData } = costWorking;

    return {}
}

export default connect(mapStateToProps, null)(ProcessGrid);