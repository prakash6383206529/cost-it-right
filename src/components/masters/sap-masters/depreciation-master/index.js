import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import AddDepreciation from './AddDepreciation';
import { getDepreciationListDataAPI, deleteDepreciationAPI } from '../../../../actions/master/MHRMaster';
import { Loader } from '../../../common/Loader';
import { CONSTANT } from '../../../../helper/AllConastant';
import { convertISOToUtcDate, } from '../../../../helper';
import NoContentFound from '../../../common/NoContentFound';
import { MESSAGES } from '../../../../config/message';
import { toastr } from 'react-redux-toastr';

class DepreciationMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            DepreciationId: '',
        }
    }

    /**
     * @method componentDidMount
     * @description  called before rendering the component
     */
    componentDidMount() {
        this.props.getDepreciationListDataAPI(res => { });
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
            this.props.getDepreciationListDataAPI(res => { });
        });
    }

    /**
    * @method editItemDetails
    * @description Edit Depreciation detail
    */
    editItemDetails = (ID) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            DepreciationId: ID,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete Depreciation
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => console.log('CANCEL: clicked')
        };
        return toastr.confirm(`${MESSAGES.DEPRECIATION_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Depreciation
    */
    confirmDelete = (ID) => {
        this.props.deleteDepreciationAPI(ID, (res) => {
            if (res.data.Result == true) {
                toastr.success(MESSAGES.DEPRECIATION_DELETE_SUCCESS);
                this.setState({ isOpen: false })
                this.props.getDepreciationListDataAPI(res => { });
            }
        });
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen } = this.state;
        return (
            <Container className="top-margin">
                {/* {this.props.loading && <Loader />} */}
                <Row>
                    <Col>
                        <h3>{`${CONSTANT.DEPRECIATION} ${CONSTANT.MASTER} `}</h3>
                    </Col>
                    <Col>
                        <Button onClick={this.openModel}>{`${CONSTANT.ADD} ${CONSTANT.DEPRECIATION}`}</Button>
                    </Col>
                </Row>

                <hr />
                <Row>
                    <Col>
                        <div>
                            <Table className="table table-striped" size={'sm'} bordered>
                                {this.props.depreciationDataList && this.props.depreciationDataList.length > 0 &&
                                    <thead>
                                        <tr>
                                            <th>{`${CONSTANT.DEPRECIATION} ${CONSTANT.TYPE}`}</th>
                                            <th>{`${CONSTANT.SHIFT}`}</th>
                                            <th>{`${CONSTANT.DEPRECIATION} ${CONSTANT.RATE}`}</th>
                                            <th>{`${CONSTANT.DATE}`}</th>
                                            <th>{``}</th>
                                        </tr>
                                    </thead>}
                                <tbody >
                                    {this.props.depreciationDataList && this.props.depreciationDataList.length > 0 &&
                                        this.props.depreciationDataList.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td >{item.DepreciationType}</td>
                                                    <td>{item.Shift}</td>
                                                    <td>{item.DepreciationRate}</td>
                                                    <td>{convertISOToUtcDate(item.CreatedDate)}</td>
                                                    <td>
                                                        <Button className="black-btn" onClick={() => this.editItemDetails(item.DepreciationId)}><i className="fas fa-pencil-alt"></i></Button>
                                                        <Button className="black-btn" onClick={() => this.deleteItem(item.DepreciationId)}><i className="far fa-trash-alt"></i></Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    {this.props.depreciationDataList === undefined && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
                {isOpen && (
                    <AddDepreciation
                        isOpen={isOpen}
                        onCancel={this.onCancel}
                        DepreciationId={this.state.DepreciationId}
                        isEditFlag={this.state.isEditFlag}
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
    const { depreciationDataList, loading } = MHRReducer;
    return { depreciationDataList, loading }
}

export default connect(
    mapStateToProps, {
    getDepreciationListDataAPI,
    deleteDepreciationAPI,
}
)(DepreciationMaster);

