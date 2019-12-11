import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    createNewCosting, getCostingBySupplier, getCostingDetailsById, getMaterialTypeSelectList,
    setCostingDetailRowData, addCostingProcesses, addCostingOtherOperation, saveCostingAsDraft
} from '../../../actions/costing/CostWorking';
import { Button, Col, Row, Table, Label, Input } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import AddWeightCosting from './AddWeightCosting';
import AddRawMaterialCosting from './AddRawMaterialCosting';
import AddBOPCosting from './AddBOPCosting';
import OtherOperationGrid from './OtherOperationGrid';
import ProcessGrid from './ProcessGrid';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';

class CostWorking extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            isOpen: false,
            isOpenRMmodel: false,
            isCollapes: false,
            PartId: '',
            isEditFlag: false,
            isNewCostingFlag: false,
            costingId: '',
            isRMEditFlag: false,
            isOpenBOPModal: false,
            isOpenProcessTable: false,
            isShowOtherOperation: false,
            isShowProcessGrid: false,
            selectedIndex: '',
            PartNumber: '',
            NetRMCost: 0,
            NetCC_Cost: 0,
            NetGrandTotal: 0,
            Quantity: 0,
            NetProcessCost: 0,
            NetOtherOperationCost: 0,
            NetSurfaceCost: 0,
            NetBoughtOutPartCost: 0,
            isEditCEDFlag: false,
        }
    }

    /**
     * @method componentDidMount
     * @description  called before mounting the component
     */
    componentDidMount() {
        const { activeCostingListData } = this.props;
        this.props.getMaterialTypeSelectList()
        if (activeCostingListData && activeCostingListData.PartDetail) {
            this.setState({
                PartNumber: activeCostingListData.PartDetail.PartNumber
            })
        }
    }

    /**
     * @method componentWillReceiveProps
     * @description  called after props changes
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.getCostingDetailData != this.props.getCostingDetailData) {
            //const { getCostingDetailData } = this.props;

            let NetRMCost = 0;
            let NetCC_Cost = 0;
            let NetQuantity = 0;
            let NetProcessCost = 0;
            let NetOtherOperationCost = 0;
            let NetSurfaceCost = 0;
            let NetBoughtOutPartCost = 0;
            let NetGrossWeight = 0;

            const tempData = nextProps.getCostingDetailData && nextProps.getCostingDetailData.AssemblyPartDetail.map((data, index) => {

                if (data && data.RawMaterialDetails.length > 0) {
                    const scrapRate = data.RawMaterialDetails[index].RawMaterialScrapRate;
                    const finishWt = data.WeightCalculationDetails.length > 0 ? data.WeightCalculationDetails[index].FinishWeight : 0;
                    NetRMCost = NetRMCost + (scrapRate * finishWt);
                }

                if (data && data.WeightCalculationDetails.length > 0) {
                    const grossWt = data.WeightCalculationDetails.length > 0 ? data.WeightCalculationDetails[index].GrossWeight : 0;
                    NetGrossWeight = NetGrossWeight + grossWt;
                }

                if (data && data.BoughtOutPartDetails.length > 0) {
                    const BOPcost = data.BoughtOutPartDetails[index].AssyBoughtOutParRate;
                    const ProcessCost = data.ProcessDetails.length > 0 ? data.ProcessDetails[index].AssyTotalProcessCost : 0;
                    const SurfaceTreatmentCost = data.OtherOperationDetails.length > 0 ? data.OtherOperationDetails[index].AssySurfaceTreatmentCost : 0;
                    const OtherOperationCost = data.OtherOperationDetails.length > 0 ? data.OtherOperationDetails[index].GrandTotal : 0;

                    NetCC_Cost = NetCC_Cost + (BOPcost + ProcessCost + SurfaceTreatmentCost);
                    NetProcessCost = NetProcessCost + ProcessCost;
                    NetOtherOperationCost = NetOtherOperationCost + OtherOperationCost;
                    NetSurfaceCost = NetSurfaceCost + SurfaceTreatmentCost;
                    NetBoughtOutPartCost = NetBoughtOutPartCost + BOPcost;
                }

                NetRMCost = NetRMCost * data.Quantity;
                NetCC_Cost = NetCC_Cost * data.Quantity;
                NetQuantity = NetQuantity + data.Quantity;

                return {
                    NetRMCost: NetRMCost,
                    NetCC_Cost: NetCC_Cost,
                    NetQuantity: NetQuantity,
                    NetProcessCost: NetProcessCost,
                    NetOtherOperationCost: NetOtherOperationCost,
                    NetSurfaceCost: NetSurfaceCost,
                    NetBoughtOutPartCost: NetBoughtOutPartCost,
                    NetGrossWeight: NetGrossWeight,
                }
            })

            this.setState({
                NetRMCost: tempData[0].NetRMCost,
                NetCC_Cost: tempData[0].NetCC_Cost,
                NetGrandTotal: tempData[0].NetRMCost + tempData[0].NetCC_Cost,
                Quantity: tempData[0].NetQuantity,
                NetProcessCost: tempData[0].NetProcessCost,
                NetOtherOperationCost: tempData[0].NetOtherOperationCost,
                NetSurfaceCost: tempData[0].NetSurfaceCost,
                NetBoughtOutPartCost: tempData[0].NetBoughtOutPartCost,
                NetGrossWeight: tempData[0].NetGrossWeight,
            })
        }
    }

    /**
   * @method toggle
   * @description toggling the tabs
   */
    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = (selectedIndex) => {
        this.setState({
            isOpen: true,
            isEditFlag: false,
            selectedIndex: selectedIndex,
        })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        const { costingId } = this.state;
        this.setState({
            isOpen: false,
            isOpenRMmodel: false,
            isOpenBOPModal: false
        }, () => {
            this.props.getCostingDetailsById(costingId, true, res => { })
        });
    }

    /**haldle the cost working details collapes */
    collapsHandler = (costingId) => {
        this.props.getCostingDetailsById(costingId, true, res => {
            this.setState({
                isCollapes: true,
                isEditFlag: true,
                isNewCostingFlag: false,
                costingId: costingId
            })
        })
    }

    /**
     * @method createNewCosting
     * @description  used to create new costing 
     */
    createNewCosting = () => {
        const { supplierId, plantId, partId } = this.props;
        const { activeCostingListData } = this.props;
        /** getting part id from active costing list */
        const sheetmetalCostingData = {
            PartId: partId,
            PlantId: plantId,
            SupplierId: supplierId,
            CreatedBy: ''
        }
        /** create new costing on basis of selected supplier, part, and plat */
        this.props.createNewCosting(sheetmetalCostingData, (res) => {
            if (res.data.Result) {
                const newCostingId = res.data.Identity;
                toastr.success(MESSAGES.NEW_COSTING_CREATE_SUCCESS);
                /** fetching records of supplier costing details */
                this.props.getCostingBySupplier(supplierId, () => { })
            } else {
                toastr.error(res.data.message);
            }
        });
    }

    /**
     * @method openRMModel
     * @description  used to open openRMModel 
     */
    openRMModel = (selectedIndex) => {
        this.setState({
            isOpenRMmodel: !this.state.isOpenRMmodel,
            selectedIndex: selectedIndex,
        })
    }

    /**
     * @method openBOPModal
     * @description  used to open openBOPModal 
     */
    openBOPModal = (selectedIndex) => {
        this.setState({
            isOpenBOPModal: !this.state.isOpenBOPModal,
            selectedIndex: selectedIndex,
        })
    }

    /**
     * @method toggleOtherOperation
     * @description  used to toggle OtherOperation
     */
    toggleOtherOperation = (selectedIndex, isEditCEDFlag) => {
        const { costingId } = this.state;
        this.setState({
            isShowOtherOperation: !this.state.isShowOtherOperation,
            selectedIndex: selectedIndex,
            isEditCEDFlag: isEditCEDFlag,
        }, () => {
            this.props.addCostingOtherOperation(costingId, res => { });
        })
    }

    /**
     * @method toggleProcessGrid
     * @description  used to toggle OtherOperation
     */
    toggleProcessGrid = (selectedIndex) => {
        const { costingId } = this.state;
        this.setState({
            isShowProcessGrid: !this.state.isShowProcessGrid,
            selectedIndex: selectedIndex,
        }, () => {
            this.props.addCostingProcesses(costingId, res => { })
        })
    }

    materialDropDown = (data, index) => {
        const { MaterialSelectList } = this.props;
        return (
            <select>
                {MaterialSelectList && MaterialSelectList.map((item, i) => {
                    let selected = (item.Value == data.MaterialTypeId) ? true : false;
                    return (
                        <option value={item.Value} disabled selected={selected} >{item.Text}</option>
                    )
                })}
            </select>
        )
    }

    QuantityHandler = (e, Quantity, index) => {
        const { getCostingDetailData } = this.props;
        console.log(e.target.value, Quantity, index)

        this.setState({
            Quantity: e.target.value
        })
        const data = getCostingDetailData && getCostingDetailData.AssemblyPartDetail.map((item, i) => {
            if (index == i) {
                return ({ ...item, Quantity: e.target.value })
            }
            return ({ item })
        })

        let DetailData = { ...getCostingDetailData, AssemblyPartDetail: data }

        this.props.setCostingDetailRowData(DetailData, index);
        console.log("Detail", data, DetailData)
    }

    /**
    * @method saveCosting
    * @description Used for save costing as draft
    */
    saveCosting = () => {
        const { costingId, NetRMCost, NetCC_Cost, NetGrandTotal, Quantity, NetProcessCost, NetOtherOperationCost, NetSurfaceCost,
            NetBoughtOutPartCost, NetGrossWeight } = this.state;
        const { getCostingDetailData } = this.props;

        let formData = {
            CostingId: costingId,
            CostingStatusId: getCostingDetailData.CostingDetail.CostingStatusId,
            CostingStatusName: "Draft",
            NetPurchaseOrderPrice: NetGrandTotal,
            ShareOfBusiness: 15,
            Quantity: Quantity,
            NetRawMaterialCost: NetRMCost,
            TotalConversionCost: NetCC_Cost,
            NetProcessCost: NetProcessCost,
            NetOtherOperationCost: NetOtherOperationCost,
            NetSurfaceCost: NetSurfaceCost,
            NetBoughtOutParCost: NetBoughtOutPartCost,
            NetGrossWeight: NetGrossWeight,
        }
        this.props.saveCostingAsDraft(formData, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.COSTING_HAS_BEEN_DRAFTED_SUCCESSFULLY);
                this.props.toggle('1');
            } else {
                toastr.error(res.data.Message);
            }
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isCollapes, isEditFlag, isNewCostingFlag, isOpenRMmodel, costingId,
            isRMEditFlag, isOpenBOPModal, isBOPEditFlag, isOpenProcessTable,
            selectedIndex, isShowOtherOperation, isShowProcessGrid } = this.state;

        const { activeCostingListData, supplierId, plantId, partId, getCostingData, costingGridRMData,
            getCostingDetailData, BoughtOutPartDetails } = this.props;

        const PartNumber = activeCostingListData && activeCostingListData.PartDetail.PartNumber;

        return (
            <div>
                {this.props.loading && <Loader />}
                <Col md="12">
                    {activeCostingListData && `Part No. : ${activeCostingListData.PartDetail.PartNumber} Costing Type : ${activeCostingListData.SupplierType} Supplier Name : ${activeCostingListData.SupplierName} Supplier Code : ${activeCostingListData.SupplierCode} Created On : `}
                    <hr />
                    {supplierId && plantId &&
                        <Button color="secondary" onClick={this.createNewCosting} >
                            New Costing
                        </Button>}
                    {supplierId && plantId && <h5><b>{`Costing Supplier List`}</b></h5>}

                    {/* Listing of active costings */}
                    <Table className="table table-striped" bordered>
                        {activeCostingListData && activeCostingListData.ActiveCostingDetatils.length > 0 &&
                            <thead>
                                <tr>
                                    <th>{`Assy Part No.`}</th>
                                    <th>{`Technology`}</th>
                                    <th>{`Supplier Name`}</th>
                                    <th>{`TimeStamp`}</th>
                                    <th>{`Status`}</th>
                                </tr>
                            </thead>}
                        <tbody >
                            {activeCostingListData && activeCostingListData.ActiveCostingDetatils.length > 0 &&
                                activeCostingListData.ActiveCostingDetatils.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td><div onClick={() => this.collapsHandler(item.CostingId)} color="secondary" className={'select-costing'} id="toggler">{item.PartNumber}</div></td>
                                            <td>{activeCostingListData.TechnologyDetail && activeCostingListData.TechnologyDetail.TechnologyName}</td>
                                            <td>{item.PlantName}</td>
                                            <td>{item.DisplayCreatedDate}</td>
                                            <td>{item.StatusName}</td>
                                        </tr>
                                    )
                                })}
                            {/* {this.props.item === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />} */}
                        </tbody>
                    </Table>
                    <hr />
                </Col>

                {isCollapes && (
                    <Col md="12">
                        <Label><th>{`Cost Working With : `}{isEditFlag ? getCostingData && getCostingData.DisplayCreatedDate : ''}</th></Label>

                        {/* Close below table in case process table open */}
                        {(!isShowProcessGrid && !isShowOtherOperation) && getCostingDetailData &&
                            <div className={'create-costing-grid'}>
                                <Table className="table table-striped" bordered>
                                    <thead>
                                        <tr>
                                            <th>{`BOM Level`}</th>
                                            <th>{`Assy Part No.`}</th>
                                            <th>{`Child Part No.`}</th>
                                            <th>{`Part Description`}</th>
                                            <th>{`Material Type`}</th>
                                            <th>{`Qty/Assy`}</th>
                                            <th>{`RM Specification`}</th>
                                            <th>{`RM rate/Kg`}</th>
                                            <th>{`Scrap Rate (Rs/kg)`}</th>
                                            <th>{`Weight Specification`}</th>
                                            <th>{`Gross weight`}</th>
                                            <th>{`finish weight`}</th>
                                            <th>{`Net RM Cost`}</th>
                                            <th>{`BOP/pc.`}</th>
                                            <th>{`Total BOP Cost/Assy`}</th>
                                            <th>{`Process`}</th>
                                            <th>{`Total Process Cost`}</th>
                                            <th>{`Total Process Cost/Assy`}</th>
                                            <th>{`Other operation`}</th>
                                            <th>{`Surface Treatment Cost`}</th>
                                            <th>{`Surface Treatment Cost/Assy`}</th>
                                            <th>{`RM + CC`}</th>
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {getCostingDetailData && getCostingDetailData.AssemblyPartDetail.map((data, index) => {
                                            let NetRMCost = '';
                                            let NetCC_Cost = '';
                                            if (data && data.RawMaterialDetails.length > 0) {
                                                const scrapRate = data.RawMaterialDetails[0].RawMaterialScrapRate;
                                                const finishWt = data.WeightCalculationDetails.length > 0 ? data.WeightCalculationDetails[0].FinishWeight : 0;
                                                NetRMCost = (scrapRate * finishWt);
                                            }

                                            if (data && data.BoughtOutPartDetails.length > 0) {
                                                const BOPcost = data.BoughtOutPartDetails[0].AssyBoughtOutParRate;
                                                const ProcessCost = data.ProcessDetails.length > 0 ? data.ProcessDetails[0].AssyTotalProcessCost : 0;
                                                const SurfaceTreatmentCost = data.OtherOperationDetails.length > 0 ? data.OtherOperationDetails[0].AssySurfaceTreatmentCost : 0;
                                                NetCC_Cost = (BOPcost + ProcessCost + SurfaceTreatmentCost);
                                            }

                                            const cedFlag = data && data.OtherOperationDetails.length > 0 ? true : false;
                                            return (
                                                <tr key={index} >
                                                    <td>{data.BOMLevel}</td>
                                                    <td>{data.PartNumber}</td>
                                                    <td>{data.PartNumber}</td>
                                                    <td>{data.PartDescription}</td>
                                                    <td>{this.materialDropDown(data, index)}</td>
                                                    <td><input type="text" value={this.state.Quantity} onChange={(e) => this.QuantityHandler(e, data.Quantity, index)} /></td>
                                                    {/* <td><button onClick={this.openRMModel}>{costingGridRMData ? costingGridRMData.RawMaterialName : 'Add'}</button></td> */}
                                                    <td><button onClick={() => this.openRMModel(index)}>{data && data.RawMaterialDetails.length > 0 ? data.RawMaterialDetails[0].RawMaterialName : 'Add'}</button></td>
                                                    <td>{data && data.RawMaterialDetails.length > 0 ? data.RawMaterialDetails[0].RawMaterialRate : '0'}</td>
                                                    <td>{data && data.RawMaterialDetails.length > 0 ? data.RawMaterialDetails[0].RawMaterialScrapRate : '0'}</td>

                                                    <td><button onClick={() => this.openModel(index)}>Add</button></td>
                                                    <td>{data && data.WeightCalculationDetails.length > 0 ? data.WeightCalculationDetails[0].GrossWeight : '0'}</td>
                                                    <td>{data && data.WeightCalculationDetails.length > 0 ? data.WeightCalculationDetails[0].FinishWeight : '0'}</td>
                                                    <td>{data && data.WeightCalculationDetails.length > 0 ? NetRMCost : '0'}</td>

                                                    <td><button onClick={() => this.openBOPModal(index)}>{data && data.BoughtOutPartDetails.length > 0 ? data.BoughtOutPartDetails[0].BoughtOutParRate : 'Add'}</button></td>
                                                    <td>{data && data.BoughtOutPartDetails.length > 0 ? data.BoughtOutPartDetails[0].AssyBoughtOutParRate : '0'}</td>

                                                    <td><button onClick={() => this.toggleProcessGrid(index)}>Add</button></td>
                                                    <td>{data && data.ProcessDetails.length > 0 ? data.ProcessDetails[0].TotalProcessCost : '0'}</td>
                                                    <td>{data && data.ProcessDetails.length > 0 ? data.ProcessDetails[0].AssyTotalProcessCost : '0'}</td>

                                                    <td><button onClick={() => this.toggleOtherOperation(index, cedFlag)}>{cedFlag ? 'Update' : 'Add'}</button></td>
                                                    <td>{data && data.OtherOperationDetails.length > 0 ? data.OtherOperationDetails[0].SurfaceTreatmentCost : '0'}</td>
                                                    <td>{data && data.OtherOperationDetails.length > 0 ? data.OtherOperationDetails[0].AssySurfaceTreatmentCost : '0'}</td>
                                                    <td>{(NetRMCost + NetCC_Cost) * data.Quantity}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                                <div>
                                    <button type="button" className={'pull-center'} onClick={this.saveCosting}>Save</button>
                                </div>
                            </div>}

                        {/* Open below table when process costing add */}

                        {isShowOtherOperation &&
                            <OtherOperationGrid
                                onCancelOperationGrid={this.toggleOtherOperation}
                                supplierId={supplierId}
                                isEditCEDFlag={this.state.isEditCEDFlag}
                                costingId={costingId}
                                PartId={partId}
                                PartNumber={PartNumber}
                                partName={PartNumber}
                            />}

                        {isShowProcessGrid &&
                            <ProcessGrid
                                onCancelProcessGrid={this.toggleProcessGrid}
                                supplierId={supplierId}
                                costingId={costingId}
                                PartId={partId}
                                PartNumber={PartNumber}
                                selectedIndex={selectedIndex}
                            />}

                    </Col>
                )}
                {isOpen && (
                    <AddWeightCosting
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        costingId={costingId}
                        partId={partId}
                        selectedIndex={selectedIndex}
                        PartNumber={PartNumber}
                    />
                )}
                {isOpenRMmodel && (
                    <AddRawMaterialCosting
                        isOpen={isOpenRMmodel}
                        onCancel={this.onCancel}
                        supplierId={supplierId}
                        costingId={costingId}
                        partId={partId}
                        PartNumber={PartNumber}
                        selectedIndex={selectedIndex}
                        isRMEditFlag={isRMEditFlag}
                    />
                )}
                {isOpenBOPModal && (
                    <AddBOPCosting
                        isOpen={isOpenBOPModal}
                        onCancel={this.onCancel}
                        supplierId={supplierId}
                        costingId={costingId}
                        PartId={partId}
                        PartNumber={PartNumber}
                        selectedIndex={selectedIndex}
                    //isBOPEditFlag={isBOPEditFlag}
                    />
                )}
            </div >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ costWorking }) {
    const { activeCostingListData, getCostingDetailData, costingGridRMData, MaterialSelectList } = costWorking;

    return { activeCostingListData, getCostingDetailData, costingGridRMData, MaterialSelectList }
}

export default connect(mapStateToProps,
    {
        createNewCosting,
        getCostingBySupplier,
        getCostingDetailsById,
        getMaterialTypeSelectList,
        setCostingDetailRowData,
        addCostingProcesses,
        addCostingOtherOperation,
        saveCostingAsDraft,
    }
)(CostWorking);

