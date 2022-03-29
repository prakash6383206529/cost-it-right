import { checkForNull, loggedInUserId } from "../../helper"
export const createToprowObjAndSave = (tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, tabId, setArrayForCosting) => {

  let Arr = JSON.parse(localStorage.getItem('costingArray'))
  let assemblyWorkingRow = []

  Arr && Arr.map((item) => {
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
        "TotalCostINR": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
        "NetRMBOPCCCost": item.CostingPartDetails?.TotalCalculatedRMBOPCCCost
      }
      assemblyWorkingRow.push(subAssemblyObj)
    }
  })
  let assemblyRequestedData = {

    "TopRow": {
      "CostingId": tabData && tabData.CostingId,
      "CostingNumber": tabData && tabData.CostingNumber,
      "NetRMCostPerAssembly": tabData && tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
      "NetBOPCostAssembly": tabData && tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
      "NetConversionCostPerAssembly": tabData && tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
      "NetRMBOPCCCost": tabData && tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "NetSurfaceTreatmentCost": surfaceTabData && surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
      "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails ? (checkForNull(overHeadAndProfitTabData.CostingPartDetails.OverheadCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.ProfitCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.RejectionCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.ICCCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.PaymentTermCost)) : 0,
      "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
      "NetToolCost": ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
      "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
      "NetDiscounts": discountAndOtherTabData?.HundiOrDiscountValue,
      "TotalCostINR": netPOPrice,
      "TabId": tabId,
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
      "SurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
      "TransportationCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.TransportationCost,
      "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
    },
    "WorkingRows": assemblyWorkingRow,
    "BOPHandlingCharges": {
      "AssemblyCostingId": tabData && tabData.CostingId,
      "IsApplyBOPHandlingCharges": true,
      "BOPHandlingPercentage": getAssemBOPCharge && getAssemBOPCharge.BOPHandlingPercentage,
      "BOPHandlingCharges": getAssemBOPCharge && getAssemBOPCharge.BOPHandlingCharges
    },
    "LoggedInUserId": loggedInUserId()

  }
  return assemblyRequestedData

}
