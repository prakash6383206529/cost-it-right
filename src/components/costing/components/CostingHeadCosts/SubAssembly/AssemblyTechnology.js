import React, { useContext, useState, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { checkForDecimalAndNull, CheckIsCostingDateSelected, } from '../../../../../helper';
import AddAssemblyOperation from '../../Drawers/AddAssemblyOperation';
import { ViewCostingContext } from '../../CostingDetails';
import EditPartCost from './EditPartCost';
import PartCompomentA from './PartComponentA';
import BOPA from './BOPA';
import { subAssembly010101, subAssemblyAssemPart, tempObject } from '../../../../../config/masterData';
import { setSubAssemblyTechnologyArray } from '../../../actions/SubAssembly.js';
import AddProcess from '../../Drawers/AddProcess';
import AddAssemblyProcess from '../../Drawers/AddAssemblyProcess';

function AssemblyTechnology(props) {
    const { children, item, index, getCostPerPiece } = props;
    console.log('item: ds', item);



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

    const toggle = (BOMLevel, PartNumber) => {
        setIsOpen(!IsOpen)
        setCount(Count + 1)
        if (Object.keys(costData).length > 0) {

            if (PartNumber === '010101') {
                // dispatch(setSubAssemblyTechnologyArray(subAssembly010101))
                props.toggleAssembly(BOMLevel, PartNumber, subAssembly010101[0])
            }

            else if (PartNumber === 'Assem Part No. 10') {
                // dispatch(setSubAssemblyTechnologyArray(subAssemblyAssemPart))
                props.toggleAssembly(BOMLevel, PartNumber, subAssemblyAssemPart)
            }

            else {
                dispatch(setSubAssemblyTechnologyArray(tempObject))
                // props.toggleAssembly(BOMLevel, PartNumber, tempObject)

            }

            props.toggleAssembly(BOMLevel, PartNumber, subAssemblyTechnologyArray)

        } else {
            props.toggleAssembly(BOMLevel, PartNumber)
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

    const nestedPartComponent = children && children.map(el => {
        if (el.PartType === 'Part') {
            return <PartCompomentA
                index={index}
                item={el}
                rmData={el?.CostingPartDetails?.CostingRawMaterialsCost}
                bopData={el.CostingPartDetails !== null && el.CostingPartDetails.CostingBoughtOutPartCost}
                ccData={el.CostingPartDetails !== null && el.CostingPartDetails.CostingConversionCost}
                setPartDetails={props.setPartDetails}
                setRMCost={props.setRMCost}
                setRMMasterBatchCost={props.setRMMasterBatchCost}
                setBOPCost={props.setBOPCost}
                setBOPHandlingCost={props.setBOPHandlingCost}
                setProcessCost={props.setProcessCost}
                setOperationCost={props.setOperationCost}
                setOtherOperationCost={props.setOtherOperationCost}
                setToolCost={props.setToolCost}
                subAssembId={item.CostingId}
                getCostPerPiece={getCostPerPiece}
            />
        }
    })

    const nestedAssembly = children && children.map(el => {
        if (el.PartType !== 'Sub Assembly') return false;
        return <AssemblyTechnology
            index={index}
            item={el}
            children={el.CostingChildPartDetails}
            setPartDetails={props.setPartDetails}
            toggleAssembly={props.toggleAssembly}
            setRMCost={props.setRMCost}
            setRMMasterBatchCost={props.setRMMasterBatchCost}
            setBOPCost={props.setBOPCost}
            setBOPHandlingCost={props.setBOPHandlingCost}
            setProcessCost={props.setProcessCost}
            setOperationCost={props.setOperationCost}
            setOtherOperationCost={props.setOtherOperationCost}
            setToolCost={props.setToolCost}
            setAssemblyOperationCost={props.setAssemblyOperationCost}
            setAssemblyToolCost={props.setAssemblyToolCost}
            subAssembId={item.CostingId}

            getCostPerPiece={getCostPerPiece}

        />
    })

    const nestedBOP = children && children.map(el => {
        if (el.PartType !== 'BOP') return false;
        return <BOPA
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
            <tr className="costing-highlight-row accordian-row">
                <div style={{ display: 'contents' }} onClick={() => toggle(item.BOMLevel, item.PartNumber)}>
                    <td>
                        <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.PartType !== "Sub Assembly" && item.PartType !== "Assembly" && "L1"}`}>
                            <div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>{item && item.PartNumber}
                        </span>
                    </td>
                    <td>{item && item.PartName}</td>
                    <td>{item && item.BOMLevel}</td>
                    <td>{item && item.PartType}</td>
                    <td>{item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity ? item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity : 'Sheet Metal'}</td>
                    <td>{item?.CostingPartDetails?.QuantityForSubAssembly ? checkForDecimalAndNull(item.CostingPartDetails.QuantityForSubAssembly, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                    <td>{item?.CostingPartDetails?.CostPerPiece ? checkForDecimalAndNull(item.CostingPartDetails.CostPerPiece, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>

                    <td>{item?.PartType === 'Assembly' ? subAssemblyTechnologyArray[0].operationCostValue : '-'}</td>
                    <td>{item?.PartType === 'Assembly' ? subAssemblyTechnologyArray[0].processCostValue : '-'}</td>

                    <td>{item?.CostingPartDetails?.CostPerAssembly ? checkForDecimalAndNull(item.CostingPartDetails.CostPerAssembly, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>


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

            {item.IsOpen && nestedPartComponent}

            {item.IsOpen && nestedBOP}

            {item.IsOpen && nestedAssembly}

            {
                isOperationDrawerOpen && <AddAssemblyOperation
                    isOpen={isOperationDrawerOpen}
                    closeDrawer={closeOperationDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                    item={item}
                    CostingViewMode={CostingViewMode}
                    setAssemblyOperationCost={props.setAssemblyOperationCost}
                    setAssemblyToolCost={props.setAssemblyToolCost}
                    setOperationCostFunction={props.setOperationCostFunction}
                // setProcessCostFunction={props.setProcessCostFunction}
                />
            }
            {isProcessDrawerOpen && (
                <AddAssemblyProcess
                    isOpen={isProcessDrawerOpen}
                    closeDrawer={closeProcessDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                    ccData={subAssemblyTechnologyArray[0].CostingPartDetails !== null && subAssemblyTechnologyArray[0].CostingPartDetails.CostingConversionCost}
                    setProcessCostFunction={props.setProcessCostFunction}

                // Ids={Ids}
                // MachineIds={MachineIds}
                />
            )}
            {
                partCostDrawer && <EditPartCost
                    isOpen={partCostDrawer}
                    closeDrawer={closeDrawerPartCost}
                    // approvalData={approvalData}
                    anchor={'bottom'}
                    // masterId={OPERATIONS_ID}
                    tabAssemblyIndividualPartDetail={tabAssemblyIndividualPartDetail}

                    getCostPerPiece={getCostPerPiece}
                />
            }

        </ >
    );
}

export default AssemblyTechnology;