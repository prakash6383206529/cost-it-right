import { useDispatch } from "react-redux";
import { reactLocalStorage } from "reactjs-localstorage";
import { HOUR, MACHINING, MICROSECONDS, MILLISECONDS, MINUTES, SECONDS } from "../../config/constants";
import { checkForNull, getConfigurationKey, loggedInUserId } from "../../helper"
import DayTime from "../common/DayTimeWrapper";
import { getBriefCostingById, gridDataAdded, isDataChange, saveAssemblyBOPHandlingCharge, saveBOMLevel, savePartNumber, setComponentDiscountOtherItemData, setComponentItemData, setComponentOverheadItemData, setComponentPackageFreightItemData, setComponentToolItemData, setOverheadProfitData, setPackageAndFreightData, setPartNumberArrayAPICALL, setProcessGroupGrid, setRMCCData, setSurfaceCostData, setToolTabData } from "./actions/Costing";
import { PART_TYPE_ASSEMBLY, PLASTIC } from "../../config/masterData";
import { checkDivisionByPlantAndGetDivisionIdByPart } from "../../actions/Common";
import Toaster from "../common/Toaster";
import { MESSAGES } from "../../config/message";

// TO CREATE OBJECT FOR IN SAVE-ASSEMBLY-PART-ROW-COSTING
export const createToprowObjAndSave = (tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, tabId, effectiveDate, AddLabour = false, basicRateForST = '', isPartType = {}, IsAddPaymentTermInNetCost = false) => {
  let Arr = JSON.parse(sessionStorage.getItem('costingArray'))
  let surfaceTreatmentArr = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))
  let assemblyWorkingRow = []

  if (tabId === 1) {
    // TABRMCC SUB ASSEMBLIES
    Arr && Arr.map((item) => {
      let sTSubAssembly = surfaceTreatmentArr && surfaceTreatmentArr.find(surfaceItem => surfaceItem.PartNumber === item.PartNumber && surfaceItem.AssemblyPartNumber === item.AssemblyPartNumber)
      if (item.PartType === 'Sub Assembly') {
        let subAssemblyObj = {
          "CostingId": item.CostingId,
          "SubAssemblyCostingId": item.SubAssemblyCostingId,
          "CostingNumber": "", // Need to find out how to get it.
          "TotalRawMaterialsCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalRawMaterialsCost * item.CostingPartDetails?.Quantity : item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "TotalBoughtOutPartCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalBoughtOutPartCost * item.CostingPartDetails?.Quantity : item.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
          "TotalConversionCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalConversionCost * item.CostingPartDetails?.Quantity : item.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostWithQuantity": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerAssembly": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "TotalOperationCostPerAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostPerAssembly),
          "TotalOperationCostSubAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostSubAssembly),
          "TotalOperationCostComponent": item.CostingPartDetails?.TotalOperationCostComponent,
          "TotalOtherOperationCostPerAssembly": item.CostingPartDetails?.TotalOtherOperationCostPerAssembly,
          "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
          "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
          "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "TotalCostINR": (sTSubAssembly !== undefined && Object.keys(sTSubAssembly).length > 0) ? checkForNull(item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(sTSubAssembly.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) : item.CostingPartDetails?.TotalCalculatedRMBOPCCCost,
          "NetRMBOPCCCost": item.CostingPartDetails?.TotalCalculatedRMBOPCCCost,
          "IsApplyBOPHandlingCharges": item.CostingPartDetails?.IsApplyBOPHandlingCharges,
          "BOPHandlingPercentage": item.CostingPartDetails?.BOPHandlingPercentage,
          "BOPHandlingCharges": item.CostingPartDetails?.BOPHandlingCharges,
          "BOPHandlingChargeApplicability": item.CostingPartDetails?.BOPHandlingChargeApplicability,
          "RawMaterialCostWithCutOff": item && item.CostingPartDetails?.RawMaterialCostWithCutOff,
          "BOPHandlingChargeType": item && item.CostingPartDetails?.BOPHandlingChargeType,
          "BasicRate": (sTSubAssembly !== undefined && Object.keys(sTSubAssembly).length > 0) ? checkForNull(item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(sTSubAssembly.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) : item.CostingPartDetails?.TotalCalculatedRMBOPCCCost,
        }
        assemblyWorkingRow.push(subAssemblyObj)
      }
      return ''
    })
  }
  else if (tabId === 2) {
    //SURFACE TREATMENT SUBASSEMBLIES
    surfaceTreatmentArr && surfaceTreatmentArr.map((item) => {
      let rmCcTabSubAssembly = Arr && Arr.find(costingItem => costingItem.PartNumber === item.PartNumber && costingItem.AssemblyPartNumber === item.AssemblyPartNumber)
      if (item.PartType === 'Sub Assembly') {
        let subAssemblyObj = {
          "CostingId": item.CostingId,
          "SubAssemblyCostingId": item.SubAssemblyCostingId,
          "CostingNumber": "",
          "TotalSurfaceTreatmentCostPerAssembly": item.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly,
          "TotalSurfaceTreatmentCostPerSubAssembly": item.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly,
          "TotalSurfaceTreatmentCostWithQuantity": item.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity,
          "TotalSurfaceTreatmentCostComponent": item.CostingPartDetails?.TotalSurfaceTreatmentCostComponent,
          "TotalTransportationCostPerAssembly": item.CostingPartDetails?.TotalTransportationCostPerAssembly,
          "TotalTransportationCostPerSubAssembly": item.CostingPartDetails?.TotalTransportationCostPerSubAssembly,
          "TotalTransportationCostWithQuantity": item.CostingPartDetails?.TotalTransportationCostWithQuantity,
          "TotalTransportationCostComponent": item.CostingPartDetails?.TotalTransportationCostComponent,
          "TotalCalculatedSurfaceTreatmentCostPerAssembly": checkForNull(item.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerAssembly),
          "TotalCalculatedSurfaceTreatmentCostPerSubAssembly": checkForNull(item.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerSubAssembly),
          "TotalCalculatedSurfaceTreatmentCostWithQuantitys": checkForNull(item.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys),
          "TotalCalculatedSurfaceTreatmentCostComponent": checkForNull(item.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostComponent),
          "TotalCostINR": (rmCcTabSubAssembly !== undefined && Object.keys(rmCcTabSubAssembly).length > 0) ? checkForNull(item.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(rmCcTabSubAssembly.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) : checkForNull(item.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys),
          "BasicRate": (rmCcTabSubAssembly !== undefined && Object.keys(rmCcTabSubAssembly).length > 0) ? checkForNull(item.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(rmCcTabSubAssembly.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) : checkForNull(item.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys),
        }
        assemblyWorkingRow.push(subAssemblyObj)
      }
      return ''
    })
  }
  let basicRate = 0
  if (Number(isPartType?.value) === PART_TYPE_ASSEMBLY) {
    basicRate = checkForNull(tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) +
      checkForNull(surfaceTabData?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
      checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(discountAndOtherTabData?.AnyOtherCost) + (IsAddPaymentTermInNetCost ? checkForNull(discountAndOtherTabData?.paymentTermCost) : 0) - checkForNull(discountAndOtherTabData?.HundiOrDiscountValue)
  } else {
    basicRate = checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
      checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
      checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(discountAndOtherTabData?.AnyOtherCost) - checkForNull(discountAndOtherTabData?.HundiOrDiscountValue)
  }

  let assemblyRequestedData = {

    "TopRow": {
      "CostingId": tabData && tabData.CostingId,
      "CostingNumber": tabData && tabData.CostingNumber,
      "NetRMCostPerAssembly": tabData && tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
      "NetBOPCostAssembly": tabData && tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
      "NetConversionCostPerAssembly": tabData && tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
      "NetRMBOPCCCost": tabData && tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "NetSurfaceTreatmentCost": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys,
      "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails ? (checkForNull(overHeadAndProfitTabData.CostingPartDetails?.OverheadCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.RejectionCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ICCCost)) : 0,
      "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
      "NetToolCost": ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
      "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
      "NetDiscounts": discountAndOtherTabData?.HundiOrDiscountValue,
      "TotalCostINR": checkForNull(basicRate) + checkForNull(discountAndOtherTabData?.totalConditionCost) + checkForNull(discountAndOtherTabData?.totalNpvCost),
      "BasicRate": basicRate,
      "FreightCost": PackageAndFreightTabData[0]?.CostingPartDetails?.FreightNetCost,
      "PackagingCost": PackageAndFreightTabData[0]?.CostingPartDetails?.PackagingNetCost,
      "TabId": tabId,
      "EffectiveDate": DayTime(new Date(effectiveDate)),
      "TotalRawMaterialsCostWithQuantity": tabData && tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
      "TotalBoughtOutPartCostWithQuantity": tabData && tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
      "TotalConversionCostWithQuantity": tabData && tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
      "TotalCalculatedRMBOPCCCostWithQuantity": tabData && tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "TotalCalculatedRMBOPCCCostPerAssembly": tabData && tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "TotalOperationCostPerAssembly": tabData.CostingPartDetails?.TotalOperationCostPerAssembly,
      "TotalOperationCostSubAssembly": checkForNull(tabData.CostingPartDetails?.TotalOperationCostSubAssembly),
      "TotalOperationCostComponent": tabData.CostingPartDetails?.TotalOperationCostComponent,
      "TotalOtherOperationCostPerAssembly": tabData.CostingPartDetails?.TotalOtherOperationCostPerAssembly,
      "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly,
      "TotalSurfaceTreatmentCostPerSubAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly,
      "TotalSurfaceTreatmentCostWithQuantity": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity,
      "TotalSurfaceTreatmentCostComponent": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalSurfaceTreatmentCostComponent,
      "TotalTransportationCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalTransportationCostPerAssembly,
      "TotalTransportationCostPerSubAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalTransportationCostPerSubAssembly,
      "TotalTransportationCostWithQuantity": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalTransportationCostWithQuantity,
      "TotalTransportationCostComponent": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalTransportationCostComponent,
      "TotalCalculatedSurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerAssembly,
      "TotalCalculatedSurfaceTreatmentCostPerSubAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerSubAssembly,
      "TotalCalculatedSurfaceTreatmentCostWithQuantitys": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys,
      "TotalCalculatedSurfaceTreatmentCostComponent": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostComponent,
      "RawMaterialCostWithCutOff": tabData && tabData.CostingPartDetails?.RawMaterialCostWithCutOff,
      "IsRMCutOffApplicable": tabData && tabData.CostingPartDetails?.IsRMCutOffApplicable,
      "NetLabourCost": tabData && tabData.CostingPartDetails.NetLabourCost,
      "IndirectLaborCost": tabData && tabData.CostingPartDetails.IndirectLaborCost,
      "StaffCost": tabData && tabData.CostingPartDetails.StaffCost,
      "StaffCostPercentage": tabData && tabData.CostingPartDetails.StaffCostPercentage,
      "IndirectLaborCostPercentage": tabData && tabData.CostingPartDetails.IndirectLaborCostPercentage,
      "StaffCRMHead": tabData && tabData?.CostingPartDetails?.StaffCRMHead,
      "NetLabourCRMHead": tabData && tabData?.CostingPartDetails?.NetLabourCRMHead,
      "IndirectLabourCRMHead": tabData && tabData?.CostingPartDetails?.IndirectLabourCRMHead,
      // "SurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
      // "TransportationCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.TransportationCost,
      // "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
      "NetOtherOperationCost": 0,               // SET AS 0 BECAUSE ASSEMBLY TECHNOLOGY DOES NOT HAVE OTHER OPERATION OPTION
    },
    "WorkingRows": assemblyWorkingRow,
    "BOPHandlingCharges": {
      "AssemblyCostingId": tabData && tabData.CostingId,
      "IsApplyBOPHandlingCharges": tabData && tabData.CostingPartDetails?.IsApplyBOPHandlingCharges,
      "BOPHandlingChargeApplicability": tabData && tabData.CostingPartDetails?.BOPHandlingChargeApplicability,
      "BOPHandlingPercentage": tabData && tabData.CostingPartDetails?.BOPHandlingPercentage,
      "BOPHandlingCharges": tabData && tabData.CostingPartDetails?.BOPHandlingCharges,
      "BOPHandlingChargeType": tabData && tabData.CostingPartDetails?.BOPHandlingChargeType
    },
    "LoggedInUserId": loggedInUserId()

  }
  return assemblyRequestedData

}

//TO FIND SURFACE TREATMENT OBJECT HAVING SAME PART NO AS RMCC TAB PART NO
export const findSurfaceTreatmentData = (rmCCData) => {
  let surfaceTreatmentArr = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))
  let sTSubAssembly = surfaceTreatmentArr && surfaceTreatmentArr.find(surfaceItem => surfaceItem.PartNumber === rmCCData.PartNumber && surfaceItem.AssemblyPartNumber === rmCCData.AssemblyPartNumber)
  return sTSubAssembly
}

