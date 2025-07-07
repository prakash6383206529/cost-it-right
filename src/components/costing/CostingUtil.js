import { useDispatch } from "react-redux";
import { reactLocalStorage } from "reactjs-localstorage";
import { COSTAPPLICABILITYBASIS, EMPTY_GUID, HOUR, MACHINING, MICROSECONDS, MILLISECONDS, MINUTES, SECONDS } from "../../config/constants";
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from "../../helper"
import DayTime from "../common/DayTimeWrapper";
import { getBriefCostingById, gridDataAdded, isDataChange, saveAssemblyBOPHandlingCharge, saveBOMLevel, savePartNumber, setComponentDiscountOtherItemData, setComponentItemData, setComponentOverheadItemData, setComponentPackageFreightItemData, setComponentToolItemData, setOverheadProfitData, setPackageAndFreightData, setPartNumberArrayAPICALL, setProcessGroupGrid, setRMCCData, setSurfaceCostData, setToolTabData } from "./actions/Costing";
import { PART_TYPE_ASSEMBLY, PLASTIC } from "../../config/masterData";
import { checkDivisionByPlantAndGetDivisionIdByPart } from "../../actions/Common";
import Toaster from "../common/Toaster";
import { MESSAGES } from "../../config/message";
import $ from "jquery"
import _ from 'lodash'

