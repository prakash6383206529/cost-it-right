import React, { useState, useEffect } from 'react';
import { Container, Row, Col, } from 'reactstrap';
import Toaster from '../../common/Toaster';
import Drawer from '@material-ui/core/Drawer';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
//import CostingSimulation from './CostingSimulation';
import { runSimulationOnSelectedCosting, getSelectListOfSimulationApplicability, runSimulationOnSelectedExchangeCosting, runSimulationOnSelectedSurfaceTreatmentCosting, runSimulationOnSelectedMachineRateCosting, runSimulationOnSelectedBoughtOutPartCosting, runSimulationOnSelectedAssemblyTechnologyCosting, runSimulationOnSelectedBoughtOutPart, runSimulationOnSelectedCombinedProcessCosting } from '../actions/Simulation';
import { DatePickerHookForm } from '../../layout/HookFormInputs';
import DayTime from '../../common/DayTimeWrapper'
import { EXCHNAGERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, MACHINERATE, BOPDOMESTIC, BOPIMPORT, SIMULATION, COMBINED_PROCESS } from '../../../config/constants';
//import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { TextFieldHookForm, } from '../../layout/HookFormInputs';
import { checkForNull, getConfigurationKey, setValueAccToUOM, showBopLabel } from '../../../helper';
import { number, percentageLimitValidation, checkWhiteSpaces, decimalNumberLimit6 } from "../../../helper/validation";
import Switch from 'react-switch'
import { Fragment } from 'react';
import { debounce } from 'lodash';
import WarningMessage from '../../common/WarningMessage';
import DatePicker from "react-datepicker";
import { APPLICABILITY_BOP_SIMULATION, APPLICABILITY_PART_SIMULATION, APPLICABILITY_RM_SIMULATION, ASSEMBLY_TECHNOLOGY_MASTER } from '../../../config/masterData';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { MESSAGES } from '../../../config/message';
import LoaderCustom from '../../common/LoaderCustom';
import { fetchCostingHeadsAPI } from '../../../actions/Common';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { useTranslation } from 'react-i18next';
import TooltipCustom from '../../common/Tooltip';

