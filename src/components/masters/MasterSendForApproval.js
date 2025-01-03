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
import { BOPTYPE, BUDGETTYPE, BUDGET_ID, CBCTypeId, EMPTY_DATA, EMPTY_GUID, MACHINETYPE, OPERATIONTYPE, RMTYPE, VBCTypeId, ZBCTypeId } from '../../config/constants';
import { getAllDivisionListAssociatedWithDepartment, getUsersMasterLevelAPI } from '../../actions/auth/AuthActions';
import { REMARKMAXLENGTH, SHEETMETAL } from '../../config/masterData';
import { costingTypeIdToApprovalTypeIdFunction } from '../common/CommonFunctions';
import { masterApprovalAPI, masterApprovalRequestBySenderBudget } from './actions/Budget';
import TooltipCustom from '../common/Tooltip';
import LoaderCustom from '../common/LoaderCustom';
import { reactLocalStorage } from 'reactjs-localstorage';
import { getLastRevisionRawMaterialDetails } from './actions/Indexation';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import HeaderTitle from '../common/HeaderTitle';
import NoContentFound from '../common/NoContentFound';
import { rfqSaveBestCosting } from '../rfq/actions/rfq';
import { checkFinalUser } from '../costing/actions/Costing';
import { useLabels } from '../../helper/core';

