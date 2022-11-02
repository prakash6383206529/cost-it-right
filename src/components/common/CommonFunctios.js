// FOR AUTOCOMPLLETE IN PART AND VENDOR 
export const autoCompleteDropdown = (inputValue, dropdownArray) => {
    let tempArr = []
    tempArr = dropdownArray && dropdownArray.filter(i => {
        return i.Text?.toLowerCase().includes(inputValue?.toLowerCase())
    });
    if (tempArr?.length) {
        const finalArr = tempArr && tempArr.map(item => {
            if (item.Value === 0) return false
            return { label: item.Text, value: item.Value }
        })
        return finalArr
    } else {
        const Arr = tempArr?.slice(0, 100)
        const finalArr = Arr && Arr.map(item => {
            if (item.Value === 0) return false
            return { label: item.Text, value: item.Value }
        })
        return finalArr
    }
}
