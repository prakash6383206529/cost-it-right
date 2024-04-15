import React, { Fragment, useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
import { Drawer } from '@material-ui/core';
import LoaderCustom from '../../common/LoaderCustom';
import { AllApprovalField, SearchableSelectHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApprovalData } from '../Action';
import MasterSendForApproval from './MasterSendForApproval';
import WarningMessage from '../../common/WarningMessage';
import { handleDepartmentHeader, loggedInUserId, userDetails } from '../../../helper';

const ApprovalSummaryPage = (props) => {
    const { initialConfiguration } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const { register, control, handleSubmit, formState: { errors } } = useForm({ mode: 'onChange', reValidateMode: 'onChange' });
    const [rejectDrawer, setRejectDrawer] = useState(false);
    const [approvalDrawer, setApprovalDrawer] = useState(false);
    const [isLoader, setIsLoader] = useState(false);
    const { isFinalLevelUser } = props;
    const userData = userDetails()
    const [selectedMonth, setSelectedMonth] = useState(null);


    useEffect(() => {
        dispatch(fetchApprovalData());
    }, [dispatch]);

    const toggleDrawer = (type) => {
        if (!isLoader) {
            props.closeDrawer(type, 'Cancel');
        }
    };

    const onSubmit = (data) => {
        // Handle form submission here
    };
    const renderDropdownListing = (label) => {
        const tempDropdownList = []

        // if (label === 'Reason') {
        //     reasonsList &&
        //         reasonsList.map((item) => {
        //             if (item.Value === '0') return false
        //             tempDropdownList.push({ label: item.Text, value: item.Value })
        //             return null
        //         })
        //     return tempDropdownList
        // }
        // if (label === 'Dept') {
        //     deptList &&
        //         deptList.map((item) => {
        //             if (item.Value === '0') return false
        //             tempDropdownList.push({ label: item.Text, value: item.Value })
        //             return null
        //         })
        //     return tempDropdownList
        // }
    }
    const handleDepartmentChange = (newValue) => {
        const tempDropdownList = []
        // if (newValue && newValue !== '') {
        //     setValue('approver', '')
        //     //   setSelectedApprover('')
        //     //   setShowValidation(false)
        //     let requestObject = {
        //         LoggedInUserId: userData.LoggedInUserId,
        //         DepartmentId: newValue.value,
        //         TechnologyId: technologyId,
        //         ApprovalTypeId: NFRAPPROVALTYPEID,
        //         plantId: props?.PlantId
        //     }
        //     dispatch(getAllApprovalUserFilterByDepartment(requestObject, (res) => {
        //         res.data.DataList && res.data.DataList.map((item) => {
        //             if (item.Value === '0') return false;
        //             if (item.Value === EMPTY_GUID) return false;
        //             tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
        //             return null
        //         })
        //         if (tempDropdownList?.length === 0) {
        //             //   setShowValidation(true)
        //         }
        //         setApprovalDropDown(tempDropdownList)
        //         let obj = {}
        //         obj.DepartmentId = userDetails().DepartmentId
        //         obj.UserId = loggedInUserId()
        //         obj.TechnologyId = nfrPartDetail?.TechnologyId
        //         //MINDA
        //         // obj.TechnologyId = technologyId
        //         obj.Mode = 'costing'
        //         obj.approvalTypeId = costingTypeIdToApprovalTypeIdFunction(NFRTypeId)
        //         obj.plantId = props?.PlantId
        //         dispatch(checkFinalUser(obj, (res) => {
        //             if (res?.data?.Result) {
        //                 if (res?.data?.Data?.IsFinalApprover) {
        //                     setIsDisable(true)
        //                     setEditWarning(true)
        //                     setFilterStatus("You are a final level user and cannot send NFR for approval.")
        //                     //MINDA
        //                     // if (res?.data?.Data?.IsUserInApprovalFlow === false) {
        //                     //     setIsDisable(true)
        //                     //     setEditWarning(true)
        //                     //     setFilterStatus('This user is not in the approval cycle')
        //                 } else {
        //                     setIsDisable(false)
        //                     setEditWarning(false)
        //                     setFilterStatus("")
        //                 }
        //             }
        //         }))
        //     }))
        //     //   setSelectedDepartment(newValue)
        // } else {
        //     //   setSelectedDepartment('')
        // }
    }
    const handleCloseDrawer = () => {
        setRejectDrawer(false);
        setApprovalDrawer(false);
    };

    const isDisable = false; // Set this based on your condition

    return (
        <Fragment>
            <Drawer anchor={props.anchor} open={props.isOpen}>
                <div className="container">
                    <div className={`drawer-wrapper drawer-${props.hideTable ? 'sm' : 'md'}`}>
                        <Row className="drawer-heading">
                            <Col className='px-0'>
                                <div className="header-wrapper left">
                                    <h3>{props.rejectDrawer ? "Reject Costing" : (props.IsFinalApproved ? "Approve Costing" : "Send for Approval")}</h3>
                                </div>
                                <div onClick={() => toggleDrawer('cancel')} disabled={isLoader} className="close-button right"></div>
                            </Col>
                        </Row>
                        {isLoader && <LoaderCustom customClass="approve-reject-drawer-loader" />}
                        {(!props.rejectDrawer && !isFinalLevelUser) &&
                            <Row>
                                <Col md={props.hideTable ? 12 : 6}>
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
                                            options={renderDropdownListing("Dept")}
                                            mandatory={true}
                                            handleChange={handleDepartmentChange}
                                            errors={errors.dept}
                                        // disabled={(disableReleaseStrategy || !(userData.Department.length > 1 && reasonId !== REASON_ID))}
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
                                        // options={approvalDropDown}
                                        // handleChange={handleApproverChange}
                                        mandatory={true}
                                        disabled={initialConfiguration.IsMultipleUserAllowForApproval}
                                    />
                                </Col>
                            </Row>
                        }
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
                            <Col md="12" className="d-flex justify-content-end align-items-center">
                                <button
                                    className="cancel-btn mr-2"
                                    type="button"
                                    onClick={() => toggleDrawer('cancel')}
                                >
                                    <div className="cancel-icon"></div>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary save-btn"
                                    type="button"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={isDisable}
                                >
                                    <div className="save-icon"></div>
                                    Submit
                                </button>
                            </Col>
                        </Row>
                        <div>
                            {/* Add any warning messages here */}
                        </div>
                    </div>
                </div>
            </Drawer>
        </Fragment>
    );
};

export default ApprovalSummaryPage;