// TO FIND RMCC OBJECT HAVING SAME PART NO AS SURFACE TREATMENT PART NO
export const findrmCctData = (surfaceData) => {
  let costingArr = JSON.parse(sessionStorage.getItem('costingArray'))
  let rmCcSubAssembly = costingArr && costingArr.find(costingItem => costingItem.PartNumber === surfaceData.PartNumber && costingItem.AssemblyPartNumber === surfaceData.AssemblyPartNumber)
  return rmCcSubAssembly
}

// TO FIND PARTS/HOUR (PRODUCTION)
export const findProductionPerHour = (quantity) => {
  return checkForNull(3600 / quantity)
}

// TO FIND PROCESS COST IF UOM TYPE IS TIME AND ON THE BASIS OF UOM (HOURS,MINUTES,SECONDS)
export const findProcessCost = (uom, mhr, productionPerHour) => {
  let processCost = 0
  if (uom === HOUR) {
    processCost = checkForNull((checkForNull(mhr) / checkForNull(productionPerHour)))
  } else if (uom === MINUTES) {
    processCost = checkForNull(((checkForNull(mhr) * 60) / checkForNull(productionPerHour)))
  } else if (uom === SECONDS) {
    processCost = checkForNull(((checkForNull(mhr) * 3600) / checkForNull(productionPerHour)))
  }
  else if (uom === MILLISECONDS) {
    processCost = checkForNull(((checkForNull(mhr) * 3600000) / checkForNull(productionPerHour)))
  }
  else if (uom === MICROSECONDS) {
    processCost = checkForNull(((checkForNull(mhr) * 3600000000) / checkForNull(productionPerHour)))
  }
  return processCost
}


