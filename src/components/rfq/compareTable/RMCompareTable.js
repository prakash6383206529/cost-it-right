// App.js
import React, { useEffect, useState } from 'react';
import Table from './Table';
import { useDispatch, useSelector } from 'react-redux';
import { getViewRawMaterialDetails, setRawMaterialCostingData } from '../../masters/actions/Material';
import DayTime from '../../common/DayTimeWrapper';
import LoaderCustom from '../../common/LoaderCustom';
import { checkForNull } from '../../../helper';
import _, { isNumber } from 'lodash';

const RMCompareTable = (props) => {
    const dispatch = useDispatch()
    const { viewRmDetails } = useSelector(state => state.material)
    
    const [sectionData, setSectionData] = useState([])
    const [mainHeadingData, setMainHeadingData] = useState([])
    const [checkBoxCheck, setCheckBoxCheck] = useState({})
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedIndices, setSelectedIndices] = useState([])
        const [isLoader, setIsLoader] = useState(false)
    useEffect(() => {
        setIsLoader(true)
        let temp = []
        const uniqueShouldCostingIdArr = props.uniqueShouldCostingId || [];
        const idArr = props.selectedRows.map(item => item.RawMaterialId);
        const combinedArr = Array.from(new Set([...uniqueShouldCostingIdArr, ...idArr]));
        dispatch(getViewRawMaterialDetails(combinedArr, res => {

            setIsLoader(false)
            if (res) {
                res?.data?.DataList?.map((item) => {
                    temp.push(item)
                    return null
                })
                let dat = [...temp]

                let tempArrToSend = _.uniqBy(dat, 'RawMaterialId')
                let arr = bestCostObjectFunction(tempArrToSend)
                dispatch(setRawMaterialCostingData([...arr]))

            }
        }))
    }, [])
    useEffect(() => {
        if (viewRmDetails.length !== 0) {
            let sectionOne = [];
            let sectionTwo = [];
            let sectionThree = []
            let sectionFour = []
            let sectionOneHeader = ['Technology', 'Plant (Code)', 'RM Code', 'RM Name-Grade', 'RM Specification', 'Category', 'Effective Date', 'Basic Rate']
            let sectionTwoHeader = ['RM Other Cost',]
            let sectionThreeHeader = ['CutOff Price', 'Scrap Rate', 'RM Net Cost']
            let sectionFourhHeader = ['Remark']
            let mainHeader = []
            viewRmDetails.map((item, index) => {
                //section one data start
                const RMNameGrade = `${item.RawMaterialName}-${item.RawMaterialGradeName}`;
                const effectiveDate = item.EffectiveDate && !item.EffectiveDate.includes('-') ? (
                    <input className='form-control defualt-input-value' disabled={true} value={DayTime(item.EffectiveDate).format('DD/MM/YYYY')} />
                ) : null;
                const formattedDataOne = [
                    item.TechnologyName,
                    item.DestinationPlantName,
                    item.RawMaterialCode,
                    RMNameGrade,
                    item.RawMaterialSpecificationName,
                    item.RawMaterialCategoryName,
                    effectiveDate,
                    item.BasicRatePerUOM
                ];
                sectionOne.push(formattedDataOne);

                //section two data start
                const formattedDataTwo = [
                    item.OtherNetCost,
                ]
                sectionTwo.push(formattedDataTwo)
                //section two data start
                const formattedDataThree = [
                    item.CutOffPrice,
                    item.ScrapRate,
                    item.NetLandedCost
                ]
                sectionThree.push(formattedDataThree)

                //section Three
                sectionFour.push([item.Remark])

                //mainheader data start
                const mainHeaderObj = {
                    vendorName: item.VendorName,
                    onChange: () => checkBoxHandle(item,index),
                    checked: checkBoxCheck[index],
                    isCheckBox: item.IsShowCheckBoxForApproval,
                    // isCheckBox:true,
                    bestCost: item.bestCost,
                    shouldCost: props.uniqueShouldCostingId?.includes(item.RawMaterialId) ? "Should Cost" : "",
                    costingType: item.CostingType === "Zero Based" ? "ZBC" : item.costingType === "Vendor Based" ? "VBC" : "",
                    vendorCode: item.VendorCode,



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
                isHighlightedRow: true,
            }
            const sectionFourhDataObj = {
                header: sectionFourhHeader,
                data: sectionFour,
                isHighlightedRow: false,
            }
            setSectionData([sectionOneDataObj, sectionTwoDataObj, sectionThreeDataObj, sectionFourhDataObj])
            setMainHeadingData(mainHeader)
        }
    }, [viewRmDetails])
    const bestCostObjectFunction = (arrayList) => {

        let finalArrayList = [...arrayList];

        // Check if the input array is empty or null
        if (!finalArrayList || finalArrayList.length === 0) {
            // If so, return an empty array
            return [];
        } else {
            // Define an array of keys to check when finding the "best cost"
            const keysToCheck = ["NetLandedCost", "BasicRatePerUOM", "OtherNetCost"];
            const keysToCheckSum = ["NetLandedCost", "BasicRatePerUOM", "OtherNetCost"];;
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
    const checkBoxHandle = (item, index) => {
        setCheckBoxCheck(prevState => {
            const newState = { ...prevState, [index]: !prevState[index] }
            return newState
        })

        setSelectedItems(prevItems => {
            let newItems
            if (prevItems.some(i => i.RawMaterialId === item.RawMaterialId)) {
                newItems = prevItems.filter(i => i.RawMaterialId !== item.RawMaterialId)
            } else {
                newItems = [...prevItems, item]
            }
            return newItems
        })

        setSelectedIndices(prevIndices => {
            let newIndices
            if (prevIndices.includes(index)) {
                newIndices = prevIndices.filter(i => i !== index)
            } else {
                newIndices = [...prevIndices, index]
            }
            return newIndices
        })
    }
    
    useEffect(() => {
        
        props.checkCostingSelected(selectedItems, selectedIndices)
    }, [selectedItems, selectedIndices])
    // const checkBoxHanlde = (item , index) => {
    //     setCheckBoxCheck(prevState => ({ ...prevState, index: true }))
    //     props.checkCostingSelected(item,index)
    // }
    return (
        <div>
            <Table headerData={mainHeadingData} sectionData={sectionData} uniqueShouldCostingId={props.uniqueShouldCostingId}>
                {isLoader && <LoaderCustom customClass="" />}
            </Table>
        </div>
    );
};
export default RMCompareTable;
