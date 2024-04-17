import React, { Fragment, useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import Button from '../../layout/Button';
import { Controller, useForm } from 'react-hook-form';
import { SearchableSelectHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { handleDepartmentHeader } from '../../../helper';

const ApproveRejectDrawer = (props) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const [showPopup, setShowPopup] = useState(false)

    const [isDisable, setIsDisable] = useState(false)

    const { register, control, formState: { errors }, handleSubmit } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    useEffect(() => {
        // Dispatch any necessary actions
    }, [dispatch]);

    const toggleDrawer = (event) => {
        if (!props.isDisable && event.type !== 'keydown' && event.key !== 'Tab' && event.key !== 'Shift') {
            props.closeDrawer('', 'Cancel');
        }
    };

    const onSubmit = () => {
        props.closeDrawer('', 'Cancel');
        history.push('/supplier-management/approval-listing');
    };
    const showPopupWrapper = () => {
        setShowPopup(true)
    }
    return (
        <Fragment>
            <Drawer anchor={props.anchor} open={props.isOpen}>
                <div className="container">
                    <div className={"drawer-wrapper layout-width-400px"}>
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper right"}>
                                    <h3>{props.type === "Approve" ? "Send for Approval" : "Send for Rejection"}</h3>
                                </div>
                                <div onClick={toggleDrawer} disabled={props.isLoader} className={"close-button right"}></div>
                            </Col>
                        </Row>
                        {props.type === "Approve" && (
                            <Row>
                                <Col md="12">
                                    <div className="input-group form-group col-md-12 input-withouticon">
                                        <SearchableSelectHookForm
                                            label={`${handleDepartmentHeader()}`}
                                            name={"dept"}
                                            placeholder={"Select"}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: true }}
                                            register={register}
                                            defaultValue={""}
                                            mandatory={true}
                                            errors={errors.dept}
                                        />
                                    </div>
                                    <SearchableSelectHookForm
                                        label="Approver"
                                        name="approver"
                                        placeholder="Select"
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue=""
                                        mandatory={true}
                                    />
                                </Col>
                            </Row>
                        )}
                        <Row>
                            <Col md="12">
                                <TextAreaHookForm
                                    label="Remarks"
                                    name="remarks"
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={props.rejectDrawer}
                                    handleChange={() => { }}
                                    defaultValue=""
                                    className=""
                                    customClassName="withBorder"
                                    errors={errors.remarks}
                                    disabled={false}
                                />
                            </Col>
                        </Row>
                        <Row className="sf-btn-footer no-gutters justify-content-between">
                            <div className="col-sm-12 text-right bluefooter-butn">
                                <button
                                    type={'button'}
                                    className="reset mr15 cancel-btn"
                                    onClick={toggleDrawer}
                                    disabled={isDisable}
                                >
                                    <div className={'cancel-icon'}></div>
                                    {'Cancel'}
                                </button>

                                <button
                                    type="button"
                                    className="submit-button  save-btn"
                                    onClick={onSubmit}
                                    disabled={isDisable}
                                // disabled={isDisable || isDisableSubmit}                     //RE
                                >
                                    <div className={'save-icon'}></div>
                                    {'Submit'}
                                </button>
                            </div>
                        </Row>
                    </div>
                </div>
            </Drawer>
        </Fragment>
    );
};

export default ApproveRejectDrawer;
