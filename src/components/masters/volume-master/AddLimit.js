import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col } from "reactstrap";
import Drawer from "@material-ui/core/Drawer";

import { getCostingSpecificTechnology, getPartSelectListByTechnology } from "../../costing/actions/Costing";
import axios from "axios";
import { NumberFieldHookForm, SearchableSelectHookForm } from "../../layout/HookFormInputs";
import { loggedInUserId } from "../../../helper";

const AddLimit = (props) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        getValues,
        reset,
        control,
    } = useForm();

    const [technology, setTechnology] = useState([]);
    const [data, setData] = useState([]);
    const [regularization, setRegularization] = useState([]);
    const [deviation, setDeviation] = useState([]);


    const [IsTechnologySelected, setIsTechnologySelected] = useState(false);

    const dispatch = useDispatch();
    const technologySelectList = useSelector(
        (state) => state.costing.costingSpecifiTechnology
    );
    //const technologySelectList  = useSelector((state) => state.comman)

    useEffect(() => {
        setValue("Technology", "");
        setValue("Part", "");
        reset();
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
    }, []);

    /**
     * @method renderListing
     * @description Used show listing of unit of measurement
     */
    const renderListing = (label) => {
        const temp = [];
        if (label === "Technology") {
            technologySelectList &&
                technologySelectList.map((item) => {
                    if (item.Value === "0") return false;
                    temp.push({ label: item.Text, value: item.Value });
                    return null;
                });
            return temp;
        }
    };

    /**
     * @method handleTechnologyChange
     * @description  USED TO HANDLE TECHNOLOGY CHANGE
     */
    const handleTechnologyChange = (newValue, actionMeta) => {
        if (newValue && newValue !== "") {
            setTechnology(newValue);
        } else {
            setTechnology([]);
        }
    };

    /**
     * @method toggleDrawer
     * @description TOGGLE DRAWER
     */
    const toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer()
        // event.preventDefault();
        // const postData = {
        //     setRegularization,
        //     setDeviation,
        // }
        // axios.post(``, postData).then(res => {
        //     console.log(res);
        // });
    };


    /**
     * @method cancel
     * @description used to Reset form
     */
    const cancel = () => {
        setTechnology([]);
        props.closeDrawer("", {});
    };
    const onSubmit = (data) => {
        toggleDrawer("");
    };

    /**
     * @method render
     * @description Renders the component
     */
    return (
        <div>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
            // onClose={(e) => toggleDrawer(e)}
            >
                <Container>
                    <div className={"drawer-wrapper"}>
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper left"}>
                                    <h3>{"Add Limitation"}</h3>
                                </div>
                                <div onClick={cancel} className={"close-button right"}></div>
                            </Col>
                        </Row>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className="pl-3">
                                <Col md="12">
                                    <SearchableSelectHookForm
                                        label={"Technology"}
                                        name={"Technology"}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={technology.length !== 0 ? technology : ""}
                                        options={renderListing("Technology")}
                                        mandatory={true}
                                        handleChange={handleTechnologyChange}
                                        errors={errors.Technology}
                                    />
                                </Col>
                            </Row>
                            <Row className="pl-3">
                                <Col md="12">
                                    <NumberFieldHookForm
                                        label="Regularization Limit"
                                        name={"Regularization Limit"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        handleChange={() => { }}
                                        defaultValue={""}
                                        className=""
                                        customClassName={"withBorder"}
                                        errors={errors.remarks}
                                        disabled={false}
                                    />
                                </Col>
                                <Col md="12">
                                    <NumberFieldHookForm
                                        label="Max Deviation Limit (%)"
                                        name={"Max Deviation"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                value: /^\d*\.?\d*$/,
                                                message: "Invalid Number.",
                                            },
                                            max: {
                                                value: 100,
                                                message: "Should not be greater then 100",
                                            },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={""}
                                        className=""
                                        customClassName={"withBorder"}
                                        errors={errors.remarks}
                                        disabled={false}
                                    />
                                </Col>
                            </Row>
                            <Row className="justify-content-between">
                                <div className="col-sm-12 text-right">
                                    <button
                                        type={"button"}
                                        className="reset mr15 cancel-btn"
                                        onClick={cancel}
                                    >
                                        <div className={"cancel-icon"}></div>
                                        {"Cancel"}
                                    </button>

                                    <button type="submit" className="submit-button save-btn">
                                        <div class="plus"></div>
                                        {"Submit"}
                                    </button>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Container>
            </Drawer>
        </div>
    );
};

export default React.memo(AddLimit);