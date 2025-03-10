import { loggedInUserId } from "../../helper"


export const createSaveComponentObject = (rmccData, CostingEffectiveDate, basicRate, netPOPrice) => {

    const requestObj = {
        "NetRawMaterialsCost": rmccData?.CostingPartDetails?.TotalRawMaterialsCost,
        "NetBoughtOutPartCost": rmccData?.CostingPartDetails?.TotalBoughtOutPartCost,
        "NetConversionCost": rmccData?.CostingPartDetails?.TotalConversionCost,
        "NetOperationCost": rmccData?.CostingPartDetails?.CostingConversionCost && rmccData?.CostingPartDetails?.CostingConversionCost.OperationCostTotal !== undefined ? rmccData?.CostingPartDetails?.CostingConversionCost.OperationCostTotal : 0,
        "NetProcessCost": rmccData?.CostingPartDetails?.CostingConversionCost && rmccData?.CostingPartDetails?.CostingConversionCost.ProcessCostTotal !== undefined ? rmccData?.CostingPartDetails?.CostingConversionCost.ProcessCostTotal : 0,
        "NetOtherOperationCost": rmccData?.CostingPartDetails?.CostingConversionCost && rmccData?.CostingPartDetails?.CostingConversionCost.OtherOperationCostTotal !== undefined ? rmccData?.CostingPartDetails?.CostingConversionCost.OtherOperationCostTotal : 0,
        "NetTotalRMBOPCC": rmccData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost,
        "LoggedInUserId": loggedInUserId(),
        "EffectiveDate": CostingEffectiveDate,
        "CostingId": rmccData?.CostingId,
        "PartId": rmccData?.PartId,
        "AssemblyCostingId": rmccData?.AssemblyCostingId,
        "SubAssemblyCostingId": rmccData?.SubAssemblyCostingId,
        "TechnologyId": rmccData?.TechnologyId,
        "IsASMChildPartRequest": rmccData?.IsAssemblyPart,
        "NetToolCost": rmccData?.CostingPartDetails?.CostingConversionCost && rmccData?.CostingPartDetails?.CostingConversionCost.ToolsCostTotal !== undefined ? rmccData?.CostingPartDetails?.CostingConversionCost.ToolsCostTotal : 0,
        "BasicRate": basicRate,
        "NetPOPrice": netPOPrice,
        "CalculatorType": rmccData?.CostingPartDetails?.CalculatorType,

        // NOT USED AT THIS POINT
        "NetLabourCost": 0,
        "IndirectLaborCost": 0,
        "StaffCost": 0,
        "StaffCostPercentage": 0,
        "IndirectLaborCostPercentage": 0,
        "NetLabourCRMHead": "string",
        "IndirectLabourCRMHead": "string",
        "StaffCRMHead": "string",

        CostingPartDetails: { ...rmccData?.CostingPartDetails, BasicRate: basicRate, NetPOPrice: netPOPrice },
    }
    return requestObj;
}

export const createSaveAssemblyRMCCObject = (item, costData, basicRate, totalCostSaveAPI, effectiveDate, gridData, isOperation) => {
    const requestObj = {
        "PartNumber": item?.PartNumber,
        "TotalCalculatedRMBOPCCCostWithQuantity": item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
        "NetOperationCostPerAssembly": item?.CostingPartDetails?.TotalOperationCostPerAssembly,
        "NetToolCostPerAssembly": 0,
        "CostingPartDetails": {
            "IsShowToolCost": true,
            "IsToolCostProcessWise": true,
            "AssemblyCostingOperationCostRequest": isOperation ? gridData : item?.CostingPartDetails?.CostingOperationCostResponse,
            "AssemblyCostingProcessCostResponse": isOperation ? item?.CostingPartDetails?.CostingProcessCostResponse : gridData,
            "AssemblyCostingToolsCostRequest": item?.CostingPartDetails?.CostingToolCostResponse
        },
        "CostingId": item?.CostingId,
        "PartId": item?.PartId,
        "AssemblyCostingId": item?.AssemblyCostingId,
        "SubAssemblyCostingId": item?.SubAssemblyCostingId,
        "TechnologyId": costData?.TechnologyId,
        "NetRawMaterialsCost": 0,                                       // ASK MR
        "NetBoughtOutPartCost": item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
        "NetConversionCost": item?.CostingPartDetails?.TotalConversionCostWithQuantity,
        "NetOperationCost": item?.CostingPartDetails?.TotalOperationCostPerAssembly,
        "NetOtherOperationCost": 0,                                       // ASK MR
        "NetProcessCost": item?.CostingPartDetails?.TotalProcessCostPerAssembly,
        "NetToolCost": 0,                                       // ASK MR
        "NetTotalRMBOPCC": item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
        "BasicRate": basicRate,
        "EffectiveDate": effectiveDate,
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
        "NetChildPartsCost": 0                                       // ASK MR
    }
    return requestObj;
}
