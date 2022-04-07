import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { getRMCCTabData, setComponentItemData, } from '../../../actions/Costing';
import { checkForDecimalAndNull, CheckIsCostingDateSelected } from '../../../../../helper';
import { EMPTY_GUID } from '../../../../../config/constants';
import BOPCost from '../Part/BOPCost';
import RawMaterialCost from '../Part/RawMaterialCost';
import ProcessCost from '../Part/ProcessCost';
import EditPartCost from './EditPartCost';

function PartCompomentA(props) {

    const { rmData, bopData, ccData, item } = props;

    const [IsOpen, setIsOpen] = useState(false);
    const [Count, setCount] = useState(0);
    const { CostingEffectiveDate } = useSelector(state => state.costing)
    const [partCostDrawer, setPartCostDrawer] = useState(false);
    const [tabAssemblyIndividualPartDetail, setTabAssemblyIndividualPartDetail] = useState({})

    const dispatch = useDispatch()
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const { CloseOpenAccordion } = useSelector(state => state.costing)

    const costData = useContext(costingInfoContext);

    const toggle = (BOMLevel, PartNumber) => {
        if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
        setIsOpen(!IsOpen)
        setCount(Count + 1)
        setTimeout(() => {
            if (Object.keys(costData).length > 0) {
                const data = {
                    CostingId: item.CostingId !== null ? item.CostingId : "00000000-0000-0000-0000-000000000000",
                    PartId: item.PartId,
                    AssemCostingId: costData.CostingId,
                    subAsmCostingId: props.subAssembId !== null ? props.subAssembId : EMPTY_GUID
                }
                dispatch(getRMCCTabData(data, false, (res) => {
                    if (res && res.data && res.data.Result) {
                        let Data = res.data.DataList[0].CostingPartDetails;
                        props.setPartDetails(BOMLevel, PartNumber, Data, item)
                        // dispatch(isDataChange(false))
                    }
                }))
            }
        }, 500)
    }

    useEffect(() => {
        dispatch(setComponentItemData(item, () => { }))
    }, [IsOpen])

    useEffect(() => {
        if (IsOpen === true) {
            toggle(item.BOMLevel, item.PartNumber)
        }
    }, [CloseOpenAccordion])

    /**
      * @method editItemDetails
      * @description edit material type
    */
    const viewOrEditItemDetails = (item) => {
        setTabAssemblyIndividualPartDetail(item)
        setPartCostDrawer(true)

    }

    const closeDrawerPartCost = (e = '') => {
        setPartCostDrawer(false)
    }

    /**
     * @method render
     * @description Renders the component
     */
    return (
        <>

            <tr className="accordian-row">
                <div style={{ display: 'contents' }} onClick={() => toggle(item.BOMLevel, item.PartNumber)} id={`${item && item.PartNumber}`}>
                    <td>
                        <span style={{ position: 'relative' }} className={`cr-prt-nm1 cr-prt-link1 ${item && item.BOMLevel}`}>
                            {item && item.PartNumber}<div className={`${item.IsOpen ? 'Open' : 'Close'}`}></div>
                        </span>
                    </td>

                    <td>{item && item.PartName}</td>
                    <td>{item && item.BOMLevel}</td>
                    <td>{item && item.PartType}</td>
                    <td>{item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity ? item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity : 'Sheet Metal'}</td>
                    <td>{item?.CostingPartDetails?.QuantityForSubAssembly ? checkForDecimalAndNull(item.CostingPartDetails.QuantityForSubAssembly, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                    <td>{item?.CostingPartDetails?.CostPerPiece ? checkForDecimalAndNull(item.CostingPartDetails.CostPerPiece, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                    <td>{item?.CostingPartDetails?.CostPerAssembly ? checkForDecimalAndNull(item.CostingPartDetails.CostPerAssembly, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                </div>
                <td>
                    {item.PartType !== 'Assembly' && item.PartType !== 'BOP' &&
                        <button
                            type="button"
                            className={'Edit mr-2 align-middle'}
                            onClick={() => viewOrEditItemDetails(item)}>
                        </button>}
                </td>
                <td></td>
            </tr>

            {item.IsOpen && <tr>
                <td colSpan={`${costData.IsAssemblyPart ? 10 : 9}`} className="cr-innerwrap-td pb-4">
                    <div className="user-page p-0">
                        <div>
                            <RawMaterialCost
                                index={props.index}
                                data={rmData}
                                setRMCost={props.setRMCost}
                                setRMMasterBatchCost={props.setRMMasterBatchCost}
                                item={item}
                            />

                            <BOPCost
                                index={props.index}
                                data={bopData}
                                setBOPCost={props.setBOPCost}
                                setBOPHandlingCost={props.setBOPHandlingCost}
                                item={item}
                            />

                            <ProcessCost
                                index={props.index}
                                data={ccData}
                                rmFinishWeight={rmData.length > 0 && rmData[0].FinishWeight !== undefined ? rmData[0].FinishWeight : 0}
                                setProcessCost={props.setProcessCost}
                                setOperationCost={props.setOperationCost}
                                setOtherOperationCost={props.setOtherOperationCost}
                                setToolCost={props.setToolCost}
                                item={item}
                            />
                        </div>
                    </div >
                </td>
            </tr>}
            {partCostDrawer && <EditPartCost
                isOpen={partCostDrawer}
                closeDrawer={closeDrawerPartCost}
                // approvalData={approvalData}
                anchor={'bottom'}
                // masterId={OPERATIONS_ID}
                tabAssemblyIndividualPartDetail={tabAssemblyIndividualPartDetail}
                getCostPerPiece={props.getCostPerPiece}
            />}


        </ >
    );
}

export default PartCompomentA
