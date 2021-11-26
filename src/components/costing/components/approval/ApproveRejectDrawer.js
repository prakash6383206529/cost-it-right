import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch, useSelector } from 'react-redux'
import { approvalRequestByApprove, rejectRequestByApprove, getAllApprovalUserFilterByDepartment, getAllApprovalDepartment, getReasonSelectList, } from '../../../costing/actions/Approval'
import { TextAreaHookForm, SearchableSelectHookForm } from '../../../layout/HookFormInputs'
import { formatRMSimulationObject, getConfigurationKey, loggedInUserId, userDetails } from '../../../../helper'
import PushButtonDrawer from './PushButtonDrawer'
import { APPROVER, EMPTY_GUID, FILE_URL, RMDOMESTIC, RMIMPORT } from '../../../../config/constants'
import { getSimulationApprovalByDepartment, simulationApprovalRequestByApprove, simulationRejectRequestByApprove, simulationApprovalRequestBySender, saveSimulationForRawMaterial, getAllSimulationApprovalList, pushAPI, sapPushedInitialMoment, setAttachmentFileData } from '../../../simulation/actions/Simulation'
import DayTime from '../../../common/DayTimeWrapper'
import { debounce } from 'lodash'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AttachmentSec from './AttachmentSec'
import { getSelectListOfSimulationLinkingTokens } from '../../../simulation/actions/Simulation'
import { provisional } from '../../../../config/constants'
import LoaderCustom from '../../../common/LoaderCustom';
import Toaster from '../../../common/Toaster'

