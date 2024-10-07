import React, { useState } from 'react';
import { HAVELLSREMARKMAXLENGTH } from '../../config/masterData';
import { Controller, useForm } from 'react-hook-form';
import { Drawer } from '@material-ui/core';
import { Container, Row, Col } from 'reactstrap';
import { TextAreaHookForm } from '../layout/HookFormInputs';
import TooltipCustom from './Tooltip';
import LoaderCustom from './LoaderCustom';

const RemarkFieldDrawer = ({
    isOpen,
    anchor,
    cancelHandler,
    title = "Send For Review",
    label = "Remark",
    tooltipText = "Add relevant remark before submitting the quotation for review.",
    onSubmitHandler,
}) => {
    const { register, formState: { errors }, control, handleSubmit } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const [loading, setLoading] = useState(false);

    const onSubmit = (values) => {
        setLoading(true);
        onSubmitHandler(values)
        setLoading(false)
        cancelHandler()
    };

    return (
        <Drawer anchor={anchor} open={isOpen} onClose={cancelHandler}>
            <Container>
                <div className={'drawer-wrapper layout-min-width-400px'}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper left"}>
                                    <h3>{title}</h3>
                                </div>
                            </Col>
                        </Row>
                        <Row className="pl-3">
                            <Col md="12">
                                <TooltipCustom
                                    id="remark_tooltip"
                                    tooltipText={tooltipText}
                                />
                                {loading ? (
                                    <LoaderCustom customClass="loader-center" />
                                ) : (
                                    <TextAreaHookForm
                                        label={label}
                                        name={"remark"}
                                        placeholder={"Type here..."}
                                        Controller={Controller}
                                        control={control}
                                        rules={{
                                            required: true,
                                            maxLength: HAVELLSREMARKMAXLENGTH,
                                        }}
                                        mandatory={true}
                                        register={register}
                                        handleChange={() => { }}
                                        errors={errors?.remark}
                                        customClassName={"withBorder"}
                                        rowHeight={6}

                                    />
                                )}
                            </Col>
                        </Row>
                        <Row className="no-gutters justify-content-between">
                            <Col className="text-right">
                                <button
                                    id="Cancel"
                                    onClick={cancelHandler}
                                    type="button"
                                    value="CANCEL"
                                    className="mr15 cancel-btn"
                                >
                                    <div className={"cancel-icon"}></div>
                                    CANCEL
                                </button>
                                <button
                                    id="Save"
                                    type="submit"
                                    className="user-btn save-btn"
                                >
                                    <div className={"save-icon"}></div>
                                    SUBMIT
                                </button>
                            </Col>
                        </Row>
                    </form>
                </div>
            </Container>
        </Drawer>
    );
};
// RemarkFieldDrawer.defaultProps = {
//     isOpen: null,
//     anchor: null,
//     cancelHandler: null,
//     title: "Send For Review",
//     label:  "Remark",
//     tooltipText: null,
//     onSubmitHandler: null
// };
export default RemarkFieldDrawer;
