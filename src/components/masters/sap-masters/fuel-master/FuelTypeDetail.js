import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, Table, Button } from "reactstrap";
import { getFuelAPI, deleteFuelTypeAPI } from '../../../../actions/master/Fuel';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';
import { MESSAGES } from '../../../../config/message';
import { toastr } from 'react-redux-toastr';


class FuelTypeDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
        this.props.getFuelAPI(res => { });
    }

    /**
    * @method editPartDetails
    * @description confirm delete part
    */
    editFuelDetails = (index, Id) => {
        this.props.editFuelTypeDetails(true, true, Id);
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
        this.props.deleteFuelTypeAPI(index, Id, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_FUEL_TYPE_SUCCESS);
                this.props.toggle('2');
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
                <Col>
                    <Table className="table table-striped" bordered>
                        <thead>
                            <tr>
                                <th>{`${CONSTANT.FUEL} ${CONSTANT.NAME}`}</th>
                                <th>{`${CONSTANT.DESCRIPTION}`}</th>
                                <th>{`${CONSTANT.DATE}`}</th>
                                <th>{``}</th>
                            </tr>
                        </thead>
                        <tbody >
                            {this.props.fuelDetailList && this.props.fuelDetailList.length > 0 &&
                                this.props.fuelDetailList.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td >{item.FuelName}</td>
                                            <td>{item.Description}</td>
                                            <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                            <td>
                                                <Button className="btn btn-secondary" onClick={() => this.editFuelDetails(index, item.FuelId)}><i className="fas fa-pencil-alt"></i></Button>
                                                <Button className="btn btn-danger" onClick={() => this.deleteRow(index, item.FuelId)}><i className="far fa-trash-alt"></i></Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </Table>
                </Col>
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
    const { fuelDetailList } = fuel;
    return { fuelDetailList }
}


export default connect(
    mapStateToProps, { getFuelAPI, deleteFuelTypeAPI }
)(FuelTypeDetail);

