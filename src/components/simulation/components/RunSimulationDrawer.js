import React, { useState, useEffect } from 'react';
import { Container, Row, Col, } from 'reactstrap';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
//import CostingSimulation from './CostingSimulation';
import { runSimulationOnSelectedCosting, getSelectListOfSimulationApplicability, runSimulationOnSelectedExchangeCosting, runSimulationOnSelectedSurfaceTreatmentCosting } from '../actions/Simulation';
import { DatePickerHookForm } from '../../layout/HookFormInputs';
import moment from 'moment';
import { EXCHNAGERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT } from '../../../config/constants';
//import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { TextFieldHookForm, } from '../../layout/HookFormInputs';
import { getConfigurationKey } from '../../../helper';
import Switch from 'react-switch'
import { Fragment } from 'react';
import { debounce } from 'lodash';
import WarningMessage from '../../common/WarningMessage';

function RunSimulationDrawer(props) {
    const { objs, masterId, simulationTechnologyId, vendorId, tokenNo } = props

    const { register, control, formState: { errors }, handleSubmit, setValue, getValues, reset, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })





    const dispatch = useDispatch()

    const [multipleHeads, setMultipleHeads] = useState([])
    const [opposite, setIsOpposite] = useState(false)
    const [warningMessage, setWarningMessage] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedData, setSelectedData] = useState([])
    const [provisionalCheck, setProvisionalCheck] = useState(false)
    const [inputOtherCost, setInputOtherCost] = useState(false)
    const [inputAdditionalDiscount, setinputAdditionalDiscount] = useState(false)
    const [disableDiscountAndOtherCost, setDisableDiscountAndOtherCost] = useState(false)
    const [disableAdditionalDiscount, setDisableAdditionalDiscount] = useState(false)
    const [disableAdditionalOtherCost, setDisableAdditionalOtherCost] = useState(false)
    const [toggleSwitchLabel, setToggleSwitchLabel] = useState(false)
    const [toggleSwitchAdditionalDiscount, setToggleSwitchAdditionalDiscount] = useState(false)


    const [linkingTokenNumber, setLinkingTokenNumber] = useState('')



    useEffect(() => {
        dispatch(getSelectListOfSimulationApplicability(() => { }))
        // dispatch(getSelectListOfSimulationLinkingTokens(vendorId, simulationTechnologyId, () => { }))

    }, [])

    const { applicabilityHeadListSimulation } = useSelector(state => state.simulation)
    const { TokensList } = useSelector(state => state.simulation)

    const toggleDrawer = (event, mode = false) => {
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
            console.log('indexForCheck: ', indexForCheck);
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
            //sethideDiscountAndOtherCost(!hideDiscountAndOtherCost)
        }


        if (elementObj.Text === "Additional Discount") {
            setinputAdditionalDiscount(!inputAdditionalDiscount)

            setDisableDiscountAndOtherCost(!disableDiscountAndOtherCost)
        }

    }

    const Provision = (string) => {

        if (string) {
            setProvisionalCheck(!provisionalCheck)

        }
    }


    const handleGradeChange = (value) => {

        setLinkingTokenNumber(value)

    }

    const renderListing = () => {
        let temp = []

        // TokensList && TokensList.map((item) => {

        //     if (item.Value === '0') return false
        //     temp.push({ label: item.Text, value: item.Value })
        //     return null


        // })
        // return temp
        // if (label && label !== '') {
        //     if (label === 'technology') {
        //         technologySelectList && technologySelectList.map((item) => {
        //             if (item.Value === '0') return false
        //             temp.push({ label: item.Text, value: item.Value })
        //             return null
        //         })
        //         return temp
        //     }
        // }
    }

    const IsAvailable = (id) => { }

    const SimulationRun = debounce(handleSubmit(() => {

        let obj = {}



        const Overhead = selectedData.includes("Overhead")
        const Profit = selectedData.includes("Profit")
        const Rejection = selectedData.includes("Rejection")
        const DiscountOtherCost = selectedData.includes("Discount And Other Cost")
        const PaymentTerms = selectedData.includes("Payment Terms")
        const Inventory = selectedData.includes("Inventory")
        const AdditionalDiscount = selectedData.includes("Additional Discount")
        const AdditionalOtherCost = selectedData.includes("Additional Other Cost")

        let temp = []
        obj.IsOverhead = Overhead
        obj.IsProfit = Profit
        obj.IsRejection = Rejection
        obj.IsInventory = Inventory
        obj.IsPaymentTerms = PaymentTerms
        obj.IsDiscountAndOtherCost = DiscountOtherCost
        obj.IsAdditionalDiscount = AdditionalDiscount
        obj.IsAdditionalOtherCost = AdditionalOtherCost
        obj.AdditionalOtherValue = getValues("OtherCost")
        obj.AdditionalDiscountPercentage = getValues("Discount")
        obj.IsAdditionalOtherCostPercentage = toggleSwitchLabel
        obj.IsAdditionalDiscountPercentage = toggleSwitchAdditionalDiscount

        // obj.IsProvisional = provisionalCheck
        // obj.LinkingTokenNumber = linkingTokenNumber != '' ? linkingTokenNumber : tokenNo
        temp.push(obj)
        console.log(masterId, 'masterIdmasterId')
        switch (Number(masterId)) {
            case Number(EXCHNAGERATE):
                dispatch(runSimulationOnSelectedExchangeCosting({ ...objs, EffectiveDate: moment(selectedDate).local().format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                    if (res.data.Result) {
                        toastr.success('Simulation process has been run successfully.')
                        runSimulationCosting()
                    }
                }))
                break;
            case Number(RMDOMESTIC):
                dispatch(runSimulationOnSelectedCosting({ ...objs, EffectiveDate: moment(selectedDate).local().format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                    if (res.data.Result) {
                        toastr.success('Simulation process has been run successfully.')
                        runSimulationCosting()
                    }
                }))
                break;
            case Number(RMIMPORT):
                dispatch(runSimulationOnSelectedCosting({ ...objs, EffectiveDate: moment(selectedDate).local().format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                    if (res.data.Result) {
                        toastr.success('Simulation process has been run successfully.')
                        runSimulationCosting()
                    }
                }))
                break;
            case Number(SURFACETREATMENT):
                dispatch(runSimulationOnSelectedSurfaceTreatmentCosting({ ...objs, EffectiveDate: moment(selectedDate).local().format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {

                    if (res.data.Result) {
                        toastr.success('Simulation process has been run successfully.')
                        runSimulationCosting()
                    }
                }))
                runSimulationCosting()
                break;
            case Number(OPERATIONS):
                dispatch(runSimulationOnSelectedSurfaceTreatmentCosting({ ...objs, EffectiveDate: moment(selectedDate).local().format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {

                    if (res.data.Result) {
                        toastr.success('Simulation process has been run successfully.')
                        runSimulationCosting()
                    }
                }))
                runSimulationCosting()
                break;
            default:
                break;
        }




        // if (masterId === Number(EXCHNAGERATE)) {
        //     dispatch(runSimulationOnSelectedExchangeCosting({ ...objs, EffectiveDate: moment(selectedDate).local().format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
        //         if (res.data.Result) {
        //             toastr.success('Simulation process has been run successfully.')
        //             runSimulationCosting()
        //         }
        //     }))
        // } else {
        //     //THIS IS TO CHANGE AFTER IT IS DONE FROM KAMAL SIR'S SIDE
        //     dispatch(runSimulationOnSelectedCosting({ ...objs, EffectiveDate: moment(selectedDate).local().format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
        //         if (res.data.Result) {
        //             toastr.success('Simulation process has been run successfully.')
        //             runSimulationCosting()
        //         }
        //     }))
        // }
    }), 500)

    const onSubmit = () => {
        // 
        // dispatch(runSimulationOnSelectedCosting(objs, (res) => {
        //     if (res.data.Result) {
        //         toastr.success('Simulation process has been run successfully.')
        //         runSimulationCosting()
        //     }
        // }))
    }


    const handleEffectiveDateChange = (date) => {
        setSelectedDate(date)
    }
    const onChange = () => {
        setToggleSwitchLabel(!toggleSwitchLabel)

    }

    const onChangeAdditionalDiscount = () => {
        setToggleSwitchAdditionalDiscount(!toggleSwitchAdditionalDiscount)

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
                                <form noValidate className="form"
                                // onSubmit={handleSubmit(SimulationRun)}
                                >
                                    <Row className="drawer-heading">
                                        <Col>
                                            <div className={"header-wrapper left"}>
                                                <h3>
                                                    {"Apply Simulation Applicability"}
                                                </h3>
                                            </div>
                                            <div
                                                onClick={(e) => toggleDrawer(e)}
                                                className={"close-button right"}
                                            ></div>
                                        </Col>
                                    </Row>

                                    <Row className="ml-0 pt-3">
                                        <Col md="12" className="mb-3">
                                            {
                                                masterId !== Number(EXCHNAGERATE) && applicabilityHeadListSimulation && applicabilityHeadListSimulation.map((el, i) => {
                                                    if (el.Value === '0') return false;
                                                    return (
                                                        <Col md="12" className="mb-3 p-0">
                                                            <div class={`custom-check1 d-inline-block drawer-side-input-other `}>
                                                                <label
                                                                    className="custom-checkbox mb-0"
                                                                    onChange={() => handleApplicabilityChange(el)}
                                                                >
                                                                    {el.Text}

                                                                    <input
                                                                        type="checkbox"
                                                                        value={"All"}
                                                                        disabled={(el.Text === "Discount And Other Cost" && disableDiscountAndOtherCost) || (el.Text === "Additional Discount" && disableAdditionalDiscount) || (el.Text === "Additional Other Cost" && disableAdditionalOtherCost) ? true : false}
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
                                                                                    checked={toggleSwitchLabel}
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
                                                                            <TextFieldHookForm
                                                                                label=""
                                                                                name={"OtherCost"}
                                                                                Controller={Controller}
                                                                                rules={{ required: true }}
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



                                                                            <TextFieldHookForm
                                                                                label=""
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

                                                                                    max: {
                                                                                        value: 100,
                                                                                        message: "Should not be greater than 100"
                                                                                    },
                                                                                }}
                                                                                handleChange={() => { }}
                                                                                defaultValue={""}
                                                                                className=""
                                                                                customClassName={"withBorder"}
                                                                                errors={errors.Discount}
                                                                                disabled={false}
                                                                            />
                                                                        </div>
                                                                    </Fragment>

                                                                    : " "

                                                                }


                                                            </div>

                                                        </Col>
                                                    )
                                                })
                                            }



                                            {getConfigurationKey().IsProvisionalSimulation && (
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
                                            )

                                            }



                                            {/* {provisionalCheck &&


                                                <SearchableSelectHookForm
                                                    label={'Link Token Number'}
                                                    name={'Link'}
                                                    placeholder={'select'}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: false }}
                                                    register={register}
                                                    // defaultValue={technology.length !== 0 ? technology : ''}
                                                    options={renderListing()}
                                                    mandatory={true}
                                                    handleChange={handleGradeChange}
                                                    errors={errors.Masters}
                                                    customClassName="mb-0"
                                                />

                                            } */}

                                            <Row>
                                                <Col md="12" className="inputbox date-section">
                                                    <DatePickerHookForm
                                                        name={`EffectiveDate`}
                                                        label={'Effective Date'}
                                                        selected={selectedDate}
                                                        handleChange={(date) => {
                                                            handleEffectiveDateChange(date);
                                                        }}
                                                        //defaultValue={data.effectiveDate != "" ? moment(data.effectiveDate).format('DD/MM/YYYY') : ""}
                                                        rules={{ required: true }}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dateFormat="aa/MM/yyyy"
                                                        //maxDate={new Date()}
                                                        dropdownMode="select"
                                                        placeholderText="Select date"
                                                        customClassName="withBorder"
                                                        className="withBorder"
                                                        autoComplete={"off"}
                                                        disabledKeyboardNavigation
                                                        onChangeRaw={(e) => e.preventDefault()}
                                                        disabled={false}
                                                        mandatory={true}
                                                        errors={errors.EffectiveDate}
                                                    />
                                                </Col>

                                            </Row>
                                            <Row>
                                                <Col md="12" className="mt-4 warning-text-container">
                                                    <div className="warning-text">
                                                        <WarningMessage dClass="mr-3" message={"Unselected norms won't be applied in future revisions"} />
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Col>

                                    </Row>




                                    <Row className="sf-btn-footer no-gutters justify-content-between mt-4 mr-0">
                                        <div className="col-md-12 ">
                                            <div className="text-right px-2">
                                                <button type="button" className="user-btn mr5 save-btn" onClick={SimulationRun}>
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

