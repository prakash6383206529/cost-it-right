import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect } from "../../../layout/FormInputs";
import { fetchMasterDataAPI, getCEDOtherOperationComboData } from '../../../../actions/master/Comman';
import { createCEDOtherOperationsAPI } from '../../../../actions/master/OtherOperation';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message'

class AddCEDotherOperation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            processOperationValue: [],
            supplierValue: [],
            typeOfListing: [],
            SupplierId: '',
            uom: '',
            transportUOM: '',
            PlantId: ''
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.getCEDOtherOperationComboData(() => { });
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
        const { processOperationValue, SupplierId, uom, transportUOM, PlantId } = this.state;

        values.OtherOperationName = processOperationValue.label;
        values.SupplierId = SupplierId;
        values.OperationId = processOperationValue.value;
        values.UnitOfMeasurementId = uom;
        values.TrasportUnitOfMeasurementId = transportUOM;
        values.PlantId = PlantId;
        /** Update detail of the existing CED Other Operation  */
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
        } else {  /** Add new detail of the CED Other Operation  */
            this.props.createCEDOtherOperationsAPI(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.CED_OTHER_OPERATION_ADD_SUCCESS);
                    this.toggleModel()
                } else {
                    toastr.error(res.data.message);
                }
            });
        }
    }

    /**
    * @method processOperationHandler
    * @description Used to handle process operation
    */
    processOperationHandler = (newValue, actionMeta) => {
        this.setState({ processOperationValue: newValue });
    };

    /**
    * @method supplierHandler
    * @description Used to handle supplier
    */
    supplierHandler = (e) => {
        console.log('clicked')
        this.setState({ SupplierId: e.target.value });
    }

    /**
    * @method handleChangeSupplier
    * @description Used to handle supplier change
    */
    handleChangeSupplier = (newValue, actionMeta) => {
        this.setState({ supplierValue: newValue });
    };

    /**
    * @method uomHandler
    * @description Used to handle UOM
    */
    uomHandler = (e) => {
        this.setState({
            uom: e.target.value
        })
    }

    /**
    * @method transportUOMHandler
    * @description Used to handle transport UOM
    */
    transportUOMHandler = (e) => {
        this.setState({
            transportUOM: e.target.value
        })
    }

    /**
    * @method plantHandler
    * @description Used to handle plant id
    */
    plantHandler = (e) => {
        this.setState({
            PlantId: e.target.value
        })
    }


    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        const { Operations, Plants, Suppliers, Technologies, UnitOfMeasurements } = this.props;
        const temp = [];
        //const tempSupplier = [];
        if (label == 'technology') {
            Technologies && Technologies.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label == 'processOperation') {
            Operations && Operations.map(item =>
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
        if (label == 'TransportUOM') {
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update UOM' : 'Add CED Other Operation'}</ModalHeader>
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
                                                label={`Supplier`}
                                                name={"SupplierId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                //required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderTypeOfListing('supplier')}
                                                //options={technologyOptions}
                                                onChange={this.supplierHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                id="processOperation"
                                                name="processOperation"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                label="Process Operation"
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                options={this.renderTypeOfListing('processOperation')}
                                                //options={options}
                                                required={true}
                                                handleChangeDescription={this.processOperationHandler}
                                                valueDescription={this.state.processOperationValue}
                                            />
                                        </Col>

                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Operation Rate"
                                                name={"OperationRate"}
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
                                                label={`UOM`}
                                                name={"UnitOfMeasurementId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderTypeOfListing('uom')}
                                                //options={uomOptions}
                                                onChange={this.uomHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Transportation Rate"
                                                name={"TrasnportationRate"}
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
                                                label={`Transportation UOM`}
                                                name={"TrasportUnitOfMeasurementId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderTypeOfListing('TransportUOM')}
                                                //options={uomOptions}
                                                onChange={this.transportUOMHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
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
                                        <Col md="6">
                                            <Field
                                                label="Overhead/Profit(%)"
                                                name={"OverheadProfit"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
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
function mapStateToProps({ comman }) {
    if (comman && comman.cedOtherOperationComboData) {
        const { Operations, Plants, Suppliers, Technologies, UnitOfMeasurements } = comman.cedOtherOperationComboData;
        // console.log('technologyList: ', technologyList, technologyList);
        // let initialValues = {};
        // if (technologyList !== undefined && uniOfMeasurementList !== undefined) {
        //     initialValues = {
        //         technologyList,
        //         uniOfMeasurementList
        //     }
        // }
        return { Operations, Plants, Suppliers, Technologies, UnitOfMeasurements };
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    fetchMasterDataAPI,
    getCEDOtherOperationComboData,
    createCEDOtherOperationsAPI
})(reduxForm({
    form: 'addOtherOperation',
    enableReinitialize: true,
})(AddCEDotherOperation));
