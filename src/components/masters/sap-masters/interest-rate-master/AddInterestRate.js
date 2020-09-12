import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect } from "../../../layout/FormInputs";
//import { fetchMasterDataAPI, getOtherOperationData } from '../../../../actions/master/Comman';
import { createInterestRateAPI, getInterestRateComboData } from '../../../../actions/master/InterestRateMaster';
//import { createOtherOperationsAPI } from '../../../../actions/master/OtherOperation';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId } from "../../../../helper/auth";

class AddInterestRate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            processOperationValue: [],
            supplierValue: [],
            overHeadValue: [],
            profitTypesValue: [],
            typeOfListing: [],
            technologyValue: '',
            TechnologyId: '',
            PlantId: '',
            modelId: ''
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.getInterestRateComboData(() => { });
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { uomId, isEditFlag } = this.props;

        // if (isEditFlag) {
        //     this.setState({ isEditFlag }, () => {
        //         this.props.getOneUnitOfMeasurementAPI(uomId, true, res => { })
        //     })
        // } else {
        //     this.props.getOneUnitOfMeasurementAPI('', false, res => { })
        // }
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
        const { overHeadValue, profitTypesValue, supplierValue, modelId, TechnologyId, PlantId } = this.state;
        const { Technologies } = this.props;

        let loginUserId = loggedInUserId();

        //values.OtherOperationName = processOperationValue.label;
        //"OperationCode": "string",
        //"Description": "string",
        values.TechnologyId = TechnologyId != '' ? TechnologyId : Technologies[0].Value;;
        values.SupplierId = supplierValue.value;
        values.OverheadTypeId = overHeadValue.value;
        values.ProfitTypeId = profitTypesValue.value;
        //values.OperationId = processOperationValue.value;
        //values.UnitOfMeasurementId = uom;
        values.PlantId = PlantId;
        values.ModelTypeId = modelId;
        values.CreatedBy = loginUserId;

        if (this.props.isEditFlag) {

        } else {
            this.props.createInterestRateAPI(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.OVERHEAD_PROFIT_ADDED_SUCCESS);
                    { this.toggleModel() }
                } else {
                    toastr.error(res.data.message);
                }
            });
        }
    }

    processOperationHandler = (newValue, actionMeta) => {
        this.setState({ processOperationValue: newValue });
    };

    technologyHandler = (e) => {
        this.setState({ TechnologyId: e.target.value });
    }

    handleChangeSupplier = (newValue, actionMeta) => {
        this.setState({ supplierValue: newValue });
    };

    handleChangeOverheadType = (newValue, actionMeta) => {
        this.setState({ overHeadValue: newValue });
    };

    handleChangeProfitTypes = (newValue, actionMeta) => {
        this.setState({ profitTypesValue: newValue });
    };

    uomHandler = (e) => {
        this.setState({
            uom: e.target.value
        })
    }

    plantHandler = (e) => {
        this.setState({
            PlantId: e.target.value
        })
    }

    modelHandler = (e) => {
        this.setState({
            modelId: e.target.value
        })
    }

    /**
    * @method renderTypeOfListing
    * @description Used show listing of types
    */
    renderTypeOfListing = (label) => {
        const { ModelTypes, ProfitTypes, OverheadTypes, Plants, Suppliers, Technologies, UnitOfMeasurements } = this.props;
        const temp = [];
        //const tempSupplier = [];
        if (label == 'technology') {
            Technologies && Technologies.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label == 'modelTypes') {
            ModelTypes && ModelTypes.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label == 'profitTypes') {
            ProfitTypes && ProfitTypes.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label == 'overheadTypes') {
            OverheadTypes && OverheadTypes.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label == 'supplier') {
            Suppliers && Suppliers.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label == 'uom') {
            UnitOfMeasurements && UnitOfMeasurements.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label == 'plant') {
            Plants && Plants.map(item =>
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
                                        {/* <Col md="6">
                                            <Field
                                                label={`Technology`}
                                                name={"TechnologyId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                //required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderTypeOfListing('technology')}
                                                //options={technologyOptions}
                                                onChange={this.technologyHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col> */}
                                        <Col md="6">
                                            <Field
                                                id="supplier"
                                                name="supplier"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                label="Supplier"
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                options={this.renderTypeOfListing('supplier')}
                                                //options={supplierOptions}
                                                required={true}
                                                handleChangeDescription={this.handleChangeSupplier}
                                                valueDescription={this.state.supplierValue}
                                            />
                                        </Col>
                                    </Row>
                                    {/* <Row>
                                        <Col md="6">
                                            <Field
                                                label="Supplier Code"
                                                name={"SupplierCode"}
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
                                                id="OverheadTypeId"
                                                name="OverheadTypeId"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                label="Overhead Type"
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                options={this.renderTypeOfListing('overheadTypes')}
                                                //options={supplierOptions}
                                                required={true}
                                                handleChangeDescription={this.handleChangeOverheadType}
                                                valueDescription={this.state.overHeadValue}
                                            />
                                        </Col>
                                    </Row> */}
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Overhead (%)"
                                                name={"OverheadPercentage"}
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
                                                id="ProfitTypeId"
                                                name="ProfitTypeId"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                label="Profit Type"
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                options={this.renderTypeOfListing('profitTypes')}
                                                //options={supplierOptions}
                                                required={true}
                                                handleChangeDescription={this.handleChangeProfitTypes}
                                                valueDescription={this.state.profitTypesValue}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Profit (%)"
                                                name={"ProfitPercentage"}
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
                                                label="Overhead Machining(CC) (%)"
                                                name={"OverheadMachiningCCPercentage"}
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
                                        <Col>
                                            <Field
                                                label="Profit Machining(CC) (%) "
                                                name={"ProfitMachiningCCPercentage"}
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
                                                label={`Plant`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderTypeOfListing('plant')}
                                                onChange={this.plantHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Field
                                                label={`Model Type`}
                                                name={"ModelTypeId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderTypeOfListing('modelTypes')}
                                                onChange={this.modelHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
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
        let initialValues = {};

        return { Plants, Suppliers, ModelTypes, ProfitTypes, OverheadTypes, Technologies, initialValues, UnitOfMeasurements };
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
})(AddInterestRate));
