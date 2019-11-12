import React, { Component } from 'react';
import { connect } from 'react-redux';
import {createNewCosting } from '../../../actions/costing/CostWorking';
import { UncontrolledCollapse, Button, CardBody, Card, Col, Table } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import classnames from 'classnames';
import AddWeightCosting from './AddWeightCosting';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';


class CostWorking extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            isOpen: false
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

    /**
     * @method createNewCosting
     * @description  used to create new costing 
     */
    createNewCosting = () => {
        const sheetmetalCostingData = {
            PlantId: "ad7c2b9c-f292-42af-9891-e0cdb3c032f0",
            PartId: "b9b2b3b4-f8bc-4859-beae-1bd3e85d0feb",
            SupplierId: "1f8fca58-ed3f-43cf-94b7-392c6ddc15b2",
        }
        this.props.createNewCosting()
        this.props.createNewCosting(sheetmetalCostingData, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.NEW_COSTING_CREATE_SUCCESS);
                this.toggleModel();
            } else {
                toastr.error(res.data.message);
            }
        });
    }
    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isCollapes } = this.state;
        const { costingData } = this.props;
        return (
            <div>
                {this.props.loading && <Loader />}
                <Col md="12">
                    {costingData && `Part No. : ${'SMTEST'} Costing Type : ${costingData.SupplierType} Supplier Name : ${costingData.SupplierName} Supplier Code : ${costingData.SupplierCode} Created On : `}
                    <hr />
                    <Button color="secondary" onClick={() => this.createNewCosting()} >
                        New Costing
                    </Button>
                    <h5><b>{`Costing Supplier List`}</b></h5>
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
                                            <a href="javascript:void(0)" onClick={() => this.setState({isCollapes: true})} color="secondary" id="toggler"><td >{item.PartNumber}</td></a>
                                            <td>{'SheetMetal'}</td>
                                            <td>{item.PlantName}</td>
                                            <td>{item.DisplayCreatedDate}</td>
                                            <td>{item.StatusName}</td>
                                        </tr>
                                    )
                                })}
                           
                        </tbody>
                    </Table>
                    <hr />
                </Col>
                {isOpen && (
                    <AddWeightCosting
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                    />
                )}
                {isCollapes && (
                    <div>
                    <UncontrolledCollapse toggler="#toggler">
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
            </UncontrolledCollapse>
            </div> 
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
    const { costingData } = costWorking;
    return { costingData }
}


export default connect(
    mapStateToProps, {createNewCosting}
)(CostWorking);

