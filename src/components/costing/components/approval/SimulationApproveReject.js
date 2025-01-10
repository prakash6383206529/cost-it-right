import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { getReasonSelectList, setSAPData } from '../../../costing/actions/Approval'
import { formatRMSimulationObject, getConfigurationKey, loggedInUserId, userDetails, userTechnologyLevelDetails } from '../../../../helper'
import PushButtonDrawer from './PushButtonDrawer'
import { BOPIMPORT, EMPTY_GUID, EXCHNAGERATE, RAWMATERIALINDEX, RMIMPORT } from '../../../../config/constants'
import { getSimulationApprovalByDepartment, simulationApprovalRequestByApprove, simulationRejectRequestByApprove, simulationApprovalRequestBySender, saveSimulationForRawMaterial, getAllSimulationApprovalList, checkSAPPoPrice } from '../../../simulation/actions/Simulation'
import DayTime from '../../../common/DayTimeWrapper'
import { debounce } from 'lodash'
import "react-datepicker/dist/react-datepicker.css";
import 'react-dropzone-uploader/dist/styles.css';
import { getSelectListOfSimulationLinkingTokens } from '../../../simulation/actions/Simulation'
import { PROVISIONAL } from '../../../../config/constants'
import Toaster from '../../../common/Toaster'
import { getAllDivisionListAssociatedWithDepartment, getUsersSimulationTechnologyLevelAPI } from '../../../../actions/auth/AuthActions'
import { costingTypeIdToApprovalTypeIdFunction } from '../../../common/CommonFunctions'
import ApproveRejectUI from './ApproveRejectUI'
import { checkFinalUser } from '../../actions/Costing'
import { reactLocalStorage } from 'reactjs-localstorage'

