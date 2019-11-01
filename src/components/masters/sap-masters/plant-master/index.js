import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddPlant from './AddPlant';
import { getPlantDataAPI, deletePlantAPI } from '../../../../actions/master/Plant';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant'
import { MESSAGES } from '../../../../config/message';
import { toastr } from 'react-redux-toastr';

class PlantMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            PlantId: ''
        }
    }

    componentDidMount() {
        this.props.getPlantDataAPI(res => { });
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
        this.setState({ isOpen: false }, () => {
            this.props.getPlantDataAPI(res => { });
        })
    }

    /**
    * @method editPartDetails
    * @description confirm delete part
    */
    editRow = (index, Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            PlantId: Id,
        })
    }

    /**
    * @method deleteRow
    * @description confirm delete
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
    * @method confirmDelete
    * @description confirm delete unit of measurement
    */
    confirmDelete = (index, Id) => {
        this.props.deletePlantAPI(index, Id, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_PLANT_SUCCESS);
                this.props.getPlantDataAPI(res => { });
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
        const { isOpen, PlantId, isEditFlag } = this.state;
        return (
            <Container className="top-margin">
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.PLANT} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.PLANT} `}</Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.PLANT} ${CONSTANT.MASTER} ${CONSTANT.DETAILS}`}</h5>
                    </Col>
                </Row>
                <Col>
                    <Table className="table table-striped" bordered>
                        <thead>
                            <tr>
                                <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th>
                                <th>{`${CONSTANT.PLANT} ${CONSTANT.TITLE}`}</th>
                                <th>{`Unit ${CONSTANT.NUMBER}`}</th>
                                <th>{`${CONSTANT.ADDRESS}`}</th>
                                <th>{`${CONSTANT.CITY}`}</th>
                                <th>{``}</th>
                            </tr>
                        </thead>
                        <tbody >
                            {this.props.plantDetail && this.props.plantDetail.length > 0 &&
                                this.props.plantDetail.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td >{item.PlantName}</td>
                                            <td>{item.PlantTitle}</td>
                                            <td>{item.UnitNumber}</td>
                                            <td>{item.Address}</td>
                                            <td>{item.CityName}</td>
                                            <td>
                                                <Button className="btn btn-secondary" onClick={() => this.editRow(index, item.PlantId)}><i className="fas fa-pencil-alt"></i></Button>
                                                <Button className="btn btn-danger" onClick={() => this.deleteRow(index, item.PlantId)}><i className="far fa-trash-alt"></i></Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </Table>
                </Col>
                {isOpen && (
                    <AddPlant
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        PlantId={PlantId}
                        isEditFlag={isEditFlag}
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
function mapStateToProps({ plant }) {
    const { plantDetail, loading } = plant;
    return { plantDetail, loading }
}


export default connect(
    mapStateToProps, { getPlantDataAPI, deletePlantAPI }
)(PlantMaster);

