import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, decimalLengthFour, trimFourDecimalPlace } from "../../../../helper/validation";
import { renderSelectField, renderNumberInputField, renderText, searchableSelect } from "../../../layout/FormInputs";
import { } from '../../../../actions/master/MachineMaster';
import {
    getPowerTypeSelectList, getChargeTypeSelectList, getPowerSupplierTypeSelectList,
    fetchPlantDataAPI, getUOMSelectList,
} from '../../../../actions/master/Comman';
import { createPowerAPI, getPowerDataAPI, updatePowerAPI } from '../../../../actions/master/PowerMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import { loggedInUserId } from '../../../../helper';
const selector = formValueSelector('AddPower');

class AddPower extends Component {
    constructor(props) {
        super(props);
        this.state = {
            powerSupplier: [],
            plant: [],
            uom: [],
            fuel: [],
            power: '',
            chargeType: '',
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    UNSAFE_componentWillMount() {
        this.props.getPowerTypeSelectList(() => { })
        this.props.getChargeTypeSelectList(() => { })
        this.props.getPowerSupplierTypeSelectList(() => { })
        this.props.fetchPlantDataAPI(() => { })
        this.props.getUOMSelectList(() => { })
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { powerId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getPowerDataAPI(powerId, res => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    setTimeout(() => { this.getData(Data) }, 500)
                }
            })
        } else {
            this.props.getPowerDataAPI('', res => { })
        }
    }

