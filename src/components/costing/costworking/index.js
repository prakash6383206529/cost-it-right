import React, { Component } from 'react';
import { connect } from 'react-redux';
import { UncontrolledCollapse, Button, CardBody, Card, Col, Table } from 'reactstrap';
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import classnames from 'classnames';
import AddWeightCosting from './AddWeightCosting';
import NoContentFound from '../../common/NoContentFound';


class CostWorking extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            isOpen: false,
            isCollapes: false,
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

    collapsHandler = () => {
        this.setState({ isCollapes: !this.state.isCollapes })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isCollapes } = this.state;
        const { costingData } = this.props;
        // const { PartDetail, TechnologyDetail } = costingData;
        return (
            <div>
                {this.props.loading && <Loader />}
                <Col md="12">
                    {costingData && `Part No. : ${costingData.PartDetail.PartNumber} Costing Type : ${costingData.SupplierType} Supplier Name : ${costingData.SupplierName} Supplier Code : ${costingData.SupplierCode} Created On : `}
                    <hr />
                    <Button color="secondary">
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
                                            <td><div onClick={this.collapsHandler} color="secondary" id="toggler">{item.PartNumber}</div></td>
                                            <td>{costingData.TechnologyDetail && costingData.TechnologyDetail.TechnologyName}</td>
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
    const { costingData } = costWorking;
    return { costingData }
}


export default connect(
    mapStateToProps, {}
)(CostWorking);

