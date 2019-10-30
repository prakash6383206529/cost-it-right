import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, Table } from "reactstrap";
import { getFuelAPI, getFuelDetailAPI } from '../../../../actions/master/Fuel';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';


class FuelDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
        this.props.getFuelDetailAPI(res => {});
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        return (
            <Container className="top-margin">
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.FUEL} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`} </h5>
                    </Col>
                </Row>
                <Col>
                <Table className="table table-striped" bordered>
                    <thead>
                        <tr>
                        <th>{`${CONSTANT.FUEL} ${CONSTANT.NAME}`}</th>
                        <th>{`${CONSTANT.UOM}`}</th> 
                        <th>{`${CONSTANT.STATE} ${CONSTANT.NAME}`}</th>
                        <th>{`${CONSTANT.DATE} To`}</th>
                        <th>{`${CONSTANT.DATE} From`}</th>
                        </tr>
                    </thead>
                    <tbody > 
                        {this.props.fuelList && this.props.fuelList.length > 0 &&
                            this.props.fuelList.map((item, index) => {
                                return (
                                    <tr key= {index}>
                                        <td >{item.FuelName}</td>
                                        <td>{item.UnitOfMeasurementName}</td> 
                                        <td>{item.StateName}</td>
                                        <td>{convertISOToUtcDate(item.ValidDateTo)}</td> 
                                        <td>{convertISOToUtcDate(item.ValidDateFrom)}</td> 
                                    </tr>
                                )
                            })}
                    </tbody> 
                </Table>
                </Col>
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ fuel }) {
    const { fuelList } = fuel;
    return { fuelList }
}


export default connect(
    mapStateToProps, { getFuelAPI, getFuelDetailAPI }
)(FuelDetail);

