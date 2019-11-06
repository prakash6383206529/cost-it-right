import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table } from 'reactstrap';
import Addfreight from './AddFreight';
import { getFreightDetailAPI, deleteFreightAPI } from '../../../../actions/master/Freight';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';


class FreightMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            freightType: 1,

        }
    }

    componentDidMount() {
        this.props.getFreightDetailAPI(res => {});
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
        })
    }

    /**
    * @method delete 
    * @description confirm delete bop
    */
    deleteBOP = (Id) => {
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
        const { isOpen, isEditFlag, freightId, freightType } = this.state;
        return (
            <Container className="top-margin">
            {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.FREIGHT} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.FREIGHT} `}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.FREIGHT} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row>
                <Col>
                <Table className="table table-striped" bordered>
                    <thead>
                        <tr>
                        <th>{`${CONSTANT.FREIGHT} ${CONSTANT.TYPE}`}</th>
                        <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th>
                        {freightType !== 2 &&<th>{`${CONSTANT.SOURCE} ${CONSTANT.CITY} ${CONSTANT.NAME}`}</th>}
                        {freightType !== 2 &&<th>{`${CONSTANT.DESTINATION} ${CONSTANT.CITY} ${CONSTANT.NAME}`}</th> }
                        {freightType !== 2 &&<th>{`${CONSTANT.FREIGHT} To From`}</th>}
                        {freightType !== 2 &&<th>{`Part Truck Load Rate PerKilogram`}</th>}
                        {freightType !== 2 &&<th>{`Part Truck Load Rate CubicFeet`}</th>}
                        {freightType !== 2 &&<th>{`FullTruck Load Rate OneTon`}</th>}
                        {freightType !== 2 &&<th>{`Full Truck Load Rate TwoTon`}</th>}
                        {freightType !== 2 &&<th>{`Full Truck Load Rate FiveTon`}</th>}
                        {freightType !== 2 &&<th>{`Full Truck Load Rate NineTon`}</th> }
                        {freightType !== 2 &&<th>{`Full Truck Load Rate ElevenTon`}</th>}
                        {freightType !== 2 &&<th>{`Full Truck Load Rate SixteenTon`}</th>}
                        {freightType !== 2 &&<th>{`Full Truck Load Rate Twenty FiveTon`}</th>}
                        {freightType !== 2 &&<th>{`Full Truck Load Rate Thirty OneTon`}</th>}
                        {freightType !== 2 &&<th>{`Full Truck Load Rate Trailer`}</th>}
                        {freightType === 2 &&<th>{`Supplier Name`}</th>}
                        {freightType === 2 &&<th>{`Per Trip Cost`}</th> }
                        {freightType === 2 &&<th>{`Packaging Costing Head `}</th>}
                        {freightType === 2 &&<th>{`Packaging cost`}</th>}
                        {freightType === 2 &&<th>{`Per Kilogram`}</th>}
                        {freightType === 2 &&<th>{`Loding Unloading Costing Heads`}</th>}
                        {freightType === 2 &&<th>{`LodingUnloading`}</th>}
                        <th>{`${CONSTANT.DATE}`}</th>
                        <th>{'Status '}</th>
                        </tr>
                    </thead>
                    <tbody > 
                        {this.props.freightDetail && this.props.freightDetail.length > 0 &&
                            this.props.freightDetail.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{item.FreightType}</td>
                                        <td>{item.PlantName}</td> 
                                        { item.FreightType === 1 &&<td >{item.SourceCityName}</td>}
                                        { item.FreightType === 1 &&<td>{item.DestinationCityName}</td>}
                                        { item.FreightType === 1 &&<td>{item.FreightToFrom}</td>}
                                        { item.FreightType === 1 &&<td>{item.PartTruckLoadRatePerKilogram}</td>}
                                        { item.FreightType === 1 &&<td>{item.PartTruckLoadRateCubicFeet}</td>} 
                                        { item.FreightType === 1 &&<td>{item.FullTruckLoadRateOneTon}</td>}
                                        { item.FreightType === 1 &&<td>{item.FullTruckLoadRateTwoTon}</td>} 
                                        { item.FreightType === 1 &&<td>{item.FullTruckLoadRateFiveTon}</td>}
                                        { item.FreightType === 1 &&<td>{item.FullTruckLoadRateNineTon}</td> }
                                        { item.FreightType === 1 &&<td>{item.FullTruckLoadRateElevenTon}</td>}
                                        { item.FreightType === 1 &&<td>{item.FullTruckLoadRateSixteenTon}</td> }
                                        { item.FreightType === 1 &&<td>{item.FullTruckLoadRateTwentyFiveTon}</td>}
                                        { item.FreightType === 1 &&<td>{item.FullTruckLoadRateThirtyOneTon}</td> }
                                        { item.FreightType === 1 &&<td>{item.FullTruckLoadRateTrailer}</td>}
                                        { item.FreightType === 2 &&<td>{item.SupplierId}</td> }
                                        { item.FreightType === 2 &&<td>{item.PerTrip}</td>}
                                        { item.FreightType === 2 &&<td>{item.PackagingCostingHeadsId}</td> }
                                        { item.FreightType === 2 &&<td>{item.Packaging}</td>}
                                        { item.FreightType === 2 &&<td>{item.PerKilogram}</td> }
                                        { item.FreightType === 2 &&<td>{item.LodingUnloadingCostingHeadsId}</td>}
                                        { item.FreightType === 2 &&<td>{item.LodingUnloading}</td>}
                                        <td>{convertISOToUtcDate(item.CreatedDate)}</td>  
                                        <td>{item.IsActive}</td>
                                        <td>
                                            <Button className="btn btn-secondary" onClick={() => this.editDetails(item.FreightId)}><i className="fas fa-pencil-alt"></i></Button>
                                            <Button className="btn btn-danger" onClick={() => this.deleteBOP(item.FreightId)}><i className="far fa-trash-alt"></i></Button>
                                        </td>  
                                    </tr>
                                )
                            })}
                    </tbody>  
                </Table> 
                </Col>
                {isOpen && (
                    <Addfreight
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        freightId={freightId}
                    />
                )}
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
    const { freightDetail ,loading } = freight;
    return { freightDetail, loading }
}


export default connect(
    mapStateToProps, { getFreightDetailAPI,deleteFreightAPI }
)(FreightMaster);

