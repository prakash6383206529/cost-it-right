import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Table, Button } from "reactstrap";
import { getFuelAPI, deleteFuelTypeAPI } from '../../../../actions/master/Fuel';
import { CONSTANT } from '../../../../helper/AllConastant';
import {
    convertISOToUtcDate,
} from '../../../../helper';
import { MESSAGES } from '../../../../config/message';
import { toastr } from 'react-redux-toastr';
import NoContentFound from '../../../common/NoContentFound';

class FuelTypeDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
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
    * @method deleteRow
    * @description confirm delete Fuel
    */
    deleteRow = (index, Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(index, Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.FUEL_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Fuel
    */
    confirmDelete = (index, Id) => {
        this.props.deleteFuelTypeAPI(index, Id, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_FUEL_TYPE_SUCCESS);
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
                <Row>
                    <Col>
                        <Table className="table table-striped" size={'sm'} hover bordered>
                            {this.props.fuelDetailList && this.props.fuelDetailList.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`${CONSTANT.FUEL} ${CONSTANT.NAME}`}</th>
                                        <th>{`${CONSTANT.DESCRIPTION}`}</th>
                                        <th>{`${CONSTANT.DATE}`}</th>
                                        <th>{``}</th>
                                    </tr>
                                </thead>}
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
                                {this.props.fuelDetailList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
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

