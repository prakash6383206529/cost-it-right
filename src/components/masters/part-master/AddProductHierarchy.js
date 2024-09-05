import { Drawer } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { SearchableSelectHookForm, TextFieldHookForm } from "../../layout/HookFormInputs";
import { Controller, useForm } from "react-hook-form";
import { checkWhiteSpaces, levelDropdown, loggedInUserId, maxLength80, required } from "../../../helper";
import { useDispatch, useSelector } from "react-redux";
import { getAllProductLevels, createProductLevels } from "../actions/Part";
import Toaster from "../../common/Toaster";

const AddProductHierarchy = (props) => {
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control, } = useForm({
        mode: "onChange",
        reValidateMode: "onChange",
    });
    const [state, setState] = useState({
        levelCount: 0,
    })
    const dispatch = useDispatch()
    const { productHierarchyData } = useSelector((state) => state.part);
    useEffect(() => {
        dispatch(getAllProductLevels(() => { }))
    }, [])
    useEffect(() => {
        if (productHierarchyData.length > 0) {
            setValue('Levels', { label: `Level-${productHierarchyData.length}`, value: productHierarchyData.length })
            productHierarchyData.map((item, index) => setValue(`LevelName${index + 1}`, item?.LevelName))
            setState((prevState) => ({ ...prevState, levelCount: productHierarchyData.length }));
        }
    }, [productHierarchyData])
    const handleLevelSelection = (e) => {
        setState((prevState) => ({ ...prevState, levelCount: e?.value }))
        for (let i = 1; i <= e?.value; i++) {
            setValue(`LevelName${i}`, '')
        }
        setValue(`LevelName${e?.value}`, 'SKU')
    }
    const submit = (data) => {
        let ProductLevels = []
        for (let i = 1; i <= state.levelCount; i++) {
            ProductLevels.push({
                LevelId: i,
                LevelName: data[`LevelName${i}`],
                ParentLevelId: i > 1 ? i - 1 : null
            });
        }
        const requestedData = {
            TotalLevel: state.levelCount,
            ProductLevels: ProductLevels,
            LoggedInUserId: loggedInUserId()
        }
        dispatch(createProductLevels(requestedData, (res) => {
            Toaster.success("Level create successfully")
        }))
        props.toggle()
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
                            Add Hierarchy
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
                        <Col md="12">
                            <SearchableSelectHookForm
                                label={"Select level"}
                                name={"Levels"}
                                placeholder={"Select"}
                                Controller={Controller}
                                control={control}
                                rules={{ required: true }}
                                register={register}
                                defaultValue={""}
                                options={levelDropdown(10)}
                                mandatory={true}
                                handleChange={(e) => handleLevelSelection(e)}
                                errors={errors.Levels}
                                disabled={productHierarchyData.length > 0}
                            />
                        </Col>
                    </Row>
                    <Row>
                        {Array.from({ length: state.levelCount }, (_, i) => (
                            <Col md="6" key={i}>
                                <TextFieldHookForm
                                    label={`Level ${i + 1}`}
                                    name={`LevelName${i + 1}`}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    rules={{
                                        required: true,
                                        validate: { required, checkWhiteSpaces, maxLength80 },
                                    }}
                                    handleChange={() => { }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors[`LevelName${i + 1}`]}
                                    disabled={(i === state.levelCount - 1) || productHierarchyData.length > 0}
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
                            >
                                <div className={"cancel-icon"}></div>
                                {"Cancel"}
                            </button>
                            <button
                                type="submit"
                                className="user-btn save-btn"
                                disabled={productHierarchyData.length > 0}
                            >
                                <div className={"save-icon"}></div>
                                {"Save"}
                            </button>
                        </Col>
                    </Row>
                </div>
            </form>
        </div>
    </Drawer></div>;
};

export default AddProductHierarchy;