import React, { Fragment, useState, useEffect, useRef } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Toaster from '../../../common/Toaster'
import Drawer from '@material-ui/core/Drawer'
import { SearchableSelectHookForm, TextAreaHookForm, DatePickerHookForm, NumberFieldHookForm, AllApprovalField, } from '../../../layout/HookFormInputs'
import { getReasonSelectList, getAllApprovalDepartment, getAllApprovalUserFilterByDepartment, sendForApprovalBySender, approvalRequestByApprove } from '../../actions/Approval'
import { getConfigurationKey, handleDepartmentHeader, loggedInUserId, showApprovalDropdown, userDetails } from '../../../../helper/auth'
import { setCostingApprovalData, setCostingViewData, fileUploadCosting, checkFinalUser, getReleaseStrategyApprovalDetails } from '../../actions/Costing'
import { getVolumeDataByPartAndYear, checkRegularizationLimit } from '../../../masters/actions/Volume'

import { calculatePercentageValue, checkForDecimalAndNull, checkForNull, userTechnologyLevelDetails, validateFileName } from '../../../../helper'
import DayTime from '../../../common/DayTimeWrapper'
import WarningMessage from '../../../common/WarningMessage'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import PushSection from '../../../common/PushSection'
import { debounce } from 'lodash'
import Dropzone from 'react-dropzone-uploader'
import { EMPTY_GUID, FILE_URL, NCC, NCCTypeId, RELEASESTRATEGYTYPEID1, RELEASESTRATEGYTYPEID2, RELEASESTRATEGYTYPEID3, RELEASESTRATEGYTYPEID4, VBC, VBCTypeId, ZBC, ZBCTypeId, RELEASESTRATEGYTYPEID6, ReleaseStrategyB6 } from "../../../../config/constants";
import redcrossImg from "../../../../assests/images/red-cross.png";
import VerifyImpactDrawer from '../../../simulation/components/VerifyImpactDrawer';
import PushSection from '../../../common/PushSection'
import LoaderCustom from '../../../common/LoaderCustom'
import TooltipCustom from '../../../common/Tooltip'
import { getUsersTechnologyLevelAPI, getAllDivisionListAssociatedWithDepartment } from '../../../../actions/auth/AuthActions'
import { rfqSaveBestCosting } from '../../../rfq/actions/rfq'
import { getApprovalTypeSelectList } from '../../../../actions/Common'
import { reactLocalStorage } from 'reactjs-localstorage'
import { transformApprovalItem } from '../../../common/CommonFunctions'
import { checkSAPPoPrice } from '../../../simulation/actions/Simulation'
import SAPApproval from '../../../SAPApproval'
import { useLabels } from '../../../../helper/core'
import { AttachmentValidationInfo } from '../../../../config/message'

