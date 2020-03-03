import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderSelectField, renderNumberInputField, renderText, searchableSelect } from "../../../layout/FormInputs";
import { } from '../../../../actions/master/MachineMaster';
import {
    getPowerTypeSelectList, getChargeTypeSelectList, getPowerSupplierTypeSelectList,
    fetchPlantDataAPI, getUOMSelectList, fetchFuelComboAPI
} from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';

class AddPower extends Component {
    constructor(props) {
        super(props);
        this.state = {
            powerSupplier: [],
            plant: [],
            uom: [],
            power: '',
            chargeType: '',
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentWillMount() {
        this.props.getPowerTypeSelectList(() => { })
        this.props.getChargeTypeSelectList(() => { })
        this.props.getPowerSupplierTypeSelectList(() => { })
        this.props.fetchPlantDataAPI(() => { })
        this.props.getUOMSelectList(() => { })
        this.props.fetchFuelComboAPI(() => { })
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { powerId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getLabourByIdAPI(powerId, true, res => { })
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
    * @method selectType
    * @description Used show listing of unit of measurement
    */
    searchableSelectType = (label) => {
        //const { roleList, departmentList, cityList } = this.props;
        //const temp = [];

        // if (label === 'role') {
        //   roleList && roleList.map(item => {
        //     if (item.Value == 0) return false;
        //     temp.push({ label: item.RoleName, value: item.RoleId })
        //   });
        //   return temp;
        // }

    }

    /**
    * @method renderListing
    * @description Display select listing
    */
    renderListing = (label) => {
        const { powerTypeSelectList, chargeTypeSelectList, powerSupplierTypeSelectList, plantList,
            UOMSelectList, fuelList } = this.props;
        const temp = [];

        if (label == 'power') {
            powerTypeSelectList && powerTypeSelectList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label == 'chargeType') {
            chargeTypeSelectList && chargeTypeSelectList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label == 'powerSupplier') {
            powerSupplierTypeSelectList && powerSupplierTypeSelectList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'plant') {
            plantList && plantList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'UOM') {
            UOMSelectList && UOMSelectList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'fuel') {
            fuelList && fuelList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

    }

    /**
    * @method handlePower
    * @description Used to handle Power
    */
    handlePower = (e) => {
        this.setState({ power: e.target.value });
    };

    /**
    * @method handleChargeType
    * @description Used to handle Charge type
    */
    handleChargeType = (e) => {
        this.setState({ chargeType: e.target.value });
    };

    /**
    * @method powerSupplierHandler
    * @description Used to handle depreciation
    */
    powerSupplierHandler = (newValue, actionMeta) => {
        this.setState({ powerSupplier: newValue });
    };

    /**
    * @method plantHandler
    * @description Used to handle plant
    */
    plantHandler = (newValue, actionMeta) => {
        this.setState({ plant: newValue });
    };

    /**
    * @method uomHandler
    * @description Used to handle UOM
    */
    uomHandler = (newValue, actionMeta) => {
        this.setState({ uom: newValue });
    };

    /**
    * @method fuelHandler
    * @description Used to handle fuel
    */
    fuelHandler = (newValue, actionMeta) => {
        this.setState({ fuel: newValue });
    };


    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            //  isEditFlag: false,
            //   department: [],
            //   role: [],
            //   city: [],
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        // if (this.props.isEditFlag) { 
        //     const { powerId } = this.props;

        //     this.props.updateLabourAPI(formData, (res) => {
        //         if (res.data.Result) {
        //             toastr.success(MESSAGES.UPDATE_LABOUR_SUCCESS);
        //             this.toggleModel();
        //             this.props.getLabourDetailAPI(res => {});
        //         } else {
        //             toastr.error(MESSAGES.SOME_ERROR);
        //         }
        //     });
        // }else{

        let formData = {
            // FuelBasicRate: 0,
            // CreatedBy: 00000000 - 0000 - 0000 - 0000 - 000000000000,
            // PowerId: 00000000 - 0000 - 0000 - 0000 - 000000000000,
            // PowerChargesType: string,
            // PowerType: string,
            // PowerSupplierId: 00000000 - 0000 - 0000 - 0000 - 000000000000,
            // PlantId: 00000000 - 0000 - 0000 - 0000 - 000000000000,
            // UnitOfMeasurementId: 00000000 - 0000 - 0000 - 0000 - 000000000000,
            // FuelId: 00000000 - 0000 - 0000 - 0000 - 000000000000,
            // ContractDemandKVA: 0,
            // DemandChargesRsPerKVA: 0,
            // AvgUnitConsumptionPerMonth: 0,
            // MaxDemandCharges: 0,
            // EnergyChargesUnit: 0, //
            // MeterRent: 0,
            // OtherCharges: 0,
            // FuelCostPerUnit: 0,
            // DutyOnEnergyCharges: 0,
            // DutyOnEnergyFCA: string,
            // TotalUnitCharge: 0,
            // PercentOfUsageToStateElectricityBoard: 0,
            // PercentOfUsageToSelfGenerated: 0,
            // NetPowerCost: 0,
            // Remark: string,
            // Division: string,
            // PercentFCA: 0,
            // PowerRateing: 0
        }

        this.props.createLabourAPI(formData, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.LABOUR_ADDED_SUCCESS);
                this.props.getLabourDetailAPI(res => { });
                this.toggleModel()
            }
        });
        // }

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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Power Details' : 'Add Power Details'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row className={'mb20'}>
                                        <Col md="6">
                                            <Field
                                                label={`Power`}
                                                name={"PowerID"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderListing('power')}
                                                onChange={this.handlePower}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Charge Type`}
                                                name={"ChargeType"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderListing('chargeType')}
                                                onChange={this.handleChargeType}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                name="PowerSupplierName"
                                                type="text"
                                                label="Power supplier Name"
                                                component={searchableSelect}
                                                placeholder={'Select...'}
                                                options={this.renderListing('powerSupplier')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.powerSupplierHandler}
                                                valueDescription={this.state.powerSupplier}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                name="Plant"
                                                type="text"
                                                label="Plant"
                                                component={searchableSelect}
                                                placeholder={'Select Plant'}
                                                options={this.renderListing('plant')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.plantHandler}
                                                valueDescription={this.state.plant}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className={'mt20'} >
                                        <Col md="6">
                                            <Field
                                                name="UOM"
                                                type="text"
                                                label="UOM"
                                                component={searchableSelect}
                                                placeholder={'Select UOM'}
                                                options={this.renderListing('UOM')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.uomHandler}
                                                valueDescription={this.state.uom}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                name="Fuel"
                                                type="text"
                                                label="Fuel"
                                                component={searchableSelect}
                                                placeholder={'Select Fuel'}
                                                options={this.renderListing('fuel')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.fuelHandler}
                                                valueDescription={this.state.fuel}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className={'mt20'} >
                                        <Col md="6">
                                            <Field
                                                label={`Contract`}
                                                name={"ContractDemandKVA"}
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
                                                label={`Demand`}
                                                name={"DemandChargesRsPerKVA"}
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
                                    <Row className={'mt20'}>
                                        <Col md="6">
                                            <Field
                                                label={`Avg. unit consumption per month`}
                                                name={"AvgUnitConsumptionPerMonth"}
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
                                                label={`Max Demand energy`}
                                                name={"MaxDemandCharges"}
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
                                                label={`Meter rent`}
                                                name={"MeterRent"}
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
                                                label={`Other charges`}
                                                name={"OtherCharges"}
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
                                                label={`Fuel Cost per unit`}
                                                name={"FuelCostPerUnit"}
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
                                                label={`Duty on energy`}
                                                name={"DutyOnEnergyCharges"}
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
                                                label={`FCA`}
                                                name={"DutyOnEnergyFCA"}
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
                                                label={`Total unit`}
                                                name={"TotalUnitCharge"}
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
                                                label={`Percentage`}
                                                name={"PercentOfUsageToStateElectricityBoard"}
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
                                                label={`Percentage`}
                                                name={"PercentOfUsageToSelfGenerated"}
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
                                                label={`Percentage`}
                                                name={"NetPowerCost"}
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
                                                label={`Remark`}
                                                name={"Remark"}
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
                                                label={`Division`}
                                                name={"Division"}
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
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Add'}
                                            </button>
                                            {!isEditFlag &&
                                                <button type={'button'} className="btn btn-secondary" onClick={this.cancel} >
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
function mapStateToProps({ comman, machine }) {
    const { powerTypeSelectList, chargeTypeSelectList, powerSupplierTypeSelectList, plantList,
        UOMSelectList, fuelList } = comman;
    let initialValues = {};
    // if(labourData && labourData !== undefined){
    //     initialValues = {
    //         LabourRate: labourData.LabourRate,
    //         LabourTypeId: labourData.LabourTypeId,
    //         PlantId: labourData.PlantId,
    //         TechnologyId: labourData.TechnologyId,
    //     }
    // }
    return {
        initialValues, powerTypeSelectList, chargeTypeSelectList, powerSupplierTypeSelectList, plantList,
        UOMSelectList, fuelList
    }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getPowerTypeSelectList,
    getChargeTypeSelectList,
    getPowerSupplierTypeSelectList,
    fetchPlantDataAPI,
    getUOMSelectList,
    fetchFuelComboAPI,
})(reduxForm({
    form: 'AddPower',
    enableReinitialize: true,
})(AddPower));
