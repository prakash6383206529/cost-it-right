// App.js
import React, { useEffect, useState } from 'react';
import Table from './Table';
import { useDispatch, useSelector } from 'react-redux';
import { getViewRawMaterialDetails, setRawMaterialCostingData } from '../../masters/actions/Material';
import DayTime from '../../common/DayTimeWrapper';
import LoaderCustom from '../../common/LoaderCustom';
import { calculateBestCost, checkForNull, getConfigurationKey } from '../../../helper';
import _, { isNumber } from 'lodash';
import WarningMessage from '../../common/WarningMessage';
import { useLabels } from '../../../helper/core';
import AddOtherCostDrawer from '../../masters/material-master/AddOtherCostDrawer';
const RMCompareTable = (props) => {
    const { RfqMasterApprovalDrawer = false, uniqueShouldCostingId = [], selectedRows = [] } = props;
    const dispatch = useDispatch()
    const { viewRmDetails } = useSelector(state => state.material)
    const [sectionData, setSectionData] = useState([])
    const [mainHeadingData, setMainHeadingData] = useState([])
    const [checkBoxCheck, setCheckBoxCheck] = useState({})
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedIndices, setSelectedIndices] = useState([])
    const [isLoader, setIsLoader] = useState(false)
    const { technologyLabel } = useLabels();
    const [showConvertedCurrencyCheckbox, setShowConvertedCurrencyCheckbox] = useState(false)
    const [otherCostDrawer, setOtherCostDrawer] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const bestCostingData = useSelector(state => state.rfq.bestCostingData)
    const showCheckbox = viewRmDetails && viewRmDetails?.some(item => item.IsShowCheckBoxForApproval === true);
    const [showConvertedCurrency, setShowConvertedCurrency] = useState(true)

    // Add handler function
    const handleConvertedCurrencyChange = (value) => {
        setShowConvertedCurrency(value);
    }
    const tableDataClass = (data) => {
        // return props?.isRfqCosting && data.isRFQFinalApprovedCosting && !isApproval && !data?.bestCost ? 'finalize-cost' : ''
    }

    useEffect(() => {
        //if(!RfqMasterApprovalDrawer){
        setIsLoader(true)
        let temp = []
        const uniqueShouldCostingIdArr = uniqueShouldCostingId || [];
        const idArr = selectedRows?.map(item => item?.RawMaterialId);
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
                if (!RfqMasterApprovalDrawer) {
                    let arr = bestCostObjectFunction(tempArrToSend)
                    dispatch(setRawMaterialCostingData([...arr]))
                }
                else {
                    if (bestCostingData) {
                        const arr = [...tempArrToSend, bestCostingData]
                        dispatch(setRawMaterialCostingData([...arr]))
                        setShowConvertedCurrency(true)
                    }
                    else {
                        dispatch(setRawMaterialCostingData([...tempArrToSend]))
                        setShowConvertedCurrency(false)
                    }
                }

            }
        }))
        // }
    }, [showConvertedCurrency, bestCostingData])
    useEffect(() => {

        if (viewRmDetails && _.map(viewRmDetails, 'Currency').every(element =>
            element === getConfigurationKey().BaseCurrency || element === '')) {
            setShowConvertedCurrencyCheckbox(false)
        } else {
            setShowConvertedCurrencyCheckbox(true)
        }

        if (viewRmDetails.length !== 0) {
            let sectionOne = [];
            let sectionTwo = [];
            let sectionThree = []
            let sectionFour = []
            let sectionOneHeader = ['Costing Version', `${technologyLabel}`, 'Plant (Code)', 'RM Code', 'RM Name-Grade', 'RM Specification', 'Category', 'Currency', 'Effective Date',
                showConvertedCurrency ? `Basic Rate (${getConfigurationKey().BaseCurrency})` : 'Basic Rate'
            ]
            let sectionTwoHeader = [showConvertedCurrency ? `Other Net Cost (${getConfigurationKey().BaseCurrency})` : 'Other Net Cost'
            ]

            // Updated section three header based on condition
            let sectionThreeHeader = ['CutOff Price', 'Scrap Rate',]
            if (showConvertedCurrency) {
                sectionThreeHeader.push(
                    showConvertedCurrency ? `RM Net Cost (${getConfigurationKey().BaseCurrency})` : 'RM Net Cost'
                )
            } else {
                sectionThreeHeader.push('RM Net Cost')
            }

            let sectionFourhHeader = ['Remark']
            let mainHeader = []

            viewRmDetails.map((item, index) => {
                //section one data start
                const RMNameGrade = item?.RawMaterialName && item?.RawMaterialGradeName ? `${item?.RawMaterialName}-${item?.RawMaterialGradeName}` : ' ';
                const effectiveDate = item?.EffectiveDate ? (item?.EffectiveDate !== "" ? DayTime(item?.EffectiveDate).format('DD/MM/YYYY') : ' ') : ' ';
                const plantCode = item?.Plant && item?.Plant[0] ? `${item?.Plant[0]?.PlantName}` : ' ';
                const formattedDataOne = [
                    tableDataClass(item),
                    item?.TechnologyName || ' ',
                    plantCode, // Updated plant code here
                    item?.RawMaterialCode || ' ',
                    RMNameGrade,
                    item?.RawMaterialSpecificationName || ' ',
                    item?.RawMaterialCategoryName || ' ',
                    item?.Currency || ' ',
                    effectiveDate,
                    showConvertedCurrency ?
                        item?.bestCost === "" ? item?.BasicRatePerUOMConversion : `${item?.BasicRatePerUOM} (${item?.BasicRatePerUOMConversion})` :
                        item?.BasicRatePerUOM

                ];
                sectionOne.push(formattedDataOne);

                //section two data start
                const formattedDataTwo = [
                    showConvertedCurrency ?
                        item?.bestCost === "" ? item?.OtherNetCostConversion : `${item?.OtherNetCost} (${item?.OtherNetCostConversion})` :
                        item?.OtherNetCost,
                ]
                sectionTwo.push(formattedDataTwo)

                //section three data start with conditional columns
                const formattedDataThree = [
                    item.CutOffPrice,
                    item.ScrapRate,
                ]

                // Add net cost data based on condition
                if (showConvertedCurrencyCheckbox) {
                    formattedDataThree.push(
                        showConvertedCurrency ?
                            item.bestCost === "" ? item.NetLandedCostConversion : `${item.NetLandedCost} (${item.NetLandedCostConversion})` :
                            item.NetLandedCost,

                    )
                } else {
                    formattedDataThree.push(item.NetLandedCost)
                }
                sectionThree.push(formattedDataThree)

                //section Four
                sectionFour.push([item.Remark])

                //mainheader data start
                const mainHeaderObj = {
                    vendorName: item?.VendorName,
                    onChange: () => checkBoxHandle(item, index),
                    checked: checkBoxCheck[index],
                    isCheckBox: !props?.compare ? item?.bestCost ? false : item?.IsShowCheckBoxForApproval : false,
                    bestCost: item?.bestCost,
                    shouldCost: uniqueShouldCostingId?.includes(item?.RawMaterialId) ? "Should Cost" : "",
                    costingType: item?.CostingType === "Zero Based" ? "ZBC" : item?.costingType === "Vendor Based" ? "VBC" : "",
                    vendorCode: item.VendorCode,
                    showConvertedCurrencyCheckbox: item.bestCost === "" && showConvertedCurrencyCheckbox
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
    }, [viewRmDetails, showConvertedCurrency])
    const bestCostObjectFunction = (arrayList) => {
        if (!arrayList?.length) return [];

        const returnArray = _.cloneDeep(arrayList);
        const finalArrayList = _.cloneDeep(arrayList);

        // Check if currency conversion needed
        const isSameCurrency = _.map(arrayList, 'Currency')
            .every(element => element === getConfigurationKey().BaseCurrency);

        const minObject = {
            ...finalArrayList[0],
            attachment: [],
            bestCost: true
        };

        // Handle different cases
        if (isSameCurrency) {
            const keys = ["NetLandedCost", "BasicRatePerUOM", "OtherNetCost"];
            Object.keys(minObject).forEach(key => minObject[key] = "");

            // Find minimum values for each key
            keys.forEach(key => {
                minObject[key] = Math.min(...finalArrayList
                    .map(item => isNumber(item[key]) ? checkForNull(item[key]) : Infinity));
            });

            minObject.nPOPrice = keys.reduce((sum, key) =>
                sum + checkForNull(minObject[key]), 0);
        }
        else if (!showConvertedCurrency) {
            // First set all keys to empty string
            Object.keys(minObject).forEach(key => minObject[key] = "");

            // Find minimum values for conversion keys but don't show in UI
            const conversionKeys = ["NetLandedCostConversion", "BasicRatePerUOMConversion", "OtherNetCostConversion"];

            conversionKeys.forEach(key => {
                minObject[key] = Math.min(...finalArrayList
                    .map(item => isNumber(item[key]) ? checkForNull(item[key]) : Infinity));
            });

            // Set bestCost empty to ensure UI shows empty strings
            minObject.bestCost = "";
        }
        else {
            // Handle converted currency case
            const conversionKeys = ["NetLandedCostConversion", "BasicRatePerUOMConversion", "OtherNetCostConversion"];

            Object.keys(minObject).forEach(key => minObject[key] = "");

            conversionKeys.forEach(key => {
                minObject[key] = Math.min(...finalArrayList
                    .map(item => isNumber(item[key]) ? checkForNull(item[key]) : Infinity));
            });

            minObject.nPOPrice = conversionKeys.reduce((sum, key) =>
                sum + checkForNull(minObject[key]), 0);
        }

        returnArray.push(minObject);
        return returnArray;
    };
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
        if (!props?.compare) { props?.checkCostingSelected(selectedItems, selectedIndices) }
    }, [selectedItems, selectedIndices])
    // const checkBoxHanlde = (item , index) => {
    //     setCheckBoxCheck(prevState => ({ ...prevState, index: true }))
    //     props?.checkCostingSelected(item,index)
    // }
    const onViewOtherCost = (index) => {

        const selectedItem = viewRmDetails[index];
        setSelectedItem(selectedItem)

        setOtherCostDrawer(true)
    }
    return (
        <div>
            {showCheckbox && !props?.compare && < WarningMessage dClass={"float-right justify-content-end"} message={'Click the checkbox to approve, reject, or return the quotation'} />}
            <Table headerData={mainHeadingData}
                sectionData={sectionData}
                uniqueShouldCostingId={uniqueShouldCostingId}
                showConvertedCurrency={showConvertedCurrency}
                onConvertedCurrencyChange={handleConvertedCurrencyChange}
                showConvertedCurrencyCheckbox={showConvertedCurrencyCheckbox}
                onViewOtherCost={onViewOtherCost}
            >
                {isLoader && <LoaderCustom customClass="" />}
            </Table>
            {
                otherCostDrawer &&
                <AddOtherCostDrawer
                    isOpen={otherCostDrawer}
                    anchor={"right"}
                    closeDrawer={() => setOtherCostDrawer(false)}
                    rawMaterial={true}
                    rmBasicRate={selectedItem?.BasicRatePerUOM}
                    ViewMode={true}
                    rmTableData={selectedItem?.RawMaterialOtherCostDetails}
                    RowData={selectedItem}
                    plantCurrency={selectedItem?.Currency}
                    settlementCurrency={selectedItem?.Currency}
                    isImpactedMaster={true}
                    disabled={true}
                />
            }
        </div>


    );
};
export default RMCompareTable;
