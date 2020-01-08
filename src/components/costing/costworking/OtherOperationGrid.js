import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, FieldArray, reduxForm, formValueSelector } from "redux-form";
import { getOtherOpsSelectList, saveOtherOpsCosting, updateCostingOtherOperation } from '../../../actions/costing/CostWorking';
import { Button, Col, Row, Table, Label, Input } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { renderText, renderSelectField, InputHiddenField, searchableSelect, RFReactSelect } from "../../layout/FormInputs";
import AddOtherOperationCosting from './AddOtherOperationCosting';
import { MESSAGES } from '../../../config/message';
const selector = formValueSelector('OtherOperationGridForm');

const otherOperationGridRowData = {
    CostingId: "",
    SurfaceTreatmentCost: 0,
    AssySurfaceTreatmentCost: 0,
    GrandTotal: 0,
    IsActive: true,
    CreatedDate: "",
    CreatedBy: "",
    DisplayCreatedDate: "",
    LinkedOperations: [{
        OtherOperationId: "",
        OperationId: "",
        Rate: 0,
        Quantity: 0,
        NetCost: 0,
        IsActive: true,
        CreatedDate: "",
        UnitOfMeasurementName: "",
        OtherOperationName: "",
        OperationName: "",
        Total: 0
    }]
}

