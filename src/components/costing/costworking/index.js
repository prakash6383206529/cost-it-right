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
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen } = this.state;
        const { costingData } = this.props;
        return (
            <div>
                {this.props.loading && <Loader />}
                <Col md="12">
                    {costingData && `Part No. : SMTEST Costing Type : ${costingData.SupplierType} Supplier Name : ${costingData.SupplierName} Supplier Code : ${costingData.SupplierCode} Created On : `}
                    <hr />
                    <h5><b>{`Material Details`}</b></h5>
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
                                            <td >{item.PartNumber}</td>
                                            <td>{''}</td>
                                            <td>{item.PlantName}</td>
                                            <td>{item.DisplayCreatedDate}</td>
                                            <td>{item.StatusName}</td>
                                        </tr>
                                    )
                                })}
                            {/* {costingData.ActiveCostingDetatils === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />} */}
                        </tbody>
                    </Table>
                    <hr />
                    <Button color="secondary" id="toggler" style={{ marginBottom: '3rem' }}>
                        New Costing
                    </Button>
                    <UncontrolledCollapse toggler="#toggler">
                        <Card>
                            <CardBody>
                                <Col><button>Add RM</button></Col>
                                <hr />
                                <Col><button onClick={this.openModel}>Add Weight</button></Col>
                                <hr />
                                <Col><button>Add BOP</button></Col>
                                <hr />
                                <Col><button>Add Process</button></Col>
                                <hr />
                                <Col><button>Add other operation</button></Col>
                                <hr />
                            </CardBody>
                        </Card>
                    </UncontrolledCollapse>
                </Col>
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