// function findVolumeFields(res){
//   const SEQUENCE_OF_MONTH = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]
//   let approvedQtyArr = res.data.Data.VolumeApprovedDetails
//         let budgetedQtyArr = res.data.Data.VolumeBudgetedDetails
//         let actualQty = 0
//         let totalBudgetedQty = 0
//         let variance = Number(costingObj.poPrice && costingObj.poPrice !== '-' ? costingObj.oldPoPrice : 0) - Number(costingObj.poPrice && costingObj.poPrice !== '-' ? costingObj.poPrice : 0)
//         let month = new Date(date).getMonth()
//         let year = ''

//         if (month <= 2) {
//           year = `${new Date(date).getFullYear() - 1}-${new Date(date).getFullYear()}`
//         } else {
//           year = `${new Date(date).getFullYear()}-${new Date(date).getFullYear() + 1}`
//         }


//             obj.consumptionQty = checkForNull(actualQty)
//             obj.remainingQty = checkForNull(totalBudgetedQty - actualQty)
//             obj.annualImpact = variance !== '' ? totalBudgetedQty * variance : 0
//             obj.yearImpact = variance !== '' ? (totalBudgetedQty - actualQty) * variance : 0

//         approvedQtyArr.map((data) => {
//           if (data.Sequence < sequence) {
//             //USE IN FUTURE
//             // if(data.Date <= moment(effectiveDate).format('dd/MM/YYYY')){ 
//             //   actualQty += parseInt(data.ApprovedQuantity)
//             // } 
//             actualQty += parseInt(data.ApprovedQuantity)
//           } else if (data.Sequence >= sequence) {
//             // actualRemQty += parseInt(data.ApprovedQuantity)  //MAY BE USE IN FUTURE
//           }
//         })
//         budgetedQtyArr.map((data) => {
//           // if (data.Sequence >= sequence) {
//           totalBudgetedQty += parseInt(data.BudgetedQuantity)
//           // }
//         })
// }

