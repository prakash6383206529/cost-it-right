import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import { getAllAdditionalFreightAPI, deleteAdditionalFreightAPI } from '../../../../actions/master/Freight';
import { Loader } from '../../../common/Loader';
import Addfreight from './AddFreight';
import { CONSTANT } from '../../../../helper/AllConastant';
import { convertISOToUtcDate } from '../../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import NoContentFound from '../../../common/NoContentFound';

class PackagingDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            freightType: 2,
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        this.props.getAllAdditionalFreightAPI(res => { });
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
        this.setState({ isOpen: false })
    }

    /**
   * @method editDetails
   * @description confirm delete bop
   */
    editDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            freightId: Id,
            FreightType: 2,
        })
    }

    /**
    * @method deleteItem 
    * @description Delete additional freight
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`Are you sure you want to delete Additional Freight?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete bought out part
    */
    confirmDelete = (Id) => {
        this.props.deleteAdditionalFreightAPI(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.DELETE_ADDITIONAL_FREIGHT_SUCCESS);
                this.props.getAllAdditionalFreightAPI(() => { })
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, freightId } = this.state;
        const { packagingDataRows } = this.props;
        return (
            <Container>
                {/* {this.props.loading && <Loader/>} */}
                {/* <Row>
                    <Col>
                        <h5>{`Packaging ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row> */}
                <Row>
                    <Col>
                        <Table className="table table-striped" bordered>
                            {packagingDataRows && packagingDataRows.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`Source Supplier`}</th>
                                        <th>{`Source Plant`}</th>
                                        <th>{`Destination Plant`}</th>
                                        <th>{`Packaging Costing Head`}</th>
                                        <th>{`Packaging cost`}</th>
                                        <th>{`Loading Unloading Costing Heads`}</th>
                                        <th>{`Loading Unloading Cost`}</th>
                                        <th>{`Trip`}</th>
                                        <th>{`Per Trip Cost`}</th>
                                        <th>{`Total Kilogram`}</th>
                                        <th>{`Per Kilogram Rate`}</th>
                                        <th>{`Freight Discount`}</th>
                                        <th>{`Action`}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {packagingDataRows && packagingDataRows.length > 0 &&
                                    packagingDataRows.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{item.SourceSupplierName}</td>
                                                <td>{item.SourceSupplierPlantName}</td>
                                                <td>{item.DestinationSupplierPlantName}</td>
                                                <td>{item.PackagingCostingHeadsName}</td>
                                                <td>{item.NetPackagingCost}</td>
                                                <td>{item.LodingUnloadingCostingHeadsName}</td>
                                                <td>{item.NetLodingUnloadingCost}</td>
                                                <td>{item.Trip}</td>
                                                <td>{item.PerTripRate}</td>
                                                <td>{item.TotalKilogram}</td>
                                                <td>{item.PerKilogramRate}</td>
                                                <td>{item.FreightDiscount}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editDetails(item.AdditionalFreightId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteItem(item.AdditionalFreightId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.packagingDataRows === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {
                    isOpen && (
                        <Addfreight
                            isOpen={isOpen}
                            onCancel={this.onCancel}
                            isEditFlag={isEditFlag}
                            freightId={freightId}
                            FreightType={this.state.FreightType}
                        />
                    )
                }
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ freight }) {
    const { packagingDataRows, loading } = freight;
    return { packagingDataRows, loading }
}


export default connect(
    mapStateToProps, {
    getAllAdditionalFreightAPI,
    deleteAdditionalFreightAPI
}
)(PackagingDetail);

