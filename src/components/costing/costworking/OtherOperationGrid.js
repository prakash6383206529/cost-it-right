import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, FieldArray, reduxForm } from "redux-form";
import { addCostingOtherOperation } from '../../../actions/costing/CostWorking';
import { Button, Col, Row, Table, Label, Input } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { renderText, renderSelectField, InputHiddenField, searchableSelect, RFReactSelect } from "../../layout/FormInputs";
import AddOtherOperationCosting from './AddOtherOperationCosting';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';



const renderMembers = ({ fields, processHandler, meta: { error, submitFailed } }) => {

    return (

        <>
            <div>
                <button type="button" onClick={() => fields.push({})}>
                    Add New Row
                </button>
                {/* {submitFailed && error && <span>{error}</span>} */}
            </div>
            {fields.map((cost, index) => {
                return (
                    // <li key={index}>
                    <tr key={index}>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.ProcessId`}
                                component={RFReactSelect}
                                options={[]}
                                labelKey={'label'}
                                valueKey={'value'}
                                onChangeHsn={processHandler}
                                //validate={[required]}
                                //mendatory={false}
                                selType={'ProcessId'}
                                rowIndex={index}
                                disabled={false}
                            />
                        </td>
                        <td>
                            <button>{'Add'}</button>
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.UMO`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                                disabled={true}
                            />
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.Rate`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                                disabled={true}
                            />
                            <Field
                                label={''}
                                name={`${cost}.MachineHourRateId`}
                                type="hidden"
                                placeholder={''}
                                //validate={[required]}
                                component={InputHiddenField}
                                //required={true}
                                className=" withoutBorder"
                                disabled={true}
                            />
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.CycleTime`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                //onChange={(e) => handlerCycleTime(e, index)}
                                className=" withoutBorder"
                                disabled={false}
                            />
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.Efficiency`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                //onChange={(e) => handlerEfficiency(e, index)}
                                className=" withoutBorder"
                                disabled={false}
                            />
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.Quantity`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                //onChange={(e) => handlerQuantity(e, index)}
                                className=" withoutBorder"
                                disabled={false}
                            />
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.Cavity`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                //onChange={(e) => handlerCavity(e, index)}
                                className=" withoutBorder"
                                disabled={false}
                            />
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.NetCost`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                                disabled={true}
                            />
                        </td>
                        <td>
                            <button
                                type="button"
                                className={'btn btn-danger'}
                                title="Delete"
                                onClick={() => fields.remove(index)}
                            >Delete</button>
                        </td>
                    </tr>)
            }
                // </li>
            )}
        </>
    )
}

class OtherOperationGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            rowsCount: [1],
            isOpenOtherOperationModal: false,
            quantity: '',
            netcost: '',
            selectedIndex: ''
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
    openOtherOperationModal = (selectedIndex) => {
        this.setState({
            isOpenOtherOperationModal: !this.state.isOpenOtherOperationModal,
            selectedIndex: selectedIndex
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

    /**
    * @method processHandler
    * @description Used to handle process
    */

    processHandler = (value, index, type) => {
        console.log(">>>>", value, index, type)
        //this.setState({ processSelected: newValue });
    };



    render() {

        const { rowsCount, isOpenOtherOperationModal, selectedIndex } = this.state;
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
                        <tbody>
                            <FieldArray
                                name="LinkedProcesses"
                                // openMHRModal={this.openMHRModal}
                                // renderTypeOfListing={this.renderTypeOfListing}
                                // processSelected={this.state.processSelected}
                                // processSelectList={processSelectList}
                                processHandler={this.processHandler}
                                // handlerCycleTime={this.handlerCycleTime}
                                // handlerEfficiency={this.handlerEfficiency}
                                // handlerQuantity={this.handlerQuantity}
                                // handlerCavity={this.handlerCavity}
                                component={renderMembers}
                            />
                        </tbody>
                    </Table>
                </Col>
                {isOpenOtherOperationModal && (
                    <AddOtherOperationCosting
                        isOpen={isOpenOtherOperationModal}
                        onCancel={this.onCancel}
                        supplierId={supplierId}
                        costingId={costingId}
                        selectedIndex={selectedIndex}
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
})(reduxForm({
    form: 'OtherOperationGridForm',
    enableReinitialize: true,
})(OtherOperationGrid));