export const formatCostingApprovalObj = (costingObj) => {


  let obj = {}
  // add vendor key here
  obj.typeOfCosting = costingObj.zbc
  obj.plantCode = costingObj.plantCode
  obj.plantName = costingObj.plantName
  obj.plantId = costingObj.plantId
  obj.vendorId = costingObj.vendorId
  obj.vendorName = costingObj.vendorName
  obj.vendorCode = costingObj.vendorCode
  obj.vendorPlantId = costingObj.vendorPlantId
  obj.vendorPlantName = costingObj.vendorPlantName
  obj.vendorPlantCode = costingObj.vendorPlantCode
  obj.costingName = costingObj.CostingNumber
  obj.costingId = costingObj.costingId
  obj.oldPrice = costingObj.oldPoPrice
  obj.revisedPrice = costingObj.poPrice
  obj.nPOPriceWithCurrency = costingObj.nPOPriceWithCurrency
  obj.currencyRate = costingObj.currencyValue
  obj.variance = Number(costingObj.poPrice && costingObj.poPrice !== '-' ? costingObj.oldPoPrice : 0) - Number(costingObj.poPrice && costingObj.poPrice !== '-' ? costingObj.poPrice : 0)


  obj.reason = ''
  obj.ecnNo = ''
  obj.effectiveDate = costingObj.effectiveDate
  obj.isDate = costingObj.effectiveDate ? true : false
  obj.partNo = costingObj.partId
  obj.destinationPlantCode = costingObj.destinationPlantCode
  obj.destinationPlantName = costingObj.destinationPlantName
  obj.destinationPlantId = costingObj.destinationPlantId

  return obj
}

