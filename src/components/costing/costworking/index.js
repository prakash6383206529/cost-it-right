import React, { Component } from 'react';
import { connect } from 'react-redux';
import {createNewCosting, getCostingBySupplier,getCostingDetailsById } from '../../../actions/costing/CostWorking';
import { Button, Col, Table } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import AddWeightCosting from './AddWeightCosting';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';

class CostWorking extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            isOpen: false,
            isCollapes: false,
            PartId: '',
            isEditFlag: false
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
        this.setState({ isOpen: false });
    }

    /**haldle the cost working details collapes */
    collapsHandler = (costingId) => { 
        this.setState({ 
            isCollapes: !this.state.isCollapes,
            isEditFlag: true
        }, () => {
            if (this.state.isEditFlag) {
                this.props.getCostingDetailsById(costingId, true, res => {console.log('res from updating costing details ', res)}) 
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
        const {supplierId, plantId } = this.props;
        const { costingData } = this.props;
        /** getting part id from active costing list */
        if(costingData && costingData.ActiveCostingDetatils.length > 0){   
            const sheetmetalCostingData = {
                PartId: costingData.ActiveCostingDetatils[0].PartId,
                PlantId: plantId,
                SupplierId: supplierId,
                CreatedBy: 'string'
            } 
            /** create new costing on basis of selected supplier, part, and plat */
            this.props.createNewCosting(sheetmetalCostingData, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.NEW_COSTING_CREATE_SUCCESS);
                /** fetching records of supplier costing details */
                this.props.getCostingBySupplier(supplierId, (res) => { console.log('res', res) });
                this.setState({isCollapes: true})
                this.toggleModel();
            } else {
                toastr.error(res.data.message);
            }
            });
        } 
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isCollapes } = this.state;
        const { costingData,supplierId, plantId } = this.props;
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
                    {supplierId && plantId &&<h5><b>{`Costing Supplier List`}</b></h5>}
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
                                        <th>{`BOM`}</th>
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
                                        <td><button>Add</button></td>
                                        <td>{''}</td>
                                        <td>{''}</td>
                                        <td><button onClick={this.openModel}>Add</button></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td><button>Add</button></td>
                                        <td></td>
                                        <td><button>Add</button></td>
                                        <td><button>Add</button></td>
                                        <td></td>
                                        <td></td>
                                        <td><button>Add</button></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
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
    const { costingData, getCostingData } = costWorking;
    console.log('getCostingData: ', getCostingData);
    return { costingData, getCostingData }
}


export default connect(
    mapStateToProps, { createNewCosting, getCostingBySupplier, getCostingDetailsById}
)(CostWorking);

