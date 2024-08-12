// App.js
import React, { useEffect, useState } from 'react';
import Table from './Table';
import { useDispatch, useSelector } from 'react-redux';
import DayTime from '../../common/DayTimeWrapper';
import LoaderCustom from '../../common/LoaderCustom';
import { getViewBOPDetails, setBopCostingData } from '../../masters/actions/BoughtOutParts';
import { checkForNull } from '../../../helper';
import _, { isNumber } from 'lodash';
import ProcessDrawer from '../ProcessDrawer';
import PartSpecificationDrawer from '../../costing/components/PartSpecificationDrawer';
import WarningMessage from '../../common/WarningMessage';
const BOPCompareTable = (props) => {
    const dispatch = useDispatch()
    const { viewBOPDetails } = useSelector((state) => state.boughtOutparts);
    const [openSpecification, setOpenSpecification] = useState(false)
    const [selectedBopId, setSelectedBopId] = useState(null) // [setSelectedBopId, setSelectedBopId]

    const [sectionData, setSectionData] = useState([])
    const [mainHeadingData, setMainHeadingData] = useState([])
    const [checkBoxCheck, setCheckBoxCheck] = useState({})
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedIndices, setSelectedIndices] = useState([])

    const [isLoader, setIsLoader] = useState(false)
    const showCheckbox = viewBOPDetails && viewBOPDetails?.some(item => item?.IsShowCheckBoxForApproval === true);
    useEffect(() => {
        setIsLoader(true)
        let temp = []
        const uniqueShouldCostingIdArr = props?.uniqueShouldCostingId || [];
        const idArr = props?.selectedRows.map(item => item?.BoughtOutPartId);
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
            let sectionThreeHeader = [
                <span className="d-block small-grey-text p-relative">
                    BOP Specification
                    <button className="Balance mb-0 button-stick" type="button" onClick={handleOpenSpecificationDrawerMultiple}>
                    </button>
                </span>,
                'Remark'
            ];
            let mainHeader = []
            viewBOPDetails.map((item, index) => {
                //section one data start
                const effectiveDate = item?.EffectiveDate
                    ? (item?.EffectiveDate !== "-" ? DayTime(item?.EffectiveDate).format('DD/MM/YYYY') : '-') : '-';
                const formattedDataOne = [
                    item?.BoughtOutPartNumber,
                    item?.BoughtOutPartName,
                    item?.BoughtOutPartCategory,
                    item?.UOM,
                    /*  item?.BoughtOutPartSpecificationName, */
                    item?.Plants,
                    item?.Vendor,
                    effectiveDate,
                    item?.BasicRate
                ];
                sectionOne.push(formattedDataOne);

                //section two data start
                const formattedDataTwo = [
                    item?.NumberOfPieces,
                    item?.NetLandedCost
                ]
                sectionTwo.push(formattedDataTwo)

                //section Three
                // sectionThree.push([item?.Remark])
                sectionThree = viewBOPDetails.map(item => [
                    item?.bestCost === true ? ' ' : (
                        <div onClick={() => handleOpenSpecificationDrawerSingle(item?.BoughtOutPartId)} className={'link'}>
                            View Specifications
                        </div>
                    ),
                    item?.Remark
                ]);

                //mainheader data start
                const mainHeaderObj = {
                    vendorName: item?.Vendor,
                    onChange: () => checkBoxHandle(item, index),
                    checked: checkBoxCheck[index],
                    isCheckBox: item?.bestCost ? false : item?.IsShowCheckBoxForApproval,
                    bestCost: item?.bestCost,
                    shouldCost: props?.uniqueShouldCostingId?.includes(item?.RawMaterialId) ? "Should Cost" : "",
                    costingType: item?.CostingType === "Zero Based" ? "ZBC" : item?.costingType === "Vendor Based" ? "VBC" : "",
                    vendorCode: item?.VendorCode,


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
    const closeSpecificationDrawer = () => {
        setOpenSpecification(false);
    };

    const handleOpenSpecificationDrawerMultiple = () => {
        let ids = viewBOPDetails
            .map(item => item?.BoughtOutPartId)
            .filter(id => id !== null && id !== undefined && id !== '-');
        setSelectedBopId(ids);
        setOpenSpecification(true);
    };

    const handleOpenSpecificationDrawerSingle = (id) => {
        setSelectedBopId([id]);
        setOpenSpecification(true);
    };
    const bestCostObjectFunction = (arrayList) => {

        let finalArrayList = [...arrayList];

        // Check if the input array is empty or null
        if (!finalArrayList || finalArrayList?.length === 0) {
            // If so, return an empty array
            return [];
        } else {
            // Define an array of keys to check when finding the "best cost"
            const keysToCheck = ["NetLandedCost", "BasicRate"];
            const keysToCheckSum = ["NetLandedCost", "BasicRate"];;

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
                        } else if (Array.isArray(currentObject[key])) {
                            // Set the minimum value for this key to an empty array
                            minObject[key] = [];
                        }
                    }
                }
            }

            // Ensure keysToCheck have default value of 0 if they are null or undefined
            for (let key of keysToCheck) {
                if (minObject[key] == null) {
                    minObject[key] = 0;
                }
            }

            // Set all other keys to an empty string
            for (let key in minObject) {
                if (!keysToCheck.includes(key)) {
                    minObject[key] = "";
                }
            }

            // Set the attachment and bestCost properties of the minimum object
            let sum = 0;
            for (let key in finalArrayList[0]) {
                if (keysToCheckSum?.includes(key)) {
                    if (isNumber(minObject[key])) {
                        sum = sum + checkForNull(minObject[key]);
                    } else if (Array.isArray(minObject[key])) {
                        minObject[key] = [];
                    }
                } else {
                    minObject[key] = minObject[key] || "";
                }
            }

            minObject.attachment = [];
            minObject.bestCost = true;
            minObject.nPOPrice = sum;

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
            if (prevItems.some(i => i.BoughtOutPartId === item?.BoughtOutPartId)) {
                newItems = prevItems.filter(i => i.BoughtOutPartId !== item?.RawMaterialId)
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
if(!props.compare)
      {  props?.checkCostingSelected(selectedItems, selectedIndices)}
    }, [selectedItems, selectedIndices])
    // const checkBoxHanlde = (item , index) => {
    //     setCheckBoxCheck(prevState => ({ ...prevState, index: true }))
    //     props?.checkCostingSelected(item,index)
    // }
    return (
        <div>
            {showCheckbox &&  !props.compare&&  < WarningMessage dClass={"float-right justify-content-end"} message={'Click the checkbox to approve, reject, or return the quotation'} />}

            <Table headerData={mainHeadingData} sectionData={sectionData}>
                {isLoader && <LoaderCustom customClass="" />}
            </Table>
            {openSpecification && <PartSpecificationDrawer
                isOpen={openSpecification}
                closeDrawer={closeSpecificationDrawer}
                anchor={'right'}
                bopId={selectedBopId}
                bopQuotationId={props?.quotationId}
                type={'BOP'}
            />
            }
        </div>
    );
};
export default BOPCompareTable;
