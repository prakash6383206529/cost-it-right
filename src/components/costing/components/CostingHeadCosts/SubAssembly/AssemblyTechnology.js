import React, { useContext, useEffect, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NetPOPriceContext, costingInfoContext } from '../../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, getConfigurationKey, loggedInUserId, showBopLabel, } from '../../../../../helper';
import AddAssemblyOperation from '../../Drawers/AddAssemblyOperation';
import { IsPartType, ViewCostingContext } from '../../CostingDetails';
import EditPartCost from './EditPartCost';
import AddAssemblyProcess from '../../Drawers/AddAssemblyProcess';
import { setSubAssemblyTechnologyArray, updateMultiTechnologyTopAndWorkingRowCalculation } from '../../../actions/SubAssembly';
import BoughtOutPart from '../BOP';
import AddBOPHandling from '../../Drawers/AddBOPHandling';
import { findSurfaceTreatmentData, formatMultiTechnologyUpdate } from '../../../CostingUtil';
import { getRMCCTabData, gridDataAdded, openCloseStatus, saveAssemblyCostingRMCCTab, saveCostingLabourDetails, setBopRemark } from '../../../actions/Costing';
import { EMPTY_GUID, WACTypeId } from '../../../../../config/constants';
import _ from 'lodash';
import AddLabourCost from '../AdditionalOtherCost/AddLabourCost';
import Toaster from '../../../../common/Toaster';
import { PART_TYPE_ASSEMBLY, REMARKMAXLENGTH } from '../../../../../config/masterData';
import PopupMsgWrapper from '../../../../common/PopupMsgWrapper';