export const clearCosting = (dispatch) => {
  dispatch(getBriefCostingById('', (res) => { }))
  sessionStorage.setItem('costingArray', JSON.stringify([]))
  sessionStorage.setItem('surfaceCostingArray', JSON.stringify([]))
  dispatch(setRMCCData([], () => { }))                            //THIS WILL CLEAR RM CC REDUCER
  dispatch(setComponentItemData({}, () => { }))
  dispatch(setOverheadProfitData([], () => { }))              //THIS WILL CLEAR OVERHEAD PROFIT REDUCER
  dispatch(setComponentOverheadItemData({}, () => { }))       //THIS WILL CLEAR OVERHEAD PROFIT ITEM REDUCER


  dispatch(setPackageAndFreightData([], () => { }))           //THIS WILL CLEAR PACKAGE FREIGHT ITEM DATA
  dispatch(setComponentPackageFreightItemData({}, () => { })) //THIS WILL CLEAR PACKAGE FREIGHT ITEM DATA

  dispatch(setToolTabData([], () => { }))                     //THIS WILL CLEAR TOOL ARR FROM REDUCER  
  dispatch(setComponentToolItemData({}, () => { }))           //THIS WILL CLEAR TOOL ITEM DATA FROM REDUCER

  dispatch(setComponentDiscountOtherItemData({}, () => { }))  //THIS WILL CLEAR DISCOUNT ITEM DATA FROM REDUCER

  dispatch(saveAssemblyBOPHandlingCharge({}, () => { }))

  dispatch(gridDataAdded(false)) //BASIS OF GRID DATA DISABLED/ENABLED COSTING EFFECTIVE DATE
  dispatch(setSurfaceCostData({}, () => { }))

  dispatch(setProcessGroupGrid([]))
  dispatch(savePartNumber(''))
  dispatch(saveBOMLevel(''))
  dispatch(setPartNumberArrayAPICALL([]))
  dispatch(isDataChange(false))

}

