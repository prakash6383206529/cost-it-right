import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm, } from 'react-hook-form';
import { getCostingCostDetails, gridDataAdded, saveAssemblyPartRowCostingCalculation, saveCostingPaymentTermDetail, saveCostingSurfaceTab, saveDiscountOtherCostTab, setComponentDiscountOtherItemData, setSurfaceData } from '../../../actions/Costing';
import SurfaceTreatmentCost from './SurfaceTreatmentCost';
import TransportationCost from './TransportationCost';
import Drawer from '@material-ui/core/Drawer';
import { Row, Col, } from 'reactstrap';
import Toaster from '../../../../common/Toaster';
import { MESSAGES } from '../../../../../config/message';
import { costingInfoContext, IsNFRContext, netHeadCostContext, NetPOPriceContext } from '../../CostingDetailStepTwo';
import { calculatePercentageValue, checkForDecimalAndNull, checkForNull, getCostValues, loggedInUserId } from '../../../../../helper';
import { createToprowObjAndSave, findrmCctData, formatMultiTechnologyUpdate, viewAddButtonIcon } from '../../../CostingUtil';
import { IsPartType, ViewCostingContext } from '../../CostingDetails';
import { useState } from 'react';
import { IdForMultiTechnology, PART_TYPE_ASSEMBLY } from '../../../../../config/masterData';
import { debounce } from 'lodash';
import { updateMultiTechnologyTopAndWorkingRowCalculation } from '../../../actions/SubAssembly';
import { ASSEMBLY, ASSEMBLYNAME, CC, HANGER, LEVEL0, PAINT, PART_COST, PART_COST_CC, RM, RMCC, SURFACETREATMENTLABEL, TAPE, TAPEANDPAINT, WACTypeId } from '../../../../../config/constants';
import { reactLocalStorage } from 'reactjs-localstorage';
import { PreviousTabData } from '../../CostingHeaderTabs';
import Hanger from './Hanger';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import Button from '../../../../layout/Button';
import PaintAndMasking from './PaintAndMasking';
import ExtraCost from './ExtraCost';
import _ from 'lodash';
import TooltipCustom from '../../../../common/Tooltip';
function SurfaceTreatment(props) {
  const { surfaceData, transportationData, item } = props;
  const previousTab = useContext(PreviousTabData) || 0;
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
  const { handleSubmit, control, setValue, formState: { errors }, register } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const dispatch = useDispatch()

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const { ComponentItemDiscountData, CostingEffectiveDate, RMCCTabData, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, DiscountCostData, ToolTabData, getAssemBOPCharge, isBreakupBoughtOutPartCostingFromAPI, PaymentTermDataDiscountTab } = useSelector(state => state.costing)
  const price = useContext(NetPOPriceContext)
  const costData = useContext(costingInfoContext);
  let surfaceTabData = SurfaceTabData && SurfaceTabData[0]
  const CostingViewMode = useContext(ViewCostingContext);
  const isDisable = useContext(IsNFRContext);
  const [surfaceTreatmentData, setSurfacTreatmenteData] = useState({})
  const [callDiscountApi, setCallDiscountApi] = useState(false)
  const [viewPaintAndMasking, setViewPaintAndMasking] = useState(false)
  const [viewExtraCost, setViewExtraCost] = useState(false)
  const [surfaceTableData, setSurfacetableData] = useState(item.CostingPartDetails.SurfaceTreatmentDetails)
  const [transportObj, setTrasportObj] = useState(item.CostingPartDetails.TransportationDetails)
  const [hangerCostDetails, setHangerCostDetails] = useState({ HangerCostPerPart: checkForNull(item?.CostingPartDetails?.HangerCostPerPart) ?? 0, HangerRate: checkForNull(item?.CostingPartDetails?.HangerRate) ?? 0, NumberOfPartsPerHanger: checkForNull(item?.CostingPartDetails?.NumberOfPartsPerHanger) ?? 0 })

  const [extraCostDetails, setExtraCostDetails] = useState({ TransportationCost: checkForNull(item?.CostingPartDetails?.TransportationCost) ?? 0, TransportationDetails: item?.CostingPartDetails?.TransportationDetails })

  const [paintAndMaskingDetails, setPaintAndMaskingDetails] = useState({ TotalPaintCost: checkForNull(item?.CostingPartDetails?.TotalPaintCost) ?? 0, PaintCost: checkForNull(item?.CostingPartDetails?.PaintCost) ?? 0, TapeCost: checkForNull(item?.CostingPartDetails?.TapeCost) ?? 0, PaintConsumptionCost: checkForNull(item?.CostingPartDetails?.PaintConsumptionCost) ?? 0 })



  const partType = IdForMultiTechnology.includes(String(costData?.TechnologyId))

  const [errorObjectTransport, setErrorObjectTransport] = useState({})
  const [errorObjectSurfaceTreatment, setErrorObjectSurfaceTreatment] = useState({})
  const [callAPI, setCallAPI] = useState(false)
  const headerCosts = useContext(netHeadCostContext);
  const isPartType = useContext(IsPartType);

  // useEffect(() => {
  //   setTrasportObj(item?.CostingPartDetails?.TransportationDetails)
  // }, [item?.CostingPartDetails?.TransportationDetails])

  useEffect(() => {
    setValue(`ExtraCost`, checkForDecimalAndNull(item?.CostingPartDetails?.TransportationCost, initialConfiguration?.NoOfDecimalForPrice))
    setValue(`PaintAndMasking`, checkForDecimalAndNull(item?.CostingPartDetails?.TotalPaintCost, initialConfiguration?.NoOfDecimalForPrice))
    setTimeout(() => {
      setExtraCostDetails({ TransportationCost: item?.CostingPartDetails?.TransportationCost, TransportationDetails: item?.CostingPartDetails?.TransportationDetails })
    }, 1000)
  }, [])

  useEffect(() => {
    const callApi = () => {
      setCallAPI(false)
      let rmCcData = 0
      let tabData = 0
      let surfaceTabData = 0
      let overHeadAndProfitTabData = 0
      let toolTabData = 0
      let packageAndFreightTabData = 0

      surfaceTabData = SurfaceTabData && SurfaceTabData[0]
      tabData = RMCCTabData && RMCCTabData[0]
      overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]
      packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
      toolTabData = ToolTabData && ToolTabData[0]

      let basicRateTemp = ''
      let totalCostTemp = ''
      let obj = {
        costingId: item?.CostingId,
        subAsmCostingId: item?.SubAssemblyCostingId,
        asmCostingId: item?.AssemblyCostingId
      }
      dispatch(getCostingCostDetails(obj, response => {
        if (response?.data?.Result) {
          const costingCostDetails = response?.data?.Data
          if (!partType && props.IsAssemblyCalculation) {

            rmCcData = findrmCctData(item)


            switch (item?.PartType) {
              case 'Part':
                basicRateTemp = checkForNull(costingCostDetails?.NetTotalRMBOPCC) + checkForNull(item?.CostingPartDetails?.NetSurfaceTreatmentCost)
                totalCostTemp = checkForNull(costingCostDetails?.NetTotalRMBOPCC) + checkForNull(item?.CostingPartDetails?.NetSurfaceTreatmentCost)

                break;
              case 'Sub Assembly':
                basicRateTemp = checkForNull(costingCostDetails?.TotalCalculatedRMBOPCCCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys)
                totalCostTemp = checkForNull(costingCostDetails?.TotalCalculatedRMBOPCCCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys)

                break;
              case 'Assembly':
                basicRateTemp = ((checkForNull(costingCostDetails?.TotalCalculatedRMBOPCCCostPerAssembly) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
                  checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost)
                  + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(DiscountCostData?.AnyOtherCost)) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue))

                totalCostTemp = checkForNull(basicRateTemp) + checkForNull(DiscountCostData?.totalConditionCost)

                break;

              default:
                break;
            }
            mergedAPI(totalCostTemp, props.IsAssemblyCalculation, true, basicRateTemp)
          } else if (tabData?.PartType === 'Component') {

            basicRateTemp = ((checkForNull(costingCostDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
              checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost)
              + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(DiscountCostData?.AnyOtherCost)) - checkForNull(DiscountCostData?.HundiOrDiscountValue))

            totalCostTemp = ((checkForNull(costingCostDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
              checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost)
              + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(DiscountCostData?.AnyOtherCost) +
              checkForNull(DiscountCostData?.totalConditionCost)) - checkForNull(DiscountCostData?.HundiOrDiscountValue))
            mergedAPI(totalCostTemp, false, false, basicRateTemp)
          } else if (partType) {

            basicRateTemp = (checkForNull(costingCostDetails?.NetTotalRMBOPCC) + checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
              checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
              checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(DiscountCostData?.AnyOtherCost)) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) -
              checkForNull(DiscountCostData?.HundiOrDiscountValue)

            totalCostTemp = checkForNull(basicRateTemp) + checkForNull(DiscountCostData?.totalConditionCost)
            mergedAPI(totalCostTemp, false, false, basicRateTemp)
          }
        }
      }))
    }

    const mergedAPI = (totalCostAPI, IsAssemblyCalculation, IsAssemblyPart, basicRateTemp) => {
      const tabData = RMCCTabData && RMCCTabData[0]

      const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
      const overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]
      const discountAndOtherTabData = DiscountCostData

      const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
      const toolTabData = ToolTabData && ToolTabData[0]


      let totalPOriceForAssembly = checkForNull(surfaceTabData?.CostingPartDetails?.BasicRate) + checkForNull(discountAndOtherTabData?.totalConditionCost) + checkForNull(discountAndOtherTabData?.totalNpvCost)

      let basicRate = surfaceTabData?.CostingPartDetails.BasicRate
      let requestData = {
        "CostingId": item.CostingId,
        "EffectiveDate": CostingEffectiveDate,
        "LoggedInUserId": loggedInUserId(),
        // THIS CONDITION IS USED FOR ASSEMBLY COSTING ,IN ASSEMBLY COSTING TOTAL COST IS SUM OF RMCCTAB DATA + SURFACE TREATEMNT TAB DATA OF THAT PART NUMBER (FOR PART/COMPONENT &ASSEMBLY KEY IS DIFFERENT)
        "NetPOPrice": totalCostAPI,
        "BasicRate": basicRateTemp,
        "Quantity": item?.Quantity,
        "CostingPartDetails": {
          "CostingDetailId": "00000000-0000-0000-0000-000000000000",
          "NetSurfaceTreatmentCost": item?.CostingPartDetails?.NetSurfaceTreatmentCost,
          "SurfaceTreatmentCost": item?.CostingPartDetails?.SurfaceTreatmentCost,
          "TransportationCost": item?.CostingPartDetails?.TransportationCost,
          "SurfaceTreatmentDetails": item?.CostingPartDetails?.SurfaceTreatmentDetails,
          "TransportationDetails": item?.CostingPartDetails?.TransportationDetails,
          "TotalPaintCost": item?.CostingPartDetails?.TotalPaintCost,
          "PaintCost": item?.CostingPartDetails?.PaintCost,
          "PaintConsumptionCost": item?.CostingPartDetails?.PaintConsumptionCost,
          "TapeCost": item?.CostingPartDetails?.TapeCost,
          "HangerRate": item?.CostingPartDetails?.HangerRate,
          "HangerCostPerPart": item?.CostingPartDetails?.HangerCostPerPart,
          "NumberOfPartsPerHanger": item?.CostingPartDetails?.NumberOfPartsPerHanger
        },
      }
      // IN COSTING VIEW MODE
      if (!CostingViewMode && !isDisable ) {
        // WHEN PARTTYPE IS ASSEMBLY AND NOT ASSEMBLY TECHNOLOGY
        if (IsAssemblyCalculation && !partType) {

          requestData.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = item?.CostingPartDetails?.SurfaceTreatmentCost
          requestData.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = item?.CostingPartDetails?.NetSurfaceTreatmentCost
          requestData.CostingPartDetails.TotalTransportationCostPerAssembly = item?.CostingPartDetails?.TransportationCost
          requestData.CostingPartDetails.IsAssemblyPart = IsAssemblyPart

          let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, totalPOriceForAssembly, getAssemBOPCharge, 2, CostingEffectiveDate, initialConfiguration?.IsShowCostingLabour, basicRate, isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)
          dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
        } else if (partType) {
          setTimeout(() => {
            let request = formatMultiTechnologyUpdate(subAssemblyTechnologyArray[0], totalPOriceForAssembly, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate, initialConfiguration?.IsAddPaymentTermInNetCost)

            dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))
            dispatch(gridDataAdded(true))
          }, 500);
        }

        setTimeout(() => {
          dispatch(saveCostingSurfaceTab(requestData, res => {
            if (res.data.Result) {
              Toaster.success(MESSAGES.SURFACE_TREATMENT_COSTING_SAVE_SUCCESS);
              setCallDiscountApi(true)
              props.closeDrawer('')
            }
          }))
        }, 500);
      }
    }
    if (callAPI) {
      callApi()
    }

  }, [DiscountCostData, callAPI])


  /**
  * @method toggleDrawer
  * @description TOGGLE DRAWER
  */
  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('')
  };

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    props.closeDrawer()
  }
  // const setTransportationObj = (obj, errorObjectTransport) => {
  //   setErrorObjectTransport(errorObjectTransport)
  //   setTransportationObject(obj)
  //   setTrasportObj(obj.tempObj)

  // }

  const SetSurfaceData = (obj, errorObjectSurfaceTreatment) => {


    let tempArray = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))
    let indexForUpdate = _.findIndex(tempArray, tempArrayItem => tempArrayItem.PartNumber === item.PartNumber && tempArrayItem.AssemblyPartNumber === item.AssemblyPartNumber);
    let objectToUpdate = tempArray[indexForUpdate]
    if (obj.type === 'Hanger') {
      setHangerCostDetails({ HangerCostPerPart: obj.hangerObj.HangerCostPerPart, HangerRate: obj.hangerObj.HangerRate, NumberOfPartsPerHanger: obj.hangerObj.NumberOfPartsPerHanger })

      // objectToUpdate.CostingPartDetails.HangerCostPerPart = obj.hangerObj.HangerCostPerPart
      // objectToUpdate.CostingPartDetails.HangerCostPerPartWithQuantity = obj.hangerObj.HangerCostPerPart
    } else if (obj.type === 'PaintAndMasking') {

      setPaintAndMaskingDetails({ TotalPaintCost: obj?.paintAndMaskingObj?.TotalPaintCost, PaintCost: obj?.paintAndMaskingObj?.PaintCost, TapeCost: obj?.paintAndMaskingObj?.TapeCost, PaintConsumptionCost: obj?.paintAndMaskingObj?.PaintConsumptionCost })
      setValue(`PaintAndMasking`, checkForDecimalAndNull(obj?.paintAndMaskingObj?.TotalPaintCost, initialConfiguration?.NoOfDecimalForPrice))
      // objectToUpdate.CostingPartDetails.TotalPaintCost = obj.paintAndMaskingObj.TotalPaintCost
      // objectToUpdate.CostingPartDetails.PaintCost = obj.paintAndMaskingObj.PaintCost
      // objectToUpdate.CostingPartDetails.TapeCost = obj.paintAndMaskingObj.TapeCost
      // objectToUpdate.CostingPartDetails.TotalPaintCostWithQuantity = obj.paintAndMaskingObj.TotalPaintCost
    } else if (obj.type === 'ExtraCost') {
      setExtraCostDetails({ TransportationCost: obj.extraCostObj.TransportationCost, TransportationDetails: obj.extraCostObj.TransportationDetails })
      setValue(`ExtraCost`, checkForDecimalAndNull(obj?.extraCostObj?.TransportationCost, initialConfiguration?.NoOfDecimalForPrice))
      // objectToUpdate.CostingPartDetails.TransportationDetails = obj.extraCostObj.TransportationDetails
      // objectToUpdate.CostingPartDetails.TransportationCost = obj.extraCostObj.TransportationCost
    } else {

      setErrorObjectSurfaceTreatment(errorObjectSurfaceTreatment)
      setSurfacTreatmenteData(obj)
      setSurfacetableData(obj.gridData)
      // objectToUpdate.CostingPartDetails.SurfaceTreatmentDetails = obj.gridData;
      // objectToUpdate.CostingPartDetails.SurfaceTreatmentCost = surfaceCost(obj.gridData);
    }
    // tempArray = Object.assign([...tempArray], { [indexForUpdate]: objectToUpdate })
    // sessionStorage.setItem('surfaceCostingArray', JSON.stringify(tempArray))
    // // newData.map(item => {
    //   if (item?.CostingId === costData?.CostingId) {
    //     let CostingPartDetails = item?.CostingPartDetails
    //     CostingPartDetails.SurfaceTreatmentDetails = obj.gridData;
    //     CostingPartDetails.SurfaceTreatmentCost = surfaceCost(obj.gridData);
    //   }
    //   return null;
    // })
    // dispatch(setSurfaceData(newData, () => { }))
  }


  /**
  * @method surfaceCost
  * @description GET SURFACE TREATMENT COST
  */
  const surfaceCost = (item) => {
    let cost = 0;
    cost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.SurfaceTreatmentCost);
    }, 0)
    return cost;
  }


  /**
  * @method saveData
  * @description SAVE DATA ASSEMBLY
  */
  const saveData = debounce(handleSubmit(() => {
    let count = 0
    let countST = 0
    for (var prop in errorObjectTransport) {
      if (Object.keys(errorObjectTransport[prop])?.length > 0) {
        count++
      }
    }
    for (var prop in errorObjectSurfaceTreatment) {
      if (Object.keys(errorObjectSurfaceTreatment[prop])?.length > 0) {
        countST++
      }
    }
    if (errorObjectSurfaceTreatment && (count !== 0 || countST !== 0)) return false;

    if (partType) {
      // WILL GET EXECUTE WHEN TECHNOLOGY OF COSTING WILL BE ASSEMBLY

      setTimeout(() => {
        setCallAPI(true)
      }, 200);
      props.setSurfaceTreatmentCostAssemblyTechnology(surfaceTreatmentData?.gridData, surfaceTreatmentData.Params, hangerCostDetails, extraCostDetails, paintAndMaskingDetails)
    }
    // if (transportationObject.UOM === "Percentage" && transportationObject.Rate !== null && transportationObject.Rate > 100) {
    //   return false
    // }
    if ((IsLocked === false || (!CostingViewMode && !isDisable)) && partType === false) {
      if (props.IsAssemblyCalculation) {

        props.setAssemblySurfaceCost(surfaceTreatmentData.gridData, surfaceTreatmentData.Params, JSON.stringify(surfaceTreatmentData.gridData) !== JSON.stringify(surfaceTreatmentData.OldGridData) ? true : false, props.item, hangerCostDetails, extraCostDetails, paintAndMaskingDetails)
        // props.setAssemblyTransportationCost(transportObj, transportationObject.Params, item)
        setCallAPI(true)
      } else {

        props.setSurfaceCost(surfaceTreatmentData.gridData, surfaceTreatmentData.Params, JSON.stringify(surfaceTreatmentData.gridData) !== JSON.stringify(surfaceTreatmentData.OldGridData) ? true : false, hangerCostDetails, extraCostDetails, paintAndMaskingDetails)
        // props.setTransportationCost(transportObj, transportationObject.Params)
        setCallAPI(true)

      }
    }

  }), 500);


  useEffect(() => {
    if (callDiscountApi) {
      InjectDiscountAPICall()
      // setCallDiscountApi(false)
    }
  }, [callDiscountApi])
  // }, [ComponentItemDiscountData, callDiscountApi])

  const InjectDiscountAPICall = () => {
    // if (props.activeTab === '2') {
    const discountAndOtherTabData = DiscountCostData
    // let basicRate = surfaceTabData?.CostingPartDetails.BasicRate



    let basicRate = 0
    if (Number(isPartType?.value) === PART_TYPE_ASSEMBLY && !partType) {
      basicRate = checkForNull(RMCCTabData[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else if (partType) {
      let totalOverheadPrice = OverheadProfitTabData && (checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.OverheadCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ProfitCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.RejectionCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ICCCost))
      basicRate = checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetTotalRMBOPCC) + checkForNull(totalOverheadPrice) +
        checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else {
      basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    }

    let totalPOriceForAssembly = checkForNull(basicRate) + checkForNull(discountAndOtherTabData?.totalConditionCost) + checkForNull(discountAndOtherTabData?.totalNpvCost)
    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, EffectiveDate: CostingEffectiveDate, TotalCost: totalPOriceForAssembly, BasicRate: basicRate, NetPOPrice: totalPOriceForAssembly }, res => {
      if (Number(previousTab) === 6) {
        dispatch(saveCostingPaymentTermDetail(PaymentTermDataDiscountTab, (res) => { }));
      }
    }))
    // }
  }

  const updateExtraCost = () => {
    let tempData = extraCostDetails?.TransportationDetails ? [...extraCostDetails?.TransportationDetails] : []
    const costValues = getCostValues(item, costData, subAssemblyTechnologyArray);
    const { rawMaterialsCost, conversionCost, netpartCost } = costValues;
    tempData.map(item => {
      if (item?.CostingConditionMasterId) {
        // Get cost values once for all cases that need them
        switch (item.CostingConditionNumber) {
          case TAPEANDPAINT:
            item.ApplicabiltyCost = checkForNull(paintAndMaskingDetails?.TotalPaintCost)
            item.TransportationCost = calculatePercentageValue(checkForNull(paintAndMaskingDetails?.TotalPaintCost), item?.Rate)
            break;
          case HANGER:
            item.ApplicabiltyCost = checkForNull(hangerCostDetails?.HangerCostPerPart)
            item.TransportationCost = calculatePercentageValue(checkForNull(hangerCostDetails?.HangerCostPerPart), item?.Rate)
            break;
          case SURFACETREATMENTLABEL:
            item.ApplicabiltyCost = checkForNull(surfaceCost(surfaceTreatmentData?.gridData))
            item.TransportationCost = calculatePercentageValue(checkForNull(surfaceCost(surfaceTreatmentData?.gridData)), item?.Rate)
            break;
          case TAPE:
            item.ApplicabiltyCost = checkForNull(paintAndMaskingDetails?.TapeCost)
            item.TransportationCost = calculatePercentageValue(checkForNull(paintAndMaskingDetails?.TapeCost), item?.Rate)
            break;
          case PAINT:
            item.ApplicabiltyCost = checkForNull(paintAndMaskingDetails?.PaintCost)
            item.TransportationCost = calculatePercentageValue(checkForNull(paintAndMaskingDetails?.PaintCost), item?.Rate)
            break;
          case RMCC:
            item.ApplicabiltyCost = checkForNull(rawMaterialsCost) + checkForNull(conversionCost)
            item.TransportationCost = calculatePercentageValue(checkForNull(rawMaterialsCost) + checkForNull(conversionCost), item?.Rate)
            break;
          case RM:
            item.ApplicabiltyCost = checkForNull(rawMaterialsCost);
            item.TransportationCost = calculatePercentageValue(checkForNull(rawMaterialsCost), item?.Rate);
            break;
          case CC:
            item.ApplicabiltyCost = checkForNull(conversionCost);
            item.TransportationCost = calculatePercentageValue(checkForNull(conversionCost), item?.Rate);
            break;
          case PART_COST:

            item.ApplicabiltyCost = checkForNull(netpartCost);
            item.TransportationCost = calculatePercentageValue(checkForNull(netpartCost), item?.Rate);
            break;
          case PART_COST_CC:
            item.ApplicabiltyCost = checkForNull(netpartCost) + checkForNull(conversionCost);
            item.TransportationCost = calculatePercentageValue(checkForNull(netpartCost) + checkForNull(conversionCost), item?.Rate);
            break;
          default:
            // No action for unknown condition types
            break;
        }
      }
    })
    const totalCost = tempData.reduce((sum, item) => {
      return sum + (item?.TransportationCost ? Number(item.TransportationCost) : 0);
    }, 0);
    setValue(`ExtraCost`, checkForDecimalAndNull(totalCost, initialConfiguration?.NoOfDecimalForPrice))
    let newData = [...SurfaceTabData];
    newData.map(item => {
      if (item.CostingId === costData.CostingId) {
        let CostingPartDetails = item?.CostingPartDetails
        CostingPartDetails.TransportationDetails = tempData;
        CostingPartDetails.TransportationCost = totalCost;
      }
      return null;
    })
  }
  const closePaintAndMasking = (data) => {
    setViewPaintAndMasking(false)

    // const totalPaintCost = surfaceTabData && surfaceTabData?.CostingPartDetails && surfaceTabData?.CostingPartDetails?.TotalPaintCost
    // setValue(`PaintAndMasking`, checkForDecimalAndNull(totalPaintCost, initialConfiguration?.NoOfDecimalForPrice))
  }
  const closeExtraCost = (data) => {
    setViewExtraCost(false)
    // const transportationCost = surfaceTabData && surfaceTabData?.CostingPartDetails && surfaceTabData?.CostingPartDetails?.TransportationCost
    // setValue(`ExtraCost`, checkForDecimalAndNull(transportationCost, initialConfiguration?.NoOfDecimalForPrice))
  }
  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <Drawer className="bottom-drawer" anchor='bottom' open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <div className="container-fluid">
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading sticky-top-0">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'Add Surface Treatment'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>
            <form
              noValidate
              className="form"

            >
              <Row className="mb-3 pt-3">
                <Col>
                  <div className="user-page p-0 px-3">
                    <div className="cr-process-costwrap">
                      <Row className="cr-innertool-cost">
                        {
                          (item.PartType !== 'Part' && item.PartType !== 'Component') ?
                            <>
                              <Col md="2" className="cr-costlabel">{`ST. Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked || isDisable) ? item?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly : surfaceCost(surfaceTreatmentData?.gridData), initialConfiguration?.NoOfDecimalForPrice)}`}</Col>
                              <Col md="2" className="cr-costlabel">{`Other Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked || isDisable) ? item?.CostingPartDetails?.TotalTransportationCostPerAssembly : checkForNull(extraCostDetails?.TransportationCost), initialConfiguration?.NoOfDecimalForPrice)}`}</Col>
                              <Col md="2" className="cr-costlabel">{`Hanger Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked || isDisable) ? checkForNull(item?.CostingPartDetails?.HangerCostPerPartWithQuantity) : checkForNull(hangerCostDetails?.HangerCostPerPart), initialConfiguration?.NoOfDecimalForPrice)}`}</Col>
                              <Col md="3" className="cr-costlabel">{`Paint and Masking Cost : ${checkForDecimalAndNull((CostingViewMode || IsLocked || isDisable) ? checkForNull(item?.CostingPartDetails?.TotalPaintCostWithQuantity) : checkForNull(paintAndMaskingDetails?.TotalPaintCost), initialConfiguration?.NoOfDecimalForPrice)}`}</Col>
                              <Col md="3" className="cr-costlabel">{`Net ST. Cost:  ${(CostingViewMode || IsLocked || isDisable) ? checkForDecimalAndNull(item?.CostingPartDetails?.NetSurfaceTreatmentCost, initialConfiguration?.NoOfDecimalForPrice) : checkForDecimalAndNull(checkForNull(surfaceCost(surfaceTreatmentData.gridData)) + checkForNull(transportObj?.TransportationCost) + checkForNull(extraCostDetails?.TransportationCost) + checkForNull(paintAndMaskingDetails?.TotalPaintCost) + checkForNull(hangerCostDetails?.HangerCostPerPart), initialConfiguration?.NoOfDecimalForPrice)}`}</Col>

                            </>
                            :
                            <>
                              <Col md="2" className="cr-costlabel">{`ST. Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked || isDisable) ? checkForNull(item?.CostingPartDetails?.SurfaceTreatmentCost) : surfaceCost(surfaceTreatmentData?.gridData), initialConfiguration?.NoOfDecimalForPrice)}`}</Col>
                              <Col md="2" className="cr-costlabel">{`Other Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked || isDisable) ? checkForNull(item?.CostingPartDetails?.TransportationCost) : checkForNull(extraCostDetails?.TransportationCost), initialConfiguration?.NoOfDecimalForPrice)}`}</Col>
                              <Col md="2" className="cr-costlabel">{`Hanger Cost: ${checkForDecimalAndNull((CostingViewMode || IsLocked || isDisable) ? checkForNull(item?.CostingPartDetails?.HangerCostPerPart) : checkForNull(hangerCostDetails?.HangerCostPerPart), initialConfiguration?.NoOfDecimalForPrice)}`}</Col>
                              <Col md="3" className="cr-costlabel">{`Paint and Masking Cost : ${checkForDecimalAndNull((CostingViewMode || IsLocked || isDisable) ? checkForNull(item?.CostingPartDetails?.TotalPaintCost) : checkForNull(paintAndMaskingDetails?.TotalPaintCost), initialConfiguration?.NoOfDecimalForPrice)}`}</Col>
                              <Col md="3" className="cr-costlabel">{`Net ST. Cost: ${(CostingViewMode || IsLocked || isDisable) ?
                                checkForDecimalAndNull(item?.CostingPartDetails?.NetSurfaceTreatmentCost, initialConfiguration?.NoOfDecimalForPrice) :
                                checkForDecimalAndNull(checkForNull(surfaceCost(surfaceTreatmentData?.gridData)) + checkForNull(extraCostDetails?.TransportationCost) + checkForNull(paintAndMaskingDetails?.TotalPaintCost) + checkForNull(hangerCostDetails?.HangerCostPerPart), initialConfiguration?.NoOfDecimalForPrice)}`}</Col>
                            </>
                        }
                      </Row >

                      {/* <hr /> */}
                      < div className="user-page px-3 pb-3" >
                        <div>
                          <SurfaceTreatmentCost
                            index={props.index}
                            data={surfaceData}
                            item={props.item}
                            setSurfaceCost={props.setSurfaceCost}
                            IsAssemblyCalculation={props.IsAssemblyCalculation}
                            setAssemblySurfaceCost={props.setAssemblySurfaceCost}
                            setAssemblyTransportationCost={props.setAssemblyTransportationCost}
                            setSurfaceData={SetSurfaceData}
                          />
                          {/* <hr /> */}
                          {/* <TransportationCost
                            index={props.index}
                            data={transportationData}
                            item={props.item}
                            getTransportationObj={setTransportationObj}
                            setTransportationCost={props.setTransportationCost}
                            IsAssemblyCalculation={props.IsAssemblyCalculation}
                            setAssemblyTransportationCost={props.setAssemblyTransportationCost}
                            surfaceCost={surfaceCost(surfaceTableData)}
                          /> */}
                          <Row>
                            <Col md="4" className="d-flex align-items-center">
                              <TextFieldHookForm
                                label="Paint and Masking Cost"
                                name={`PaintAndMasking`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                defaultValue={''}
                                className=""
                                customClassName={'withBorder w-100'}
                                handleChange={(e) => { }}
                                errors={errors && errors.PaintAndMasking}
                                disabled={true}
                              />
                              <Button
                                id="surfaceTreatment_paintAndMasking"
                                onClick={() => setViewPaintAndMasking(true)}
                                className={"right mt-0 mb-2"}
                                variant={viewAddButtonIcon(surfaceTabData?.CostingPartDetails && surfaceTabData?.CostingPartDetails?.TotalPaintCost && surfaceTabData?.CostingPartDetails?.TotalPaintCost !== 0 ? ['1'] : [], "className", (CostingViewMode || IsLocked || isDisable))}
                                title={viewAddButtonIcon(surfaceTabData?.CostingPartDetails && surfaceTabData?.CostingPartDetails?.TotalPaintCost && surfaceTabData?.CostingPartDetails?.TotalPaintCost !== 0 ? ['1'] : [], "title", (CostingViewMode || IsLocked || isDisable))}
                              />
                            </Col>
                          </Row>
                          <Hanger
                            ViewMode={CostingViewMode || isDisable}
                            index={props?.index}
                            data={surfaceData}
                            item={props?.item}
                            setSurfaceData={SetSurfaceData}
                          />
                          <Row>
                            <Col md="4" className="d-flex align-items-center">
                              <TextFieldHookForm
                                label="Other Cost"
                                name={`ExtraCost`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                defaultValue={''}
                                className=""
                                customClassName={'withBorder w-100'}
                                handleChange={(e) => { }}
                                errors={errors && errors.PaintAndMasking}
                                disabled={true}
                              />
                              <div className='d-flex align-items-center'>
                                <Button
                                  id="surfaceTreatment_extraCost"
                                  onClick={() => setViewExtraCost(true)}
                                  className={"right mt-0 mb-2"}
                                  variant={viewAddButtonIcon(surfaceTabData?.CostingPartDetails && surfaceTabData?.CostingPartDetails?.TransportationDetails ? surfaceTabData?.CostingPartDetails?.TransportationDetails : [], "className", (CostingViewMode || IsLocked || isDisable))}
                                  title={viewAddButtonIcon(surfaceTabData?.CostingPartDetails && surfaceTabData?.CostingPartDetails?.TransportationDetails ? surfaceTabData?.CostingPartDetails?.TransportationDetails : [], "title", (CostingViewMode || IsLocked || isDisable))}
                                />
                                <TooltipCustom
                                  id={`surfaceTreatment_refresh`}
                                  disabledIcon
                                  tooltipText={'Refresh to update the extra cost'}
                                />
                                <Button
                                  id="surfaceTreatment_refresh"
                                  onClick={updateExtraCost}
                                  className={"right ml-1 mb-2"}
                                  variant={'refresh-icon'}
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </div >

                    </div >
                  </div >
                </Col >
              </Row >

              <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                <div className="col-sm-12 text-right bluefooter-butn">
                  <button
                    type={'button'}
                    className="reset mr5 cancel-btn"
                    onClick={cancel} >
                    <div className={'cancel-icon'}></div> {'Cancel'}
                  </button>
                  <button
                    type={'button'}
                    className="submit-button mr15 save-btn"
                    disabled={(CostingViewMode || IsLocked || isDisable) ? true : false}
                    onClick={saveData} >
                    <div className={'save-icon'}></div>
                    {'SAVE'}
                  </button>
                </div>
              </Row>
            </form >
          </div >

        </div >
      </Drawer >
      {viewPaintAndMasking && <PaintAndMasking isOpen={viewPaintAndMasking} anchor={'right'} item={props.item} CostingId={item.CostingId} closeDrawer={closePaintAndMasking} setSurfaceData={SetSurfaceData} />}
      {viewExtraCost && <ExtraCost isOpen={viewExtraCost} index={props.index} item={props.item} anchor={'right'} closeDrawer={closeExtraCost} setSurfaceData={SetSurfaceData} hangerCostDetails={hangerCostDetails} paintAndMaskingDetails={paintAndMaskingDetails} surfaceCost={surfaceCost(surfaceTreatmentData?.gridData)} extraCostDetails={extraCostDetails} />}
    </ >
  );
}

export default SurfaceTreatment;