    getData = (Data) => {
        const { powerSupplierTypeSelectList, plantList, UOMSelectList, fuelList } = this.props;
        const powerObj = powerSupplierTypeSelectList.find(item => item.Value == Data.PowerSupplierId)
        const plantObj = plantList.find(item => item.Value == Data.PlantId)
        const UOMObj = UOMSelectList.find(item => item.Value == Data.UnitOfMeasurementId)
        const fuelObj = fuelList.find(item => item.Value == Data.FuelId)

        this.setState({
            powerSupplier: { label: powerObj.Text, value: powerObj.Value },
            plant: { label: plantObj.Text, value: plantObj.Value },
            uom: { label: UOMObj.Text, value: UOMObj.Value },
            fuel: { label: fuelObj.Text, value: fuelObj.Value },
            power: Data.PowerType,
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

    componentDidUpdate(prevProps) {
        if (prevProps.fieldsObj != this.props.fieldsObj) {
            this.costCalculation()
        }
    }

    /**
    * @method costCalculation
    * @description used to Reset form
    */
    costCalculation = () => {
        const { fieldsObj } = this.props;
        const totalCost = fieldsObj.FuelCostPerUnit * fieldsObj.TotalUnitCharge;
        this.props.change('NetPowerCost', trimFourDecimalPlace(totalCost))
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { power, powerSupplier, plant, uom, fuel } = this.state;

        if (this.props.isEditFlag) {

            const { powerId } = this.props;

            let updateData = {
                CreatedBy: loggedInUserId(),
                PowerId: powerId,
                PowerType: values.PowerType,
                PowerSupplierId: powerSupplier.value,
                PlantId: plant.value,
                UnitOfMeasurementId: uom.value,
                FuelId: fuel.value,
                FuelCostPerUnit: values.FuelCostPerUnit,
                TotalUnitCharge: values.TotalUnitCharge,
                NetPowerCost: values.NetPowerCost,
                // SupplierName: string,
                // SupplierCost: string,
                // SupplierCityName: string,
                // SupplierStateName: string,
                // UnitOfMeasurementName: string,
                // FuelName: string,
                // PlantName: string,
                // CreatedByName: string,
                // IsActive: true,
                // CreatedDate: 2020-03-03T14:25:34.763Z,
                // PowerSupplierName: string,
                // FuelBasicRate: 0,
                // PowerChargesType: string,
                // ContractDemandKVA: 0,
                // DemandChargesRsPerKVA: 0,
                // AvgUnitConsumptionPerMonth: 0,
                // MaxDemandCharges: 0,
                // EnergyChargesUnit: 0,
                // MeterRent: 0,
                // OtherCharges: 0,
                // DutyOnEnergyCharges: 0,
                // DutyOnEnergyFCA: string,
                // PercentOfUsageToStateElectricityBoard: 0,
                // PercentOfUsageToSelfGenerated: 0,
                // Remark: string,
                // Division: string,
                // PercentFCA: 0,
                // PowerRateing: 0
            }

            this.props.updatePowerAPI(updateData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_POWER_SUCESS);
                    this.toggleModel();
                }
            });

        } else {

            let formData = {
                CreatedBy: loggedInUserId(),
                PowerId: '',
                PowerType: values.PowerType,
                PowerSupplierId: powerSupplier.value,
                PlantId: plant.value,
                UnitOfMeasurementId: uom.value,
                FuelId: fuel.value,
                FuelCostPerUnit: values.FuelCostPerUnit,
                TotalUnitCharge: values.TotalUnitCharge,
                NetPowerCost: values.NetPowerCost,
                // FuelBasicRate: 0,
                // PowerChargesType: string,
                // ContractDemandKVA: 0,
                // DemandChargesRsPerKVA: 0,
                // AvgUnitConsumptionPerMonth: 0,
                // MaxDemandCharges: 0,
                // EnergyChargesUnit: 0, //
                // MeterRent: 0,
                // OtherCharges: 0,
                // DutyOnEnergyCharges: 0,
                // DutyOnEnergyFCA: string,
                // PercentOfUsageToStateElectricityBoard: 0,
                // PercentOfUsageToSelfGenerated: 0,
                // Remark: string,
                // Division: string,
                // PercentFCA: 0,
                // PowerRateing: 0
            }

            this.props.createPowerAPI(formData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.POWER_ADDED_SUCCESS);
                    //this.props.getPowerDataListAPI(res => { });
                    this.toggleModel()
                }
            });
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
                                                name={"PowerType"}
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
                                        {/* <Col md="6">
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
                                        </Col> */}
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
                                    {/* <Row className={'mt20'} >
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
                                    </Row> */}
                                    {/* <Row className={'mt20'}>
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
                                    </Row> */}
                                    {/* <Row>
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
                                    </Row> */}
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Fuel Cost per unit`}
                                                name={"FuelCostPerUnit"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required, decimalLengthFour]}
                                                component={renderNumberInputField}
                                                //onChange={this.costCalculation}
                                                required={true}
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
                                                validate={[required, decimalLengthFour]}
                                                component={renderNumberInputField}
                                                //onChange={this.costCalculation}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    {/* <Row>
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
                                    </Row> */}
                                    <Row>
                                        {/* <Col md="6">
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
                                        </Col> */}
                                        <Col md="6">
                                            <Field
                                                label={`Net Power Cost`}
                                                name={"NetPowerCost"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={true}
                                            />
                                        </Col>
                                    </Row>
                                    {/* <Row>
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
                                    </Row> */}
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
function mapStateToProps(state) {
    const { comman, power } = state;
    const { powerData } = power;
    const fieldsObj = selector(state, 'FuelCostPerUnit', 'TotalUnitCharge');
    const { powerTypeSelectList, chargeTypeSelectList, powerSupplierTypeSelectList, plantList, UOMSelectList, fuelList } = comman;

    let initialValues = {};
    if (powerData && powerData !== undefined) {
        initialValues = {
            PowerType: powerData.PowerType,
            FuelCostPerUnit: powerData.FuelCostPerUnit,
            TotalUnitCharge: powerData.TotalUnitCharge,
            NetPowerCost: powerData.NetPowerCost,
        }
    }

    return {
        initialValues, powerTypeSelectList, chargeTypeSelectList, powerSupplierTypeSelectList, plantList,
        UOMSelectList, fuelList, fieldsObj, powerData,
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
    createPowerAPI,
    getPowerDataAPI,
    updatePowerAPI,
})(reduxForm({
    form: 'AddPower',
    enableReinitialize: true,
})(AddPower));
