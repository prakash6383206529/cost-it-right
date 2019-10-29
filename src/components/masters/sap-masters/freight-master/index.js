import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table } from 'reactstrap';
import Addfreight from './AddFreight';
import { getFreightDetailAPI } from '../../../../actions/master/Freight';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';


class FreightMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
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
        this.setState({ isOpen: true })
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({ isOpen: false })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen } = this.state;
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
    mapStateToProps, { getFreightDetailAPI }
)(FreightMaster);

