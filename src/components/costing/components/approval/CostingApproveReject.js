import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { approvalPushedOnSap, approvalRequestByApprove, getAllApprovalDepartment, getAllApprovalUserFilterByDepartment, getReasonSelectList, rejectRequestByApprove, } from '../../../costing/actions/Approval'
import { loggedInUserId, userDetails, userTechnologyLevelDetails } from '../../../../helper'
import PushButtonDrawer from './PushButtonDrawer'
import { EMPTY_GUID, INR } from '../../../../config/constants'
import { debounce } from 'lodash'
import "react-datepicker/dist/react-datepicker.css";
import 'react-dropzone-uploader/dist/styles.css';
import { PROVISIONAL } from '../../../../config/constants'
import Toaster from '../../../common/Toaster'
import { costingTypeIdToApprovalTypeIdFunction } from '../../../common/CommonFunctions'
import ApproveRejectUI from './ApproveRejectUI'
import { checkFinalUser, updateCostingIdFromRfqToNfrPfs } from '../../actions/Costing'
import { getUsersTechnologyLevelAPI } from '../../../../actions/auth/AuthActions'
import DayTime from '../../../common/DayTimeWrapper'
import { pushNfrOnSap } from '../../../masters/nfr/actions/nfr'
import { MESSAGES } from '../../../../config/message'

