import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Table, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'
import { toastr } from 'react-redux-toastr'
import { useHistory } from 'react-router-dom'
import Drawer from '@material-ui/core/Drawer'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
  TextAreaHookForm,
} from '../../../layout/HookFormInputs'
import {
  getReasonSelectList,
  getAllApprovalDepartment,
  getAllApprovalUserByDepartment,
  getAllApprovalUserFilterByDepartment,
  sendForApprovalBySender,
} from '../../actions/Approval'
import { userDetails } from '../../../../helper/auth'
import {
  setCostingApprovalData,
  setCostingViewData,
  storePartNumber,
} from '../../actions/Costing'
import { getVolumeDataByPartAndYear } from '../../../masters/actions/Volume'
import 'react-datepicker/dist/react-datepicker.css'

const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]
const SendForApproval = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    errors,
  } = useForm()
  const reasonsList = useSelector((state) => state.approval.reasonsList)
  const deptList = useSelector((state) => state.approval.approvalDepartmentList)
  const usersList = useSelector((state) => state.approval.approvalUsersList)
  const viewApprovalData = useSelector(
    (state) => state.costing.costingApprovalData,
  )

  const partNo = useSelector((state) => state.costing.partNo)

  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedApprover, setSelectedApprover] = useState('')
  const [selectedApproverLevelId, setSelectedApproverLevelId] = useState('')
  const [financialYear, setFinancialYear] = useState('')
  const [approvalDropDown, setApprovalDropDown] = useState([])
  const userData = userDetails()

  useEffect(() => {
    dispatch(getReasonSelectList((res) => { }))
    dispatch(getAllApprovalDepartment((res) => { }))
  }, [])

  /**
   * @method renderDropdownListing
   * @description Used show listing of unit of measurement
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
    // if (label === 'Approver') {
    //     usersList && usersList.map(item => {
    //         console.log(item,"Item");
    //         // if (item.Value === '0') return false;
    //         tempDropdownList.push({ label: item.Text, value: item.Value })
    //         return null;
    //     });
    //     return tempDropdownList;
    // }
  }

  /**
   * @method handleDepartmentChange
   * @description  USED TO HANDLE DEPARTMENT CHANGE
   */
  const handleDepartmentChange = (newValue) => {
    const tempDropdownList = []
    if (newValue && newValue !== '') {
      // dispatch(getAllApprovalUserByDepartment({ // add approval api here
      dispatch(
        getAllApprovalUserFilterByDepartment(
          {
            LoggedInUserId: userData.LoggedInUserId,
            DepartmentId: newValue.value,
            TechnologyId: partNo.technologyId,
          },
          (res) => {
            res.data.DataList &&
              res.data.DataList.map((item) => {
                //if (item.Value === '0') return false;
                tempDropdownList.push({
                  label: item.Text,
                  value: item.Value,
                  levelId: item.LevelId,
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
    // dispatch(getVolumeDataByPartAndYear(partNo.label, year, res => { //change when kamal sir map and give data.
    dispatch(
      getVolumeDataByPartAndYear(partNo.label, year, (res) => {
        //getVolumeDataByPartAndYear('WISHER', year, (res) => {
        if (res.data.Result === true || res.status === 202) {
          let approvedQtyArr = res.data.Data.VolumeApprovedDetails
          let budgetedQtyArr = res.data.Data.VolumeBudgetedDetails
          let actualQty = 0
          let budgetedRemQty = 0
          let actualRemQty = 0
          approvedQtyArr.map((data) => {
            if (data.Sequence < sequence) {
              actualQty += parseInt(data.ApprovedQuantity)
            } else if (data.Sequence >= sequence) {
              actualRemQty += parseInt(data.ApprovedQuantity)
            }
          })
          budgetedQtyArr.map((data) => {
            if (data.Sequence >= sequence) {
              budgetedRemQty += parseInt(data.BudgetedQuantity)
            }
          })
          temp.consumptionQty = actualQty
          temp.remainingQty = budgetedRemQty - actualRemQty
          temp.annualImpact =
            temp.variance != ''
              ? (actualQty + (budgetedRemQty - actualRemQty)) *
              parseInt(temp.variance)
              : ''
          temp.yearImpact =
            temp.variance != ''
              ? (budgetedRemQty - actualRemQty) * parseInt(temp.variance)
              : ''

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
  const onSubmit = (data) => {
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
      ApproverLevelId: selectedApproverLevelId,
      ApproverId: selectedApprover,
      // ApproverLevelId: "4645EC79-B8C0-49E5-98D6-6779A8F69692", // approval dropdown data here
      // ApproverId: "566E7AB0-804F-403F-AE7F-E7B15A289362",// approval dropdown data here
      SenderLevelId: userData.LoggedInLevelId,
      SenderLevelName: userData.LoggedInLevel,
      SenderId: userData.LoggedInUserId,
      SenderRemark: data.remarks,
      LoggedInUserId: userData.LoggedInUserId,
    }
    let temp = []
    let tempObj = {}

    viewApprovalData.map((data) => {
      tempObj.TypeOfCosting = data.typeOfCosting
      tempObj.PlantId =
        data.typeOfCosting.toLowerCase() == 'zbc' ? data.plantId : ''
      tempObj.PlantNumber =
        data.typeOfCosting.toLowerCase() == 'zbc' ? data.plantCode : ''
      tempObj.PlantName =
        data.typeOfCosting.toLowerCase() == 'zbc' ? data.plantName : ''
      tempObj.PlantCode =
        data.typeOfCosting.toLowerCase() == 'zbc' ? data.plantCode : ''
      tempObj.CostingId = data.costingId
      tempObj.CostingNumber = data.costingName
      tempObj.ReasonId = data.reasonId
      tempObj.Reason = data.reason
      tempObj.ECNNumber = data.ecnNo
      // tempObj.ECNNumber = 1;
      tempObj.EffectiveDate = data.effectiveDate
      tempObj.RevisionNumber = partNo.revisionNumber
      tempObj.PartName = partNo.partName
      // tempObj.PartName = "Compressor"; // set data for this is in costing summary,will come here
      tempObj.PartNumber = partNo.partNumber //label
      tempObj.PartId = partNo.partId
      // tempObj.PartNumber = "CP021220";// set data for this is in costing summary,will come here
      tempObj.FinancialYear = financialYear
      tempObj.OldPOPrice = data.oldPrice
      tempObj.NewPoPrice = data.revisedPrice
      tempObj.Variance = data.variance
      tempObj.ConsumptionQuantity = data.consumptionQty
      tempObj.RemainingQuantity = data.remainingQty
      tempObj.AnnualImpact = data.annualImpact
      tempObj.ImpactOfTheYear = data.yearImpact
      tempObj.VendorId =
        data.typeOfCosting.toLowerCase() == 'vbc' ? data.vendorId : ''
      tempObj.VendorCode =
        data.typeOfCosting.toLowerCase() == 'vbc' ? data.vendoreCode : ''
      tempObj.VendorPlantId =
        data.typeOfCosting.toLowerCase() == 'vbc' ? data.vendorePlantId : ''
      tempObj.VendorPlantCode =
        data.typeOfCosting.toLowerCase() == 'vbc' ? data.vendorPlantCode : ''
      tempObj.VendorName =
        data.typeOfCosting.toLowerCase() == 'vbc' ? data.vendorName : ''
      tempObj.VendorPlantName =
        data.typeOfCosting.toLowerCase() == 'vbc' ? data.vendorPlantName : ''
      tempObj.IsFinalApproved = false
      temp.push(tempObj)
    })

    obj.CostingsList = temp
    console.log('obj: ', obj)

    dispatch(
      sendForApprovalBySender(obj, (res) => {
        toastr.success('Data is sent for approval!')
        history.push('/costing')
        dispatch(setCostingApprovalData([]))
        dispatch(setCostingViewData([]))
      }),
    )
  }

  const handleApproverChange = (data) => {
    console.log(data, "DATAAAAAAAAAAA");
    setSelectedApprover(data.value)
    setSelectedApproverLevelId(data.levelId)
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
    props.closeDrawer('')
  }
  return (
    <Fragment>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        onClose={(e) => toggleDrawer(e)}
      >
        <div className={"drawer-wrapper drawer-md"}>
          <Row className="drawer-heading mx-0">
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
                <div className="pl-3 pr-3">
                  <Row className="px-3">
                    <Col md="12">
                      <h6 className="left-border d-inline-block mr-3">
                        {data.typeOfCosting}
                      </h6>
                      <div className="text-small d-inline-block mr-3">
                        {`Plant Code:`}{" "}
                        <span className="small-grey-text">{`${data.plantCode}`}</span>
                      </div>
                      <div className="text-small d-inline-block">
                        {`Costing Id:`}{" "}
                        <span className="small-grey-text">{`${data.costingName}`}</span>
                      </div>
                    </Col>
                  </Row>
                  <div className="px-3">
                    <div className="border-box border p-3 mb-4">
                      <Row>
                        <Col md="4">
                          <SearchableSelectHookForm
                            label={"Reason"}
                            name={"reason"}
                            placeholder={"-Select-"}
                            Controller={Controller}
                            control={control}
                            rules={{ required: true }}
                            register={register}
                            defaultValue={data.reason != "" ? data.reason : ""}
                            options={renderDropdownListing("Reason")}
                            mandatory={true}
                            handleChange={(e) => {
                              handleReasonChange(e, index);
                            }}
                            errors={errors.reason}
                          />
                        </Col>
                        <Col md="4">
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
                        </Col>
                        <Col md="4">
                          <div className="form-group">
                            <label>Effective Date</label>
                            <div className="d-flex">
                              <div className="inputbox date-section">
                                <DatePicker
                                  name="EffectiveDate"
                                  selected={
                                    data.effectiveDate != ""
                                      ? data.effectiveDate
                                      : ""
                                  }
                                  onChange={(date) => {
                                    handleEffectiveDateChange(date, index);
                                  }}
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
                                  disabled={false}
                                  required={true}
                                />
                              </div>
                              <i className="fa fa-calendar icon-small-primary ml-2"></i>
                            </div>
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="4">
                          <label>Old/Current Price</label>
                          <label className="form-control bg-grey">
                            {data.oldPrice ? data.oldPrice : "-"}
                          </label>
                        </Col>
                        <Col md="4">
                          <label>Revised Price</label>
                          <label className="form-control bg-grey">
                            {data.revisedPrice ? data.revisedPrice : "-"}
                          </label>
                        </Col>
                        <Col md="4">
                          <label>Variance</label>
                          <label className="form-control bg-grey">
                            {data.variance ? data.variance : "-"}
                          </label>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="4">
                          <label>Consumpion Quantity</label>
                          <div className="d-flex align-items-center">
                            <label className="form-control bg-grey">
                              {data.consumptionQty ? data.consumptionQty : "-"}
                            </label>
                            <div class="plus-icon-square  right m-0 mb-1"></div>
                          </div>
                        </Col>
                        <Col md="4">
                          <label>Remaining Quantity</label>
                          <label className="form-control bg-grey">
                            {data.remainingQty !== "" ? data.remainingQty : "-"}
                          </label>
                        </Col>
                        <Col md="4">
                          <label>Annual Impact</label>
                          <label className="form-control bg-grey">
                            {data.annualImpact ? data.annualImpact : "-"}
                          </label>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="4">
                          <label>Impact for the Year</label>
                          <label className="form-control bg-grey">
                            {data.yearImpact ? data.yearImpact : "-"}
                          </label>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="pl-3 pr-3">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Row className="px-3">
              <Col md="4">
                <div className="left-border">{"Approver"}</div>
              </Col>
            </Row>
            <Row className="px-3">
              <Col md="6">
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
                  // mandatory={true}
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
                  register={register}
                  defaultValue={""}
                  options={approvalDropDown}
                  mandatory={false}
                  handleChange={handleApproverChange}
                  errors={errors.approver}
                />

              </Col>
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
                  <div className={"cross-icon"}>
                    <img
                      src={require("../../../../assests/images/times.png")}
                      alt="cancel-icon.jpg"
                    />
                  </div>{" "}
                  {"Clear"}
                </button>

                <button
                  className="btn btn-primary save-btn"
                  type="submit"
                // className="submit-button save-btn"
                // onClick={() => handleSubmit(onSubmit)}
                >
                  <div className={"check-icon"}>
                    <img
                      src={require("../../../../assests/images/check.png")}
                      alt="check-icon.jpg"
                    />{" "}
                  </div>
                  {"Submit"}
                </button>
              </Col>
            </Row>
          </form>
        </div>
      </Drawer>
    </Fragment>
  );
}

export default SendForApproval
