import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch, useSelector } from 'react-redux'
import { approvalRequestByApprove, rejectRequestByApprove, getAllApprovalUserFilterByDepartment, getAllApprovalDepartment, getReasonSelectList, approvalPushedOnSap, } from '../../../costing/actions/Approval'
import { TextAreaHookForm, SearchableSelectHookForm, DatePickerHookForm, TextFieldHookForm, } from '../../../layout/HookFormInputs'
import { formatRMSimulationObject, getConfigurationKey, getPOPriceAfterDecimal, loggedInUserId, userDetails } from '../../../../helper'
import { toastr } from 'react-redux-toastr'
import PushButtonDrawer from './PushButtonDrawer'
import {EMPTY_GUID, INR, FILE_URL, RMDOMESTIC, RMIMPORT, REASON_ID } from '../../../../config/constants'
import { getSimulationApprovalByDepartment, simulationApprovalRequestByApprove, simulationRejectRequestByApprove, simulationApprovalRequestBySender, saveSimulationForRawMaterial, getAllSimulationApprovalList, uploadSimulationAttachment } from '../../../simulation/actions/Simulation'
import moment from 'moment'
import PushSection from '../../../common/PushSection'
import { debounce } from 'lodash'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import redcrossImg from '../../../../assests/images/red-cross.png'
import { getSelectListOfSimulationLinkingTokens } from '../../../simulation/actions/Simulation'
import { provisional } from '../../../../config/constants'


