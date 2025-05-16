import { checkForNull, loggedInUserId } from "../../helper"


export const createSaveComponentObject = (rmccData, CostingEffectiveDate, basicRate, netPOPrice) => {
    const requestObj = {
        "NetRawMaterialsCost": rmccData?.CostingPartDetails?.NetRawMaterialsCost,
        "NetBoughtOutPartCost": rmccData?.CostingPartDetails?.NetBoughtOutPartCost,
        "NetConversionCost": rmccData?.CostingPartDetails?.NetConversionCost,
        "NetOperationCost": rmccData?.CostingPartDetails?.CostingConversionCost && rmccData?.CostingPartDetails?.CostingConversionCost.NetOperationCost !== undefined ? rmccData?.CostingPartDetails?.CostingConversionCost.NetOperationCost : 0,
        "NetProcessCost": rmccData?.CostingPartDetails?.CostingConversionCost && rmccData?.CostingPartDetails?.CostingConversionCost.NetProcessCost !== undefined ? rmccData?.CostingPartDetails?.CostingConversionCost.NetProcessCost : 0,
        "NetOtherOperationCost": rmccData?.CostingPartDetails?.CostingConversionCost && rmccData?.CostingPartDetails?.CostingConversionCost.NetOtherOperationCost !== undefined ? rmccData?.CostingPartDetails?.CostingConversionCost.NetOtherOperationCost : 0,
        "NetTotalRMBOPCC": rmccData?.CostingPartDetails?.NetTotalRMBOPCC,
        "LoggedInUserId": loggedInUserId(),
        "CostingId": rmccData?.CostingId,
        "AssemblyCostingId": rmccData?.AssemblyCostingId,
        "SubAssemblyCostingId": rmccData?.SubAssemblyCostingId,
        "BasicRate": basicRate,
        "NetPOPrice": netPOPrice,
        "CalculatorType": rmccData?.CalculatorType ? rmccData?.CalculatorType : rmccData?.CostingPartDetails?.CalculatorType ?? null,

        // NOT USED AT THIS POINT
        "NetLabourCost": 0,
        "IndirectLaborCost": 0,
        "StaffCost": 0,
        "StaffCostPercentage": 0,
        "IndirectLaborCostPercentage": 0,
        "NetLabourCRMHead": "string",
        "IndirectLabourCRMHead": "string",
        "StaffCRMHead": "string",
        "NetProcessCostForOverhead": rmccData?.CostingPartDetails?.NetProcessCostForOverhead || null,
        "NetProcessCostForProfit": rmccData?.CostingPartDetails?.NetProcessCostForProfit || null,
        "NetOperationCostForOverhead": rmccData?.CostingPartDetails?.NetOperationCostForOverhead || null,
        "NetOperationCostForProfit": rmccData?.CostingPartDetails?.NetOperationCostForProfit || null,
        "NetWeldingCostForOverhead": rmccData?.CostingPartDetails?.NetWeldingCostForOverhead || null,
        "NetWeldingCostForProfit": rmccData?.CostingPartDetails?.NetWeldingCostForProfit || null,
        "NetWeldingCost": rmccData?.CostingPartDetails?.NetWeldingCost || null,
        "NetCCForOtherTechnologyCost": rmccData?.CostingPartDetails?.NetCCForOtherTechnologyCost || null,
        "NetCCForOtherTechnologyCostForOverhead": rmccData?.CostingPartDetails?.NetCCForOtherTechnologyCostForOverhead || null,
        "NetCCForOtherTechnologyCostForProfit": rmccData?.CostingPartDetails?.NetCCForOtherTechnologyCostForProfit || null,
        CostingPartDetails: { ...rmccData?.CostingPartDetails, BasicRate: basicRate, NetPOPrice: netPOPrice },
    }
    return requestObj;
}

export const createSaveAssemblyRMCCObject = (item, costData, basicRate, totalCostSaveAPI, effectiveDate, gridData, isOperation) => {
    const requestObj = {
        "CostingPartDetails": {
            "AssemblyCostingOperationCostRequest": isOperation ? gridData : item?.CostingPartDetails?.CostingOperationCostResponse,
            "AssemblyCostingProcessCostRequest": isOperation ? item?.CostingPartDetails?.CostingProcessCostResponse : gridData,
        },
        "CostingId": item?.CostingId,
        "AssemblyCostingId": item?.AssemblyCostingId,
        "SubAssemblyCostingId": item?.SubAssemblyCostingId,
        "NetRawMaterialsCost": 0,
        "NetBoughtOutPartCost": item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
        "NetConversionCost": checkForNull(item?.CostingPartDetails?.NetOperationCost) + checkForNull(item?.CostingPartDetails?.NetProcessCost) + checkForNull(item?.NetLabourCost) + checkForNull(item?.IndirectLaborCost) + checkForNull(item?.StaffCost) + checkForNull(item?.CostingPartDetails?.NetWeldingCost),
        "NetOperationCost": item?.CostingPartDetails?.NetOperationCost,
        "NetWeldingCost": item?.CostingPartDetails?.NetWeldingCost,
        "NetOtherOperationCost": 0,
        "NetProcessCost": item?.CostingPartDetails?.NetProcessCost,
        "NetTotalRMBOPCC": item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
        "BasicRate": basicRate,
        "LoggedInUserId": loggedInUserId(),
        "NetLabourCost": 0,                                       // ASK MR
        "IndirectLaborCost": 0,                                       // ASK MR
        "StaffCost": 0,                                       // ASK MR
        "StaffCostPercentage": 0,                                       // ASK MR
        "IndirectLaborCostPercentage": 0,                                       // ASK MR
        "NetLabourCRMHead": "string",                                       // ASK MR
        "IndirectLabourCRMHead": "string",                                       // ASK MR
        "StaffCRMHead": "string",                                       // ASK MR
        "NetPOPrice": totalCostSaveAPI,
        "NetChildPartsCost": 0,
        "NetProcessCostForOverhead": item?.CostingPartDetails?.NetProcessCostForOverhead,
        "NetProcessCostForProfit": item?.CostingPartDetails?.NetProcessCostForProfit,
        "NetOperationCostForOverhead": item?.CostingPartDetails?.NetOperationCostForOverhead,
        "NetOperationCostForProfit": item?.CostingPartDetails?.NetOperationCostForProfit,
        "NetWeldingCostForOverhead": item?.CostingPartDetails?.NetWeldingCostForOverhead,
        "NetWeldingCostForProfit": item?.CostingPartDetails?.NetWeldingCostForProfit,
    }
    return requestObj;
}

