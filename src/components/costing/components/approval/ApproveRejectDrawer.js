import React, { useEffect, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch, useSelector } from 'react-redux'
import { approvalRequestByApprove, rejectRequestByApprove, getAllApprovalUserFilterByDepartment, getAllApprovalDepartment, } from '../../../costing/actions/Approval'
import { TextAreaHookForm, SearchableSelectHookForm, DatePickerHookForm, } from '../../../layout/HookFormInputs'
import { formatRMSimulationObject, getConfigurationKey, loggedInUserId, userDetails } from '../../../../helper'
import { toastr } from 'react-redux-toastr'
import PushButtonDrawer from './PushButtonDrawer'
import { RMDOMESTIC, RMIMPORT } from '../../../../config/constants'
import { getSimulationApprovalByDepartment, simulationApprovalRequestByApprove, simulationRejectRequestByApprove, simulationApprovalRequestBySender, saveSimulationForRawMaterial, getAllSimulationApprovalList } from '../../../simulation/actions/Simulation'
import moment from 'moment'


function ApproveRejectDrawer(props) {

  const { type, tokenNo, approvalData, IsFinalLevel, IsPushDrawer, isSimulation, dataSend, reasonId, simulationDetail, master, selectedRowData, costingArr } = props

  const userLoggedIn = loggedInUserId()
  const userData = userDetails()
  const partNo = useSelector((state) => state.costing.partNo)

  const { register, control, errors, handleSubmit, setValue } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const dispatch = useDispatch()
  const [approvalDropDown, setApprovalDropDown] = useState([])
  const [reason, setReason] = useState([])
  const [openPushButton, setOpenPushButton] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const deptList = useSelector((state) => state.approval.approvalDepartmentList)
  const { selectedMasterForSimulation } = useSelector(state => state.simulation)


  // const simulationDeptList = useSelector((state)=> state.simulation)

  useEffect(() => {
    // dispatch(getAllApprovalDepartment((res) => { }))
    /***********************************REMOVE IT AFTER SETTING FROM SIMULATION*******************************/
    if (!isSimulation) {
      dispatch(getAllApprovalDepartment((res) => {
        const Data = res.data.SelectList
        const departObj = Data && Data.filter(item => item.Value === userData.DepartmentId)

        setValue('dept', { label: departObj[0].Text, value: departObj[0].Value })

        let obj = {
          LoggedInUserId: userData.LoggedInUserId,
          DepartmentId: departObj[0].Value,
          TechnologyId: approvalData[0].TechnologyId,
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
        let obj = {
          LoggedInUserId: userData.LoggedInUserId,
          DepartmentId: departObj[0].Value,
          //NEED TO MAKE THIS 2   
          TechnologyId: simulationDetail.SimulationTechnologyId ? simulationDetail.SimulationTechnologyId : selectedMasterForSimulation.value,
          ReasonId: 0
        }

        dispatch(
          getAllSimulationApprovalList(obj, (res) => {
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
    }


    // DO IT AFTER GETTING DATA
  }, [])


  useEffect(() => {
    //THIS OBJ IS FOR SAVE SIMULATION
    if (type === 'Sender') {
      let simObj = formatRMSimulationObject(simulationDetail, selectedRowData, costingArr)

      //THIS CONDITION IS FOR SAVE SIMULATION
      switch (master) {
        case RMDOMESTIC:
          dispatch(saveSimulationForRawMaterial(simObj, res => {
            if (res.data.Result) {
              toastr.success('Simulation has been saved successfully.')
            }
          }))
          break;
        case RMIMPORT:
          dispatch(saveSimulationForRawMaterial(simObj, res => {
            if (res.data.Result) {
              toastr.success('Simulation has been saved successfully.')
            }
          }))
          break;

        default:
          break;
      }
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




  const onSubmit = (data) => {
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
          ApproverDepartmentId: data.dept && data.dept.value ? data.dept.value : '',
          ApproverDepartmentName: data.dept && data.dept.label ? data.dept.label : '',
          Approver: data.approver && data.approver.value ? data.approver.value : '',
          ApproverLevelId: data.approver && data.approver.levelId ? data.approver.levelId : '',
          ApproverLevel: data.approver && data.approver.levelName ? data.approver.levelName : '',
          Remark: data.remark,
          IsApproved: type === 'Approve' ? true : false,
          IsFinalApprovalProcess: false //ASK THIS CONDITION WITH KAMAL SIR
        })
      })
      if (type === 'Approve') {
        dispatch(approvalRequestByApprove(Data, res => {
          if (res.data.Result) {
            if (IsPushDrawer) {
              toastr.success('The costing has been approved')
              setOpenPushButton(true)

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
      let objs = {}
      objs.ApprovalId = simulationDetail.SimulationApprovalProcessId
      objs.ApprovalToken = simulationDetail.Token
      objs.LoggedInUserId = userLoggedIn
      objs.SenderLevelId = userData.LoggedInSimulationLevelId
      objs.SenderLevel = userData.LoggedInSimulationLevel
      objs.SenderId = userLoggedIn
      objs.ApproverId = data.approver && data.approver.value ? data.approver.value : ''
      objs.ApproverLevelId = data.approver && data.approver.levelId ? data.approver.levelId : ''
      objs.ApproverLevel = data.approver && data.approver.levelName ? data.approver.levelName : ''
      objs.Remark = data.remark
      objs.IsApproved = type === 'Approve' ? true : false
      objs.ApproverDepartmentId = data.dept && data.dept.value ? data.dept.value : ''
      objs.ApproverDepartmentName = data.dept && data.dept.label ? data.dept.label : ''
      objs.IsFinalApprovalProcess = false
      objs.SimulationApprovalProcessSummaryId = simulationDetail.SimulationApprovalProcessSummaryId
      if (type === 'Sender') {
        //THIS OBJ IS FOR SIMULATION SEND FOR APPROVAL
        let senderObj = {}
        senderObj.ApprovalId = "00000000-0000-0000-0000-000000000000"
        senderObj.ReasonId = 0
        senderObj.Reason = ''
        // senderObj.ApprovalToken = 0
        senderObj.DepartmentId = userDetails().DepartmentId
        senderObj.DepartmentName = userDetails().Department
        senderObj.ApproverLevelId = data.approver && data.approver.levelId ? data.approver.levelId : ''
        senderObj.ApproverDepartmentId = data.dept && data.dept.value ? data.dept.value : ''
        senderObj.ApproverLevel = data.approver && data.approver.levelName ? data.approver.levelName : ''
        senderObj.ApproverDepartmentName = data.dept && data.dept.label ? data.dept.label : ''
        senderObj.ApproverId = data.approver && data.approver.value ? data.approver.value : ''
        senderObj.SenderLevelId = userData.LoggedInSimulationLevelId
        senderObj.SenderId = userLoggedIn
        senderObj.SenderLevel = userData.LoggedInSimulationLevel
        senderObj.SenderRemark = data.remark
        senderObj.EffectiveDate = moment(data.EffectiveDate).local().format('YYYY/MM/DD HH:mm')
        senderObj.LoggedInUserId = userLoggedIn
        senderObj.SimulationList = [{ SimulationId: simulationDetail.SimulationId, SimulationTokenNumber: simulationDetail.TokenNo, SimulationAppliedOn: simulationDetail.SimulationAppliedOn }]

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
        dispatch(simulationApprovalRequestByApprove(objs, res => {
          if (res.data.Result) {
            if (IsPushDrawer) {
              toastr.success('The simulation token has been approved')
              setOpenPushButton(true)

            } else {
              toastr.success(IsFinalLevel ? 'The simulation token has been approved' : 'The simulation token has been sent to next level for approval')
              props.closeDrawer('', 'submit')
            }
          }
        }))
      } else {
        //SIMULATION REJECT CONDITION
        dispatch(simulationRejectRequestByApprove(objs, res => {
          if (res.data.Result) {
            toastr.success('Costing Rejected')
            props.closeDrawer('', 'submit')
          }
        }))
      }
    }
  }

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
  }

  const handleDepartmentChange = (value) => {
    setValue('approver', { label: '', value: '', levelId: '', levelName: '' })
    let tempDropdownList = []
    let obj = {
      LoggedInUserId: loggedInUserId(), // user id
      DepartmentId: value.value,
      TechnologyId: approvalData[0] && approvalData[0].TechnologyId ? approvalData[0].TechnologyId : '00000000-0000-0000-0000-000000000000',
    }

    /* Problem here*/
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{`${type} Costing`}</h3>
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
                        rules={{ required: false }}
                        register={register}
                        //defaultValue={isEditFlag ? plantName : ''}
                        options={approvalDropDown}
                        mandatory={false}
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
                        label={"Departments"}
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
                        {/* <div className="input-group form-group col-md-12 input-withouticon">
                          <SearchableSelectHookForm
                            label={'Reason'}
                            name={'reason'}
                            placeholder={'-Select-'}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            //defaultValue={isEditFlag ? plantName : ''}
                            options={approvalDropDown}
                            mandatory={true}
                            handleChange={() => { }}
                            errors={errors.reason}
                          />
                        </div> */}
                        <div className="input-group form-group col-md-12 input-withouticon">
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
                        </div>
                      </>
                    }
                  </>
                }
                <div className="input-group form-group col-md-12 input-withouticon">
                  <TextAreaHookForm
                    label="Remark"
                    name={'remark'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={type === 'Approve' ? false : true}
                    rules={{ required: true }}
                    handleChange={() => { }}
                    //defaultValue={viewRM.RMRate}
                    className=""
                    customClassName={'withBorder'}
                    //errors={errors.ECNNumber}
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
                  >
                    <div className={'cross-icon'}>
                      <img
                        src={require('../../../../assests/images/times.png')}
                        alt="cancel-icon.jpg"
                      />
                    </div>{' '}
                    {'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="submit-button  save-btn"
                  //onClick={() => setApproveDrawer(true)}
                  >
                    <div className={'check-icon'}>
                      <img
                        src={require('../../../../assests/images/check.png')}
                        alt="check-icon.jpg"
                      />{' '}
                    </div>
                    {'Submit'}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
      {openPushButton && (
        <PushButtonDrawer
          isOpen={openPushButton}
          closeDrawer={closePushButton}
          approvalData={[approvalData]}
          dataSend={dataSend}
          anchor={'right'}
        />
      )}
    </>
  )
}

export default React.memo(ApproveRejectDrawer)
