import { reactLocalStorage } from "reactjs-localstorage";
import _ from 'lodash';
import { CBCAPPROVALTYPEID, CBCTypeId, dropdownLimit, NCCAPPROVALTYPEID, NCCTypeId, NFRAPPROVALTYPEID, NFRTypeId, RELEASESTRATEGYTYPEID1, RELEASESTRATEGYTYPEID2, RELEASESTRATEGYTYPEID3, RELEASESTRATEGYTYPEID4, VBCAPPROVALTYPEID, VBCTypeId, WACAPPROVALTYPEID, WACTypeId, ZBCAPPROVALTYPEID, ZBCTypeId, PFS2APPROVALTYPEID, PFS2TypeId, RELEASE_STRATEGY_B1, RELEASE_STRATEGY_B1_NEW, RELEASE_STRATEGY_B2, RELEASE_STRATEGY_B2_NEW, RELEASE_STRATEGY_B3, RELEASE_STRATEGY_B3_NEW, RELEASE_STRATEGY_B4, RELEASE_STRATEGY_B6, RELEASE_STRATEGY_B6_NEW, RELEASE_STRATEGY_B4_NEW, RELEASESTRATEGYTYPEID6, LPSAPPROVALTYPEID, CLASSIFICATIONAPPROVALTYPEID, RAWMATERIALAPPROVALTYPEID, searchCount } from "../../config/constants";
import Toaster from "./Toaster";
import { addDays, subDays } from "date-fns";
import { checkForDecimalAndNull, checkForNull, getConfigurationKey } from "../../helper";
import DayTime from "./DayTimeWrapper";

// COMMON FILTER FUNCTION FOR AUTOCOMPLETE DROPDOWN
const commonFilterFunction = (inputValue, dropdownArray, filterByName, selectedParts = false) => {
    let tempArr = []
    tempArr = _.filter(dropdownArray, i => {
        return i[filterByName]?.toLowerCase().includes(inputValue?.toLowerCase())
    });
    if (selectedParts) {
        let temp = []
        tempArr && tempArr.map(item => {
            if (selectedParts.includes(item.value)) return false
            temp.push(item)
        })
        return temp
    } else {
        return tempArr
    }
}
const commonDropdownFunction = (array, tempBoolean = false, selectedParts = [], finalArray, partWithRev = false, isRMBOPPartCombine = false) => {
    array && array.map(item => {
        if (item.Value === '0' || item.PartId === '0' || item.Id === '0') return array
        if ((tempBoolean && (item?.PartId || item?.Id) && selectedParts.includes(item.PartId || item.Id)) || (tempBoolean && (item?.Value) && selectedParts.includes(item.Value))) return false        //FOR REMOVING DUPLICATE PART ENTRY         
        if (partWithRev) {
            if (isRMBOPPartCombine) {
                finalArray.push({ label: `${item?.Number}`, value: item?.Id })
            } else {
                finalArray.push({ label: `${item?.PartNumber}${item?.RevisionNumber ? ` (${item?.RevisionNumber})` : ''}`, value: item?.PartId, RevisionNumber: item?.RevisionNumber })
            }
        } else {
            finalArray.push({ label: item.Text, value: item.Value })
        }
        return null
    })
}
// ... existing code ...

export const DropDownFilterList = async (inputValue, filterType, stateKey, apiFunction, setState, state) => {
    if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
    }
    const resultInput = inputValue.slice(0, searchCount);

    const isNewSearch = !state[stateKey] ||
        (typeof state[stateKey] === 'string' && state[stateKey] !== resultInput) ||
        (typeof state[stateKey] === 'object' && state[stateKey].value !== resultInput);

    if (inputValue?.length >= searchCount && isNewSearch) {
        setState(prevState => ({ ...prevState, inputLoader: true }));
        let res;
        try {
            res = await apiFunction(filterType, resultInput);
            setState(prevState => ({
                ...prevState,
                inputLoader: false,
                [stateKey]: { value: resultInput, label: resultInput }  // Store as an object
            }));
            let dataAPI = res?.data?.SelectList;
            if (inputValue) {
                return autoCompleteDropdown(inputValue, dataAPI, false, [], true);
            } else {
                return dataAPI;
            }
        } catch (error) {
            setState(prevState => ({ ...prevState, inputLoader: false }));
            return [];
        }
    } else {
        if (inputValue?.length < searchCount) return [];
        else {
            let Data = reactLocalStorage?.getObject('Data') || [];
            if (inputValue) {
                return autoCompleteDropdown(inputValue, Data, false, [], false);
            } else {
                return Data;
            }
        }
    }
};

