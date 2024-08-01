import React, { useEffect, useRef, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch, useSelector } from 'react-redux'
import { approvalRequestByApprove, rejectRequestByApprove, getAllApprovalUserFilterByDepartment, getAllApprovalDepartment, getReasonSelectList, approvalPushedOnSap } from '../../../costing/actions/Approval'
import { TextAreaHookForm, SearchableSelectHookForm, AllApprovalField } from '../../../layout/HookFormInputs'
import { formatRMSimulationObject, getCodeBySplitting, getConfigurationKey, handleDepartmentHeader, loggedInUserId, userDetails, userTechnologyLevelDetails } from '../../../../helper'
import PushButtonDrawer from './PushButtonDrawer'
import { APPROVER, EMPTY_GUID, FILE_URL, REASON_ID, INR } from '../../../../config/constants'
import { getSimulationApprovalByDepartment, simulationApprovalRequestByApprove, simulationRejectRequestByApprove, simulationApprovalRequestBySender, saveSimulationForRawMaterial, getAllSimulationApprovalList, setAttachmentFileData, uploadSimulationAttachment, checkSAPPoPrice } from '../../../simulation/actions/Simulation'
import DayTime from '../../../common/DayTimeWrapper'
import { debounce } from 'lodash'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import redcrossImg from '../../../../assests/images/red-cross.png'
import AttachmentSec from './AttachmentSec'
import { getSelectListOfSimulationLinkingTokens } from '../../../simulation/actions/Simulation'
import { PROVISIONAL } from '../../../../config/constants'
import LoaderCustom from '../../../common/LoaderCustom';
import Toaster from '../../../common/Toaster'
import PushSection from '../../../common/PushSection'
import { Redirect } from 'react-router';
import { getUsersSimulationTechnologyLevelAPI, getUsersTechnologyLevelAPI } from '../../../../actions/auth/AuthActions'
import { costingTypeIdToApprovalTypeIdFunction } from '../../../common/CommonFunctions'
import WarningMessage from '../../../common/WarningMessage'
import PopupMsgWrapper from '../../../common/PopupMsgWrapper';
import { updateCostingIdFromRfqToNfrPfs } from '../../actions/Costing'
import { pushNfrOnSap } from '../../../masters/nfr/actions/nfr'
import { MESSAGES } from '../../../../config/message'
function ApproveRejectDrawer(props) {
  // ********* INITIALIZE REF FOR DROPZONE ********
  const dropzone = useRef(null);

  const { type, approvalData, IsFinalLevel, IsPushDrawer, isSimulation, dataSend, reasonId, simulationDetail, selectedRowData, costingArr, isSaveDone, Attachements, vendorId, SimulationTechnologyId, SimulationType, costingList, isSimulationApprovalListing, attachments, apiData, SimulationHeadId, TechnologyId, releaseStrategyDetails, showFinalLevelButtons } = props

  const userLoggedIn = loggedInUserId()
  const userData = userDetails()
  const { TokensList } = useSelector(state => state.simulation)

  const { register, control, formState: { errors }, handleSubmit, setValue, getValues, reset, } = useForm({
    mode: 'onChange', reValidateMode: 'onChange',
  })

  const dispatch = useDispatch()
  const [approvalDropDown, setApprovalDropDown] = useState([])
  const [openPushButton, setOpenPushButton] = useState(false)
  const [linkingTokenDropDown, setLinkingTokenDropDown] = useState('')
  const [showError, setShowError] = useState(false)
  const [tokenDropdown, setTokenDropdown] = useState(true)
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [loader, setLoader] = useState(false)
  const [isDisable, setIsDisable] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)                     //RE
  const [showListingPage, setShowListingPage] = useState(false)
  const [attachmentLoader, setAttachmentLoader] = useState(false)
  const [levelDetails, setLevelDetails] = useState({})
  const [showWarningMessage, setShowWarningMessage] = useState(false)
  const [disableSR, setDisableSR] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const nfr = 101
  const deptList = useSelector((state) => state.approval.approvalDepartmentList)
  const { selectedMasterForSimulation, attachmentsData } = useSelector(state => state.simulation)
  const reasonsList = useSelector((state) => state.approval.reasonsList)
  const SAPData = useSelector(state => state.approval.SAPObj)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const [approverIdList, setApproverIdList] = useState([])

  const approverAPICall = (departmentId, technology, approverTypeId) => {

    let obj = {
      LoggedInUserId: userData.LoggedInUserId,
      DepartmentId: departmentId && departmentId,
      TechnologyId: technology,
      ReasonId: reasonId,
      ApprovalTypeId: approverTypeId,
      plantId: approvalData.plantId
    }
    dispatch(getAllApprovalUserFilterByDepartment(obj, (res) => {
      const Data = res.data.DataList[1] ? res.data.DataList[1] : []
      setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
      setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })
      let tempDropdownList = []
      res.data.DataList && res.data.DataList.map((item) => {
        if (item.Value === '0') return false;
        if (item.Value === EMPTY_GUID) {
          setShowWarningMessage(true)
          return false
        } else {
          setShowWarningMessage(false)
        }
        tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
        return null
      })
      setApprovalDropDown(tempDropdownList)
      // setApprover(Data.Text)
      // setSelectedApprover(Data.Value)
      // setSelectedApproverLevelId({ levelName: Data.LevelName, levelId: Data.LevelId })
      // setValue('approver', { label: Data.Text, value: Data.Value })
    }))
  }

  const toFindDuplicates = arry => {
    return arry.filter((item, index) => arry.indexOf(item) !== index)
  }
  useEffect(() => {
    dispatch(setAttachmentFileData([], () => { }))
  }, [])

  useEffect(() => {
    dispatch(getReasonSelectList((res) => { }))
    let levelDetailsTemp = ''
    setTimeout(() => {
      // dispatch(getAllApprovalDepartment((res) => { }))
      /***********************************REMOVE IT AFTER SETTING FROM SIMULATION*******************************/
      if (!isSimulation) {
        dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), TechnologyId, (res) => {
          levelDetailsTemp = userTechnologyLevelDetails(props?.costingTypeId, res?.data?.Data?.TechnologyLevels)
          setLevelDetails(levelDetailsTemp)
          if (levelDetailsTemp?.length === 0) {
            Toaster.warning("You don't have permission to send simulation for approval.")
          }
        }))

        dispatch(getAllApprovalDepartment((res) => {

          const Data = res?.data?.SelectList
          const departObj = Data && Data.filter(item => item.Value === userData.DepartmentId)

          setValue('dept', { label: departObj && departObj[0].Text, value: departObj && departObj[0].Value })

          if (initialConfiguration.IsReleaseStrategyConfigured && releaseStrategyDetails?.IsPFSOrBudgetingDetailsExist === true) {
            setDisableSR(true)
            approverAPICall(releaseStrategyDetails?.DepartmentId, releaseStrategyDetails?.TechnologyId, releaseStrategyDetails?.ApprovalTypeId)
          } else {
            setDisableSR(false)
            approverAPICall(departObj[0]?.Value, approvalData && approvalData[0]?.TechnologyId, costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId))
          }
        }))


      } else {
        dispatch(getUsersSimulationTechnologyLevelAPI(loggedInUserId(), selectedMasterForSimulation?.value, (res) => {
          if (res?.data?.Data) {
            levelDetailsTemp = userTechnologyLevelDetails(props?.costingTypeId, res?.data?.Data?.TechnologyLevels)
            setLevelDetails(levelDetailsTemp)
            if (levelDetailsTemp?.length !== 0) {
              dispatch(getSimulationApprovalByDepartment(res => {
                const Data = res.data.SelectList
                const departObj = Data && Data.filter(item => item.Value === (type === 'Sender' ? userData.DepartmentId : simulationDetail.DepartmentId))
                setValue('dept', { label: departObj[0].Text, value: departObj[0].Value })
                if (levelDetailsTemp?.length !== 0) {
                  getApproversList(departObj[0].Value, departObj[0].Text, levelDetailsTemp)
                }
                if (initialConfiguration.IsReleaseStrategyConfigured && releaseStrategyDetails?.IsPFSOrBudgetingDetailsExist === true) {
                  setDisableSR(true)
                  approverAPICall(releaseStrategyDetails?.DepartmentId, releaseStrategyDetails?.TechnologyId, releaseStrategyDetails?.ApprovalTypeId)
                } else {
                  setDisableSR(false)
                  approverAPICall(departObj[0].Value, approvalData && approvalData[0]?.TechnologyId, costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId))
                }
              }))
            } else {
              Toaster.warning("You don't have permission to send simulation for approval.")
            }
          }
        }))

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
        if (vendorId !== null && SimulationTechnologyId !== null && type === 'Sender' && !isSimulationApprovalListing) {
          dispatch(getSelectListOfSimulationLinkingTokens(vendorId, SimulationTechnologyId, () => { }))
        }
      }

      if (vendorId !== null && SimulationTechnologyId !== null && type === 'Sender' && !isSimulationApprovalListing && getConfigurationKey().IsProvisionalSimulation) {
        dispatch(getSelectListOfSimulationLinkingTokens(vendorId, SimulationTechnologyId, () => { }))
      }
    }, 300);

    if (SimulationType !== null && SimulationType === PROVISIONAL) {
      setTokenDropdown(false)
    }

    // DO IT AFTER GETTING DATA
  }, [])


  const getApproversList = (departObj, departmentName, levelDetailsTemp) => {
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
            DepartmentId: departObj,
            //NEED TO MAKE THIS 2   
            // TechnologyId: isSimulationApprovalListing ? selectedRowData[0].SimulationTechnologyId : simulationDetail.SimulationTechnologyId ? simulationDetail.SimulationTechnologyId : selectedMasterForSimulation.value,
            TechnologyId: item,
            ReasonId: 0,
            ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(levelDetailsTemp?.ApprovalTypeId),
            plantId: approvalData.plantId ?? EMPTY_GUID
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
            approverDropdownValue.push(tempDropdownList)
            setApproverIdList(approverIdListTemp)
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


      } else {

        let obj = {
          LoggedInUserId: userData.LoggedInUserId,
          DepartmentId: departObj,
          //NEED TO MAKE THIS 2   
          TechnologyId: isSimulationApprovalListing ? selectedRowData[0].SimulationTechnologyId : simulationDetail.SimulationTechnologyId ? simulationDetail.SimulationTechnologyId : selectedMasterForSimulation.value,
          ReasonId: 0,
          ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(levelDetailsTemp?.ApprovalTypeId),
          plantId: approvalData.plantId ?? EMPTY_GUID
        }

        dispatch(getAllSimulationApprovalList(obj, (res) => {
          const Data = res?.data?.DataList[1] ? res?.data?.DataList[1] : []
          if (Object?.keys(Data)?.length > 0) {
            setValue('dept', { label: Data?.DepartmentName, value: Data?.DepartmentId })
          }
          setValue('approver', { label: Data?.Text ? Data?.Text : '', value: Data?.Value ? Data?.Value : '', levelId: Data?.LevelId ? Data?.LevelId : '', levelName: Data?.LevelName ? Data?.LevelName : '' })
          let tempDropdownList = []
          res?.data?.DataList && res?.data?.DataList?.map((item) => {
            if (item?.Value === '0') return false;
            tempDropdownList?.push({
              label: item?.Text,
              value: item?.Value,
              levelId: item?.LevelId,
              levelName: item?.LevelName
            })
            return null
          })
          setApprovalDropDown(tempDropdownList)
          if ((tempDropdownList[0]?.value === EMPTY_GUID || tempDropdownList.length === 0) && type !== 'Reject' && !IsFinalLevel) {
            setShowWarningMessage(true)
            setApprovalDropDown([])
            setValue('dept', { label: departmentName, value: departObj })
            setValue('approver', '')
            return false
          } else {
            setShowWarningMessage(false)
          }
        }))
      }
    }

  }

  const handleTokenDropDownChange = (value) => {

    setLinkingTokenDropDown(value)

  }

  useEffect(() => {
    //THIS OBJ IS FOR SAVE SIMULATION
    if (type === 'Sender' && !isSaveDone && !isSimulationApprovalListing) {
      let simObj = formatRMSimulationObject(simulationDetail, costingArr, apiData)
      //THIS CONDITION IS FOR SAVE SIMULATION
      dispatch(saveSimulationForRawMaterial(simObj, res => {
        if (res?.data?.Result) {
          setLoader(true)
          // Toaster.success('Simulation saved successfully.')
          setLoader(false)
        }
      }))
      // switch (Number(master)) {
      //   case Number(RMDOMESTIC):

      //     break;
      //   case Number(RMIMPORT):
      //     dispatch(saveSimulationForRawMaterial(simObj, res => {
      //       if (res.data.Result) {
      //         Toaster.success('Simulation saved successfully.')
      //       }
      //     }))
      //   case 
      //     break;

      //   default:
      //     break;
      // }
    }
  }, [simulationDetail])

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

  const closePushButton = () => {
    setOpenPushButton(false)
    setShowListingPage(true)
    props.closeDrawer('', 'Cancel')
  }
  //MINDA
  // const onSubmit = debounce(handleSubmit(() => {
  //   const remark = getValues('remark')
  //   const reason = getValues('reason')
  //   const dept = getValues('dept')
  //   const approver = getValues('approver')
  //   if (type === 'Reject') {
  //     if (remark) {
  //       setShowError(false)
  //     } else {
  //       setShowError(true)
  //       return false
  //     }
  //   }

  //   if (type === 'Sender') {
  //     if (remark) {
  //       setShowError(false)
  //     } else {
  //       setShowError(true)
  //       return false
  //     }
  //     if (!reason) return false
  //   }
  //   setIsDisable(true)
  //   if (!isSimulation) {
  //     /*****************************THIS CONDITION IS FOR COSTING APPROVE OR REJECT CONDITION***********************************/
  //     let Data = []

  //     const pushTonfr = () => {
  //       let nfrobj = {
  //         "CostingId": approvalData[0]?.CostingId,
  //         "NfrId": approvalData[0]?.NfrId,
  //         "LoggedInUserId": loggedInUserId(),
  //         "IsRegularized": props?.IsRegularized
  //       }

  //       dispatch(updateCostingIdFromRfqToNfrPfs(nfrobj, res => {
  //         let pushRequest = {
  //           nfrGroupId: res.data.Data.NfrGroupIdForPFS3,
  //           costingId: approvalData[0].CostingId
  //         }
  //         dispatch(pushNfrOnSap(pushRequest, res => {
  //           if (res?.data?.Result) {
  //             Toaster.success(MESSAGES.NFR_PUSHED)
  //             onSubmit()
  //           }
  //         }))
  //       }))
  //     }
  const onSubmit = debounce(handleSubmit(() => {
    const remark = getValues('remark')
    const reason = getValues('reason')
    const dept = getValues('dept')
    const approver = getValues('approver')
    if (type === 'Reject') {
      if (remark) {
        setShowError(false)
      } else {
        setShowError(true)
        return false
      }
    }

    if (type === 'Sender') {
      if (remark) {
        setShowError(false)
      } else {
        setShowError(true)
        return false
      }
      if (!reason) return false
    }
    setIsDisable(true)
    if (!isSimulation) {
      /*****************************THIS CONDITION IS FOR COSTING APPROVE OR REJECT CONDITION***********************************/
      let Data = []

      approvalData.map(ele => {
        Data.push({
          ApprovalProcessSummaryId: ele.ApprovalProcessSummaryId,
          ApprovalToken: ele.ApprovalNumber,
          LoggedInUserId: userLoggedIn,
          SenderLevelId: levelDetails.LevelId,
          SenderLevel: levelDetails.Level,
          ApproverDepartmentId: dept && dept.value ? dept.value : '',
          ApproverDepartmentName: dept && dept.label ? dept.label : '',
          ApproverIdList: approver && approver.value ? approver.value : '',
          ApproverLevelId: approver && approver.levelId ? approver.levelId : '',
          ApproverLevel: approver && approver.levelName ? approver.levelName : '',
          Remark: remark,
          IsApproved: type === 'Approve' ? true : false,
          IsFinalApprovalProcess: false, //ASK THIS CONDITION WITH KAMAL SIR
          IsRFQCostingSendForApproval: false,
          IsReturn: type === 'Return' ? true : false,

        })
        return null;
      })
      if (type === 'Approve') {
        reset()
        dispatch(approvalRequestByApprove(Data, res => {
          setIsDisable(false)
          if (res?.data?.Result) {
            if (IsPushDrawer) {
              Toaster.success('The costing approved successfully')
              setOpenPushButton(true)
              //MINDA
              // if (res?.data?.Result) {
              //   setIsDisable(false)
              //   if (showFinalLevelButtons) {
              //     Toaster.success('The costing approved successfully')
              //     let pushdata = {
              //       effectiveDate: dataSend[0].EffectiveDate ? DayTime(dataSend[0].EffectiveDate).format('YYYY-MM-DD') : '',
              //       vendorCode: props?.vendorCodeForSAP ? props?.vendorCodeForSAP : '',
              //       materialNumber: dataSend[1].PartNumber,
              //       netPrice: dataSend[0].NewPOPrice,
              //       plant: dataSend[0].PlantCode ? dataSend[0].PlantCode : dataSend[0].DestinationPlantId ? dataSend[0].DestinationPlantCode : '',
              //       currencyKey: dataSend[0].Currency ? dataSend[0].Currency : INR,
              //       materialGroup: approvalData[0]?.MaterialGroup?.label ? approvalData[0]?.MaterialGroup.label.split('(')[0] : '',
              //       taxCode: 'YW',
              //       basicUOM: "NO",
              //       purchasingGroup: approvalData[0]?.PurchasingGroup?.label ? approvalData[0]?.PurchasingGroup.label.split('(')[0] : '',
              //       purchasingOrg: dataSend[0].CompanyCode ? dataSend[0].CompanyCode : '',
              //       CostingId: approvalData[0].CostingId,
              //       DecimalOption: approvalData[0].DecimalOption,
              //       InfoToConditions: props.conditionInfo,
              //       TokenNumber: approvalData[0]?.ApprovalNumber,
              //       IsRequestForCosting: true,
              //       IsRequestForBoughtOutPartMaster: false,
              //       // Quantity: quantity
              //       // effectiveDate: '11/30/2021',
              //       // vendorCode: '203670',
              //       // materialNumber: 'S07004-003A0Y',
              //       // materialGroup: 'M089',
              //       // taxCode: 'YW',
              //       // plant: '1401',
              //       // netPrice: '30.00',
              //       // currencyKey: 'INR',
              //       // basicUOM: 'NO',
              //       // purchasingOrg: 'MRPL',
              //       // purchasingGroup: 'O02'

              //     }
              //     let obj = {
              //       LoggedInUserId: loggedInUserId(),
              //       Request: [pushdata]
              //     }
              //     dispatch(approvalPushedOnSap(obj, res => {
              //       if (res && res.status && (res.status === 200 || res.status === 204)) {
              //         Toaster.success('Approval pushed successfully.')
              //       }
              //     }))
              //     if (approvalData[0].IsNFRPFS3PushedButtonShow && approvalData[0].NfrGroupIdForPFS3 === null && props.IsRegularized) {
              //       pushTonfr()

              //     }
              //     props.closeDrawer('', 'submit')
              //     // setOpenPushButton(true)

              //   } else {
              //     Toaster.success(!IsFinalLevel ? 'The costing approved successfully' : 'The costing has been sent to next level for approval')
              //     props.closeDrawer('', 'submit')
              //   }
              // }
            }
          }
        }))
      } else {
        // REJECT CONDITION
        dispatch(rejectRequestByApprove(Data, res => {
          setIsDisable(false)
          if (res?.data?.Result) {
            Toaster.success(`Costing ${props?.type === "Return" ? 'Returned' : 'Rejected'}`);
            props.closeDrawer('', 'submit')
          }
          if (props?.isRFQApproval) {
            props?.cancel()
          }
        }))
      }
    } else {
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
            IsFinalApprovalProcess: false,
            SimulationApprovalProcessSummaryId: item?.SimulationApprovalProcessSummaryId,
            IsMultiSimulation: isSimulationApprovalListing ? true : false
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
          IsMultiSimulation: isSimulationApprovalListing ? true : false
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
        // senderObj.ApproverId = approver && approver.value ? approver.value : ''
        senderObj.ApproverIdList = initialConfiguration.IsMultipleUserAllowForApproval ? approverIdList : [approver && approver.value ? approver.value : '']
        senderObj.SenderLevelId = levelDetails?.LevelId
        senderObj.SenderLevel = levelDetails?.Level
        senderObj.SenderId = userLoggedIn
        senderObj.SenderRemark = remark
        senderObj.EffectiveDate = DayTime(simulationDetail?.EffectiveDate).format('YYYY/MM/DD HH:mm')
        senderObj.LoggedInUserId = userLoggedIn
        senderObj.ApprovalTypeId = costingTypeIdToApprovalTypeIdFunction(levelDetails?.ApprovalTypeId)
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
        senderObj.Attachements = updatedFiles
        // senderObj.Attachements = attachmentsData                     //RE
        senderObj.LinkedTokenNumber = linkingTokenDropDown.value
        senderObj.PurchasingGroup = SAPData.PurchasingGroup?.label
        senderObj.MaterialGroup = SAPData.MaterialGroup?.label
        senderObj.DecimalOption = SAPData.DecimalOption?.value
        senderObj.IsMultiSimulation = isSimulationApprovalListing ? true : false      // IF WE SEND MULTIPLE TOKENS FOR SIMULATION THEN THIS WILL BE TRUE (requirement)

        //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
        setIsDisableSubmit(true)
        dispatch(simulationApprovalRequestBySender(senderObj, res => {
          setIsDisable(false)
          let status = 200
          if ('response' in res) {
            status = res && res?.response?.status
          }
          if (status === 200) {
            setIsDisableSubmit(false)
          }
          if (res?.data?.Result) {
            Toaster.success('Simulation token has been sent for approval.')
            props.closeDrawer('', 'submit')
          }
        }))
      }
      else if (type === 'Approve') {
        //THIS CONDITION IS FOR APPROVE THE SIMULATION REQUEST 
        dispatch(simulationApprovalRequestByApprove(approverObject, res => {
          let status = res && res?.status
          setIsDisable(false)
          if (res?.data?.Result) {
            if (IsPushDrawer) {
              Toaster.success('The simulation token approved successfully')
              setOpenPushButton(true)
              //MINDA
              // if (showFinalLevelButtons) {
              //   Toaster.success('The simulation token approved successfully.')
              //   let temp = []
              //   costingList && costingList.map(item => {
              //     temp.push({
              //       CostingId: item.CostingId,
              //       effectiveDate: DayTime(simulationDetail.EffectiveDate).format('MM/DD/YYYY'),
              //       vendorCode: getCodeBySplitting(item.VendorName),
              //       materialNumber: item.PartNo,
              //       netPrice: item.NewPOPrice,
              //       plant: item.PlantCode ? item.PlantCode : '1511',
              //       currencyKey: INR,
              //       basicUOM: 'NO',
              //       purchasingOrg: item.DepartmentCode,
              //       purchasingGroup: '',
              //       materialGroup: '',
              //       taxCode: 'YW', TokenNumber: simulationDetail.Token,
              //       DecimalOption: simulationDetail.DecimalOption,
              //       IsRequestForCosting: false
              //       // Quantity: quantity
              //     })
              //   })
              //   // let simObj = {
              //   //   LoggedInUserId: loggedInUserId(),
              //   //   Request: temp
              //   // }
              //   // dispatch(approvalPushedOnSap(simObj, res => {
              //   //   if (res && res.status && (res.status === 200 || res.status === 204)) {
              //   //     Toaster.success('Approval pushed successfully.')
              //   //   }
              //   // }))

              //   props.closeDrawer('', 'submit')
              // }
            }
            else {
              Toaster.success(IsFinalLevel ? 'The simulation token approved successfully' : 'The simulation token has been sent to next level for approval')
              props.closeDrawer('', 'submit')
              // if (IsFinalLevel) {
              //   // let pushObj = {}
              //   // let temp = []
              //   // let uniqueArr = _.uniqBy(costingList, function (o) {
              //   //   return o.CostingId;
              //   // });

              //   // uniqueArr && uniqueArr.map(item => {
              //   //   const vendor = item.VendorName.split('(')[1]
              //   //   temp.push({ TokenNumber: simulationDetail.Token, Vendor: item?.VendorCode, PurchasingGroup: simulationDetail.DepartmentCode, Plant: item.PlantCode, MaterialCode: item.PartNo, NewPOPrice: item.NewPOPrice, EffectiveDate: simulationDetail.EffectiveDate, SimulationId: simulationDetail.SimulationId })
              //   //   return null
              //   // })
              //   // pushObj.LoggedInUserId = userLoggedIn
              //   // pushObj.AmmendentDataRequests = temp
              //   // dispatch(pushAPI(pushObj, () => { }))
              //   Toaster.success(IsFinalLevel ? 'The simulation token approved successfully' : 'The simulation token has been sent to next level for approval')
              //   props.closeDrawer('', 'submit', status)
              // } else {
              //   Toaster.success(IsFinalLevel ? 'The simulation token approved successfully' : 'The simulation token has been sent to next level for approval')
              //   props.closeDrawer('', 'submit')
              // }
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
    }

  }), 600)

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

    if (label === 'Link') {
      TokensList && TokensList.map((item) => {

        if (item.Value === '0') return false
        tempDropdownList.push({ label: item.Text, value: item.Value })
        return null
      })
      return tempDropdownList
    }
  }

  const handleDepartmentChange = (value) => {
    setValue('approver', { label: '', value: '', levelId: '', levelName: '' })
    setValue('dept', { label: value.label, value: value.value })

    let tempDropdownList = []
    let obj
    if (!isSimulation) {
      obj = {
        LoggedInUserId: loggedInUserId(), // user id
        DepartmentId: value.value,
        TechnologyId: approvalData[0] && approvalData[0].TechnologyId ? approvalData[0].TechnologyId : '00000000-0000-0000-0000-000000000000',
        ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId),
        plantId: approvalData.plantId
      }
    } else {
    }


    if (!isSimulation) {
      dispatch(getAllApprovalUserFilterByDepartment(obj, (res) => {
        res.data.DataList && res.data.DataList.map((item) => {
          const Data = res.data.DataList[1] ? res.data.DataList[1] : []
          if (item.Value === '0') return false;
          if (item.Value === EMPTY_GUID) {
            setShowWarningMessage(true)
            return false
          } else {
            setShowWarningMessage(false)
            setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })
          }
          tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
          return null
        })
        setApprovalDropDown(tempDropdownList)
      }))
    } else {
      if (levelDetails?.length !== 0) {
        getApproversList(value.value, value.label, levelDetails)
      }
      // dispatch(
      //   getAllSimulationApprovalList(simObj, (res) => {
      //     res.data.DataList &&
      //       res.data.DataList.map((item) => {
      //         if (item.Value === '0') return false;
      //         tempDropdownList.push({
      //           label: item.Text,
      //           value: item.Value,
      //           levelId: item.LevelId,
      //           levelName: item.LevelName
      //         })
      //         return null
      //       })
      //     setApprovalDropDown(tempDropdownList)
      //   },
      //   ),
      // )
    }
  }

  const handleRemark = (e) => {
    if (e) {
      setShowError(false)
    } else {
      setShowError(true)
    }
  }

  /**
 * @method setDisableFalseFunction
 * @description setDisableFalseFunction
 */
  const setDisableFalseFunction = () => {
    const loop = Number(dropzone.current.files.length) - Number(files.length)
    if (Number(loop) === 1 || Number(dropzone.current.files.length) === Number(files.length)) {
      setIsDisable(false)
      setAttachmentLoader(false)
    }
  }

  // called every time a file's `status` changes
  const handleChangeStatus = ({ meta, file }, status) => {
    setIsDisable(true)
    setAttachmentLoader(true)
    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = files && files.filter(item => item.OriginalFileName !== removedFileName)
      setFiles(tempArr)
      setTimeout(() => {
        setIsOpen(!IsOpen)
      }, 500);
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      setIsDisable(true)
      dispatch(uploadSimulationAttachment(data, (res) => {
        setDisableFalseFunction()
        let Data = res?.data[0]
        files.push(Data)
        setFiles(files)
        setTimeout(() => {
          setIsOpen(!IsOpen)
        }, 500);
      }))
    }

    if (status === 'rejected_file_type') {
      setDisableFalseFunction()
      Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
    } else if (status === 'error_file_size') {
      setDisableFalseFunction()
      dropzone.current.files.pop()
      Toaster.warning("File size greater than 5mb not allowed")
    } else if (status === 'error_validation'
      || status === 'error_upload_params' || status === 'exception_upload'
      || status === 'aborted' || status === 'error_upload') {
      setDisableFalseFunction()
      dropzone.current.files.pop()
      Toaster.warning("Something went wrong")
    }
  }

  const Preview = ({ meta }) => {
    return (
      <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
        {/* {Math.round(percent)}% */}
      </span>
    )
  }

  const callbackFunctionForDisableSaveButton = (value) => {
    setIsDisable(value)
  }

  const deleteFile = (FileId, OriginalFileName) => {
    if (FileId != null) {
      let tempArr = files && files.filter(item => item.FileId !== FileId)
      setFiles(tempArr)
      setIsOpen(!IsOpen)
    }
    if (FileId == null) {
      let tempArr = files && files.filter(item => item.FileName !== OriginalFileName)
      setFiles(tempArr)
      setIsOpen(!IsOpen)
    }

    // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
    if (dropzone?.current !== null) {
      dropzone.current.files.pop()
    }
  }
  useEffect(() => {
    if (showListingPage === true) {
      return <Redirect to="/simulation-history" />
    }
  }, [showListingPage])
  const showPopupWrapper = () => {
    setShowPopup(true)
  }
  const onPopupConfirm = () => {
    let obj = {
      "CostingId": approvalData[0]?.CostingId,
      "NfrId": approvalData[0]?.NfrId,
      "LoggedInUserId": loggedInUserId(),
      "IsRegularized": props?.IsRegularized
    }
    dispatch(updateCostingIdFromRfqToNfrPfs(obj, res => {
      let pushRequest = {
        nfrGroupId: res.data.Data.NfrGroupIdForPFS2,
        costingId: approvalData[0].CostingId
      }
      dispatch(pushNfrOnSap(pushRequest, res => {
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.NFR_PUSHED)
          onSubmit()
        }
      }))
    }))
    setShowPopup(false)
  }
  const closePopUp = () => {
    onSubmit()
    setShowPopup(false)
  }
  return (
    <>

      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      //onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper'}>
            {loader && <LoaderCustom customClass="approve-reject-drawer-loader" />}
            <form
            >

              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{`${isSimulation ? `${type === 'Sender' ? 'Send For Approval' : `${type} Simulation`}` : `${props?.isRFQApproval ? 'Return' : type} Costing`} `}</h3>
                  </div>

                  <div
                    onClick={(e) => toggleDrawer(e)}
                    disabled={isDisable}
                    className={'close-button right'}
                  ></div>
                </Col>
              </Row>

              <Row className="ml-0">
                {type === 'Approve' && IsFinalLevel && !isSimulation && (
                  <>
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
                        disabled={disableSR}
                      //MINDA
                      // disabled={!(userData.Department.length > 1 && reasonId !== REASON_ID) || disableSR ? true : false}
                      />
                      {showWarningMessage && <WarningMessage dClass={"mr-2"} message={`There is no approver added against this ${getConfigurationKey().IsCompanyConfigureOnPlant ? 'company' : 'department'}`} />}
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
                          rules={{ required: true }}
                          register={register}
                          //defaultValue={isEditFlag ? plantName : ''}
                          options={approvalDropDown}
                          mandatory={true}
                          handleChange={() => { }}
                          disabled={disableSR}
                          //MINDA
                          // disabled={!(userData.Department.length > 1 && reasonId !== REASON_ID) || disableSR ? true : false}
                          errors={errors.approver}
                        />}
                    </div>
                  </>
                )}
                {
                  // REMOVE IT AFTER FUNCTIONING IS DONE FOR SIMUALTION, NEED TO MAKE CHANGES FROM BACKEND FOR SIMULATION TODO
                  isSimulation && (type === 'Approve' || type === 'Sender') && !IsFinalLevel &&
                  <>
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
                        disabled={disableSR}
                      //MINDA
                      // disabled={(userData.Department.length > 1 && reasonId !== REASON_ID) ? false : true}
                      />
                      {showWarningMessage && <WarningMessage dClass={"mr-2"} message={`There is no approver added against this ${getConfigurationKey().IsCompanyConfigureOnPlant ? 'company' : 'department'}`} />}
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
                          rules={{ required: true }}
                          register={register}
                          //defaultValue={isEditFlag ? plantName : ''}
                          options={approvalDropDown}
                          mandatory={true}
                          handleChange={() => { }}
                          errors={errors.approver}
                          disabled={disableSR}
                        //MINDA
                        // disabled={(userData.Department.length > 1 && reasonId !== REASON_ID) ? false : true}
                        />}
                    </div>
                    {
                      type === 'Sender' &&
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
                            //defaultValue={isEditFlag ? plantName : ''}
                            options={renderDropdownListing('reasons')}
                            mandatory={true}
                            handleChange={() => { }}
                            errors={errors.reason}
                          />
                        </div>
                        {/* <div className="input-group form-group col-md-12">
                          <div className="inputbox date-section">
                            <DatePickerHookForm
                              name={`EffectiveDate`}
                              label={'Effective Date'}
                              selected={selectedDate}
                              handleChange={(date) => {
                                handleEffectiveDateChange(date);
                              }}
                              //defaultValue={data.effectiveDate != "" ? moment(data.effectiveDate).format('DD/MM/YYYY') : ""}
                              rules={{ required: true }}
                              Controller={Controller}
                              control={control}
                              register={register}
                              showMonthDropdown
                              showYearDropdown
                              dateFormat="aa/MM/yyyy"
                              //maxDate={new Date()}
                              placeholderText="Select date"
                              customClassName="withBorder"
                              className="withBorder"
                              autoComplete={"off"}
                              disabledKeyboardNavigation
                              onChangeRaw={(e) => e.preventDefault()}
                              disabled={false}
                              mandatory={true}
                              errors={errors.EffectiveDate}
                            />
                          </div>
                        </div> */}
                        {!isSimulationApprovalListing &&
                          <div className="input-group form-group col-md-12">
                            <label>Effective Date<span className="asterisk-required">*</span></label>
                            <div className="inputbox date-section">
                              <DatePicker
                                name="EffectiveDate"
                                selected={simulationDetail?.EffectiveDate && DayTime(simulationDetail.EffectiveDate).isValid() ? new Date(simulationDetail.EffectiveDate) : ''}
                                // onChange={handleEffectiveDateChange}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode='select'
                                dateFormat="dd/MM/yyyy"
                                //maxDate={new Date()}
                                placeholderText="Select date"
                                className="withBorder"
                                autoComplete={"off"}
                                disabledKeyboardNavigation
                                onChangeRaw={(e) => e.preventDefault()}
                                disabled={true}
                              />
                            </div>
                          </div>
                        }
                      </>
                    }
                    {/* MINDA */}
                    {/* {
                      type === 'Sender' &&
                      <Row className="px-3">
                        <Col md="12">
                          <div className="left-border">{"SAP-Push Details"}</div>
                        </Col>
                        <div className="w-100">
                          <PushSection
                            errors={errors}
                            register={register}
                            control={control}
                            Controller={Controller}
                          />
                        </div>

                      </Row>
                    } */}

                  </>
                }


                {getConfigurationKey().IsProvisionalSimulation && tokenDropdown && type === 'Sender' && !isSimulationApprovalListing &&

                  < div className="input-group form-group col-md-12">

                    <SearchableSelectHookForm
                      label={'Link Token Number'}
                      name={'Link'}
                      placeholder={'select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: false }}
                      register={register}
                      // defaultValue={technology.length !== 0 ? technology : ''}
                      options={renderDropdownListing('Link')}
                      mandatory={false}
                      handleChange={handleTokenDropDownChange}
                      errors={errors.Masters}
                      customClassName="mb-0"
                    />
                  </div >
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
                      maxLength: {
                        value: 255,
                        message: "Remark should be less than 255 words"
                      },
                    }}
                    handleChange={handleRemark}
                    //defaultValue={viewRM.RMRate}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.remark}
                    disabled={false}
                  />
                  {/* {showError && <span className="text-help">This is required field</span>} */}
                </div>
                {isSimulation && type === 'Sender' &&
                  <div className="col-md-12 drawer-attachment">
                    <div className="d-flex w-100 flex-wrap">
                      <Col md="8" className="p-0"><h6 className="mb-0">Attachments</h6></Col>
                    </div>
                    <div className="d-flex w-100 flex-wrap pt-2">
                      {<>
                        <Col md="12" className="p-0">
                          <label>Upload Attachment (upload up to 2 files)</label>
                          <div className={`alert alert-danger mt-2 ${files.length === 2 ? '' : 'd-none'}`} role="alert">
                            Maximum file upload limit reached.
                          </div>
                          <div className={`${files.length >= 2 ? 'd-none' : ''}`}>
                            <Dropzone
                              ref={dropzone}
                              onChangeStatus={handleChangeStatus}
                              PreviewComponent={Preview}
                              // onSubmit={handleImapctSubmit}
                              accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                              initialFiles={[]}
                              maxFiles={2}
                              maxSizeBytes={5000000}
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
                              disabled={type === 'Sender' ? false : true}
                            />
                          </div>
                        </Col>
                        <div className="w-100">
                          <div className={"attachment-wrapper mt-0 mb-3"}>
                            {attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                            {files &&
                              files.map((f) => {
                                const withOutTild = f.FileURL.replace("~", "");
                                const fileURL = `${FILE_URL}${withOutTild}`;
                                return (
                                  <div className={"attachment images"} >
                                    <a href={fileURL} target="_blank" rel="noreferrer">
                                      {f.OriginalFileName}
                                    </a>
                                    {(type === 'Sender' ? true : false) &&
                                      <img

                                        alt={""}
                                        className="float-right"
                                        onClick={() => deleteFile(f.FileId, f.FileName)} src={redcrossImg}
                                      ></img>
                                    }
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </>
                      }
                    </div>
                  </div>
                }

                {/* // {                     //RE
                //   isSimulation && type === 'Sender' &&
                //   <AttachmentSec
                //     token={simulationDetail?.TokenNo}
                //     type={type}
                //     Attachements={simulationDetail?.Attachements}
                //     showAttachment={false}
                //     callbackFunctionForDisableSaveButton={callbackFunctionForDisableSaveButton}
                //     isSimulationSummary={false}
                //   />
                // } */}

              </Row >
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
                    onClick={props.isShowNFRPopUp ? showPopupWrapper : onSubmit}
                    disabled={isDisable}
                  // disabled={isDisable || isDisableSubmit}                     //RE
                  >
                    <div className={'save-icon'}></div>
                    {'Submit'}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
        {
          (showPopup && props.isShowNFRPopUp) && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`Do you want to push this vendor's costing to SAP for PFS2`} nfrPopup={true} />
        }
      </Drawer>
      {(openPushButton || showFinalLevelButtons) && (
        <PushButtonDrawer
          isOpen={openPushButton}
          closeDrawer={closePushButton}
          approvalData={approvalData ? approvalData : []}
          isSimulation={isSimulation}
          simulationDetail={simulationDetail}
          dataSend={dataSend ? dataSend : []}
          costingList={costingList}
          anchor={'right'}
        />
      )}
    </>
  )
}

export default React.memo(ApproveRejectDrawer)