const renderMembers = ({ fields, processHandler, openOtherOperationModal, renderTypeOfListing,
    handlerQuantity, meta: { error, submitFailed } }) => {

    return (

        <>
            <div>
                <button type="button" onClick={() => fields.push(otherOperationGridRowData.LinkedOperations[0])}>
                    Add New Row
                </button>
                {/* {submitFailed && error && <span>{error}</span>} */}
            </div>
            {fields.map((cost, index) => {
                return (
                    // <li key={index}>
                    <tr key={index}>
                        <td>
                            {/* <Field
                                label={''}
                                name={`${cost}.OtherOperationId`}
                                component={RFReactSelect}
                                options={renderTypeOfListing('otherOperationList')}
                                labelKey={'label'}
                                valueKey={'value'}
                                onChangeHsn={processHandler}
                                //validate={[required]}
                                //mendatory={false}
                                selType={'ProcessId'}
                                rowIndex={index}
                                disabled={false}
                            /> */}
                            <button type="button" onClick={() => openOtherOperationModal(index)}>{'Add'}</button>
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.OperationName`}
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
                                name={`${cost}.OtherOperationId`}
                                type="hidden"
                                placeholder={''}
                                //validate={[required]}
                                component={InputHiddenField}
                                //required={true}
                                className=" withoutBorder"
                                disabled={true}
                            />
                            <Field
                                label={''}
                                name={`${cost}.OtherOperationName`}
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
                                name={`${cost}.Quantity`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                onChange={(e) => handlerQuantity(e, index)}
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
        this.props.getOtherOpsSelectList(() => { })
    }

    /**
     * @method componentWillReceiveProps
     * @description  Used for changes in props
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.costingGridOtherOperationData != this.props.costingGridOtherOperationData) {
            const { LinkedOperations } = nextProps.costingGridOtherOperationData;
            let grandTotal = 0;
            LinkedOperations && LinkedOperations.map((item, index) => {
                grandTotal = grandTotal + (item.Rate * item.Quantity);
                return grandTotal;
            })

            this.setState({ totalCost: grandTotal })
        }
    }

    /**
     * @method openOtherOperationModal
     * @description  used to open Other Operation Modal 
     */
    openOtherOperationModal = (selectedIndex) => {
        this.setState({
            isOpenOtherOperationModal: !this.state.isOpenOtherOperationModal,
            GridselectedIndex: selectedIndex
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

    setOtherOperationRowData = item => {
        const { GridselectedIndex } = this.state;

        this.props.change(`LinkedOperations[${GridselectedIndex}]['OtherOperationId']`, item.OtherOperationId);
        this.props.change(`LinkedOperations[${GridselectedIndex}]['OperationName']`, item.OperationName);
        this.props.change(`LinkedOperations[${GridselectedIndex}]['OtherOperationName']`, item.OtherOperationName);
        this.props.change(`LinkedOperations[${GridselectedIndex}]['Rate']`, item.Rate);
        this.props.change(`LinkedOperations[${GridselectedIndex}]['UnitOfMeasurementName']`, item.UnitOfMeasurementName);
    }

    handlerQuantity = (e, index) => {
        this.props.change(`LinkedOperations[${index}]['Quantity']`, e.target.value);
        this.setState({
            index: index,
        }, () => this.handlerCalculation())
    }

    handlerCalculation = () => {
        const { index } = this.state;
        const { LinkedOperationsArray } = this.props;

        const Rate = LinkedOperationsArray && LinkedOperationsArray[index] ? LinkedOperationsArray[index].Rate : 0;
        const Quantity = LinkedOperationsArray && LinkedOperationsArray[index] ? LinkedOperationsArray[index].Quantity : 0;

        let netCost = Rate * Quantity;

        this.props.change(`LinkedOperations[${index}]['NetCost']`, netCost);
        this.props.change(`LinkedOperations[${index}]['Total']`, netCost);
    }

    calculateGrandTotal = () => {
        const { LinkedOperationsArray } = this.props;
        let grandTotal = 0;

        LinkedOperationsArray && LinkedOperationsArray.map((item, index) => {
            grandTotal = grandTotal + item.NetCost
        })
        return grandTotal;
    }

    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        const { otherOpsSelectList } = this.props;
        const temp = [];
        //const tempSupplier = [];
        if (label == 'otherOperationList') {
            otherOpsSelectList && otherOpsSelectList.map(item =>
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
        //this.setState({ processSelected: newValue });
    };

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        console.log("values grid other ops", values)
        const totalCost = this.calculateGrandTotal()
        const { costingId, PartId, isEditCEDFlag, initialValues } = this.props;
        let formData = {}
        // if (isEditCEDFlag) {
        //     formData = {
        //         CostingOtherOperationDetailId: initialValues.CostingOtherOperationDetailId,
        //         OtherOperations: initialValues.OtherOperations,
        //         CostingId: initialValues.CostingId,
        //         PartId: initialValues.PartId,
        //         SurfaceTreatmentCost: totalCost,
        //         AssySurfaceTreatmentCost: totalCost,
        //         GrandTotal: totalCost,
        //         IsActive: true,
        //         CreatedDate: initialValues.CreatedDate,
        //         CreatedBy: initialValues.CreatedBy,
        //         DisplayCreatedDate: initialValues.DisplayCreatedDate,
        //         LinkedOperations: values.LinkedOperations
        //     }
        //     console.log("form data edit", formData)
        //     this.props.updateCostingOtherOperation(formData, res => {
        //         if (res.data.Result) {
        //             toastr.success(MESSAGES.UPDATE_COSTING_OTHER_OPERATION_SUCCESS);
        //             this.props.onCancelOperationGrid()
        //         } else {
        //             toastr.error(res.data.Message);
        //         }
        //     })
        // } else {
        formData = {
            CostingId: costingId,
            PartId: PartId,
            SurfaceTreatmentCost: totalCost,
            AssySurfaceTreatmentCost: totalCost,
            GrandTotal: totalCost,
            IsActive: true,
            CreatedDate: "",
            CreatedBy: "",
            DisplayCreatedDate: "",
            LinkedOperations: values.LinkedOperations
        }

        console.log("form data", formData)
        this.props.saveOtherOpsCosting(formData, res => {
            if (res.data.Result) {
                toastr.success(MESSAGES.SAVE_OTHER_OPERATION_SUCCESS);
                this.props.onCancelOperationGrid()
            } else {
                toastr.error(res.data.Message);
            }
        })
        //}
    }


    render() {

        const { isOpenOtherOperationModal, selectedIndex } = this.state;
        const { handleSubmit, supplierId, costingId, costingGridOtherOperationData,
            PartId, PartNumber } = this.props;
        const OtherOperations = costingGridOtherOperationData && costingGridOtherOperationData.OtherOperations;

        return (
            <div className={'create-costing-grid process-costing-grid'}>
                <Col>
                    <Row>
                        <h4>{`Other Operation Details For: ${this.props.partName}`}</h4>
                    </Row>
                    <hr />
                    <Row>
                        {/* <button onClick={this.addRows} className={'btn btn-primary mr10 ml10'}>Add New Row</button>{''} */}
                        {/* <button className={'btn btn-primary mr10'}>Save Process Cost</button>{''} */}
                        <button onClick={() => this.props.onCancelOperationGrid()} className={'btn btn-primary mr10'}>Close</button>{''}
                        <label className={'mr10'}>Total Process Cost: </label>
                        <input type="text" name="total-cost" value={this.calculateGrandTotal()} className={''} />
                    </Row>
                    <hr />
                    <form
                        noValidate
                        className="form"
                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                    >
                        <Table className="grid table-striped" bordered>
                            <thead>
                                <tr>
                                    <th>{``}</th>
                                    <th>{`Operation Name`}</th>
                                    <th>{`Operation Code`}</th>
                                    <th>{`Rate`}</th>
                                    <th>{`UOM`}</th>
                                    <th>{`Quantity`}</th>
                                    <th>{`Net Cost`}</th>
                                    <th>{`Delete`}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <FieldArray
                                    name="LinkedOperations"
                                    openOtherOperationModal={this.openOtherOperationModal}
                                    renderTypeOfListing={this.renderTypeOfListing}
                                    processHandler={this.processHandler}
                                    handlerQuantity={this.handlerQuantity}
                                    component={renderMembers}
                                />
                            </tbody>
                        </Table>
                        <button type="submit" className="btn dark-pinkbtn" >
                            {'Save Operation Cost'}
                        </button>
                    </form>
                </Col>
                {isOpenOtherOperationModal && (
                    <AddOtherOperationCosting
                        isOpen={isOpenOtherOperationModal}
                        onCancel={this.onCancel}
                        supplierId={supplierId}
                        costingId={costingId}
                        PartId={PartId}
                        PartNumber={PartNumber}
                        selectedIndex={selectedIndex}
                        setOtherOperationRowData={this.setOtherOperationRowData}
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

    const LinkedOperationsArray = selector(state, 'LinkedOperations')
    const { costWorking } = state;
    const { costingGridOtherOperationData, otherOpsSelectList } = costWorking;
    let initialValues = {};
    if (costingGridOtherOperationData && costingGridOtherOperationData.LinkedOperations) {
        initialValues = {
            CostingOtherOperationDetailId: costingGridOtherOperationData.CostingOtherOperationDetailId,
            OtherOperations: costingGridOtherOperationData.OtherOperations,
            CostingId: costingGridOtherOperationData.CostingId,
            PartId: costingGridOtherOperationData.PartId,
            SurfaceTreatmentCost: costingGridOtherOperationData.SurfaceTreatmentCost,
            AssySurfaceTreatmentCost: costingGridOtherOperationData.AssySurfaceTreatmentCost,
            GrandTotal: costingGridOtherOperationData.GrandTotal,
            IsActive: costingGridOtherOperationData.IsActive,
            CreatedDate: "",
            CreatedBy: "",
            DisplayCreatedDate: "",
            LinkedOperations: costingGridOtherOperationData.LinkedOperations
        }
    } else {
        initialValues = {
            CostingId: "",
            PartId: "",
            SurfaceTreatmentCost: 0,
            AssySurfaceTreatmentCost: 0,
            GrandTotal: 0,
            IsActive: true,
            CreatedDate: "",
            CreatedBy: "",
            DisplayCreatedDate: "",
            LinkedOperations: [
                {
                    OtherOperationId: "",
                    Rate: '',
                    Quantity: '',
                    NetCost: '',
                    IsActive: true,
                    CreatedDate: "",
                    UnitOfMeasurementName: ''
                }
            ]
        }
    }

    return { costingGridOtherOperationData, otherOpsSelectList, initialValues, LinkedOperationsArray }
}

export default connect(mapStateToProps, {
    getOtherOpsSelectList,
    saveOtherOpsCosting,
    updateCostingOtherOperation,
})(reduxForm({
    form: 'OtherOperationGridForm',
    enableReinitialize: true,
})(OtherOperationGrid));