export const formatMultiTechnologyUpdate = (tabData, totalCost = 0, surfaceTabData = {}, overHeadAndProfitTabData = {}, packageAndFreightTabData = {}, toolTabData = {}, DiscountCostData = {}, CostingEffectiveDate = new Date(), IsAddPaymentTermInNetCost = false) => {
  let Arr = tabData
  let assemblyWorkingRow = []
  Arr?.CostingChildPartDetails && Arr?.CostingChildPartDetails.map((item) => {
    // let sTSubAssembly = surfaceTreatmentArr && surfaceTreatmentArr.find(surfaceItem => surfaceItem.PartNumber === item.PartNumber && surfaceItem.AssemblyPartNumber === item.AssemblyPartNumber)
    if (item.BOMLevel === 'L1' && (item.PartType === 'Sub Assembly' || item.PartType === 'Part')) {
      let subAssemblyObj = {
        "CostingId": item?.CostingId,
        "TotalCostINR": item?.CostingPartDetails?.NetPOPrice,
        "NetChildPartsCostWithQuantity": item?.CostingPartDetails?.NetChildPartsCostWithQuantity,
        "BasicRate": item?.CostingPartDetails?.NetPOPrice,
      }
      assemblyWorkingRow.push(subAssemblyObj)
    }
    return ''
  })

  let basicRate = 0
  let totalOverheadPrice = checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.OverheadCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.RejectionCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ICCCost)
  basicRate = checkForNull(tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) + checkForNull(totalOverheadPrice) +
    checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) +
    checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)

  let temp = {
    "BOPHandlingCharges": {
      "AssemblyCostingId": tabData?.CostingId,
      "BOPHandlingChargeType": tabData?.CostingPartDetails?.BOPHandlingChargeType,
      "IsApplyBOPHandlingCharges": tabData?.CostingPartDetails?.IsApplyBOPHandlingCharges,
      "BOPHandlingPercentage": tabData?.CostingPartDetails?.BOPHandlingPercentage,
      "BOPHandlingCharges": tabData?.CostingPartDetails?.BOPHandlingCharges,
      "BOPHandlingChargeApplicability": 0
    },
    "TopRow": {
      "CostingId": tabData?.CostingId,
      "TotalOperationCost": tabData?.CostingPartDetails?.TotalOperationCost,
      "TotalProcessCost": tabData?.CostingPartDetails?.TotalProcessCost,
      "NetChildPartsCost": tabData?.CostingPartDetails?.NetChildPartsCost,
      "NetRMCostPerAssembly": tabData?.CostingPartDetails?.NetChildPartsCost,
      "NetBOPCostAssembly": tabData?.CostingPartDetails?.TotalBoughtOutPartCost,
      "NetConversionCostPerAssembly": checkForNull(tabData?.CostingPartDetails?.TotalOperationCost) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCost) + checkForNull(tabData?.NetLabourCost) + checkForNull(tabData?.IndirectLaborCost) + checkForNull(tabData?.StaffCost),
      "NetRMBOPCCCost": checkForNull(tabData?.CostingPartDetails?.NetChildPartsCost) + checkForNull(tabData?.CostingPartDetails?.TotalBoughtOutPartCost) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCost) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCost) + checkForNull(tabData?.NetLabourCost) + checkForNull(tabData?.IndirectLaborCost) + checkForNull(tabData?.StaffCost),
      "NetSurfaceTreatmentCost": surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost,
      "NetOverheadAndProfits": totalOverheadPrice,
      "NetPackagingAndFreightCost": packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost,
      "NetToolCost": toolTabData?.CostingPartDetails?.TotalToolCost,
      "NetOtherCost": DiscountCostData?.AnyOtherCost,
      "NetDiscounts": DiscountCostData?.HundiOrDiscountValue,
      "TotalCostINR": checkForNull(totalCost),
      "EffectiveDate": CostingEffectiveDate,
      "TransportationCost": surfaceTabData?.CostingPartDetails?.TransportationCost,
      "SurfaceTreatmentCost": surfaceTabData?.CostingPartDetails?.SurfaceTreatmentCost,
      "PackagingCost": packageAndFreightTabData?.CostingPartDetails?.PackagingNetCost,
      "FreightCost": packageAndFreightTabData?.CostingPartDetails?.FreightNetCost,
      "OverheadCost": overHeadAndProfitTabData?.CostingPartDetails?.OverheadCost,
      "ProfitCost": overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost,
      "RejectionCost": overHeadAndProfitTabData?.CostingPartDetails?.RejectionCost,
      "ICCCost": overHeadAndProfitTabData?.CostingPartDetails?.ICCCost,
      "PaymentTermCost": DiscountCostData?.paymentTermCost || 0,
      "NetLabourCost": tabData?.NetLabourCost,
      "IndirectLaborCost": tabData?.IndirectLaborCost,
      "StaffCost": tabData?.StaffCost,
      "StaffCRMHead": tabData?.CostingPartDetails?.StaffCRMHead,
      "NetLabourCRMHead": tabData?.CostingPartDetails?.NetLabourCRMHead,
      "IndirectLabourCRMHead": tabData?.CostingPartDetails?.IndirectLabourCRMHead,
      "StaffCostPercentage": tabData?.StaffCostPercentage,
      "IndirectLaborCostPercentage": tabData?.IndirectLaborCostPercentage,
      "BasicRate": basicRate,
      "RawMaterialCostWithCutOff": tabData?.CostingPartDetails?.NetChildPartsCost,
      "NetOtherOperationCost": 0,               // SET AS 0 BECAUSE ASSEMBLY TECHNOLOGY DOES NOT HAVE OTHER OPERATION OPTION
    },
    "WorkingRows": assemblyWorkingRow,
    "LoggedInUserId": loggedInUserId()
  }
  return temp
}

