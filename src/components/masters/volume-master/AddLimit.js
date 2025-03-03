import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col } from "reactstrap";
import Drawer from "@material-ui/core/Drawer";

import { getCostingSpecificTechnology } from "../../costing/actions/Costing";
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from "../../layout/HookFormInputs";
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId } from "../../../helper";
import Toaster from "../../common/Toaster";
import { createVolumeLimit, getVolumeLimit, updateVolumeLimit } from "../actions/Volume";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { MESSAGES } from "../../../config/message";
import { number, percentageLimitValidation, checkWhiteSpaces } from "../../../helper/validation";
import { useLabels } from "../../../helper/core";

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
    const [dataToChange, setDataToChange] = useState([]);
    const [isDisable, setIsDisable] = useState(false);
    const [showPopup, setShowPopup] = useState(false)
    const dispatch = useDispatch();
    const technologySelectList = useSelector(
        (state) => state.costing.costingSpecifiTechnology
    );
    //const technologySelectList  = useSelector((state) => state.comman)
    const { technologyLabel } = useLabels();
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
            dispatch(getVolumeLimit(newValue.value, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data
                    setValue('RegularizationLimit', Data.RegularizationLimit)
                    setValue('MaxDeviation', Data.MaxDeviationLimit)
                    setIsDisable(true)
                    setDataToChange(Data)
                }
            }))
        } else {
            setTechnology([]);
        }
    };

    const handleMaxDeviationLimit = (e) => {
        if (e.target.value > 100) {
            Toaster.warning('Max Deviation can not be greater than 100.')
            setTimeout(() => {
                setValue("MaxDeviation", '')
            }, 100);
        }
    }

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
        // axiosInstance.post(``, postData).then(res => {
        //     
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
    const cancelHandler = () => {
        // setShowPopup(true)
        cancel('cancel')
    }
    const onPopupConfirm = () => {
        cancel('cancel')
        setShowPopup(false)
    }
    const closePopUp = () => {
        setShowPopup(false)
    }
    const onSubmit = (data) => {
        if (isDisable === true) {
            let updatedData = {
                TechnologyId: technology.value,
                TechnologyName: technology.label,
                LoggedInUserId: loggedInUserId(),
                RegularizationLimit: data.RegularizationLimit,
                MaxDeviationLimit: data.MaxDeviation,
                TechnologyRegularizationLimitId: dataToChange.TechnologyRegularizationLimitId,
            }
            if (((dataToChange.MaxDeviationLimit ? String(dataToChange.MaxDeviationLimit) : '') === (data.MaxDeviation ? String(data.MaxDeviation) : '')) && ((dataToChange.RegularizationLimit ? String(dataToChange.RegularizationLimit) : '') === (data.RegularizationLimit ? String(data.RegularizationLimit) : ''))) {
                Toaster.warning("Please change data to update")
                return false
            }
            else {
                dispatch(updateVolumeLimit(updatedData, (res) => {
                    if (res?.data?.Result) {
                        Toaster.success("Limit updated successfully")
                    }
                }))
                toggleDrawer("");
            }
        }
        else {
            let formData = {
                TechnologyId: technology.value,
                LoggedInUserId: loggedInUserId(),
                RegularizationLimit: getValues('RegularizationLimit'),
                MaxDeviationLimit: getValues('MaxDeviation')
            }
            dispatch(createVolumeLimit(formData, (res) => {
                if (res?.data?.Result) {
                    Toaster.success("Limit added successfully")
                }
            }))
            toggleDrawer("");
        }
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
                                        label={technologyLabel}
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
                                        disabled={isDisable}
                                    />
                                </Col>
                            </Row>
                            <Row className="pl-3">
                                <Col md="12">
                                    <NumberFieldHookForm
                                        label="Regularization Limit"
                                        name={"RegularizationLimit"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{ required: true }}
                                        handleChange={() => { }}
                                        defaultValue={""}
                                        className=""
                                        customClassName={"withBorder"}
                                        errors={errors.RegularizationLimit}
                                        disabled={false}
                                    />
                                </Col>
                                <Col md="12">
                                    <TextFieldHookForm
                                        label="Max Deviation Limit (%)"
                                        name={"MaxDeviation"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                            max: {
                                                value: 100,
                                                message: 'Percentage cannot be greater than 100'
                                            },
                                        }}
                                        handleChange={handleMaxDeviationLimit}
                                        defaultValue={""}
                                        className=""
                                        customClassName={"withBorder"}
                                        errors={errors.MaxDeviation}
                                        disabled={false}
                                    />
                                </Col>
                            </Row>
                            <Row className="justify-content-between">
                                <div className="col-sm-12 text-right">
                                    <button
                                        type={"button"}
                                        className="reset mr15 cancel-btn"
                                        onClick={cancelHandler}
                                    >
                                        <div className={"cancel-icon"}></div>
                                        {"Cancel"}
                                    </button>

                                    <button type="submit" className="submit-button save-btn">
                                        <div class={"save-icon"}></div>
                                        {isDisable === true ? "Update" : "Submit"}
                                    </button>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Container>
            </Drawer>
            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
            }
        </div>
    );
};

export default React.memo(AddLimit);