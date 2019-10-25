import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, Button, Table } from "reactstrap";
import AddFuelDetail from './AddFuelDetail';
import AddFuel from './AddFuel';
import { getFuelAPI, getFuelDetailAPI } from '../../../../actions/master/Fuel';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';


class FuelMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isOpenModel: false
        }
    }

    componentDidMount() {
        this.props.getFuelDetailAPI(res => {});
    }
    /**
     * @method openModel
     * @description  used to open filter form 
     */
    openModel = () => {
        this.setState({ isOpen: true })
    }
    openCategoryModel = () => {
        this.setState({ isOpenModel: true})
    }

    /**
     * @method onCancel
     * @description  used to cancel filter form
     */
    onCancel = () => {
        this.setState({ isOpen: false, isOpenModel: false})
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen,isOpenModel } = this.state;
        return (
            <Container className="top-margin">
                <Row>
                    <Col>
                        <h3>Fuel Master </h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>Add Fuel</Button>
                    </Col>
                    <Col>
                        <Button onClick={this.openCategoryModel}>Add Fuel Detail</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h5>{`Fuel ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`} </h5>
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
                {isOpen && (
                    <AddFuel
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                    />
                )}
                {isOpenModel && (
                    <AddFuelDetail
                        isOpen={isOpenModel}
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
function mapStateToProps({ fuel }) {
    const { fuelList } = fuel;
    console.log('fuelList: ', fuelList);
    return { fuelList }
}


export default connect(
    mapStateToProps, { getFuelAPI, getFuelDetailAPI }
)(FuelMaster);

