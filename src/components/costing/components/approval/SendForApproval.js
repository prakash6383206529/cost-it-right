import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toastr } from 'react-redux-toastr'
import Drawer from '@material-ui/core/Drawer'
import { SearchableSelectHookForm, TextFieldHookForm, TextAreaHookForm, DatePickerHookForm, } from '../../../layout/HookFormInputs'
import { getReasonSelectList, getAllApprovalDepartment, getAllApprovalUserFilterByDepartment, sendForApprovalBySender, isFinalApprover, } from '../../actions/Approval'
import { getConfigurationKey, userDetails } from '../../../../helper/auth'
import { setCostingApprovalData, setCostingViewData, } from '../../actions/Costing'
import { getVolumeDataByPartAndYear } from '../../../masters/actions/Volume'

import { checkForDecimalAndNull, checkForNull, getPOPriceAfterDecimal } from '../../../../helper'
import moment from 'moment'
import WarningMessage from '../../../common/WarningMessage'
import { renderDatePicker } from '../../../layout/FormInputs'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { REASON_ID } from '../../../../config/constants'
import PushSection from '../../../common/PushSection'
import { debounce } from 'lodash'
import { data } from 'react-dom-factories'


const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]
const SendForApproval = (props) => {
  const dispatch = useDispatch()
  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, setError } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const reasonsList = useSelector((state) => state.approval.reasonsList)
  const deptList = useSelector((state) => state.approval.approvalDepartmentList)
  const viewApprovalData = useSelector((state) => state.costing.costingApprovalData)
  const SAPData = useSelector(state => state.approval.SAPObj)

  const partNo = useSelector((state) => state.costing.partNo)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const partInfo = useSelector((state) => state.costing.partInfo)

  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedApprover, setSelectedApprover] = useState('')
  const [selectedApproverLevelId, setSelectedApproverLevelId] = useState('')
  const [financialYear, setFinancialYear] = useState('')
  const [approvalDropDown, setApprovalDropDown] = useState([])
  const [showValidation, setShowValidation] = useState(false)
  const [showErrorMsg, setShowErrorMsg] = useState(false)
  const [isFinalApproverShow, setIsFinalApproverShow] = useState(false)
  const [approver, setApprover] = useState('')
  const [dataToPush, setDataToPush] = useState({})
  // const [showDate,setDate] = useState(false)
  const userData = userDetails()

  useEffect(() => {
    let obj = {}
    obj.TechnologyId = partInfo.TechnologyId
    obj.DepartmentId = '00000000-0000-0000-0000-000000000000'
    obj.LoggedInUserLevelId = userDetails().LoggedInLevelId
    obj.LoggedInUserId = userDetails().LoggedInUserId

    dispatch(isFinalApprover(obj, res => {
      if (res.data.Result) {
        setIsFinalApproverShow(res.data.Data.IsFinalApprovar) // UNCOMMENT IT AFTER DEPLOTED FROM KAMAL SIR END
        // setIsFinalApproverShow(false)
      }

      dispatch(getReasonSelectList((res) => { }))
      if (!res.data.Data.IsFinalApprovar) {

        dispatch(getAllApprovalDepartment((res) => {
          const Data = res.data.SelectList
          const departObj = Data && Data.filter(item => item.Value === userData.DepartmentId)

          setSelectedDepartment({ label: departObj[0].Text, value: departObj[0].Value })
          setValue('dept', { label: departObj[0].Text, value: departObj[0].Value })

          let tempDropdownList = []

          dispatch(
            getAllApprovalUserFilterByDepartment({
              LoggedInUserId: userData.LoggedInUserId,
              DepartmentId: departObj[0].Value,
              TechnologyId: partNo.technologyId,
              ReasonId: 0 // key only for minda
            }, (res) => {
              if (res.data.DataList.length === 1) {
                setShowValidation(true)
                return false
              }
              const Data = res.data.DataList[1]

              setApprover(Data.Text)
              setSelectedApprover(Data.Value)
              setSelectedApproverLevelId({ levelName: Data.LevelName, levelId: Data.LevelId })
              setValue('approver', { label: Data.Text, value: Data.Value })
            },
            ),
          )
        }))
      }

    }))
  }, [])
  useEffect(() => {

  }, [viewApprovalData])
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
      dispatch(
        getAllApprovalUserFilterByDepartment({
          LoggedInUserId: userData.LoggedInUserId,
          DepartmentId: newValue.value,
          TechnologyId: partNo.technologyId,
        }, (res) => {
          if (res.data.DataList.length <= 1) {
            setShowValidation(true)
          }
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
        },
        ),
      )
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
   * @method handleECNNoChange
   * @param {*} data
   * @param {*} index
   * @description This method is used to handle change in ECN number for every costing
   */
  const handleECNNoChange = (data, index) => {
    let viewDataTemp = viewApprovalData
    let temp = viewApprovalData[index]
    temp.ecNo = data
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

    dispatch(
      getVolumeDataByPartAndYear(partNo.value ? partNo.value : partNo.partId, year, (res) => {
        if (res.data.Result === true || res.status === 202) {
          let approvedQtyArr = res.data.Data.VolumeApprovedDetails
          let budgetedQtyArr = res.data.Data.VolumeBudgetedDetails
          let actualQty = 0
          let totalBudgetedQty = 0
          let actualRemQty = 0

          approvedQtyArr.map((data) => {
            if (data.Sequence < sequence) {
              // if(data.Date <= moment(effectiveDate).format('dd/MM/YYYY')){ 
              //   actualQty += parseInt(data.ApprovedQuantity)
              // }
              actualQty += parseInt(data.ApprovedQuantity)
            } else if (data.Sequence >= sequence) {
              actualRemQty += parseInt(data.ApprovedQuantity)
            }
          })
          budgetedQtyArr.map((data) => {
            // if (data.Sequence >= sequence) {
            totalBudgetedQty += parseInt(data.BudgetedQuantity)
            // }
          })
          temp.consumptionQty = checkForNull(actualQty)
          temp.remainingQty = checkForNull(totalBudgetedQty - actualQty)
          temp.annualImpact = temp.variance != '' ? totalBudgetedQty * temp.variance : 0
          temp.yearImpact = temp.variance != '' ? (totalBudgetedQty - actualQty) * temp.variance : 0
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
      if (item.effectiveDate == '') {
        count = count + 1
      }
    })
    if (count != 0) {
      toastr.warning('Please select effective date for all the costing')
      return
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
    }

    let temp = []
    let tempObj = {}
    let plantCount = 0
    let venderCount = 0

    viewApprovalData.forEach((element, index, arr) => {
      if (element.plantId !== '-') {
        if (index > 0) {
          if (element.plantId === arr[index - 1].plantId) {
            plantCount = plantCount + 1
          } else {
            return false
          }
        } else {
          return false
        }
      }
      else if (element.vendorId !== '-') {
        if (index > 0) {

          if (element.vendorId === arr[index - 1].vendorId) {
            venderCount = venderCount + 1
          } else {
            return false
          }
        } else {
          return false
        }
      }
    });

    if (viewApprovalData.length > 1) {

      if (plantCount > 0) {
        return toastr.warning('Costings with same plant cannot be sent for approval')
      }
      if (venderCount > 0) {
        return toastr.warning('Costings with same vendor cannot be sent for approval')
      }
    }

    viewApprovalData.map((data) => {
      // const { netPo, quantity } = getPOPriceAfterDecimal(SAPData.DecimalOption.value, data.revisedPrice)
      let tempObj = {}
      tempObj.ApprovalProcessId = "00000000-0000-0000-0000-000000000000"
      tempObj.TypeOfCosting = data.typeOfCosting === 0 ? 'ZBC' : 'VBC'
      tempObj.PlantId =
        data.typeOfCosting == 0 ? data.plantId : ''
      tempObj.PlantNumber =
        data.typeOfCosting == 0 ? data.plantCode : ''
      tempObj.PlantName =
        data.typeOfCosting == 0 ? data.plantName : ''
      tempObj.PlantCode =
        data.typeOfCosting == 0 ? data.plantCode : ''
      tempObj.CostingId = data.costingId
      tempObj.CostingNumber = data.costingName
      tempObj.ReasonId = data.reasonId
      tempObj.Reason = data.reason
      tempObj.ECNNumber = ''
      // tempObj.ECNNumber = 1;
      tempObj.EffectiveDate = moment(data.effectiveDate).local().format('YYYY-MM-DD')
      tempObj.RevisionNumber = partNo.revisionNumber
      tempObj.PartName = partNo.partName
      // tempObj.PartName = "Compressor"; // set data for this is in costing summary,will come here
      tempObj.PartNumber = partNo.partNumber //label
      tempObj.PartId = partNo.partId
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
        data.typeOfCosting == 1 ? data.vendorId : ''
      tempObj.VendorCode =
        data.typeOfCosting == 1 ? data.vendorCode : ''
      tempObj.VendorPlantId =
        data.typeOfCosting == 1 ? data.vendorePlantId : ''
      tempObj.VendorPlantCode =
        data.typeOfCosting == 1 ? data.vendorPlantCode : ''
      tempObj.VendorName =
        data.typeOfCosting == 1 ? data.vendorName : ''
      tempObj.VendorPlantName =
        data.typeOfCosting == 1 ? data.vendorPlantName : ''
      tempObj.IsFinalApproved = isFinalApproverShow ? true : false
      tempObj.DestinationPlantCode = data.destinationPlantCode
      tempObj.DestinationPlantName = data.destinationPlantName
      tempObj.DestinationPlantId = data.destinationPlantId
      temp.push(tempObj)
    })

    obj.CostingsList = temp
    obj.PurchasingGroup = SAPData.PurchasingGroup?.label
    obj.MaterialGroup = SAPData.MaterialGroup?.label
    obj.DecimalOption = SAPData.DecimalOption?.value

    // debounce_fun()
    // console.log("After debounce");
    // props.closeDrawer()
    // dispatch(
    //   sendForApprovalBySender(obj, (res) => {
    //     toastr.success(viewApprovalData.length === 1 ? `Costing ID ${viewApprovalData[0].costingName} has been sent for approval to ${approver.split('(')[0]}.` : `Costings has been sent for approval to ${approver.split('(')[0]}.`)
    //     props.closeDrawer('', 'Submit')
    //     dispatch(setCostingApprovalData([]))
    //     dispatch(setCostingViewData([]))
    //   }),
    // )
  }), 500)



  const handleApproverChange = (data) => {
    setApprover(data.label)
    setSelectedApprover(data.value)
    setSelectedApproverLevelId({ levelName: data.levelName, levelId: data.levelId })
  }

  useEffect(() => { }, [viewApprovalData])

  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    dispatch(setCostingApprovalData([]))
    props.closeDrawer('', 'Cancel')
  }
  const reasonField = 'reasonField'
  const dateField = 'dateField'

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
                          {data.typeOfCosting === 0 ? 'ZBC' : `${data.vendorName}`}
                        </h6>
                        <div className=" d-inline-block mr-4">
                          {`Part No.:`}{" "}
                          <span className="grey-text">{`${partNo.partNumber}`}</span>
                        </div>
                        <div className=" d-inline-block mr-4">
                          {data.typeOfCosting === 0 ? `Plant Code:` : `Vendor Code`}{" "}
                          <span className="grey-text">{data.typeOfCosting === 0 ? `${data.plantCode}` : `${data.vendorCode}`}</span>
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
                              placeholder={"-Select-"}
                              Controller={Controller}
                              control={control}
                              rules={{ required: true }}
                              register={register}
                              defaultValue={data.reason != "" ? { label: data.reason, value: data.reasonId } : ""}
                              options={renderDropdownListing("Reason")}
                              mandatory={true}
                              handleChange={(e) => {
                                handleReasonChange(e, index);
                              }}
                              errors={errors && errors.reasonFieldreason && errors.reasonFieldreason !== undefined ? errors.reasonFieldreason[index] : ""}
                            // errors={`${errors}.${reasonField}[${index}]reason`}

                            />
                          </Col>
                          {/* <Col md="4">
                            <TextFieldHookForm
                              label="ECN Ref No"
                              name={"encNumber"}
                              Controller={Controller}
                              control={control}
                              register={register}
                              rules={{ required: false }}
                              mandatory={false}
                              handleChange={(e) => {
                                handleECNNoChange(e.target.value, index);
                              }}
                              defaultValue={data.ecnNo != "" ? data.ecnNo : ""}
                              className=""
                              customClassName={"withBorder"}
                              errors={errors.encNumber}
                            // disabled={true}
                            />
                          </Col> */}
                          <Col md="4">
                            {/* <div className="form-group"> */}
                            <div className="d-flex">
                              <div className="inputbox date-section">
                                {
                                  data.isDate ?
                                    <div className={'form-group inputbox withBorder'}>
                                      <label>Effective Date</label>
                                      <DatePicker
                                        selected={moment(data.effectiveDate).isValid ? moment(data.effectiveDate)._d : ''}
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
                                      selected={data.effectiveDate != "" ? moment(data.effectiveDate).format('DD/MM/YYYY') : ""}
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
                              <label className={data.oldPrice === 0 ? `form-control bg-grey input-form-control` : `form-control bg-grey input-form-control ${data.variance < 0 ? 'green-value' : 'red-value'}`}>
                                {data.variance ? checkForDecimalAndNull(data.variance, initialConfiguration.NoOfDecimalForPrice) : 0}
                              </label>
                            </div>
                          </Col>

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
                          <PushSection />
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
                            placeholder={"-Select-"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={""}
                            options={renderDropdownListing("Dept")}
                            disabled={true}
                            mandatory={false}
                            handleChange={handleDepartmentChange}
                            errors={errors.dept}
                          />
                        </Col>
                        <Col md="6">
                          <SearchableSelectHookForm
                            label={"Approver"}
                            name={"approver"}
                            placeholder={"-Select-"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: false }}
                            register={register}
                            defaultValue={""}
                            options={approvalDropDown}
                            mandatory={false}
                            disabled={true}
                            handleChange={handleApproverChange}
                            errors={errors.approver}
                          />
                        </Col>
                        {
                          showValidation && <span className="warning-top"><WarningMessage dClass="pl-3" message={'There is no approver added in this department'} /></span>
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

                    <button
                      className="btn btn-primary save-btn"
                      type="button"
                      // className="submit-button save-btn"
                      onClick={onSubmit}
                    >
                      <div className={'save-icon'}></div>
                      {"Submit"}
                    </button>
                  </Col>
                </Row>
              </form>
            </div>
          </div>
        </div>
      </Drawer>
    </Fragment>
  );
}

export default SendForApproval
