import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, number, upper, decimalLength2, getNameBetweenBraces, getSupplierCode, decimalLength4 } from "../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect, renderMultiSelectField } from "../../../layout/FormInputs";
import { fetchMasterDataAPI, getOtherOperationData, getPlantBySupplier } from '../../../../actions/master/Comman';
import {
    createOtherOperationsAPI, getOtherOperationDataAPI, updateOtherOperationAPI,
    getOperationsAPI
} from '../../../../actions/master/OtherOperation';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId } from "../../../../helper/auth";

class AddOtherOperation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            processOperationValue: [],
            supplierValue: [],
            typeOfListing: [],
            selectedPlants: [],
            technologyValue: '',
            uom: '',
            PlantId: '',
            plant: [],
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.getOtherOperationData(() => {
            const { Technologies } = this.props;
            this.setState({ technologyValue: Technologies && Technologies.length > 0 ? Technologies[0].Value : '' })
        });
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { isEditFlag, OperationId, OtherOperationId } = this.props;
        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getOtherOperationDataAPI(OtherOperationId, res => {
                    if (res && res.data && res.data.Result) {

                        const { otherOperationData, Operations, Suppliers, UnitOfMeasurements } = this.props;
                        if (otherOperationData && otherOperationData != undefined) {

                            const OperationObj = Operations.find(item => item.Value == otherOperationData.OperationId)
                            const SupplierObj = Suppliers.find(item => item.Value == otherOperationData.SupplierId)
                            //const UOMObj = UnitOfMeasurements.find(item => item.Value == otherOperationData.UnitOfMeasurementId)
                            const operationCode = getNameBetweenBraces(OperationObj.Text)
                            this.props.change("OperationCode", operationCode.toUpperCase())

                            this.setState({
                                processOperationValue: { label: OperationObj.Text, value: OperationObj.Vale },
                                supplierValue: { label: SupplierObj.Text, value: SupplierObj.Value },
                                uom: otherOperationData.UnitOfMeasurementId,
                            })

                            this.props.getPlantBySupplier(SupplierObj.Value, (res) => {
                                if (res && res.data && res.data.Result) {
                                    const { filterPlantList } = this.props;
                                    const PlantObj = filterPlantList && filterPlantList.find(item => item.Value == otherOperationData.PlantId)
                                    this.setState({
                                        plant: { label: PlantObj.Text, value: PlantObj.Value },
                                    })
                                }
                            })
                        }
                    }
                })
            })
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
    * @method processOperationHandler
    * @description Used to process operation handle
    */
    processOperationHandler = (newValue, actionMeta) => {
        const { Operations } = this.props;
        this.setState({ processOperationValue: newValue }, () => {
            const { processOperationValue } = this.state;
            if (processOperationValue && processOperationValue.value != '') {
                const tempObj = Operations.find(item => item.Value == processOperationValue.value)
                const operationCode = getNameBetweenBraces(tempObj.Text)
                this.props.change("OperationCode", operationCode.toUpperCase())
            } else {
                this.props.change("OperationCode", '')
            }
        });
    };

    /**
    * @method technologyHandler
    * @description Used to technology handle
    */
    technologyHandler = (e) => {
        console.log('clicked')
        this.setState({ technologyValue: this.props.Technologies[0].value });
    }

    /**
    * @method handleChangeSupplier
    * @description Used to Supplier handle
    */
    handleChangeSupplier = (newValue, actionMeta) => {
        if (newValue != null) {
            this.setState({ supplierValue: newValue, plant: [] }, () => {
                const { supplierValue } = this.state;
                this.props.getPlantBySupplier(supplierValue.value, () => { })
            });
        } else {
            this.setState({ supplierValue: [], plant: [] });
            this.props.getPlantBySupplier('', () => { })
        }
    };

    /**
    * @method handleChangePlant
    * @description Used to Plant handle //serachable single select
    */
    handleChangePlant = (newValue, actionMeta) => {
        this.setState({ plant: newValue });
    };

    /**
    * @method uomHandler
    * @description Used to UOM handle
    */
    uomHandler = (e) => {
        this.setState({
            uom: e.target.value
        })
    }

    /**
    * @method plantHandler
    * @description Used to plant handle //single select
    */
    plantHandler = (e) => {
        this.setState({
            PlantId: e.target.value
        })
    }

    /**
    * @method renderTypeOfListing
    * @description Used show listing
    */
    renderTypeOfListing = (label) => {
        const { Operations, Plants, Suppliers, Technologies, UnitOfMeasurements, filterPlantList } = this.props;
        const temp = [];
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
        if (label == 'plant') {
            filterPlantList && filterPlantList.map(item => {
                if (item.Value != 0) {
                    temp.push({ label: item.Text, value: item.Value })
                }
            });
            return temp;
        }

    }

    /**
    * @method handlePlantSelection
    * @description called //Plant multiselect searchable
    */
    handlePlantSelection = e => {
        this.setState({
            selectedPlants: e
        });
    };

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {

        const { processOperationValue, supplierValue, selectedPlants, uom, technologyValue, PlantId, plant } = this.state;
        const { otherOperationData } = this.props;

        let plantArray = [];
        selectedPlants.map((item, i) => {
            return plantArray.push({ PlantId: item.Value, PlantName: item.Text });
        });

        values.OtherOperationName = processOperationValue.label;
        values.TechnologyId = technologyValue;
        values.SupplierId = supplierValue.value;
        values.OperationId = processOperationValue.value;
        values.UnitOfMeasurementId = uom;
        values.PlantId = plant.value;
        values.SelectedPlants = plantArray;

        if (this.props.isEditFlag) {

            this.setState({ isSubmitted: true });
            let formData = {
                OtherOperationId: otherOperationData.OtherOperationId,
                PlantName: plant.label,
                TechnologyName: '',
                SupplierName: supplierValue.label,
                SupplierCode: getSupplierCode(supplierValue.label),
                ProcessName: processOperationValue.label,
                UnitOfMeasurementName: '',
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
                IsActive: true,
                Rate: values.Rate,
                OtherOperationName: processOperationValue.label,
                OperationCode: values.OperationCode,
                Description: '',
                TechnologyId: technologyValue,
                SupplierId: supplierValue.value,
                OperationId: processOperationValue.value,
                UnitOfMeasurementId: uom,
                PlantId: plant.value,
            }
            this.props.updateOtherOperationAPI(formData, (res) => {
                if (res && res.data && res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_UOM_SUCESS);
                    this.toggleModel();
                    this.props.getOperationsAPI(res => { });
                }
            });

        } else {

            this.props.createOtherOperationsAPI(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.OTHER_OPERATION_ADD_SUCCESS);
                    { this.toggleModel() }
                    this.props.getOtherOperationData(() => { });
                } else {
                    toastr.error(res.data.message);
                }
            });

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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Other Operation' : 'Add Other Operation'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row>
                                        <Col md="12">
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
                                                label="Operation Code"
                                                name={"OperationCode"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={true}
                                                normalize={upper}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
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
                                                required={true}
                                                handleChangeDescription={this.handleChangeSupplier}
                                                valueDescription={this.state.supplierValue}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Plant"
                                                id="Plant"
                                                name="PlantId"
                                                type="text"
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                component={searchableSelect}
                                                //validate={[required, maxLength50]}
                                                options={this.renderTypeOfListing('plant')}
                                                required={true}
                                                handleChangeDescription={this.handleChangePlant}
                                                valueDescription={this.state.plant}
                                            />
                                            {/* <Field
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
                                            /> */}

                                            {/* <Field
                                                label="Plants"
                                                name="PlantId"
                                                placeholder="--Select Plant--"
                                                selection={this.state.selectedPlants}
                                                options={this.renderTypeOfListing('plant')}
                                                selectionChanged={this.handlePlantSelection}
                                                optionValue={option => option.Value}
                                                optionLabel={option => option.Text}
                                                component={renderMultiSelectField}
                                                mendatory={false}
                                                className="withoutBorder"
                                            /> */}
                                        </Col>
                                    </Row>
                                    <Row>
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
                                        <Col md="6">
                                            <Field
                                                label="Rate"
                                                name={"Rate"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required, number, decimalLength4]}
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
function mapStateToProps({ comman, otherOperation }) {
    const { filterPlantList } = comman;
    const { otherOperationData } = otherOperation;
    if (comman && comman.otherOperationFormData) {
        const { Operations, Plants, Suppliers, Technologies, UnitOfMeasurements } = comman.otherOperationFormData;
        let initialValues = {};
        if (otherOperationData && otherOperationData !== undefined) {
            initialValues = {

            }
        }
        return { Operations, Plants, Suppliers, Technologies, UnitOfMeasurements, filterPlantList, otherOperationData, initialValues };
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
    getOtherOperationData,
    createOtherOperationsAPI,
    getPlantBySupplier,
    getOtherOperationDataAPI,
    updateOtherOperationAPI,
    getOperationsAPI,
})(reduxForm({
    form: 'addOtherOperation',
    enableReinitialize: true,
})(AddOtherOperation));
