import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, FieldArray, reduxForm, formValueSelector } from "redux-form";
import { getProcessesSelectList, saveProcessCosting } from '../../../actions/costing/CostWorking';
import { Button, Col, Row, Table, Label, Input } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { renderText, renderSelectField, renderNumberInputField, InputHiddenField, searchableSelect, RFReactSelect } from "../../layout/FormInputs";
import AddMHRCosting from './AddMHRCosting';
import { MESSAGES } from '../../../config/message';
import { required, checkForNull } from "../../../helper/validation";
const selector = formValueSelector('ProcessGridForm');

const processGridRowData = {
    CostingId: "",
    TotalProcessCost: 0,
    AssyTotalProcessCost: 0,
    GrandTotal: 0,
    IsActive: true,
    CreatedDate: "",
    CreatedBy: "",
    DisplayCreatedDate: "",
    LinkedProcesses: [{
        MachineHourRateId: "",
        ProcessId: "",
        Rate: 0,
        Quantity: 0,
        NetCost: 0,
        IsActive: true,
        CreatedDate: "",
        UnitOfMeasurementName: "",
        CycleTime: 0,
        Efficiency: 0,
        Cavity: 0
    }]
}

const renderMembers = ({ fields, openMHRModal, renderTypeOfListing, processHandler, rowDataHandler,
    handlerCycleTime, handlerEfficiency, handlerQuantity, handlerCavity, meta: { error, submitFailed } }) => {

    return (

        <>
            <div>
                <button type="button" onClick={() => fields.push(processGridRowData.LinkedProcesses[0])}>
                    Add New Row
                </button>
                {/* {submitFailed && error && <span>{error}</span>} */}
            </div>
            {fields.map((cost, index) => {
                return (
                    <tr key={index}>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.ProcessId`}
                                component={RFReactSelect}
                                options={renderTypeOfListing('processList')}
                                labelKey={'label'}
                                valueKey={'value'}
                                onChangeHsn={processHandler}
                                //validate={[required]}
                                //mendatory={false}
                                selType={'ProcessId'}
                                rowIndex={index}
                                disabled={false}
                            />
                            <Field
                                label={''}
                                name={`${cost}.CostingProcessDetailId`}
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
                            <button type="button" onClick={() => openMHRModal(index)}>{'Add'}</button>
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.UnitOfMeasurementName`}
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
                                //type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderNumberInputField}
                                //required={true}
                                onChange={(e) => rowDataHandler(e, index)}
                                className=" withoutBorder"
                                disabled={false}
                                parse={value => Number(value)}
                            />
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.Efficiency`}
                                //type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderNumberInputField}
                                //required={true}
                                onChange={(e) => rowDataHandler(e, index)}
                                className=" withoutBorder"
                                disabled={false}
                                parse={value => Number(value)}
                            />
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.Quantity`}
                                //type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderNumberInputField}
                                //required={true}
                                onChange={(e) => rowDataHandler(e, index)}
                                className=" withoutBorder"
                                disabled={false}
                                parse={value => Number(value)}
                            />
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.Cavity`}
                                //type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderNumberInputField}
                                //required={true}
                                onChange={(e) => rowDataHandler(e, index)}
                                className=" withoutBorder"
                                disabled={false}
                                parse={value => Number(value)}
                            />
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.NetCost`}
                                //type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderNumberInputField}
                                //required={true}
                                className=" withoutBorder"
                                disabled={true}
                                parse={value => Number(value)}
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
            )}
        </>
    )
}

class ProcessGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isOpenMHRModal: false,
            GridselectedIndex: '',
            totalCost: 0
        }
    }

    /**
     * @method componentDidMount
     * @description  called before mounting the component
     */
    componentDidMount() {
        this.props.getProcessesSelectList(() => { })
    }

    /**
     * @method componentWillReceiveProps
     * @description  Used for changes in props
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.costingGridProcessData != this.props.costingGridProcessData) {
            const { LinkedProcesses } = nextProps.costingGridProcessData;
        }
    }

    /**
     * @method openMHRModal
     * @description  used to open MHR Modal 
     */
    openMHRModal = (GridselectedIndex) => {
        const { lineItemData } = this.props;
        const ProcessId = lineItemData[GridselectedIndex].ProcessId;
        if (ProcessId != '') {
            this.setState({
                isOpenMHRModal: !this.state.isOpenMHRModal,
                GridselectedIndex: GridselectedIndex,
            })
        } else {
            toastr.warning('Please select process.')
        }
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

    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        const { processSelectList } = this.props;
        const temp = [];
        if (label == 'processList') {
            processSelectList && processSelectList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
    }

    /**
    * @method processHandler
    * @description Used to handle process
    */
    processHandler = (value, index, type) => {
        console.log(">>>>", value, index, type)
    };

    setRowData = item => {
        const { GridselectedIndex } = this.state;

        this.props.change(`LinkedProcesses[${GridselectedIndex}]['UnitOfMeasurementName']`, item.UnitOfMeasurementName);
        this.props.change(`LinkedProcesses[${GridselectedIndex}]['Rate']`, item.BasicMachineRate);
        this.props.change(`LinkedProcesses[${GridselectedIndex}]['MachineHourRateId']`, item.MachineHourRateId);
    }

    rowDataHandler = (e, index) => {
        this.setState({
            index: index,
        }, () => this.handlerCalculation())
    }

    calculateGrandTotal = () => {
        const { lineItemData } = this.props;
        let grandTotal = 0;

        lineItemData && lineItemData.map((item, index) => {
            grandTotal = checkForNull(grandTotal) + checkForNull(item.NetCost)
        })
        return grandTotal;
    }


    handlerCalculation = () => {
        const { lineItemData } = this.props;
        const { index } = this.state;
        let netCost = 0;

        const Rate = lineItemData && lineItemData[index] ? checkForNull(lineItemData[index].Rate) : 0;
        const CycleTime = lineItemData && lineItemData[index] ? checkForNull(lineItemData[index].CycleTime) : 0;
        const Efficiency = lineItemData && lineItemData[index] ? checkForNull(lineItemData[index].Efficiency) : 0;
        const Cavity = lineItemData && lineItemData[index] ? checkForNull(lineItemData[index].Cavity) : 0;
        const Quantity = lineItemData && lineItemData[index] ? checkForNull(lineItemData[index].Quantity) : 0;

        if (lineItemData[index].UnitOfMeasurementName == "Kilogram" || lineItemData[index].UnitOfMeasurementName == "KG") {
            netCost = ((Rate * CycleTime * Efficiency / 100)) * Quantity;
        } else {
            netCost = (((Rate * CycleTime / 3600) * (100 / Efficiency)) / Cavity) * Quantity;
        }

        this.props.change(`LinkedProcesses[${index}]['NetCost']`, checkForNull(netCost));

    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { costingId, PartId } = this.props;
        const totalCost = this.calculateGrandTotal()

        let formData = {
            CostingProcessDetailId: values.CostingProcessDetailId,
            CostingId: costingId,
            PartId: PartId,
            TotalProcessCost: totalCost,
            AssyTotalProcessCost: totalCost,
            GrandTotal: totalCost,
            IsActive: true,
            CreatedDate: "2",
            CreatedBy: "",
            DisplayCreatedDate: "",
            LinkedProcesses: values.LinkedProcesses
        }

        this.props.saveProcessCosting(formData, res => {
            if (res.data.Result) {
                toastr.success(MESSAGES.SAVE_PROCESS_COSTING_SUCCESS);
                this.props.onCancelProcessGrid()
            } else {
                toastr.error(res.data.Message);
            }
        })
    }

    render() {

        const { isOpenMHRModal, GridselectedIndex } = this.state;
        const { handleSubmit, supplierId, costingId, processSelectList, PartId, PartNumber,
            selectedIndex, initialValues } = this.props;

        return (
            <div className={'create-costing-grid process-costing-grid'}>
                <div className={'create-costing-grid process-costing-grid'}>
                    <Row>
                        <Col>
                            <div>Formula of cost/Pc</div>
                            <div>In-Hour:-(( MHR * Cycle Time / 3600) * ( 100 / Efficiency)) / Cavity</div>
                            <div>Other:-(( MHR * Cycle Time ) * ( Efficiency *1/100 ))</div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {/* <button onClick={this.addRows} className={'btn btn-primary mr10 ml10'}>Add New Row</button>{''} */}
                            {/* <button className={'btn btn-primary mr10'}>Save Process Cost</button>{''} */}
                            <button onClick={() => this.props.onCancelProcessGrid()} className={'btn btn-primary mr10'}>Close</button>{''}
                            <label className={'mr10'}>Total Process Cost: </label>
                            <input type="text" name="total-cost" value={this.calculateGrandTotal()} className={''} />
                        </Col>
                    </Row>
                    <hr />
                    <form
                        noValidate
                        className="form"
                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                    >
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
                            <tbody>
                                <FieldArray
                                    name="LinkedProcesses"
                                    openMHRModal={this.openMHRModal}
                                    renderTypeOfListing={this.renderTypeOfListing}
                                    processSelectList={processSelectList}
                                    processHandler={this.processHandler}
                                    rowDataHandler={this.rowDataHandler}
                                    component={renderMembers}
                                />
                            </tbody>
                        </Table>
                        <button type="submit" className="btn dark-pinkbtn" >
                            {'Save Process Cost'}
                        </button>
                    </form>
                </div>

                {isOpenMHRModal && (
                    <AddMHRCosting
                        isOpen={isOpenMHRModal}
                        onCancel={this.onCancel}
                        supplierId={supplierId}
                        costingId={costingId}
                        addMHRitemToProcess={this.addMHRitemToProcess}
                        PartId={PartId}
                        PartNumber={PartNumber}
                        selectedIndex={selectedIndex}
                        GridselectedIndex={GridselectedIndex}
                        setRowData={this.setRowData}
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
function mapStateToProps(state) {
    const { costWorking } = state;
    let lineItemData = selector(state, 'LinkedProcesses');
    const { addMHRForProcessGrid, processSelectList, costingGridProcessData } = costWorking;
    let initialValues = {};
    if (costingGridProcessData && costingGridProcessData.LinkedProcesses) {
        initialValues = {
            CostingProcessDetailId: costingGridProcessData.CostingProcessDetailId,
            MachineHourRateDetailId: costingGridProcessData.MachineHourRateDetailId,
            ProcessId: costingGridProcessData.ProcessId,
            MachineHourRates: costingGridProcessData.MachineHourRates,
            CostingId: costingGridProcessData.CostingId,
            PartId: costingGridProcessData.PartId,
            TotalProcessCost: costingGridProcessData.TotalProcessCost,
            AssyTotalProcessCost: costingGridProcessData.AssyTotalProcessCost,
            GrandTotal: costingGridProcessData.GrandTotal,
            IsActive: costingGridProcessData.IsActive,
            CreatedDate: "",
            CreatedBy: "",
            DisplayCreatedDate: "",
            LinkedProcesses: costingGridProcessData.LinkedProcesses
        }
    } else {
        initialValues = processGridRowData
    }

    return { addMHRForProcessGrid, processSelectList, initialValues, costingGridProcessData, lineItemData }
}

export default connect(mapStateToProps,
    {
        getProcessesSelectList,
        saveProcessCosting
    })(reduxForm({
        form: 'ProcessGridForm',
        enableReinitialize: true,
    })(ProcessGrid));