// ... existing code ...

// FOR AUTOCOMPLLETE IN PART AND VENDOR 
export const autoCompleteDropdown = (inputValue, dropdownArray, tempBoolean = false, selectedParts = [], isApiCall) => {
    let tempArr = []
    let finalArr = []
    let finalArr1 = []
    let finalArrCity = []
    if (isApiCall) {
        tempArr = commonFilterFunction(inputValue, dropdownArray, 'Text')
        commonDropdownFunction(tempArr, tempBoolean, selectedParts, finalArr1, false)         //TO SHOW THE FILTERED VENDOR OR PART
        commonDropdownFunction(dropdownArray, tempBoolean, selectedParts, finalArr, false)   // TO STORE ALL VENDOR OR PART DATA IN LOCAL STORAGE
        commonDropdownFunction(dropdownArray, tempBoolean, selectedParts, finalArrCity, false)   // TO STORE ALL cityDATA IN LOCAL STORAGE
        reactLocalStorage?.setObject('Data', finalArr)
        if (finalArr1?.length <= 100) {
            return finalArr1
        } else {
            return _.slice(finalArr1, 0, dropdownLimit)
        }
    }
    else {
        tempArr = commonFilterFunction(inputValue, dropdownArray, "label", selectedParts)
        if (dropdownArray?.length <= 100) {
            return tempArr
        } else {
            return _.slice(tempArr, 0, dropdownLimit)
        }
    }
}

// VOLUME MASTER AUTOCOMPLETE PART 
export const autoCompleteDropdownPart = (inputValue, dropdownArray, tempBoolean = false, selectedParts = [], isApiCall, isRMBOPPartCombine = false) => {
    let tempArr = []
    let finalArr1 = []
    let finalArr = []

    if (isApiCall) {
        tempArr = commonFilterFunction(inputValue, dropdownArray, isRMBOPPartCombine ? "Number" : "PartNumber")
        commonDropdownFunction(tempArr, tempBoolean, selectedParts, finalArr1, true, isRMBOPPartCombine)              //TO SHOW THE FILTERED PART
        commonDropdownFunction(dropdownArray, tempBoolean, selectedParts, finalArr, true, isRMBOPPartCombine)        // TO STORE ALL PART DATA IN LOCAL STORAGE
        reactLocalStorage?.setObject('PartData', finalArr)
        if (finalArr1?.length <= 100) {
            return finalArr1
        } else {
            return _.slice(finalArr1, 0, dropdownLimit)
        }

    }
    else {
        tempArr = commonFilterFunction(inputValue, dropdownArray, "label")
        if (dropdownArray?.length <= 100) {
            return tempArr
        } else {
            return _.slice(tempArr, 0, dropdownLimit)
        }
    }
}
//FUNCTION FOR HIDING CUSTOMER COLUMN FROM LISTING 
export const hideCustomerFromExcel = (data, value) => {
    let excelData
    if (!reactLocalStorage.getObject('CostingTypePermission').cbc) {
        excelData = data && data.filter((item) => item.value !== value)
    }
    else {
        excelData = [...data]
    }
    return excelData
}

export const hideColumnFromExcel = (data, value) => {
    let excelData
    excelData = data && data.filter((item) => item.value !== value)
    return excelData
}

export const hideMultipleColumnFromExcel = (data, value) => {
    let excelData
    excelData = data && data.filter((item) => !value?.includes(item.value))
    return excelData
}

