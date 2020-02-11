import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import AddPlant from './AddPlant';
import { getPlantDataAPI, deletePlantAPI } from '../../../../actions/master/Plant';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant'
import { convertISOToUtcDate, renderAction } from '../../../../helper/util'
import { MESSAGES } from '../../../../config/message';
import { toastr } from 'react-redux-toastr';
import NoContentFound from '../../../common/NoContentFound';
import { getMenuByUser } from '../../../../actions/auth/AuthActions';
import { loggedInUserId } from '../../../../helper/auth';

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
        const loginUserId = loggedInUserId();
        this.props.getPlantDataAPI(res => { });
        if (loginUserId != null) {
            this.props.getMenuByUser(loginUserId, () => { })
        }
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
        return toastr.confirm(`Are you sure you want to delete this Plant?`, toastrConfirmOptions);
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
        renderAction('', '', '')
        return (
            <Container className="top-margin">
                {this.props.loading && <Loader />}
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
                        <Table className="table table-striped" bordered>
                            {this.props.plantDetail && this.props.plantDetail.length > 0 &&
                                <thead>
                                    <tr>
                                        <th>{`${CONSTANT.PLANT} ${CONSTANT.NAME}`}</th>
                                        <th>{`${CONSTANT.PLANT} ${CONSTANT.TITLE}`}</th>
                                        <th>{`Unit ${CONSTANT.NUMBER}`}</th>
                                        <th>{`${CONSTANT.ADDRESS}`}</th>
                                        <th>{`${CONSTANT.CITY}`}</th>
                                        <th>{`Status`}</th>
                                        <th>{`Created Date`}</th>
                                        <th>{``}</th>
                                    </tr>
                                </thead>}
                            <tbody >
                                {this.props.plantDetail && this.props.plantDetail.length > 0 &&
                                    this.props.plantDetail.map((item, index) => {
                                        const address1 = item.AddressLine1 != 'NA' ? `${item.AddressLine1}, ` : '';
                                        const address2 = item.AddressLine2 != 'NA' ? `${item.AddressLine2}, ` : '';
                                        const ZipCode = item.ZipCode != 0 ? item.ZipCode : '';
                                        return (
                                            <tr key={index}>
                                                <td >{item.PlantName}</td>
                                                <td>{item.PlantTitle}</td>
                                                <td>{item.UnitNumber}</td>
                                                <td>{`${address1} ${address2} ${ZipCode}`}</td>
                                                <td>{item.CityName}</td>
                                                <td>{item && item.IsActive ? 'Active' : 'Inactive'}</td>
                                                <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editRow(index, item.PlantId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deleteRow(index, item.PlantId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                {this.props.plantDetail === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
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
function mapStateToProps({ plant, auth }) {
    const { menusData } = auth
    const { plantDetail, loading } = plant;
    return { plantDetail, loading, menusData }
}


export default connect(
    mapStateToProps, { getPlantDataAPI, deletePlantAPI, getMenuByUser }
)(PlantMaster);

