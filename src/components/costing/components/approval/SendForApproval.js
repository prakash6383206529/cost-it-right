import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Toaster from '../../../common/Toaster'
import Drawer from '@material-ui/core/Drawer'
import { SearchableSelectHookForm, TextAreaHookForm, DatePickerHookForm, NumberFieldHookForm, } from '../../../layout/HookFormInputs'
import { getReasonSelectList, getAllApprovalDepartment, getAllApprovalUserFilterByDepartment, sendForApprovalBySender, isFinalApprover } from '../../actions/Approval'
import { getConfigurationKey, userDetails } from '../../../../helper/auth'
import { setCostingApprovalData, setCostingViewData, fileUploadCosting } from '../../actions/Costing'
import { getVolumeDataByPartAndYear, checkRegularizationLimit } from '../../../masters/actions/Volume'

import { calculatePercentageValue, checkForDecimalAndNull, checkForNull } from '../../../../helper'
import DayTime from '../../../common/DayTimeWrapper'
import WarningMessage from '../../../common/WarningMessage'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import PushSection from '../../../common/PushSection'
import { debounce } from 'lodash'
import Dropzone from 'react-dropzone-uploader'
import { FILE_URL, NCC, NCCTypeId, VBC, VBCTypeId, ZBC, ZBCTypeId } from "../../../../config/constants";
import redcrossImg from "../../../../assests/images/red-cross.png";
import VerifyImpactDrawer from '../../../simulation/components/VerifyImpactDrawer';
import PushSection from '../../../common/PushSection'
import LoaderCustom from '../../../common/LoaderCustom'
import TooltipCustom from '../../../common/Tooltip'


