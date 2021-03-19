import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'

import { getPlantSelectListByType, getVendorWithVendorCodeSelectList, getPlantBySupplier, } from '../../../actions/Common'
import { getClientSelectList } from '../../masters/actions/Client'
import {
  getCostingByVendorAndVendorPlant,
  getCostingSummaryByplantIdPartNo,
  getSingleCostingDetails,
  setCostingViewData,
} from '../actions/Costing'

import {
  SearchableSelectHookForm,
  RadioHookForm,
} from '../../layout/HookFormInputs'

import { ZBC, VBC, VIEW_COSTING_DATA } from '../../../config/constants'
import { toastr } from 'react-redux-toastr'
import { isUserLoggedIn } from '../../../helper/auth'

function AddToComparisonDrawer(props) {
  const loggedIn = isUserLoggedIn()
  console.log(loggedIn, 'Logged in')
  const { editObject, isEditFlag } = props
  console.log(editObject, 'Edit object')
  const {
    partId,
    plantId,
    plantName,
    costingId,
    CostingNumber,
    index,
    typeOfCosting,
  } = editObject
  const { register, handleSubmit, control, setValue, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      comparisonValue: isEditFlag ? typeOfCosting : 'ZBC',
      plant: isEditFlag ? { label: plantName, value: plantId } : '',
      costings: isEditFlag ? { label: CostingNumber, value: costingId } : '',
    },
  })
  const fieldValues = useWatch({ control, name: ['comparisonValue', 'plant'] })
  console.log(fieldValues, 'fv')
  const dispatch = useDispatch()

  /* DropDown constants */
  const [plantDropDownList, setPlantDropDownList] = useState([])
  const [vendorDropDownList, setVendorDropDownList] = useState([])
  const [vendorPlantDropdown, setvendorPlantDropdown] = useState([])
  const [clientDropdown, setclientDropdown] = useState([])
  const [costingDropdown, setCostingDropdown] = useState([])

  const [vendorId, setVendorId] = useState([])

  /* constant for form value */
  const [plantValue, setPlantValue] = useState('')
  const [vendorValue, setVendorValue] = useState('')
  const [vendorPlant, setVendorPlant] = useState('')
  const [cbcValue, setCbcValue] = useState('')

  /* constant for checkbox rendering condition */
  const [isZbcSelected, setIsZbcSelected] = useState(false)
  const [isVbcSelected, setIsVbcSelected] = useState(false)
  const [isCbcSelected, setisCbcSelected] = useState(false)

  /* For vendor dropdown */
  const vendorSelectList = useSelector(
    (state) => state.comman.vendorWithVendorCodeSelectList,
  )
  const viewCostingData = useSelector(
    (state) => state.costing.viewCostingDetailData,
  )
  /* For getting part no for costing dropdown */
  const partNo = useSelector((state) => state.costing.partNo)
  /* For getting default value of check box */
  useEffect(() => {
    const temp = []
    dispatch(
      getPlantSelectListByType(ZBC, (res) => {
        res.data.SelectList.map((item) => {
          if (item.Value === '0' || plantDropDownList.includes(item.Value))
            return false
          temp.push({ label: item.Text, value: item.Value })
        })
        setPlantDropDownList(temp)
        setIsZbcSelected(true)
        setIsVbcSelected(false)
        setisCbcSelected(false)
      }),
    )
  }, [])

  /* for showing vendor name dropdown */
  useEffect(() => {
    const temp = []
    setIsZbcSelected(false)
    setIsVbcSelected(true)
    setisCbcSelected(false)
    vendorSelectList &&
      vendorSelectList.map((vendor) => {
        if (vendor.Value === '0' || vendorDropDownList.includes(vendor.Value))
          return false
        temp.push({ label: vendor.Text, value: vendor.Value })
      })
    setVendorDropDownList(temp)
  }, [vendorSelectList])

  /**
   * @method toggleDrawer
   * @description closing drawer
   */
  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }

  /**
   * @method handleComparison
   * @description for handling rendering for different checkbox
   */
  const handleComparison = (value) => {
    setValue('comparisonValue', value)
    const temp = []
    if (value === 'ZBC') {
      dispatch(
        getPlantSelectListByType(ZBC, (res) => {
          console.log(res, 'Plant response')
          res.data.SelectList.map((item) => {
            if (item.Value === '0' || plantDropDownList.includes(item.Value))
              return false
            temp.push({ label: item.Text, value: item.Value })
          })
          setPlantDropDownList(temp)
          setIsZbcSelected(true)
          setIsVbcSelected(false)
          setisCbcSelected(false)
        }),
      )
    } else if (value === 'VBC') {
      setCostingDropdown([])
      setValue('costings', '')
      dispatch(getVendorWithVendorCodeSelectList(() => { }))
    } else if (value === 'CBC') {
      setCostingDropdown([])
      dispatch(
        getClientSelectList((res) => {
          res.data.SelectList &&
            res.data.SelectList.map((client) => {
              if (client.Value === '0' || clientDropdown.includes(client.Value))
                return false
              temp.push({ label: client.Text, value: client.Value })
            })
          setclientDropdown(temp)
          setisCbcSelected(true)
          setIsZbcSelected(false)
          setIsVbcSelected(false)
        }),
      )
    }
  }

  /**
   * @method handleVendorChange
   * @description showing vendor plant by vendor name
   */
  const handleVendorChange = ({ value }) => {
    const temp = []
    setVendorId(value)
    if (loggedIn) {
      dispatch(
        getPlantBySupplier(value, (res) => {
          res.data.SelectList &&
            res.data.SelectList.map((plant) => {
              if (
                plant.Value === '0' ||
                vendorPlantDropdown.includes(plant.Value)
              )
                return false
              temp.push({ label: plant.Text, value: plant.Value })
            })
          setvendorPlantDropdown(temp)
        }),
      )
    } else {
      handleVendorNameChange('')
    }
  }

  /**
   * @method onSubmit
   * @description Handling form submisson seting value
   */
  const onSubmit = (values) => {
    console.log(values, 'onsubmit')
    setPlantValue(values.plant)
    setVendorValue(values.vendor)
    setVendorPlant(values.vendorPlant)
    setCbcValue(values.clientName)
    setCostingDropdown([])
    setValue('costings', '')
    let temp = []
    temp = viewCostingData
    // if (viewCostingData.length == 0) {
    //   temp.push(VIEW_COSTING_DATA)
    // }
    // else if (viewCostingData.length >= 1) {
    // }
    dispatch(
      // getSingleCostingDetails('5cdcad92-277f-48e2-8eb2-7a7c838104e1', (res) => {
      getSingleCostingDetails(values.costings.value, (res) => {
        if (res.data.Data) {
          // let temp = viewCostingData;
          let dataFromAPI = res.data.Data
          let obj = {}
          obj.zbc = dataFromAPI.TypeOfCosting ? dataFromAPI.TypeOfCosting : '-'
          obj.poPrice = dataFromAPI.NetPOPrice ? dataFromAPI.NetPOPrice : '0'
          obj.costingName = dataFromAPI.CostingNumber ? dataFromAPI.CostingNumber : '-'
          obj.status = dataFromAPI.CostingStatus ? dataFromAPI.CostingStatus : '-'
          obj.rm = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingRawMaterialsCost.length > 0 ? dataFromAPI.CostingPartDetails.CostingRawMaterialsCost[0].RMName : '-'
          obj.gWeight = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.GrossWeight ? dataFromAPI.CostingPartDetails.GrossWeight : 0
          obj.fWeight = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetFinishWeight ? dataFromAPI.CostingPartDetails.NetFinishWeight : 0
          obj.netRM = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetRawMaterialsCost ? dataFromAPI.CostingPartDetails.NetRawMaterialsCost : 0
          obj.netBOP = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetBoughtOutPartCost ? dataFromAPI.CostingPartDetails.NetBoughtOutPartCost : 0
          obj.pCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetProcessCost ? dataFromAPI.CostingPartDetails.NetProcessCost : 0
          obj.oCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetOperationCost ? dataFromAPI.CostingPartDetails.NetOperationCost : 0
          obj.sTreatment = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetSurfaceTreatmentCost ? dataFromAPI.CostingPartDetails.NetSurfaceTreatmentCost : 0
          obj.tCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetTransportationCost ? dataFromAPI.CostingPartDetails.NetTransportationCost : 0
          obj.nConvCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetConversionCost ? dataFromAPI.CostingPartDetails.NetConversionCost : 0
          obj.modelType = dataFromAPI.ModelType ? dataFromAPI.ModelType : '-'
          obj.aValue = { applicability: 'Applicability', value: 'Value', }
          obj.overheadOn = {
            overheadTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadApplicability !== null ? dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadApplicability : '-',
            overheadValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadCCTotalCost !== null ? parseInt(dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadCCTotalCost) : 0 +
              (dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadBOPTotalCost !== null ? parseInt(dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadBOPTotalCost) : 0) +
              (dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadRMTotalCost !== null ? parseInt(dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadRMTotalCost,) : 0) +
              (dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadFixedTotalCost !== null ? parseInt(dataFromAPI.CostingPartDetails.CostingOverheadDetail.OverheadFixedTotalCost,) : 0),
          }
          obj.profitOn = {
            profitTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitApplicability !== null ? dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitApplicability : '-',
            profitValue: dataFromAPI.CostingPartDetails && (dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitCCTotalCost !== null ? parseInt(dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitCCTotalCost) : 0) +
              (dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitBOPTotalCost !== null ? parseInt(dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitBOPTotalCost) : 0) +
              (dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitRMTotalCost !== null ? parseInt(dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitRMTotalCost) : 0) +
              (dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitFixedTotalCost !== null ? parseInt(dataFromAPI.CostingPartDetails.CostingProfitDetail.ProfitFixedTotalCost) : 0),
          }
          obj.rejectionOn = {
            rejectionTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingRejectionDetail.RejectionApplicability !== null ? dataFromAPI.CostingPartDetails.CostingRejectionDetail.RejectionApplicability : '-',
            rejectionValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingRejectionDetail.RejectionTotalCost !== null ? dataFromAPI.CostingPartDetails.CostingRejectionDetail.RejectionTotalCost : 0,
          }
          obj.iccOn = {
            iccTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability !== null ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability : '-',
            iccValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost !== null ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost : 0,
          }
          obj.paymentTerms = {
            paymentTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingInterestRateDetail.PaymentTermDetail.PaymentTermApplicability ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail.PaymentTermDetail.PaymentTermApplicability : '-',
            paymentValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.CostingInterestRateDetail.PaymentTermDetail.NetCost ? dataFromAPI.CostingPartDetails.CostingInterestRateDetail.PaymentTermDetail.NetCost : 0,
          }
          obj.nOverheadProfit = dataFromAPI.NetOverheadAndProfitCost ? dataFromAPI.NetOverheadAndProfitCost : '-'
          obj.packagingCost = dataFromAPI.CostingPartDetails
            && dataFromAPI.CostingPartDetails.NetPackagingCost !== null ? dataFromAPI.CostingPartDetails.NetPackagingCost
            : 0
          obj.freight = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.NetFreightCost !== null ? dataFromAPI.CostingPartDetails.NetFreightCost : 0
          obj.nPackagingAndFreight = dataFromAPI.NetFreightPackagingCost ? dataFromAPI.NetFreightPackagingCost : 0
          obj.toolMaintenanceCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OverAllApplicability.ToolMaintenanceCost !== null ? dataFromAPI.CostingPartDetails.OverAllApplicability.ToolMaintenanceCost : 0
          obj.toolPrice = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OverAllApplicability.ToolCost !== null ? dataFromAPI.CostingPartDetails.OverAllApplicability.ToolCost : 0
          obj.amortizationQty = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OverAllApplicability.Life !== null ? dataFromAPI.CostingPartDetails.OverAllApplicability.Life : 0
          obj.totalToolCost = dataFromAPI.CostingPartDetails.NetToolCost !== null ? dataFromAPI.CostingPartDetails.NetToolCost : 0
          obj.totalCost = dataFromAPI.TotalCost ? dataFromAPI.TotalCost : '-'
          obj.otherDiscount = { discount: 'Discount %', value: 'Value', }
          obj.otherDiscountValue = {
            discountPercentValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountPercentage !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountPercentage : 0,
            discountValue: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.HundiOrDiscountValue : 0,
          }
          obj.anyOtherCost = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.TotalOtherCost !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.TotalOtherCost : 0
          obj.remark = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.Remark !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.Remark : '-'
          obj.nPOPriceWithCurrency = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.NetPOPriceOtherCurrency !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.NetPOPriceOtherCurrency : 0
          obj.currency = {
            currencyTitle: dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.Currency !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.Currency : '-',
            currencyValue: dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.OtherCostDetails.IsChangeCurrency ? dataFromAPI.CostingPartDetails.OtherCostDetails.CurrencyValue : '-' : '-',
          }
          obj.nPOPrice = dataFromAPI.CostingPartDetails && dataFromAPI.CostingPartDetails.OtherCostDetails.NetPOPriceINR !== null ? dataFromAPI.CostingPartDetails.OtherCostDetails.NetPOPriceINR : 0
          // // // obj.attachment = "Attachment";
          obj.attachment = dataFromAPI.Attachements ? dataFromAPI.Attachements : ''
          obj.approvalButton = ''
          // //RM
          obj.netRMCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingRawMaterialsCost : []
          // //BOP Cost
          obj.netBOPCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingBoughtOutPartCost : []
          // //COnversion Cost
          obj.netConversionCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingConversionCost : '-'
          // //OverheadCost and Profit
          obj.netOverheadCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingOverheadDetail : '-'
          obj.netProfitCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingProfitDetail : '-'
          // // Rejection
          obj.netRejectionCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingRejectionDetail : '-'

          // //Net Packaging and Freight
          obj.netPackagingCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingPackagingDetail : []
          obj.netFreightCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingFreightDetail : []
          // //Tool Cost
          obj.netToolCostView = dataFromAPI.CostingPartDetails ? dataFromAPI.CostingPartDetails.CostingToolsCostResponse : '-'
          // //For Drawer Edit
          obj.partId = dataFromAPI.PartNumber ? dataFromAPI.PartNumber : '-'
          obj.plantId = dataFromAPI.PlantId ? dataFromAPI.PlantId : '-'
          obj.plantName = dataFromAPI.PlantName ? dataFromAPI.PlantName : '-'
          obj.plantCode = dataFromAPI.PlantCode ? dataFromAPI.PlantCode : '-'
          obj.vendorId = dataFromAPI.VendorId ? dataFromAPI.VendorId : '-'
          obj.vendorName = dataFromAPI.VendorName ? dataFromAPI.VendorName : '-'
          obj.vendorCode = dataFromAPI.VendorCode ? dataFromAPI.VendorCode : '-'
          obj.vendorPlantId = dataFromAPI.VendorPlantId ? dataFromAPI.VendorPlantId : '-'
          obj.vendorPlantName = dataFromAPI.VendorPlantName ? dataFromAPI.VendorPlantName : '-'
          obj.vendorPlantCode = dataFromAPI.VendorPlantCode ? dataFromAPI.VendorPlantCode : '-'
          obj.costingId = dataFromAPI.CostingId ? dataFromAPI.CostingId : '-'
          obj.oldPoPrice = dataFromAPI.OldPOPrice ? dataFromAPI.OldPOPrice : '-'
          obj.technology = dataFromAPI.Technology ? dataFromAPI.Technology : '-'
          obj.technologyId = dataFromAPI.TechnologyId ? dataFromAPI.TechnologyId : '-'
          obj.shareOfBusinessPercent = dataFromAPI.ShareOfBusinessPercent ? dataFromAPI.ShareOfBusinessPercent : 0

          // temp.push(VIEW_COSTING_DATA)
          if (index) {
            temp[index] = obj
          } else {
            const index = temp.findIndex(
              (data) => data.costingId == values.costings.value,
            )
            if (index == -1) {
              temp.push(obj)
            } else {
              toastr.warning('This costing is already present for comparison.')
              return
            }
          }
          dispatch(setCostingViewData(temp))
          props.closeDrawer('')
        }
      }),
    )
  }

  /**
   * @method  handlePlantChange
   * @description Getting costing dropdown on basis of plant selection
   */
  const handlePlantChange = (value) => {
    const temp = []
    dispatch(
      getCostingSummaryByplantIdPartNo(partNo.label, value.value, (res) => {
        console.log(res, 'Response')
        res.data.Data.CostingOptions &&
          res.data.Data.CostingOptions.map((costing) => {
            temp.push({
              label: costing.CostingNumber,
              value: costing.CostingId,
            })
          })
        setCostingDropdown(temp)
        setValue('costings', '')
      }),
    )
  }

  const handleVendorNameChange = ({ value }) => {
    const temp = []
    if (value === '') {
      value = '00000000-0000-0000-0000-000000000000'
    } else {
      value = value
    }
    dispatch(
      getCostingByVendorAndVendorPlant(partNo.value, vendorId, value, (res) => {
        console.log(res, 'Response from Costing by vendor')
        res.data.DataList &&
          res.data.DataList.map((costing) => {
            temp.push({
              label: costing.CostingNumber,
              value: costing.CostingId,
            })
          })
        setCostingDropdown(temp)
        setValue('costings', '')
      }),
    )
  }

  return (
    <div>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={"drawer-wrapper"}>
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>
                    {isEditFlag ? "Edit for" : "Add to"}
                    {" Comparison: "}
                  </h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={"close-button right"}
                ></div>
              </Col>
            </Row>
            <Row className="pl-3">
              <Col md="12">
                <div className="left-border mb-0">{"Costing Head:"}</div>
              </Col>
            </Row>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Row className="pl-3 mb-2">
                <RadioHookForm
                  className={"filter-from-section"}
                  name={"comparisonValue"}
                  register={register}
                  onChange={handleComparison}
                  defaultValue={"ZBC"}
                  dataArray={[
                    {
                      label: "ZBC",
                      optionsValue: "ZBC",
                    },
                    {
                      label: "VBC",
                      optionsValue: "VBC",
                    },
                    {
                      label: "CBC",
                      optionsValue: "CBC",
                    },
                  ]}
                />
              </Row>
              <Row className="pl-3">
                {isZbcSelected && (
                  <Col md="12">
                    <SearchableSelectHookForm
                      label={"Plant"}
                      name={"plant"}
                      placeholder={"Select"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={isEditFlag ? plantName : ""}
                      options={plantDropDownList}
                      mandatory={true}
                      handleChange={handlePlantChange}
                      errors={errors.plant}
                    />
                  </Col>
                )}
                {isVbcSelected && (
                  <>
                    <Col md="12">
                      <SearchableSelectHookForm
                        label={"Vendor"}
                        name={"vendor"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        // defaultValue={plant.length !== 0 ? plant : ''}
                        options={vendorDropDownList}
                        mandatory={true}
                        handleChange={handleVendorChange}
                        errors={errors.vendor}
                      />
                    </Col>
                    {loggedIn && (
                      <Col md="12">
                        <SearchableSelectHookForm
                          label={"Vendor Plant"}
                          name={"vendorPlant"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          // defaultValue={plant.length !== 0 ? plant : ''}
                          options={vendorPlantDropdown}
                          mandatory={true}
                          handleChange={handleVendorNameChange}
                          errors={errors.vendorPlant}
                        />
                      </Col>
                    )}
                  </>
                )}
                {isCbcSelected && (
                  <>
                    <Col md="12">
                      <SearchableSelectHookForm
                        label={"Client Name"}
                        name={"clientName"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        //defaultValue={plant.length !== 0 ? plant : ''}
                        options={clientDropdown}
                        mandatory={true}
                        handleChange={() => { }}
                        errors={errors.clientName}
                      />
                    </Col>
                  </>
                )}
                <Col md="12">
                  <SearchableSelectHookForm
                    label={"Costing Version"}
                    name={"costings"}
                    placeholder={"Select"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={
                      costingDropdown.length !== 0 ? costingDropdown : ""
                    }
                    options={costingDropdown}
                    mandatory={true}
                    handleChange={() => { }}
                    errors={errors.costings}
                  />
                </Col>
              </Row>

              <Row className="justify-content-between my-3">
                <div className="col-sm-12 text-right">
                  <button
                    type={"button"}
                    className="reset mr15 cancel-btn"
                    onClick={toggleDrawer}
                  >
                    <div className={"cross-icon"}>
                      <img
                        src={require("../../../assests/images/times.png")}
                        alt="cancel-icon.jpg"
                      />
                    </div>{" "}
                    {"Cancel"}
                  </button>

                  <button
                    type="submit"
                    className="submit-button save-btn"
                  // onClick={addHandler}
                  >
                    {isEditFlag ? (
                      <div className={"check-icon"}>
                        {" "}
                        <img
                          src={require("../../../assests/images/check.png")}
                          alt="check-icon.jpg"
                        />{" "}
                      </div>
                    ) : (
                      <div class="plus"></div>
                    )}{" "}
                    {isEditFlag ? "Edit" : "Add"}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
    </div>
  );
}

export default React.memo(AddToComparisonDrawer)
