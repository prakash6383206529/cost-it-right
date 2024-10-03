
import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { getPlantSelectListByType, getPlantSelectListReducer } from '../../../actions/Common'
import { getClientSelectList } from '../../masters/actions/Client'
import { getCostingByVendorAndVendorPlant, getPartCostingPlantSelectList, getPartCostingVendorSelectList, getSingleCostingDetails, setCostingViewData, storePartNumber, } from '../actions/Costing'
import { SearchableSelectHookForm, RadioHookForm, } from '../../layout/HookFormInputs'
import { APPROVED, REJECTED, HISTORY, ZBC, APPROVED_BY_SIMULATION, VARIANCE, ZBCTypeId, VBCTypeId, CBCTypeId, EMPTY_GUID, NCCTypeId, ZBC_COSTING, VBC_COSTING, NCC_COSTING, CBC_COSTING, COSTING } from '../../../config/constants'
import Toaster from '../../common/Toaster'
import { getConfigurationKey, isUserLoggedIn } from '../../../helper/auth'
import { TotalTCOCostCal, checkForDecimalAndNull, checkForNull } from '../../../helper'
import DayTime from '../../common/DayTimeWrapper'
import TooltipCustom from '../../common/Tooltip'
import { useLabels } from '../../../helper/core'

function AddToComparisonDrawer(props) {
  const loggedIn = isUserLoggedIn()
  const { editObject, isEditFlag, viewMode } = props

  const { plantId, plantName, costingId, CostingNumber, index, VendorId, vendorName,
    vendorPlantName, vendorPlantId, destinationPlantName, customerName, customerId, destinationPlantId, costingTypeId, vendorCode, customerCode } = editObject

  const defaultValue = {
    comparisonValue: isEditFlag ? costingTypeId === ZBCTypeId ? 'ZBC' : costingTypeId === VBCTypeId ? 'VBC' : 'CBC' : 'ZBC',
    plant: plantName !== '-' ? { label: plantName, value: plantId } : '',
    costings: isEditFlag ? { label: CostingNumber, value: costingId } : '',
    vendor: VendorId && VendorId !== '-' ? { label: `${vendorName} (${vendorCode})`, value: VendorId } : '',
    vendorPlant: vendorPlantId !== '-' ? { label: vendorPlantName, value: vendorPlantId } : '',
    destinationPlant: destinationPlantId !== '-' ? { label: destinationPlantName, value: destinationPlantId } : '',
    clientName: customerId !== '-' ? { label: `${customerName} (${customerCode})`, value: customerId } : '',
  }

  const { register, handleSubmit, control, setValue, formState: { errors }, reset } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValue
  })

  const dispatch = useDispatch()


  const [costingDropdown, setCostingDropdown] = useState([])

  const [vendorId, setVendorId] = useState(editObject.VendorId ? editObject.VendorId : [])
  /* constant for checkbox rendering condition */
  const [isZbcSelected, setIsZbcSelected] = useState(true)
  const [CustomerId, setCustomerId] = useState(editObject.customerId ? editObject.customerId : [])
  const [isVbcSelected, setIsVbcSelected] = useState(false)

  const [isCbcSelected, setisCbcSelected] = useState(false)
  const [isNccSelected, setisNccSelected] = useState(false)
  const [showCostingSection, setShowCostingSection] = useState({})
  const [vendor, setVendor] = useState([]);
  const [plant, setPlant] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [sameCostingNumber, setSameCostingNumber] = useState([]);
  /* For vendor dropdown */
  const vendorSelectList = useSelector((state) => state.costing.costingVendorList)
  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
  const plantSelectList = useSelector((state) => state.costing.costingPlantList)
  const filterPlantList = useSelector((state) => state.comman.filterPlantList)
  const costingSelectList = useSelector((state) => state.costing.costingSelectList)
  const clientSelectList = useSelector((state) => state.client.clientSelectList)
  const DestinationplantSelectList = useSelector(state => state.comman.plantSelectList);
  const { topAndLeftMenuData } = useSelector(state => state.auth);
  const [infoCategory, setInfoCategory] = useState([])
  const [isInfoCategorySelected, setIsInfoCategorySelected] = useState(false)
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)


  /* For getting part no for costing dropdown */
  const partNo = useSelector((state) => state.costing.partNo)
  const { vendorLabel } = useLabels()

  /* For getting default value of check box */
  useEffect(() => {
    /******FIRST TIME RENDER ADD TO COMPARISION******/
    if (!isEditFlag) {
      setIsZbcSelected(true)
      setIsVbcSelected(false)
      //MINDA
      // dispatch(getPartCostingVendorSelectList(partNo.value !== undefined ? partNo.value : partNo.partId, () => { }))
      // const temp = []
      // // THIS CONDITION IS TEMPORARY COMMENTED FOR MINDA
      // // setIsZbcSelected(true)
      // // setIsVbcSelected(false)
      // // setisCbcSelected(false)
      // // dispatch(getPartCostingPlantSelectList(partNo.value !== undefined ? partNo.value : partNo.partId, (res) => {
      // //   dispatch(getCostingSummaryByplantIdPartNo('', '', () => { }))
      // //   dispatch(getCostingByVendorAndVendorPlant('', '', '', () => { }))
      // // }),
      // // )

      // // THIS CONDITION IS FOR MINDA 
      // setIsVbcSelected(true)
      // setIsZbcSelected(false)
      setisCbcSelected(false)
      setisNccSelected(false)
      dispatch(getPartCostingPlantSelectList(partNo.value !== undefined ? partNo.value : partNo.partId, (res) => {
        // dispatch(getCostingSummaryByplantIdPartNo('', '', () => { }))
        dispatch(getPartCostingVendorSelectList(partNo.value !== undefined ? partNo.value : partNo.partId, () => { }))
        dispatch(getCostingByVendorAndVendorPlant('', '', '', '', '', '', '', () => { }))
      }),
      )
    }

    /******FIRST TIME RENDER EDIT TO COMPARISION******/
    if (isEditFlag) {
      if (costingTypeId === ZBCTypeId) { //ZBC COSTING CONDITION
        setIsZbcSelected(true)
        setIsVbcSelected(false)
        setisCbcSelected(false)
        setisNccSelected(false)
        dispatch(getPartCostingPlantSelectList(partNo.value !== undefined ? partNo.value : partNo.partId, (res) => { }))
        commonApiCall(ZBCTypeId)
      } else if (costingTypeId === VBCTypeId) {//VBC COSTING CONDITION
        setIsZbcSelected(false)
        setIsVbcSelected(true)
        setisCbcSelected(false)
        setisNccSelected(false)
        dispatch(getPartCostingVendorSelectList(partNo.value !== undefined ? partNo.value : partNo.partId, () => { }))
        // dispatch(getPlantBySupplier(VendorId, (res) => { }))
        dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))
        commonApiCall(VBCTypeId)
      }
      else if (costingTypeId === NCCTypeId) {
        setIsZbcSelected(false)
        setIsVbcSelected(false)
        setisCbcSelected(false)
        setisNccSelected(true)
        dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))
        commonApiCall(NCCTypeId)
      } else if (costingTypeId === CBCTypeId) {//CBC COSTING CONDITION
        setIsZbcSelected(false)
        setIsVbcSelected(false)
        setisNccSelected(false)
        setisCbcSelected(true)
        dispatch(getClientSelectList(() => { }))
        commonApiCall(CBCTypeId)
        dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))
      }
    }
    const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === COSTING);
    const ZBCAccessData = Data && Data.Pages.find(el => el.PageName === ZBC_COSTING)
    const VBCAccessData = Data && Data.Pages.find(el => el.PageName === VBC_COSTING)
    const NCCAccessData = Data && Data.Pages.find(el => el.PageName === NCC_COSTING)
    const CBCAccessData = Data && Data.Pages.find(el => el.PageName === CBC_COSTING)
    setShowCostingSection({ ZBC: ZBCAccessData ? ZBCAccessData?.IsChecked : false, VBC: VBCAccessData ? VBCAccessData?.IsChecked : false, NCC: NCCAccessData ? NCCAccessData?.IsChecked : false, CBC: CBCAccessData ? CBCAccessData?.IsChecked : false })
  }, [])

  useEffect(() => {
    setInfoCategory(initialConfiguration?.InfoCategories)
  }, [initialConfiguration])

  /* for showing vendor name dropdown */
  useEffect(() => {
    // dispatch(getCostingSummaryByplantIdPartNo('', '', () => { }))
    dispatch(getCostingByVendorAndVendorPlant('', '', '', '', '', '', '', () => { }))
    // setIsZbcSelected(false)
    // setIsVbcSelected(true)
    // setisCbcSelected(false)
  }, [vendorSelectList])

  const commonApiCall = (costingTypeId) => {
    if (((costingTypeId === VBCTypeId || costingTypeId === NCCTypeId) && VendorId && destinationPlantId) || (costingTypeId === CBCTypeId && customerId && destinationPlantId) || (costingTypeId === VBCTypeId && destinationPlantId)) {
      const infoCategoryValue = isInfoCategorySelected === true ? infoCategory[0]?.Text : infoCategory[1]?.Text
      dispatch(getCostingByVendorAndVendorPlant(partNo.partId, VendorId, vendorPlantId, destinationPlantId, customerId, costingTypeId, costingTypeId === VBCTypeId ? infoCategoryValue : '', () => { }))
    }
  }

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
    setIsZbcSelected(true)
    setIsVbcSelected(false)
    setisCbcSelected(false)
    props.closeDrawer('')
  }

  /**
   * @method handleComparison
   * @description for handling rendering for different checkbox
   */
  const handleComparison = (value) => {
    reset()
    setValue('comparisonValue', value)
    if ((value) === ZBCTypeId) {
      setIsZbcSelected(true)
      setIsVbcSelected(false)
      setisCbcSelected(false)
      setisNccSelected(false)
      dispatch(getPartCostingPlantSelectList(partNo.value !== undefined ? partNo.value : partNo.partId, (res) => {
        commonApiCall(ZBCTypeId)
        setValue('costings', '')
        setValue('plant', '')
      }))

    } else if ((value) === VBCTypeId) {
      dispatch(getPlantSelectListReducer([]))
      setCostingDropdown([])
      setIsZbcSelected(false)
      setIsVbcSelected(true)
      setisCbcSelected(false)
      setisNccSelected(false)
      setValue('costings', '')
      setValue('vendor', '')
      setValue('destinationPlant', '')
      commonApiCall(VBCTypeId)
      dispatch(getPartCostingVendorSelectList(partNo.value !== undefined ? partNo.value : partNo.partId, () => { }))
      setVendor('')
      setPlant('')

    } else if ((value) === CBCTypeId) {
      dispatch(getPlantSelectListReducer([]))
      setisCbcSelected(true)
      setIsZbcSelected(false)
      setIsVbcSelected(false)
      setisNccSelected(false)
      setCostingDropdown([])
      setValue('clientName', '')
      setValue('costings', '')
      setValue('plant', '')
      dispatch(getClientSelectList((res) => { }),
        commonApiCall(CBCTypeId)
      )
      setPlant('')
      setCustomer('')
    } else if ((value) === NCCTypeId) {
      setisCbcSelected(false)
      setIsZbcSelected(false)
      setIsVbcSelected(false)
      setisNccSelected(true)
      setValue('costings', '')
      setValue('vendor', '')
      setValue('destinationPlant', '')
      setCostingDropdown([])
      dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))
      dispatch(getPartCostingVendorSelectList(partNo.value !== undefined ? partNo.value : partNo.partId, () => { }))
      commonApiCall(NCCTypeId)
    }
  }

  /**
   * @method handleVendorChange
   * @description showing vendor plant by vendor name
   */
  const handleVendorChange = (newValue) => {
    setVendorId(newValue.value)
    setVendor(newValue)
    setValue('destinationPlant', '')

    // dispatch(getPlantBySupplier(value, (res) => { }),
    dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))
    // dispatch(
    //   getCostingByVendorAndVendorPlant(partNo.value !== undefined ? partNo.value : partNo.partId, value, '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', (res) => {
    //   }),
    //   )
    setValue('costings', '')
  }
  const handleCustomerChange = (value) => {
    setCustomer(value)
    const userDetails = JSON.parse(localStorage.getItem('userDetail'))
    setValue('plant', '')
    setTimeout(() => {
      setCustomerId(value.value)
    }, 500);
    if (!getConfigurationKey().IsCBCApplicableOnPlant) {
      dispatch(getCostingByVendorAndVendorPlant(partNo.partId, VendorId, vendorPlantId, userDetails.Plants[0].PlantId, customerId, costingTypeId, '', () => { }))
    }
    dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))
  }
  /**
   * @method onSubmit
   * @description Handling form submisson seting value
   */
  const onSubmit = (values) => {
    if (isEditFlag && (CostingNumber === sameCostingNumber || viewCostingData.some(data => data.costingName === sameCostingNumber))) {
      Toaster.warning('This costing is already present for comparison.')
      return false
    }
    setCostingDropdown([])
    partNo.isChanged = true
    dispatch(storePartNumber(partNo))

    setValue('costings', '')
    let temp = []
    temp = viewCostingData
    dispatch(
      // getSingleCostingDetails('5cdcad92-277f-48e2-8eb2-7a7c838104e1', (res) => {
      getSingleCostingDetails(values.costings.value, (res) => {
        if (res.data.Data) {
          // let temp = viewCostingData;
          let dataFromAPI = res.data.Data
          const setDynamicKeys = (list, value) => {
            let datalist = list && list?.filter(element => element?.Type === 'Other' && element?.SubHeader === value)
            let arr = []
            datalist && datalist?.map(item => {
              let obj = {}
              obj.DynamicHeader = item?.Description
              obj.DynamicApplicabilityCost = item?.ApplicabilityCost
              obj.DynamicPercentage = item?.Value
              obj.DynamicNetCost = item?.NetCost
              arr.push(obj)
            })
            return arr;
          }
          const dummyData = [
            {
              SubHeader: "OverHead",
              Type: "Other",
              ApplicabilityType: "CC",
              ApplicabilityIdRef: 2,
              Description: "Test 1",
              Value: 2,
              ApplicabilityCost: 2,
              NetCost: 2,
              CRMHead: null
            },
            {
              SubHeader: "OverHead",
              Type: "Other",
              ApplicabilityType: "CC",
              ApplicabilityIdRef: 2,
              Description: "Test 2",
              Value: 2,
              ApplicabilityCost: 2,
              NetCost: 2,
              CRMHead: "-"
            },
            {
              SubHeader: "OverHead",
              Type: "Other",
              ApplicabilityType: "CC",
              ApplicabilityIdRef: 3,
              Description: "Test 3",
              Value: 2,
              ApplicabilityCost: 2,
              NetCost: 2,
              CRMHead: null
            },
            {
              SubHeader: "OverHead",
              Type: "Other",
              ApplicabilityType: "CC",
              ApplicabilityIdRef: 2,
              Description: "Test 4",
              Value: 2,
              ApplicabilityCost: 2,
              NetCost: 2,
              CRMHead: null
            },
            {
              SubHeader: "OverHead",
              Type: "Other",
              ApplicabilityType: "CC",
              ApplicabilityIdRef: 2,
              Description: "Test 5",
              Value: 2,
              ApplicabilityCost: 2,
              NetCost: 2,
              CRMHead: null
            },
            {
              SubHeader: "OverHead",
              Type: "Other",
              ApplicabilityType: "Fixed",
              ApplicabilityIdRef: null,
              Description: "Test 6",
              Value: 2,
              ApplicabilityCost: 2,
              NetCost: 2,
              CRMHead: null
            },
            {
              SubHeader: "OverHead",
              Type: "Other",
              ApplicabilityType: "CC",
              ApplicabilityIdRef: 2,
              Description: "Test 7",
              Value: 2,
              ApplicabilityCost: 2,
              NetCost: 2,
              CRMHead: "-"
            },
            {
              SubHeader: "Process",
              Type: "Other",
              ApplicabilityType: "CC",
              ApplicabilityIdRef: 2,
              Description: "Test Process 1",
              Value: 2,
              ApplicabilityCost: 2,
              NetCost: 2,
              CRMHead: "-"
            },
            {
              SubHeader: "Process",
              Type: "Other",
              ApplicabilityType: "Fixed",
              ApplicabilityIdRef: null,
              Description: "Test Process 2",
              Value: 2,
              ApplicabilityCost: 2,
              NetCost: 2,
              CRMHead: null
            },
            {
              SubHeader: "OverHead",
              Type: "Other",
              ApplicabilityType: "CC",
              ApplicabilityIdRef: 8,
              Description: "Test 8",
              Value: 2,
              ApplicabilityCost: 2,
              NetCost: 2,
              CRMHead: "-"
            }
          ]
          let obj = {}

          obj.zbc = dataFromAPI.TypeOfCosting || dataFromAPI.TypeOfCosting === 0 ? dataFromAPI.TypeOfCosting : '-'
          obj.IsApprovalLocked = dataFromAPI.IsApprovalLocked !== null ? dataFromAPI.IsApprovalLocked : '-'
          obj.poPrice = dataFromAPI.NetPOPrice ? dataFromAPI.NetPOPrice : '0'
          obj.costingName = dataFromAPI.DisplayCostingNumber ? dataFromAPI.DisplayCostingNumber : '-'
          obj.costingDate = dataFromAPI.CostingDate ? dataFromAPI.CostingDate : '-'
          obj.CostingNumber = dataFromAPI.CostingNumber ? dataFromAPI.CostingNumber : '-'
          obj.status = dataFromAPI.CostingStatus ? dataFromAPI.CostingStatus : '-'
          obj.rm = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost.length > 0 ? dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost[0].RMName : '-'
          obj.gWeight = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetGrossWeight ? dataFromAPI?.CostingPartDetails?.NetGrossWeight : 0
          obj.fWeight = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetFinishWeight ? dataFromAPI?.CostingPartDetails?.NetFinishWeight : 0
          obj.netRM = dataFromAPI.NetRawMaterialsCost && dataFromAPI.NetRawMaterialsCost ? dataFromAPI.NetRawMaterialsCost : 0
          obj.netBOP = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetBoughtOutPartCost ? dataFromAPI?.CostingPartDetails?.NetBoughtOutPartCost : 0
          obj.pCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetProcessCost ? dataFromAPI?.CostingPartDetails?.NetProcessCost : 0
          obj.oCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOperationCost ? dataFromAPI?.CostingPartDetails?.NetOperationCost : 0
          obj.sTreatment = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.SurfaceTreatmentCost ? dataFromAPI?.CostingPartDetails?.SurfaceTreatmentCost : 0
          obj.nsTreamnt = dataFromAPI && dataFromAPI.NetSurfaceTreatmentCost !== undefined ? dataFromAPI.NetSurfaceTreatmentCost : 0
          obj.tCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetTransportationCost ? dataFromAPI?.CostingPartDetails?.NetTransportationCost : 0
          obj.nConvCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetConversionCost ? dataFromAPI?.CostingPartDetails?.NetConversionCost : 0
          obj.nTotalRMBOPCC = dataFromAPI?.CostingPartDetails && dataFromAPI.NetTotalRMBOPCC ? dataFromAPI.NetTotalRMBOPCC : 0
          obj.netSurfaceTreatmentCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetSurfaceTreatmentCost ? dataFromAPI?.CostingPartDetails?.NetSurfaceTreatmentCost : 0
          obj.ForgingScrapWeight = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost.length > 0 ? dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost[0].ForgingScrapWeight : '-'
          obj.MachiningScrapWeight = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost.length > 0 ? dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost[0].MachiningScrapWeight : '-'
          obj.modelType = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.ModelType ? dataFromAPI?.CostingPartDetails?.ModelType : '-'
          obj.BasicRate = (dataFromAPI && dataFromAPI.BasicRate) ? dataFromAPI.BasicRate : 0
          obj.BudgetedPrice = (dataFromAPI && dataFromAPI.BudgetedPrice) ? dataFromAPI.BudgetedPrice : 0
          obj.BudgetedPriceVariance = (dataFromAPI && dataFromAPI.BudgetedPriceVariance) ? dataFromAPI.BudgetedPriceVariance : 0
          obj.CostingPartDetails = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails
          obj.npvCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails.CostingNpvResponse?.reduce((acc, obj) => Number(acc) + Number(obj.NpvCost), 0)
          obj.conditionCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails.CostingConditionResponse?.reduce((acc, obj) => Number(acc) + Number(obj.ConditionCost), 0)
          obj.netConditionCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetConditionCost
          obj.netNpvCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetNpvCost

          obj.aValue = { applicability: 'Applicability', percentage: 'Percentage (%)', value: 'Value' }
          obj.overheadOn = {
            overheadTitle: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadApplicability : '-',
            overheadValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOverheadCost !== null ? dataFromAPI?.CostingPartDetails?.NetOverheadCost : '-',
            overheadPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadPercentage : '-',
            overheadRMPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadRMPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadRMPercentage : '-',
            overheadBOPPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadBOPPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadBOPPercentage : '-',
            overheadCCPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadCCPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadCCPercentage : '-',
            OverheadCRMHead: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadCRMHead !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadCRMHead : '-',
            OverheadRemark: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.Remark !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.Remark : '-',
          }

          obj.profitOn = {
            profitTitle: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitApplicability : '-',
            profitValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetProfitCost !== null ? dataFromAPI?.CostingPartDetails?.NetProfitCost : '-',
            profitPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitPercentage : '-',
            profitRMPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitRMPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitRMPercentage : '-',
            profitBOPPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitBOPPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitBOPPercentage : '-',
            profitCCPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitCCPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitCCPercentage : '-',
            ProfitCRMHead: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitCRMHead !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitCRMHead : '-',
            ProfitRemark: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.Remark !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.Remark : '-',
          }


          obj.rejectionOn = {
            rejectionTitle: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionApplicability : '-',
            rejectionValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionTotalCost !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionTotalCost : 0,
            rejectionPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionPercentage !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionPercentage : '-',
            RejectionCRMHead: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionCRMHead !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionCRMHead : '-',
            RejectionRemark: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.Remark !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.Remark : '-',
          }

          obj.iccOn = {
            iccTitle: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability : '-',
            iccValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost : 0,
            iccPercentage: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.InterestRate !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.InterestRate : '-',
            ICCCRMHead: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.ICCCRMHead !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.ICCCRMHead : '-',
            ICCRemark: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.Remark !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.Remark : '-',
          }

          const paymentTermDetail = dataFromAPI?.CostingPartDetails?.CostingPaymentTermDetails?.PaymentTermDetail;

          obj.paymentTerms = {
            paymentTitle: paymentTermDetail?.PaymentTermApplicability || '-',
            paymentValue: paymentTermDetail?.NetCost || 0,
            paymentPercentage: paymentTermDetail?.InterestRate || '-',
            PaymentTermCRMHead: paymentTermDetail?.PaymentTermCRMHead || '-',
            PaymentTermRemark: paymentTermDetail?.Remark || '-',
          };
          obj.CostingRejectionRecoveryDetails = (dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails.CostingRejectionDetail && dataFromAPI?.CostingPartDetails.CostingRejectionDetail?.CostingRejectionRecoveryDetails) ?? {}

          obj.nOverheadProfit = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOverheadAndProfitCost ? dataFromAPI?.CostingPartDetails?.NetOverheadAndProfitCost : 0

          obj.packagingCost = dataFromAPI?.CostingPartDetails
            && dataFromAPI?.CostingPartDetails?.NetPackagingCost !== null ? dataFromAPI?.CostingPartDetails?.NetPackagingCost
            : 0
          obj.freight = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetFreightCost !== null ? dataFromAPI?.CostingPartDetails?.NetFreightCost : 0
          obj.nPackagingAndFreight = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetFreightPackagingCost ? dataFromAPI?.CostingPartDetails?.NetFreightPackagingCost : 0


          obj.bopPHandlingCharges = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.BOPHandlingCharges !== null ? dataFromAPI?.CostingPartDetails?.BOPHandlingCharges : 0
          obj.bopHandlingPercentage = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.BOPHandlingPercentage !== null ? dataFromAPI?.CostingPartDetails?.BOPHandlingPercentage : 0
          obj.bopHandlingChargeType = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.BOPHandlingChargeType !== null ? dataFromAPI?.CostingPartDetails?.BOPHandlingChargeType : ''

          obj.toolMaintenanceCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolMaintenanceCost !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolMaintenanceCost : 0
          obj.toolPrice = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolCost !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolCost : 0
          obj.amortizationQty = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].Life !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].Life : 0

          obj.toolApplicability = { applicability: 'Applicability', value: 'Value', }
          obj.toolApplicabilityValue = {
            toolTitle: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolCostType !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolCostType : "-",
            toolValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolApplicabilityCost !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolApplicabilityCost : 0,
          }

          obj.TotalTCOCost = dataFromAPI?.CostingPartDetails?.CostingTCOResponse ? TotalTCOCostCal((dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails) ? dataFromAPI?.CostingPartDetails?.CostingTCOResponse : {}, dataFromAPI?.CostingPartDetails?.CostingPaymentTermDetails ?? {}) + checkForNull(dataFromAPI?.NetPOPrice) + checkForNull(dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetNpvCost) : 0

          obj.toolAmortizationCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolAmortizationCost !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolAmortizationCost : 0
          obj.totalToolCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetToolCost !== null ? dataFromAPI?.CostingPartDetails?.NetToolCost : 0

          obj.totalCost = dataFromAPI?.CostingPartDetails && dataFromAPI.TotalCost ? dataFromAPI.TotalCost : 0
          obj.otherDiscount = { discount: 'Discount %', value: 'Value', }
          obj.otherDiscountValue = {
            discountPercentValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountPercentage !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountPercentage : 0,
            discountValue: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountValue : 0,
            discountApplicablity: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.DiscountApplicability : 0,
            dicountType: dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.DiscountCostType !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.DiscountCostType : 0
          }
          obj.netDiscountsCost = dataFromAPI?.CostingPartDetails?.NetDiscountsCost
          obj.anyOtherCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.AnyOtherCost !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.AnyOtherCost : 0
          obj.anyOtherCostType = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.OtherCostType !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.OtherCostType : '-'
          obj.anyOtherCostApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.AnyOtherCost !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.OtherCostApplicability : 0
          obj.anyOtherCostPercent = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.OtherCostPercentage !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.OtherCostPercentage : 0
          obj.remark = dataFromAPI && dataFromAPI.OtherRemark ? dataFromAPI.OtherRemark : '-'
          obj.nPOPriceWithCurrency = dataFromAPI && dataFromAPI.NetPOPriceInOtherCurrency ? dataFromAPI.NetPOPriceInOtherCurrency : 0
          obj.currency = {
            currencyTitle: dataFromAPI && dataFromAPI.Currency ? dataFromAPI?.Currency : '-',
            currencyValue: dataFromAPI && dataFromAPI.CurrencyExchangeRate ? dataFromAPI?.CurrencyExchangeRate : '-',
          }

          obj.nPOPrice = dataFromAPI.NetPOPrice && dataFromAPI.NetPOPrice !== null ? dataFromAPI.NetPOPrice : 0
          obj.effectiveDate = dataFromAPI.EffectiveDate ? dataFromAPI.EffectiveDate : ''

          obj.attachment = dataFromAPI.Attachements ? dataFromAPI.Attachements : []
          obj.approvalButton = ''
          // //RM
          obj.netRMCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost : []
          // //BOP Cost
          obj.netBOPCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingBoughtOutPartCost : []
          // //COnversion Cost
          obj.netConversionCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingConversionCost : '-'
          obj.netTransportationCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.ChildPartTransportationDetails ?? [] : []
          obj.surfaceTreatmentDetails = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.SurfaceTreatmentDetails : []
          // //OverheadCost and Profit
          obj.netOverheadCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail : '-'
          obj.netProfitCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail : '-'
          // // Rejection
          obj.netRejectionCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail : '-'

          //payment terms and ICC
          obj.netPaymentIccCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail : '-'

          // //Net Packaging and Freight
          obj.netPackagingCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingPackagingDetail : []
          obj.netFreightCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingFreightDetail : []
          // //Tool Cost
          obj.netToolCostView = dataFromAPI?.CostingPartDetails ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse : []
          obj.totalTabSum = checkForNull(obj.nTotalRMBOPCC) + checkForNull(obj.nsTreamnt) + checkForNull(obj.nOverheadProfit) + checkForNull(obj.nPackagingAndFreight) + checkForNull(obj.totalToolCost)

          // //For Drawer Edit
          obj.partId = dataFromAPI && dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.PartId ? dataFromAPI?.CostingPartDetails?.PartId : '-' // PART NUMBER KEY NAME
          obj.partNumber = dataFromAPI && dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.PartNumber ? dataFromAPI?.CostingPartDetails?.PartNumber : '-'

          obj.plantId = dataFromAPI.PlantId ? dataFromAPI.PlantId : '-'
          obj.plantName = dataFromAPI.PlantName ? dataFromAPI.PlantName : '-'
          obj.plantCode = dataFromAPI.PlantCode ? dataFromAPI.PlantCode : '-'
          obj.vendorId = dataFromAPI.VendorId ? dataFromAPI.VendorId : '-'
          obj.vendorName = dataFromAPI.VendorName ? dataFromAPI.VendorName : '-'
          obj.vendorCode = dataFromAPI.VendorCode ? dataFromAPI.VendorCode : '-'
          obj.vendor = dataFromAPI.VendorName && dataFromAPI.VendorCode ? `${dataFromAPI.VendorName} (${dataFromAPI.VendorCode})` : '-'
          obj.vendorPlantId = dataFromAPI.VendorPlantId ? dataFromAPI.VendorPlantId : '-'
          obj.vendorPlantName = dataFromAPI.VendorPlantName ? dataFromAPI.VendorPlantName : '-'
          obj.vendorPlantCode = dataFromAPI.VendorPlantCode ? dataFromAPI.VendorPlantCode : '-'
          obj.costingId = dataFromAPI.CostingId ? dataFromAPI.CostingId : '-'
          obj.oldPoPrice = dataFromAPI.OldPOPrice ? dataFromAPI.OldPOPrice : 0
          obj.technology = dataFromAPI.Technology ? dataFromAPI.Technology : '-'
          obj.technologyId = dataFromAPI.TechnologyId ? dataFromAPI.TechnologyId : '-'
          obj.shareOfBusinessPercent = dataFromAPI.ShareOfBusinessPercent ? dataFromAPI.ShareOfBusinessPercent : 0
          obj.destinationPlantCode = dataFromAPI.DestinationPlantCode ? dataFromAPI.DestinationPlantCode : '-'
          obj.destinationPlantName = dataFromAPI.DestinationPlantName ? dataFromAPI.DestinationPlantName : '-'
          obj.destinationPlantId = dataFromAPI.DestinationPlantId ? dataFromAPI.DestinationPlantId : '-'
          obj.CostingHeading = dataFromAPI.CostingHeading ? dataFromAPI.CostingHeading : '-'
          obj.partName = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.PartName ? dataFromAPI?.CostingPartDetails?.PartName : '-'
          obj.netOtherOperationCost = dataFromAPI && dataFromAPI?.CostingPartDetails?.NetOtherOperationCost ? dataFromAPI?.CostingPartDetails?.NetOtherOperationCost : 0
          obj.masterBatchTotal = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.MasterBatchTotal ? dataFromAPI?.CostingPartDetails?.MasterBatchTotal : 0
          obj.masterBatchRMPrice = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.MasterBatchRMPrice ? dataFromAPI?.CostingPartDetails?.MasterBatchRMPrice : 0
          obj.masterBatchPercentage = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.MasterBatchPercentage ? dataFromAPI?.CostingPartDetails?.MasterBatchPercentage : 0
          obj.isApplyMasterBatch = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsApplyMasterBatch ? dataFromAPI?.CostingPartDetails?.IsApplyMasterBatch : false
          obj.IsAssemblyCosting = dataFromAPI.IsAssemblyCosting ? dataFromAPI.IsAssemblyCosting : ""
          obj.childPartBOPHandlingCharges = dataFromAPI?.CostingPartDetails?.ChildPartBOPHandlingCharges ? dataFromAPI?.CostingPartDetails?.ChildPartBOPHandlingCharges : []
          obj.masterBatchRMName = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.MasterBatchRMName ? dataFromAPI?.CostingPartDetails?.MasterBatchRMName : '-'
          obj.costingHeadCheck = dataFromAPI.CostingHead && dataFromAPI.CostingHead !== null ? dataFromAPI.CostingHead : '';
          obj.RawMaterialCalculatorId = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.RawMaterialCalculatorId ? dataFromAPI?.CostingPartDetails?.RawMaterialCalculatorId : 0
          //MASTER BATCH OBJECT
          obj.CostingMasterBatchRawMaterialCostResponse = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingMasterBatchRawMaterialCostResponse ? dataFromAPI?.CostingPartDetails?.CostingMasterBatchRawMaterialCostResponse : []
          obj.NCCPartQuantity = dataFromAPI.NCCPartQuantity && dataFromAPI.NCCPartQuantity !== null ? dataFromAPI.NCCPartQuantity : '';
          obj.IsRegularized = dataFromAPI.IsRegularized && dataFromAPI.IsRegularized !== null ? dataFromAPI.IsRegularized : '';
          obj.RevisionNumber = dataFromAPI.RevisionNumber ? dataFromAPI.RevisionNumber : '-'
          // GETTING WARNING MESSAGE WITH APPROVER NAME AND LEVEL WHEN COSTING IS UNDER APPROVAL 
          obj.getApprovalLockedMessage = dataFromAPI.ApprovalLockedMessage && dataFromAPI.ApprovalLockedMessage !== null ? dataFromAPI.ApprovalLockedMessage : '';
          obj.AssemblyCostingId = dataFromAPI.AssemblyCostingId && dataFromAPI.AssemblyCostingId !== null ? dataFromAPI.AssemblyCostingId : '';
          obj.SubAssemblyCostingId = dataFromAPI.SubAssemblyCostingId && dataFromAPI.SubAssemblyCostingId !== null ? dataFromAPI.SubAssemblyCostingId : '';


          //USED FOR DOWNLOAD PURPOSE

          obj.overHeadApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail !== null && dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingOverheadDetail.OverheadApplicability : '-'
          obj.overHeadApplicablityValue = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOverheadCost !== null ? dataFromAPI?.CostingPartDetails?.NetOverheadCost : '-'
          obj.ProfitApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingProfitDetail.ProfitApplicability : '-'
          obj.ProfitApplicablityValue = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetProfitCost !== null ? dataFromAPI?.CostingPartDetails?.NetProfitCost : '-'
          obj.rejectionApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionApplicability : '-'
          obj.rejectionApplicablityValue = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionTotalCost !== null ? dataFromAPI?.CostingPartDetails?.CostingRejectionDetail.RejectionTotalCost : 0
          obj.iccApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.ICCApplicability : '-'
          obj.iccApplicablityValue = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost !== null ? dataFromAPI?.CostingPartDetails?.CostingInterestRateDetail.ICCApplicabilityDetail.NetCost : 0
          obj.paymentApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingPaymentTermDetails?.PaymentTermDetail?.PaymentTermApplicability ? dataFromAPI?.CostingPartDetails?.CostingPaymentTermDetails?.PaymentTermDetail?.PaymentTermApplicability : '-'
          obj.paymentcApplicablityValue = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingPaymentTermDetails?.PaymentTermDetail?.NetCost ? dataFromAPI?.CostingPartDetails?.CostingPaymentTermDetails?.PaymentTermDetail?.NetCost : 0
          obj.toolMaintenanceCostApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolCostType !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolCostType : 0
          obj.toolMaintenanceCostApplicablityValue = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse.length > 0 && dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolApplicabilityCost !== null ? dataFromAPI?.CostingPartDetails?.CostingToolCostResponse[0].ToolApplicabilityCost : 0
          obj.otherDiscountType = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.DiscountCostType !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.DiscountCostType : 0
          obj.otherDiscountApplicablity = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.DiscountApplicability : 0
          obj.otherDiscountValuePercent = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountPercentage !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountPercentage : 0
          obj.otherDiscountCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountValue !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.HundiOrDiscountValue : 0
          obj.currencyTitle = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.OtherCostDetails.Currency !== null ? dataFromAPI?.CostingPartDetails?.OtherCostDetails.Currency : '-'
          obj.costingHead = dataFromAPI.TypeOfCosting && dataFromAPI.TypeOfCosting === 0 ? 'ZBC' : 'VBC'
          obj.costingVersion = `${DayTime(obj?.costingDate).format('DD-MM-YYYY')}-${obj?.CostingNumber}-${obj?.status}`
          obj.PoPriceWithDate = `${obj?.poPrice} (${(obj?.effectiveDate && obj?.effectiveDate !== '') ? DayTime(obj?.effectiveDate).format('DD-MM-YYYY') : "-"})`
          obj.rmRate = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].RMRate)
          obj.scrapRate = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].ScrapRate)
          obj.BurningLossWeight = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].BurningLossWeight)
          obj.ScrapWeight = obj?.netRMCostView && (obj?.netRMCostView.length > 1 || obj?.IsAssemblyCosting === true) ? 'Multiple RM' : (obj?.netRMCostView && obj?.netRMCostView[0] && obj?.netRMCostView[0].ScrapWeight)
          obj.nPoPriceCurrency = obj?.nPOPriceWithCurrency !== null ? (obj?.currency?.currencyTitle) !== "-" ? (obj?.nPOPriceWithCurrency) : obj?.nPOPrice : '-'
          obj.currencyRate = obj?.CostingHeading !== VARIANCE ? obj?.currency.currencyValue === '-' ? '-' : obj?.currency.currencyValue : ''
          obj.costingTypeId = dataFromAPI?.CostingTypeId ? dataFromAPI?.CostingTypeId : ''
          obj.customerId = dataFromAPI?.CustomerId ? dataFromAPI?.CustomerId : EMPTY_GUID
          obj.customerName = dataFromAPI?.CustomerName ? dataFromAPI?.CustomerName : ''
          obj.customerCode = dataFromAPI?.CustomerCode ? dataFromAPI?.CustomerCode : ''
          obj.customer = dataFromAPI?.Customer ? dataFromAPI?.Customer : ''
          obj.plantExcel = dataFromAPI.CostingTypeId === ZBCTypeId ? `${dataFromAPI.PlantName}` : `${dataFromAPI.DestinationPlantName}`
          obj.vendorExcel = dataFromAPI.VendorName ? `${dataFromAPI.VendorName} (${dataFromAPI.VendorCode})` : ''
          obj.castingWeightExcel = checkForDecimalAndNull(dataFromAPI?.CostingPartDetails?.CastingWeight, getConfigurationKey().NoOfDecimalForPrice)
          obj.meltingLossExcel = `${checkForDecimalAndNull(dataFromAPI?.CostingPartDetails?.MeltingLoss, getConfigurationKey().NoOfDecimalForPrice)} (${dataFromAPI?.CostingPartDetails?.LossPercentage ? dataFromAPI?.CostingPartDetails?.LossPercentage : 0}%)`
          obj.sobPercentageExcel = dataFromAPI?.ShareOfBusinessPercent ? `${dataFromAPI?.ShareOfBusinessPercent}%` : 0
          // FOR MULTIPLE TECHNOLOGY COSTING SUMMARY DATA
          obj.netChildPartsCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetChildPartsCost ? dataFromAPI?.CostingPartDetails?.NetChildPartsCost : 0
          obj.netOperationCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOperationCost ? dataFromAPI?.CostingPartDetails?.NetOperationCost : 0
          obj.netProcessCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetProcessCost ? dataFromAPI?.CostingPartDetails?.NetProcessCost : 0
          obj.netBoughtOutPartCost = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetBoughtOutPartCost ? dataFromAPI?.CostingPartDetails?.NetBoughtOutPartCost : 0
          obj.multiTechnologyCostingDetails = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.MultiTechnologyCostingDetails ? dataFromAPI?.CostingPartDetails?.MultiTechnologyCostingDetails : ''
          obj.isRmCutOffApplicable = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsRMCutOffApplicable && dataFromAPI?.CostingPartDetails?.IsRMCutOffApplicable
          obj.isIncludeToolCostWithOverheadAndProfit = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsIncludeToolCostWithOverheadAndProfit && dataFromAPI?.CostingPartDetails?.IsIncludeToolCostWithOverheadAndProfit
          obj.isIncludeSurfaceTreatmentWithRejection = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsIncludeSurfaceTreatmentWithRejection && dataFromAPI?.CostingPartDetails?.IsIncludeSurfaceTreatmentWithRejection
          obj.isIncludeSurfaceTreatmentWithOverheadAndProfit = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsIncludeSurfaceTreatmentWithOverheadAndProfit && dataFromAPI?.CostingPartDetails?.IsIncludeSurfaceTreatmentWithOverheadAndProfit
          obj.isIncludeOverheadAndProfitInICC = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsIncludeOverheadAndProfitInICC && dataFromAPI?.CostingPartDetails?.IsIncludeOverheadAndProfitInICC
          obj.isIncludeToolCostInCCForICC = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsIncludeToolCostInCCForICC && dataFromAPI?.CostingPartDetails?.IsIncludeToolCostInCCForICC
          obj.rawMaterialCostWithCutOff = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.RawMaterialCostWithCutOff ? dataFromAPI?.CostingPartDetails?.RawMaterialCostWithCutOff : ''
          obj.MachiningScrapRate = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost.length > 0 ? dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost[0].MachiningScrapRate : '-'
          obj.anyOtherCostTotal = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.NetOtherCost ? dataFromAPI?.CostingPartDetails?.NetOtherCost : '-'
          obj.saNumber = dataFromAPI?.SANumber ?? '-'
          obj.lineNumber = dataFromAPI?.LineNumber ?? '-'
          obj.partType = dataFromAPI?.CostingPartDetails?.Type
          obj.partTypeId = dataFromAPI?.CostingPartDetails?.PartTypeId
          obj.isToolCostProcessWise = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.IsToolCostProcessWise
          obj.ScrapRecoveryPercentage = dataFromAPI?.CostingPartDetails && dataFromAPI?.CostingPartDetails?.ScrapRecoveryPercentage
          obj.IsShowCheckBoxForApproval = dataFromAPI?.IsShowCheckBoxForApproval
          obj.IsScrapRecoveryPercentageApplied = dataFromAPI?.IsScrapRecoveryPercentageApplied
          obj.OtherCostDetailsOverhead = setDynamicKeys(dataFromAPI?.CostingPartDetails?.OtherCostDetails, 'OverHead')
          obj.OtherCostDetailsProcess = setDynamicKeys(dataFromAPI?.CostingPartDetails?.OtherCostDetails, 'Process')
          obj.CalculatorType = dataFromAPI?.CostingPartDetails?.CalculatorType ?? ''
          obj.InfoCategory = dataFromAPI?.InfoCategory ? dataFromAPI?.InfoCategory : '-'
          obj.TaxCodeList = dataFromAPI?.CostingPartDetails?.TaxCodeList ? dataFromAPI?.CostingPartDetails?.TaxCodeList : []
          // temp.push(VIEW_COSTING_DATA)
          if (index >= 0) {

            temp[index] = obj
          } else {
            const index = temp.findIndex(
              (data) => data.costingId === values.costings.value,
            )

            if (String(index) === '-1') {

              temp.push(obj)
              setIsZbcSelected(true)
              setIsVbcSelected(false)
              setisCbcSelected(false)
            } else {
              if (isVbcSelected) {
                setIsVbcSelected(true)
                setIsZbcSelected(false)
                setisCbcSelected(false)
              } else if (isZbcSelected) {
                setIsVbcSelected(false)
                setIsZbcSelected(true)
                setisCbcSelected(false)
              } else if (isCbcSelected) {
                setIsVbcSelected(false)
                setIsZbcSelected(false)
                setisCbcSelected(true)
              }

              Toaster.warning('This costing is already present for comparison.')
              return
            }
          }
          dispatch(setCostingViewData(temp))
          //COMENTED FOR MINDA
          // setIsVbcSelected(false)
          // setIsZbcSelected(true)
          // setisCbcSelected(false)

          props.closeDrawer('submit')
        }
      }),
    )
  }

  /**
   * @method  handlePlantChange
   * @description Getting costing dropdown on basis of plant selection
   */
  const handlePlantChange = (value) => {
    setCustomerId(value)
    setPlant(value)
    if (isZbcSelected) {
      dispatch(
        getCostingByVendorAndVendorPlant(partNo.value !== undefined ? partNo.value : partNo.partId, '', '', value.value, '', ZBCTypeId, '', (res) => {
          setValue('costings', '')
        }),
      )
    }
    else if (isCbcSelected) {
      dispatch(getCostingByVendorAndVendorPlant(partNo.value !== undefined ? partNo.value : partNo.partId, '', '', value.value, CustomerId, CBCTypeId, '', (res) => {
        setValue('costings', '')
      }),
      )
    }
  }

  /**
   * @method handleVendorNameChange
   * @description GETTING COSTING ON BASIS OF VENDOR NAME AND VENDOR PLANT
  */

  const handleVendorNameChange = ({ value }) => {
    if (value === '') {
      value = '00000000-0000-0000-0000-000000000000'
    }
    // dispatch(getCostingByVendorAndVendorPlant(partNo.partId, VendorId, vendorPlantId, destinationPlantId, customerId, costingTypeId, () => { }))
    const infoCategoryValue = isInfoCategorySelected === true ? infoCategory[0]?.Text : infoCategory[1]?.Text
    dispatch(getCostingByVendorAndVendorPlant(partNo.partId, value, '', '', '', costingTypeId, infoCategoryValue, (res) => {
      setValue('costings', '')
    }),
    )
  }

  /**
  * @method handleVendorNameChange
  * @description GETTING COSTING ON BASIS OF VENDOR NAME AND VENDOR PLANT
  */

  const handleDestinationPlantNameChange = (value) => {
    setPlant(value)
    if (value === '') {
      value = '00000000-0000-0000-0000-000000000000'
    }
    if (isVbcSelected) {
      const infoCategoryValue = isInfoCategorySelected === true ? infoCategory[0]?.Text : infoCategory[1]?.Text
      dispatch(getCostingByVendorAndVendorPlant(partNo.partId, vendorId, '', value.value, '', VBCTypeId, infoCategoryValue, (res) => {
        setValue('costings', '')
      }))
    }

  }

  const handleDestinationPlantNameChangeForNCC = ({ value }) => {
    setVendorId(value)
    if (value === '') {
      value = '00000000-0000-0000-0000-000000000000'
    }
    dispatch(getPlantSelectListByType(ZBC, "COSTING", '', () => { }))

  }
  const handleVendorChangeForNCC = ({ value }) => {
    // setValue('destinationPlant', '')
    dispatch(getCostingByVendorAndVendorPlant(partNo.partId, value, '', '', '', costingTypeId, '', (res) => {
      setValue('costings', '')
    }),
    )
  }
  const handleCostingVersionChange = (value) => {
    setSameCostingNumber(value.label)
  }

  /**
   * @method renderListing
   * @description FOR SHOWING DROPDOWN MENU
  */
  const renderListing = (label) => {
    const temp = []
    if (label === 'plant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }
    if (label === 'vendor') {
      vendorSelectList && vendorSelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }
    if (label === 'vendorPlant') {
      filterPlantList && filterPlantList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }
    if (label === 'ClientList') {
      clientSelectList && clientSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'costing') {
      if (viewMode === true) {
        costingSelectList && costingSelectList.map((item) => {
          if (item.Status === APPROVED || item.Status === REJECTED || item.Status === HISTORY || item.Status === APPROVED_BY_SIMULATION) {
            temp.push({ label: item.DisplayCostingNumber, value: item.CostingId })
            return null
          }
          return null
        })
      } else {
        costingSelectList && costingSelectList.map((item) => {
          temp.push({ label: item.DisplayCostingNumber, value: item.CostingId })
          return null
        })
      }
      return temp
    }
    if (label === 'DestinationPlant') {
      DestinationplantSelectList && DestinationplantSelectList.map((item) => {
        if (item.PlantId === '0') return false
        temp.push({ label: item.PlantNameCode, value: item.PlantId })
        return null
      })
      return temp
    }
  }

  const categoryTypeOnChange = (e) => {
    setIsInfoCategorySelected(!isInfoCategorySelected)
    if (isVbcSelected) {
      const infoCategoryValue = !isInfoCategorySelected === true ? infoCategory[0]?.Text : infoCategory[1]?.Text
      setTimeout(() => {
        dispatch(getCostingByVendorAndVendorPlant(partNo.partId, vendorId, '', plant?.value, '', VBCTypeId, infoCategoryValue, (res) => {
          setValue('costings', '')
        }))
      }, 50);
    }
  }

  return (
    <div>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={"drawer-wrapper add-to-comparison-drawer"}>
            <Row className="drawer-heading">
              <Col>
                <div className={"header-wrapper left"}>
                  <h3>
                    {isEditFlag ? "Change Version:" : "Add to Comparison:"}

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
              <Row className="pl-3 my-3">
                <Col>
                  {showCostingSection.ZBC &&
                    <RadioHookForm
                      customClassName="d-inline-flex flex-row-reverse align-items-baseline pr-3"
                      className={"filter-form-section mr-1"}
                      name={"ZBC"}
                      label={"ZBC"}
                      defaultValue={isZbcSelected}
                      control={control}
                      Controller={Controller}
                      register={register}
                      handleChange={() => handleComparison(ZBCTypeId)}
                    />}
                  {showCostingSection.VBC && <RadioHookForm
                    customClassName="d-inline-flex flex-row-reverse align-items-baseline pr-3"
                    className={"filter-form-section mr-1"}
                    name={"VBC"}
                    label={"VBC"}
                    defaultValue={isVbcSelected}
                    control={control}
                    Controller={Controller}
                    register={register}
                    handleChange={() => handleComparison(VBCTypeId)}
                  />}
                  {showCostingSection.CBC && <RadioHookForm
                    customClassName="d-inline-flex flex-row-reverse align-items-baseline pr-3"
                    className={"filter-form-section mr-1"}
                    name={"CBC"}
                    label={"CBC"}
                    defaultValue={isCbcSelected}
                    control={control}
                    Controller={Controller}
                    register={register}
                    handleChange={() => handleComparison(CBCTypeId)}
                  />}

                  {/******************* THIS CODE WILL USE AFTER DEPLOYED CODE FROM BACKEND */}
                  {/*  {showCostingSection.NCC &&  <RadioHookForm
                    customClassName="d-inline-flex flex-row-reverse align-items-baseline"
                    className={"filter-form-section mr-1"}
                    name={"NCC"}
                    label={"NCC"}
                    defaultValue={isNccSelected}
                    control={control}
                    Controller={Controller}
                    register={register}
                    handleChange={() => handleComparison(NCCTypeId)}
                  />} */}
                  {/****************** THIS CODE WILL USE AFTER DEPLOYED CODE FROM BACKEND */}

                </Col>
              </Row>
              <Row className="pl-3">
                {isZbcSelected && (
                  <Col md="12">
                    <SearchableSelectHookForm
                      label={"Plant (Code)"}
                      name={"plant"}
                      placeholder={"Select"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={isEditFlag ? plantName : ""}
                      options={renderListing('plant')}
                      mandatory={true}
                      handleChange={handlePlantChange}
                      errors={errors.plant}
                    />
                  </Col>
                )}
                {isVbcSelected === true && (
                  <>
                    <Col md="12">
                      <SearchableSelectHookForm
                        label={`${vendorLabel} (Code)`}
                        name={"vendor"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={vendor !== " " ? vendor : ""}
                        options={renderListing('vendor')}
                        mandatory={true}
                        handleChange={handleVendorChange}
                        errors={errors.vendor}
                      />
                    </Col>
                    {getConfigurationKey().IsVendorPlantConfigurable && (
                      <Col md="12">
                        <SearchableSelectHookForm
                          label={`${vendorLabel} Plant`}
                          name={"vendorPlant"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          // defaultValue={plant.length !== 0 ? plant : ''}
                          options={renderListing('vendorPlant')}
                          mandatory={true}
                          handleChange={handleVendorNameChange}
                          errors={errors.vendorPlant}
                        />
                      </Col>
                    )}
                    {getConfigurationKey().IsDestinationPlantConfigure && (
                      <Col md="12">
                        <SearchableSelectHookForm
                          label={"Destination Plant (Code)"}
                          name={"destinationPlant"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          // defaultValue={plant.length !== 0 ? plant : ''}
                          options={renderListing('DestinationPlant')}
                          mandatory={true}
                          handleChange={handleDestinationPlantNameChange}
                          disabled={vendor === '' ? true : false}
                          errors={errors.destinationPlant}
                        />
                      </Col>
                    )}
                  </>
                )}
                {isCbcSelected && (
                  <>
                    <Col md="12">
                      <SearchableSelectHookForm
                        label={"Customer (Code)"}
                        name={"clientName"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        //defaultValue={plant.length !== 0 ? plant : ''}
                        options={renderListing("ClientList")}
                        mandatory={true}
                        handleChange={handleCustomerChange}
                        errors={errors.clientName}
                      />
                    </Col>
                    {getConfigurationKey().IsCBCApplicableOnPlant && (
                      <Col md="12">
                        <SearchableSelectHookForm
                          label={"Plant (Code)"}
                          name={"plant"}
                          placeholder={"Select"}
                          Controller={Controller}
                          control={control}
                          rules={{ required: true }}
                          register={register}
                          defaultValue={isEditFlag ? plantName : ""}
                          options={renderListing('DestinationPlant')}
                          mandatory={true}
                          handleChange={handlePlantChange}
                          errors={errors.plant}
                          disabled={Object.keys(customer).length === 0 ? true : false}
                        />
                      </Col>
                    )}
                  </>

                )}
                {isNccSelected && <>
                  {getConfigurationKey().IsDestinationPlantConfigure && (
                    <Col md="12">
                      <SearchableSelectHookForm
                        label={"Destination Plant (Code)"}
                        name={"destinationPlant"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        // defaultValue={plant.length !== 0 ? plant : ''}
                        options={renderListing('DestinationPlant')}
                        mandatory={true}
                        handleChange={handleDestinationPlantNameChangeForNCC}
                        errors={errors.destinationPlant}
                      />
                    </Col>
                  )}
                  <Col md="12">
                    <SearchableSelectHookForm
                      label={`${vendorLabel} (Code)`}
                      name={"vendor"}
                      placeholder={"Select"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      // defaultValue={plant.length !== 0 ? plant : ''}
                      options={renderListing('vendor')}
                      mandatory={true}
                      handleChange={handleVendorChangeForNCC}
                      errors={errors.vendor}
                    />
                  </Col>
                </>}
                {isVbcSelected && <Col md="12">
                  <span className="d-inline-block">
                    <label
                      className={`custom-checkbox mb-0`}
                      onChange={(e) => categoryTypeOnChange(e)}
                      selected={isInfoCategorySelected}
                      id={'category'}
                    >
                      Category
                      <input
                        type="checkbox"
                      />
                      <span
                        className=" before-box"
                        onChange={(e) => categoryTypeOnChange(e)}
                        selected={isInfoCategorySelected}
                      />
                    </label>
                    <TooltipCustom
                      disabledIcon={false}
                      id={`category`}
                      tooltipText={infoCategory && `If checkbox is selected then category will be ${infoCategory[0]?.Text}, otherwise category will be ${infoCategory[1]?.Text}.`}
                    />
                  </span>
                </Col>}
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
                    options={renderListing('costing')}
                    mandatory={true}
                    handleChange={handleCostingVersionChange}
                    errors={errors.costings}
                    disabled={Object.keys(plant).length === 0 ? true : false}
                  />
                </Col>
              </Row>

              <Row className="justify-content-between my-3">
                <div className="col-sm-12 text-right">
                  <button
                    type={"button"}
                    className="reset mr15 cancel-btn"
                    onClick={toggleDrawer}
                  ><div className={"cancel-icon"}></div>
                    {"Cancel"}
                  </button>

                  <button
                    type="submit"
                    className="submit-button save-btn"
                  // onClick={addHandler}
                  >
                    {isEditFlag ? (
                      <div className={"save-icon"}></div>
                    ) : (
                      <div class="plus"></div>
                    )}{" "}
                    {isEditFlag ? "Ok" : "Add"}
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
