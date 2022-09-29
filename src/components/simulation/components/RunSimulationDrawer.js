import React, { useState, useEffect } from 'react';
import { Container, Row, Col, } from 'reactstrap';
import Toaster from '../../common/Toaster';
import Drawer from '@material-ui/core/Drawer';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
//import CostingSimulation from './CostingSimulation';
import { EXCHNAGERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, MACHINERATE, BOPDOMESTIC, BOPIMPORT } from '../../../config/constants';
import { runSimulationOnSelectedCosting, getSelectListOfSimulationApplicability, runSimulationOnSelectedExchangeCosting, runSimulationOnSelectedSurfaceTreatmentCosting, runSimulationOnSelectedMachineRateCosting, runSimulationOnSelectedBoughtOutPartCosting } from '../actions/Simulation';
import { DatePickerHookForm } from '../../layout/HookFormInputs';
import DayTime from '../../common/DayTimeWrapper'
import { NumberFieldHookForm, SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { getConfigurationKey } from '../../../helper';
import Switch from 'react-switch'
import { Fragment } from 'react';
import { debounce } from 'lodash';
import WarningMessage from '../../common/WarningMessage';
import DatePicker from "react-datepicker";

function RunSimulationDrawer(props) {
    const { objs, masterId, date } = props

    const { register, control, formState: { errors }, handleSubmit, getValues } = useForm({
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


    useEffect(() => {
        dispatch(getSelectListOfSimulationApplicability(() => { }))
        // dispatch(getSelectListOfSimulationLinkingTokens(vendorId, simulationTechnologyId, () => { }))

    }, [])
    const costingHead = useSelector(state => state.comman.costingHead)
    const { applicabilityHeadListSimulation } = useSelector(state => state.simulation)
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


        let temp = multipleHeads
        let temp1 = multipleHeads
        if (temp && temp.findIndex(el => el.SimulationApplicabilityId === elementObj.Value) !== -1) {
            const ind = multipleHeads.findIndex((el) => el.SimulationApplicabilityId === elementObj.Value)
            const indexForCheck = selectedData.findIndex((el) => el === elementObj.label)
            if (ind !== -1) {
                temp.splice(ind, 1)
                temp1.splice(indexForCheck, 1)
            }
        } else {
            temp.push({ SimulationApplicabilityName: elementObj.Text, SimulationApplicabilityId: elementObj.Value })
            temp1.push(elementObj.Text)
        }
        setMultipleHeads(temp)
        setSelectedData(temp1)
        setIsOpposite(!opposite)

        if (elementObj.Text === "Discount And Other Cost") {
            setDisableAdditionalDiscount(!disableAdditionalDiscount)
            setDisableAdditionalOtherCost(!disableAdditionalOtherCost)
        }


        if (elementObj.Text === "Additional Other Cost") {
            setInputOtherCost(!inputOtherCost)
            setDisableDiscountAndOtherCostSecond(!disableDiscountAndOtherCostSecond)
            //sethideDiscountAndOtherCost(!hideDiscountAndOtherCost)
        }

        if (elementObj.Text === "Additional Discount") {
            setinputAdditionalDiscount(!inputAdditionalDiscount)
            setDisableDiscountAndOtherCost(!disableDiscountAndOtherCost)
        }

        if (elementObj.Text === "Tool") {
            setDisableAdditionalTool(!disableAdditionalTool)
        }
        if (elementObj.Text === "Freight") {
            setDisableAdditionalFreight(!disableAdditionalFreight)
        }
        if (elementObj.Text === "Packaging") {
            setDisableAdditionalPackaging(!disableAdditionalPackaging)
        }

    }

    const Provision = (string) => {
        if (string) {
            setProvisionalCheck(!provisionalCheck)
        }
    }


    const handleAdditional = (value) => {
        if (value === 'Tool') {
            setAdditionalTool(!additionalTool)
            setDisableTool(!disableTool)

        } else if (value === 'Packaging') {
            setAdditionalPackaging(!additionalPackaging)
            setDisablePackaging(!disablePackaging)
        } else {
            setAdditionalFreight(!additionalFreight)
            setDisableFreight(!disableFreight)
        }
    }

    const IsAvailable = (id) => { }

    const checkForResponse = (res) => {
        setRunSimulationDisable(false)
        if ('response' in res) {
            if (res && res?.response?.data?.Result === false) {
            }
        }
        if (res?.data?.Result) {
            Toaster.success('Simulation process has been run successfully.')
            runSimulationCosting()
        }
    }

    const SimulationRun = debounce(handleSubmit(() => {
        setRunSimulationDisable(true)

        let obj = {}

        const Overhead = selectedData.includes("Overhead")
        const Profit = selectedData.includes("Profit")
        const Rejection = selectedData.includes("Rejection")
        const DiscountOtherCost = selectedData.includes("Discount And Other Cost")
        const PaymentTerms = selectedData.includes("Payment Terms")
        const Inventory = selectedData.includes("ICC")
        const AdditionalDiscount = selectedData.includes("Additional Discount")
        const AdditionalOtherCost = selectedData.includes("Additional Other Cost")
        const Tool = selectedData.includes("Tool")
        const Packaging = selectedData.includes("Packaging")
        const Freight = selectedData.includes("Freight")
        const BOPHandlingCharge = selectedData.includes("BOP Handling Charge")

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
        obj.AdditionalOtherCostApplicability = otherCostApplicability.label
        obj.AdditionalDiscountApplicability = discountCostApplicability.label
        obj.IsAdditionalToolPercentage = toggleSwitchAdditionalTool
        obj.AdditionalToolApplicability = toolCostApplicability.label
        obj.IsAdditionalTool = additionalTool
        obj.AdditionalToolValue = toggleSwitchAdditionalTool ? getValues("ToolPercent") : getValues("ToolPercent")
        obj.IsAdditionalPackagingPercentage = toggleSwitchAdditionalPackaging
        obj.AdditionalPackagingApplicability = packagingCostApplicability.label
        obj.IsAdditionalPackaging = additionalPackaging
        obj.AdditionalPackagingValue = toggleSwitchAdditionalPackaging ? getValues("PackagingPercent") : getValues("Packaging")
        obj.IsAdditionalFreightPercentage = toggleSwitchAdditionalFreight
        obj.AdditionalFreightApplicability = freightCostApplicability.label
        obj.IsAdditionalFreight = additionalFreight
        obj.AdditionalFreightValue = toggleSwitchAdditionalFreight ? getValues("FreightPercent") : getValues("Freight")

        // obj.IsProvisional = provisionalCheck
        // obj.LinkingTokenNumber = linkingTokenNumber != '' ? linkingTokenNumber : tokenNo
        temp.push(obj)
        switch (Number(masterId)) {
            case Number(EXCHNAGERATE):
                dispatch(runSimulationOnSelectedExchangeCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), SimulationApplicability: temp }, (res) => {
                    checkForResponse(res)
                }))
                break;

            case Number(RMDOMESTIC):
                dispatch(runSimulationOnSelectedCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), SimulationApplicability: temp }, (res) => {
                    checkForResponse(res)
                }))
                break;
            case Number(RMIMPORT):
                dispatch(runSimulationOnSelectedCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), SimulationApplicability: temp }, (res) => {
                    checkForResponse(res)
                }))
                break;
            case Number(SURFACETREATMENT):
                dispatch(runSimulationOnSelectedSurfaceTreatmentCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), SimulationApplicability: temp }, (res) => {
                    checkForResponse(res)
                }))
                break;
            case Number(OPERATIONS):
                dispatch(runSimulationOnSelectedSurfaceTreatmentCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), SimulationApplicability: temp }, (res) => {
                    checkForResponse(res)
                }))
                break;
            case Number(MACHINERATE):
                dispatch(runSimulationOnSelectedMachineRateCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), SimulationApplicability: temp }, (res) => {
                    checkForResponse(res)
                }))
                runSimulationCosting()
                break;
            case Number(BOPDOMESTIC):
                dispatch(runSimulationOnSelectedBoughtOutPartCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), SimulationApplicability: temp }, (res) => {
                    checkForResponse(res)
                }))
                break;
            case Number(BOPIMPORT):
                dispatch(runSimulationOnSelectedBoughtOutPartCosting({ ...objs, EffectiveDate: DayTime(date !== null ? date : "").format('YYYY/MM/DD HH:mm'), SimulationApplicability: temp }, (res) => {
                    checkForResponse(res)
                }))
                break;
            // case Number(BOPIMPORT):
            //     dispatch(runSimulationOnSelectedOverheadCosting({ ...objs, EffectiveDate: DayTime(selectedDate).format('YYYY/MM/DD HH:mm'), SimulationApplicability: temp }, (res) => {
            //         checkForResponse(res)
            //     }))
            //     runSimulationCosting()
            //     break;
            // case Number(BOPIMPORT):
            //     dispatch(runSimulationOnSelectedProfitCosting({ ...objs, EffectiveDate: DayTime(selectedDate).format('YYYY/MM/DD HH:mm'), SimulationApplicability: temp }, (res) => {
            //         checkForResponse(res)
            //     }))
            //     runSimulationCosting()
            //     break;
            default:
                break;
        }

        // if (masterId === Number(EXCHNAGERATE)) {
        //     dispatch(runSimulationOnSelectedExchangeCosting({ ...objs, EffectiveDate: moment(selectedDate).format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
        //         if (res.data.Result) {
        //             Toaster.success('Simulation process has been run successfully.')
        //             runSimulationCosting()
        //         }
        //     }))
        // } else {
        //     //THIS IS TO CHANGE AFTER IT IS DONE FROM KAMAL SIR'S SIDE
        //     dispatch(runSimulationOnSelectedCosting({ ...objs, EffectiveDate: moment(selectedDate).format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
        //         if (res.data.Result) {
        //             Toaster.success('Simulation process has been run successfully.')
        //             runSimulationCosting()
        //         }
        //     }))
        // }
    }), 500)

    const onChange = () => {
        setToggleSwitchAdditionalOtherCOst(!toggleSwitchAdditionalOtherCOst)

    }

    const onChangeAdditionalDiscount = () => {
        setToggleSwitchAdditionalDiscount(!toggleSwitchAdditionalDiscount)

    }

    const onChangeAdditionalTool = () => {
        setToggleSwitchAdditionalTool(!toggleSwitchAdditionalTool)
    }

    const onChangeAdditionalPackaging = () => {
        setToggleSwitchAdditionalPackaging(!toggleSwitchAdditionalPackaging)
    }

    const onChangeAdditionalFreight = () => {
        setToggleSwitchAdditionalFreight(!toggleSwitchAdditionalFreight)

    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    const renderListing = (label) => {

        const temp = [];

        if (label === 'Applicability') {
            costingHead && costingHead.map(item => {
                if (item.Value === '0' || item.Value === '8') return false;
                temp.push({ label: item.Text, value: item.Value })
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
                                        <Col md="12" className="mb-3 pr-0">
                                            <Row>
                                                {
                                                    masterId !== Number(EXCHNAGERATE) && applicabilityHeadListSimulation && applicabilityHeadListSimulation.map((el, i) => {
                                                        if (el.Value === '0') return false;
                                                        return (
                                                            <Col md="6" className="mb-3 p-0 check-box-container">
                                                                <div class={`custom-check1 d-inline-block drawer-side-input-other `}>
                                                                    <label
                                                                        className="custom-checkbox mb-0"
                                                                        onChange={() => handleApplicabilityChange(el)}
                                                                    >
                                                                        {el.Text}

                                                                        <input
                                                                            type="checkbox"
                                                                            value={"All"}
                                                                            disabled={(el.Text === "Discount And Other Cost" && disableDiscountAndOtherCost) || (el.Text === "Discount And Other Cost" && disableDiscountAndOtherCostSecond) || (el.Text === "Additional Discount" && disableAdditionalDiscount) || (el.Text === "Additional Other Cost" && disableAdditionalOtherCost) || (el.Text === "Packaging" && disablePackaging) || (el.Text === "Freight" && disableFreight) || (el.Text === "Tool" && disableTool) ? true : false}
                                                                            checked={IsAvailable(el.Value)}
                                                                        />


                                                                        <span
                                                                            className=" before-box"
                                                                            checked={IsAvailable(el.Value)}
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
                                                                                            options={renderListing('Applicability')}
                                                                                            mandatory={true}
                                                                                            disabled={false}
                                                                                            customClassName={"auto-width"}
                                                                                            handleChange={handleOherCostApplicabilityChange}
                                                                                            errors={errors.otherCostApplicability}
                                                                                        />
                                                                                        <NumberFieldHookForm
                                                                                            label="Percentage"
                                                                                            name={"OtherCostPercent"}
                                                                                            Controller={Controller}
                                                                                            rules={{
                                                                                                required: true,
                                                                                                pattern: {
                                                                                                    value: /^\d*\.?\d*$/,
                                                                                                    message: 'Invalid Number.'
                                                                                                },

                                                                                                max: {
                                                                                                    value: 100,
                                                                                                    message: "Should not be greater than 100"
                                                                                                }
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
                                                                                            { required: true }

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
                                                                                        <NumberFieldHookForm
                                                                                            label="Percentage"
                                                                                            name={"DiscountPercent"}
                                                                                            Controller={Controller}
                                                                                            rules={{
                                                                                                required: true,
                                                                                                pattern: {
                                                                                                    value: /^\d*\.?\d*$/,
                                                                                                    message: 'Invalid Number.'
                                                                                                },

                                                                                                max: {
                                                                                                    value: 100,
                                                                                                    message: "Should not be greater than 100"
                                                                                                }
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

                                                            <div className="input-group col-md-12 mb-3 px-0 m-height-auto">

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
                                                                                defaultValue={discountCostApplicability.length !== 0 ? discountCostApplicability : ''}
                                                                                options={renderListing('Applicability')}
                                                                                mandatory={true}
                                                                                disabled={false}
                                                                                handleChange={handlePackagingCostApplicabilityChange}
                                                                                errors={errors.PackagingCostApplicability}
                                                                                customClassName={"auto-width"}
                                                                            />
                                                                            <NumberFieldHookForm
                                                                                label="Percentage"
                                                                                name={"PackagingPercent"}
                                                                                Controller={Controller}
                                                                                rules={{
                                                                                    required: true,
                                                                                    pattern: {
                                                                                        value: /^\d*\.?\d*$/,
                                                                                        message: 'Invalid Number.'
                                                                                    },

                                                                                    max: {
                                                                                        value: 100,
                                                                                        message: "Should not be greater than 100"
                                                                                    }
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
                                                            <div className="input-group col-md-12 mb-3 px-0 m-height-auto">
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
                                                                                defaultValue={discountCostApplicability.length !== 0 ? discountCostApplicability : ''}
                                                                                options={renderListing('Applicability')}
                                                                                mandatory={true}
                                                                                disabled={false}
                                                                                handleChange={handleFreightCostApplicabilityChange}
                                                                                errors={errors.FreightCostApplicability}
                                                                                customClassName={"auto-width"}
                                                                            />
                                                                            <NumberFieldHookForm
                                                                                label="Percentage"
                                                                                name={"FreightPercent"}
                                                                                Controller={Controller}
                                                                                rules={{
                                                                                    required: true,
                                                                                    pattern: {
                                                                                        value: /^\d*\.?\d*$/,
                                                                                        message: 'Invalid Number.'
                                                                                    },
                                                                                    max: {
                                                                                        value: 100,
                                                                                        message: "Should not be greater than 100"
                                                                                    }
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

                                                <Col md="12" className="mb-3 p-0">
                                                    <div class={`custom-check1 d-inline-block drawer-side-input-other `}>
                                                        {(
                                                            <div className="input-group col-md-12 mb-3 px-0 m-height-auto">

                                                                <label
                                                                    className="custom-checkbox mb-0"
                                                                    onChange={() => handleAdditional('Tool')}
                                                                >
                                                                    Additional Tool
                                                                    <input
                                                                        type="checkbox"
                                                                        //value={"All"}
                                                                        disabled={disableAdditionalTool}
                                                                    //checked={IsAvailable(el.Value)}
                                                                    />
                                                                    <span
                                                                        className=" before-box"
                                                                        // checked={IsAvailable(el.Value)}
                                                                        onChange={() => handleAdditional('Tool')}
                                                                    />
                                                                </label>
                                                            </div>
                                                        )
                                                        }

                                                        {additionalTool ?

                                                            <Fragment>
                                                                <div className="toggle-button-per-and-fix">
                                                                    <label className="normal-switch d-flex align-items-center pb-4 pt-3 w-fit"> <span className="mr-2">Fixed</span>
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
                                                                                defaultValue={discountCostApplicability.length !== 0 ? discountCostApplicability : ''}
                                                                                options={renderListing('Applicability')}
                                                                                mandatory={true}
                                                                                disabled={false}
                                                                                handleChange={handleToolCostApplicabilityChange}
                                                                                errors={errors.ToolCostApplicability}
                                                                                customClassName={"auto-width"}
                                                                            />
                                                                            <NumberFieldHookForm
                                                                                label="Percentage"
                                                                                name={"ToolPercent"}
                                                                                Controller={Controller}
                                                                                rules={{
                                                                                    required: true,
                                                                                    pattern: {
                                                                                        value: /^\d*\.?\d*$/,
                                                                                        message: 'Invalid Number.'
                                                                                    },

                                                                                    max: {
                                                                                        value: 100,
                                                                                        message: "Should not be greater than 100"
                                                                                    }
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


                                            {getConfigurationKey().IsProvisionalSimulation && (
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

                                            <Row>
                                                <Col md="12" className="inputbox date-section pl-0">
                                                    <DatePicker
                                                        selected={DayTime(date).isValid() ? new Date(date) : ''}
                                                        dateFormat="dd/MM/yyyy"
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        readonly="readonly"
                                                        onBlur={() => null}
                                                        autoComplete={'off'}
                                                        disabledKeyboardNavigation
                                                        disabled={true}
                                                    />
                                                </Col>
                                                <Col md="12" className="mt-n2 warning-text-container">
                                                    <div className="warning-text ml-n3">
                                                        <WarningMessage dClass="mr-3 " message={"Unselected norms won't be applied in future revisions"} />
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>

                                    <Row className="sf-btn-footer no-gutters justify-content-between mt-4 mr-0">
                                        <div className="col-md-12 ">
                                            <div className="text-right">
                                                <button type="button" className="user-btn save-btn" onClick={SimulationRun} disabled={runSimulationDisable}>
                                                    <div className={"Run-icon"}>
                                                    </div>{" "}
                                                    {"RUN SIMULATION"}
                                                </button>
                                                <button className="cancel-btn mr-2" type={"button"} onClick={toggleDrawer} >
                                                    <div className={"cross-icon"}>
                                                        <div className="cancel-icon"></div>
                                                    </div>{" "}
                                                    {"Cancel"}
                                                </button>
                                            </div>
                                        </div>
                                    </Row>
                                </form>
                            </div>
                        </Container>
                    </Drawer>
                </>

            </div>
        </>
    );

}


export default RunSimulationDrawer;