function ApproveRejectDrawer(props) {

  const { type, tokenNo, approvalData, IsFinalLevel, IsPushDrawer, isSimulation, dataSend, reasonId, simulationDetail, master, selectedRowData, costingArr, isSaveDone, costingList, showFinalLevelButtons, Attachements, vendorId, SimulationTechnologyId, SimulationType ,isSimulationApprovalListing} = props


  const userLoggedIn = loggedInUserId()
  const userData = userDetails()
  const partNo = useSelector((state) => state.costing.partNo)
  const { TokensList } = useSelector(state => state.simulation)

  const { register, control, formState: { errors }, handleSubmit, setValue, getValues, reset, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const dispatch = useDispatch()
  const [approvalDropDown, setApprovalDropDown] = useState([])
  const [reason, setReason] = useState([])
  const [openPushButton, setOpenPushButton] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [linkingTokenDropDown, setLinkingTokenDropDown] = useState('')
  const [showError, setShowError] = useState(false)
  const [tokenDropdown, setTokenDropdown] = useState(true)
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [initialFiles, setInitialFiles] = useState([]);

  const deptList = useSelector((state) => state.approval.approvalDepartmentList)
  const { selectedMasterForSimulation } = useSelector(state => state.simulation)
  const reasonsList = useSelector((state) => state.approval.reasonsList)
  const SAPData = useSelector(state => state.approval.SAPObj)

  const toFindDuplicates = arry => {
    return arry.filter((item, index) => arry.indexOf(item) !== index)
  }
  useEffect(() => {
    dispatch(getReasonSelectList((res) => { }))
    // dispatch(getAllApprovalDepartment((res) => { }))
    /***********************************REMOVE IT AFTER SETTING FROM SIMULATION*******************************/
    if (!isSimulation) {
      /************THIS CONDITION SI FOR COSTING*******************/
      dispatch(getAllApprovalDepartment((res) => {
        const Data = res.data.SelectList
        const departObj = Data && Data.filter(item => item.Value === userData.DepartmentId)

        setValue('dept', { label: departObj[0].Text, value: departObj[0].Value })

        let obj = {
          LoggedInUserId: userData.LoggedInUserId,
          DepartmentId: departObj[0]?.Value,
          TechnologyId: approvalData[0]?.TechnologyId,
          ReasonId: reasonId
        }

        dispatch(
          getAllApprovalUserFilterByDepartment(obj, (res) => {
            const Data = res.data.DataList[1] ? res.data.DataList[1] : []

            setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
            setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })
            // setApprover(Data.Text)
            // setSelectedApprover(Data.Value)
            // setSelectedApproverLevelId({ levelName: Data.LevelName, levelId: Data.LevelId })
            // setValue('approver', { label: Data.Text, value: Data.Value })
          },
          ),
        )
      }))
    } else {
      dispatch(getSimulationApprovalByDepartment(res => {
        const Data = res.data.SelectList
        const departObj = Data && Data.filter(item => item.Value === userData.DepartmentId)

        setValue('dept', { label: departObj[0].Text, value: departObj[0].Value })
        getApproversList(departObj[0].Value)

      }))

      Attachements && Attachements.map(item => {
        files.push(item)
        setFiles(files)
        setIsOpen(!IsOpen)
      })

      if (vendorId !== null && SimulationTechnologyId !== null && type === 'Sender' && !isSimulationApprovalListing && getConfigurationKey().IsProvisionalSimulation) {
        dispatch(getSelectListOfSimulationLinkingTokens(vendorId, SimulationTechnologyId, () => { }))
      }
    }

    if (SimulationType !== null && SimulationType === provisional) {
      setTokenDropdown(false)
    }

    // DO IT AFTER GETTING DATA
  }, [])


  const getApproversList = (departObj) => {
    let values = []
    let approverDropdownValue = []
    let listForDropdown = []
    selectedRowData && selectedRowData.map(item => {
      if (!(values.includes(item.SimulationTechnologyId))) {
        values.push(item.SimulationTechnologyId)
      }
    })
    if (values.length > 1) {
      values.map(item => {
        let obj = {
          LoggedInUserId: userData.LoggedInUserId,
          DepartmentId: departObj,
          //NEED TO MAKE THIS 2   
          // TechnologyId: isSimulationApprovalListing ? selectedRowData[0].SimulationTechnologyId : simulationDetail.SimulationTechnologyId ? simulationDetail.SimulationTechnologyId : selectedMasterForSimulation.value,
          TechnologyId: item,
          ReasonId: 0
        }

        dispatch(
          getAllSimulationApprovalList(obj, (res) => {
            const Data = res.data.DataList[1] ? res.data.DataList[1] : []
            // setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
            // setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })
            let tempDropdownList = []
            res.data.DataList && res.data.DataList.map((item) => {
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
              })
            })
          },
          ),
        )
      })


      if (listForDropdown[0]?.value === EMPTY_GUID || listForDropdown.length === 0) {

        toastr.warning('User does not exist on next level for selected simulation.')
        return false
      }

      setApprovalDropDown(listForDropdown)
    } else {

      let obj = {
        LoggedInUserId: userData.LoggedInUserId,
        DepartmentId: departObj,
        //NEED TO MAKE THIS 2   
        TechnologyId: isSimulationApprovalListing ? selectedRowData[0].SimulationTechnologyId : simulationDetail.SimulationTechnologyId ? simulationDetail.SimulationTechnologyId : selectedMasterForSimulation.value,
        ReasonId: 0
      }

      dispatch(
        getAllSimulationApprovalList(obj, (res) => {
          const Data = res.data.DataList[1] ? res.data.DataList[1] : []
          setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
          setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })
          let tempDropdownList = []
          res.data.DataList && res.data.DataList.map((item) => {
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
        },
        ),
      )
    }

  }

  const handleTokenDropDownChange = (value) => {

    setLinkingTokenDropDown(value)

  }

  useEffect(() => {
    //THIS OBJ IS FOR SAVE SIMULATION
    if (type === 'Sender' && !isSaveDone && !isSimulationApprovalListing) {
      let simObj = formatRMSimulationObject(simulationDetail, selectedRowData, costingArr)

      //THIS CONDITION IS FOR SAVE SIMULATION
      dispatch(saveSimulationForRawMaterial(simObj, res => {
        if (res.data.Result) {
          toastr.success('Simulation has been saved successfully.')
        }
      }))
      // switch (Number(master)) {
      //   case Number(RMDOMESTIC):

      //     break;
      //   case Number(RMIMPORT):
      //     dispatch(saveSimulationForRawMaterial(simObj, res => {
      //       if (res.data.Result) {
      //         toastr.success('Simulation has been saved successfully.')
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
    props.closeDrawer('', 'Cancel')
  }

  const handleEffectiveDateChange = (date) => {
    setSelectedDate(date)
  }

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
    if (!isSimulation) {
      /*****************************THIS CONDITION IS FOR COSTING APPROVE OR REJECT CONDITION***********************************/
      let Data = []
      approvalData.map(ele => {
        Data.push({
          ApprovalProcessSummaryId: ele.ApprovalProcessSummaryId,
          ApprovalToken: ele.ApprovalNumber,
          LoggedInUserId: userLoggedIn,
          SenderLevelId: userData.LoggedInLevelId,
          SenderLevel: userData.LoggedInLevel,
          ApproverDepartmentId: dept && dept.value ? dept.value : '',
          ApproverDepartmentName: dept && dept.label ? dept.label : '',
          Approver: approver && approver.value ? approver.value : '',
          ApproverLevelId: approver && approver.levelId ? approver.levelId : '',
          ApproverLevel: approver && approver.levelName ? approver.levelName : '',
          Remark: remark,
          IsApproved: type === 'Approve' ? true : false,
          IsFinalApprovalProcess: false //ASK THIS CONDITION WITH KAMAL SIR

        })
      })
      if (type === 'Approve') {
        reset()
        dispatch(approvalRequestByApprove(Data, res => {
          if (res.data.Result) {
            if (showFinalLevelButtons) {
              toastr.success('The costing has been approved')
              // const { netPo, quantity } = getPOPriceAfterDecimal(approvalData[0].DecimalOption, dataSend[0].NewPOPrice ? dataSend[0].NewPOPrice : 0)
              let pushdata = {
                effectiveDate: dataSend[0].EffectiveDate ? moment(dataSend[0].EffectiveDate).local().format('MM/DD/yyyy') : '',
                vendorCode: dataSend[0].VendorCode ? dataSend[0].VendorCode : '',
                materialNumber: dataSend[1].PartNumber,
                netPrice: dataSend[0].NewPOPrice,
                plant: dataSend[0].PlantCode ? dataSend[0].PlantCode : dataSend[0].DestinationPlantId ? dataSend[0].DestinationPlantCode : '',
                currencyKey: dataSend[0].Currency ? dataSend[0].Currency : INR,
                materialGroup: approvalData[0]?.MaterialGroup?.label ? approvalData[0]?.MaterialGroup.label.split('(')[0] : '',
                taxCode: 'YW',
                basicUOM: "NO",
                purchasingGroup: approvalData[0]?.PurchasingGroup?.label ? approvalData[0]?.PurchasingGroup.label.split('(')[0] : '',
                purchasingOrg: dataSend[0].CompanyCode ? dataSend[0].CompanyCode : '',
                CostingId: approvalData[0].CostingId,
                DecimalOption: approvalData[0].DecimalOption
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
                  toastr.success('Approval pushed successfully.')
                }
                props.closeDrawer('', 'Push')
              }))
              // setOpenPushButton(true)

            } else {
              toastr.success(!IsFinalLevel ? 'The costing has been approved' : 'The costing has been sent to next level for approval')
              props.closeDrawer('', 'submit')
            }
          }
        }))
      } else {
        // REJECT CONDITION
        dispatch(rejectRequestByApprove(Data, res => {
          if (res.data.Result) {
            toastr.success('Costing Rejected')
            props.closeDrawer('', 'submit')
          }
        }))
      }
    } else {
      /****************************THIS IS FOR SIMUALTION (SAVE,SEND FOR APPROVAL,APPROVE AND REJECT CONDITION)******************************** */
      // THIS OBJ IS FOR SIMULATION APPROVE/REJECT


      //lll
      let approverObject = []
      if (isSimulationApprovalListing === true) {
        selectedRowData && selectedRowData.map(item => {
          approverObject.push({
            // SimulationId: item.SimulationId, SimulationTokenNumber: item.ApprovalNumber,
            // SimulationAppliedOn: item.SimulationTechnologyId

            ApprovalId: item?.ApprovalProcessId,
            ApprovalToken: item?.ApprovalNumber,
            LoggedInUserId: userLoggedIn,
            SenderLevelId: userData.LoggedInSimulationLevelId,
            SenderLevel: userData.LoggedInSimulationLevel,
            SenderId: userLoggedIn,
            ApproverId: approver && approver.value ? approver.value : '',
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
        })
      } else {
        approverObject = [{
          ApprovalId: simulationDetail?.SimulationApprovalProcessId,
          ApprovalToken: simulationDetail?.Token,
          LoggedInUserId: userLoggedIn,
          SenderLevelId: userData.LoggedInSimulationLevelId,
          SenderLevel: userData.LoggedInSimulationLevel,
          SenderId: userLoggedIn,
          ApproverId: approver && approver.value ? approver.value : '',
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
        senderObj.ApproverId = approver && approver.value ? approver.value : ''
        senderObj.SenderLevelId = userData.LoggedInSimulationLevelId
        senderObj.SenderId = userLoggedIn
        senderObj.SenderLevel = userData.LoggedInSimulationLevel
        senderObj.SenderRemark = remark
        senderObj.EffectiveDate = moment(simulationDetail?.EffectiveDate).local().format('YYYY/MM/DD HH:mm')
        senderObj.LoggedInUserId = userLoggedIn
        let temp = []
        if (isSimulationApprovalListing === true) {
          selectedRowData && selectedRowData.map(item => {
            temp.push({
              SimulationId: item.SimulationId, SimulationTokenNumber: item.ApprovalNumber,
              SimulationAppliedOn: item.SimulationTechnologyId
            })
          })
          senderObj.SimulationList = temp
        } else {
          senderObj.SimulationList = [{ SimulationId: simulationDetail.SimulationId, SimulationTokenNumber: simulationDetail.TokenNo, SimulationAppliedOn: simulationDetail.SimulationAppliedOn }]
        }
        senderObj.Attachements = updatedFiles
        senderObj.LinkedTokenNumber = linkingTokenDropDown.value
        senderObj.PurchasingGroup = SAPData.PurchasingGroup?.label
        senderObj.MaterialGroup = SAPData.MaterialGroup?.label
        senderObj.DecimalOption = SAPData.DecimalOption?.value
        senderObj.isMultiSimulation = isSimulationApprovalListing ? true : false
        //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
        dispatch(simulationApprovalRequestBySender(senderObj, res => {
          if (res.data.Result) {
            toastr.success('Simulation token has been sent for approval.')
            props.closeDrawer('', 'submit')
          }
        }))
      }
      else if (type === 'Approve') {
        //THIS CONDITION IS FOR APPROVE THE SIMULATION REQUEST 
        dispatch(simulationApprovalRequestByApprove(approverObject, res => {
          if (res.data.Result) {
            if (showFinalLevelButtons) {
              toastr.success('The simulation token has been approved')
              let temp = []
              costingList && costingList.map(item => {
                const vendor = item.VendorName.split('(')[1]
                temp.push({
                  CostingId: item.CostingId,
                  effectiveDate: moment(simulationDetail.EffectiveDate).local().format('MM/DD/yyyy'),
                  vendorCode: vendor.split(')')[0],
                  materialNumber: item.PartNo,
                  netPrice: item.NewPOPrice,
                  plant: item.PlantCode ? item.PlantCode : '1511',
                  currencyKey: INR,
                  basicUOM: 'NO',
                  purchasingOrg: item.DepartmentCode ? item.DepartmentCode : 'MRPL',
                  purchasingGroup: simulationDetail.PurchasingGroup ? simulationDetail.PurchasingGroup.split('(')[0] : '',
                  materialGroup: simulationDetail.MaterialGroup ? simulationDetail.MaterialGroup.split('(')[0] : '',
                  taxCode: 'YW', TokenNumber: simulationDetail.Token,
                  DecimalOption: simulationDetail.DecimalOption
                  // Quantity: quantity
                })
              })
              let simObj = {
                LoggedInUserId: loggedInUserId(),
                Request: temp
              }
              dispatch(approvalPushedOnSap(simObj, res => {
                if (res && res.status && (res.status === 200 || res.status === 204)) {
                  toastr.success('Approval pushed successfully.')
                }
                props.closeDrawer('', 'Push')
              }))

            } else {
              toastr.success(IsFinalLevel ? 'The simulation token has been approved' : 'The simulation token has been sent to next level for approval')
              props.closeDrawer('', 'submit')
            }
          }
        }))
      } else {
        //SIMULATION REJECT CONDITION
        dispatch(simulationRejectRequestByApprove(approverObject, res => {
          if (res.data.Result) {
            toastr.success('The simulation token has been rejected')
            props.closeDrawer('', 'submit')
          }
        }))
      }
    }
  }), 500)

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
    let simObj
    if (!isSimulation) {

      obj = {
        LoggedInUserId: loggedInUserId(), // user id
        DepartmentId: value.value,
        TechnologyId: approvalData[0] && approvalData[0].TechnologyId ? approvalData[0].TechnologyId : '00000000-0000-0000-0000-000000000000',
      }
    } else {
      // simObj = {
      //   LoggedInUserId: loggedInUserId(), // user id
      //   DepartmentId: value.value,
      //   TechnologyId: simulationDetail.SimulationTechnologyId ? simulationDetail.SimulationTechnologyId : selectedMasterForSimulation.value,
      //   ReasonId: 0
      // }
    }


    if (!isSimulation) {
      dispatch(
        getAllApprovalUserFilterByDepartment(obj, (res) => {
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
    } else {
      getApproversList(value.value)
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

  const getUploadParams = ({ file, meta }) => {
    return { url: 'https://httpbin.org/post', }
  }

  // called every time a file's `status` changes
  const handleChangeStatus = ({ meta, file }, status) => {



    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = files && files.filter(item => item.OriginalFileName !== removedFileName)
      setFiles(tempArr)
      setIsOpen(!IsOpen)
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      dispatch(uploadSimulationAttachment(data, (res) => {
        let Data = res.data[0]
        files.push(Data)
        setFiles(files)
        setIsOpen(!IsOpen)
      }))
    }

    if (status === 'rejected_file_type') {
      toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
    } else if (status === 'error_file_size') {
      toastr.warning("File size greater than 5mb not allowed")
    }
  }

  const Preview = ({ meta }) => {
    const { name, percent, status } = meta
    return (
      <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
        {/* {Math.round(percent)}% */}
      </span>
    )
  }

  const deleteFile = (FileId, OriginalFileName) => {
    if (FileId != null) {
      let deleteData = {
        Id: FileId,
        DeletedBy: loggedInUserId(),
      }
      // dispatch(fileDeleteCosting(deleteData, (res) => {
      //     toastr.success('File has been deleted successfully.')
      //   }))
      let tempArr = files && files.filter(item => item.FileId !== FileId)
      setFiles(tempArr)
      setIsOpen(!IsOpen)
    }
    if (FileId == null) {
      let tempArr = files && files.filter(item => item.FileName !== OriginalFileName)
      setFiles(tempArr)
      setIsOpen(!IsOpen)
    }
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
            <form
            >
              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{`${isSimulation ? `${type === 'Sender' ? 'Send For Approval' : `${type} Simulation`}` : `${type} Costing`} `}</h3>
                  </div>
                  <div
                    onClick={(e) => toggleDrawer(e)}
                    className={'close-button right'}
                  ></div>
                </Col>
              </Row>

              <Row className="ml-0">
                {type === 'Approve' && IsFinalLevel && !isSimulation && (
                  <>
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}
                        name={"dept"}
                        placeholder={"-Select-"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        defaultValue={""}
                        options={renderDropdownListing("Dept")}
                        mandatory={false}
                        handleChange={handleDepartmentChange}
                        errors={errors.dept}
                        disabled={(userData.Department.length > 1 && reasonId !== REASON_ID) ? false : true}
                      />
                    </div>
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={'Approver'}
                        name={'approver'}
                        placeholder={'-Select-'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        //defaultValue={isEditFlag ? plantName : ''}
                        options={approvalDropDown}
                        mandatory={false}
                        handleChange={() => { }}
                        disabled={(userData.Department.length > 1 && reasonId !== REASON_ID) ? false : true}
                        errors={errors.approver}
                      />
                    </div>
                  </>
                )}
                {
                  // REMOVE IT AFTER FUNCTIONING IS DONE FOR SIMUALTION, NEED TO MAKE CHANGES FROM BACKEND FOR SIMULATION TODO
                  isSimulation && (type === 'Approve' || type === 'Sender') && !IsFinalLevel &&
                  <>
                    <div className="input-group form-group col-md-12 input-withouticon">
                      <SearchableSelectHookForm
                        label={"Department"}
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
                        disabled={(userData.Department.length > 1 && reasonId !== REASON_ID) ? false : true}
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
                        errors={errors.approver}
                        disabled={(userData.Department.length > 1 && reasonId !== REASON_ID) ? false : true}
                      />
                    </div>
                    {
                      type === 'Sender' &&
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
                              dropdownMode="select"
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
                                selected={simulationDetail?.EffectiveDate && moment(simulationDetail.EffectiveDate).isValid ? moment(simulationDetail.EffectiveDate)._d : ''}
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
                        }
                      </>
                    }
                    {
                      type === 'Sender' &&
                      <Row className="px-3">
                        <Col md="12">
                          <div className="left-border">{"SAP-Push Details"}</div>
                        </Col>
                        <div className="w-100">
                          <PushSection />
                        </div>

                      </Row>
                    }

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



                  </div>
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
                    handleChange={handleRemark}
                    //defaultValue={viewRM.RMRate}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.remark}
                    disabled={false}
                  />
                  {/* {showError && <span className="text-help">This is required field</span>} */}
                </div>
                {
                  isSimulation &&
                  <div className="col-md-12 drawer-attachment">
                    <div className="d-flex w-100 flex-wrap">
                      <Col md="8" className="p-0"><h6 className="mb-0">Attachment</h6></Col>
                    </div>
                    <div className="d-flex w-100 flex-wrap pt-2">
                      {<>
                        <Col md="12" className="p-0">
                          <label>Upload Attachment (upload up to 2 files)</label>
                          {files && files.length >= 2 ? (
                            <div class="alert alert-danger" role="alert">
                              Maximum file upload limit has been reached.
                            </div>
                          ) : (
                            <Dropzone
                              getUploadParams={getUploadParams}
                              onChangeStatus={handleChangeStatus}
                              PreviewComponent={Preview}
                              // onSubmit={handleImapctSubmit}
                              accept="*"
                              initialFiles={initialFiles}
                              maxFiles={4}
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
                          )}
                        </Col>
                        <div className="w-100">
                          <div className={"attachment-wrapper mt-0 mb-3"}>
                            {files &&
                              files.map((f) => {
                                const withOutTild = f.FileURL.replace("~", "");
                                const fileURL = `${FILE_URL}${withOutTild}`;
                                return (
                                  <div className={"attachment images"}>
                                    <a href={fileURL} target="_blank">
                                      {f.OriginalFileName}
                                    </a>
                                    <img
                                      alt={""}
                                      className="float-right"
                                      onClick={() => deleteFile(f.FileId, f.FileName)}
                                      src={redcrossImg}
                                    ></img>
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
