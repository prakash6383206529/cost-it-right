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
        return toastr.confirm(`${MESSAGES.CONFIRM_DELETE} BOP ?`, toastrConfirmOptions);
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
                        <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th>
                        <th>{`${CONSTANT.SOURCE} ${CONSTANT.CITY} ${CONSTANT.NAME}`}</th>
                        <th>{`${CONSTANT.DESTINATION} ${CONSTANT.CITY} ${CONSTANT.NAME}`}</th> 
                        <th>{`${CONSTANT.FREIGHT} To From`}</th>
                        <th>{`Part Truck Load Rate PerKilogram`}</th>
                        <th>{`Part Truck Load Rate CubicFeet`}</th>
                        <th>{`FullTruck Load Rate OneTon`}</th>
                        <th>{`Full Truck Load Rate TwoTon`}</th>
                        <th>{`Full Truck Load Rate FiveTon`}</th>
                        <th>{`Full Truck Load Rate NineTon`}</th> 
                        <th>{`Full Truck Load Rate ElevenTon`}</th>
                        <th>{`Full Truck Load Rate SixteenTon`}</th>
                        <th>{`Full Truck Load Rate Twenty FiveTon`}</th>
                        <th>{`Full Truck Load Rate Thirty OneTon`}</th>
                        <th>{`Full Truck Load Rate Trailer`}</th>
                        <th>{`${CONSTANT.DATE}`}</th>
                        </tr>
                    </thead>
                    <tbody > 
                        {this.props.freightDetail && this.props.freightDetail.length > 0 &&
                            this.props.freightDetail.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{item.PlantName}</td> 
                                        <td >{item.SourceCityName}</td>
                                        <td>{item.DestinationCityName}</td>
                                        <td>{item.FreightToFrom}</td> 
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
                                        <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                        <div>
                                            <Button className="btn btn-secondary" onClick={() => this.editDetails(item.FreightId)}><i className="fas fa-pencil-alt"></i></Button>
                                            <Button className="btn btn-danger" onClick={() => this.deleteBOP(item.FreightId)}><i className="far fa-trash-alt"></i></Button>
                                        </div>  
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

