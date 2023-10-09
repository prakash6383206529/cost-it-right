import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { approvalRequestByApprove, getAllApprovalDepartment, getAllApprovalUserFilterByDepartment, getReasonSelectList, rejectRequestByApprove, } from '../../../costing/actions/Approval'
import { formatRMSimulationObject, loggedInUserId, userDetails, userTechnologyLevelDetails } from '../../../../helper'
import PushButtonDrawer from './PushButtonDrawer'
import { EMPTY_GUID } from '../../../../config/constants'
import { saveSimulationForRawMaterial, getAllSimulationApprovalList } from '../../../simulation/actions/Simulation'
import { debounce } from 'lodash'
import "react-datepicker/dist/react-datepicker.css";
import 'react-dropzone-uploader/dist/styles.css';
import { PROVISIONAL } from '../../../../config/constants'
import Toaster from '../../../common/Toaster'
import { costingTypeIdToApprovalTypeIdFunction } from '../../../common/CommonFunctions'
import ApproveRejectUI from './ApproveRejectUI'
import { checkFinalUser } from '../../actions/Costing'
import { getUsersTechnologyLevelAPI } from '../../../../actions/auth/AuthActions'

function CostingApproveReject(props) {
  // ********* INITIALIZE REF FOR DROPZONE ********

  const { type, technologyId, approvalData, IsNotFinalLevel, IsPushDrawer, dataSend, reasonId, simulationDetail, selectedRowData, costingArr, isSaveDone, SimulationType, isSimulationApprovalListing, apiData, TechnologyId, releaseStrategyDetails } = props

  const userLoggedIn = loggedInUserId()
  const userData = userDetails()

  const { formState: { }, handleSubmit, setValue } = useForm({
    mode: 'onChange', reValidateMode: 'onChange',
  })

  const dispatch = useDispatch()
  const [approvalDropDown, setApprovalDropDown] = useState([])
  const [openPushButton, setOpenPushButton] = useState(false)
  const [showError, setShowError] = useState(false)
  const [tokenDropdown, setTokenDropdown] = useState(true)
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [loader, setLoader] = useState(false)
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
          Toaster.warning("You don't have permission to send simulation for approval.")
        }
      }))

      dispatch(getAllApprovalDepartment((res) => {

        const Data = res?.data?.SelectList
        const departObj = Data && Data.filter(item => item?.Value === userData?.DepartmentId)
        let dataInFieldTemp = {
          ...dataInFields, Department: { label: departObj[0]?.Text, value: departObj[0]?.Value },
          // ApprovalType: { label: approvalTypeIdValue, value: approvalTypeIdValue }
        }
        setDataInFields(dataInFieldTemp)
        setValue('dept', { label: departObj && departObj[0].Text, value: departObj && departObj[0].Value })

        if (initialConfiguration.IsReleaseStrategyConfigured && releaseStrategyDetails?.IsPFSOrBudgetingDetailsExist === true) {
          setDisableReleaseStrategy(true)
          approverAPICall(releaseStrategyDetails?.DepartmentId, releaseStrategyDetails?.TechnologyId, releaseStrategyDetails?.ApprovalTypeId, dataInFieldTemp)
        } else {
          setDisableReleaseStrategy(false)
          approverAPICall(departObj[0]?.Value, approvalData && approvalData[0]?.TechnologyId, costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId), dataInFieldTemp)
        }







        // const Data = res?.data?.SelectList
        // const departObj = Data && Data.filter(item => item?.Value === (type === 'Sender' ? userData?.DepartmentId : simulationDetail?.DepartmentId))
        // let dataInFieldTemp = {
        //   ...dataInFields, Department: { label: departObj[0]?.Text, value: departObj[0]?.Value },
        //   ApprovalType: { label: approvalTypeIdValue, value: approvalTypeIdValue }
        // }
        // setDataInFields(dataInFieldTemp)
        // setIsResponseTrueObj({ ...isResponseTrueObj, Department: true })
        // if (initialConfiguration.IsReleaseStrategyConfigured && releaseStrategyDetails?.IsPFSOrBudgetingDetailsExist === true) {
        //   setDataFromReleaseStrategy(releaseStrategyDetails, dataInFieldTemp)
        // }
      }))

    }, 300);

    if (SimulationType !== null && SimulationType === PROVISIONAL) {
      setTokenDropdown(false)
    }

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
      // setApprover(Data.Text)
      // setSelectedApprover(Data.Value)
      // setSelectedApproverLevelId({ levelName: Data.LevelName, levelId: Data.LevelId })
      // setValue('approver', { label: Data.Text, value: Data.Value })
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
      Toaster.warning("You don't have permission to send simulation for approval.")
    }
  }

  useEffect(() => {
    if (isResponseTrueObj?.Department && technologyLevelsList !== '' && type !== 'Reject' && !IsNotFinalLevel) {
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

  const checkFinalLevelAPI = () => {
    let obj = {
      DepartmentId: dataInFields?.Department?.value,
      UserId: loggedInUserId(),
      TechnologyId: props.masterId,
      Mode: 'simulation',
      approvalTypeId: costingTypeIdToApprovalTypeIdFunction(levelDetails?.ApprovalTypeId)
    }
    dispatch(checkFinalUser(obj, res => {
      if (res && res.data && res.data.Result) {
        setFinalLevelUser(res.data.Data.IsFinalApprover)
      }
    }))
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
    if (!IsNotFinalLevel) {
      if (values.length > 1) {
        values.map((item, index) => {
          let obj = {
            LoggedInUserId: userData.LoggedInUserId,
            DepartmentId: departId,
            //NEED TO MAKE THIS 2   
            // TechnologyId: isSimulationApprovalListing ? selectedRowData[0].SimulationTechnologyId : simulationDetail.SimulationTechnologyId ? simulationDetail.SimulationTechnologyId : selectedMasterForSimulation.value,
            TechnologyId: item,
            ReasonId: 0,
            ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(levelDetailsTemp?.ApprovalTypeId)
          }

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
              return null
            })
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


      } else {
        let appTypeId = dataInFieldsTemp?.ApprovalType?.value

        let obj = {
          LoggedInUserId: userData.LoggedInUserId,
          DepartmentId: departId,
          //NEED TO MAKE THIS 2   
          TechnologyId: technologyId,
          ReasonId: 0,
          ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(appTypeId)
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
          if ((tempDropdownList[0]?.value === EMPTY_GUID || tempDropdownList.length === 0) && type !== 'Reject' && !IsNotFinalLevel) {
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

  useEffect(() => {
    if (type === 'Sender' && !isSaveDone && !isSimulationApprovalListing) {
      let simObj = formatRMSimulationObject(simulationDetail, costingArr, apiData)
      //THIS CONDITION IS FOR SAVE SIMULATION
      dispatch(saveSimulationForRawMaterial(simObj, res => {
        if (res?.data?.Result) {
          setLoader(true)
          Toaster.success('Simulation saved successfully.')
          setLoader(false)
        }
      }))
    }
  }, [simulationDetail])

  const closePushButton = () => {
    setOpenPushButton(false)
    props.closeDrawer('', 'Cancel')
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
        IsFinalApprovalProcess: false, //ASK THIS CONDITION WITH KAMAL SIR
        IsRFQCostingSendForApproval: false,

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
      ApprovalTypeId: costingTypeIdToApprovalTypeIdFunction(props?.costingTypeId),
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



    // let obj = {
    //   ...dataInFields, Department: { label: value?.label, value: value?.value }
    //   , Approver: { label: '', value: '', levelId: '', levelName: '' }
    // }
    // setDataInFields(obj)
    // if (levelDetails?.length !== 0) {
    //   let requestObj = {
    //     DepartmentId: value?.value,
    //     UserId: loggedInUserId(),
    //     TechnologyId: technologyId,
    //     Mode: 'simulation',
    //     approvalTypeId: costingTypeIdToApprovalTypeIdFunction(levelDetails?.ApprovalTypeId)
    //   }
    //   dispatch(checkFinalUser(requestObj, res => {
    //     if (res && res.data && res.data.Result) {
    //       setFinalLevelUser(res.data.Data.IsFinalApprover)
    //       if (res.data.Data.IsFinalApprover) {
    //         setShowWarningMessage(true)
    //         setShowMessage('This is a final level user.')
    //       } else {
    //         getApproversList(value.value, value.label, levelDetails, obj)
    //       }
    //     }
    //   }))
    // }
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
        selectedRowData={selectedRowData}
        costingArr={costingArr}
        master={props?.master}
        closeDrawer={props?.closeDrawer}
        isSimulation={true}
        apiData={apiData}
        releaseStrategyDetails={releaseStrategyDetails}

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
