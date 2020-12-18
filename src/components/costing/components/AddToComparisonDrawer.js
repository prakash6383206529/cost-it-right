import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'

import {
  getPlantSelectListByType,
  getVendorWithVendorCodeSelectList,
  getPlantBySupplier,
} from '../../../actions/Common'
import { getClientSelectList } from '../../masters/actions/Client'
import { getCostingSummaryByplantIdPartNo, getSingleCostingDetails, setCostingViewData } from '../actions/Costing'

import {
  SearchableSelectHookForm,
  RadioHookForm,
} from '../../layout/HookFormInputs'

import { ZBC, VBC, VIEW_COSTING_DATA } from '../../../config/constants'
import { toastr } from 'react-redux-toastr';
import { isUserLoggedIn } from '../../../helper/auth'


function AddToComparisonDrawer(props) {
  
  const loggedIn = isUserLoggedIn()
  console.log(loggedIn, "Logged in");
  const { editObject, isEditFlag } = props
  console.log(editObject, "Edit object");
  const {
    partId,
    plantId,
    plantName,
    costingId,
    CostingNumber,
    index,
    typeOfCosting
  } = editObject
  const {
    register,
    handleSubmit,
    control,
    setValue,
    errors
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      comparisonValue: isEditFlag ? typeOfCosting : 'ZBC',
      plant: isEditFlag ? { label: plantName, value: plantId } : '',
      costings: isEditFlag ? { label: CostingNumber, value: costingId } : ''
    }
  })
  const fieldValues = useWatch({ control, name: ['comparisonValue', 'plant'] })
  console.log(fieldValues, "fv");
  const dispatch = useDispatch()

  /* DropDown constants */
  const [plantDropDownList, setPlantDropDownList] = useState([])
  const [vendorDropDownList, setVendorDropDownList] = useState([])
  const [vendorPlantDropdown, setvendorPlantDropdown] = useState([])
  const [clientDropdown, setclientDropdown] = useState([])
  const [costingDropdown, setCostingDropdown] = useState([])

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
    (state) => state.costing.viewCostingDetailData)
  /* For getting part no for costing dropdown */
  const partNo = useSelector((state) => state.costing.partNo)
  /* For getting default value of check box */
  useEffect(() => {
    const temp = []
    dispatch(
      getPlantSelectListByType(ZBC, (res) => {
        res.data.SelectList.map((item) => {
          if (item.Value === '0' || plantDropDownList.includes(item.Value)) return false;
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
        if (vendor.Value === '0' || vendorDropDownList.includes(vendor.Value)) return false;
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
          console.log(res, "Plant response");
          res.data.SelectList.map((item) => {
            if (item.Value === '0' || plantDropDownList.includes(item.Value)) return false;
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
      setValue("costings", '')
      dispatch(getVendorWithVendorCodeSelectList(() => { }))
    } else if (value === 'CBC') {
      setCostingDropdown([])
      dispatch(
        getClientSelectList((res) => {
          res.data.SelectList &&
            res.data.SelectList.map((client) => {
              if (client.Value === '0' || clientDropdown.includes(client.Value)) return false;
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
    dispatch(
      getPlantBySupplier(value, (res) => {
        res.data.SelectList &&
          res.data.SelectList.map((plant) => {
            if (plant.Value === '0' || vendorPlantDropdown.includes(plant.Value)) return false;
            temp.push({ label: plant.Text, value: plant.Value })
          })
        setvendorPlantDropdown(temp)
      }),
    )
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
    setCostingDropdown([]);
    setValue("costings",'');
    let temp = []
    if (viewCostingData.length == 0) {
      temp.push(VIEW_COSTING_DATA)
    }
    else if (viewCostingData.length >= 1) {
      temp = viewCostingData
    }
    dispatch(
      // getSingleCostingDetails('5cdcad92-277f-48e2-8eb2-7a7c838104e1', (res) => {
      getSingleCostingDetails(values.costings.value, (res) => {
        if (res.data.Data) {
          // let temp = viewCostingData;
          let dataFromAPI = res.data.Data
          let obj = {}
          obj.zbc = dataFromAPI.TypeOfCosting
          obj.poPrice = dataFromAPI.NetPOPrice
          obj.costingName = dataFromAPI.CostingNumber
          obj.status = dataFromAPI.CostingStatus
          obj.rm =
            dataFromAPI.CostingPartDetails[0].CostingRawMaterialsCost[0].RMName
          obj.gWeight =
            dataFromAPI.CostingPartDetails[0].CostingRawMaterialsCost[0].WeightCalculatorRequest.GrossWeight
          obj.fWeight =
            dataFromAPI.CostingPartDetails[0].CostingRawMaterialsCost[0].WeightCalculatorRequest.FinishWeight
          obj.netRM = dataFromAPI.NetRawMaterialsCost
          obj.netBOP = dataFromAPI.NetBoughtOutPartCost
          obj.pCost = dataFromAPI.NetProcessCost
          obj.oCost = dataFromAPI.NetOperationCost
          obj.sTreatment = dataFromAPI.NetSurfaceTreatmentCost
          obj.tCost = dataFromAPI.CostingPartDetails[0].TransportationCost
          obj.nConvCost = dataFromAPI.NetConversionCost
          obj.modelType = dataFromAPI.ModelType
          obj.aValue = {
            applicability: 'Applicability',
            value: 'Value',
          }
          obj.overheadOn = {
            overheadTitle:
              dataFromAPI.CostingPartDetails[0].CostingOverheadDetail
                .OverheadApplicability,
            overheadValue:
              (dataFromAPI.CostingPartDetails[0].CostingOverheadDetail
                .OverheadCCTotalCost
                ? parseInt(
                  dataFromAPI.CostingPartDetails[0].CostingOverheadDetail
                    .OverheadCCTotalCost,
                )
                : 0) +
              (dataFromAPI.CostingPartDetails[0].CostingOverheadDetail
                .OverheadBOPTotalCost
                ? parseInt(
                  dataFromAPI.CostingPartDetails[0].CostingOverheadDetail
                    .OverheadBOPTotalCost,
                )
                : 0) +
              (dataFromAPI.CostingPartDetails[0].CostingOverheadDetail
                .OverheadRMTotalCost
                ? parseInt(
                  dataFromAPI.CostingPartDetails[0].CostingOverheadDetail
                    .OverheadRMTotalCost,
                )
                : 0) +
              (dataFromAPI.CostingPartDetails[0].CostingOverheadDetail
                .OverheadFixedTotalCost
                ? parseInt(
                  dataFromAPI.CostingPartDetails[0].CostingOverheadDetail
                    .OverheadFixedTotalCost,
                )
                : 0),
          }
          obj.profitOn = {
            profitTitle:
              dataFromAPI.CostingPartDetails[0].CostingProfitDetail
                .ProfitApplicability,
            profitValue:
              (dataFromAPI.CostingPartDetails[0].CostingProfitDetail
                .ProfitCCTotalCost
                ? parseInt(
                  dataFromAPI.CostingPartDetails[0].CostingProfitDetail
                    .ProfitCCTotalCost,
                )
                : 0) +
              (dataFromAPI.CostingPartDetails[0].CostingProfitDetail
                .ProfitBOPTotalCost
                ? parseInt(
                  dataFromAPI.CostingPartDetails[0].CostingProfitDetail
                    .ProfitBOPTotalCost,
                )
                : 0) +
              (dataFromAPI.CostingPartDetails[0].CostingProfitDetail
                .ProfitRMTotalCost
                ? parseInt(
                  dataFromAPI.CostingPartDetails[0].CostingProfitDetail
                    .ProfitRMTotalCost,
                )
                : 0) +
              (dataFromAPI.CostingPartDetails[0].CostingProfitDetail
                .ProfitFixedTotalCost
                ? parseInt(
                  dataFromAPI.CostingPartDetails[0].CostingProfitDetail
                    .ProfitFixedTotalCost,
                )
                : 0),
          }
          obj.rejectionOn = {
            rejectionTitle:
              dataFromAPI.CostingPartDetails[0].CostingRejectionDetail
                .RejectionApplicability,
            rejectionValue:
              dataFromAPI.CostingPartDetails[0].CostingRejectionDetail
                .RejectionTotalCost,
          }
          obj.iccOn = {
            iccTitle:
              dataFromAPI.CostingPartDetails[0].CostingInterestRateDetail
                .ICCApplicabilityDetail.ICCApplicability,
            iccValue:
              dataFromAPI.CostingPartDetails[0].CostingInterestRateDetail
                .ICCApplicabilityDetail.NetCost,
          }
          obj.paymentTerms = {
            paymentTitle:
              dataFromAPI.CostingPartDetails[0].CostingInterestRateDetail
                .PaymentTermDetail.PaymentTermApplicability,
            paymentValue:
              dataFromAPI.CostingPartDetails[0].CostingInterestRateDetail
                .PaymentTermDetail.NetCost,
          }
          obj.nOverheadProfit = dataFromAPI.NetOverheadAndProfitCost
          obj.packagingCost = dataFromAPI.CostingPartDetails[0].PackagingNetCost
          obj.freight = dataFromAPI.CostingPartDetails[0].FreightNetCost
          obj.nPackagingAndFreight = dataFromAPI.NetPackagingAndFreight
          obj.toolMaintenanceCost = dataFromAPI.NetToolCost
          obj.toolPrice = '5000.00'
          obj.amortizationQty = '10'
          obj.totalToolCost = dataFromAPI.NetToolCost
          obj.totalCost = dataFromAPI.TotalCost
          obj.otherDiscount = {
            discount: 'Discount %',
            value: 'Value',
          }
          obj.otherDiscountValue = {
            discountPercentValue: dataFromAPI.CostingPartDetails[0]
              .OtherCostDetails.HundiOrDiscountPercentage
              ? dataFromAPI.CostingPartDetails[0].OtherCostDetails
                .HundiOrDiscountPercentage
              : '-',
            discountValue: dataFromAPI.CostingPartDetails[0].OtherCostDetails
              .HundiOrDiscountValue
              ? dataFromAPI.CostingPartDetails[0].OtherCostDetails
                .HundiOrDiscountValue
              : '-',
          }
          obj.anyOtherCost = dataFromAPI.CostingPartDetails[0].OtherCostDetails
            .TotalOtherCost
            ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.TotalOtherCost
            : '-'
          obj.remark = dataFromAPI.CostingPartDetails[0].OtherCostDetails.Remark
            ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.Remark
            : '-'
          obj.nPOPriceWithCurrency = dataFromAPI.CostingPartDetails[0]
            .OtherCostDetails.NetPOPriceOtherCurrency
            ? dataFromAPI.CostingPartDetails[0].OtherCostDetails
              .NetPOPriceOtherCurrency
            : '-'
          obj.currency = {
            currencyTitle: 'INR/EUR',
            currencyValue: '85',
          }
          obj.nPOPrice = dataFromAPI.CostingPartDetails[0].OtherCostDetails
            .NetPOPriceINR
            ? dataFromAPI.CostingPartDetails[0].OtherCostDetails.NetPOPriceINR
            : '-'
          obj.attachment = 'View Attachment'
          obj.approvalButton = 'Button'
          //RM
          obj.netRMCostView = dataFromAPI.CostingPartDetails[0].CostingRawMaterialsCost
          //BOP Cost
          obj.netBOPCostView =
            dataFromAPI.CostingPartDetails[0].CostingBoughtOutPartCost
          //COnversion Cost
          obj.netConversionCostView =
            dataFromAPI.CostingPartDetails[0].CostingConversionCost
          //OverheadCost and Profit
          obj.netOverheadCostView =
            dataFromAPI.CostingPartDetails[0].CostingOverheadDetail
          obj.netProfitCostView =
            dataFromAPI.CostingPartDetails[0].CostingProfitDetail
          //Net Packaging and Freight
          obj.netPackagingCostView =
            dataFromAPI.CostingPartDetails[0].CostingPackagingDetail
          obj.netFreightCostView =
            dataFromAPI.CostingPartDetails[0].CostingFreightDetail
          //Tool Cost
          obj.netToolCostView =
            dataFromAPI.CostingPartDetails[0].OverAllApplicability
          obj.partId = dataFromAPI.PartNumber;
          obj.plantId = dataFromAPI.PlantId;
          obj.plantName = dataFromAPI.PlantName;
          obj.costingId = dataFromAPI.CostingId

          // temp.push(VIEW_COSTING_DATA)
          if (index) {
            temp[index] = obj
          }
          else {
            const index = temp.findIndex(data => data.costingId == values.costings.value)
            if(index == -1){
              temp.push(obj)
            }
            else{
              toastr.warning("This costing is already present for comparison.");
              return;
            }
          }
          dispatch(setCostingViewData(temp))
          props.closeDrawer('');
        }
      })
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

  return (
    <div>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{isEditFlag ? 'Edit for' : 'Add to'}{' Comparison: '}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <div className="left-border">{'Costing Head:'}</div>
              </Col>
            </Row>
            
            <form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <RadioHookForm
                className={'filter-from-section'}
                name={'comparisonValue'}
                register={register}
                onChange={handleComparison}
                defaultValue={'ZBC'}
                dataArray={[
                  {
                    label: 'ZBC',
                    optionsValue: 'ZBC',
                  },
                  {
                    label: 'VBC',
                    optionsValue: 'VBC',
                  },
                  {
                    label: 'CBC',
                    optionsValue: 'CBC',
                  },
                ]}
              />
            </Row>
              <Row>
                {isZbcSelected && (
                  <Col md="12">
                    <SearchableSelectHookForm
                      label={'Plant'}
                      name={'plant'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={isEditFlag ? plantName : ''}
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
                        label={'Vendor'}
                        name={'vendor'}
                        placeholder={'-Select-'}
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
                    {
                      loggedIn && 
                      <Col md="12">
                      <SearchableSelectHookForm
                        label={'Vendor Plant'}
                        name={'vendorPlant'}
                        placeholder={'-Select-'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        // defaultValue={plant.length !== 0 ? plant : ''}
                        options={vendorPlantDropdown}
                        mandatory={true}
                        handleChange={() => { }}
                        errors={errors.vendorPlant}
                      />
                    </Col>
                    }
                    
                  </>
                )}
                {isCbcSelected && (
                  <>
                    <Col md="12">
                      <SearchableSelectHookForm
                        label={'Client Name'}
                        name={'clientName'}
                        placeholder={'-Select-'}
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
                    label={'Costing Version'}
                    name={'costings'}
                    placeholder={'-Select-'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={
                      costingDropdown.length !== 0 ? costingDropdown : ''
                    }
                    options={costingDropdown}
                    mandatory={true}
                    handleChange={() => { }}
                    errors={errors.costings}
                  />
                </Col>
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
                        src={require('../../../assests/images/times.png')}
                        alt="cancel-icon.jpg"
                      />
                    </div>{' '}
                    {'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="submit-button mr5 save-btn"
                    // onClick={addHandler}
                  >
                    <div className={'check-icon'}>
                      <img
                        src={require('../../../assests/images/check.png')}
                        alt="check-icon.jpg"
                      />{' '}
                    </div>
                    {isEditFlag ? 'Edit' : 'Add'}
                  </button>
                </div>
              </Row>
            </form>
          </div>
        </Container>
      </Drawer>
    </div>
  )
}

export default React.memo(AddToComparisonDrawer)
