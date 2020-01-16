import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, Label, Input, Table } from 'reactstrap';
import { getAdditionalFreightBySupplier } from '../../../actions/master/Freight';
import { setRowDataFreight } from '../../../actions/costing/costing';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { convertISOToUtcDate } from '../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import NoContentFound from '../../common/NoContentFound';
import { required } from "../../../helper/validation";
import { renderText, renderNumberInputField } from "../../layout/FormInputs";
const selector = formValueSelector('AddFreightModal');

class AddFreightModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            freightType: 2,
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { supplierId } = this.props;
        this.props.getAdditionalFreightBySupplier(supplierId, response => {
            if (response && response.status == 412) {
                toastr.warning(response.data.Message);
            }
        });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancelFreight();
    }

    /**
    * @method setRowItem
    * @description Used to set row item in CED cost summary
    */
    // setRowItem = (item) => {
    //     const { supplierColumn } = this.props;
    //     item.NetAdditionalFreightCost = item.Packaging * item.PerKilogram;
    //     this.props.setRowDataFreight(supplierColumn, item, () => {
    //         this.toggleModel()
    //     })
    // }

    componentDidUpdate = (prevProps) => {
        if (prevProps.freightDataObj != this.props.freightDataObj) {
            this.freightCaculation()
        }
    }

    freightCaculation = (e = '') => {
        const { freightDataObj } = this.props;

        //1
        const Pertrip = freightDataObj ? freightDataObj.txtPertrip : 0;
        const Noofparts = freightDataObj ? freightDataObj.txtNoofparts : 0;
        let PertripCost = parseFloat((parseFloat(Pertrip) / parseFloat(Noofparts))).toFixed(2);
        PertripCost = (PertripCost == 'NaN') ? 0 : PertripCost;
        this.props.change("txtPertripCost", PertripCost == 'NaN' ? 0 : PertripCost);

        //2
        const Packaging = freightDataObj ? freightDataObj.txtPackaging : 0;
        const Percentage = freightDataObj ? freightDataObj.txtPercentage : 0;
        let PackagingCost = (parseFloat(Percentage) * (parseFloat(Packaging) / 100.0)).toFixed(2);
        PackagingCost = (PackagingCost == 'NaN') ? 0 : PackagingCost;
        this.props.change("txtPackagingCost", PackagingCost == 'NaN' ? 0 : PackagingCost);

        //3
        const RsKg = freightDataObj ? freightDataObj.txtRsKg : 0;
        const WeightOfPart = freightDataObj ? freightDataObj.txtWeightOfPart : 0;
        let RSCost = (parseFloat(WeightOfPart) * parseFloat(RsKg)).toFixed(2);
        RSCost = (RSCost == 'NaN') ? 0 : RSCost;
        this.props.change("txtRSCost", RSCost == 'NaN' ? 0 : RSCost);

        //4
        const LodingUnloading = freightDataObj ? freightDataObj.txtLodingUnloading : 0;
        const LUPercentage = freightDataObj ? freightDataObj.txtLUPercentage : 0;
        let LUCost = (parseFloat(LodingUnloading) * parseFloat(LUPercentage) / 100).toFixed(2);
        LUCost = (LUCost == 'NaN') ? 0 : LUCost;
        this.props.change("txtLUCost", LUCost == 'NaN' ? 0 : LUCost);

        //5
        let Fixed = freightDataObj && freightDataObj.txtFixed == 'NaN' ? 0 : freightDataObj.txtFixed;
        this.props.change("txtFixed", Fixed == 'NaN' ? 0 : Fixed);
        this.props.change("txtFixedCost", Fixed == 'NaN' ? 0 : parseFloat(freightDataObj.txtFixed).toFixed(2));

        this.props.change("txtTotalCost", (parseFloat(PertripCost) + parseFloat(PackagingCost) + parseFloat(RSCost) + parseFloat(LUCost) + parseFloat(Fixed)));

    }

    onSubmit = (values) => {
        console.log("freight values", values)
        this.props.onCancelFreight(values.txtTotalCost)
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, reset, additionalFreightData } = this.props;
        return (
            <Container>
                <Modal size={'xl'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{'Packaging Details'}</ModalHeader>
                    <ModalBody>
                        {this.props.additionalFreightData != undefined &&
                            <Row>
                                <Container>
                                    <form
                                        noValidate
                                        className="form"
                                        onSubmit={handleSubmit(this.onSubmit)}
                                    >
                                        <Table className="table table-striped packaging-freight" bordered>
                                            <thead>
                                                <tr>
                                                    <th>{'Key'}</th>
                                                    <th>{'Value'}</th>
                                                    <th>{'Key'}</th>
                                                    <th>{'Value'}</th>
                                                    <th>{'Cost'}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        {'Per Trip'}
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtPertrip"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=""
                                                        />
                                                    </td>
                                                    <td>
                                                        {'No. of Parts'}
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtNoofparts"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            className=""
                                                        />
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtPertripCost"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            disabled={true}
                                                            //required={true}
                                                            className=""
                                                        />
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        {`Packaging (${additionalFreightData ? additionalFreightData.PackagingCostingHeadName : ''})`}
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtPackaging"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=""
                                                        />
                                                    </td>
                                                    <td>
                                                        {'Percentage'}
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtPercentage"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            className=""
                                                        />
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtPackagingCost"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=""
                                                        />
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        {'Rs/ Kg'}
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtRsKg"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=""
                                                        />
                                                    </td>
                                                    <td>
                                                        {'Weight of Part'}
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtWeightOfPart"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            className=""
                                                        />
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtRSCost"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=""
                                                        />
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        {`Loading/Unloading  (${additionalFreightData ? additionalFreightData.LodingUnloadingCostingHeadName : ''})`}
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtLodingUnloading"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=""
                                                        />
                                                    </td>
                                                    <td>
                                                        {'Percentage'}
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtLUPercentage"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            className=""
                                                        />
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtLUCost"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=""
                                                        />
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        {'Fixed'}
                                                    </td>
                                                    <td colspan={3}>
                                                        <Field
                                                            label={``}
                                                            name={"txtFixed"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            className=""
                                                        />
                                                    </td>
                                                    <td>
                                                        <Field
                                                            label={``}
                                                            name={"txtFixedCost"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=""
                                                        />
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        {'Remarks'}
                                                    </td>
                                                    <td colspan={3}>
                                                        <Field
                                                            label={``}
                                                            name={"txtRemarks"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderText}
                                                            //required={true}
                                                            className=""
                                                        />
                                                    </td>

                                                    <td>
                                                        {''}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td colspan={4}>
                                                        {''}
                                                    </td>
                                                    <td>
                                                        <h6>Total:</h6>
                                                        <Field
                                                            label={``}
                                                            name={"txtTotalCost"}
                                                            type="text"
                                                            placeholder={''}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            className=""
                                                            disabled={true}
                                                        />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                        <Row className="sf-btn-footer no-gutters justify-content-between">
                                            <div className="col-sm-12 text-center">
                                                <button type="submit" className="btn dark-pinkbtn" >
                                                    {'Save'}
                                                </button>
                                                <button type={'button'} className="btn btn-secondary" onClick={reset} >
                                                    {'Reset'}
                                                </button>
                                            </div>
                                        </Row>
                                    </form>
                                </Container>
                            </Row>}
                        {this.props.additionalFreightData === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                    </ModalBody>
                </Modal>
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const { freight } = state;
    const freightDataObj = selector(state,
        'txtPertrip',
        'txtNoofparts',
        'txtPertripCost',
        'txtPackaging',
        'txtPercentage',
        'txtPackagingCost',
        'txtRsKg',
        'txtWeightOfPart',
        'txtRSCost',
        'txtLodingUnloading',
        'txtLUPercentage',
        'txtLUCost',
        'txtFixed',
        'txtFixedCost');

    const { additionalFreightData, loading } = freight;
    let initialValues = {};

    if (additionalFreightData && additionalFreightData !== undefined) {
        initialValues = {
            txtPertrip: additionalFreightData.PerTripRate,
            txtPackaging: additionalFreightData.NetPackagingCost,
            txtRsKg: additionalFreightData.PerKilogramRate,
            txtLodingUnloading: additionalFreightData.NetLodingUnloadingCost,
            txtFixed: 0,
            txtFixedCost: 0,
            txtTotalCost: 0,
        }
    }

    return { additionalFreightData, loading, additionalFreightData, initialValues, freightDataObj }
}

export default connect(mapStateToProps, {
    getAdditionalFreightBySupplier
})(reduxForm({
    form: 'AddFreightModal',
    enableReinitialize: true,
})(AddFreightModal));