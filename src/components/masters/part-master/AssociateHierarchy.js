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
import LoaderCustom from "../../common/LoaderCustom";
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
    const { productHierarchyData, storedHierarachyData, loading } = useSelector((state) => state.part);
    console.log(productHierarchyData, "productHierarchyData")
    useEffect(() => {
        dispatch(getAllProductLevels(() => {
            storedHierarachyData.map(item => setValue(`ProductHierarchyName${item?.ProductHierarchyId}`, { label: item?.ProductHierarchyValue, value: item?.ProductHierarchyValueDetailsId, ProductHierarchyId: item?.ProductHierarchyId }))
        }))

    }, [])
    useEffect(() => {
        if (productHierarchyData.length > 0) {
            const levelNames = []
            productHierarchyData.map((item, index) => levelNames.push(item?.ProductHierarchyName))
            setState((prevState) => ({ ...prevState, levelCount: levelNames.length, levelNames: levelNames }));
        }
    }, [productHierarchyData])
    const submit = (data) => {
        const valueId = state[`ProductHierarchyName${state.levelCount - 1}`]
        let sendData = []
        for (let i = 1; i <= state.levelCount - 1; i++) {
            let temp = data[`ProductHierarchyName${i}`]
            sendData.push({ ProductHierarchyId: temp?.ProductHierarchyId, ProductHierarchyValueDetailsId: temp?.value, ProductHierarchyValue: temp?.label })
        }
        dispatch(storeHierarchyData(sendData))
        props.toggle(valueId)
    }
    const renderListing = (field) => {
        let temp = [];
        if (productHierarchyData.length > 0) {
            productHierarchyData.map((item) => {
                if (field?.ProductHierarchyName === item?.ProductHierarchyName) {

                    item?.ProductHierarchyValueDetail && item?.ProductHierarchyValueDetail?.map((el) => {

                        if (el?.ProductHierarchyId === 1) {
                            temp.push({ label: el?.ProductHierarchyValue, value: el?.ProductHierarchyValueDetailsId, ProductHierarchyId: el?.ProductHierarchyId })
                        } else if (state[`ProductHierarchyName${el?.ProductHierarchyId - 1}`] && (state[`ProductHierarchyName${el?.ProductHierarchyId - 1}`]?.value === el?.ParentProductHierarchyValueDetailsId)) {
                            temp.push({ label: el?.ProductHierarchyValue, value: el?.ProductHierarchyValueDetailsId, ProductHierarchyId: el?.ProductHierarchyId })
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
        if (field?.ProductHierarchyName === state?.levelNames[i]) {
            setState((prevState) => ({ ...prevState, isOpenDrawer: true, labelName: field?.ProductHierarchyName, levelData: field }));
            setValueAddLabels(`${field?.ProductHierarchyName}`, '');
        }
    }
    const cancelDrawer = () => {
        setState((prevState) => ({ ...prevState, isOpenDrawer: false, labelName: '', levelData: {} }));
    }
    const addNewlabels = (data) => {
        const finalDataSubmit = {
            ProductHierarchyId: state.levelData?.ProductHierarchyId,
            ProductHierarchyValue: data[state?.labelName],
            ProductHierarchyValueDetailsId: state[`ProductHierarchyName${state.levelData?.ProductHierarchyId - 1}`] ? state[`ProductHierarchyName${state.levelData?.ProductHierarchyId - 1}`]?.value : null,
            LoggedInUserId: loggedInUserId(),
        }
        dispatch(createProductLevelValues(finalDataSubmit, (res) => {
            if (res && res.data && res.data.Result) {
                Toaster.success("Level values create successfully")
                dispatch(getAllProductLevels((response) => {
                    if (response && response.data && response.data.DataList) {
                        const Data = response.data.DataList[state.levelData?.ProductHierarchyId - 1]
                        const filteredData = Data && Data?.ProductHierarchyValueDetail && Data?.ProductHierarchyValueDetail?.filter(item => item?.ProductHierarchyValue === data[state?.labelName])
                        console.log(filteredData, "filteredData")
                        const setData = { label: filteredData[0]?.ProductHierarchyValue, value: filteredData[0]?.ProductHierarchyValueDetailsId, ProductHierarchyId: filteredData[0]?.ProductHierarchyId }
                        setValue(`ProductHierarchyName${state.levelData?.ProductHierarchyId}`, setData)
                        setState((prevState) => ({ ...prevState, [`ProductHierarchyName${state.levelData?.ProductHierarchyId}`]: setData, selectedDropdownValue: setData }));
                        cancelDrawer()
                    }
                }))
            }

        }))

    }

    const handleLevelChange = (e, item) => {
        const selectedValue = {
            ...e,
            ProductHierarchyId: item?.ProductHierarchyId,
        }
        setState((prevState) => ({ ...prevState, selectedDropdownValue: selectedValue, [`ProductHierarchyName${item?.ProductHierarchyId}`]: selectedValue }));
        for (let i = 1; i <= state.levelCount - 1; i++) {
            if (item?.ProductHierarchyId < i + 1) {
                setValue(`ProductHierarchyName${i}`, null)
            }
        }
    }
    const disabledDropdown = (item, index) => {
        if (props.isViewMode) {
            return true;
        } else if (index === 0) {
            return false;
        } else {
            if (state.selectedDropdownValue && (state.selectedDropdownValue?.ProductHierarchyId + 1) > index) {
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
            {loading && <LoaderCustom customClass="mb-n2" />}
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
                                    label={item?.ProductHierarchyName}
                                    name={`ProductHierarchyName${item?.ProductHierarchyId}`}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={control}
                                    rules={{ required: true }}
                                    register={register}
                                    defaultValue={""}
                                    options={renderListing(item, i)}
                                    mandatory={true}
                                    handleChange={(e) => handleLevelChange(e, item)}
                                    errors={errors[`ProductHierarchyName${item?.ProductHierarchyId}`]}
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