function CostingApproveReject(props) {
  // ********* INITIALIZE REF FOR DROPZONE ********

  const { type, technologyId, approvalData, IsNotFinalLevel, IsPushDrawer, dataSend, reasonId, selectedRowData, costingArr, apiData, TechnologyId, releaseStrategyDetails } = props

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

  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

  useEffect(() => {
    dispatch(getReasonSelectList((res) => { }))
    let levelDetailsTemp = ''
    setTimeout(() => {
      dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), TechnologyId, (res) => {
        levelDetailsTemp = userTechnologyLevelDetails(props?.costingTypeId, res?.data?.Data?.TechnologyLevels)
        setLevelDetails(levelDetailsTemp)
        if (levelDetailsTemp?.length === 0) {
          Toaster.warning("You don't have permission to send costing for approval.")
        }
      }))

      dispatch(getAllApprovalDepartment((res) => {

        const Data = res?.data?.SelectList
        const departObj = Data && Data.filter(item => item?.Value === userData?.DepartmentId)
        let dataInFieldTemp = {
          ...dataInFields, Department: { label: departObj[0]?.Text, value: departObj[0]?.Value },
        }
        setDataInFields(dataInFieldTemp)
        setValue('dept', { label: departObj && departObj[0].Text, value: departObj && departObj[0].Value })

        if (initialConfiguration.IsReleaseStrategyConfigured && releaseStrategyDetails?.IsPFSOrBudgetingDetailsExist === true) {
          setDisableReleaseStrategy(true)
          approverAPICall(releaseStrategyDetails?.DepartmentId, releaseStrategyDetails?.TechnologyId, releaseStrategyDetails?.ApprovalTypeId, dataInFieldTemp)
        } else {
          setDisableReleaseStrategy(false)
          approverAPICall(departObj[0]?.Value, approvalData && approvalData[0]?.TechnologyId, props?.costingTypeId, dataInFieldTemp)
        }
      }))

    }, 300);

  }, [])

  const approverAPICall = (departmentId, technology, approverTypeId, dataInFieldObj) => {

    let obj = {
      LoggedInUserId: userData.LoggedInUserId,
      DepartmentId: departmentId && departmentId,
      TechnologyId: technology,
      ReasonId: reasonId,
      ApprovalTypeId: approverTypeId
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
      getApproversList(dataInFields?.Department?.value, dataInFields?.Department?.label, levelDetailsTemp, dataInFields)
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
      dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), TechnologyId, (res) => {
        let approvalTypeId = props?.costingTypeId
        levelDetailsTemp = userTechnologyLevelDetails(approvalTypeId, res?.data?.Data?.TechnologyLevels)
        setLevelDetails(levelDetailsTemp)
        if (levelDetailsTemp?.length === 0) {
          Toaster.warning("You don't have permission to send costing for approval.")
        }
      }))

      dispatch(getAllApprovalDepartment((res) => {

        const Data = res?.data?.SelectList
        const departObj = Data && Data.filter(item => item.Value === userData.DepartmentId)

        setValue('dept', { label: departObj && departObj[0].Text, value: departObj && departObj[0].Value })

        if (initialConfiguration.IsReleaseStrategyConfigured && releaseStrategyDetails?.IsPFSOrBudgetingDetailsExist === true) {
          setDisableReleaseStrategy(true)
          approverAPICall(releaseStrategyDetails?.DepartmentId, releaseStrategyDetails?.TechnologyId, (releaseStrategyDetails?.ApprovalTypeId ? releaseStrategyDetails?.ApprovalTypeId : 'approvalType'))
        } else {
          setDisableReleaseStrategy(false)
          approverAPICall(departObj[0]?.Value, approvalData && approvalData[0]?.TechnologyId, costingTypeIdToApprovalTypeIdFunction('approvalType'))
        }
      }))
    }
  }

  const closePushButton = () => {
    setOpenPushButton(false)
    props.closeDrawer('', 'Cancel')
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
        Approver: approver && approver.value ? approver.value : '',
        ApproverLevelId: approver && approver.levelId ? approver.levelId : '',
        ApproverLevel: approver && approver.levelName ? approver.levelName : '',
        Remark: remark,
        IsApproved: type === 'Approve' ? true : false,
        IsFinalApprovalProcess: false,
        IsRFQCostingSendForApproval: false,

      })
      return null;
    })
    if (type === 'Approve') {
      reset()
      dispatch(approvalRequestByApprove(Data, res => {
        if (res?.data?.Result) {
          setIsDisable(false)

          if (!IsNotFinalLevel) {
            Toaster.success('The costing approved successfully')
            if (!props.isApprovalListing) {
              let pushdata = {
                effectiveDate: dataSend[0].EffectiveDate ? DayTime(dataSend[0].EffectiveDate).format('YYYY-MM-DD') : '',
                vendorCode: props?.vendorCodeForSAP ? props?.vendorCodeForSAP : '',
                materialNumber: dataSend[1].PartNumber,
                netPrice: dataSend[0].NewPOPrice,
                plant: dataSend[0].PlantCode ? dataSend[0].PlantCode : dataSend[0].DestinationPlantId ? dataSend[0].DestinationPlantCode : '',
                currencyKey: INR,
                materialGroup: approvalData[0]?.MaterialGroup?.label ? approvalData[0]?.MaterialGroup.label.split('(')[0] : '',
                taxCode: 'YW',
                basicUOM: "NO",
                purchasingGroup: approvalData[0]?.PurchasingGroup?.label ? approvalData[0]?.PurchasingGroup.label.split('(')[0] : '',
                purchasingOrg: dataSend[0].CompanyCode ? dataSend[0].CompanyCode : '',
                CostingId: approvalData[0].CostingId,
                DecimalOption: approvalData[0].DecimalOption,
                InfoToConditions: props.conditionInfo,
                TokenNumber: approvalData[0]?.ApprovalNumber,
                IsRequestForCosting: true
                // Quantity: quantity
                // effectiveDate: '11/30/2021',
                // vendorCode: '203670',
                // materialNumber: 'S07004-003A0Y',
                // materialGroup: 'M089',
                // taxCode: 'YW',
                // plant: '1401',
                // netPrice: '30.00',
                // currencyKey: 'INR',
                // basicUOM: 'NO',
                // purchasingOrg: 'MRPL',
                // purchasingGroup: 'O02'

              }
              let obj = {
                LoggedInUserId: loggedInUserId(),
                Request: [pushdata]
              }
              dispatch(approvalPushedOnSap(obj, res => {
                if (res && res.status && (res.status === 200 || res.status === 204)) {
                  Toaster.success('Approval pushed successfully.')
                }
              }))
              if (approvalData[0].IsNFRPFS3PushedButtonShow && approvalData[0].NfrGroupIdForPFS3 === null && props.IsRegularized) {
                pushTonfr()

              }
            }

            props.closeDrawer('', 'submit')
            // setOpenPushButton(true)

          } else {
            Toaster.success(!IsNotFinalLevel ? 'The costing approved successfully' : 'The costing has been sent to next level for approval')
            props.closeDrawer('', 'submit')
          }
        }
      }))
    }
    else {
      // REJECT CONDITION
      dispatch(rejectRequestByApprove(Data, res => {
        setIsDisable(false)
        if (res?.data?.Result) {
          Toaster.success(`Costing ${props?.isRFQApproval ? 'Returned' : 'Rejected'}`)
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
      ApprovalTypeId: props?.costingTypeId,
    }
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

  }

  return (
    <>
      <ApproveRejectUI
        isOpen={props?.isOpen}
        vendorId={props?.vendorId}
        anchor={'right'}
        approvalData={[]}
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
        disableReleaseStrategy={disableReleaseStrategy}
        isShowNFRPopUp={props.isShowNFRPopUp}
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
