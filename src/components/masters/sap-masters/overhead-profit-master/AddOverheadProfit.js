import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, number, getSupplierCode } from "../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect, focusOnError } from "../../../layout/FormInputs";
import { getPlantBySupplier } from '../../../../actions/master/Comman';
import { createOverheadProfitAPI, getOverheadProfitComboData } from '../../../../actions/master/OverheadProfit';
//import { createOtherOperationsAPI } from '../../../../actions/master/OtherOperation';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message'

class AddOverheadProfit extends Component {
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
        this.props.getOverheadProfitComboData(() => { });
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {

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
        console.log('values: >>1111', values);
        const { overHeadValue, profitTypesValue, supplierValue, modelId, TechnologyId, PlantId } = this.state;
        const { Technologies } = this.props;
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

        console.log('values: >>sss', values);

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
            this.props.createOverheadProfitAPI(values, (res) => {
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
        if (newValue && newValue != '') {
            this.setState({ supplierValue: newValue }, () => {
                const { supplierValue } = this.state;
                this.props.getPlantBySupplier(supplierValue.value, () => {
                    const supplierCode = getSupplierCode(supplierValue.label);
                    this.props.change('SupplierCode', supplierCode)
                })
            });
        } else {
            this.setState({ supplierValue: [] })
            this.props.change('SupplierCode', '')
        }
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
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        const { ModelTypes, ProfitTypes, OverheadTypes, Plants, Suppliers, Technologies, UnitOfMeasurements, filterPlantList } = this.props;
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
            filterPlantList && filterPlantList.map(item =>
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
        const { handleSubmit, isEditFlag, reset } = this.props;

        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Overhead and Profit' : 'Add Overhead and Profit'}</ModalHeader>
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
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                id="supplier"
                                                name="supplier"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                label="Supplier"
                                                component={searchableSelect}
                                                //validate={[required]}
                                                options={this.renderTypeOfListing('supplier')}
                                                //required={true}
                                                handleChangeDescription={this.handleChangeSupplier}
                                                valueDescription={this.state.supplierValue}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Supplier Code"
                                                name={"SupplierCode"}
                                                type="text"
                                                placeholder={'Enter Supplier Code'}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Plant`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={'Enter Plant'}
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
                                        <Col md="6">
                                            <Field
                                                label="Overhead (%)"
                                                name={"OverheadPercentage"}
                                                type="text"
                                                placeholder={'Enter Overhead (%)'}
                                                validate={[number]}
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
                                        <Col md="6">
                                            <Field
                                                label="Profit (%)"
                                                name={"ProfitPercentage"}
                                                type="text"
                                                placeholder={'Enter Profit (%)'}
                                                validate={[number]}
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
                                                label="Overhead Machining(CC) (%)"
                                                name={"OverheadMachiningCCPercentage"}
                                                type="text"
                                                placeholder={''}
                                                validate={[number]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Profit Machining(CC) (%) "
                                                name={"ProfitMachiningCCPercentage"}
                                                type="text"
                                                placeholder={''}
                                                validate={[number]}
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
                                            {!isEditFlag &&
                                                <button type={'button'} className="btn btn-secondary" onClick={reset} >
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
function mapStateToProps({ overheadProfit, comman }) {
    const { filterPlantList } = comman;
    if (overheadProfit && overheadProfit.overheadProfitComboData) {
        const { Plants, Suppliers, ModelTypes, ProfitTypes, OverheadTypes, Technologies, UnitOfMeasurements } = overheadProfit.overheadProfitComboData;
        // console.log('technologyList: ', technologyList, technologyList);
        // let initialValues = {};
        // if (technologyList !== undefined && uniOfMeasurementList !== undefined) {
        //     initialValues = {
        //         technologyList,
        //         uniOfMeasurementList
        //     }
        // }
        return { Plants, Suppliers, ModelTypes, ProfitTypes, OverheadTypes, Technologies, UnitOfMeasurements, filterPlantList };
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getPlantBySupplier,
    getOverheadProfitComboData,
    createOverheadProfitAPI
})(reduxForm({
    form: 'addOverheadProfit',
    onSubmitFail: errors => {
        console.log('ddd', errors)
        focusOnError(errors);
    },
    enableReinitialize: true,
})(AddOverheadProfit));