function MasterSendForApproval(props) {
    const { type, IsFinalLevel, IsPushDrawer, reasonId, masterId, selectedRows, OnboardingId, approvalObj, isBulkUpload, IsImportEntry, approvalDetails, IsFinalLevelButtonShow, approvalData, levelDetails, Technology, showScrapKeys } = props
    const RFQPlantId = props?.partType === 'Raw Material' && props.isRFQ ? (approvalObj && approvalObj[0]?.Plant && approvalObj[0]?.Plant[0]?.PlantId) : approvalObj && approvalObj[0]?.PlantId
    const { register, control, formState: { errors }, handleSubmit, setValue, getValues, reset, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const { vendorLabel } = useLabels();
    const gridOptions = {};
    const [approvalDropDown, setApprovalDropDown] = useState([])
    const [approverIdList, setApproverIdList] = useState([])
    const [isDisable, setIsDisable] = useState(false)
    const [isLoader, setIsLoader] = useState(false)
    const [agGridLoader, setAgGridLoader] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isLastRevisionOpen, setIsLastRevisionOpen] = useState(false)
    const [lastRevisionRawMaterialDetails, setLastRevisionRawMaterialDetails] = useState([])
    const [isShowDivision, setIsShowDivision] = useState(false)
    const [divisionList, setDivisionList] = useState([])
    const [division, setDivision] = useState('')
    const [isFinalApprover, setIsFinalApprover] = useState(false)
    const [department, setDepartment] = useState('')
    const [isDisableDept, setDisableDept] = useState(false)
    const [departmentDropdown, setDepartmentDropdown] = useState([])
    const dispatch = useDispatch()
    const reasonsList = useSelector((state) => state.approval.reasonsList)
    const { deptList } = useSelector((state) => state.material)
    const { initialConfiguration } = useSelector(state => state.auth)
    const [checkMultiDept, setCheckMultiDept] = useState(false)
    // const { lastRevisionRawMaterialDetails } = useSelector(state => state.indexation)
    const { viewRmDetails } = useSelector(state => state.material)
    const { viewBOPDetails } = useSelector((state) => state.boughtOutparts);

    const toggleDrawer = (event, type = 'cancel') => {
        // if (isDisable) {
        //     return false
        // }
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
            const Departments = userDetails().Department && userDetails().Department.map(item => item.DepartmentName)
            const updateList = Data && Data.filter(item => Departments.includes(item.Text))
            let department = []
            updateList &&
                updateList.map((item) => {
                    if (item?.Value === '0') return false
                    department?.push({ label: item?.Text, value: item?.Value })
                    return null
                })
            setDepartmentDropdown(department)
            if (department?.length === 1 || !checkMultiDept) {
                setValue('dept', { label: department[0]?.label, value: department[0]?.value })
                setDisableDept(true)
                setDepartment(department[0])
                if (props.approvalListing) {
                    fetchAndSetApprovalUsers(updateList[0]?.Value, reasonId, approvalData[0]?.DivisionId);
                } else if (type !== "Approve" && getConfigurationKey().IsDivisionAllowedForDepartment) {
                    fetchDivisionList(department[0].value, dispatch, (divisionArray, showDivision) => {
                        setIsShowDivision(showDivision);
                        setDivisionList(divisionArray);
                    });
                }
            }
            if (!getConfigurationKey().IsDivisionAllowedForDepartment || (type === 'Approve' && !IsFinalLevelButtonShow)) {
                setTimeout(() => {
                    const matchingDepartment = department.find(dept => dept.value === approvalDetails?.DepartmentId);
                    let departmentId = matchingDepartment?.value ?? department[0]?.value
                    if (getConfigurationKey().IsDivisionAllowedForDepartment && matchingDepartment) {
                        setValue('dept', { label: matchingDepartment?.label, value: matchingDepartment?.value });
                    } else {
                        setValue('dept', { label: department[0]?.label, value: department[0]?.value });
                    }
                    setDisableDept(true)
                    fetchAndSetApprovalUsers(departmentId, reasonId, props?.divisionId);
                }, 100);
            }
            if (type === 'Sender' && props.approvalListing) {
                const DepartmentId = approvalData && approvalData[0]?.ApprovalDepartmentId;
                // Ensure DepartmentId is an array
                const departmentIds = Array.isArray(DepartmentId) ? DepartmentId : [DepartmentId];
                const updateList = Data && Data.filter(item => departmentIds.includes(item.Value));
                setDepartmentDropdown(updateList)
                setValue('dept', { label: updateList[0]?.Text, value: updateList[0]?.Value })
                setDisableDept(true)
                fetchAndSetApprovalUsers(updateList[0]?.Value, reasonId, approvalData[0]?.DivisionId);
                setIsShowDivision(false)
            }

        }))
        getLastRevisionData()
    }, [])

    const fetchAndSetApprovalUsers = (departmentId, reasonId, divisionId = null) => {
        const obj = {
            LoggedInUserId: loggedInUserId(),
            DepartmentId: departmentId,
            MasterId: masterId,
            OnboardingMasterId: OnboardingId,
            ApprovalTypeId: masterId !== 0 ? costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId) : approvalDetails?.ApprovalTypeId,
            ReasonId: reasonId,
            // PlantId: props?.isRFQ ? RFQPlantId : (approvalObj ? approvalObj.Plant[0].PlantId ?? EMPTY_GUID : props.masterPlantId ?? EMPTY_GUID),
            // DivisionId: divisionId ?? null

            PlantId: props?.isRFQ ? RFQPlantId : (approvalObj ? (Array.isArray(approvalObj?.Plant) ? approvalObj?.Plant[0]?.PlantId : approvalObj?.PlantId) ?? EMPTY_GUID : props?.masterPlantId ?? EMPTY_GUID),
            DivisionId: divisionId ?? null

            // ... existing code ...
        };
        dispatch(getAllMasterApprovalUserByDepartment(obj, (res) => {
            const Data = res.data.DataList[1] ? res.data.DataList[1] : [];
            if (Data?.length !== 0) {
                setTimeout(() => {
                    if (!getConfigurationKey().IsDivisionAllowedForDepartment) {
                        setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId });
                    }
                    setValue('approver', {
                        label: Data.Text ? Data.Text : '',
                        value: Data.Value ? Data.Value : '',
                        levelId: Data.LevelId ? Data.LevelId : '',
                        levelName: Data.LevelName ? Data.LevelName : ''
                    });
                }, 100);

                const tempDropdownList = [];
                const approverIdListTemp = [];

                res.data.DataList.forEach((item) => {
                    if (item?.Value !== '0') {
                        tempDropdownList.push({
                            label: item?.Text,
                            value: item?.Value,
                            levelId: item?.LevelId,
                            levelName: item?.LevelName
                        });
                        approverIdListTemp.push(item?.Value);
                    }
                });
                const hasFinalApproval = tempDropdownList.some(approver =>
                    approver.label.toLowerCase().includes("final approval")
                );
                if (hasFinalApproval) {
                    Toaster.warning('User not in approval flow');
                    setDepartment('')
                }

                setTimeout(() => {
                    setApprovalDropDown(tempDropdownList);
                    setApproverIdList(approverIdListTemp);
                }, 100);
            }
        }));
    };
    const getLastRevisionData = () => {

        if (approvalObj && Object.keys(approvalObj)?.length > 0 && getConfigurationKey()?.IsShowMaterialIndexation && Number(masterId) === 1) {
            setAgGridLoader(true)
            let data = {
                OldMasterRecordIds: [],
                LastRawMaterialDetails: [{
                    "RawMaterialEntryType": approvalObj?.RawMaterialEntryType,
                    "CostingHeadId": approvalObj?.CostingTypeId,
                    "TechnologyId": approvalObj?.TechnologyId,
                    "RawMaterialChildId": approvalObj?.RawMaterial,
                    "RawMaterialGradeId": approvalObj?.RMGrade,
                    "RawMaterialSpecificationId": approvalObj?.RMSpec,
                    "EffectiveDate": DayTime(approvalObj?.EffectiveDate).format('YYYY-MM-DD HH:mm:ss'),
                    "PlantId": props?.isRFQ ? RFQPlantId : (approvalObj?.Plant[0]?.PlantId),
                    "VendorId": approvalObj?.Vendor,
                    "CustomerId": approvalObj?.CostingTypeId === CBCTypeId ? approvalObj?.Customer : null,
                    "RawMaterialId": null
                }]
            }
            dispatch(getLastRevisionRawMaterialDetails(data, (res) => {
                if (res.status === 200 || res.status === 204) {

                    setLastRevisionRawMaterialDetails(res.status === 200 ? res?.data?.DataList : [])
                    setAgGridLoader(false)
                }
            }))
        }
    }
    const renderDropdownListing = (label) => {
        const tempDropdownList = []
        if (label === 'reasons') {
            reasonsList && reasonsList.map((item) => {
                if (item?.Value === '0') return false
                tempDropdownList?.push({ label: item?.Text, value: item?.Value })
                return null
            })
            return tempDropdownList
        }
    }
    const fetchDivisionList = (departmentId, dispatch, callback) => {
        let departmentIds = [departmentId];
        let obj = {
            DepartmentIdList: departmentIds,
            IsApproval: false
        }
        dispatch(getAllDivisionListAssociatedWithDepartment(obj, res => {
            if (res && res?.data && res?.data?.Identity === true) {
                let divisionArray = res?.data?.DataList
                    .filter(item => String(item?.DivisionId) !== '0')
                    .map(item => ({
                        label: `${item.DivisionNameCode}`,
                        value: (item?.DivisionId)?.toString(),
                        DivisionCode: item?.DivisionCode
                    }));
                callback(divisionArray, true);
            } else {
                if (!props.approvalListing) {
                    props.commonFunction(approvalObj && approvalObj?.Plant && approvalObj?.Plant[0]?.PlantId, true)
                }
                checkFinalUserAndSetApprover(departmentId, null);
                callback([], false);
            }
        }));
    };
    const handleDepartmentChange = (value) => {
        setValue('approver', { label: '', value: '', levelId: '', levelName: '' })
        setApprovalDropDown([])
        setDepartment(value)
        setDivision('')
        setValue('Division', '')
        if (getConfigurationKey().IsDivisionAllowedForDepartment) {
            setIsShowDivision(true)
            fetchDivisionList(value.value, dispatch, (divisionArray, showDivision) => {
                setIsShowDivision(showDivision);
                setDivisionList(divisionArray);
            });
        } else {
            let tempDropdownList = []
            let approverIdListTemp = []
            let obj = {
                LoggedInUserId: loggedInUserId(), // user id
                DepartmentId: value.value,
                MasterId: masterId,
                OnboardingMasterId: OnboardingId,
                ReasonId: '',
                ApprovalTypeId: masterId !== 0 ? costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId) : approvalDetails?.ApprovalTypeId,
                PlantId: props?.isRFQ ? RFQPlantId : (approvalObj?.PlantId ?? approvalData[0].MasterApprovalPlantId ?? EMPTY_GUID)

            }
            dispatch(getAllMasterApprovalUserByDepartment(obj, (res) => {
                const Data = res.data.DataList[1] ? res.data.DataList[1] : []
                if (Data?.length !== 0) {
                    setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
                    setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })
                    res.data.DataList &&
                        res.data.DataList.map((item) => {
                            if (item?.Value === '0') return false;
                            tempDropdownList.push({
                                label: item?.Text,
                                value: item?.Value,
                                levelId: item?.LevelId,
                                levelName: item?.LevelName
                            })
                            approverIdListTemp.push(item?.Value)
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

    }

    const checkFinalUserAndSetApprover = (departmentId, divisionId) => {
        let obj = {
            DepartmentId: departmentId,
            UserId: loggedInUserId(),
            TechnologyId: masterId,
            Mode: 'master',
            approvalTypeId: costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId),
            plantId: (approvalObj?.Plant && approvalObj.Plant[0]?.PlantId) || (approvalData && approvalData[0]?.DestinationPlantId) || null,
            divisionId: (divisionId || divisionId !== '') ? divisionId : null
        }

        dispatch(checkFinalUser(obj, (res) => {
            if (res?.data?.Result && res?.data?.Data?.IsFinalApprover) {
                setIsFinalApprover(true)
                setIsDisable(false)
            } else if (res?.data?.Data?.IsUserInApprovalFlow === false || res?.data?.Data?.IsNextLevelUserExist === false) {
                setIsFinalApprover(false)
                setIsDisable(true)
                Toaster.warning('There is no highest approver defined for this user')
            } else {
                setIsDisable(false)
                setIsFinalApprover(false)
                fetchAndSetApprovalUsers(departmentId, getValues('reason')?.value, divisionId)
            }
        }))
    }

    const handleDivisionChange = (value) => {
        setDivision(value)
        checkFinalUserAndSetApprover(department?.value, value?.value)
        if (!props.approvalListing) {
            props.commonFunction(approvalObj && approvalObj?.Plant && approvalObj?.Plant[0]?.PlantId, true)
        }

    }

    const onSubmit = debounce(handleSubmit((formValues) => {
        const remark = getValues('remark')
        const reason = getValues('reason')
        const dept = getValues('dept')
        const approver = getValues('approver')
        if (initialConfiguration?.IsDivisionAllowedForDepartment && isFinalApprover) {
            approvalObj.IsSendForApproval = false;
            approvalObj.ApprovalDepartmentId = userDetails().DepartmentId
            approvalObj.DivisionId = division?.value ?? props?.divisionId ?? null
            props.handleOperation(approvalObj, props.isEdit)
        } else {
            setIsDisable(true)
            if (initialConfiguration?.IsMultipleUserAllowForApproval && (!getValues('dept')?.label) && (!IsFinalLevelButtonShow)) {
                Toaster.warning('There is no highest approver defined for this user. Please connect with the IT team.')
                setIsDisable(false)
                return false
            }
            if (type === 'Sender') {
                const bulkuploadArray = (approvalData) => {

                    let bulkuploadIdsArray = []
                    approvalData && approvalData.map(item => {
                        bulkuploadIdsArray.push({ OldRawMaterialId: masterId === 1 ? item?.OldRawMaterialId ?? null : null, MasterRecordId: masterId === 1 ? item?.RawMaterialId : masterId === 2 ? item?.BoughtOutPartId : masterId === 3 ? item?.OperationId : masterId === 4 ? item?.MachineId : null })
                    })

                    return bulkuploadIdsArray

                }

                //THIS OBJ IS FOR MASTER SEND FOR APPROVAL
                let senderObj = {}
                senderObj.ReasonId = reason ? reason.value : 0
                senderObj.Reason = reason ? reason.label : ''
                senderObj.IsFinalApproved = false
                senderObj.DepartmentId = dept && dept.value ? dept.value : ''
                senderObj.DepartmentName = dept && dept.label ? dept.label : ''
                senderObj.ApproverLevelId = approver && approver.levelId ? approver.levelId : ''
                senderObj.ApproverDepartmentId = dept && dept.value ? dept.value : ''
                senderObj.ApproverDepartmentName = dept && dept.label ? dept.label : ''
                senderObj.ApproverLevel = approver && approver.levelName ? approver.levelName : ''
                // senderObj.ApproverId = approver && approver.value ? approver.value : ''
                senderObj.ApproverIdList = initialConfiguration?.IsMultipleUserAllowForApproval ? approverIdList : [approver && approver.value ? approver.value : '']
                senderObj.SenderLevelId = levelDetails?.LevelId
                senderObj.SenderId = loggedInUserId()
                senderObj.SenderLevel = levelDetails?.Level
                senderObj.SenderRemark = remark
                senderObj.LoggedInUserId = loggedInUserId()
                senderObj.IsVendor = approvalObj && Object.keys(approvalObj)?.length > 0 ? approvalObj?.IsVendor : false
                senderObj.EffectiveDate = approvalObj && Object.keys(approvalObj)?.length > 0 ? approvalObj?.EffectiveDate : DayTime(new Date()).format('YYYY-MM-DD HH:mm:ss')
                senderObj.PurchasingGroup = ''
                senderObj.MaterialGroup = ''
                senderObj.CostingTypeId = props?.costingTypeId

                senderObj.ApprovalTypeId = masterId !== 0 ? costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId) : approvalDetails?.ApprovalTypeId
                senderObj.IsFinalApprover = isFinalApprover
                senderObj.DivisionId = division?.value ?? props?.divisionId ?? null
                senderObj.MasterIdList = [

                ]
                senderObj.BudgetingIdList = []

                switch (checkForNull(masterId)) {
                    case 1:                        // CASE 1 FOR RAW MATERIAL
                        if (isBulkUpload) {
                            senderObj.MasterIdList = bulkuploadArray(approvalData)
                            senderObj.MasterCreateRequest = {
                                CreateRawMaterial: {}
                            }
                        } else {
                            senderObj.MasterIdList = []
                            senderObj.MasterCreateRequest = {
                                OldRawMaterialId: lastRevisionRawMaterialDetails[0]?.RawMaterialId,
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
                            senderObj.MasterIdList = bulkuploadArray(approvalData)
                            senderObj.MasterCreateRequest = {
                                CreateBoughtOutPart: {}
                            }
                        } else {
                            senderObj.MasterIdList = []
                            senderObj.MasterCreateRequest = {
                                OldRawMaterialId: null,
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
                            senderObj.MasterIdList = bulkuploadArray(approvalData)
                            senderObj.MasterCreateRequest = {
                                CreateOperationRequest: {}
                            }
                        } else {
                            senderObj.MasterIdList = []
                            senderObj.MasterCreateRequest = {
                                OldRawMaterialId: null,
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
                        //         tempArray.push({ MachineId: item?.MachineId, IsImportEntry: item?.EnteryType === 'Domestic' ? false : true, MachineRequest: {}, CostingTypeId: item?.CostingTypeId })
                        //         return null
                        //     })
                        // } else {
                        //     tempArray.push({ MachineId: EMPTY_GUID, IsImportEntry: IsImportEntry, MachineRequest: approvalObj })
                        // }
                        if (isBulkUpload) {
                            senderObj.MasterIdList = bulkuploadArray(approvalData)
                            senderObj.MasterCreateRequest = {
                                OldRawMaterialId: null,
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
                            FinancialYear: approvalObj?.FinancialYear,
                            NetPoPrice: approvalObj?.NetPoPrice,
                            BudgetedPoPrice: approvalObj?.BudgetedPoPrice,
                            CostingHeadId: approvalObj?.CostingHeadId,
                            PartId: approvalObj?.PartId,
                            RevisionNumber: approvalObj?.RevisionNumber,
                            PlantId: approvalObj?.PlantId,
                            VendorId: approvalObj?.VendorId,
                            CustomerId: approvalObj?.CustomerId,
                            TotalRecordCount: 0,
                            CurrencyId: approvalObj?.CurrencyId,
                            BudgetedPoPriceInCurrency: approvalObj?.BudgetedPoPriceInCurrency,
                            IsSendForApproval: true,
                            IsRecordInsertedBySimulation: false,
                            IsFinancialDataChanged: true,
                            BudgetingPartCostingDetails: approvalObj?.BudgetingPartCostingDetails,
                            ConditionsData: approvalObj?.conditionTableData,
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
                if (props.isRFQ && (checkForNull(masterId) === 1 || checkForNull(masterId) === 2)) {
                    let data = {
                        CostingBestCostRequest: null,
                        RawMaterialBestCostRequest: null,
                        BoughtOutPartBestCostRequest: null
                    };
                    let tempData = null
                    
                    switch (checkForNull(masterId)) {
                        case 1: // Raw Material
                         tempData = { ...viewRmDetails[viewRmDetails?.length - 1] }

data.RawMaterialBestCostRequest = {
                            "QuotationPartId": selectedRows[0]?.QuotationPartId ?? 0,
                            "NetRawMaterialsCost": tempData?.NetLandedCostConversion ?? 0,
                            "OtherCost": tempData?.OtherNetCostConversion ?? 0,
                            "BasicRate": tempData?.BasicRatePerUOMConversion ?? 0,
                        };
                        
                            break;
                        case 2: // Bought Out Part
                        tempData = { ...viewBOPDetails[viewBOPDetails?.length - 1] }
                            data.BoughtOutPartBestCostRequest = {
                                "QuotationPartId": selectedRows[0]?.QuotationPartId ?? 0,
                                "NetBoughtOutPartCost": tempData?.NetLandedCostConversion ?? 0,
                                "OtherCost": tempData?.OtherNetCostConversion ?? 0,
                                "BasicRate": tempData?.BasicRateConversion ?? 0,
                            };
                            break;

                        default:

                            return; // Exit if masterId is neither 1 nor 2
                    }

                    setIsLoader(true);
                    dispatch(rfqSaveBestCosting(data, res => {

                        setIsLoader(false)
                    }))
                }
                // let obj = {}
                // obj.ApprovalProcessSummaryId = approvalDetails.MasterApprovalProcessSummaryId
                // obj.ApprovalProcessId = approvalDetails.ApprovalProcessId
                // obj.ApprovalToken = approvalDetails.Token
                // obj.LoggedInUserId = loggedInUserId()
                // obj.SenderLevelId = levelDetails.LevelId
                // obj.SenderId = loggedInUserId()
                // obj.SenderLevel = levelDetails.Level
                // obj.SenderDepartmentId = dept && dept.value ? dept.value : ''
                // obj.SenderDepartmentName = dept && dept.label ? dept.label : ''
                // // obj.ApproverId = approver && approver.value ? approver.value : ''
                // obj.ApproverIdList = initialConfiguration?.IsMultipleUserAllowForApproval ? approverIdList : [approver && approver.value ? approver.value : '']
                // obj.ApproverLevelId = approver && approver.levelId ? approver.levelId : ''
                // obj.ApproverLevel = approver && approver.levelName ? approver.levelName : ''
                // obj.Remark = remark
                // obj.IsApproved = type === 'Approve' ? true : false
                // obj.IsReject = type === 'Reject' ? true : false
                // obj.IsReturn = type === 'Return' ? true : false
                // obj.ApproverDepartmentId = dept && dept.value ? dept.value : ''
                // obj.ApproverDepartmentName = dept && dept.label ? dept.label : ''
                // obj.IsFinalApprovalProcess = false
                // obj.IsRFQCostingSendForApproval = props.isRFQ ? true : false
                const approvalObjects = Array.isArray(approvalDetails) ? approvalDetails : [approvalDetails];
                console.log(levelDetails);
                const processedApprovalObjects = approvalObjects.map(item => ({
                    
                    
                    ApprovalProcessSummaryId: item?.ApprovalProcessSummaryId !== null ? item?.ApprovalProcessSummaryId : 0,
                    ApprovalProcessId: item?.ApprovalProcessId !== null ? item?.ApprovalProcessId : 0,
                    ApprovalToken: item?.Token !== null ? item?.Token : 0,
                    LoggedInUserId: loggedInUserId(),
                    SenderLevelId: levelDetails.LevelId,
                    SenderId: loggedInUserId(),
                    SenderLevel: levelDetails.Level,
                    SenderDepartmentId: dept && dept.value ? dept.value : '',
                    SenderDepartmentName: dept && dept.label ? dept.label : '',
                    ApproverIdList: initialConfiguration?.IsMultipleUserAllowForApproval ? approverIdList : [approver && approver.value ? approver.value : ''],
                    ApproverLevelId: approver && approver.levelId ? approver.levelId : '',
                    ApproverLevel: approver && approver.levelName ? approver.levelName : '',
                    Remark: remark,
                    IsApproved: type === 'Approve',
                    IsReject: type === 'Reject',
                    IsReturn: type === 'Return',
                    ApproverDepartmentId: dept && dept.value ? dept.value : '',
                    ApproverDepartmentName: dept && dept.label ? dept.label : '',
                    IsFinalApprovalProcess: false,
                    IsRFQCostingSendForApproval: props.isRFQ ? true : false,
                    DivisionId: props?.divisionId ?? null,

                    // Add any other necessary fields from the item
                }));
                setIsLoader(true);
                const processApproval = (objects) => {
console.log(objects);

                    return new Promise((resolve, reject) => {
                        dispatch(approvalOrRejectRequestByMasterApprove(objects, res => {
                            if (res?.data?.Result) {
                                resolve(res);
                            } else {
                                reject(res);
                            }
                        }));
                    });
                };
                processApproval(processedApprovalObjects)
                    .then(() => {
                        setIsDisable(false);
                        setIsLoader(false);
                        if (type === 'Approve') {
                            if (IsPushDrawer) {
                                Toaster.success('The token has been approved');
                            } else {
                                Toaster.success(!IsFinalLevel ? 'The token has been approved' : 'The token has been sent to next level for approval');
                            }
                        } else {
                            Toaster.success(`Token ${type === 'Reject' ? 'Rejected' : "Returned"}`);
                        }
                        props.closeDrawer('', `${type === 'Reject' ? 'reject' : "submit"}`);
                    })
                    .catch((error) => {
                        setIsDisable(false);
                        setIsLoader(false);
                        // Toaster.error('An error occurred while processing tokens');

                    });
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
    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api?.sizeColumnsToFit();
        params.api.paginationGoToPage(0);
        setTimeout(() => {
        }, 100);
    };
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        editable: true
    };
    /**
 * @method effectiveDateFormatter
 * @description Renders buttons
 */
    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    }

    const dashcellFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? cellValue : '-';
    }
    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        effectiveDateFormatter: effectiveDateFormatter,
        dashcellFormatter: dashcellFormatter,
    };
    const lastRevisionToggle = () => {
        setIsLastRevisionOpen(!isLastRevisionOpen)
        setAgGridLoader(false)
    }
    return (
        <>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
            >
                <Container>
                    <div className={'drawer-wrapper layout-min-width-680px'}>
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
                            {(isLoader || agGridLoader) && <LoaderCustom customClass="approve-reject-drawer-loader" />}
                            <Row>
                                {(!IsFinalLevelButtonShow && (type === 'Approve' || type === 'Sender')) && (
                                    <>
                                        {!getConfigurationKey().IsDivisionAllowedForDepartment && <div className="input-group form-group col-md-6 input-withouticon">
                                            <SearchableSelectHookForm
                                                label={`${handleDepartmentHeader()}`}
                                                name={"dept"}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                defaultValue={""}
                                                options={departmentDropdown}
                                                handleChange={handleDepartmentChange}
                                                errors={errors.dept}
                                                disabled={initialConfiguration?.IsMultipleUserAllowForApproval && (!getConfigurationKey().IsDivisionAllowedForDepartment || isDisableDept)}
                                                mandatory={true}
                                                rules={{ required: true }}

                                            />
                                        </div>}
                                        {getConfigurationKey().IsDivisionAllowedForDepartment && isShowDivision && <Col md="6">
                                            <SearchableSelectHookForm
                                                label={"Division"}
                                                name={"Division"}
                                                placeholder={"Select"}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                defaultValue={""}
                                                options={divisionList}
                                                disabled={(Object.keys(getValues('dept')).length === 0)}
                                                handleChange={handleDivisionChange}
                                                errors={errors.Division}
                                                mandatory={true}
                                                rules={{ required: true }}
                                            />
                                        </Col>}
                                        {!isFinalApprover && <div className="input-group form-group col-md-6 input-withouticon">
                                            {initialConfiguration?.IsMultipleUserAllowForApproval ? <>
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
                                        </div>}
                                    </>
                                )}
                                {

                                    (type === 'Sender' && !IsFinalLevel && !isFinalApprover) &&
                                    <>

                                        <div className="input-group form-group col-md-6">
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
                                            !isBulkUpload && (checkForNull(masterId) === 1 || checkForNull(masterId) === 2) &&
                                            <>
                                                {/* <div className="input-group form-group col-md-6">
                                                    <label className='height-0'>Effective Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="EffectiveDate"
                                                            selected={DayTime(approvalObj?.EffectiveDate).isValid() ? new Date(approvalObj?.EffectiveDate) : ''}
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
                                                </div> */}
                                                <div className="input-group form-group col-md-6">
                                                    <label className='height-0'>Effective Date</label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="EffectiveDate"
                                                            selected={DayTime(approvalObj?.EffectiveDate).isValid() ? new Date(approvalObj?.EffectiveDate) : ''}
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
                                                <Col md="6">
                                                    <TooltipCustom id="rm-net-cost-currency" width="350px" tooltipText={props?.toolTipTextObject?.netCostCurrency} />
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
                                                        defaultValue={Object?.keys(approvalObj)?.length > 0 ? checkForDecimalAndNull(approvalObj?.NetLandedCost, initialConfiguration?.NoOfDecimalForPrice) : ''}
                                                        disabled={true}
                                                    />
                                                </Col>
                                                {props?.IsImportEntry && <Col md="6">
                                                    <TooltipCustom width="350px" id="rm-net-cost-base-currency" tooltipText={props?.toolTipTextObject?.netCostBaseCurrency} />
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
                                                        defaultValue={Object.keys(approvalObj)?.length > 0 ? checkForDecimalAndNull(approvalObj?.NetLandedCostConversion, initialConfiguration?.NoOfDecimalForPrice) : ''}
                                                        disabled={true}
                                                    />
                                                </Col>}


                                            </>
                                        }



                                        {
                                            !isBulkUpload && checkForNull(masterId) === 3 &&
                                            <>

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
                                                        defaultValue={Object.keys(approvalObj)?.length > 0 ? checkForDecimalAndNull(approvalObj?.Rate, initialConfiguration?.NoOfDecimalForPrice) : ''}
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
                                                            selected={DayTime(approvalObj?.EffectiveDate).isValid() ? new Date(approvalObj?.EffectiveDate) : ''}
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

                                                    {approvalObj?.MachineProcessRates && approvalObj?.MachineProcessRates.map((item, index) => {

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
                                                                defaultValue={checkForDecimalAndNull(item?.MachineRate, initialConfiguration?.NoOfDecimalForPrice)}
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
                                                            label={`${vendorLabel} (Code)`}
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
                                                        defaultValue={Object.keys(approvalObj)?.length > 0 ? checkForDecimalAndNull(approvalObj?.BudgetedPoPrice, initialConfiguration?.NoOfDecimalForPrice) : ''}
                                                        disabled={true}
                                                        placeholder={'-'}
                                                    />

                                                </div>

                                                <div className="input-group form-group col-md-12">
                                                    <TextFieldHookForm
                                                        label={approvalObj?.Currency ? `Total Sum (${approvalObj?.Currency})` : `Total Sum (Currency)`}
                                                        name={'totalSumCurrency'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.totalSum}
                                                        defaultValue={Object.keys(approvalObj)?.length > 0 ? checkForDecimalAndNull(approvalObj?.BudgetedPoPriceInCurrency, initialConfiguration?.NoOfDecimalForPrice) : ''}
                                                        disabled={true}
                                                        placeholder={'-'}
                                                    />
                                                </div>
                                            </>
                                        }

                                    </>
                                }
                                {!isFinalApprover && <div className="input-group form-group col-md-12">
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

                                </div>}
                            </Row>
                            {getConfigurationKey()?.IsShowMaterialIndexation && Number(masterId) === 1 && type === 'Sender' && <Row className="mb-2 accordian-container">
                                <Col md="6" className='d-flex align-items-center'>
                                    <HeaderTitle
                                        title={'Last Revision Data:'}
                                        customClass={'Personal-Details'}
                                    />
                                </Col>
                                <Col md="6">
                                    <div className={'right-details text-right'}>
                                        <button className="btn btn-small-primary-circle ml-1" onClick={lastRevisionToggle} type="button">{isLastRevisionOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                                    </div>
                                </Col>
                                {isLastRevisionOpen && <Col md="12" className={`ag-grid-react mb-2`}>
                                    <div className={`ag-grid-wrapper budgeting-table  ${lastRevisionRawMaterialDetails && lastRevisionRawMaterialDetails?.length <= 0 ? "overlay-contain" : ""}`} style={{ width: '100%', height: '100%' }}>
                                        <div className="ag-theme-material" >
                                            {lastRevisionRawMaterialDetails?.length === 0 && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                            <>
                                                <AgGridReact
                                                    style={{ height: '100%', width: '100%' }}
                                                    defaultColDef={defaultColDef}
                                                    domLayout='autoHeight'
                                                    // columnDefs={c}
                                                    rowData={lastRevisionRawMaterialDetails}
                                                    // onCellValueChanged={onCellValueChanged}
                                                    pagination={true}
                                                    paginationPageSize={12}
                                                    onGridReady={onGridReady}
                                                    gridOptions={gridOptions}
                                                    // loadingOverlayComponent={'customLoadingOverlay'}
                                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                                    noRowsOverlayComponentParams={{
                                                        title: EMPTY_DATA,
                                                    }}
                                                    frameworkComponents={frameworkComponents}
                                                    // suppressColumnVirtualisation={true}
                                                    stopEditingWhenCellsLoseFocus={true}
                                                >
                                                    <AgGridColumn width={120} field="FrequencyOfSettlement" dashcellFormatter={dashcellFormatter} headerName="Frequency Of Settlement" editable={false}></AgGridColumn>
                                                    <AgGridColumn width={115} field="FromDate" headerName="From Date" cellRenderer='effectiveDateFormatter' editable={false}></AgGridColumn>
                                                    <AgGridColumn width={115} field="ToDate" headerName="To Date" cellRenderer='effectiveDateFormatter' editable={false}></AgGridColumn>
                                                    <AgGridColumn width={115} field='EffectiveDate' headerName='Effective Date' cellRenderer='effectiveDateFormatter' editable={false}></AgGridColumn>
                                                    <AgGridColumn field="NetLandedCost" headerName="Net Cost" dashcellFormatter={dashcellFormatter} editable={false} cellRenderer='priceFormatter'></AgGridColumn>
                                                </AgGridReact>
                                            </>
                                        </div>
                                    </div>
                                </Col >}
                            </Row>}
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-sm-12 text-right bluefooter-butn">
                                    <button
                                        type={'button'}
                                        className="reset mr15 cancel-btn"
                                        onClick={toggleDrawer}
                                        disabled={false}
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
                                        {isFinalApprover || type === 'Approve' || type === 'Reject' ? 'Submit' : 'Send For Approval'}
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
