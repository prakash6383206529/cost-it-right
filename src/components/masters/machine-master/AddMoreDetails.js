import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Table } from 'reactstrap';
import { required, checkForNull, number, trimTwoDecimalPlace, maxLength100, checkForDecimalAndNull, postiveNumber } from "../../../helper/validation";
import {
    renderText, renderNumberInputField, searchableSelect, renderTextAreaField,
} from "../../layout/FormInputs";
import {
    getTechnologySelectList, getPlantSelectListByType, getPlantBySupplier, getUOMSelectList,
    getShiftTypeSelectList, getDepreciationTypeSelectList,
} from '../../../actions/Common';
import { getVendorListByVendorType, } from '../actions/Material';
import {
    createMachineDetails, updateMachineDetails, getMachineDetailsData, getMachineTypeSelectList, getProcessesSelectList,
    getFuelUnitCost, getLabourCost, getPowerCostUnit, fileUploadMachine, fileDeleteMachine,
} from '../actions/MachineMaster';
import { getLabourTypeByMachineTypeSelectList } from '../actions/Labour';
import { getFuelComboData, } from '../actions/Fuel';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant'
import { loggedInUserId, userDetails } from "../../../helper/auth";
import Switch from "react-switch";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import $ from 'jquery';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FILE_URL, WDM, SLM, ZBC } from '../../../config/constants';
import HeaderTitle from '../../common/HeaderTitle';
import AddMachineTypeDrawer from './AddMachineTypeDrawer';
import AddProcessDrawer from './AddProcessDrawer';
import NoContentFound from '../../common/NoContentFound';
import { calculatePercentage } from '../../../helper';
import EfficiencyDrawer from './EfficiencyDrawer';
import moment from 'moment';
import { Loader } from '../../common/Loader';
const selector = formValueSelector('AddMoreDetails');

