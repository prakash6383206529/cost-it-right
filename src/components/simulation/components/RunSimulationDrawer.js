import React, { useState, useEffect } from 'react';
import { Container, Row, Col, } from 'reactstrap';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
//import CostingSimulation from './CostingSimulation';
import { EXCHNAGERATE, COMBINED_PROCESS, RMDOMESTIC, RMIMPORT } from '../../../config/constants';
import { runSimulationOnSelectedCosting, getSelectListOfSimulationApplicability, runSimulationOnSelectedExchangeCosting, runSimulationOnSelectedCombinedProcessCosting } from '../actions/Simulation';
import { DatePickerHookForm } from '../../layout/HookFormInputs';
import moment from 'moment';
// import { EXCHNAGERATE } from '../../../config/constants';
//import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { getConfigurationKey } from '../../../helper';

function RunSimulationDrawer(props) {
    const { objs, masterId, simulationTechnologyId, vendorId, tokenNo } = props
    console.log(masterId,"MASTER")

    const { register, control, formState: { errors }, handleSubmit, setValue, getValues, reset, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })






    const dispatch = useDispatch()

    const [multipleHeads, setMultipleHeads] = useState([])
    const [opposite, setIsOpposite] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedData, setSelectedData] = useState([])
    const [provisionalCheck, setProvisionalCheck] = useState(false)

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
            if (ind !== -1) {
                temp.splice(ind, 1)
            }
        } else {
            temp.push({ SimulationApplicabilityName: elementObj.Text, SimulationApplicabilityId: elementObj.Value })
            temp1.push(elementObj.Text)
        }
        setMultipleHeads(temp)
        setSelectedData(temp1)
        setIsOpposite(!opposite)
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

    const SimulationRun = () => {

        let obj = {}

        const Overhead = selectedData.includes("Overhead")
        const Profit = selectedData.includes("Profit")
        const Rejection = selectedData.includes("Rejection")
        const DiscountOtherCost = selectedData.includes("Discount And Other Cost")
        const PaymentTerms = selectedData.includes("Payment Terms")
        const Inventory = selectedData.includes("Inventory")
        let temp = []
        obj.IsOverhead = Overhead
        obj.IsProfit = Profit
        obj.IsRejection = Rejection
        obj.IsInventory = Inventory
        obj.IsPaymentTerms = PaymentTerms
        obj.IsDiscountAndOtherCost = DiscountOtherCost
        // obj.IsProvisional = provisionalCheck
        // obj.LinkingTokenNumber = linkingTokenNumber != '' ? linkingTokenNumber : tokenNo
        temp.push(obj)
        switch (Number(masterId)) {
            case Number(EXCHNAGERATE):
                dispatch(runSimulationOnSelectedExchangeCosting({ ...objs, EffectiveDate: moment(selectedDate).local().format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                    if (res.data.Result) {
                        toastr.success('Simulation process has been run successfully.')
                        runSimulationCosting()
                    }
                }))
                break;
            case Number(COMBINED_PROCESS):
                dispatch(runSimulationOnSelectedCombinedProcessCosting({ ...objs, EffectiveDate: moment(selectedDate).local().format('YYYY/MM/DD HH:mm'), IsProvisional: provisionalCheck, SimulationApplicability: temp }, (res) => {
                 console.log(res.data.Result,'resdsd')
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
            default:
                break;
        }
        // runSimulationCosting()                       ///remove this
    }

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
                                <form noValidate className="form" onSubmit={handleSubmit(SimulationRun)}>
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
                                                masterId !== EXCHNAGERATE && applicabilityHeadListSimulation && applicabilityHeadListSimulation.map((el, i) => {
                                                    if (el.Value === '0') return false;
                                                    return (
                                                        <Col md="12" className="mb-3 p-0">
                                                            <div class="custom-check1 d-inline-block">
                                                                <label
                                                                    className="custom-checkbox mb-0"
                                                                    onChange={() => handleApplicabilityChange(el)}
                                                                >
                                                                    {el.Text}

                                                                    <input
                                                                        type="checkbox"
                                                                        value={"All"}
                                                                        // disabled={true}
                                                                        checked={IsAvailable(el.Value)}
                                                                    />
                                                                    <span
                                                                        className=" before-box"
                                                                        checked={IsAvailable(el.Value)}
                                                                        onChange={() => handleApplicabilityChange(el)}
                                                                    />
                                                                </label>


                                                            </div>

                                                        </Col>
                                                    )
                                                })
                                            }



                                            {getConfigurationKey().IsProvisionalSimulation && (
                                                <div className="input-group mb-3 col-md-12 px-0 ">

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

                                        </Col>

                                    </Row>



                                    <Row className="sf-btn-footer no-gutters justify-content-between mt-4 mr-0">
                                        <div className="col-md-12 ">
                                            <div className="text-right px-2">
                                                <button type="submit" className="user-btn mr5 save-btn">
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

