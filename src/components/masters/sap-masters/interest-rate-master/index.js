import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import SupplierInterestRate from './SupplierInterestRate';
import { getInterestRateAPI } from '../../../../actions/master/InterestRateMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import moment from 'moment';

class InterestRate extends Component {
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
        this.props.getInterestRateAPI(res => { });
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
            this.props.getInterestRateAPI(res => { });
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
                        <h3>{`${CONSTANT.ADD} ${CONSTANT.INTEREST_RATE}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.INTEREST_RATE}`}</Button>
                    </Col>
                </Row>

                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.ADD} ${CONSTANT.INTEREST_RATE} ${CONSTANT.DETAILS}`} </h5>
                    </Col>
                </Row>
                <Col>
                    <div>
                        <Table className="table table-striped" bordered>
                            <thead>
                                <tr>
                                    <th>Average for Year</th>
                                    <th>Supplier</th>
                                    <th>Number of Month</th>
                                    <th>Annual Rate of Intereat</th>
                                    <th>ICC</th>
                                    <th>Cost of Credit</th>
                                    <th>RMInventoryCostICCApplicability</th>
                                    <th>WIPInventoryCostICCApplicability</th>
                                    <th>PaymenttermCostICCApplicability</th>
                                    <th>RMInventoryPercentage</th>
                                    <th>WIPInventoryPercentage</th>
                                    <th>PaymenttermPercentage</th>
                                    <th>Initiator</th>
                                    <th>Created On</th>
                                    {/* <th>Modifier</th>
                                    <th>Modified On</th> */}
                                </tr>
                            </thead>
                            <tbody >
                                {this.props.interestRateList && this.props.interestRateList.length > 0 &&
                                    this.props.interestRateList.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                {/* <td >{item.SupplierCode}</td>
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
                                                <td>{moment(item.CreatedDate).format('L')}</td> */}
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
                    <SupplierInterestRate
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
function mapStateToProps({ interestRate }) {
    const { interestRateList, loading } = interestRate;
    return { interestRateList, loading }
}

export default connect(
    mapStateToProps, { getInterestRateAPI }
)(InterestRate);

