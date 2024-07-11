import React, { useEffect, useRef, useState } from 'react'
import { Container, Row, Col } from 'reactstrap'
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer'
import { useDispatch, useSelector } from 'react-redux'
import { getReasonSelectList, setSAPData } from '../../../costing/actions/Approval'
import { TextAreaHookForm, SearchableSelectHookForm, AllApprovalField } from '../../../layout/HookFormInputs'
import { getConfigurationKey, handleDepartmentHeader, loggedInUserId, userDetails } from '../../../../helper'
import PushButtonDrawer from './PushButtonDrawer'
import { FILE_URL, REASON_ID, RELEASESTRATEGYTYPEID1, RELEASESTRATEGYTYPEID2, RELEASESTRATEGYTYPEID3, RELEASESTRATEGYTYPEID4, RELEASESTRATEGYTYPEID6 } from '../../../../config/constants'
import { uploadSimulationAttachment } from '../../../simulation/actions/Simulation'
import DayTime from '../../../common/DayTimeWrapper'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import redcrossImg from '../../../../assests/images/red-cross.png'
import LoaderCustom from '../../../common/LoaderCustom';
import Toaster from '../../../common/Toaster'
import WarningMessage from '../../../common/WarningMessage'
import { getApprovalTypeSelectList } from '../../../../actions/Common'
import { updateCostingIdFromRfqToNfrPfs } from '../../actions/Costing'
import { pushNfrOnSap } from '../../../masters/nfr/actions/nfr'
import { MESSAGES } from '../../../../config/message'
import PopupMsgWrapper from '../../../common/PopupMsgWrapper'
import PushSection from '../../../common/PushSection'
import { transformApprovalItem } from '../../../common/CommonFunctions'
import Button from '../../../layout/Button'
import { submit } from 'redux-form'
import SAPApproval from '../../../SAPApproval'

