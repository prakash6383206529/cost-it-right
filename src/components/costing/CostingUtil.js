import { LEVEL0 } from "../../config/constants";
import { checkForNull, loggedInUserId } from "../../helper"
import DayTime from "../common/DayTimeWrapper";

export const createToprowObjAndSave = (tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, tabId, effectiveDate) => {

  let Arr = JSON.parse(localStorage.getItem('costingArray'))
  let surfaceTreatmentArr = JSON.parse(localStorage.getItem('surfaceCostingArray'))
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
          "TotalRawMaterialsCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalRawMaterialsCost * item.CostingPartDetails.Quantity : item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "TotalBoughtOutPartCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalBoughtOutPartCost * item.CostingPartDetails.Quantity : item.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
          "TotalConversionCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalConversionCost * item.CostingPartDetails.Quantity : item.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostWithQuantity": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerAssembly": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "TotalOperationCostPerAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostPerAssembly),
          "TotalOperationCostSubAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostSubAssembly),
          "TotalOperationCostComponent": item.CostingPartDetails.TotalOperationCostComponent,
          "TotalOtherOperationCostPerAssembly": 0, //NEED TO IMPLEMENT THIS
          "TotalOtherOperationCostPerSubAssembly": 0, //NEED TO IMPLEMENT THIS
          "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
          "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
          "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "TotalCostINR": (sTSubAssembly !== undefined && Object.keys(sTSubAssembly).length > 0) ? checkForNull(item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(sTSubAssembly.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) : item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "NetRMBOPCCCost": item.CostingPartDetails?.TotalCalculatedRMBOPCCCost,
          "IsApplyBOPHandlingCharges": item.CostingPartDetails?.IsApplyBOPHandlingCharges,
          "BOPHandlingPercentage": item.CostingPartDetails?.BOPHandlingPercentage,
          "BOPHandlingCharges": item.CostingPartDetails?.BOPHandlingCharges,
          "BOPHandlingChargeApplicability": item.CostingPartDetails?.BOPHandlingChargeApplicability
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
      console.log('rmCcTabSubAssembly: ', rmCcTabSubAssembly);
      if (item.PartType === 'Sub Assembly') {
        let subAssemblyObj = {
          "CostingId": item.CostingId,
          "SubAssemblyCostingId": item.SubAssemblyCostingId,
          "CostingNumber": "",
          "TotalSurfaceTreatmentCostPerAssembly": item.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly,
          "TotalSurfaceTreatmentCostPerSubAssembly": item.CostingPartDetails.TotalSurfaceTreatmentCostPerSubAssembly,
          "TotalSurfaceTreatmentCostWithQuantity": item.CostingPartDetails.TotalSurfaceTreatmentCostWithQuantity,
          "TotalSurfaceTreatmentCostComponent": item.CostingPartDetails.TotalSurfaceTreatmentCostComponent,
          "TotalTransportationCostPerAssembly": item.CostingPartDetails.TotalTransportationCostPerAssembly,
          "TotalTransportationCostPerSubAssembly": item.CostingPartDetails.TotalTransportationCostPerSubAssembly,
          "TotalTransportationCostWithQuantity": item.CostingPartDetails.TotalTransportationCostWithQuantity,
          "TotalTransportationCostComponent": item.CostingPartDetails.TotalTransportationCostComponent,
          "TotalCalculatedSurfaceTreatmentCostPerAssembly": checkForNull(item.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly),
          "TotalCalculatedSurfaceTreatmentCostPerSubAssembly": checkForNull(item.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly),
          "TotalCalculatedSurfaceTreatmentCostWithQuantitys": checkForNull(item.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys),
          "TotalCalculatedSurfaceTreatmentCostComponent": checkForNull(item.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent),
          "TotalCostINR": (rmCcTabSubAssembly !== undefined && Object.keys(rmCcTabSubAssembly).length > 0) ? checkForNull(item.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(rmCcTabSubAssembly.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) : checkForNull(item.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys),
        }
        assemblyWorkingRow.push(subAssemblyObj)
      }
      return ''
    })
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
      "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails ? (checkForNull(overHeadAndProfitTabData.CostingPartDetails.OverheadCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.ProfitCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.RejectionCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.ICCCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.PaymentTermCost)) : 0,
      "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
      "NetToolCost": ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
      "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
      "NetDiscounts": discountAndOtherTabData?.HundiOrDiscountValue,
      "TotalCostINR": netPOPrice,
      "TabId": tabId,
      "EffectiveDate": DayTime(new Date(effectiveDate)),
      "TotalRawMaterialsCostWithQuantity": tabData && tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
      "TotalBoughtOutPartCostWithQuantity": tabData && tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
      "TotalConversionCostWithQuantity": tabData && tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
      "TotalCalculatedRMBOPCCCostWithQuantity": tabData && tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "TotalCalculatedRMBOPCCCostPerAssembly": tabData && tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "TotalOperationCostPerAssembly": tabData.CostingPartDetails.TotalOperationCostPerAssembly,
      "TotalOperationCostSubAssembly": checkForNull(tabData.CostingPartDetails?.TotalOperationCostSubAssembly),
      "TotalOperationCostComponent": tabData.CostingPartDetails.TotalOperationCostComponent,
      "TotalOtherOperationCostPerAssembly": 0, //NEED TO IMPLEMENT THIS
      "TotalOtherOperationCostPerSubAssembly": 0, //NEED TO IMPLEMENT THIS
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
      "TotalCalculatedSurfaceTreatmentCostComponent": surfaceTabData && surfaceTabData.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostComponent

      // "SurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
      // "TransportationCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.TransportationCost,
      // "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
    },
    "WorkingRows": assemblyWorkingRow,
    "BOPHandlingCharges": {
      "AssemblyCostingId": tabData && tabData.CostingId,
      "IsApplyBOPHandlingCharges": tabData && tabData.CostingPartDetails.IsApplyBOPHandlingCharges,
      "BOPHandlingChargeApplicability": tabData && tabData.CostingPartDetails.BOPHandlingChargeApplicability,
      "BOPHandlingPercentage": tabData && tabData.CostingPartDetails.BOPHandlingPercentage,
      "BOPHandlingCharges": tabData && tabData.CostingPartDetails.BOPHandlingCharges
    },
    "LoggedInUserId": loggedInUserId()

  }
  return assemblyRequestedData

}

export const findSurfaceTreatmentData = (rmCCData) => {
  let surfaceTreatmentArr = JSON.parse(localStorage.getItem('surfaceCostingArray'))
  let sTSubAssembly = surfaceTreatmentArr && surfaceTreatmentArr.find(surfaceItem => surfaceItem.PartNumber === rmCCData.PartNumber && surfaceItem.AssemblyPartNumber === rmCCData.AssemblyPartNumber)
  return sTSubAssembly
}
export const findrmCctData = (surfaceData) => {
  let costingArr = JSON.parse(localStorage.getItem('costingArray'))    //HELP
  let rmCcSubAssembly = costingArr && costingArr.find(costingItem => costingItem.PartNumber === surfaceData.PartNumber && costingItem.AssemblyPartNumber === surfaceData.AssemblyPartNumber)
  return rmCcSubAssembly
}