export const costingTypeIdToApprovalTypeIdFunction = (value) => {
    let approvalTypeId;
    switch (Number(value)) {
        case ZBCTypeId:
            approvalTypeId = ZBCAPPROVALTYPEID;
            break;
        case VBCTypeId:
            approvalTypeId = VBCAPPROVALTYPEID;
            break;
        case CBCTypeId:
            approvalTypeId = CBCAPPROVALTYPEID;
            break;
        case NCCTypeId:
            approvalTypeId = NCCAPPROVALTYPEID;
            break;
        case NFRTypeId:
            approvalTypeId = NFRAPPROVALTYPEID;
            break;
        case WACTypeId:
            approvalTypeId = WACAPPROVALTYPEID;
            break;
        case RELEASESTRATEGYTYPEID1:
            approvalTypeId = RELEASESTRATEGYTYPEID1;
            break;
        case RELEASESTRATEGYTYPEID2:
            approvalTypeId = RELEASESTRATEGYTYPEID2;
            break;
        case RELEASESTRATEGYTYPEID3:
            approvalTypeId = RELEASESTRATEGYTYPEID3;
            break;
        case RELEASESTRATEGYTYPEID4:
            approvalTypeId = RELEASESTRATEGYTYPEID4;
            break;
        case RELEASESTRATEGYTYPEID6:
            approvalTypeId = RELEASESTRATEGYTYPEID6;
            break;
        case PFS2TypeId:
            approvalTypeId = PFS2APPROVALTYPEID;
            break;
        case LPSAPPROVALTYPEID:
            approvalTypeId = LPSAPPROVALTYPEID;
            break;
        case CLASSIFICATIONAPPROVALTYPEID:
            approvalTypeId = CLASSIFICATIONAPPROVALTYPEID;
            break;
        case RAWMATERIALAPPROVALTYPEID:
            approvalTypeId = RAWMATERIALAPPROVALTYPEID;
            break;
        default:
            approvalTypeId = null; // or any default value you prefer
            break;
    }
    return isNaN(approvalTypeId) ? null : approvalTypeId
};
/**
* Transforms an approval item based on its text value.
* @param {Object} item - The approval item with properties like Text and Value.
* @returns {string} - The transformed label for the approval item.
*/
export const transformApprovalItem = (item) => {
    // Switch statement to determine the transformation based on item.Text
    switch (item.Text) {
        case RELEASE_STRATEGY_B1:
            return RELEASE_STRATEGY_B1_NEW;
        case RELEASE_STRATEGY_B2:
            return RELEASE_STRATEGY_B2_NEW;
        case RELEASE_STRATEGY_B3:
            return RELEASE_STRATEGY_B3_NEW;
        case RELEASE_STRATEGY_B4:
            return RELEASE_STRATEGY_B4_NEW;
        case RELEASE_STRATEGY_B6:
            return RELEASE_STRATEGY_B6_NEW;
        default:
            return item.Text; // Return the original text if no transformation is needed
    }
};

export const getCostingTypeIdByCostingPermission = () => {
    const { zbc, vbc, cbc } = reactLocalStorage.getObject('CostingTypePermission');
    const costingTypeId = zbc ? ZBCTypeId : vbc ? VBCTypeId : cbc ? CBCTypeId : null;
    return costingTypeId;
}

export const checkMasterCreateByCostingPermission = (isBulkupload = false) => {
    const costingPermision = reactLocalStorage.getObject('CostingTypePermission');
    let count = 0;
    for (const key in costingPermision) {
        if (costingPermision.hasOwnProperty(key)) {
            const value = costingPermision[key];
            if (value) {
                count = count + 1
            }
        }
    }
    if (count === 0) {
        Toaster.warning(`You have not enough permission for ${isBulkupload ? 'uploading' : 'creating'} this master.`)
        return false;
    }
    return true;
}


