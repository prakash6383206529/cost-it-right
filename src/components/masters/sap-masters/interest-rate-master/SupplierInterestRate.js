import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField } from "../../../layout/FormInputs";
import { createInterestRateAPI, updateInterestRateAPI, getInterestRateByIdAPI } from '../../../../actions/master/InterestRateMaster';
import { fetchCostingHeadsAPI, fetchBOPComboAPI } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message'

class AddSupplierInterestRate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: []
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.fetchCostingHeadsAPI('--Select-Inventory-Cost', () => { });
        this.props.fetchBOPComboAPI(() => { });
    }

    /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
    componentDidMount() {
        const { isEditFlag, interestRateId } = this.props;
        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getInterestRateByIdAPI(interestRateId, true, res => { })
            })
        } else {
            this.props.getInterestRateByIdAPI('', false, res => { })
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        /** Updating details of existing interest rate master**/
        if (this.props.isEditFlag) {
            const { interestRateId } = this.props;
            let formData = {
                SupplierInterestRateId: interestRateId,
                AnnualRateOfInterestPercent: values.AnnualRateOfInterestPercent,
                RepaymentPeriod: values.RepaymentPeriod,
                AverageForTheYearPercent: values.AverageForTheYearPercent,
                ICCPercent: values.ICCPercent,
                RMInventoryPercent: values.RMInventoryPercent,
                WIPInventoryPercent: values.WIPInventoryPercent,
                PaymentTermPercent: values.PaymentTermPercent,
                SupplierId: values.SupplierId,
                RMInventoryCostingHeadsId: values.RMInventoryCostingHeadsId,
                WIPInventoryCostingHeadsId: values.WIPInventoryCostingHeadsId,
                PaymentTermCostingHeadsId: values.PaymentTermCostingHeadsId,
                IsActive: true,
            }
            this.props.updateInterestRateAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_INTEREST_RATE_SUCESS);
                    this.toggleModel();
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        } else { /** Adding new details for creating interest rate master**/
            this.props.createInterestRateAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.INTEREST_RATE_ADDED_SUCCESS);
                    this.toggleModel()
                } else {
                    toastr.error(res.data.message);
                }
            });
        }
    }

    /**
    * @method handleTypeofListing
    * @description Used to handle listing
    */
    handleTypeofListing = (e) => {
        this.setState({
            typeOfListing: e
        })
    }

    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        const { costingHead, supplierList } = this.props;
        const temp = [];
        if (label === 'costingHeads') {
            costingHead && costingHead.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'supplier') {
            supplierList && supplierList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset, pristine, submitting } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Interest Rate' : 'Add Interest Rate'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row>
                                        <Col>
                                            <Field
                                                label={`Supplier`}
                                                name={"SupplierId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('supplier')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                                disabled={isEditFlag ? true : false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Annual rate (%)"
                                                name={"AnnualRateOfInterestPercent"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Repayment Period"
                                                name={"RepaymentPeriod"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Average Year (%)"
                                                name={"AverageForTheYearPercent"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="ICC (%)"
                                                name={"ICCPercent"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`RM Inventory Costing`}
                                                name={"RMInventoryCostingHeadsId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('costingHeads')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="RM Inventory (%)"
                                                name={"RMInventoryPercent"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>

                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`WIP Inventory Costing`}
                                                name={"WIPInventoryCostingHeadsId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('costingHeads')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="WIP Inventory (%) "
                                                name={"WIPInventoryPercent"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Payment Term Costing`}
                                                name={"PaymentTermCostingHeadsId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('costingHeads')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md='6'>
                                            <Field
                                                label="Payment Term(%) "
                                                name={"PaymentTermPercent"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save'}
                                            </button>
                                            {!isEditFlag &&
                                                <button
                                                    type={'button'}
                                                    className="btn btn-secondary"
                                                    disabled={pristine || submitting}
                                                    onClick={reset} >
                                                    {'Reset'}
                                                </button>}
                                        </div>
                                    </Row>
                                </form>
                            </Container>
                        </Row>
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
function mapStateToProps({ comman, interestRate }) {
    const { costingHead, supplierList } = comman;
    const { interestRateDetail } = interestRate;
    let initialValues = {};
    if (interestRateDetail && interestRateDetail !== undefined) {
        initialValues = {
            AnnualRateOfInterestPercent: interestRateDetail.AnnualRateOfInterestPercent,
            RepaymentPeriod: interestRateDetail.RepaymentPeriod,
            AverageForTheYearPercent: interestRateDetail.AverageForTheYearPercent,
            ICCPercent: interestRateDetail.ICCPercent,
            RMInventoryPercent: interestRateDetail.RMInventoryPercent,
            WIPInventoryPercent: interestRateDetail.WIPInventoryPercent,
            PaymentTermPercent: interestRateDetail.PaymentTermPercent,
            SupplierId: interestRateDetail.SupplierId,
            RMInventoryCostingHeadsId: interestRateDetail.RMInventoryCostingHeadsId,
            WIPInventoryCostingHeadsId: interestRateDetail.WIPInventoryCostingHeadsId,
            PaymentTermCostingHeadsId: interestRateDetail.PaymentTermCostingHeadsId,
            IsActive: interestRateDetail.IsActive,
        }
    }
    return { costingHead, supplierList, initialValues };
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    fetchCostingHeadsAPI, fetchBOPComboAPI,
    createInterestRateAPI, updateInterestRateAPI, getInterestRateByIdAPI
})(reduxForm({
    form: 'AddSupplierInterestRate',
    enableReinitialize: true,
})(AddSupplierInterestRate));
