import React, { useEffect, useState } from 'react'
import { getConfigurationKey, loggedInUserId, userDetails } from '../../helper';
import { approvalRequestByMasterApprove, getAllMasterApprovalDepartment, getAllMasterApprovalUserByDepartment, masterApprovalRequestBySender, rejectRequestByMasterApprove } from './actions/Material';
import "react-datepicker/dist/react-datepicker.css";
import { debounce } from 'lodash'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch, useSelector } from 'react-redux'
import { TextAreaHookForm, SearchableSelectHookForm, DatePickerHookForm, TextFieldHookForm, } from '../layout/HookFormInputs'
import Toaster from '../common/Toaster';
import { getReasonSelectList } from '../costing/actions/Approval';
import moment from 'moment'
import DatePicker from "react-datepicker";
import { EMPTY_GUID } from '../../config/constants';
import PushSection from '../common/PushSection';


function MasterSendForApproval(props) {
    const { type, tokenNo, IsFinalLevel, IsPushDrawer, reasonId, simulationDetail, masterId, approvalObj, isBulkUpload, IsImportEntery, approvalDetails, IsFinalLevelButtonShow, approvalData } = props


    const { register, control, formState: { errors }, handleSubmit, setValue, getValues, reset, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const [effectiveDate, setEffectiveDate] = useState('')
    const [approvalDropDown, setApprovalDropDown] = useState([])

    const dispatch = useDispatch()
    const reasonsList = useSelector((state) => state.approval.reasonsList)
    const { deptList } = useSelector((state) => state.material)
    const Departments = userDetails().Department

    const handleEffectiveDateChange = (date) => {
        setEffectiveDate(date)
    }

    const toggleDrawer = (event, type = 'cancel') => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return
        }
        props.closeDrawer('', type)
    }

    useEffect(() => {

        dispatch(getReasonSelectList((res) => { }))
        // dispatch(getAllApprovalDepartment((res) => { }))
        dispatch(getAllMasterApprovalDepartment((res) => {
            const Data = res?.data?.SelectList
            const departObj = Data && Data.filter(item => item.Value === userDetails().DepartmentId)

            setValue('dept', { label: departObj[0].Text, value: departObj[0].Value })

            let obj = {
                LoggedInUserId: loggedInUserId(),
                DepartmentId: departObj[0].Value,
                MasterId: masterId,
                ReasonId: reasonId
            }

            dispatch(getAllMasterApprovalUserByDepartment(obj, (res) => {
                const Data = res.data.DataList[1] ? res.data.DataList[1] : []
                setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
                setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })

            },
            ),
            )
        }))
    }, [])



    const renderDropdownListing = (label) => {
        const tempDropdownList = []
        if (label === 'Dept') {
            deptList &&
                deptList.map((item) => {
                    if (item.Value === '0') return false
                    tempDropdownList.push({ label: item.Text, value: item.Value })
                    return null
                })
            return tempDropdownList
        }
        if (label === 'reasons') {
            reasonsList && reasonsList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempDropdownList
        }
    }

    const handleDepartmentChange = (value) => {
        setValue('approver', { label: '', value: '', levelId: '', levelName: '' })
        let tempDropdownList = []
        let obj = {
            LoggedInUserId: loggedInUserId(), // user id
            DepartmentId: value.value,
            MasterId: masterId,
            ReasonId: ''
        }
        dispatch(
            getAllMasterApprovalUserByDepartment(obj, (res) => {
                res.data.DataList &&
                    res.data.DataList.map((item) => {
                        if (item.Value === '0') return false;
                        tempDropdownList.push({
                            label: item.Text,
                            value: item.Value,
                            levelId: item.LevelId,
                            levelName: item.LevelName
                        })
                        return null
                    })
                setApprovalDropDown(tempDropdownList)
            }),
        )

    }


    const onSubmit = debounce(handleSubmit(() => {
        const remark = getValues('remark')
        const reason = getValues('reason')
        const dept = getValues('dept')
        const approver = getValues('approver')

        if (type === 'Sender') {
            //THIS OBJ IS FOR SIMULATION SEND FOR APPROVAL
            let senderObj = {}
            senderObj.ApprovalId = EMPTY_GUID
            senderObj.ReasonId = reason ? reason.value : ''
            senderObj.Reason = reason ? reason.label : ''
            senderObj.IsFinalApproved = false
            // senderObj.ApprovalToken = 0
            senderObj.DepartmentId = dept && dept.value ? dept.value : ''
            senderObj.DepartmentName = dept && dept.label ? dept.label : ''
            senderObj.ApproverLevelId = approver && approver.levelId ? approver.levelId : ''
            senderObj.ApproverDepartmentId = dept && dept.value ? dept.value : ''
            senderObj.ApproverLevel = approver && approver.levelName ? approver.levelName : ''
            senderObj.ApproverDepartmentName = dept && dept.label ? dept.label : ''
            senderObj.ApproverId = approver && approver.value ? approver.value : ''
            senderObj.SenderLevelId = userDetails().LoggedInMasterLevelId
            senderObj.SenderId = loggedInUserId()
            senderObj.SenderLevel = userDetails().LoggedInMasterLevel
            senderObj.SenderRemark = remark
            senderObj.LoggedInUserId = loggedInUserId()
            senderObj.IsVendor = approvalObj && Object.keys(approvalObj).length > 0 ? approvalObj.IsVendor : false
            senderObj.EffectiveDate = approvalObj && Object.keys(approvalObj).length > 0 ? approvalObj.EffectiveDate : moment(new Date()).local().format('YYYY-MM-DD HH:mm:ss')
            senderObj.PurchasingGroup = ''
            senderObj.MaterialGroup = ''
            let tempArray = []
            if (isBulkUpload) {
                approvalData && approvalData.map(item => {
                    tempArray.push({ RawMaterialId: item.RawMaterialId, IsImportEntery: item.EnteryType === 'Domestic' ? false : true, RawMaterialRequest: {} })
                })
            } else {
                tempArray.push({ RawMaterialId: EMPTY_GUID, IsImportEntery: IsImportEntery, RawMaterialRequest: approvalObj })
            }
            senderObj.EntityList = tempArray
            // senderObj.SimulationList = [{ SimulationId: simulationDetail.SimulationId, SimulationTokenNumber: simulationDetail.TokenNo, SimulationAppliedOn: simulationDetail.SimulationAppliedOn }]

            //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
            dispatch(masterApprovalRequestBySender(senderObj, res => {
                if (res.data.Result) {
                    Toaster.success('Token has been sent for approval.')
                    props.closeDrawer('', 'submit')
                }
            }))
        }
        else {
            let obj = {}
            obj.ApprovalProcessSummaryId = approvalDetails.MasterApprovalProcessSummaryId
            obj.ApprovalProcessId = approvalDetails.ApprovalProcessId
            obj.ApprovalToken = approvalDetails.Token
            obj.LoggedInUserId = loggedInUserId()
            obj.SenderLevelId = userDetails().LoggedInMasterLevelId
            obj.SenderId = loggedInUserId()
            obj.SenderLevel = userDetails().LoggedInMasterLevel
            obj.SenderDepartmentId = dept && dept.value ? dept.value : ''
            obj.SenderDepartmentName = dept && dept.label ? dept.label : ''
            obj.ApproverId = approver && approver.value ? approver.value : ''
            obj.ApproverLevelId = approver && approver.levelId ? approver.levelId : ''
            obj.ApproverLevel = approver && approver.levelName ? approver.levelName : ''
            obj.Remark = remark
            obj.IsApproved = type === 'Approve' ? true : false
            obj.ApproverDepartmentId = dept && dept.value ? dept.value : ''
            obj.ApproverDepartmentName = dept && dept.label ? dept.label : ''
            obj.IsFinalApprovalProcess = false
            if (type === 'Approve') {
                reset()
                dispatch(approvalRequestByMasterApprove(obj, res => {
                    if (res.data.Result) {
                        if (IsPushDrawer) {
                            Toaster.success('The token has been approved')

                        } else {
                            Toaster.success(!IsFinalLevel ? 'The token has been approved' : 'The token has been sent to next level for approval')
                            props.closeDrawer('', 'submit')
                        }
                    }
                }))
            } else {
                // REJECT CONDITION
                dispatch(rejectRequestByMasterApprove(obj, res => {
                    if (res.data.Result) {
                        Toaster.success('Token Rejected')
                        props.closeDrawer('', 'submit')
                    }
                }))
            }
        }

    }), 500)


    return (
        <>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
            //onClose={(e) => toggleDrawer(e)}
            >
                <Container>
                    <div className={'drawer-wrapper'}>
                        <form
                        >
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{'Send For Approval'}</h3>
                                    </div>
                                    <div
                                        onClick={(e) => toggleDrawer(e)}
                                        className={'close-button right'}
                                    ></div>
                                </Col>
                            </Row>

                            <Row className="ml-0">
                                {(!IsFinalLevelButtonShow && (type === 'Approve' || type === 'Sender')) && (
                                    <>
                                        <div className="input-group form-group col-md-12 input-withouticon">
                                            <SearchableSelectHookForm
                                                label={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}
                                                name={"dept"}
                                                placeholder={"-Select-"}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: true }}
                                                register={register}
                                                defaultValue={""}
                                                options={renderDropdownListing("Dept")}
                                                mandatory={true}
                                                handleChange={handleDepartmentChange}
                                                errors={errors.dept}
                                                disabled={Departments.length > 1 ? false : true}
                                            />
                                        </div>
                                        <div className="input-group form-group col-md-12 input-withouticon">
                                            <SearchableSelectHookForm
                                                label={'Approver'}
                                                name={'approver'}
                                                placeholder={'-Select-'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: true }}
                                                register={register}
                                                //defaultValue={isEditFlag ? plantName : ''}
                                                options={approvalDropDown}
                                                mandatory={true}
                                                handleChange={() => { }}
                                                disabled={Departments.length > 1 ? false : true}
                                                errors={errors.approver}
                                            />
                                        </div>
                                    </>
                                )}
                                {

                                    (type === 'Sender' && !IsFinalLevel) &&
                                    <>

                                        <div className="input-group form-group col-md-12">
                                            <SearchableSelectHookForm
                                                label={'Reason'}
                                                name={'reason'}
                                                placeholder={'-Select-'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: true }}
                                                register={register}
                                                //defaultValue={isEditFlag ? plantName : ''}
                                                options={renderDropdownListing('reasons')}
                                                mandatory={true}
                                                handleChange={() => { }}
                                                errors={errors.reason}
                                            />
                                        </div>
                                        {
                                            !isBulkUpload &&
                                            <>
                                                <div className="input-group form-group col-md-12">
                                                    <label>Effective Date<span className="asterisk-required">*</span></label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="EffectiveDate"
                                                            selected={moment(approvalObj.EffectiveDate).isValid ? moment(approvalObj.EffectiveDate)._d : ''}
                                                            // onChange={handleEffectiveDateChange}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dateFormat="dd/MM/yyyy"
                                                            //maxDate={new Date()}
                                                            dropdownMode="select"
                                                            placeholderText="Select date"
                                                            className="withBorder"
                                                            autoComplete={"off"}
                                                            disabledKeyboardNavigation
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="input-group form-group col-md-12">
                                                    <TextFieldHookForm
                                                        label="Basic Rate"
                                                        name={'basicRate'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.basicRate}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? approvalObj.BasicRatePerUOM : ''}
                                                        disabled={true}
                                                    />
                                                    {/* {showError && <span className="text-help">This is required field</span>} */}
                                                </div>
                                                <div className="input-group form-group col-md-12">
                                                    <TextFieldHookForm
                                                        label="Scrap Rate"
                                                        name={'scrapRate'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.basicRate}
                                                        disabled={true}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? approvalObj.ScrapRate : ''}
                                                    />
                                                    {/* {showError && <span className="text-help">This is required field</span>} */}
                                                </div>
                                                <div className="input-group form-group col-md-12">
                                                    <TextFieldHookForm
                                                        label="RM Freight Cost"
                                                        name={'freightCost'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.freightCost}
                                                        disabled={true}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? approvalObj.RMFreightCost : ''}
                                                    />
                                                    {/* {showError && <span className="text-help">This is required field</span>} */}
                                                </div>
                                                <div className="input-group form-group col-md-12">
                                                    <TextFieldHookForm
                                                        label="Shearing Cost"
                                                        name={'shearingCost'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.shearingCost}
                                                        disabled={true}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? approvalObj.RMShearingCost : ''}
                                                    />
                                                    {/* {showError && <span className="text-help">This is required field</span>} */}
                                                </div>
                                                <div className="input-group form-group col-md-12">
                                                    <TextFieldHookForm
                                                        label="Net Cost"
                                                        name={'netCost'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.netCost}
                                                        disabled={true}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? approvalObj.NetLandedCost : ''}
                                                    />
                                                    {/* {showError && <span className="text-help">This is required field</span>} */}
                                                </div>
                                                {/* <PushSection /> */}
                                            </>
                                        }



                                    </>
                                }
                                <div className="input-group form-group col-md-12">
                                    <TextAreaHookForm
                                        label="Remark"
                                        name={'remark'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={type === 'Approve' ? false : true}
                                        rules={{ required: type === 'Approve' ? false : true }}
                                        handleChange={() => { }}
                                        //defaultValue={viewRM.RMRate}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.remark}
                                        disabled={false}
                                    />
                                    {/* {showError && <span className="text-help">This is required field</span>} */}
                                </div>
                            </Row>
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-sm-12 text-right bluefooter-butn">
                                    <button
                                        type={'button'}
                                        className="reset mr15 cancel-btn"
                                        onClick={toggleDrawer}
                                    >
                                        <div className={'cancel-icon'}></div>
                                        {'Cancel'}
                                    </button>

                                    <button
                                        type="button"
                                        className="submit-button  save-btn"
                                        onClick={onSubmit}
                                    >
                                        <div className={'save-icon'}></div>
                                        {'Submit'}
                                    </button>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Container>
            </Drawer>

        </>
    );
}

export default MasterSendForApproval;