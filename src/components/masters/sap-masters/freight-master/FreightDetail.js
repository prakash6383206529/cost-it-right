import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import { getFreightDetailAPI, deleteFreightAPI } from '../../../../actions/master/Freight';
import { Loader } from '../../../common/Loader';
import Addfreight from './AddFreight';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import NoContentFound from '../../../common/NoContentFound';


class PackagingDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            FreightType: 1, // FreightType 1 = 'Freight and 2 = 'Packaging'

        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        this.props.getFreightDetailAPI(res => { });
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
            FreightType: 1,
        })
    }

    /**
    * @method deleteItem 
    * @description confirm delete freight
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.CONFIRM_DELETE} freight ?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete bought out part
    */
    confirmDelete = (Id) => {
        this.props.deleteFreightAPI(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.DELETE_FREIGHT_SUCCESS);
                this.props.getFreightDetailAPI(res => { });
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
        return (
            <>
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col>
                        <Table className="table table-striped" bordered>
                            {this.props.freightDetail && this.props.freightDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`Source Supplier`}</th>
                                        <th>{`Destination Supplier`}</th>
                                        <th>{`Source Supplier Plant`}</th>
                                        <th>{`Destination Supplier Plant`}</th>
                                        <th>{`Source Supplier City`}</th>
                                        <th>{`Destination Supplier City`}</th>
                                        <th>{`Per Kg`}</th>
                                        <th>{`Per Cubic Feet`}</th>
                                        <th>{`1 Ton Ace`}</th>
                                        <th>{`2 Ton`}</th>
                                        <th>{`5 Ton`}</th>
                                        <th>{`9 Ton`}</th>
                                        <th>{`11 Ton`}</th>
                                        <th>{`16 Ton`}</th>
                                        <th>{`25 Ton`}</th>
                                        <th>{`31 Ton`}</th>
                                        <th>{`Trailer`}</th>
                                        <th>{`Expenses`}</th>
                                        <th>{`TollTax`}</th>
                                        <th>{`Concession`}</th>
                                        <th>{`Action`}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.freightDetail && this.props.freightDetail.length > 0 &&
                                    this.props.freightDetail.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{item.SourceSupplierName}</td>
                                                <td>{item.DestinationSupplierName}</td>
                                                <td>{item.SourceSupplierPlantName}</td>
                                                <td>{item.DestinationSupplierPlantName}</td>
                                                <td>{item.SourceSupplierCityName}</td>
                                                <td>{item.DestinationSupplierCityName}</td>
                                                <td>{item.PartTruckLoadRatePerKilogram}</td>
                                                <td>{item.PartTruckLoadRateCubicFeet}</td>
                                                <td>{item.FullTruckLoadRateOneTon}</td>
                                                <td>{item.FullTruckLoadRateTwoTon}</td>
                                                <td>{item.FullTruckLoadRateFiveTon}</td>
                                                <td>{item.FullTruckLoadRateNineTon}</td>
                                                <td>{item.FullTruckLoadRateElevenTon}</td>
                                                <td>{item.FullTruckLoadRateSixteenTon}</td>
                                                <td>{item.FullTruckLoadRateTwentyFiveTon}</td>
                                                <td>{item.FullTruckLoadRateThirtyOneTon}</td>
                                                <td>{item.FullTruckLoadRateTrailer}</td>
                                                <td>{item.Expenses == null ? 0 : item.Expenses}</td>
                                                <td>{item.TollTax == null ? 0 : item.TollTax}</td>
                                                <td>{item.Concession == null ? 0 : item.Concession}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editDetails(item.FreightId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteItem(item.FreightId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.freightDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {isOpen && (
                    <Addfreight
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        freightId={freightId}
                        FreightType={this.state.FreightType}
                    />
                )}
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ freight }) {
    const { freightDetail, loading } = freight;
    return { freightDetail, loading }
}


export default connect(
    mapStateToProps, { getFreightDetailAPI, deleteFreightAPI }
)(PackagingDetail);

