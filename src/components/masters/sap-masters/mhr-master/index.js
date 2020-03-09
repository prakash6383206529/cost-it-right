import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddMHR from './AddMHR';
import { fetchMHRListAPI, deleteMHRAPI } from '../../../../actions/master/MHRMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';

class MHRMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            MachineHourRateId: '',
        }
    }

    /**
     * @method componentDidMount
     * @description  called before rendering the component
     */
    componentDidMount() {
        this.props.fetchMHRListAPI(res => { });
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
            this.props.fetchMHRListAPI(res => { });
        })
    }

    /**
    * @method editItemDetails
    * @description Edit operation detail
    */
    editItemDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            MachineHourRateId: Id,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete item
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.MHR_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteUOM
    * @description confirm delete unit of measurement
    */
    confirmDelete = (Id) => {
        this.props.deleteMHRAPI(Id, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_MHR_SUCCESS);
                this.props.fetchMHRListAPI(res => { });
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag } = this.state;
        return (
            <Container className="top-margin">
                {/* {this.props.loading && <Loader />} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.MHR} ${CONSTANT.MASTER} `}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.MHR}`}</Button>
                    </Col>
                </Row>

                <hr />
                <Row>
                    <Col>
                        <div>
                            <Table className="table table-striped" bordered>
                                {this.props.mhrMasterList && this.props.mhrMasterList.length > 0 &&
                                    <thead>
                                        <tr>
                                            <th>Technology</th>
                                            <th>Supplier Code</th>
                                            <th>Supplier Name</th>
                                            <th>Machine No.</th>
                                            <th>Description</th>
                                            <th>Machine Capacity</th>
                                            <th>Machine Rate</th>
                                            <th>UOM</th>
                                            <th>{''}</th>

                                        </tr>
                                    </thead>}
                                <tbody >
                                    {this.props.mhrMasterList && this.props.mhrMasterList.length > 0 &&
                                        this.props.mhrMasterList.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td >{item.TechnologyName}</td>
                                                    <td>{item.SupplierName}</td>
                                                    <td>{item.SupplierName}</td>
                                                    <td>{item.MachineNumber}</td>
                                                    <td>{item.Description}</td>
                                                    <td>{item.MachineCapacity}</td>
                                                    <td>{item.MachineCapacity}</td>
                                                    <td>{item.UnitOfMeasurementName}</td>
                                                    <td>
                                                        <Button className="black-btn" onClick={() => this.editItemDetails(item.MachineHourRateId)}><i className="fas fa-pencil-alt"></i></Button>
                                                        <Button className="black-btn" onClick={() => this.deleteItem(item.MachineHourRateId)}><i className="far fa-trash-alt"></i></Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    {this.props.mhrMasterList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
                {isOpen && (
                    <AddMHR
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        MachineHourRateId={this.state.MachineHourRateId}
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
function mapStateToProps({ MHRReducer }) {
    const { mhrMasterList, loading } = MHRReducer;
    return { mhrMasterList, loading }
}


export default connect(
    mapStateToProps, {
    fetchMHRListAPI,
    deleteMHRAPI,
}
)(MHRMaster);

