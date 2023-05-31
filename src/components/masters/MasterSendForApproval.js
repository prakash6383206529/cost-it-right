import React, { useEffect, useState } from 'react'
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId, userDetails, labelWithUOMAndCurrency, displayUOM, userSimulationTechnologyLevelDetails } from '../../helper';
import { approvalOrRejectRequestByMasterApprove, getAllMasterApprovalDepartment, getAllMasterApprovalUserByDepartment, masterApprovalRequestBySender } from './actions/Material';
import "react-datepicker/dist/react-datepicker.css";
import { debounce } from 'lodash'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch, useSelector } from 'react-redux'
import { TextAreaHookForm, SearchableSelectHookForm, TextFieldHookForm, } from '../layout/HookFormInputs'
import Toaster from '../common/Toaster';
import { getReasonSelectList } from '../costing/actions/Approval';
import DayTime from '../common/DayTimeWrapper'
import DatePicker from "react-datepicker";
import { BOPTYPE, BUDGETTYPE, BUDGET_ID, EMPTY_GUID, MACHINETYPE, OPERATIONTYPE, RMTYPE, VBCTypeId, ZBCTypeId } from '../../config/constants';
import { getUsersMasterLevelAPI } from '../../actions/auth/AuthActions';
import { REMARKMAXLENGTH } from '../../config/masterData';
import { costingTypeIdToApprovalTypeIdFunction } from '../common/CommonFunctions';
import { masterApprovalAPI, masterApprovalRequestBySenderBudget } from './actions/Budget';

