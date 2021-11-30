import { checkForNull, loggedInUserId } from "../../helper"


export const createToprowObjAndSave = (tabData,surfaceTabData,PackageAndFreightTabData,overHeadAndProfitTabData,ToolTabData,discountAndOtherTabData,netPOPrice,getAssemBOPCharge,tabId)=>{
 

    let assemblyWorkingRow = []

    tabData && tabData.CostingChildPartDetails && tabData.CostingChildPartDetails.map((item) => {
        let subAssemblyObj = {
          "CostingId": item.CostingId,
          "CostingNumber": "", // Need to find out how to get it.
          "TotalRawMaterialsCostWithQuantity": item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "TotalBoughtOutPartCostWithQuantity": item.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
          "TotalConversionCostWithQuantity": item.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerPC": item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity + item.CostingPartDetails?.TotalBoughtOutPartCost + item.CostingPartDetails?.TotalConversionCost,
          "TotalCalculatedRMBOPCCCostPerAssembly": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "TotalOperationCostPerAssembly": item.CostingPartDetails?.TotalOperationCostPerAssembly,
          "TotalOperationCostSubAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostSubAssembly),
          "TotalOperationCostComponent": item.CostingPartDetails?.TotalOperationCostComponent,
          "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
          "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
          "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails?.NetOverheadAndProfitCost,
          "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
          "NetToolCost": discountAndOtherTabData?.CostingPartDetails?.TotalToolCost,
          "NetOtherCost": discountAndOtherTabData?.CostingPartDetails?.NetOtherCost,
          "NetDiscounts": discountAndOtherTabData?.CostingPartDetails?.NetDiscountsCost,
          "TotalCostINR": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity
        }
        assemblyWorkingRow.push(subAssemblyObj)
      })
      let assemblyRequestedData = {

        "TopRow": {
          "CostingId": tabData && tabData.CostingId,
          "CostingNumber": tabData && tabData.CostingNumber,
          "TotalRawMaterialsCostWithQuantity": tabData && tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "TotalBoughtOutPartCostWithQuantity": tabData && tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
          "TotalConversionCostWithQuantity": tabData && tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerPC": tabData && tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity + tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity + tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerAssembly": tabData && tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "NetRMCostPerAssembly": tabData && tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "NetBOPCostAssembly": tabData && tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
          "NetConversionCostPerAssembly": tabData && tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "NetRMBOPCCCost": tabData && tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "TotalOperationCostPerAssembly":tabData && tabData.CostingPartDetails?.TotalOperationCostPerAssembly,
          "TotalOperationCostSubAssembly": tabData &&checkForNull(tabData.CostingPartDetails?.TotalOperationCostSubAssembly),
          "TotalOperationCostComponent":tabData&& tabData.CostingPartDetails?.TotalOperationCostComponent,
          "SurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
          "TransportationCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.TransportationCost,
          "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetSurfaceTreatmentCost": surfaceTabData && surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetOverheadAndProfits": overHeadAndProfitTabData &&overHeadAndProfitTabData.CostingPartDetails ?( checkForNull(overHeadAndProfitTabData.CostingPartDetails?.OverheadCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails?.ProfitCost)+ checkForNull(overHeadAndProfitTabData.CostingPartDetails?.RejectionCost)+ checkForNull(overHeadAndProfitTabData.CostingPartDetails?.ICCCost)+ checkForNull(overHeadAndProfitTabData.CostingPartDetails?.PaymentTermCost)):0,
          "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
          "NetToolCost": ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
          "NetOtherCost": discountAndOtherTabData &&discountAndOtherTabData?.AnyOtherCost,
          "NetDiscounts": discountAndOtherTabData &&discountAndOtherTabData?.HundiOrDiscountValue,
          "TotalCostINR": netPOPrice,
          "TabId": tabId
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
