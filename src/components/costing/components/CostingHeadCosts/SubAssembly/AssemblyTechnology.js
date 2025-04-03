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
import { getRMCCTabData, gridDataAdded, openCloseStatus, saveAssemblyCostingRMCCTab, saveCostingLabourDetails } from '../../../actions/Costing';
import { EMPTY_GUID, WACTypeId } from '../../../../../config/constants';
import _ from 'lodash';
import AddLabourCost from '../AdditionalOtherCost/AddLabourCost';
import Toaster from '../../../../common/Toaster';
import { PART_TYPE_ASSEMBLY } from '../../../../../config/masterData';

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
    const netPOPrice = useContext(NetPOPriceContext);

    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const { CostingEffectiveDate } = useSelector(state => state.costing)
    const dispatch = useDispatch()
    const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
    const { ToolTabData, SurfaceTabData, DiscountCostData, PackageAndFreightTabData, RMCCTabData, currencySource, exchangeRateData } = useSelector(state => state.costing)
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
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetBoughtOutPartCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost)


                        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetTotalRMBOPCC =
                            checkForNull(costPerPieceTotal) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetBoughtOutPartCost) +
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

    const nestedBOP = children && children.map(el => {
        if (el.PartType !== 'BOP') return false;
        return <BoughtOutPart
            index={index}
            item={el}
            children={el.CostingChildPartDetails}
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
                checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost))

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
                basicRate = checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
                    checkForNull(SurfaceTabData[0]?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
                    checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
            } else {
                basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
                    checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
                    checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
            }

            let requestData = {
                "CostingId": item.CostingId,
                "CostingNumber": item.CostingNumber,
                "CostingDetailId": "00000000-0000-0000-0000-000000000000",
                "PartId": item.PartId,
                "PartNumber": item.PartNumber,
                "PartTypeId": item.PartTypeId,
                "Type": item.PartType,
                "SubAssemblyCostingId": item.SubAssemblyCostingId,
                "PlantId": costData.PlantId,
                "VendorId": costData.VendorId,
                "VendorCode": costData.VendorCode,
                "VendorPlantId": costData.VendorPlantId,
                "TechnologyName": item.Technology,
                "TechnologyId": item.TechnologyId,
                "TypeOfCosting": costData.VendorType,
                "PlantCode": costData.PlantCode,
                "PlantName": costData.PlantName,
                "Version": item.Version,
                "ShareOfBusinessPercent": item.ShareOfBusinessPercent,
                "NetRawMaterialsCost": item?.CostingPartDetails?.NetRawMaterialsCost,
                "NetBoughtOutPartCost": item?.CostingPartDetails?.NetBoughtOutPartCost,
                "NetConversionCost": item?.CostingPartDetails?.NetConversionCost,
                "NetProcessCost": item?.CostingPartDetails?.NetProcessCost,
                "NetOperationCost": item?.CostingPartDetails?.NetOperationCost,
                "NetTotalRMBOPCC": item?.CostingPartDetails?.NetTotalRMBOPCC,
                "TotalCost": stCostingData && Object.keys.length > 0 ? checkForNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(stCostingData?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) : item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
                "LoggedInUserId": loggedInUserId(),
                "EffectiveDate": CostingEffectiveDate,
                "IsSubAssemblyComponentPart": costData.IsAssemblyPart,
                "NetOperationCostPerAssembly": item?.CostingPartDetails?.TotalOperationCostPerAssembly,
                "NetToolCostPerAssembly": item?.CostingPartDetails?.TotalToolCostPerAssembly,
                "NetLabourCost": item.NetLabourCost,
                "IndirectLaborCost": item.IndirectLaborCost,
                "StaffCost": item.StaffCost,
                "StaffCostPercentage": item.StaffCostPercentage,
                "IndirectLaborCostPercentage": item.IndirectLaborCostPercentage,
                "StaffCRMHead": item?.CostingPartDetails?.StaffCRMHead,
                "NetLabourCRMHead": item?.CostingPartDetails?.NetLabourCRMHead,
                "IndirectLabourCRMHead": item?.CostingPartDetails?.IndirectLabourCRMHead,
                "BasicRate": basicRate,
                "CostingPartDetails": {
                    "CostingId": item.CostingId,
                    "CostingNumber": item.CostingNumber,
                    "CostingDetailId": "00000000-0000-0000-0000-000000000000",
                    "PartId": item.PartId,
                    "PartNumber": item.PartNumber,
                    "PartName": item.PartName,
                    "PartTypeId": item.PartTypeId,
                    "Type": item.PartType,
                    "NetRawMaterialsCost": item?.CostingPartDetails?.NetRawMaterialsCost,
                    "NetBoughtOutPartCost": item?.CostingPartDetails?.NetBoughtOutPartCost,
                    "NetConversionCost": item?.CostingPartDetails?.NetConversionCost,
                    "NetTotalRMBOPCC": item?.CostingPartDetails?.NetTotalRMBOPCC,
                    "TotalRawMaterialsCostWithQuantity": item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
                    "TotalBoughtOutPartCostWithQuantity": item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
                    "TotalConversionCostWithQuantity": item?.CostingPartDetails?.TotalConversionCostWithQuantity,
                    "TotalCalculatedRMBOPCCCostWithQuantity": item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
                    "Quantity": item?.CostingPartDetails?.Quantity,
                    "IsOpen": true,
                    "TotalOperationCostPerAssembly": item?.CostingPartDetails?.TotalOperationCostPerAssembly,
                    "TotalToolCostPerAssembly": item?.CostingPartDetails?.TotalToolCostPerAssembly,
                    "AssemblyCostingOperationCostRequest": item.CostingPartDetails.CostingOperationCostResponse,
                    "AssemblyCostingToolsCostRequest": item?.CostingPartDetails?.CostingToolCostResponse ? item?.CostingPartDetails?.CostingToolCostResponse : [],
                    "AssemblyCostingProcessCostResponse": item?.CostingPartDetails?.CostingProcessCostResponse ? item?.CostingPartDetails?.CostingProcessCostResponse : [],
                    "NetOperationCost": item?.CostingPartDetails?.NetOperationCost,
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
            let request = formatMultiTechnologyUpdate(item, totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate, initialConfiguration?.IsAddPaymentTermInNetCost)
            dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => {
            }))

            dispatch(saveAssemblyCostingRMCCTab(requestData, res => {
            }))
            setCallSaveAssemblyApi(false)
        }

    }, [subAssemblyTechnologyArray])


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
                            subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost)) ?

                            <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                                <span class="tooltiptext">
                                    {`Operation Cost/Assembly:  ${subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost ? checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetOperationCost, initialConfiguration?.NoOfDecimalForPrice) : '0'}`}
                                    <br></br>
                                    {`Process Cost/Assembly:  ${subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost ? checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetProcessCost, initialConfiguration?.NoOfDecimalForPrice) : '0'}`}
                                    <br></br>
                                    { }
                                    {(initialConfiguration?.IsShowCostingLabour) && (costData.CostingTypeId === WACTypeId) && `Labour Cost/Assembly:  ${checkForDecimalAndNull(checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.StaffCost) + checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.IndirectLaborCost) + checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetLabourCost), initialConfiguration?.NoOfDecimalForPrice)}`}
                                    {(initialConfiguration?.IsShowCostingLabour) && (costData.CostingTypeId === WACTypeId) && <br></br>}
                                    {`Total Child's Part Cost:  ${checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetChildPartsCost, initialConfiguration?.NoOfDecimalForPrice)}`}

                                </span >
                            </div > : ''
                        }
                    </td >
                </div >
                {item?.PartType !== 'Assembly' && item?.PartType !== 'BOP' && <td className='text-right'>
                    <button
                        type="button"
                        className={'Edit mr-2 align-middle'}
                        onClick={() => viewOrEditItemDetails(item)}>
                    </button>
                </td>}

                {
                    item?.CostingPartDetails?.PartType === 'Assembly' ? <td>
                        <div className='assembly-button-container'>
                            {(initialConfiguration?.IsShowCostingLabour) && (costData.CostingTypeId === WACTypeId) && <><button
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