class AddMoreDetails extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            MachineId: '',
            isEditFlag: false,
            IsPurchased: false,

            selectedTechnology: [],
            selectedPlants: [],

            machineType: [],
            isOpenMachineType: false,

            isOpenAvailability: false,
            WorkingHrPrYr: 0,

            shiftType: [],

            depreciationType: [],
            DateOfPurchase: '',

            IsAnnualMaintenanceFixed: false,
            IsAnnualConsumableFixed: false,
            IsInsuranceFixed: false,

            IsUsesFuel: false,
            IsUsesSolarPower: false,
            fuelType: [],

            labourType: [],
            labourGrid: [],
            isEditLabourIndex: false,
            labourGridEditIndex: '',

            processName: [],
            isOpenProcessDrawer: false,

            processGrid: [],
            processGridEditIndex: '',
            isEditIndex: false,

            remarks: '',
            files: [],
        }
    }

    /**
    * @method componentWillMount
    * @description Called before render the component
    */
    UNSAFE_componentWillMount() {

    }

    /**
     * @method componentDidMount
     * @description Called after rendering the component
     */
    componentDidMount() {
        this.props.getTechnologySelectList(() => { })
        this.props.getVendorListByVendorType(true, () => { })
        this.props.getPlantSelectListByType(ZBC, () => { })
        this.props.getMachineTypeSelectList(() => { })
        this.props.getUOMSelectList(() => { })
        this.props.getProcessesSelectList(() => { })
        this.props.getShiftTypeSelectList(() => { })
        this.props.getDepreciationTypeSelectList(() => { })
        this.props.getLabourTypeByMachineTypeSelectList('', () => { })
        this.props.getFuelComboData(() => { })
        this.getDetails()
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            const { fieldsObj, machineType, selectedPlants, selectedTechnology } = nextProps.data;
            console.log(selectedPlants, "Selected Plants");
            if (selectedPlants.length !== 0) {
                this.handlePlants(selectedPlants)
            }

            this.props.change('MachineName', fieldsObj.MachineName)
            this.props.change('MachineNumber', fieldsObj.MachineNumber)
            this.props.change('TonnageCapacity', fieldsObj.TonnageCapacity)
            this.setState({
                selectedPlants: selectedPlants,
                selectedTechnology: selectedTechnology,
                machineType: machineType,
            }, () => {
                if (machineType && machineType.value) {
                    this.props.getLabourTypeByMachineTypeSelectList(machineType.value, () => { })
                }
            })
        }

    }

    /**
    * @method onPressOwnership
    * @description Used for Vendor checked
    */
    onPressOwnership = () => {
        this.setState({ IsPurchased: !this.state.IsPurchased, });
    }

    /**
    * @method handleMessageChange
    * @description used remarks handler
    */
    handleMessageChange = (e) => {
        this.setState({
            remarks: e.target.value
        })
    }

    /**
    * @method getDetails
    * @description Used to get Details
    */
    getDetails = () => {
        console.log("Coming in getDetail ? ");
        const { editDetails } = this.props;
        console.log(editDetails, "Edit Detail");
        if (editDetails && editDetails.isEditFlag) {
            console.log("entring in edit fLAG");
            this.setState({
                isEditFlag: false,
                isLoader: true,
                MachineID: editDetails.Id,
            })
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getMachineDetailsData(editDetails.Id, res => {
                if (res && res.data && res.data.Result) {

                    const Data = res.data.Data;

                    this.props.getLabourTypeByMachineTypeSelectList(Data.MachineTypeId, () => { })

                    setTimeout(() => {
                        const { plantSelectList, machineTypeSelectList, ShiftTypeSelectList, DepreciationTypeSelectList,
                            fuelComboSelectList, } = this.props;

                        let technologyArray = Data && Data.Technology.map((item) => ({ Text: item.Technology, Value: item.TechnologyId }))
                        const plantObj = Data.Plant && plantSelectList && plantSelectList.find(item => item.Value === Data.Plant[0].PlantId)
                        const machineTypeObj = machineTypeSelectList && machineTypeSelectList.find(item => item.Value === Data.MachineTypeId)
                        const shiftObj = ShiftTypeSelectList && ShiftTypeSelectList.find(item => item.Value == Data.WorkingShift)
                        const depreciationObj = DepreciationTypeSelectList && DepreciationTypeSelectList.find(item => item.Value === Data.DepreciationType)
                        const fuelObj = fuelComboSelectList && fuelComboSelectList.Fuels && fuelComboSelectList.Fuels.find(item => item.Value === Data.FuleId)

                        let LabourArray = Data && Data.MachineLabourRates.map(el => {
                            return {
                                labourTypeName: el.LabourTypeName,
                                labourTypeId: el.LabourTypeId,
                                LabourCostPerAnnum: el.LabourCostPerAnnum,
                                NumberOfLabour: el.NumberOfLabour,
                                LabourCost: el.LabourCost,
                            }
                        })

                        let MachineProcessArray = Data && Data.MachineProcessRates.map(el => {
                            return {
                                processName: el.ProcessName,
                                ProcessId: el.ProcessId,
                                UnitOfMeasurement: el.UnitOfMeasurement,
                                UnitOfMeasurementId: el.UnitOfMeasurementId,
                                OutputPerHours: el.OutputPerHours,
                                OutputPerYear: el.OutputPerYear,
                                MachineRate: el.MachineRate,
                            }
                        })

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            IsPurchased: Data.OwnershipIsPurchased,
                            selectedTechnology: technologyArray,
                            selectedPlants: plantObj && plantObj !== undefined ? { label: plantObj.Text, value: plantObj.Value } : [],
                            machineType: machineTypeObj && machineTypeObj !== undefined ? { label: machineTypeObj.Text, value: machineTypeObj.Value } : [],
                            shiftType: shiftObj && shiftObj !== undefined ? { label: shiftObj.Text, value: shiftObj.Value } : [],
                            depreciationType: depreciationObj && depreciationObj !== undefined ? { label: depreciationObj.Text, value: depreciationObj.Value } : [],
                            DateOfPurchase: moment(Data.DateOfPurchase)._d,
                            IsAnnualMaintenanceFixed: Data.IsMaintanceFixed,
                            IsAnnualConsumableFixed: Data.IsConsumableFixed,
                            IsInsuranceFixed: Data.IsInsuranceFixed,
                            IsUsesFuel: Data.IsUsesFuel,
                            IsUsesSolarPower: Data.IsUsesSolarPower,
                            fuelType: fuelObj && fuelObj !== undefined ? { label: fuelObj.Text, value: fuelObj.Value } : [],
                            labourGrid: LabourArray,
                            processGrid: MachineProcessArray,
                            remarks: Data.Remark,
                            files: Data.Attachements,
                        })
                    }, 500)
                }
            })
        } else {
            this.props.getMachineDetailsData('', res => { })
        }
    }

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { technologySelectList, plantSelectList,
            UOMSelectList, machineTypeSelectList, processSelectList, ShiftTypeSelectList,
            DepreciationTypeSelectList, labourTypeByMachineTypeSelectList, fuelComboSelectList, } = this.props;

        const temp = [];
        if (label === 'technology') {
            technologySelectList && technologySelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'MachineTypeList') {
            machineTypeSelectList && machineTypeSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'ProcessNameList') {
            processSelectList && processSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'ShiftType') {
            ShiftTypeSelectList && ShiftTypeSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'DepreciationType') {
            DepreciationTypeSelectList && DepreciationTypeSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'labourList') {
            labourTypeByMachineTypeSelectList && labourTypeByMachineTypeSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'fuel') {
            fuelComboSelectList && fuelComboSelectList.Fuels && fuelComboSelectList.Fuels.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'UOM') {
            UOMSelectList && UOMSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
    }

    /**
    * @method handlePlants
    * @description called
    */
    handlePlants = (newValue, actionMeta) => {
        const { IsUsesSolarPower } = this.state;
        if (newValue && newValue !== '') {
            this.setState({ selectedPlants: newValue, })
            this.props.getPowerCostUnit(newValue.value, res => {
                let Data = res.data.DynamicData;
                if (res && res.data && res.data.Message !== '') {
                    console.log("Coming in Else", IsUsesSolarPower);
                    toastr.warning(res.data.Message)
                    this.props.change('PowerCostPerUnit', Data.SolarPowerRatePerUnit)
                } else {
                    console.log("Coming in Else", IsUsesSolarPower);
                    //  if(IsUsesSolarPower)
                    this.props.change('PowerCostPerUnit', IsUsesSolarPower ? Data.SolarPowerRatePerUnit : Data.NetPowerCostPerUnit)
                }
            })
        } else {
            this.setState({ selectedPlants: [] })
        }
    };

    /**
    * @method handleMachineType
    * @description called
    */
    handleMachineType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ machineType: newValue, labourGrid: [], }, () => {
                const { machineType } = this.state;
                this.props.getLabourTypeByMachineTypeSelectList(machineType.value, () => { })
            });
        } else {
            this.setState({ machineType: [], labourGrid: [], })
            this.props.getLabourTypeByMachineTypeSelectList('', () => { })
        }
    };

    machineTypeToggler = () => {
        this.setState({ isOpenMachineType: true })
    }

    closeMachineTypeDrawer = (e = '') => {
        this.setState({ isOpenMachineType: false }, () => {
            this.props.getMachineTypeSelectList(() => { })
        })
    }

    handleShiftType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ shiftType: newValue });

        } else {
            this.setState({ shiftType: [], })
        }
        setTimeout(() => {
            this.calculateWorkingHrsPerAnnum()
        }, 100);
    }

    efficiencyCalculationToggler = () => {
        this.setState({ isOpenAvailability: true })
    }

    closeAvailabilityDrawer = (e = '', calculatedEfficiency) => {
        this.setState({ isOpenAvailability: false }, () => {
            if (calculatedEfficiency !== Infinity && calculatedEfficiency !== 'NaN') {
                this.props.change('EfficiencyPercentage', checkForDecimalAndNull(calculatedEfficiency, 2))
            }
        })

    }

    handleDereciationType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ depreciationType: newValue });
        } else {
            this.setState({ depreciationType: [], })
        }
    }

    handleFuelType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ fuelType: newValue }, () => {
                const { fuelType, selectedPlants } = this.state;

                if (selectedPlants) {

                    const data = { fuelId: fuelType.value, plantId: selectedPlants.value }
                    this.props.getFuelUnitCost(data, res => {
                        let Data = res.data.DynamicData;
                        if (res && res.data && res.data.Message !== '') {
                            toastr.warning(res.data.Message)
                            this.props.change('FuelCostPerUnit', Data.FuelRatePerUnit)
                        } else {
                            this.props.change('FuelCostPerUnit', Data.FuelRatePerUnit)
                        }
                    })

                } else {
                    toastr.warning('Please select plant.')
                }

            });
        } else {
            this.setState({ fuelType: [], })
            this.props.change('FuelCostPerUnit', 0)
        }
    }

    /**
    * @method handleProcessName
    * @description called
    */
    handleProcessName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ processName: newValue });
        } else {
            this.setState({ processName: [] })
        }
    };

    processToggler = () => {
        this.setState({ isOpenProcessDrawer: true })
    }

    closeProcessDrawer = (e = '') => {
        this.setState({ isOpenProcessDrawer: false }, () => {
            //this.props.getMachineTypeSelectList(() => { })
        })
    }

    /**
    * @method handleUOM
    * @description called
    */
    handleUOM = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ UOM: newValue });
        } else {
            this.setState({ UOM: [] })
        }
    };




    /**
     * @method handleChange
     * @description Handle Purchase Date
     */
    handleDateOfPurchase = (date) => {
        this.setState({
            DateOfPurchase: date,
        });
    };

    /**
     * @method onPressAnnualMaintenance
     * @description Used for Annual Maintenance
     */
    onPressAnnualMaintenance = () => {
        this.setState({
            IsAnnualMaintenanceFixed: !this.state.IsAnnualMaintenanceFixed,
        }, () => {
            this.props.change('AnnualMaintanceAmount', 0)
            this.props.change('AnnualMaintancePercentage', 0)
        });
    }

    /**
     * @method onPressAnnualConsumable
     * @description Used for Annual Maintenance
     */
    onPressAnnualConsumable = () => {
        this.setState({
            IsAnnualConsumableFixed: !this.state.IsAnnualConsumableFixed,
        }, () => {
            this.props.change('AnnualConsumableAmount', 0)
            this.props.change('AnnualConsumablePercentage', 0)
        });
    }

    /**
     * @method onPressInsurance
     * @description Used for Annual Maintenance
     */
    onPressInsurance = () => {
        this.setState({
            IsInsuranceFixed: !this.state.IsInsuranceFixed,
        }, () => {
            this.props.change('AnnualInsuranceAmount', 0)
            this.props.change('AnnualInsurancePercentage', 0)
        });
    }

    /**
     * @method onPressUsesFuel
     * @description Used for Annual Maintenance
     */
    onPressUsesFuel = () => {
        this.setState({
            IsUsesFuel: !this.state.IsUsesFuel,
        });
    }

    /**
     * @method onPressUsesSolarPower
     * @description Used for Uses Solar Power
     */
    onPressUsesSolarPower = () => {
        this.setState({ IsUsesSolarPower: !this.state.IsUsesSolarPower, }, () => {
            const { IsUsesSolarPower, selectedPlants } = this.state;
            // if (IsUsesSolarPower) {
            if (selectedPlants) {
                this.props.getPowerCostUnit(selectedPlants.value, res => {
                    let Data = res.data.DynamicData;
                    if (res && res.data && res.data.Message !== '') {
                        toastr.warning(res.data.Message)
                        this.props.change('PowerCostPerUnit', Data.SolarPowerRatePerUnit)
                    } else {
                        this.props.change('PowerCostPerUnit', IsUsesSolarPower ? Data.SolarPowerRatePerUnit : Data.NetPowerCostPerUnit)
                    }
                })
            } else {
                toastr.warning('Please select plant.')
                this.setState({ IsUsesSolarPower: false, })
            }
            // } else {
            //     this.props.change('PowerCostPerUnit', 0)
            // }
        });
    }

    /**
    * @method labourHandler
    * @description called
    */
    labourHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ labourType: newValue }, () => {
                const { labourType, machineType } = this.state;
                const data = { labourTypeId: labourType.value, machineTypeId: machineType.value }
                this.props.getLabourCost(data, res => {
                    let Data = res.data.DynamicData;
                    if (res && res.data && res.data.Message !== '') {
                        toastr.warning(res.data.Message)
                        this.props.change('LabourCostPerAnnum', Data.LabourCost)
                    } else {
                        this.props.change('LabourCostPerAnnum', Data.LabourCost)
                    }
                })
            });
        } else {
            this.setState({ labourType: [] })
        }
    };

    componentDidUpdate(prevProps) {
        if (this.props.fieldsObj !== prevProps.fieldsObj) {
            this.totalCost()
            this.calculateLoanInterest()
            this.calculateWorkingHrsPerAnnum()
            this.calculateDepreciation()
            this.calculateVariableCosts()
            this.totalMachineCost()
            this.powerCost()
            this.handleLabourCalculation()
            this.handleProcessCalculation()
        }
    }

    /**
    * @method totalCost
    * @description called
    */
    totalCost = () => {
        const { fieldsObj } = this.props
        const MachineCost = fieldsObj && fieldsObj.MachineCost !== undefined ? checkForNull(fieldsObj.MachineCost) : 0;
        const AccessoriesCost = fieldsObj && fieldsObj.AccessoriesCost !== undefined ? checkForNull(fieldsObj.AccessoriesCost) : 0;
        const InstallationCharges = fieldsObj && fieldsObj.InstallationCharges !== undefined ? checkForNull(fieldsObj.InstallationCharges) : 0;
        this.props.change('TotalCost', MachineCost + AccessoriesCost + InstallationCharges)
    }

    /**
    * @method calculateLoanInterest
    * @description called
    */
    calculateLoanInterest = () => {
        const { fieldsObj } = this.props

        const LoanPercentage = fieldsObj && fieldsObj.LoanPercentage !== undefined ? checkForNull(fieldsObj.LoanPercentage) : 0;
        const EquityPercentage = fieldsObj && fieldsObj.EquityPercentage !== undefined ? checkForNull(fieldsObj.EquityPercentage) : 0;
        const RateOfInterestPercentage = fieldsObj && fieldsObj.RateOfInterestPercentage !== undefined ? checkForNull(fieldsObj.RateOfInterestPercentage) : 0;
        this.props.change('LoanValue', calculatePercentage(LoanPercentage) * checkForNull(fieldsObj.TotalCost))
        this.props.change('EquityValue', calculatePercentage(EquityPercentage) * checkForNull(fieldsObj.TotalCost))
        this.props.change('RateOfInterestValue', trimTwoDecimalPlace((calculatePercentage(LoanPercentage) + checkForNull(fieldsObj.TotalCost)) * calculatePercentage(RateOfInterestPercentage)))
    }

    /**
    * @method calculateWorkingHrsPerAnnum
    * @description called
    */
    calculateWorkingHrsPerAnnum = () => {
        const { fieldsObj } = this.props;
        const { shiftType } = this.state;

        const NumberOfShift = shiftType.hasOwnProperty('value') ? checkForNull(shiftType.value) : 0;

        const WorkingHoursPerShift = fieldsObj && fieldsObj.WorkingHoursPerShift !== undefined ? checkForNull(fieldsObj.WorkingHoursPerShift) : 0;
        const NumberOfWorkingDaysPerYear = fieldsObj && fieldsObj.NumberOfWorkingDaysPerYear !== undefined ? checkForNull(fieldsObj.NumberOfWorkingDaysPerYear) : 0;
        const EfficiencyPercentage = fieldsObj && fieldsObj.EfficiencyPercentage !== undefined ? checkForNull(fieldsObj.EfficiencyPercentage) : 0;

        this.setState({ WorkingHrPrYr: NumberOfShift * WorkingHoursPerShift * NumberOfWorkingDaysPerYear })
        const workingHrPerYr = WorkingHoursPerShift * NumberOfShift * NumberOfWorkingDaysPerYear * calculatePercentage(EfficiencyPercentage)

        this.props.change('NumberOfWorkingHoursPerYear', checkForNull(Math.round(workingHrPerYr)))
    }

    /**
    * @method calculateDepreciation
    * @description called
    */
    calculateDepreciation = () => {
        const { fieldsObj } = this.props;
        const { depreciationType } = this.state;

        const TotalCost = fieldsObj && fieldsObj.TotalCost !== undefined ? checkForNull(fieldsObj.TotalCost) : 0;
        const DepreciationRatePercentage = fieldsObj && fieldsObj.DepreciationRatePercentage !== undefined ? checkForNull(fieldsObj.DepreciationRatePercentage) : 0;
        const LifeOfAssetPerYear = fieldsObj && fieldsObj.LifeOfAssetPerYear !== undefined ? checkForNull(fieldsObj.LifeOfAssetPerYear) : 0;
        const CastOfScrap = fieldsObj && fieldsObj.CastOfScrap !== undefined ? checkForNull(fieldsObj.CastOfScrap) : 0;

        let depreciationAmount = 0;
        if (depreciationType.value === SLM) {
            //depreciationAmount = (TotalCost - CastOfScrap) / LifeOfAssetPerYear Or (TotalCost - CastOfScrap) * calculatePercentage(DepreciationRatePercentage)
            //depreciationAmount = (TotalCost - CastOfScrap) / LifeOfAssetPerYear;
            depreciationAmount = (TotalCost - CastOfScrap) * calculatePercentage(DepreciationRatePercentage) //TODO
        }

        if (depreciationType.value === WDM) {
            depreciationAmount = (TotalCost - CastOfScrap) * calculatePercentage(DepreciationRatePercentage)
        }
        this.props.change('DepreciationAmount', Math.round(depreciationAmount))
    }

    /**
    * @method calculateVariableCosts
    * @description called
    */
    calculateVariableCosts = () => {
        const { fieldsObj } = this.props
        const { IsAnnualMaintenanceFixed, IsAnnualConsumableFixed, IsInsuranceFixed } = this.state;

        const MachineCost = fieldsObj && fieldsObj.MachineCost !== undefined ? checkForNull(fieldsObj.MachineCost) : 0;
        const AccessoriesCost = fieldsObj && fieldsObj.AccessoriesCost !== undefined ? checkForNull(fieldsObj.AccessoriesCost) : 0;
        const AnnualMaintancePercentage = fieldsObj && fieldsObj.AnnualMaintancePercentage !== undefined ? checkForNull(fieldsObj.AnnualMaintancePercentage) : 0;
        const AnnualConsumablePercentage = fieldsObj && fieldsObj.AnnualConsumablePercentage !== undefined ? checkForNull(fieldsObj.AnnualConsumablePercentage) : 0;
        const AnnualInsurancePercentage = fieldsObj && fieldsObj.AnnualInsurancePercentage !== undefined ? checkForNull(fieldsObj.AnnualInsurancePercentage) : 0;

        if (IsAnnualMaintenanceFixed) {
            const MaintananceCost = (MachineCost + AccessoriesCost) * calculatePercentage(AnnualMaintancePercentage)
            this.props.change('AnnualMaintanceAmount', trimTwoDecimalPlace(MaintananceCost))
        }

        if (IsAnnualConsumableFixed) {
            const ConsumableCost = (MachineCost + AccessoriesCost) * calculatePercentage(AnnualConsumablePercentage)
            this.props.change('AnnualConsumableAmount', trimTwoDecimalPlace(ConsumableCost))
        }

        if (IsInsuranceFixed) {
            const InsuranceCost = (MachineCost + AccessoriesCost) * calculatePercentage(AnnualInsurancePercentage)
            this.props.change('AnnualInsuranceAmount', trimTwoDecimalPlace(InsuranceCost))
        }


    }

    /**
    * @method totalMachineCost
    * @description totalMachineCost per annum calculation
    */
    totalMachineCost = () => {
        const { fieldsObj } = this.props;

        const BuildingCostPerSquareFeet = fieldsObj && fieldsObj.BuildingCostPerSquareFeet !== undefined ? checkForNull(fieldsObj.BuildingCostPerSquareFeet) : 0;
        const MachineFloorAreaPerSquareFeet = fieldsObj && fieldsObj.MachineFloorAreaPerSquareFeet !== undefined ? checkForNull(fieldsObj.MachineFloorAreaPerSquareFeet) : 0;

        const DepreciationAmount = fieldsObj && fieldsObj.DepreciationAmount !== undefined ? checkForNull(fieldsObj.DepreciationAmount) : 0;
        const AnnualMaintanceAmount = fieldsObj && fieldsObj.AnnualMaintanceAmount !== undefined ? checkForNull(fieldsObj.AnnualMaintanceAmount) : 0;
        const AnnualConsumableAmount = fieldsObj && fieldsObj.AnnualConsumableAmount !== undefined ? checkForNull(fieldsObj.AnnualConsumableAmount) : 0;
        const AnnualInsuranceAmount = fieldsObj && fieldsObj.AnnualInsuranceAmount !== undefined ? checkForNull(fieldsObj.AnnualInsuranceAmount) : 0;

        // yearely cost add and annual spelling
        const OtherYearlyCost = fieldsObj && fieldsObj.OtherYearlyCost !== undefined ? checkForNull(fieldsObj.OtherYearlyCost) : 0;
        const annualAreaCost = BuildingCostPerSquareFeet * MachineFloorAreaPerSquareFeet;
        const TotalMachineCostPerAnnum = DepreciationAmount + AnnualMaintanceAmount + AnnualConsumableAmount + AnnualInsuranceAmount + annualAreaCost + OtherYearlyCost;

        this.props.change('AnnualAreaCost', trimTwoDecimalPlace(annualAreaCost))
        this.props.change('TotalMachineCostPerAnnum', trimTwoDecimalPlace(TotalMachineCostPerAnnum))
    }

    /**
    * @method powerCost
    * @description powerCost calculation
    */
    powerCost = () => {
        console.log("Power");
        const { fieldsObj } = this.props;
        const { IsUsesFuel, IsUsesSolarPower } = this.state;

        if (IsUsesFuel) {
            console.log("Come in if part");
            const FuelCostPerUnit = fieldsObj && fieldsObj.FuelCostPerUnit !== undefined ? checkForNull(fieldsObj.FuelCostPerUnit) : 0;
            const ConsumptionPerYear = fieldsObj && fieldsObj.ConsumptionPerYear !== undefined ? checkForNull(fieldsObj.ConsumptionPerYear) : 0;

            this.props.change('TotalFuelCostPerYear', trimTwoDecimalPlace(FuelCostPerUnit * ConsumptionPerYear))
        } else {

            console.log("Come in else part");
            // if (IsUsesSolarPower) {
            this.props.change('FuelCostPerUnit', 0)
            this.props.change('ConsumptionPerYear', 0)
            this.props.change('TotalFuelCostPerYear', 0)

            const NumberOfWorkingHoursPerYear = fieldsObj && fieldsObj.NumberOfWorkingHoursPerYear !== undefined ? checkForNull(fieldsObj.NumberOfWorkingHoursPerYear) : 0;
            const UtilizationFactorPercentage = fieldsObj && fieldsObj.UtilizationFactorPercentage !== undefined ? checkForNull(fieldsObj.UtilizationFactorPercentage) : 0;
            const PowerRatingPerKW = fieldsObj && fieldsObj.PowerRatingPerKW !== undefined ? checkForNull(fieldsObj.PowerRatingPerKW) : 0;
            const PowerCostPerUnit = fieldsObj && fieldsObj.PowerCostPerUnit !== undefined ? checkForNull(fieldsObj.PowerCostPerUnit) : 0;

            const totalPowerCostPrYer = PowerRatingPerKW * NumberOfWorkingHoursPerYear * calculatePercentage(UtilizationFactorPercentage)
            this.props.change('TotalPowerCostPerYear', totalPowerCostPrYer)
            // }
        }
    }

    /**
    * @method handleLabourCalculation
    * @description called
    */
    handleLabourCalculation = () => {
        const { fieldsObj } = this.props
        const LabourPerCost = fieldsObj && fieldsObj.LabourCostPerAnnum !== undefined ? fieldsObj.LabourCostPerAnnum : 0;
        const NumberOfLabour = fieldsObj && fieldsObj.NumberOfLabour !== undefined ? fieldsObj.NumberOfLabour : 0;
        const TotalLabourCost = checkForNull(LabourPerCost * NumberOfLabour)
        this.props.change('LabourCost', TotalLabourCost)
    }

    /**
    * @method handleProcessCalculation
    * @description called
    */
    handleProcessCalculation = () => {
        const { fieldsObj } = this.props
        const OutputPerHours = fieldsObj && fieldsObj.OutputPerHours !== undefined ? checkForNull(fieldsObj.OutputPerHours) : 0;
        const NumberOfWorkingHoursPerYear = fieldsObj && fieldsObj.NumberOfWorkingHoursPerYear !== undefined ? checkForNull(fieldsObj.NumberOfWorkingHoursPerYear) : 0;
        const TotalMachineCostPerAnnum = fieldsObj && fieldsObj.TotalMachineCostPerAnnum !== undefined ? checkForNull(fieldsObj.TotalMachineCostPerAnnum) : 0;

        this.props.change('OutputPerYear', OutputPerHours * NumberOfWorkingHoursPerYear)
        this.props.change('MachineRate', trimTwoDecimalPlace(TotalMachineCostPerAnnum / (OutputPerHours * NumberOfWorkingHoursPerYear)))
    }

    /**
    * @method labourTableHandler
    * @description called
    */
    labourTableHandler = () => {
        const { labourType, labourGrid } = this.state;
        const { fieldsObj } = this.props

        if (labourType.length === 0) {
            toastr.warning('Fields should not be empty');
            return false;
        }

        //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
        const isExist = labourGrid.findIndex(el => (el.labourTypeId === labourType.value))
        if (isExist !== -1) {
            toastr.warning('Already added, Please check the values.')
            return false;
        }

        const LabourPerCost = fieldsObj && fieldsObj.LabourCostPerAnnum !== undefined ? fieldsObj.LabourCostPerAnnum : 0;
        const NumberOfLabour = fieldsObj && fieldsObj.NumberOfLabour !== undefined ? fieldsObj.NumberOfLabour : 0;
        const TotalLabourCost = checkForNull(LabourPerCost * NumberOfLabour)
        const tempArray = [];

        tempArray.push(...labourGrid, {
            labourTypeName: labourType.label,
            labourTypeId: labourType.value,
            LabourCostPerAnnum: LabourPerCost,
            NumberOfLabour: NumberOfLabour,
            LabourCost: TotalLabourCost,
        })

        this.setState({
            labourGrid: tempArray,
            labourType: [],
        }, () => {
            this.props.change('LabourCostPerAnnum', '')
            this.props.change('NumberOfLabour', '')
            this.props.change('LabourCost', '')
        });
    }

    updateLabourGrid = () => {
        const { labourType, labourGrid, labourGridEditIndex } = this.state;
        const { fieldsObj } = this.props

        //CONDITION TO SKIP DUPLICATE ENTRY IN GRID
        let skipEditedItem = labourGrid.filter((el, i) => {
            if (i === labourGridEditIndex) return false;
            return true;
        })

        //CONDITION TO CHECK DUPLICATE ENTRY EXCEPT EDITED RECORD
        const isExist = skipEditedItem.findIndex(el => (el.labourTypeId === labourType.value))
        if (isExist !== -1) {
            toastr.warning('Already added, Please check the values.')
            return false;
        }

        const LabourPerCost = fieldsObj && fieldsObj.LabourCostPerAnnum !== undefined ? fieldsObj.LabourCostPerAnnum : 0;
        const NumberOfLabour = fieldsObj && fieldsObj.NumberOfLabour !== undefined ? fieldsObj.NumberOfLabour : 0;
        const TotalLabourCost = checkForNull(LabourPerCost * NumberOfLabour)

        let tempArray = [];

        let tempData = labourGrid[labourGridEditIndex];
        tempData = {
            labourTypeName: labourType.label,
            labourTypeId: labourType.value,
            LabourCostPerAnnum: LabourPerCost,
            NumberOfLabour: NumberOfLabour,
            LabourCost: TotalLabourCost,
        }

        tempArray = Object.assign([...labourGrid], { [labourGridEditIndex]: tempData })

        this.setState({
            labourGrid: tempArray,
            labourType: [],
            labourGridEditIndex: '',
            isEditLabourIndex: false,
        }, () => {
            this.props.change('LabourCostPerAnnum', '')
            this.props.change('NumberOfLabour', '')
            this.props.change('LabourCost', '')
        });
    }

    resetLabourGridData = () => {
        this.setState({
            labourType: [],
            labourGridEditIndex: '',
            isEditLabourIndex: false,
        }, () => {
            this.props.change('LabourCostPerAnnum', '')
            this.props.change('NumberOfLabour', '')
            this.props.change('LabourCost', '')
        });
    }

    /**
    * @method editLabourItemDetails
    * @description used to Edit Labour Grid Item
    */
    editLabourItemDetails = (index) => {
        const { labourGrid } = this.state;
        const tempData = labourGrid[index];

        this.setState({
            labourGridEditIndex: index,
            isEditLabourIndex: true,
            labourType: { label: tempData.labourTypeName, value: tempData.labourTypeId },
        }, () => {
            this.props.change('LabourCostPerAnnum', tempData.LabourCostPerAnnum)
            this.props.change('NumberOfLabour', tempData.NumberOfLabour)
            this.props.change('LabourCost', tempData.LabourCost)
        });
    }

    /**
    * @method deleteLabourItem
    * @description used to Reset form
    */
    deleteLabourItem = (index) => {
        const { labourGrid } = this.state;

        let tempData = labourGrid.filter((item, i) => {
            if (i === index) {
                return false;
            }
            return true;
        });

        this.setState({
            labourGrid: tempData
        })
    }

    calculateTotalLabourCost = () => {
        const { labourGrid } = this.state;
        let cost = labourGrid && labourGrid.reduce((accumulator, item) => {
            return accumulator + item.LabourCost;
        }, 0)
        return cost;
    }

    processTableHandler = () => {
        const { processName, UOM, processGrid, } = this.state;
        const { fieldsObj } = this.props

        if (processName.length === 0 || UOM.length === 0) {
            toastr.warning('Fields should not be empty');
            return false;
        }

        //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
        const isExist = processGrid.findIndex(el => (el.processNameId === processName.value && el.UOMId === UOM.value))
        if (isExist !== -1) {
            toastr.warning('Already added, Please check the values.')
            return false;
        }

        const OutputPerHours = fieldsObj && fieldsObj.OutputPerHours !== undefined ? fieldsObj.OutputPerHours : 0;
        const OutputPerYear = fieldsObj && fieldsObj.OutputPerYear !== undefined ? fieldsObj.OutputPerYear : 0;
        const MachineRate = fieldsObj && fieldsObj.MachineRate !== undefined ? fieldsObj.MachineRate : 0;

        const tempArray = [];

        tempArray.push(...processGrid, {
            processName: processName.label,
            ProcessId: processName.value,
            UnitOfMeasurement: UOM.label,
            UnitOfMeasurementId: UOM.value,
            OutputPerHours: OutputPerHours,
            OutputPerYear: OutputPerYear,
            MachineRate: MachineRate,
        })

        this.setState({
            processGrid: tempArray,
            processName: [],
            UOM: [],
        }, () => {
            this.props.change('OutputPerHours', 0)
            this.props.change('OutputPerYear', 0)
            this.props.change('MachineRate', 0)
        });
    }

    /**
  * @method updateProcessGrid
  * @description Used to handle updateProcessGrid
  */
    updateProcessGrid = () => {
        const { processName, UOM, processGrid, processGridEditIndex } = this.state;
        const { fieldsObj } = this.props

        //CONDITION TO SKIP DUPLICATE ENTRY IN GRID
        let skipEditedItem = processGrid.filter((el, i) => {
            if (i === processGridEditIndex) return false;
            return true;
        })

        //CONDITION TO CHECK DUPLICATE ENTRY EXCEPT EDITED RECORD
        const isExist = skipEditedItem.findIndex(el => (el.processId === processName.value && el.UnitOfMeasurementId === UOM.value))
        if (isExist !== -1) {
            toastr.warning('Already added, Please check the values.')
            return false;
        }

        const OutputPerHours = fieldsObj && fieldsObj.OutputPerHours !== undefined ? fieldsObj.OutputPerHours : 0;
        const OutputPerYear = fieldsObj && fieldsObj.OutputPerYear !== undefined ? fieldsObj.OutputPerYear : 0;
        const MachineRate = fieldsObj && fieldsObj.MachineRate !== undefined ? fieldsObj.MachineRate : 0;
        let tempArray = [];

        let tempData = processGrid[processGridEditIndex];
        tempData = {
            processName: processName.label,
            processId: processName.value,
            UnitOfMeasurement: UOM.label,
            UnitOfMeasurementId: UOM.value,
            OutputPerHours: OutputPerHours,
            OutputPerYear: OutputPerYear,
            MachineRate: MachineRate,
        }

        tempArray = Object.assign([...processGrid], { [processGridEditIndex]: tempData })

        this.setState({
            processGrid: tempArray,
            processName: [],
            UOM: [],
            processGridEditIndex: '',
            isEditIndex: false,
        }, () => {
            this.props.change('OutputPerHours', 0)
            this.props.change('OutputPerYear', 0)
            this.props.change('MachineRate', 0)
        });
    };

    /**
    * @method resetProcessGridData
    * @description Used to handle setTechnologyLevel
    */
    resetProcessGridData = () => {
        this.setState({
            processName: [],
            UOM: [],
            processGridEditIndex: '',
            isEditIndex: false,
        }, () => {
            this.props.change('OutputPerHours', 0)
            this.props.change('OutputPerYear', 0)
            this.props.change('MachineRate', 0)
        });
    };

    /**
    * @method editItemDetails
    * @description used to Reset form
    */
    editItemDetails = (index) => {
        const { processGrid } = this.state;
        const tempData = processGrid[index];

        this.setState({
            processGridEditIndex: index,
            isEditIndex: true,
            processName: { label: tempData.processName, value: tempData.processId },
            UOM: { label: tempData.UnitOfMeasurement, value: tempData.UnitOfMeasurementId },
        }, () => {
            this.props.change('OutputPerHours', tempData.OutputPerHours)
            this.props.change('OutputPerYear', tempData.OutputPerYear)
            this.props.change('MachineRate', tempData.MachineRate)
        })
    }

    /**
    * @method deleteItem
    * @description used to Reset form
    */
    deleteItem = (index) => {
        const { processGrid } = this.state;

        let tempData = processGrid.filter((item, i) => {
            if (i === index) {
                return false;
            }
            return true;
        });

        this.setState({
            processGrid: tempData
        })
    }


    handleCalculation = () => {
        const { fieldsObj } = this.props
        const NoOfPieces = fieldsObj && fieldsObj.NumberOfPieces !== undefined ? fieldsObj.NumberOfPieces : 0;
        const BasicRate = fieldsObj && fieldsObj.BasicRate !== undefined ? fieldsObj.BasicRate : 0;
        const NetLandedCost = checkForNull(BasicRate / NoOfPieces)
        this.props.change('NetLandedCost', NetLandedCost)
    }


    // specify upload params and url for your files
    getUploadParams = ({ file, meta }) => {
        return { url: 'https://httpbin.org/post', }

    }

    // called every time a file's `status` changes
    handleChangeStatus = ({ meta, file }, status) => {
        const { files, } = this.state;

        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = files.filter(item => item.OriginalFileName !== removedFileName)
            this.setState({ files: tempArr })
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            this.props.fileUploadMachine(data, (res) => {
                let Data = res.data[0]
                const { files } = this.state;
                files.push(Data)
                this.setState({ files: files })
            })
        }

        if (status === 'rejected_file_type') {
            toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
    }

    renderImages = () => {
        this.state.files && this.state.files.map(f => {
            const withOutTild = f.FileURL.replace('~', '')
            const fileURL = `${FILE_URL}${withOutTild}`;
            return (
                <div className={'attachment-wrapper images'}>
                    <img src={fileURL} alt={''} />
                    <button
                        type="button"
                        onClick={() => this.deleteFile(f.FileId)}>X</button>
                </div>
            )
        })
    }

    deleteFile = (FileId, OriginalFileName) => {
        if (FileId != null) {
            let deleteData = {
                Id: FileId,
                DeletedBy: loggedInUserId(),
            }
            this.props.fileDeleteMachine(deleteData, (res) => {
                toastr.success('File has been deleted successfully.')
                let tempArr = this.state.files.filter(item => item.FileId !== FileId)
                this.setState({ files: tempArr })
            })
        }
        if (FileId == null) {
            let tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
            this.setState({ files: tempArr })
        }
    }

    Preview = ({ meta }) => {
        return (
            <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
                {/* {Math.round(percent)}% */}
            </span>
        )
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            remarks: '',
        })
        this.props.hideMoreDetailsForm()
        //this.props.getRawMaterialDetailsAPI('', false, res => { })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        console.log(values, "Values of form");
        const { isEditFlag, MachineID, selectedTechnology, selectedPlants, machineType, remarks, files, DateOfPurchase,
            IsAnnualMaintenanceFixed, IsAnnualConsumableFixed, IsInsuranceFixed, IsUsesFuel, IsUsesSolar, fuelType,
            labourGrid, processGrid } = this.state;
        const { data, editDetails } = this.props;

        const userDetail = userDetails()

        let technologyArray = selectedTechnology && selectedTechnology.map((item) => ({ Technology: item.Text, TechnologyId: item.Value, }))

        let updatedFiles = files.map((file) => ({ ...file, ContextId: MachineID }))

        let requestData = {
            MachineId: MachineID,
            Manufacture: values.Manufacture,
            YearOfManufacturing: values.YearOfManufacturing,
            MachineCost: values.MachineCost,
            AccessoriesCost: values.AccessoriesCost,
            InstallationCharges: values.InstallationCharges,
            TotalCost: values.TotalCost,
            MachineIdRef: "",
            OwnershipIsPurchased: this.state.IsPurchased,
            DepreciationTypeId: this.state.depreciationType ? this.state.depreciationType.value : '',
            DepreciationType: this.state.depreciationType ? this.state.depreciationType.value : '',
            DepreciationRatePercentage: values.DepreciationRatePercentage,
            LifeOfAssetPerYear: values.LifeOfAssetPerYear,
            CastOfScrap: values.CastOfScrap,
            DateOfPurchase: DateOfPurchase,
            DepreciationAmount: values.DepreciationAmount,
            WorkingShift: this.state.shiftType ? this.state.shiftType.value : '',
            WorkingHoursPerShift: values.WorkingHoursPerShift,
            NumberOfWorkingDaysPerYear: values.NumberOfWorkingDaysPerYear,
            EfficiencyPercentage: values.EfficiencyPercentage,
            NumberOfWorkingHoursPerYear: values.NumberOfWorkingHoursPerYear,
            LoanPercentage: values.LoanPercentage,
            LoanValue: values.LoanValue,
            EquityPercentage: values.EquityPercentage,
            EquityValue: values.EquityValue,
            RateOfInterestPercentage: values.RateOfInterestPercentage,
            RateOfInterestValue: values.RateOfInterestValue,
            IsMaintanceFixed: IsAnnualMaintenanceFixed,
            AnnualMaintancePercentage: values.AnnualMaintancePercentage,
            AnnualMaintanceAmount: values.AnnualMaintanceAmount,
            IsConsumableFixed: IsAnnualConsumableFixed,
            AnnualConsumablePercentage: values.AnnualConsumablePercentage,
            AnnualConsumableAmount: values.AnnualConsumableAmount,
            IsInsuranceFixed: IsInsuranceFixed,
            AnnualInsurancePercentage: values.AnnualInsurancePercentage,
            AnnualInsuranceAmount: values.AnnualInsuranceAmount,
            BuildingCostPerSquareFeet: values.BuildingCostPerSquareFeet,
            MachineFloorAreaPerSquareFeet: values.MachineFloorAreaPerSquareFeet,
            AnnualAreaCost: values.AnnualAreaCost,
            OtherYearlyCost: values.OtherYearlyCost,
            TotalMachineCostPerAnnum: values.TotalMachineCostPerAnnum,
            IsUsesFuel: IsUsesFuel,
            PowerId: '',
            UtilizationFactorPercentage: values.UtilizationFactorPercentage,
            PowerCostPerUnit: values.PowerCostPerUnit,
            PowerRatingPerKW: values.PowerRatingPerKW,
            TotalPowerCostPerYear: values.TotalPowerCostPerYear,
            IsUsesSolarPower: IsUsesSolar,
            FuleId: fuelType ? fuelType.value : '',
            FuelCostPerUnit: values.FuelCostPerUnit,
            ConsumptionPerYear: values.ConsumptionPerYear,
            TotalFuelCostPerYear: values.TotalFuelCostPerYear,
            MachineLabourRates: labourGrid,
            TotalLabourCostPerYear: values.TotalLabourCostPerYear,
            IsVendor: false,
            IsDetailedEntry: true,
            VendorId: userDetail.ZBCSupplierInfo.VendorId,
            MachineNumber: values.MachineNumber,
            MachineName: values.MachineName,
            MachineTypeId: machineType ? machineType.value : '',
            TonnageCapacity: values.TonnageCapacity,
            Description: data.fieldsObj.Description,
            IsActive: true,
            Remark: remarks,
            LoggedInUserId: loggedInUserId(),
            MachineProcessRates: processGrid,
            Technology: technologyArray,
            Plant: [{ PlantId: selectedPlants.value, PlantName: selectedPlants.label }],
            VendorPlant: [],
            Attachements: updatedFiles,
        }

        if (editDetails.isIncompleteMachine) {

            // EXECUTED WHEN:- ADD MACHINE DONE AND ADD MORE DETAIL CALLED FROM ADDMACHINERATE.JS FILE
            // let MachineData = { ...requestData, MachineId: editDetails.Id }
            // this.props.updateMachineDetails(MachineData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.MACHINE_DETAILS_ADD_SUCCESS);
            //         this.cancel();
            //     }
            // })

        } else if (isEditFlag) {

            // EXECUTED WHEN:- ADD MACHINE DONE AND EDIT MORE DETAIL CALLED FROM ADDMACHINERATE.JS FILE
            // this.props.updateMachineDetails(requestData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.UPDATE_MACHINE_DETAILS_SUCCESS);
            //         this.cancel();
            //     }
            // })

        } else {
            // EXECUTED WHEN:- ADD MORE MACHINE DETAIL CALLED FROM ADDMACHINERATE.JS FILE
            const formData = {
                Manufacture: values.Manufacture,
                YearOfManufacturing: values.YearOfManufacturing,
                MachineCost: values.MachineCost,
                AccessoriesCost: values.AccessoriesCost,
                InstallationCharges: values.InstallationCharges,
                TotalCost: values.TotalCost,
                MachineIdRef: '',
                OwnershipIsPurchased: this.state.IsPurchased,
                DepreciationTypeId: this.state.depreciationType ? this.state.depreciationType.value : '',
                DepreciationType: this.state.depreciationType ? this.state.depreciationType.value : '',
                DepreciationRatePercentage: values.DepreciationRatePercentage,
                LifeOfAssetPerYear: values.LifeOfAssetPerYear,
                CastOfScrap: values.CastOfScrap,
                DateOfPurchase: DateOfPurchase,
                DepreciationAmount: values.DepreciationAmount,
                WorkingShift: this.state.shiftType ? this.state.shiftType.value : '',
                WorkingHoursPerShift: values.WorkingHoursPerShift,
                NumberOfWorkingDaysPerYear: values.NumberOfWorkingDaysPerYear,
                EfficiencyPercentage: values.EfficiencyPercentage,
                NumberOfWorkingHoursPerYear: values.NumberOfWorkingHoursPerYear,
                LoanPercentage: values.LoanPercentage,
                LoanValue: values.LoanValue,
                EquityPercentage: values.EquityPercentage,
                EquityValue: values.EquityValue,
                RateOfInterestPercentage: values.RateOfInterestPercentage,
                RateOfInterestValue: values.RateOfInterestValue,
                IsMaintanceFixed: IsAnnualMaintenanceFixed,
                AnnualMaintancePercentage: values.AnnualMaintancePercentage,
                AnnualMaintanceAmount: values.AnnualMaintanceAmount,
                IsConsumableFixed: IsAnnualConsumableFixed,
                AnnualConsumablePercentage: values.AnnualConsumablePercentage,
                AnnualConsumableAmount: values.AnnualConsumableAmount,
                IsInsuranceFixed: IsInsuranceFixed,
                AnnualInsurancePercentage: values.AnnualInsurancePercentage,
                AnnualInsuranceAmount: values.AnnualInsuranceAmount,
                BuildingCostPerSquareFeet: values.BuildingCostPerSquareFeet,
                MachineFloorAreaPerSquareFeet: values.MachineFloorAreaPerSquareFeet,
                AnnualAreaCost: values.AnnualAreaCost,
                OtherYearlyCost: values.OtherYearlyCost,
                TotalMachineCostPerAnnum: values.TotalMachineCostPerAnnum,
                IsUsesFuel: IsUsesFuel,
                PowerId: '',
                UtilizationFactorPercentage: values.UtilizationFactorPercentage,
                PowerCostPerUnit: values.PowerCostPerUnit,
                PowerRatingPerKW: values.PowerRatingPerKW,
                TotalPowerCostPerYear: values.TotalPowerCostPerYear,
                IsUsesSolarPower: IsUsesSolar,
                FuleId: fuelType ? fuelType.value : '',
                FuelCostPerUnit: values.FuelCostPerUnit,
                ConsumptionPerYear: values.ConsumptionPerYear,
                TotalFuelCostPerYear: values.TotalFuelCostPerYear,
                MachineLabourRates: labourGrid,
                TotalLabourCostPerYear: values.TotalLabourCostPerYear,
                IsVendor: false,
                IsDetailedEntry: true,
                VendorId: userDetail.ZBCSupplierInfo.VendorId,
                MachineNumber: values.MachineNumber,
                MachineName: values.MachineName,
                MachineTypeId: machineType ? machineType.value : '',
                TonnageCapacity: values.TonnageCapacity,
                Description: data.fieldsObj.Description,
                IsActive: true,
                Remark: remarks,
                LoggedInUserId: loggedInUserId(),
                MachineProcessRates: processGrid,
                Technology: technologyArray,
                Plant: [{ PlantId: selectedPlants.value, PlantName: selectedPlants.label }],
                VendorPlant: [],
                Attachements: files
            }
            this.props.createMachineDetails(formData, (res) => {
                if (res.data.Result) {
                    this.props.hideMoreDetailsForm(formData)
                    toastr.success(MESSAGES.MACHINE_DETAILS_ADD_SUCCESS);
                    // this.cancel()
                }
            });
        }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, loading, initialConfiguration } = this.props;
        const { isLoader, isOpenAvailability, isEditFlag, isOpenMachineType, isOpenProcessDrawer, } = this.state;

        return (
            <>
                {(loading || isLoader) && <Loader />}
                <div>
                    <div className="login-container signup-form">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="shadow-lgg login-formg">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-heading">
                                                <h2>{isEditFlag ? `Update More Details` : `Add More Details`}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <form
                                        noValidate
                                        className="form"
                                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                    >

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Machine:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="3" className="switch mb15">
                                                <label>Ownership</label>
                                                <label className="switch-level">
                                                    <div className={'left-title'}>Purchased</div>
                                                    <Switch
                                                        onChange={this.onPressOwnership}
                                                        checked={this.state.IsPurchased}
                                                        id="normal-switch"
                                                        disabled={isEditFlag ? true : false}
                                                        background="#4DC771"
                                                        onColor="#4DC771"
                                                        onHandleColor="#ffffff"
                                                        offColor="#4DC771"
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={46}
                                                    />
                                                    <div className={'right-title'}>Leased</div>
                                                </label>
                                            </Col>

                                            <Col md="3">
                                                <Field
                                                    name="Plant"
                                                    type="text"
                                                    label="Plant"
                                                    component={searchableSelect}
                                                    placeholder={'--- Select ---'}
                                                    options={this.renderListing('plant')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.selectedPlants == null || this.state.selectedPlants.length === 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handlePlants}
                                                    valueDescription={this.state.selectedPlants}
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Machine No.`}
                                                    name={"MachineNumber"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={(isEditFlag || initialConfiguration.IsMachineNumberConfigure) ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Machine Name`}
                                                    name={"MachineName"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            name="MachineType"
                                                            type="text"
                                                            label="Machine Type"
                                                            component={searchableSelect}
                                                            placeholder={'--select--'}
                                                            options={this.renderListing('MachineTypeList')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.machineType == null || this.state.machineType.length === 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.handleMachineType}
                                                            valueDescription={this.state.machineType}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </div>
                                                    {!isEditFlag && <div
                                                        onClick={this.machineTypeToggler}
                                                        className={'plus-icon-square mr5 right'}>
                                                    </div>}
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Manufacturer`}
                                                    name={"Manufacture"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Year Of Manufacturing`}
                                                    name={"YearOfManufacturing"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Machine Capacity / Tonnage`}
                                                    name={"TonnageCapacity"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required, number, postiveNumber]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="3">
                                                <Field
                                                    label={`Machine Cost (INR)`}
                                                    name={"MachineCost"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required, number]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Accessories Cost (INR)`}
                                                    name={"AccessoriesCost"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Installation Charges (INR)`}
                                                    name={"InstallationCharges"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Total Cost (INR)`}
                                                    name={"TotalCost"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="3">
                                                <Field
                                                    label={`Description`}
                                                    name={"Description"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    // validate={[required]}
                                                    component={renderText}
                                                    // required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Loan & Interest:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Loan (%)`}
                                                    name={"LoanPercentage"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Loan Value`}
                                                    name={"LoanValue"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Equity (%)`}
                                                    name={"EquityPercentage"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Equity Value`}
                                                    name={"EquityValue"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Rate Of Interest (%)`}
                                                    name={"RateOfInterestPercentage"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Rate Of Interest Value`}
                                                    name={"RateOfInterestValue"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Working Hours:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="WorkingShift"
                                                    type="text"
                                                    label="No. Of Shifts"
                                                    component={searchableSelect}
                                                    placeholder={'--select--'}
                                                    options={this.renderListing('ShiftType')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.shiftType == null || this.state.shiftType.length === 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleShiftType}
                                                    valueDescription={this.state.shiftType}
                                                    disabled={false}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Working Hr/Shift`}
                                                    name={"WorkingHoursPerShift"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required, number]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`No. Of Working days/Annum`}
                                                    name={"NumberOfWorkingDaysPerYear"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required, number]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Availability (%)`}
                                                            name={"EfficiencyPercentage"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required, number]}
                                                            component={renderText}
                                                            required={true}
                                                            disabled={false}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </div>
                                                    <div
                                                        onClick={this.efficiencyCalculationToggler}
                                                        className={'calculate-icon mr5 right'}>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`No. Of Working Hrs/Annum`}
                                                    name={"NumberOfWorkingHoursPerYear"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    // validate={[required]}
                                                    component={renderNumberInputField}
                                                    // required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Depreciation:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="DepreciationTypeId"
                                                    type="text"
                                                    label="Depreciation Type"
                                                    component={searchableSelect}
                                                    placeholder={'--select--'}
                                                    options={this.renderListing('DepreciationType')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.depreciationType == null || this.state.depreciationType.length === 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleDereciationType}
                                                    valueDescription={this.state.depreciationType}
                                                    disabled={false}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Depreciation Rate (%)`}
                                                    name={"DepreciationRatePercentage"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={this.state.depreciationType.value === WDM ? [required] : []}
                                                    component={renderNumberInputField}
                                                    required={this.state.depreciationType.value === WDM ? true : false}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            {this.state.depreciationType && this.state.depreciationType.value === SLM &&
                                                <Col md="3">
                                                    <Field
                                                        label={`Life Of Asset (Years)`}
                                                        name={"LifeOfAssetPerYear"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[required, number]}
                                                        component={renderNumberInputField}
                                                        required={true}
                                                        disabled={false}
                                                        className=" "
                                                        customClassName="withBorder"
                                                    />
                                                </Col>}
                                            <Col md="3">
                                                <Field
                                                    label={`Cost Of Scrap (INR)`}
                                                    name={"CastOfScrap"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <div className="form-group">
                                                    <label>
                                                        Date of Purchase
                                                    {/* <span className="asterisk-required">*</span> */}
                                                    </label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="DateOfPurchase"
                                                            selected={this.state.DateOfPurchase}
                                                            onChange={this.handleDateOfPurchase}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dateFormat="dd/MM/yyyy"
                                                            //maxDate={new Date()}
                                                            dropdownMode="select"
                                                            placeholderText="Select date"
                                                            className="withBorder"
                                                            autoComplete={'off'}
                                                            disabledKeyboardNavigation
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Depreciation Amount (INR)`}
                                                    name={"DepreciationAmount"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    // validate={[required]}
                                                    component={renderNumberInputField}
                                                    // required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Variable Cost:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md={`${this.state.IsAnnualMaintenanceFixed ? 2 : 3}`} className="switch mb15">
                                                <label>Annual Maintenance</label>
                                                <label className="switch-level">
                                                    <div className={'left-title'}>Fixed</div>
                                                    <Switch
                                                        onChange={this.onPressAnnualMaintenance}
                                                        checked={this.state.IsAnnualMaintenanceFixed}
                                                        id="normal-switch"
                                                        disabled={false}
                                                        background="#4DC771"
                                                        onColor="#4DC771"
                                                        onHandleColor="#ffffff"
                                                        offColor="#4DC771"
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={46}
                                                    />
                                                    <div className={'right-title'}>%</div>
                                                </label>
                                            </Col>
                                            {this.state.IsAnnualMaintenanceFixed &&
                                                <Col md="1">
                                                    <Field
                                                        label={``}
                                                        name={"AnnualMaintancePercentage"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        validate={[number]}
                                                        component={renderText}
                                                        //required={true}
                                                        disabled={false}
                                                        className=" mt5"
                                                        customClassName="withBorder"
                                                    />
                                                </Col>}
                                            <Col md="3">
                                                <Field
                                                    label={`Annual Maintenance Amount (INR)`}
                                                    name={"AnnualMaintanceAmount"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={this.state.IsAnnualMaintenanceFixed ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md={`${this.state.IsAnnualConsumableFixed ? 2 : 3}`} className="switch mb15">
                                                <label>Annual Consumable</label>
                                                <label className="switch-level">
                                                    <div className={'left-title'}>Fixed</div>
                                                    <Switch
                                                        onChange={this.onPressAnnualConsumable}
                                                        checked={this.state.IsAnnualConsumableFixed}
                                                        id="normal-switch"
                                                        disabled={false}
                                                        background="#4DC771"
                                                        onColor="#4DC771"
                                                        onHandleColor="#ffffff"
                                                        offColor="#4DC771"
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={46}
                                                    />
                                                    <div className={'right-title'}>%</div>
                                                </label>
                                            </Col>
                                            {this.state.IsAnnualConsumableFixed &&
                                                <Col md="1">
                                                    <Field
                                                        label={``}
                                                        name={"AnnualConsumablePercentage"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        //validate={[required]}
                                                        component={renderNumberInputField}
                                                        //required={true}
                                                        disabled={false}
                                                        className=" mt5"
                                                        customClassName="withBorder"
                                                    />
                                                </Col>}
                                            <Col md="3">
                                                <Field
                                                    label={`Annual Consumable Amount (INR)`}
                                                    name={"AnnualConsumableAmount"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number, postiveNumber]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={this.state.IsAnnualConsumableFixed ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>

                                            <Col md={`${this.state.IsInsuranceFixed ? 2 : 3}`} className="switch mb15">
                                                <label>Insurance</label>
                                                <label className="switch-level">
                                                    <div className={'left-title'}>Fixed</div>
                                                    <Switch
                                                        onChange={this.onPressInsurance}
                                                        checked={this.state.IsInsuranceFixed}
                                                        id="normal-switch"
                                                        disabled={false}
                                                        background="#4DC771"
                                                        onColor="#4DC771"
                                                        onHandleColor="#ffffff"
                                                        offColor="#4DC771"
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={46}
                                                    />
                                                    <div className={'right-title'}>%</div>
                                                </label>
                                            </Col>
                                            {this.state.IsInsuranceFixed &&
                                                <Col md="1">
                                                    <Field
                                                        label={``}
                                                        name={"AnnualInsurancePercentage"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        //validate={[required]}
                                                        component={renderNumberInputField}
                                                        //required={true}
                                                        disabled={false}
                                                        className=" mt5"
                                                        customClassName="withBorder"
                                                    />
                                                </Col>}
                                            <Col md="3">
                                                <Field
                                                    label={`Insurance Amount (INR)`}
                                                    name={"AnnualInsuranceAmount"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number, postiveNumber]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={this.state.IsInsuranceFixed ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Building Cost/Sq Ft`}
                                                    name={"BuildingCostPerSquareFeet"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number, postiveNumber]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Machine Floor Area (Sq Ft)`}
                                                    name={"MachineFloorAreaPerSquareFeet"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number, postiveNumber]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Annual Area Cost (INR)`}
                                                    name={"AnnualAreaCost"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    // validate={[number, postiveNumber]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Other Yearly Cost (INR)`}
                                                    name={"OtherYearlyCost"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number, postiveNumber]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Total Machine Cost/Annum (INR)`}
                                                    name={"TotalMachineCostPerAnnum"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Power:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md={`3`} className="switch mb15">
                                                <label>Uses Fuel</label>
                                                <label className="switch-level">
                                                    <div className={'left-title'}>No</div>
                                                    <Switch
                                                        onChange={this.onPressUsesFuel}
                                                        checked={this.state.IsUsesFuel}
                                                        id="normal-switch"
                                                        disabled={isEditFlag ? true : false}
                                                        background="#4DC771"
                                                        onColor="#4DC771"
                                                        onHandleColor="#ffffff"
                                                        offColor="#4DC771"
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={46}
                                                    />
                                                    <div className={'right-title'}>Yes</div>
                                                </label>
                                            </Col>
                                            {this.state.IsUsesFuel &&
                                                <>
                                                    <Col md="3">
                                                        <Field
                                                            name="FuelTypeId"
                                                            type="text"
                                                            label="Fuel"
                                                            component={searchableSelect}
                                                            placeholder={'--select--'}
                                                            options={this.renderListing('fuel')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.fuelType == null || this.state.fuelType.length === 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.handleFuelType}
                                                            valueDescription={this.state.fuelType}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Fuel Cost/UOM`}
                                                            name={"FuelCostPerUnit"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Consumption/Annum`}
                                                            name={"ConsumptionPerYear"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={false}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Total Power Cost/Annum (INR)`}
                                                            name={"TotalFuelCostPerYear"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[number, postiveNumber]}
                                                            component={renderText}
                                                            //required={true}
                                                            disabled={true}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                </>}

                                            {!this.state.IsUsesFuel &&
                                                <>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Utilization (%)`}
                                                            name={"UtilizationFactorPercentage"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={false}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Power Rating (Kw)`}
                                                            name={"PowerRatingPerKW"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={isEditFlag ? true : false}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                    <Col md={`3`} className="switch mb15">
                                                        <label>Uses Solar Power</label>
                                                        <label className="switch-level">
                                                            <div className={'left-title'}>No</div>
                                                            <Switch
                                                                onChange={this.onPressUsesSolarPower}
                                                                checked={this.state.IsUsesSolarPower}
                                                                id="normal-switch"
                                                                disabled={isEditFlag ? true : false}
                                                                background="#4DC771"
                                                                onColor="#4DC771"
                                                                onHandleColor="#ffffff"
                                                                offColor="#4DC771"
                                                                uncheckedIcon={false}
                                                                checkedIcon={false}
                                                                height={20}
                                                                width={46}
                                                            />
                                                            <div className={'right-title'}>Yes</div>
                                                        </label>
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Cost/Unit`}
                                                            name={"PowerCostPerUnit"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Total Power Cost/Annum (INR)`}
                                                            name={"TotalPowerCostPerYear"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                </>}
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Labour:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="LabourTypeIds"
                                                    type="text"
                                                    label="Labour Type"
                                                    component={searchableSelect}
                                                    placeholder={'Select Labour'}
                                                    options={this.renderListing('labourList')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    //validate={(this.state.labourType == null || this.state.labourType.length === 0) ? [required] : []}
                                                    //required={true}
                                                    handleChangeDescription={this.labourHandler}
                                                    valueDescription={this.state.labourType}
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label={`Cost/Annum (INR)`}
                                                    name={"LabourCostPerAnnum"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //onChange={this.handleLabourCalculation}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label={`No. Of People`}
                                                    name={"NumberOfLabour"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //onChange={this.handleLabourCalculation}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label={`Total Cost (INR)`}
                                                    name={"LabourCost"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[number, postiveNumber]}
                                                    component={renderText}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                {this.state.isEditLabourIndex ?
                                                    <>
                                                        <button
                                                            type="button"
                                                            className={'btn btn-primary mt30 pull-left mr5'}
                                                            onClick={this.updateLabourGrid}
                                                        >Update</button>

                                                        <button
                                                            type="button"
                                                            className={'cancel-btn mt30 pull-left'}
                                                            onClick={this.resetLabourGridData}
                                                        >Cancel</button>
                                                    </>
                                                    :
                                                    <>
                                                        <button
                                                            type="button"
                                                            className={'user-btn mt30 pull-left mr5'}
                                                            onClick={this.labourTableHandler}>
                                                            <div className={'plus'}></div>ADD</button>
                                                        <button
                                                            type="button"
                                                            className={'btn secondary-btn mt30 pull-left'}
                                                            onClick={this.resetLabourGridData}
                                                        >Reset</button>
                                                    </>}
                                            </Col>
                                            <Col md="12">
                                                <Table className="table" size="sm" >
                                                    <thead>
                                                        <tr>
                                                            <th>{`Labour Type`}</th>
                                                            <th>{`Cost/Annum (INR)`}</th>
                                                            <th>{`No. Of People`}</th>
                                                            <th>{`Total Cost (INR)`}</th>
                                                            <th>{`Action`}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody >
                                                        {
                                                            this.state.labourGrid &&
                                                            this.state.labourGrid.map((item, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td>{item.labourTypeName}</td>
                                                                        <td>{item.LabourCostPerAnnum}</td>
                                                                        <td>{item.NumberOfLabour}</td>
                                                                        <td>{item.LabourCost}</td>
                                                                        <td>
                                                                            <button className="Edit mr-2" type={'button'} onClick={() => this.editLabourItemDetails(index)} />
                                                                            <button className="Delete" type={'button'} onClick={() => this.deleteLabourItem(index)} />
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                        {this.state.labourGrid.length > 0 &&
                                                            <tr>
                                                                <td>{''}</td>
                                                                <td>{''}</td>
                                                                <td>{'Total Labour Cost/Annum (INR):'}</td>
                                                                <td>{this.calculateTotalLabourCost()}</td>
                                                                <td>{''}</td>
                                                            </tr>
                                                        }
                                                    </tbody>
                                                    {this.state.labourGrid.length === 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                                </Table>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Process:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            name="ProcessName"
                                                            type="text"
                                                            label="Process Name"
                                                            component={searchableSelect}
                                                            placeholder={'--select--'}
                                                            options={this.renderListing('ProcessNameList')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            //validate={(this.state.processName == null || this.state.processName.length == 0) ? [required] : []}
                                                            //required={true}
                                                            handleChangeDescription={this.handleProcessName}
                                                            valueDescription={this.state.processName}
                                                            disabled={false}
                                                        />
                                                    </div>
                                                    {!isEditFlag && <div
                                                        onClick={this.processToggler}
                                                        className={'plus-icon-square mr5 right'}>
                                                    </div>}
                                                </div>
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    name="UOM"
                                                    type="text"
                                                    label="UOM"
                                                    component={searchableSelect}
                                                    placeholder={'--select--'}
                                                    options={this.renderListing('UOM')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    //validate={(this.state.UOM == null || this.state.UOM.length == 0) ? [required] : []}
                                                    //required={true}
                                                    handleChangeDescription={this.handleUOM}
                                                    valueDescription={this.state.UOM}
                                                    disabled={false}
                                                />
                                            </Col>
                                            <Col md="1">
                                                <Field
                                                    label={`Output/Hr`}
                                                    name={"OutputPerHours"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="1">
                                                <Field
                                                    label={`Output/Yr`}
                                                    name={"OutputPerYear"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label={`Machine Rate/Hr (INR)`}
                                                    name={"MachineRate"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    onChange={this.handleMachineRate}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <div>
                                                    {this.state.isEditIndex ?
                                                        <>
                                                            <button
                                                                type="button"
                                                                className={'btn btn-primary mt30 pull-left mr5'}
                                                                onClick={this.updateProcessGrid}
                                                            >Update</button>

                                                            <button
                                                                type="button"
                                                                className={'cancel-btn mt30 pull-left'}
                                                                onClick={this.resetProcessGridData}
                                                            >Cancel</button>
                                                        </>
                                                        :
                                                        <button
                                                            type="button"
                                                            className={'user-btn mt30 pull-left'}
                                                            onClick={this.processTableHandler}>
                                                            <div className={'plus'}></div>ADD</button>}


                                                </div>
                                            </Col>
                                            <Col md="12">
                                                <Table className="table" size="sm" >
                                                    <thead>
                                                        <tr>
                                                            <th>{`Process Name`}</th>
                                                            <th>{`UOM`}</th>
                                                            <th>{`Output/Hr`}</th>
                                                            <th>{`Output/Annum`}</th>
                                                            <th>{`Machine Rate/Hr (INR)`}</th>
                                                            <th>{`Action`}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody >
                                                        {
                                                            this.state.processGrid &&
                                                            this.state.processGrid.map((item, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td>{item.processName}</td>
                                                                        <td>{item.UnitOfMeasurement}</td>
                                                                        <td>{item.OutputPerHours}</td>
                                                                        <td>{item.OutputPerYear}</td>
                                                                        <td>{item.MachineRate}</td>
                                                                        <td>
                                                                            <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(index)} />
                                                                            <button className="Delete" type={'button'} onClick={() => this.deleteItem(index)} />
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                    </tbody>
                                                    {this.state.processGrid.length === 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                                </Table>
                                            </Col>

                                        </Row>

                                        <Row>
                                            <Col md="12" className="filter-block">
                                                <div className=" flex-fills mb-2">
                                                    <h5>{'Remarks & Attachment'}</h5>
                                                </div>
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={'Remarks'}
                                                    name={`Remark`}
                                                    placeholder="Type here..."
                                                    value={this.state.remarks}
                                                    className=""
                                                    customClassName=" textAreaWithBorder"
                                                    onChange={this.handleMessageChange}
                                                    validate={[maxLength100]}
                                                    // required={true}
                                                    component={renderTextAreaField}
                                                    maxLength="100"
                                                    rows="6"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <label>Upload Files (upload up to 3 files)</label>
                                                {this.state.files.length >= 3 ? '' :
                                                    <Dropzone
                                                        getUploadParams={this.getUploadParams}
                                                        onChangeStatus={this.handleChangeStatus}
                                                        PreviewComponent={this.Preview}
                                                        //onSubmit={this.handleSubmit}
                                                        accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf"
                                                        initialFiles={this.state.initialFiles}
                                                        maxFiles={3}
                                                        maxSizeBytes={2000000}
                                                        inputContent={(files, extra) => (extra.reject ? 'Image, audio and video files only' : 'Drag Files')}
                                                        styles={{
                                                            dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                                                            inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
                                                        }}
                                                        classNames="draper-drop"
                                                    />}
                                            </Col>
                                            <Col md="3">
                                                <div className={'attachment-wrapper'}>
                                                    {
                                                        this.state.files && this.state.files.map(f => {
                                                            const withOutTild = f.FileURL.replace('~', '')
                                                            const fileURL = `${FILE_URL}${withOutTild}`;
                                                            return (
                                                                <div className={'attachment images'}>
                                                                    <a href={fileURL} target="_blank">{f.OriginalFileName}</a>
                                                                    {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                                                                    {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}

                                                                    <img className="float-right" alt={''} onClick={() => this.deleteFile(f.FileId, f.FileName)} src={require('../../../assests/images/red-cross.png')}></img>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row className="sf-btn-footer no-gutters justify-content-between">
                                            <div className="col-sm-12 text-right bluefooter-butn">
                                                <button
                                                    type={'button'}
                                                    className="reset mr15 cancel-btn"
                                                    onClick={this.cancel} >
                                                    <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="submit-button mr5 save-btn" >
                                                    <div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                                                    {isEditFlag ? 'Update' : 'Save'}
                                                </button>
                                            </div>
                                        </Row>

                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {isOpenMachineType && <AddMachineTypeDrawer
                    isOpen={isOpenMachineType}
                    closeDrawer={this.closeMachineTypeDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
                {isOpenAvailability && <EfficiencyDrawer
                    isOpen={isOpenAvailability}
                    closeDrawer={this.closeAvailabilityDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                    NumberOfWorkingHoursPerYear={this.state.WorkingHrPrYr}
                />}
                {isOpenProcessDrawer && <AddProcessDrawer
                    isOpen={isOpenProcessDrawer}
                    closeDrawer={this.closeProcessDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const { comman, material, machine, labour, fuel, auth } = state;
    const fieldsObj = selector(state, 'MachineCost', 'AccessoriesCost', 'InstallationCharges', 'LabourCostPerAnnum', 'TotalCost',
        'LoanPercentage', 'LoanValue', 'EquityPercentage', 'EquityValue', 'RateOfInterestPercentage', 'RateOfInterestValue',
        'WorkingHoursPerShift', 'NumberOfWorkingDaysPerYear', 'EfficiencyPercentage', 'NumberOfWorkingHoursPerYear',
        'DepreciationRatePercentage', 'LifeOfAssetPerYear', 'CastOfScrap', 'DepreciationAmount',
        'AnnualMaintancePercentage', 'AnnualMaintanceAmount', 'AnnualConsumablePercentage', 'AnnualConsumableAmount',
        'AnnualInsurancePercentage', 'AnnualInsuranceAmount',
        'BuildingCostPerSquareFeet', 'MachineFloorAreaPerSquareFeet', 'AnnualAreaCost', 'OtherYearlyCost', 'TotalMachineCostPerAnnum',
        'UtilizationFactorPercentage', 'PowerRatingPerKW', 'PowerCostPerUnit', 'TotalPowerCostPerYear',
        'FuelCostPerUnit', 'ConsumptionPerYear', 'TotalFuelCostPerYear',
        'NumberOfLabour', 'LabourCost', 'OutputPerHours', 'OutputPerYear', 'MachineRate');

    const { technologySelectList, plantSelectList, UOMSelectList,
        ShiftTypeSelectList, DepreciationTypeSelectList, } = comman;
    const { machineTypeSelectList, processSelectList, machineData, loading } = machine;
    const { labourTypeByMachineTypeSelectList } = labour;
    const { vendorListByVendorType } = material;
    const { fuelComboSelectList } = fuel;
    const { initialConfiguration } = auth;
    let initialValues = {};
    if (machineData && machineData !== undefined) {
        initialValues = {
            MachineNumber: machineData.MachineNumber,
            MachineName: machineData.MachineName,
            TonnageCapacity: machineData.TonnageCapacity,
            Manufacture: machineData.Manufacture,
            YearOfManufacturing: machineData.YearOfManufacturing,
            MachineCost: machineData.MachineCost,
            AccessoriesCost: machineData.AccessoriesCost,
            InstallationCharges: machineData.InstallationCharges,
            Description: machineData.Description,
            LabourCostPerAnnum: machineData.LabourCostPerAnnum,
            TotalCost: machineData.TotalCost,
            LoanPercentage: machineData.LoanPercentage,
            LoanValue: machineData.LoanValue,
            EquityPercentage: machineData.EquityPercentage,
            EquityValue: machineData.EquityValue,
            RateOfInterestPercentage: machineData.RateOfInterestPercentage,
            RateOfInterestValue: machineData.RateOfInterestValue,
            WorkingHoursPerShift: machineData.WorkingHoursPerShift,
            NumberOfWorkingDaysPerYear: machineData.NumberOfWorkingDaysPerYear,
            EfficiencyPercentage: machineData.EfficiencyPercentage,
            NumberOfWorkingHoursPerYear: machineData.NumberOfWorkingHoursPerYear,
            DepreciationRatePercentage: machineData.DepreciationRatePercentage,
            LifeOfAssetPerYear: machineData.LifeOfAssetPerYear,
            CastOfScrap: machineData.CastOfScrap,
            DepreciationAmount: machineData.DepreciationAmount,
            AnnualMaintancePercentage: machineData.AnnualMaintancePercentage,
            AnnualMaintanceAmount: machineData.AnnualMaintanceAmount,
            AnnualConsumablePercentage: machineData.AnnualConsumablePercentage,
            AnnualConsumableAmount: machineData.AnnualConsumableAmount,
            AnnualInsurancePercentage: machineData.AnnualInsurancePercentage,
            AnnualInsuranceAmount: machineData.AnnualInsuranceAmount,
            BuildingCostPerSquareFeet: machineData.BuildingCostPerSquareFeet,
            MachineFloorAreaPerSquareFeet: machineData.MachineFloorAreaPerSquareFeet,
            AnnualAreaCost: machineData.AnnualAreaCost,
            OtherYearlyCost: machineData.OtherYearlyCost,
            TotalMachineCostPerAnnum: machineData.TotalMachineCostPerAnnum,
            UtilizationFactorPercentage: machineData.UtilizationFactorPercentage,
            PowerRatingPerKW: machineData.PowerRatingPerKW,
            PowerCostPerUnit: machineData.PowerCostPerUnit,
            TotalPowerCostPerYear: machineData.TotalPowerCostPerYear,
            FuelCostPerUnit: machineData.FuelCostPerUnit,
            ConsumptionPerYear: machineData.ConsumptionPerYear,
            TotalFuelCostPerYear: machineData.TotalFuelCostPerYear,
            Remark: machineData.Remark,
        }
    }

    return {
        vendorListByVendorType, technologySelectList, plantSelectList, UOMSelectList,
        machineTypeSelectList, processSelectList, ShiftTypeSelectList, DepreciationTypeSelectList,
        initialConfiguration, labourTypeByMachineTypeSelectList, fuelComboSelectList, fieldsObj, initialValues, loading,
    }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getTechnologySelectList,
    getVendorListByVendorType,
    getPlantSelectListByType,
    getPlantBySupplier,
    getUOMSelectList,
    getMachineTypeSelectList,
    getProcessesSelectList,
    getShiftTypeSelectList,
    getDepreciationTypeSelectList,
    getLabourTypeByMachineTypeSelectList,
    getFuelComboData,
    getFuelUnitCost,
    getLabourCost,
    getPowerCostUnit,
    createMachineDetails,
    updateMachineDetails,
    getMachineDetailsData,
    fileUploadMachine,
    fileDeleteMachine,
})(reduxForm({
    form: 'AddMoreDetails',
    enableReinitialize: true,
})(AddMoreDetails));
