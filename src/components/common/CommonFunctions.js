// FOR AUTOCOMPLLETE IN PART AND VENDOR 
export const autoCompleteDropdown = (inputValue, dropdownArray, tempBoolean = false, selectedParts = []) => {
    let tempArr = []
    let finalArr = []
    tempArr = dropdownArray && dropdownArray.filter(i => {
        return i.Text?.toLowerCase().includes(inputValue?.toLowerCase())
    });
    if (tempArr?.length <= 100) {
        tempArr && tempArr.map(item => {
            if (item.Value === '0') return tempArr
            if (tempBoolean && selectedParts.includes(item.Value)) return false
            finalArr.push({ label: item.Text, value: item.Value })
            return null
        })
        return finalArr
    } else {
        const Arr = tempArr?.slice(0, 100)
        Arr && Arr.map(item => {
            if (item.Value === '0') return tempArr
            if (tempBoolean && selectedParts.includes(item.Value)) return false
            finalArr.push({ label: item.Text, value: item.Value })
            return null
        })
        return finalArr

    }
}
