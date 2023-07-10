import { reactLocalStorage } from "reactjs-localstorage";
import _ from 'lodash';
import { CBCAPPROVALTYPEID, CBCTypeId, dropdownLimit, NCCAPPROVALTYPEID, NCCTypeId, NFRAPPROVALTYPEID, NFRTypeId, PFS2APPROVALTYPEID, PFS2APPROVALTYPEIDFULL, PFS2TypeId, VBCAPPROVALTYPEID, VBCTypeId, ZBCAPPROVALTYPEID, ZBCTypeId, WACAPPROVALTYPEID, WACTypeId } from "../../config/constants";

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
    if (!reactLocalStorage.getObject('cbcCostingPermission')) {
        excelData = data && data.filter((item) => item.value !== value)
    }
    else {
        excelData = [...data]
    }
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
        case PFS2TypeId:
            approvalTypeId = PFS2APPROVALTYPEID;
        case WACTypeId:
            approvalTypeId = WACAPPROVALTYPEID;
            break;
        default:
            approvalTypeId = null; // or any default value you prefer
            break;
    }
    return approvalTypeId;
};
export const hideColumnFromExcel = (data, value) => {
    let excelData
    excelData = data && data.filter((item) => item.value !== value)
    return excelData
}
