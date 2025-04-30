import React, { Fragment, useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import Button from '../../layout/Button';
import { Controller, useForm } from 'react-hook-form';
import { AllApprovalField, SearchableSelectHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getConfigurationKey, handleDepartmentHeader } from '../../../helper';
import WarningMessage from '../../common/WarningMessage';

const ApproveRejectDrawer = (props) => {
    const history = useHistory();
    const [approvalDropDown, setApprovalDropDown] = useState([])

    const dispatch = useDispatch();
    const [showPopup, setShowPopup] = useState(false)
    const [showWarningMessage, setShowWarningMessage] = useState(false)

    const [isDisable, setIsDisable] = useState(false)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

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
                <Container >
                    <div className={"drawer-wrapper"}>
                        {/* {loader && <LoaderCustom customClass="approve-reject-drawer-loader" />} */}

                        <Row className="drawer-heading">
                            <Col className='px-0'>
                                <div className={"header-wrapper right d-flex justify-content-between"}>
                                    <h3>{`${props.type === 'Sender' ? 'Send For Approval' : `${props.type} Unblocking`}`}</h3>
                                    <div onClick={toggleDrawer} disabled={props.isLoader} className={"close-button right"}></div>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            {props.type === "Approve" && (

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
                                        {showWarningMessage && <WarningMessage dClass={"mr-2"} message={`There is no approver added against this ${getConfigurationKey().IsCompanyConfigureOnPlant ? 'company' : 'department'}`} />}

                                    </div>
                                    <div className="input-group form-group col-md-12 input-withouticon">
                                        {initialConfiguration?.IsMultipleUserAllowForApproval ? <>
                                            <AllApprovalField
                                                label="Approver"
                                                approverList={approvalDropDown}
                                                popupButton="View all"
                                            />
                                        </> :
                                            <SearchableSelectHookForm
                                                label="Approver"
                                                name="approver"
                                                placeholder="Select"
                                                Controller={Controller}
                                                options={approvalDropDown}

                                                control={control}
                                                rules={{ required: true }}
                                                register={register}
                                                defaultValue=""
                                                mandatory={true}
                                            />}
                                    </div>
                                </Col>

                            )}
                        </Row>

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
                </Container>
            </Drawer>
        </Fragment>
    );
};

export default ApproveRejectDrawer;
