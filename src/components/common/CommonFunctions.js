import { reactLocalStorage } from "reactjs-localstorage";
import _ from 'lodash';
import { CBCAPPROVALTYPEID, CBCTypeId, dropdownLimit, NCCAPPROVALTYPEID, NCCTypeId, NFRAPPROVALTYPEID, NFRTypeId, RELEASESTRATEGYTYPEID1, RELEASESTRATEGYTYPEID2, RELEASESTRATEGYTYPEID3, RELEASESTRATEGYTYPEID4, VBCAPPROVALTYPEID, VBCTypeId, WACAPPROVALTYPEID, WACTypeId, ZBCAPPROVALTYPEID, ZBCTypeId, PFS2APPROVALTYPEID, PFS2TypeId, RELEASE_STRATEGY_B1, RELEASE_STRATEGY_B1_NEW, RELEASE_STRATEGY_B2, RELEASE_STRATEGY_B2_NEW, RELEASE_STRATEGY_B3, RELEASE_STRATEGY_B3_NEW, RELEASE_STRATEGY_B4, RELEASE_STRATEGY_B6, RELEASE_STRATEGY_B6_NEW, RELEASE_STRATEGY_B4_NEW } from "../../config/constants";
import Toaster from "./Toaster";

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
const commonDropdownFunction = (array, tempBoolean = false, selectedParts = [], finalArray, partWithRev = false) => {
    array && array.map(item => {
        if (item.Value === '0' || item.PartId === '0') return array
        if ((tempBoolean && (item?.PartId) && selectedParts.includes(item.PartId)) || (tempBoolean && (item?.Value) && selectedParts.includes(item.Value))) return false        //FOR REMOVING DUPLICATE PART ENTRY         
        if (partWithRev) {
            finalArray.push({ label: `${item.PartNumber}${item.RevisionNumber ? ` (${item.RevisionNumber})` : ''}`, value: item.PartId, RevisionNumber: item.RevisionNumber })
        } else {
            finalArray.push({ label: item.Text, value: item.Value })
        }
        return null
    })
}
// FOR AUTOCOMPLLETE IN PART AND VENDOR 
export const autoCompleteDropdown = (inputValue, dropdownArray, tempBoolean = false, selectedParts = [], isApiCall) => {
    let tempArr = []
    let finalArr = []
    let finalArr1 = []
    if (isApiCall) {
        tempArr = commonFilterFunction(inputValue, dropdownArray, 'Text')
        commonDropdownFunction(tempArr, tempBoolean, selectedParts, finalArr1, false)         //TO SHOW THE FILTERED VENDOR OR PART
        commonDropdownFunction(dropdownArray, tempBoolean, selectedParts, finalArr, false)   // TO STORE ALL VENDOR OR PART DATA IN LOCAL STORAGE
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
export const autoCompleteDropdownPart = (inputValue, dropdownArray, tempBoolean = false, selectedParts = [], isApiCall) => {
    let tempArr = []
    let finalArr1 = []
    let finalArr = []

    if (isApiCall) {
        tempArr = commonFilterFunction(inputValue, dropdownArray, "PartNumber")
        commonDropdownFunction(tempArr, tempBoolean, selectedParts, finalArr1, true)              //TO SHOW THE FILTERED PART
        commonDropdownFunction(dropdownArray, tempBoolean, selectedParts, finalArr, true)        // TO STORE ALL PART DATA IN LOCAL STORAGE
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
        case PFS2TypeId:
            approvalTypeId = PFS2APPROVALTYPEID;
            break;
        default:
            approvalTypeId = null; // or any default value you prefer
            break;
    }
    return approvalTypeId;
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

export const checkMasterCreateByCostingPermission = () => {
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
        Toaster.warning("You have not enough permission for creating this master.")
        return false;
    }
    return true;
}

