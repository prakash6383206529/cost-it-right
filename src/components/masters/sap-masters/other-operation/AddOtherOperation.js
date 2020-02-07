import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, number, upper, decimalLength2, getNameBetweenBraces } from "../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect, renderMultiSelectField } from "../../../layout/FormInputs";
import { fetchMasterDataAPI, getOtherOperationData, getPlantBySupplier } from '../../../../actions/master/Comman';
import { createOtherOperationsAPI } from '../../../../actions/master/OtherOperation';
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
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.getOtherOperationData(() => {
            const { Technologies } = this.props;
            this.setState({ technologyValue: Technologies[0].Value })
        });
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { isEditFlag } = this.props;
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
        const { processOperationValue, supplierValue, selectedPlants, uom, technologyValue, PlantId } = this.state;
        let loginUserId = loggedInUserId();
        let plantArray = [];
        selectedPlants.map((item, i) => {
            return plantArray.push({ PlantId: item.Value, PlantName: item.Text });
        });

        values.OtherOperationName = processOperationValue.label;
        //"OperationCode": "string",
        //"Description": "string",
        values.TechnologyId = technologyValue;
        values.SupplierId = supplierValue.value;
        values.OperationId = processOperationValue.value;
        values.UnitOfMeasurementId = uom;
        values.PlantId = PlantId;
        values.SelectedPlants = plantArray;

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
        this.setState({ supplierValue: newValue, selectedPlants: [] }, () => {
            const { supplierValue } = this.state;
            this.props.getPlantBySupplier(supplierValue.value, () => { })
        });
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
    * @description Used to plant handle
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
        // if (label == 'plant') {
        //     plantList && plantList.map(item =>
        //         temp.push({ label: item.Text, value: item.Value })
        //     );
        //     return temp;
        // }

    }

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
       * @method handlePlantSelection
       * @description called
       */
    handlePlantSelection = e => {
        this.setState({
            selectedPlants: e
        });
    };

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
                                                disabled={false}
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
                                                //options={supplierOptions}
                                                required={true}
                                                handleChangeDescription={this.handleChangeSupplier}
                                                valueDescription={this.state.supplierValue}
                                            />
                                        </Col>
                                        <Col md="6">
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

                                            <Field
                                                label="Plants"
                                                name="PlantId"
                                                placeholder="--Select Plant--"
                                                selection={this.state.selectedPlants}
                                                options={this.renderSelectPlantList()}
                                                selectionChanged={this.handlePlantSelection}
                                                optionValue={option => option.Value}
                                                optionLabel={option => option.Text}
                                                component={renderMultiSelectField}
                                                mendatory={false}
                                                className="withoutBorder"
                                            />
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
                                                validate={[required, number, decimalLength2]}
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
    const { filterPlantList } = comman;
    if (comman && comman.otherOperationFormData) {
        const { Operations, Plants, Suppliers, Technologies, UnitOfMeasurements } = comman.otherOperationFormData;
        // console.log('technologyList: ', technologyList, technologyList);
        // let initialValues = {};
        // if (technologyList !== undefined && uniOfMeasurementList !== undefined) {
        //     initialValues = {
        //         technologyList,
        //         uniOfMeasurementList
        //     }
        // }
        return { Operations, Plants, Suppliers, Technologies, UnitOfMeasurements, filterPlantList };
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
})(reduxForm({
    form: 'addOtherOperation',
    enableReinitialize: true,
})(AddOtherOperation));
