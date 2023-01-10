import { reactLocalStorage } from "reactjs-localstorage";
import _ from 'lodash';
import { dropdownLimit } from "../../config/constants";

// COMMON FILTER FUNCTION FOR AUTOCOMPLETE DROPDOWN
const commonFilterFunction = (inputValue, dropdownArray, filterByName) => {
    let tempArr = []
    tempArr = _.filter(dropdownArray, i => {
        return i[filterByName]?.toLowerCase().includes(inputValue?.toLowerCase())
    });
    return tempArr
}

// FOR AUTOCOMPLLETE IN PART AND VENDOR 
export const autoCompleteDropdown = (inputValue, dropdownArray, tempBoolean = false, selectedParts = [], isApiCall) => {
    let tempArr = []
    let finalArr = []

    if (isApiCall) {
        tempArr = commonFilterFunction(inputValue, dropdownArray, 'Text')
        tempArr && tempArr.map(item => {
            if (item.Value === '0') return tempArr
            if (tempBoolean && selectedParts.includes(item.Value)) return false
            finalArr.push({ label: item.Text, value: item.Value })
            return null
        })
        reactLocalStorage?.setObject('Data', finalArr)
        if (tempArr?.length <= 100) {
            return finalArr
        } else {
            return _.slice(finalArr, 0, dropdownLimit)
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

// VOLUME MASTER AUTOCOMPLETE PART 
export const autoCompleteDropdownPart = (inputValue, dropdownArray, tempBoolean = false, selectedParts = [], isApiCall) => {
    let tempArr = []
    let finalArr = []

    if (isApiCall) {
        tempArr = commonFilterFunction(inputValue, dropdownArray, "PartNumber")
        tempArr && tempArr.map(item => {
            if (item.PartId === '0') return tempArr
            if (tempBoolean && selectedParts.includes(item.PartId)) return false
            finalArr.push({ label: `${item.PartNumber}${item.RevisionNumber ? `(${item.RevisionNumber})` : ''}`, value: item.PartId, RevisionNumber: item.RevisionNumber })
            return null
        })
        reactLocalStorage?.setObject('PartData', finalArr)
        if (tempArr?.length <= 100) {
            return finalArr
        } else {
            return _.slice(finalArr, 0, dropdownLimit)
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