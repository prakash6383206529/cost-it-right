import React, { useEffect, useState } from 'react'
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId, userDetails, labelWithUOMAndCurrency, displayUOM, userSimulationTechnologyLevelDetails, checkForNull, handleDepartmentHeader, showBopLabel, IsShowFreightAndShearingCostFields } from '../../helper';
import { approvalOrRejectRequestByMasterApprove, getAllMasterApprovalDepartment, getAllMasterApprovalUserByDepartment, masterApprovalRequestBySender } from './actions/Material';
import "react-datepicker/dist/react-datepicker.css";
import { debounce } from 'lodash'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch, useSelector } from 'react-redux'
import { TextAreaHookForm, SearchableSelectHookForm, TextFieldHookForm, AllApprovalField, } from '../layout/HookFormInputs'
import Toaster from '../common/Toaster';
import { getReasonSelectList } from '../costing/actions/Approval';
import DayTime from '../common/DayTimeWrapper'
import DatePicker from "react-datepicker";
import { BOPTYPE, BUDGETTYPE, BUDGET_ID, EMPTY_GUID, MACHINETYPE, OPERATIONTYPE, RMTYPE, VBCTypeId, ZBCTypeId } from '../../config/constants';
import { getUsersMasterLevelAPI } from '../../actions/auth/AuthActions';
import { REMARKMAXLENGTH, SHEETMETAL } from '../../config/masterData';
import { costingTypeIdToApprovalTypeIdFunction } from '../common/CommonFunctions';
import { masterApprovalAPI, masterApprovalRequestBySenderBudget } from './actions/Budget';
import TooltipCustom from '../common/Tooltip';
import LoaderCustom from '../common/LoaderCustom';
import { reactLocalStorage } from 'reactjs-localstorage';

