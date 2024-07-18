// App.js
import React, { useEffect, useState } from 'react';
import Table from './Table';
import { useDispatch, useSelector } from 'react-redux';
import DayTime from '../../common/DayTimeWrapper';
import LoaderCustom from '../../common/LoaderCustom';
import { getViewBOPDetails, setBopCostingData } from '../../masters/actions/BoughtOutParts';
import { checkForNull } from '../../../helper';
import _, { isNumber } from 'lodash';
const BOPCompareTable = (props) => {

    const dispatch = useDispatch()
    const { viewBOPDetails } = useSelector((state) => state.boughtOutparts);



    const [sectionData, setSectionData] = useState([])
    const [mainHeadingData, setMainHeadingData] = useState([])
    const [checkBoxCheck, setCheckBoxCheck] = useState({})
    const [selectedRows, setSelectedRows] = useState([])
    const [isLoader, setIsLoader] = useState(false)
    useEffect(() => {
        setIsLoader(true)
        let temp = []
        const uniqueShouldCostingIdArr = props.uniqueShouldCostingId || [];
        const idArr = props.selectedRows.map(item => item.BoughtOutPartId);
        const combinedArr = Array.from(new Set([...uniqueShouldCostingIdArr, ...idArr]));

        dispatch(getViewBOPDetails(combinedArr, res => {
            setIsLoader(false)
            if (res) {
                res?.data?.DataList?.map((item) => {
                    temp.push(item)
                    return null
                })
                let dat = [...temp]

                let tempArrToSend = _.uniqBy(dat, 'BoughtOutPartId')
                let arr = bestCostObjectFunction(tempArrToSend)
                dispatch(setBopCostingData([...arr]))

            }
        }))
    }, [])
    useEffect(() => {
        if (viewBOPDetails.length !== 0) {
            let sectionOne = [];
            let sectionTwo = [];
            let sectionThree = []
            let sectionOneHeader = ["BOP No.", "BOP Name", "Category", "UOM", /* "Specification", */ 'Plant (Code)', "vendor (Code)", 'Effective Date', 'Basic Rate']
            let sectionTwoHeader = ['Minimum Order Quantity', 'BOP Net Cost']
            let sectionThreeHeader = ['Remark']
            let mainHeader = []
            viewBOPDetails.map((item, index) => {
                //section one data start
                const effectiveDate = item.EffectiveDate && !item.EffectiveDate.includes('-') ? (
                    <input className='form-control defualt-input-value' disabled={true} value={DayTime(item.EffectiveDate).format('DD/MM/YYYY')} />
                ) : null; const formattedDataOne = [
                    item.BoughtOutPartNumber,
                    item.BoughtOutPartName,
                    item.BoughtOutPartCategory,
                    item.UOM,
                    /*  item.BoughtOutPartSpecificationName, */
                    item.Plants,
                    item.Vendor,
                    effectiveDate,
                    item.BasicRate
                ];
                sectionOne.push(formattedDataOne);

                //section two data start
                const formattedDataTwo = [
                    item.NumberOfPieces,
                    item.NetLandedCost
                ]
                sectionTwo.push(formattedDataTwo)

                //section Three
                sectionThree.push([item.Remark])

                //mainheader data start
                const mainHeaderObj = {
                    vendorName: item.Vendor,
                    onChange: () => checkBoxHanlde(item, index),
                    checked: checkBoxCheck[index],
                    isCheckBox: item.IsShowCheckBoxForApproval,
                    bestCost: item.bestCost,
                    shouldCost: props.uniqueShouldCostingId?.includes(item.RawMaterialId) ? "Should Cost" : ""


                }
                mainHeader.push(mainHeaderObj)
            })
            const sectionOneDataObj = {
                header: sectionOneHeader,
                data: sectionOne,
                isHighlightedRow: true,
            }
            const sectionTwoDataObj = {
                header: sectionTwoHeader,
                data: sectionTwo,
                isHighlightedRow: true,
            }
            const sectionThreeDataObj = {
                header: sectionThreeHeader,
                data: sectionThree,
                isHighlightedRow: false,
            }
            setSectionData([sectionOneDataObj, sectionTwoDataObj, sectionThreeDataObj])
            setMainHeadingData(mainHeader)
        }
    }, [viewBOPDetails])
    const bestCostObjectFunction = (arrayList) => {

        // Create a copy of the input array to prevent mutation
        let finalArrayList = [...arrayList];

        // Check if the input array is empty or null
        if (!finalArrayList || finalArrayList.length === 0) {
            // If so, return an empty array
            return [];
        } else {
            // Define an array of keys to check when finding the "best cost"
            const keysToCheck = ["NetLandedCost", "BasicRate"];
            const keysToCheckSum = ["NetLandedCost", "BasicRate"];;
            // const keysToCheck = ["nPOPriceWithCurrency"];

            // Create a new object to represent the "best cost" and set it to the first object in the input array
            let minObject = { ...finalArrayList[0] };

            // Loop through each object in the input array
            for (let i = 0; i < finalArrayList?.length; i++) {
                // Get the current object
                let currentObject = finalArrayList[i];

                // Loop through each key in the current object
                for (let key in currentObject) {
                    // Check if the key is in the keysToCheck array
                    if (keysToCheck?.includes(key)) {
                        // Check if the current value and the minimum value for this key are both numbers
                        if (isNumber(currentObject[key]) && isNumber(minObject[key])) {
                            // If so, check if the current value is smaller than the minimum value
                            if (checkForNull(currentObject[key]) < checkForNull(minObject[key])) {
                                // If so, set the current value as the minimum value
                                minObject[key] = currentObject[key];
                            }
                            // If the current value is an array
                        } else if (Array.isArray(currentObject[key])) {
                            // Set the minimum value for this key to an empty array
                            minObject[key] = [];
                        }
                    } else {
                        // If the key is not in the keysToCheck array, set the minimum value for this key to a dash
                        minObject[key] = "";
                        // delete minObject[key];
                    }
                }
                // Set the attachment and bestCost properties of the minimum object
                let sum = 0
                for (let key in finalArrayList[0]) {
                    if (keysToCheckSum?.includes(key)) {
                        if (isNumber(minObject[key])) {
                            sum = sum + checkForNull(minObject[key]);
                        } else if (Array.isArray(minObject[key])) {
                            minObject[key] = [];
                        }
                    } else {
                        minObject[key] = "";
                    }
                }
                minObject.attachment = []
                minObject.bestCost = true
                minObject.nPOPrice = sum
            }
            // Add the minimum object to the end of the array
            finalArrayList.push(minObject);
        }

        // Return the modified array
        return finalArrayList;
    }

    const checkBoxHanlde = (index, item) => {
        let selectedData = []
        selectedData.push(item?.BoughtOutPartId)


        setCheckBoxCheck(prevState => ({ ...prevState, index: true }))
        props.checkCostingSelected(selectedData, index)
    }
    return (
        <div>
            <Table headerData={mainHeadingData} sectionData={sectionData}>
                {isLoader && <LoaderCustom customClass="" />}
            </Table>
        </div>
    );
};
export default BOPCompareTable;