function MasterSendForApproval(props) {
    const { type, IsFinalLevel, IsPushDrawer, reasonId, masterId, approvalObj, isBulkUpload, IsImportEntery, approvalDetails, IsFinalLevelButtonShow, approvalData, levelDetails } = props


    const { register, control, formState: { errors }, handleSubmit, setValue, getValues, reset, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })


    const [approvalDropDown, setApprovalDropDown] = useState([])
    const [isDisable, setIsDisable] = useState(false)

    const dispatch = useDispatch()
    const reasonsList = useSelector((state) => state.approval.reasonsList)
    const { deptList } = useSelector((state) => state.material)
    const Departments = userDetails().Department

    const { initialConfiguration } = useSelector(state => state.auth)

    const toggleDrawer = (event, type = 'cancel') => {
        if (isDisable) {
            return false
        }
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
        dispatch(getAllMasterApprovalDepartment((res) => {
            const Data = res?.data?.SelectList
            const departObj = Data && Data.filter(item => item.Value === userDetails().DepartmentId)

            setValue('dept', { label: departObj[0].Text, value: departObj[0].Value })

            let obj = {
                LoggedInUserId: loggedInUserId(),
                DepartmentId: departObj && departObj[0]?.Value,
                MasterId: masterId,
                ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId),
                ReasonId: reasonId
            }

            dispatch(getAllMasterApprovalUserByDepartment(obj, (res) => {
                const Data = res.data.DataList[1] ? res.data.DataList[1] : []
                setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
                setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })
                let tempDropdownList = []
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
            },),)
        }))
    }, [])


    const labelWithUOM = (value) => {
        return <div>
            <span className='d-flex'>Basic Rate/{displayUOM(value)} (INR)</span>
        </div>
    }



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
            ReasonId: '',
            ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId),
        }
        dispatch(getAllMasterApprovalUserByDepartment(obj, (res) => {
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
        setIsDisable(true)
        if (type === 'Sender') {
            //THIS OBJ IS FOR SIMULATION SEND FOR APPROVAL
            let senderObj = {}
            senderObj.ReasonId = reason ? reason.value : 0
            senderObj.Reason = reason ? reason.label : ''
            senderObj.IsFinalApproved = false
            senderObj.DepartmentId = dept && dept.value ? dept.value : ''
            senderObj.DepartmentName = dept && dept.label ? dept.label : ''
            senderObj.ApproverLevelId = approver && approver.levelId ? approver.levelId : ''
            senderObj.ApproverDepartmentId = dept && dept.value ? dept.value : ''
            senderObj.ApproverLevel = approver && approver.levelName ? approver.levelName : ''
            senderObj.ApproverDepartmentName = dept && dept.label ? dept.label : ''
            senderObj.ApproverId = approver && approver.value ? approver.value : ''
            senderObj.SenderLevelId = levelDetails?.LevelId
            senderObj.SenderId = loggedInUserId()
            senderObj.SenderLevel = levelDetails?.Level
            senderObj.SenderRemark = remark
            senderObj.LoggedInUserId = loggedInUserId()
            senderObj.IsVendor = approvalObj && Object.keys(approvalObj).length > 0 ? approvalObj.IsVendor : false
            senderObj.EffectiveDate = approvalObj && Object.keys(approvalObj).length > 0 ? approvalObj.EffectiveDate : DayTime(new Date()).format('YYYY-MM-DD HH:mm:ss')
            senderObj.PurchasingGroup = ''
            senderObj.MaterialGroup = ''
            senderObj.CostingTypeId = props?.costingTypeId
            senderObj.ApprovalTypeId = costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId)
            senderObj.MasterIdList = [

            ]
            senderObj.BudgetingIdList = []
            let tempArray = []
            switch (masterId) {
                case 1:                        // CASE 1 FOR RAW MATERIAL
                    if (isBulkUpload) {
                        approvalData && approvalData.map(item => {
                            approvalObj.RawMaterialId = item.RawMaterialId
                            approvalObj.CostingTypeId = item.CostingTypeId
                            return null
                        })
                    } else {
                        approvalObj.RawMaterialId = EMPTY_GUID
                    }
                    senderObj.MasterCreateRequest = {
                        CreateRawMaterial: approvalObj
                    }
                    senderObj.ApprovalMasterId = RMTYPE

                    //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
                    dispatch(masterApprovalAPI(senderObj, res => {
                        setIsDisable(false)
                        if (res?.data?.Result) {
                            Toaster.success('Raw Material has been sent for approval.')
                            props.closeDrawer('', 'submit')
                        }
                    }))
                    break;



                case 2:  //CASE 2 FOR BOP

                    approvalObj.BoughtOutPartId = isBulkUpload ? approvalData && approvalData.map(item => item.BoughtOutPartId) : EMPTY_GUID;
                    senderObj.MasterCreateRequest = {
                        CreateBoughtOutPart: approvalObj
                    }
                    senderObj.ApprovalMasterId = BOPTYPE

                    //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
                    dispatch(masterApprovalAPI(senderObj, res => {
                        setIsDisable(false)
                        if (res?.data?.Result) {
                            Toaster.success('BOP has been sent for approval.')
                            props.closeDrawer('', 'submit')
                        }
                    }))
                    break;


                case 3:  //CASE 3 FOR OPERATIONS

                    if (isBulkUpload) {
                        approvalData && approvalData.map(item => {
                            approvalObj.OperationId = item.OperationId
                            approvalObj.CostingTypeId = item.CostingTypeId
                            return null
                        })
                    } else {
                        approvalObj.OperationId = EMPTY_GUID
                    }
                    senderObj.MasterCreateRequest = {
                        CreateOperationRequest: approvalObj
                    }
                    senderObj.ApprovalMasterId = OPERATIONTYPE

                    //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
                    dispatch(masterApprovalAPI(senderObj, res => {
                        setIsDisable(false)
                        if (res?.data?.Result) {
                            Toaster.success('Operation has been sent for approval.')
                            props.closeDrawer('', 'submit')
                        }
                    }))
                    break;


                case 4:  //CASE 4 FOR MACHINE

                    if (isBulkUpload) {
                        approvalData && approvalData.map(item => {
                            tempArray.push({ MachineId: item.MachineId, IsImportEntery: item.EnteryType === 'Domestic' ? false : true, MachineRequest: {}, CostingTypeId: item.CostingTypeId })
                            return null
                        })
                    } else {
                        tempArray.push({ MachineId: EMPTY_GUID, IsImportEntery: IsImportEntery, MachineRequest: approvalObj })
                    }
                    senderObj.EntityList = tempArray
                    senderObj.ApprovalMasterId = MACHINETYPE
                    dispatch(masterApprovalAPI(senderObj, res => {
                        setIsDisable(false)
                        if (res?.data?.Result) {
                            Toaster.success('Machine has been sent for approval.')
                            props.closeDrawer('', 'submit')
                        }
                    }))
                    break;
                case 5:  //CASE 5 FOR BUDGET MASTER

                    let obj = {

                        LoggedInUserId: loggedInUserId(),
                        BudgetingId: 0,
                        FinancialYear: approvalObj.FinancialYear,
                        NetPoPrice: approvalObj.NetPoPrice,
                        BudgetedPoPrice: approvalObj.BudgetedPoPrice,
                        //RecordInsertedBy: "string",
                        CostingHeadId: approvalObj.CostingHeadId,
                        //CostingHead: "string",
                        PartId: approvalObj.PartId,
                        //PartName: "string",
                        //PartNumber: "string",
                        RevisionNumber: approvalObj.RevisionNumber,
                        PlantId: approvalObj.PlantId,
                        //PlantName: "string",
                        //PlantCode: "string",
                        VendorId: approvalObj.VendorId,
                        //VendorName: "string",
                        //VendorCode: "string",
                        CustomerId: approvalObj.CustomerId,
                        //CustomerName: "string",
                        //CustomerCode: "string",
                        TotalRecordCount: 0,
                        CurrencyId: approvalObj.CurrencyId,
                        //Currency: "string",
                        BudgetedPoPriceInCurrency: approvalObj.BudgetedPoPriceInCurrency,
                        IsSendForApproval: true,
                        IsRecordInsertedBySimulation: false,
                        IsFinancialDataChanged: true,
                        BudgetingPartCostingDetails: approvalObj.BudgetingPartCostingDetails,
                        ConditionsData: approvalObj.conditionTableData
                    }
                    senderObj.MasterCreateRequest = {
                        CreateBudgeting: obj
                    }
                    senderObj.ApprovalMasterId = BUDGETTYPE

                    //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
                    dispatch(masterApprovalRequestBySender(senderObj, res => {
                        setIsDisable(false)
                        if (res?.data?.Result) {
                            Toaster.success('Budget has been sent for approval.')
                            props.closeDrawer('', 'submit')
                        }
                    }))
                    break;
                default:
                    break;
            }

        }
        else {
            let obj = {}
            obj.ApprovalProcessSummaryId = approvalDetails.MasterApprovalProcessSummaryId
            obj.ApprovalProcessId = approvalDetails.ApprovalProcessId
            obj.ApprovalToken = approvalDetails.Token
            obj.LoggedInUserId = loggedInUserId()
            obj.SenderLevelId = levelDetails.LevelId
            obj.SenderId = loggedInUserId()
            obj.SenderLevel = levelDetails.Level
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
                dispatch(approvalOrRejectRequestByMasterApprove(obj, res => {
                    setIsDisable(false)
                    if (res?.data?.Result) {
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
                dispatch(approvalOrRejectRequestByMasterApprove(obj, res => {
                    if (res.data.Result) {
                        Toaster.success('Token Rejected')
                        props.closeDrawer('', 'submit')
                    }
                }))
            }
        }

    }), 500)

    const getHeaderNameForApproveReject = () => {
        switch (masterId) {
            case 1:
                return "Raw Material"
            case 2:
                return "Insert"
            case 3:
                return "Operation"
            case 4:
                return "Machine"
            case 5:
                return "Budgeting"
            default:
                break;
        }
    }

    return (
        <>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
            >
                <Container>
                    <div className={'drawer-wrapper'}>
                        <form
                        >
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>{type === 'Sender' ? 'Send For Approval' : `${type} ${getHeaderNameForApproveReject()}`}</h3>
                                    </div>

                                    <div
                                        onClick={(e) => toggleDrawer(e)}
                                        disabled={isDisable}
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
                                                disabled={Departments.length > 1 ? false : true}
                                            />
                                        </div>
                                        <div className="input-group form-group col-md-12 input-withouticon">
                                            <SearchableSelectHookForm
                                                label={'Approver'}
                                                name={'approver'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: true }}
                                                register={register}
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
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: true }}
                                                register={register}
                                                options={renderDropdownListing('reasons')}
                                                mandatory={true}
                                                handleChange={() => { }}
                                                errors={errors.reason}
                                            />
                                        </div>
                                        {
                                            !isBulkUpload && masterId === Number('1') &&
                                            <>
                                                <div className="input-group form-group col-md-6">
                                                    <label className='height-0'>Effective Date<span className="asterisk-required">*</span></label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="EffectiveDate"
                                                            selected={DayTime(approvalObj.EffectiveDate).isValid() ? new Date(approvalObj.EffectiveDate) : ''}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="-"
                                                            className="withBorder"
                                                            autoComplete={"off"}
                                                            disabledKeyboardNavigation
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="input-group form-group col-md-6">
                                                    <TextFieldHookForm
                                                        label={labelWithUOMAndCurrency("Basic Rate", props?.UOM?.label)}
                                                        name={'basicRate'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        className=""
                                                        placeholder={'-'}
                                                        customClassName={'withBorder'}
                                                        errors={errors.basicRate}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.BasicRatePerUOM, initialConfiguration.NoOfDecimalForPrice) : ''}
                                                        disabled={true}
                                                    />

                                                </div>
                                                <div className="input-group form-group col-md-6">
                                                    <TextFieldHookForm
                                                        label={labelWithUOMAndCurrency("Scrap Rate", props?.UOM?.label)}
                                                        name={'scrapRate'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        className=""
                                                        placeholder={'-'}
                                                        customClassName={'withBorder'}
                                                        errors={errors.basicRate}
                                                        disabled={true}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.ScrapRate, initialConfiguration.NoOfDecimalForPrice) : ''}
                                                    />

                                                </div>
                                                <div className="input-group form-group col-md-6">
                                                    <TextFieldHookForm
                                                        label={labelWithUOMAndCurrency("Freight Cost", props?.UOM?.label)}
                                                        name={'freightCost'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        placeholder={'-'}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.freightCost}
                                                        disabled={true}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? approvalObj.RMFreightCost === undefined ? '' : checkForDecimalAndNull(approvalObj.RMFreightCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                                    />

                                                </div>
                                                <div className="input-group form-group col-md-6">
                                                    <TextFieldHookForm
                                                        label={labelWithUOMAndCurrency("Shearing Cost", props?.UOM?.label)}
                                                        name={'shearingCost'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        placeholder={'-'}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.shearingCost}
                                                        disabled={true}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? approvalObj.RMShearingCost === undefined ? '' : checkForDecimalAndNull(approvalObj.RMShearingCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                                    />

                                                </div>
                                                <div className="input-group form-group col-md-6">
                                                    <TextFieldHookForm
                                                        label={labelWithUOMAndCurrency("Net Cost", props?.UOM?.label)}
                                                        name={'netCost'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        placeholder={'-'}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.netCost}
                                                        disabled={true}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetLandedCostConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                                                    />

                                                </div>

                                            </>
                                        }

                                        {
                                            !isBulkUpload && (masterId) === Number('2') &&
                                            <>
                                                <div className="input-group form-group col-md-12">
                                                    <label>Effective Date<span className="asterisk-required">*</span></label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="EffectiveDate"
                                                            selected={DayTime(approvalObj.EffectiveDate).isValid() ? new Date(approvalObj.EffectiveDate) : ''}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="-"
                                                            className="withBorder"
                                                            autoComplete={"off"}
                                                            disabledKeyboardNavigation
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </div>

                                                {props?.IsImportEntery ?
                                                    <>
                                                        <div className="input-group form-group col-md-6">
                                                            <TextFieldHookForm
                                                                label={`Basic Rate (${props?.currency?.label === undefined ? 'Currency' : props?.currency?.label})`}
                                                                name={'basicRate'}
                                                                Controller={Controller}
                                                                control={control}
                                                                placeholder={'-'}
                                                                register={register}
                                                                className=""
                                                                customClassName={'withBorder'}
                                                                errors={errors.basicRate}
                                                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.BasicRate, initialConfiguration.NoOfDecimalForPrice) : ''}
                                                                disabled={true}
                                                            />

                                                        </div>

                                                        <div className="input-group form-group col-md-6">
                                                            <TextFieldHookForm
                                                                label={`Net Cost (${props?.currency?.label === undefined ? 'Currency' : props?.currency?.label})`}
                                                                name={'netCost'}
                                                                Controller={Controller}
                                                                control={control}
                                                                placeholder={'-'}
                                                                register={register}
                                                                className=""
                                                                customClassName={'withBorder'}
                                                                errors={errors.netCost}
                                                                disabled={true}
                                                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetLandedCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                                            />

                                                        </div>
                                                    </>
                                                    :
                                                    <>
                                                        <div className="input-group form-group col-md-6">
                                                            <TextFieldHookForm
                                                                label={labelWithUOM(props?.UOM?.label ? props?.UOM?.label : 'UOM')}
                                                                name={'basicRate'}
                                                                Controller={Controller}
                                                                control={control}
                                                                placeholder={'-'}
                                                                register={register}
                                                                className=""
                                                                customClassName={'withBorder'}
                                                                errors={errors.basicRate}
                                                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.BasicRate, initialConfiguration.NoOfDecimalForPrice) : ''}
                                                                disabled={true}
                                                            />

                                                        </div>

                                                        <div className="input-group form-group col-md-6">
                                                            <TextFieldHookForm
                                                                label="Net Cost (INR)"
                                                                name={'netCost'}
                                                                Controller={Controller}
                                                                control={control}
                                                                placeholder={'-'}
                                                                register={register}
                                                                className=""
                                                                customClassName={'withBorder'}
                                                                errors={errors.netCost}
                                                                disabled={true}
                                                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetLandedCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                                            />

                                                        </div>
                                                    </>

                                                }

                                            </>
                                        }


                                        {
                                            !isBulkUpload && masterId === Number('3') &&
                                            <>
                                                <div className="input-group form-group col-md-12">
                                                    <label>Effective Date<span className="asterisk-required">*</span></label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="EffectiveDate"
                                                            selected={DayTime(approvalObj.EffectiveDate).isValid() ? new Date(approvalObj.EffectiveDate) : ''}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="-"
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
                                                        label="Rate (INR)"
                                                        name={'rate'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.basicRate}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.Rate, initialConfiguration.NoOfDecimalForPrice) : ''}
                                                        disabled={true}
                                                        placeholder={'-'}
                                                    />

                                                </div>


                                            </>
                                        }

                                        {
                                            !isBulkUpload && masterId === Number('4') &&
                                            <>
                                                <div className="input-group form-group col-md-12">
                                                    <label>Effective Date<span className="asterisk-required">*</span></label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="EffectiveDate"
                                                            selected={DayTime(approvalObj.EffectiveDate).isValid() ? new Date(approvalObj.EffectiveDate) : ''}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholderText="-"
                                                            className="withBorder"
                                                            autoComplete={"off"}
                                                            disabledKeyboardNavigation
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="input-group form-group col-md-12">

                                                    {approvalObj.MachineProcessRates && approvalObj.MachineProcessRates.map((item, index) => {

                                                        return (
                                                            <TextFieldHookForm
                                                                label={`Process ${index + 1} Machine Rate (${item?.UnitOfMeasurement})`}
                                                                name={`machine${index}`}
                                                                Controller={Controller}
                                                                control={control}
                                                                register={register}
                                                                placeholder={'-'}
                                                                className=""
                                                                customClassName={'withBorder'}
                                                                errors={errors.basicRate}
                                                                defaultValue={checkForDecimalAndNull(item.MachineRate, initialConfiguration.NoOfDecimalForPrice)}
                                                                disabled={true}

                                                            />
                                                        )
                                                    })
                                                    }
                                                </div>
                                            </>
                                        }


                                        {
                                            !isBulkUpload && masterId === Number('5') &&
                                            <>
                                                {(props.costingTypeId === ZBCTypeId && (<>
                                                    <div className="col-md-12">
                                                        <SearchableSelectHookForm
                                                            name="Plant"
                                                            type="text"
                                                            label={'Plant (Code)'}
                                                            errors={errors.Plant}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            mandatory={true}
                                                            rules={{
                                                                required: true,
                                                            }}
                                                            placeholder={'Select'}
                                                            defaultValue={{ label: approvalObj?.PlantName, value: approvalObj?.PlantId }}
                                                            required={true}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </>)
                                                )}

                                                {(props.costingTypeId === VBCTypeId && (<>
                                                    <div className="col-md-12">
                                                        <SearchableSelectHookForm
                                                            name="vendorName"
                                                            type="text"
                                                            label={'Vendor (Code)'}
                                                            errors={errors.vendorName}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            mandatory={true}
                                                            rules={{
                                                                required: true,
                                                            }}
                                                            defaultValue={{ label: approvalObj?.VendorName, value: approvalObj?.VendorId }}
                                                            placeholder={'Select'}
                                                            required={true}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </>)
                                                )}


                                                {props.costingTypeId === VBCTypeId &&

                                                    < div className="col-md-12">
                                                        <SearchableSelectHookForm
                                                            name="DestinationPlant"
                                                            type="text"
                                                            label={props.costingTypeId === VBCTypeId ? 'Destination Plant (Code)' : 'Plant (Code)'}
                                                            errors={errors.Plant}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            mandatory={true}
                                                            rules={{
                                                                required: true,
                                                            }}
                                                            placeholder={'Select'}
                                                            defaultValue={{ label: approvalObj?.PlantName, value: approvalObj?.PlantId }}
                                                            required={true}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                }

                                                <>
                                                    <div className="col-md-12">
                                                        <SearchableSelectHookForm
                                                            name="PartNumber"
                                                            type="text"
                                                            label={'Part No. (Revision No.)'}
                                                            errors={errors.PartNumber}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            mandatory={true}
                                                            rules={{
                                                                required: true,
                                                            }}
                                                            defaultValue={{ label: approvalObj?.PartName, value: approvalObj?.PartId }}
                                                            placeholder={'Select'}
                                                            required={true}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </>


                                                <div className="col-md-12 p-relative">
                                                    <SearchableSelectHookForm
                                                        name="FinancialYear"
                                                        type="text"
                                                        label="Year"
                                                        errors={errors.FinancialYear}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={true}
                                                        rules={{
                                                            required: true,
                                                        }}
                                                        defaultValue={{ label: approvalObj?.FinancialYear, value: 0 }}
                                                        placeholder={'Select'}
                                                        required={true}
                                                        disabled={true}
                                                    />
                                                </div>

                                                <div className="col-md-12 p-relative">
                                                    <SearchableSelectHookForm
                                                        name="currency"
                                                        type="text"
                                                        label="Currency"
                                                        errors={errors.currency}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={true}
                                                        rules={{
                                                            required: true,
                                                        }}
                                                        defaultValue={{ label: approvalObj?.Currency, value: approvalObj?.CurrencyId }}
                                                        placeholder={'Select'}
                                                        required={true}
                                                        disabled={true}
                                                    />
                                                </div>

                                                <div className="input-group form-group col-md-12">
                                                    <TextFieldHookForm
                                                        label="Total Sum"
                                                        name={'totalSum'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.totalSum}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.BudgetedPoPrice, initialConfiguration.NoOfDecimalForPrice) : ''}
                                                        disabled={true}
                                                        placeholder={'-'}
                                                    />

                                                </div>

                                                <div className="input-group form-group col-md-12">
                                                    <TextFieldHookForm
                                                        label={approvalObj.Currency ? `Total Sum (${approvalObj.Currency})` : `Total Sum (Currency)`}
                                                        name={'totalSumCurrency'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.totalSum}
                                                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.BudgetedPoPriceInCurrency, initialConfiguration.NoOfDecimalForPrice) : ''}
                                                        disabled={true}
                                                        placeholder={'-'}
                                                    />
                                                </div>
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
                                        rules={{
                                            required: type === 'Approve' ? false : true,
                                            maxLength: REMARKMAXLENGTH
                                        }}
                                        handleChange={() => { }}
                                        className=""
                                        customClassName={'withBorder'}
                                        placeholder={'Type Here...'}
                                        errors={errors.remark}
                                        disabled={false}
                                    />

                                </div>
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