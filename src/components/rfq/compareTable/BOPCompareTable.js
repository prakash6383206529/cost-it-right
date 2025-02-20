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
    const { viewBOPDetails } = useSelector((state) => state?.boughtOutparts);
    const [openSpecification, setOpenSpecification] = useState(false)
    const [selectedBopId, setSelectedBopId] = useState(null) // [setSelectedBopId, setSelectedBopId]
    const [sectionData, setSectionData] = useState([])
    const [mainHeadingData, setMainHeadingData] = useState([])
    const [checkBoxCheck, setCheckBoxCheck] = useState({})
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedIndices, setSelectedIndices] = useState([])
    const { vendorLabel } = useLabels();
    const [selectedItem, setSelectedItem] = useState(null)
    const [otherCostDrawer, setOtherCostDrawer] = useState(false)
    const [isLoader, setIsLoader] = useState(false)
    const showCheckbox = Array.isArray(viewBOPDetails) && viewBOPDetails.some(
        item => item?.IsShowCheckBoxForApproval === true
    );
    const bestCostingData = useSelector(state => state?.rfq?.bestCostingData)
    const [showConvertedCurrency, setShowConvertedCurrency] = useState(true)
    const [showConvertedCurrencyCheckbox, setShowConvertedCurrencyCheckbox] = useState(false)
    // Add handler function
    const handleConvertedCurrencyChange = (value) => {
        setShowConvertedCurrency(value);
    }
    useEffect(() => {
        if (!props?.compare) { props?.checkCostingSelected(selectedItems, selectedIndices) }
    }, [selectedItems, selectedIndices])
    useEffect(() => {
        setIsLoader(true)
        let temp = []
        const uniqueShouldCostingIdArr = props?.uniqueShouldCostingId || [];
        const idArr = props?.selectedRows?.map(item => item?.BoughtOutPartId);
        const combinedArr = Array?.from(new Set([...uniqueShouldCostingIdArr, ...idArr]));
        dispatch(getViewBOPDetails(combinedArr, res => {
            setIsLoader(false)
            if (res) {
                res?.data?.DataList?.map((item) => {
                    temp?.push(item)
                    return null
                })
                let dat = [...temp]

                let tempArrToSend = _.uniqBy(dat, 'BoughtOutPartId')

                if (!props?.RfqMasterApprovalDrawer) {
                    let arr = bestCostObjectFunction(tempArrToSend)
                    dispatch(setBopCostingData([...arr]))
                } else {
                    if (bestCostingData) {
                        const arr = [...tempArrToSend, bestCostingData]
                        dispatch(setBopCostingData([...arr]))
                        setShowConvertedCurrency(true)
                    }
                    else {
                        dispatch(setBopCostingData([...tempArrToSend]))
                        setShowConvertedCurrency(false)
                    }
                }

            }
        }))

    }, [showConvertedCurrency, bestCostingData])



    useEffect(() => {
        if (viewBOPDetails && _.map(viewBOPDetails, 'Currency').every(element =>
            element === getConfigurationKey().BaseCurrency)) {
            setShowConvertedCurrencyCheckbox(false)
        } else {
            setShowConvertedCurrencyCheckbox(true)
        }

        if (viewBOPDetails?.length !== 0) {
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
                sectionOneHeader?.push(
                    showConvertedCurrency ?
                        `Other Net Cost (${getConfigurationKey().BaseCurrency})` :
                        'Other Net Cost'
                );
            } else {
                sectionOneHeader?.push('Other Net Cost');
            }

            // Map the data with special handling for best cost rows
            viewBOPDetails?.forEach((item, index) => {
                // Section One Data with UOM fix
                const formattedDataOne = [
                    item?.BoughtOutPartNumber || '',
                    item?.BoughtOutPartName || '',
                    item?.Currency || '',
                    item?.BoughtOutPartCategory || '',
                    // Special handling for UOM in best cost rows
                    item.bestCost === "" ? " ": (item?.UOM || ''), // Fix for best cost UOM
                    item?.Plants || '',
                    item?.VendorCode ? `${item?.Vendor} (${item?.VendorCode})` : item?.Vendor || '',
                    item?.EffectiveDate ? DayTime(item?.EffectiveDate).format('DD/MM/YYYY') : '',
                    showConvertedCurrency ?
                        item.bestCost === "" ?
                            item?.BasicRateConversion :
                            `${item?.BasicRate} (${item?.BasicRateConversion})` :
                        item?.BasicRate || ''
                ];
                sectionOne?.push(formattedDataOne);

                // Section Two Data
                const formattedDataTwo = [
                    item?.NumberOfPieces,
                    showConvertedCurrency ?
                        item.bestCost === "" ?
                            item?.NetLandedCostConversion :
                            `${item?.NetLandedCost} (${item?.NetLandedCostConversion})` :
                        item?.NetLandedCost
                ];
                sectionTwo?.push(formattedDataTwo);
            });

            // Section Three Data with safety checks
            sectionThree = viewBOPDetails?.map(item => {
                // Null check for item
                if (!item) {
                    return [null, ''];
                }

                // Safe check for bestCost property
                const isBestCost = item?.bestCost === true || item?.bestCost === "";

                // Safe check for BoughtOutPartId
                const hasValidId = item?.BoughtOutPartId && 
                                 typeof item?.BoughtOutPartId !== 'undefined';

                return [
                    // Only show View Specifications if:
                    // 1. Not a best cost row
                    // 2. Has valid BoughtOutPartId
                    // 3. Not undefined/null
                    !isBestCost && hasValidId ? (
                        <div
                            onClick={() => handleOpenSpecificationDrawerSingle(item?.BoughtOutPartId)}
                            className={'link'}
                        >
                            View Specifications
                        </div>
                    ) : null,
                    // Safe check for Remark
                    typeof item?.Remark === 'string' ? item?.Remark : ''
                ];
            });

            // Main Header Data
            const mainHeader = viewBOPDetails?.map((item, index) => ({
                vendorName: item?.Vendor,
                onChange: () => checkBoxHandle(item, index),
                checked: checkBoxCheck[index],
                isCheckBox: !props?.compare ?
                    item?.bestCost ? false : item?.IsShowCheckBoxForApproval :
                    false,
                bestCost: item?.bestCost,
                shouldCost: props?.uniqueShouldCostingId?.includes(item?.BoughtOutPartId) ?
                    "Should Cost" : "",
                costingType: item?.CostingHead === "Zero Based" ?
                    "ZBC" :
                    item?.CostingHead === "Vendor Based" ? "VBC" : "",
                vendorCode: item?.VendorCode || "",
                showConvertedCurrencyCheckbox: item?.bestCost === "" && showConvertedCurrencyCheckbox

            }));

            const sections = [
                {
                    header: sectionOneHeader || [],
                    data: sectionOne || [],
                    isHighlightedRow: true,
                },
                {
                    header: [
                        "No. of Pieces",
                        showConvertedCurrency ? 
                            `Net Landed Cost (${getConfigurationKey()?.BaseCurrency || ''})` : 
                            "Net Landed Cost"
                    ],
                    data: sectionTwo || [],
                    isHighlightedRow: true,
                },
                {
                    header: ["Specifications", "Remarks"],
                    data: sectionThree || [],
                    isHighlightedRow: false,
                }
            ];

            // Safely set state
            setSectionData(sections);
            setMainHeadingData(mainHeader || []);
        }
    }, [viewBOPDetails, showConvertedCurrency]);

    // Safe handler for specification drawer
    const handleOpenSpecificationDrawerSingle = (id) => {
        try {
            if (!id) {
                console.warn('Invalid BoughtOutPartId');
                return;
            }
            setSelectedBopId([id]);
            setOpenSpecification(true);
        } catch (error) {
            console.error('Error opening specification drawer:', error);
        }
    };

    // Add cleanup on unmount
    useEffect(() => {
        return () => {
            setOpenSpecification(false);
            setSelectedBopId(null);
            setSectionData([]);
            setMainHeadingData([]);
        };
    }, []);

    const closeSpecificationDrawer = () => {
        setOpenSpecification(false);
    };

    const handleOpenSpecificationDrawerMultiple = () => {
        let ids = viewBOPDetails
            .filter(item => !item?.bestCost) // Filter out best cost rows
            .map(item => item?.BoughtOutPartId)
            .filter(id => id !== null && id !== undefined && id !== '');

        if (ids.length > 0) {
            setSelectedBopId(ids);
            setOpenSpecification(true);
        }
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
            const keys = ["NetLandedCost", "BasicRate", "OtherNetCost"];
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
            const conversionKeys = ["NetLandedCostConversion", "BasicRateConversion", "OtherNetCostConversion"];

            conversionKeys.forEach(key => {
                minObject[key] = Math.min(...finalArrayList
                    .map(item => isNumber(item[key]) ? checkForNull(item[key]) : Infinity));
            });

            // Set bestCost empty to ensure UI shows empty strings
            minObject.bestCost = "";
        }
        else {
            // Handle converted currency case
            const conversionKeys = ["NetLandedCostConversion", "BasicRateConversion", "OtherNetCostConversion"];

            Object.keys(minObject).forEach(key => minObject[key] = "");

            conversionKeys.forEach(key => {
                minObject[key] = Math.min(...finalArrayList
                    .map(item => isNumber(item[key]) ? checkForNull(item[key]) : Infinity));
            });

            minObject.nPOPrice = conversionKeys.reduce((sum, key) =>
                sum + checkForNull(minObject[key]), 0);
        }

        returnArray?.push(minObject);
        return returnArray;
    };


    const checkBoxHandle = (item, index) => {
        setCheckBoxCheck(prevState => {
            const newState = { ...prevState, [index]: !prevState[index] }

            return newState
        })

        setSelectedItems(prevItems => {
            let newItems
            if (prevItems?.some(i => i?.BoughtOutPartId === item?.BoughtOutPartId)) {
                newItems = prevItems?.filter(i => i?.BoughtOutPartId !== item?.BoughtOutPartId)
            } else {
                newItems = [...prevItems, item]
            }
            return newItems
        })

        setSelectedIndices(prevIndices => {
            let newIndices
            if (prevIndices?.includes(index)) {
                newIndices = prevIndices?.filter(i => i !== index)
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


   
   
    return (
        <div>
            {showCheckbox && !props?.compare && < WarningMessage dClass={"float-right justify-content-end"} message={'Click the checkbox to approve, reject, or return the quotation'} />}
            <Table headerData={mainHeadingData} 
            sectionData={sectionData}
             uniqueShouldCostingId={props?.uniqueShouldCostingId}
                showConvertedCurrency={showConvertedCurrency}
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
                    rmBasicRate={selectedItem?.BasicRate}
                    ViewMode={true}
                    rmTableData={selectedItem?.BoughtOutPartOtherCostDetailsSchema}
                    RowData={selectedItem}
                    plantCurrency={selectedItem?.Currency}
                    settlementCurrency={selectedItem?.Currency}
                    isImpactedMaster={true}
                    disabled={true}
                    isBOP={true}


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
