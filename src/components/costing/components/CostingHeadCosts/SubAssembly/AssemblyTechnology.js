import React, { useContext, useEffect, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, } from '../../../../../helper';
import AddAssemblyOperation from '../../Drawers/AddAssemblyOperation';
import { ViewCostingContext } from '../../CostingDetails';
import EditPartCost from './EditPartCost';
import AddAssemblyProcess from '../../Drawers/AddAssemblyProcess';
import { setSubAssemblyTechnologyArray, updateMultiTechnologyTopAndWorkingRowCalculation } from '../../../actions/SubAssembly';
import BoughtOutPart from '../BOP';
import AddBOPHandling from '../../Drawers/AddBOPHandling';
import { formatMultiTechnologyUpdate } from '../../../CostingUtil';
import { getRMCCTabData, gridDataAdded } from '../../../actions/Costing';
import { EMPTY_GUID } from '../../../../../config/constants';
import _ from 'lodash';

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

    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const { CostingEffectiveDate } = useSelector(state => state.costing)
    const dispatch = useDispatch()
    const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
    const { ToolTabData, SurfaceTabData, DiscountCostData, PackageAndFreightTabData } = useSelector(state => state.costing)
    const OverheadProfitTabData = useSelector(state => state.costing.OverheadProfitTabData)

    const toggle = (BOMLevel, PartNumber, PartType) => {
        if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
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

                        tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalBoughtOutPartCost =
                            checkForNull(CostPerAssemblyBOPTotal) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.BOPHandlingCharges)

                        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetPOPrice =
                            checkForNull(costPerPieceTotal) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalBoughtOutPartCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost)

                        tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalCalculatedRMBOPCCCost =
                            checkForNull(costPerPieceTotal) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalBoughtOutPartCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost) +
                            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost)

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
        if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
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
        if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
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
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalBoughtOutPartCost = checkForNull(totalBOPCost)
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.BOPHandlingCharges = checkForNull(obj?.BOPHandlingCharges)
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.BOPHandlingPercentage = checkForNull(obj?.BOPHandlingPercentage)
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.BOPHandlingChargeType = obj?.BOPHandlingChargeType
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.IsApplyBOPHandlingCharges = obj.IsApplyBOPHandlingCharges

        tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetPOPrice =
            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetChildPartsCost) +
            checkForNull(totalBOPCost) +
            (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost) +
                checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost))
        tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalCalculatedRMBOPCCCost =
            checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.NetChildPartsCost) +
            checkForNull(totalBOPCost) +
            (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost) +
                checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost))

        dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))

        let totalCost = (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
            checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
            checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) +
            checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost) +
            checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.NetOverheadAndProfitCost) +
            checkForNull(DiscountCostData?.AnyOtherCost)) -
            checkForNull(DiscountCostData?.HundiOrDiscountValue)


        let request = formatMultiTechnologyUpdate(tempsubAssemblyTechnologyArray[0], totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate)
        dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))
        dispatch(gridDataAdded(true))
    }

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
                    <td>{item?.CostingPartDetails?.Quantity ? checkForDecimalAndNull(item?.CostingPartDetails?.Quantity, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                    <td>{item?.PartType === 'Assembly' ? checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetChildPartsCost, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(item?.CostingPartDetails?.NetPOPrice, initialConfiguration.NoOfDecimalForPrice)}</td>

                    {/* <td>{item?.PartType === 'Assembly' && subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost ? subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost : '-'}</td>
                    <td>{item?.PartType === 'Assembly' && subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost ? subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost : '-'}</td> */}
                    <td>{item?.PartType === 'Assembly' && subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalBoughtOutPartCost ? subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalBoughtOutPartCost : '-'}</td>

                    <td>
                        {item?.PartType === 'Assembly' ? (item?.CostingPartDetails?.TotalCalculatedRMBOPCCCost ? checkForDecimalAndNull(item?.CostingPartDetails?.TotalCalculatedRMBOPCCCost, initialConfiguration.NoOfDecimalForPrice) : '-') :
                            (item?.CostingPartDetails?.NetChildPartsCostWithQuantity ? checkForDecimalAndNull(item?.CostingPartDetails?.NetChildPartsCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : '-')}

                        {(item?.PartType === 'Assembly' && (subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetChildPartsCost ||
                            subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost ||
                            subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost)) ?

                            <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                                <span class="tooltiptext">
                                    {`Operation Cost/Assembly:  ${subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost ? checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalOperationCost, initialConfiguration.NoOfDecimalForPrice) : '0'}`}
                                    <br></br>
                                    {`Process Cost/Assembly:  ${subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost ? checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalProcessCost, initialConfiguration.NoOfDecimalForPrice) : '0'}`}
                                    <br></br>
                                    {`Total Child's Part Cost:  ${checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.NetChildPartsCost, initialConfiguration.NoOfDecimalForPrice)}`}
                                </span>
                            </div> : ''
                        }
                    </td>
                </div>
                {item?.PartType !== 'Assembly' && item?.PartType !== 'BOP' && <td className='text-right'>
                    <button
                        type="button"
                        className={'Edit mr-2 align-middle'}
                        onClick={() => viewOrEditItemDetails(item)}>
                    </button>
                </td>}

                {item?.CostingPartDetails?.PartType === 'Assembly' ? <td>
                    <div className='assembly-button-container'>
                        {isBOPExists && <>
                            <button
                                type="button"
                                className={'user-btn add-oprn-btn'}
                                title={"Add BOP Handling"}
                                onClick={() => { setIsOpenBOPDrawer(true) }}
                            >
                                <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`BOP H`}</button>
                        </>}
                        <button
                            type="button"
                            className={'user-btn '}
                            onClick={ProcessDrawerToggle}
                            title={'Add Process'}
                        >
                            <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`PROC`}
                        </button>

                        <button
                            type="button"
                            className={'user-btn'}
                            onClick={OperationDrawerToggle}
                            title={"Add Operation"}
                        >
                            <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`OPER`}
                        </button>
                    </div>
                </td> :
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
        </ >
    );
}

export default AssemblyTechnology;