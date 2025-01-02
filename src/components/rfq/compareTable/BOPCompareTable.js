// App.js
import React, { useEffect, useState } from 'react';
import Table from './Table';
import { useDispatch, useSelector } from 'react-redux';
import DayTime from '../../common/DayTimeWrapper';
import LoaderCustom from '../../common/LoaderCustom';
import { getViewBOPDetails, setBopCostingData } from '../../masters/actions/BoughtOutParts';
import { checkForNull, getConfigurationKey } from '../../../helper';
import _, { isNumber } from 'lodash';
import ProcessDrawer from '../ProcessDrawer';
import PartSpecificationDrawer from '../../costing/components/PartSpecificationDrawer';
import WarningMessage from '../../common/WarningMessage';
import { useLabels } from '../../../helper/core';
import AddOtherCostDrawer from '../../masters/material-master/AddOtherCostDrawer';

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
    const { vendorLabel } = useLabels();
    const[selectedItem,setSelectedItem] = useState(null)
    const[otherCostDrawer,setOtherCostDrawer] = useState(false)
    const [isLoader, setIsLoader] = useState(false)
    const showCheckbox = viewBOPDetails && viewBOPDetails?.some(item => item?.IsShowCheckBoxForApproval === true);
    const [showConvertedCurrency, setShowConvertedCurrency] = useState(false)
    const [showConvertedCurrencyCheckbox, setShowConvertedCurrencyCheckbox] = useState(false)
        // Add handler function
        const handleConvertedCurrencyChange = (value) => {
            setShowConvertedCurrency(value);
        }
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
    }, [showConvertedCurrency])

    
    useEffect(() => {
        if (viewBOPDetails && _.map(viewBOPDetails, 'Currency').every(element => 
            element === getConfigurationKey().BaseCurrency)) {
            setShowConvertedCurrencyCheckbox(false)
        } else {
            setShowConvertedCurrencyCheckbox(true)
        }
    
        if (viewBOPDetails.length !== 0) {
            let sectionOne = [];
            let sectionTwo = [];
            let sectionThree = [];
    
            // Update headers with correct fields
            let sectionOneHeader = [
                "BOP No.", 
                "BOP Name", 
                "Currency", 
                "Category", 
                "UOM",
                'Plant (Code)', 
                `${vendorLabel} (Code)`, 
                'Effective Date',
                showConvertedCurrency ? 
                    `Basic Rate (${getConfigurationKey().BaseCurrency})` : 
                    'Basic Rate'
            ];
    
            if (showConvertedCurrency) {
                sectionOneHeader.push(
                    showConvertedCurrency ? 
                        `Other Net Cost (${getConfigurationKey().BaseCurrency})` : 
                        'Other Net Cost'
                );
            } else {
                sectionOneHeader.push('Other Net Cost');
            }
    
            viewBOPDetails.map((item, index) => {
                // Section One Data
                const formattedDataOne = [
                    item?.BoughtOutPartNumber,
                    item?.BoughtOutPartName,
                    item?.Currency,
                    item?.BoughtOutPartCategory,
                    item?.UOM,
                    item?.Plants,
                    `${item?.Vendor} (${item?.VendorCode})`,
                    item?.EffectiveDate ? 
                        DayTime(item?.EffectiveDate).format('DD/MM/YYYY') : 
                        '-',
                    showConvertedCurrency ? 
                        item?.bestCost ? 
                            item?.BasicRateConversion : 
                            `${item?.BasicRate} (${item?.BasicRateConversion})` : 
                        item?.BasicRate,
                    showConvertedCurrency ? 
                        item?.bestCost ? 
                            item?.OtherNetCostConversion : 
                            `${item?.OtherNetCost} (${item?.OtherNetCostConversion})` : 
                        item?.OtherNetCost
                ];
                sectionOne.push(formattedDataOne);
    
                // Section Two Data
                const formattedDataTwo = [
                    item?.NumberOfPieces,
                    showConvertedCurrency ? 
                        item?.bestCost ? 
                            item?.NetLandedCostConversion : 
                            `${item?.NetLandedCost} (${item?.NetLandedCostConversion})` : 
                        item?.NetLandedCost
                ];
                sectionTwo.push(formattedDataTwo);
            });
    
            // Section Three Data
            sectionThree = viewBOPDetails.map(item => [
                item?.bestCost ? '-' : (
                    <div 
                        onClick={() => handleOpenSpecificationDrawerSingle(item.BoughtOutPartId)} 
                        className={'link'}
                    >
                        View Specifications
                    </div>
                ),
                item.Remark || '-'
            ]);
    
            // Main Header Data
            const mainHeader = viewBOPDetails.map((item, index) => ({
                vendorName: item.Vendor,
                onChange: () => checkBoxHandle(item, index),
                checked: checkBoxCheck[index],
                isCheckBox: !props?.compare ? 
                    item?.bestCost ? false : item?.IsShowCheckBoxForApproval : 
                    false,
                bestCost: item?.bestCost,
                shouldCost: props?.uniqueShouldCostingId?.includes(item.BoughtOutPartId) ? 
                    "Should Cost" : "",
                costingType: item.CostingHead === "Zero Based" ? 
                    "ZBC" : 
                    item.CostingHead === "Vendor Based" ? "VBC" : "",
                vendorCode: item.VendorCode,
                showConvertedCurrencyCheckbox: item.bestCost===""&&showConvertedCurrencyCheckbox

            }));
    
            const sections = [
                {
                    header: sectionOneHeader,
                    data: sectionOne,
                    isHighlightedRow: true,
                },
                {
                    header: ['Minimum Order Quantity', 'BOP Net Cost'],
                    data: sectionTwo,
                    isHighlightedRow: true,
                },
                {
                    header: [
                        <span className="d-block small-grey-text p-relative">
                            BOP Specification
                            <button 
                                className="Balance mb-0 button-stick" 
                                type="button" 
                                onClick={handleOpenSpecificationDrawerMultiple}
                            >
                            </button>
                        </span>,
                        'Remark'
                    ],
                    data: sectionThree,
                    isHighlightedRow: false,
                }
            ];
    
            setSectionData(sections);
            setMainHeadingData(mainHeader);
        }
    }, [viewBOPDetails, showConvertedCurrency]);
    const closeSpecificationDrawer = () => {
        setOpenSpecification(false);
    };

    const handleOpenSpecificationDrawerMultiple = () => {
        let ids = viewBOPDetails
            .filter(item => !item?.bestCost) // Filter out best cost rows
            .map(item => item?.BoughtOutPartId)
            .filter(id => id !== null && id !== undefined && id !== '-');
        
        if (ids.length > 0) {
            setSelectedBopId(ids);
            setOpenSpecification(true);
        }
    };

    const handleOpenSpecificationDrawerSingle = (id) => {
        setSelectedBopId([id]);
        setOpenSpecification(true);
    };
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
    const onViewOtherCost = (index) => {
        
        const selectedItem = viewBOPDetails[index];
        setSelectedItem(selectedItem)
        
        setOtherCostDrawer(true)
    }


    useEffect(() => {
        if (!props?.compare) { props?.checkCostingSelected(selectedItems, selectedIndices) }
    }, [selectedItems, selectedIndices])
    // const checkBoxHanlde = (item , index) => {
    //     setCheckBoxCheck(prevState => ({ ...prevState, index: true }))
    //     props?.checkCostingSelected(item,index)
    // }
    return (
        <div>
            {showCheckbox && !props?.compare && < WarningMessage dClass={"float-right justify-content-end"} message={'Click the checkbox to approve, reject, or return the quotation'} />}

            <Table headerData={mainHeadingData} sectionData={sectionData}showConvertedCurrency={showConvertedCurrency}
                onConvertedCurrencyChange={handleConvertedCurrencyChange}
                showConvertedCurrencyCheckbox={showConvertedCurrencyCheckbox}
                onViewOtherCost={onViewOtherCost}>
                          

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
    rmTableData={selectedItem?.BoughtOutPartOtherCostDetailsSchema}
    RowData={selectedItem}
    plantCurrency={selectedItem?.Currency}
    settlementCurrency={selectedItem?.Currency}
    isImpactedMaster={true}
    disabled={true}
    
/>
}

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
