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
    const { children, item, index } = props;

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
    const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)

    const toggle = (BOMLevel, PartNumber, PartType) => {
        if (PartType === 'Assembly') {
            // WHEN TOGGLE BUTTON IS PRESSED AT THAT TIME VALUES SHOULD BE CALCULATED UNTIL THEN VALUES SHOULD BE 0
            setIsOpen(!IsOpen)
            setCount(Count + 1)
            if (Object.keys(costData).length > 0) {
                // let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
                // let costPerPieceTotal = 0
                // let costPerAssemblyTotal = 0
                // let CostPerAssemblyBOPTotal = 0

                // tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails && tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
                //     costPerPieceTotal = checkForNull(costPerPieceTotal) + checkForNull(item?.CostingPartDetails?.CostPerPiece)
                //     costPerAssemblyTotal = checkForNull(costPerAssemblyTotal) + checkForNull(item?.CostingPartDetails?.CostPerAssembly)
                //     CostPerAssemblyBOPTotal = checkForNull(CostPerAssemblyBOPTotal) + checkForNull(item?.CostingPartDetails?.CostPerAssemblyBOP)
                //     return null
                // })
                // tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerPiece = costPerPieceTotal
                // tempsubAssemblyTechnologyArray[0].CostingPartDetails.EditPartCost = costPerAssemblyTotal
                // tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssembly = checkForNull(costPerAssemblyTotal) + checkForNull(CostPerAssemblyBOPTotal) + (checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.ProcessCostValue) + checkForNull(tempsubAssemblyTechnologyArray[0]?.CostingPartDetails?.OperationCostValue))
                // tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssemblyBOP = checkForNull(CostPerAssemblyBOPTotal)
                // dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))
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
            <tr className={`${item?.PartType === 'Sub Assembly' ? 'costing-highlight-row' : ''}`}>
                <div style={{ display: 'contents' }}>
                    <td>
                        <span onClick={() => toggle(item?.BOMLevel, item?.PartNumber, item?.PartType)} className={`${item && item?.PartType === "Assembly" && "part-name"} ${item && item?.PartType !== "Sub Assembly" && item?.PartType !== "Assembly" && "L1"}`}>
                            <div className={`${IsOpen ? 'Open' : 'Close'}`}></div>{item && item?.PartNumber}
                        </span>
                    </td>
                    <td>{item && item?.PartName}</td>
                    <td>{item && item?.BOMLevel}</td>
                    <td>{item && item?.PartType}</td>
                    <td>{item?.CostingPartDetails?.TechnologyName ? item?.CostingPartDetails?.TechnologyName : 'Sheet Metal'}</td>
                    <td>{item?.CostingPartDetails?.Quantity ? checkForDecimalAndNull(item?.CostingPartDetails?.Quantity, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                    <td>{item?.CostingPartDetails?.CostPerPiece && item?.PartType === 'Assembly' ? '-' : checkForDecimalAndNull(item?.CostingPartDetails?.CostPerPiece, initialConfiguration.NoOfDecimalForPrice)}</td>

                    {/* <td>{item?.PartType === 'Assembly' && subAssemblyTechnologyArray[0]?.CostingPartDetails?.OperationCostValue ? subAssemblyTechnologyArray[0]?.CostingPartDetails?.OperationCostValue : '-'}</td>
                    <td>{item?.PartType === 'Assembly' && subAssemblyTechnologyArray[0]?.CostingPartDetails?.ProcessCostValue ? subAssemblyTechnologyArray[0]?.CostingPartDetails?.ProcessCostValue : '-'}</td> */}
                    <td>{item?.PartType === 'Assembly' && subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostPerAssemblyBOP ? subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostPerAssemblyBOP : '-'}</td>

                    <td>
                        {item?.CostingPartDetails?.CostPerAssembly ? checkForDecimalAndNull(item?.CostingPartDetails?.CostPerAssembly, initialConfiguration.NoOfDecimalForPrice) : '-'}
                        {(item?.PartType === 'Assembly' && (item?.CostingPartDetails?.EditPartCost ||
                            subAssemblyTechnologyArray[0]?.CostingPartDetails?.ProcessCostValue || subAssemblyTechnologyArray[0]?.CostingPartDetails?.OperationCostValue)) &&
                            (item?.CostingPartDetails?.CostPerAssembly || item?.CostingPartDetails?.CostPerAssembly) ?
                            <div class="tooltip-n ml-2"><i className="fa fa-info-circle text-primary tooltip-icon"></i>
                                <span class="tooltiptext">
                                    {`Total Operation's Cost:  ${subAssemblyTechnologyArray[0]?.CostingPartDetails?.OperationCostValue ? checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.OperationCostValue, initialConfiguration.NoOfDecimalForPrice) : '-'}`}
                                    <br></br>
                                    {`Total Process Cost:  ${subAssemblyTechnologyArray[0]?.CostingPartDetails?.ProcessCostValue ? checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.ProcessCostValue, initialConfiguration.NoOfDecimalForPrice) : '-'}`}
                                    <br></br>
                                    {`Total Child's Cost:  ${checkForDecimalAndNull(item?.CostingPartDetails?.EditPartCost, initialConfiguration.NoOfDecimalForPrice)}`}
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
                        <button
                            type="button"
                            className={'user-btn add-oprn-btn'}
                            title={"Add BOP Handling"}
                        // onClick={bopHandlingDrawer}
                        >
                            <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`BOP H`}</button>
                        <button
                            type="button"
                            className={'user-btn '}
                            onClick={ProcessDrawerToggle}
                            title={'Add Process'}
                        >
                            <div className={'plus'}></div>PROC
                        </button>

                        <button
                            type="button"
                            className={'user-btn'}
                            onClick={OperationDrawerToggle}
                            title={"Add Operation"}
                        >
                            <div className={'plus'}></div>OPER
                        </button>
                    </div>
                </td> :
                    ''
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
                        // ccData={subAssemblyTechnologyArray[0]?.CostingPartDetails !== null && subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostingConversionCost}
                        ccData={[]}
                    />
                )
            }
            {
                partCostDrawer && <EditPartCost
                    isOpen={partCostDrawer}
                    closeDrawer={closeDrawerPartCost}
                    anchor={'bottom'}
                    tabAssemblyIndividualPartDetail={tabAssemblyIndividualPartDetail}
                />
            }
        </ >
    );
}

export default AssemblyTechnology;