const calcEdit = () => {
  // let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
  // let costPerPieceTotal = 0
  // let CostPerAssemblyBOPTotal = 0

  // tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
  //     costPerPieceTotal = checkForNull(costPerPieceTotal) + checkForNull(item?.CostingPartDetails?.NetChildPartsCostWithQuantity)
  //     CostPerAssemblyBOPTotal = checkForNull(CostPerAssemblyBOPTotal) + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity)
  //     return null
  // })
}

export const errorCheck = (tempObject) => {
  let count = 0
  for (var prop in tempObject) {
    if (tempObject[prop]?.length > 0) {
      count++
    }
  }
  if (tempObject && count !== 0) return true;
}

export const errorCheckObject = (tempObject) => {
  let count = 0
  for (var prop in tempObject) {
    if (Object.keys(tempObject[prop])?.length > 0) {
      count++
    }
  }
  if (tempObject && count !== 0) return true;
}


export const swappingLogicCommon = (givenArray, dragStart, dragEnd, e) => {
  const start = Number(e?.target?.title?.slice(-1));
  const end = Number(dragEnd?.slice(-1));

  if (Number(start) < Number(end)) {
    return givenArray
  }

  if (start === end) {
    return false; // Same start and end, return false
  }

  const temp = givenArray.slice(); // Create a copy of givenArray
  const startItem = temp.splice(start, 1)[0]; // Remove start item from temp array

  if (start + 1 === end) {
    return false; // Item after start is end, return false
  }

  const insertIndex = end > start ? end - 1 : end; // Adjust insert index based on start and end positions
  temp.splice(insertIndex, 0, startItem); // Insert start item at insertIndex

  return temp;
};


