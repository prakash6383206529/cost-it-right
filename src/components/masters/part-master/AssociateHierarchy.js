import { Drawer } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { SearchableSelectHookForm, TextFieldHookForm } from "../../layout/HookFormInputs";
import { Controller, useForm } from "react-hook-form";
import { checkWhiteSpaces, loggedInUserId, maxLength80, required } from "../../../helper";
import { useDispatch, useSelector } from "react-redux";
import { createProductLevelValues, getAllProductLevels, storeHierarchyData } from "../actions/Part";
import Button from "../../layout/Button";
import Toaster from "../../common/Toaster";
import NoContentFound from "../../common/NoContentFound";
const AssociateHierarchy = (props) => {
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control, } = useForm({
        mode: "onChange",
        reValidateMode: "onChange",
    });
    const {
        register: registerAddLabels,
        handleSubmit: handleSubmitAddLabels,
        control: controlAddLabels,
        setValue: setValueAddLabels,
        getValues: getValuesAddLabels,
        formState: { errors: errorsAddLabels },
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const [state, setState] = useState({
        levelCount: 0,
        levelNames: [],
        isOpenDrawer: false,
        labelName: '',
        levelData: {},
        selectedDropdownValue: null,
        isLoader: false
    })
    const dispatch = useDispatch()
    const { productHierarchyData, storedHierarachyData } = useSelector((state) => state.part);
    useEffect(() => {
        dispatch(getAllProductLevels(() => {
            storedHierarachyData.map(item => setValue(`LevelName${item?.LevelId}`, { label: item?.LevelValue, value: item?.LevelValueId, LevelId: item?.LevelId }))
        }))

    }, [])
    useEffect(() => {
        if (productHierarchyData.length > 0) {
            const levelNames = []
            productHierarchyData.map((item, index) => levelNames.push(item?.LevelName))
            setState((prevState) => ({ ...prevState, levelCount: levelNames.length, levelNames: levelNames }));
        }
    }, [productHierarchyData])
    const submit = (data) => {
        const valueId = state[`LevelName${state.levelCount - 1}`]?.value
        let sendData = []
        for (let i = 1; i <= state.levelCount - 1; i++) {
            let temp = data[`LevelName${i}`]
            sendData.push({ LevelId: temp?.LevelId, LevelValueId: temp?.value, LevelValue: temp?.label })
        }
        dispatch(storeHierarchyData(sendData))
        props.toggle(valueId)
    }
    const renderListing = (field) => {
        let temp = [];
        if (productHierarchyData.length > 0) {
            productHierarchyData.map((item) => {
                if (field?.LevelName === item?.LevelName) {

                    item?.ProductLevelValue && item?.ProductLevelValue?.map((el) => {

                        if (el?.LevelId === 1) {
                            temp.push({ label: el?.LevelValue, value: el?.LevelValueId, LevelId: el?.LevelId })
                        } else if (state[`LevelName${el?.LevelId - 1}`] && (state[`LevelName${el?.LevelId - 1}`]?.value === el?.ParentLevelValueId)) {
                            temp.push({ label: el?.LevelValue, value: el?.LevelValueId, LevelId: el?.LevelId })
                        }
                        return null;
                    })
                }
                return null;
            })
        }
        return temp;
    }
    const addData = (field, i) => {
        if (field?.LevelName === state?.levelNames[i]) {
            setState((prevState) => ({ ...prevState, isOpenDrawer: true, labelName: field?.LevelName, levelData: field }));
            setValueAddLabels(`${field?.LevelName}`, '');
        }
    }
    const cancelDrawer = () => {
        setState((prevState) => ({ ...prevState, isOpenDrawer: false, labelName: '', levelData: {} }));
    }
    const addNewlabels = (data) => {
        const finalDataSubmit = {
            LevelId: state.levelData?.LevelId,
            LevelValue: data[state?.labelName],
            LevelValueId: state[`LevelName${state?.LevelId - 1}`] ? state[`LevelName${state?.LevelId - 1}`]?.value : null,
            LoggedInUserId: loggedInUserId(),
        }
        dispatch(createProductLevelValues(finalDataSubmit, (res) => {
            Toaster.success("Level values create successfully")
            dispatch(getAllProductLevels(() => { }))

        }))
        cancelDrawer()
    }
    const handleLevelChange = (e, item) => {
        const selectedValue = {
            ...e,
            LevelId: item?.LevelId,
        }
        setState((prevState) => ({ ...prevState, selectedDropdownValue: selectedValue, [`LevelName${item?.LevelId}`]: selectedValue }));
        for (let i = 1; i <= state.levelCount - 1; i++) {
            if (item?.LevelId < i + 1) {
                setValue(`LevelName${i}`, {})
            }
        }
    }
    const disabledDropdown = (item, index) => {
        if (props.isViewMode) {
            return true;
        } else if (index === 0) {
            return false;
        } else {
            if (state.selectedDropdownValue && (state.selectedDropdownValue?.LevelId + 1) > index) {
                return false;
            } else {
                return true;
            }
        }
    }
    return <div><Drawer
        anchor={"right"}
        open={props.isOpen}
    >
        <div className={"drawer-wrapper spec-drawer"}>
            <Row className="drawer-heading">
                <Col>
                    <div className={"header-wrapper left"}>
                        <h3>
                            Associate Hierarchy
                        </h3>
                    </div>
                    <div
                        onClick={() => { props.toggle(null) }}
                        className={"close-button right"}
                    ></div>
                </Col>
            </Row>
            <form
                noValidate
                className="form"
                onSubmit={handleSubmit(submit)}
            >
                <div className="px-2">
                    <Row>
                        {productHierarchyData.length !== 0 ? productHierarchyData.map((item, i) => i !== productHierarchyData.length - 1 && (
                            <Col md="12" className="d-flex" key={i}>
                                <SearchableSelectHookForm
                                    label={item?.LevelName}
                                    name={`LevelName${item?.LevelId}`}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: true }}
                                    register={register}
                                    defaultValue={""}
                                    options={renderListing(item, i)}
                                    mandatory={true}
                                    handleChange={(e) => handleLevelChange(e, item)}
                                    errors={errors[item?.LevelName]}
                                    disabled={disabledDropdown(item, i)}
                                />
                                <Button
                                    id={`AssociateHierarchy${i}`}
                                    className="mt40 right"
                                    variant="plus-icon-square"
                                    onClick={() => addData(item, i)}
                                    disabled={disabledDropdown(item, i)}
                                />
                            </Col>
                        )) : <NoContentFound title="No Product Hierarchy Added" />}
                    </Row>
                    <Row className="sf-btn-footer no-gutters justify-content-between px-3">
                        <Col md="12" className="d-flex justify-content-end">
                            <button
                                type={"button"}
                                className=" mr15 cancel-btn"
                                onClick={() => props.toggle(null)}
                            // disabled={setDisable}
                            >
                                <div className={"cancel-icon"}></div>
                                {"Cancel"}
                            </button>
                            {(productHierarchyData.length !== 0 && !props.isViewMode) && <button
                                type="submit"
                                className="user-btn save-btn"
                            // disabled={setDisable}
                            >
                                <div className={"save-icon"}></div>
                                {"Save"}
                            </button>}
                        </Col>
                    </Row>
                </div>
            </form>
        </div>
    </Drawer>
        {state.isOpenDrawer && <Drawer
            anchor={"right"}
            open={state.isOpenDrawer}
        >
            <div className={"drawer-wrapper spec-drawer"}>
                <Row className="drawer-heading">
                    <Col>
                        <div className={"header-wrapper left"}>
                            <h3>
                                Add {state.labelName}
                            </h3>
                        </div>
                        <div
                            onClick={cancelDrawer}
                            className={"close-button right"}
                        ></div>
                    </Col>
                </Row>
                <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmitAddLabels(addNewlabels)}
                >
                    <div className="px-2">
                        <Row>
                            <Col md="12" >
                                <TextFieldHookForm
                                    label={state?.labelName}
                                    name={state?.labelName}
                                    Controller={Controller}
                                    control={controlAddLabels}
                                    register={registerAddLabels}
                                    mandatory={true}
                                    rules={{
                                        required: true,
                                        validate: { required, checkWhiteSpaces, maxLength80 },
                                    }}
                                    handleChange={() => { }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errorsAddLabels[state?.labelName]}
                                    disabled={false}
                                />

                            </Col>
                        </Row>
                        <Row className="sf-btn-footer no-gutters justify-content-between px-3">
                            <Col md="12" className="d-flex justify-content-end">
                                <button
                                    type={"button"}
                                    className=" mr15 cancel-btn"
                                    onClick={cancelDrawer}
                                // disabled={setDisable}
                                >
                                    <div className={"cancel-icon"}></div>
                                    {"Cancel"}
                                </button>
                                <button
                                    type="submit"
                                    className="user-btn save-btn"
                                // disabled={setDisable}
                                >
                                    <div className={"save-icon"}></div>
                                    {"Save"}
                                </button>
                            </Col>
                        </Row>
                    </div>
                </form>
            </div>
        </Drawer>}
    </div>;
};

export default AssociateHierarchy;