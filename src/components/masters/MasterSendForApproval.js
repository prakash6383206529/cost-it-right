import React, { useEffect, useState } from 'react'
import { getConfigurationKey, loggedInUserId, userDetails } from '../../helper';
import { approvalRequestByMasterApprove, getAllMasterApprovalDepartment, getAllMasterApprovalUserByDepartment, rejectRequestByMasterApprove } from './actions/Material';
import "react-datepicker/dist/react-datepicker.css";
import { debounce } from 'lodash'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch, useSelector } from 'react-redux'
import { TextAreaHookForm, SearchableSelectHookForm, DatePickerHookForm, TextFieldHookForm, } from '../layout/HookFormInputs'
import { toastr } from 'react-redux-toastr'
import { getReasonSelectList } from '../costing/actions/Approval';
import moment from 'moment'



function MasterSendForApproval(props) {
    //     const { type, tokenNo, approvalData, IsFinalLevel, IsPushDrawer, isSimulation, dataSend, reasonId, simulationDetail, master, selectedRowData, costingArr, isSaveDone } = props

    //     const { register, control, formState: { errors }, handleSubmit, setValue, getValues, reset, } = useForm({
    //         mode: 'onChange',
    //         reValidateMode: 'onChange',
    //     })

    //     const [effectiveDate, setEffectiveDate] = useState('')
    //     const [approvalDropDown, setApprovalDropDown] = useState([])

    //     const dispatch = useDispatch()
    //     const reasonsList = useSelector((state) => state.approval.reasonsList)
    //     const { deptList } = useSelector((state) => state.material)

    //     const handleEffectiveDateChange = (date) => {
    //         setEffectiveDate(date)
    //     }

    //     const toggleDrawer = (event, type = 'cancel') => {
    //         if (
    //             event.type === 'keydown' &&
    //             (event.key === 'Tab' || event.key === 'Shift')
    //         ) {
    //             return
    //         }
    //         props.closeDrawer('', type)
    //     }

    //     useEffect(() => {
    //         dispatch(getReasonSelectList((res) => { }))
    //         // dispatch(getAllApprovalDepartment((res) => { }))
    //         dispatch(getAllMasterApprovalDepartment((res) => {
    //             const Data = res?.data?.SelectList
    //             const departObj = Data && Data.filter(item => item.Value === userDetails().DepartmentId)

    //             setValue('dept', { label: departObj[0].Text, value: departObj[0].Value })

    //             let obj = {
    //                 LoggedInUserId: loggedInUserId(),
    //                 DepartmentId: departObj[0].Value,
    //                 TechnologyId: approvalData[0].TechnologyId,
    //                 ReasonId: reasonId
    //             }

    //             dispatch(getAllMasterApprovalUserByDepartment(obj, (res) => {
    //                 const Data = res.data.DataList[1] ? res.data.DataList[1] : []

    //                 setValue('dept', { label: Data.DepartmentName, value: Data.DepartmentId })
    //                 setValue('approver', { label: Data.Text ? Data.Text : '', value: Data.Value ? Data.Value : '', levelId: Data.LevelId ? Data.LevelId : '', levelName: Data.LevelName ? Data.LevelName : '' })

    //             },
    //             ),
    //             )
    //         }))
    //     }, [])



    //     const renderDropdownListing = (label) => {
    //         const tempDropdownList = []
    //         if (label === 'Dept') {
    //             deptList &&
    //                 deptList.map((item) => {
    //                     if (item.Value === '0') return false
    //                     tempDropdownList.push({ label: item.Text, value: item.Value })
    //                     return null
    //                 })
    //             return tempDropdownList
    //         }
    //         if (label === 'reasons') {
    //             reasonsList && reasonsList.map((item) => {
    //                 if (item.Value === '0') return false
    //                 tempDropdownList.push({ label: item.Text, value: item.Value })
    //                 return null
    //             })
    //             return tempDropdownList
    //         }
    //     }

    //     const handleDepartmentChange = (value) => {
    //         setValue('approver', { label: '', value: '', levelId: '', levelName: '' })
    //         let tempDropdownList = []
    //         let obj = {
    //             LoggedInUserId: loggedInUserId(), // user id
    //             DepartmentId: value.value,
    //             TechnologyId: approvalData[0] && approvalData[0].TechnologyId ? approvalData[0].TechnologyId : '00000000-0000-0000-0000-000000000000',
    //         }
    //         dispatch(
    //             getAllMasterApprovalUserByDepartment(obj, (res) => {
    //                 res.data.DataList &&
    //                     res.data.DataList.map((item) => {
    //                         if (item.Value === '0') return false;
    //                         tempDropdownList.push({
    //                             label: item.Text,
    //                             value: item.Value,
    //                             levelId: item.LevelId,
    //                             levelName: item.LevelName
    //                         })
    //                         return null
    //                     })
    //                 setApprovalDropDown(tempDropdownList)
    //             }),
    //         )

    //     }


    //     const onSubmit = debounce(handleSubmit(() => {
    //         const remark = getValues('remark')
    //         const reason = getValues('reason')
    //         const dept = getValues('dept')
    //         const approver = getValues('approver')

    //         if (type === 'Sender') {
    //             //THIS OBJ IS FOR SIMULATION SEND FOR APPROVAL
    //             let senderObj = {}
    //             senderObj.ApprovalId = "00000000-0000-0000-0000-000000000000"
    //             senderObj.ReasonId = reason ? reason.value : ''
    //             senderObj.Reason = reason ? reason.label : ''
    //             // senderObj.ApprovalToken = 0
    //             senderObj.DepartmentId = userDetails().DepartmentId
    //             senderObj.DepartmentName = userDetails().Department
    //             senderObj.ApproverLevelId = approver && approver.levelId ? approver.levelId : ''
    //             senderObj.ApproverDepartmentId = dept && dept.value ? dept.value : ''
    //             senderObj.ApproverLevel = approver && approver.levelName ? approver.levelName : ''
    //             senderObj.ApproverDepartmentName = dept && dept.label ? dept.label : ''
    //             senderObj.ApproverId = approver && approver.value ? approver.value : ''
    //             senderObj.SenderLevelId = userDetails().LoggedInMasterLevelId
    //             senderObj.SenderId = loggedInUserId()
    //             senderObj.SenderLevel = userDetails().LoggedInMasterLevel
    //             senderObj.SenderRemark = remark
    //             senderObj.EffectiveDate = moment(effectiveDate).local().format('YYYY/MM/DD HH:mm')
    //             senderObj.LoggedInUserId = loggedInUserId()
    //             // senderObj.SimulationList = [{ SimulationId: simulationDetail.SimulationId, SimulationTokenNumber: simulationDetail.TokenNo, SimulationAppliedOn: simulationDetail.SimulationAppliedOn }]

    //             //THIS CONDITION IS FOR SIMULATION SEND FOR APPROVAL
    //             dispatch(approvalRequestByMasterApprove(senderObj, res => {
    //                 if (res.data.Result) {
    //                     toastr.success('Token has been sent for approval.')
    //                     props.closeDrawer('', 'submit')
    //                 }
    //             }))
    //         }
    //         else {


    //             let Data = []
    //             approvalData.map(ele => {
    //                 Data.push({
    //                     ApprovalProcessSummaryId: ele.ApprovalProcessSummaryId,
    //                     ApprovalToken: ele.ApprovalNumber,
    //                     LoggedInUserId: loggedInUserId(),
    //                     SenderLevelId: userDetails().LoggedInLevelId,
    //                     SenderLevel: userDetails().LoggedInLevel,
    //                     ApproverDepartmentId: dept && dept.value ? dept.value : '',
    //                     ApproverDepartmentName: dept && dept.label ? dept.label : '',
    //                     Approver: approver && approver.value ? approver.value : '',
    //                     ApproverLevelId: approver && approver.levelId ? approver.levelId : '',
    //                     ApproverLevel: approver && approver.levelName ? approver.levelName : '',
    //                     Remark: remark,
    //                     IsApproved: type === 'Approve' ? true : false,
    //                     IsFinalApprovalProcess: false //ASK THIS CONDITION WITH KAMAL SIR
    //                 })
    //             })
    //             if (type === 'Approve') {
    //                 reset()
    //                 dispatch(approvalRequestByMasterApprove(Data, res => {
    //                     if (res.data.Result) {
    //                         if (IsPushDrawer) {
    //                             toastr.success('The token has been approved')

    //                         } else {
    //                             toastr.success(!IsFinalLevel ? 'The token has been approved' : 'The token has been sent to next level for approval')
    //                             props.closeDrawer('', 'submit')
    //                         }
    //                     }
    //                 }))
    //             } else {
    //                 // REJECT CONDITION
    //                 dispatch(rejectRequestByMasterApprove(Data, res => {
    //                     if (res.data.Result) {
    //                         toastr.success('Token Rejected')
    //                         props.closeDrawer('', 'submit')
    //                     }
    //                 }))
    //             }
    //         }

    //     }), 500)


    //     return (
    //         <>
    //             <Drawer
    //                 anchor={props.anchor}
    //                 open={props.isOpen}
    //             //onClose={(e) => toggleDrawer(e)}
    //             >
    //                 <Container>
    //                     <div className={'drawer-wrapper'}>
    //                         <form
    //                         >
    //                             <Row className="drawer-heading">
    //                                 <Col>
    //                                     <div className={'header-wrapper left'}>
    //                                         <h3>{'Send For Approval'}</h3>
    //                                     </div>
    //                                     <div
    //                                         onClick={(e) => toggleDrawer(e)}
    //                                         className={'close-button right'}
    //                                     ></div>
    //                                 </Col>
    //                             </Row>

    //                             <Row className="ml-0">
    //                                 {type === 'Approve' && IsFinalLevel && (
    //                                     <>
    //                                         <div className="input-group form-group col-md-12 input-withouticon">
    //                                             <SearchableSelectHookForm
    //                                                 label={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}
    //                                                 name={"dept"}
    //                                                 placeholder={"-Select-"}
    //                                                 Controller={Controller}
    //                                                 control={control}
    //                                                 rules={{ required: false }}
    //                                                 register={register}
    //                                                 defaultValue={""}
    //                                                 options={renderDropdownListing("Dept")}
    //                                                 mandatory={false}
    //                                                 handleChange={handleDepartmentChange}
    //                                                 errors={errors.dept}
    //                                                 disabled={true}
    //                                             />
    //                                         </div>
    //                                         <div className="input-group form-group col-md-12 input-withouticon">
    //                                             <SearchableSelectHookForm
    //                                                 label={'Approver'}
    //                                                 name={'approver'}
    //                                                 placeholder={'-Select-'}
    //                                                 Controller={Controller}
    //                                                 control={control}
    //                                                 rules={{ required: false }}
    //                                                 register={register}
    //                                                 //defaultValue={isEditFlag ? plantName : ''}
    //                                                 options={approvalDropDown}
    //                                                 mandatory={false}
    //                                                 handleChange={() => { }}
    //                                                 disabled={true}
    //                                                 errors={errors.approver}
    //                                             />
    //                                         </div>
    //                                     </>
    //                                 )}
    //                                 {

    //                                     (type === 'Sender' && !IsFinalLevel) &&
    //                                     <>
    //                                         <>
    //                                             <div className="input-group form-group col-md-12">
    //                                                 <SearchableSelectHookForm
    //                                                     label={'Reason'}
    //                                                     name={'reason'}
    //                                                     placeholder={'-Select-'}
    //                                                     Controller={Controller}
    //                                                     control={control}
    //                                                     rules={{ required: true }}
    //                                                     register={register}
    //                                                     //defaultValue={isEditFlag ? plantName : ''}
    //                                                     options={renderDropdownListing('reasons')}
    //                                                     mandatory={true}
    //                                                     handleChange={() => { }}
    //                                                     errors={errors.reason}
    //                                                 />
    //                                             </div>
    //                                             <div className="input-group form-group col-md-12">
    //                                                 <div className="inputbox date-section">
    //                                                     <DatePickerHookForm
    //                                                         name={`EffectiveDate`}
    //                                                         label={'Effective Date'}
    //                                                         selected={effectiveDate}
    //                                                         handleChange={(date) => {
    //                                                             handleEffectiveDateChange(date);
    //                                                         }}
    //                                                         //defaultValue={data.effectiveDate != "" ? moment(data.effectiveDate).format('DD/MM/YYYY') : ""}
    //                                                         rules={{ required: true }}
    //                                                         Controller={Controller}
    //                                                         control={control}
    //                                                         register={register}
    //                                                         showMonthDropdown
    //                                                         showYearDropdown
    //                                                         dateFormat="aa/MM/yyyy"
    //                                                         //maxDate={new Date()}
    //                                                         dropdownMode="select"
    //                                                         placeholderText="Select date"
    //                                                         customClassName="withBorder"
    //                                                         className="withBorder"
    //                                                         autoComplete={"off"}
    //                                                         disabledKeyboardNavigation
    //                                                         onChangeRaw={(e) => e.preventDefault()}
    //                                                         disabled={false}
    //                                                         mandatory={true}
    //                                                         errors={errors.EffectiveDate}
    //                                                     />
    //                                                 </div>
    //                                             </div>
    //                                             <div className="input-group form-group col-md-12">
    //                                                 <TextFieldHookForm
    //                                                     label="Basic Rate"
    //                                                     name={'basicRate'}
    //                                                     Controller={Controller}
    //                                                     control={control}
    //                                                     register={register}
    //                                                     className=""
    //                                                     customClassName={'withBorder'}
    //                                                     errors={errors.basicRate}
    //                                                     disabled={false}
    //                                                 />
    //                                                 {/* {showError && <span className="text-help">This is required field</span>} */}
    //                                             </div>
    //                                             <div className="input-group form-group col-md-12">
    //                                                 <TextAreaHookForm
    //                                                     label="Scrap Rate"
    //                                                     name={'scrapRate'}
    //                                                     Controller={Controller}
    //                                                     control={control}
    //                                                     register={register}
    //                                                     className=""
    //                                                     customClassName={'withBorder'}
    //                                                     errors={errors.scrapRate}
    //                                                     disabled={false}
    //                                                 />
    //                                                 {/* {showError && <span className="text-help">This is required field</span>} */}
    //                                             </div>
    //                                         </>


    //                                     </>
    //                                 }
    //                                 <div className="input-group form-group col-md-12">
    //                                     <TextAreaHookForm
    //                                         label="Remark"
    //                                         name={'remark'}
    //                                         Controller={Controller}
    //                                         control={control}
    //                                         register={register}
    //                                         mandatory={type === 'Approve' ? false : true}
    //                                         rules={{ required: type === 'Approve' ? false : true }}
    //                                         //defaultValue={viewRM.RMRate}
    //                                         className=""
    //                                         customClassName={'withBorder'}
    //                                         errors={errors.remark}
    //                                         disabled={false}
    //                                     />
    //                                     {/* {showError && <span className="text-help">This is required field</span>} */}
    //                                 </div>
    //                             </Row>
    //                             <Row className="sf-btn-footer no-gutters justify-content-between">
    //                                 <div className="col-sm-12 text-right bluefooter-butn">
    //                                     <button
    //                                         type={'button'}
    //                                         className="reset mr15 cancel-btn"
    //                                         onClick={toggleDrawer}
    //                                     >
    //                                         <div className={'cancel-icon'}></div>
    //                                         {'Cancel'}
    //                                     </button>

    //                                     <button
    //                                         type="button"
    //                                         className="submit-button  save-btn"
    //                                         onClick={onSubmit}
    //                                     >
    //                                         <div className={'save-icon'}></div>
    //                                         {'Submit'}
    //                                     </button>
    //                                 </div>
    //                             </Row>
    //                         </form>
    //                     </div>
    //                 </Container>
    //             </Drawer>

    //         </>
    //     );
}

export default MasterSendForApproval;