function RunSimulationDrawer(props) {
    const { objs, masterId, date, simulationTechnologyId } = props
    const { t } = useTranslation("Simulation")

    const { topAndLeftMenuData } = useSelector(state => state.auth);
    const { register, control, formState: { errors }, handleSubmit, getValues, setValue } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()
    const [multipleHeads, setMultipleHeads] = useState([])
    const [opposite, setIsOpposite] = useState(false)
    const [selectedData, setSelectedData] = useState([])
    const [provisionalCheck, setProvisionalCheck] = useState(false)
    const [inputOtherCost, setInputOtherCost] = useState(false)
    const [inputAdditionalDiscount, setinputAdditionalDiscount] = useState(false)
    const [disableDiscountAndOtherCost, setDisableDiscountAndOtherCost] = useState(false)
    const [disableAdditionalDiscount, setDisableAdditionalDiscount] = useState(false)
    const [disableAdditionalOtherCost, setDisableAdditionalOtherCost] = useState(false)
    const [toggleSwitchAdditionalOtherCOst, setToggleSwitchAdditionalOtherCOst] = useState(false)
    const [toggleSwitchAdditionalDiscount, setToggleSwitchAdditionalDiscount] = useState(false)
    const [runSimulationDisable, setRunSimulationDisable] = useState(false)
    const [disableDiscountAndOtherCostSecond, setDisableDiscountAndOtherCostSecond] = useState(false)
    const [otherCostApplicability, setOtherCostApplicability] = useState([])
    const [discountCostApplicability, setDiscountCostApplicability] = useState([])
    const [toolCostApplicability, setToolCostApplicablity] = useState([])
    const [packagingCostApplicability, setPackagingCostApplicablity] = useState([])
    const [freightCostApplicability, setFreightCostApplicablity] = useState([])
    const [additionalTool, setAdditionalTool] = useState(false)
    const [additionalPackaging, setAdditionalPackaging] = useState(false)
    const [additionalFreight, setAdditionalFreight] = useState(false)
    const [toggleSwitchAdditionalTool, setToggleSwitchAdditionalTool] = useState(false)
    const [toggleSwitchAdditionalPackaging, setToggleSwitchAdditionalPackaging] = useState(false)
    const [toggleSwitchAdditionalFreight, setToggleSwitchAdditionalFreight] = useState(false)
    const [disableTool, setDisableTool] = useState(false)
    const [disableAdditionalTool, setDisableAdditionalTool] = useState(false)
    const [disableFreight, setDisableFreight] = useState(false)
    const [disableAdditionalFreight, setDisableAdditionalFreight] = useState(false)
    const [disablePackaging, setDisablePackaging] = useState(false)
    const [disableAdditionalPackaging, setDisableAdditionalPackaging] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    const [isProvisionalAccessibility, setIsProvisionalAccessibility] = useState(false)
    const [isCostingCondition, setIsCostingCondition] = useState(false)
    const [isCostingNPV, setIsCostingNPV] = useState(false)
    const selectedMasterForSimulation = useSelector(state => state.simulation.selectedMasterForSimulation)
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const { isMasterAssociatedWithCosting } = useSelector(state => state.simulation)
    const simulationApplicability = useSelector(state => state.simulation.simulationApplicability)
    const showCheckBox = !(simulationApplicability?.value === APPLICABILITY_PART_SIMULATION)
    const [otherCostApplicabilityListing, setOtherCostApplicabilityListing] = useState([])
    const [remainingApplicabilityListing, setRemainingApplicabilityListing] = useState([])
    const { applicabilityHeadListSimulation } = useSelector(state => state.simulation)

    useEffect(() => {
        dispatch(getSelectListOfSimulationApplicability(() => { }))
        // dispatch(getSelectListOfSimulationLinkingTokens(vendorId, simulationTechnologyId, () => { }))
        dispatch(fetchCostingHeadsAPI('', true, (res) => {
            setOtherCostApplicabilityListing(res?.data?.SelectList)
        }))
        dispatch(fetchCostingHeadsAPI('', false, (res) => {
            setRemainingApplicabilityListing(res?.data?.SelectList)
        }))

    }, [])


    useEffect(() => {
        if (topAndLeftMenuData) {
            const simulationData = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === SIMULATION)
            let master;
            switch (masterId) {
                case '1':
                    master = 'RM Domestic'
                    break;
                case '2':
                    master = 'RM Import'
                    break;
                case '3':
                    master = 'Combined'
                    break;
                case '4':
                    master = 'BOP Domestic'
                    break;
                case '5':
                    master = 'BOP Import'
                    break;
                case '6':
                    master = 'Operations'
                    break;
                case '7':
                    master = 'Surface'
                    break;
                case '8':
                    master = 'Exchange'
                    break;
                case '9':
                    master = 'Machine'
                    break;
                default:
                    master = 'RM'
                    break;
            }

            simulationData?.Pages?.map((item) => {
                if (item.PageName.includes(master)) {
                    item.Actions.map((ele) => {
                        if (ele.ActionName === 'Provisional') {
                            setIsProvisionalAccessibility(ele?.IsChecked)
                        }
                    })
                }
            })
        }
    }, [topAndLeftMenuData])
    useEffect(() => {
        if (applicabilityHeadListSimulation && applicabilityHeadListSimulation.length > 0) {
            // Filter out items that are Selected:true from the API response
                const selectedItems = applicabilityHeadListSimulation
                .filter(item => item.Selected === true)
                .map(item => item.Text);

            setSelectedData(selectedItems);
            
            // const result = applicabilityHeadListSimulation.slice(1, 11).map(item => item.Text);
            // setSelectedData(result);
            // setDisableAdditionalDiscount(false);
            // setDisableAdditionalOtherCost(false);
            // setDisableAdditionalPackaging(false);
            // setDisableAdditionalFreight(false);
            // setDisableAdditionalTool(false)
        }
    }, [applicabilityHeadListSimulation]);
    // const costingHead = useSelector(state => state.comman.costingHead)
    const toggleDrawer = (event, mode = false) => {
        if (runSimulationDisable) {
            return false
        }
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', mode)
    };

    const runSimulationCosting = () => {
        //   setIsCostingPage(true)
        props.closeDrawer('', true)
    }

    const handleApplicabilityChange = (elementObj) => {
        
        let tempData = [];

        if (selectedData.includes(elementObj.Text)) {
            tempData = selectedData.filter((el) => el !== elementObj.Text);
        } else {
            tempData = [...selectedData, elementObj.Text];
        }
        
        setSelectedData(tempData);
        setIsOpposite(!opposite);
        if (elementObj.Text === "Discount And Other Cost") {
            setDisableAdditionalDiscount(!disableAdditionalDiscount)
            setDisableAdditionalOtherCost(!disableAdditionalOtherCost)
        }


        if (elementObj.Text === "Additional Other Cost") {
            setInputOtherCost(!inputOtherCost)
            setDisableDiscountAndOtherCostSecond(!disableDiscountAndOtherCostSecond)
            setValue('OtherCost', "")
            errors.OtherCost = {}
            setValue('otherCostApplicability', "")
            setValue('OtherCostPercent', "")
            errors.OtherCostPercent = {}
            setOtherCostApplicability([])

        }

        if (elementObj.Text === "Additional Discount") {
            setinputAdditionalDiscount(!inputAdditionalDiscount)
            setDisableDiscountAndOtherCost(!disableDiscountAndOtherCost)
            setValue('Discount', "")
            errors.Discount = {}
            setValue('DiscountCostApplicability', "")
            setValue('DiscountPercent', "")
            errors.DiscountPercent = {}
            setDiscountCostApplicability([])
        }

        if (elementObj.Text === "Tool") {
            setDisableAdditionalTool(!disableAdditionalTool)
            setValue('Tool', "")
            errors.Tool = {}
            setValue('ToolCostApplicability', "")
            setValue('ToolPercent', "")
            errors.ToolPercent = {}
            setToolCostApplicablity([])
        }
        if (elementObj.Text === "Freight") {
            setDisableAdditionalFreight(!disableAdditionalFreight)
            setValue('Freight', "")
            errors.Freight = {}
            setValue('FreightCostApplicability', "")
            setValue('FreightPercent', "")
            errors.FreightPercent = {}
            setFreightCostApplicablity([])
        }
        if (elementObj.Text === "Packaging") {
            setDisableAdditionalPackaging(!disableAdditionalPackaging)
            setValue('Packaging', "")
            errors.Packaging = {}
            setValue('PackagingCostApplicability', "")
            setValue('PackagingPercent', "")
            errors.PackagingPercent = {}
            setPackagingCostApplicablity([])
        }

    }

    const Provision = (string) => {
        if (string) {
            setProvisionalCheck(!provisionalCheck)
        }
    }

    const applyCondition = (e) => {
        if (e) {
            setIsCostingCondition(!isCostingCondition)
        }
    }

    const applyNPV = (e) => {
        if (e) {
            setIsCostingNPV(!isCostingNPV)

        }
    }

    const handleAdditional = (value) => {
        if (value === 'Tool') {
            setShowPopup(true)
            if (showPopup) {
                if (additionalTool) {
                    setValue('ToolCostApplicability', "")
                }
            }


        } else if (value === 'Packaging') {
            if (additionalPackaging) {
                setValue('PackagingCostApplicability', "")
            }
            setAdditionalPackaging(!additionalPackaging)
            setDisablePackaging(!disablePackaging)
        } else {

            if (additionalFreight) {
                setValue('FreightCostApplicability', "")
            }
            setAdditionalFreight(!additionalFreight)
            setDisableFreight(!disableFreight)
        }
    }

    const IsAvailable = (id) => {
        if (id === "Latest Exchange Rate" && selectedMasterForSimulation?.value === EXCHNAGERATE) {
            return true
        }
        // return selectedData.includes(id);

        // const item = applicabilityHeadListSimulation.find(head => head.Text === id);
        // return item?.Selected || selectedData.includes(id);

        if (selectedData.includes(id)) {
            return true
        }
    }

    const checkForResponse = (res) => {
        setRunSimulationDisable(false)
        if ('response' in res) {
            if (res && res?.response?.data?.Result === false) {
            }
        }
        if (res?.data?.Result) {
            Toaster.success('Simulation process run successfully.')
            runSimulationCosting()
        }
    }

    const SimulationRun = debounce(handleSubmit(() => {
        setRunSimulationDisable(true)

        let obj = {}

        const Overhead = selectedData?.includes("Overhead")
        const Profit = selectedData?.includes("Profit")
        const Rejection = selectedData?.includes("Rejection")
        const DiscountOtherCost = selectedData?.includes("Discount And Other Cost")
        const PaymentTerms = selectedData?.includes("Payment Terms")
        const Inventory = selectedData?.includes("ICC")
        const AdditionalDiscount = selectedData?.includes("Additional Discount")
        const AdditionalOtherCost = selectedData?.includes("Additional Other Cost")
        const Tool = selectedData?.includes("Tool")
        const Packaging = selectedData?.includes("Packaging")
        const Freight = selectedData?.includes("Freight")
        const BOPHandlingCharge = selectedData?.includes(`${showBopLabel()} Handling Charge`)
        const LatestExchangeRate = selectedData?.includes("Latest Exchange Rate")

        let temp = []
        obj.IsOverhead = Overhead
        obj.IsProfit = Profit
        obj.IsRejection = Rejection
        obj.IsInventory = Inventory
        obj.IsPaymentTerms = PaymentTerms
        obj.IsDiscountAndOtherCost = DiscountOtherCost
        obj.IsAdditionalDiscount = AdditionalDiscount
        obj.IsAdditionalOtherCost = AdditionalOtherCost
        obj.AdditionalOtherValue = toggleSwitchAdditionalOtherCOst ? getValues("OtherCostPercent") : getValues("OtherCost")                  // if toggleSwitchAdditionalOtherCOst==true then we will fetch percent value else (fixed value)
        obj.AdditionalDiscountPercentage = toggleSwitchAdditionalDiscount === true ? getValues("DiscountPercent") : getValues("Discount")        // if toggleSwitchAdditionalDiscount==true then we will fetch discount percent value else fixed value
        obj.IsAdditionalOtherCostPercentage = toggleSwitchAdditionalOtherCOst
        obj.IsAdditionalDiscountPercentage = toggleSwitchAdditionalDiscount
        obj.IsTool = Tool
        obj.IsFreight = Freight
        obj.IsPackaging = Packaging
        obj.IsBOPHandlingCharge = BOPHandlingCharge
        obj.AdditionalOtherCostApplicability = (inputOtherCost === true) ? ((toggleSwitchAdditionalOtherCOst === false) ? 'Fixed' : otherCostApplicability.label) : ''
        obj.AdditionalDiscountApplicability = (inputAdditionalDiscount === true) ? ((toggleSwitchAdditionalDiscount === false) ? 'Fixed' : discountCostApplicability.label) : ''
        obj.IsAdditionalToolPercentage = toggleSwitchAdditionalTool
        obj.AdditionalToolApplicability = (additionalTool === true) ? ((toggleSwitchAdditionalTool === false) ? 'Fixed' : toolCostApplicability.label) : ''
        obj.IsAdditionalTool = additionalTool
        obj.AdditionalToolValue = toggleSwitchAdditionalTool ? getValues("ToolPercent") : getValues("Tool")
        obj.IsAdditionalPackagingPercentage = toggleSwitchAdditionalPackaging
        obj.AdditionalPackagingApplicability = (additionalPackaging === true) ? ((toggleSwitchAdditionalPackaging === false) ? 'Fixed' : packagingCostApplicability.label) : ''
        obj.IsAdditionalPackaging = additionalPackaging
        obj.AdditionalPackagingValue = toggleSwitchAdditionalPackaging ? getValues("PackagingPercent") : getValues("Packaging")
        obj.IsAdditionalFreightPercentage = toggleSwitchAdditionalFreight
        obj.AdditionalFreightApplicability = (additionalFreight === true) ? ((toggleSwitchAdditionalFreight === false) ? 'Fixed' : freightCostApplicability.label) : ''
        obj.IsAdditionalFreight = additionalFreight
        obj.AdditionalFreightValue = toggleSwitchAdditionalFreight ? getValues("FreightPercent") : getValues("Freight")
        obj.IsApplyLatestExchangeRate = (selectedMasterForSimulation?.value === EXCHNAGERATE) ? true : LatestExchangeRate
        obj.IsCostingCondition = isCostingCondition
        obj.IsCostingNPV = isCostingNPV

        // obj.IsProvisional = provisionalCheck
        // obj.LinkingTokenNumber = linkingTokenNumber != '' ? linkingTokenNumber : tokenNo
        temp.push(obj)
        if (checkForNull(selectedMasterForSimulation.value) === ASSEMBLY_TECHNOLOGY_MASTER) {
            dispatch(runSimulationOnSelectedAssemblyTechnologyCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp, SimulationId: props?.token }, (res) => {
                checkForResponse(res)
            }))
        } else {
            let masterTemp = selectedMasterForSimulation.value
            if (selectedMasterForSimulation?.value === EXCHNAGERATE && simulationApplicability?.value === APPLICABILITY_RM_SIMULATION) {
                masterTemp = RMIMPORT
            } else if (selectedMasterForSimulation?.value === EXCHNAGERATE && simulationApplicability?.value === APPLICABILITY_BOP_SIMULATION) {
                masterTemp = BOPIMPORT
            }
            switch (Number(masterTemp)) {
                case Number(EXCHNAGERATE):
                    dispatch(runSimulationOnSelectedExchangeCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                        checkForResponse(res)
                    }))
                    break;
                case Number(RMDOMESTIC):
                    dispatch(runSimulationOnSelectedCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                        checkForResponse(res)
                    }))
                    break;
                case Number(RMIMPORT):
                    dispatch(runSimulationOnSelectedCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                        checkForResponse(res)
                    }))
                    break;
                case Number(SURFACETREATMENT):
                    dispatch(runSimulationOnSelectedSurfaceTreatmentCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                        checkForResponse(res)
                    }))
                    break;
                case Number(OPERATIONS):
                    dispatch(runSimulationOnSelectedSurfaceTreatmentCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                        checkForResponse(res)
                    }))
                    break;
                case Number(MACHINERATE):
                    dispatch(runSimulationOnSelectedMachineRateCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                        checkForResponse(res)
                    }))
                    break;
                case Number(BOPDOMESTIC):
                    if (isMasterAssociatedWithCosting) {
                        dispatch(runSimulationOnSelectedBoughtOutPartCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                            checkForResponse(res)
                        }))
                    } else {
                        dispatch(runSimulationOnSelectedBoughtOutPart({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                            checkForResponse(res)
                        }))
                    }
                    break;
                case Number(BOPIMPORT):
                    dispatch(runSimulationOnSelectedBoughtOutPartCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                        checkForResponse(res)
                    }))
                    break;
                case Number(COMBINED_PROCESS):
                    dispatch(runSimulationOnSelectedCombinedProcessCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                        checkForResponse(res)
                    }))
                    break;
                // case Number(BOPIMPORT):
                //     dispatch(runSimulationOnSelectedOverheadCosting({ ...objs, EffectiveDate: DayTime(selectedDate).format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                //         checkForResponse(res)
                //     }))
                //     runSimulationCosting()
                //     break;
                // case Number(BOPIMPORT):
                //     dispatch(runSimulationOnSelectedProfitCosting({ ...objs, EffectiveDate: DayTime(selectedDate).format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                //         checkForResponse(res)
                //     }))
                //     runSimulationCosting()
                //     break;
                default:
                    break;
            }
        }
        // if (masterId === Number(EXCHNAGERATE)) {
        //     dispatch(runSimulationOnSelectedExchangeCosting({ ...objs, EffectiveDate: moment(selectedDate).local().format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
        //         if (res.data.Result) {
        //             Toaster.success('Simulation process run successfully.')
        //             runSimulationCosting()
        //         }
        //     }))
        // } else {
        //     //THIS IS TO CHANGE AFTER IT IS DONE FROM KAMAL SIR'S SIDE
        //     dispatch(runSimulationOnSelectedCosting({ ...objs, EffectiveDate: moment(selectedDate).local().format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
        //         if (res.data.Result) {
        //             Toaster.success('Simulation process run successfully.')
        //             runSimulationCosting()
        //         }
        //     }))
        // }
    }), 500)

    const onChange = () => {
        setToggleSwitchAdditionalOtherCOst(!toggleSwitchAdditionalOtherCOst)
        setValue('OtherCost', "")
        errors.OtherCost = {}
        setValue('otherCostApplicability', "")
        setValue('OtherCostPercent', "")
        errors.OtherCostPercent = {}
        setOtherCostApplicability([])
    }

    const onChangeAdditionalDiscount = () => {
        setToggleSwitchAdditionalDiscount(!toggleSwitchAdditionalDiscount)
        setValue('Discount', "")
        errors.Discount = {}
        setValue('DiscountCostApplicability', "")
        setValue('DiscountPercent', "")
        errors.DiscountPercent = {}
        setDiscountCostApplicability([])
    }

    const onChangeAdditionalTool = () => {
        setToggleSwitchAdditionalTool(!toggleSwitchAdditionalTool)
        setValue('Tool', "")
        errors.Tool = {}
        setValue('ToolCostApplicability', "")
        setValue('ToolPercent', "")
        errors.ToolPercent = {}
        setToolCostApplicablity([])
    }

    const onChangeAdditionalPackaging = () => {
        setToggleSwitchAdditionalPackaging(!toggleSwitchAdditionalPackaging)
        setValue('Packaging', "")
        errors.Packaging = {}
        setValue('PackagingCostApplicability', "")
        setValue('PackagingPercent', "")
        errors.PackagingPercent = {}
        setPackagingCostApplicablity([])
    }

    const onChangeAdditionalFreight = () => {
        setToggleSwitchAdditionalFreight(!toggleSwitchAdditionalFreight)
        setValue('Freight', "")
        errors.Freight = {}
        setValue('FreightCostApplicability', "")
        setValue('FreightPercent', "")
        errors.FreightPercent = {}
        setFreightCostApplicablity([])
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    const renderListing = (label, type = '') => {
        const temp = [];

        if (label === 'Applicability') {
            let resOfCostingHead = type === 'Additional Other Cost' ? otherCostApplicabilityListing : remainingApplicabilityListing

            resOfCostingHead && resOfCostingHead.map(item => {
                if(item?.Text === "Crate/Trolley")return false
                if (item.Value === '0' || item.Value === '8') return false;
                if (Number(simulationTechnologyId) === ASSEMBLY_TECHNOLOGY_MASTER) {
                    if (!item.Text.includes('RM')) {
                        temp.push({ label: item.Text, value: item.Value })
                    }
                } else {
                    if (!item.Text.includes('Part')) {
                        temp.push({ label: item.Text, value: item.Value })
                    }
                }
                return null;
            });
            return temp;
        }

    }
    const handleOherCostApplicabilityChange = (value) => {
        setOtherCostApplicability(value)
    }
    const handleDiscountApplicabilityChange = (value) => {
        setDiscountCostApplicability(value)
    }

    const handleToolCostApplicabilityChange = (value) => {
        setToolCostApplicablity(value)
    }

    const handlePackagingCostApplicabilityChange = (value) => {
        setPackagingCostApplicablity(value)
    }

    const handleFreightCostApplicabilityChange = (value) => {
        setFreightCostApplicablity(value)
    }
    const onPopupConfirm = () => {
        setAdditionalTool(!additionalTool)
        setDisableTool(!disableTool)
        setShowPopup(false)
    }

    const closePopUp = () => {
        setShowPopup(false)
    }
    // Add this console log to monitor state changes
// useEffect(() => {
//     console.log('Selected Data:', selectedData);
//     console.log('Backend Selections:', 
//         applicabilityHeadListSimulation
//             .filter(item => item.Selected)
//             .map(item => item.Text)
//     );
// }, [selectedData, applicabilityHeadListSimulation]);
//     // Add a helper function to determine if an item is backend-selected
// const isBackendSelected = (text) => {
//     const item = applicabilityHeadListSimulation.find(head => head.Text === text);
//     return item?.Selected || false;
// }
    const disabledFields = (el) => (el.Text === "Discount And Other Cost" && disableDiscountAndOtherCost) || (el.Text === "Discount And Other Cost" && disableDiscountAndOtherCostSecond) || (el.Text === "Additional Discount" && disableAdditionalDiscount) || (el.Text === "Additional Other Cost" && disableAdditionalOtherCost) || (el.Text === "Packaging" && disablePackaging) || (el.Text === "Additional Packaging" && disableAdditionalPackaging) || (el.Text === "Freight" && disableFreight) || (el.Text === "Tool" && disableTool) || (el.Text === "Latest Exchange Rate" && selectedMasterForSimulation?.value === EXCHNAGERATE) ? true : false
    return (
        <>
            {/* <runSimulationDrawerDataContext.Provider value={runSimulationDrawerData}>
                < ApproveRejectDrawer />
                
            </runSimulationDrawerDataContext.Provider> */}
            <div>
                <>
                    <Drawer
                        anchor={props.anchor}
                        open={props.isOpen}
                    // onClose={(e) => this.toggleDrawer(e)}
                    >
                        <Container>
                            <div className={"drawer-wrapper"}>
                                <form noValidate className="form" >
                                    <Row className="drawer-heading">
                                        <Col>
                                            <div className={"header-wrapper left"}>
                                                <h3>
                                                    {"Apply Simulation Applicability"}
                                                    <TourWrapper
                                                        buttonSpecificProp={{ id: "Run_Simulation_Drawer" }}
                                                        stepsSpecificProp={{
                                                            steps: Steps(t).RunsimulationDrawer
                                                        }} />
                                                </h3>
                                            </div>

                                            <div
                                                onClick={(e) => toggleDrawer(e)}
                                                disabled={runSimulationDisable}
                                                className={"close-button right"}
                                            ></div>
                                        </Col>
                                    </Row>

                                    <Row className="ml-0 pt-2">
                                        {runSimulationDisable && <LoaderCustom customClass="approve-reject-drawer-loader" />}
                                        <Col md="12" className="mb-3 pr-0">
                                            <Row>
                                                {
                                                    masterId !== Number(EXCHNAGERATE) && applicabilityHeadListSimulation && applicabilityHeadListSimulation.map((el, i) => {
                                                        if (el.Value === '0') return false;
                                                        if (showCheckBox === false && (el?.Text !== "Additional Discount" && el?.Text !== "Additional Other Cost" && el?.Text !== "Latest Exchange Rate")) return false;
                                                        return (
                                                            <Col md={`${showCheckBox ? '6' : '8'}`} className='mb-3 check-box-container p-0'>
                                                                <div class={`custom-check1 d-inline-block drawer-side-input-other ${disabledFields(el) ? 'disabled' : ''}`} id={`afpplicability-checkbox_${i}`}>
                                                                    <label
                                                                        id="simulation_checkbox"
                                                                        className="custom-checkbox mb-0"
                                                                        onChange={() => handleApplicabilityChange(el)}
                                                                    >
                                                                        {el.Text}
                                                                        <input
                                                                            type="checkbox"
                                                                            value={"All"}
                                                                            disabled={disabledFields(el)}
                                                                            // disabled={isDisabled}

                                                                            checked={IsAvailable(el.Text)}
                                                                        />


                                                                        <span
                                                                            className=" before-box"
                                                                            checked={IsAvailable(el.Text)}
                                                                            onChange={() => handleApplicabilityChange(el)}
                                                                        />
                                                                    </label>
                                                                    {(el.Text === "Additional Other Cost") && inputOtherCost ?
                                                                        <Fragment>
                                                                            <div className="toggle-button-per-and-fix">
                                                                                <label className="normal-switch d-flex align-items-center pb-4 pt-3 w-fit"> <span className="mr-2">Fixed</span>

                                                                                    <Switch
                                                                                        onChange={onChange}
                                                                                        checked={toggleSwitchAdditionalOtherCOst}
                                                                                        id="normal-switch"
                                                                                        disabled={false}
                                                                                        background="#4DC771"
                                                                                        onColor="#4DC771"
                                                                                        onHandleColor="#ffffff"
                                                                                        offColor="#4DC771"
                                                                                        uncheckedIcon={true}
                                                                                        checkedIcon={true}
                                                                                        height={20}
                                                                                        width={46}
                                                                                    />
                                                                                    <span className="ml-2">Percentage</span>
                                                                                </label>
                                                                                {/* <div> {toggleSwitchLabel ? 'Percentage' : 'Fixed'}</div> */}

                                                                                {toggleSwitchAdditionalOtherCOst &&           // input field to fetch percent value

                                                                                    <div className='additonal-discount-container'>
                                                                                        <SearchableSelectHookForm
                                                                                            label={'Other Cost Applicability'}
                                                                                            name={'otherCostApplicability'}
                                                                                            placeholder={'Select'}
                                                                                            Controller={Controller}
                                                                                            control={control}
                                                                                            rules={{ required: false }}
                                                                                            register={register}
                                                                                            defaultValue={otherCostApplicability.length !== 0 ? otherCostApplicability : ''}
                                                                                            options={renderListing('Applicability', el.Text)}
                                                                                            mandatory={true}
                                                                                            disabled={false}
                                                                                            customClassName={"auto-width"}
                                                                                            handleChange={handleOherCostApplicabilityChange}
                                                                                            errors={errors.otherCostApplicability}
                                                                                        />
                                                                                        <TextFieldHookForm
                                                                                            label="Percentage"
                                                                                            name={"OtherCostPercent"}
                                                                                            Controller={Controller}
                                                                                            rules={{
                                                                                                required: true,
                                                                                                validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                                                                max: {
                                                                                                    value: 100,
                                                                                                    message: 'Percentage cannot be greater than 100'
                                                                                                },
                                                                                            }}
                                                                                            control={control}
                                                                                            register={register}
                                                                                            mandatory={true}
                                                                                            handleChange={() => { }}
                                                                                            defaultValue={""}
                                                                                            className=""
                                                                                            customClassName={"auto-width"}
                                                                                            errors={errors.OtherCostPercent}
                                                                                            disabled={false}
                                                                                        />
                                                                                    </div>
                                                                                }

                                                                                {!toggleSwitchAdditionalOtherCOst &&   //// input field to fetch fixed value
                                                                                    <NumberFieldHookForm
                                                                                        label="Fixed"
                                                                                        name={"OtherCost"}
                                                                                        Controller={Controller}
                                                                                        rules={
                                                                                            {
                                                                                                required: true,
                                                                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                                                            }
                                                                                        }
                                                                                        control={control}
                                                                                        register={register}
                                                                                        mandatory={true}
                                                                                        handleChange={() => { }}
                                                                                        defaultValue={""}
                                                                                        className=""
                                                                                        customClassName={"withBorder"}
                                                                                        errors={errors.OtherCost}
                                                                                        disabled={false}
                                                                                    />
                                                                                }
                                                                            </div>
                                                                        </Fragment>

                                                                        : " "
                                                                    }


                                                                    {(el.Text === "Additional Discount") && inputAdditionalDiscount ?

                                                                        <Fragment>
                                                                            <div className="toggle-button-per-and-fix">
                                                                                <label className="normal-switch d-flex align-items-center pb-4 pt-3 w-fit"> <span className="mr-2">Fixed</span>
                                                                                    <Switch
                                                                                        onChange={onChangeAdditionalDiscount}
                                                                                        checked={toggleSwitchAdditionalDiscount}
                                                                                        id="normal-switch"
                                                                                        disabled={false}
                                                                                        background="#4DC771"
                                                                                        onColor="#4DC771"
                                                                                        onHandleColor="#ffffff"
                                                                                        offColor="#4DC771"
                                                                                        uncheckedIcon={true}
                                                                                        checkedIcon={true}
                                                                                        height={20}
                                                                                        width={46}
                                                                                    />
                                                                                    <span className="ml-2">Percentage</span>
                                                                                </label>
                                                                                {/* <div> {toggleSwitchLabel ? 'Percentage' : 'Fixed'}</div> */}

                                                                                {toggleSwitchAdditionalDiscount === true &&  // input field to fetch percent value
                                                                                    <div className='additonal-discount-container'>
                                                                                        <SearchableSelectHookForm
                                                                                            label={'Discount Applicability'}
                                                                                            name={'DiscountCostApplicability'}
                                                                                            placeholder={'Select'}
                                                                                            Controller={Controller}
                                                                                            control={control}
                                                                                            rules={{ required: false }}
                                                                                            register={register}
                                                                                            defaultValue={discountCostApplicability.length !== 0 ? discountCostApplicability : ''}
                                                                                            options={renderListing('Applicability')}
                                                                                            mandatory={true}
                                                                                            disabled={false}
                                                                                            handleChange={handleDiscountApplicabilityChange}
                                                                                            errors={errors.DiscountCostApplicability}
                                                                                            customClassName={"auto-width"}
                                                                                        />
                                                                                        <TextFieldHookForm
                                                                                            label="Percentage"
                                                                                            name={"DiscountPercent"}
                                                                                            Controller={Controller}
                                                                                            rules={{
                                                                                                required: true,
                                                                                                validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                                                                max: {
                                                                                                    value: 100,
                                                                                                    message: 'Percentage cannot be greater than 100'
                                                                                                },
                                                                                            }}
                                                                                            control={control}
                                                                                            register={register}
                                                                                            mandatory={true}
                                                                                            handleChange={() => { }}
                                                                                            defaultValue={""}
                                                                                            customClassName="auto-width"
                                                                                            errors={errors.DiscountPercent}
                                                                                            disabled={false}
                                                                                        />
                                                                                    </div>
                                                                                }
                                                                                {toggleSwitchAdditionalDiscount === false &&    // input field to fetch fixed value
                                                                                    <>
                                                                                        <NumberFieldHookForm
                                                                                            label="Fixed"
                                                                                            name={"Discount"}
                                                                                            Controller={Controller}
                                                                                            control={control}
                                                                                            register={register}
                                                                                            mandatory={true}
                                                                                            rules={{
                                                                                                required: true,
                                                                                                pattern: {
                                                                                                    value: /^\d*\.?\d*$/,
                                                                                                    message: 'Invalid Number.'
                                                                                                },
                                                                                                validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                                                                max: {
                                                                                                    value: props?.minimumPoPrice,
                                                                                                    message: `Discount value should be less than selected costing's PO Price. Maximum value of discount should be (${props?.minimumPoPrice})`
                                                                                                }
                                                                                            }}
                                                                                            handleChange={() => { }}
                                                                                            defaultValue={""}
                                                                                            className=""
                                                                                            customClassName={"withBorder"}
                                                                                            errors={errors.Discount}
                                                                                            disabled={false}
                                                                                        />
                                                                                    </>
                                                                                }
                                                                            </div>
                                                                        </Fragment>
                                                                        : " "
                                                                    }
                                                                </div>
                                                            </Col>
                                                        )
                                                    })
                                                }
                                            </Row>
                                            <Row>
                                                <Col md="12" className="mb-3 p-0">
                                                    <div class={`custom-check1 d-inline-block drawer-side-input-other `}>
                                                        {(

                                                            <div className={`input-group col-md-12 mb-3 px-0 m-height-auto ${disableAdditionalPackaging ? 'disabled' : ''}`} id={`applicability-checkbox_16`}>

                                                                <label
                                                                    className="custom-checkbox mb-0"
                                                                    onChange={() => handleAdditional('Packaging')}
                                                                >
                                                                    Additional Packaging
                                                                    <input
                                                                        type="checkbox"
                                                                        //value={"All"}
                                                                        disabled={disableAdditionalPackaging}
                                                                    //checked={IsAvailable(el.Value)}
                                                                    />
                                                                    <span
                                                                        className=" before-box"
                                                                        // checked={IsAvailable(el.Value)}
                                                                        onChange={() => handleAdditional('Packaging')}
                                                                    />
                                                                </label>
                                                                <TooltipCustom
                                                                 id="packaging-calculation"
                                                                 tooltipText={"By applying additional packaging, the already added packaging will be removed"}
                                                                 customClass="mt-1"
                                                                />  
                                                            </div>
                                                        )
                                                        }

                                                        {additionalPackaging ?
                                                            <Fragment>
                                                                <div className="toggle-button-per-and-fix">
                                                                    <label className="normal-switch d-flex align-items-center pb-4 pt-3 w-fit"> <span className="mr-2">Fixed</span>
                                                                        <Switch
                                                                            onChange={onChangeAdditionalPackaging}
                                                                            checked={toggleSwitchAdditionalPackaging}
                                                                            id="normal-switch"
                                                                            disabled={false}
                                                                            background="#4DC771"
                                                                            onColor="#4DC771"
                                                                            onHandleColor="#ffffff"
                                                                            offColor="#4DC771"
                                                                            uncheckedIcon={true}
                                                                            checkedIcon={true}
                                                                            height={20}
                                                                            width={46}
                                                                        />
                                                                        <span className="ml-2">Percentage</span>
                                                                    </label>
                                                                    {/* <div> {toggleSwitchLabel ? 'Percentage' : 'Fixed'}</div> */}


                                                                    {toggleSwitchAdditionalPackaging === true &&  // input field to fetch percent value
                                                                        <div className='additonal-discount-container'>
                                                                            <SearchableSelectHookForm
                                                                                label={'Packaging Applicability'}
                                                                                name={'PackagingCostApplicability'}
                                                                                placeholder={'Select'}
                                                                                Controller={Controller}
                                                                                control={control}
                                                                                rules={{ required: false }}
                                                                                register={register}
                                                                                options={renderListing('Applicability')}
                                                                                mandatory={true}
                                                                                disabled={false}
                                                                                handleChange={handlePackagingCostApplicabilityChange}
                                                                                errors={errors.PackagingCostApplicability}
                                                                                customClassName={"auto-width"}
                                                                            />
                                                                            <TextFieldHookForm
                                                                                label="Percentage"
                                                                                name={"PackagingPercent"}
                                                                                Controller={Controller}
                                                                                rules={{
                                                                                    required: true,
                                                                                    validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                                                    max: {
                                                                                        value: 100,
                                                                                        message: 'Percentage cannot be greater than 100'
                                                                                    },
                                                                                }}
                                                                                control={control}
                                                                                register={register}
                                                                                mandatory={true}
                                                                                handleChange={() => { }}
                                                                                defaultValue={""}
                                                                                customClassName="auto-width"
                                                                                errors={errors.PackagingPercent}
                                                                                disabled={false}
                                                                            />
                                                                        </div>
                                                                    }

                                                                    {toggleSwitchAdditionalPackaging === false &&    // input field to fetch fixed value
                                                                        <>
                                                                            <NumberFieldHookForm
                                                                                label="Fixed"
                                                                                name={"Packaging"}
                                                                                Controller={Controller}
                                                                                control={control}
                                                                                register={register}
                                                                                mandatory={true}
                                                                                rules={{
                                                                                    required: true,
                                                                                    pattern: {
                                                                                        value: /^\d*\.?\d*$/,
                                                                                        message: 'Invalid Number.'
                                                                                    },
                                                                                    validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                                                }}
                                                                                handleChange={() => { }}
                                                                                defaultValue={""}
                                                                                className=""
                                                                                customClassName={"withBorder"}
                                                                                errors={errors.Packaging}
                                                                                disabled={false}
                                                                            />
                                                                        </>
                                                                    }
                                                                </div>
                                                            </Fragment>
                                                            : " "
                                                        }
                                                    </div>
                                                </Col>
                                                <Col md="12" className="mb-3 p-0">
                                                    <div class={`custom-check1 d-inline-block drawer-side-input-other `}>
                                                        {(
                                                            <div className={`input-group col-md-12 mb-3 px-0 m-height-auto ${disableAdditionalFreight ? 'disabled' : ''}`} id={`applicability-checkbox_17`}>
                                                                <label
                                                                    className="custom-checkbox mb-0"
                                                                    onChange={() => handleAdditional('Freight')}
                                                                >
                                                                    Additional Freight
                                                                    <input
                                                                        type="checkbox"
                                                                        //value={"All"}
                                                                        disabled={disableAdditionalFreight}
                                                                    //checked={IsAvailable(el.Value)}
                                                                    />
                                                                    <span
                                                                        className=" before-box"
                                                                        // checked={IsAvailable(el.Value)}
                                                                        onChange={() => handleAdditional('Freight')}
                                                                    />
                                                                </label>
                                                            </div>
                                                        )
                                                        }
                                                        {additionalFreight ?
                                                            <Fragment>
                                                                <div className="toggle-button-per-and-fix">
                                                                    <label className="normal-switch d-flex align-items-center pb-4 pt-3 w-fit"> <span className="mr-2">Fixed</span>
                                                                        <Switch
                                                                            onChange={onChangeAdditionalFreight}
                                                                            checked={toggleSwitchAdditionalFreight}
                                                                            id="normal-switch"
                                                                            disabled={false}
                                                                            background="#4DC771"
                                                                            onColor="#4DC771"
                                                                            onHandleColor="#ffffff"
                                                                            offColor="#4DC771"
                                                                            uncheckedIcon={true}
                                                                            checkedIcon={true}
                                                                            height={20}
                                                                            width={46}
                                                                        />
                                                                        <span className="ml-2">Percentage</span>
                                                                    </label>
                                                                    {/* <div> {toggleSwitchLabel ? 'Percentage' : 'Fixed'}</div> */}


                                                                    {toggleSwitchAdditionalFreight === true &&  // input field to fetch percent value
                                                                        <div className='additonal-discount-container'>
                                                                            <SearchableSelectHookForm
                                                                                label={'Freight Applicability'}
                                                                                name={'FreightCostApplicability'}
                                                                                placeholder={'Select'}
                                                                                Controller={Controller}
                                                                                control={control}
                                                                                rules={{ required: false }}
                                                                                register={register}
                                                                                options={renderListing('Applicability')}
                                                                                mandatory={true}
                                                                                disabled={false}
                                                                                handleChange={handleFreightCostApplicabilityChange}
                                                                                errors={errors.FreightCostApplicability}
                                                                                customClassName={"auto-width"}
                                                                            />
                                                                            <TextFieldHookForm
                                                                                label="Percentage"
                                                                                name={"FreightPercent"}
                                                                                Controller={Controller}
                                                                                rules={{
                                                                                    required: true,
                                                                                    validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                                                    max: {
                                                                                        value: 100,
                                                                                        message: 'Percentage cannot be greater than 100'
                                                                                    },
                                                                                }}
                                                                                control={control}
                                                                                register={register}
                                                                                mandatory={true}
                                                                                handleChange={() => { }}
                                                                                defaultValue={""}
                                                                                customClassName="auto-width"
                                                                                errors={errors.FreightPercent}
                                                                                disabled={false}
                                                                            />
                                                                        </div>
                                                                    }

                                                                    {toggleSwitchAdditionalFreight === false &&    // input field to fetch fixed value
                                                                        <>
                                                                            <NumberFieldHookForm
                                                                                label="Fixed"
                                                                                name={"Freight"}
                                                                                Controller={Controller}
                                                                                control={control}
                                                                                register={register}
                                                                                mandatory={true}
                                                                                rules={{
                                                                                    required: true,
                                                                                    pattern: {
                                                                                        value: /^\d*\.?\d*$/,
                                                                                        message: 'Invalid Number.'
                                                                                    },
                                                                                    validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                                                }}
                                                                                handleChange={() => { }}
                                                                                defaultValue={""}
                                                                                className=""
                                                                                customClassName={"withBorder"}
                                                                                errors={errors.Freight}
                                                                                disabled={false}
                                                                            />
                                                                        </>
                                                                    }
                                                                </div>
                                                            </Fragment>

                                                            : " "
                                                        }
                                                    </div>
                                                </Col>

                                                <Col md="12" className={`p-0 pb-3`}>
                                                    <div class={`custom-check1 d-inline-block drawer-side-input-other `}>
                                                        {(
                                                            <div className={`input-group col-md-12 mb-3 px-0 m-height-auto ${disableAdditionalTool ? 'disabled' : ''}`} id={`applicability-checkbox_18`}>

                                                                <label
                                                                    className="custom-checkbox mb-0"
                                                                    onChange={() => handleAdditional('Tool')}
                                                                >
                                                                    Additional Tool
                                                                    <input
                                                                        type="checkbox"
                                                                        //value={"All"}
                                                                        disabled={disableAdditionalTool}
                                                                        checked={additionalTool}
                                                                    />
                                                                    <span
                                                                        className=" before-box"
                                                                        checked={additionalTool}
                                                                        onChange={() => handleAdditional('Tool')}
                                                                    />
                                                                </label>
                                                            </div>
                                                        )
                                                        }

                                                        {additionalTool ?

                                                            <Fragment>
                                                                <div className="toggle-button-per-and-fix">
                                                                    <label className="normal-switch d-flex align-items-center pb-5 pt-3 w-fit"> <span className="mr-2">Fixed</span>
                                                                        <Switch
                                                                            onChange={onChangeAdditionalTool}
                                                                            checked={toggleSwitchAdditionalTool}
                                                                            id="normal-switch"
                                                                            disabled={false}
                                                                            background="#4DC771"
                                                                            onColor="#4DC771"
                                                                            onHandleColor="#ffffff"
                                                                            offColor="#4DC771"
                                                                            uncheckedIcon={true}
                                                                            checkedIcon={true}
                                                                            height={20}
                                                                            width={46}
                                                                        />
                                                                        <span className="ml-2">Percentage</span>
                                                                    </label>
                                                                    {/* <div> {toggleSwitchLabel ? 'Percentage' : 'Fixed'}</div> */}


                                                                    {toggleSwitchAdditionalTool === true &&  // input field to fetch percent value
                                                                        <div className='additonal-discount-container'>
                                                                            <SearchableSelectHookForm
                                                                                label={'Tool Applicability'}
                                                                                name={'ToolCostApplicability'}
                                                                                placeholder={'Select'}
                                                                                Controller={Controller}
                                                                                control={control}
                                                                                rules={{ required: false }}
                                                                                register={register}
                                                                                options={renderListing('Applicability')}
                                                                                mandatory={true}
                                                                                disabled={false}
                                                                                handleChange={handleToolCostApplicabilityChange}
                                                                                errors={errors.ToolCostApplicability}
                                                                                customClassName={"auto-width"}
                                                                            />
                                                                            <TextFieldHookForm
                                                                                label="Percentage"
                                                                                name={"ToolPercent"}
                                                                                Controller={Controller}
                                                                                rules={{
                                                                                    required: true,
                                                                                    validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                                                    max: {
                                                                                        value: 100,
                                                                                        message: 'Percentage cannot be greater than 100'
                                                                                    },
                                                                                }}
                                                                                control={control}
                                                                                register={register}
                                                                                mandatory={true}
                                                                                handleChange={() => { }}
                                                                                defaultValue={""}
                                                                                customClassName="auto-width"
                                                                                errors={errors.ToolPercent}
                                                                                disabled={false}
                                                                            />
                                                                        </div>
                                                                    }

                                                                    {toggleSwitchAdditionalTool === false &&    // input field to fetch fixed value
                                                                        <>
                                                                            <NumberFieldHookForm
                                                                                label="Fixed"
                                                                                name={"Tool"}
                                                                                Controller={Controller}
                                                                                control={control}
                                                                                register={register}
                                                                                mandatory={true}
                                                                                rules={{
                                                                                    required: true,
                                                                                    pattern: {
                                                                                        value: /^\d*\.?\d*$/,
                                                                                        message: 'Invalid Number.'
                                                                                    },
                                                                                    validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                                                }}
                                                                                handleChange={() => { }}
                                                                                defaultValue={""}
                                                                                className=""
                                                                                customClassName={"withBorder"}
                                                                                errors={errors.Tool}
                                                                                disabled={false}
                                                                            />
                                                                        </>
                                                                    }
                                                                </div>
                                                            </Fragment> : " "
                                                        }
                                                    </div>
                                                </Col>
                                            </Row>


                                            {getConfigurationKey().IsProvisionalSimulation && isProvisionalAccessibility && (
                                                <Row>
                                                    <div className="input-group col-md-12 mb-3 px-0 m-height-auto">
                                                        <label
                                                            className="custom-checkbox mb-0"
                                                            onChange={() => Provision(`Provisional`)}
                                                        >
                                                            Provisional
                                                            <input
                                                                type="checkbox"
                                                            //value={"All"}
                                                            // disabled={true}
                                                            //checked={IsAvailable(el.Value)}
                                                            />
                                                            <span
                                                                className=" before-box"
                                                                // checked={IsAvailable(el.Value)}
                                                                onChange={() => Provision(`Provisional`)}
                                                            />
                                                        </label>
                                                    </div>
                                                </Row>
                                            )
                                            }


                                            {initialConfiguration?.IsBasicRateAndCostingConditionVisible && (
                                                <Row>
                                                    <div className="input-group col-md-12 mb-3 px-0 m-height-auto" id={`applicability-checkbox_19`}>
                                                        <label
                                                            className="custom-checkbox mb-0"
                                                            onChange={() => applyCondition(`Condition`)}
                                                        >
                                                            Apply Condition
                                                            <input
                                                                type="checkbox"
                                                            // disabled={true}
                                                            />
                                                            <span
                                                                className=" before-box"
                                                                // checked={IsAvailable(el.Value)}
                                                                onChange={() => applyCondition(`Condition`)}
                                                            />
                                                        </label>
                                                    </div>
                                                </Row>
                                            )
                                            }

                                            {
                                                initialConfiguration?.IsShowNpvCost && (
                                                    <Row>
                                                        <div className="input-group col-md-12 mb-3 px-0 m-height-auto" id={`applicability-checkbox_20`}>
                                                            <label
                                                                id="costing_simulation"
                                                                className="custom-checkbox mb-0"
                                                                onChange={() => applyNPV(`NPV`)}
                                                            >
                                                                Apply NPV
                                                                <input
                                                                    type="checkbox"
                                                                // disabled={true}
                                                                />
                                                                <span
                                                                    className=" before-box"
                                                                    // checked={IsAvailable(el.Value)}
                                                                    onChange={() => applyNPV(`NPV`)}
                                                                />
                                                            </label>
                                                        </div>
                                                    </Row>
                                                )
                                            }

                                            <Row>
                                                <Col md="12" className="inputbox date-section pl-0">
                                                    <DatePicker
                                                        selected={DayTime(date).isValid() ? new Date(date) : ''}
                                                        dateFormat="dd/MM/yyyy"
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode='select'
                                                        readonly="readonly"
                                                        onBlur={() => null}
                                                        autoComplete={'off'}
                                                        disabledKeyboardNavigation
                                                        disabled={true}
                                                    />
                                                </Col>
                                                <Col md="12" className="mt-n2 warning-text-container">
                                                    <div className="warning-text ml-n3">
                                                        <WarningMessage dClass="mr-3 mt-4" message={"Unselected norms won't be applied in future revisions"} />
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col >
                                    </Row >

                                    <Row className="sf-btn-footer no-gutters justify-content-between mt-4 mr-0">
                                        <div className="col-md-12 ">
                                            <div className="text-right">
                                                <button type="button" className="user-btn save-btn" id="applicability-run-simulation" onClick={SimulationRun} disabled={runSimulationDisable}>
                                                    <div className={"Run-icon"}>
                                                    </div>{" "}
                                                    {"RUN SIMULATION"}
                                                </button>
                                                <button className="cancel-btn mr-2" id="applicability-cancel" type={"button"} onClick={toggleDrawer} >
                                                    <div className={"cross-icon"}>
                                                        <div className="cancel-icon"></div>
                                                    </div>{" "}
                                                    {"Cancel"}
                                                </button>
                                            </div>
                                        </div >
                                    </Row >
                                </form >
                            </div >
                        </Container >
                    </Drawer >
                </>
                {
                    showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={MESSAGES.SIMULATION_TOOLCOST_POPUP_MESSAGE} />
                }
            </div >
        </>
    );

}


export default RunSimulationDrawer;

