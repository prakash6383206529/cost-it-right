import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, decimalLength2 } from "../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect, renderMultiSelectField } from "../../../layout/FormInputs";
import { fetchMasterDataAPI, getCEDOtherOperationComboData, getPlantBySupplier } from '../../../../actions/master/Comman';
import {
    createCEDOtherOperationsAPI, getCEDoperationDataAPI, updateCEDoperationAPI,
    getCEDOtherOperationsAPI
} from '../../../../actions/master/OtherOperation';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message'
import { loggedInUserId } from "../../../../helper/auth";

class AddCEDotherOperation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            processOperationValue: [],
            supplierValue: [],
            selectedPlants: [],
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
        const { CEDotherOperationId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getCEDoperationDataAPI(CEDotherOperationId, res => {
                if (res && res.data && res.data.Result) {
                    let Data = res.data.Data;
                    this.props.getPlantBySupplier(Data.SupplierId, () => {
                        setTimeout(() => { this.getData(Data) }, 500)
                    })
                }
            })
        } else {
            this.props.getCEDoperationDataAPI('', res => { })
        }
    }

    getData = (Data) => {
        const { Operations, Suppliers, filterPlantList } = this.props;

        const tempObj1 = Suppliers.find(item => item.Value == Data.SupplierId)
        const tempObj4 = filterPlantList.find(item => item.Value == Data.PlantId)
        const tempObj5 = Operations.find(item => item.Value == Data.OperationId)
        console.log('tempObj4', tempObj4)
        this.setState({
            supplierValue: { label: tempObj1.Text, value: tempObj1.Value },
            selectedPlants: { label: tempObj4.Text, value: tempObj4.Value },
            processOperationValue: { label: tempObj5.Text, value: tempObj5.Value },
            uom: Data.UnitOfMeasurementId,
            transportUOM: Data.TrasnportationUMOId,
        });
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
        const { processOperationValue, SupplierId, supplierValue, uom, transportUOM, PlantId, selectedPlants } = this.state;

        values.OtherOperationName = processOperationValue.label;
        values.SupplierId = supplierValue.value;
        values.OperationId = processOperationValue.value;
        values.UnitOfMeasurementId = uom;
        values.TrasportUnitOfMeasurementId = transportUOM;
        values.PlantId = selectedPlants.value;
        values.CreatedBy = loggedInUserId();

        /** Update detail of the existing CED Other Operation  */
        if (this.props.isEditFlag) {
            const { CEDotherOperationId } = this.props;
            let formData = {
                CEDOperationId: CEDotherOperationId,
                OperationRate: values.OperationRate,
                TrasnportationRate: values.TrasnportationRate,
                OverheadProfit: values.OverheadProfit,
                SupplierId: supplierValue.value,
                OperationId: processOperationValue.value,
                UnitOfMeasurementId: values.UnitOfMeasurementId,
                TrasnportationUMOId: values.TrasportUnitOfMeasurementId,
                PlantId: selectedPlants.value,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
                IsActive: true,
                SupplierName: supplierValue.value,
                SupplierCode: '',
                OperationName: processOperationValue.label,
                UnitOfMeasurementName: '',
                TrasnportationUMOName: '',
                PlantName: '',
                IsOtherSource: true
            }
            this.props.updateCEDoperationAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.CED_OTHER_OPERATION_UPDATE_SUCCESS);
                    this.toggleModel();
                    this.props.getCEDOtherOperationsAPI(res => { });
                }
            });

        } else {

            /** Add new detail of the CED Other Operation  */
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
    // handleChangeSupplier = (newValue, actionMeta) => {
    //     this.setState({ supplierValue: newValue });
    // };

    /**
    * @method handleChangeSupplier
    * @description Used to Supplier handle
    */
    handleChangeSupplier = (newValue, actionMeta) => {
        this.setState({ supplierValue: newValue, selectedPlants: [] }, () => {
            const { supplierValue } = this.state;
            this.props.getPlantBySupplier(supplierValue.value, () => { })
        });
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
    // plantHandler = (e) => {
    //     this.setState({
    //         PlantId: e.target.value
    //     })
    // }

    /**
       * @method handlePlantSelection
       * @description called
       */
    handlePlantSelection = (newValue, actionMeta) => {
        this.setState({
            selectedPlants: newValue
        });
    };

    /**
    * @method renderSelectPlantList
    * @description Used to render listing of selected plants
    */
    renderSelectPlantList = () => {
        const { filterPlantList } = this.props;
        const temp = [];
        filterPlantList && filterPlantList.map(item => {
            if (item.Value != 0) {
                temp.push({ Text: item.Text, Value: item.Value })
            }
        });
        return temp;
    }


    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        const { Operations, Plants, filterPlantList, Suppliers, Technologies, UnitOfMeasurements } = this.props;
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update CED Other Operation' : 'Add CED Other Operation'}</ModalHeader>
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
                                                id="supplier"
                                                name="SupplierId"
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
                                        <Col md="6">
                                            {/* <Field
                                                label="Plants"
                                                name="PlantId"
                                                placeholder="--Select Plant--"
                                                selection={this.state.selectedPlants}
                                                options={this.renderSelectPlantList()}
                                                selectionChanged={this.handlePlantSelection}
                                                optionValue={option => option.Value}
                                                optionLabel={option => option.Text}
                                                component={renderMultiSelectField}
                                                mendatory={true}
                                                className="withoutBorder"
                                            /> */}
                                            <Field
                                                id="Plants"
                                                name="PlantId"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                label="Plants"
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                options={this.renderTypeOfListing('plant')}
                                                //options={supplierOptions}
                                                required={true}
                                                handleChangeDescription={this.handlePlantSelection}
                                                valueDescription={this.state.selectedPlants}
                                            />
                                        </Col>

                                    </Row>
                                    <Row>
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

                                        <Col md="6">
                                            <Field
                                                label="Operation Rate"
                                                name={"OperationRate"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required, decimalLength2]}
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
                                                label="Transportation Rate"
                                                name={"TrasnportationRate"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required, decimalLength2]}
                                                component={renderText}
                                                required={true}
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
function mapStateToProps({ comman, otherOperation }) {
    const { filterPlantList } = comman;
    const { cedOperationData } = otherOperation;
    if (comman && comman.cedOtherOperationComboData) {
        const { Operations, Plants, Suppliers, Technologies, UnitOfMeasurements } = comman.cedOtherOperationComboData;
        let initialValues = {};
        if (cedOperationData && cedOperationData != undefined) {
            initialValues = {
                OperationRate: cedOperationData.OperationRate,
                TrasnportationRate: cedOperationData.TrasnportationRate,
                OverheadProfit: cedOperationData.OverheadProfit,
                TrasportUnitOfMeasurementId: cedOperationData.TrasnportationUMOId,
                UnitOfMeasurementId: cedOperationData.UnitOfMeasurementId,
            }
        }
        return { Operations, Plants, Suppliers, Technologies, UnitOfMeasurements, filterPlantList, initialValues };
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
    createCEDOtherOperationsAPI,
    getPlantBySupplier,
    getCEDoperationDataAPI,
    updateCEDoperationAPI,
    getCEDOtherOperationsAPI,
})(reduxForm({
    form: 'addOtherOperation',
    enableReinitialize: true,
})(AddCEDotherOperation));
