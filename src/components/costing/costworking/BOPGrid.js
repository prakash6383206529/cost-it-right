import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, FieldArray, reduxForm, formValueSelector } from "redux-form";
import { getProcessesSelectList, saveBOPCosting } from '../../../actions/costing/CostWorking';
import { Button, Col, Row, Table, Label, Input } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { renderText, renderSelectField, renderNumberInputField, InputHiddenField, searchableSelect, RFReactSelect } from "../../layout/FormInputs";
import AddMHRCosting from './AddMHRCosting';
import { MESSAGES } from '../../../config/message';
import { required, checkForNull, trimDecimalPlace } from "../../../helper/validation";
import { TWO_DECIMAL_PRICE } from '../../../config/constants';
import AddBOPCosting from './AddBOPCosting';
import { loggedInUserId } from '../../../helper/auth';
const selector = formValueSelector('BOPGrid');

const BOPGridRowData = {
    CostingId: '',
    PartId: '',
    CreatedBy: '',
    LinkedBoughtOutParts: [{
        BoughtOutPartId: '',
        BoughtOutPartName: '',
        SourceSupplierName: '',
        MaterialTypeName: '',
        Quantity: '',
        GrandTotal: 0,
        BoughtOutPartRate: 0,
        AssyBoughtOutParRate: 0
    }]
}

