import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, searchableSelect } from "../../../layout/FormInputs";
import { createInterestRateAPI, getInterestRateComboData } from '../../../../actions/master/InterestRateMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message'

class AddSupplierInterestRate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rmInvemtoryCost: [],
            wipInventoryCost: [],
            paymentTermCost: [],
            supplierValue: [],
        }
    }

    // /**
    // * @method componentWillMount
    // * @description called before rendering the component
    // */
    // componentWillMount() {
    //     this.props.getInterestRateComboData(() => { });
    // }

   

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
        if (this.props.isEditFlag) {
            // console.log('values', values);
            // const { uomId } = this.props;
            // this.setState({ isSubmitted: true });
            // let formData = {
            //     Name: values.Name,
            //     Title: values.Title,
            //     Description: values.Description,
            //     Id: uomId
            // }
            // this.props.updateUnitOfMeasurementAPI(uomId, formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.UPDATE_UOM_SUCESS);
            //         this.toggleModel();
            //         this.props.getUnitOfMeasurementAPI(res => { });
            //     } else {
            //         toastr.error(MESSAGES.SOME_ERROR);
            //     }
            // });
        } else {
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

    handleChangeRMInventory = (newValue) => {
        this.setState({ rmInvemtoryCost: newValue });
    };

    handleChangeWIPInventory = (e) => {
        this.setState({ wipInventoryCost: e.target.value });
    }

    handleChangeSupplier = (newValue, actionMeta) => {
        this.setState({ supplierValue: newValue });
    };

    handleChangePaymentTerm = (newValue, actionMeta) => {
        this.setState({ paymentTermCost: newValue });
    };

    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        const { Suppliers } = this.props;
        const temp = [];
        if (label === 'supplier') {
            Suppliers && Suppliers.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag } = this.props;

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
                                        <Col md="6">
                                            <Field
                                                label="Annual rate (%)"
                                                name={"AnnualRateOfInterestPercent"}
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
                                                label="RM Inventory (%)"
                                                name={"RMInventoryPercent"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col>
                                            <Field
                                                label="WIP Inventory (%) "
                                                name={"WIPInventoryPercent"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md='12'>
                                            <Field
                                                label="Payment Term(%) "
                                                name={"PaymentTermPercent"}
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
                                                id="supplier"
                                                name="SupplierId"
                                                type="text"
                                                label="Supplier"
                                                component={searchableSelect}
                                                options={this.renderTypeOfListing('supplier')}
                                                required={true}
                                                handleChangeDescription={this.handleChangeSupplier}
                                                valueDescription={this.state.supplierValue}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                id="RMInventoryCostingHeadsId"
                                                name="RMInventoryCostingHeadsId"
                                                type="text"
                                                label="RM Inventory Costing"
                                                component={searchableSelect}
                                                options={this.renderTypeOfListing('profitTypes')}
                                                required={true}
                                                handleChangeDescription={this.handleChangeRMInventory}
                                                valueDescription={this.state.rmInvemtoryCost}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                    </Row>
                                    
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                id="WIPInventoryCostingHeadsId"
                                                name="WIPInventoryCostingHeadsId"
                                                type="text"
                                                label="WIP Inventory Costing"
                                                component={searchableSelect}
                                                options={this.renderTypeOfListing('profitTypes')}
                                                required={true}
                                                handleChangeDescription={this.handleChangeWIPInventory}
                                                valueDescription={this.state.wipInventoryCost}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                id="PaymentTermCostingHeadsId"
                                                name="PaymentTermCostingHeadsId"
                                                type="text"
                                                label="Payment Term Costing"
                                                component={searchableSelect}
                                                options={this.renderTypeOfListing('profitTypes')}
                                                required={true}
                                                handleChangeDescription={this.handleChangePaymentTerm}
                                                valueDescription={this.state.paymentTermCost}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save'}
                                            </button>
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
function mapStateToProps({ interestRate }) {
    if (interestRate && interestRate.interestRateComboData) {
        const { Plants, Suppliers, ModelTypes, ProfitTypes, OverheadTypes, Technologies, UnitOfMeasurements } = interestRate.interestRateComboData;
        // console.log('technologyList: ', technologyList, technologyList);
        // let initialValues = {};
        // if (technologyList !== undefined && uniOfMeasurementList !== undefined) {
        //     initialValues = {
        //         technologyList,
        //         uniOfMeasurementList
        //     }
        // }
        return { Plants, Suppliers, ModelTypes, ProfitTypes, OverheadTypes, Technologies, UnitOfMeasurements };
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    //fetchMasterDataAPI,
    getInterestRateComboData,
    createInterestRateAPI
})(reduxForm({
    form: 'addInterestRate',
    enableReinitialize: true,
})(AddSupplierInterestRate));