function MasterSendForApproval(props) {
    const { type, IsFinalLevel, IsPushDrawer, reasonId, masterId, OnboardingId, approvalObj, isBulkUpload, IsImportEntry, approvalDetails, IsFinalLevelButtonShow, approvalData, levelDetails, Technology, showScrapKeys } = props
    const { register, control, formState: { errors }, handleSubmit, setValue, getValues, reset, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const [approvalDropDown, setApprovalDropDown] = useState([])
    const [approverIdList, setApproverIdList] = useState([])
    const [isDisable, setIsDisable] = useState(false)
    const [isLoader, setIsLoader] = useState(false)
    const dispatch = useDispatch()
    const reasonsList = useSelector((state) => state.approval.reasonsList)
    const { deptList } = useSelector((state) => state.material)
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
        setValue('ScrapRateUOM', { label: approvalObj?.ScrapUnitOfMeasurement, value: approvalObj?.ScrapUnitOfMeasurementId })
        dispatch(getAllMasterApprovalDepartment((res) => {
            const Data = res?.data?.SelectList
            const departObj = Data && Data.filter(item => item.Value === userDetails().DepartmentId)
            setTimeout(() => {
                setValue('dept', { label: departObj[0].Text, value: departObj[0].Value })

            }, 100);
            let approverIdListTemp = []
            let obj = {
                LoggedInUserId: loggedInUserId(),
                DepartmentId: departObj && departObj[0]?.Value,
                MasterId: masterId,
                OnboardingMasterId: OnboardingId,
                ApprovalTypeId: masterId !== 0 ? costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId) : approvalDetails?.ApprovalTypeId,
                ReasonId: reasonId,
                PlantId: approvalObj ? approvalObj.Plant[0].PlantId ?? EMPTY_GUID : props.masterPlantId ?? EMPTY_GUID

            }
            dispatch(getAllMasterApprovalUserByDepartment(obj, (res) => {

                const Data = res.data.DataList[1] ? res.data.DataList[1] : []
                if (Data?.length !== 0) {
                    setTimeout(() => {
                        setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
                        setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })
                    }, 100);

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
                            approverIdListTemp.push(item.Value)
                            return null
                        })
                    setTimeout(() => {
                        setApprovalDropDown(tempDropdownList)

                        setApproverIdList(approverIdListTemp)
                    }, 100)
                }
            },),)
        }))
    }, [])


    const labelWithUOM = (value) => {
        return <div>
            <span className='d-flex'>Basic Rate/{displayUOM(value)} ({reactLocalStorage.getObject("baseCurrency")})</span>
        </div>
    }



    const renderDropdownListing = (label) => {
        const tempDropdownList = []
        if (label === 'Dept') {
            deptList &&
                deptList.map((item) => {
                    if (item.Value === '0') return false
                    tempDropdownList?.push({ label: item.Text, value: item.Value })
                    return null
                })
            return tempDropdownList
        }
        if (label === 'reasons') {
            reasonsList && reasonsList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList?.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempDropdownList
        }
    }

    const handleDepartmentChange = (value) => {
        setValue('approver', { label: '', value: '', levelId: '', levelName: '' })
        let tempDropdownList = []
        let approverIdListTemp = []
        let obj = {
            LoggedInUserId: loggedInUserId(), // user id
            DepartmentId: value.value,
            MasterId: masterId,
            OnboardingMasterId: OnboardingId,
            ReasonId: '',
            ApprovalTypeId: masterId !== 0 ? costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId) : approvalDetails?.ApprovalTypeId,
            PlantId: approvalObj.PlantId ?? approvalData[0].MasterApprovalPlantId ?? EMPTY_GUID
        }
        dispatch(getAllMasterApprovalUserByDepartment(obj, (res) => {
            const Data = res.data.DataList[1] ? res.data.DataList[1] : []
            if (Data?.length !== 0) {
                setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
                setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })
                res.data.DataList &&
                    res.data.DataList.map((item) => {
                        if (item.Value === '0') return false;
                        tempDropdownList.push({
                            label: item.Text,
                            value: item.Value,
                            levelId: item.LevelId,
                            levelName: item.LevelName
                        })
                        approverIdListTemp.push(item.Value)
                        return null
                    })
                setTimeout(() => {

                    setApprovalDropDown(tempDropdownList)
                    setApproverIdList(approverIdListTemp)
                }, 100);
            }
        }),
        )

    }


    const onSubmit = debounce(handleSubmit(() => {
        const remark = getValues('remark')
        const reason = getValues('reason')
        const dept = getValues('dept')
        const approver = getValues('approver')
        setIsDisable(true)
        if (initialConfiguration.IsMultipleUserAllowForApproval && (!getValues('dept')?.label) && (!IsFinalLevelButtonShow)) {
            Toaster.warning('There is no highest approver defined for this user. Please connect with the IT team.')
            setIsDisable(false)
            return false
        }
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
            // senderObj.ApproverId = approver && approver.value ? approver.value : ''
            senderObj.ApproverIdList = initialConfiguration.IsMultipleUserAllowForApproval ? approverIdList : [approver && approver.value ? approver.value : '']
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

            senderObj.ApprovalTypeId = masterId !== 0 ? costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId) : approvalDetails?.ApprovalTypeId
            senderObj.MasterIdList = [

            ]
            senderObj.BudgetingIdList = []
            let tempArray = []
            switch (checkForNull(masterId)) {
                case 1:                        // CASE 1 FOR RAW MATERIAL
                    if (isBulkUpload) {
                        senderObj.MasterIdList = approvalData.map(item => item?.RawMaterialId)
                        senderObj.MasterCreateRequest = {
                            CreateRawMaterial: {}
                        }
                    } else {
                        senderObj.MasterIdList = []
                        senderObj.MasterCreateRequest = {
                            CreateRawMaterial: approvalObj
                        }
                    }
                    senderObj.ApprovalMasterId = RMTYPE

                    //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
                    setIsLoader(true)
                    dispatch(masterApprovalAPI(senderObj, res => {
                        setIsDisable(false)
                        setIsLoader(false)
                        if (res?.data?.Result) {
                            Toaster.success('Raw Material has been sent for approval.')
                            props.closeDrawer('', 'submit')
                        }
                    }))
                    break;



                case 2:  //CASE 2 FOR BOP
                    if (isBulkUpload) {
                        senderObj.MasterIdList = approvalData.map(item => item?.BoughtOutPartId)
                        senderObj.MasterCreateRequest = {
                            CreateBoughtOutPart: {}
                        }
                    } else {
                        senderObj.MasterIdList = []
                        senderObj.MasterCreateRequest = {
                            CreateBoughtOutPart: approvalObj
                        }
                    }
                    senderObj.ApprovalMasterId = BOPTYPE

                    //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
                    setIsLoader(true)
                    dispatch(masterApprovalAPI(senderObj, res => {
                        setIsDisable(false)
                        setIsLoader(false)
                        if (res?.data?.Result) {
                            Toaster.success(`${showBopLabel()} has been sent for approval.`)
                            props.closeDrawer('', 'submit')
                        }
                    }))
                    break;


                case 3:  //CASE 3 FOR OPERATIONS


                    if (isBulkUpload) {
                        senderObj.MasterIdList = approvalData.map(item => item?.OperationId)
                        senderObj.MasterCreateRequest = {
                            CreateOperationRequest: {}
                        }
                    } else {
                        senderObj.MasterIdList = []
                        senderObj.MasterCreateRequest = {
                            CreateOperationRequest: approvalObj
                        }
                    }

                    senderObj.ApprovalMasterId = OPERATIONTYPE

                    //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
                    setIsLoader(true)
                    dispatch(masterApprovalAPI(senderObj, res => {
                        setIsDisable(false)
                        setIsLoader(false)
                        if (res?.data?.Result) {
                            Toaster.success('Operation has been sent for approval.')
                            props.closeDrawer('', 'submit')
                        }
                    }))
                    break;


                case 4:  //CASE 4 FOR MACHINE

                    // if (isBulkUpload) {
                    //     approvalData && approvalData.map(item => {
                    //         tempArray.push({ MachineId: item.MachineId, IsImportEntry: item.EnteryType === 'Domestic' ? false : true, MachineRequest: {}, CostingTypeId: item.CostingTypeId })
                    //         return null
                    //     })
                    // } else {
                    //     tempArray.push({ MachineId: EMPTY_GUID, IsImportEntry: IsImportEntry, MachineRequest: approvalObj })
                    // }
                    if (isBulkUpload) {
                        senderObj.MasterIdList = approvalData.map(item => item?.MachineId)
                        senderObj.MasterCreateRequest = {
                            CreateRawMaterial: {}
                        }
                    } else if (props.detailEntry) {
                        senderObj.MasterIdList = []
                        senderObj.MasterCreateRequest = {
                            MachineDetailsRequest: approvalObj,
                            IsDetailedEntry: true
                        }
                    } else {
                        senderObj.MasterIdList = []
                        senderObj.MasterCreateRequest = {
                            MachineBasicRequest: approvalObj,
                            IsDetailedEntry: false
                        }
                    }

                    // if (props.detailEntry) {
                    //     senderObj.MasterCreateRequest = {
                    //         MachineDetailsRequest: approvalObj,
                    //         IsDetailedEntry: true
                    //     }
                    // } else {
                    //     senderObj.MasterCreateRequest = {
                    //         MachineBasicRequest: approvalObj,
                    //         IsDetailedEntry: false
                    //     }
                    // }
                    senderObj.ApprovalMasterId = MACHINETYPE

                    //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
                    setIsLoader(true)
                    dispatch(masterApprovalAPI(senderObj, res => {
                        setIsDisable(false)
                        setIsLoader(false)
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
                        CostingHeadId: approvalObj.CostingHeadId,
                        PartId: approvalObj.PartId,
                        RevisionNumber: approvalObj.RevisionNumber,
                        PlantId: approvalObj.PlantId,
                        VendorId: approvalObj.VendorId,
                        CustomerId: approvalObj.CustomerId,
                        TotalRecordCount: 0,
                        CurrencyId: approvalObj.CurrencyId,
                        BudgetedPoPriceInCurrency: approvalObj.BudgetedPoPriceInCurrency,
                        IsSendForApproval: true,
                        IsRecordInsertedBySimulation: false,
                        IsFinancialDataChanged: true,
                        BudgetingPartCostingDetails: approvalObj.BudgetingPartCostingDetails,
                        ConditionsData: approvalObj.conditionTableData,
                        SenderLevelId: levelDetails?.LevelId,
                        SenderId: loggedInUserId(),
                        SenderLevel: levelDetails?.Level
                    }
                    if (isBulkUpload) {
                        senderObj.MasterIdList = approvalData.map(item => item?.RawMaterialId)
                        senderObj.MasterCreateRequest = {
                            CreateBudgeting: {}
                        }
                    } else {
                        senderObj.MasterIdList = []
                        senderObj.MasterCreateRequest = {
                            CreateBudgeting: obj
                        }
                    }

                    senderObj.ApprovalMasterId = BUDGETTYPE

                    //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
                    setIsLoader(true)
                    dispatch(masterApprovalRequestBySender(senderObj, res => {
                        setIsDisable(false)
                        setIsLoader(false)
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
            // obj.ApproverId = approver && approver.value ? approver.value : ''
            obj.ApproverIdList = initialConfiguration.IsMultipleUserAllowForApproval ? approverIdList : [approver && approver.value ? approver.value : '']
            obj.ApproverLevelId = approver && approver.levelId ? approver.levelId : ''
            obj.ApproverLevel = approver && approver.levelName ? approver.levelName : ''
            obj.Remark = remark
            obj.IsApproved = type === 'Approve' ? true : false
            obj.ApproverDepartmentId = dept && dept.value ? dept.value : ''
            obj.ApproverDepartmentName = dept && dept.label ? dept.label : ''
            obj.IsFinalApprovalProcess = false
            if (type === 'Approve') {
                reset()
                setIsLoader(true)
                dispatch(approvalOrRejectRequestByMasterApprove(obj, res => {
                    setIsDisable(false)
                    setIsLoader(false)
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
                setIsLoader(true)
                dispatch(approvalOrRejectRequestByMasterApprove(obj, res => {
                    setIsDisable(false)
                    setIsLoader(false)
                    if (res?.data?.Result) {
                        Toaster.success('Token Rejected')
                        props.closeDrawer('', 'submit')
                    }
                }))
            }
        }

    }), 500)

    const getHeaderNameForApproveReject = () => {

        switch (checkForNull(masterId)) {
            case 0:
                return "Supplier"
            case 1:
                return "Raw Material"
            case 2:
                return "Bought Out Part"
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

    const labelForScrapRate = () => {
        let labelSelectedCurrency = `Scrap Rate (${approvalObj?.Currency ? approvalObj?.Currency : (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency')}/${(approvalObj?.ScrapUnitOfMeasurement ? approvalObj?.ScrapUnitOfMeasurement : 'UOM')})`
        let labelBaseCurrency = `Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}/${(approvalObj?.ScrapUnitOfMeasurement ? approvalObj?.ScrapUnitOfMeasurement : 'UOM')})`
        if (showScrapKeys?.showCircleJali) {
            labelSelectedCurrency = `Jali Scrap Rate 45(${approvalObj?.Currency ? approvalObj?.Currency : (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency')}/${(approvalObj?.ScrapUnitOfMeasurement ? approvalObj?.ScrapUnitOfMeasurement : 'UOM')})`
            labelBaseCurrency = `Jali Scrap Rate 54(${reactLocalStorage.getObject("baseCurrency")}/${(approvalObj?.ScrapUnitOfMeasurement ? approvalObj?.ScrapUnitOfMeasurement : 'UOM')})`
        } else if (showScrapKeys?.showForging) {
            labelSelectedCurrency = `Forging Scrap Rate (${approvalObj?.Currency ? approvalObj?.Currency : (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency')}/${(approvalObj?.ScrapUnitOfMeasurement ? approvalObj?.ScrapUnitOfMeasurement : 'UOM')})`
            labelBaseCurrency = `Forging Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}/${(approvalObj?.ScrapUnitOfMeasurement ? approvalObj?.ScrapUnitOfMeasurement : 'UOM')})`
        } else if (showScrapKeys?.showScrap) {
            labelSelectedCurrency = `Scrap Rate (${approvalObj?.Currency ? approvalObj?.Currency : (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency')}/${(approvalObj?.ScrapUnitOfMeasurement ? approvalObj?.ScrapUnitOfMeasurement : 'UOM')})`
            labelBaseCurrency = `Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}/${(approvalObj?.ScrapUnitOfMeasurement ? approvalObj?.ScrapUnitOfMeasurement : 'UOM')})`
        }
        return { labelSelectedCurrency: labelSelectedCurrency, labelBaseCurrency: labelBaseCurrency }
    }

    const showPriceKeysCommonBOP = () => {
        return (
            <>
                <div className="input-group form-group col-md-6">
                    <TextFieldHookForm
                        label={`Basic Rate/${props?.UOM?.label ? props?.UOM?.label : 'UOM'} (${props?.currency?.label ? props?.currency?.label : 'Currency'})`}
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
                {props?.IsImportEntry && <div className="input-group form-group col-md-6">
                    <TextFieldHookForm
                        label={`Basic Rate/${props?.UOM?.label ? props?.UOM?.label : 'UOM'} (${reactLocalStorage.getObject("baseCurrency")})`}
                        name={'basicRateBase'}
                        Controller={Controller}
                        control={control}
                        placeholder={'-'}
                        register={register}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.basicRateBase}
                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.BasicRateConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                        disabled={true}
                    />

                </div>}

                {initialConfiguration?.IsBasicRateAndCostingConditionVisible && props.costingTypeId === ZBCTypeId &&
                    <>
                        <div className="input-group form-group col-md-6">
                            <Col>
                                <TooltipCustom id="bop-basic-price-currency" tooltipText={props?.toolTipTextObject?.basicPriceSelectedCurrency} />
                                <TextFieldHookForm
                                    label={`Basic Price/${props?.UOM?.label ? props?.UOM?.label : 'UOM'} (${props?.currency?.label ? props?.currency?.label : 'Currency'})`}
                                    name={'BasicPrice'}
                                    Controller={Controller}
                                    control={control}
                                    placeholder={'-'}
                                    register={register}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.BasicPrice}
                                    defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetCostWithoutConditionCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                    disabled={true}
                                />
                            </Col>
                        </div>
                        {props?.IsImportEntry && <div className="input-group form-group col-md-6">
                            <Col>
                                <TooltipCustom id="bop-basic-price-base-currency" tooltipText={props?.toolTipTextObject?.basicPriceBaseCurrency} />
                                <TextFieldHookForm
                                    label={`Basic Price/${props?.UOM?.label ? props?.UOM?.label : 'UOM'} (${reactLocalStorage.getObject("baseCurrency")})`}
                                    name={'BasicPriceBase'}
                                    Controller={Controller}
                                    control={control}
                                    placeholder={'-'}
                                    register={register}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.BasicPriceBase}
                                    defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetCostWithoutConditionCostConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                                    disabled={true}
                                />
                            </Col>
                        </div>}


                        <div className="input-group form-group col-md-6">
                            <TextFieldHookForm
                                label={`Condition Cost/${props?.UOM?.label ? props?.UOM?.label : 'UOM'} (${props?.currency?.label ? props?.currency?.label : 'Currency'})`}
                                name={'ConditionCost'}
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.ConditionCost}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetConditionCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />

                        </div>
                        {props?.IsImportEntry && <div className="input-group form-group col-md-6">
                            <TextFieldHookForm
                                label={`Condition Cost/${props?.UOM?.label ? props?.UOM?.label : 'UOM'} (${reactLocalStorage.getObject("baseCurrency")})`}
                                name={'ConditionCostBase'}
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.ConditionCostBase}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetConditionCostConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />

                        </div>}
                    </>
                }

                <div className="input-group form-group col-md-6">
                    <Col>
                        <TooltipCustom id="bop-net-cost-currency" tooltipText={props?.toolTipTextObject?.netCostCurrency} />
                        <TextFieldHookForm
                            label={`Net Cost/${props?.UOM?.label ? props?.UOM?.label : 'UOM'} (${props?.currency?.label ? props?.currency?.label : 'Currency'})`}
                            name={'netCost'}
                            Controller={Controller}
                            control={control}
                            placeholder={'-'}
                            register={register}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.NetLandedCost}
                            disabled={true}
                            defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetLandedCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                        />
                    </Col>
                </div>
                {props?.IsImportEntry && <div className="input-group form-group col-md-6">
                    <Col>
                        <TooltipCustom id="bop-net-cost-base-currency" tooltipText={props?.toolTipTextObject?.netCostBaseCurrency} />
                        <TextFieldHookForm
                            label={`Net Cost/${props?.UOM?.label ? props?.UOM?.label : 'UOM'} (${reactLocalStorage.getObject("baseCurrency")})`}
                            name={'netCostBase'}
                            Controller={Controller}
                            control={control}
                            placeholder={'-'}
                            register={register}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.NetLandedCostConversion}
                            disabled={true}
                            defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetLandedCostConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                        />
                    </Col>
                </div>}
            </>
        )
    }

    const showPriceKeysCommonRM = () => {
        return (
            <>
                <Col md="6">
                    <TextFieldHookForm
                        label={labelWithUOMAndCurrency("Cut Off Price ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, props?.currency?.label === undefined ? 'Currency' : props?.currency?.label)}
                        name={"cutOffPrice"}
                        type="text"
                        Controller={Controller}
                        control={control}
                        placeholder={'-'}
                        register={register}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.CutOffPrice}
                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.CutOffPrice, initialConfiguration.NoOfDecimalForPrice) : ''}
                        disabled={true}
                    />
                </Col>

                {props?.IsImportEntry && <Col md="6">
                    <TooltipCustom id="rm-cut-off-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextCutOffBaseCurrency} />
                    <TextFieldHookForm
                        label={labelWithUOMAndCurrency("Cut Off Price ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, reactLocalStorage.getObject("baseCurrency"))}
                        name={"cutOffPriceBase"}
                        type="text"
                        Controller={Controller}
                        control={control}
                        placeholder={'-'}
                        register={register}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.CutOffPriceInINR}
                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.CutOffPriceInINR, initialConfiguration.NoOfDecimalForPrice) : ''}
                        disabled={true}
                    />
                </Col>}




                <Col md="6">
                    <TextFieldHookForm
                        label={labelWithUOMAndCurrency("Basic Rate ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, props?.currency?.label === undefined ? 'Currency' : props?.currency?.label)}
                        name={"BasicRateCurrency"}
                        type="text"
                        Controller={Controller}
                        control={control}
                        placeholder={'-'}
                        register={register}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.BasicRatePerUOM}
                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.BasicRatePerUOM, initialConfiguration.NoOfDecimalForPrice) : ''}
                        disabled={true}
                    />
                </Col>
                {props?.IsImportEntry && <Col md="6">
                    <TooltipCustom id="rm-basic-rate-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextBasicRateBaseCurrency} />
                    <TextFieldHookForm
                        label={labelWithUOMAndCurrency("Basic Rate ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, reactLocalStorage.getObject("baseCurrency"))}
                        name={"BasicRateBase"}
                        type="text"
                        Controller={Controller}
                        control={control}
                        placeholder={'-'}
                        register={register}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.BasicRatePerUOMConversion}
                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.BasicRatePerUOMConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                        disabled={true}
                    />
                </Col>}


                {approvalObj?.IsScrapUOMApply && <>
                    <Col md="6">
                        <SearchableSelectHookForm
                            label={'Scrap Rate UOM'}
                            name={'ScrapRateUOM'}
                            placeholder={'Select'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            options={approvalDropDown}
                            mandatory={true}
                            handleChange={() => { }}
                            disabled={true}
                            errors={errors.approver}
                            defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.ScrapRateUOM, initialConfiguration.NoOfDecimalForPrice) : ''}
                        />
                    </Col>
                    <Col md="6">
                        <TextFieldHookForm
                            label={`Conversion Ratio (${approvalObj?.ScrapUnitOfMeasurement}/${approvalObj?.UnitOfMeasurementName})`}
                            name={"UOMToScrapUOMRatio"}
                            type="text"
                            Controller={Controller}
                            control={control}
                            placeholder={'-'}
                            register={register}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.ScrapRate}
                            defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.UOMToScrapUOMRatio, initialConfiguration.NoOfDecimalForPrice) : ''}
                            disabled={true}
                        />
                    </Col>
                    <Col md="6">
                        <TooltipCustom id="conversion-factor-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextCalculatedFactor} />
                        <TextFieldHookForm
                            label={`Calculated Factor (${approvalObj?.UnitOfMeasurementName}/${approvalObj?.ScrapUnitOfMeasurement})`}
                            name={"CalculatedFactor"}
                            type="text"
                            Controller={Controller}
                            control={control}
                            placeholder={'-'}
                            register={register}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.ScrapRate}
                            defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.CalculatedFactor, initialConfiguration.NoOfDecimalForPrice) : ''}
                            disabled={true}
                        />
                    </Col>
                    <Col md="6">
                        <TextFieldHookForm
                            label={labelForScrapRate()?.labelSelectedCurrency}
                            name={"ScrapRatePerScrapUOM"}
                            type="text"
                            Controller={Controller}
                            control={control}
                            placeholder={'-'}
                            register={register}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.ScrapRate}
                            defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.ScrapRatePerScrapUOM, initialConfiguration.NoOfDecimalForPrice) : ''}
                            disabled={true}
                        />
                    </Col>
                    {props?.IsImportEntry && <Col md="6">
                        <TooltipCustom id="scrap-rate-per-scrap-conversion-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextScrapRatePerScrapUOMBaseCurrency} />
                        <TextFieldHookForm
                            label={labelForScrapRate()?.labelBaseCurrency}
                            name={"ScrapRatePerScrapUOMConversion"}
                            type="text"
                            Controller={Controller}
                            control={control}
                            placeholder={'-'}
                            register={register}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.ScrapRate}
                            defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.ScrapRatePerScrapUOMConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                            disabled={true}
                        />
                    </Col>}
                </>}

                {/* {(!this.state.showForgingMachiningScrapCost && !this.state.showExtraCost) && */}
                {showScrapKeys?.showScrap &&
                    <>
                        <Col md="6">
                            <TooltipCustom id="rm-scrap-rate-selected-currency" tooltipText={props?.toolTipTextObject?.toolTipTextScrapCostBaseCurrencyPerOldUOM} />
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Scrap Rate ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, props?.currency?.label === undefined ? 'Currency' : props?.currency?.label)}
                                name={"ScrapRateCurrency"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.ScrapRate}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.ScrapRate, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>
                        {props?.IsImportEntry && <Col md="6">
                            <TooltipCustom id="rm-scrap-rate-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextScrapCostBaseCurrency} />
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Scrap Rate ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, reactLocalStorage.getObject("baseCurrency"))}
                                name={"ScrapRateBase"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.ScrapRateInINR}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.ScrapRateInINR, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>}
                    </>}
                {showScrapKeys?.showForging &&
                    <>
                        <Col md="6">
                            <TooltipCustom id="rm-forging-scrap-selected-currency" tooltipText={props?.toolTipTextObject?.toolTipTextForgingScrapCostSelectedCurrency} />
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Forging Scrap Rate ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, props?.currency?.label === undefined ? 'Currency' : props?.currency?.label)}
                                name={"ForgingScrap"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.ScrapRate}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.ScrapRate, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>
                        {props?.IsImportEntry && <Col md="6" className=" mb-3">
                            <TooltipCustom id="rm-forging-scrap-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextForgingScrapCostBaseCurrency} />
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Forging Scrap Rate ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, reactLocalStorage.getObject("baseCurrency"))}
                                name={"ForgingScrapBase"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.ScrapRateInINR}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.ScrapRateInINR, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>}



                        <Col md="6">
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Machining Scrap Rate ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, props?.currency?.label === undefined ? 'Currency' : props?.currency?.label)}
                                name={"MachiningScrap"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.MachiningScrapRate}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.MachiningScrapRate, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>
                        {props?.IsImportEntry && <Col md="6">
                            <TooltipCustom id="rm-machining-scrap-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextMachiningScrapCostBaseCurrency} />
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Machining Scrap Rate ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, reactLocalStorage.getObject("baseCurrency"))}
                                name={"MachiningScrapBase"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.MachiningScrapRateInINR}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.MachiningScrapRateInINR, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>}
                    </>
                }
                {showScrapKeys?.showCircleJali &&
                    <>
                        <Col md="6">
                            <TooltipCustom id="jali-scrap-cost-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextJaliScrapCostBaseCurrencyPerOldUOM} />
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Jali Scrap Rate 66", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, props?.currency?.label === undefined ? 'Currency' : props?.currency?.label)}
                                name={"JaliScrapCost"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.ScrapRate}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.ScrapRate, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>
                        {props?.IsImportEntry && <Col md="6">
                            <TooltipCustom id="rm-jali-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextJaliScrapCostBaseCurrency} />
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Jali Scrap Rate 44", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, reactLocalStorage.getObject("baseCurrency"))}
                                name={"JaliScrapCostBase"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.ScrapRateInINR}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.ScrapRateInINR, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>}



                        <Col md="6">
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Circle Scrap Rate ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, props?.currency?.label === undefined ? 'Currency' : props?.currency?.label)}
                                name={"CircleScrapCost"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.JaliScrapCost}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.JaliScrapCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>
                        {props?.IsImportEntry && <Col md="6">
                            <TooltipCustom id="rm-circle-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextCircleScrapCostBaseCurrency} />
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Circle Scrap Rate ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, reactLocalStorage.getObject("baseCurrency"))}
                                name={"CircleScrapCostBase"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.JaliScrapCostConversion}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.JaliScrapCostConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>}
                    </>
                }
                {IsShowFreightAndShearingCostFields() && (
                    <>

                        <Col md="6">
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Freight Cost ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, reactLocalStorage.getObject("baseCurrency"))}
                                name={"FreightChargeCuurency"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.RMFreightCost}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.RMFreightCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>
                        {props?.IsImportEntry && <Col md="6">
                            <TooltipCustom id="rm-freight-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextFreightCostBaseCurrency} />
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Freight Cost ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, reactLocalStorage.getObject("baseCurrency"))}
                                name={"FreightChargeBase"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.RawMaterialFreightCostConversion}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.RawMaterialFreightCostConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>}



                        <Col md="6">
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Shearing Cost ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, props?.currency?.label === undefined ? 'Currency' : props?.currency?.label)}
                                name={"ShearingCost"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.RMShearingCost}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.RMShearingCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>
                        {props?.IsImportEntry && <Col md="6">
                            <TooltipCustom id="rm-shearing-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextShearingCostBaseCurrency} />
                            <TextFieldHookForm
                                label={labelWithUOMAndCurrency("Shearing Cost ", props?.UOM?.label === undefined ? 'UOM' : props?.UOM?.label, reactLocalStorage.getObject("baseCurrency"))}
                                name={"ShearingCostBase"}
                                type="text"
                                Controller={Controller}
                                control={control}
                                placeholder={'-'}
                                register={register}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors.RawMaterialShearingCostConversion}
                                defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.RawMaterialShearingCostConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                                disabled={true}
                            />
                        </Col>}
                    </>)}
                {initialConfiguration?.IsBasicRateAndCostingConditionVisible && props.costingTypeId === ZBCTypeId && <>
                    <Col md="6">
                        <TooltipCustom id="rm-basic-price" tooltipText={props?.toolTipTextObject?.basicPriceCurrency} />
                        <TextFieldHookForm
                            label={`Basic Price (${props?.currency?.label === undefined ? 'Currency' : props?.currency?.label})`}
                            name={"BasicPriceCurrency"}
                            type="text"
                            Controller={Controller}
                            control={control}
                            placeholder={'-'}
                            register={register}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.NetCostWithoutConditionCost}
                            defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetCostWithoutConditionCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                            disabled={true}
                        />
                    </Col>
                    {props?.IsImportEntry && <Col md="6">
                        <TooltipCustom id="rm-basic-base-price" tooltipText={props?.toolTipTextObject?.basicPriceBaseCurrency} />
                        <TextFieldHookForm
                            label={`Basic Price (${reactLocalStorage.getObject("baseCurrency")})`}
                            name={"BasicPriceBase"}
                            type="text"
                            Controller={Controller}
                            control={control}
                            placeholder={'-'}
                            register={register}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.NetCostWithoutConditionCostConversion}
                            defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetCostWithoutConditionCostConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                            disabled={true}
                        />
                    </Col>}


                    <Col md="6">
                        <TextFieldHookForm
                            label={`Condition Cost (${props?.currency?.label === undefined ? 'Currency' : props?.currency?.label})`}
                            name={"FinalConditionCostCurrency"}
                            type="text"
                            Controller={Controller}
                            control={control}
                            placeholder={'-'}
                            register={register}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.NetConditionCost}
                            defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetConditionCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                            disabled={true}
                        />
                    </Col>

                    {props?.IsImportEntry && <Col md="6">
                        <TooltipCustom id="rm-condition-cost-base-currency" tooltipText={props?.toolTipTextObject?.toolTipTextConditionCostBaseCurrency} />
                        <TextFieldHookForm
                            label={`Condition Cost (${reactLocalStorage.getObject("baseCurrency")})`}
                            name={"FinalConditionCostBase"}
                            type="text"
                            Controller={Controller}
                            control={control}
                            placeholder={'-'}
                            register={register}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.NetConditionCostConversion}
                            defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetConditionCostConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                            disabled={true}
                        />
                    </Col>}

                </>}
                <Col md="6">
                    <TooltipCustom id="rm-net-cost-currency" tooltipText={props?.toolTipTextObject?.netCostCurrency} />
                    <TextFieldHookForm
                        label={`Net Cost (${props?.currency?.label === undefined ? 'Currency' : props?.currency?.label})`}
                        name={"NetLandedCostCurrency"}
                        type="text"
                        Controller={Controller}
                        control={control}
                        placeholder={'-'}
                        register={register}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.NetLandedCost}
                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetLandedCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                        disabled={true}
                    />
                </Col>
                {props?.IsImportEntry && <Col md="6">
                    <TooltipCustom id="rm-net-cost-base-currency" tooltipText={props?.toolTipTextObject?.netCostBaseCurrency} />
                    <TextFieldHookForm
                        label={`Net Cost (${reactLocalStorage.getObject("baseCurrency")})`}
                        name={"NetLandedCostBase"}
                        type="text"
                        Controller={Controller}
                        control={control}
                        placeholder={'-'}
                        register={register}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.NetLandedCostConversion}
                        defaultValue={Object.keys(approvalObj).length > 0 ? checkForDecimalAndNull(approvalObj.NetLandedCostConversion, initialConfiguration.NoOfDecimalForPrice) : ''}
                        disabled={true}
                    />
                </Col>}
            </>
        )
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
                            {isLoader && <LoaderCustom customClass="approve-reject-drawer-loader" />}
                            <Row className="ml-0">
                                {(!IsFinalLevelButtonShow && (type === 'Approve' || type === 'Sender')) && (
                                    <>
                                        <div className="input-group form-group col-md-12 input-withouticon">
                                            <SearchableSelectHookForm
                                                label={`${handleDepartmentHeader()}`}
                                                name={"dept"}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                defaultValue={""}
                                                options={renderDropdownListing("Dept")}
                                                mandatory={false}
                                                handleChange={handleDepartmentChange}
                                                errors={errors.dept}
                                                disabled={initialConfiguration.IsMultipleUserAllowForApproval}
                                            />
                                        </div>
                                        <div className="input-group form-group col-md-12 input-withouticon">
                                            {initialConfiguration.IsMultipleUserAllowForApproval ? <>
                                                <AllApprovalField
                                                    label="Approver"
                                                    approverList={approvalDropDown}
                                                    popupButton="View all"
                                                />
                                            </> :
                                                <SearchableSelectHookForm
                                                    label={'Approver'}
                                                    name={'approver'}
                                                    placeholder={'Select'}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: false }}
                                                    register={register}
                                                    options={approvalDropDown}
                                                    mandatory={true}
                                                    handleChange={() => { }}
                                                    disabled={false}
                                                    errors={errors.approver}
                                                />}
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
                                            !isBulkUpload && checkForNull(masterId) === 1 &&
                                            <>
                                                <div className="input-group form-group col-md-6">
                                                    <label className='height-0'>Effective Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="EffectiveDate"
                                                            selected={DayTime(approvalObj.EffectiveDate).isValid() ? new Date(approvalObj.EffectiveDate) : ''}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
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

                                                {showPriceKeysCommonRM()}

                                            </>
                                        }

                                        {
                                            !isBulkUpload && checkForNull(masterId) === 2 &&
                                            <>
                                                <div className="input-group form-group col-md-12">
                                                    <label className='height-0'>Effective Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="EffectiveDate"
                                                            selected={DayTime(approvalObj.EffectiveDate).isValid() ? new Date(approvalObj.EffectiveDate) : ''}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
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

                                                {showPriceKeysCommonBOP()}


                                            </>
                                        }


                                        {
                                            !isBulkUpload && checkForNull(masterId) === 3 &&
                                            <>
                                                <div className="input-group form-group col-md-12">
                                                    <label className='height-0'>Effective Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="EffectiveDate"
                                                            selected={DayTime(approvalObj.EffectiveDate).isValid() ? new Date(approvalObj.EffectiveDate) : ''}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
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
                                                        label={`Rate (${reactLocalStorage.getObject("baseCurrency")})`}
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
                                            !isBulkUpload && checkForNull(masterId) === 4 &&
                                            <>
                                                <div className="input-group form-group col-md-12">
                                                    <label className='height-0'>Effective Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="EffectiveDate"
                                                            selected={DayTime(approvalObj.EffectiveDate).isValid() ? new Date(approvalObj.EffectiveDate) : ''}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
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
                                            !isBulkUpload && checkForNull(masterId) === 5 &&
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