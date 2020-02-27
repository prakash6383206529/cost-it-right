import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Row, Col, Button, Table
} from 'reactstrap';
import AddOverheadProfit from './AddOverheadProfit';
import { getOverheadProfitAPI, deleteOverheadProfitAPI } from '../../../../actions/master/OverheadProfit';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import moment from 'moment';
import NoContentFound from '../../../common/NoContentFound';

class OverheadProfit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            OverheadProfitId: '',
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
        this.setState({
            isOpen: true,
            isEditFlag: false
        })
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
    * @method editItemDetails
    * @description Edit operation detail
    */
    editItemDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            OverheadProfitId: Id,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete Overhead & Profit
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.OVERHEAD_PROFIT_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Overhead & Profit
    */
    confirmDelete = (ID) => {
        this.props.deleteOverheadProfitAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_OVERHEAD_PROFIT_SUCCESS);
                this.props.getOverheadProfitAPI(res => { });
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
                        <h3>{`${CONSTANT.OVERHEAD_AND_PROFIT} ${CONSTANT.MASTER}`}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.OVERHEAD_AND_PROFIT}`}</Button>
                    </Col>
                </Row>

                <hr />
                <Row>
                    <Col>
                        <div>
                            <Table className="table table-striped" size={'sm'} bordered>
                                {this.props.overheadProfitList && this.props.overheadProfitList.length > 0 &&
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
                                            <th>Created On</th>
                                            <th>{''}</th>
                                        </tr>
                                    </thead>}
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
                                                    <td>{moment(item.CreatedDate).format('L')}</td>
                                                    <td>
                                                        <Button className="black-btn" onClick={() => this.editItemDetails(item.OverheadProfitId)}><i className="fas fa-pencil-alt"></i></Button>
                                                        <Button className="black-btn" onClick={() => this.deleteItem(item.OverheadProfitId)}><i className="far fa-trash-alt"></i></Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    {this.props.overheadProfitList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
                {isOpen && (
                    <AddOverheadProfit
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        isEditFlag={isEditFlag}
                        OverheadProfitId={this.state.OverheadProfitId}
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


export default connect(mapStateToProps,
    {
        getOverheadProfitAPI,
        deleteOverheadProfitAPI,
    })(OverheadProfit);

