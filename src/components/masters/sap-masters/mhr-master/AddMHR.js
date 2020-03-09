import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, FormGroup, Label, Input } from 'reactstrap';
import { required, getSupplierCode, decimalLengthFour, Numeric, trimFourDecimalPlace } from "../../../../helper/validation";
import { renderText, renderSelectField, renderNumberInputField, searchableSelect, InputHiddenField } from "../../../layout/FormInputs";
import {
    fetchMasterDataAPI, getMHRMasterComboData, getMachineSelectListByMachineType, getUOMSelectList
} from '../../../../actions/master/Comman';
import {
    createMHRMasterAPI, getLabourDetailsSelectListByMachine, getDepreciationDataAPI, getMHRDataAPI,
    updateMHRAPI, getSupplierType,
} from '../../../../actions/master/MHRMaster';
import { getMachineTypeSelectList, getDepreciationSelectList, fetchFuelComboAPI, getShiftTypeSelectList } from '../../../../actions/master/Comman';
import { getMachineDataAPI } from '../../../../actions/master/MachineMaster';
import { getFuelDetailAPI } from '../../../../actions/master/Fuel';
import { getPowerDataListAPI, getPowerDataAPI } from '../../../../actions/master/PowerMaster';
import { getRadioButtonSupplierType } from '../../../../actions/master/Supplier';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId } from "../../../../helper/auth";
import { SKILLED, CONTRACT, SEMI_SKILLED, UNSKILLED } from '../../../../config/constants';
const selector = formValueSelector('AddMHR');