export const OperationFileData = (fileData) => {
    fileData.forEach(obj => {
        switch (obj.ForType) {
            case 'Welding':
                obj.MaterialWireCRMHead = obj['MaterialWireCRMHead/NiRateCrmHead'];
                obj.MaterialWireRate = obj['MaterialWireRate/NiRate']
                obj.MaterialWireConsumption = obj['MaterialWireConsumption/NiRateConsumption']
                obj.MaterialGasCRMHead = obj['MaterialGasCRMHead/NiScrapCrmHead']
                obj.MaterialGasRate = obj['MaterialGasRate/NiScrapRate']
                obj.MaterialGasConsumption = obj['MaterialGasConsumption/NiScrapRateConsumption']
                obj.PowerElectricityRate = obj['PowerElectricityRate/PowerElectricityCost'];
                delete obj['PowerElectricityRate/PowerElectricityCost'];
                delete obj['MaterialWireCRMHead/NiRateCrmHead'];
                delete obj['MaterialWireRate/NiRate']
                delete obj['MaterialWireConsumption/NiRateConsumption']
                delete obj['MaterialGasCRMHead/NiScrapCrmHead'];
                delete obj['MaterialGasRate/NiScrapRate'];
                delete obj['MaterialGasConsumption/NiScrapRateConsumption'];
                break;
            case 'Ni Cr Plating':
                obj.NiOfficeExpCrmHead = obj['ConsumableCRMHead/NiOfficeExpCrmHead'];
                obj.NiOfficeExp = obj['ConsumableCost/NiOfficeExp'];
                obj.AdditionalChemicalCostCrmHead = obj['ConsumableWaterCRMHead/AdditionalChemicalCostCrmHead'];
                obj.AdditionalChemicalCost = obj['ConsumableWaterCost/AdditionalChemicalCost'];
                obj.CETPChargeCrmHead = obj['ConsumableJigStrippingCRMHead/CETPChargeCrmHead'];
                obj.CETPCharge = obj['ConsumableJigStrippingCost/CETPCharge'];
                obj.FixedCostCrmHead = obj['StatuatoryAndLicenseCRMHead/FixedCostCrmHead'];
                obj.FixedCost = obj['StatuatoryAndLicenseCost/FixedCost'];
                obj.NiRateCrmHead = obj['MaterialWireCRMHead/NiRateCrmHead'];
                obj.NiRate = obj['MaterialWireRate/NiRate']
                obj.NiRateConsumption = obj['MaterialWireConsumption/NiRateConsumption']
                obj.NiScrapCrmHead = obj['MaterialGasCRMHead/NiScrapCrmHead']
                obj.NiScrapRate = obj['MaterialGasRate/NiScrapRate']
                obj.NiScrapRateConsumption = obj['MaterialGasConsumption/NiScrapRateConsumption']
                obj.PowerElectricityRate = obj['PowerElectricityRate/PowerElectricityCost'];
                delete obj['PowerElectricityRate/PowerElectricityCost'];
                delete obj['ConsumableCRMHead/NiOfficeExpCrmHead'];
                delete obj['ConsumableCost/NiOfficeExp'];
                delete obj['ConsumableWaterCRMHead/AdditionalChemicalCostCrmHead'];
                delete obj['ConsumableWaterCost/AdditionalChemicalCost'];
                delete obj['ConsumableJigStrippingCRMHead/CETPChargeCrmHead'];
                delete obj['ConsumableJigStrippingCost/CETPCharge'];
                delete obj['StatuatoryAndLicenseCRMHead/FixedCostCrmHead'];
                delete obj['StatuatoryAndLicenseCost/FixedCost'];
                delete obj['MaterialWireCRMHead/NiRateCrmHead'];
                delete obj['MaterialWireRate/NiRate']
                delete obj['MaterialWireConsumption/NiRateConsumption']
                delete obj['MaterialGasCRMHead/NiScrapCrmHead'];
                delete obj['MaterialGasRate/NiScrapRate'];
                delete obj['MaterialGasConsumption/NiScrapRateConsumption'];
                break;
            case 'Surface Treatment':
            case 'Other Operation':
                obj.ConsumableCRMHead = obj['ConsumableCRMHead/NiOfficeExpCrmHead'];
                obj.ConsumableCost = obj['ConsumableCost/NiOfficeExp'];
                obj.ConsumableWaterCRMHead = obj['ConsumableWaterCRMHead/AdditionalChemicalCostCrmHead'];
                obj.ConsumableWaterCost = obj['ConsumableWaterCost/AdditionalChemicalCost'];
                obj.ConsumableJigStrippingCRMHead = obj['ConsumableJigStrippingCRMHead/CETPChargeCrmHead'];
                obj.ConsumableJigStrippingCost = obj['ConsumableJigStrippingCost/CETPCharge'];
                obj.StatuatoryAndLicenseCRMHead = obj['StatuatoryAndLicenseCRMHead/FixedCostCrmHead'];
                obj.StatuatoryAndLicenseCost = obj['StatuatoryAndLicenseCost/FixedCost'];
                obj.PowerElectricityCost = obj['PowerElectricityRate/PowerElectricityCost'];
                delete obj['ConsumableCRMHead/NiOfficeExpCrmHead'];
                delete obj['ConsumableCost/NiOfficeExp'];
                delete obj['ConsumableWaterCRMHead/AdditionalChemicalCostCrmHead'];
                delete obj['ConsumableWaterCost/AdditionalChemicalCost'];
                delete obj['ConsumableJigStrippingCRMHead/CETPChargeCrmHead'];
                delete obj['ConsumableJigStrippingCost/CETPCharge'];
                delete obj['StatuatoryAndLicenseCRMHead/FixedCostCrmHead'];
                delete obj['StatuatoryAndLicenseCost/FixedCost'];
                delete obj['PowerElectricityRate/PowerElectricityCost'];
                break;
            default:
                break;
        }
    });
    return fileData;
}
export const getRMCostIds = () => {
    let costIds = reactLocalStorage.getObject('InitialConfiguration').CostingConditionTypes
    return costIds
}
export const getCostingConditionTypes = (conditionName) => {
    let arr = getRMCostIds()
    let costingTypeId = arr && arr?.filter(item => item['CostingConditionTypeName'] === conditionName)
    return costingTypeId[0]?.CostingConditionTypeMasterId
}


