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
          "TotalRawMaterialsCostWithQuantity": item.PartType === 'Part' ? item?.CostingPartDetails?.NetRawMaterialsCost * item?.CostingPartDetails?.Quantity : item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "TotalBoughtOutPartCostWithQuantity": item.PartType === 'Part' ? item?.CostingPartDetails?.NetBoughtOutPartCost * item?.CostingPartDetails?.Quantity : item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
          "TotalConversionCostPerAssembly": item?.CostingPartDetails?.TotalConversionCostPerAssembly,
          "TotalConversionCostPerSubAssembly": item?.CostingPartDetails?.TotalConversionCostPerSubAssembly,
          "TotalConversionCostComponent": item?.CostingPartDetails?.TotalConversionCostComponent,
          "TotalConversionCostWithQuantity": item.PartType === 'Part' ? item?.CostingPartDetails?.NetConversionCost * item?.CostingPartDetails?.Quantity : item?.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostWithQuantity": item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerAssembly": item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,

          "TotalOperationCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly),
          "TotalOperationCostSubAssembly": checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssembly),
          "TotalOperationCostComponent": checkForNull(item?.CostingPartDetails?.TotalOperationCostComponent),
          "TotalOperationCostWithQuantity": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly),

          "TotalOperationCostPerAssemblyForOverhead": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead),
          "TotalOperationCostSubAssemblyForOverhead": checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssemblyForOverhead),
          "TotalOperationCostComponentForOverhead": checkForNull(item?.CostingPartDetails?.TotalOperationCostComponentForOverhead),
          "TotalOperationCostWithQuantityForOverhead": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead) + checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssemblyForOverhead) + checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead),


          "TotalOperationCostPerAssemblyForProfit": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit),
          "TotalOperationCostSubAssemblyForProfit": checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssemblyForProfit),
          "TotalOperationCostComponentForProfit": checkForNull(item?.CostingPartDetails?.TotalOperationCostComponentForProfit),
          "TotalOperationCostWithQuantityForProfit": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit) + checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssemblyForProfit) + checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit),



          "TotalOtherOperationCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerAssembly),
          "TotalOtherOperationCostPerSubAssembly": checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly),
          "TotalOtherOperationCostComponent": checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostComponent),
          "TotalOtherOperationCostWithQuantity": checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostComponent),

          "TotalProcessCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssembly),
          "TotalProcessCostSubAssembly": checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssembly),
          "TotalProcessCostComponent": checkForNull(item?.CostingPartDetails?.TotalProcessCostComponent),
          "TotalProcessCostWithQuantity": checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssembly),

          "TotalProcessCostPerAssemblyForOverhead": checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead),
          "TotalProcessCostSubAssemblyForOverhead": checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssemblyForOverhead),
          "TotalProcessCostComponentForOverhead": checkForNull(item?.CostingPartDetails?.TotalProcessCostComponentForOverhead),
          "TotalProcessCostWithQuantityForOverhead": checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead) + checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssemblyForOverhead) + checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead),

          "TotalProcessCostPerAssemblyForProfit": checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit),
          "TotalProcessCostSubAssemblyForProfit": checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssemblyForProfit),
          "TotalProcessCostComponentForProfit": checkForNull(item?.CostingPartDetails?.TotalProcessCostComponentForProfit),
          "TotalProcessCostWithQuantityForProfit": checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit) + checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssemblyForProfit) + checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit),



          "SurfaceTreatmentCostPerAssembly": surfaceTabData?.CostingPartDetails?.SurfaceTreatmentCost,
          "TransportationCostPerAssembly": surfaceTabData?.CostingPartDetails?.TransportationCost,
          "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetSurfaceTreatmentCost": surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetPOPrice": (sTSubAssembly !== undefined && Object.keys(sTSubAssembly).length > 0) ? checkForNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(sTSubAssembly?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) : item?.CostingPartDetails?.NetTotalRMBOPCC,
          "NetTotalRMBOPCC": item?.CostingPartDetails?.NetTotalRMBOPCC,



          "AssemblyCostingId": item && item.CostingId,
          "BOPHandlingChargeType": item && item?.CostingPartDetails?.BOPHandlingChargeType,
          "IsApplyBOPHandlingCharges": item && item?.CostingPartDetails?.IsApplyBOPHandlingCharges,
          "BOPHandlingPercentage": item && item?.CostingPartDetails?.BOPHandlingPercentage,
          "BOPHandlingCharges": item && item?.CostingPartDetails?.BOPHandlingCharges,
          "BOPHandlingChargeApplicability": item && item?.CostingPartDetails?.BOPHandlingChargeApplicability,


          "RawMaterialCostWithCutOff": item && item?.CostingPartDetails?.RawMaterialCostWithCutOff,
          "BasicRate": (sTSubAssembly !== undefined && Object.keys(sTSubAssembly).length > 0) ? checkForNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(sTSubAssembly?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) : item?.CostingPartDetails?.NetTotalRMBOPCC,
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
          "TotalSurfaceTreatmentCostPerAssembly": item?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly,
          "TotalSurfaceTreatmentCostPerSubAssembly": item?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly,
          "TotalSurfaceTreatmentCostWithQuantity": item?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity,
          "TotalSurfaceTreatmentCostComponent": item?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent,
          "TotalTransportationCostPerAssembly": item?.CostingPartDetails?.TotalTransportationCostPerAssembly,
          "TotalTransportationCostPerSubAssembly": item?.CostingPartDetails?.TotalTransportationCostPerSubAssembly,
          "TotalTransportationCostWithQuantity": item?.CostingPartDetails?.TotalTransportationCostWithQuantity,
          "TotalTransportationCostComponent": item?.CostingPartDetails?.TotalTransportationCostComponent,
          "PaintCostComponent": item?.CostingPartDetails?.PaintCostComponent,
          "PaintCostPerAssembly": item?.CostingPartDetails?.PaintCostPerAssembly,
          "PaintCostPerSubAssembly": item?.CostingPartDetails?.PaintCostPerSubAssembly,
          "PaintCostWithQuantity": item?.CostingPartDetails?.PaintCostWithQuantity,
          "TapeCostComponent": item?.CostingPartDetails?.TapeCostComponent,
          "TapeCostPerAssembly": item?.CostingPartDetails?.TapeCostPerAssembly,
          "TapeCostPerSubAssembly": item?.CostingPartDetails?.TapeCostPerSubAssembly,
          "TapeCostWithQuantity": item?.CostingPartDetails?.TapeCostWithQuantity,
          "TotalPaintCostComponent": item?.CostingPartDetails?.TotalPaintCostComponent,
          "TotalPaintCostPerAssembly": item?.CostingPartDetails?.TotalPaintCostPerAssembly,
          "TotalPaintCostPerSubAssembly": item?.CostingPartDetails?.TotalPaintCostPerSubAssembly,
          "TotalPaintCostWithQuantity": item?.CostingPartDetails?.TotalPaintCostWithQuantity,

          "HangerCostPerPartComponent": item?.CostingPartDetails?.HangerCostPerPartComponent,
          "HangerCostPerPartPerAssembly": item?.CostingPartDetails?.HangerCostPerPartPerAssembly,
          "HangerCostPerPartPerSubAssembly": item?.CostingPartDetails?.HangerCostPerPartPerSubAssembly,
          "HangerCostPerPartWithQuantity": item?.CostingPartDetails?.HangerCostPerPartWithQuantity,


          "TotalCalculatedSurfaceTreatmentCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerAssembly),
          "TotalCalculatedSurfaceTreatmentCostPerSubAssembly": checkForNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerSubAssembly),
          "TotalCalculatedSurfaceTreatmentCostWithQuantitys": checkForNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys),
          "TotalCalculatedSurfaceTreatmentCostComponent": checkForNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostComponent),
          "NetPOPrice": (rmCcTabSubAssembly !== undefined && Object.keys(rmCcTabSubAssembly).length > 0) ? checkForNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(rmCcTabSubAssembly?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) : checkForNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys),
          "BasicRate": (rmCcTabSubAssembly !== undefined && Object.keys(rmCcTabSubAssembly).length > 0) ? checkForNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(rmCcTabSubAssembly?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) : checkForNull(item?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys),
        }
        assemblyWorkingRow.push(subAssemblyObj)
      }
      return ''
    })
  }
  let basicRate = 0
  const partTypeValue = isPartType?.value || 0
  if (Number(partTypeValue) === PART_TYPE_ASSEMBLY) {
    basicRate = checkForNull(tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) +
      checkForNull(surfaceTabData?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
      checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(discountAndOtherTabData?.AnyOtherCost) + (IsAddPaymentTermInNetCost ? checkForNull(discountAndOtherTabData?.paymentTermCost) : 0) - checkForNull(discountAndOtherTabData?.HundiOrDiscountValue)
  } else {
    basicRate = checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(tabData?.CostingPartDetails?.NetTotalRMBOPCC) +
      checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
      checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(discountAndOtherTabData?.AnyOtherCost) - checkForNull(discountAndOtherTabData?.HundiOrDiscountValue)
  }

  let assemblyRequestedData = {

    "TopRow": {
      "CostingId": tabData && tabData.CostingId,
      "CostingNumber": tabData && tabData.CostingNumber,
      "NetRawMaterialsCost": tabData && tabData?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
      "NetBoughtOutPartCost": tabData && tabData?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
      "NetConversionCost": tabData && tabData?.CostingPartDetails?.TotalConversionCostWithQuantity,
      "NetTotalRMBOPCC": tabData && tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "NetSurfaceTreatmentCost": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys,
      "NetOverheadAndProfitCost": overHeadAndProfitTabData?.CostingPartDetails ? (checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.OverheadCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.RejectionCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ICCCost)) : 0,
      "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
      "NetToolCost": ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
      "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
      "NetDiscountsCost": discountAndOtherTabData?.HundiOrDiscountValue,
      "NetPOPrice": checkForNull(basicRate) + checkForNull(discountAndOtherTabData?.totalConditionCost) + checkForNull(discountAndOtherTabData?.totalNpvCost),
      "BasicRate": basicRate,
      "FreightCost": PackageAndFreightTabData[0]?.CostingPartDetails?.FreightNetCost,
      "PackagingCost": PackageAndFreightTabData[0]?.CostingPartDetails?.PackagingNetCost,
      "TabId": tabId,
      "TotalRawMaterialsCostWithQuantity": tabData && tabData?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
      "TotalBoughtOutPartCostWithQuantity": tabData && tabData?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
      "TotalConversionCostPerAssembly": tabData?.CostingPartDetails?.TotalConversionCostPerAssembly,
      "TotalConversionCostPerSubAssembly": tabData?.CostingPartDetails?.TotalConversionCostPerSubAssembly,
      "TotalConversionCostComponent": tabData?.CostingPartDetails?.TotalConversionCostComponent,
      "TotalConversionCostWithQuantity": tabData && AddLabour ? (tabData?.CostingPartDetails?.TotalConversionCostWithQuantity + checkForNull(tabData?.CostingPartDetails?.NetLabourCost) + checkForNull(tabData?.CostingPartDetails?.IndirectLaborCost) + checkForNull(tabData?.CostingPartDetails?.StaffCost)) : tabData?.CostingPartDetails?.TotalConversionCostWithQuantity,
      "TotalCalculatedRMBOPCCCostWithQuantity": tabData && tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "TotalCalculatedRMBOPCCCostPerAssembly": tabData && tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,

      "TotalOperationCostPerAssembly": tabData?.CostingPartDetails?.TotalOperationCostPerAssembly,
      "TotalOperationCostSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssembly),
      "TotalOperationCostComponent": tabData?.CostingPartDetails?.TotalOperationCostComponent,
      "TotalOperationCostWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCostComponent),

      "TotalOperationCostPerAssemblyForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead),
      "TotalOperationCostSubAssemblyForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssemblyForOverhead),
      "TotalOperationCostComponentForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostComponentForOverhead),
      "TotalOperationCostWithQuantityForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssemblyForOverhead) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCostComponentForOverhead),

      "TotalOperationCostPerAssemblyForProfit": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit),
      "TotalOperationCostSubAssemblyForProfit": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssemblyForProfit),
      "TotalOperationCostComponentForProfit": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostComponentForProfit),
      "TotalOperationCostWithQuantityForProfit": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssemblyForProfit) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCostComponentForProfit),




      "TotalOtherOperationCostPerAssembly": tabData?.CostingPartDetails?.TotalOtherOperationCostPerAssembly,
      "TotalOtherOperationCostPerSubAssembly": tabData?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly,
      "TotalOtherOperationCostComponent": tabData?.CostingPartDetails?.TotalOtherOperationCostComponent,
      "TotalOtherOperationCostWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalOtherOperationCostPerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalOtherOperationCostSubAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalOtherOperationCostComponent),

      "TotalProcessCostPerAssembly": tabData?.CostingPartDetails?.TotalProcessCostPerAssembly,
      "TotalProcessCostSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostSubAssembly),
      "TotalProcessCostComponent": tabData?.CostingPartDetails?.TotalProcessCostComponent,
      "TotalProcessCostWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCostSubAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCostComponent),

      "TotalProcessCostPerAssemblyForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead),
      "TotalProcessCostSubAssemblyForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostSubAssemblyForOverhead),
      "TotalProcessCostComponentForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostComponentForOverhead),
      "TotalProcessCostWithQuantityForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCostSubAssemblyForOverhead) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCostComponentForOverhead),

      "TotalProcessCostPerAssemblyForProfit": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit),
      "TotalProcessCostSubAssemblyForProfit": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostSubAssemblyForProfit),
      "TotalProcessCostComponentForProfit": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostComponentForProfit),
      "TotalProcessCostWithQuantityForProfit": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCostSubAssemblyForProfit) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCostComponentForProfit),



      "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly,
      "TotalSurfaceTreatmentCostPerSubAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly,
      "TotalSurfaceTreatmentCostWithQuantity": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity,
      "TotalSurfaceTreatmentCostComponent": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent,
      "TotalTransportationCostPerAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalTransportationCostPerAssembly,
      "TotalTransportationCostPerSubAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalTransportationCostPerSubAssembly,
      "TotalTransportationCostWithQuantity": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalTransportationCostWithQuantity,
      "TotalTransportationCostComponent": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalTransportationCostComponent,
      "PaintCost": surfaceTabData && surfaceTabData?.CostingPartDetails?.PaintCost,
      "PaintCostComponent": surfaceTabData && surfaceTabData?.CostingPartDetails?.PaintCostComponent,
      "PaintCostPerAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.PaintCostPerAssembly,
      "PaintCostPerSubAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.PaintCostPerSubAssembly,
      "PaintCostWithQuantity": surfaceTabData && surfaceTabData?.CostingPartDetails?.PaintCostWithQuantity,
      "TapeCost": surfaceTabData && surfaceTabData?.CostingPartDetails?.TapeCost,
      "TapeCostComponent": surfaceTabData && surfaceTabData?.CostingPartDetails?.TapeCostComponent,
      "TapeCostPerAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.TapeCostPerAssembly,
      "TapeCostPerSubAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.TapeCostPerSubAssembly,
      "TapeCostWithQuantity": surfaceTabData && surfaceTabData?.CostingPartDetails?.TapeCostWithQuantity,
      "TotalPaintCostComponent": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalPaintCostComponent,
      "TotalPaintCostPerAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalPaintCostPerAssembly,
      "TotalPaintCostPerSubAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalPaintCostPerSubAssembly,
      "TotalPaintCostWithQuantity": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalPaintCostWithQuantity,
      "HangerCostPerPartComponent": surfaceTabData && surfaceTabData?.CostingPartDetails?.HangerCostPerPartComponent,
      "HangerCostPerPartPerAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.HangerCostPerPartPerAssembly,
      "HangerCostPerPartPerSubAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.HangerCostPerPartPerSubAssembly,
      "HangerCostPerPartWithQuantity": surfaceTabData && surfaceTabData?.CostingPartDetails?.HangerCostPerPartWithQuantity,

      "TotalCalculatedSurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerAssembly,
      "TotalCalculatedSurfaceTreatmentCostPerSubAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerSubAssembly,
      "TotalCalculatedSurfaceTreatmentCostWithQuantitys": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys,
      "TotalCalculatedSurfaceTreatmentCostComponent": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostComponent,
      "RawMaterialCostWithCutOff": tabData && tabData?.CostingPartDetails?.RawMaterialCostWithCutOff,
      "IsRMCutOffApplicable": tabData && tabData?.CostingPartDetails?.IsRMCutOffApplicable,
      "NetLabourCost": tabData && tabData?.CostingPartDetails?.NetLabourCost,
      "IndirectLaborCost": tabData && tabData?.CostingPartDetails?.IndirectLaborCost,
      "StaffCost": tabData && tabData?.CostingPartDetails?.StaffCost,
      "StaffCostPercentage": tabData && tabData?.CostingPartDetails?.StaffCostPercentage,
      "IndirectLaborCostPercentage": tabData && tabData?.CostingPartDetails?.IndirectLaborCostPercentage,
      "StaffCRMHead": tabData && tabData?.CostingPartDetails?.StaffCRMHead,
      "NetLabourCRMHead": tabData && tabData?.CostingPartDetails?.NetLabourCRMHead,
      "IndirectLabourCRMHead": tabData && tabData?.CostingPartDetails?.IndirectLabourCRMHead,
      // "SurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.SurfaceTreatmentCost,
      // "TransportationCostPerAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.TransportationCost,
      // "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost,
      "NetOtherOperationCost": 0,               // SET AS 0 BECAUSE ASSEMBLY TECHNOLOGY DOES NOT HAVE OTHER OPERATION OPTION
    },
    "WorkingRows": assemblyWorkingRow,
    "BOPHandlingCharges": {
      "AssemblyCostingId": tabData && tabData.CostingId,
      "IsApplyBOPHandlingCharges": tabData && tabData?.CostingPartDetails?.IsApplyBOPHandlingCharges,
      "BOPHandlingChargeApplicability": tabData && tabData?.CostingPartDetails?.BOPHandlingChargeApplicability,
      "BOPHandlingPercentage": tabData && tabData?.CostingPartDetails?.BOPHandlingPercentage,
      "BOPHandlingCharges": tabData && tabData?.CostingPartDetails?.BOPHandlingCharges,
      "BOPHandlingChargeType": tabData && tabData?.CostingPartDetails?.BOPHandlingChargeType
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
export const findProcessCost = (uom, mhr, productionPerHour, mhrWithoutInterestAndDepreciation = null) => {
  let processCost = 0;
  let processCostWithoutInterestAndDepreciation = 0;
  const multiplier = getTimeMultiplier(uom);
  if (multiplier) {
    processCost = checkForNull((checkForNull(mhr) * multiplier) / checkForNull(productionPerHour));

    if (mhrWithoutInterestAndDepreciation) {
      processCostWithoutInterestAndDepreciation = checkForNull(
        (checkForNull(mhrWithoutInterestAndDepreciation) * multiplier) / checkForNull(productionPerHour)
      );

    }
  }

  return {
    processCost: checkForNull(processCost),
    processCostWithoutInterestAndDepreciation: checkForNull(processCostWithoutInterestAndDepreciation)
  };
};

// Helper function to get time multiplier
const getTimeMultiplier = (uom) => {
  switch (uom) {
    case HOUR:
      return 1;
    case MINUTES:
      return 60;
    case SECONDS:
      return 3600;
    case MILLISECONDS:
      return 3600000;
    case MICROSECONDS:
      return 3600000000;
    default:
      return 0;
  }
};


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
    if (item.BOMLevel === 'L1' && (item.PartType === 'Sub Assembly' || item.PartType === 'Part'||item.PartType === 'BOP')) {
      let subAssemblyObj = {
        "CostingId": item?.CostingId,
        "NetPOPrice": item?.CostingPartDetails?.NetPOPrice,
        "NetChildPartsCostWithQuantity": item?.CostingPartDetails?.NetChildPartsCostWithQuantity,
        "BasicRate": item?.CostingPartDetails?.NetPOPrice,
        "TotalBoughtOutPartCostWithQuantity": item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity
      }
      assemblyWorkingRow.push(subAssemblyObj)
    }
    return ''
  })

  let basicRate = 0
  let totalOverheadPrice = checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.OverheadCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.RejectionCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ICCCost)
  basicRate = checkForNull(tabData?.CostingPartDetails?.NetTotalRMBOPCC) + checkForNull(totalOverheadPrice) +
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
      "NetOperationCost": tabData?.CostingPartDetails?.NetOperationCost,
      "NetProcessCost": tabData?.CostingPartDetails?.NetProcessCost,
      "NetChildPartsCost": tabData?.CostingPartDetails?.NetChildPartsCost,
      "NetRawMaterialsCost": tabData?.CostingPartDetails?.NetChildPartsCost,
      "NetBoughtOutPartCost": tabData?.CostingPartDetails?.NetBoughtOutPartCost,
      "NetConversionCost": checkForNull(tabData?.CostingPartDetails?.NetOperationCost) + checkForNull(tabData?.CostingPartDetails?.NetProcessCost) + checkForNull(tabData?.NetLabourCost) + checkForNull(tabData?.IndirectLaborCost) + checkForNull(tabData?.StaffCost),
      "NetTotalRMBOPCC": checkForNull(tabData?.CostingPartDetails?.NetChildPartsCost) + checkForNull(tabData?.CostingPartDetails?.NetBoughtOutPartCost) + checkForNull(tabData?.CostingPartDetails?.NetOperationCost) + checkForNull(tabData?.CostingPartDetails?.NetProcessCost) + checkForNull(tabData?.NetLabourCost) + checkForNull(tabData?.IndirectLaborCost) + checkForNull(tabData?.StaffCost),
      "NetSurfaceTreatmentCost": surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost,
      "NetOverheadAndProfitCost": totalOverheadPrice,
      "NetPackagingAndFreightCost": packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost,
      "NetToolCost": toolTabData?.CostingPartDetails?.TotalToolCost,
      "NetOtherCost": DiscountCostData?.AnyOtherCost,
      "NetDiscountsCost": DiscountCostData?.HundiOrDiscountValue,
      "NetPOPrice": checkForNull(totalCost),
      "TransportationCost": surfaceTabData?.CostingPartDetails?.TransportationCost,
      "SurfaceTreatmentCost": surfaceTabData?.CostingPartDetails?.SurfaceTreatmentCost,
      "PackagingCost": packageAndFreightTabData?.CostingPartDetails?.PackagingNetCost,
      "FreightCost": packageAndFreightTabData?.CostingPartDetails?.FreightNetCost,
      "OverheadCost": overHeadAndProfitTabData?.CostingPartDetails?.OverheadCost,
      "ProfitCost": overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost,
      "RejectionCost": overHeadAndProfitTabData?.CostingPartDetails?.RejectionCost,
      "ICCCost": overHeadAndProfitTabData?.CostingPartDetails?.ICCCost,
      "PaymentTermCost": DiscountCostData?.paymentTermCost || 0,
      "NetLabourCost": tabData?.CostingPartDetails?.NetLabourCost,
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