function SimulationApproveReject(props) {
  // ********* INITIALIZE REF FOR DROPZONE ********
  const dropzone = useRef(null);
  const hasCalledAPI = useRef(false);
  const { type, technologyId, approvalTypeIdValue, approvalData, IsFinalLevel, IsPushDrawer, dataSend, reasonId, simulationDetail, selectedRowData, costingArr, isSaveDone, Attachements, vendorId, SimulationTechnologyId, SimulationType, isSimulationApprovalListing, apiData, TechnologyId, releaseStrategyDetails, IsExchangeRateSimulation, isRMIndexationSimulation } = props

  const userLoggedIn = loggedInUserId()
  const userData = userDetails()
  const { TokensList } = useSelector(state => state.simulation)

  const { formState: { }, handleSubmit, setValue, getValues } = useForm({
    mode: 'onChange', reValidateMode: 'onChange',
  })

  const dispatch = useDispatch()
  const [approvalDropDown, setApprovalDropDown] = useState([])
  const [openPushButton, setOpenPushButton] = useState(false)
  const [linkingTokenDropDown, setLinkingTokenDropDown] = useState('')
  const [tokenDropdown, setTokenDropdown] = useState(true)
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [loader, setLoader] = useState(false)
  const [isDisable, setIsDisable] = useState(false)
  const [attachmentLoader, setAttachmentLoader] = useState(false)
  const [levelDetails, setLevelDetails] = useState({})
  const [showWarningMessage, setShowWarningMessage] = useState(false)
  const [technologyLevelsList, setTechnologyLevelsList] = useState('')
  const [isResponseTrueObj, setIsResponseTrueObj] = useState({})
  const [dataInFields, setDataInFields] = useState({})
  const [approvalType, setApprovalType] = useState(technologyId);
  const [finalLevelUser, setFinalLevelUser] = useState(false);
  const [showMessage, setShowMessage] = useState()
  const [disableReleaseStrategy, setDisableReleaseStrategy] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isSaveSimualtionCalled, setIsSavedSimulationCalled] = useState(false)
  const [isShowDivision, setIsShowDivision] = useState(false)
  const [divisionList, setDivisionList] = useState([])
  const [emptyDivision, setEmptyDivision] = useState(false)
  const [division, setDivision] = useState('')
  const deptList = useSelector((state) => state.approval.approvalDepartmentList)
  const { selectedMasterForSimulation } = useSelector(state => state.simulation)
  const reasonsList = useSelector((state) => state.approval.reasonsList)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const SAPData = useSelector(state => state.approval.SAPObj)

  const [approverIdList, setApproverIdList] = useState([])
  useEffect(() => {
    dispatch(getReasonSelectList((res) => { }))

    dispatch(getSimulationApprovalByDepartment(res => {
      const Data = res?.data?.SelectList
      const Departments = userDetails().Department && userDetails().Department.map(item => item.DepartmentName)
      const updateList = Data && Data.filter(item => Departments.includes(item.Text))

      const departObj = updateList && updateList.filter(item => item?.Value === (type === 'Sender' ? userData?.DepartmentId : simulationDetail?.DepartmentId))
      let dataInFieldTemp = {
        ...dataInFields, Department: { label: updateList[0]?.Text, value: updateList[0]?.Value },
        ApprovalType: { label: approvalTypeIdValue, value: approvalTypeIdValue }
      }
      setDataInFields(dataInFieldTemp)
      setIsResponseTrueObj({ ...isResponseTrueObj, Department: true })
      if (initialConfiguration.IsReleaseStrategyConfigured && releaseStrategyDetails?.IsPFSOrBudgetingDetailsExist === true) {
        setDataFromReleaseStrategy(releaseStrategyDetails, dataInFieldTemp)
      }
    }))
    let technologyId = selectedMasterForSimulation?.value
    if (IsExchangeRateSimulation) {
      if (String(selectedMasterForSimulation?.value) === String(RMIMPORT) || String(selectedMasterForSimulation?.value) === String(BOPIMPORT)) {
        technologyId = EXCHNAGERATE
      }
    } else {
      technologyId = selectedMasterForSimulation?.value
    }
    dispatch(getUsersSimulationTechnologyLevelAPI(loggedInUserId(), technologyId, (res) => {
      if (res?.data?.Data) {
        setTechnologyLevelsList(res?.data?.Data)
      }
    }))

    setTimeout(() => {
      Attachements && Attachements.map(item => {
        files.push(item)
        setFiles(files)
        setIsOpen(!IsOpen)
        return null;
      })
      let filesList = files && files.map((item) => {
        item.meta = {}
        item.meta.id = item.FileId
        item.meta.status = 'done'
        return item
      })
      // ********** ADD ATTACHMENTS FROM API INTO THE DROPZONE'S PERSONAL DATA STORE **********
      if (dropzone.current !== null) {
        dropzone.current.files = filesList

      }
      if (vendorId !== null && (SimulationTechnologyId !== null || String(SimulationTechnologyId) !== RAWMATERIALINDEX) && type === 'Sender' && !isSimulationApprovalListing) {
        dispatch(getSelectListOfSimulationLinkingTokens(vendorId, SimulationTechnologyId, () => { }))
      }
    }, 300);

    if (SimulationType !== null && SimulationType === PROVISIONAL) {
      setTokenDropdown(false)
    }
  }, [])
  useEffect(() => {
    if (type === 'Sender' && !isSaveDone && !isSimulationApprovalListing && !hasCalledAPI.current) {
      let simObj = formatRMSimulationObject(simulationDetail, costingArr, apiData, isRMIndexationSimulation);
      //THIS CONDITION IS FOR SAVE SIMULATION
      setLoader(true);
      hasCalledAPI.current = true; //  ref to true to prevent future calls

      dispatch(saveSimulationForRawMaterial(simObj, res => {
        if (res?.data?.Result) {
          Toaster.success('Simulation has been saved successfully');

          if (initialConfiguration?.IsSAPConfigured) {
            dispatch(checkSAPPoPrice(simulationDetail?.SimulationId, '', res => {
              let status = 200;
              if ('response' in res) {
                status = res && res?.response?.status;
              }
              if (status !== undefined && status === 200) {
                setIsDisableSubmit(false)
              } else {
                setIsDisableSubmit(true)
              }
            }));
          }
        }
        setLoader(false);
      }));
    }
  }, [simulationDetail]);

  const callbackSetDataInFields = (obj) => {
    setDataInFields(obj)
  }

  const checkPermission = (costingTypeId) => {
    let levelDetailsTemp = ''
    levelDetailsTemp = userTechnologyLevelDetails(costingTypeId, technologyLevelsList?.TechnologyLevels ? technologyLevelsList?.TechnologyLevels : [])

    if (levelDetailsTemp?.length !== 0) {
      setLevelDetails(levelDetailsTemp)

      let obj = {
        ...dataInFields, Department: { label: dataInFields?.Department?.label, value: dataInFields?.Department?.value }
        , Approver: { label: '', value: '', levelId: '', levelName: '' }
      }
      checkFinalUserAndGetApprovers(dataInFields?.Department, levelDetailsTemp, obj)
      callApproverAPI(dataInFields?.Department)
      // getApproversList(dataInFields?.Department?.value, dataInFields?.Department?.label, levelDetailsTemp, dataInFields)
    } else {
      if (getConfigurationKey().IsReleaseStrategyConfigured && props?.showApprovalTypeDropdown) {
        Toaster.warning("You don't have permission to send simulation for approval.")
        setApprovalDropDown([])
      }
    }
  }

  useEffect(() => {

    if (isResponseTrueObj?.Department && technologyLevelsList !== '' && type !== 'Reject' && !IsFinalLevel) {

      checkPermission(dataInFields?.ApprovalType?.value)
    }
  }, [isResponseTrueObj, technologyLevelsList, dataInFields?.ApprovalType])

  // useEffect(() => {
  //   let obj = {
  //     DepartmentId: dataInFields?.Department?.value,
  //     UserId: loggedInUserId(),
  //     TechnologyId: props.masterId,
  //     Mode: 'simulation',
  //     approvalTypeId: costingTypeIdToApprovalTypeIdFunction(levelDetails?.ApprovalTypeId)
  //   }
  //   dispatch(checkFinalUser(obj, res => {
  //     if (res && res.data && res.data.Result) {
  //       setFinalLevelUser(res.data.Data.IsFinalApprover)
  //     }
  //   }))
  // }, [dataInFields?.Department])
  


  const setDataFromReleaseStrategy = (releaseStrategyData, dataInFieldTemp) => {
    setDisableReleaseStrategy(true)
    setDataInFields({
      ...dataInFieldTemp,
      ApprovalType: { label: releaseStrategyData?.ApprovalTypeId, value: releaseStrategyData?.ApprovalTypeId }
    })
  }


  const getApproversList = (departId, departmentName, levelDetailsTemp, dataInFieldsTemp) => {




    let values = []
    let approverDropdownValue = []
    let count = 0

    selectedRowData && selectedRowData.map(item => {

      if (!(values.includes(item.SimulationTechnologyId))) {

        values.push(item.SimulationTechnologyId)
      }

      return null
    })
    if (!IsFinalLevel) {


      if (values.length > 1) {
        values.map((item, index) => {
          let obj = {
            LoggedInUserId: userData.LoggedInUserId,
            DepartmentId: departId,
            //NEED TO MAKE THIS 2   
            // TechnologyId: isSimulationApprovalListing ? selectedRowData[0].SimulationTechnologyId : simulationDetail.SimulationTechnologyId ? simulationDetail.SimulationTechnologyId : selectedMasterForSimulation.value,
            TechnologyId: item,
            ReasonId: 0,
            ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(levelDetailsTemp?.ApprovalTypeId),
            plantId: selectedRowData && selectedRowData[0]?.PlantId ? selectedRowData[0]?.PlantId : simulationDetail && simulationDetail?.AmendmentDetails ? simulationDetail?.AmendmentDetails?.PlantId : EMPTY_GUID,
            DivisionId: selectedRowData && selectedRowData[0]?.DivisionId ? selectedRowData[0]?.DivisionId : simulationDetail && simulationDetail?.DivisionId ? simulationDetail?.DivisionId : null
          }
          let approverIdListTemp = []
          dispatch(getAllSimulationApprovalList(obj, (res) => {
            // setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
            // setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })
            let tempDropdownList = []
            let listForDropdown = []

            res?.data?.DataList && res?.data?.DataList?.map((item) => {
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
            setApproverIdList(approverIdListTemp)
            approverDropdownValue.push(tempDropdownList)

            let allObjVal = []

            for (let v = 0; v < approverDropdownValue.length; v++) {
              let valueOfAllArrays = []
              approverDropdownValue && approverDropdownValue[v].map(itemmmm => {
                valueOfAllArrays.push(itemmmm?.value)
                return null
              })
              allObjVal.push(valueOfAllArrays)
            }

            let filteredArray1 = allObjVal.length && allObjVal[0]?.filter(value => allObjVal.length && allObjVal[1]?.includes(value));
            let filteredArray = filteredArray1
            for (let v = 2; v < allObjVal.length; v++) {
              filteredArray = filteredArray && filteredArray?.filter(value => allObjVal && allObjVal[v]?.includes(value));

            }

            tempDropdownList.map(i => {
              filteredArray.map(item => {
                if (i.value === item) {
                  listForDropdown.push(i)
                }
                return null
              })
              return null
            })
            setApprovalDropDown(listForDropdown)
            count = count + 1;
            if ((listForDropdown[0]?.value === EMPTY_GUID || listForDropdown.length === 0) && count === values.length) {
              setShowWarningMessage(true)
              setApprovalDropDown([])
              return false
            } else {
              setShowWarningMessage(false)
            }
          }))
          return null;
        })


      } else if (!getConfigurationKey().IsDivisionAllowedForDepartment || props.type === 'Approve') {
        let appTypeId = dataInFieldsTemp?.ApprovalType?.value
        let technologyIdTemp = technologyId
        if (IsExchangeRateSimulation) {
          if (String(technologyId) === String(RMIMPORT) || String(technologyId) === String(BOPIMPORT)) {
            technologyIdTemp = EXCHNAGERATE
          }
        } else {
          technologyIdTemp = technologyId
        }

        let obj = {
          LoggedInUserId: userData.LoggedInUserId,
          DepartmentId: departId,
          //NEED TO MAKE THIS 2   
          TechnologyId: technologyIdTemp,
          ReasonId: selectedRowData && selectedRowData[0].ReasonId ? selectedRowData[0].ReasonId : 0,
          ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(selectedRowData && selectedRowData[0]?.ApprovalTypeId ? selectedRowData[0]?.ApprovalTypeId : appTypeId),
          plantId: selectedRowData && selectedRowData[0]?.PlantId ? selectedRowData[0]?.PlantId : simulationDetail && simulationDetail?.AmendmentDetails ? simulationDetail?.AmendmentDetails?.PlantId : EMPTY_GUID,
          DivisionId: selectedRowData?.[0]?.DivisionId ?? simulationDetail?.DivisionId ?? null
        }
        dispatch(getAllSimulationApprovalList(obj, (res) => {
          const Data = res?.data?.DataList[1] ? res?.data?.DataList[1] : []
          if (Object?.keys(Data)?.length > 0 && Data?.Value !== EMPTY_GUID) {
            setShowWarningMessage(false)
            setDataInFields({
              ...dataInFields, Department: { label: Data?.DepartmentName, value: Data?.DepartmentId },
              Approver: { label: Data?.Text, value: Data?.Value, levelId: Data?.LevelId, levelName: Data?.LevelName }
            })
          } else {
            setShowWarningMessage(true)
            setDataInFields({
              ...dataInFields, Department: { label: departmentName, value: departId },
              Approver: ''
            })
          }
          let tempDropdownList = []
          let approverIdListTemp = []
          res?.data?.DataList && res?.data?.DataList?.map((item) => {
            if (item?.Value === '0') return false;
            tempDropdownList?.push({
              label: item?.Text,
              value: item?.Value,
              levelId: item?.LevelId,
              levelName: item?.LevelName
            })
            approverIdListTemp.push(item.Value)
            return null
          })
          setApprovalDropDown(tempDropdownList)
          setApproverIdList(approverIdListTemp)
          if ((tempDropdownList[0]?.value === EMPTY_GUID || tempDropdownList.length === 0) && type !== 'Reject' && !IsFinalLevel) {
            setShowWarningMessage(true)
            setApprovalDropDown([])
            setValue('dept', { label: departmentName, value: departId })
            setValue('approver', '')
            return false
          } else {
            setShowWarningMessage(false)
          }
        }))
      }
    }

  }
  const callApproverAPI = (dept, divisionId) => {
    let appTypeId = dataInFields?.ApprovalType?.value
    let technologyIdTemp = technologyId
    if (IsExchangeRateSimulation) {
      if (String(technologyId) === String(RMIMPORT) || String(technologyId) === String(BOPIMPORT)) {
        technologyIdTemp = EXCHNAGERATE
      }
    } else {
      technologyIdTemp = technologyId
    }
    
    let obj = {
      LoggedInUserId: userData.LoggedInUserId,
      DepartmentId: dept?.value,
      //NEED TO MAKE THIS 2   
      TechnologyId: technologyIdTemp,
      ReasonId: selectedRowData && selectedRowData[0].ReasonId ? selectedRowData[0].ReasonId : 0,
      ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(selectedRowData && selectedRowData[0]?.ApprovalTypeId ? selectedRowData[0]?.ApprovalTypeId : appTypeId),
      plantId: selectedRowData && selectedRowData[0]?.PlantId ? selectedRowData[0]?.PlantId : simulationDetail && simulationDetail?.AmendmentDetails ? simulationDetail?.AmendmentDetails?.PlantId : EMPTY_GUID,
      DivisionId: divisionId ?? null
    }
    
    dispatch(getAllSimulationApprovalList(obj, (res) => {
      const Data = res?.data?.DataList;
      const Departments = userDetails().Department?.map(item => item.DepartmentName);
      const validApprovers = Data?.filter(item => item.Value !== "0" && item.DepartmentName && Departments.includes(item.DepartmentName));
      if (validApprovers && validApprovers.length > 0) {
        const firstApprover = validApprovers[0];
        setShowWarningMessage(false);
        setDataInFields({
          ...dataInFields,
          Department: { label: firstApprover.DepartmentName, value: firstApprover.DepartmentId },
          Approver: { label: firstApprover.Text, value: firstApprover.Value, levelId: firstApprover.LevelId, levelName: firstApprover.LevelName }

        });
        const tempDropdownList = validApprovers.map(item => ({
          label: item.Text,
          value: item.Value,
          levelId: item.LevelId,
          levelName: item.LevelName
        }));
        const approverIdListTemp = validApprovers.map(item => item.Value);
        setApprovalDropDown(tempDropdownList);
        setApproverIdList(approverIdListTemp);

      } else {
        // No valid approvers found
        setShowWarningMessage(true);
        setApprovalDropDown([]);
        setValue('approver', '');
      }
    }));
  }
  // useEffect(() => {
  //   if (type === 'Sender' && !isSaveDone && !isSimulationApprovalListing && !hasCalledAPI.current) {
  //     let simObj = formatRMSimulationObject(simulationDetail, costingArr, apiData, isRMIndexationSimulation);
  //     //THIS CONDITION IS FOR SAVE SIMULATION
  //     setLoader(true);
  //     hasCalledAPI.current = true; // Set the ref to true to prevent future calls
  //     dispatch(saveSimulationForRawMaterial(simObj, res => {
  //       if (res?.data?.Result) {
  //         reactLocalStorage.setObject('isSaveSimualtionCalled', true);
  //         Toaster.success('Simulation saved successfully.');
  //         setTimeout(() => {
  //           setLoader(false);
  //         }, 500);
  //       }
  //     }));
  //   }
  // }, [simulationDetail]);

  const closePushButton = () => {
    setOpenPushButton(false)
    props.closeDrawer('', 'Cancel')
  }

  const onSubmit = debounce(handleSubmit(() => {
    const remark = dataInFields?.Remark
    const reason = dataInFields?.Reason
    const dept = dataInFields?.Department
    const approver = dataInFields?.Approver
     setIsDisable(true)

    /****************************THIS IS FOR SIMUALTION (SAVE,SEND FOR APPROVAL,APPROVE AND REJECT CONDITION)******************************** */
    // THIS OBJ IS FOR SIMULATION APPROVE/REJECT

    let approverObject = []
    if (isSimulationApprovalListing === true) {
      selectedRowData && selectedRowData.map(item => {
        approverObject.push({
          // SimulationId: item.SimulationId, SimulationTokenNumber: item.ApprovalNumber,
          // SimulationAppliedOn: item.SimulationTechnologyId

          ApprovalId: item?.ApprovalProcessId,
          ApprovalToken: item?.ApprovalNumber,
          LoggedInUserId: userLoggedIn,
          SenderLevelId: levelDetails.LevelId,
          SenderLevel: levelDetails.Level,
          SenderId: userLoggedIn,
          // ApproverId: approver && approver.value ? approver.value : '',
          ApproverIdList: initialConfiguration.IsMultipleUserAllowForApproval ? approverIdList : [approver && approver.value ? approver.value : ''],
          ApproverLevelId: approver && approver.levelId ? approver.levelId : '',
          ApproverLevel: approver && approver.levelName ? approver.levelName : '',
          Remark: remark,
          IsApproved: type === 'Approve' ? true : false,
          ApproverDepartmentId: dept && dept.value ? dept.value : '',
          ApproverDepartmentName: dept && dept.label ? dept.label : '',
          IsFinalApprovalProcess: /* IsFinalLevel ? true :  */false,
          SimulationApprovalProcessSummaryId: item?.SimulationApprovalProcessSummaryId,
          IsMultiSimulation: isSimulationApprovalListing ? true : false,
          DivisionId: simulationDetail?.DivisionId ?? null
        })
        return null;
      })
    } else {
      approverObject = [{
        ApprovalId: simulationDetail?.SimulationApprovalProcessId,
        ApprovalToken: simulationDetail?.Token,
        LoggedInUserId: userLoggedIn,
        SenderLevelId: levelDetails.LevelId,
        SenderLevel: levelDetails.Level,
        SenderId: userLoggedIn,
        // ApproverId: approver && approver.value ? approver.value : '',
        ApproverIdList: initialConfiguration.IsMultipleUserAllowForApproval ? approverIdList : [approver && approver.value ? approver.value : ''],
        ApproverLevelId: approver && approver.levelId ? approver.levelId : '',
        ApproverLevel: approver && approver.levelName ? approver.levelName : '',
        Remark: remark,
        IsApproved: type === 'Approve' ? true : false,
        ApproverDepartmentId: dept && dept.value ? dept.value : '',
        ApproverDepartmentName: dept && dept.label ? dept.label : '',
        IsFinalApprovalProcess: false,
        SimulationApprovalProcessSummaryId: simulationDetail?.SimulationApprovalProcessSummaryId,
        IsMultiSimulation: isSimulationApprovalListing ? true : false,
        DivisionId: simulationDetail?.DivisionId ?? null
      }]

      //objs.LinkedTokenNumber = linkingTokenDropDown

    }
    if (type === 'Sender') {
      //THIS OBJ IS FOR SIMULATION SEND FOR APPROVAL
      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: simulationDetail.SimulationId }
      })
      let senderObj = {}
      senderObj.ApprovalId = "00000000-0000-0000-0000-000000000000"
      senderObj.ReasonId = reason ? reason.value : ''
      senderObj.Reason = reason ? reason.label : ''
      // senderObj.ApprovalToken = 0
      senderObj.DepartmentId = dept && dept.value ? dept.value : ''
      senderObj.DepartmentName = dept && dept.label ? dept.label : ''
      senderObj.ApproverLevelId = approver && approver.levelId ? approver.levelId : ''
      senderObj.ApproverDepartmentId = dept && dept.value ? dept.value : ''
      senderObj.ApproverLevel = approver && approver.levelName ? approver.levelName : ''
      senderObj.ApproverDepartmentName = dept && dept.label ? dept.label : ''
      senderObj.ApproverId = approver && approver.value ? approver.value : ''
      senderObj.ApproverIdList = initialConfiguration.IsMultipleUserAllowForApproval ? approverIdList : [approver && approver.value ? approver.value : '']
      senderObj.SenderLevelId = levelDetails?.LevelId
      senderObj.SenderLevel = levelDetails?.Level
      senderObj.SenderId = userLoggedIn
      senderObj.SenderRemark = remark
      senderObj.EffectiveDate = simulationDetail?.EffectiveDate ? DayTime(simulationDetail?.EffectiveDate).format('YYYY/MM/DD HH:mm') : null
      senderObj.LoggedInUserId = userLoggedIn
      senderObj.ApprovalTypeId = costingTypeIdToApprovalTypeIdFunction(dataInFields?.ApprovalType?.value)
      let temp = []
      if (isSimulationApprovalListing === true) {
        selectedRowData && selectedRowData.map(item => {
          temp.push({
            SimulationId: item.SimulationId, SimulationTokenNumber: item.ApprovalNumber,
            SimulationAppliedOn: item.SimulationTechnologyId
          })
          return null;
        })
        senderObj.SimulationList = temp
      } else {
        senderObj.SimulationList = [{ SimulationId: simulationDetail.SimulationId, SimulationTokenNumber: simulationDetail.TokenNo, SimulationAppliedOn: simulationDetail.SimulationAppliedOn }]
      }
      senderObj.PurchasingGroup = SAPData.PurchasingGroup?.label
      senderObj.MaterialGroup = SAPData.MaterialGroup?.label
      senderObj.DecimalOption = SAPData.DecimalOption?.value
      senderObj.Attachements = updatedFiles
      senderObj.LinkedTokenNumber = linkingTokenDropDown.value
      senderObj.IsMultiSimulation = isSimulationApprovalListing ? true : false      // IF WE SEND MULTIPLE TOKENS FOR SIMULATION THEN THIS WILL BE TRUE (requirement)
      senderObj.InfoCategeory = SAPData?.infoCategory
      senderObj.ValuationType = SAPData?.evaluationType
      senderObj.PlannedDelTime = SAPData?.leadTime
      senderObj.DivisionId = division ?? null

      //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
      dispatch(simulationApprovalRequestBySender(senderObj, res => {
        setIsDisable(false)
        if (res?.data?.Result) {
          Toaster.success('Simulation token has been sent for approval.')
          reactLocalStorage.setObject('isSaveSimualtionCalled', false)
          props.closeDrawer('', 'submit')
          dispatch(setSAPData({}))
        }
      }))
    }
    else if (type === 'Approve') {
      //THIS CONDITION IS FOR APPROVE THE SIMULATION REQUEST 
      dispatch(simulationApprovalRequestByApprove(approverObject, res => {
        setIsDisable(false)
        if (res?.data?.Result) {
          if (IsPushDrawer) {
            Toaster.success('The simulation token approved successfully')
            setOpenPushButton(true)

          } else {
            Toaster.success(IsFinalLevel ? 'The simulation token approved successfully' : 'The simulation token has been sent to next level for approval')
            props.closeDrawer('', 'submit')
          }
        }
      }))
    } else {
     //SIMULATION REJECT CONDITION
      dispatch(simulationRejectRequestByApprove(approverObject, res => {
        setIsDisable(false)
        if (res?.data?.Result) {
          Toaster.success('The simulation token rejected successfully')
          props.closeDrawer('', 'submit')
        }
      }))
    }
  }), 600)
  const checkFinalUserAndGetApprovers = (value, levelDetails, obj, division = null) => {
    if (levelDetails?.length !== 0) {
      let requestObj = {
        DepartmentId: value?.value,
        UserId: loggedInUserId(),
        TechnologyId: technologyId,
        Mode: 'simulation',
        approvalTypeId: costingTypeIdToApprovalTypeIdFunction(levelDetails?.ApprovalTypeId),
        plantId: selectedRowData && selectedRowData[0]?.PlantId ? selectedRowData[0]?.PlantId : simulationDetail && simulationDetail?.AmendmentDetails ? simulationDetail?.AmendmentDetails?.PlantId : EMPTY_GUID,
        divisionId: division
      }

      dispatch(checkFinalUser(requestObj, res => {
        if (res && res.data && res.data.Result) {
          setFinalLevelUser(res.data.Data.IsFinalApprover)
          if (res.data.Data.IsFinalApprover) {
          if (props?.CheckFinalLevel!==undefined) {
              props?.CheckFinalLevel(true)            }
            if(type=== 'Sender'){
              setIsDisableSubmit(true)
              setShowWarningMessage(true)
              setShowMessage('This is a final level user.')
              Toaster.warning('This is a final level user.')
            }else{
              setIsDisableSubmit(false)
            }
          } else {
            setIsDisableSubmit(false)
            if (props?.CheckFinalLevel!==undefined) {
              props?.CheckFinalLevel(false)
            }

            // callApproverAPI()
            // getApproversList(value.value, value.label, levelDetails, obj)

          }
        }
      }))
    }
  }
  const handleDepartmentChange = (value) => {
    let obj = {
      ...dataInFields, Department: { label: value?.label, value: value?.value }
      , Approver: { label: '', value: '', levelId: '', levelName: '' }
    }
    setEmptyDivision(!emptyDivision)
    setApprovalDropDown([])
    if (getConfigurationKey().IsDivisionAllowedForDepartment) {
      
      let departmentIds = [value.value]
      let obj = {
        DepartmentIdList: departmentIds,
        IsApproval: false
      }
      dispatch(getAllDivisionListAssociatedWithDepartment(obj, res => {
        if (res && res?.data && res?.data?.Identity === true) {
          
          setIsShowDivision(true)
          let divisionArray = []
          res?.data?.DataList?.map(item => {
            if (String(item?.DivisionId) !== '0') {
              divisionArray.push({ label: `${item.DivisionNameCode}`, value: (item?.DivisionId)?.toString(), DivisionCode: item?.DivisionCode })
            }
            return null;
          })
          setDivisionList(divisionArray)
        } else {
          
          setIsShowDivision(false)

          checkFinalUserAndGetApprovers(value, levelDetails, obj)

          callApproverAPI(value)
        }
      }))
      obj.Division = { label: value?.label, value: value?.value }
    }
    else {
      
      checkFinalUserAndGetApprovers(value, levelDetails, obj)

      callApproverAPI(value)
    }
    setDataInFields(obj)

  }
  const handleDivisionChange = (e) => {
    setDivision(e?.value)
    checkFinalUserAndGetApprovers(dataInFields?.Department, levelDetails, dataInFields, e?.value)

    callApproverAPI(dataInFields?.Department, e?.value)
  }
  const fileDataCallback = (fileList) => {
    setFiles(fileList)
  }

  return (
    <>
      <ApproveRejectUI
        isOpen={props?.isOpen}
        vendorId={props?.vendorId}
        SimulationTechnologyId={props?.SimulationTechnologyId}
        SimulationType={props?.SimulationType}

        anchor={'right'}
        approvalData={[]}
        type={type}
        simulationDetail={simulationDetail}
        master={props?.master}
        closeDrawer={props?.closeDrawer}
        isSimulation={true}
        releaseStrategyDetails={releaseStrategyDetails}

        technologyId={technologyId}
        dataInFields={dataInFields}
        approvalDropDown={approvalDropDown}
        handleDepartmentChange={handleDepartmentChange}
        onSubmit={onSubmit}
        callbackSetDataInFields={callbackSetDataInFields}
        IsNotFinalLevel={IsFinalLevel}
        showApprovalTypeDropdown={props?.showApprovalTypeDropdown}
        showWarningMessage={showWarningMessage}
        setDataFromSummary={true}
        showMessage={showMessage}
        isDisable={isDisable}
        disableReleaseStrategy={disableReleaseStrategy}
        fileDataCallback={fileDataCallback}
        isSimulationApprovalListing={props?.isSimulationApprovalListing}
        isDisableSubmit={isDisableSubmit}
        plantCode={selectedRowData && selectedRowData[0]?.PlantCode ? selectedRowData[0]?.PlantCode : simulationDetail && simulationDetail?.AmendmentDetails ? simulationDetail?.AmendmentDetails?.PlantId : EMPTY_GUID}
        isShowDivision={isShowDivision}
        divisionList={divisionList}
        checkFinalUserAndGetApprovers={checkFinalUserAndGetApprovers}
        levelDetails={levelDetails}
        callApproverAPI={callApproverAPI}
        emptyDivision={emptyDivision}
        handleDivisionChange={handleDivisionChange}
        selectedRowData={selectedRowData}
      />

      {
        openPushButton && (
          <PushButtonDrawer
            isOpen={openPushButton}
            closeDrawer={closePushButton}
            approvalData={[approvalData]}
            dataSend={dataSend}
            anchor={'right'}
          />
        )
      }
    </>
  )
}

export default React.memo(SimulationApproveReject)
