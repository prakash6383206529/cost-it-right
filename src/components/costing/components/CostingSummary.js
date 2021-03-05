import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col } from 'reactstrap'
import DatePicker from 'react-datepicker'
import { toastr } from 'react-redux-toastr'
import moment from 'moment'
import { getCostingTechnologySelectList, getAllPartSelectList, getPartInfo, checkPartWithTechnology, storePartNumber, getCostingSummaryByplantIdPartNo, setCostingViewData, getSingleCostingDetails, } from '../actions/Costing'
import { TextFieldHookForm, SearchableSelectHookForm, } from '../../layout/HookFormInputs'
import 'react-datepicker/dist/react-datepicker.css'
import { VIEW_COSTING_DATA } from '../../../config/constants'
import { formViewData } from '../../../helper'

function CostingSummary() {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    errors,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  /* Dropdown cosntant*/
  const [technology, setTechnology] = useState([])

  const [IsTechnologySelected, setIsTechnologySelected] = useState(false)
  const [part, setPart] = useState([])
  const [effectiveDate, setEffectiveDate] = useState('')

  const fieldValues = useWatch({ control })

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getCostingTechnologySelectList(() => { }))
    dispatch(getAllPartSelectList(() => { }))
    dispatch(getPartInfo('', () => { }))
  }, [])

  const technologySelectList = useSelector(
    (state) => state.costing.technologySelectList,
  )
  const partSelectList = useSelector((state) => state.costing.partSelectList)

  const partInfo = useSelector((state) => state.costing.partInfo)
  const viewCostingData = useSelector(
    (state) => state.costing.viewCostingDetailData,
  )

  /**
   * @method renderDropdownListing
   * @description Used show listing of unit of measurement
   */
  const renderDropdownListing = (label) => {
    const tempDropdownList = []

    if (label === 'Technology') {
      technologySelectList &&
        technologySelectList.map((item) => {
          if (item.Value === '0') return false
          tempDropdownList.push({ label: item.Text, value: item.Value })
          return null
        })
      return tempDropdownList
    }

    if (label === 'PartList') {
      partSelectList &&
        partSelectList.map((item) => {
          if (item.Value === '0') return false
          tempDropdownList.push({ label: item.Text, value: item.Value })
          return null
        })
      return tempDropdownList
    }
  }

  /**
   * @method handleTechnologyChange
   * @description  USED TO HANDLE TECHNOLOGY CHANGE
   */
  const handleTechnologyChange = (newValue) => {
    dispatch(storePartNumber(''))
    if (newValue && newValue !== '') {
      dispatch(getPartInfo('', () => { }))
      setTechnology(newValue)
      setPart([])
      setIsTechnologySelected(true)
      dispatch(getPartInfo('', () => { }))
      setEffectiveDate('')
      reset({
        Part: '',
      })
    } else {
      setTechnology([])
      setIsTechnologySelected(false)
    }
  }

  /**
   * @method handlePartChange
   * @description  USED TO HANDLE PART CHANGE
   */
  const handlePartChange = (newValue) => {
    let temp = []
    temp = viewCostingData
    // if (viewCostingData.length == 0 || part.value == newValue.value || part.value != newValue.value) {
    //   console.log("From iffff")
    //   temp.push(VIEW_COSTING_DATA)
    // }
    // else if (viewCostingData.length >= 1) {
    //   console.log("From elseeeee")
    //   temp = viewCostingData
    // }
    // else if(part != newValue)

    if (newValue && newValue !== '') {
      if (IsTechnologySelected) {
        const data = { TechnologyId: technology.value, PartId: newValue.value }

        dispatch(
          checkPartWithTechnology(data, (response) => {
            setPart(newValue)
            if (response.data.Result) {
              dispatch(
                getPartInfo(newValue.value, (res) => {
                  let Data = res.data.Data
                  setValue('PartName', Data.PartName)
                  setValue('Description', Data.Description)
                  setValue('ECNNumber', Data.ECNNumber)
                  setValue('DrawingNumber', Data.DrawingNumber)
                  setValue('RevisionNumber', Data.RevisionNumber)
                  setValue('ShareOfBusiness', Data.Price)
                  setEffectiveDate(moment(Data.EffectiveDate)._d)
                  newValue.revisionNumber = Data.RevisionNumber
                  newValue.technologyId = technology.value
                  newValue.technologyName = technology.label
                  newValue.partName = Data.PartName
                  newValue.partNumber = newValue.label
                  newValue.partId = newValue.value
                  dispatch(storePartNumber(newValue))
                  dispatch(
                    getCostingSummaryByplantIdPartNo(
                      newValue.label,
                      '00000000-0000-0000-0000-000000000000',
                      (res) => {
                        if (res.data.Result == true) {
                          dispatch(getSingleCostingDetails(res.data.Data.CostingId,
                            (res) => {
                              // dispatch(getSingleCostingDetails('5cdcad92-277f-48e2-8eb2-7a7c838104e1', res => {
                              if (res.data.Data) {
                                let dataFromAPI = res.data.Data
                                const tempObj = formViewData(dataFromAPI)
                                dispatch(setCostingViewData(tempObj))
                                // let obj = {};
                                // obj.zbc = dataFromAPI.TypeOfCosting;
                                // obj.poPrice = dataFromAPI.NetPOPrice;
                                // obj.costingName = dataFromAPI.CostingNumber
                                // obj.status = dataFromAPI.CostingStatus
                                // obj.rm = dataFromAPI.CostingPartDetails[0].CostingRawMaterialsCost[0].RMName
                                // obj.gWeight = dataFromAPI.CostingPartDetails[0].CostingRawMaterialsCost[0].WeightCalculatorRequest.GrossWeight
                                // obj.fWeight = dataFromAPI.CostingPartDetails[0].CostingRawMaterialsCost[0].WeightCalculatorRequest.FinishWeight
                                // obj.netRM = dataFromAPI.NetRawMaterialsCost
                                // obj.netBOP = dataFromAPI.NetBoughtOutPartCost
                                // obj.pCost = dataFromAPI.NetProcessCost
                                // obj.oCost = dataFromAPI.NetOperationCost
                                // obj.sTreatment = dataFromAPI.NetSurfaceTreatmentCost
                                // obj.tCost = dataFromAPI.CostingPartDetails[0].TransportationCost
                                // obj.nConvCost = dataFromAPI.NetConversionCost
                                // obj.modelType = dataFromAPI.ModelType
                                // obj.aValue = {
                                //   applicability: "Applicability",
                                //   value: "Value"
                                // }
                                // obj.overheadOn = {
                                //   overheadTitle: dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadApplicability,
                                //   overheadValue: (dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadCCTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadCCTotalCost) : 0) + (dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadBOPTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadBOPTotalCost) : 0) + (dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadRMTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadRMTotalCost) : 0) + (dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadFixedTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingOverheadDetail.OverheadFixedTotalCost) : 0)
                                // }
                                // obj.profitOn = {
                                //   profitTitle: dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitApplicability,
                                //   profitValue: (dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitCCTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitCCTotalCost) : 0) + (dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitBOPTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitBOPTotalCost) : 0) + (dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitRMTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitRMTotalCost) : 0) + (dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitFixedTotalCost ? parseInt(dataFromAPI.CostingPartDetails[0].CostingProfitDetail.ProfitFixedTotalCost) : 0)
                                // }
                                // obj.rejectionOn = {
                                //   rejectionTitle: dataFromAPI.CostingPartDetails[0].CostingRejectionDetail.RejectionApplicability,
                                //   rejectionValue: dataFromAPI.CostingPartDetails[0].CostingRejectionDetail.RejectionTotalCost
                                // }
                                // obj.iccOn = {
                                //   iccTitle: dataFromAPI.CostingPartDetails[0].CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability,
                                //   iccValue: dataFromAPI.CostingPartDetails[0].CostingInterestRateDetail.ICCApplicabilityDetail.NetCost
                                // }
                                // obj.paymentTerms = {
                                //   paymentTitle: dataFromAPI.CostingPartDetails[0].CostingInterestRateDetail.PaymentTermDetail.PaymentTermApplicability,
                                //   paymentValue: dataFromAPI.CostingPartDetails[0].CostingInterestRateDetail.PaymentTermDetail.NetCost
                                // }
                                // obj.nOverheadProfit = dataFromAPI.NetOverheadAndProfitCost
                                // obj.packagingCost = dataFromAPI.CostingPartDetails[0].PackagingNetCost
                                // obj.freight = dataFromAPI.CostingPartDetails[0].FreightNetCost
                                // obj.nPackagingAndFreight = dataFromAPI.NetPackagingAndFreight
                                // obj.toolMaintenanceCost = dataFromAPI.CostingPartDetails[0].OverAllApplicability.ToolMaintenanceCost ? dataFromAPI.CostingPartDetails[0].OverAllApplicability.ToolMaintenanceCost : '-'
                                // obj.toolPrice = dataFromAPI.CostingPartDetails[0].OverAllApplicability.ToolCost ? dataFromAPI.CostingPartDetails[0].OverAllApplicability.ToolCost : '-'
                                // obj.amortizationQty = dataFromAPI.CostingPartDetails[0].OverAllApplicability.Life ? dataFromAPI.CostingPartDetails[0].OverAllApplicability.Life : '-'
                                // obj.totalToolCost = dataFromAPI.NetToolCost
                                // obj.totalCost = dataFromAPI.TotalCost
                                // obj.otherDiscount = {
                                //   discount: "Discount %",
                                //   value: "Value"
                                // }
                                // obj.otherDiscountValue = {
                                //   discountPercentValue: dataFromAPI.CostingPartDetails[0].OtherCostDetails.HundiOrDiscountPercentage ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.HundiOrDiscountPercentage : "-",
                                //   discountValue: dataFromAPI.CostingPartDetails[0].OtherCostDetails.HundiOrDiscountValue ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.HundiOrDiscountValue : "-"
                                // }
                                // obj.anyOtherCost = dataFromAPI.CostingPartDetails[0].OtherCostDetails.TotalOtherCost ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.TotalOtherCost : "-"
                                // obj.remark = dataFromAPI.CostingPartDetails[0].OtherCostDetails.Remark ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.Remark : "-"
                                // obj.nPOPriceWithCurrency = dataFromAPI.CostingPartDetails[0].OtherCostDetails.NetPOPriceOtherCurrency ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.NetPOPriceOtherCurrency : "-"
                                // obj.currency = {
                                //   currencyTitle: dataFromAPI.CostingPartDetails[0].OtherCostDetails.Currency,
                                //   currencyValue: dataFromAPI.CostingPartDetails[0].OtherCostDetails.IsChangeCurrency ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.CurrencyValue : "-"
                                // }
                                // obj.nPOPrice = dataFromAPI.CostingPartDetails[0].OtherCostDetails.NetPOPriceINR ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.NetPOPriceINR : "-"
                                // // obj.attachment = "Attachment";
                                // obj.attachment = dataFromAPI.Attachements;
                                // obj.approvalButton = ""
                                // //RM
                                // obj.netRMCostView = dataFromAPI.CostingPartDetails[0].CostingRawMaterialsCost
                                // //BOP Cost
                                // obj.netBOPCostView =
                                //   dataFromAPI.CostingPartDetails[0].CostingBoughtOutPartCost
                                // //COnversion Cost
                                // obj.netConversionCostView =
                                //   dataFromAPI.CostingPartDetails[0].CostingConversionCost
                                // //OverheadCost and Profit
                                // obj.netOverheadCostView =
                                //   dataFromAPI.CostingPartDetails[0].CostingOverheadDetail
                                // obj.netProfitCostView =
                                //   dataFromAPI.CostingPartDetails[0].CostingProfitDetail
                                // // Rejection
                                // obj.netRejectionCostView =
                                //     dataFromAPI.CostingPartDetails[0].CostingRejectionDetail

                                // //Net Packaging and Freight
                                // obj.netPackagingCostView =
                                //   dataFromAPI.CostingPartDetails[0].CostingPackagingDetail
                                // obj.netFreightCostView =
                                //   dataFromAPI.CostingPartDetails[0].CostingFreightDetail
                                // //Tool Cost
                                // obj.netToolCostView =
                                //   dataFromAPI.CostingPartDetails[0].CostingToolsCostResponse
                                // //For Drawer Edit
                                // obj.partId = dataFromAPI.PartNumber;
                                // obj.plantId = dataFromAPI.PlantId;
                                // obj.plantName = dataFromAPI.PlantName;
                                // obj.plantCode = dataFromAPI.PlantCode;
                                // obj.vendorId = dataFromAPI.VendorId;
                                // obj.vendorName = dataFromAPI.VendorName;
                                // obj.vendorCode = dataFromAPI.VendorCode;
                                // obj.vendorPlantId = dataFromAPI.VendorPlantId;
                                // obj.vendorPlantName = dataFromAPI.VendorPlantName;
                                // obj.vendorPlantCode = dataFromAPI.VendorPlantCode;
                                // obj.costingId = dataFromAPI.CostingId
                                // obj.oldPoPrice = dataFromAPI.OldPOPrice;
                                // // obj.technology = technology
                                // console.log('obj: ', obj);

                                // temp.push(obj);
                              }
                            },
                          ),
                          )
                        } else {
                          dispatch(setCostingViewData(temp))
                        }
                      },
                    ),
                  )
                }),
              )
            } else {
              dispatch(getPartInfo('', () => { }))
              setValue('PartName', '')
              setValue('Description', '')
              setValue('ECNNumber', '')
              setValue('DrawingNumber', '')
              setValue('RevisionNumber', '')
              setValue('ShareOfBusiness', '')
              setEffectiveDate('')
              dispatch(setCostingViewData([]))
            }
          }),
        )
      }
    } else {
      setPart([])
      dispatch(getPartInfo('', () => { }))
    }
  }

  /**
   * @method handleEffectiveDateChange
   * @description Handle Effective Date
   */
  const handleEffectiveDateChange = (date) => {
    setEffectiveDate(date)
  }

  /**
   * @method checkForError
   * @description HANDLE COSTING VERSION SELECTED
   */
  const checkForError = (index, type) => {
    if (errors && (errors.zbcPlantGridFields || errors.vbcGridFields)) {
      return false
    } else {
      return true
    }
  }

  /**
   * @method warningMessageHandle
   * @description VIEW COSTING DETAILS IN READ ONLY MODE
   */
  const warningMessageHandle = (warningType) => {
    switch (warningType) {
      case 'SOB_WARNING':
        toastr.warning('SOB Should not be greater than 100.')
        break
      case 'COSTING_VERSION_WARNING':
        toastr.warning('Please select a costing version.')
        break
      case 'VALID_NUMBER_WARNING':
        toastr.warning('Please enter a valid number.')
        break
      case 'ERROR_WARNING':
        toastr.warning('Please enter a valid number.')
        break
      default:
        break
    }
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  // const onSubmit = (values) => {

  // }

  return (
    <>
      <div className="login-container signup-form">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">
              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(() => { })}
              >
                {
                  <>
                    <Row>
                      <Col md="12" className="mt-3">
                        <div className="left-border">{'Part Details:'}</div>
                      </Col>

                      <Col className="col-md-15">
                        <SearchableSelectHookForm
                          label={'Technology'}
                          name={'Technology'}
                          placeholder={'Select'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={
                            technology.length !== 0 ? technology : ''
                          }
                          options={renderDropdownListing('Technology')}
                          mandatory={true}
                          handleChange={handleTechnologyChange}
                          errors={errors.Technology}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <SearchableSelectHookForm
                          label={'Assembly No./Part No.'}
                          name={'Part'}
                          placeholder={'Select'}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={part.length !== 0 ? part : ''}
                          options={renderDropdownListing('PartList')}
                          mandatory={true}
                          handleChange={handlePartChange}
                          errors={errors.Part}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Assembly Name/Part Name"
                          name={'PartName'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{
                            required: false,
                          }}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.PartName}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Assembly/Part Description"
                          name={'Description'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          rules={{ required: false }}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.Description}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="ECO No."
                          name={'ECNNumber'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.ECNNumber}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Drawing No."
                          name={'DrawingNumber'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.DrawingNumber}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Revision No."
                          name={'RevisionNumber'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.RevisionNumber}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <TextFieldHookForm
                          label="Price(Approved SOB)"
                          name={'ShareOfBusiness'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.ShareOfBusiness}
                          disabled={true}
                        />
                      </Col>

                      <Col className="col-md-15">
                        <div className="form-group">
                          <label>Effective Date</label>
                          <div className="inputbox date-section">
                            <DatePicker
                              name="EffectiveDate"
                              selected={effectiveDate}
                              onChange={handleEffectiveDateChange}
                              showMonthDropdown
                              showYearDropdown
                              dateFormat="dd/MM/yyyy"
                              //maxDate={new Date()}
                              dropdownMode="select"
                              placeholderText="Select date"
                              className="withBorder"
                              autoComplete={'off'}
                              disabledKeyboardNavigation
                              onChangeRaw={(e) => e.preventDefault()}
                              disabled={true}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </>
                }
              </form>
            </div>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default CostingSummary