// TO CREATE OBJECT FOR IN SAVE-ASSEMBLY-PART-ROW-COSTING
export const createToprowObjAndSave = (tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, tabId, effectiveDate, AddLabour = false, basicRateForST = '', isPartType = {}, IsAddPaymentTermInNetCost = false, remark = '', bopCostingIdForRemark = '') => {
  let Arr = JSON.parse(sessionStorage.getItem('costingArray'))

  let surfaceTreatmentArr = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))
  let assemblyWorkingRow = []

  if (tabId === 1) {
    // TABRMCC SUB ASSEMBLIES
    Arr && Arr.map((item) => {
      let sTSubAssembly = surfaceTreatmentArr && surfaceTreatmentArr.find(surfaceItem => surfaceItem.PartNumber === item.PartNumber && surfaceItem.AssemblyPartNumber === item.AssemblyPartNumber)
      if (item.PartType === 'Sub Assembly' || item.PartType === 'BOP') {
        let subAssemblyObj = {
          "PartName": item?.PartName,
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
          "TotalBoughtOutPartCostComponent": item?.CostingPartDetails?.TotalBoughtOutPartCostComponent,
          "TotalBoughtOutPartCostSubAssembly": item?.CostingPartDetails?.TotalBoughtOutPartCostSubAssembly,
          "TotalBoughtOutPartCostPerAssembly": item?.CostingPartDetails?.TotalBoughtOutPartCostPerAssembly,
          "TotalBoughtOutPartCostWithOutHandlingChargeWithQuantity": item?.CostingPartDetails?.TotalBoughtOutPartCostWithOutHandlingChargeWithQuantity,
          "TotalBoughtOutPartCostWithOutHandlingChargePerAssembly": item?.CostingPartDetails?.TotalBoughtOutPartCostWithOutHandlingChargePerAssembly,
          "TotalBoughtOutPartCostWithOutHandlingChargeComponent": item?.CostingPartDetails?.TotalBoughtOutPartCostWithOutHandlingChargeComponent,
          "TotalBoughtOutPartCostWithOutHandlingChargeSubAssembly": item?.CostingPartDetails?.TotalBoughtOutPartCostWithOutHandlingChargeSubAssembly,

          "TotalBOPDomesticCostWithQuantity": checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostComponent) + checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostSubAssembly),
          "TotalBOPDomesticCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostPerAssembly),
          "TotalBOPDomesticCostComponent": checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostComponent),
          "TotalBOPDomesticCostSubAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostSubAssembly),

          "TotalBOPImportCostWithQuantity": checkForNull(item?.CostingPartDetails?.TotalBOPImportCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalBOPImportCostComponent) + checkForNull(item?.CostingPartDetails?.TotalBOPImportCostSubAssembly),
          "TotalBOPImportCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPImportCostPerAssembly),
          "TotalBOPImportCostComponent": checkForNull(item?.CostingPartDetails?.TotalBOPImportCostComponent),
          "TotalBOPImportCostSubAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPImportCostSubAssembly),

          "TotalBOPSourceCostWithQuantity": checkForNull(item?.CostingPartDetails?.TotalBOPSourcedCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalBOPSourceCostComponent) + checkForNull(item?.CostingPartDetails?.TotalBOPSourceCostSubAssembly),
          "TotalBOPSourceCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPSourceCostPerAssembly),
          "TotalBOPSourceCostComponent": checkForNull(item?.CostingPartDetails?.TotalBOPSourceCostComponent),
          "TotalBOPSourceCostSubAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPSourceCostSubAssembly),

          "TotalBOPOutsourcedCostWithQuantity": checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostComponent) + checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostSubAssembly),
          "TotalBOPOutsourcedCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostPerAssembly),
          "TotalBOPOutsourcedCostComponent": checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostComponent),
          "TotalBOPOutsourcedCostSubAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostSubAssembly),

          "TotalBOPDomesticCostWithOutHandlingChargeWithQuantity": checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargePerAssembly) + checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargeComponent) + checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargeSubAssembly),
          "TotalBOPDomesticCostWithOutHandlingChargePerAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargePerAssembly),
          "TotalBOPDomesticCostWithOutHandlingChargeComponent": checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargeComponent),
          "TotalBOPDomesticCostWithOutHandlingChargeSubAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargeSubAssembly),

          "TotalBOPImportCostWithOutHandlingChargeWithQuantity": checkForNull(item?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargePerAssembly) + checkForNull(item?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargeComponent) + checkForNull(item?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargeSubAssembly),
          "TotalBOPImportCostWithOutHandlingChargePerAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargePerAssembly),
          "TotalBOPImportCostWithOutHandlingChargeComponent": checkForNull(item?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargeComponent),
          "TotalBOPImportCostWithOutHandlingChargeSubAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargeSubAssembly),

          "TotalBOPSourceCostWithOutHandlingChargeWithQuantity": checkForNull(item?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargePerAssembly) + checkForNull(item?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargeComponent) + checkForNull(item?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargeSubAssembly),
          "TotalBOPSourceCostWithOutHandlingChargePerAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargePerAssembly),
          "TotalBOPSourceCostWithOutHandlingChargeComponent": checkForNull(item?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargeComponent),
          "TotalBOPSourceCostWithOutHandlingChargeSubAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargeSubAssembly),

          "TotalBOPOutsourcedCosWithOutHandlingChargetWithQuantity": checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargePerAssembly) + checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargeComponent) + checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargeSubAssembly),
          "TotalBOPOutsourcedCostWithOutHandlingChargePerAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargePerAssembly),
          "TotalBOPOutsourcedCostWithOutHandlingChargeComponent": checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargeComponent),
          "TotalBOPOutsourcedCostWithOutHandlingChargeSubAssembly": checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargeSubAssembly),

          "TotalOperationCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly),
          "TotalOperationCostSubAssembly": checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssembly),
          "TotalOperationCostComponent": checkForNull(item?.CostingPartDetails?.TotalOperationCostComponent),
          "TotalOperationCostWithQuantity": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly),

          "TotalWeldingCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalWeldingCostPerAssembly),
          "TotalWeldingCostSubAssembly": checkForNull(item?.CostingPartDetails?.TotalWeldingCostSubAssembly),
          "TotalWeldingCostComponent": checkForNull(item?.CostingPartDetails?.TotalWeldingCostComponent),
          "TotalWeldingCostWithQuantity": checkForNull(item?.CostingPartDetails?.TotalWeldingCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalWeldingCostSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalWeldingCostComponent),

          "TotalOperationCostPerAssemblyForOverhead": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead),
          "TotalOperationCostSubAssemblyForOverhead": checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssemblyForOverhead),
          "TotalOperationCostComponentForOverhead": checkForNull(item?.CostingPartDetails?.TotalOperationCostComponentForOverhead),
          "TotalOperationCostWithQuantityForOverhead": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead) + checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssemblyForOverhead) + checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead),


          "TotalWeldingCostPerAssemblyForOverhead": checkForNull(item?.CostingPartDetails?.TotalWeldingCostPerAssemblyForOverhead),
          "TotalWeldingCostSubAssemblyForOverhead": checkForNull(item?.CostingPartDetails?.TotalWeldingCostSubAssemblyForOverhead),
          "TotalWeldingCostComponentForOverhead": checkForNull(item?.CostingPartDetails?.TotalWeldingCostComponentForOverhead),
          "TotalWeldingCostWithQuantityForOverhead": checkForNull(item?.CostingPartDetails?.TotalWeldingCostPerAssemblyForOverhead) + checkForNull(item?.CostingPartDetails?.TotalWeldingCostSubAssemblyForOverhead) + checkForNull(item?.CostingPartDetails?.TotalWeldingCostComponentForOverhead),

          "TotalOperationCostPerAssemblyForProfit": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit),
          "TotalOperationCostSubAssemblyForProfit": checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssemblyForProfit),
          "TotalOperationCostComponentForProfit": checkForNull(item?.CostingPartDetails?.TotalOperationCostComponentForProfit),
          "TotalOperationCostWithQuantityForProfit": checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit) + checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssemblyForProfit) + checkForNull(item?.CostingPartDetails?.TotalOperationCostComponentForProfit),

          "TotalWeldingCostPerAssemblyForProfit": checkForNull(item?.CostingPartDetails?.TotalWeldingCostPerAssemblyForProfit),
          "TotalWeldingCostSubAssemblyForProfit": checkForNull(item?.CostingPartDetails?.TotalWeldingCostSubAssemblyForProfit),
          "TotalWeldingCostComponentForProfit": checkForNull(item?.CostingPartDetails?.TotalWeldingCostComponentForProfit),
          "TotalWeldingCostWithQuantityForProfit": checkForNull(item?.CostingPartDetails?.TotalWeldingCostPerAssemblyForProfit) + checkForNull(item?.CostingPartDetails?.TotalWeldingCostSubAssemblyForProfit) + checkForNull(item?.CostingPartDetails?.TotalWeldingCostComponentForProfit),

          "TotalOtherOperationCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerAssembly),
          "TotalOtherOperationCostPerSubAssembly": checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly),
          "TotalOtherOperationCostComponent": checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostComponent),
          "TotalOtherOperationCostWithQuantity": checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostComponent),

          "TotalProcessCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssembly),
          "TotalProcessCostSubAssembly": checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssembly),
          "TotalProcessCostComponent": checkForNull(item?.CostingPartDetails?.TotalProcessCostComponent),
          "TotalProcessCostWithQuantity": checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalProcessCostComponent),
          //Process Cost for Other Technology
          "TotalCCForOtherTechnologyCostPerAssembly": checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssembly),
          "TotalCCForOtherTechnologyCostSubAssembly": checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCosttSubAssembly),
          "TotalCCForOtherTechnologyCostComponent": checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponent),
          "TotalCCForOtherTechnologyCostWithQuantity": checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssembly) + checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponent),


          "TotalProcessCostPerAssemblyForOverhead": checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead),
          "TotalProcessCostSubAssemblyForOverhead": checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssemblyForOverhead),
          "TotalProcessCostComponentForOverhead": checkForNull(item?.CostingPartDetails?.TotalProcessCostComponentForOverhead),
          "TotalProcessCostWithQuantityForOverhead": checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead) + checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssemblyForOverhead) + checkForNull(item?.CostingPartDetails?.TotalProcessCostComponentForOverhead),

          //Process Cost for Other Technology
          "TotalCCForOtherTechnologyCostPerAssemblyForOverhead": checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForOverhead),
          "TotalCCForOtherTechnologyCostSubAssemblyForOverhead": checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForOverhead),
          "TotalCCForOtherTechnologyCostComponentForOverhead": checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForOverhead),
          "TotalCCForOtherTechnologyCostWithQuantityForOverhead": checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForOverhead) + checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForOverhead) + checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForOverhead),

          "TotalProcessCostPerAssemblyForProfit": checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit),
          "TotalProcessCostSubAssemblyForProfit": checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssemblyForProfit),
          "TotalProcessCostComponentForProfit": checkForNull(item?.CostingPartDetails?.TotalProcessCostComponentForProfit),
          "TotalProcessCostWithQuantityForProfit": checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit) + checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssemblyForProfit) + checkForNull(item?.CostingPartDetails?.TotalProcessCostComponentForProfit),

          //Process Cost for Other Technology
          "TotalCCForOtherTechnologyCostPerAssemblyForProfit": checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForProfit),
          "TotalCCForOtherTechnologyCostSubAssemblyForProfit": checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForProfit),
          "TotalCCForOtherTechnologyCostComponentForProfit": checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForProfit),
          "TotalCCForOtherTechnologyCostWithQuantityForProfit": checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForProfit) + checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForProfit) + checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForProfit),


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
          "Remark": item?.Remark ?? ""
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

          "PaintConsumptionCostComponent": item?.CostingPartDetails?.PaintConsumptionCostComponent,
          "PaintConsumptionCostPerAssembly": item?.CostingPartDetails?.PaintConsumptionCostPerAssembly,
          "PaintConsumptionCostPerSubAssembly": item?.CostingPartDetails?.PaintConsumptionCostPerSubAssembly,
          "PaintConsumptionCostWithQuantity": item?.CostingPartDetails?.PaintConsumptionCostWithQuantity,

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
      "BOPHandlingCharges": tabData && tabData?.CostingPartDetails?.BOPHandlingCharges,
      "IsApplyBOPHandlingCharges": tabData && tabData?.CostingPartDetails?.IsApplyBOPHandlingCharges,
      "NetConversionCost": tabData && tabData?.CostingPartDetails?.TotalConversionCostWithQuantity,
      "NetTotalRMBOPCC": tabData && tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "NetSurfaceTreatmentCost": surfaceTabData && surfaceTabData?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys,
      "NetOverheadAndProfitCost": overHeadAndProfitTabData?.CostingPartDetails ? (checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.OverheadCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.RejectionCost)) : 0,
      "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
      "NetToolCost": ToolTabData && ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
      "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
      "NetDiscountsCost": discountAndOtherTabData?.HundiOrDiscountValue,
      "NetPOPrice": checkForNull(basicRate) + checkForNull(discountAndOtherTabData?.totalConditionCost) + checkForNull(discountAndOtherTabData?.totalNpvCost) + checkForNull(discountAndOtherTabData?.totalLineInvestmentCost),
      "BasicRate": basicRate,
      "FreightCost": PackageAndFreightTabData[0]?.CostingPartDetails?.FreightNetCost,
      "PackagingCost": PackageAndFreightTabData[0]?.CostingPartDetails?.PackagingNetCost,
      "TabId": tabId,
      "TotalRawMaterialsCostWithQuantity": tabData && tabData?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
      "TotalBoughtOutPartCostWithQuantity": tabData && tabData?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
      "TotalBoughtOutPartCostWithOutHandlingChargeWithQuantity": tabData && tabData?.CostingPartDetails?.TotalBoughtOutPartCostWithOutHandlingChargeWithQuantity,
      "TotalBoughtOutPartCostWithOutHandlingChargePerAssembly": tabData && tabData?.CostingPartDetails?.TotalBoughtOutPartCostWithOutHandlingChargePerAssembly,
      "TotalBoughtOutPartCostWithOutHandlingChargeComponent": tabData && tabData?.CostingPartDetails?.TotalBoughtOutPartCostWithOutHandlingChargeComponent,
      "TotalBoughtOutPartCostWithOutHandlingChargeSubAssembly": tabData && tabData?.CostingPartDetails?.TotalBoughtOutPartCostWithOutHandlingChargeSubAssembly,

      "TotalConversionCostPerAssembly": tabData?.CostingPartDetails?.TotalConversionCostPerAssembly,
      "TotalConversionCostPerSubAssembly": tabData?.CostingPartDetails?.TotalConversionCostPerSubAssembly,
      "TotalConversionCostComponent": tabData?.CostingPartDetails?.TotalConversionCostComponent,
      "TotalConversionCostWithQuantity": tabData && AddLabour ? (tabData?.CostingPartDetails?.TotalConversionCostWithQuantity + checkForNull(tabData?.CostingPartDetails?.NetLabourCost) + checkForNull(tabData?.CostingPartDetails?.IndirectLaborCost) + checkForNull(tabData?.CostingPartDetails?.StaffCost)) : tabData?.CostingPartDetails?.TotalConversionCostWithQuantity,
      "TotalCalculatedRMBOPCCCostWithQuantity": tabData && tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "TotalCalculatedRMBOPCCCostPerAssembly": tabData && tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "TotalBoughtOutPartCostComponent": tabData?.CostingPartDetails?.TotalBoughtOutPartCostComponent,
      "TotalBoughtOutPartCostSubAssembly": tabData?.CostingPartDetails?.TotalBoughtOutPartCostSubAssembly,
      "TotalBoughtOutPartCostPerAssembly": tabData?.CostingPartDetails?.TotalBoughtOutPartCostPerAssembly,

      "TotalBOPDomesticCostWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalBOPDomesticCostPerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalBOPDomesticCostComponent) + checkForNull(tabData?.CostingPartDetails?.TotalBOPDomesticCostSubAssembly),
      "TotalBOPDomesticCostPerAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPDomesticCostPerAssembly),
      "TotalBOPDomesticCostComponent": checkForNull(tabData?.CostingPartDetails?.TotalBOPDomesticCostComponent),
      "TotalBOPDomesticCostSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPDomesticCostSubAssembly),

      "TotalBOPImportCostWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalBOPImportCostPerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalBOPImportCostComponent) + checkForNull(tabData?.CostingPartDetails?.TotalBOPImportCostSubAssembly),
      "TotalBOPImportCostPerAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPImportCostPerAssembly),
      "TotalBOPImportCostComponent": checkForNull(tabData?.CostingPartDetails?.TotalBOPImportCostComponent),
      "TotalBOPImportCostSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPImportCostSubAssembly),

      "TotalBOPSourceCostWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalBOPSourceCostPerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalBOPSourceCostComponent) + checkForNull(tabData?.CostingPartDetails?.TotalBOPSourceCostSubAssembly),
      "TotalBOPSourceCostPerAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPSourceCostPerAssembly),
      "TotalBOPSourceCostComponent": checkForNull(tabData?.CostingPartDetails?.TotalBOPSourceCostComponent),
      "TotalBOPSourceCostSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPSourceCostSubAssembly),

      "TotalBOPOutsourcedCostWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalBOPOutsourcedCostPerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalBOPOutsourcedCostComponent) + checkForNull(tabData?.CostingPartDetails?.TotalBOPOutsourcedCostSubAssembly),
      "TotalBOPOutsourcedCostPerAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPOutsourcedCostPerAssembly),
      "TotalBOPOutsourcedCostComponent": checkForNull(tabData?.CostingPartDetails?.TotalBOPOutsourcedCostComponent),
      "TotalBOPOutsourcedCostSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPOutsourcedCostSubAssembly),

      "TotalBOPDomesticCostWithOutHandlingChargeWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargePerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargeComponent) + checkForNull(tabData?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargeSubAssembly),
      "TotalBOPDomesticCostWithOutHandlingChargePerAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargePerAssembly),
      "TotalBOPDomesticCostWithOutHandlingChargeComponent": checkForNull(tabData?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargeComponent),
      "TotalBOPDomesticCostWithOutHandlingChargeSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargeSubAssembly),

      "TotalBOPImportCostWithOutHandlingChargeWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargePerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargeComponent) + checkForNull(tabData?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargeSubAssembly),
      "TotalBOPImportCostWithOutHandlingChargePerAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargePerAssembly),
      "TotalBOPImportCostWithOutHandlingChargeComponent": checkForNull(tabData?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargeComponent),
      "TotalBOPImportCostWithOutHandlingChargeSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargeSubAssembly),

      "TotalBOPSourceCostWithOutHandlingChargeWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargePerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargeComponent) + checkForNull(tabData?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargeSubAssembly),
      "TotalBOPSourceCostWithOutHandlingChargePerAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargePerAssembly),
      "TotalBOPSourceCostWithOutHandlingChargeComponent": checkForNull(tabData?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargeComponent),
      "TotalBOPSourceCostWithOutHandlingChargeSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargeSubAssembly),

      "TotalBOPOutsourcedCosWithOutHandlingChargetWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargePerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargeComponent) + checkForNull(tabData?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargeSubAssembly),
      "TotalBOPOutsourcedCostWithOutHandlingChargePerAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargePerAssembly),
      "TotalBOPOutsourcedCostWithOutHandlingChargeComponent": checkForNull(tabData?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargeComponent),
      "TotalBOPOutsourcedCostWithOutHandlingChargeSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargeSubAssembly),


      "TotalOperationCostPerAssembly": tabData?.CostingPartDetails?.TotalOperationCostPerAssembly,
      "TotalOperationCostSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssembly),
      "TotalOperationCostComponent": tabData?.CostingPartDetails?.TotalOperationCostComponent,
      "TotalOperationCostWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCostComponent),
      "TotalWeldingCostPerAssembly": checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostPerAssembly),
      "TotalWeldingCostSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostSubAssembly),
      "TotalWeldingCostComponent": checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostComponent),
      "TotalWeldingCostWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostPerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostSubAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostComponent),

      "TotalOperationCostPerAssemblyForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead),
      "TotalOperationCostSubAssemblyForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssemblyForOverhead),
      "TotalOperationCostComponentForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostComponentForOverhead),
      "TotalOperationCostWithQuantityForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssemblyForOverhead) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCostComponentForOverhead),

      "TotalWeldingCostPerAssemblyForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostPerAssemblyForOverhead),
      "TotalWeldingCostSubAssemblyForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostSubAssemblyForOverhead),
      "TotalWeldingCostComponentForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostComponentForOverhead),
      "TotalWeldingCostWithQuantityForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostPerAssemblyForOverhead) + checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostSubAssemblyForOverhead) + checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostComponentForOverhead),

      "TotalOperationCostPerAssemblyForProfit": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit),
      "TotalOperationCostSubAssemblyForProfit": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssemblyForProfit),
      "TotalOperationCostComponentForProfit": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostComponentForProfit),
      "TotalOperationCostWithQuantityForProfit": checkForNull(tabData?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCostSubAssemblyForProfit) + checkForNull(tabData?.CostingPartDetails?.TotalOperationCostComponentForProfit),

      "TotalWeldingCostPerAssemblyForProfit": checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostPerAssemblyForProfit),
      "TotalWeldingCostSubAssemblyForProfit": checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostSubAssemblyForProfit),
      "TotalWeldingCostComponentForProfit": checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostComponentForProfit),
      "TotalWeldingCostWithQuantityForProfit": checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostPerAssemblyForProfit) + checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostSubAssemblyForProfit) + checkForNull(tabData?.CostingPartDetails?.TotalWeldingCostComponentForProfit),




      "TotalOtherOperationCostPerAssembly": tabData?.CostingPartDetails?.TotalOtherOperationCostPerAssembly,
      "TotalOtherOperationCostPerSubAssembly": tabData?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly,
      "TotalOtherOperationCostComponent": tabData?.CostingPartDetails?.TotalOtherOperationCostComponent,
      "TotalOtherOperationCostWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalOtherOperationCostPerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalOtherOperationCostSubAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalOtherOperationCostComponent),

      "TotalProcessCostPerAssembly": tabData?.CostingPartDetails?.TotalProcessCostPerAssembly,
      "TotalProcessCostSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostSubAssembly),
      "TotalProcessCostComponent": tabData?.CostingPartDetails?.TotalProcessCostComponent,
      "TotalProcessCostWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCostSubAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCostComponent),

      //OTHER PROCESS TECHNOLOGY
      "TotalCCForOtherTechnologyCostPerAssembly": tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssembly,
      "TotalCCForOtherTechnologyCostSubAssembly": checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssembly),
      "TotalCCForOtherTechnologyCostComponent": checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponent),
      "TotalCCForOtherTechnologyCostWithQuantity": checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssembly) + checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponent),


      "TotalProcessCostPerAssemblyForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead),
      "TotalProcessCostSubAssemblyForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostSubAssemblyForOverhead),
      "TotalProcessCostComponentForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostComponentForOverhead),
      "TotalProcessCostWithQuantityForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCostSubAssemblyForOverhead) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCostComponentForOverhead),

      //OTHER PROCESS TECHNOLOGY
      "TotalCCForOtherTechnologyCostPerAssemblyForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForOverhead),
      "TotalCCForOtherTechnologyCostSubAssemblyForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForOverhead),
      "TotalCCForOtherTechnologyCostComponentForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForOverhead),
      "TotalCCForOtherTechnologyCostWithQuantityForOverhead": checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForOverhead) + checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForOverhead) + checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForOverhead),

      "TotalProcessCostPerAssemblyForProfit": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit),
      "TotalProcessCostSubAssemblyForProfit": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostSubAssemblyForProfit),
      "TotalProcessCostComponentForProfit": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostComponentForProfit),
      "TotalProcessCostWithQuantityForProfit": checkForNull(tabData?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCostSubAssemblyForProfit) + checkForNull(tabData?.CostingPartDetails?.TotalProcessCostComponentForProfit),

      //OTHER PROCESS TECHNOLOGY
      "TotalCCForOtherTechnologyCostPerAssemblyForProfit": checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForProfit),
      "TotalCCForOtherTechnologyCostSubAssemblyForProfit": checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForProfit),
      "TotalCCForOtherTechnologyCostComponentForProfit": checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForProfit),
      "TotalCCForOtherTechnologyCostWithQuantityForProfit": checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForProfit) + checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForProfit) + checkForNull(tabData?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForProfit),


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

      "PaintConsumptionCost": surfaceTabData && surfaceTabData?.CostingPartDetails?.PaintConsumptionCost,
      "PaintConsumptionCostComponent": surfaceTabData && surfaceTabData?.CostingPartDetails?.PaintConsumptionCostComponent,
      "PaintConsumptionCostPerAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.PaintConsumptionCostPerAssembly,
      "PaintConsumptionCostPerSubAssembly": surfaceTabData && surfaceTabData?.CostingPartDetails?.PaintConsumptionCostPerSubAssembly,
      "PaintConsumptionCostWithQuantity": surfaceTabData && surfaceTabData?.CostingPartDetails?.PaintConsumptionCostWithQuantity,

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
    // "BOPHandlingCharges": {
    //   "AssemblyCostingId": tabData && tabData.CostingId,
    //   "IsApplyBOPHandlingCharges": tabData && tabData?.CostingPartDetails?.IsApplyBOPHandlingCharges,
    //   "BOPHandlingChargeApplicability": tabData && tabData?.CostingPartDetails?.BOPHandlingChargeApplicability,
    //   "BOPHandlingPercentage": tabData && tabData?.CostingPartDetails?.BOPHandlingPercentage,
    //   "BOPHandlingCharges": tabData && tabData?.CostingPartDetails?.BOPHandlingCharges,
    //   "BOPHandlingChargeType": tabData && tabData?.CostingPartDetails?.BOPHandlingChargeType
    // },
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
export const findProcessCost = (uom, mhr, productionPerHour, mhrWithoutInterestAndDepreciation = null, numberOfMainPower = 1) => {
  let processCost = 0;
  let processCostWithoutInterestAndDepreciation = 0;
  const multiplier = getTimeMultiplier(uom);
  if (multiplier) {
    processCost = checkForNull(((checkForNull(mhr) * multiplier) / checkForNull(productionPerHour)) * numberOfMainPower);

    if (mhrWithoutInterestAndDepreciation) {
      processCostWithoutInterestAndDepreciation = checkForNull((
        (checkForNull(mhrWithoutInterestAndDepreciation) * multiplier) / checkForNull(productionPerHour)) * numberOfMainPower
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

export const formatMultiTechnologyUpdate = (tabData, totalCost = 0, surfaceTabData = {}, overHeadAndProfitTabData = {}, packageAndFreightTabData = {}, toolTabData = {}, DiscountCostData = {}, CostingEffectiveDate = new Date(), IsAddPaymentTermInNetCost = false, remark = "", bopCostingId = "") => {

  let Arr = tabData

  let assemblyWorkingRow = []

  Arr?.CostingChildPartDetails && Arr?.CostingChildPartDetails.map((item) => {
    // let sTSubAssembly = surfaceTreatmentArr && surfaceTreatmentArr.find(surfaceItem => surfaceItem.PartNumber === item.PartNumber && surfaceItem.AssemblyPartNumber === item.AssemblyPartNumber)
    if (item.BOMLevel === 'L1' && (item.PartType === 'Sub Assembly' || item.PartType === 'Part' || item.PartType === 'BOP')) {

      let subAssemblyObj = {
        "PartName": item?.PartName,
        "CostingId": item?.CostingId,
        "NetPOPrice": item?.CostingPartDetails?.NetPOPrice,
        "NetChildPartsCostWithQuantity": item?.CostingPartDetails?.NetChildPartsCostWithQuantity,
        "BasicRate": item?.CostingPartDetails?.NetPOPrice,
        "TotalBoughtOutPartCostWithQuantity": item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
        "TotalBOPDomesticCostWithQuantity": item?.CostingPartDetails?.TotalBOPDomesticCostWithQuantity,
        "TotalBOPImportCostWithQuantity": item?.CostingPartDetails?.TotalBOPImportCostWithQuantity,
        "TotalBOPSourceCostWithQuantity": item?.CostingPartDetails?.TotalBOPSourceCostWithQuantity,
        "TotalBOPOutsourcedCostWithQuantity": item?.CostingPartDetails?.TotalBOPOutsourcedCostWithQuantity,
        "TotalBoughtOutPartCostWithOutHandlingChargeWithQuantity": item?.CostingPartDetails?.TotalBoughtOutPartCostWithOutHandlingChargeWithQuantity,
        "TotalBOPDomesticCostWithOutHandlingChargeWithQuantity":item?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargeWithQuantity,
        "TotalBOPImportCostWithOutHandlingChargeWithQuantity":item?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargeWithQuantity,
        "TotalBOPSourceCostWithOutHandlingChargeWithQuantity":item?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargeWithQuantity,
        "TotalBOPOutsourcedCostWithOutHandlingChargeWithQuantity":item?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargeWithQuantity,

        "Remark": item.Remark ?? ""
      }
      assemblyWorkingRow.push(subAssemblyObj)
    }
    return ''
  })

  let basicRate = 0
  let totalOverheadPrice = checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.OverheadCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.RejectionCost)
  basicRate = checkForNull(tabData?.CostingPartDetails?.NetTotalRMBOPCC) + checkForNull(totalOverheadPrice) +
    checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) +
    checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)

  let temp = {
    // "BOPHandlingCharges": {
    //   "AssemblyCostingId": tabData?.CostingId,
    //   "BOPHandlingChargeType": tabData?.CostingPartDetails?.BOPHandlingChargeType,
    //   "IsApplyBOPHandlingCharges": tabData?.CostingPartDetails?.IsApplyBOPHandlingCharges,
    //   "BOPHandlingPercentage": tabData?.CostingPartDetails?.BOPHandlingPercentage,
    //   "BOPHandlingCharges": tabData?.CostingPartDetails?.BOPHandlingCharges,
    //   "BOPHandlingChargeApplicability": 0
    // },
    "TopRow": {
      "CostingId": tabData?.CostingId,
      "NetOperationCost": tabData?.CostingPartDetails?.NetOperationCost,
      "NetWeldingCost": tabData?.CostingPartDetails?.NetWeldingCost,
      "NetProcessCost": tabData?.CostingPartDetails?.NetProcessCost,
      "NetChildPartsCost": tabData?.CostingPartDetails?.NetChildPartsCost,
      "NetRawMaterialsCost": tabData?.CostingPartDetails?.NetChildPartsCost,
      "NetBoughtOutPartCost": tabData?.CostingPartDetails?.NetBoughtOutPartCost,
      "BOPHandlingCharges": tabData?.CostingPartDetails?.BOPHandlingCharges,
      "IsApplyBOPHandlingCharges": tabData?.CostingPartDetails?.IsApplyBOPHandlingCharges,
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
      "IndirectLaborCost": tabData?.CostingPartDetails?.IndirectLaborCost,
      "StaffCost": tabData?.CostingPartDetails?.StaffCost,
      "StaffCRMHead": tabData?.CostingPartDetails?.StaffCRMHead,
      "NetLabourCRMHead": tabData?.CostingPartDetails?.NetLabourCRMHead,
      "IndirectLabourCRMHead": tabData?.CostingPartDetails?.IndirectLabourCRMHead,
      "StaffCostPercentage": tabData?.CostingPartDetails?.StaffCostPercentage,
      "IndirectLaborCostPercentage": tabData?.CostingPartDetails?.IndirectLaborCostPercentage,
      "BasicRate": basicRate,
      "RawMaterialCostWithCutOff": tabData?.CostingPartDetails?.NetChildPartsCost,
      "NetOtherOperationCost": 0,                      // SET AS 0 BECAUSE ASSEMBLY TECHNOLOGY DOES NOT HAVE OTHER OPERATION OPTION
      "NetProcessCostForOverhead": tabData?.CostingPartDetails?.NetProcessCostForOverhead,
      "NetProcessCostForProfit": tabData?.CostingPartDetails?.NetProcessCostForProfit,
      "NetWeldingCostForOverhead": tabData?.CostingPartDetails?.NetWeldingCostForOverhead,
      "NetWeldingCostForProfit": tabData?.CostingPartDetails?.NetWeldingCostForProfit,
      "NetOperationCostForOverhead": tabData?.CostingPartDetails?.NetOperationCostForOverhead,
      "NetOperationCostForProfit": tabData?.CostingPartDetails?.NetOperationCostForProfit,
      "NetCCForOtherTechnologyCost": tabData?.CostingPartDetails?.NetCCForOtherTechnologyCost,
      "NetCCForOtherTechnologyCostForOverhead": tabData?.CostingPartDetails?.NetCCForOtherTechnologyCostForOverhead,
      "NetCCForOtherTechnologyCostForProfit": tabData?.CostingPartDetails?.NetCCForOtherTechnologyCostForProfit,
      "PaintConsumptionCost": surfaceTabData?.CostingPartDetails?.PaintConsumptionCost,
      "PaintCost": surfaceTabData?.CostingPartDetails?.PaintCost,
      "TapeCost": surfaceTabData?.CostingPartDetails?.TapeCost,
      "TotalPaintCost": surfaceTabData?.CostingPartDetails?.TotalPaintCost,
      "HangerRate": surfaceTabData?.CostingPartDetails?.HangerRate,
      "HangerCostPerPart": surfaceTabData?.CostingPartDetails?.HangerCostPerPart,
      "NumberOfPartsPerHanger": surfaceTabData?.CostingPartDetails?.NumberOfPartsPerHanger,
      "NetBOPDomesticCost": tabData?.CostingPartDetails?.NetBOPDomesticCost,
      "NetBOPImportCost": tabData?.CostingPartDetails?.NetBOPImportCost,
      "NetBOPSourceCost": tabData?.CostingPartDetails?.NetBOPSourceCost,
      "NetBOPOutsourcedCost": tabData?.CostingPartDetails?.NetBOPOutsourcedCost,
      "NetBoughtOutPartCostWithOutHandlingCharge": tabData?.CostingPartDetails?.NetBoughtOutPartCostWithOutHandlingCharge,
      "NetBOPDomesticCostWithOutHandlingCharge": tabData?.CostingPartDetails?.NetBOPDomesticCostWithOutHandlingCharge,
      "NetBOPImportCostWithOutHandlingCharge": tabData?.CostingPartDetails?.NetBOPImportCostWithOutHandlingCharge,
      "NetBOPSourceCostWithOutHandlingCharge": tabData?.CostingPartDetails?.NetBOPSourceCostWithOutHandlingCharge,
      "NetBOPOutsourcedCostWithOutHandlingCharge": tabData?.CostingPartDetails?.NetBOPOutsourcedCostWithOutHandlingCharge,
      "TotalBoughtOutPartCostWithOutHandlingChargeWithQuantity": tabData?.CostingPartDetails?.TotalBoughtOutPartCostWithOutHandlingChargeWithQuantity,
      "TotalBOPDomesticCostWithOutHandlingChargeWithQuantity":tabData?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargeWithQuantity,
      "TotalBOPImportCostWithOutHandlingChargeWithQuantity":tabData?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargeWithQuantity,
      "TotalBOPSourceCostWithOutHandlingChargeWithQuantity":tabData?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargeWithQuantity,
      "TotalBOPOutsourcedCostWithOutHandlingChargeWithQuantity":tabData?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargeWithQuantity,
      // SET AS 0 BECAUSE ASSEMBLY TECHNOLOGY DOES NOT HAVE OTHER OPERATION OPTION
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
  let calculatedPercent = checkForDecimalAndNull(totalPercentage, getConfigurationKey().NoOfDecimalForPrice)
  return {
    total: calculatedPercent,
    message: calculatedPercent > 100 ?
      `Total percentage is ${calculatedPercent}%, must be 100% to save the values` : '',
    isValid: calculatedPercent <= 100
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
export const handleRemarkPopup = (event, id) => {
  if (event === "open") {
    $('body').find('.MuiPaper-root.MuiDrawer-paper').css('overflow', 'hidden')
    $('body').find(`[id="${id}"]`).focus()
  } else {
    $('body').find('.MuiPaper-root.MuiDrawer-paper').css('overflow', '')
  }
}

export const calculateProcessCostUsingCostApplicabilityBasis = (rowData, NetRawMaterialsCost, NetBoughtOutPartCost) => {

  if (rowData.Type === COSTAPPLICABILITYBASIS) {
    switch (rowData.Applicability) {
      case 'RM':
        return checkForNull(NetRawMaterialsCost) * checkForNull(rowData?.Percentage / 100)
      case 'BOP':
        return checkForNull(NetBoughtOutPartCost) + (checkForNull(rowData?.Percentage) / 100)
      case 'RM + BOP':
        return (checkForNull(NetRawMaterialsCost) + checkForNull(NetBoughtOutPartCost)) * (checkForNull(rowData?.Percentage) / 100)
      default:
        return '0'
    }
  }
}

export const findApplicabilityCost = (rowData, NetRawMaterialsCost, NetBoughtOutPartCost) => {
  if (rowData?.Type === COSTAPPLICABILITYBASIS) {
    switch (rowData?.Applicability) {
      case 'RM':
        return checkForNull(NetRawMaterialsCost)
      case 'BOP':
        return checkForNull(NetBoughtOutPartCost)
      case 'RM + BOP':
        return checkForNull(NetRawMaterialsCost) + checkForNull(NetBoughtOutPartCost)
      default:
        return '0'
    }
  }
}

export const isLockRMAndBOPForCostAppliacabilityProcess = (processArr) => {


  if (processArr && processArr.length > 0) {


    let tempArr = _.filter(processArr, ['Type', COSTAPPLICABILITYBASIS]);

    return tempArr.length > 0 ? true : false
  }
}