function ApproveRejectUI(props) {
  // ********* INITIALIZE REF FOR DROPZONE ********
  const dropzone = useRef(null);
  const { type, approvalData, showMessage, setDataFromSummary, disableReleaseStrategy, IsNotFinalLevel, isSimulation, dataSend, simulationDetail, isSimulationApprovalListing, dataInFields, approvalDropDown, handleDepartmentChange, onSubmit, callbackSetDataInFields, showApprovalTypeDropdown, releaseStrategyDetails, reasonId } = props

  const { TokensList } = useSelector(state => state.simulation)
  const { initialConfiguration } = useSelector(state => state.auth)

  const { register, control, formState: { errors }, setValue, handleSubmit, getValues } = useForm({
    mode: 'onChange', reValidateMode: 'onChange',
  })
  const userData = userDetails()

  const dispatch = useDispatch()
  const [openPushButton, setOpenPushButton] = useState(false)
  const [linkingTokenDropDown, setLinkingTokenDropDown] = useState('')
  const [showError, setShowError] = useState(false)
  const [tokenDropdown, setTokenDropdown] = useState(true)
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [loader, setLoader] = useState(false)
  const [isDisable, setIsDisable] = useState(false)
  const [attachmentLoader, setAttachmentLoader] = useState(false)
  const [showWarningMessage, setShowWarningMessage] = useState(props?.showWarningMessage)
  const [approvalType, setApprovalType] = useState('');   // change 
  const [showPopup, setShowPopup] = useState(false)
  const [fieldDataStore, setFieldDataStore] = useState({})

  const deptList = useSelector((state) => state.approval.approvalDepartmentList)
  const reasonsList = useSelector((state) => state.approval.reasonsList)
  const approvalTypeSelectList = useSelector(state => state.comman.approvalTypeSelectList)

  useEffect(() => {
    dispatch(getReasonSelectList((res) => { }))
    dispatch(getApprovalTypeSelectList(() => { }))
  }, [])

  useEffect(() => {
    setShowWarningMessage(props?.showWarningMessage)
  }, [props?.showWarningMessage])

  useEffect(() => {
    if (getConfigurationKey().IsReleaseStrategyConfigured && (!setDataFromSummary || disableReleaseStrategy)) {

      let appTypeId = approvalTypeSelectList && approvalTypeSelectList?.filter(element => Number(element?.Value) === Number(dataInFields?.ApprovalType?.value))[0]
      setValue('ApprovalType', appTypeId ? { label: appTypeId?.Text, value: appTypeId?.Value } : '')
      setValue('dept', dataInFields?.Department ? dataInFields?.Department : '')
      setValue('approver', dataInFields?.Approver ? dataInFields?.Approver : '')

    } else {
      setValue('dept', dataInFields?.Department ? dataInFields?.Department : '')
      setValue('approver', dataInFields?.Approver ? dataInFields?.Approver : '')
    }
  }, [dataInFields])

  useEffect(() => {
    if (isSimulation) {
      props?.fileDataCallback(files)
    }
  }, [files])

  const handleTokenDropDownChange = (value) => {
    setLinkingTokenDropDown(value)
  }

  const toggleDrawer = (event, type = 'cancel') => {
    if (props?.isDisable) {
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
    props.closeDrawer('', 'Cancel')
  }

  const submitButton = handleSubmit(() => {
    if (getConfigurationKey().IsReleaseStrategyConfigured && showApprovalTypeDropdown) {
      if (getValues('ApprovalType') === '' || !getValues('ApprovalType')) {
        Toaster.warning("Please select approval type")
        return
      } else if (approvalDropDown.length === 0) {
        Toaster.warning("You don't have permission to send simulation for approval.")
        return
      }
    }
    onSubmit();
  })

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
    if (label === 'ApprovalType') {
      approvalTypeSelectList && approvalTypeSelectList.map((item) => {
        const transformedText = transformApprovalItem(item);
        if (Number(item.Value) === Number(RELEASESTRATEGYTYPEID3) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID4) || Number(item.Value) === Number(RELEASESTRATEGYTYPEID6)) tempDropdownList.push({ label: transformedText, value: item.Value })
        return null
      })
      return tempDropdownList
    }
  }

  const handleRemark = (e) => {
    if (e) {
      let obj = { ...fieldDataStore, ...dataInFields, Remark: e?.target?.value }
      setFieldDataStore(obj)
      callbackSetDataInFields(obj)
      setShowError(false)
    } else {
      setShowError(true)
    }
  }

  const handleReason = (value) => {
    if (value) {
      let obj = { ...fieldDataStore, ...dataInFields, Reason: value }
      setFieldDataStore(obj)
      callbackSetDataInFields(obj)
    }
  }
  const handleApproverChange = (value) => {
    if (value) {
      let obj = { ...fieldDataStore, ...dataInFields, Approver: value }
      setFieldDataStore(obj)
      callbackSetDataInFields(obj)
    }
  }


  /**
   * @method handleApprovalTypeChange
   * @description  Approval Type Change
   */
  const handleApprovalTypeChange = (newValue) => {
    setApprovalType(newValue?.value)
    let obj = {
      ...fieldDataStore, Department: dataInFields?.Department,
      Approver: { label: '', value: '', levelId: '', levelName: '' },
      ApprovalType: newValue
    }
    // delete obj.Department
    delete obj.Approver
    setFieldDataStore(obj)
    callbackSetDataInFields(obj)
    // userTechnology(newValue.value)
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
  const showPopupWrapper = () => {
    setShowPopup(true)
  }
  const onPopupConfirm = () => {
    onSubmit()
    setShowPopup(false)
  }
  const closePopUp = () => {
    onSubmit()
    setShowPopup(false)
  }
  const submitForm = handleSubmit(() => {
    onSubmit()
  })
  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      //onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper'}>
            {props?.isDisable && <LoaderCustom customClass="approve-reject-drawer-loader" />}
            <form
            >
              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{`${isSimulation ? `${type === 'Sender' ? 'Send For Approval' : `${type} Simulation`}` : `${props?.isRFQApproval ? 'Return' : type} Costing`} `}</h3>
                  </div>

                  <div
                    onClick={(e) => toggleDrawer(e)}
                    disabled={props?.isDisable}
                    className={'close-button right'}
                  ></div>
                </Col>
              </Row>

              <Row className="ml-0">
                {
                  type === 'Sender' && getConfigurationKey().IsSAPConfigured &&

                  <Col md="12" className="simulation-sap-approval">
                    <Row >
                      <Col md="12">
                        <div className="left-border">{"SAP-Push Details"}</div>
                      </Col>
                      <SAPApproval
                        isSimulation={true}
                        Controller={Controller}
                        register={register}
                        errors={errors}
                        control={control}
                        plantId={props?.plantId}
                      />

                    </Row>
                  </Col>
                }

                {getConfigurationKey().IsReleaseStrategyConfigured && showApprovalTypeDropdown && <Col md="6">
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
                    disabled={disableReleaseStrategy}
                    mandatory={true}
                    handleChange={handleApprovalTypeChange}
                    errors={errors.ApprovalType}
                  />
                </Col>}
                {type === 'Approve' && IsNotFinalLevel && !isSimulation && (
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
                        disabled={(disableReleaseStrategy || !(userData.Department.length > 1 && reasonId !== REASON_ID))}
                      />
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
                          handleChange={handleApproverChange}
                          disabled={(disableReleaseStrategy || !(userData.Department.length > 1 && reasonId !== REASON_ID))}
                          errors={errors.approver}
                        />}
                      {showWarningMessage && <WarningMessage dClass={"mr-2"} message={showMessage ? showMessage : initialConfiguration.IsMultipleUserAllowForApproval ? "There are no further highest level users associated with this company. Kindly contact the admin team for support." : `This user is not in the approval cycle for the ${getValues('ApprovalType')} approval type. Please contact the admin to add an approver for the ${getValues('ApprovalType')} approval type and ${getConfigurationKey().IsCompanyConfigureOnPlant ? 'company' : 'department'}.`} />}
                    </div>
                  </>
                )}
                {
                  // REMOVE IT AFTER FUNCTIONING IS DONE FOR SIMUALTION, NEED TO MAKE CHANGES FROM BACKEND FOR SIMULATION TODO
                  isSimulation && (type === 'Approve' || type === 'Sender') && !IsNotFinalLevel &&
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
                        disabled={(disableReleaseStrategy || !(userData.Department.length > 1 && reasonId !== REASON_ID))}
                      />
                    </div>
                    <div className="input-group form-group col-md-12 input-withouticon">
                      {initialConfiguration.IsMultipleUserAllowForApproval ? <>
                        <AllApprovalField
                          label="Approver"
                          approverList={getConfigurationKey().IsReleaseStrategyConfigured && showApprovalTypeDropdown ? getValues('ApprovalType') ? approvalDropDown : [] : approvalDropDown}
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
                          handleChange={handleApproverChange}
                          errors={errors.approver}
                          disabled={(disableReleaseStrategy || !(userData.Department.length > 1 && reasonId !== REASON_ID))}
                        />}
                      {showWarningMessage && <WarningMessage dClass={"mr-2"} message={showMessage ? showMessage : `This user is not in approval cycle for ${getConfigurationKey().IsCompanyConfigureOnPlant ? 'company' : 'department'} approval type, Please contact admin to add approver for ${getConfigurationKey().IsCompanyConfigureOnPlant ? 'company' : 'department'} approval type and ${getConfigurationKey().IsCompanyConfigureOnPlant ? 'company' : 'department'}`} />}
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
                            handleChange={handleReason}
                            errors={errors.reason}
                          />
                        </div>
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
                        {/* MINDA */}
                        {/* {
                          type === 'Sender' && isSimulation &&
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
                {
                  isSimulation && type === 'Sender' &&
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
              </Row>
              <Row className="sf-btn-footer no-gutters justify-content-between">
                <div className="col-sm-12 text-right bluefooter-butn">
                  <Button
                    id="Approval_cancel"
                    className="mr15 my-0"
                    variant={"cancel-btn"}
                    disabled={isDisable}
                    onClick={toggleDrawer}
                    icon={"cancel-icon"}
                    buttonName={"Cancel"}
                  />
                  <Button
                    id="Approval_Submit"
                    className="submit-button"
                    onClick={props.isShowNFRPopUp ? showPopupWrapper : submitButton}
                    disabled={isDisable || (props?.isDisableSubmit ? true : false)}
                    icon={"save-icon"}
                    buttonName={"Submit"}
                  />
                </div >
              </Row >
            </form >
          </div >
        </Container >
        {/* MINDA */}
        {/* {
          (showPopup && props.isShowNFRPopUp) && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`Do you want to push this vendor's costing to SAP for PFS2`} nfrPopup={true} />
        } */}
      </Drawer >
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

export default React.memo(ApproveRejectUI)
