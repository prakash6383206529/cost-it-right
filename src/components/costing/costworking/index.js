import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createNewCosting, getCostingBySupplier, getCostingDetailsById } from '../../../actions/costing/CostWorking';
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
            isOpenProcessModal: false,
            isOpenProcessTable: false,
            rowsCount: [1],
            isShowOtherOperation: false,
            isShowProcessGrid: false
        }
    }

    /**
     * @method componentDidMount
     * @description  called before mounting the component
     */
    componentDidMount() {

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
    openModel = () => {
        this.setState({ isOpen: true, isEditFlag: false })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({
            isOpen: false,
            isOpenRMmodel: false,
            isOpenBOPModal: false
        });
    }

    /**haldle the cost working details collapes */
    collapsHandler = (costingId) => {
        // this.setState({
        //     isCollapes: !this.state.isCollapes,
        //     isEditFlag: true
        // }, () => {
        //     if (this.state.isEditFlag) {
        //         this.props.getCostingDetailsById(costingId, true, res => { })
        //     } else {
        //         this.props.getCostingDetailsById('', false, res => { })
        //     }
        // })

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
        //if (activeCostingListData && activeCostingListData.ActiveCostingDetatils.length > 0) {
        const sheetmetalCostingData = {
            //PartId: activeCostingListData.ActiveCostingDetatils[0].PartId,
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
                // this.props.getCostingBySupplier(supplierId, (res) => {
                //     this.setState({
                //         isCollapes: true,
                //         isNewCostingFlag: true,
                //         isEditFlag: false,
                //         costingId: newCostingId
                //     })
                //     //this.toggleModel();
                // });
                this.props.getCostingDetailsById(newCostingId, true, res => {
                    this.setState({
                        isCollapes: true,
                        isEditFlag: true,
                        isNewCostingFlag: false
                    })
                })
            } else {
                toastr.error(res.data.message);
            }
        });
        //}
    }

    /**
     * @method openRMModel
     * @description  used to open openRMModel 
     */
    openRMModel = () => {
        this.setState({
            isOpenRMmodel: !this.state.isOpenRMmodel,
            isRMEditFlag: this.props.getCostingDetailData.RawMaterialDetails.length > 0 ? true : false,
        })
    }

    /**
     * @method openBOPModal
     * @description  used to open openBOPModal 
     */
    openBOPModal = () => {
        this.setState({
            isOpenBOPModal: !this.state.isOpenBOPModal,
        })
    }

    /**
     * @method openProcessModal
     * @description  used to open openProcessModal 
     */
    openProcessModal = () => {
        this.setState({
            isOpenProcessModal: !this.state.isOpenProcessModal,
        })
    }

    /**
     * @method toggleOtherOperation
     * @description  used to toggle OtherOperation
     */
    toggleOtherOperation = () => {
        this.setState({
            isShowOtherOperation: !this.state.isShowOtherOperation
        })
    }

    /**
     * @method toggleProcessGrid
     * @description  used to toggle OtherOperation
     */
    toggleProcessGrid = () => {
        this.setState({
            isShowProcessGrid: !this.state.isShowProcessGrid
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isCollapes, isEditFlag, isNewCostingFlag, isOpenRMmodel, costingId,
            isRMEditFlag, isOpenBOPModal, isBOPEditFlag, isOpenProcessModal, isOpenProcessTable,
            rowsCount, isShowOtherOperation, isShowProcessGrid } = this.state;

        const { activeCostingListData, supplierId, plantId, getCostingData, costingGridRMData,
            getCostingDetailData, BoughtOutPartDetails } = this.props;

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
                        {(!isShowProcessGrid && !isShowOtherOperation) && activeCostingListData &&
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
                                        <tr >
                                            <td>{activeCostingListData.PartDetail.BillOfMaterialLevel}</td>
                                            <td>{activeCostingListData.PartDetail.PartNumber}</td>
                                            <td>{activeCostingListData.PartDetail.PartNumber}</td>
                                            <td>{activeCostingListData.PartDetail.PartDescription}</td>
                                            <td>{''}</td>
                                            <td>{''}</td>
                                            {/* <td><button onClick={this.openRMModel}>{costingGridRMData ? costingGridRMData.RawMaterialName : 'Add'}</button></td> */}
                                            <td><button onClick={this.openRMModel}>{getCostingDetailData && getCostingDetailData.RawMaterialDetails.length > 0 ? getCostingDetailData.RawMaterialDetails[0].RawMaterialName : 'Add'}</button></td>
                                            <td>{getCostingDetailData && getCostingDetailData.RawMaterialDetails.length > 0 ? getCostingDetailData.RawMaterialDetails[0].RawMaterialRate : '0'}</td>
                                            <td>{getCostingDetailData && getCostingDetailData.RawMaterialDetails.length > 0 ? getCostingDetailData.RawMaterialDetails[0].RawMaterialScrapRate : '0'}</td>

                                            <td><button onClick={this.openModel}>Add</button></td>
                                            <td>{getCostingDetailData && getCostingDetailData.WeightCalculationDetails.length > 0 ? 'Dummy 1' : '0'}</td>
                                            <td>{getCostingDetailData && getCostingDetailData.WeightCalculationDetails.length > 0 ? 'Dummy 1' : '0'}</td>
                                            <td>{getCostingDetailData && getCostingDetailData.WeightCalculationDetails.length > 0 ? 'Dummy 1' : '0'}</td>

                                            <td><button onClick={this.openBOPModal}>{getCostingDetailData && getCostingDetailData.BoughtOutPartDetails.length > 0 ? getCostingDetailData.BoughtOutPartDetails[0].BoughtOutParRate : 'Add'}</button></td>
                                            <td>{getCostingDetailData && getCostingDetailData.BoughtOutPartDetails.length > 0 ? getCostingDetailData.BoughtOutPartDetails[0].AssyBoughtOutParRate : '0'}</td>

                                            <td><button onClick={this.toggleProcessGrid}>Add</button></td>
                                            <td>{isNewCostingFlag ? '0' : ''}</td>
                                            <td>{isNewCostingFlag ? '0' : ''}</td>

                                            <td><button onClick={this.toggleOtherOperation}>Add</button></td>
                                            <td>{isNewCostingFlag ? '0' : ''}</td>
                                            <td>{isNewCostingFlag ? '0' : ''}</td>
                                            <td>{isNewCostingFlag ? '0' : ''}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>}

                        {/* Open below table when process costing add */}

                        {isShowOtherOperation &&
                            <OtherOperationGrid
                                onCancelOperationGrid={this.toggleOtherOperation}
                                supplierId={supplierId}
                                costingId={costingId}
                                partName={getCostingDetailData.PartDetail.PartNumber} />}

                        {isShowProcessGrid &&
                            <ProcessGrid
                                onCancelProcessGrid={this.toggleProcessGrid}
                                supplierId={supplierId}
                                costingId={costingId}
                            />}

                    </Col>
                )}
                {isOpen && (
                    <AddWeightCosting
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        costingId={costingId}
                    />
                )}
                {isOpenRMmodel && (
                    <AddRawMaterialCosting
                        isOpen={isOpenRMmodel}
                        onCancel={this.onCancel}
                        supplierId={supplierId}
                        costingId={costingId}
                        isRMEditFlag={isRMEditFlag}
                    />
                )}
                {isOpenBOPModal && (
                    <AddBOPCosting
                        isOpen={isOpenBOPModal}
                        onCancel={this.onCancel}
                        supplierId={supplierId}
                        costingId={costingId}
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
    const { activeCostingListData, getCostingDetailData, costingGridRMData } = costWorking;

    return { activeCostingListData, getCostingDetailData, costingGridRMData }
}

export default connect(
    mapStateToProps, {
    createNewCosting,
    getCostingBySupplier,
    getCostingDetailsById
}
)(CostWorking);

