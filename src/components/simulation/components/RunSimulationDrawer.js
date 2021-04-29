import React, { Component, useState } from 'react';
import { Container, Row, Col, } from 'reactstrap';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import { Controller, useForm } from 'react-hook-form';
// import { runSimulation } from '../actions/Simulation'
import { useDispatch } from 'react-redux';
import CostingSimulation from './CostingSimulation';


function RunSimulationDrawer(props) {


    const [isProfitChecked, setIsProfitChecked] = useState(false)
    const [isOverheadChecked, setIsOverheadChecked] = useState(false)
    const [isICCChecked, setIsICCChecked] = useState(false)
    const [isRejectionChecked, setIsRejectionChecked] = useState(false)
    const [isPaymentChecked, setIsPaymentChecked] = useState(false)
    const [isCostingPage, setIsCostingPage] = useState(false)

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

    const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()

    const handleProfitChange = () => {
        setIsProfitChecked(!isProfitChecked)
    }

    const handleOverheadChange = () => {
        setIsOverheadChecked(!isOverheadChecked)
    }

    const handleICCChange = () => {
        setIsICCChecked(!isICCChecked)
    }

    const handleRejectionChange = () => {
        setIsRejectionChecked(!isRejectionChecked)
    }

    const handlePaymentChange = () => {
        setIsPaymentChecked(!isPaymentChecked)
    }

    const onSubmit = () => {
        let obj = {}
        obj.ProfitChange = isProfitChecked
        obj.RejectionChange = isRejectionChecked
        obj.IccChange = isICCChecked
        obj.OverheadChange = isOverheadChecked
        obj.PaymentChange = isPaymentChecked
        // dispatch(runSimulation(obj, (res) => {
        //     if (res.data.Result) {
        //         toastr.success('Simulation process has been run successfully.')
        //     }
        // }))
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
                                <label
                                    className="custom-checkbox"
                                    onChange={handleProfitChange}
                                >
                                    {'Profit'}
                                    <input
                                        type="checkbox"
                                        value={"All"}
                                        checked={isProfitChecked}
                                    />
                                    <span
                                        className=" before-box"
                                        checked={isProfitChecked}
                                        onChange={handleProfitChange}
                                    />
                                </label>
                                <label
                                    className="custom-checkbox"
                                    onChange={handleOverheadChange}
                                >
                                    {'Overhead'}
                                    <input
                                        type="checkbox"
                                        value={"All"}
                                        checked={isOverheadChecked}
                                    />
                                    <span
                                        className=" before-box"
                                        checked={isOverheadChecked}
                                        onChange={handleOverheadChange}
                                    />
                                </label>
                                <label
                                    className="custom-checkbox"
                                    onChange={handleICCChange}
                                >
                                    {'ICC'}
                                    <input
                                        type="checkbox"
                                        value={"All"}
                                        checked={isICCChecked}
                                    />
                                    <span
                                        className=" before-box"
                                        checked={isICCChecked}
                                        onChange={handleICCChange}
                                    />
                                </label>
                                <label
                                    className="custom-checkbox"
                                    onChange={handleRejectionChange}
                                >
                                    {'Rejection'}
                                    <input
                                        type="checkbox"
                                        value={"All"}
                                        checked={isRejectionChecked}
                                    />
                                    <span
                                        className=" before-box"
                                        checked={isRejectionChecked}
                                        onChange={handleRejectionChange}
                                    />
                                </label>
                                <label
                                    className="custom-checkbox"
                                    onChange={handlePaymentChange}
                                >
                                    {'Payment Terms'}
                                    <input
                                        type="checkbox"
                                        value={"All"}
                                        checked={isPaymentChecked}
                                    />
                                    <span
                                        className=" before-box"
                                        checked={isPaymentChecked}
                                        onChange={handlePaymentChange}
                                    />
                                </label>
                            </form>
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-md-12 pl-3 pr-3">
                                    <div className="text-right ">
                                        <button onClick={runSimulationCosting} type="submit" className="user-btn mr5 save-btn">
                                            <div className={"Run"}>
                                            </div>{" "}
                                            {"RUN SIMULATION"}
                                        </button>
                                        <button className="cancel-btn mr-2" type={"button"} onClick={toggleDrawer} >
                                            <div className={"cross-icon"}>
                                                <img src={require("../../../assests/images/times.png")} alt="cancel-icon.jpg" />
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