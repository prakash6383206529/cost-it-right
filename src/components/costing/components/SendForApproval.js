import React, { Fragment, useState, useEffect } from 'react';
import { Row, Col, Table, Container } from 'reactstrap';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Drawer from '@material-ui/core/Drawer'
import { SearchableSelectHookForm, TextFieldHookForm, TextAreaHookForm } from '../../layout/HookFormInputs';
import { getReasonSelectList, getAllApprovalDepartment, getAllApprovalUserByDepartment } from '../actions/Approval';
import { userDetails } from '../../../helper/auth';
import { setCostingApprovalData } from '../actions/Costing';

const SendForApproval = props => {
    const dispatch = useDispatch();
    const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm();
    const [effectiveDate, setEffectiveDate] = useState('');
    const reasonsList = useSelector(state => state.approval.reasonsList);
    const deptList = useSelector(state => state.approval.approvalDepartmentList);
    const usersList = useSelector(state => state.approval.approvalUsersList);
    const viewApprovalData = useSelector(state => state.costing.costingApprovalData);
    console.log('viewApprovalData: ', viewApprovalData);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const userData = userDetails();

    useEffect(() => {
        dispatch(getReasonSelectList(res => {
            console.log(res, "Responseeee from Reason list")
        }))
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

    const handleReasonChange = (data, index) => {
        let viewDataTemp = viewApprovalData;
        let temp = viewApprovalData[index];
        temp.reason = data.label;
        temp.reasonId = data.value;
        viewDataTemp[index] = temp;
        dispatch(setCostingApprovalData(viewDataTemp));
    }

    const handleECNNoChange = (data, index) => {
        let viewDataTemp = viewApprovalData;
        let temp = viewApprovalData[index];
        temp.reason = data.label;
        temp.reasonId = data.value;
        viewDataTemp[index] = temp;
        dispatch(setCostingApprovalData(viewDataTemp));
    }

    const toggleDrawer = (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return
        }
        props.closeDrawer('')
    }
    return (
        <Fragment>
            <Drawer anchor={props.anchor} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
                <form>
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
                                            <div className="left-border">{`Costing Id: ${data.costingId}`}</div>
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
                                                    handleChange={(e) => { console.log(e.target.value, "Text change")
                                                handleECNNoChange(e.target.value, index) }}
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
                                                            //   onChange={handleEffectiveDateChange}
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
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <TextFieldHookForm
                                                    label="Old/Current Price"
                                                    name={'oldPrice'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={data.oldPrice != "" ? data.oldPrice : ''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.oldPrice}
                                                    disabled={true}
                                                />
                                            </td>
                                            <td>
                                                <TextFieldHookForm
                                                    label="New Revised Price"
                                                    name={'revisedPrice'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={data.revisedPrice != "" ? data.revisedPrice : ''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.revisedPrice}
                                                    disabled={true}
                                                />
                                            </td>
                                            <td>
                                                <TextFieldHookForm
                                                    label="Variance"
                                                    name={'variance'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={data.variance != "" ? data.variance : ''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.variance}
                                                    disabled={true}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <TextFieldHookForm
                                                    label="Consumption Quantity"
                                                    name={'consumptionQty'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={data.consumptionQty != "" ? data.consumptionQty : ''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.consumptionQty}
                                                    disabled={true}
                                                />
                                            </td>
                                            <td>
                                                <TextFieldHookForm
                                                    label="Remaining Quantity"
                                                    name={'remainingQty'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={data.remainingQty != "" ? data.remainingQty : ''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.remainingQty}
                                                    disabled={true}
                                                />
                                            </td>
                                            <td>
                                                <TextFieldHookForm
                                                    label="Annual Impact"
                                                    name={'annualImpact'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={data.annualImpact != "" ? data.annualImpact : ''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.annualImpact}
                                                    disabled={true}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <TextFieldHookForm
                                                    label="Impact of the Year"
                                                    name={'yearImpact'}
                                                    Controller={Controller}
                                                    control={control}
                                                    register={register}
                                                    rules={{ required: false }}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    defaultValue={data.yearImpact != "" ? data.yearImpact : ''}
                                                    className=""
                                                    customClassName={'withBorder'}
                                                    errors={errors.yearImpact}
                                                    disabled={true}
                                                />
                                            </td></tr>
                                    </table>
                                </div>
                            </Container>
                        )
                    })}
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
                        //   defaultValue={technology.length !== 0 ? technology : ''}
                        options={renderDropdownListing('Dept')}
                        mandatory={true}
                        handleChange={handleDepartmentChange}
                        errors={errors.dept}
                    />
                    <SearchableSelectHookForm
                        label={'Approver'}
                        name={'approver'}
                        placeholder={'-Select-'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        //   defaultValue={technology.length !== 0 ? technology : ''}
                        options={renderDropdownListing('Approver')}
                        mandatory={true}
                        // handleChange={handleDepartmentChange}
                        errors={errors.approver}
                    />
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
                    <Row className="sf-btn-footer justify-content-between">
                        <div className="col-sm-12 text-right">
                            <button
                                type={'button'}
                                className="reset mr15 cancel-btn"
                            >
                                <div className={'cross-icon'}><img src={require('../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Clear'}
                            </button>

                            <button
                                type="button"
                                className="submit-button save-btn"
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
