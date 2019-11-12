import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createNewCosting, getCostingBySupplier, getCostingDetailsById } from '../../../actions/costing/CostWorking';
import { Button, Col, Table, Label } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import AddWeightCosting from './AddWeightCosting';
import AddRawMaterialCosting from './AddRawMaterialCosting';
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
            costingId: ''
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
        this.setState({ isOpen: false, isOpenRMmodel: false });
    }

    /**haldle the cost working details collapes */
    collapsHandler = (costingId) => {
        this.setState({
            isCollapes: !this.state.isCollapes,
            isEditFlag: true
        }, () => {
            if (this.state.isEditFlag) {
                this.props.getCostingDetailsById(costingId, true, res => { })
            } else {
                this.props.getCostingDetailsById('', false, res => { })
            }
        })
    }

    /**
     * @method createNewCosting
     * @description  used to create new costing 
     */
    createNewCosting = () => {
        const { supplierId, plantId } = this.props;
        const { costingData } = this.props;
        /** getting part id from active costing list */
        if (costingData && costingData.ActiveCostingDetatils.length > 0) {
            const sheetmetalCostingData = {
                PartId: costingData.ActiveCostingDetatils[0].PartId,
                PlantId: plantId,
                SupplierId: supplierId,
                CreatedBy: ''
            }
            /** create new costing on basis of selected supplier, part, and plat */
            this.props.createNewCosting(sheetmetalCostingData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.NEW_COSTING_CREATE_SUCCESS);
                    /** fetching records of supplier costing details */
                    this.props.getCostingBySupplier(supplierId, (res) => { console.log('res', res) });
                    this.setState({
                        isCollapes: true,
                        isEditFlag: true,
                        costingId: res.data.Identity
                    })
                    this.toggleModel();
                } else {
                    toastr.error(res.data.message);
                }
            });
        }
    }

    /**
     * @method openRMModel
     * @description  used to open openRMModel 
     */
    openRMModel = () => {
        this.setState({ isOpenRMmodel: !this.state.isOpenRMmodel })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isCollapes, isEditFlag, isOpenRMmodel, costingId } = this.state;
        const { costingData, supplierId, plantId, getCostingData, costingGridRMData } = this.props;
        return (
            <div>
                {this.props.loading && <Loader />}
                <Col md="12">
                    {costingData && `Part No. : ${costingData.PartDetail.PartNumber} Costing Type : ${costingData.SupplierType} Supplier Name : ${costingData.SupplierName} Supplier Code : ${costingData.SupplierCode} Created On : `}
                    <hr />
                    {supplierId && plantId &&
                        <Button color="secondary" onClick={() => this.createNewCosting()} >
                            New Costing
                    </Button>}
                    {supplierId && plantId && <h5><b>{`Costing Supplier List`}</b></h5>}
                    <Table className="table table-striped" bordered>
                        {costingData && costingData.ActiveCostingDetatils.length > 0 &&
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
                            {costingData && costingData.ActiveCostingDetatils.length > 0 &&
                                costingData.ActiveCostingDetatils.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td><div onClick={() => this.collapsHandler(item.CostingId)} color="secondary" id="toggler">{item.PartNumber}</div></td>
                                            <td>{costingData.TechnologyDetail && costingData.TechnologyDetail.TechnologyName}</td>
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
                        {isEditFlag &&
                            <div className={'create-costing-grid'}>
                                <Table className="table table-striped" bordered>
                                    <thead>
                                        <tr>
                                            <th>{`BOM Level`}</th>
                                            <th>{`Assy Part No.`}</th>
                                            <th>{`Child Part No.`}</th>
                                            <th>{`Part Description`}</th>
                                            <th>{`Costing Heads`}</th>
                                            <th>{`Qty/Assy`}</th>
                                        </tr>
                                    </thead>
                                    <tbody >
                                        <tr >
                                            <td>{costingData.PartDetail.BillOfMaterialLevel}</td>
                                            <td>{costingData.PartDetail.PartNumber}</td>
                                            <td>{''}</td>
                                            <td>{costingData.PartDetail.PartDescription}</td>
                                            <td>{}</td>
                                            <td>{}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>}
                        <div className={'create-costing-grid'}>
                            <Table className="table table-striped" bordered>
                                <thead>
                                    <tr>
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
                                        {/* <td><button onClick={this.openRMModel}>{costingGridRMData ? costingGridRMData.RawMaterialName : 'Add'}</button></td> */}
                                        <td><button onClick={this.openRMModel}>{costingGridRMData ? 'RawMaterialName' : 'Add'}</button></td>
                                        <td>{costingGridRMData ? costingGridRMData.RawMaterialRate : 0}</td>
                                        <td>{costingGridRMData ? costingGridRMData.RawMaterialScrapRate : 0}</td>
                                        <td><button onClick={this.openModel}>Add</button></td>
                                        <td>{isEditFlag ? '0' : ''}</td>
                                        <td>{isEditFlag ? '0' : ''}</td>
                                        <td>{isEditFlag ? '0' : ''}</td>
                                        <td><button>Add</button></td>
                                        <td>{isEditFlag ? '0' : ''}</td>
                                        <td><button>Add</button></td>
                                        <td>{isEditFlag ? '0' : ''}</td>
                                        <td>{isEditFlag ? '0' : ''}</td>
                                        <td><button>Add</button></td>
                                        <td>{isEditFlag ? '0' : ''}</td>
                                        <td>{isEditFlag ? '0' : ''}</td>
                                        <td>{isEditFlag ? '0' : ''}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                )}
                {isOpen && (
                    <AddWeightCosting
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                    />
                )}
                {isOpenRMmodel && (
                    <AddRawMaterialCosting
                        isOpen={isOpenRMmodel}
                        onCancel={this.onCancel}
                        supplierId={supplierId}
                        costingId={costingId}
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
    const { costingData, getCostingData, costingGridRMData } = costWorking;
    console.log('getCostingData: ', getCostingData);
    return { costingData, getCostingData, costingGridRMData }
}


export default connect(
    mapStateToProps, { createNewCosting, getCostingBySupplier, getCostingDetailsById }
)(CostWorking);