const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]
const SendForApproval = (props) => {
  const dropzone = useRef(null);
  const { isApprovalisting, selectedRows, mandatoryRemark, dataSelected, callSapCheckAPI } = props
  const dispatch = useDispatch()
  const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const reasonsList = useSelector((state) => state.approval.reasonsList)
  const deptList = useSelector((state) => state.approval.approvalDepartmentList)
  const viewApprovalData = useSelector((state) => state.costing.costingApprovalData)
  const SAPData = useSelector(state => state.approval.SAPObj)

  const partNo = useSelector((state) => state.costing.partNo)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { IsApprovalLevelFilterByPlant } = initialConfiguration

  const [selectedDepartment, setSelectedDepartment] = useState([])
  const [selectedApprover, setSelectedApprover] = useState('')
  const [selectedApproverLevelId, setSelectedApproverLevelId] = useState('')
  const [financialYear, setFinancialYear] = useState('')
  const [approvalDropDown, setApprovalDropDown] = useState([])
  const [showValidation, setShowValidation] = useState(false)
  const [approver, setApprover] = useState('')
  const [dataToPush, setDataToPush] = useState({})
  const [isDisable, setIsDisable] = useState('')
  const [isRegularize, setIsRegularize] = useState(false);
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [isVerifyImpactDrawer, setIsVerifyImpactDrawer] = useState(false)
  const [costingApprovalDrawerData, setCostingApprovalDrawerData] = useState({})
  const [attachmentLoader, setAttachmentLoader] = useState(false)
  const [isLoader, setIsLoader] = useState(false)
  const [effectiveDate, setEffectiveDate] = useState('')
  const [dataToChange, setDataToChange] = useState([]);
  const [IsLimitCrossed, setIsLimitCrossed] = useState(false);
  const [tentativeCost, setTentativeCost] = useState(false);
  const [levelDetails, setLevelDetails] = useState('');
  const [disableDept, setDisableDept] = useState(false)
  const { vendorLabel } = useLabels()
  const [disableRS, setDisableRS] = useState(false);
  const [isPFSOrBudgetingDetailsExistWarning, showIsPFSOrBudgetingDetailsExistWarning] = useState(false);
  const [approvalTypeId, setApprovalTypeId] = useState('')
  // const [showDate,setDate] = useState(false)
  // const [showDate,setDate] = useState(false)
  const userData = userDetails()
  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
  const [approvalType, setApprovalType] = useState('');
  const [technologyLevelsList, setTechnologyLevelsList] = useState({});
  const approvalTypeSelectList = useSelector(state => state.comman.approvalTypeSelectList)
  const [costingIdArray, setCostingIdArray] = useState([])
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [count, setCount] = useState(0)
  const [approverIdList, setApproverIdList] = useState([])
  const [noApprovalExistMessage, setNoApprovalExistMessage] = useState('')
  const [isShowDivision, setIsShowDivision] = useState(false)
  const [divisionList, setDivisionList] = useState([])
  const [division, setDivision] = useState('')
  const [checkMultiDept, setCheckMultiDept] = useState(false)

  const apicall = (technologyId, depart, ApprovalTypeId, isdisable, levelsList, divisionId = '') => {

    dispatch(getReasonSelectList((res) => { }))

    let regularizationObj = {}

    let drawerDataObj = {}
    drawerDataObj.EffectiveDate = viewApprovalData[0]?.effectiveDate
    drawerDataObj.CostingHead = viewApprovalData[0]?.costingTypeId === ZBCTypeId ? ZBC : VBC
    drawerDataObj.Technology = technologyId
    setCostingApprovalDrawerData(drawerDataObj);

    regularizationObj.technologyId = viewApprovalData[0]?.technologyId
    regularizationObj.partId = viewApprovalData[0]?.partId
    regularizationObj.destinationPlantId = viewApprovalData[0]?.destinationPlantId
    regularizationObj.vendorId = viewApprovalData[0]?.vendorId

    if (viewApprovalData[0]?.costingTypeId === NCCTypeId) {
      dispatch(checkRegularizationLimit(regularizationObj, (res) => {
        if (res && res?.data && res?.data?.Data) {
          let Data = res.data.Data
          setDataToChange(Data)
        }
      }))
    }

    dispatch(getAllApprovalDepartment((res) => {
      const Data = res?.data?.SelectList
      const departObj = Data && Data.filter(item => item.Value === depart)
      setSelectedDepartment({ label: departObj[0]?.Text, value: departObj[0]?.Value })
      setValue('dept', { label: departObj[0]?.Text, value: departObj[0]?.Value })
      let approverIdListTemp = []
      let requestObject = {
        LoggedInUserId: userData.LoggedInUserId,
        DepartmentId: departObj[0]?.Value,
        TechnologyId: technologyId,
        ReasonId: 0, // key only for minda
        ApprovalTypeId: ApprovalTypeId,
        plantId: (IsApprovalLevelFilterByPlant && viewApprovalData[0]?.destinationPlantId) ? viewApprovalData[0]?.destinationPlantId : null,
        DivisionId: divisionId ?? null
      }
      dispatch(getAllApprovalUserFilterByDepartment(requestObject, (res) => {
        let tempDropdownList = []
        if (res.data.DataList.length === 1) {
          return false
        }
        res.data.DataList && res.data.DataList.map((item) => {
          if (item.Value === '0') return false;
          if (item.Value === EMPTY_GUID) return false;
          tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
          approverIdListTemp.push(item.Value)
          return null
        })
        const Data = res.data.DataList[1]
        if (isdisable) {
          setDisableRS(true)
        } else {
          setDisableRS(false)
        }
        setApprover(Data.Text)
        setSelectedApprover(Data.Value)
        setSelectedApproverLevelId({ levelName: Data.LevelName, levelId: Data.LevelId })
        if (tempDropdownList?.length !== 0) {
          if (!initialConfiguration.IsMultipleUserAllowForApproval) {
            setValue('approver', { label: Data.Text, value: Data.Value })
          }
          setShowValidation(false)
        } else {
          setShowValidation(true)
        }
        setApprovalDropDown(tempDropdownList)
        setApproverIdList(approverIdListTemp)
      }))
    }))
    userTechnology(ApprovalTypeId, levelsList)
  }

  useEffect(() => {
    dispatch(getReasonSelectList((res) => { }))
    dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), props.technologyId, (res) => {
      setTechnologyLevelsList(res?.data?.Data)
      if (initialConfiguration.IsReleaseStrategyConfigured) {
        dispatch(getApprovalTypeSelectList('', (departmentRes) => {
          let data = []
          viewApprovalData && viewApprovalData?.map(item => {
            let obj = {}
            obj.CostingId = item?.costingId
            data.push(obj)
          })
          let requestObject = {
            "RequestFor": "COSTING",
            "TechnologyId": props.technologyId,
            "LoggedInUserId": loggedInUserId(),
            "ReleaseStrategyApprovalDetails": data
          }
          dispatch(getReleaseStrategyApprovalDetails(requestObject, (response) => {
            if (response?.data?.Data?.IsUserInApprovalFlow && !response?.data?.Data?.IsFinalApprover) {
              const approvalTypevalue = { label: getApprovalTypeName(response.data.Data?.ApprovalTypeId, departmentRes?.data?.SelectList), value: response.data.Data?.ApprovalTypeId }
              setValue("ApprovalType", approvalTypevalue)
              setApprovalType(approvalTypevalue?.value)
              apicall(props.technologyId, response?.data?.Data?.DepartmentId, response.data.Data?.ApprovalTypeId, true, res?.data?.Data)
            } else if (response?.data?.Data?.IsPFSOrBudgetingDetailsExist === false) {
              showIsPFSOrBudgetingDetailsExistWarning(true)
              apicall(props.technologyId, userData.DepartmentId, viewApprovalData[0]?.costingTypeId, false, res?.data?.Data)
            } else if (response?.data?.Result === false) {
            } else {
            }
          }))
        }))
      } else {
        if (!getConfigurationKey().IsDivisionAllowedForDepartment) {
          apicall(props.technologyId, userData.DepartmentId, viewApprovalData[0]?.costingTypeId, false, res?.data?.Data)
        }
        setApprovalType(viewApprovalData[0]?.costingTypeId)
      }

    }))

    let requestArray = []
    let requestObject = {}
    viewApprovalData && viewApprovalData.map((item) => {
      requestArray.push(item.costingId)
      return null
    })
    requestObject.IsCreate = true
    requestObject.CostingId = requestArray
    setCostingIdArray(requestObject)
  }, [])

  useEffect(() => {
    dispatch(getAllApprovalDepartment((res) => {
      const Data = res?.data?.SelectList
      const Departments = userDetails().Department && userDetails().Department.map(item => item.DepartmentName)
      const updateList = Data && Data.filter(item => Departments.includes(item.Text))
      if ((updateList && updateList?.length === 1) || !checkMultiDept) {

        setDisableDept(true)
        setValue('dept', { label: updateList[0]?.Text, value: updateList[0]?.Value })
        setSelectedDepartment({ label: updateList[0]?.Text, value: updateList[0]?.Value })
        fetchDivisionList([updateList[0]?.Value])
      }
      let approverIdListTemp = []
      let requestObject = {
        LoggedInUserId: userData.LoggedInUserId,
        DepartmentId: updateList[0]?.Value,
        TechnologyId: props.technologyId,
        ReasonId: 0, // key only for minda
        ApprovalTypeId: viewApprovalData[0]?.costingTypeId,
        plantId: (IsApprovalLevelFilterByPlant && viewApprovalData[0]?.destinationPlantId) ? viewApprovalData[0]?.destinationPlantId : null
      }
      if (!initialConfiguration.IsReleaseStrategyConfigured && !getConfigurationKey().IsDivisionAllowedForDepartment) {
        dispatch(getAllApprovalUserFilterByDepartment(requestObject, (res) => {
          let tempDropdownList = []
          if (res.data.DataList.length === 1) {
            return false
          }
          res.data.DataList && res.data.DataList.map((item) => {
            if (item.Value === '0') return false;
            if (item.Value === EMPTY_GUID) return false;
            tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
            approverIdListTemp.push(item.Value)
            return null
          })
          const Data = res.data.DataList[1]
          setApprover(Data.Text)
          setSelectedApprover(Data.Value)
          setSelectedApproverLevelId({ levelName: Data.LevelName, levelId: Data.LevelId })
          if (tempDropdownList?.length !== 0) {
            if (!initialConfiguration.IsMultipleUserAllowForApproval) {
              setValue('approver', { label: Data.Text, value: Data.Value })
            }
          } else {
            setShowValidation(true)
          }
          setApprovalDropDown(tempDropdownList)
          setApproverIdList(approverIdListTemp)
        }))
      }
    }))
  }, [])
  useEffect(() => {
    if (deptList && deptList.length > 1 && approvalType && !getConfigurationKey().IsDivisionAllowedForDepartment) {
      const filterDeprtment = deptList.filter(item => item.Value === userData.DepartmentId)
      callCheckFinalUserApi(filterDeprtment[0]?.Value, approvalType)
    }
  }, [deptList, approvalType])
  const userTechnology = (approvalTypeId, levelsList) => {
    let levelDetailsTemp = ''
    levelDetailsTemp = userTechnologyLevelDetails(approvalTypeId, levelsList?.TechnologyLevels)
    setLevelDetails(levelDetailsTemp)
  }

  const getApprovalTypeName = (approvalType, departmentList) => {
    let approvalTypeName = departmentList && departmentList?.filter(element => Number(element?.Value) === Number(approvalType))[0]
    return approvalTypeName?.Text
  }


  useEffect(() => {
    if (initialConfiguration?.IsSAPConfigured && viewApprovalData && viewApprovalData?.length === 1 && count === 0 && callSapCheckAPI === true) {//&& !isSimulationApprovalListing
      setIsLoader(true)
      dispatch(checkSAPPoPrice('', viewApprovalData[0]?.costingId, res => {
        setCount(count + 1)
        let status = 200
        if ('response' in res) {

          status = res && res?.response?.status
        }
        if (status !== undefined && status === 200) {
          setIsDisableSubmit(false)
        } else {
          setIsDisableSubmit(true)
        }
        setIsLoader(false)
      }))
    }
  }, [viewApprovalData])

  /**
   * @method renderDropdownListing
   * @description DROPDOWN
   */
  const renderDropdownListing = (label) => {
    const tempDropdownList = []

    if (label === 'Reason') {
      reasonsList && reasonsList.map((item) => {
        if (item.Value === '0') return false
        tempDropdownList.push({ label: item.Text, value: item.Value })
        return null
      })
      return tempDropdownList
    }

    if (label === 'Dept') {
      deptList && deptList.map((item) => {
        if (item.Value === '0') return false
        tempDropdownList.push({ label: item.Text, value: item.Value })
        return null
      })
      return tempDropdownList
    }

    if (label === 'ApprovalType') {
      approvalTypeSelectList && approvalTypeSelectList.map((item) => {
        const transformedText = transformApprovalItem(item);
        if ((Number(item.Value) === Number(RELEASESTRATEGYTYPEID1) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID2) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID3) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID4) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID6)) && !props?.isRfq) tempDropdownList.push({ label: transformedText, value: item.Value })
        if ((Number(item.Value) === Number(RELEASESTRATEGYTYPEID1) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID2) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID6)) && props?.isRfq) tempDropdownList.push({ label: transformedText, value: item.Value })
        return null
      })
      return tempDropdownList
    }

    // if (label === 'ApprovalType') {
    //   approvalTypeSelectList && approvalTypeSelectList.map((item) => {
    //     if (Number(item.Value) === Number(RELEASESTRATEGYTYPEID1) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID2) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID3) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID4)) tempDropdownList.push({ label: item.Text, value: item.Value })
    //     return null
    //   })
    //   return tempDropdownList
    // }
  }

  /**
   * @method handleApprovalTypeChange
   * @description  Approval Type Change
   */
  const handleApprovalTypeChange = (newValue) => {
    setApprovalType(newValue.value)
    setApprover('')
    setValue('approver', '')
    userTechnology(newValue.value, technologyLevelsList)
  }


  useEffect(() => {
    if (approvalType?.length > 0) {
      handleDepartmentChange(getValues('dept'))
    }
  }, [approvalType])

  /**
   * @method handleDepartmentChange
   * @description  USED TO HANDLE DEPARTMENT CHANGE
   */

  const callCheckFinalUserApi = (newValue, approvaltypeTest = approvalType, divisionId = '') => {
    const tempDropdownList = []
    let requestObject = {
      LoggedInUserId: userData.LoggedInUserId,
      DepartmentId: newValue,
      TechnologyId: props.technologyId,
      ApprovalTypeId: approvaltypeTest,
      plantId: (IsApprovalLevelFilterByPlant && viewApprovalData[0]?.destinationPlantId) ? viewApprovalData[0]?.destinationPlantId : null,
      DivisionId: divisionId
    }
    let Data = []
    let approverIdListTemp = []
    let obj = {
      DepartmentId: newValue,
      UserId: loggedInUserId(),
      TechnologyId: props.technologyId,
      Mode: 'costing',
      approvalTypeId: approvaltypeTest,
      plantId: (IsApprovalLevelFilterByPlant && viewApprovalData[0]?.destinationPlantId) ? viewApprovalData[0]?.destinationPlantId : null,
      divisionId: (divisionId || divisionId !== '') ? divisionId : null
    }
    dispatch(checkFinalUser(obj, (res) => {
      const data = res?.data?.Data
      if (data?.IsUserInApprovalFlow === true && data?.IsFinalApprover === false) {
        dispatch(getAllApprovalUserFilterByDepartment(requestObject, (res) => {
          Data = res.data.DataList[1] ? res.data.DataList[1] : []
          setSelectedApprover(Data?.Value)
          setSelectedApproverLevelId({ levelName: Data.LevelName, levelId: Data.LevelId })
          res.data.DataList && res.data.DataList.map((item) => {
            if (item.Value === '0') return false;
            if (item.Value === EMPTY_GUID) return false;
            tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
            approverIdListTemp.push(item.Value)
            return null
          })
          if (tempDropdownList?.length === 0) {
            setShowValidation(true)
          } else {
            setApprover(Data.Text ? Data.Text : '')
            setShowValidation(false)
            if (!initialConfiguration.IsMultipleUserAllowForApproval) {
              setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })
            }
          }
          setApprovalDropDown(tempDropdownList)
          setApproverIdList(approverIdListTemp)
          setNoApprovalExistMessage('')
        }))
      } else if (data?.IsUserInApprovalFlow === false) {
        setValue('approver', { label: '', value: '', levelId: '', levelName: '' })
        setApprover('')
        setSelectedApprover('')
        setApprovalDropDown([])
        setApproverIdList([])
        Toaster.warning('This user is not in approval flow.')
        setNoApprovalExistMessage('')
        return false
      } else if (data?.IsNextLevelUserExist === false && data?.IsUserInApprovalFlow === true && data?.IsFinalApprover === false) {
        setValue('approver', { label: '', value: '', levelId: '', levelName: '' })
        setApprover('')
        setSelectedApprover('')
        setApprovalDropDown([])
        setApproverIdList([])
        setNoApprovalExistMessage('There is no higher approver available for this user in this department.')
        return false
      } else if (data?.IsUserInApprovalFlow === true && data?.IsFinalApprover === true && data?.IsNextLevelUserExist === false) {
        setValue('approver', { label: '', value: '', levelId: '', levelName: '' })
        setApprover('')
        setSelectedApprover('')
        setApprovalDropDown([])
        setApproverIdList([])
        setNoApprovalExistMessage('This user is final approver.')
        Toaster.warning('This user is final approver.')
        setNoApprovalExistMessage('')
        return false
      }

    }))
  }
  const fetchDivisionList = (departmentIds) => {
    let obj = {
      DepartmentIdList: departmentIds,
      IsApproval: false
    }
    dispatch(getAllDivisionListAssociatedWithDepartment(obj, res => {
      if (res && res?.data && res?.data?.Identity === true) {
        setIsShowDivision(true)
        const divisionArray = res?.data?.DataList
          ?.filter(item => String(item?.DivisionId) !== '0')
          .map(item => ({
            label: `${item.DivisionNameCode}`,
            value: (item?.DivisionId)?.toString(),
            DivisionCode: item?.DivisionCode
          }));
        setDivisionList(divisionArray)
      } else {
        setIsShowDivision(false)
        setDivisionList([])
        callCheckFinalUserApi(initialConfiguration.IsReleaseStrategyConfigured ? departmentIds : departmentIds?.[0], initialConfiguration.IsReleaseStrategyConfigured ? approvalType : viewApprovalData[0]?.costingTypeId)
      }
    }))
  }

  const handleDepartmentChange = (newValue) => {

    if (newValue && newValue !== '') {
      if (getConfigurationKey().IsDivisionAllowedForDepartment) {
        setDivisionList([])
        setDivision('')
        setValue('Division', '')
        setValue('approver', '')
        setApprover('')
        setApprovalDropDown([])
        setShowValidation(false)
        let departmentIds = [newValue.value]
        fetchDivisionList(departmentIds)
      } else {
        setDivisionList([])
        setDivision('')
        callCheckFinalUserApi(newValue?.value, approvalType)
      }
      setValue('approver', '')
      setApprover('')
      setSelectedApprover('')
      setShowValidation(false)
      setSelectedDepartment(newValue)
    } else {
      setSelectedDepartment('')
    }
  }
  const handleDivisionChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      setDivision(newValue)
      callCheckFinalUserApi(selectedDepartment?.value, approvalType, newValue?.value)
    } else {
      setDivision('')
    }
  }
  /**
   * @method handleReasonChange
   * @param {*} data
   * @param {*} index
   * @description This method is used to handle change of reason for every costing
   */
  const handleReasonChange = (data, index) => {


    let viewDataTemp = viewApprovalData
    let temp = viewApprovalData[index]
    temp.reason = data.label
    temp.reasonId = data.value
    viewDataTemp[index] = temp

    dispatch(setCostingApprovalData(viewDataTemp))
  }



  /**
   * @method handleEffectiveDateChange
   * @param {*} date
   * @param {*} index
   * @description This method is used to handle change of date and calculate consumption and remaining quantity and other details
   */
  const handleEffectiveDateChange = (date, index) => {
    let viewDataTemp = viewApprovalData
    let temp = viewApprovalData[index]
    temp.effectiveDate = date
    let month = date.getMonth()
    let year = ''
    let sequence = SEQUENCE_OF_MONTH[month]

    if (month <= 2) {
      year = `${date.getFullYear() - 1}-${date.getFullYear()}`
    } else {
      year = `${date.getFullYear()}-${date.getFullYear() + 1}`
    }
    setFinancialYear(year)

    dispatch(getVolumeDataByPartAndYear(partNo.value ? partNo.value : partNo.partId, year, viewApprovalData[index]?.costingTypeId === ZBCTypeId ? viewApprovalData[index]?.plantId : viewApprovalData[index]?.destinationPlantId, viewApprovalData[index]?.vendorId, viewApprovalData[index]?.customerId, viewApprovalData[index]?.costingTypeId, (res) => {
      if (res.data.Result === true || res.status === 202) {
        let approvedQtyArr = res.data.Data.VolumeApprovedDetails
        let budgetedQtyArr = res.data.Data.VolumeBudgetedDetails
        let actualQty = 0
        let totalBudgetedQty = 0
        let actualRemQty = 0
        approvedQtyArr.map((data) => {
          if (data.Sequence < sequence) {
            actualQty += parseInt(data.ApprovedQuantity)
          } else if (data.Sequence >= sequence) {
            actualRemQty += parseInt(data.ApprovedQuantity)
          }
          return null
        })
        budgetedQtyArr.map((data) => (

          // if (data.Sequence >= sequence) {
          totalBudgetedQty += parseInt(data.BudgetedQuantity)
          // }
        ))
        temp.consumptionQty = checkForNull(actualQty)
        temp.remainingQty = checkForNull(totalBudgetedQty - actualQty)
        temp.annualImpact = temp.variance !== '' ? totalBudgetedQty * temp.variance : 0
        temp.yearImpact = temp.variance !== '' ? (totalBudgetedQty - actualQty) * temp.variance : 0
        viewDataTemp[index] = temp
        dispatch(setCostingApprovalData(viewDataTemp))
      }

    }),
    )
  }





  /**
   * @method onSubmit
   * @param {*} data
   * @description This method is called on the submission of the form for send for approval
   */



  const onSubmit = debounce(handleSubmit((data) => {
    let count = 0
    viewApprovalData.map((item) => {
      if (item.effectiveDate === '') {
        count = count + 1
      }
      return null
    })
    if (Number(count) !== 0) {
      Toaster.warning('Please select effective date for all the costing')
      return false
    }
    if (isRegularize && files?.length === 0) {
      Toaster.warning('Please upload file to send for approval.')
      return false
    }
    if (initialConfiguration.IsMultipleUserAllowForApproval && approvalDropDown.length === 0) {
      Toaster.warning('There is no selected approver.')
      return false
    }

    if (props?.isRfq) {
      let tempData = { ...viewCostingData[viewCostingData?.length - 1] }

      let data = {
        CostingBestCostRequest: {
          "QuotationPartId": selectedRows[0]?.QuotationPartId,
          "NetRawMaterialsCost": tempData?.netRM,
          "NetBoughtOutPartCost": tempData?.netBOP,
          "NetConversionCost": tempData?.nConvCost,
          "NetProcessCost": tempData?.netProcessCost,
          "NetOperationCost": tempData?.netOperationCost,
          "NetOtherOperationCost": tempData?.netOtherOperationCost,
          "NetTotalRMBOPCC": tempData?.nTotalRMBOPCC,
          "NetSurfaceTreatmentCost": tempData?.netSurfaceTreatmentCost,
          "OverheadCost": 0,
          "ProfitCost": 0,
          "RejectionCost": tempData?.netRejectionCostView,
          "ICCCost": 0,
          "PaymentTermCost": 0,
          "NetOverheadAndProfitCost": tempData?.nOverheadProfit,
          "PackagingCost": 0,
          "FreightCost": 0,
          "NetFreightPackagingCost": tempData?.nPackagingAndFreight,
          "NetToolCost": tempData?.totalToolCost,
          "DiscountCost": tempData?.otherDiscountCost,
          "OtherCost": tempData?.anyOtherCost,
          "BasicRate": tempData?.BasicRate,
          "NetPOPrice": tempData?.nPOPrice,
          "NetPOPriceOtherCurrency": tempData?.nPoPriceCurrency
        },
        RawMaterialBestCostRequest: null,
        BoughtOutPartBestCostRequest: null
      }
      setIsLoader(true)
      dispatch(rfqSaveBestCosting(data, res => {
        setIsLoader(false)
      }))

      let temp = []

      viewApprovalData.map((data) => {


        let tempObj = {}
        tempObj.ApprovalProcessSummaryId = data.ApprovalProcessSummaryId
        tempObj.ApprovalToken = data.ApprovalToken
        tempObj.ApproverDepartmentId = selectedDepartment.value
        tempObj.ApproverDepartmentName = selectedDepartment.label
        // tempObj.ApproverLevelId = !isFinalApproverShow ? selectedApproverLevelId.levelId : userData.LoggedInLevelId
        // tempObj.ApproverLevel = !isFinalApproverShow ? selectedApproverLevelId.levelName : userData.LoggedInLevel
        // tempObj.Approver = !isFinalApproverShow ? selectedApprover : userData.LoggedInUserId
        tempObj.ApproverLevelId = selectedApproverLevelId.levelId
        tempObj.ApproverLevel = selectedApproverLevelId.levelName
        tempObj.Approver = selectedApprover

        // ApproverLevelId: "4645EC79-B8C0-49E5-98D6-6779A8F69692", // approval dropdown data here
        // ApproverId: "566E7AB0-804F-403F-AE7F-E7B15A289362",// approval dropdown data here
        tempObj.ApproverIdList = initialConfiguration.IsMultipleUserAllowForApproval ? approverIdList : [selectedApprover]
        tempObj.SenderLevelId = levelDetails.LevelId
        tempObj.SenderLevel = levelDetails.Level
        tempObj.SenderId = userData.LoggedInUserId
        // tempObj.SenderRemark = data.remarks
        tempObj.LoggedInUserId = userData.LoggedInUserId
        tempObj.ReasonId = data.reasonId
        tempObj.Reason = data.reason
        tempObj.FinancialYear = financialYear
        tempObj.OldPOPrice = data.oldPrice ? data.oldPrice : 0
        tempObj.NewPoPrice = data.revisedPrice ? data.revisedPrice : 0
        tempObj.POCurrency = data.nPOPriceWithCurrency ? data.nPOPriceWithCurrency : 0
        tempObj.CurrencyRate = data.currencyRate ? data.currencyRate : 0
        tempObj.Variance = data.variance ? data.variance : 0
        tempObj.ConsumptionQuantity = data.consumptionQty
        tempObj.RemainingQuantity = data.remainingQty
        tempObj.AnnualImpact = data.annualImpact
        tempObj.ImpactOfTheYear = data.yearImpact
        tempObj.Remark = getValues("remarks")
        tempObj.IsApproved = true
        tempObj.BasicRate = data.BasicRate
        tempObj.BudgetedPrice = data.BudgetedPrice
        tempObj.BudgetedPriceVariance = data.BudgetedPriceVariance
        tempObj.IsRFQCostingSendForApproval = props?.isRfq ? true : false
        tempObj.ApprovalTypeId = approvalType
        tempObj.DivisionId = division?.value ?? null
        temp.push(tempObj)
        return null
      })



      // action

      dispatch(approvalRequestByApprove(temp, res => {

        if (res?.data?.Result) {
          // if (isFinalApproverShow) {
          //   Toaster.success('The costing has been approved')

          // } else {
          //   Toaster.success(isFinalApproverShow ? 'The costing has been approved' : 'The costing has been sent to next level for approval')

          //   props.closeDrawer('', 'submit')
          // }
          Toaster.success('The costing has been sent to next level for approval')
          props.closeDrawer('', 'submit')
        }
        props?.cancel()
      }))




    } else {


      let obj = {
        ApproverDepartmentId: selectedDepartment.value,
        ApproverDepartmentName: selectedDepartment.label,
        ApproverLevelId: selectedApproverLevelId.levelId,
        ApproverLevel: selectedApproverLevelId.levelName,
        // ApproverId: selectedApprover,
        ApproverIdList: initialConfiguration.IsMultipleUserAllowForApproval ? approverIdList : [selectedApprover],
        // ApproverLevelId: !isFinalApproverShow ? selectedApproverLevelId.levelId : userData.LoggedInLevelId,
        // ApproverLevel: !isFinalApproverShow ? selectedApproverLevelId.levelName : userData.LoggedInLevel,
        // ApproverId: !isFinalApproverShow ? selectedApprover : userData.LoggedInUserId,

        // ApproverLevelId: "4645EC79-B8C0-49E5-98D6-6779A8F69692", // approval dropdown data here
        // ApproverId: "566E7AB0-804F-403F-AE7F-E7B15A289362",// approval dropdown data here
        SenderLevelId: levelDetails.LevelId,
        SenderLevel: levelDetails.Level,
        SenderId: userData.LoggedInUserId,
        SenderRemark: data.remarks,
        LoggedInUserId: userData.LoggedInUserId,
        ApprovalTypeId: viewApprovalData[0].costingTypeId,
        IsTentativeSaleRate: tentativeCost
        // Quantity: getValues('Quantity'),
        // Attachment: files,
        // IsLimitCrossed: IsLimitCrossed
      }

      let temp = []

      setIsDisable(true)

      viewApprovalData.map((data) => {

        let tempObj = {}
        tempObj.ApprovalProcessId = "00000000-0000-0000-0000-000000000000"
        tempObj.TypeOfCosting = data.typeOfCosting
        tempObj.PlantId =
          (data.costingTypeId === ZBCTypeId) ? data.plantId : ''
        tempObj.PlantNumber =
          (data.costingTypeId === ZBCTypeId) ? data.plantCode : ''
        tempObj.PlantName =
          (data.costingTypeId === ZBCTypeId) ? data.plantName : ''
        tempObj.PlantCode =
          (data.costingTypeId === ZBCTypeId) ? data.plantCode : ''
        tempObj.CostingId = data.costingId
        tempObj.CostingNumber = data.costingName
        tempObj.ReasonId = data.reasonId
        tempObj.Reason = data.reason
        tempObj.ECNNumber = ''
        // tempObj.ECNNumber = 1;
        tempObj.EffectiveDate = DayTime(data.effectiveDate).format('YYYY-MM-DD HH:mm:ss')
        tempObj.RevisionNumber = partNo.revisionNumber
        tempObj.PartName = isApprovalisting ? data.partName : partNo.partName
        // tempObj.PartName = "Compressor"; // set data for this is in costing summary,will come here
        tempObj.PartNumber = isApprovalisting ? data.partNo : partNo.partNumber //label
        tempObj.PartId = isApprovalisting ? data.partId : partNo.partId
        // tempObj.PartNumber = "CP021220";// set data for this is in costing summary,will come here
        tempObj.FinancialYear = financialYear
        tempObj.OldPOPrice = data.oldPrice
        tempObj.NewPoPrice = data.revisedPrice
        tempObj.POCurrency = data.nPOPriceWithCurrency
        tempObj.CurrencyRate = data.currencyRate
        tempObj.Variance = data.variance
        tempObj.ConsumptionQuantity = data.consumptionQty
        tempObj.RemainingQuantity = data.remainingQty
        tempObj.AnnualImpact = data.annualImpact
        tempObj.ImpactOfTheYear = data.yearImpact
        tempObj.VendorId =
          (data.costingTypeId === VBCTypeId) ? data.vendorId : ''
        tempObj.VendorCode =
          (data.costingTypeId === VBCTypeId) ? data.vendorCode : ''
        tempObj.VendorPlantId =
          (data.costingTypeId === VBCTypeId) ? data.vendorePlantId : ''
        tempObj.VendorPlantCode =
          (data.costingTypeId === VBCTypeId) ? data.vendorPlantCode : ''
        tempObj.VendorName =
          (data.costingTypeId === VBCTypeId) ? data.vendorName : ''
        tempObj.VendorPlantName =
          (data.costingTypeId === VBCTypeId) ? data.vendorPlantName : ''
        tempObj.IsFinalApproved = false
        tempObj.DestinationPlantCode = data.destinationPlantCode
        tempObj.DestinationPlantName = data.destinationPlantName
        tempObj.DestinationPlantId = data.destinationPlantId
        tempObj.NCCPartQuantity = getValues('Quantity')
        tempObj.Attachment = files
        tempObj.IsRegularized = isRegularize
        tempObj.IsRegularizationLimitCrossed = IsLimitCrossed
        tempObj.CostingTypeId = data.costingTypeId
        tempObj.CustomerId = data.customerId
        tempObj.CustomerName = data.customerName
        tempObj.CustomerCode = data.customerCode
        tempObj.BasicRate = data.BasicRate
        tempObj.BudgetedPrice = data.BudgetedPrice
        tempObj.BudgetedPriceVariance = data.BudgetedPriceVariance
        temp.push(tempObj)
        return null
      })
      obj.CostingsList = temp
      obj.MaterialGroup = SAPData.MaterialGroup?.label
      obj.DecimalOption = SAPData.DecimalOption?.value
      obj.ApprovalTypeId = approvalType
      obj.InfoCategeory = data?.infoCategeory?.value ?? ''
      obj.ValuationType = data?.evaluationType?.label ?? ''
      obj.PlannedDelTime = data?.leadTime
      obj.DivisionId = division?.value ?? null


      // debounce_fun()
      // 
      // props.closeDrawer()
      setIsLoader(true)
      dispatch(sendForApprovalBySender(obj, (res) => {
        if (res?.data?.Result) {
          Toaster.success(viewApprovalData.length === 1 ? `Costing Id ${viewApprovalData[0].costingName} has been sent for approval to ${approver.split('(')[0]}.` : `Costings has been sent for approval to ${approver.split('(')[0]}.`)
        }
        setIsLoader(false)
        setIsDisable(false)
        props.closeDrawer('', 'Submit')
        dispatch(setCostingApprovalData([]))
        dispatch(setCostingViewData([]))
      }))
    }
  }), 500)



  const handleApproverChange = (data) => {
    setApprover(data.label)
    setSelectedApprover(data.value)
    setSelectedApproverLevelId({ levelName: data.levelName, levelId: data.levelId })
  }

  const checkQuantityLimitValue = (value, isRegularizeValue) => {
    let limit;
    if (dataToChange?.QuantityUsed === 0) {
      limit = dataToChange?.RegularizationLimit + calculatePercentageValue(dataToChange?.RegularizationLimit, dataToChange?.MaxDeviationLimitPercent)
    } else {
      limit = dataToChange?.QuantityUsed
    }

    if (!isRegularizeValue) {

      if ((value <= limit)) {

        if ((value >= dataToChange?.RegularizationLimit) && (value <= limit)) {
          setIsLimitCrossed(true)
        } else {
          setIsLimitCrossed(false)
        }
      } else {
        setTimeout(() => {
          setValue('Quantity', 0)
        }, 200);
        setIsLimitCrossed(false)
        Toaster.warning('Quantity should be less than Max Deviation Limit')
        return false
      }


    } else {
      if ((value >= dataToChange?.RegularizationLimit)) {
        setIsLimitCrossed(true)
      } else {
        setIsLimitCrossed(false)
      }
    }
  }

  /**
  * @method setDisableFalseFunction
  * @description setDisableFalseFunction
  */
  const setDisableFalseFunction = () => {
    const loop = checkForNull(dropzone.current.files.length) - checkForNull(files.length)
    if (checkForNull(loop) === 1 || checkForNull(dropzone.current.files.length) === checkForNull(files.length)) {
      setIsDisable(false)
    }
  }

  const handleChangeQuantity = (e) => {
    checkQuantityLimitValue(e?.target?.value, isRegularize)
  };

  useEffect(() => {
    viewApprovalData && viewApprovalData.map(item => setEffectiveDate(item.effectiveDate !== "" ? DayTime(item.effectiveDate).format('DD/MM/YYYY') : ""))
  }, [viewApprovalData])

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
    dispatch(setCostingApprovalData([]))
    props.closeDrawer('', 'Cancel')
  }

  // called every time a file's `status` changes
  const handleChangeStatus = ({ meta, file }, status) => {
    setAttachmentLoader(true)
    if (status === "removed") {
      const removedFileName = file.name;
      let tempArr =
        files &&
        files.filter((item) => item.OriginalFileName !== removedFileName);
      setFiles(tempArr);
      setIsOpen(!IsOpen);
    }

    if (status === "done") {
      let data = new FormData();
      data.append("file", file);
      if (!validateFileName(file.name)) {
        dropzone.current.files.pop()
        setDisableFalseFunction()
        return false;
      }
      dispatch(fileUploadCosting(data, (res) => {
        if (res && res?.status !== 200) {
          this.dropzone.current.files.pop()
          setAttachmentLoader(false)
          return false
        }
        let Data = res.data[0];
        files.push(Data);
        setFiles(files);
        setIsOpen(!IsOpen);
        setAttachmentLoader(false)
      }));
    }

    if (status === 'rejected_file_type') {
      Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
    } else if (status === 'error_file_size') {
      setDisableFalseFunction()
      setAttachmentLoader(false)
      dropzone.current.files.pop()
      Toaster.warning("File size greater than 20 mb not allowed")
    } else if (status === 'error_validation'
      || status === 'error_upload_params' || status === 'exception_upload'
      || status === 'aborted' || status === 'error_upload') {
      setDisableFalseFunction()
      setAttachmentLoader(false)
      dropzone.current.files.pop()
      Toaster.warning("Something went wrong")
    }
  };
  const viewImpactDrawer = () => {
    setIsVerifyImpactDrawer(true)
  }
  const deleteFile = (FileId, OriginalFileName) => {
    if (FileId != null) {

      // dispatch(
      //   fileDeleteCosting(deleteData, (res) => {
      //     Toaster.success("File deleted successfully.");
      //     let tempArr = files && files.filter((item) => item.FileId !== FileId);
      //     setFiles(tempArr);
      //     setIsOpen(!IsOpen);
      //   })
      // );
    }
    if (FileId == null) {
      let tempArr =
        files && files.filter((item) => item.FileName !== OriginalFileName);
      setFiles(tempArr);
      setAttachmentLoader(false)
      setIsOpen(!IsOpen);
    }
    if (dropzone?.current !== null) {
      dropzone.current.files.pop()
    }
  };

  const Preview = ({ meta }) => {
    return (
      <span
        style={{
          alignSelf: "flex-start",
          margin: "10px 3%",
          fontFamily: "Helvetica",
        }}
      >
        {/* {Math.round(percent)}% */}
      </span>
    );
  };
  const checkboxHandler = () => {
    if (isRegularize === false) {
      Toaster.warning("Please upload files");
    }
    setIsRegularize(!isRegularize);
    checkQuantityLimitValue(getValues('Quantity'), !isRegularize)
  };

  const tentativeCheckboxHandler = () => {
    setTentativeCost(!tentativeCost)
  }

  const reasonField = 'reasonField'
  const dateField = 'dateField'

  const verifyImpactDrawer = (e = '', type) => {
    if (type === 'cancel') {
      setIsVerifyImpactDrawer(false);
    }
  }
  const approverMessage = `This user is not in approval cycle for "${getValues('ApprovalType')?.label ? getValues('ApprovalType')?.label : viewApprovalData && viewApprovalData[0]?.CostingHead}" approval type, please contact admin to add approver for "${getValues('ApprovalType')?.label ? getValues('ApprovalType')?.label : viewApprovalData && viewApprovalData[0]?.CostingHead}" approval type and ${getConfigurationKey().IsCompanyConfigureOnPlant ? 'company' : 'department'}.`;

  return (
    <Fragment>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      ><div className="container">
          <div className={"drawer-wrapper layout-width-900px"}>
            <Row className="drawer-heading ">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>{"Send for Approval"}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  disabled={isLoader}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>
            {isLoader && <LoaderCustom customClass="approve-reject-drawer-loader" />}
            {viewApprovalData &&
              viewApprovalData.map((data, index) => {

                return (<div className="" key={index}>
                  <Row className="px-3">
                    <Col md="12">
                      <h6 className="left-border d-inline-block mr-4">
                        {(data.costingTypeId === ZBCTypeId) ? ZBC : (data.costingTypeId === VBCTypeId || data.costingTypeId === NCCTypeId) ? `${data.vendorName}` : `${data.customerName}`}
                      </h6>
                      <div className=" d-inline-block mr-4">
                        {`Part No:`}{" "}
                        <span className="grey-text">{`${isApprovalisting ? data.partNo : partNo.partNumber}`}</span>
                      </div>
                      <div className=" d-inline-block mr-4">
                        {(data.costingTypeId === ZBCTypeId) ? `Plant Code: ` : (data.costingTypeId === VBCTypeId || data.costingTypeId === NCCTypeId) ? `${vendorLabel} Code: ` : `Customer Code: `}
                        <span className="grey-text">{(data.costingTypeId === ZBCTypeId) ? `${data.plantCode}` : (data.costingTypeId === VBCTypeId || data.costingTypeId === NCCTypeId) ? `${data.vendorCode}` : `${data.customerCode}`}</span>
                      </div>
                      <div className=" d-inline-block">
                        {`Costing Id:`}{" "}
                        <span className="grey-text">{`${data.costingName}`}</span>
                      </div>

                    </Col>
                  </Row>
                  <div className="px-3">
                    <div className="border-box border p-3 mb-4">
                      <Row>
                        <Col md="4">
                          <SearchableSelectHookForm
                            label={"Reason"}
                            // name={"reason"}
                            name={`${reasonField}reason[${index}]`}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={data.reason !== "" ? { label: data.reason, value: data.reasonId } : ""}
                            options={renderDropdownListing("Reason")}
                            mandatory={true}
                            handleChange={(e) => {
                              handleReasonChange(e, index);
                            }}
                            errors={errors && errors.reasonFieldreason && errors.reasonFieldreason !== undefined ? errors.reasonFieldreason[index] : ""}
                          // errors={`${errors}.${reasonField}[${index}]reason`}

                          />
                        </Col>

                        <Col md="4">
                          <div className="d-flex">
                            <div className="inputbox date-section">
                              {
                                data.isDate ?
                                  <div className={'form-group inputbox withBorder'}>
                                    <label>Effective Date</label>
                                    <DatePicker
                                      selected={DayTime(data.effectiveDate).isValid() ? new Date(data.effectiveDate) : ''}
                                      dateFormat="dd/MM/yyyy"
                                      showMonthDropdown
                                      showYearDropdown
                                      dropdownMode='select'
                                      readonly="readonly"
                                      onBlur={() => null}
                                      autoComplete={'off'}
                                      disabledKeyboardNavigation
                                      disabled={true}
                                    />
                                  </div>
                                  :

                                  <DatePickerHookForm
                                    name={`${dateField}EffectiveDate.${index}`}
                                    label={'Effective Date'}
                                    selected={data.effectiveDate !== "" ? DayTime(data.effectiveDate).format('DD/MM/YYYY') : ""}
                                    handleChange={(date) => {
                                      handleEffectiveDateChange(date, index);
                                    }}
                                    //defaultValue={data.effectiveDate != "" ? moment(data.effectiveDate).format('DD/MM/YYYY') : ""}
                                    rules={{ required: true }}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    showMonthDropdown
                                    showYearDropdown
                                    dateFormat="DD/MM/YYYY"
                                    //maxDate={new Date()}
                                    placeholderText="Select date"
                                    customClassName="withBorder"
                                    className="withBorder"
                                    autoComplete={"off"}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                    disabled={false}
                                    mandatory={true}
                                    errors={errors && errors.dateFieldEffectiveDate && errors.dateFieldEffectiveDate !== undefined ? errors.dateFieldEffectiveDate[index] : ""}
                                  />
                              }
                            </div>
                            {/* <i className="fa fa-calendar icon-small-primary ml-2"></i> */}
                          </div>
                          {/* </div> */}
                        </Col>
                        {initialConfiguration?.IsBasicRateAndCostingConditionVisible && <Col md="4">
                          <div className="form-group">
                            <label>Basic Price</label>
                            <label className="form-control bg-grey input-form-control">
                              {data.BasicRate && data.BasicRate !== '-' ? checkForDecimalAndNull(data.BasicRate, initialConfiguration.NoOfDecimalForPrice) : 0}
                            </label >
                          </div >
                        </Col >}
                        <Col md="4">
                          <div className="form-group">
                            <label>Existing Price</label>
                            <label className="form-control bg-grey input-form-control">
                              {data.oldPrice && data.oldPrice !== '-' ? checkForDecimalAndNull(data.oldPrice, initialConfiguration.NoOfDecimalForPrice) : 0}
                            </label>
                          </div>
                        </Col>
                        <Col md="4">
                          <div className="form-group">
                            <label>Revised Price</label>
                            <label className="form-control bg-grey input-form-control">
                              {data.revisedPrice ? checkForDecimalAndNull(data.revisedPrice, initialConfiguration.NoOfDecimalForPrice) : 0}
                            </label>
                          </div>
                        </Col>
                        <Col md="4">
                          <div className="form-group">
                            <TooltipCustom id={"variance-tooltip"} disabledIcon={true} tooltipText={`Existing Price - Revised Price`} />
                            <label>Variance (w.r.t. Existing)</label>
                            <label id={"variance-tooltip"} className={data.oldPrice === 0 ? `form-control bg-grey input-form-control` : `form-control bg-grey input-form-control ${data.variance < 0 ? 'red-value' : 'green-value'}`}>
                              {data.variance ? checkForDecimalAndNull(data.variance, initialConfiguration.NoOfDecimalForPrice) : 0}
                            </label>
                          </div>
                        </Col>

                        {
                          viewApprovalData && viewApprovalData[0]?.CostingHead !== NCC && <>
                            <Col md="4">
                              <div className="form-group">
                                <TooltipCustom disabledIcon={true} id={"consumed-quantity"} tooltipText={`Consumed Quantity is calculated based on the data present in the volume master (${data.effectiveDate !== "" ? DayTime(data.effectiveDate).format('DD/MM/YYYY') : ""}).`} />
                                <label>Consumed Quantity</label>
                                <div className="d-flex align-items-center">
                                  <label id={"consumed-quantity"} className="form-control bg-grey input-form-control">
                                    {checkForDecimalAndNull(data.consumptionQty, initialConfiguration.NoOfDecimalForPrice)}
                                  </label>
                                  {/* <div class="plus-icon-square  right m-0 mb-1"></div> */}
                                </div>
                              </div>
                            </Col>
                            <Col md="4">
                              <div className="form-group">
                                <TooltipCustom id={"remaining-budgeted-quantity-formula"} disabledIcon={true} tooltipText={`Budgeted Quantity (Refer From Volume Master) - Consumed Quantity`} />
                                <label>Remaining Budgeted Quantity</label>
                                <label id={"remaining-budgeted-quantity-formula"} className="form-control bg-grey input-form-control">
                                  {data.remainingQty && data.remainingQty !== "" ? checkForDecimalAndNull(data.remainingQty, initialConfiguration.NoOfDecimalForPrice) : 0}
                                </label>
                              </div>
                            </Col>
                            <Col md="4">
                              <div className="form-group">
                                <TooltipCustom id={"costing-approval"} tooltipText={`The current impact is calculated based on the data present in the volume master (${data.effectiveDate !== "" ? DayTime(data.effectiveDate).format('DD/MM/YYYY') : ""}).`} />
                                <TooltipCustom id={"annual-formula"} disabledIcon={true} tooltipText={`Total Budget Quantity (Refer From Volume Master) * Variance`} />
                                <label>Annual Impact</label>
                                <label id={"annual-formula"} className={data.oldPrice === 0 ? `form-control bg-grey input-form-control` : `form-control bg-grey input-form-control ${data.annualImpact < 0 ? 'green-value' : 'red-value'}`}>
                                  {data.annualImpact && data.annualImpact ? checkForDecimalAndNull(data.annualImpact, initialConfiguration.NoOfDecimalForPrice) : 0}
                                </label>
                              </div>
                            </Col>

                            <Col md="4">
                              <div className="form-group">
                                <TooltipCustom id={"impact-for-year-formula"} disabledIcon={true} tooltipText={`(Total Budget Quantity (Refer From Volume Master) * Consumed Quantity) - Variance`} />
                                <label>Impact for the Year</label>
                                <label id={"impact-for-year-formula"} className={data.oldPrice === 0 ? `form-control bg-grey input-form-control` : `form-control bg-grey input-form-control ${data.yearImpact < 0 ? 'green-value' : 'red-value'}`}>
                                  {data.yearImpact && data.yearImpact ? checkForDecimalAndNull(data.yearImpact, initialConfiguration.NoOfDecimalForPrice) : 0}
                                </label>
                              </div>
                            </Col>

                            {data.oldPrice > 0 && <Col md="4">
                              <div className="form-group">
                                <label>Budgeted Price</label>
                                <label className={data.oldPrice === 0 ? `form-control bg-grey input-form-control` : `form-control bg-grey input-form-control ${data.yearImpact < 0 ? 'green-value' : 'red-value'}`}>
                                  {data.BudgetedPrice && data.BudgetedPrice ? checkForDecimalAndNull(data.BudgetedPrice, initialConfiguration.NoOfDecimalForPrice) : 0}
                                </label>
                              </div>
                            </Col>}
                            {data.oldPrice > 0 && <Col md="4">
                              <div className="form-group">
                                <label>Impact/Quarter (w.r.t. Budgeted Price)</label>
                                <label className={data.oldPrice === 0 ? `form-control bg-grey input-form-control` : `form-control bg-grey input-form-control ${data.yearImpact < 0 ? 'green-value' : 'red-value'}`}>
                                  {data.BudgetedPriceVariance && data.BudgetedPriceVariance ? checkForDecimalAndNull(data.BudgetedPriceVariance, initialConfiguration.NoOfDecimalForPrice) : 0}
                                </label>
                              </div>
                            </Col>}
                          </>
                        }
                      </Row >
                    </div >
                  </div >
                </div >
                );
              })}
            <div className="">
              <form >
                {
                  // isFinalApproverShow === false ?
                  <>
                    {/* MINDA */}
                    {/* <Row className="px-3">
                      <Col md="12">
                        <div className="left-border">{"SAP-Push Details"}</div>
                      </Col>
                      <div className="w-100">
                        <PushSection
                          Controller={Controller}
                          register={register}
                          errors={errors}
                          control={control}
                        />
                      </div>
                    </Row> */}
                    {getConfigurationKey().IsSAPConfigured && !props.isRfq && <Row className="px-3">
                      <Col md="12">
                        <div className="left-border">{"SAP-Push Details"}</div>
                      </Col>
                      <div className="w-100">
                        <SAPApproval
                          Controller={Controller}
                          register={register}
                          errors={errors}
                          control={control}
                          plantCode={viewApprovalData[0]?.plantCode ?? EMPTY_GUID}
                        />
                      </div>
                    </Row>}

                    <Row className="px-3">
                      <Col md="4">
                        <div className="left-border">{"Approver"}</div>
                      </Col>
                    </Row>
                    <Row className="px-3">
                      {initialConfiguration.IsReleaseStrategyConfigured && <Col md="6">
                        <SearchableSelectHookForm
                          label={"Approval Type"}
                          name={"ApprovalType"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={""}
                          options={renderDropdownListing("ApprovalType")}
                          disabled={disableRS}
                          mandatory={true}
                          handleChange={handleApprovalTypeChange}
                          errors={errors.ApprovalType}
                        />
                      </Col>}
                      {!getConfigurationKey().IsDivisionAllowedForDepartment && <Col md="6">
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
                          disabled={disableRS || (((initialConfiguration.IsReleaseStrategyConfigured && Object.keys(approvalType)?.length === 0) || disableDept) && !showApprovalDropdown())}
                          mandatory={true}
                          handleChange={handleDepartmentChange}
                          errors={errors.dept}
                        />
                      </Col >}
                      {getConfigurationKey().IsDivisionAllowedForDepartment && isShowDivision && <Col md="6">
                        <SearchableSelectHookForm
                          label={"Division"}
                          name={"Division"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={""}
                          options={divisionList}
                          disabled={((Object.keys(selectedDepartment).length === 0) || (initialConfiguration.IsReleaseStrategyConfigured && Object.keys(approvalType)?.length === 0))}
                          mandatory={true}
                          handleChange={handleDivisionChange}
                          errors={errors.Division}
                        />
                      </Col>}
                      <Col md="6">
                        {initialConfiguration.IsMultipleUserAllowForApproval ? <>
                          <AllApprovalField
                            label="Approver"
                            approverList={approvalDropDown}
                            popupButton="View all"
                          />
                        </> :
                          <SearchableSelectHookForm
                            label={"Approver"}
                            name={"approver"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={""}
                            options={approvalDropDown}
                            mandatory={true}
                            disabled={disableRS || (!(userData.Department.length > 1) && !showApprovalDropdown())}
                            customClassName={"mb-0 approver-wrapper"}
                            handleChange={handleApproverChange}
                            errors={errors.approver}
                          />}
                        {
                          !noApprovalExistMessage && showValidation && <span className="warning-top"><WarningMessage title={approverMessage} dClass={`${errors.approver ? "mt-2" : ''} approver-warning`} message={approverMessage} /></span>
                        }
                        {noApprovalExistMessage && <span className="warning-top"><WarningMessage title={noApprovalExistMessage} message={noApprovalExistMessage} /></span>}
                      </Col >

                      {!props?.isRfq && viewApprovalData && viewApprovalData[0]?.costingTypeId === NCCTypeId && <><Col md="6">
                        <NumberFieldHookForm
                          label="Quantity"
                          name={"Quantity"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={true}
                          rules={{ required: true }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          handleChange={handleChangeQuantity}
                          errors={errors.Quantity}
                          disabled={false}
                        />
                      </Col>
                        <Col md="6" className="d-flex align-items-center mb-2">
                          <span className="d-inline-block">
                            <label
                              className={`custom-checkbox mb-0`}
                              onChange={checkboxHandler}>
                              Regularize
                              <input
                                type="checkbox"
                              />
                              <span
                                className=" before-box"
                                onChange={checkboxHandler}
                              />
                            </label>
                          </span>
                        </Col>
                      </>
                      }

                      {
                        initialConfiguration.IsShowTentativeSaleRate && <Col md="6" className="d-flex align-items-center mb-3 ml-1 ">
                          <span className="d-inline-block">
                            <label
                              className={`custom-checkbox mb-0`}
                              onChange={tentativeCheckboxHandler}>
                              Tentative Cost
                              <input
                                type="checkbox"
                              />
                              <span
                                className=" before-box"
                                onChange={tentativeCheckboxHandler}
                              />
                            </label>
                          </span>
                        </Col>
                      }
                      <Col md="12">
                        <TextAreaHookForm
                          label="Remarks"
                          name={"remarks"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={mandatoryRemark ? true : false}
                          rules={{ required: mandatoryRemark ? true : false }}
                          handleChange={() => { }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.remarks}
                          disabled={false}
                        />
                      </Col>
                    </Row >
                  </>
                  // :
                  // <Row className="px-3">
                  //   <Col md="12">
                  //     <TextAreaHookForm
                  //       label="Remarks"
                  //       name={"remarks"}
                  //       Controller={Controller}
                  //       control={control}
                  //       register={register}
                  //       mandatory={false}
                  //       handleChange={() => { }}
                  //       defaultValue={""}
                  //       className=""
                  //       customClassName={"withBorder"}
                  //       errors={errors.remarks}
                  //       disabled={false}
                  //     />
                  //   </Col>
                  // </Row>

                }
                {
                  isRegularize ? (
                    <Row className="mb-4 mx-0">
                      <Col md="6" className="height152-label">
                        <label>Upload Attachment (upload up to 4 files)<AttachmentValidationInfo /></label>
                        {files && files.length >= 4 ? (
                          <div class="alert alert-danger" role="alert">
                            Maximum file upload limit reached.
                          </div>
                        ) : (
                          <Dropzone
                            ref={dropzone}
                            onChangeStatus={handleChangeStatus}
                            PreviewComponent={Preview}
                            mandatory={true}
                            //onSubmit={this.handleSubmit}
                            accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                            initialFiles={[]}
                            maxFiles={4}
                            maxSizeBytes={2000000000}
                            inputContent={(files, extra) =>
                              extra.reject ? (
                                "Image, audio and video files only"
                              ) : (
                                <div className="text-center">
                                  <i className="text-primary fa fa-cloud-upload"></i>
                                  <span className="d-block">
                                    Drag and Drop or{" "}
                                    <span className="text-primary">Browse</span>
                                    <br />
                                    file to upload
                                  </span>
                                </div>
                              )
                            }
                            styles={{
                              dropzoneReject: {
                                borderColor: "red",
                                backgroundColor: "#DAA",
                              },
                              inputLabel: (files, extra) =>
                                extra.reject ? { color: "red" } : {},
                            }}
                            classNames="draper-drop"
                          // disabled={CostingViewMode ? true : false}
                          />
                        )}
                      </Col>
                      <Col md="6" className='pr-0'>
                        <div className={"attachment-wrapper"}>
                          {attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                          {files &&
                            files.map((f) => {
                              const withOutTild = f.FileURL.replace("~", "");
                              const fileURL = `${FILE_URL}${withOutTild}`;
                              return (
                                <div className={"attachment images"}>
                                  <a href={fileURL} target="_blank" rel="noreferrer">
                                    {f.OriginalFileName}
                                  </a>
                                  <img
                                    alt={""}
                                    className="float-right"
                                    onClick={() =>
                                      deleteFile(f.FileId, f.FileName)
                                    }
                                    src={redcrossImg}
                                  ></img>
                                </div>
                              );
                            })}
                        </div>
                      </Col>
                    </Row>
                  ) : null
                }
                <Row>

                  <WarningMessage dClass={'justify-content-end'} message={"All impacted assemblies will be changed and new versions will be formed"} />
                  {isPFSOrBudgetingDetailsExistWarning && <WarningMessage dClass={'justify-content-end'} message={"Budgeting cost does not exist for this part"} />}
                </Row>
                <Row className="mb-4">
                  <Col
                    md="12"
                    className="d-flex justify-content-end align-items-center"
                  >
                    <button
                      className="cancel-btn mr-2"
                      type={"button"}
                      onClick={toggleDrawer}
                    // className="reset mr15 cancel-btn"
                    >
                      <div className={'cancel-icon'}></div>
                      {"Cancel"}
                    </button>
                    {initialConfiguration.IsLastRevisionDataVisible && viewApprovalData && viewApprovalData[0]?.costingTypeId === VBCTypeId && <button type="button" className="user-btn mr5 save-btn" onClick={viewImpactDrawer}>
                      <div className={"save-icon"}></div>
                      {"Verify Impact"}
                    </button>}
                    <button
                      className="btn btn-primary save-btn"
                      type="button"
                      // className="submit-button save-btn"
                      // disabled={(isDisable || isFinalApproverShow)}
                      disabled={isDisable || isDisableSubmit}
                      onClick={onSubmit}
                    >
                      <div className={'save-icon'}></div>
                      {"Submit"}
                    </button>
                  </Col>
                </Row >
              </form >
            </div >
            {isVerifyImpactDrawer &&
              <VerifyImpactDrawer
                isOpen={isVerifyImpactDrawer}
                approvalData={[]}
                costingDrawer={true}
                anchor={'bottom'}
                closeDrawer={verifyImpactDrawer}
                isSimulation={false}
                amendmentDetails={costingApprovalDrawerData}
                vendorIdState={viewApprovalData[0].vendorId}
                EffectiveDate={DayTime(viewApprovalData[0].effectiveDate).format('YYYY-MM-DD HH:mm:ss')}
                CostingTypeId={viewApprovalData[0]?.costingTypeId}
                approvalSummaryTrue={true}
                costingIdArray={costingIdArray}
                isCosting={true}
              />
            }
          </div >
        </div >

      </Drawer >

    </Fragment >
  );
}

export default SendForApproval