function ApproveRejectDrawer(props) {

  const { type, approvalData, IsFinalLevel, IsPushDrawer, isSimulation, reasonId, simulationDetail, selectedRowData, costingArr, isSaveDone, Attachements, vendorId, SimulationTechnologyId, SimulationType, costingList, isSimulationApprovalListing } = props

  const userLoggedIn = loggedInUserId()
  const userData = userDetails()
  const { TokensList } = useSelector(state => state.simulation)

  const { register, control, formState: { errors }, handleSubmit, setValue, getValues, reset, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const dispatch = useDispatch()
  const [approvalDropDown, setApprovalDropDown] = useState([])
  const [openPushButton, setOpenPushButton] = useState(false)
  const [linkingTokenDropDown, setLinkingTokenDropDown] = useState('')
  const [showError, setShowError] = useState(false)
  const [tokenDropdown, setTokenDropdown] = useState(true)
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [disableSubmitButton, setDisableSubmitbutton] = useState(false)
  const [loader, setLoader] = useState(false)

  const deptList = useSelector((state) => state.approval.approvalDepartmentList)
  const { selectedMasterForSimulation, attachmentsData } = useSelector(state => state.simulation)
  const reasonsList = useSelector((state) => state.approval.reasonsList)

  useEffect(() => {
    dispatch(setAttachmentFileData([], () => { }))
  }, [])

  useEffect(() => {
    dispatch(getReasonSelectList((res) => { }))
    // dispatch(getAllApprovalDepartment((res) => { }))
    /***********************************REMOVE IT AFTER SETTING FROM SIMULATION*******************************/
    if (!isSimulation) {
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
        return null
      })

      if (vendorId !== null && SimulationTechnologyId !== null && type === 'Sender' && !isSimulationApprovalListing) {
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
    let count = 0
    selectedRowData && selectedRowData.map(item => {
      if (!(values.includes(item.SimulationTechnologyId))) {
        values.push(item.SimulationTechnologyId)
      }
    })
    if (values.length > 1) {
      values.map((item, index) => {
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
            let listForDropdown = []

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


            setApprovalDropDown(listForDropdown)
            count = count + 1;
            if ((listForDropdown[0]?.value === EMPTY_GUID || listForDropdown.length === 0) && count === values.length) {

              Toaster.warning('User does not exist on next level for selected simulation.')
              setApprovalDropDown([])
              return false
            }
          },
          ),
        )
      })


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
          // setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
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
          if ((tempDropdownList[0]?.value === EMPTY_GUID || tempDropdownList.length === 0) && type !== 'Reject' && !IsFinalLevel) {

            Toaster.warning('User does not exist on next level for selected simulation.')
            setApprovalDropDown([])
            return false
          }
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
          Toaster.success('Simulation has been saved successfully')
          setLoader(true)
          dispatch(sapPushedInitialMoment(simulationDetail.SimulationId, res => {
            let status = 200
            if('response' in res){

               status = res && res?.response?.status
            }

            if (status!==undefined && status === 400) {
              setDisableSubmitbutton(true)
            }else{
              setDisableSubmitbutton(false)
            }
            setLoader(false)
          }))
        }
      }))
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
        return null
      })
      if (type === 'Approve') {
        reset()
        dispatch(approvalRequestByApprove(Data, res => {
          if (res.data.Result) {
            if (IsPushDrawer) {
              Toaster.success('The costing has been approved')
              setOpenPushButton(true)

            } else {
              Toaster.success(!IsFinalLevel ? 'The costing has been approved' : 'The costing has been sent to next level for approval')
              props.closeDrawer('', 'submit')
            }
          }
        }))
      } else {
        // REJECT CONDITION
        dispatch(rejectRequestByApprove(Data, res => {
          if (res.data.Result) {
            Toaster.success('Costing Rejected')
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
          return null
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
        senderObj.EffectiveDate = DayTime(simulationDetail?.EffectiveDate).format('YYYY/MM/DD HH:mm')
        senderObj.LoggedInUserId = userLoggedIn
        let temp = []
        if (isSimulationApprovalListing === true) {
          selectedRowData && selectedRowData.map(item => {
            temp.push({
              SimulationId: item.SimulationId, SimulationTokenNumber: item.ApprovalNumber,
              SimulationAppliedOn: item.SimulationTechnologyId
            })
            return null
          })
          senderObj.SimulationList = temp
        } else {
          senderObj.SimulationList = [{ SimulationId: simulationDetail.SimulationId, SimulationTokenNumber: simulationDetail.TokenNo, SimulationAppliedOn: simulationDetail.SimulationAppliedOn }]
        }
        senderObj.Attachements = attachmentsData
        senderObj.LinkedTokenNumber = linkingTokenDropDown.value
        senderObj.IsMultiSimulation = isSimulationApprovalListing ? true : false

        //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
        dispatch(simulationApprovalRequestBySender(senderObj, res => {
          if (res.data.Result) {
            Toaster.success('Simulation token has been sent for approval.')
            props.closeDrawer('', 'submit')
          }
        }))
      }
      else if (type === 'Approve') {
        //THIS CONDITION IS FOR APPROVE THE SIMULATION REQUEST 
        dispatch(simulationApprovalRequestByApprove(approverObject, res => {
          if (res.data.Result) {
            if (IsPushDrawer) {
              Toaster.success('The simulation token has been approved')
              setOpenPushButton(true)

            } else {
              if (IsFinalLevel) {
                let pushObj = {}
                let temp = []
                costingList && costingList.map(item => {
                  const vendor = item.VendorName.split('(')[1]
                  temp.push({ TokenNumber: simulationDetail.Token, Vendor: vendor.split(')')[0], PurchasingGroup: userDetails().DepartmentCode, Plant: item.PlantCode, MaterialCode: item.PartNo, NewPOPrice: item.NewPOPrice, EffectiveDate: simulationDetail.EffectiveDate, SimulationId: simulationDetail.SimulationId })
                  return null
                })
                pushObj.LoggedInUserId = userLoggedIn
                pushObj.AmmendentDataRequests = temp
                dispatch(pushAPI(pushObj, () => { }))
                Toaster.success(IsFinalLevel ? 'The simulation token has been approved' : 'The simulation token has been sent to next level for approval')
                props.closeDrawer('', 'submit')
              } else {
                Toaster.success(IsFinalLevel ? 'The simulation token has been approved' : 'The simulation token has been sent to next level for approval')
                props.closeDrawer('', 'submit')
              }
            }
          }
        }))
      } else {
        //SIMULATION REJECT CONDITION
        dispatch(simulationRejectRequestByApprove(approverObject, res => {
          if (res.data.Result) {
            Toaster.success('The simulation token has been rejected')
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
    if (!isSimulation) {
      obj = {
        LoggedInUserId: loggedInUserId(), // user id
        DepartmentId: value.value,
        TechnologyId: approvalData[0] && approvalData[0].TechnologyId ? approvalData[0].TechnologyId : '00000000-0000-0000-0000-000000000000',
      }
    } else {
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
    }
  }

  const handleRemark = (e) => {
    if (e) {
      setShowError(false)
    } else {
      setShowError(true)
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
            {loader && <LoaderCustom customClass="approve-reject-drawer-loader" />}
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
                        label={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Purchase Group'}`}
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
                        disabled={true}
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
                        disabled={true}
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
                        label={"Purchase Group"}
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
                        {!isSimulationApprovalListing &&
                          <div className="input-group form-group col-md-12">
                            <label>Effective Date<span className="asterisk-required">*</span></label>
                            <div className="inputbox date-section">
                              <DatePicker
                                name="EffectiveDate"
                                selected={simulationDetail?.EffectiveDate && DayTime(simulationDetail.EffectiveDate).isValid ? DayTime(simulationDetail.EffectiveDate)._d : ''}
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


                  </>
                }


                {getConfigurationKey().IsProvisionalSimulation && SimulationType === APPROVER && type === 'Sender' && !isSimulationApprovalListing &&

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
                  isSimulation && type === 'Sender' && !isSimulationApprovalListing &&
                  <AttachmentSec token={simulationDetail?.TokenNo} type={type} Attachements={simulationDetail?.Attachements} />
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
                    disabled={disableSubmitButton}
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
      {/* {openPushButton && (
        <PushButtonDrawer
          isOpen={openPushButton}
          closeDrawer={closePushButton}
          approvalData={[approvalData]}
          dataSend={dataSend}
          anchor={'right'}
        />
      )} */}
    </>
  )
}

export default React.memo(ApproveRejectDrawer)
