import React, { Fragment, useState, useEffect } from 'react';
import { Row, Col, Table, Container } from 'reactstrap';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from "react-datepicker";
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer'
import { SearchableSelectHookForm, TextFieldHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import { getReasonSelectList, getAllApprovalDepartment, getAllApprovalUserByDepartment, sendForApprovalBySender } from '../actions/Approval';
import { userDetails } from '../../../helper/auth';
import { setCostingApprovalData } from '../actions/Costing';
import { getVolumeDataByPartAndYear } from '../../masters/actions/Volume';
import "react-datepicker/dist/react-datepicker.css";

const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8];
const SendForApproval = props => {
    const dispatch = useDispatch();
    const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm();
    const reasonsList = useSelector(state => state.approval.reasonsList);
    const deptList = useSelector(state => state.approval.approvalDepartmentList);
    const usersList = useSelector(state => state.approval.approvalUsersList);
    const viewApprovalData = useSelector(state => state.costing.costingApprovalData);
    const partNo = useSelector((state) => state.costing.partNo)
    console.log('partNo: ', partNo);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedApprover, setSelectedApprover] = useState('');
    const userData = userDetails();

    useEffect(() => {
        dispatch(getReasonSelectList(res => { }))
        dispatch(getAllApprovalDepartment(res => { }))
    }, [])

    /**
  * @method renderDropdownListing
  * @description Used show listing of unit of measurement
  */
    const renderDropdownListing = (label) => {
        const tempDropdownList = [];

        if (label === 'Reason') {
            reasonsList && reasonsList.map(item => {
                if (item.Value === '0') return false;
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null;
            });
            return tempDropdownList;
        }

        if (label === 'Dept') {
            deptList && deptList.map(item => {
                if (item.Value === '0') return false;
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null;
            });
            return tempDropdownList;
        }
        if (label === 'Approver') {
            usersList && usersList.map(item => {
                if (item.Value === '0') return false;
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null;
            });
            return tempDropdownList;
        }

    }

    /**
  * @method handleDepartmentChange
  * @description  USED TO HANDLE DEPARTMENT CHANGE
  */
    const handleDepartmentChange = (newValue) => {
        if (newValue && newValue !== '') {
            dispatch(getAllApprovalUserByDepartment({
                UserId: userData.LoggedInUserId,
                DepartmentId: newValue.Value
            }, () => { }))
            setSelectedDepartment(newValue)
        } else {
            setSelectedDepartment('')
        }
    }

    /**
     * @method handleReasonChange
     * @param {*} data 
     * @param {*} index 
     * @description This method is used to handle change of reason for every costing
     */
    const handleReasonChange = (data, index) => {
        let viewDataTemp = viewApprovalData;
        let temp = viewApprovalData[index];
        temp.reason = data.label;
        temp.reasonId = data.value;
        viewDataTemp[index] = temp;
        dispatch(setCostingApprovalData(viewDataTemp));
    }

    /**
     * @method handleECNNoChange
     * @param {*} data 
     * @param {*} index 
     * @description This method is used to handle change in ECN number for every costing
     */
    const handleECNNoChange = (data, index) => {
        let viewDataTemp = viewApprovalData;
        let temp = viewApprovalData[index];
        temp.ecNo = data;
        viewDataTemp[index] = temp;
        dispatch(setCostingApprovalData(viewDataTemp));
    }

    /**
     * @method handleEffectiveDateChange
     * @param {*} date 
     * @param {*} index 
     * @description This method is used to handle change of date and calculate consumption and remaining quantity and other details
     */
    const handleEffectiveDateChange = (date, index) => {
        let viewDataTemp = viewApprovalData;
        let temp = viewApprovalData[index];
        temp.effectiveDate = date;
        let month = date.getMonth();
        let year = '';
        let sequence = SEQUENCE_OF_MONTH[month];
        console.log('sequence: ', sequence);
        if (month <= 2) {
            year = `${(date.getFullYear()) - 1}-${date.getFullYear()}`
        }
        else {
            year = `${(date.getFullYear())}-${date.getFullYear() + 1}`
        }
        // dispatch(getVolumeDataByPartAndYear(partNo.label, year, res => {
        dispatch(getVolumeDataByPartAndYear('WISHER', year, res => {
            if (res.data.Result === true) {
                let approvedQtyArr = res.data.Data.VolumeApprovedDetails;
                let budgetedQtyArr = res.data.Data.VolumeBudgetedDetails;
                let actualQty = 0;
                let budgetedRemQty = 0;
                let actualRemQty = 0;
                approvedQtyArr.map(data => {
                    if (data.Sequence < sequence) {
                        actualQty += parseInt(data.ApprovedQuantity);
                    }
                    else if (data.Sequence >= sequence) {
                        actualRemQty += parseInt(data.ApprovedQuantity);
                    }
                })
                budgetedQtyArr.map(data => {
                    if (data.Sequence >= sequence) {
                        budgetedRemQty += parseInt(data.BudgetedQuantity);
                    }
                })
                temp.consumptionQty = actualQty;
                temp.remainingQty = budgetedRemQty - actualRemQty
                temp.annualImpact = (actualQty + (budgetedRemQty - actualRemQty)) * parseInt(temp.variance);
                temp.yearImpact = (budgetedRemQty - actualRemQty) * parseInt(temp.variance)
                viewDataTemp[index] = temp;
                dispatch(setCostingApprovalData(viewDataTemp));
            }

        }))
    }

    /**
     * @method onSubmit
     * @param {*} data 
     * @description This method is called on the submission of the form for send for approval
     */
    const onSubmit = data => {
        console.log('data: ', data);
        let count = 0;
        viewApprovalData.map(item => {
            if (item.effectiveDate == "") {
                count = count + 1
            }
        })
        if (count != 0) {
            toastr.warning("Please select effective date for all the costing");
            return;
        }
        let obj = {
            ApproverDepartmentId: selectedDepartment.value,
            ApproverLevelId: 1,
            ApproverId: 1,
            SenderLevelId: userData.LoggedInLevelId,
            SenderId: userData.LoggedInUserId,
            SenderRemark: data.remarks,
            LoggedInUserId: userData.LoggedInUserId
        }
        let temp = []
        let tempObj = {}
        viewApprovalData.map(data => {
            tempObj.TypeOfCosting = data.typeOfCosting;
            tempObj.PlantCode = data.plantCode;
            tempObj.PlantNumber = data.plantId;
            tempObj.CostingId = data.costingId;
            tempObj.CostingNumber = data.costingName;
            tempObj.ReasonId = data.reasonId;
            tempObj.Reason = data.reason;
            tempObj.ECNNumber = data.ecnNo;
            tempObj.EffectiveDate = data.effectiveDate;
            temp.push(tempObj);
        })
        obj.CostingsList = temp;

        dispatch(sendForApprovalBySender(obj, res => {
            console.log(res, "Response from send for approval")
        }))
    }

    const handleApproverChange = data => {
        setSelectedApprover(data)
    }

    useEffect(() => { }, [viewApprovalData])

    const toggleDrawer = (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return
        }
        dispatch(setCostingApprovalData([]))
        props.closeDrawer('')
    }
    return (
        <Fragment>
            <Drawer anchor={props.anchor} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
                {viewApprovalData && viewApprovalData.map((data, index) => {
                    return (
                        <Container>
                            <div>
                                <Row>
                                    <Col md="4">
                                        <div className="left-border">{data.typeOfCosting}</div>
                                    </Col>
                                    <Col md="4">
                                        <div className="left-border">{`Plant Code: ${data.plantCode}`}</div>
                                    </Col>
                                    <Col md="4">
                                        <div className="left-border">{`Costing Id: ${data.costingName}`}</div>
                                    </Col>
                                </Row>
                                <table>
                                    <tr>
                                        <td>
                                            <SearchableSelectHookForm
                                                label={'Reason'}
                                                name={'reason'}
                                                placeholder={'-Select-'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: true }}
                                                register={register}
                                                defaultValue={data.reason != "" ? data.reason : ''}
                                                options={renderDropdownListing('Reason')}
                                                mandatory={true}
                                                handleChange={(e) => { handleReasonChange(e, index) }}
                                                errors={errors.reason}
                                            />
                                        </td>
                                        <td>
                                            <TextFieldHookForm
                                                label="ENC Ref No"
                                                name={'encNumber'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                rules={{ required: false }}
                                                mandatory={false}
                                                handleChange={(e) => {
                                                    handleECNNoChange(e.target.value, index)
                                                }}
                                                defaultValue={data.ecnNo != "" ? data.ecnNo : ''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.encNumber}
                                            // disabled={true}
                                            />
                                        </td>
                                        <td>
                                            <div className="form-group">
                                                <label>Effective Date</label>
                                                <div className="inputbox date-section">
                                                    <DatePicker
                                                        name="EffectiveDate"
                                                        selected={data.effectiveDate != "" ? data.effectiveDate : ''}
                                                        onChange={(date) => {
                                                            handleEffectiveDateChange(date, index)
                                                        }}
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dateFormat="dd/MM/yyyy"
                                                        //maxDate={new Date()}
                                                        dropdownMode="select"
                                                        placeholderText="Select date"
                                                        className="withBorder"
                                                        autoComplete={'off'}
                                                        disabledKeyboardNavigation
                                                        onChangeRaw={(e) => e.preventDefault()}
                                                        disabled={false}
                                                        required={true}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>Old/Current Price</label>
                                            <label>{data.oldPrice ? data.oldPrice : '-'}</label>
                                        </td>
                                        <td>
                                            <label>Revised Price</label>
                                            <label>{data.revisedPrice ? data.revisedPrice : '-'}</label>
                                        </td>
                                        <td>
                                            <label>Variance</label>
                                            <label>{data.variance ? data.variance : '-'}</label>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>Consumpion Quantity</label>
                                            <label>{data.consumptionQty ? data.consumptionQty : '-'}</label>
                                        </td>
                                        <td>
                                            <label>Remaining Quantity</label>
                                            <label>{data.remainingQty !== "" ? data.remainingQty : '-'}</label>
                                        </td>
                                        <td>
                                            <label>Annual Impact</label>
                                            <label>{data.annualImpact !== "" ? data.annualImpact : '-'}</label>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>Impact for the Year</label>
                                            <label>{data.yearImpact ? data.yearImpact : '-'}</label>
                                        </td></tr>
                                </table>
                            </div>
                        </Container>
                    )
                })}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                        <Col md="4">
                            <div className="left-border">{'Approver'}</div>
                        </Col>
                    </Row>
                    <SearchableSelectHookForm
                        label={'Department'}
                        name={'dept'}
                        placeholder={'-Select-'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={''}
                        options={renderDropdownListing('Dept')}
                        // mandatory={true}
                        handleChange={handleDepartmentChange}
                        errors={errors.dept}
                    />
                    {
                        <SearchableSelectHookForm
                            label={'Approver'}
                            name={'approver'}
                            placeholder={'-Select-'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            defaultValue={''}
                            options={renderDropdownListing('Approver')}
                            mandatory={false}
                            handleChange={handleApproverChange}
                            errors={errors.approver}
                        />
                    }
                    <TextAreaHookForm
                        label="Remarks"
                        name={'remarks'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.remarks}
                        disabled={false}
                    />
                    <Row>
                        <div>
                            <button
                                type={'button'}
                                onClick={toggleDrawer}
                            // className="reset mr15 cancel-btn"
                            >
                                <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Clear'}
                            </button>

                            <button
                                type="submit"
                            // className="submit-button save-btn"
                            // onClick={() => handleSubmit(onSubmit)}
                            >
                                <div className={'check-icon'}><img src={require('../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                                {'Submit'}
                            </button>
                        </div>
                    </Row>
                </form>
            </Drawer>
        </Fragment>
    )
}

export default SendForApproval;
