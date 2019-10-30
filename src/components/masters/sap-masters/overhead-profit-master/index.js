import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddOverheadProfit from './AddOverheadProfit';
import { getOverheadProfitAPI } from '../../../../actions/master/OverheadProfit';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import moment from 'moment';

class OverheadProfit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
        }
    }

    /**
     * @method componentDidMount
     * @description  called before rendering the component
     */
    componentDidMount() {
        this.props.getOverheadProfitAPI(res => { });
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
            this.props.getOverheadProfitAPI(res => { });
        })
    }

    /**
    * @method editPartDetails
    * @description confirm delete part
    */
    editPartDetails = (index, Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            uomId: Id,
        })
    }

    /**
    * @method deletePart
    * @description confirm delete part
    */
    deletePart = (index, Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteUOM(index, Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.CONFIRM_DELETE} UOM ?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteUOM
    * @description confirm delete unit of measurement
    */
    confirmDeleteUOM = (index, Id) => {
        // this.props.deleteUnitOfMeasurementAPI(index, Id, (res) => {
        //     if (res.data.Result === true) {
        //         toastr.success(MESSAGES.DELETE_UOM_SUCCESS);
        //         this.props.getUnitOfMeasurementAPI(res => { });
        //     } else {
        //         toastr.error(MESSAGES.SOME_ERROR);
        //     }
        // });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, editIndex, uomId } = this.state;
        return (
            <Container className="top-margin">
                {/* {this.props.loading && <Loader />} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.ADD} ${CONSTANT.OVERHEAD_AND_PROFIT}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.OVERHEAD_AND_PROFIT}`}</Button>
                    </Col>
                </Row>

                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.ADD} ${CONSTANT.OVERHEAD_AND_PROFIT} ${CONSTANT.DETAILS}`} </h5>
                    </Col>
                </Row>
                <Col>
                    <div>
                        <Table className="table table-striped" bordered>
                            <thead>
                                <tr>
                                    <th>Supplier Code</th>
                                    <th>Supplier Name</th>
                                    <th>Technology</th>
                                    <th>Overhead Type</th>
                                    <th>Overhead Percent</th>
                                    <th>Profit Type</th>
                                    <th>Profit Percent</th>
                                    <th>Overhead Machining(CC) (%)</th>
                                    <th>Profit Machining(CC) (%)</th>
                                    <th>Model type</th>
                                    <th>Initiator</th>
                                    <th>Created On</th>
                                    {/* <th>Modifier</th>
                                    <th>Modified On</th> */}
                                </tr>
                            </thead>
                            <tbody >
                                {this.props.overheadProfitList && this.props.overheadProfitList.length > 0 &&
                                    this.props.overheadProfitList.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.SupplierCode}</td>
                                                <td>{item.SupplierName}</td>
                                                <td>{item.TechnologyName}</td>
                                                <td>{item.OverheadTypeName}</td>
                                                <td>{item.OverheadPercentage}</td>
                                                <td>{item.ProfitTypeName}</td>
                                                <td>{item.ProfitPercentage}</td>
                                                <td>{item.OverheadMachiningCCPercentage}</td>
                                                <td>{item.ProfitMachiningCCPercentage}</td>
                                                <td>{item.ModelTypeName}</td>
                                                <td>{item.CreatedBy}</td>
                                                <td>{moment(item.CreatedDate).format('L')}</td>
                                                {/* <td>{item.ModifiedBy}</td>
                                                <td>{item.ModifiedDate}</td> */}
                                                {/* <td>
                                                    <Button className="black-btn" onClick={() => this.editPartDetails(index, item.Id)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="black-btn" onClick={() => this.deletePart(index, item.Id)}><i className="far fa-trash-alt"></i></Button>
                                                </td> */}
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </Table>
                    </div>
                    {/* </Table> */}
                </Col>
                {isOpen && (
                    <AddOverheadProfit
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        editIndex={editIndex}
                        uomId={uomId}
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
function mapStateToProps({ overheadProfit }) {
    const { overheadProfitList, loading } = overheadProfit;
    return { overheadProfitList, loading }
}


export default connect(
    mapStateToProps, { getOverheadProfitAPI }
)(OverheadProfit);