export const fetchDivisionId = (requestObject, dispatch) => {
  return new Promise((resolve, reject) => {
    if (getConfigurationKey()?.IsDivisionAllowedForDepartment) {
      dispatch(checkDivisionByPlantAndGetDivisionIdByPart(requestObject, (res) => {
        if (res?.data?.Result) {
          const { Data } = res?.data
          if (Data?.IsDivisionAppliedOnPlant && Data?.DivisionId) {
            resolve(Data?.DivisionId)
          } else if (Data?.IsDivisionAppliedOnPlant) {
            reject(Toaster.warning(Data?.Message))
          }
          else resolve(null)
        } else {
          reject(Toaster.error(MESSAGES.SOME_ERROR))
        }
      }))
    } else {
      resolve(null)
    }
  })
}
export const calculateTotalPercentage = (currentValue, index, rawMaterials, getValues, rmExist) => {
  let totalPercentage = 0
  if (rmExist) {
    totalPercentage = rawMaterials?.reduce((total, item) => {
      return total + (checkForNull(item.Percentage) || 0);
    }, 0);
  }
  else {
    totalPercentage = rawMaterials?.reduce((total, _, idx) => {
      return checkForNull(total) + (idx === index ?
        checkForNull(currentValue) || 0 :
        checkForNull(getValues(`rmGridFields.${idx}.Percentage`)) || 0);
    }, 0);
  }
  return {
    total: checkForNull(totalPercentage),
    message: totalPercentage > 100 ?
      `Total percentage is ${totalPercentage}%, must be 100% to save the values` : '',
    isValid: totalPercentage <= 100
  };
};
export const NetLandedCostToolTip = (item, technologyId, IsApplyMasterBatch = false) => {
  const { UOM, IsCalculatorAvailable } = item || {};
  const baseFormula = 'Net RM Cost = (RM Rate * Gross Weight) - (Scrap Weight * Scrap Rate)';

  switch (Number(technologyId)) {
    case Number(MACHINING):
      if (UOM === "Meter" && IsCalculatorAvailable) {
        return 'Net RM Cost = RM/Pc - ScrapCost';
      }
      return baseFormula;

    case Number(PLASTIC):
      return IsApplyMasterBatch
        ? baseFormula.replace('RM Rate', 'RM Rate (Including Master Batch)')
        : baseFormula;

    default:
      return baseFormula;
  }
}

export const checkNegativeValue = (arr = [], keyName = 'NetLandedCost', displayName = 'Net Landed Cost') => {
  let msg = '';
  let hasNegativeValue = false;
  arr.forEach((item, index) => {
    if (item?.[keyName] < 0) {
      msg = `${displayName} cannot be negative for row ${index + 1}`;
      hasNegativeValue = true;
    }
  });
  if (hasNegativeValue) {
    Toaster.warning(msg);
  }
  return hasNegativeValue;
}

export const viewAddButtonIcon = (data, type, CostingViewMode) => {

  let className = ''
  let title = ''
  if (data.length !== 0 || CostingViewMode) {
    className = 'view-icon-primary'
    title = 'View'
  } else {
    className = 'plus-icon-square'
    title = 'Add'
  }
  if (type === "className") {
    return className
  } else if (type === "title") {
    return title
  }
}