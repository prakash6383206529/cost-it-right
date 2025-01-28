  import React, { useEffect, useRef, useState } from 'react'
  import { useForm } from 'react-hook-form'
  import { useDispatch, useSelector } from 'react-redux'
  import { approvalPushedOnSap, approvalRequestByApprove, getAllApprovalDepartment, getAllApprovalUserFilterByDepartment, getReasonSelectList, rejectRequestByApprove, } from '../../../costing/actions/Approval'
  import { loggedInUserId, userDetails, userTechnologyLevelDetails, getConfigurationKey } from '../../../../helper'
  import PushButtonDrawer from './PushButtonDrawer'
  import { EMPTY_GUID, INR } from '../../../../config/constants'
  import { debounce } from 'lodash'
  import "react-datepicker/dist/react-datepicker.css";
  import 'react-dropzone-uploader/dist/styles.css';
  import Toaster from '../../../common/Toaster'
  import { costingTypeIdToApprovalTypeIdFunction } from '../../../common/CommonFunctions'
  import ApproveRejectUI from './ApproveRejectUI'
  import { updateCostingIdFromRfqToNfrPfs } from '../../actions/Costing'
  import { getUsersTechnologyLevelAPI } from '../../../../actions/auth/AuthActions'
  import DayTime from '../../../common/DayTimeWrapper'
  import { pushNfrOnSap } from '../../../masters/nfr/actions/nfr'
  import { MESSAGES } from '../../../../config/message'
  import { getApprovalTypeSelectList } from '../../../../actions/Common'

  function CostingApproveReject(props) {
    // console.log(props,'props')
    // ********* INITIALIZE REF FOR DROPZONE ********

    const { type, technologyId, approvalData, IsNotFinalLevel, IsPushDrawer, dataSend, reasonId, selectedRowData, costingArr, apiData, TechnologyId, releaseStrategyDetails } = props
    console.log(approvalData,'approvalData')
    console.log(props,'props')
    const userLoggedIn = loggedInUserId()
    const userData = userDetails()

    const { formState: { }, handleSubmit, setValue, reset } = useForm({
      mode: 'onChange', reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()
    const [approvalDropDown, setApprovalDropDown] = useState([])
    const [openPushButton, setOpenPushButton] = useState(false)
    const [showError, setShowError] = useState(false)
    const [tokenDropdown, setTokenDropdown] = useState(true)
    const [isDisable, setIsDisable] = useState(false)
    const [levelDetails, setLevelDetails] = useState({})
    const [showWarningMessage, setShowWarningMessage] = useState(false)
    const [technologyLevelsList, setTechnologyLevelsList] = useState('')
    const [isResponseTrueObj, setIsResponseTrueObj] = useState({})
    const [dataInFields, setDataInFields] = useState({})
    const [finalLevelUser, setFinalLevelUser] = useState(false);
    const [showMessage, setShowMessage] = useState()
    const [disableReleaseStrategy, setDisableReleaseStrategy] = useState(false)
    const [approverIdList, setApproverIdList] = useState([])
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const approvalTypeSelectList = useSelector(state => state.comman.approvalTypeSelectList)

  useEffect(() => {
    dispatch(getApprovalTypeSelectList('', () => { }))
  }, [])

    useEffect(() => {
      dispatch(getReasonSelectList((res) => { }))
      if (!props?.isRFQApproval) {
        let levelDetailsTemp = ''
        setTimeout(() => {
          dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), TechnologyId,approvalData[0]?.ReceiverId, (res) => {
            levelDetailsTemp = userTechnologyLevelDetails(props?.costingTypeId, res?.data?.Data?.TechnologyLevels)
            setLevelDetails(levelDetailsTemp)
            if (levelDetailsTemp?.length === 0) {
              Toaster.warning("You don't have permission to send costing for approval.")
            }
          }))
              let dataInFieldTemp = {...dataInFields,Department: { label: approvalData[0]?.DepartmentName, value: approvalData[0]?.DepartmentId }}
              setDataInFields(dataInFieldTemp)
              setValue('dept', { label: approvalData[0]?.DepartmentName, value: approvalData[0]?.DepartmentId })
            if (initialConfiguration.IsReleaseStrategyConfigured && releaseStrategyDetails?.IsPFSOrBudgetingDetailsExist === true) {
              setDisableReleaseStrategy(true)
              approverAPICall(releaseStrategyDetails?.DepartmentId, releaseStrategyDetails?.TechnologyId, releaseStrategyDetails?.ApprovalTypeId, dataInFieldTemp)
            } else {
              setDisableReleaseStrategy(false)
              approverAPICall(approvalData[0]?.DepartmentId, approvalData && approvalData[0]?.TechnologyId, costingTypeIdToApprovalTypeIdFunction(props?.approvalData[0].ApprovalTypeId ?? props?.costingTypeId), dataInFieldTemp)  
              // MINDA
              // approverAPICall(departObj[0]?.Value, approvalData && approvalData[0]?.TechnologyId, props?.costingTypeId, dataInFieldTemp)
            }
        }, 300);
      }
    }, [])

    const approverAPICall = (departmentId, technology, approverTypeId, dataInFieldObj) => {

      let obj = {
        LoggedInUserId: userData.LoggedInUserId,
        DepartmentId: departmentId && departmentId,
        TechnologyId: technology,
        ReasonId: reasonId,
        ApprovalTypeId: approverTypeId,
        plantId: approvalData[0].PlantId ?? EMPTY_GUID,
        DivisionId: approvalData[0]?.DivisionId ?? null,
        ReceiverId: approvalData[0]?.ReceiverId ?? null
      }
      dispatch(getAllApprovalUserFilterByDepartment(obj, (res) => {
        const Data = res.data.DataList[1] ? res.data.DataList[1] : []
        setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
        setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })
        let dataInFieldTemp = {
          ...dataInFieldObj,
          Approver: { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' }
        }
        setDataInFields(dataInFieldTemp)
        let tempDropdownList = []
        let approverIdListTemp = []
        res.data.DataList && res.data.DataList.map((item) => {
          if (item.Value === '0') return false;
          if (item.Value === EMPTY_GUID) {
            setShowWarningMessage(true)
            return false
          } else {
            setShowWarningMessage(false)
          }
          tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
          approverIdListTemp.push(item.Value)
          return null
        })
        setApprovalDropDown(tempDropdownList)
        setApproverIdList(approverIdListTemp)
      }))
    }

    const callbackSetDataInFields = (obj) => {
      setDataInFields(obj)
    }

    const checkPermission = (costingTypeId) => {
      let levelDetailsTemp = ''
      levelDetailsTemp = userTechnologyLevelDetails(costingTypeId, technologyLevelsList?.TechnologyLevels)
      setLevelDetails(levelDetailsTemp)
      if (levelDetailsTemp?.length !== 0) {
        let departmentAndApproverDetails = {
          Department: { label: '', value: '' },
          Approver: { label: '', value: '', levelId: '', levelName: '' }
        };
  
        if (getConfigurationKey().IsReleaseStrategyConfigured) {
          let appTypeId = approvalTypeSelectList?.filter(element =>
            Number(element?.Value) === Number(dataInFields?.ApprovalType?.value)
          )[0];
  
          departmentAndApproverDetails = {
            Department: dataInFields?.Department ? { label: dataInFields.Department.label, value: dataInFields.Department.value } : '', Approver: dataInFields?.Approver || ''
          };
          setDataInFields({
            ...dataInFields,
            ApprovalType: appTypeId ? { label: appTypeId?.Text, value: appTypeId?.Value } : '',
            ...departmentAndApproverDetails
          });
  
        } else if (!getConfigurationKey().IsDivisionAllowedForDepartment || type === 'Approve') {
          if (type === 'Approve') {
            if (approvalData?.length > 0) {
              departmentAndApproverDetails.Department = { label: approvalData[0]?.DepartmentName || '', value: approvalData[0]?.DepartmentId || '' };
            }
          } else {
            departmentAndApproverDetails = { Department: dataInFields?.Department ? { label: dataInFields?.Department?.label, value: dataInFields.Department.value } : '', Approver: dataInFields?.Approver || '' };
          }
  
          setDataInFields({ ...dataInFields, ...departmentAndApproverDetails });
  
        } else if (getConfigurationKey().IsDivisionAllowedForDepartment && type === 'Sender') {
          departmentAndApproverDetails = { Department: dataInFields?.Department ? { label: dataInFields?.Department?.label, value: dataInFields.Department.value } : '', Approver: dataInFields?.Approver || '' };
  
          setDataInFields({ ...dataInFields, ...departmentAndApproverDetails });
        }
  
        getApproversList(departmentAndApproverDetails.Department, levelDetailsTemp, departmentAndApproverDetails)
  
      } else {
        Toaster.warning("You don't have permission to send costing for approval.")
      }
    }

    useEffect(() => {
      if (isResponseTrueObj?.Department && technologyLevelsList !== '' && type !== 'Reject' && !IsNotFinalLevel) {
        checkPermission(dataInFields?.ApprovalType?.value)
      }
    }, [isResponseTrueObj, technologyLevelsList, dataInFields?.ApprovalType])

    const getApproversList = (departId, departmentName, levelDetailsTemp, dataInFieldsTemp) => {
      if (IsNotFinalLevel) {
        dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), TechnologyId,approvalData[0]?.ReceiverId, (res) => {
          let approvalTypeId = props?.costingTypeId

          levelDetailsTemp = userTechnologyLevelDetails(approvalTypeId, res?.data?.Data?.TechnologyLevels)
          setLevelDetails(levelDetailsTemp)
          if (levelDetailsTemp?.length === 0) {
            Toaster.warning("You don't have permission to send costing for approval.")
          }
        }))
         setValue('dept', { label: approvalData[0]?.DepartmentName, value: approvalData[0]?.DepartmentId })
          if (initialConfiguration.IsReleaseStrategyConfigured && releaseStrategyDetails?.IsPFSOrBudgetingDetailsExist === true) {
            setDisableReleaseStrategy(true)
            approverAPICall(releaseStrategyDetails?.DepartmentId, releaseStrategyDetails?.TechnologyId, (releaseStrategyDetails?.ApprovalTypeId ? releaseStrategyDetails?.ApprovalTypeId : 'approvalType'))
          } else {
            setDisableReleaseStrategy(false)
            approverAPICall(approvalData[0]?.DepartmentId, approvalData && approvalData[0]?.TechnologyId, costingTypeIdToApprovalTypeIdFunction('approvalType'))
          }
      
      }
    }

    const closePushButton = () => {
      setOpenPushButton(false)
      props.closeDrawer('', 'Cancel')
    }


    const pushtoNFrForPFS2 = () => {
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
    }




    const pushTonfr = () => {
      let nfrobj = {
        "CostingId": approvalData[0]?.CostingId,
        "NfrId": approvalData[0]?.NfrId,
        "LoggedInUserId": loggedInUserId(),
        "IsRegularized": props?.IsRegularized
      }

      dispatch(updateCostingIdFromRfqToNfrPfs(nfrobj, res => {
        let pushRequest = {
          nfrGroupId: res.data.Data.NfrGroupIdForPFS3,
          costingId: approvalData[0].CostingId
        }
        dispatch(pushNfrOnSap(pushRequest, res => {
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.NFR_PUSHED)
            onSubmit()
          }
        }))
      }))
    }

    const onSubmit = debounce(handleSubmit(() => {
      const remark = dataInFields?.Remark
      const reason = dataInFields?.Reason
      const dept = dataInFields?.Department
      const approver = dataInFields?.Approver
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
          // Approver: approver && approver.value ? approver.value : '',
          ApproverIdList: initialConfiguration.IsMultipleUserAllowForApproval ? approverIdList : approver && approver.value ? [approver.value]:[],
          ApproverLevelId: approver && approver.levelId ? approver.levelId : '',
          ApproverLevel: approver && approver.levelName ? approver.levelName : '',
          Remark: remark,
          IsApproved: type === 'Approve' ? true : false,
          IsFinalApprovalProcess: false,
          IsRFQCostingSendForApproval: false,
          ApprovalTypeId: ele.ApprovalTypeId,
          IsReturn: type === 'Return' ? true : false,
          DivisionId: approvalData[0]?.DivisionId ?? null,
          ReceiverId:approvalData[0]?.ReceiverId??null
        })
        return null;
      })
      if (type === 'Approve') {
        dispatch(approvalRequestByApprove(Data, res => {
          setIsDisable(false)
          if (res?.data?.Result) {
            if (IsPushDrawer) {
              Toaster.success('The costing approved successfully')
              setOpenPushButton(true)
              //MINDA
              // reset()
              // dispatch(approvalRequestByApprove(Data, res => {
              //   if (res?.data?.Result) {
              //     setIsDisable(false)

              //     if (!IsNotFinalLevel) {
              //       Toaster.success('The costing approved successfully')
              //       if (!props.isApprovalListing) {


              //         if (approvalData[0].IsNFRPFS2PushedButtonShow && approvalData[0].NfrGroupIdForPFS2 === null && !props.IsRegularized) {
              //           pushtoNFrForPFS2()

              //         }
              //         if (approvalData[0].IsNFRPFS3PushedButtonShow && approvalData[0].NfrGroupIdForPFS3 === null && props.IsRegularized) {
              //           pushTonfr()

              //         }

              //       }

              //       props.closeDrawer('', 'submit')
              //       // setOpenPushButton(true)

            } else {
              Toaster.success(!IsNotFinalLevel ? 'The costing approved successfully' : 'The costing has been sent to next level for approval')
              props.closeDrawer('', 'submit')
            }
          }
        }))
      } else {
        // REJECT CONDITION
        dispatch(rejectRequestByApprove(Data, res => {
          setIsDisable(false)
          if (res?.data?.Result) {
            Toaster.success(`Costing ${props?.type === "Return" ? 'Returned' : 'Rejected'}`)
            props.closeDrawer('', 'submit')
          }
          if (props?.isRFQApproval) {
            props?.cancel()
          }
        }))
      }
    }), 600)

    const handleDepartmentChange = (value) => {
      let tempDropdownList = []
      let obj
      obj = {
        LoggedInUserId: loggedInUserId(), // user id
        DepartmentId: value.value,
        TechnologyId: approvalData[0] && approvalData[0].TechnologyId ? approvalData[0].TechnologyId : '00000000-0000-0000-0000-000000000000',
        ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId),
        plantId: approvalData[0].PlantId ?? EMPTY_GUID
      }
      let dataInFieldTemp = {
        ...dataInFields,
        Department: { label: value.label ? value.label : '', value: value.value ? value.value : '' }
      }
      setDataInFields(dataInFieldTemp)
      dispatch(getAllApprovalUserFilterByDepartment(obj, (res) => {
        res.data.DataList && res.data.DataList.map((item) => {
          const Data = res.data.DataList[1] ? res.data.DataList[1] : []
          if (item.Value === '0') return false;
          if (item.Value === EMPTY_GUID) {
            let dataInFieldObjTemp = {
              Department: { label: value.label ? value.label : '', value: value.value ? value.value : '' },
              Approver: { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' }
            }
            setDataInFields(dataInFieldObjTemp)
            setShowWarningMessage(true)
            return false
          } else {
            setShowWarningMessage(false)
            let dataInFieldObjTemp = {
              Department: { label: value.label ? value.label : '', value: value.value ? value.value : '' },
              Approver: { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' }
            }
            setDataInFields(dataInFieldObjTemp)
          }
          tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
          return null
        })
        setApprovalDropDown(tempDropdownList)
      }))

    }

    return (
      <>
        <ApproveRejectUI
          isOpen={props?.isOpen}
          vendorId={props?.vendorId}
          anchor={'right'}
          approvalData={approvalData}
          type={type}
          selectedRowData={selectedRowData}
          costingArr={costingArr}
          master={props?.master}
          closeDrawer={props?.closeDrawer}
          isSimulation={false}
          apiData={apiData}
          releaseStrategyDetails={releaseStrategyDetails}
          reasonId={reasonId}
          technologyId={technologyId}
          dataInFields={dataInFields}
          approvalDropDown={approvalDropDown}
          handleDepartmentChange={handleDepartmentChange}
          onSubmit={onSubmit}
          callbackSetDataInFields={callbackSetDataInFields}
          IsNotFinalLevel={IsNotFinalLevel}
          showApprovalTypeDropdown={props?.showApprovalTypeDropdown}
          showWarningMessage={showWarningMessage}
          setDataFromSummary={true}
          showMessage={showMessage}
          isDisable={isDisable}
          disableReleaseStrategy={disableReleaseStrategy}
          isShowNFRPopUp={props.isShowNFRPopUp}
          isApprovalListing={props?.isApprovalListing}
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

  export default React.memo(CostingApproveReject)
