import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, Table } from "reactstrap";
import { getFuelAPI } from '../../../../actions/master/Fuel';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';


class FuelTypeDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
        this.props.getFuelAPI(res => {});
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
                        <th>{`${CONSTANT.DESCRIPTION}`}</th> 
                        <th>{`${CONSTANT.DATE}`}</th>
                        </tr>
                    </thead>
                    <tbody > 
                        {this.props.fuelDetailList && this.props.fuelDetailList.length > 0 &&
                            this.props.fuelDetailList.map((item, index) => {
                                return (
                                    <tr key= {index}>
                                        <td >{item.FuelName}</td>
                                        <td>{item.Description}</td> 
                                        <td>{convertISOToUtcDate(item.CreatedDate)}</td> 
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
    const { fuelDetailList } = fuel;
    return { fuelDetailList }
}


export default connect(
    mapStateToProps, { getFuelAPI }
)(FuelTypeDetail);