export const getEffectiveDateMinDate = () => {
    // Get the value from initialConfiguration in Redux store
    const effectiveDateRangeDayPrevious = reactLocalStorage.getObject('InitialConfiguration')?.EffectiveDateRangeDayPrevious;

    if (effectiveDateRangeDayPrevious === null || effectiveDateRangeDayPrevious === undefined) {
        return new Date(new Date().getFullYear() - 100, 0, 1); // Allow dates up to 100 years in the past
    }
    if (effectiveDateRangeDayPrevious === 0) {
        return new Date(); // No past dates
    }
    return subDays(new Date(), effectiveDateRangeDayPrevious);
};

export const getEffectiveDateMaxDate = () => {
    const effectiveDateRangeDayFuture = reactLocalStorage.getObject('InitialConfiguration')?.EffectiveDateRangeDayFuture;

    if (effectiveDateRangeDayFuture === null) {
        return new Date(new Date().getFullYear() + 100, 11, 31); // Allow dates up to 100 years in the future
    }
    if (effectiveDateRangeDayFuture === 0) {
        return new Date(); // No future dates
    }

    return addDays(new Date(), effectiveDateRangeDayFuture);
};
export const convertIntoCurrency = (price, currencyValue) => {
    return checkForNull(price) * checkForNull(currencyValue ?? 1)
}


export const generateCombinations = (arr, rate) => {
    const result = [];

    // Helper function to generate combinations
    const generateCombos = (start, current) => {
        // Add the current combination to the result
        if (current.length > 0) {
            result.push({ label: current.join(" + "), value: result.length });
        }

        // Generate further combinations
        for (let i = start; i < arr.length; i++) {
            generateCombos(i + 1, [...current, arr[i]]);
        }
    };

    // Start the combination generation
    generateCombos(0, []);

    // Sort the result to ensure "Basic Rate" is always first in combinations
    result.sort((a, b) => {
        if (a.label.includes(rate) && !b.label.includes(rate)) return -1;
        if (!a.label.includes(rate) && b.label.includes(rate)) return 1;
        return 0;
    });

    return result;
};

/**
 * Handles applicability calculations for costs
 */
export const handleApplicability = (value, basicPriceBaseCurrency, arr, costField, headerName, applicabilityName) => {
    if (!value) return 0;
    const selectedApplicabilities = value?.split(' + ');
    // Calculate total cost currency for selected applicabilities
    const total = selectedApplicabilities.reduce((acc, applicability) => {
        const trimmedApplicability = applicability.trim();

        // If applicability is "Basic Rate", return basic price
        if (trimmedApplicability === applicabilityName) {
            return Number(acc) + Number(basicPriceBaseCurrency);
        }

        // Find matching cost item
        const item = arr?.find(item => item?.[headerName]?.trim() === trimmedApplicability);
        if (item) {
            return Number(acc) + Number(item?.[costField] || 0);
        }

        return Number(acc);
    }, 0);

    return total;
};

/**
 * Recalculates condition costs
 */
export const recalculateConditions = (basicPriceBaseCurrency, state, isSimulation, nonIndexationSimulation) => {


    return recalculateCosts(
        false,
        basicPriceBaseCurrency,
        "ConditionType",
        "Applicability",
        "Percentage",
        {
            mainCost: "ConditionCost",
            conversionCost: "ConditionCostConversion",
            perQuantityCost: "ConditionCostPerQuantity",
            // mainCost: !nonIndexationSimulation?"ConditionCost":"NewConditionCost",
            // conversionCost: !nonIndexationSimulation?"ConditionCostConversion":"NewConditionNetCostConversion",
            // perQuantityCost: !nonIndexationSimulation?"ConditionCostPerQuantity":"NewConditionNetCostLocalConversion",
        },
        'Description',
        state,
        "Basic Price",
        isSimulation,
        nonIndexationSimulation,
    );
};

