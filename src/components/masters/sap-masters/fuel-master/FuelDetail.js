import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, Table, Button } from "reactstrap";
import { getFuelAPI, getFuelDetailAPI, deleteFuelDetailAPI } from '../../../../actions/master/Fuel';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';
import { MESSAGES } from '../../../../config/message';
import { toastr } from 'react-redux-toastr';


class FuelDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        this.props.getFuelDetailAPI(res => { });
    }

    /**
    * @method editPartDetails
    * @description confirm delete part
    */
    editFuelDetails = (index, Id) => {
        this.props.editFuelDetails(true, true, Id);
    }

    /**
    * @method deletePart
    * @description confirm delete part
    */
    deleteRow = (index, Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(index, Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.CONFIRM_DELETE} UOM ?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteUOM
    * @description confirm delete unit of measurement
    */
    confirmDelete = (index, Id) => {
        this.props.deleteFuelDetailAPI(index, Id, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_FUEL_DETAIL_SUCCESS);
                this.props.toggle('1');
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
        return (
            <div>
                {/* <Container className="top-margin"> */}
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.FUEL} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`} </h5>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Table className="table table-striped" bordered>
                            <thead>
                                <tr>
                                    <th>{`Rate`}</th>
                                    <th>{`${CONSTANT.FUEL} ${CONSTANT.NAME}`}</th>
                                    <th>{`${CONSTANT.UOM}`}</th>
                                    <th>{`${CONSTANT.STATE} ${CONSTANT.NAME}`}</th>
                                    <th>{`${CONSTANT.DATE} From`}</th>
                                    <th>{`${CONSTANT.DATE} To`}</th>
                                    <th>{``}</th>

                                </tr>
                            </thead>
                            <tbody >
                                {this.props.fuelList && this.props.fuelList.length > 0 &&
                                    this.props.fuelList.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.Rate}</td>
                                                <td >{item.FuelName}</td>
                                                <td>{item.UnitOfMeasurementName}</td>
                                                <td>{item.StateName}</td>
                                                <td>{convertISOToUtcDate(item.ValidDateFrom)}</td>
                                                <td>{convertISOToUtcDate(item.ValidDateTo)}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editFuelDetails(index, item.FuelDetailId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteRow(index, item.FuelDetailId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                {/* </Container > */}
            </div>
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
    mapStateToProps, { getFuelAPI, getFuelDetailAPI, deleteFuelDetailAPI }
)(FuelDetail);