const renderMembers = ({ fields, openBOPModal, rowDataHandler, meta: { error, submitFailed } }) => {

    return (

        <>
            <div>
                <button type="button" onClick={() => fields.push(BOPGridRowData.LinkedBoughtOutParts[0])}>
                    Add New Row
                </button>
            </div>
            {fields.map((cost, index) => {
                return (
                    <tr key={index}>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.BoughtOutPartId`}
                                type="hidden"
                                placeholder={''}
                                //validate={[required]}
                                component={InputHiddenField}
                                //required={true}
                                className=" withoutBorder"
                                disabled={true}
                            />
                            <button type="button" onClick={() => openBOPModal(index)}>{'Add'}</button>
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.BoughtOutPartNumber`}
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
                                name={`${cost}.BoughtOutPartRate`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                                disabled={true}
                            />
                        </td>
                        {/* <td>
                            <Field
                                label={''}
                                name={`${cost}.AssyBoughtOutParRate`}
                                type="text"
                                placeholder={''}
                                //validate={[required]}
                                component={renderText}
                                //required={true}
                                className=" withoutBorder"
                                disabled={true}
                            />
                        </td> */}
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.Quantity`}
                                //type="text"
                                placeholder={''}
                                validate={[required]}
                                component={renderNumberInputField}
                                required={true}
                                onChange={(e) => rowDataHandler(e, index)}
                                className=" withoutBorder"
                                disabled={false}
                            //parse={value => Number(value)}
                            />
                        </td>
                        <td>
                            <Field
                                label={''}
                                name={`${cost}.GrandTotal`}
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

class BOPGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isOpenBOPModal: false,
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
     * @method openBOPModal
     * @description  used to open BOP Modal 
     */
    openBOPModal = (GridselectedIndex) => {
        const { lineItemData } = this.props;
        this.setState({
            isOpenBOPModal: !this.state.isOpenBOPModal,
            GridselectedIndex: GridselectedIndex,
        })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({
            isOpenBOPModal: false,
        });
    }

    setRowData = item => {
        console.log('item BOP', item)
        const { GridselectedIndex } = this.state;

        this.props.change(`LinkedBoughtOutParts[${GridselectedIndex}]['BoughtOutPartId']`, item.BoughtOutPartId);
        this.props.change(`LinkedBoughtOutParts[${GridselectedIndex}]['BoughtOutPartNumber']`, item.PartNumber);
        this.props.change(`LinkedBoughtOutParts[${GridselectedIndex}]['BoughtOutPartRate']`, item.BasicRate);
        //this.props.change(`LinkedBoughtOutParts[${GridselectedIndex}]['Quantity']`, item.Quantity);
        this.props.change(`LinkedBoughtOutParts[${GridselectedIndex}]['GrandTotal']`, item.GrandTotal);
    }

    rowDataHandler = (e, index) => {
        this.setState({
            index: index,
        }, () => this.handlerCalculation())
    }

    calculateGrandTotal = () => {
        const { lineItemData } = this.props;
        let Total = 0;

        lineItemData && lineItemData.map((item, index) => {
            Total = checkForNull(Total) + checkForNull(item.GrandTotal)
        })
        return trimDecimalPlace(Total, TWO_DECIMAL_PRICE);
    }


    handlerCalculation = () => {
        const { lineItemData } = this.props;
        const { index } = this.state;
        let netCost = 0;

        const Rate = lineItemData && lineItemData[index] ? checkForNull(lineItemData[index].BoughtOutPartRate) : 0;
        const Quantity = lineItemData && lineItemData[index] ? checkForNull(lineItemData[index].Quantity) : '';
        netCost = Rate * Quantity;
        this.props.change(`LinkedBoughtOutParts[${index}]['GrandTotal']`, checkForNull(trimDecimalPlace(netCost, TWO_DECIMAL_PRICE)));
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { costingId, PartId, lineItemData } = this.props;
        const totalCost = this.calculateGrandTotal()

        let formData = {
            CostingId: costingId,
            PartId: PartId,
            GrandTotal: totalCost,
            CreatedBy: loggedInUserId(),
            LinkedBoughtOutParts: lineItemData
        }

        this.props.saveBOPCosting(formData, res => {
            if (res.data.Result) {
                toastr.success(MESSAGES.SAVE_BOP_COSTING_SUCCESS);
                this.props.onCancelBOPGrid()
            }
        })
    }

    render() {

        const { isOpenBOPModal, GridselectedIndex } = this.state;
        const { handleSubmit, supplierId, costingId, PartId, PartNumber,
            selectedIndex, initialValues } = this.props;

        return (
            <div className={'create-costing-grid process-costing-grid'}>
                <div className={'create-costing-grid process-costing-grid'}>
                    <Row>
                        <Col>
                            <button onClick={() => this.props.onCancelBOPGrid()} className={'btn btn-primary mr10'}>Close</button>{''}
                            <label className={'mr10'}>Total BOP Cost: </label>
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
                                    <th>{``}</th>
                                    {/* <th>{`Supplier Part No.`}</th> */}
                                    <th>{`BOP Part`}</th>
                                    <th>{`Rate`}</th>
                                    <th>{`Quantity`}</th>
                                    <th>{`Cost/Pc (Rs)`}</th>
                                    <th>{`Delete`}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <FieldArray
                                    name="LinkedBoughtOutParts"
                                    openBOPModal={this.openBOPModal}
                                    rowDataHandler={this.rowDataHandler}
                                    component={renderMembers}
                                />
                            </tbody>
                        </Table>
                        <button type="submit" className="btn dark-pinkbtn" >
                            {'Save BOP Cost'}
                        </button>
                    </form>
                </div>

                {isOpenBOPModal && (
                    <AddBOPCosting
                        isOpen={isOpenBOPModal}
                        onCancel={this.onCancel}
                        supplierId={supplierId}
                        costingId={costingId}
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
    let lineItemData = selector(state, 'LinkedBoughtOutParts');
    const { BOPGridData } = costWorking;

    let initialValues = {};
    if (BOPGridData && BOPGridData.LinkedBoughtOutParts) {
        initialValues = {
            CostingId: BOPGridData.CostingId,
            PartId: BOPGridData.PartId,
            CreatedBy: '',
            LinkedBoughtOutParts: BOPGridData.LinkedBoughtOutParts
        }
    } else {
        initialValues = BOPGridRowData
    }

    return { initialValues, BOPGridData, lineItemData }
}

export default connect(mapStateToProps,
    {
        getProcessesSelectList,
        saveBOPCosting
    })(reduxForm({
        form: 'BOPGrid',
        enableReinitialize: true,
    })(BOPGrid));