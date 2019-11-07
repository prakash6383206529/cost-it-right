import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import SupplierInterestRate from './SupplierInterestRate';
import { getInterestRateAPI, deleteInterestRateAPI } from '../../../../actions/master/InterestRateMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import moment from 'moment';
import NoContentFound from '../../../common/NoContentFound';

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
    editPartDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            interestRateId: Id,
        })
    }

    /**
    * @method deletePart
    * @description confirm delete part
    */
    deletePart = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.CONFIRM_DELETE} interest rate ?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete interest rate
    */
    confirmDelete = (Id) => {
        this.props.deleteInterestRateAPI(Id, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.DELETE_INTEREST_RATE_SUCCESS);
                this.props.getInterestRateAPI(res => { });
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
        const { isOpen, isEditFlag, interestRateId } = this.state;
        return (
            <Container className="top-margin">
                {/* {this.props.loading && <Loader />} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.INTEREST_RATE} ${CONSTANT.MASTER} `}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.INTEREST_RATE}`}</Button>
                    </Col>
                </Row>

                <hr />
                <Row>
                    <Col>
                        <h5>{`${CONSTANT.INTEREST_RATE} ${CONSTANT.DETAILS}`} </h5>
                    </Col>
                </Row>
                <Col>
                    <div>
                        <Table className="table table-striped" bordered>
                        { this.props.interestRateList && this.props.interestRateList.length > 0 &&
                            <thead>
                                <tr>
                                    <th>Supplier Name</th>
                                    <th>RM Inventory Costing HeadName</th>
                                    <th>WIP Inventory Costing HeadName</th>
                                    <th>Payment Term Costing HeadName</th>
                                    <th>Annual RateOfInterest Percent</th>
                                    <th>Repayment Period</th>
                                    <th>Average Year Percent</th>
                                    <th>ICC Percent</th>
                                    {/* <th>CostOfCredit Percent</th> */}
                                    <th>RM Inventory Percentage</th>
                                    <th>WIP Inventory Percent</th>
                                    <th>Payment Term Percent</th>
                                    <th>Created On</th>
                                </tr>
                            </thead>}
                            <tbody >
                                {this.props.interestRateList && this.props.interestRateList.length > 0 &&
                                    this.props.interestRateList.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td >{item.SupplierName}</td>
                                                <td>{item.RMInventoryCostingHeadName}</td>
                                                <td>{item.WIPInventoryCostingHeadName}</td>
                                                <td>{item.PaymentTermCostingHeadName}</td>
                                                <td>{item.AnnualRateOfInterestPercent}</td>
                                                <td>{item.RepaymentPeriod}</td>
                                                <td>{item.AverageForTheYearPercent}</td>
                                                <td>{item.ICCPercent}</td>
                                                {/* <td>{item.CostOfCreditPercent}</td> */}
                                                <td>{item.RMInventoryPercent}</td>
                                                <td>{item.WIPInventoryPercent}</td>
                                                <td>{item.PaymentTermPercent}</td>
                                                <td>{moment(item.CreatedDate).format('L')}</td>
                                                <td>
                                                    <Button className="btn btn-secondary" onClick={() => this.editPartDetails(item.SupplierInterestRateId)}><i className="fas fa-pencil-alt"></i></Button>
                                                    <Button className="btn btn-danger" onClick={() => this.deletePart(item.SupplierInterestRateId)}><i className="far fa-trash-alt"></i></Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                     {this.props.interestRateList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
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
                        interestRateId={interestRateId}
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
    mapStateToProps, { getInterestRateAPI, deleteInterestRateAPI }
)(InterestRate);