/**
 * Recalculates other costs
 */
export const recalculateOtherCost = (basicRate, state, isSimulation) => {
    return recalculateCosts(
        true,
        basicRate,
        "Type",
        "Applicability",
        "Value",
        {
            mainCost: "NetCost",
            conversionCost: "NetCostConversion",
            perQuantityCost: "NetCostConversion",
        },
        'CostHeaderName',
        state,
        "Basic Rate",
        isSimulation,

    );
};

/**
 * Core cost recalculation logic
 */
export const recalculateCosts = (isOtherCost, basicValue, typeField, applicabilityField, percentageField, resultFields, headerName, state, applicabilityName, isSimulation, basicRateValue, nonIndexationSimulation = false) => {
    // Select the correct data array and make a deep copy
    const dataArray = isOtherCost ? state.otherCostTableData : state.conditionTableData;

    const costField = isOtherCost ? 'NetCost' : !nonIndexationSimulation ? 'ConditionCost' : 'NewConditionCost';
    let copiedData = _.cloneDeep(dataArray) ?? [];

    // Create a temporary array for calculations
    let tempArr = copiedData || [];
    // Process each item in the array
    copiedData?.forEach((item, index) => {
        if (item?.[typeField] === "Percentage") {
            // Calculate costs
            const ApplicabilityCost = handleApplicability(
                item[applicabilityField],
                basicValue,
                tempArr,
                costField,
                headerName,
                applicabilityName
            );
            const Cost = checkForNull((item?.[percentageField]) / 100) * checkForNull(ApplicabilityCost);
            const CostConversion = checkForNull((item?.[percentageField]) / 100) * checkForNull(ApplicabilityCost);
            // Create updated object
            const updatedItem = {
                ...item,
                ApplicabilityCost: ApplicabilityCost,
                [resultFields.mainCost]: Cost,
                [resultFields.conversionCost]: CostConversion,
                [resultFields.perQuantityCost]: CostConversion,
                ApplicabilityCostConversion: ApplicabilityCost,
            };
            // Update the temporary array
            tempArr[index] = updatedItem;
        }
    });
    return tempArr;
};

/**
 * Updates cost values and handles state updates
 */
export const updateCostValue = (isConditionCost, state, price, isSimulation = false, nonIndexationSimulation = false) => {
    // Get table data and settings based on cost type
    const table = isConditionCost
        ? recalculateConditions(isSimulation ? price : (nonIndexationSimulation ? state.OldNetCostWithoutConditionCost

            : state.NetCostWithoutConditionCost), state, isSimulation, nonIndexationSimulation)
        : recalculateOtherCost(price, state, isSimulation, nonIndexationSimulation);

    // Calculate sum
    const costField = isConditionCost ? 'ConditionCostPerQuantity' : 'NetCost';
    const sum = table?.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj[costField]), 0);

    // Return updated state and form values
    return {
        updatedState: {
            ...state,
            [isConditionCost ? 'NetConditionCost' : 'totalOtherCost']: sum,
            [isConditionCost ? 'conditionTableData' : 'otherCostTableData']: table
        },
        formValue: {
            field: isConditionCost ? 'FinalConditionCost' : 'OtherCost',
            value: checkForDecimalAndNull(sum, getConfigurationKey().NoOfDecimalForPrice)
        },
        tableData: table
    };
};

export const compareRateCommon = (otherCostData, conditionCostData) => {
    if (otherCostData?.[0]?.Applicability === "Basic Rate" && conditionCostData?.[0]?.Applicability === "Basic Price") {
        Toaster.warning("Please click on refresh button to update Other Cost and Condition Cost data.");
    } else if (otherCostData?.[0]?.Applicability === "Basic Rate") {
        Toaster.warning("Please click on refresh button to update Other Cost data.");
    } else if (conditionCostData?.[0]?.Applicability === "Basic Price") {
        Toaster.warning("Please click on refresh button to update Condition Cost data.");
    }
};

export const checkEffectiveDate = (effectiveDate, effectiveDateToChange) => {
    return DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss') === DayTime(effectiveDateToChange).format('YYYY-MM-DD HH:mm:ss')
}