const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]
const SendForApproval = (props) => {
  const { isApprovalisting } = props
  const dispatch = useDispatch()
  const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const reasonsList = useSelector((state) => state.approval.reasonsList)
  const deptList = useSelector((state) => state.approval.approvalDepartmentList)
  const viewApprovalData = useSelector((state) => state.costing.costingApprovalData)
  const SAPData = useSelector(state => state.approval.SAPObj)


  const partNo = useSelector((state) => state.costing.partNo)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedApprover, setSelectedApprover] = useState('')
  const [selectedApproverLevelId, setSelectedApproverLevelId] = useState('')
  const [financialYear, setFinancialYear] = useState('')
  const [approvalDropDown, setApprovalDropDown] = useState([])
  const [showValidation, setShowValidation] = useState(false)
  const [isFinalApproverShow, setIsFinalApproverShow] = useState(false)
  const [approver, setApprover] = useState('')
  const [dataToPush, setDataToPush] = useState({})
  const [isDisable, setIsDisable] = useState('')
  const [isRegularize, setIsRegularize] = useState(false);
  const [files, setFiles] = useState([]);
  const [IsOpen, setIsOpen] = useState(false);
  const [isVerifyImpactDrawer, setIsVerifyImpactDrawer] = useState(false)
  const [costingApprovalDrawerData, setCostingApprovalDrawerData] = useState({})
  const [attachmentLoader, setAttachmentLoader] = useState(false)
  const [effectiveDate, setEffectiveDate] = useState('')
  const [dataToChange, setDataToChange] = useState([]);
  const [IsLimitCrossed, setIsLimitCrossed] = useState(false);
  // const [showDate,setDate] = useState(false)
  // const [showDate,setDate] = useState(false)
  const userData = userDetails()

  useEffect(() => {
    let obj = {}
    let regularizationObj = {}
    obj.TechnologyId = props.technologyId
    obj.DepartmentId = '00000000-0000-0000-0000-000000000000'
    obj.LoggedInUserLevelId = userDetails().LoggedInLevelId
    obj.LoggedInUserId = userDetails().LoggedInUserId
    let drawerDataObj = {}
    drawerDataObj.EffectiveDate = viewApprovalData[0]?.effectiveDate
    drawerDataObj.CostingHead = viewApprovalData[0].costingTypeId === ZBCTypeId ? ZBC : VBC
    drawerDataObj.Technology = props.technologyId
    setCostingApprovalDrawerData(drawerDataObj);

    regularizationObj.technologyId = viewApprovalData[0].technologyId
    regularizationObj.partId = viewApprovalData[0].partId
    regularizationObj.destinationPlantId = viewApprovalData[0].destinationPlantId
    regularizationObj.vendorId = viewApprovalData[0].vendorId

    dispatch(checkRegularizationLimit(regularizationObj, (res) => {
      if (res && res?.data && res?.data?.Data) {
        let Data = res.data.Data
        setDataToChange(Data)
      }
    }))
    dispatch(isFinalApprover(obj, res => {
      if (res.data.Result) {
        setIsFinalApproverShow(res.data.Data.IsFinalApprovar) // UNCOMMENT IT AFTER DEPLOTED FROM KAMAL SIR END
        // setIsFinalApproverShow(false)
      }

      dispatch(getReasonSelectList((res) => { }))
      if (!res.data.Data.IsFinalApprovar) {

        dispatch(getAllApprovalDepartment((res) => {
          const Data = res?.data?.SelectList
          const departObj = Data && Data.filter(item => item.Value === userData.DepartmentId)

          setSelectedDepartment({ label: departObj[0]?.Text, value: departObj[0]?.Value })
          setValue('dept', { label: departObj[0]?.Text, value: departObj[0]?.Value })

          let requestObject = {
            LoggedInUserId: userData.LoggedInUserId,
            DepartmentId: departObj[0]?.Value,
            TechnologyId: props.technologyId,
            ReasonId: 0 // key only for minda
          }
          dispatch(getAllApprovalUserFilterByDepartment(requestObject, (res) => {
            let tempDropdownList = []
            if (res.data.DataList.length === 1) {
              setShowValidation(true)
              return false
            }
            res.data.DataList && res.data.DataList.map((item) => {
              if (item.Value === '0') return false;
              tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
              return null
            })
            const Data = res.data.DataList[1]
            setApprover(Data.Text)
            setSelectedApprover(Data.Value)
            setSelectedApproverLevelId({ levelName: Data.LevelName, levelId: Data.LevelId })
            setValue('approver', { label: Data.Text, value: Data.Value })
            setApprovalDropDown(tempDropdownList)
          }))
        }))
      }

    }))

  }, [])
  /**
   * @method renderDropdownListing
   * @description DROPDOWN
   */
  const renderDropdownListing = (label) => {
    const tempDropdownList = []

    if (label === 'Reason') {
      reasonsList &&
        reasonsList.map((item) => {
          if (item.Value === '0') return false
          tempDropdownList.push({ label: item.Text, value: item.Value })
          return null
        })
      return tempDropdownList
    }

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

  /**
   * @method handleDepartmentChange
   * @description  USED TO HANDLE DEPARTMENT CHANGE
   */
  const handleDepartmentChange = (newValue) => {
    const tempDropdownList = []
    if (newValue && newValue !== '') {
      setValue('approver', '')
      setSelectedApprover('')
      setShowValidation(false)
      let requestObject = {
        LoggedInUserId: userData.LoggedInUserId,
        DepartmentId: newValue.value,
        TechnologyId: props.technologyId,
      }
      dispatch(getAllApprovalUserFilterByDepartment(requestObject, (res) => {
        if (res.data.DataList.length <= 1) {
          setShowValidation(true)
        }
        res.data.DataList && res.data.DataList.map((item) => {
          if (item.Value === '0') return false;
          tempDropdownList.push({ label: item.Text, value: item.Value, levelId: item.LevelId, levelName: item.LevelName })
          return null
        })
        setApprovalDropDown(tempDropdownList)
      }))
      setSelectedDepartment(newValue)
    } else {
      setSelectedDepartment('')
    }
  }

  /**
   * @method handleReasonChange
   * @param {*} data
   * @param {*} index
   * @description This method is used to handle change of reason for every costing
   */
  const handleReasonChange = (data, index) => {


    let viewDataTemp = viewApprovalData
    let temp = viewApprovalData[index]
    temp.reason = data.label
    temp.reasonId = data.value
    viewDataTemp[index] = temp

    dispatch(setCostingApprovalData(viewDataTemp))
  }



  /**
   * @method handleEffectiveDateChange
   * @param {*} date
   * @param {*} index
   * @description This method is used to handle change of date and calculate consumption and remaining quantity and other details
   */
  const handleEffectiveDateChange = (date, index) => {
    let viewDataTemp = viewApprovalData
    let temp = viewApprovalData[index]
    temp.effectiveDate = date
    let month = date.getMonth()
    let year = ''
    let sequence = SEQUENCE_OF_MONTH[month]

    if (month <= 2) {
      year = `${date.getFullYear() - 1}-${date.getFullYear()}`
    } else {
      year = `${date.getFullYear()}-${date.getFullYear() + 1}`
    }
    setFinancialYear(year)

    dispatch(getVolumeDataByPartAndYear(partNo.value ? partNo.value : partNo.partId, year, (res) => {
      if (res.data.Result === true || res.status === 202) {
        let approvedQtyArr = res.data.Data.VolumeApprovedDetails
        let budgetedQtyArr = res.data.Data.VolumeBudgetedDetails
        let actualQty = 0
        let totalBudgetedQty = 0
        let actualRemQty = 0
        approvedQtyArr.map((data) => {
          if (data.Sequence < sequence) {
            actualQty += parseInt(data.ApprovedQuantity)
          } else if (data.Sequence >= sequence) {
            actualRemQty += parseInt(data.ApprovedQuantity)
          }
          return null
        })
        budgetedQtyArr.map((data) => (

          // if (data.Sequence >= sequence) {
          totalBudgetedQty += parseInt(data.BudgetedQuantity)
          // }
        ))
        temp.consumptionQty = checkForNull(actualQty)
        temp.remainingQty = checkForNull(totalBudgetedQty - actualQty)
        temp.annualImpact = temp.variance !== '' ? totalBudgetedQty * temp.variance : 0
        temp.yearImpact = temp.variance !== '' ? (totalBudgetedQty - actualQty) * temp.variance : 0
        viewDataTemp[index] = temp
        dispatch(setCostingApprovalData(viewDataTemp))
      }

    }),
    )
  }





  /**
   * @method onSubmit
   * @param {*} data
   * @description This method is called on the submission of the form for send for approval
   */



  const onSubmit = debounce(handleSubmit((data) => {
    let count = 0
    viewApprovalData.map((item) => {
      if (item.effectiveDate === '') {
        count = count + 1
      }
      return null
    })
    if (Number(count) !== 0) {
      Toaster.warning('Please select effective date for all the costing')
      return false
    }
    if (isRegularize && files?.length === 0) {
      Toaster.warning('Please upload file to send for approval.')
      return false
    }
    let obj = {
      ApproverDepartmentId: selectedDepartment.value,
      ApproverDepartmentName: selectedDepartment.label,
      ApproverLevelId: !isFinalApproverShow ? selectedApproverLevelId.levelId : userData.LoggedInLevelId,
      ApproverLevel: !isFinalApproverShow ? selectedApproverLevelId.levelName : userData.LoggedInLevel,
      ApproverId: !isFinalApproverShow ? selectedApprover : userData.LoggedInUserId,

      // ApproverLevelId: "4645EC79-B8C0-49E5-98D6-6779A8F69692", // approval dropdown data here
      // ApproverId: "566E7AB0-804F-403F-AE7F-E7B15A289362",// approval dropdown data here
      SenderLevelId: userData.LoggedInLevelId,
      SenderLevel: userData.LoggedInLevel,
      SenderId: userData.LoggedInUserId,
      SenderRemark: data.remarks,
      LoggedInUserId: userData.LoggedInUserId,
      // Quantity: getValues('Quantity'),
      // Attachment: files,
      // IsLimitCrossed: IsLimitCrossed
    }

    let temp = []

    setIsDisable(true)

    viewApprovalData.map((data) => {
      // const { netPo, quantity } = getPOPriceAfterDecimal(SAPData.DecimalOption.value, data.revisedPrice)
      let tempObj = {}
      tempObj.ApprovalProcessId = "00000000-0000-0000-0000-000000000000"
      tempObj.TypeOfCosting = (data.typeOfCosting === 0 || data.typeOfCosting === ZBC) ? ZBC : VBC
      tempObj.PlantId =
        (data.costingTypeId === ZBCTypeId) ? data.plantId : ''
      tempObj.PlantNumber =
        (data.costingTypeId === ZBCTypeId) ? data.plantCode : ''
      tempObj.PlantName =
        (data.costingTypeId === ZBCTypeId) ? data.plantName : ''
      tempObj.PlantCode =
        (data.costingTypeId === ZBCTypeId) ? data.plantCode : ''
      tempObj.CostingId = data.costingId
      tempObj.CostingNumber = data.costingName
      tempObj.ReasonId = data.reasonId
      tempObj.Reason = data.reason
      tempObj.ECNNumber = ''
      // tempObj.ECNNumber = 1;
      tempObj.EffectiveDate = DayTime(data.effectiveDate).format('YYYY-MM-DD')
      tempObj.RevisionNumber = partNo.revisionNumber
      tempObj.PartName = isApprovalisting ? data.partName : partNo.partName
      // tempObj.PartName = "Compressor"; // set data for this is in costing summary,will come here
      tempObj.PartNumber = isApprovalisting ? data.partNo : partNo.partNumber //label
      tempObj.PartId = isApprovalisting ? data.partId : partNo.partId
      // tempObj.PartNumber = "CP021220";// set data for this is in costing summary,will come here
      tempObj.FinancialYear = financialYear
      tempObj.OldPOPrice = data.oldPrice
      // tempObj.Quantity = quantity
      // tempObj.NewPoPrice = netPo // here price condition on the basis of Decimal option dropdown (Specifically in Minda)
      tempObj.NewPoPrice = data.revisedPrice
      tempObj.POCurrency = data.nPOPriceWithCurrency
      tempObj.CurrencyRate = data.currencyRate
      tempObj.Variance = data.variance
      tempObj.ConsumptionQuantity = data.consumptionQty
      tempObj.RemainingQuantity = data.remainingQty
      tempObj.AnnualImpact = data.annualImpact
      tempObj.ImpactOfTheYear = data.yearImpact
      tempObj.VendorId =
        (data.costingTypeId === VBCTypeId) ? data.vendorId : ''
      tempObj.VendorCode =
        (data.costingTypeId === VBCTypeId) ? data.vendorCode : ''
      tempObj.VendorPlantId =
        (data.costingTypeId === VBCTypeId) ? data.vendorePlantId : ''
      tempObj.VendorPlantCode =
        (data.costingTypeId === VBCTypeId) ? data.vendorPlantCode : ''
      tempObj.VendorName =
        (data.costingTypeId === VBCTypeId) ? data.vendorName : ''
      tempObj.VendorPlantName =
        (data.costingTypeId === VBCTypeId) ? data.vendorPlantName : ''
      tempObj.IsFinalApproved = isFinalApproverShow ? true : false
      tempObj.DestinationPlantCode = data.destinationPlantCode
      tempObj.DestinationPlantName = data.destinationPlantName
      tempObj.DestinationPlantId = data.destinationPlantId
      tempObj.NCCPartQuantity = getValues('Quantity')
      tempObj.Attachment = files
      tempObj.IsRegularized = isRegularize
      tempObj.IsRegularizationLimitCrossed = IsLimitCrossed
      tempObj.CostingTypeId = data.costingTypeId
      tempObj.CustomerId = data.customerId
      tempObj.CustomerName = data.customerName
      tempObj.CustomerCode = data.customerCode
      temp.push(tempObj)
      return null
    })

    obj.CostingsList = temp
    obj.MaterialGroup = SAPData.MaterialGroup?.label
    obj.DecimalOption = SAPData.DecimalOption?.value


    // debounce_fun()
    // 
    // props.closeDrawer()
    dispatch(sendForApprovalBySender(obj, (res) => {
      setIsDisable(false)
      Toaster.success(viewApprovalData.length === 1 ? `Costing ID ${viewApprovalData[0].costingName} has been sent for approval to ${approver.split('(')[0]}.` : `Costings has been sent for approval to ${approver.split('(')[0]}.`)
      props.closeDrawer('', 'Submit')
      dispatch(setCostingApprovalData([]))
      dispatch(setCostingViewData([]))
    }))
  }), 500)



  const handleApproverChange = (data) => {
    setApprover(data.label)
    setSelectedApprover(data.value)
    setSelectedApproverLevelId({ levelName: data.levelName, levelId: data.levelId })
  }

  const checkQuantityLimitValue = (value, isRegularizeValue) => {
    let limit;
    if (dataToChange?.QuantityUsed === 0) {
      limit = dataToChange?.RegularizationLimit + calculatePercentageValue(dataToChange?.RegularizationLimit, dataToChange?.MaxDeviationLimitPercent)
    } else {
      limit = dataToChange?.QuantityUsed
    }

    if (!isRegularizeValue) {

      if ((value <= limit)) {

        if ((value >= dataToChange?.RegularizationLimit) && (value <= limit)) {
          setIsLimitCrossed(true)
        } else {
          setIsLimitCrossed(false)
        }
      } else {
        setTimeout(() => {
          setValue('Quantity', 0)
        }, 200);
        setIsLimitCrossed(false)
        Toaster.warning('Quantity should be less than Max Deviation Limit')
        return false
      }


    } else {
      if ((value >= dataToChange?.RegularizationLimit)) {
        setIsLimitCrossed(true)
      } else {
        setIsLimitCrossed(false)
      }
    }
  }

  const handleChangeQuantity = (e) => {
    checkQuantityLimitValue(e?.target?.value, isRegularize)
  };

  useEffect(() => {
    viewApprovalData && viewApprovalData.map(item => setEffectiveDate(item.effectiveDate !== "" ? DayTime(item.effectiveDate).format('DD/MM/YYYY') : ""))
  }, [viewApprovalData])

  const toggleDrawer = (event) => {
    if (isDisable) {
      return false
    }
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    dispatch(setCostingApprovalData([]))
    props.closeDrawer('', 'Cancel')
  }

  // called every time a file's `status` changes
  const handleChangeStatus = ({ meta, file }, status) => {
    setAttachmentLoader(true)
    if (status === "removed") {
      const removedFileName = file.name;
      let tempArr =
        files &&
        files.filter((item) => item.OriginalFileName !== removedFileName);
      setFiles(tempArr);
      setIsOpen(!IsOpen);
    }

    if (status === "done") {
      let data = new FormData();
      data.append("file", file);
      dispatch(fileUploadCosting(data, (res) => {
        let Data = res.data[0];
        files.push(Data);
        setFiles(files);
        setIsOpen(!IsOpen);
        setAttachmentLoader(false)
      }));
    }

    if (status === "rejected_file_type") {
      Toaster.warning("Allowed only xls, doc, jpeg, pdf files.");
    }
  };
  const viewImpactDrawer = () => {
    setIsVerifyImpactDrawer(true)
  }
  const deleteFile = (FileId, OriginalFileName) => {
    if (FileId != null) {

      // dispatch(
      //   fileDeleteCosting(deleteData, (res) => {
      //     Toaster.success("File deleted successfully.");
      //     let tempArr = files && files.filter((item) => item.FileId !== FileId);
      //     setFiles(tempArr);
      //     setIsOpen(!IsOpen);
      //   })
      // );
    }
    if (FileId == null) {
      let tempArr =
        files && files.filter((item) => item.FileName !== OriginalFileName);
      setFiles(tempArr);
      setAttachmentLoader(false)
      setIsOpen(!IsOpen);
    }
  };

  const Preview = ({ meta }) => {
    return (
      <span
        style={{
          alignSelf: "flex-start",
          margin: "10px 3%",
          fontFamily: "Helvetica",
        }}
      >
        {/* {Math.round(percent)}% */}
      </span>
    );
  };
  const checkboxHandler = () => {
    if (isRegularize === false) {
      Toaster.warning("Please upload files");
    }
    setIsRegularize(!isRegularize);
    checkQuantityLimitValue(getValues('Quantity'), !isRegularize)
  };

  const reasonField = 'reasonField'
  const dateField = 'dateField'

  const verifyImpactDrawer = (e = '', type) => {
    if (type === 'cancel') {
      setIsVerifyImpactDrawer(false);
    }
  }

  return (
    <Fragment>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      ><div className="container">
          <div className={"drawer-wrapper drawer-md"}>
            <Row className="drawer-heading ">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>{"Send for Approval"}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  disabled={isDisable}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>
            {viewApprovalData &&
              viewApprovalData.map((data, index) => {

                return (
                  <div className="" key={index}>
                    <Row className="px-3">
                      <Col md="12">
                        <h6 className="left-border d-inline-block mr-4">
                          {(data.costingTypeId === ZBCTypeId) ? ZBC : (data.costingTypeId === VBCTypeId || data.costingTypeId === NCCTypeId) ? `${data.vendorName}` : `${data.customerName}`}
                        </h6>
                        <div className=" d-inline-block mr-4">
                          {`Part No:`}{" "}
                          <span className="grey-text">{`${isApprovalisting ? data.partNo : partNo.partNumber}`}</span>
                        </div>
                        <div className=" d-inline-block mr-4">
                          {(data.costingTypeId === ZBCTypeId) ? `Plant Code:` : (data.costingTypeId === VBCTypeId || data.costingTypeId === NCCTypeId) ? `Vendor Code` : `Customer Code`}
                          <span className="grey-text">{(data.costingTypeId === ZBCTypeId) ? `${data.plantCode}` : (data.costingTypeId === VBCTypeId || data.costingTypeId === NCCTypeId) ? `${data.vendorCode}` : `${data.customerCode}`}</span>
                        </div>
                        <div className=" d-inline-block">
                          {`Costing Id:`}{" "}
                          <span className="grey-text">{`${data.costingName}`}</span>
                        </div>

                      </Col>
                    </Row>
                    <div className="px-3">
                      <div className="border-box border p-3 mb-4">
                        <Row>
                          <Col md="4">
                            <SearchableSelectHookForm
                              label={"Reason"}
                              // name={"reason"}
                              name={`${reasonField}reason[${index}]`}
                              placeholder={"Select"}
                              Controller={Controller}
                              control={control}
                              rules={{ required: true }}
                              register={register}
                              defaultValue={data.reason !== "" ? { label: data.reason, value: data.reasonId } : ""}
                              options={renderDropdownListing("Reason")}
                              mandatory={true}
                              handleChange={(e) => {
                                handleReasonChange(e, index);
                              }}
                              errors={errors && errors.reasonFieldreason && errors.reasonFieldreason !== undefined ? errors.reasonFieldreason[index] : ""}
                            // errors={`${errors}.${reasonField}[${index}]reason`}

                            />
                          </Col>

                          <Col md="4">
                            <div className="d-flex">
                              <div className="inputbox date-section">
                                {
                                  data.isDate ?
                                    <div className={'form-group inputbox withBorder'}>
                                      <label>Effective Date</label>
                                      <DatePicker
                                        selected={DayTime(data.effectiveDate).isValid() ? new Date(data.effectiveDate) : ''}
                                        dateFormat="dd/MM/yyyy"
                                        showMonthDropdown
                                        showYearDropdown
                                        readonly="readonly"
                                        onBlur={() => null}
                                        autoComplete={'off'}
                                        disabledKeyboardNavigation
                                        disabled={true}
                                      />
                                    </div>
                                    :

                                    <DatePickerHookForm
                                      name={`${dateField}EffectiveDate.${index}`}
                                      label={'Effective Date'}
                                      selected={data.effectiveDate !== "" ? DayTime(data.effectiveDate).format('DD/MM/YYYY') : ""}
                                      handleChange={(date) => {
                                        handleEffectiveDateChange(date, index);
                                      }}
                                      //defaultValue={data.effectiveDate != "" ? moment(data.effectiveDate).format('DD/MM/YYYY') : ""}
                                      rules={{ required: true }}
                                      Controller={Controller}
                                      control={control}
                                      register={register}
                                      showMonthDropdown
                                      showYearDropdown
                                      dateFormat="DD/MM/YYYY"
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
                                      errors={errors && errors.dateFieldEffectiveDate && errors.dateFieldEffectiveDate !== undefined ? errors.dateFieldEffectiveDate[index] : ""}
                                    />
                                }
                              </div>
                              {/* <i className="fa fa-calendar icon-small-primary ml-2"></i> */}
                            </div>
                            {/* </div> */}
                          </Col>

                          <Col md="4">
                            <div className="form-group">
                              <label>Old/Current Price</label>
                              <label className="form-control bg-grey input-form-control">
                                {data.oldPrice && data.oldPrice !== '-' ? checkForDecimalAndNull(data.oldPrice, initialConfiguration.NoOfDecimalForPrice) : 0}
                              </label>
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="form-group">
                              <label>Revised Price</label>
                              <label className="form-control bg-grey input-form-control">
                                {data.revisedPrice ? checkForDecimalAndNull(data.revisedPrice, initialConfiguration.NoOfDecimalForPrice) : 0}
                              </label>
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="form-group">
                              <label>Variance</label>
                              <label className={data.oldPrice === 0 ? `form-control bg-grey input-form-control` : `form-control bg-grey input-form-control ${data.variance < 0 ? 'red-value' : 'green-value'}`}>
                                {data.variance ? checkForDecimalAndNull(data.variance, initialConfiguration.NoOfDecimalForPrice) : 0}
                              </label>
                            </div>
                          </Col>

                          {viewApprovalData && viewApprovalData[0]?.CostingHead !== NCC && <>
                            <Col md="4">
                              <div className="form-group">
                                <label>Consumed Quantity</label>
                                <div className="d-flex align-items-center">
                                  <label className="form-control bg-grey input-form-control">
                                    {checkForDecimalAndNull(data.consumptionQty, initialConfiguration.NoOfDecimalForPrice)}
                                  </label>
                                  {/* <div class="plus-icon-square  right m-0 mb-1"></div> */}
                                </div>
                              </div>
                            </Col>
                            <Col md="4">
                              <div className="form-group">
                                <label>Remaining Budgeted Quantity</label>
                                <label className="form-control bg-grey input-form-control">
                                  {data.remainingQty && data.remainingQty !== "" ? checkForDecimalAndNull(data.remainingQty, initialConfiguration.NoOfDecimalForPrice) : 0}
                                </label>
                              </div>
                            </Col>
                            <Col md="4">
                              <div className="form-group">
                                <TooltipCustom tooltipText={`The current impact is calculated based on the data present in the volume master (${data.effectiveDate !== "" ? DayTime(data.effectiveDate).format('DD/MM/YYYY') : ""}).`} />
                                <label>Annual Impact</label>
                                <label className={data.oldPrice === 0 ? `form-control bg-grey input-form-control` : `form-control bg-grey input-form-control ${data.annualImpact < 0 ? 'green-value' : 'red-value'}`}>
                                  {data.annualImpact && data.annualImpact ? checkForDecimalAndNull(data.annualImpact, initialConfiguration.NoOfDecimalForPrice) : 0}
                                </label>
                              </div>
                            </Col>

                            <Col md="4">
                              <div className="form-group">
                                <label>Impact for the Year</label>
                                <label className={data.oldPrice === 0 ? `form-control bg-grey input-form-control` : `form-control bg-grey input-form-control ${data.yearImpact < 0 ? 'green-value' : 'red-value'}`}>
                                  {data.yearImpact && data.yearImpact ? checkForDecimalAndNull(data.yearImpact, initialConfiguration.NoOfDecimalForPrice) : 0}
                                </label>
                              </div>
                            </Col>
                          </>}
                        </Row>
                      </div>
                    </div>
                  </div>
                );
              })}
            <div className="">
              <form >
                {
                  isFinalApproverShow === false ?
                    <>
                      <Row className="px-3">
                        <Col md="12">
                          <div className="left-border">{"SAP-Push Details"}</div>
                        </Col>
                        <div className="w-100">
                          <PushSection
                            Controller={Controller}
                            register={register}
                            errors={errors}
                            control={control}


                          />
                        </div>
                      </Row>
                      <Row className="px-3">
                        <Col md="4">
                          <div className="left-border">{"Approver"}</div>
                        </Col>
                      </Row>
                      <Row className="px-3">
                        <Col md="6">
                          <SearchableSelectHookForm
                            label={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}
                            name={"dept"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={""}
                            options={renderDropdownListing("Dept")}
                            disabled={userData.Department.length > 1 ? false : true}
                            mandatory={false}
                            handleChange={handleDepartmentChange}
                            errors={errors.dept}
                          />
                        </Col>
                        <Col md="6">
                          <SearchableSelectHookForm
                            label={"Approver"}
                            name={"approver"}
                            placeholder={"Select"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={""}
                            options={approvalDropDown}
                            mandatory={false}
                            disabled={userData.Department.length > 1 ? false : true}
                            handleChange={handleApproverChange}
                            errors={errors.approver}
                          />
                        </Col>
                        {
                          showValidation && <span className="warning-top"><WarningMessage dClass="pl-3" message={'There is no approver added in this department'} /></span>
                        }

                        {viewApprovalData && viewApprovalData[0]?.costingTypeId === NCCTypeId && <><Col md="6">
                          <NumberFieldHookForm
                            label="Quantity"
                            name={"Quantity"}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{ required: true }}
                            defaultValue={""}
                            className=""
                            customClassName={"withBorder"}
                            handleChange={handleChangeQuantity}
                            errors={errors.Quantity}
                            disabled={false}
                          />
                        </Col>
                          <Col md="6" className="d-flex align-items-center mb-2">
                            <span className="d-inline-block">
                              <label
                                className={`custom-checkbox mb-0`}
                                onChange={checkboxHandler}>
                                Regularize
                                <input
                                  type="checkbox"
                                />
                                <span
                                  className=" before-box"
                                  onChange={checkboxHandler}
                                />
                              </label>
                            </span>
                          </Col>
                        </>
                        }
                        <Col md="12">
                          <TextAreaHookForm
                            label="Remarks"
                            name={"remarks"}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            handleChange={() => { }}
                            defaultValue={""}
                            className=""
                            customClassName={"withBorder"}
                            errors={errors.remarks}
                            disabled={false}
                          />
                        </Col>
                      </Row>
                    </> :
                    <Row className="px-3">
                      <Col md="12">
                        <TextAreaHookForm
                          label="Remarks"
                          name={"remarks"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.remarks}
                          disabled={false}
                        />
                      </Col>
                    </Row>

                }
                {isRegularize ? (
                  <Row className="mb-4 mx-0">
                    <Col md="6" className="height152-label">
                      <label>Upload Attachment (upload up to 4 files)</label>
                      {files && files.length >= 4 ? (
                        <div class="alert alert-danger" role="alert">
                          Maximum file upload limit reached.
                        </div>
                      ) : (
                        <Dropzone
                          onChangeStatus={handleChangeStatus}
                          PreviewComponent={Preview}
                          mandatory={true}
                          //onSubmit={this.handleSubmit}
                          accept="*"
                          initialFiles={[]}
                          maxFiles={4}
                          maxSizeBytes={2000000000}
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
                        // disabled={CostingViewMode ? true : false}
                        />
                      )}
                    </Col>
                    <Col md="6" className='pr-0'>
                      <div className={"attachment-wrapper"}>
                        {attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                        {files &&
                          files.map((f) => {
                            const withOutTild = f.FileURL.replace("~", "");
                            const fileURL = `${FILE_URL}${withOutTild}`;
                            return (
                              <div className={"attachment images"}>
                                <a href={fileURL} target="_blank" rel="noreferrer">
                                  {f.OriginalFileName}
                                </a>
                                <img
                                  alt={""}
                                  className="float-right"
                                  onClick={() =>
                                    deleteFile(f.FileId, f.FileName)
                                  }
                                  src={redcrossImg}
                                ></img>
                              </div>
                            );
                          })}
                      </div>
                    </Col>
                  </Row>
                ) : null}
                <Row>
                  <Col md="12" className='text-right my-n1'>
                    <WarningMessage message={"All impacted assemblies will be changed and new versions will be formed"} />
                  </Col>
                </Row>
                <Row className="mb-4">
                  <Col
                    md="12"
                    className="d-flex justify-content-end align-items-center"
                  >
                    <button
                      className="cancel-btn mr-2"
                      type={"button"}
                      onClick={toggleDrawer}
                    // className="reset mr15 cancel-btn"
                    >
                      <div className={'cancel-icon'}></div>
                      {"Cancel"}
                    </button>
                    {viewApprovalData && viewApprovalData[0]?.costingTypeId !== NCCTypeId && <button type="button" className="user-btn mr5 save-btn" onClick={viewImpactDrawer}>
                      <div className={"save-icon"}></div>
                      {"Verify Impact"}
                    </button>
                    }
                    <button
                      className="btn btn-primary save-btn"
                      type="button"
                      // className="submit-button save-btn"
                      disabled={(isDisable || isFinalApproverShow)}
                      onClick={onSubmit}
                    >
                      <div className={'save-icon'}></div>
                      {"Submit"}
                    </button>
                  </Col>
                </Row>
              </form>
            </div>
            {isVerifyImpactDrawer &&
              <VerifyImpactDrawer
                isOpen={isVerifyImpactDrawer}
                approvalData={[]}
                costingDrawer={true}
                anchor={'bottom'}
                closeDrawer={verifyImpactDrawer}
                isSimulation={false}
                amendmentDetails={costingApprovalDrawerData}
                vendorIdState={viewApprovalData[0].vendorId}
                EffectiveDate={DayTime(viewApprovalData[0].effectiveDate).format('YYYY-MM-DD HH:mm:ss')}
                TypeOfCosting={viewApprovalData[0].typeOfCosting}
              />}
          </div>
        </div>

      </Drawer>

    </Fragment>
  );
}

export default SendForApproval
