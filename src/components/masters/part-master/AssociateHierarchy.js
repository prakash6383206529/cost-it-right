import { Drawer } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { SearchableSelectHookForm, TextFieldHookForm } from "../../layout/HookFormInputs";
import { Controller, useForm } from "react-hook-form";
import { checkWhiteSpaces, levelDropdown, loggedInUserId, maxLength80, required } from "../../../helper";
import { useDispatch, useSelector } from "react-redux";
import { createProductLevels, createProductLevelValues, getAllProductLevels } from "../actions/Part";
import Button from "../../layout/Button";

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
        selectedDropdownValue: null
    })
    const dispatch = useDispatch()
    const { productHierarchyData, getProductLabels } = useSelector((state) => state.part);
    useEffect(() => {
        dispatch(getAllProductLevels(() => { }))
    }, [])
    useEffect(() => {
        if (productHierarchyData.length > 0) {
            const levelNames = []
            productHierarchyData.map((item, index) => levelNames.push(item.LevelName))
            setState((prevState) => ({ ...prevState, levelCount: levelNames.length, levelNames: levelNames }));
        }
    }, [productHierarchyData])
    const submit = (data) => {
        // dispatch(createProductLevels(data))
        props.toggle()
    }
    const renderListing = (field) => {
        let temp = [];
        if (productHierarchyData.length > 0) {
            productHierarchyData.map((item) => {
                if (field.LevelName === item.LevelName) {
                    item.ProductLevelValue && item.ProductLevelValue.map((item) => {
                        temp.push({ label: item.LevelValue, value: item.LevelValueId, LevelId: item.LevelId })
                    })
                }
            })
        }
        // getProductLabels[field] && getProductLabels[field].map((item) => {
        //     temp.push({ label: item.label, value: item.label })
        // })
        return temp;
    }
    const addData = (field, i) => {
        console.log('field: ', field);
        if (field.LevelName === state.levelNames[i]) {
            setState((prevState) => ({ ...prevState, isOpenDrawer: true, labelName: field.LevelName, levelData: field }));
            setValueAddLabels(`${field.LevelName}`, '');
        }
    }
    const cancelDrawer = () => {
        setState((prevState) => ({ ...prevState, isOpenDrawer: false, labelName: '', levelData: {} }));
    }
    const addNewlabels = (data) => {
        console.log(state.selectedDropdownValue, "state.selectedDropdownValue");
        const isSameLevelDataSelected = state.selectedDropdownValue ? state.selectedDropdownValue.LevelId === state.levelData.LevelId - 1 : false
        const finalDataSubmit = {
            LevelId: state.levelData.LevelId,
            LevelValue: data[state.labelName],
            LevelValueId: (state.selectedDropdownValue && isSameLevelDataSelected) ? state.selectedDropdownValue.value : null,
            LoggedInUserId: loggedInUserId(),
        }
        console.log(finalDataSubmit, "finalDataSubmit");
        // dispatch(createProductLevelValues(finalDataSubmit, () => {
        //     dispatch(getAllProductLevels(() => { }))
        // }))
        cancelDrawer()
    }
    const handleLevelChange = (e, item) => {
        const selectedValue = {
            ...e,
            LevelId: item.LevelId,
        }
        setState((prevState) => ({ ...prevState, selectedDropdownValue: selectedValue }));
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
                        onClick={() => { props.toggle() }}
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
                        {productHierarchyData.map((item, i) => i !== productHierarchyData.length - 1 && (
                            <Col md="12" className="d-flex" key={i}>
                                <SearchableSelectHookForm
                                    label={item.LevelName}
                                    name={item.LevelName}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: true }}
                                    register={register}
                                    defaultValue={""}
                                    options={renderListing(item, i)}
                                    mandatory={true}
                                    handleChange={(e) => handleLevelChange(e, item)}
                                    errors={errors[item.LevelName]}
                                />
                                <Button
                                    id="RawMaterialName-add"
                                    className="mt40 right"
                                    variant="plus-icon-square"
                                    onClick={() => addData(item, i)}
                                />
                            </Col>
                        ))}
                    </Row>
                    <Row className="sf-btn-footer no-gutters justify-content-between px-3">
                        <Col md="12" className="d-flex justify-content-end">
                            <button
                                type={"button"}
                                className=" mr15 cancel-btn"
                                onClick={props.toggle}
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
                                    label={state.labelName}
                                    name={state.labelName}
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
                                    errors={errorsAddLabels[state.labelName]}
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