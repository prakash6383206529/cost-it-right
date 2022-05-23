import React, { useContext, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, } from '../../../../../helper';
import AddAssemblyOperation from '../../Drawers/AddAssemblyOperation';
import { ViewCostingContext } from '../../CostingDetails';
import EditPartCost from './EditPartCost';
import AddAssemblyProcess from '../../Drawers/AddAssemblyProcess';
import { setSubAssemblyTechnologyArray } from '../../../actions/SubAssembly';
import BoughtOutPart from '../BOP';

function AssemblyTechnology(props) {
    const { children, item, index, getCostPerPiece } = props;

    const [IsOpen, setIsOpen] = useState(false);
    const [Count, setCount] = useState(0);
    const [partCostDrawer, setPartCostDrawer] = useState(false);
    const [isOperationDrawerOpen, setIsOperationDrawerOpen] = useState(false)
    const [isProcessDrawerOpen, setIsProcessDrawerOpen] = useState(false)
    const [tabAssemblyIndividualPartDetail, setTabAssemblyIndividualPartDetail] = useState({})

    const CostingViewMode = useContext(ViewCostingContext);
    const costData = useContext(costingInfoContext);
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const { CostingEffectiveDate } = useSelector(state => state.costing)
    const dispatch = useDispatch()
    const { subAssemblyTechnologyArray } = useSelector(state => state.SubAssembly)

    const toggle = (BOMLevel, PartNumber, PartType) => {
        if (PartType === 'Assembly') {
            // WHEN TOGGLE BUTTON IS PRESSED AT THAT TIME VALUES SHOULD BE CALCULATED UNTIL THEN VALUES SHOULD BE 0
            setIsOpen(!IsOpen)
            setCount(Count + 1)
            if (Object.keys(costData).length > 0) {
                let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
                let costPerPieceTotal = 0
                let costPerAssemblyTotal = 0
                let CostPerAssemblyBOPTotal = 0

                tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
                    costPerPieceTotal = checkForNull(costPerPieceTotal) + checkForNull(item?.CostingPartDetails?.CostPerPiece)
                    costPerAssemblyTotal = checkForNull(costPerAssemblyTotal) + checkForNull(item?.CostingPartDetails?.CostPerAssembly)
                    CostPerAssemblyBOPTotal = checkForNull(CostPerAssemblyBOPTotal) + checkForNull(item?.CostingPartDetails?.CostPerAssemblyBOP)
                    return null
                })
                tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerPiece = costPerPieceTotal
                tempsubAssemblyTechnologyArray[0].CostingPartDetails.EditPartCost = costPerAssemblyTotal
                tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssembly = checkForNull(costPerAssemblyTotal) + checkForNull(CostPerAssemblyBOPTotal) + (checkForNull(tempsubAssemblyTechnologyArray[0].processCostValue) + checkForNull(tempsubAssemblyTechnologyArray[0].operationCostValue))
                tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssemblyBOP = checkForNull(CostPerAssemblyBOPTotal)
                dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))
                props.toggleAssembly(BOMLevel, PartNumber, subAssemblyTechnologyArray)
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

    const nestedAssembly = children && children.map(el => {
        // SAME COMPONENT WILL RENDER PART AND ASSEMBLY
        if (el.PartType === 'Sub Assembly' || el.PartType === 'Part') {
            return <AssemblyTechnology
                index={index}
                item={el}
                children={el.CostingChildPartDetails}
                toggleAssembly={props.toggleAssembly}
                setAssemblyOperationCost={props.setAssemblyOperationCost}
                getCostPerPiece={getCostPerPiece}
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

    /**
    * @method render
    * @description Renders the component
    */
    return (
        <>
            <tr className={`${item.PartType === 'Sub Assembly' ? 'costing-highlight-row' : ''} accordian-row`}>
                <div style={{ display: 'contents' }} onClick={() => toggle(item.BOMLevel, item.PartNumber, item.PartType)}>
                    <td>
                        <span style={{ position: 'relative' }} className={`${item && item.PartType === "Assembly" && "cr-prt-nm1"} cr-prt-link1 ${item && item.PartType !== "Sub Assembly" && item.PartType !== "Assembly" && "L1"}`}>
                            <div className={`${IsOpen ? 'Open' : 'Close'}`}></div>{item && item.PartNumber}
                        </span>
                    </td>
                    <td>{item && item.PartName}</td>
                    <td>{item && item.BOMLevel}</td>
                    <td>{item && item.PartType}</td>
                    <td>{item?.CostingPartDetails?.TechnologyName ? item?.CostingPartDetails?.TechnologyName : 'Sheet Metal'}</td>
                    <td>{item?.CostingPartDetails?.Quantity ? checkForDecimalAndNull(item.CostingPartDetails.Quantity, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                    <td>{item?.CostingPartDetails?.CostPerPiece && item?.PartType === 'Assembly' ? '-' : checkForDecimalAndNull(item.CostingPartDetails.CostPerPiece, initialConfiguration.NoOfDecimalForPrice)}</td>

                    <td>{item?.PartType === 'Assembly' && subAssemblyTechnologyArray[0].OperationCostValue ? subAssemblyTechnologyArray[0].OperationCostValue : '-'}</td>
                    <td>{item?.PartType === 'Assembly' && subAssemblyTechnologyArray[0].ProcessCostValue ? subAssemblyTechnologyArray[0].ProcessCostValue : '-'}</td>
                    <td>{item?.PartType === 'Assembly' && subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostPerAssemblyBOP ? subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostPerAssemblyBOP : '-'}</td>

                    <td>
                        {item?.CostingPartDetails?.CostPerAssembly ? checkForDecimalAndNull(item.CostingPartDetails.CostPerAssembly, initialConfiguration.NoOfDecimalForPrice) : '-'}
                        {(item?.PartType === 'Assembly' && (item.CostingPartDetails.EditPartCost ||
                            subAssemblyTechnologyArray[0].ProcessCostValue || subAssemblyTechnologyArray[0].OperationCostValue)) &&
                            (item?.CostingPartDetails?.CostPerAssembly || item.CostingPartDetails?.CostPerAssembly) ?
                            <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                                <span class="tooltiptext">
                                    {`Total Operation's Cost:  ${subAssemblyTechnologyArray[0].operationCostValue ? checkForDecimalAndNull(subAssemblyTechnologyArray[0].operationCostValue, initialConfiguration.NoOfDecimalForPrice) : '-'}`}
                                    <br></br>
                                    {`Total Process Cost:  ${subAssemblyTechnologyArray[0].processCostValue ? checkForDecimalAndNull(subAssemblyTechnologyArray[0].processCostValue, initialConfiguration.NoOfDecimalForPrice) : '-'}`}
                                    <br></br>
                                    {/* {`Child Parts Conversion Cost:- ${checkForDecimalAndNull(item.CostingPartDetails.TotalConversionCost - item.CostingPartDetails.CostPerAssembly, initialConfiguration.NoOfDecimalForPrice)}`} */}
                                    {`Total Child's Cost:  ${checkForDecimalAndNull(item.CostingPartDetails.EditPartCost, initialConfiguration.NoOfDecimalForPrice)}`}
                                </span>
                            </div> : ''
                        }
                    </td>


                    {/* <td>{item?.CostingPartDetails?.TotalCalculatedRMBOPCCCost ? checkForDecimalAndNull(item.CostingPartDetails.TotalCalculatedRMBOPCCCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td> */}
                    {/* <td>{'-'}</td> */}
                    {/* {costData.IsAssemblyPart && <td>{item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity ? checkForDecimalAndNull(item.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : 0}</td>} */}
                    {/* {costData.IsAssemblyPart && <td>{item?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity ? checkForDecimalAndNull(item.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity, initialConfiguration.NoOfDecimalForPrice) : 0}</td>} */}
                    {/* {costData.IsAssemblyPart && <td>{checkForDecimalAndNull(checkForNull(item.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(item.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(item.CostingPartDetails.TotalConversionCostWithQuantity), initialConfiguration.NoOfDecimalForPrice) * item.CostingPartDetails.Quantity}</td>} */}

                </div>
                <td>
                    {item.PartType !== 'Assembly' && item.PartType !== 'BOP' &&
                        <button
                            type="button"
                            className={'Edit mr-2 align-middle'}
                            onClick={() => viewOrEditItemDetails(item)}>
                        </button>}
                </td>


                {item?.CostingPartDetails?.PartType === 'Assembly' ? <td>
                    <button
                        type="button"
                        className={'user-btn '}
                        onClick={ProcessDrawerToggle}
                    >
                        <div className={'plus'}></div>PROCESS
                    </button>

                    <button
                        type="button"
                        className={'user-btn mr5'}
                        onClick={OperationDrawerToggle}
                    >
                        <div className={'plus'}></div>OPERATION
                    </button>
                </td> :
                    <td></td>
                }

            </tr >

            {IsOpen && nestedBOP}

            {IsOpen && nestedAssembly}

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
                    setAssemblyOperationCost={props.setAssemblyOperationCost}
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
                        ccData={subAssemblyTechnologyArray[0].CostingPartDetails !== null && subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostingConversionCost}
                    />
                )
            }
            {
                partCostDrawer && <EditPartCost
                    isOpen={partCostDrawer}
                    closeDrawer={closeDrawerPartCost}
                    anchor={'bottom'}
                    tabAssemblyIndividualPartDetail={tabAssemblyIndividualPartDetail}
                    getCostPerPiece={getCostPerPiece}
                />
            }
        </ >
    );
}

export default AssemblyTechnology;