import React, { Fragment, useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import Button from '../../layout/Button';
import { Controller, useForm } from 'react-hook-form';
import { SearchableSelectHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import { useDispatch, useSelector } from 'react-redux';
import { getAllReasonAPI } from '../../masters/actions/ReasonMaster';
import { useHistory } from 'react-router-dom';
import { handleDepartmentHeader } from '../../../helper';


const MasterSendForApproval = (props) => {

    const history = useHistory();
    const [isLoader, setIsLoader] = useState(false)

    const dispatch = useDispatch()
    const { register, control, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const {
        isOpen,
        viewApprovalData,
        isDisable,
        isDisableSubmit,
        Approval
    } = props;

    useEffect(() => {
        // dispatch(getAllReasonAPI(true, (res) => {
        //     setIsLoader(true)
        //     if (res.data.Result) {
        //         setReasonOption(res.data.DataList);
        //         setSelectedReason(res.data.DataList[0] || null);
        //     }
        //     setIsLoader(false)
        // }));
    }, [dispatch]);

    const toggleDrawer = (event) => {
        if (isDisable) {
            return false
        }
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return
        }
        props.closeDrawer('', 'Cancel')
    }

    const handleSubmit = () => {
        // setSelectedReason(null);
        // setSelectedMonth(null);
        props.closeDrawer('', 'Cancel');
        history.push('/supplier-management/approval-listing');
    };

    const handleMonthChange = (selectedMonth) => {
        // Do something with the selected month
    };

    const handleReasonChange = (selectedReason) => {
        // Do something with the selected reason
    };

    return (
        <Fragment>
            <Drawer anchor={props.anchor} open={isOpen}>
                <div className="container">
                    <div className={"drawer-wrapper layout-width-400px"}>
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper right"}>
                                    <h3>{props.type === "Approve" ? "Send for Approval" : "Send for Rejection"}</h3>
                                </div>

                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    disabled={isLoader}
                                    className={"close-button right"}
                                ></div>
                            </Col>
                        </Row>
                        {props.type === "Approve" && (< Row >
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
                        </Row>)}
                        {/* Render remarks field only if approval is approved */}
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

                        <Row>
                            {/* Buttons */}
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
                                    onClick={handleSubmit}
                                    disabled={isDisable}
                                >
                                    <div className="save-icon"></div>
                                    Submit
                                </button>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Drawer>
        </Fragment >
    );
}

export default MasterSendForApproval;