function AssemblyTechnology(props) {
    const { children, item, index } = props;

    const [IsOpen, setIsOpen] = useState(false);
    const [Count, setCount] = useState(0);
    const [partCostDrawer, setPartCostDrawer] = useState(false);
    const [isOperationDrawerOpen, setIsOperationDrawerOpen] = useState(false)
    const [isProcessDrawerOpen, setIsProcessDrawerOpen] = useState(false)
    const [tabAssemblyIndividualPartDetail, setTabAssemblyIndividualPartDetail] = useState({})
    const [isOpenBOPDrawer, setIsOpenBOPDrawer] = useState(false)
    const [isBOPExists, setIsBOPExists] = useState(false)
    const [isOpenLabourDrawer, setIsOpenLabourDrawer] = useState(false)
    const [labourTableData, setLabourTableData] = useState([])
    const [labourObj, setLabourObj] = useState(false)
    const [callSaveAssemblyApi, setCallSaveAssemblyApi] = useState(false)
    const [remarkAccept, setRemarkAccept] = useState(false);
    const [activeRemark, setActiveRemark] = useState(null)

    const [remark, setRemark] = useState("");
    const netPOPrice = useContext(NetPOPriceContext);

    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const { CostingEffectiveDate } = useSelector(state => state.costing)
    const dispatch = useDispatch()
    const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
    const { ToolTabData, SurfaceTabData, DiscountCostData, PackageAndFreightTabData, RMCCTabData, currencySource, exchangeRateData,remark: reduxRemark, bopCostingId: reduxBopCostingId } = useSelector(state => state.costing)
    const OverheadProfitTabData = useSelector(state => state.costing.OverheadProfitTabData)
    const isPartType = useContext(IsPartType);

    const toggle = (BOMLevel, PartNumber, PartType) => {
        if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
        dispatch(openCloseStatus({ RMC: !IsOpen, bopHandling: isBOPExists && !IsOpen, }))
        if (PartType === 'Assembly') {
            // WHEN TOGGLE BUTTON IS PRESSED AT THAT TIME VALUES SHOULD BE CALCULATED UNTIL THEN VALUES SHOULD BE 0
            setIsOpen(!IsOpen)
            setCount(Count + 1)

            if (Object.keys(costData).length > 0) {
                const data = {
                    CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
                    PartId: item.PartId,
                    AssemCostingId: item.AssemblyCostingId,
                    subAsmCostingId: props.subAssembId !== null ? props.subAssembId : EMPTY_GUID,
                    EffectiveDate: CostingEffectiveDate
                }

                dispatch(getRMCCTabData(data, false, (res) => {
                    if (res && res.data && res.data.Result && CostingViewMode === false) {
                        let Data = res.data.DataList;
                        let tempsubAssemblyTechnologyArray = Data
                        let costPerPieceTotal = 0
                        let CostPerAssemblyBOPTotal = 0



                        tempsubAssemblyTechnologyArray[0].CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
                            costPerPieceTotal = checkForNull(costPerPieceTotal) + checkForNull(item?.CostingPartDetails?.NetChildPartsCostWithQuantity)
                            CostPerAssemblyBOPTotal = checkForNull(CostPerAssemblyBOPTotal) + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity)
                            return null
                        })
                        // tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.CostPerAssemblyBOP =
                        //     checkForNull(CostPerAssemblyBOPTotal) +
                        //     checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.BOPHandlingCharges)

                        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetBoughtOutPartCost =
                            checkForNull(CostPerAssemblyBOPTotal) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.BOPHandlingCharges)

                        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetPOPrice =
                            checkForNull(costPerPieceTotal) +
                            checkForNull(CostPerAssemblyBOPTotal) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost)


                        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetTotalRMBOPCC =
                            checkForNull(costPerPieceTotal) +
                            checkForNull(CostPerAssemblyBOPTotal) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetLabourCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.IndirectLaborCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.StaffCost)

                        tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalLabourCost =
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetLabourCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.IndirectLaborCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.StaffCost)

                        dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))
                    }
                }))
            } else {
                props.toggleAssembly(BOMLevel, PartNumber)
            }
        }
    }

    /**
    * @method OperationDrawerToggle
    * @description TOGGLE DRAWER
    */
    const OperationDrawerToggle = () => {
        if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
        setIsOperationDrawerOpen(true)
    }

    /**
     * @method closeOperationDrawer
     * @description HIDE RM DRAWER
     */
    const closeOperationDrawer = (e = '', rowData = {}) => {
        setIsOperationDrawerOpen(false)
    }

    /**
    * @method ProcessDrawerToggle
    * @description TOGGLE DRAWER
    */
    const ProcessDrawerToggle = () => {
        if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
        setIsProcessDrawerOpen(true)
    }

    /**
     * @method closeProcessDrawer
     * @description HIDE RM DRAWER
     */
    const closeProcessDrawer = (e = '', rowData = {}) => {
        setIsProcessDrawerOpen(false)
    }

    const closeDrawerPartCost = (e = '') => {
        setPartCostDrawer(false)
    }

    useEffect(() => {
        let final = _.map(subAssemblyTechnologyArray && subAssemblyTechnologyArray[0]?.CostingChildPartDetails, 'PartType')
        setIsBOPExists(final.includes('BOP'))
        return () => {
            setLabourTableData([])
        }
    }, [subAssemblyTechnologyArray])

    const nestedAssembly = children && children.map(el => {
        // SAME COMPONENT WILL RENDER PART AND ASSEMBLY
        if (el.PartType === 'Sub Assembly' || el.PartType === 'Part') {
            return <AssemblyTechnology
                index={index}
                item={el}
                children={el.CostingChildPartDetails}
                toggleAssembly={props.toggleAssembly}
            />
        } else {
            return false
        }
    })
    const popupInputData = (data) => {
        setRemark(data);
    };
    const openRemarkPopup = (bopItem) => {
        
        // Reset states to prevent data leakage between different BOPs
        setRemark("");
        setRemarkAccept(false);
        setActiveRemark(null);
        const costingArray = JSON.parse(sessionStorage.getItem('costingArray')) || [];
        const bopObject = costingArray.find(item => item?.AssemblyPartNumber === bopItem?.AssemblyPartNumber && item?.PartNumber === bopItem?.PartNumber && item?.PartType === 'BOP');
        const bopCostingId = bopItem?.CostingId || "00000000-0000-0000-0000-000000000000";
        // Store both part number and assembly part number to identify this BOP uniquely
        setActiveRemark({ partNumber: bopItem?.PartNumber, assemblyPartNumber: bopItem?.AssemblyPartNumber });
        const storedRemark = bopObject?.Remark || '';
        setRemark(storedRemark);

        // Open the popup
        setRemarkAccept(true);
    }

    /**
     * @method closePopUp
     * @description Close the remark popup
     */
    const closePopUp = () => {
        setRemarkAccept(false);
        setActiveRemark(null);
        setRemark("");
    }
    /**
 * @method handleRemarkPopupConfirm
 * @description Handle remark popup confirm and save remark to session storage
 */
    const handleRemarkPopupConfirm = () => {
        if (!activeRemark?.partNumber || !activeRemark?.assemblyPartNumber) {
            closePopUp();
            return;
        }
        
        // Get and update subAssemblyTechnologyArray
        if (subAssemblyTechnologyArray?.[0]?.CostingChildPartDetails?.length > 0) {
            const tempArray = JSON.parse(JSON.stringify(subAssemblyTechnologyArray));
            
            // Find and update target BOP object
            const childPart = tempArray[0].CostingChildPartDetails.find(part => 
                part.PartType === 'BOP' && 
                part.PartNumber === activeRemark?.partNumber && 
                part.AssemblyPartNumber === activeRemark?.assemblyPartNumber
            );
            
            if (childPart) {
                childPart.Remark = remark;
                dispatch(setSubAssemblyTechnologyArray(tempArray, () => {}));
            }
        }
        
        // Update session storage
        const costingArray = JSON.parse(sessionStorage.getItem('costingArray')) || [];
        const bopIndex = costingArray.findIndex(item =>
            item.AssemblyPartNumber === activeRemark?.assemblyPartNumber && 
            item.PartNumber === activeRemark?.partNumber && 
            item.PartType === 'BOP'
        );
        
        if (bopIndex !== -1) {
            costingArray[bopIndex].Remark = remark;
        } else {
            costingArray.push({
                PartNumber: activeRemark?.partNumber,
                AssemblyPartNumber: activeRemark?.assemblyPartNumber,
                PartType: 'BOP',
                Remark: remark
            });
        }
        sessionStorage.setItem('costingArray', JSON.stringify(costingArray));
        
        // Find BOP item and update Redux for API
        const bopItem = children?.find(child => 
            child.PartType === 'BOP' && 
            child.PartNumber === activeRemark?.partNumber && 
            child.AssemblyPartNumber === activeRemark?.assemblyPartNumber
        );
        
        if (bopItem) {
            dispatch(setBopRemark(remark, bopItem?.CostingId || "00000000-0000-0000-0000-000000000000"));
        }
        
        setCallSaveAssemblyApi(true);
        Toaster.success('Remark saved successfully');
        closePopUp();
    }
 const nestedBOP = children && children.map((el, idx) => {
        if (el.PartType !== 'BOP') return false;

        // Check if this is the active BOP for remarks
        const isActive = remarkAccept && activeRemark?.partNumber === el?.PartNumber && activeRemark?.assemblyPartNumber === el?.AssemblyPartNumber;

        // Create the remark button that will be passed to the BoughtOutPart component
        const remarkButton = isActive && (
            <PopupMsgWrapper
                setInputData={popupInputData}
                isOpen={remarkAccept}
                closePopUp={closePopUp}
                confirmPopup={handleRemarkPopupConfirm}
                header={"Remark"}
                isInputField={true}
                isDisabled={CostingViewMode}
                defaultValue={remark}
                maxLength={REMARKMAXLENGTH}
                
            />
        );

        // Get the remark specific to this BOP item from session storage
        const costingArray = JSON.parse(sessionStorage.getItem('costingArray')) || [];
        const bopObject = costingArray.find(item => item.AssemblyPartNumber === el?.AssemblyPartNumber && item?.PartNumber === el?.PartNumber && item?.PartType === 'BOP');

        const specificRemark = bopObject?.Remark || el?.Remark || '';

        return <BoughtOutPart
            index={index}
            item={el}
            children={el.CostingChildPartDetails}
            editBop={true}
            remarkButton={remarkButton}
            onRemarkButtonClick={() => openRemarkPopup(el)}
            remark={isActive ? remark : specificRemark}
        />
    })

    /**
      * @method editItemDetails
      * @description edit material type
    */
    const viewOrEditItemDetails = (item) => {
        setTabAssemblyIndividualPartDetail(item)
        setPartCostDrawer(true)
    }

    const handleBOPCalculationAndClose = (e = '') => {
        setIsOpenBOPDrawer(false)
    }

    const setBOPCostWithAsssembly = (obj, item) => {
        const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
        const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
        const toolTabData = ToolTabData && ToolTabData[0]
        const overHeadAndProfitTabData = OverheadProfitTabData && OverheadProfitTabData[0]

        let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
        let CostPerAssemblyBOPTotal = 0
        tempsubAssemblyTechnologyArray[0].CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
            CostPerAssemblyBOPTotal = checkForNull(CostPerAssemblyBOPTotal) + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity)
            return null
        })

        let totalBOPCost = checkForNull(CostPerAssemblyBOPTotal) + checkForNull(obj?.BOPHandlingCharges)
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetBoughtOutPartCost = checkForNull(totalBOPCost)
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.BOPHandlingCharges = checkForNull(obj?.BOPHandlingCharges)
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.BOPHandlingPercentage = checkForNull(obj?.BOPHandlingPercentage)
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.BOPHandlingChargeType = obj?.BOPHandlingChargeType
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.IsApplyBOPHandlingCharges = obj.IsApplyBOPHandlingCharges

        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetPOPrice =
            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetChildPartsCost) +
            checkForNull(totalBOPCost) +
            (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost) +
                checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost))
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetTotalRMBOPCC =
            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetChildPartsCost) +
            checkForNull(totalBOPCost) +
            (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost) +
                checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost)) +
            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetLabourCost) +
            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.IndirectLaborCost) +
            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.StaffCost)

        dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))

        let totalCost = (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
            checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
            checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) +
            checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost) +
            checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) +
            checkForNull(DiscountCostData?.AnyOtherCost) + checkForNull(DiscountCostData?.totalConditionCost)) +
            (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) -
            checkForNull(DiscountCostData?.HundiOrDiscountValue)


        let request = formatMultiTechnologyUpdate(tempsubAssemblyTechnologyArray[0], totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate, initialConfiguration?.IsAddPaymentTermInNetCost)
        dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))
        dispatch(gridDataAdded(true))
    }


    const labourHandlingDrawer = () => {
        if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
        setIsOpenLabourDrawer(true)
    }

    const closeLabourDrawer = (type, data = labourTableData) => {
        setIsOpenLabourDrawer(false)
        if (type === 'save') {
            setCallSaveAssemblyApi(true)
            let sum = data.reduce((acc, obj) => Number(acc) + Number(obj.LabourCost), 0);
            let obj = {}
            obj.CostingId = item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000"
            obj.LoggedInUserId = loggedInUserId()
            obj.IndirectLaborCost = data.length > 0 ? data[0].indirectLabourCost : 0
            obj.StaffCost = data.length > 0 ? data[0].staffCost : 0
            obj.StaffCostPercentage = data.length > 0 ? data[0].staffCostPercent : 0
            obj.IndirectLaborCostPercentage = data.length > 0 ? data[0].indirectLabourCostPercent : 0
            obj.NetLabourCost = sum
            obj.CostingLabourDetailList = data
            obj.NetLabourCRMHead = data.length > 0 ? data[0].NetLabourCRMHead : 0
            obj.IndirectLabourCRMHead = data.length > 0 ? data[0].IndirectLabourCRMHead : 0
            obj.StaffCRMHead = data.length > 0 ? data[0].StaffCRMHead : 0
            props.setAssemblyLabourCost(obj)
            dispatch(saveCostingLabourDetails(obj, (res) => {
                if (res) {
                    Toaster.success('Labour details saved successfully.')
                }
            }))
        }
    }

    useEffect(() => {
        if (subAssemblyTechnologyArray && callSaveAssemblyApi) {
            const surfaceTabData = SurfaceTabData && SurfaceTabData[0]
            const overHeadAndProfitTabData = OverheadProfitTabData[0]
            const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
            const toolTabData = ToolTabData && ToolTabData[0]
            let stCostingData = findSurfaceTreatmentData(item)
            let basicRate = 0
            if (Number(isPartType?.value) === PART_TYPE_ASSEMBLY) {
                basicRate = checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetTotalRMBOPCC) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
                    checkForNull(SurfaceTabData[0]?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
                    checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
            } else {
                basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
                    checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
                    checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
            }

            let requestData = {
                "CostingId": item.CostingId,
                "SubAssemblyCostingId": item.SubAssemblyCostingId,
                "NetRawMaterialsCost": item?.CostingPartDetails?.NetRawMaterialsCost,
                "NetBoughtOutPartCost": item?.CostingPartDetails?.NetBoughtOutPartCost,
                "NetConversionCost": item?.CostingPartDetails?.NetConversionCost,
                "NetProcessCost": item?.CostingPartDetails?.NetProcessCost,
                "NetOperationCost": item?.CostingPartDetails?.NetOperationCost,
                "NetOtherOperationCost": item?.CostingPartDetails?.NetOtherOperationCost,
                "NetTotalRMBOPCC": item?.CostingPartDetails?.NetTotalRMBOPCC,
                "NetPOPrice": stCostingData && Object.keys.length > 0 ? checkForNull(item?.CostingPartDetails?.NetTotalRMBOPCC) + checkForNull(stCostingData?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) : item?.CostingPartDetails?.NetTotalRMBOPCC,
                "LoggedInUserId": loggedInUserId(),
                "NetLabourCost": item.NetLabourCost,
                "IndirectLaborCost": item.IndirectLaborCost,
                "StaffCost": item.StaffCost,
                "StaffCostPercentage": item.StaffCostPercentage,
                "IndirectLaborCostPercentage": item.IndirectLaborCostPercentage,
                "StaffCRMHead": item?.CostingPartDetails?.StaffCRMHead,
                "NetLabourCRMHead": item?.CostingPartDetails?.NetLabourCRMHead,
                "IndirectLabourCRMHead": item?.CostingPartDetails?.IndirectLabourCRMHead,
                "BasicRate": basicRate,
                "CalculatorType": item?.CostingPartDetails?.CalculatorType ?? '',
                "NetProcessCostForOverhead": checkForNull(item?.CostingPartDetails?.NetProcessCostForOverhead),
                "NetProcessCostForProfit": checkForNull(item?.CostingPartDetails?.NetProcessCostForProfit),
                "NetOperationCostForOverhead": checkForNull(item?.CostingPartDetails?.NetOperationCostForOverhead),
                "NetOperationCostForProfit": checkForNull(item?.CostingPartDetails?.NetOperationCostForProfit),
                "NetWeldingCostForOverhead":checkForNull(item?.CostingPartDetails?.NetWeldingCostForOverhead),
                "NetWeldingCostProfit":checkForNull(item?.CostingPartDetails?.NetWeldingCostProfit),
                "CostingPartDetails": {
                    "AssemblyCostingOperationCostRequest": item.CostingPartDetails.CostingOperationCostResponse,
                    "AssemblyCostingProcessCostRequest": item?.CostingPartDetails?.CostingProcessCostResponse ? item?.CostingPartDetails?.CostingProcessCostResponse : [],

                }
            }

            let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
            let totalCost = (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
                checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
                checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) +
                checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost) +
                checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) +
                checkForNull(DiscountCostData?.AnyOtherCost) + checkForNull(DiscountCostData?.totalConditionCost)) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) -
                checkForNull(DiscountCostData?.HundiOrDiscountValue)

            item.NetOperationCost = item?.CostingPartDetails?.NetOperationCost
            let request = formatMultiTechnologyUpdate(item, totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate, initialConfiguration?.IsAddPaymentTermInNetCost,reduxRemark,reduxBopCostingId)

            dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => {
            }))

            dispatch(saveAssemblyCostingRMCCTab(requestData, res => {
            }))
            setCallSaveAssemblyApi(false)
        }

    }, [subAssemblyTechnologyArray,callSaveAssemblyApi])


    /**
    * @method render
    * @description Renders the component
    */
    return (
        <>
            <tr className={`${item?.PartType === 'Sub Assembly' ? 'costing-highlight-row' : ''}`}>
                <div style={{ display: 'contents' }}>
                    <td>
                        <span onClick={() => toggle(item?.BOMLevel, item?.PartNumber, item?.PartType)} className={`${item && item?.PartType === "Assembly" && "part-name"} ${item && item?.PartType !== "Sub Assembly" && item?.PartType !== "Assembly" && "L1"} ${item && item?.PartType === "Sub Assembly" && 'L1'}`}>
                            <div className={`${IsOpen ? 'Open' : 'Close'}`}></div>{item && item?.PartNumber}
                        </span>
                    </td>
                    <td>{item && item?.PartName}</td>
                    <td>{item && item?.BOMLevel}</td>
                    <td>{item && item?.PartType}</td>
                    <td>{item?.Technology ? item?.Technology : '-'}</td>
                    <td>{item?.CostingPartDetails?.Quantity ? checkForDecimalAndNull(item?.CostingPartDetails?.Quantity, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                    <td>{item?.PartType === 'Assembly' ? checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetChildPartsCost, initialConfiguration?.NoOfDecimalForPrice) : checkForDecimalAndNull(item?.CostingPartDetails?.NetPOPrice, initialConfiguration?.NoOfDecimalForPrice)}</td>

                    {/* <td>{item?.PartType === 'Assembly' && subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost ? subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost : '-'}</td>
                    <td>{item?.PartType === 'Assembly' && subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost ? subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost : '-'}</td> */}
                    <td>{item?.PartType === 'Assembly' && subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetBoughtOutPartCost ? checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetBoughtOutPartCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>

                    <td>
                        {item?.PartType === 'Assembly' ? (item?.CostingPartDetails?.NetTotalRMBOPCC ? checkForDecimalAndNull(item?.CostingPartDetails?.NetTotalRMBOPCC, initialConfiguration?.NoOfDecimalForPrice) : '-') :
                            (item?.CostingPartDetails?.NetChildPartsCostWithQuantity ? checkForDecimalAndNull(item?.CostingPartDetails?.NetChildPartsCostWithQuantity, initialConfiguration?.NoOfDecimalForPrice) : '-')}

                        {(item?.PartType === 'Assembly' && (subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetChildPartsCost ||
                            subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost ||
                            subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost || subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetBoughtOutPartCost)) ?

                            <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                                <span class="tooltiptext">
                                    {`Operation Cost/Assembly:  ${subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost ? checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost, initialConfiguration?.NoOfDecimalForPrice) : '0'}`}
                                    <br></br>
                                    {`Process Cost/Assembly:  ${subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost ? checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost, initialConfiguration?.NoOfDecimalForPrice) : '0'}`}
                                    <br></br>
                                    { }
                                    {(initialConfiguration?.IsShowCostingLabour) && `Labour Cost/Assembly:  ${checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetLabourCost, initialConfiguration?.NoOfDecimalForPrice)}`}
                                    {(initialConfiguration?.IsShowCostingLabour) && <br></br>}
                                    {(initialConfiguration?.IsShowCostingLabour) && `Indirect Labour Cost/Assembly:  ${checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.IndirectLaborCost, initialConfiguration?.NoOfDecimalForPrice)}`}
                                    {(initialConfiguration?.IsShowCostingLabour) && <br></br>}
                                    {(initialConfiguration?.IsShowCostingLabour) && `Staff Cost/Assembly:  ${checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.StaffCost, initialConfiguration?.NoOfDecimalForPrice)}`}
                                    {(initialConfiguration?.IsShowCostingLabour) && <br></br>}
                                    {`Total Child's Part Cost:  ${checkForDecimalAndNull((subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetChildPartsCost + subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetBoughtOutPartCost), initialConfiguration?.NoOfDecimalForPrice)}`}

                                </span >
                            </div > : ''
                        }
                    </td >
                </div >
                {item?.PartType !== 'Assembly'/*  && item?.PartType !== 'BOP' */ && <td className='text-right'>
                    <button
                        type="button"
                        className={'Edit mr-2 align-middle'}
                        onClick={() => viewOrEditItemDetails(item)}>
                    </button>
                </td>}

                {
                    item?.CostingPartDetails?.PartType === 'Assembly' ? <td>
                        <div className='assembly-button-container'>
                            {(initialConfiguration?.IsShowCostingLabour) && <><button
                                type="button"
                                className={'user-btn add-oprn-btn mr-1'}
                                onClick={labourHandlingDrawer}>
                                <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`LABOUR`}</button >
                            </>}

                            {
                                isBOPExists && IsOpen && <>
                                    <button
                                        type="button"
                                        id="Add_BOP_Handling_Charge"
                                        className={'user-btn add-oprn-btn'}
                                        title={`Add ${showBopLabel()} Handling`}
                                        onClick={() => { setIsOpenBOPDrawer(true) }}
                                    >
                                        <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`${showBopLabel()} H`}</button>
                                </>
                            }
                            <button
                                type="button"
                                id="Add_Assembly_Process"
                                className={'user-btn '}
                                onClick={ProcessDrawerToggle}
                                title={'Add Process'}
                            >
                                <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`PROC`}
                            </button>

                            <button
                                id="Costing_addOperation"
                                type="button"
                                className={'user-btn'}
                                onClick={OperationDrawerToggle}
                                title={"Add Operation"}
                            >
                                <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`OPER`}
                            </button>
                        </div >
                    </td > :
                        ''
                }

            </tr >

            {IsOpen && nestedBOP}

            {IsOpen && nestedAssembly}

            {
                isOpenBOPDrawer &&
                <AddBOPHandling
                    isOpen={isOpenBOPDrawer}
                    closeDrawer={handleBOPCalculationAndClose}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                    isAssemblyTechnology={true}
                    setBOPCostWithAsssembly={setBOPCostWithAsssembly}
                />
            }

            {
                isOperationDrawerOpen && <AddAssemblyOperation
                    isOpen={isOperationDrawerOpen}
                    closeDrawer={closeOperationDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                    item={item}
                    CostingViewMode={CostingViewMode}
                    setOperationCostFunction={props.setOperationCostFunction}
                    isAssemblyTechnology={true}
                />
            }
            {
                isProcessDrawerOpen && (
                    <AddAssemblyProcess
                        isOpen={isProcessDrawerOpen}
                        closeDrawer={closeProcessDrawer}
                        isEditFlag={false}
                        ID={''}
                        anchor={'right'}
                        // ccData={subAssemblyTechnologyArray[0]?.CostingPartDetails !== null && subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostingProcessCostResponse}
                        item={item}
                        isAssemblyTechnology={true}
                    />
                )
            }
            {
                partCostDrawer && <EditPartCost
                    isOpen={partCostDrawer}
                    closeDrawer={closeDrawerPartCost}
                    anchor={'bottom'}
                    tabAssemblyIndividualPartDetail={tabAssemblyIndividualPartDetail}
                    costingSummary={false}
                    isBopEdit={false}
                />
            }

            {
                isOpenLabourDrawer && <AddLabourCost
                    isOpen={isOpenLabourDrawer}
                    tableData={labourTableData}
                    labourObj={labourObj}
                    item={item}
                    closeDrawer={closeLabourDrawer}
                    anchor={'right'}
                />
            }

        </ >
    );
}

export default AssemblyTechnology;
