import { Drawer } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { Col, Row } from 'reactstrap'
import { TextFieldHookForm } from '../../layout/HookFormInputs';
import { required, checkWhiteSpaces, maxLength80, loggedInUserId } from '../../../helper';
import { useDispatch } from 'react-redux';
import { getProductLabel, updateProductLabel } from '../actions/Part';
import Toaster from '../../common/Toaster';

export default function UpdateHierarchyLabels(props) {
    const { register, handleSubmit, setValue, getValues, formState: { errors }, control, } = useForm({
        mode: "onChange",
        reValidateMode: "onChange",
    });
    const dispatch = useDispatch()
    const { isOpen, Type, cancelDrawer, levelId } = props
    useEffect(() => {
        dispatch(getProductLabel(levelId, (res) => {
            if (res && res.data && res.data.Data) {
                const Data = res.data.Data
                setValue(`Level`, Data.LevelName)
            }
        }))
    }, [])
    const onSubmit = (data) => {
        const requestedData = {
            LevelId: levelId,
            LevelName: data.Level,
            LoggedInUserId: loggedInUserId()
        }
        dispatch(updateProductLabel(requestedData, res => {
            if (res && res.data && res.data.Result) {
                Toaster.success("Level update successfully")
                cancelDrawer()
            }
        }))
    }
    return (
        <div>
            {isOpen && <Drawer
                anchor={"right"}
                open={isOpen}
            >
                <div className={"drawer-wrapper spec-drawer"}>
                    <Row className="drawer-heading">
                        <Col>
                            <div className={"header-wrapper left"}>
                                <h3>
                                    {Type} Level
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
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="px-2">
                            <Row>
                                <Col md="12" >
                                    <TextFieldHookForm
                                        label={`Level ${levelId}`}
                                        name={`Level`}
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
                                        errors={errors.Level}
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
        </div>
    )
}