class AddMHR extends Component {
    constructor(props) {
        super(props);
        this.state = {
            SupplierId: '',
            uom: '',
            TechnologyId: '',
            PlantId: '',
            supplierType: '',
            MachineClass: [],
            MachineName: [],
            Power: [],
            showLabour: false,
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.getSupplierType(() => { })
        this.props.getMHRMasterComboData(() => { });
        this.props.getMachineTypeSelectList(() => { })
        this.props.getDepreciationSelectList(() => { })
        this.props.fetchFuelComboAPI(() => { })
        this.props.getShiftTypeSelectList(() => { })
        this.props.getUOMSelectList(() => { })
        this.props.getFuelDetailAPI(() => { })
        this.props.getPowerDataListAPI(() => { })
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { MachineHourRateId, isEditFlag } = this.props;

        if (isEditFlag) {
            this.props.getMHRDataAPI(MachineHourRateId, res => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    this.props.getMachineSelectListByMachineType(Data.MachineTypeId, () => { })
                    setTimeout(() => { this.getData(Data) }, 500)
                }
            })
        } else {
            this.props.getMHRDataAPI('', res => { })
            this.getLabourDetails('', '');
        }

    }

    /**
    * @method getData
    * @description Used to get Data
    */
    getData = (Data) => {
        console.log('Data', Data)
        const { fuelDataList, MachineTypeSelectList, MachineByMachineTypeSelectList, powerList, fuelList } = this.props;

        let fuelObj = fuelDataList && fuelDataList.find(item => item.FuelDetailId == Data.FuelDetailId)

        this.props.getMachineDataAPI(Data.MachineId, MachineResponse => {
            if (MachineResponse && MachineResponse.data && MachineResponse.data.Data) {
                let MachineData = MachineResponse.data.Data;
                this.props.change('Depreciation', MachineData.DepreciationId)
            }
        })

        this.props.getPowerDataAPI(Data.PowerId, res => { })

        this.getLabourDetails(Data.MachineTypeId, Data.PlantId);

        this.props.change('FuelType', fuelObj.FuelId)
        this.props.change('NumberOfSkilledLabour', Data.NumberOfSkilledLabour)
        this.props.change('NumberOfUnskilledLabour', Data.NumberOfUnskilledLabour)
        this.props.change('NumberOfSemiSkilledLabour', Data.NumberOfSemiSkilledLabour)
        this.props.change('NumberOfContractLabour', Data.NumberOfContractLabour)

        const MachineClassObj = MachineTypeSelectList && MachineTypeSelectList.find(item => item.Value == Data.MachineTypeId)
        const MachineObj = MachineByMachineTypeSelectList && MachineByMachineTypeSelectList.find(item => item.Value == Data.MachineId)
        const PowerObj = powerList && powerList.find(item => item.PowerId == Data.PowerId)

        this.setState({
            MachineClass: { label: MachineClassObj.Text, value: MachineClassObj.Value },
            MachineName: { label: MachineObj.Text, value: MachineObj.Value },
            Power: { label: PowerObj.PowerType, value: PowerObj.PowerId },
            showLabour: true,
            PlantId: Data.PlantId,
            SupplierId: Data.SupplierId,
        });
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
        this.setState({ showLabour: false });
    }

    /**
    * @method technologyHandler
    * @description Used to technologyHandler
    */
    technologyHandler = (e) => {
        this.setState({ TechnologyId: e.target.value });
    }

    /**
    * @method supplierHandler
    * @description Used to supplierHandler
    */
    supplierHandler = (e) => {
        if (e.target.value != 0) {
            this.setState({ SupplierId: e.target.value }, () => {
                const { Suppliers } = this.props;
                const tempObj = Suppliers.find(item => item.Value == e.target.value)
                const supplierCode = getSupplierCode(tempObj.Text);
                this.props.change('SupplierCode', supplierCode)
            });
        } else {
            this.setState({ SupplierId: '' }, () => {
                this.props.change('SupplierCode', '')
            });
        }
    }

    /**
    * @method plantHandler
    * @description Used to plantHandler
    */
    plantHandler = (e) => {
        this.setState({ PlantId: e.target.value })
    }

    /**
    * @method renderListing
    * @description Used show listing
    */
    renderListing = (label) => {
        const { supplierTypeList, Operations, Plants, Suppliers, Technologies, UnitOfMeasurements, MachineTypeSelectList,
            MachineByMachineTypeSelectList, DepreciationSelectList, fuelList, ShiftTypeSelectList,
            UOMSelectList, powerList } = this.props;
        const temp = [];

        if (label == 'supplierType') {
            supplierTypeList && supplierTypeList.map((item, i) => {
                // if (item.Value != 0) {
                temp.push({ Text: item.Text, Value: item.Value })
                //}
            });
            return temp;
        }

        if (label == 'technology') {
            Technologies && Technologies.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'depreciation') {
            DepreciationSelectList && DepreciationSelectList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'shift') {
            ShiftTypeSelectList && ShiftTypeSelectList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'fuel') {
            fuelList && fuelList.map(item => {
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label == 'UOM') {
            UOMSelectList && UOMSelectList.map(item => {
                temp.push({ label: item.Text, value: item.Value })
            });
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

        if (label == 'MachineClass') {
            MachineTypeSelectList && MachineTypeSelectList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'MachineName') {
            MachineByMachineTypeSelectList && MachineByMachineTypeSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label == 'Power') {
            powerList && powerList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.PowerType, value: item.PowerId })
            });
            return temp;
        }

    }

    supplierTypeHandler = (value) => {
        this.setState({ supplierType: value })
    }

    /**
    * @method classHandler
    * @description Used to handle machine class
    */
    classHandler = (newValue, actionMeta) => {
        if (newValue != null) {
            this.setState({ MachineClass: newValue, MachineName: [] }, () => {
                const { MachineClass } = this.state;
                this.props.getMachineSelectListByMachineType(MachineClass.value, () => { })
            });
        } else {
            this.setState({ MachineClass: [], MachineName: [] }, () => {
                this.props.getMachineSelectListByMachineType('', () => { })
            });
        }
    };

    /**
    * @method setMHRData
    * @description Used to set MHR field on the basis of Machine data.
    */
    setMHRData = (Data) => {

        this.props.getDepreciationDataAPI(Data.DepreciationId, res => {
            if (res && res.data && res.data.Data) {
                let Data = res.data.Data;
                this.props.change('TotalDepreciationCost', Data.DepreciationRate)
            }
        })

        this.props.change('MachineDescription', Data.Description)
        this.props.change('PowerRating', Data.PowerRating)
        this.props.change('Depreciation', Data.DepreciationId)
        this.props.change('FuelType', Data.FuelId)
        this.props.change('Consumable', Data.UtilizationFactor)
        this.props.change('Loan', Data.LoanAmount)
        this.props.change('Equity', Data.Equity)
        this.props.change('RateOfInterest', Data.RateOfInterest)

    }

    /**
    * @method MachineNameHandler
    * @description Used to handle Machine Name
    */
    MachineNameHandler = (newValue, actionMeta) => {

        if (newValue != null) {

            this.setState({ MachineName: newValue }, () => {
                const { MachineName, MachineClass, PlantId } = this.state;
                this.getLabourDetails(MachineClass.value, PlantId);
                this.props.getMachineDataAPI(MachineName.value, res => {
                    if (res && res.data && res.data.Data) {
                        let Data = res.data.Data;
                        setTimeout(() => { this.setMHRData(Data) }, 500)
                    }
                })
            });

        } else {

            this.setState({ MachineName: [] }, () => {
                this.getLabourDetails('', '');
                this.props.getMachineDataAPI('', res => { })
            });

        }

    };

    /**
    * @method handleSupplierType
    * @description Used to handle supplier type
    */
    handleSupplierType = (e) => {
        this.setState({
            supplierType: e.target.value
        });
    }

    /**
    * @method PowerHandler
    * @description Used to handle Power
    */
    PowerHandler = (newValue, actionMeta) => {

        if (newValue != null) {

            this.setState({ Power: newValue }, () => {
                const { Power } = this.state;
                this.props.getPowerDataAPI(Power.value, res => {
                    if (res && res.data && res.data.Data) {
                        let Data = res.data.Data;

                    }
                })
            });

        } else {



        }

    };

    getLabourDetails = (MachineTypeId, PlantId) => {
        this.props.getLabourDetailsSelectListByMachine(MachineTypeId, PlantId, (res) => {
            if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                if (Data && Data.length > 0) {

                    let skilledLabour = Data && Data.find(item => item.LabourTypeName == SKILLED)
                    let contractLabour = Data && Data.find(item => item.LabourTypeName == CONTRACT)
                    let unSkilledLabour = Data && Data.find(item => item.LabourTypeName == UNSKILLED)
                    let semiSkilledLabour = Data && Data.find(item => item.LabourTypeName == SEMI_SKILLED)

                    this.props.change('SkilledLabourTypeId', skilledLabour != undefined ? skilledLabour.LabourId : null)
                    this.props.change('SkilledLabourName', skilledLabour != undefined ? skilledLabour.LabourTypeName : null)
                    this.props.change('RateSkilledLabour', skilledLabour != undefined ? skilledLabour.LabourRate : null)
                    //this.props.change('NumberOfSkilledLabour', skilledLabour != undefined ? skilledLabour.NumberOfLabours : null)

                    this.props.change('ContractLabourTypeId', contractLabour != undefined ? contractLabour.LabourId : null)
                    this.props.change('ContractLabourName', contractLabour != undefined ? contractLabour.LabourTypeName : null)
                    this.props.change('RateContractLabour', contractLabour != undefined ? contractLabour.LabourRate : null)
                    //this.props.change('NumberOfContractLabour', contractLabour != undefined ? contractLabour.NumberOfLabours : null)

                    this.props.change('UnSkilledLabourTypeId', unSkilledLabour != undefined ? unSkilledLabour.LabourId : null)
                    this.props.change('UnSkilledLabourName', unSkilledLabour != undefined ? unSkilledLabour.LabourTypeName : null)
                    this.props.change('RateUnskilledLabour', unSkilledLabour != undefined ? unSkilledLabour.LabourRate : null)
                    //this.props.change('NumberOfUnskilledLabour', unSkilledLabour != undefined ? unSkilledLabour.NumberOfLabours : null)

                    this.props.change('SemiSkilledLabourTypeId', semiSkilledLabour != undefined ? semiSkilledLabour.LabourId : null)
                    this.props.change('SemiSkilledLabourName', semiSkilledLabour != undefined ? semiSkilledLabour.LabourTypeName : null)
                    this.props.change('RateSemiSkilledLabour', semiSkilledLabour != undefined ? semiSkilledLabour.LabourRate : null)
                    //this.props.change('NumberOfSemiSkilledLabour', semiSkilledLabour != undefined ? semiSkilledLabour.NumberOfLabours : null)

                    this.setState({ showLabour: true });

                } else {
                    this.setState({ showLabour: false });
                }
            }
        })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.fieldsObj != this.props.fieldsObj) {
            this.handleCalculation()
        }
    }

    handleCalculation = () => {
        const { fieldsObj } = this.props;

        const netSkilledCost = fieldsObj.RateSkilledLabour * fieldsObj.NumberOfSkilledLabour;
        const netUnSkilledCost = fieldsObj.RateUnskilledLabour * fieldsObj.NumberOfUnskilledLabour;
        const netSemiSkilledCost = fieldsObj.RateSemiSkilledLabour * fieldsObj.NumberOfSemiSkilledLabour;
        const netContractCost = fieldsObj.RateContractLabour * fieldsObj.NumberOfContractLabour;
        const TotallabourCost = netSkilledCost + netUnSkilledCost + netSemiSkilledCost + netContractCost;

        this.props.change('SkilledLabourCost', typeof netSkilledCost == NaN ? 0 : trimFourDecimalPlace(netSkilledCost))
        this.props.change('UnSkilledLabourCost', typeof netUnSkilledCost == NaN ? 0 : trimFourDecimalPlace(netUnSkilledCost))
        this.props.change('SemiSkilledLabourCost', typeof netSemiSkilledCost == NaN ? 0 : trimFourDecimalPlace(netSemiSkilledCost))
        this.props.change('ContractLabourCost', typeof netContractCost == NaN ? 0 : trimFourDecimalPlace(netContractCost))
        this.props.change('TotalLabourCost', TotallabourCost)

    }

    renderSkilled = (Data) => {
        return (
            <Row>
                <Col md="3">
                    <Field
                        label={''}
                        name={"SkilledLabourTypeId"}
                        type="hidden"
                        placeholder={''}
                        //validate={[required]}
                        component={InputHiddenField}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                    <Field
                        label={''}
                        name={"SkilledLabourName"}
                        type="text"
                        placeholder={''}
                        //validate={[required]}
                        component={renderText}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                </Col>
                <Col md="3">
                    <Field
                        label={''}
                        name={"RateSkilledLabour"}
                        type="text"
                        placeholder={''}
                        //validate={[required]}
                        component={renderText}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                </Col>
                <Col md="3">
                    <Field
                        label={''}
                        name={"NumberOfSkilledLabour"}
                        type="text"
                        placeholder={''}
                        validate={[required, Numeric]}
                        component={renderNumberInputField}
                        required={true}
                        className=" withoutBorder"
                        disabled={false}
                    />
                </Col>
                <Col md="3">
                    <Field
                        label={''}
                        name={"SkilledLabourCost"}
                        type="text"
                        Value={Data.LabourRate}
                        placeholder={''}
                        validate={[decimalLengthFour]}
                        component={renderText}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                </Col>
            </Row>
        )
    }


    renderUnSkilled = (Data) => {
        return (
            <Row>
                <Col md="3">
                    <Field
                        label={''}
                        name={"UnSkilledLabourTypeId"}
                        type="hidden"
                        placeholder={''}
                        //validate={[required]}
                        component={InputHiddenField}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                    <Field
                        label={''}
                        name={"UnSkilledLabourName"}
                        type="text"
                        placeholder={''}
                        //validate={[required]}
                        component={renderText}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                </Col>
                <Col md="3">
                    <Field
                        label={''}
                        name={"RateUnskilledLabour"}
                        type="text"
                        placeholder={''}
                        //validate={[required]}
                        component={renderText}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                </Col>
                <Col md="3">
                    <Field
                        label={''}
                        name={"NumberOfUnskilledLabour"}
                        type="text"
                        placeholder={''}
                        validate={[required, Numeric]}
                        component={renderNumberInputField}
                        required={true}
                        className=" withoutBorder"
                        disabled={false}
                    />
                </Col>
                <Col md="3">
                    <Field
                        label={''}
                        name={"UnSkilledLabourCost"}
                        type="text"
                        placeholder={''}
                        validate={[decimalLengthFour]}
                        component={renderText}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                </Col>
            </Row>
        )
    }

    renderSemiSkilled = (Data) => {
        return (
            <Row>
                <Col md="3">
                    <Field
                        label={''}
                        name={"SemiSkilledLabourTypeId"}
                        type="hidden"
                        placeholder={''}
                        //validate={[required]}
                        component={InputHiddenField}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                    <Field
                        label={''}
                        name={"SemiSkilledLabourName"}
                        type="text"
                        placeholder={''}
                        //validate={[required]}
                        component={renderText}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                </Col>
                <Col md="3">
                    <Field
                        label={''}
                        name={"RateSemiSkilledLabour"}
                        type="text"
                        placeholder={''}
                        //validate={[required]}
                        component={renderText}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                </Col>
                <Col md="3">
                    <Field
                        label={''}
                        name={"NumberOfSemiSkilledLabour"}
                        type="text"
                        placeholder={''}
                        validate={[required, Numeric]}
                        component={renderNumberInputField}
                        required={true}
                        className=" withoutBorder"
                        disabled={false}
                    />
                </Col>
                <Col md="3">
                    <Field
                        label={''}
                        name={"SemiSkilledLabourCost"}
                        type="text"
                        placeholder={''}
                        validate={[decimalLengthFour]}
                        component={renderText}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                </Col>
            </Row>
        )
    }

    renderContract = (Data) => {
        return (
            <Row>
                <Col md="3">
                    <Field
                        label={''}
                        name={"ContractLabourTypeId"}
                        type="hidden"
                        placeholder={''}
                        //validate={[required]}
                        component={InputHiddenField}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                    <Field
                        label={''}
                        name={"ContractLabourName"}
                        type="text"
                        placeholder={''}
                        //validate={[required]}
                        component={renderText}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                </Col>
                <Col md="3">
                    <Field
                        label={''}
                        name={"RateContractLabour"}
                        type="text"
                        placeholder={''}
                        //validate={[required]}
                        component={renderText}
                        //required={true}
                        className=" withoutBorder"
                        disabled={true}
                    />
                </Col>
                <Col md="3">
                    <Field
                        label={''}
                        name={"NumberOfContractLabour"}
                        type="text"
                        placeholder={''}
                        validate={[required]}
                        component={renderNumberInputField}
                        required={true}
                        className=" withoutBorder"
                        disabled={false}
                    />
                </Col>
                <Col md="3">
                    <Field
                        label={''}
                        name={"ContractLabourCost"}
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
        )
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { SupplierId, uom, PlantId, TechnologyId, supplierType, MachineName, Power } = this.state;
        const { Technologies, machineData, fuelDataList, powerData } = this.props;

        let fuelDetails = fuelDataList && fuelDataList.find(item => item.FuelId == values.FuelType)

        if (this.props.isEditFlag) {

            const { MachineHourRateId } = this.props;

            let updateData = {

                MachineHourRateId: MachineHourRateId,
                TechnologyName: '',
                SupplierName: '',
                SupplierCode: '',
                SupplierType: '',
                DepreciationType: '',
                UnitOfMeasurementName: '',
                PlantName: '',
                CompanyName: '',

                SkilledLabourTypeId: values.SkilledLabourTypeId,
                SemiSkilledLabourTypeId: values.SemiSkilledLabourTypeId,
                UnskilledLabourTypeId: values.UnskilledLabourTypeId,
                ContractLabourTypeId: values.ContractLabourTypeId,

                MachineNumber: machineData.MachineNumber,
                MachineTonnage: machineData.MachineTonnage,
                MachineName: machineData.MachineName,
                Description: machineData.Description,
                Make: machineData.Make,
                MachineCapacity: machineData.MachineCapacity,
                YearOfManufacturing: machineData.YearOfManufacturing,
                CostOfMachine: machineData.CostOfMachine,
                CostOfAccessories: machineData.CostOfAccessories,
                MachineCost: machineData.MachineCost,

                LoanAmount: values.Loan,
                Equity: values.Equity,
                RateOfInterest: values.RateOfInterest,
                PowerRating: values.PowerRating,
                UtilizationFactor: '',
                WorkingHourShift: '',
                NumberOfWorkingDaysYear: '',
                CreatedDate: '',
                CreatedByName: '',
                IsActive: true,

                TechnologyId: TechnologyId != '' ? TechnologyId : Technologies[0].Value,
                SupplierId: SupplierId,
                SupplierTypeId: values.SupplierTypeId,
                MachineId: MachineName.value,

                PUCCharges: 0,
                MaintenanceCharges: 0,
                ServiceCharges: 0,
                ConsumableCost: values.Consumable,
                OtherCharges: 0,
                TotalMachineCost: machineData.CostOfMachine,

                DepreciationId: values.DepreciationId,
                TotalDepreciationCost: values.TotalDepreciationCost,

                PowerId: Power.value,
                PowerRate: powerData.FuelCostPerUnit,
                TotalPowerCost: powerData.NetPowerCost,

                FuelDetailId: fuelDetails.FuelDetailId,
                FuelRate: fuelDetails.Rate,
                TotalFuelCost: fuelDetails.Rate,

                SkilledLabourId: values.SkilledLabourTypeId,
                NumberOfSkilledLabour: values.NumberOfSkilledLabour,
                RateSkilledLabour: values.RateSkilledLabour,
                SkilledLabourWorkingDays: 0,

                SemiSkilledLabourId: values.SemiSkilledLabourTypeId,
                NumberOfSemiSkilledLabour: values.NumberOfSemiSkilledLabour,
                RateSemiSkilledLabour: values.RateSemiSkilledLabour,
                SemiSkilledLabourWorkingDays: 0,

                UnskilledLabourId: values.UnSkilledLabourTypeId,
                NumberOfUnskilledLabour: values.NumberOfUnskilledLabour,
                RateUnskilledLabour: values.RateUnskilledLabour,
                UnkilledLabourWorkingDays: 0,

                ContractLabourId: values.ContractLabourTypeId,
                NumberOfContractLabour: values.NumberOfContractLabour,
                RateContractLabour: values.RateContractLabour,
                ContractLabourWorkingDays: 0,

                TotalLabourCost: values.TotalLabourCost,

                TotalLabourCost: values.TotalLabourCost,
                UnitOfMeasurementId: values.UOM,
                PlantId: PlantId,
                CompanyId: '',
                IsOtherSource: true,
                EffectiveDate: '',
                WorkingShift: values.Shift,
                NumberOfWorkingDays: 0,
                CalculatedMHRCost: values.Rate,
                Efficiency: values.Efficiency,
                CreatedBy: loggedInUserId(),
            }
            this.props.updateMHRAPI(updateData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_MHR_SUCCESSFULLY);
                    this.toggleModel();
                }
            });

        } else {

            let formData = {
                TechnologyId: TechnologyId != '' ? TechnologyId : Technologies[0].Value,
                SupplierId: SupplierId,
                SupplierTypeId: values.SupplierTypeId,
                MachineId: MachineName.value,

                PUCCharges: 0,
                MaintenanceCharges: 0,
                ServiceCharges: 0,
                ConsumableCost: values.Consumable,
                OtherCharges: 0,
                TotalMachineCost: machineData.CostOfMachine,

                DepreciationId: values.DepreciationId,
                TotalDepreciationCost: values.TotalDepreciationCost,

                PowerId: Power.value,
                PowerRate: powerData.FuelCostPerUnit,
                TotalPowerCost: powerData.NetPowerCost,

                FuelDetailId: fuelDetails.FuelDetailId,
                FuelRate: fuelDetails.Rate,
                TotalFuelCost: fuelDetails.Rate,

                SkilledLabourId: values.SkilledLabourTypeId,
                NumberOfSkilledLabour: values.NumberOfSkilledLabour,
                RateSkilledLabour: values.RateSkilledLabour,
                SkilledLabourWorkingDays: 0,

                SemiSkilledLabourId: values.SemiSkilledLabourTypeId,
                NumberOfSemiSkilledLabour: values.NumberOfSemiSkilledLabour,
                RateSemiSkilledLabour: values.RateSemiSkilledLabour,
                SemiSkilledLabourWorkingDays: 0,

                UnskilledLabourId: values.UnSkilledLabourTypeId,
                NumberOfUnskilledLabour: values.NumberOfUnskilledLabour,
                RateUnskilledLabour: values.RateUnskilledLabour,
                UnkilledLabourWorkingDays: 0,

                ContractLabourId: values.ContractLabourTypeId,
                NumberOfContractLabour: values.NumberOfContractLabour,
                RateContractLabour: values.RateContractLabour,
                ContractLabourWorkingDays: 0,

                TotalLabourCost: values.TotalLabourCost,
                UnitOfMeasurementId: values.UOM,
                PlantId: PlantId,

                CalculatedMHRCost: values.Rate,
                Efficiency: values.Efficiency,

                CompanyId: '',
                IsOtherSource: true,
                EffectiveDate: '',
                WorkingShift: values.Shift,
                NumberOfWorkingDays: 0,
                CreatedBy: loggedInUserId(),
            }

            this.props.createMHRMasterAPI(formData, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.MHR_MASTER_ADD_SUCCESS);
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
        const { handleSubmit, isEditFlag, LabourDatalistByMachine } = this.props;
        //console.log('LabourDatalistByMachine', LabourDatalistByMachine)

        let skilledLabour = LabourDatalistByMachine && LabourDatalistByMachine.find(item => item.LabourTypeName == SKILLED)
        let unSkilledLabour = LabourDatalistByMachine && LabourDatalistByMachine.find(item => item.LabourTypeName == UNSKILLED)
        let semiSkilledLabour = LabourDatalistByMachine && LabourDatalistByMachine.find(item => item.LabourTypeName == SEMI_SKILLED)
        let contractLabour = LabourDatalistByMachine && LabourDatalistByMachine.find(item => item.LabourTypeName == CONTRACT)
        console.log('yurrrrrr', skilledLabour,
            unSkilledLabour,
            semiSkilledLabour,
            contractLabour)
        return (
            <Container className="top-margin">
                <Modal size={'xl'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update MHR' : 'Add MHR'}</ModalHeader>
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
                                                label={`Supplier Type`}
                                                name={"SupplierTypeId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                //selection={this.state.cityListing}
                                                required={true}
                                                options={this.renderListing('supplierType')}
                                                onChange={this.handleSupplierType}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                                disabled={isEditFlag ? true : false}
                                            />
                                        </Col>
                                        {/* <Col className='form-group'>
                                            <Label
                                                className={'zbcwrapper'}
                                                onChange={() => this.supplierTypeHandler('zbc')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'zbc'}
                                                    checked={this.state.supplierType == 'zbc' ? true : false}
                                                    name="SupplierType"
                                                    value="zbc" />{' '}
                                                ZBC
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.supplierTypeHandler('vbc')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'vbc'}
                                                    checked={this.state.supplierType == 'vbc' ? true : false}
                                                    name="SupplierType"
                                                    value="vbc" />{' '}
                                                VBC
                                            </Label>
                                        </Col> */}
                                    </Row>

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
                                                options={this.renderListing('technology')}
                                                //options={technologyOptions}
                                                onChange={this.technologyHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Plant`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderListing('plant')}
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
                                                label={`Supplier`}
                                                name={"SupplierId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                //required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderListing('supplier')}
                                                onChange={this.supplierHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Supplier Code"
                                                name={"SupplierCode"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={true}
                                            />
                                        </Col>
                                    </Row>

                                    <Row className={'mb20'}>
                                        <Col md="4">
                                            <Field
                                                name="MachineClass"
                                                type="text"
                                                label="Machine Class"
                                                component={searchableSelect}
                                                placeholder={'Select Machine Class'}
                                                options={this.renderListing('MachineClass')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.classHandler}
                                                valueDescription={this.state.MachineClass}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                name="MachineName"
                                                type="text"
                                                label="Machine"
                                                component={searchableSelect}
                                                placeholder={'Select Machine'}
                                                options={this.renderListing('MachineName')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.MachineNameHandler}
                                                valueDescription={this.state.MachineName}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                name="PowerId"
                                                type="text"
                                                label="Power"
                                                component={searchableSelect}
                                                placeholder={'Select Power'}
                                                options={this.renderListing('Power')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.PowerHandler}
                                                valueDescription={this.state.Power}
                                            />
                                        </Col>
                                    </Row>

                                    {LabourDatalistByMachine && LabourDatalistByMachine.length > 0 &&
                                        <Row>
                                            <Col md='3'>Labour Type</Col>
                                            <Col md='3'>Labour Rate</Col>
                                            <Col md='3'>Number Of Labours</Col>
                                            <Col md='3'>NetCost</Col>
                                        </Row>}

                                    {
                                        skilledLabour && skilledLabour != undefined && this.renderSkilled(skilledLabour)
                                    }
                                    {
                                        unSkilledLabour && unSkilledLabour != undefined && this.renderUnSkilled(unSkilledLabour)
                                    }
                                    {
                                        semiSkilledLabour && semiSkilledLabour != undefined && this.renderSemiSkilled(semiSkilledLabour)
                                    }
                                    {
                                        contractLabour && contractLabour != undefined && this.renderContract(contractLabour)
                                    }

                                    {LabourDatalistByMachine && LabourDatalistByMachine.length > 0 &&
                                        <Row>
                                            <Col md="3"></Col>
                                            <Col md="3"></Col>
                                            <Col md="3"></Col>
                                            <Col md="3">
                                                <Field
                                                    label="Total Labour Cost"
                                                    name={"TotalLabourCost"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[decimalLengthFour]}
                                                    component={renderText}
                                                    required={false}
                                                    className=" withoutBorder"
                                                    disabled={true}
                                                />
                                            </Col>
                                        </Row>}

                                    <Row>
                                        <Col md="4">
                                            <Field
                                                label="Machine Description"
                                                name={"MachineDescription"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label="Power Rating"
                                                name={"PowerRating"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label={`Depreciation`}
                                                name={"Depreciation"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                //required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderListing('depreciation')}
                                                //onChange={this.depreciationHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                                disabled={true}
                                            />
                                            <Field
                                                label={''}
                                                name={"TotalDepreciationCost"}
                                                type="hidden"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={InputHiddenField}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="4">
                                            <Field
                                                label={`Shift`}
                                                name={"Shift"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderListing('shift')}
                                                //onChange={this.depreciationHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label={`Fuel Type`}
                                                name={"FuelType"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                //required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderListing('fuel')}
                                                //onChange={this.depreciationHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label="Consumable"
                                                name={"Consumable"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={true}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="4">
                                            <Field
                                                label="Efficiency"
                                                name={"Efficiency"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label="Rate"
                                                name={"Rate"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label={`UOM`}
                                                name={"UOM"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderListing('UOM')}
                                                //onChange={this.depreciationHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="4">
                                            <Field
                                                label="Loan"
                                                name={"Loan"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label="Equity"
                                                name={"Equity"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label="Rate Of Interest"
                                                name={"RateOfInterest"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={true}
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
function mapStateToProps(state) {
    const { comman, MHRReducer, machine, fuel, power } = state;
    const { fuelDataList } = fuel;
    const { machineData } = machine;
    const { powerList, powerData } = power;

    const fieldsObj = selector(state,
        'RateSkilledLabour', 'NumberOfSkilledLabour', 'SkilledLabourCost',
        'RateContractLabour', 'NumberOfContractLabour', 'ContractLabourCost',
        'RateUnskilledLabour', 'NumberOfUnskilledLabour', 'UnSkilledLabourCost',
        'RateSemiSkilledLabour', 'NumberOfSemiSkilledLabour', 'SemiSkilledLabourCost',
    );

    if (comman && comman.comboDataMHR) {

        const { MachineTypeSelectList, MachineByMachineTypeSelectList, DepreciationSelectList, fuelList,
            ShiftTypeSelectList, UOMSelectList } = comman;
        const { LabourDatalistByMachine, mhrData, supplierTypeList } = MHRReducer;

        const { Plants, Suppliers, Technologies, UnitOfMeasurements } = comman.comboDataMHR;

        let initialValues = {};
        if (mhrData && mhrData != undefined) {
            initialValues = {
                SupplierTypeId: mhrData.SupplierTypeId,
                TechnologyId: mhrData.TechnologyId,
                PlantId: mhrData.PlantId,
                SupplierId: mhrData.SupplierId,
                SupplierCode: mhrData.SupplierCode,
                MachineDescription: mhrData.Description,
                PowerRating: mhrData.PowerRating,
                Shift: mhrData.WorkingShift,
                FuelType: mhrData.FuelDetailId,
                Consumable: mhrData.ConsumableCost,
                Efficiency: mhrData.Efficiency,
                Rate: mhrData.CalculatedMHRCost,
                UOM: mhrData.UnitOfMeasurementId,
                Loan: mhrData.LoanAmount,
                Equity: mhrData.Equity,
                RateOfInterest: mhrData.RateOfInterest,
                TotalDepreciationCost: mhrData.TotalDepreciationCost,
                NumberOfSkilledLabour: mhrData.NumberOfSkilledLabour == undefined ? 0 : mhrData.NumberOfSkilledLabour,
                NumberOfUnskilledLabour: mhrData.NumberOfUnskilledLabour == undefined ? 0 : mhrData.NumberOfUnskilledLabour,
                NumberOfSemiSkilledLabour: mhrData.NumberOfSemiSkilledLabour == undefined ? 0 : mhrData.NumberOfSemiSkilledLabour,
                NumberOfContractLabour: mhrData.NumberOfContractLabour == undefined ? 0 : mhrData.NumberOfContractLabour,
            }
        }

        return {
            Plants, Suppliers, Technologies, UnitOfMeasurements, MachineTypeSelectList, MachineByMachineTypeSelectList,
            LabourDatalistByMachine, fieldsObj, DepreciationSelectList, fuelList, ShiftTypeSelectList, UOMSelectList,
            machineData, fuelDataList, powerList, powerData, mhrData, initialValues, supplierTypeList,
        };
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getSupplierType,
    fetchMasterDataAPI,
    getMHRMasterComboData,
    createMHRMasterAPI,
    getMachineTypeSelectList,
    getMachineSelectListByMachineType,
    getLabourDetailsSelectListByMachine,
    getMachineDataAPI,
    getDepreciationSelectList,
    fetchFuelComboAPI,
    getShiftTypeSelectList,
    getUOMSelectList,
    getDepreciationDataAPI,
    getFuelDetailAPI,
    getPowerDataListAPI,
    getPowerDataAPI,
    getMHRDataAPI,
    updateMHRAPI,
})(reduxForm({
    form: 'AddMHR',
    enableReinitialize: true,
})(AddMHR));
