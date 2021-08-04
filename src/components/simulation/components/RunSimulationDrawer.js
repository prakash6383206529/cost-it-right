import React, { useState, useEffect } from 'react';
import { Container, Row, Col, } from 'reactstrap';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import { Controller, useForm } from 'react-hook-form';
// import { runSimulation } from '../actions/Simulation'
import { useDispatch, useSelector } from 'react-redux';
import CostingSimulation from './CostingSimulation';
import { runSimulationOnSelectedCosting, getSelectListOfSimulationApplicability } from '../actions/Simulation';
import { DatePickerHookForm } from '../../layout/HookFormInputs';
import moment from 'moment';

function RunSimulationDrawer(props) {
    const { objs } = props

    const { register, control, formState: { errors }, handleSubmit, setValue, getValues, reset, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })




    const dispatch = useDispatch()

    const [multipleHeads, setMultipleHeads] = useState([])
    const [opposite, setIsOpposite] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')


    useEffect(() => {
        dispatch(getSelectListOfSimulationApplicability(() => { }))
    }, [])

    const { applicabilityHeadListSimulation } = useSelector(state => state.simulation)

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
        if (temp && temp.findIndex(el => el.SimulationApplicabilityId === elementObj.Value) !== -1) {
            const ind = multipleHeads.findIndex((el) => el.SimulationApplicabilityId === elementObj.Value)
            if (ind !== -1) {
                temp.splice(ind, 1)
            }
        } else {
            temp.push({ SimulationApplicabilityName: elementObj.Text, SimulationApplicabilityId: elementObj.Value })
        }
        setMultipleHeads(temp)
        setIsOpposite(!opposite)
    }

    const IsAvailable = (id) => { }

    const SimulationRun = () => {



        //THIS IS TO CHANGE AFTER IT IS DONE FROM KAMAL SIR'S SIDE
        dispatch(runSimulationOnSelectedCosting({ ...objs, EffectiveDate: moment(selectedDate).local().format('YYYY/MM/DD HH:mm'), SimulationApplicability: [] }, (res) => {
            if (res.data.Result) {
                toastr.success('Simulation process has been run successfully.')
                runSimulationCosting()
            }
        }))
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
        <div>
            <>
                <Drawer
                    anchor={props.anchor}
                    open={props.isOpen}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    <Container>
                        <div className={"drawer-wrapper"}>
                            <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
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
                                            applicabilityHeadListSimulation && applicabilityHeadListSimulation.map((el, i) => {
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
                                        <div className="input-group form-group col-md-12 px-0">
                                            <div className="inputbox date-section">
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
                                            </div>
                                        </div>
                                    </Col>
                                </Row>


                            </form>
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-md-12 px-3">
                                    <div className="text-right px-3">
                                        <button onClick={SimulationRun} type="submit" className="user-btn mr5 save-btn">
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
                        </div>
                    </Container>
                </Drawer>
            </>

        </div>
    );
}

export default RunSimulationDrawer;
